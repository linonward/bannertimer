import type { MetadataRoute } from "next";
import { lastUpdated, versionsOf } from "@/lib/banners";
import { getGame, SITE_URL } from "@/lib/games";
import { gameLangs, gamePath } from "@/lib/i18n";

// One sitemap per game (docs/product.md §7); lastmod is the data's real change time. Version
// pages (§8) are listed as soon as their data exists, and language pages (§3.1) once they have copy.
export default function sitemap(): MetadataRoute.Sitemap {
  const versions = versionsOf("genshin");
  return [
    ...gameLangs(getGame("genshin")).map((lang) => ({
      url: `${SITE_URL}${gamePath(lang, "genshin")}`,
      lastModified: lastUpdated(versions),
    })),
    ...versions.map((v) => ({ url: `${SITE_URL}/genshin/${v.version}/`, lastModified: v.lastUpdated })),
  ];
}
