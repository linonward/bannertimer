// Banner times (docs/product.md §4): a phase starts or ends either at one global moment
// (`utc`) or at the same wall-clock time on every server (`serverLocal`).
export type TimePoint = { utc: string } | { serverLocal: string };

// Fixed offsets, no daylight saving time.
export const SERVERS = {
  america: { label: "America", offset: -5 },
  europe: { label: "Europe", offset: 1 },
  asia: { label: "Asia", offset: 8 },
} as const;

export type Server = keyof typeof SERVERS;

export const DEFAULT_SERVER: Server = "america";

export function isServer(value: unknown): value is Server {
  return typeof value === "string" && Object.hasOwn(SERVERS, value);
}

/** The moment a time point happens on a server, in milliseconds since the epoch. */
export function instant(point: TimePoint, server: Server): number {
  if ("utc" in point) return Date.parse(point.utc);
  return Date.parse(`${point.serverLocal}Z`) - SERVERS[server].offset * 3_600_000;
}

export function utcOffsetLabel(server: Server): string {
  const offset = SERVERS[server].offset;
  return `UTC${offset < 0 ? "-" : "+"}${Math.abs(offset)}`;
}

/** "Nov 11, 2026": the date on the server's clock. */
export function formatServerDate(ms: number, server: Server): string {
  const shifted = new Date(ms + SERVERS[server].offset * 3_600_000);
  return shifted.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** "Nov 11, 2026, 17:59 (UTC-5)": the time on the server's clock. */
export function formatServerTime(ms: number, server: Server): string {
  const shifted = new Date(ms + SERVERS[server].offset * 3_600_000);
  const date = formatServerDate(ms, server);
  const time = shifted.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return `${date}, ${time} (${utcOffsetLabel(server)})`;
}

/** "Nov 11, 2026, 17:59" in the reader's own time zone. */
export function formatLocalTime(ms: number, timeZone?: string): string {
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  });
}

/** "Nov 10": the date on the server's clock, without the year. */
export function formatServerDay(ms: number, server: Server): string {
  const shifted = new Date(ms + SERVERS[server].offset * 3_600_000);
  return shifted.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** "Nov 10, 15:00": the server's date and 24-hour time, without the year. */
export function formatServerShort(ms: number, server: Server): string {
  const shifted = new Date(ms + SERVERS[server].offset * 3_600_000);
  const time = shifted.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return `${formatServerDay(ms, server)}, ${time}`;
}

/** "Nov 10, 12:00" in the reader's own time zone. */
export function formatLocalShort(ms: number, timeZone?: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(ms);
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part("month")} ${part("day")}, ${part("hour")}:${part("minute")}`;
}

/** "Los Angeles · UTC-8": the reader's zone by city and offset at that moment. */
export function localZoneLabel(ms: number, timeZone?: string): string {
  const zone = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "shortOffset" })
    .formatToParts(ms)
    .find((p) => p.type === "timeZoneName")
    ?.value.replace("GMT", "UTC");
  const city = zone.split("/").at(-1)?.replaceAll("_", " ");
  return !offset || city === "UTC" || offset === "UTC" ? (city ?? "UTC") : `${city} · ${offset}`;
}

/** Days, hours, minutes and seconds left, two digits each; never negative. */
export function countdownParts(ms: number): [string, string, string, string] {
  const total = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    pad(Math.floor(total / 86_400)),
    pad(Math.floor((total % 86_400) / 3_600)),
    pad(Math.floor((total % 3_600) / 60)),
    pad(total % 60),
  ];
}

/** "20d 06h 12m 05s"; never negative. */
export function formatCountdown(ms: number): string {
  const [days, hours, minutes, seconds] = countdownParts(ms);
  return `${Number(days)}d ${hours}h ${minutes}m ${seconds}s`;
}
