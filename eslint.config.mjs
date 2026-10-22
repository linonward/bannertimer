import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // next/font/google downloads the fonts during the build; one failed download fails the build.
      "no-restricted-imports": [
        "error",
        { paths: [{ name: "next/font/google", message: "Use next/font/local with the files in src/fonts." }] },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".wrangler/**", ".open-next/**"]),
]);

export default eslintConfig;
