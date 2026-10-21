import { Barlow_Condensed, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { htmlLang, type Lang } from "@/lib/i18n";
import { Analytics } from "./analytics";
import { SiteHeader } from "./site-header";
import "../app/globals.css";

// Self-hosted by next/font at build time, so no third-party request on the critical path (§7).
const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "800"],
  style: ["italic"],
  variable: "--font-barlow-condensed",
});
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ibm-plex-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-ibm-plex-mono" });

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
