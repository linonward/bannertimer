import { versionFiles } from "@/data";
import { instant, type Server, type TimePoint } from "./time";

export type Status = "official" | "leaked";

/** One character banner. Several run at once, and one can run past its phase (§4). */
export type Banner = {
  bannerName: string;
  featured5: { name: string; isNew: boolean }[];
  /** Empty when the game lets players pick the 4★ characters. */
  featured4: string[];
  isRerun: boolean;
  start: TimePoint;
  end: TimePoint;
};

export type Phase = {
  phase: number;
  banners: Banner[];
  status: Status;
  sourceUrl?: string;
  sourceCheckedAt?: string;
};

export type VersionRecord = {
  game: string;
  gameName: string;
  version: string;
  /** The official name when HoYoverse names a version instead of numbering it ("Luna VIII" is 6.8). */
  versionName?: string;
  /** Empty only while the version is known by its `estimate` alone (§4). */
  phases: Phase[];
  /** An estimated start before any banner is announced; always shown as an estimate. */
  estimate?: Estimate;
  serverResetUTC?: string;
  lastUpdated: string;
};

export type Estimate = { start: TimePoint; basis: string; sourceUrl: string; sourceCheckedAt: string };

/** A banner with its version and phase: the unit every page module works with. */
export type BannerEntry = Banner & Omit<Phase, "banners"> & { version: string };

function isTimePoint(value: unknown): value is TimePoint {
  if (typeof value !== "object" || value === null) return false;
  const keys = Object.keys(value);
  if (keys.length !== 1) return false;
  const text = (value as Record<string, unknown>)[keys[0]];
  if (keys[0] === "utc") return typeof text === "string" && /Z$/.test(text) && !Number.isNaN(Date.parse(text));
  if (keys[0] === "serverLocal")
    return typeof text === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d)?$/.test(text);
  return false;
}

/** The rules of docs/product.md §4. Returns one message per broken rule. */
export function validateVersion(record: VersionRecord): string[] {
  const where = `${record.game} ${record.version}`;
  const errors: string[] = [];
  if (!record.phases?.length && !record.estimate) errors.push(`${where}: no phases`);
  if (record.estimate) {
    const e = record.estimate;
    if (!e.basis?.trim() || !e.sourceUrl || !e.sourceCheckedAt)
      errors.push(`${where}: estimate needs basis, sourceUrl and sourceCheckedAt`);
    if (!isTimePoint(e.start)) errors.push(`${where}: bad estimate start`);
  }
  if (Number.isNaN(Date.parse(record.lastUpdated))) errors.push(`${where}: bad lastUpdated`);
  if (record.versionName !== undefined && !record.versionName.trim()) errors.push(`${where}: empty versionName`);
  for (const p of record.phases ?? []) {
    const at = `${where} phase ${p.phase}`;
    if (p.status !== "official" && p.status !== "leaked") errors.push(`${at}: status must be official or leaked`);
    if (p.status === "leaked" && (!p.sourceUrl || !p.sourceCheckedAt))
      errors.push(`${at}: leaked needs sourceUrl and sourceCheckedAt`);
    if (!p.banners?.length) errors.push(`${at}: no banners`);
    for (const b of p.banners ?? []) {
      const of = `${at} ${b.bannerName}`;
      if (!isTimePoint(b.start)) errors.push(`${of}: bad start`);
      if (!isTimePoint(b.end)) errors.push(`${of}: bad end`);
      if (!b.featured5?.length) errors.push(`${of}: no 5★`);
    }
  }
  return errors;
}

function compareVersions(a: string, b: string): number {
  const [aMajor, aMinor] = a.split(".").map(Number);
  const [bMajor, bMinor] = b.split(".").map(Number);
  return aMajor - bMajor || aMinor - bMinor;
}

/** All versions of a game, oldest first. */
export function versionsOf(game: string, files: unknown[] = versionFiles): VersionRecord[] {
  return (files as VersionRecord[])
    .filter((v) => v.game === game)
    .sort((a, b) => compareVersions(a.version, b.version));
}

export function bannersOf(versions: VersionRecord[]): BannerEntry[] {
  return versions.flatMap((v) =>
    v.phases.flatMap(({ banners, ...phase }) => banners.map((b) => ({ ...b, ...phase, version: v.version }))),
  );
}

export function lastUpdated(versions: VersionRecord[]): string {
  return versions.map((v) => v.lastUpdated).sort().at(-1) ?? "";
}

export type Schedule = {
  /** The banners live now, soonest end first. Empty between phases (for example in maintenance). */
  current: BannerEntry[];
  /** The banners that open next, all at the same moment. */
  next: BannerEntry[];
};

export function scheduleAt(banners: BannerEntry[], now: number, server: Server): Schedule {
  const start = (b: BannerEntry) => instant(b.start, server);
  const end = (b: BannerEntry) => instant(b.end, server);
  const current = banners.filter((b) => start(b) <= now && now < end(b)).sort((a, b) => end(a) - end(b));
  const nextStart = Math.min(...banners.map(start).filter((t) => t > now));
  return { current, next: banners.filter((b) => start(b) === nextStart) };
}

/** Versions that have not ended yet, oldest first: the timeline (§5 module 3). */
export function upcomingVersions(versions: VersionRecord[], now: number, server: Server, count = 3): VersionRecord[] {
  return versions
    .filter((v) => v.phases.some((p) => p.banners.some((b) => instant(b.end, server) > now)))
    .slice(0, count);
}

/** Banners that have ended, newest first: the archive (§5 module 4). */
export function pastBanners(banners: BannerEntry[], now: number, server: Server): BannerEntry[] {
  return banners
    .filter((b) => instant(b.end, server) <= now)
    .sort((a, b) => instant(b.end, server) - instant(a.end, server) || b.phase - a.phase);
}

export function confirmationLabel(status: Status): string {
  return status === "official" ? "Official" : "Leaked — unconfirmed";
}

export function featuredNames(banner: Banner): string {
  return banner.featured5.map((c) => c.name).join(" & ");
}

/** "A (X) and B (Y)": the banners with their 5★ characters, for sentences; `and` in the page language. */
export function bannerTitles(banners: Banner[], and = "and"): string {
  const titles = banners.map((b) => `${b.bannerName} (${featuredNames(b)})`);
  return titles.length > 1 ? `${titles.slice(0, -1).join(", ")} ${and} ${titles.at(-1)}` : (titles[0] ?? "");
}

export type PhaseWindow = { phase: number; start: number; end: number };

/** When each phase runs on a server: from its first banner's start to the next phase's start; the last phase to its last end. */
export function phaseWindows(version: VersionRecord, server: Server): PhaseWindow[] {
  const starts = version.phases.map((p) => Math.min(...p.banners.map((b) => instant(b.start, server))));
  return version.phases.map((p, i) => ({
    phase: p.phase,
    start: starts[i],
    end: starts[i + 1] ?? Math.max(...p.banners.map((b) => instant(b.end, server))),
  }));
}
