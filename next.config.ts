import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // docs/product.md §3 uses trailing-slash URLs (`/hsr/`); redirect the other form.
  trailingSlash: true,
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
