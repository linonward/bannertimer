import { expect, test } from "@playwright/test";

// docs/product.md §3: /about/, /privacy/ and /llms.txt, checked against the raw server HTML.
const SITE = "https://bannertimer.com";

for (const page of [
  { path: "/about/", h1: "About bannertimer", must: ["hello@bannertimer.com", "official", "Not affiliated with HoYoverse"] },
  { path: "/privacy/", h1: "Privacy", must: ["Cloudflare Web Analytics", "cookie", "localStorage", "hello@bannertimer.com"] },
]) {
  test(`${page.path} is an English page with its own canonical, an H1 and no hreflang`, async ({ request }) => {
    const res = await request.get(page.path);
    expect(res.ok()).toBe(true);
    const html = await res.text();
    expect(html).toMatch(/<html lang="en"/);
    const title = html.match(/<title>(.*?)<\/title>/)![1];
    expect(title.length).toBeLessThanOrEqual(60);
    expect(html).toMatch(new RegExp(`<h1[^>]*>${page.h1}</h1>`));
    expect(title).not.toBe(page.h1);
    expect(html.match(/<link rel="canonical"[^>]*>/g)).toEqual([`<link rel="canonical" href="${SITE}${page.path}"/>`]);
    expect(html).not.toMatch(/hrefLang/i);
    for (const text of page.must) expect(html, text).toContain(text);
  });
}

test("the about page links its contact address", async ({ request }) => {
  const html = await (await request.get("/about/")).text();
  expect(html).toContain('href="mailto:hello@bannertimer.com"');
});

test("every page footer links About and Privacy", async ({ request }) => {
  for (const path of ["/", "/hsr/", "/vi/hsr/", "/zzz/3.3/", "/about/", "/privacy/"]) {
    const html = await (await request.get(path)).text();
    const footer = html.match(/<footer[\s\S]*<\/footer>/)?.[0] ?? "";
    expect(footer, path).toMatch(/<a [^>]*href="\/about\/"/);
    expect(footer, path).toMatch(/<a [^>]*href="\/privacy\/"/);
  }
});

test("the root sitemap lists About and Privacy", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain(`${SITE}/about/`);
  expect(xml).toContain(`${SITE}/privacy/`);
});

test("/llms.txt describes the site and links every page from the data", async ({ request }) => {
  const res = await request.get("/llms.txt");
  expect(res.ok()).toBe(true);
  expect(res.headers()["content-type"]).toContain("text/plain");
  const txt = await res.text();
  expect(txt.startsWith("# bannertimer\n")).toBe(true);
  expect(txt).toMatch(/^> .+/m);
  for (const url of [
    "/hsr/",
    "/zzz/",
    "/genshin/",
    "/hsr/4.6/",
    "/zzz/3.3/",
    "/genshin/7.1/",
    "/vi/hsr/",
    "/pt-br/genshin/",
    "/about/",
    "/privacy/",
  ]) {
    expect(txt, url).toContain(`(${SITE}${url})`);
  }
});
