import type { Metadata } from "next";
import Link from "next/link";
import { featuredNames, phasesOf, scheduleAt, versionsOf } from "@/lib/banners";
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
      <h1 className="text-3xl font-bold">Gacha banner timers</h1>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {GAMES.map((game) => {
          const { current } = scheduleAt(phasesOf(versionsOf(game.id)), now, DEFAULT_SERVER);
          return (
            <li key={game.id} className="rounded-xl border border-line bg-surface p-5">
              <h2 className="text-xl font-semibold">
                <Link href={`/${game.id}/`}>{game.linkText}</Link>
              </h2>
              <p className="mt-2 text-sm">
                {current
                  ? `Now: ${current.bannerName} (${featuredNames(current)}), ends ${formatServerTime(instant(current.end, DEFAULT_SERVER), DEFAULT_SERVER)}.`
                  : "No banner is live right now."}
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
}
