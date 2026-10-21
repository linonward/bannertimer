import { describe, expect, it } from "vitest";
import { formatCountdown, formatServerTime, instant, isServer, utcOffsetLabel } from "./time";

describe("instant", () => {
  it("treats a utc point as the same moment on every server", () => {
    const point = { utc: "2026-10-21T03:00:00Z" };
    expect(instant(point, "america")).toBe(instant(point, "asia"));
  });

  it("puts a serverLocal point at each server's own wall-clock time", () => {
    const point = { serverLocal: "2026-11-11T18:00:00" };
    expect(new Date(instant(point, "asia")).toISOString()).toBe("2026-11-11T10:00:00.000Z");
    expect(new Date(instant(point, "europe")).toISOString()).toBe("2026-11-11T17:00:00.000Z");
    expect(new Date(instant(point, "america")).toISOString()).toBe("2026-11-11T23:00:00.000Z");
  });
});

describe("formatting", () => {
  it("shows the time on the server's clock with its offset", () => {
    expect(formatServerTime(Date.parse("2026-11-11T23:00:00Z"), "america")).toBe("Nov 11, 2026, 18:00 (UTC-5)");
    expect(utcOffsetLabel("asia")).toBe("UTC+8");
  });

  it("formats a countdown with padded units and clamps at zero", () => {
    expect(formatCountdown(((20 * 24 + 6) * 3600 + 12 * 60 + 5) * 1000)).toBe("20d 06h 12m 05s");
    expect(formatCountdown(-5000)).toBe("0d 00h 00m 00s");
  });

  it("accepts only known servers", () => {
    expect(isServer("europe")).toBe(true);
    expect(isServer("toString")).toBe(false);
  });
});
