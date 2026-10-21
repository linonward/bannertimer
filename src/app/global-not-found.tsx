import type { Metadata } from "next";
import Link from "next/link";
import { RootHtml } from "@/components/root-html";
import { SITE_NAME, SITE_URL } from "@/lib/games";

// The 404 for every unmatched URL, including /{lang}/ pages that have no copy (docs/product.md
// §3.1). It replaces the one Next drew inside the single root layout, before there were two.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `404: This page could not be found. | ${SITE_NAME}`,
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <RootHtml lang="en">
      <main className="flex flex-col gap-3 px-5 py-24 md:px-20 md:py-32">
        <h1 className="font-display text-[88px] leading-none font-extrabold italic">404</h1>
        <p className="text-ink-2">This page could not be found.</p>
        <Link href="/" className="text-ink underline hover:text-ink-2">
          Back to all banner timers
        </Link>
      </main>
    </RootHtml>
  );
}
