import { expect, test } from "@playwright/test";
import { BUILD_NOW } from "./server";

// docs/product.md §3.1: language pages, checked against the raw server HTML (no client JS).
const SITE = "https://bannertimer.com";

/** The hreflang links in the head, as { lang: url }. */
function alternates(html: string): Record<string, string> {
  const links = html.match(/<link rel="alternate" hrefLang="[^"]+" href="[^"]+"\/>/gi) ?? [];
  return Object.fromEntries(
    links.map((l) => [l.match(/hrefLang="([^"]+)"/i)![1], l.match(/href="([^"]+)"/)![1]]),
  );
}

// Every language version of /hsr/ lists all of them, itself included.
const HSR_ALTERNATES = {
  en: `${SITE}/hsr/`,
  vi: `${SITE}/vi/hsr/`,
  "pt-BR": `${SITE}/pt-br/hsr/`,
  "x-default": `${SITE}/hsr/`,
};

function answerText(html: string): string {
  return (html.match(/<p[^>]*data-testid="answer"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? "").replace(/<[^>]+>/g, "");
}

test.describe("/vi/hsr/ server HTML", () => {
  let html: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.get("/vi/hsr/");
    expect(res.ok()).toBe(true);
    html = await res.text();
  });

  test("is marked as Vietnamese, with the §6 VI title, meta and H1", () => {
    expect(html).toMatch(/<html lang="vi"/);
    expect(html).toContain("<title>Lịch Banner HSR &amp; Banner Tiếp Theo — Đếm Ngược Trực Tiếp</title>");
    expect(html).toContain(
      '<meta name="description" content="Lịch banner HSR trực tiếp với đồng hồ đếm ngược theo giây. Banner hiện tại, giờ mở banner tiếp theo, các banner sắp tới và lịch sử rerun — cập nhật mỗi giờ."/>',
    );
    expect(html).toMatch(/<h1[^>]*>Lịch Banner HSR — Đếm Ngược Trực Tiếp<\/h1>/);
  });

  test("has its own canonical and hreflang to every language version", () => {
    expect(html.match(/<link rel="canonical"[^>]*>/g)).toEqual([`<link rel="canonical" href="${SITE}/vi/hsr/"/>`]);
    expect(alternates(html)).toEqual(HSR_ALTERNATES);
  });

  test("answers in Vietnamese with the four §6 phrases, on the Asia server", () => {
    const answer = answerText(html);
    // Asia is the default server for vi (§3.1); at the build moment Asia runs HSR 4.6 phase 2,
    // so two banners are live (§6, several banners).
    expect(answer).toContain(
      "Các banner hiện tại của HSR là An Ocean in a Pearl (Pearl) và Now I Am Become Blade (Mortenax Blade); banner đầu tiên kết thúc vào 10 thg 11, 2026, 15:00 (UTC+8)",
    );
    for (const phrase of ["banner tiếp theo", "lịch banner", "banner sắp tới", "đếm ngược banner"]) {
      expect(answer.toLowerCase()).toContain(phrase);
    }
  });

  test("translates the page, not only the first fold", () => {
    for (const english of [
      "Last updated",
      "Upcoming HSR banners",
      "Past HSR banners",
      "Filter by character",
      "What is the next HSR banner?",
      "NEXT BANNER",
      "Other games",
      "Not affiliated",
      ">Official<",
    ]) {
      expect(html, english).not.toContain(english);
    }
    expect(html).toContain("Banner tiếp theo của HSR là gì?");
    expect(html).toContain(">Chính thức<");
  });

  test("has FAQPage and BreadcrumbList data in Vietnamese and no Event", () => {
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"name":"Banner tiếp theo của HSR là gì?"');
    expect(html).toContain('"name":"Trang chủ"');
    expect(html).not.toMatch(/"@type":"(Event|SpecialAnnouncement)"/);
  });

  test("links archive rows to the English version pages and shows no other game's banners", () => {
    expect(html).toMatch(/<a [^>]*href="\/hsr\/4.5\/"/);
    expect(html).toMatch(/<a [^>]*href="\/zzz\/"/);
    expect(html).not.toContain("Into the Flames of Life");
  });

  test("offers the English page in the language switch", () => {
    expect(html).toMatch(/<a [^>]*href="\/hsr\/"[^>]*hrefLang="en"/i);
  });
});

