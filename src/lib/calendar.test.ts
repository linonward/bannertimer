import { describe, expect, it } from "vitest";
import type { Banner, VersionRecord } from "./banners";
import { calendarFeed, calendarPath } from "./calendar";
import { getGame } from "./games";

function banner(name: string, five: string, start: Banner["start"], end: Banner["end"]): Banner {
  return { bannerName: name, featured5: [{ name: five, isNew: true }], featured4: ["Lucy", "Pulchra"], isRerun: false, start, end };
}

// Shaped like ZZZ 3.3 and 3.4: phase 1 opens at one global moment, phase 2 at a server-local
// time, and 3.4 is known by its estimate alone.
const versions: VersionRecord[] = [
  {
    game: "zzz",
    gameName: "Zenless Zone Zero",
    version: "3.3",
    lastUpdated: "2026-10-21T13:18:00Z",
    phases: [
      {
        phase: 1,
        status: "official",
        sourceUrl: "https://zenless.hoyoverse.com/en-us/news/166926",
        banners: [banner("Into the Flames of Life", "Phoenix", { utc: "2026-10-21T03:00:00Z" }, { serverLocal: "2026-11-11T11:59:00" })],
      },
      {
        phase: 2,
        status: "leaked",
        sourceUrl: "https://example.com/leak",
        sourceCheckedAt: "2026-10-21",
        banners: [banner("Answers in the Wind", "Severian", { serverLocal: "2026-11-11T12:00:00" }, { serverLocal: "2026-12-01T14:59:00" })],
      },
    ],
  },
  {
    game: "zzz",
    gameName: "Zenless Zone Zero",
    version: "3.4",
    lastUpdated: "2026-10-21T16:00:00Z",
    phases: [],
    estimate: {
      start: { utc: "2026-12-02T03:00:00Z" },
      basis: "Version 3.3 ends Dec 2, 06:00 (UTC+8), and version updates usually take about five hours.",
      sourceUrl: "https://zenless.hoyoverse.com/en-us/news/166963",
      sourceCheckedAt: "2026-10-21",
    },
  },
];

const zzz = getGame("zzz");

/** The feed's content lines, with folded lines joined again (RFC 5545 §3.1). */
function lines(feed: string): string[] {
  return feed.replace(/\r\n /g, "").split("\r\n");
}

function events(feed: string): string[][] {
  const all = lines(feed);
  const out: string[][] = [];
  all.forEach((line, i) => {
    if (line === "BEGIN:VEVENT") out.push(all.slice(i + 1, all.indexOf("END:VEVENT", i)));
  });
  return out;
}

const prop = (event: string[], name: string) => event.find((l) => l.startsWith(`${name}:`))?.slice(name.length + 1);

describe("calendarPath", () => {
  it("is one feed per game and server", () => {
    expect(calendarPath("hsr", "asia")).toBe("/hsr/calendar/asia.ics");
  });
});

describe("calendarFeed", () => {
  const feed = calendarFeed(zzz, versions, "asia");

  it("is one VCALENDAR with CRLF line ends, named for the game and server", () => {
    expect(feed.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(feed.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(feed.replaceAll("\r\n", "")).not.toContain("\n");
    expect(lines(feed)).toEqual(
      expect.arrayContaining(["VERSION:2.0", "X-WR-CALNAME:ZZZ Banners (Asia server)", "REFRESH-INTERVAL;VALUE=DURATION:PT6H"]),
    );
  });

  it("has one event per banner, from its start to its end on the server's clock", () => {
    const [phoenix, severian] = events(feed);
    expect(prop(phoenix, "SUMMARY")).toBe("ZZZ: Into the Flames of Life (Phoenix)");
    expect(prop(phoenix, "DTSTART")).toBe("20261021T030000Z");
    expect(prop(phoenix, "DTEND")).toBe("20261111T035900Z");
    expect(prop(severian, "DTSTART")).toBe("20261111T040000Z");

    const america = events(calendarFeed(zzz, versions, "america"))[1];
    expect(prop(america, "DTSTART")).toBe("20261111T170000Z");
  });

  it("gives each event a stable UID that differs by server", () => {
    const uids = events(feed).map((e) => prop(e, "UID"));
    expect(new Set(uids).size).toBe(uids.length);
    expect(uids[0]).toBe("zzz-3.3-1-into-the-flames-of-life-asia@bannertimer.com");
    expect(calendarFeed(zzz, versions, "asia")).toBe(feed);
  });

  it("marks a leaked banner in its title and links the version page", () => {
    const severian = events(feed)[1];
    expect(prop(severian, "SUMMARY")).toBe("ZZZ: Answers in the Wind (Severian) [Leaked — unconfirmed]");
    expect(prop(severian, "URL")).toBe("https://bannertimer.com/zzz/3.3/");
    expect(prop(severian, "DESCRIPTION")).toContain("4★: Lucy\\, Pulchra");
  });

  it("adds the estimated start of a version that has no banners yet", () => {
    const estimate = events(feed)[2];
    expect(prop(estimate, "SUMMARY")).toBe("ZZZ 3.4 starts (Estimate — not announced)");
    expect(prop(estimate, "DTSTART")).toBe("20261202T030000Z");
    expect(prop(estimate, "DESCRIPTION")).toContain("Version 3.3 ends Dec 2\\, 06:00 (UTC+8)");
  });

  it("folds lines longer than 75 octets", () => {
    for (const line of feed.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});
