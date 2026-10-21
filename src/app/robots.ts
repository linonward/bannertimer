import type { MetadataRoute } from "next";
import { GAMES, SITE_URL } from "@/lib/games";

// No crawler is blocked (docs/product.md §7).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: [`${SITE_URL}/sitemap.xml`, ...GAMES.map((g) => `${SITE_URL}/${g.id}/sitemap.xml`)],
  };
}
