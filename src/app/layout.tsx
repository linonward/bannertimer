import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { SiteHeader } from "@/components/site-header";
import { SITE_NAME, SITE_URL } from "@/lib/games";
import "./globals.css";

// Self-hosted by next/font at build time, so no third-party request on the critical path (§7).
const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "800"],
  style: ["italic"],
  variable: "--font-barlow-condensed",
});
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ibm-plex-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-ibm-plex-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  // Pages set no twitter field, so this card type reaches all of them; Next fills the rest from openGraph.
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <SiteHeader />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
