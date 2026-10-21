// Copy and timing for the version pages (docs/product.md §8). Everything comes from the §4 data.
import { bannerTitles, type Banner, type VersionRecord } from "./banners";
import { instant, type Server, type TimePoint } from "./time";

/** §8 title. `shortName` is HSR, ZZZ or Genshin (§14 item 4), which keeps it within 60 characters. */
export function versionTitle(shortName: string, version: string): string {
  return `${shortName} ${version} Banners — Characters, Countdown & Release Date`;
}

/** The H1; it must differ from the title (§6). */
export function versionH1(shortName: string, version: string): string {
  return `${shortName} ${version} Banners`;
}

function monthDayTime(iso: string): string {
  const date = new Date(`${iso.replace(/Z$/, "")}Z`);
  const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return `${day}, ${time}`;
}

/** "Oct 21, 03:00 UTC" for one global moment, "Nov 11, 11:59 server time" for a server-local one. */
export function formatTimePoint(point: TimePoint): string {
  return "utc" in point ? `${monthDayTime(point.utc)} UTC` : `${monthDayTime(point.serverLocal)} server time`;
}

const sameTime = (a: TimePoint, b: TimePoint) => JSON.stringify(a) === JSON.stringify(b);

function runsUntil(banners: Banner[]): string {
  if (banners.every((b) => sameTime(b.end, banners[0].end))) {
    return `${bannerTitles(banners)} until ${formatTimePoint(banners[0].end)}`;
  }
  const parts = banners.map((b) => `${bannerTitles([b])} until ${formatTimePoint(b.end)}`);
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}

/**
 * The answer paragraph under the H1: when the version starts, then what each phase runs. The
 * tense follows `now` (the build time; pages rebuild hourly).
 */
export function versionAnswer(shortName: string, version: VersionRecord, now: number): string {
  const [first, ...rest] = version.phases;
  const start = first.banners[0].start;
  const started = instant(start, "asia") <= now;
  const where = "utc" in start ? " on every server" : "";
  return [
    `${shortName} ${version.version} ${started ? "started" : "starts"} ${formatTimePoint(start)}${where}.`,
    `Phase ${first.phase} runs ${runsUntil(first.banners)}.`,
    ...rest.map((p) => `Phase ${p.phase} opens ${formatTimePoint(p.banners[0].start)} with ${bannerTitles(p.banners)}.`),
  ].join(" ");
}

export type CountdownTarget = { label: string; at: number };

/** What the version page counts down to: the version start, the next phase, or the version end. */
export function countdownTarget(version: VersionRecord, now: number, server: Server): CountdownTarget | null {
  const starts = version.phases.map((p) => ({
    phase: p.phase,
    at: Math.min(...p.banners.map((b) => instant(b.start, server))),
  }));
  const end = Math.max(...version.phases.flatMap((p) => p.banners.map((b) => instant(b.end, server))));
  if (now < starts[0].at) return { label: `${version.version} STARTS IN`, at: starts[0].at };
  const next = starts.find((s) => s.at > now);
  if (next) return { label: `PHASE ${next.phase} STARTS IN`, at: next.at };
  if (now < end) return { label: `${version.version} ENDS IN`, at: end };
  return null;
}
