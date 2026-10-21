// Per-game page copy: docs/product.md §6 (/hsr/), §6.1 (/zzz/) and §6.2 (/genshin/). Banner
// facts never live here; they come from src/data (§4).
export type Game = {
  id: "hsr" | "zzz" | "genshin";
  /** The name in titles and sentences (§14 item 4: short names). */
  shortName: string;
  /** The full name, for breadcrumbs and the home page boards. */
  name: string;
  /** The header tab label; `navShort` on narrow screens. */
  navName: string;
  navShort: string;
  /** What HoYoverse calls its banner announcements for this game. */
  notices: string;
  title: string;
  description: string;
  h1: string;
  /** Anchor text in links from other pages: the page's main keyword. */
  linkText: string;
};

export const GAMES: Game[] = [
  {
    id: "hsr",
    shortName: "HSR",
    name: "Honkai: Star Rail",
    navName: "Star Rail",
    navShort: "Star Rail",
    notices: "warp notices",
    title: "HSR Banner Schedule & Next Banner — Live Countdown",
    description:
      "Live HSR banner schedule with a real-time countdown. Current banner, next banner start time, upcoming banners and full rerun history — updated hourly.",
    h1: "HSR Banner Schedule & Countdown",
    linkText: "HSR banner schedule",
  },
  {
    id: "zzz",
    shortName: "ZZZ",
    name: "Zenless Zone Zero",
    navName: "Zenless Zone Zero",
    navShort: "Zenless",
    notices: "channel notices",
    title: "ZZZ Banner Countdown & Next Banner — Live Schedule",
    description:
      "Live ZZZ banner countdown to the second. Current banner, next banner start time, upcoming banners and the full banner schedule — updated hourly.",
    h1: "ZZZ Banner Countdown & Schedule",
    linkText: "ZZZ banner countdown",
  },
  {
    id: "genshin",
    shortName: "Genshin",
    name: "Genshin Impact",
    navName: "Genshin Impact",
    navShort: "Genshin",
    notices: "wish notices",
    title: "Genshin Next Banner & Banner Schedule — Live Countdown",
    description:
      "Genshin next banner with a live countdown. Current banner, next banner start time, upcoming banners and the full banner schedule — updated hourly.",
    h1: "Genshin Next Banner & Countdown",
    linkText: "Genshin next banner",
  },
];

export function getGame(id: string): Game {
  const game = GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Unknown game: ${id}`);
  return game;
}

export const SITE_URL = "https://bannertimer.com";
export const SITE_NAME = "Bannertimer";

// One brand card for link previews (public/og.png), on every page. It shows no banner data,
// so it never goes stale. Each page's openGraph replaces the parent's, so every page sets it.
export const SHARE_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "bannertimer: live gacha banner countdowns for Star Rail, Zenless Zone Zero and Genshin Impact",
};
