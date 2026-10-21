"use client";

import {
  bannerTitles,
  confirmationLabel,
  phaseWindows,
  scheduleAt,
  type BannerEntry,
  type VersionRecord,
} from "@/lib/banners";
import { useNow, useServer } from "@/lib/live";
import {
  formatCountdown,
  formatLocalShort,
  formatServerShort,
  formatServerTime,
  instant,
  localZoneLabel,
  SERVERS,
  utcOffsetLabel,
} from "@/lib/time";
import { fiveNames, LiveBannerRow } from "./banner-line";
import { FlapCountdown } from "./flap-countdown";
import { HourglassIcon } from "./icons";
import { StatusBadge } from "./status-badge";

type Props = {
  shortName: string;
  versions: VersionRecord[];
  banners: BannerEntry[];
  /** The version after the current one, for the answer paragraph. */
  nextVersionOf: Record<string, string | undefined>;
  /** Build time. The first render uses it so the server HTML and hydration match. */
  renderedAt: number;
  /** The H1 and the "last updated" line; the answer paragraph follows them. */
  intro: React.ReactNode;
};

const DAY = 86_400_000;

/**
 * The first fold (docs/product.md §5 modules 1, 2 and 5): the answer paragraph and the board
 * with the live banners and the next ones. The server HTML states end and start times as dates;
 * after hydration the countdown runs every second, and the banners switch if the build is stale.
 */
