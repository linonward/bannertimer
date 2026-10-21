import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { versionFiles } from "@/data";
import { pastPhases, phasesOf, scheduleAt, upcomingVersions, validateVersion, versionsOf, type VersionRecord } from "./banners";

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

function record(version: string, status = "official", extra: object = {}): VersionRecord {
  return {
    game: "test",
    gameName: "Test",
    version,
    lastUpdated: "2026-10-21T00:00:00Z",
    phases: [
      {
        phase: 1,
        bannerName: `Banner ${version}`,
        featured5: [{ name: `Char ${version}`, isNew: true }],
        featured4: [],
        isRerun: false,
        start: { utc: `2026-${version === "1.1" ? "01" : "02"}-01T03:00:00Z` },
        end: { serverLocal: `2026-${version === "1.1" ? "01" : "02"}-20T18:00:00` },
        status: status as "official",
        ...extra,
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
    expect(validateVersion(record("1.1", "leaked", { sourceUrl: "https://x", sourceCheckedAt: "2026-10-20" }))).toEqual([]);
  });

  it("rejects a time point that is neither utc nor serverLocal", () => {
    expect(validateVersion(record("1.1", "official", { start: { utc: "2026-01-01T03:00:00" } }))).toEqual([
      "test 1.1 phase 1: bad start",
    ]);
  });
});

describe("schedule", () => {
  it("sorts versions numerically", () => {
    expect(versionsOf("test", [record("1.10"), record("1.2")]).map((v) => v.version)).toEqual(["1.2", "1.10"]);
  });

  const phases = phasesOf(versionsOf("test", [record("1.1"), record("1.2")]));

  it("finds the live phase and the next one", () => {
    const now = Date.parse("2026-01-10T00:00:00Z");
    const { current, next } = scheduleAt(phases, now, "america");
    expect(current?.version).toBe("1.1");
    expect(next?.version).toBe("1.2");
  });

  it("ends a serverLocal phase later on servers west of UTC", () => {
    // 1.1 ends 2026-01-20 18:00 server time: 10:00Z on Asia, 23:00Z on America.
    const now = Date.parse("2026-01-20T12:00:00Z");
    expect(scheduleAt(phases, now, "asia").current).toBeNull();
    expect(scheduleAt(phases, now, "america").current?.version).toBe("1.1");
  });

  it("splits phases into the timeline and the archive", () => {
    const versions = versionsOf("test", [record("1.1"), record("1.2")]);
    const now = Date.parse("2026-01-25T00:00:00Z");
    expect(upcomingVersions(versions, now, "america").map((v) => v.version)).toEqual(["1.2"]);
    expect(pastPhases(phases, now, "america").map((p) => p.version)).toEqual(["1.1"]);
  });
});
