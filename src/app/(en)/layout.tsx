import type { Metadata } from "next";
import { RootHtml } from "@/components/root-html";
import { SITE_NAME, SITE_URL } from "@/lib/games";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  // Pages set no twitter field, so this card type reaches all of them; Next fills the rest from openGraph.
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <RootHtml lang="en">{children}</RootHtml>;
}
