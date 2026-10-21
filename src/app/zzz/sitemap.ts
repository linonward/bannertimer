import type { MetadataRoute } from "next";
import { lastUpdated, versionsOf } from "@/lib/banners";
import { SITE_URL } from "@/lib/games";

// One sitemap per game (docs/product.md §7); lastmod is the data's real change time.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/zzz/`, lastModified: lastUpdated(versionsOf("zzz")) }];
}
