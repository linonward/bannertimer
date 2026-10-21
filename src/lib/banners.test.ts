import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { versionFiles } from "@/data";
import { bannersOf, bannerTitles, pastBanners, phaseWindows, scheduleAt, upcomingVersions, validateVersion, versionsOf, type VersionRecord } from "./banners";

const dataDir = join(__dirname, "../data");

describe("banner data", () => {
  it("lists every version file in src/data/index.ts", () => {
    const files = readdirSync(dataDir, { recursive: true }).filter((f) => String(f).endsWith(".json"));
    expect(versionFiles).toHaveLength(files.length);
  });

  it("follows the rules of docs/product.md §4", () => {
    expect((versionFiles as VersionRecord[]).flatMap(validateVersion)).toEqual([]);
  });
});

function banner(name: string, start: string, end: string, extra: object = {}) {
  return {
    bannerName: name,
    featured5: [{ name: `Char ${name}`, isNew: true }],
    featured4: [],
    isRerun: false,
    start: { utc: start },
    end: { serverLocal: end },
    ...extra,
  };
}

function record(version: string, status = "official", extra: object = {}, phaseExtra: object = {}): VersionRecord {
  const month = version === "1.1" ? "01" : "02";
  return {
    game: "test",
    gameName: "Test",
    version,
    lastUpdated: "2026-10-21T00:00:00Z",
    phases: [
      {
        phase: 1,
        banners: [banner(`Banner ${version}`, `2026-${month}-01T03:00:00Z`, `2026-${month}-20T18:00:00`, extra)],
        status: status as "official",
        ...phaseExtra,
      },
    ],
  };
}

describe("validateVersion", () => {
  it("rejects a status other than official or leaked", () => {
    expect(validateVersion(record("1.1", "rumor"))).toEqual(["test 1.1 phase 1: status must be official or leaked"]);
  });

  it("requires a source for leaked banners", () => {
    expect(validateVersion(record("1.1", "leaked"))).toEqual(["test 1.1 phase 1: leaked needs sourceUrl and sourceCheckedAt"]);
    expect(
      validateVersion(record("1.1", "leaked", {}, { sourceUrl: "https://x", sourceCheckedAt: "2026-10-20" })),
    ).toEqual([]);
  });

  it("rejects a time point that is neither utc nor serverLocal", () => {
    expect(validateVersion(record("1.1", "official", { start: { utc: "2026-01-01T03:00:00" } }))).toEqual([
      "test 1.1 phase 1 Banner 1.1: bad start",
    ]);
  });

  it("allows a version with no phases only when it carries a sourced estimate", () => {
    const estimate = {
      start: { utc: "2026-12-02T03:00:00Z" },
      basis: "Version 3.3 ends Dec 2, 06:00 (UTC+8).",
      sourceUrl: "https://x",
      sourceCheckedAt: "2026-10-21",
    };
    expect(validateVersion({ ...record("1.1"), phases: [] })).toEqual(["test 1.1: no phases"]);
    expect(validateVersion({ ...record("1.1"), phases: [], estimate })).toEqual([]);
    expect(validateVersion({ ...record("1.1"), phases: [], estimate: { ...estimate, sourceUrl: "" } })).toEqual([
      "test 1.1: estimate needs basis, sourceUrl and sourceCheckedAt",
    ]);
    expect(
      validateVersion({ ...record("1.1"), phases: [], estimate: { ...estimate, start: { utc: "2026-12-02" } } }),
    ).toEqual(["test 1.1: bad estimate start"]);
  });

  it("rejects an empty official version name", () => {
    expect(validateVersion({ ...record("1.1"), versionName: " " })).toEqual(["test 1.1: empty versionName"]);
    expect(validateVersion({ ...record("1.1"), versionName: "Luna VIII" })).toEqual([]);
  });

  it("requires at least one banner per phase and one 5★ per banner", () => {
    expect(validateVersion(record("1.1", "official", {}, { banners: [] }))).toEqual(["test 1.1 phase 1: no banners"]);
    expect(validateVersion(record("1.1", "official", { featured5: [] }))).toEqual(["test 1.1 phase 1 Banner 1.1: no 5★"]);
  });
});

