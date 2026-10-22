import type { Metadata } from "next";
import { HomeBoard } from "@/components/home-board";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { bannersOf, lastUpdated, versionsOf } from "@/lib/banners";
import { BUILD_TIME } from "@/lib/build-time";
import { GAMES, SHARE_IMAGE, SITE_NAME, SITE_URL } from "@/lib/games";

// The hub (docs/product.md §3): a quick view of each game's current banner. It targets no
// keyword, so it never competes with the game pages.
const title = `${SITE_NAME} — Live Gacha Banner Timers for HoYoverse Games`;
const description = "Current and next banners for HoYoverse gacha games, each with its own live countdown page.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/", images: [SHARE_IMAGE] },
};

const SLASHES = ["bg-hsr", "bg-hsr/33", "bg-hsr/33", "bg-zzz", "bg-zzz/33", "bg-zzz/33", "bg-genshin", "bg-genshin/33", "bg-genshin/33"];

const names = GAMES.map((g) => g.name);
// The newest data change of any game, like the "Last updated" line on the game pages.
const updated = lastUpdated(GAMES.flatMap((g) => versionsOf(g.id)));
const gameList = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0];

export default function Home() {
  return (
    <>
      {/* §7: the home page alone names the site and who runs it. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              name: SITE_NAME,
              url: `${SITE_URL}/`,
              description,
              inLanguage: "en",
              publisher: { "@id": `${SITE_URL}/#organization` },
            },
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: SITE_NAME,
              url: `${SITE_URL}/`,
              email: "hello@bannertimer.com",
            },
          ],
        }}
      />
      <main>
        <div className="relative flex flex-col gap-4 overflow-hidden px-5 pt-10 pb-6 md:px-20 md:pt-[72px] md:pb-10">
          <span aria-hidden="true" className="pointer-events-none absolute top-[-40px] right-[108px] h-px w-[252px] max-md:hidden">
            {SLASHES.map((color, i) => (
              <span
                key={i}
                style={{ left: `${i * 30}px` }}
                className={`absolute top-0 h-80 w-3 origin-top-left rotate-[28deg] ${color}`}
              />
            ))}
          </span>
          <p className="relative font-mono text-[13px] font-semibold tracking-[2px] text-ink-3">
            LIVE BANNER BOARD · {GAMES.length} GAMES
          </p>
          <h1 className="relative max-w-[900px] font-display text-[52px] leading-[46px] font-extrabold tracking-[-1px] uppercase italic md:text-8xl md:leading-[84px]">
            What&apos;s on the banner right now
          </h1>
          <p className="relative max-w-[640px] text-[17px] leading-[27px] text-ink-2">
            Current banners for {gameList}, counting down to the second in your timezone.
            Open a game for the full banner schedule.
          </p>
          <p className="relative flex items-center gap-2.5 font-mono text-[11px] text-ink-3 md:text-xs">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-ok" />
            <span>
              Last updated{" "}
              <time dateTime={updated}>
                {new Date(updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
              </time>
            </span>
          </p>
        </div>
        <ul className="flex flex-col gap-5 px-5 pt-6 pb-10 md:flex-row md:px-20 md:pb-[72px]">
          {GAMES.map((game) => (
            <HomeBoard key={game.id} game={game} banners={bannersOf(versionsOf(game.id))} renderedAt={BUILD_TIME} />
          ))}
        </ul>
      </main>
      <SiteFooter
        groups={[{ heading: "Games", links: GAMES.map((g) => ({ href: `/${g.id}/`, text: g.linkText })) }]}
      />
    </>
  );
}
