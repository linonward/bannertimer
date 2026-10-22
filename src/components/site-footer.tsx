import Link from "next/link";
import { SITE_NAME } from "@/lib/games";
import type { Lang } from "@/lib/i18n";
import { messages } from "@/lib/messages";

export type FooterGroup = { heading: string; links: { href: string; text: string }[] };

/**
 * B/Site Footer: link columns and the fine print. Plain <a>, because <Link> drops the trailing
 * slash from version URLs ("/zzz/3.2/").
 */
export function SiteFooter({ groups, lang = "en" }: { groups: FooterGroup[]; lang?: Lang }) {
  const t = messages(lang);
  return (
    <footer className="mx-5 flex flex-col gap-7 border-t border-line pt-8 pb-10 md:mx-20 md:pt-10 md:pb-12">
      <div className="flex gap-10 md:gap-16">
        {groups.map((group) => (
          <nav key={group.heading} aria-label={group.heading} className="flex flex-col gap-2.5">
            <p className="font-mono text-[11px] tracking-[2px] text-ink-3 uppercase">{group.heading}</p>
            {group.links.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-ink-2 hover:text-ink">
                {link.text}
              </a>
            ))}
          </nav>
        ))}
      </div>
      <div className="flex flex-col gap-2 text-xs text-ink-3 md:flex-row md:justify-between md:gap-10">
        <p>{t.disclaimer}</p>
        {/* The site pages exist only in English (docs/product.md §3). */}
        <nav aria-label={SITE_NAME} className="flex shrink-0 gap-4">
          <Link href="/about/" className="hover:text-ink">
            {t.aboutLink}
          </Link>
          <Link href="/privacy/" className="hover:text-ink">
            {t.privacyLink}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