test.describe("/pt-br/hsr/ server HTML", () => {
  let html: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.get("/pt-br/hsr/");
    expect(res.ok()).toBe(true);
    html = await res.text();
  });

  test("is marked as Brazilian Portuguese, with the §6 PT-BR title, meta and H1", () => {
    expect(html).toMatch(/<html lang="pt-BR"/);
    expect(html).toContain("<title>Cronograma de Banners do HSR &amp; Próximo Banner — Ao Vivo</title>");
    expect(html).toContain(
      '<meta name="description" content="Cronograma de banners do HSR ao vivo com contagem regressiva. Banner atual, início do próximo banner, próximos banners e reruns — atualizado a cada hora."/>',
    );
    expect(html).toMatch(/<h1[^>]*>Cronograma de Banners do HSR — Contagem ao Vivo<\/h1>/);
  });

  test("has its own canonical and hreflang to every language version", () => {
    expect(html.match(/<link rel="canonical"[^>]*>/g)).toEqual([`<link rel="canonical" href="${SITE}/pt-br/hsr/"/>`]);
    expect(alternates(html)).toEqual(HSR_ALTERNATES);
  });

  test("answers in Portuguese with the four §6 phrases, on the America server", () => {
    const answer = answerText(html);
    // America is the default server for pt-BR (§3.1); at the build moment it still runs HSR 4.6 phase 1.
    expect(answer).toContain(
      "Os banners atuais do HSR são The Demoiselle in Charge (Evanescia) e An Ocean in a Pearl (Pearl); o primeiro termina em 21 de out. de 2026, 11:59 (UTC-5)",
    );
    for (const phrase of ["próximo banner", "cronograma de banners", "próximos banners", "contagem regressiva"]) {
      expect(answer.toLowerCase()).toContain(phrase);
    }
  });

  test("translates the page, not only the first fold", () => {
    for (const english of ["Last updated", "Upcoming HSR banners", "Filter by character", "NEXT BANNER", "Not affiliated", ">Official<"]) {
      expect(html, english).not.toContain(english);
    }
    expect(html).toContain("Qual é o próximo banner do HSR?");
    expect(html).toContain(">Oficial<");
    expect(html).toContain('"name":"Início"');
  });

  test("offers the other languages in the language switch", () => {
    expect(html).toMatch(/<a [^>]*href="\/hsr\/"[^>]*hrefLang="en"/i);
    expect(html).toMatch(/<a [^>]*href="\/vi\/hsr\/"[^>]*hrefLang="vi"/i);
  });
});

test("/hsr/ links to every language version", async ({ request }) => {
  const html = await (await request.get("/hsr/")).text();
  expect(html).toMatch(/<html lang="en"/);
  expect(alternates(html)).toEqual(HSR_ALTERNATES);
});

test("pages without a language version have no hreflang", async ({ request }) => {
  for (const path of ["/", "/zzz/", "/hsr/4.6/"]) {
    const html = await (await request.get(path)).text();
    expect(alternates(html), path).toEqual({});
  }
});

test("a URL without a language version is a 404", async ({ request }) => {
  for (const path of ["/vi/", "/vi/zzz/", "/vi/hsr/4.6/", "/pt-br/", "/pt-br/zzz/", "/pt-br/hsr/4.6/", "/pt-BR/hsr/", "/ko/hsr/", "/en/hsr/"]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test("the game sitemap lists the language page", async ({ request }) => {
  const xml = await (await request.get("/hsr/sitemap.xml")).text();
  expect(xml).toContain(`${SITE}/vi/hsr/`);
  expect(xml).toContain(`${SITE}/pt-br/hsr/`);
});

test("the Brazilian page starts on the America server", async ({ page }) => {
  await page.clock.setFixedTime(new Date(BUILD_NOW));
  await page.goto("/pt-br/hsr/");
  await expect(page.getByRole("button", { name: /^América/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("ends-server")).toHaveText("21 de out., 11:59");
});

test("the Vietnamese page starts on the Asia server and keeps a saved choice", async ({ page }) => {
  await page.clock.setFixedTime(new Date(BUILD_NOW));
  await page.goto("/vi/hsr/");
  await expect(page.getByRole("button", { name: "Châu Á" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("ends-server")).toHaveText("10 thg 11, 15:00");
  await page.getByRole("button", { name: "Mỹ" }).click();
  await expect(page.getByTestId("ends-server")).toHaveText("21 thg 10, 11:59");
  await page.reload();
  await expect(page.getByRole("button", { name: "Mỹ" })).toHaveAttribute("aria-pressed", "true");
});

// Two root layouts leave no shared one for unmatched URLs; global-not-found.tsx keeps the site frame.
test("a 404 keeps the site header and is not indexed", async ({ request }) => {
  const res = await request.get("/vi/zzz/");
  expect(res.status()).toBe(404);
  const html = await res.text();
  expect(html).toMatch(/<html lang="en"/);
  expect(html).toContain('aria-label="Games"');
  expect(html).toMatch(/<meta name="robots" content="noindex/);
});

// Three languages and the server picker don't fit one 390px row; the switch must not push the page wide.
test("the header fits a 390px screen on every language version", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/hsr/", "/vi/hsr/", "/pt-br/hsr/"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(390);
  }
});

test("the mobile language menu links to the other versions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/pt-br/hsr/");
  await page.locator("header summary").click();
  await page.getByRole("link", { name: "VI", exact: true }).click();
  await expect(page).toHaveURL(/\/vi\/hsr\/$/);
});
