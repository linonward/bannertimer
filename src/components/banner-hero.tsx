"use client";

import { useEffect, useState } from "react";
import { confirmationLabel, featuredNames, scheduleAt, type BannerPhase } from "@/lib/banners";
import {
  DEFAULT_SERVER,
  formatCountdown,
  formatLocalTime,
  formatServerTime,
  instant,
  isServer,
  SERVERS,
  type Server,
} from "@/lib/time";
import { StatusBadge } from "./status-badge";

const SERVER_KEY = "bannertimer:server";

type Props = {
  shortName: string;
  phases: BannerPhase[];
  /** The version after the current one, for the answer paragraph. */
  nextVersionOf: Record<string, string | undefined>;
  /** Build time. The first render uses it so the server HTML and hydration match. */
  renderedAt: number;
};

/**
 * The first fold (docs/product.md §5 modules 1, 2 and 5): the answer paragraph, the current
 * banner and the next banner. The server HTML states end and start times as dates; after
 * hydration the same spans count down every second, and the phases switch if the build is stale.
 */
export function BannerHero({ shortName, phases, nextVersionOf, renderedAt }: Props) {
  const [now, setNow] = useState(renderedAt);
  const [live, setLive] = useState(false);
  const [server, setServer] = useState<Server>(DEFAULT_SERVER);

  useEffect(() => {
    const saved = localStorage.getItem(SERVER_KEY);
    // Restoring a saved choice and the clock after hydration; both differ from the build.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isServer(saved)) setServer(saved);
    setNow(Date.now());
    setLive(true);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  function chooseServer(value: Server) {
    setServer(value);
    localStorage.setItem(SERVER_KEY, value);
  }

  const { current, next } = scheduleAt(phases, now, server);
  const endsAt = current ? instant(current.end, server) : 0;
  const startsAt = next ? instant(next.start, server) : 0;
  const nextVersion = current ? nextVersionOf[current.version] : undefined;

  const until = (ms: number, word: string) =>
    live ? `${word} in ${formatCountdown(ms - now)}` : `${word} ${formatServerTime(ms, server)}`;

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-lg leading-relaxed" data-testid="answer">
        {current ? (
          <>
            The current {shortName} banner is <strong>{bannerTitle(current)}</strong> and{" "}
            <strong className="tabular-nums">{until(endsAt, live ? "ends" : "ends on")}</strong>.{" "}
          </>
        ) : (
          <>No {shortName} banner is live right now. </>
        )}
        {next ? (
          <>
            The next banner, <strong>{bannerTitle(next)}</strong>, starts{" "}
            <strong>{formatServerTime(startsAt, server)}</strong> — <strong>{confirmationLabel(next.status)}</strong>.{" "}
          </>
        ) : (
          <>The next banner has not been announced yet. </>
        )}
        {current && (
          <>
            Below is the full {shortName} banner schedule for every phase of patch <strong>{current.version}</strong>
            {nextVersion ? (
              <>
                , plus upcoming banners for <strong>{nextVersion}</strong>
              </>
            ) : null}
            .{" "}
          </>
        )}
        The banner countdown at the top of this page updates every second in your local time. Reruns, 4★ lineups and
        past phase dates are further down.
      </p>

      <fieldset className="flex flex-wrap items-center gap-2 text-sm">
        <legend className="sr-only">Server</legend>
        <span className="text-muted">Server:</span>
        {(Object.keys(SERVERS) as Server[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={server === key}
            onClick={() => chooseServer(key)}
            className="rounded-full border border-line px-3 py-1 aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-white"
          >
            {SERVERS[key].label}
          </button>
        ))}
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="current-banner">
          <h2 id="current-banner" className="text-sm font-semibold uppercase tracking-wide text-muted">
            Current banner
          </h2>
          {current ? (
            <PhaseCard phase={current} label="Ends" at={endsAt} server={server} live={live}>
              <p className="mt-3 text-3xl font-bold tabular-nums" data-testid="countdown">
                {live ? formatCountdown(endsAt - now) : formatServerTime(endsAt, server)}
              </p>
            </PhaseCard>
          ) : (
            <p className="mt-2">No banner is live. The next one starts soon.</p>
          )}
        </section>

        <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="next-banner">
          <h2 id="next-banner" className="text-sm font-semibold uppercase tracking-wide text-muted">
            Next banner
          </h2>
          {next ? (
            <PhaseCard phase={next} label="Starts" at={startsAt} server={server} live={live}>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={next.status} />
                <p className="text-xl font-semibold tabular-nums">
                  {live ? `in ${formatCountdown(startsAt - now)}` : formatServerTime(startsAt, server)}
                </p>
              </div>
              {next.status === "leaked" && next.sourceUrl && (
                <p className="mt-2 text-xs text-muted">
                  Source:{" "}
                  <a href={next.sourceUrl} rel="nofollow noopener" className="underline">
                    {new URL(next.sourceUrl).hostname}
                  </a>{" "}
                  · checked {next.sourceCheckedAt}
                </p>
              )}
            </PhaseCard>
          ) : (
            <p className="mt-2">Not announced yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function bannerTitle(phase: BannerPhase): string {
  return `${phase.bannerName} (${featuredNames(phase)})`;
}

function PhaseCard({
  phase,
  label,
  at,
  server,
  live,
  children,
}: {
  phase: BannerPhase;
  label: string;
  at: number;
  server: Server;
  live: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mt-2 text-lg font-semibold">{phase.bannerName}</p>
      <ul className="mt-1 text-sm">
        {phase.featured5.map((c) => (
          <li key={c.name}>
            5★ {c.name}
            {c.isNew && <span className="ml-2 rounded bg-accent/15 px-1.5 text-xs font-semibold text-accent">New</span>}
          </li>
        ))}
      </ul>
      {children}
      <p className="mt-2 min-h-10 text-sm text-muted">
        {label} {formatServerTime(at, server)} server time
        <br />
        {live ? `${formatLocalTime(at)} your time` : " "}
      </p>
    </div>
  );
}
