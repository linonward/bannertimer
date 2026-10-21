import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // docs/product.md §3 uses trailing-slash URLs (`/hsr/`); redirect the other form.
  trailingSlash: true,
  // Two root layouts (English at the root, /{lang}/ for §3.1), so unmatched URLs need their own 404
  // page: src/app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
