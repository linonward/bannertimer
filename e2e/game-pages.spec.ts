import { expect, test } from "@playwright/test";
import { BUILD_NOW } from "./server";

// docs/product.md §5-§7, checked against the raw server HTML (no client JS).
const pages = [
  {
    path: "/hsr/",
    title: "HSR Banner Schedule &amp; Next Banner — Live Countdown",
    h1: "HSR Banner Schedule &amp; Countdown",
    current: "An Ocean in a Pearl",
    other: "/zzz/",
    otherData: "Into the Flames of Life",
  },
  {
    path: "/zzz/",
    title: "ZZZ Banner Countdown &amp; Next Banner — Live Schedule",
    h1: "ZZZ Banner Countdown &amp; Schedule",
    current: "Into the Flames of Life",
    other: "/hsr/",
    otherData: "An Ocean in a Pearl",
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

    // The leaked style is checked in src/components/status-badge.test.tsx: the data may have no leak.
    test("marks the status of each banner", () => {
      expect(html).toContain('data-status="official"');
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
      expect(html).toMatch(/<table[\s\S]*<tbody>[\s\S]*<td/);
    });
  });
}

test("the answer names every live banner and counts down to the first end", async ({ request }) => {
  // HSR 4.6 phase 1 runs two banners: Evanescia's ends with the phase, Pearl's runs on to the version end.
  const html = await (await request.get("/hsr/")).text();
  const answer = html.match(/<p[^>]*data-testid="answer"[^>]*>([\s\S]*?)<\/p>/)?.[1].replace(/<[^>]+>/g, "") ?? "";
  expect(answer).toContain("The current HSR banners are The Demoiselle in Charge (Evanescia) and An Ocean in a Pearl (Pearl)");
  expect(answer).toContain("the first ends on Oct 21, 2026, 11:59 (UTC-5)");
});

test("the countdown runs and the banner switches when the build is stale", async ({ page }) => {
  // 2026-10-21 18:00Z: HSR 4.6 phase 2 opened at 12:00 America time (17:00Z), after the build.
  await page.clock.setFixedTime(new Date("2026-10-21T18:00:00Z"));
  await page.goto("/hsr/");
  await expect(page.getByTestId("answer")).toContainText("Now I Am Become Blade");
  await expect(page.getByTestId("countdown")).toHaveText(/^\d+d \d\dh \d\dm \d\ds$/);
});

test("the server choice changes the end time and is remembered", async ({ page }) => {
  // The switch is in the header. At the build moment America still runs Evanescia's banner
  // (ends 11:59 server time); Asia has moved to phase 2, whose banners end Nov 10.
  await page.clock.setFixedTime(new Date(BUILD_NOW));
  await page.goto("/hsr/");
  const ends = page.getByTestId("ends-server");
  await expect(ends).toHaveText("Oct 21, 11:59");
  await page.getByRole("button", { name: "Asia" }).click();
  await expect(ends).toHaveText("Nov 10, 15:00");
  await page.reload();
  await expect(page.getByRole("button", { name: "Asia" })).toHaveAttribute("aria-pressed", "true");
});

test("the archive filters by character name", async ({ page }) => {
  await page.goto("/hsr/");
  const rows = page.locator("section:has(#archive) tbody tr");
  await page.getByLabel("Filter by character").fill("Hyacine");
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
