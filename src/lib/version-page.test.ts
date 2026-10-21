import { describe, expect, it } from "vitest";
import type { Banner, VersionRecord } from "./banners";
import { countdownTarget, formatTimePoint, versionAnswer, versionH1, versionTitle } from "./version-page";

function banner(name: string, five: string, start: Banner["start"], end: Banner["end"]): Banner {
  return { bannerName: name, featured5: [{ name: five, isNew: true }], featured4: [], isRerun: false, start, end };
}

// Shaped like ZZZ 3.3: phase 1 opens after maintenance (one global moment), phase 2 at a server-local time.
const v33: VersionRecord = {
  game: "zzz",
  gameName: "Zenless Zone Zero",
  version: "3.3",
  lastUpdated: "2026-10-21T13:18:00Z",
  phases: [
    {
      phase: 1,
      status: "official",
      banners: [
        banner("Into the Flames of Life", "Phoenix", { utc: "2026-10-21T03:00:00Z" }, { serverLocal: "2026-11-11T11:59:00" }),
        banner("Graceful Gale", "Velina", { utc: "2026-10-21T03:00:00Z" }, { serverLocal: "2026-11-11T11:59:00" }),
      ],
    },
    {
      phase: 2,
      status: "official",
      banners: [
        banner("Answers in the Wind", "Severian", { serverLocal: "2026-11-11T12:00:00" }, { serverLocal: "2026-12-01T14:59:00" }),
      ],
    },
  ],
};

describe("version page copy", () => {
  it("builds the §8 title within 60 characters, and an H1 that differs from it", () => {
    expect(versionTitle("ZZZ", "3.3")).toBe("ZZZ 3.3 Banners — Characters, Countdown & Release Date");
    expect(versionTitle("Genshin", "6.10").length).toBeLessThanOrEqual(60);
    expect(versionH1("ZZZ", "3.3")).toBe("ZZZ 3.3 Banners");
  });

  it("states a global moment in UTC and a server-local moment as server time", () => {
    expect(formatTimePoint({ utc: "2026-10-21T03:00:00Z" })).toBe("Oct 21, 03:00 UTC");
    expect(formatTimePoint({ serverLocal: "2026-11-11T11:59:00" })).toBe("Nov 11, 11:59 server time");
  });

  it("answers when the version starts and what each phase runs, from the data only", () => {
    expect(versionAnswer("ZZZ", v33, Date.parse("2026-10-21T12:00:00Z"))).toBe(
      "ZZZ 3.3 started Oct 21, 03:00 UTC on every server. " +
        "Phase 1 runs Into the Flames of Life (Phoenix) and Graceful Gale (Velina) until Nov 11, 11:59 server time. " +
        "Phase 2 opens Nov 11, 12:00 server time with Answers in the Wind (Severian).",
    );
    expect(versionAnswer("ZZZ", v33, Date.parse("2026-10-01T00:00:00Z"))).toMatch(/^ZZZ 3\.3 starts Oct 21/);
  });

  it("adds the official version name when the version has one", () => {
    expect(versionAnswer("Genshin", { ...v33, version: "6.8", versionName: "Luna VIII" }, Date.parse("2026-10-21T12:00:00Z"))).toMatch(
      /^Genshin 6\.8 \(Luna VIII\) started Oct 21, 03:00 UTC on every server\./,
    );
  });

  it("names each end when banners in one phase end at different times", () => {
    const pearl: VersionRecord = {
      ...v33,
      phases: [
        {
          phase: 1,
          status: "official",
          banners: [
            banner("A", "X", { utc: "2026-10-21T03:00:00Z" }, { serverLocal: "2026-12-01T15:00:00" }),
            banner("B", "Y", { utc: "2026-10-21T03:00:00Z" }, { serverLocal: "2026-11-11T11:59:00" }),
          ],
        },
      ],
    };
    expect(versionAnswer("ZZZ", pearl, 0)).toContain(
      "Phase 1 runs A (X) until Dec 1, 15:00 server time and B (Y) until Nov 11, 11:59 server time.",
    );
  });
});

describe("countdownTarget", () => {
  it("counts down to the version start, then the next phase, then the version end", () => {
    expect(countdownTarget(v33, Date.parse("2026-10-01T00:00:00Z"), "america")).toEqual({
      label: "3.3 STARTS IN",
      at: Date.parse("2026-10-21T03:00:00Z"),
    });
    expect(countdownTarget(v33, Date.parse("2026-10-22T00:00:00Z"), "america")).toEqual({
      label: "PHASE 2 STARTS IN",
      at: Date.parse("2026-11-11T17:00:00Z"),
    });
    expect(countdownTarget(v33, Date.parse("2026-11-20T00:00:00Z"), "america")).toEqual({
      label: "3.3 ENDS IN",
      at: Date.parse("2026-12-01T19:59:00Z"),
    });
    expect(countdownTarget(v33, Date.parse("2026-12-10T00:00:00Z"), "america")).toBeNull();
  });
});
