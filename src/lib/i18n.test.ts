import { describe, expect, it } from "vitest";
import { GAMES, getGame } from "./games";
import { defaultServer, gamePath, LANGS, languageAlternates, pageCopy } from "./i18n";

describe("language pages (docs/product.md §3.1)", () => {
  it("keeps English at the root and puts other languages in a subdirectory", () => {
    expect(gamePath("en", "hsr")).toBe("/hsr/");
    expect(gamePath("vi", "hsr")).toBe("/vi/hsr/");
  });

  it("links each language version both ways, with x-default on English", () => {
    expect(languageAlternates(getGame("hsr"))).toEqual({ en: "/hsr/", vi: "/vi/hsr/", "x-default": "/hsr/" });
  });

  it("gives no alternates to a game page without a language version", () => {
    expect(languageAlternates(getGame("zzz"))).toBeUndefined();
  });

  it("starts Vietnamese pages on the Asia server and English pages on America", () => {
    expect(defaultServer("vi")).toBe("asia");
    expect(defaultServer("en")).toBe("america");
  });

  it.each(GAMES.flatMap((g) => LANGS.filter((l) => pageCopy(g, l)).map((l) => [g.id, l] as const)))(
    "%s %s: title is at most 60 characters and differs from the H1",
    (id, lang) => {
      const copy = pageCopy(getGame(id), lang)!;
      expect(copy.title.length).toBeLessThanOrEqual(60);
      expect(copy.title).not.toBe(copy.h1);
    },
  );
});
