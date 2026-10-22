import { versionsOf } from "@/lib/banners";
import { GAMES, SITE_URL } from "@/lib/games";
import { gameLangs, gamePath, htmlLang, pageCopy } from "@/lib/i18n";
import { SERVERS, utcOffsetLabel, type Server } from "@/lib/time";

// docs/product.md §3: a plain-text map of the site for AI crawlers, built from the §4 data.
export const dynamic = "force-static";

export function GET() {
  const link = (text: string, path: string, note?: string) => `- [${text}](${SITE_URL}${path})${note ? `: ${note}` : ""}`;
  const names = GAMES.map((g) => g.name);
  const servers = (Object.keys(SERVERS) as Server[]).map((s) => `${SERVERS[s].label} ${utcOffsetLabel(s)}`).join(", ");
  const lines = [
    "# bannertimer",
    "",
    `> Live gacha banner countdowns and schedules for ${names.slice(0, -1).join(", ")} and ${names.at(-1)}. Fan-made, not affiliated with HoYoverse. Every banner links the official notice it comes from.`,
    "",
    `Times are shown per server (${servers}) and in the reader's time zone.`,
    "",
    "## Game pages",
    "",
    ...GAMES.map((g) =>
      link(g.linkText, gamePath("en", g.id), "current banner and countdown, next banner, upcoming phases, past banners and reruns"),
    ),
    "",
    "## Version pages",
    "",
    ...GAMES.flatMap((g) =>
      versionsOf(g.id).map((v) => link(`${g.shortName} ${v.version} banners`, `/${g.id}/${v.version}/`)),
    ),
    "",
    "## Other languages",
    "",
    ...GAMES.flatMap((g) =>
      gameLangs(g)
        .filter((lang) => lang !== "en")
        .map((lang) => link(pageCopy(g, lang)!.linkText, gamePath(lang, g.id), htmlLang(lang))),
    ),
    "",
    "## About",
    "",
    link("About", "/about/", "who runs the site, data sources, contact"),
    link("Privacy", "/privacy/"),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