export function BannerHero({ shortName, versions, banners, nextVersionOf, renderedAt, intro }: Props) {
  const { now, live } = useNow(renderedAt);
  const server = useServer();

  const { current, next } = scheduleAt(banners, now, server);
  // The first live banner to end is the next change of lineup.
  const endsAt = current.length ? instant(current[0].end, server) : 0;
  const startsAt = next.length ? instant(next[0].start, server) : 0;
  const nextVersion = current.length ? nextVersionOf[current[0].version] : undefined;

  // The phase of the newest live banner, for "v4.6 · PHASE 2 · DAY 1 OF 21".
  const latest = current.reduce<BannerEntry | null>(
    (a, b) => (!a || instant(b.start, server) > instant(a.start, server) ? b : a),
    null,
  );
  const window = latest
    ? phaseWindows(versions.find((v) => v.version === latest.version)!, server).find((w) => w.phase === latest.phase)
    : undefined;
  const day = window ? `DAY ${Math.floor((now - window.start) / DAY) + 1} OF ${Math.ceil((window.end - window.start) / DAY)}` : "";

  const until = (ms: number, word: string) =>
    live ? `${word} in ${formatCountdown(ms - now)}` : `${word} ${formatServerTime(ms, server)}`;

  return (
    <div className="relative flex flex-col gap-[18px] md:flex-row md:gap-12">
      <div className="flex flex-col gap-3 md:w-[440px] md:shrink-0 md:gap-5 md:pt-2">
      {intro}
      <p className="text-[15px] leading-6 text-ink-2 md:text-base md:leading-[26px] [&_strong]:font-normal" data-testid="answer">
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
        {/* §5 module 5: keep "banner schedule" and "upcoming banners" even before the next patch is announced. */}
        Below is the full {shortName} banner schedule
        {current.length > 0 && (
          <>
            {" "}
            for every phase of patch <strong>{current[0].version}</strong>
          </>
        )}
        {nextVersion ? (
          <>
            , plus upcoming banners for <strong>{nextVersion}</strong>
          </>
        ) : (
          ", plus upcoming banners as soon as the next patch is announced"
        )}
        .{" "}
        The banner countdown at the top of this page updates every second in your local time. Reruns, 4★ lineups and
        past phase dates are further down.
      </p>
      </div>

      <section
        aria-labelledby="current-banner"
        className="flex min-w-0 flex-1 flex-col overflow-hidden rounded bg-panel shadow-[0_30px_80px_#000000cc] outline outline-game-line -outline-offset-1"
      >
        <span aria-hidden="true" className="h-1 bg-game" />
        <div className="flex flex-col gap-4 px-4 pt-[18px] pb-5 md:gap-[22px] md:px-8 md:pt-7 md:pb-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="current-banner"
              className="flex items-center gap-2 rounded-[2px] bg-game px-2 py-1 font-mono text-[11px] font-bold tracking-[1.5px] text-game-ink md:px-2.5 md:py-[5px] md:text-xs md:tracking-[2px]"
            >
              <span aria-hidden="true" className="size-[7px] rounded-full bg-game-ink md:size-2" />
              {current.length ? (
                <>
                  <span className="max-md:hidden">
                    LIVE NOW · {current.length} BANNER{current.length > 1 ? "S" : ""}
                  </span>
                  <span className="md:hidden">LIVE NOW{latest ? ` · v${latest.version} PHASE ${latest.phase}` : ""}</span>
                </>
              ) : (
                "NO BANNER LIVE"
              )}
            </h2>
            {latest && (
              <p className="font-mono text-xs tracking-[1px] text-ink-3 max-md:hidden">
                v{latest.version} · PHASE {latest.phase}
                {live && day ? ` · ${day}` : ""}
              </p>
            )}
          </div>

          {current.length > 0 && (
            <>
              <ul className="flex flex-col">
                {current.map((b) => (
                  <LiveBannerRow
                    key={`${b.version}-${b.bannerName}`}
                    banner={b}
                    end={formatServerShort(instant(b.end, server), server)}
                  />
                ))}
              </ul>
              <div className="flex flex-col gap-2.5 md:gap-3">
                <p className="font-mono text-[10px] font-semibold tracking-[2px] text-game md:text-[11px]">
                  {current.length > 1 ? "FIRST BANNER ENDS IN" : "BANNER ENDS IN"}
                </p>
                <FlapCountdown ms={live ? endsAt - now : null} size="L" />
                <p className="sr-only" data-testid="countdown">
                  {live ? formatCountdown(endsAt - now) : formatServerTime(endsAt, server)}
                </p>
              </div>
              <dl className="flex flex-col gap-2 border-t border-line pt-3.5 md:flex-row md:gap-10 md:border-transparent md:pt-[18px]">
                <div className="flex items-center justify-between md:flex-col md:items-start md:gap-1">
                  <dt className="font-mono text-[11px] tracking-[1.5px] text-ink-3 max-md:font-sans max-md:text-[13px] max-md:tracking-normal">
                    <span className="max-md:hidden">ENDS · SERVER TIME</span>
                    <span className="md:hidden">Server · {utcOffsetLabel(server)}</span>
                  </dt>
                  <dd className="font-mono text-sm font-medium md:text-lg" data-testid="ends-server">
                    {formatServerShort(endsAt, server)}
                  </dd>
                  <dd className="text-[13px] text-ink-3 max-md:hidden">
                    {SERVERS[server].label} · {utcOffsetLabel(server)}
                  </dd>
                </div>
                <div className="flex min-h-[46px] items-center justify-between md:flex-col md:items-start md:gap-1">
                  <dt className="font-mono text-[11px] tracking-[1.5px] text-ink-3 max-md:font-sans max-md:text-[13px] max-md:tracking-normal">
                    <span className="max-md:hidden">ENDS · YOUR TIME</span>
                    <span className="md:hidden">
                      Your time{live ? ` · ${localZoneLabel(endsAt).split(" · ").at(-1)}` : ""}
                    </span>
                  </dt>
                  <dd className="font-mono text-sm font-medium md:text-lg">{live ? formatLocalShort(endsAt) : "—"}</dd>
                  <dd className="text-[13px] text-ink-3 max-md:hidden">{live ? localZoneLabel(endsAt) : " "}</dd>
                </div>
              </dl>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-line bg-panel-2 p-4 md:flex-row md:items-center md:gap-6 md:px-8 md:py-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h2 id="next-banner" className="font-mono text-[10px] tracking-[2px] text-ink-3 md:text-[11px]">
              {next.length
                ? `NEXT BANNER${next.length > 1 ? "S" : ""} · v${next[0].version} PHASE ${next[0].phase}`
                : "NEXT BANNER"}
            </h2>
            {next.length ? (
              <>
                <p className="font-display text-2xl font-extrabold text-ink uppercase italic md:text-[26px]">
                  {next.map(fiveNames).join(" & ")}
                </p>
                <p className="text-sm text-ink-2">{next.map((b) => b.bannerName).join(" · ")}</p>
              </>
            ) : (
              <>
                <p className="font-display text-2xl font-extrabold text-ink-2 italic md:text-[26px]">NOT ANNOUNCED YET</p>
                <p className="text-[13px] text-ink-2 md:font-mono">
                  The next banners land here when HoYoverse posts the banner notice.
                </p>
              </>
            )}
          </div>
          {next.length ? (
            <div className="flex flex-col gap-1.5 md:items-end">
              <StatusBadge status={next[0].status} />
              <p className="font-mono text-[13px] text-ink-2">
                Starts {formatServerShort(startsAt, server)} {utcOffsetLabel(server)}
              </p>
              {next[0].sourceUrl && (
                <p className="font-mono text-[11px] text-ink-3">
                  Source:{" "}
                  <a href={next[0].sourceUrl} rel="nofollow noopener" className="underline">
                    {new URL(next[0].sourceUrl).hostname.replace(/^www\./, "")}
                  </a>
                  {next[0].sourceCheckedAt ? ` · checked ${next[0].sourceCheckedAt}` : ""}
                </p>
              )}
            </div>
          ) : (
            <HourglassIcon className="size-[22px] text-ink-3 max-md:hidden" />
          )}
        </div>
      </section>
    </div>
  );
}
