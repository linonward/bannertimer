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

/** "20d 06h 12m 05s"; never negative. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);
  return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(total % 60)}s`;
}