describe("schedule", () => {
  it("sorts versions numerically", () => {
    expect(versionsOf("test", [record("1.10"), record("1.2")]).map((v) => v.version)).toEqual(["1.2", "1.10"]);
  });

  const banners = bannersOf(versionsOf("test", [record("1.1"), record("1.2")]));

  it("finds the live banners and the next ones", () => {
    const now = Date.parse("2026-01-10T00:00:00Z");
    const { current, next } = scheduleAt(banners, now, "america");
    expect(current.map((b) => b.version)).toEqual(["1.1"]);
    expect(next.map((b) => b.version)).toEqual(["1.2"]);
  });

  it("ends a serverLocal banner later on servers west of UTC", () => {
    // 1.1 ends 2026-01-20 18:00 server time: 10:00Z on Asia, 23:00Z on America.
    const now = Date.parse("2026-01-20T12:00:00Z");
    expect(scheduleAt(banners, now, "asia").current).toEqual([]);
    expect(scheduleAt(banners, now, "america").current.map((b) => b.version)).toEqual(["1.1"]);
  });

  it("runs several banners at once, each to its own end, soonest end first", () => {
    const version: VersionRecord = {
      ...record("1.1"),
      phases: [
        {
          phase: 1,
          status: "official",
          banners: [
            banner("Long", "2026-01-01T03:00:00Z", "2026-02-10T15:00:00"),
            banner("Short", "2026-01-01T03:00:00Z", "2026-01-20T11:59:00"),
          ],
        },
        {
          phase: 2,
          status: "official",
          banners: [banner("Second", "2026-01-20T12:00:00Z", "2026-02-10T15:00:00")],
        },
      ],
    };
    const all = bannersOf([version]);
    const early = scheduleAt(all, Date.parse("2026-01-10T00:00:00Z"), "asia");
    expect(early.current.map((b) => b.bannerName)).toEqual(["Short", "Long"]);
    expect(early.next.map((b) => b.bannerName)).toEqual(["Second"]);
    const late = scheduleAt(all, Date.parse("2026-01-25T00:00:00Z"), "asia");
    expect(late.current.map((b) => [b.bannerName, b.phase])).toEqual([
      ["Long", 1],
      ["Second", 2],
    ]);
    expect(late.next).toEqual([]);
  });

  it("splits banners into the timeline and the archive", () => {
    const versions = versionsOf("test", [record("1.1"), record("1.2")]);
    const now = Date.parse("2026-01-25T00:00:00Z");
    expect(upcomingVersions(versions, now, "america").map((v) => v.version)).toEqual(["1.2"]);
    expect(pastBanners(banners, now, "america").map((b) => b.version)).toEqual(["1.1"]);
  });
});

describe("bannerTitles", () => {
  it("names each banner with its 5★ characters", () => {
    const [a, b, c] = ["A", "B", "C"].map((n) => banner(n, "2026-01-01T03:00:00Z", "2026-01-20T18:00:00"));
    expect(bannerTitles([a])).toBe("A (Char A)");
    expect(bannerTitles([a, b])).toBe("A (Char A) and B (Char B)");
    expect(bannerTitles([a, b, c])).toBe("A (Char A), B (Char B) and C (Char C)");
  });
});

describe("phaseWindows", () => {
  it("runs each phase from its first start to the next phase's start, and the last to its last end", () => {
    const version: VersionRecord = {
      ...record("1.1"),
      phases: [
        {
          phase: 1,
          status: "official",
          banners: [
            banner("Long", "2026-01-01T03:00:00Z", "2026-02-10T15:00:00"),
            banner("Short", "2026-01-01T03:00:00Z", "2026-01-20T11:59:00"),
          ],
        },
        { phase: 2, status: "official", banners: [banner("Second", "2026-01-20T04:00:00Z", "2026-02-10T15:00:00")] },
      ],
    };
    expect(phaseWindows(version, "asia")).toEqual([
      { phase: 1, start: Date.parse("2026-01-01T03:00:00Z"), end: Date.parse("2026-01-20T04:00:00Z") },
      { phase: 2, start: Date.parse("2026-01-20T04:00:00Z"), end: Date.parse("2026-02-10T07:00:00Z") },
    ]);
  });
});
