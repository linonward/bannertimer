import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Every page is prerendered at build time and never revalidated, so the read-only Workers
// Static Assets cache serves them. Fresh data comes from a rebuild (docs/product.md §14 item 2).
const cloudflare = defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});

// `pnpm build` runs the OpenNext build, which would call `pnpm build` again by default.
const config = { ...cloudflare, buildCommand: "pnpm build:next" };

export default config;
