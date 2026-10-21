import { describe, expect, it } from "vitest";
import {
  countdownParts,
  formatCountdown,
  formatLocalShort,
  formatServerDay,
  formatServerShort,
  formatServerTime,
  instant,
  isServer,
  localZoneLabel,
  utcOffsetLabel,
} from "./time";

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

describe("short formats for the board", () => {
  // 2026-11-10 15:00 on the America server (UTC-5) is 20:00Z.
  const ms = Date.parse("2026-11-10T20:00:00Z");

  it("shows the server's date and 24-hour time without the year", () => {
    expect(formatServerShort(ms, "america")).toBe("Nov 10, 15:00");
    expect(formatServerShort(ms, "asia")).toBe("Nov 11, 04:00");
    expect(formatServerDay(ms, "america")).toBe("Nov 10");
  });

  it("shows the reader's own time and names their zone by city and offset", () => {
    expect(formatLocalShort(ms, "America/Los_Angeles")).toBe("Nov 10, 12:00");
    expect(localZoneLabel(ms, "America/Los_Angeles")).toBe("Los Angeles · UTC-8");
    expect(localZoneLabel(ms, "Asia/Kolkata")).toBe("Kolkata · UTC+5:30");
    expect(localZoneLabel(ms, "UTC")).toBe("UTC");
  });

  it("splits a countdown into two-digit units for the flap tiles", () => {
    expect(countdownParts(((20 * 24 + 6) * 3600 + 12 * 60 + 5) * 1000)).toEqual(["20", "06", "12", "05"]);
    expect(countdownParts(-5000)).toEqual(["00", "00", "00", "00"]);
  });
});
