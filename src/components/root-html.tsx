import localFont from "next/font/local";
import { htmlLang, type Lang } from "@/lib/i18n";
import { Analytics } from "./analytics";
import { SiteHeader } from "./site-header";
import "../app/globals.css";

// The font files live in src/fonts (latin + Vietnamese subsets, OFL), so the build needs no
// network and the pages make no third-party request on the critical path (§7).
const display = localFont({
  src: [
    { path: "../fonts/barlow-condensed-600-italic.woff2", weight: "600", style: "italic" },
    { path: "../fonts/barlow-condensed-800-italic.woff2", weight: "800", style: "italic" },
  ],
  variable: "--font-barlow-condensed",
});
const sans = localFont({
  src: "../fonts/ibm-plex-sans-variable.woff2",
  weight: "400 600",
  style: "normal",
  variable: "--font-ibm-plex-sans",
});
const mono = localFont({
  src: [
    { path: "../fonts/ibm-plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-mono-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ibm-plex-mono-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/ibm-plex-mono-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-ibm-plex-mono",
});

/**
 * The document both root layouts share: English at the root, other languages under /{lang}/
 * (docs/product.md §3.1). Each sets its own `<html lang>` in the server HTML.
 */
export function RootHtml({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={htmlLang(lang)} className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <SiteHeader lang={lang} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
