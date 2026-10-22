import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { chooseServer } from "@/lib/live";
import { CalendarMenu } from "./calendar-menu";

describe("CalendarMenu", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("links the game's feed for the page language's default server", () => {
    render(<CalendarMenu gameId="hsr" />);
    expect(screen.getByText("Add to calendar")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Apple Calendar/ }).getAttribute("href")).toBe(
      "webcal://bannertimer.com/hsr/calendar/america.ics",
    );
    expect(screen.getByRole("link", { name: /Download/ }).getAttribute("download")).toBe("hsr-america.ics");
    expect(screen.getByText(/America server/)).toBeTruthy();
  });

  it("follows the server switch", () => {
    render(<CalendarMenu gameId="zzz" lang="vi" />);
    act(() => chooseServer("asia"));
    expect(screen.getByRole("link", { name: /Google Calendar/ }).getAttribute("href")).toContain("zzz%2Fcalendar%2Fasia.ics");
    expect(screen.getByText(/Máy chủ Châu Á/)).toBeTruthy();
  });
});
