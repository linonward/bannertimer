import type { Metadata } from "next";
import Link from "next/link";
import { GAMES, SITE_NAME, SITE_URL } from "@/lib/games";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-line bg-surface">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3 text-sm">
            <Link href="/" className="font-bold text-ink">
              {SITE_NAME}
            </Link>
            {GAMES.map((g) => (
              <Link key={g.id} href={`/${g.id}/`}>
                {g.shortName}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-8 text-xs text-muted">
          {SITE_NAME} is a fan site and is not affiliated with HoYoverse.
        </footer>
      </body>
    </html>
  );
}
