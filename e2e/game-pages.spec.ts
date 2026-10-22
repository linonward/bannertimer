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
  {
    path: "/genshin/",
    title: "Genshin Next Banner &amp; Banner Schedule — Live Countdown",
    h1: "Genshin Next Banner &amp; Countdown",
    current: "La Chanson Cerise",
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
  for (const path of ["/sitemap.xml", "/hsr/sitemap.xml", "/zzz/sitemap.xml", "/genshin/sitemap.xml"]) {
    expect(robots).toContain(`https://bannertimer.com${path}`);
    expect((await request.get(path)).ok()).toBe(true);
  }
});

// docs/product.md §8: version pages, generated from src/data only.
test.describe("/zzz/3.3/ server HTML", () => {
  let html: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.get("/zzz/3.3/");
    expect(res.ok()).toBe(true);
    html = await res.text();
  });

  test("has the §8 title, its own canonical and an H1 that differs from the title", () => {
    expect(html).toContain("<title>ZZZ 3.3 Banners — Characters, Countdown &amp; Release Date</title>");
    expect(html.match(/<link rel="canonical"[^>]*>/g)).toEqual([
      '<link rel="canonical" href="https://bannertimer.com/zzz/3.3/"/>',
    ]);
    expect(html.match(/<h1[\s>][\s\S]*?<\/h1>/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>ZZZ 3.3 Banners<\/h1>/);
  });

  test("answers with every phase's banners in the source", () => {
    const answer = html.match(/<p[^>]*data-testid="answer"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? "";
    expect(answer).toContain("ZZZ 3.3 started Oct 21, 03:00 UTC on every server.");
    expect(answer).toContain("Into the Flames of Life (Phoenix)");
    expect(answer).toContain("Phase 2 opens Nov 11, 12:00 server time");
  });

  test("links back to the main page and to the previous version, with breadcrumb data only", () => {
    expect(html).toMatch(/<a [^>]*href="\/zzz\/"/);
    expect(html).toMatch(/<a [^>]*href="\/zzz\/3.2\/"/);
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).not.toMatch(/"@type":"(Event|SpecialAnnouncement)"/);
  });
});

test("the main page links each archive row to its version page", async ({ request }) => {
  const html = await (await request.get("/zzz/")).text();
  expect(html).toMatch(/<a [^>]*href="\/zzz\/3.2\/"/);
});

test("a version that is not in the data is a 404", async ({ request }) => {
  expect((await request.get("/zzz/9.9/")).status()).toBe(404);
});

test("the game sitemap lists every version page", async ({ request }) => {
  const xml = await (await request.get("/zzz/sitemap.xml")).text();
  for (const version of ["3.1", "3.2", "3.3", "3.4"]) expect(xml).toContain(`https://bannertimer.com/zzz/${version}/`);
});

test("a named version keeps its number in the URL and its official name in the answer", async ({ request }) => {
  const res = await request.get("/genshin/6.8/");
  expect(res.ok()).toBe(true);
  const html = await res.text();
  expect(html).toContain("<title>Genshin 6.8 Banners — Characters, Countdown &amp; Release Date</title>");
  expect(html).toContain("Genshin 6.8 (Luna VIII) started Jul 1, 03:00 UTC on every server.");
});

// Cloudflare Web Analytics (docs/product.md §11): the beacon loads on bannertimer.com only, so
// local runs and tests never count as visits.
test("the analytics loader is in the page source and stays off outside bannertimer.com", async ({ page, request }) => {
  const html = await (await request.get("/hsr/")).text();
  expect(html).toContain("0360c442a9984e738a292cd684f3fd89");
  expect(html).toContain('location.hostname==="bannertimer.com"');

  const beacons: string[] = [];
  page.on("request", (r) => r.url().includes("cloudflareinsights.com") && beacons.push(r.url()));
  await page.goto("/hsr/");
  await page.waitForLoadState("networkidle");
  expect(beacons).toEqual([]);
});

