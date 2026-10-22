import { expect, test } from "@playwright/test";

// Calendar feeds (src/lib/calendar.ts), from a plain request to the Worker.
for (const game of ["hsr", "zzz", "genshin"]) {
  test(`/${game}/calendar/asia.ics is an iCalendar file with the game's banners`, async ({ request }) => {
    const res = await request.get(`/${game}/calendar/asia.ics`, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("text/calendar; charset=utf-8");
    const body = await res.text();
    expect(body.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(body).toContain("(Asia server)");
    expect(body).toContain("BEGIN:VEVENT");
  });
}

test("each server has its own feed with its own times", async ({ request }) => {
  const asia = await (await request.get("/zzz/calendar/asia.ics")).text();
  const america = await (await request.get("/zzz/calendar/america.ics")).text();
  // ZZZ 3.3 phase 2 opens at 12:00 server time.
  expect(asia).toContain("DTSTART:20261111T040000Z");
  expect(america).toContain("DTSTART:20261111T170000Z");
  expect((await request.get("/zzz/calendar/europe.ics")).status()).toBe(200);
});

test("an unknown server is 404", async ({ request }) => {
  expect((await request.get("/zzz/calendar/mars.ics")).status()).toBe(404);
});
