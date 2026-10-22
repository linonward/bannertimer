import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/games";

// The hub and the site pages (docs/product.md §3); each game has its own sitemap
// (src/app/<game>/sitemap.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/` }, { url: `${SITE_URL}/about/` }, { url: `${SITE_URL}/privacy/` }];
}
