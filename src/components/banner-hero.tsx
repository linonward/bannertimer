"use client";

import { useEffect, useState } from "react";
import { bannerTitles, confirmationLabel, scheduleAt, type BannerEntry } from "@/lib/banners";
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
  banners: BannerEntry[];
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
export function BannerHero({ shortName, banners, nextVersionOf, renderedAt }: Props) {
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

  const { current, next } = scheduleAt(banners, now, server);
  // The first live banner to end is the next change of lineup.
  const endsAt = current.length ? instant(current[0].end, server) : 0;
  const startsAt = next.length ? instant(next[0].start, server) : 0;
  const nextVersion = current.length ? nextVersionOf[current[0].version] : undefined;

  const until = (ms: number, word: string) =>
    live ? `${word} in ${formatCountdown(ms - now)}` : `${word} ${formatServerTime(ms, server)}`;

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-lg leading-relaxed" data-testid="answer">
        {current.length ? (
          <>
            The current {shortName} {current.length > 1 ? "banners are" : "banner is"}{" "}
            <strong>{bannerTitles(current)}</strong>
            {current.length > 1 ? "; the first " : " and "}
            <strong className="tabular-nums">{until(endsAt, live ? "ends" : "ends on")}</strong>.{" "}
          </>
        ) : (
          <>No {shortName} banner is live right now. </>
        )}
        {next.length ? (
          <>
            The next banner{next.length > 1 ? "s" : ""}, <strong>{bannerTitles(next)}</strong>,{" "}
            {next.length > 1 ? "start" : "starts"} <strong>{formatServerTime(startsAt, server)}</strong> —{" "}
            <strong>{confirmationLabel(next[0].status)}</strong>.{" "}
          </>
        ) : (
          <>The next banner has not been announced yet. </>
        )}
        {current.length > 0 && (
          <>
            Below is the full {shortName} banner schedule for every phase of patch{" "}
            <strong>{current[0].version}</strong>
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
          {current.length ? (
            <BannersCard banners={current} label="Ends" at={endsAt} server={server} live={live}>
              <p className="mt-3 text-3xl font-bold tabular-nums" data-testid="countdown">
                {live ? formatCountdown(endsAt - now) : formatServerTime(endsAt, server)}
              </p>
            </BannersCard>
          ) : (
            <p className="mt-2">No banner is live. The next one starts soon.</p>
          )}
        </section>

        <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="next-banner">
          <h2 id="next-banner" className="text-sm font-semibold uppercase tracking-wide text-muted">
            Next banner
          </h2>
          {next.length ? (
            <BannersCard banners={next} label="Starts" at={startsAt} server={server} live={live}>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={next[0].status} />
                <p className="text-xl font-semibold tabular-nums">
                  {live ? `in ${formatCountdown(startsAt - now)}` : formatServerTime(startsAt, server)}
                </p>
              </div>
              {next[0].status === "leaked" && next[0].sourceUrl && (
                <p className="mt-2 text-xs text-muted">
                  Source:{" "}
                  <a href={next[0].sourceUrl} rel="nofollow noopener" className="underline">
                    {new URL(next[0].sourceUrl).hostname}
                  </a>{" "}
                  · checked {next[0].sourceCheckedAt}
                </p>
              )}
            </BannersCard>
          ) : (
            <p className="mt-2">Not announced yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

/** Banners that start or end together; a banner that runs on past `at` shows its own end. */
function BannersCard({
  banners,
  label,
  at,
  server,
  live,
  children,
}: {
  banners: BannerEntry[];
  label: string;
  at: number;
  server: Server;
  live: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <ul className="mt-2 space-y-2">
        {banners.map((b) => (
          <li key={b.bannerName}>
            <p className="text-lg font-semibold">{b.bannerName}</p>
            <ul className="text-sm">
              {b.featured5.map((c) => (
                <li key={c.name}>
                  5★ {c.name}
                  {c.isNew && (
                    <span className="ml-2 rounded bg-accent/15 px-1.5 text-xs font-semibold text-accent">New</span>
                  )}
                </li>
              ))}
            </ul>
            {label === "Ends" && instant(b.end, server) !== at && (
              <p className="text-sm text-muted">Runs until {formatServerTime(instant(b.end, server), server)}</p>
            )}
          </li>
        ))}
      </ul>
      {children}
      <p className="mt-2 min-h-10 text-sm text-muted">
        {label} {formatServerTime(at, server)} server time
        <br />
        {live ? `${formatLocalTime(at)} your time` : " "}
      </p>
    </div>
  );
}
