import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { BannerEntry } from "@/lib/banners";
import { Sources } from "./sources";

function entry(sourceUrl: string): BannerEntry {
  return {
    bannerName: sourceUrl,
    featured5: [{ name: "X", isNew: true }],
    featured4: [],
    isRerun: false,
    start: { utc: "2026-10-01T00:00:00Z" },
    end: { utc: "2026-11-01T00:00:00Z" },
    phase: 1,
    status: "official",
    sourceUrl,
    sourceCheckedAt: "2026-10-21",
    version: "4.6",
  };
}

describe("Sources", () => {
  afterEach(cleanup);

  it("writes the checked date in the page language, as a <time>", () => {
    const { container } = render(<Sources banners={[entry("https://hoyolab.com/a")]} />);
    expect(container.textContent).toBe("Source: hoyolab.com · checked Oct 21, 2026");
    expect(container.querySelector("time")?.getAttribute("datetime")).toBe("2026-10-21");
  });

  it("numbers notices that share a host, so the links read apart", () => {
    const { container } = render(<Sources banners={[entry("https://hoyolab.com/a"), entry("https://hoyolab.com/b"), entry("https://hoyolab.com/a")]} />);
    expect([...container.querySelectorAll("a")].map((a) => a.textContent)).toEqual(["hoyolab.com (1)", "hoyolab.com (2)"]);
  });
});
