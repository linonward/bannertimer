"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GAMES } from "@/lib/games";
import { chooseServer, useServer } from "@/lib/live";
import { isServer, SERVERS, utcOffsetLabel, type Server } from "@/lib/time";
import { ChevronDownIcon } from "./icons";
import { LogoMark } from "./logo-mark";

const DOT: Record<string, string> = { hsr: "bg-hsr", zzz: "bg-zzz", genshin: "bg-genshin" };
const UNDERLINE: Record<string, string> = { hsr: "border-hsr", zzz: "border-zzz", genshin: "border-genshin" };

/** Logo, one tab per game page, and the server switch (desktop segments, mobile select). */
export function SiteHeader() {
  const pathname = usePathname();
  const server = useServer();
  const servers = Object.keys(SERVERS) as Server[];

  const tabs = (
    <nav aria-label="Games" className="flex h-full gap-[22px] md:gap-7">
      {GAMES.map((g) => {
        const active = pathname.startsWith(`/${g.id}/`);
        return (
          <Link
            key={g.id}
            href={`/${g.id}/`}
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

        <fieldset className="flex items-center gap-2.5 max-md:hidden">
          <legend className="sr-only">Server</legend>
          <span aria-hidden="true" className="font-mono text-[11px] tracking-[2px] text-ink-3">
            SERVER
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
                {SERVERS[key].label}
                <span className={`font-mono text-[11px] font-normal ${server === key ? "text-game" : ""}`}>
                  {utcOffsetLabel(key)}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="relative flex items-center gap-1.5 rounded-md bg-panel px-2.5 py-[7px] text-[13px] font-semibold text-ink outline outline-line -outline-offset-1 md:hidden">
          <span className="sr-only">Server</span>
          {SERVERS[server].label}
          <span className="font-mono text-[11px] font-normal text-game">{utcOffsetLabel(server)}</span>
          <ChevronDownIcon className="size-3.5 text-ink-3" />
          <select
            value={server}
            onChange={(e) => isServer(e.target.value) && chooseServer(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {servers.map((key) => (
              <option key={key} value={key}>
                {SERVERS[key].label} ({utcOffsetLabel(key)})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="h-11 px-5 md:hidden">{tabs}</div>
    </header>
  );
}
