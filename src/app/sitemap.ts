import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/games";

// The hub only; each game has its own sitemap (src/app/<game>/sitemap.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/` }];
}
