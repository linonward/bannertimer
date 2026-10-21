import type { MetadataRoute } from "next";
import { lastUpdated, versionsOf } from "@/lib/banners";
import { SITE_URL } from "@/lib/games";

// One sitemap per game (docs/product.md §7); lastmod is the data's real change time. Version
// pages (§8) are listed as soon as their data exists.
export default function sitemap(): MetadataRoute.Sitemap {
  const versions = versionsOf("hsr");
  return [
    { url: `${SITE_URL}/hsr/`, lastModified: lastUpdated(versions) },
    ...versions.map((v) => ({ url: `${SITE_URL}/hsr/${v.version}/`, lastModified: v.lastUpdated })),
  ];
}