// §4 `estimate`: a version page before any banner is announced, labelled as an estimate.
test("/zzz/3.4/ shows the estimated start as an estimate and no banners", async ({ request }) => {
  const res = await request.get("/zzz/3.4/");
  expect(res.ok()).toBe(true);
  const html = await res.text();
  expect(html).toContain("<title>ZZZ 3.4 Banners — Characters, Countdown &amp; Release Date</title>");
  expect(html).toMatch(/<h1[^>]*>ZZZ 3.4 Banners<\/h1>/);
  const answer = html.match(/<p[^>]*data-testid="answer"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? "";
  expect(answer).toContain("ZZZ 3.4 is expected Dec 2, 03:00 UTC on every server — an estimate, not an announcement.");
  expect(html).toContain('data-status="estimate"');
  expect(html).not.toContain('data-status="official"');
  expect(html).toContain("NOT ANNOUNCED YET");

  const main = await (await request.get("/zzz/")).text();
  expect(main).toMatch(/<a [^>]*href="\/zzz\/3.4\/"/);
});

// The live label has a desktop and a mobile ending. Both sit in one h2, so the raw text must
// still read as one line for crawlers (and as the shown ending for screen readers).
test("the live-banner heading reads as one line in the source", async ({ request }) => {
  const html = await (await request.get("/hsr/")).text();
  const h2 = html.match(/<h2[^>]*id="current-banner"[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? "";
  expect(h2.replace(/<[^>]+>/g, "")).toBe("LIVE NOW · 2 BANNERS · v4.6 PHASE 1");
});

test("every page has Open Graph tags and a share image", async ({ request }) => {
  for (const path of ["/", "/hsr/", "/zzz/3.3/"]) {
    const html = await (await request.get(path)).text();
    expect(html, path).toContain(`<meta property="og:url" content="https://bannertimer.com${path}"/>`);
    expect(html, path).toMatch(/<meta property="og:title" content="[^"]+"\/>/);
    const image = html.match(/<meta property="og:image" content="([^"]+)"\/>/)?.[1] ?? "";
    expect(image, path).toMatch(/^https:\/\/bannertimer\.com\//);
    const res = await request.get(new URL(image).pathname + new URL(image).search);
    expect(res.headers()["content-type"]).toBe("image/png");
    expect(html, path).toContain(`<meta name="twitter:card" content="summary_large_image"/>`);
    expect(html, path).toContain(`<meta name="twitter:image" content="${image}"/>`);
  }
});

test("the next HSR and Genshin versions have estimate pages before their banners", async ({ request }) => {
  for (const [path, line] of [
    ["/hsr/4.7/", "HSR 4.7 is expected Nov 11, 03:00 UTC on every server — an estimate, not an announcement."],
    ["/genshin/7.2/", "Genshin 7.2 is expected Nov 4, 03:00 UTC on every server — an estimate, not an announcement."],
  ]) {
    const html = await (await request.get(path)).text();
    expect(html).toContain(line);
    expect(html).toContain('data-status="estimate"');
  }
});

test("the home page title names no game keyword, fits 60 characters and differs from the H1", async ({ request }) => {
  const html = await (await request.get("/")).text();
  const title = html.match(/<title>(.*?)<\/title>/)![1];
  expect(title).toBe("Bannertimer — Live Gacha Banner Timers for HoYoverse Games");
  expect(title.length).toBeLessThanOrEqual(60);
  expect(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)![1]).not.toContain(title);
});

test("a version page links the official notice of every official phase", async ({ request }) => {
  const html = await (await request.get("/zzz/3.3/")).text();
  expect(html).toContain('href="https://zenless.hoyoverse.com/en-us/news/166926"');
  expect(html).toContain('href="https://zenless.hoyoverse.com/en-us/news/166963"');
});

test("checked and updated dates are machine-readable", async ({ request }) => {
  const version = await (await request.get("/zzz/3.3/")).text();
  expect(version).toMatch(/<time dateTime="2026-10-21">Oct 21, 2026<\/time>/i);
  const home = await (await request.get("/")).text();
  expect(home).toMatch(/<time dateTime="\d{4}-\d\d-\d\dT[\d:.]+Z">\w{3} \d{1,2}, \d{4}<\/time>/i);
});

// Citations: the live banners link the official notice they come from, not only the next banner.
test("the live banners cite their official notice in the source", async ({ request }) => {
  const html = await (await request.get("/hsr/")).text();
  // At the build moment America runs HSR 4.6 phase 1; phase 2 is the next banner.
  expect(html).toMatch(/<a [^>]*href="https:\/\/www\.hoyolab\.com\/article\/46851682"/);
  expect(html).toMatch(/<a [^>]*href="https:\/\/www\.hoyolab\.com\/article\/47142215"/);
});

test("every FAQ question is a heading", async ({ request }) => {
  for (const path of ["/hsr/", "/vi/zzz/", "/pt-br/genshin/"]) {
    const html = await (await request.get(path)).text();
    const questions = [...html.matchAll(/"@type":"Question","name":"([^"]+)"/g)].map((m) => m[1]);
    expect(questions.length, path).toBeGreaterThan(0);
    for (const q of questions) expect(html, `${path} ${q}`).toMatch(new RegExp(`<h3[^>]*>${q.replace(/[?.*+()]/g, "\\$&")}</h3>`));
  }
});
