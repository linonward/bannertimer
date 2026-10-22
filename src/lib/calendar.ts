import { confirmationLabel, featuredNames, type VersionRecord, versionsOf } from "./banners";
import { type Game, getGame, SITE_NAME, SITE_URL } from "./games";
import { instant, isServer, SERVERS, type Server, utcOffsetLabel } from "./time";

// Calendar feeds (RFC 5545): one per game and server, because `serverLocal` times happen at a
// different moment on each server (docs/product.md §4). Calendar apps subscribe to the URL and
// pick up new banners after each hourly rebuild.

export function calendarPath(gameId: string, server: Server): string {
  return `/${gameId}/calendar/${server}.ics`;
}

export type CalendarLinks = { webcal: string; google: string; download: string };

/** Subscribe in Apple Calendar or Outlook (webcal), subscribe in Google Calendar, or download once. */
export function calendarLinks(gameId: string, server: Server): CalendarLinks {
  const webcal = `${SITE_URL.replace(/^https:/, "webcal:")}${calendarPath(gameId, server)}`;
  return {
    webcal,
    google: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`,
    download: calendarPath(gameId, server),
  };
}

/** "20261111T040000Z": a moment in iCalendar UTC form. */
function stamp(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
}

/** Escapes a TEXT value: backslash, comma, semicolon and line breaks. */
function text(value: string): string {
  return value.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
}

/** Splits a content line into 75-octet pieces, never inside a character (RFC 5545 §3.1). */
function fold(line: string): string {
  const encoder = new TextEncoder();
  const pieces: string[] = [];
  let piece = "";
  let size = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    // Continuation lines start with a space, which counts toward their 75 octets.
    if (size + bytes > (pieces.length ? 74 : 75)) {
      pieces.push(piece);
      piece = "";
      size = 0;
    }
    piece += char;
    size += bytes;
  }
  pieces.push(piece);
  return pieces.join("\r\n ");
}

type CalendarEvent = { uid: string; stamp: number; start: number; end: number; summary: string; description: string; url: string };

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function eventsOf(game: Game, version: VersionRecord, server: Server): CalendarEvent[] {
  const url = `${SITE_URL}/${game.id}/${version.version}/`;
  const updated = Date.parse(version.lastUpdated);
  const where = `Times for the ${SERVERS[server].label} server (${utcOffsetLabel(server)}).`;
  const events = version.phases.flatMap((phase) =>
    phase.banners.map((b) => ({
      uid: `${game.id}-${version.version}-${phase.phase}-${slug(b.bannerName)}-${server}@bannertimer.com`,
      stamp: updated,
      start: instant(b.start, server),
      end: instant(b.end, server),
      summary: `${game.shortName}: ${b.bannerName} (${featuredNames(b)})${phase.status === "leaked" ? ` [${confirmationLabel("leaked")}]` : ""}`,
      description: [
        `${game.shortName} ${version.version}, phase ${phase.phase}`,
        `5★: ${featuredNames(b)}`,
        ...(b.featured4.length ? [`4★: ${b.featured4.join(", ")}`] : []),
        confirmationLabel(phase.status),
        ...(phase.sourceUrl ? [`Source: ${phase.sourceUrl}`] : []),
        where,
      ].join("\n"),
      url,
    })),
  );
  if (version.estimate && !version.phases.length) {
    const start = instant(version.estimate.start, server);
    events.push({
      uid: `${game.id}-${version.version}-estimate-${server}@bannertimer.com`,
      stamp: updated,
      start,
      end: start + 3_600_000,
      summary: `${game.shortName} ${version.version} starts (Estimate — not announced)`,
      description: [version.estimate.basis, `Source: ${version.estimate.sourceUrl}`, where].join("\n"),
      url,
    });
  }
  return events;
}

/** The game's banners on one server, as an iCalendar file. */
export function calendarFeed(game: Game, versions: VersionRecord[], server: Server): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${SITE_NAME}//${game.shortName} banners//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${text(`${game.shortName} Banners (${SERVERS[server].label} server)`)}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    ...versions.flatMap((v) =>
      eventsOf(game, v, server).flatMap((e) => [
        "BEGIN:VEVENT",
        `UID:${e.uid}`,
        `DTSTAMP:${stamp(e.stamp)}`,
        `DTSTART:${stamp(e.start)}`,
        `DTEND:${stamp(e.end)}`,
        `SUMMARY:${text(e.summary)}`,
        `DESCRIPTION:${text(e.description)}`,
        `URL:${e.url}`,
        "END:VEVENT",
      ]),
    ),
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** The `[file]` values a game's calendar route builds: one per server. */
export function calendarStaticParams(): { file: string }[] {
  return (Object.keys(SERVERS) as Server[]).map((server) => ({ file: `${server}.ics` }));
}

/** The response for `/{game}/calendar/{file}`; 404 for a file that is not a server's feed. */
export function calendarResponse(gameId: string, file: string): Response {
  const server = file.replace(/\.ics$/, "");
  if (!file.endsWith(".ics") || !isServer(server)) return new Response("Not found", { status: 404 });
  return new Response(calendarFeed(getGame(gameId), versionsOf(gameId), server), {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
}
