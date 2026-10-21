import { expect, test } from "@playwright/test";

// docs/product.md §5-§7, checked against the raw server HTML (no client JS).
const pages = [
  {
    path: "/hsr/",
    title: "HSR Banner Schedule &amp; Next Banner — Live Countdown",
    h1: "HSR Banner Schedule &amp; Countdown",
    current: "Sample Banner 47A",
    other: "/zzz/",
    otherData: "Sample Banner 33",
  },
  {
    path: "/zzz/",
    title: "ZZZ Banner Countdown &amp; Next Banner — Live Schedule",
    h1: "ZZZ Banner Countdown &amp; Schedule",
    current: "Sample Banner 33B",
    other: "/hsr/",
    otherData: "Sample Banner 4",
  },
];

for (const p of pages) {
  test.describe(`${p.path} server HTML`, () => {
    let html: string;

    test.beforeAll(async ({ request }) => {
      const res = await request.get(p.path);
      expect(res.ok()).toBe(true);
      html = await res.text();
    });

    test("has the spec title, one canonical and no keywords meta", () => {
      expect(html).toContain(`<title>${p.title}</title>`);
      expect(html.match(/<link rel="canonical"[^>]*>/g)).toEqual([
        `<link rel="canonical" href="https://bannertimer.com${p.path}"/>`,
      ]);
      expect(html).not.toContain('name="keywords"');
    });

    test("has one h1, and the answer paragraph names the current banner in the source", () => {
      expect(html.match(/<h1[\s>][\s\S]*?<\/h1>/g)).toHaveLength(1);
      expect(html).toMatch(new RegExp(`<h1[^>]*>${p.h1}</h1>`));
      const answer = html.match(/<p[^>]*data-testid="answer"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? "";
      expect(answer).toContain(p.current);
      for (const phrase of ["next banner", "banner schedule", "upcoming banners", "banner countdown"]) {
        expect(answer.replace(/<[^>]+>/g, "")).toContain(phrase);
      }
    });

    test("marks official and leaked banners differently", () => {
      expect(html).toContain('data-status="official"');
      expect(html).toContain('data-status="leaked"');
      expect(html).toContain("Leaked — unconfirmed");
    });

    test("has FAQPage and BreadcrumbList data and no Event", () => {
      expect(html).toContain('"@type":"FAQPage"');
      expect(html).toContain('"@type":"BreadcrumbList"');
      expect(html).not.toMatch(/"@type":"(Event|SpecialAnnouncement)"/);
    });

    test("links to the other game but shows none of its banners", () => {
      expect(html).toMatch(new RegExp(`<a [^>]*href="${p.other}"`));
      expect(html).not.toContain(p.otherData);
    });

    test("has a banner history table", () => {
      expect(html).toMatch(/<h2[^>]*id="archive"/);
      expect(html).toMatch(/<table[\s\S]*Sample 5★/);
    });
  });
}

test("the answer names every live banner and counts down to the first end", async ({ request }) => {
  // HSR 4.7 phase 1 runs two banners: 47R ends with the phase, 47A runs on to the version end.
  const html = await (await request.get("/hsr/")).text();
  const answer = html.match(/<p[^>]*data-testid="answer"[^>]*>([\s\S]*?)<\/p>/)?.[1].replace(/<[^>]+>/g, "") ?? "";
  expect(answer).toContain("The current HSR banners are Sample Banner 47R (Sample 5★ 45B) and Sample Banner 47A");
  expect(answer).toContain("the first ends on Nov 11, 2026, 17:59 (UTC-5)");
});

test("the countdown runs and the banner switches when the build is stale", async ({ page }) => {
  // 2026-11-12 00:00Z: HSR 4.7 phase 1 ended at 17:59 America time (22:59Z), phase 2 is live.
  await page.clock.setFixedTime(new Date("2026-11-12T00:00:00Z"));
  await page.goto("/hsr/");
  await expect(page.getByTestId("answer")).toContainText("Sample Banner 47B");
  await expect(page.getByTestId("countdown")).toHaveText(/^\d+d \d\dh \d\dm \d\ds$/);
});

test("the server choice changes the end time and is remembered", async ({ page }) => {
  await page.goto("/hsr/");
  await page.getByRole("button", { name: "Asia" }).click();
  await expect(page.getByText(/Ends .*\(UTC\+8\) server time/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Asia" })).toHaveAttribute("aria-pressed", "true");
});

test("the archive filters by character name", async ({ page }) => {
  await page.goto("/hsr/");
  const rows = page.locator("section:has(#archive) tbody tr");
  await page.getByLabel("Filter by character").fill("46A");
  await expect(rows).toHaveCount(1);
});

test("robots.txt lists every sitemap and blocks nothing", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).not.toMatch(/Disallow: \S/);
  for (const path of ["/sitemap.xml", "/hsr/sitemap.xml", "/zzz/sitemap.xml"]) {
    expect(robots).toContain(`https://bannertimer.com${path}`);
    expect((await request.get(path)).ok()).toBe(true);
  }
});
