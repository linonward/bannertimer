export type FooterGroup = { heading: string; links: { href: string; text: string }[] };

/**
 * B/Site Footer: link columns and the fine print. Plain <a>, because <Link> drops the trailing
 * slash from version URLs ("/zzz/3.2/").
 */
export function SiteFooter({ groups }: { groups: FooterGroup[] }) {
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
      <p className="text-xs text-ink-3">
        bannertimer is a fan-made schedule. Not affiliated with HoYoverse. Times are converted from official server time.
      </p>
    </footer>
  );
}
