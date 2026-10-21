"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GAMES } from "@/lib/games";
import { defaultServer, gameLangs, gamePath, htmlLang, type Lang } from "@/lib/i18n";
import { chooseServer, useServer } from "@/lib/live";
import { messages } from "@/lib/messages";
import { isServer, SERVERS, utcOffsetLabel, type Server } from "@/lib/time";
import { ChevronDownIcon } from "./icons";
import { LogoMark } from "./logo-mark";

const DOT: Record<string, string> = { hsr: "bg-hsr", zzz: "bg-zzz", genshin: "bg-genshin" };
const UNDERLINE: Record<string, string> = { hsr: "border-hsr", zzz: "border-zzz", genshin: "border-genshin" };

/** The game page at this path, if it is one: "/hsr/" or "/vi/hsr/". */
function gamePageAt(path: string) {
  return GAMES.find((g) => gameLangs(g).some((lang) => gamePath(lang, g.id) === path));
}

/**
 * Logo, one tab per game page, the language switch on game pages with a translation (§3.1) and
 * the server switch (desktop segments, mobile select). Tabs stay in the page language where the
 * other game has that language, else they lead to English.
 */
export function SiteHeader({ lang = "en" }: { lang?: Lang }) {
  const t = messages(lang);
  // With or without the trailing slash, depending on how the page was reached.
  const pathname = usePathname().replace(/\/?$/, "/");
  const server = useServer(defaultServer(lang));
  const servers = Object.keys(SERVERS) as Server[];
  const page = gamePageAt(pathname);
  const pageLangs = page ? gameLangs(page) : [];

  const tabs = (
    <nav aria-label={t.gamesNav} className="flex h-full gap-[22px] md:gap-7">
      {GAMES.map((g) => {
        const href = gamePath(gameLangs(g).includes(lang) ? lang : "en", g.id);
        const active = pathname.startsWith(href) || pathname.startsWith(`/${g.id}/`);
        return (
          <Link
            key={g.id}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 border-b-2 px-0.5 text-sm md:text-[15px] ${
              active ? `${UNDERLINE[g.id]} font-semibold text-ink` : "border-transparent font-medium text-ink-2 hover:text-ink"
            }`}
          >
            <span aria-hidden="true" className={`size-1.5 rounded-full ${DOT[g.id]}`} />
            <span className="md:hidden">{g.navShort}</span>
            <span className="max-md:hidden">{g.navName}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="border-b border-line bg-bg">
      <div className="flex h-14 items-center justify-between gap-10 px-5 md:h-16 md:justify-start md:px-10">
        <Link href="/" className="flex items-center gap-2 md:gap-2.5">
          <LogoMark className="h-6 w-[18px] md:h-7 md:w-[22px]" />
          <span className="font-display text-[22px] font-extrabold italic tracking-[0.2px] text-ink md:text-2xl">
            bannertimer
          </span>
        </Link>
        <div className="h-full max-md:hidden">{tabs}</div>
        <div className="flex-1 max-md:hidden" />

        {pageLangs.length > 1 && (
          <nav aria-label={t.language} className="flex gap-0.5 font-mono text-[11px] tracking-[1px] max-md:ml-auto md:text-xs">
            {pageLangs.map((l) => (
              <a
                key={l}
                href={gamePath(l, page!.id)}
                hrefLang={htmlLang(l)}
                lang={htmlLang(l)}
                aria-current={l === lang ? "page" : undefined}
                className="rounded px-2 py-1.5 text-ink-3 uppercase hover:text-ink aria-[current=page]:bg-panel-2 aria-[current=page]:font-semibold aria-[current=page]:text-ink"
              >
                {l}
              </a>
            ))}
          </nav>
        )}

        <fieldset className="flex items-center gap-2.5 max-md:hidden">
          <legend className="sr-only">{t.server}</legend>
          <span aria-hidden="true" className="font-mono text-[11px] tracking-[2px] text-ink-3">
            {t.serverCaps}
          </span>
          <div className="flex gap-0.5 rounded-md bg-panel p-[3px] outline outline-line -outline-offset-1">
            {servers.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={server === key}
                onClick={() => chooseServer(key)}
                className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[13px] font-medium text-ink-3 aria-pressed:bg-panel-2 aria-pressed:font-semibold aria-pressed:text-ink"
              >
                {t.servers[key]}
                <span className={`font-mono text-[11px] font-normal ${server === key ? "text-game" : ""}`}>
                  {utcOffsetLabel(key)}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="relative flex items-center gap-1.5 rounded-md whitespace-nowrap bg-panel px-2.5 py-[7px] text-[13px] font-semibold text-ink outline outline-line -outline-offset-1 md:hidden">
          <span className="sr-only">{t.server}</span>
          {t.servers[server]}
          <span className="font-mono text-[11px] font-normal text-game">{utcOffsetLabel(server)}</span>
          <ChevronDownIcon className="size-3.5 text-ink-3" />
          <select
            value={server}
            onChange={(e) => isServer(e.target.value) && chooseServer(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {servers.map((key) => (
              <option key={key} value={key}>
                {t.servers[key]} ({utcOffsetLabel(key)})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="h-11 px-5 md:hidden">{tabs}</div>
    </header>
  );
}
