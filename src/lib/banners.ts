import { versionFiles } from "@/data";
import { instant, type Server, type TimePoint } from "./time";

export type Status = "official" | "leaked";

export type Phase = {
  phase: number;
  bannerName: string;
  featured5: { name: string; isNew: boolean }[];
  featured4: string[];
  isRerun: boolean;
  start: TimePoint;
  end: TimePoint;
  status: Status;
  sourceUrl?: string;
  sourceCheckedAt?: string;
};

export type VersionRecord = {
  game: string;
  gameName: string;
  version: string;
  phases: Phase[];
  serverResetUTC?: string;
  lastUpdated: string;
};

/** A phase with the version it belongs to: the unit every page module works with. */
export type BannerPhase = Phase & { version: string };

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
  if (!record.phases?.length) errors.push(`${where}: no phases`);
  if (Number.isNaN(Date.parse(record.lastUpdated))) errors.push(`${where}: bad lastUpdated`);
  for (const p of record.phases ?? []) {
    const at = `${where} phase ${p.phase}`;
    if (p.status !== "official" && p.status !== "leaked") errors.push(`${at}: status must be official or leaked`);
    if (p.status === "leaked" && (!p.sourceUrl || !p.sourceCheckedAt))
      errors.push(`${at}: leaked needs sourceUrl and sourceCheckedAt`);
    if (!isTimePoint(p.start)) errors.push(`${at}: bad start`);
    if (!isTimePoint(p.end)) errors.push(`${at}: bad end`);
    if (!p.featured5?.length) errors.push(`${at}: no 5★`);
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

export function phasesOf(versions: VersionRecord[]): BannerPhase[] {
  return versions.flatMap((v) => v.phases.map((p) => ({ ...p, version: v.version })));
}

export function lastUpdated(versions: VersionRecord[]): string {
  return versions.map((v) => v.lastUpdated).sort().at(-1) ?? "";
}

export type Schedule = {
  /** The phase that is live now, or null between phases (for example in maintenance). */
  current: BannerPhase | null;
  /** The first phase that starts after now. */
  next: BannerPhase | null;
};

export function scheduleAt(phases: BannerPhase[], now: number, server: Server): Schedule {
  const current = phases.find((p) => instant(p.start, server) <= now && now < instant(p.end, server)) ?? null;
  const next = phases.find((p) => instant(p.start, server) > now) ?? null;
  return { current, next };
}

/** Versions that have not ended yet, oldest first: the timeline (§5 module 3). */
export function upcomingVersions(versions: VersionRecord[], now: number, server: Server, count = 3): VersionRecord[] {
  return versions.filter((v) => v.phases.some((p) => instant(p.end, server) > now)).slice(0, count);
}

/** Phases that have ended, newest first: the archive (§5 module 4). */
export function pastPhases(phases: BannerPhase[], now: number, server: Server): BannerPhase[] {
  return phases.filter((p) => instant(p.end, server) <= now).reverse();
}

export function confirmationLabel(status: Status): string {
  return status === "official" ? "Official" : "Leaked — unconfirmed";
}

export function featuredNames(phase: BannerPhase): string {
  return phase.featured5.map((c) => c.name).join(" & ");
}
