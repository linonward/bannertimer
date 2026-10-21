import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo-mark";
import { SiteFooter } from "@/components/site-footer";
import { StatusBadge } from "@/components/status-badge";
import { bannersOf, bannerTitles, scheduleAt, versionsOf } from "@/lib/banners";
import { BUILD_TIME } from "@/lib/build-time";
import { GAMES, SITE_NAME } from "@/lib/games";
import { DEFAULT_SERVER, formatServerTime, instant } from "@/lib/time";

// The hub (docs/product.md §3): a quick view of each game's current banner. It targets no
// keyword, so it never competes with the game pages.
export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — Live Gacha Banner Timers` },
  description: "Current and next banners for HoYoverse gacha games, each with its own live countdown page.",
  alternates: { canonical: "/" },
};

export default function Home() {
  const now = BUILD_TIME;
  return (
    <>
      <main>
        <div className="flex flex-col gap-4 px-5 pt-10 pb-6 md:px-20 md:pt-[72px] md:pb-10">
          <h1 className="font-display text-[52px] leading-[46px] font-extrabold tracking-[-1px] uppercase italic md:text-8xl md:leading-[84px]">
            Gacha banner timers
          </h1>
        </div>
        <ul className="flex flex-col gap-5 px-5 pb-10 md:flex-row md:px-20 md:pb-[72px]">
          {GAMES.map((game) => {
            const { current, next } = scheduleAt(bannersOf(versionsOf(game.id)), now, DEFAULT_SERVER);
            return (
              <li
                key={game.id}
                data-game={game.id}
                className="flex flex-1 flex-col overflow-hidden rounded bg-panel outline outline-game-line -outline-offset-1"
              >
                <span aria-hidden="true" className="h-1 bg-game" />
                <div className="flex flex-1 flex-col gap-[18px] px-7 pt-6 pb-7">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2.5 font-mono text-xs font-bold tracking-[2px] text-game uppercase">
                      <LogoMark className="h-4 w-3" />
                      {game.name}
                    </h2>
                    {current.length > 0 && (
                      <p className="font-mono text-xs text-ink-3">
                        v{current[0].version} · {current.length} LIVE
                      </p>
                    )}
                  </div>
                  <p className="text-[15px] leading-6 text-ink-2">
                    {current.length
                      ? `Now: ${bannerTitles(current)}. ${current.length > 1 ? "The first ends" : "Ends"} ${formatServerTime(instant(current[0].end, DEFAULT_SERVER), DEFAULT_SERVER)}.`
                      : "No banner is live right now."}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-line bg-panel-2 px-7 py-4">
                  <p className="font-mono text-[11px] tracking-[1px] text-ink-3">
                    {next.length ? `NEXT · ${bannerTitles(next)}` : "NEXT · NOT ANNOUNCED"}
                  </p>
                  {next.length > 0 && <StatusBadge status={next[0].status} />}
                </div>
                <Link
                  href={`/${game.id}/`}
                  className="flex items-center justify-between bg-game px-7 py-4 font-display text-xl font-extrabold text-game-ink uppercase italic"
                >
                  {game.linkText}
                  <ArrowRightIcon className="size-5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      <SiteFooter
        groups={[{ heading: "Games", links: GAMES.map((g) => ({ href: `/${g.id}/`, text: g.linkText })) }]}
      />
    </>
  );
}
