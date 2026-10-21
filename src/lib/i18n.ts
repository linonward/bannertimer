import type { Game, PageCopy } from "./games";
import type { Server } from "./time";

// Language pages (docs/product.md §3.1). English stays at the root; every other language lives
// in its own subdirectory and only for the game pages that have its copy.
export const LANGS = ["en", "vi", "pt-br"] as const;
export type Lang = (typeof LANGS)[number];

const LOCALES: Record<Lang, { html: string; intl: string; server: Server }> = {
  en: { html: "en", intl: "en-US", server: "america" },
  vi: { html: "vi", intl: "vi-VN", server: "asia" },
  "pt-br": { html: "pt-BR", intl: "pt-BR", server: "america" },
};

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** The `<html lang>` and hreflang value. */
export function htmlLang(lang: Lang): string {
  return LOCALES[lang].html;
}

/** The Intl locale for dates and numbers. */
export function intlLocale(lang: Lang): string {
  return LOCALES[lang].intl;
}

/** The server a page shows until the reader picks one (§3.1). */
export function defaultServer(lang: Lang): Server {
  return LOCALES[lang].server;
}

export function gamePath(lang: Lang, gameId: string): string {
  return lang === "en" ? `/${gameId}/` : `/${lang}/${gameId}/`;
}

/** A game page's copy in a language, or undefined when that language has no page. */
export function pageCopy(game: Game, lang: Lang): PageCopy | undefined {
  return lang === "en" ? game : game.translations?.[lang];
}

/** The languages a game page exists in, English first. */
export function gameLangs(game: Game): Lang[] {
  return LANGS.filter((lang) => pageCopy(game, lang));
}

/** hreflang paths for a game page, or undefined when it has only English. */
export function languageAlternates(game: Game): Record<string, string> | undefined {
  const langs = gameLangs(game);
  if (langs.length < 2) return undefined;
  return {
    ...Object.fromEntries(langs.map((lang) => [htmlLang(lang), gamePath(lang, game.id)])),
    "x-default": gamePath("en", game.id),
  };
}
