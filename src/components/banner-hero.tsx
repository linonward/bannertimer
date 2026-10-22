"use client";

import {
  bannerTitles,
  phaseWindows,
  scheduleAt,
  type BannerEntry,
  type VersionRecord,
} from "@/lib/banners";
import { defaultServer, intlLocale, type Lang } from "@/lib/i18n";
import { useNow, useServer } from "@/lib/live";
import { messages } from "@/lib/messages";
import {
  formatLocalShort,
  formatServerShort,
  formatServerTime,
  instant,
  localZoneLabel,
  utcOffsetLabel,
} from "@/lib/time";
import { fiveNames, LiveBannerRow } from "./banner-line";
import { CalendarMenu } from "./calendar-menu";
import { FlapCountdown } from "./flap-countdown";
import { HourglassIcon } from "./icons";
import { StatusBadge } from "./status-badge";

type Props = {
  gameId: string;
  shortName: string;
  versions: VersionRecord[];
  banners: BannerEntry[];
  /** The version after the current one, for the answer paragraph. */
  nextVersionOf: Record<string, string | undefined>;
  /** Build time. The first render uses it so the server HTML and hydration match. */
  renderedAt: number;
  /** The H1 and the "last updated" line; the answer paragraph follows them. */
  intro: React.ReactNode;
  lang?: Lang;
};

const DAY = 86_400_000;

/**
 * The first fold (docs/product.md §5 modules 1, 2 and 5): the answer paragraph and the board
 * with the live banners and the next ones. The server HTML states end and start times as dates;
 * after hydration the countdown runs every second, and the banners switch if the build is stale.
 */
export function BannerHero({ gameId, shortName, versions, banners, nextVersionOf, renderedAt, intro, lang = "en" }: Props) {
  const t = messages(lang);
  const locale = intlLocale(lang);
  const { now, live } = useNow(renderedAt);
  const server = useServer(defaultServer(lang));

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
  const day = window ? t.dayOf(Math.floor((now - window.start) / DAY) + 1, Math.ceil((window.end - window.start) / DAY)) : "";

  const serverTime = (ms: number) => formatServerTime(ms, server, locale);
  const serverShort = (ms: number) => formatServerShort(ms, server, locale);
  const status = (b: BannerEntry) => (b.status === "official" ? t.official : t.leaked);

  return (
    <div className="relative flex flex-col gap-[18px] md:flex-row md:gap-12">
      <div className="flex flex-col gap-3 md:w-[440px] md:shrink-0 md:gap-5 md:pt-2">
      {intro}
      <p className="text-[15px] leading-6 text-ink-2 md:text-base md:leading-[26px] [&_strong]:font-normal" data-testid="answer">
        {t.answer({
          shortName,
          current: current.length
            ? { titles: bannerTitles(current, t.and), count: current.length, version: current[0].version }
            : null,
          ends: { live, text: live ? t.countdown(endsAt - now) : serverTime(endsAt) },
          next: next.length
            ? { titles: bannerTitles(next, t.and), count: next.length, start: serverTime(startsAt), status: status(next[0]) }
            : null,
          nextVersion,
        })}
      </p>
      <CalendarMenu gameId={gameId} lang={lang} />
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
                // One shared "LIVE NOW", then the desktop or the mobile ending, so the source reads as one line.
                <span>
                  {t.liveNow}
                  <span className="max-md:hidden">{t.bannerCount(current.length)}</span>
                  {latest && <span className="md:hidden">{t.phaseShort(latest.version, latest.phase)}</span>}
                </span>
              ) : (
                t.noBannerLive
              )}
            </h2>
            {latest && (
              <p className="font-mono text-xs tracking-[1px] text-ink-3 max-md:hidden">
                {t.phaseLine(latest.version, latest.phase)}
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
                    end={serverShort(instant(b.end, server))}
                    lang={lang}
                  />
                ))}
              </ul>
              <div className="flex flex-col gap-2.5 md:gap-3">
                <p className="font-mono text-[10px] font-semibold tracking-[2px] text-game md:text-[11px]">
                  {current.length > 1 ? t.firstEndsIn : t.endsIn}
                </p>
                <FlapCountdown ms={live ? endsAt - now : null} size="L" lang={lang} />
                <p className="sr-only" data-testid="countdown">
                  {live ? t.countdown(endsAt - now) : serverTime(endsAt)}
                </p>
              </div>
              <dl className="flex flex-col gap-2 border-t border-line pt-3.5 md:flex-row md:gap-10 md:border-transparent md:pt-[18px]">
                <div className="flex items-center justify-between md:flex-col md:items-start md:gap-1">
                  <dt className="font-mono text-[11px] tracking-[1.5px] text-ink-3 max-md:font-sans max-md:text-[13px] max-md:tracking-normal">
                    <span className="max-md:hidden">{t.endsServerTime}</span>
                    <span className="md:hidden">
                      {t.server} · {utcOffsetLabel(server)}
                    </span>
                  </dt>
                  <dd className="font-mono text-sm font-medium md:text-lg" data-testid="ends-server">
                    {serverShort(endsAt)}
                  </dd>
                  <dd className="text-[13px] text-ink-3 max-md:hidden">
                    {t.servers[server]} · {utcOffsetLabel(server)}
                  </dd>
                </div>
                <div className="flex min-h-[46px] items-center justify-between md:flex-col md:items-start md:gap-1">
                  <dt className="font-mono text-[11px] tracking-[1.5px] text-ink-3 max-md:font-sans max-md:text-[13px] max-md:tracking-normal">
                    <span className="max-md:hidden">{t.endsYourTime}</span>
                    <span className="md:hidden">
                      {t.yourTime}
                      {live ? ` · ${localZoneLabel(endsAt).split(" · ").at(-1)}` : ""}
                    </span>
                  </dt>
                  <dd className="font-mono text-sm font-medium md:text-lg">{live ? formatLocalShort(endsAt, undefined, locale) : "—"}</dd>
                  <dd className="text-[13px] text-ink-3 max-md:hidden">{live ? localZoneLabel(endsAt) : " "}</dd>
                </div>
              </dl>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-line bg-panel-2 p-4 md:flex-row md:items-center md:gap-6 md:px-8 md:py-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h2 id="next-banner" className="font-mono text-[10px] tracking-[2px] text-ink-3 md:text-[11px]">
              {next.length ? t.nextHeading(next.length, next[0].version, next[0].phase) : t.nextBanner}
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
                <p className="font-display text-2xl font-extrabold text-ink-2 italic md:text-[26px]">{t.notAnnouncedCaps}</p>
                <p className="text-[13px] text-ink-2 md:font-mono">{t.nextLands}</p>
              </>
            )}
          </div>
          {next.length ? (
            <div className="flex flex-col gap-1.5 md:items-end">
              <StatusBadge status={next[0].status} lang={lang} />
              <p className="font-mono text-[13px] text-ink-2">
                {t.starts} {serverShort(startsAt)} {utcOffsetLabel(server)}
              </p>
              {next[0].sourceUrl && (
                <p className="font-mono text-[11px] text-ink-3">
                  {t.source}{" "}
                  <a href={next[0].sourceUrl} rel="nofollow noopener" className="underline">
                    {new URL(next[0].sourceUrl).hostname.replace(/^www\./, "")}
                  </a>
                  {next[0].sourceCheckedAt ? t.checked(next[0].sourceCheckedAt) : ""}
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
