import { SiteFooter } from "./site-footer";
import { GAMES } from "@/lib/games";

/**
 * B/Text Page: the English-only site pages (docs/product.md §3, /about/ and /privacy/). An
 * eyebrow, the display H1, a lede, then short sections of prose; the footer links the games.
 */
export function TextPage({
  eyebrow,
  title,
  lede,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  /** "YYYY-MM-DD": when the text last changed. */
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex flex-col gap-10 px-5 pt-10 pb-14 md:gap-14 md:px-20 md:pt-[72px] md:pb-20">
        <div className="flex max-w-[760px] flex-col gap-4">
          <p className="font-mono text-[13px] font-semibold tracking-[2px] text-ink-3">{eyebrow}</p>
          <h1 className="font-display text-[52px] leading-[46px] font-extrabold tracking-[-1px] uppercase italic md:text-8xl md:leading-[84px]">
            {title}
          </h1>
          <p className="text-[17px] leading-[27px] text-ink-2">{lede}</p>
          <p className="flex items-center gap-2.5 font-mono text-[11px] text-ink-3 md:text-xs">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-ok" />
            <span>
              Last updated{" "}
              <time dateTime={updated}>
                {new Date(updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
              </time>
            </span>
          </p>
        </div>
        <div className="flex max-w-[760px] flex-col gap-10 [&_a]:text-ink [&_a]:underline [&_p]:text-[15px] [&_p]:leading-[26px] [&_p]:text-ink-2 md:[&_p]:text-base">
          {children}
        </div>
      </main>
      <SiteFooter
        groups={[{ heading: "Games", links: GAMES.map((g) => ({ href: `/${g.id}/`, text: g.linkText })) }]}
      />
    </>
  );
}

/** One section of a text page: a heading and its paragraphs. */
export function TextSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-6">
      <h2 className="font-display text-[26px] leading-7 font-extrabold uppercase italic md:text-[32px] md:leading-8">
        {title}
      </h2>
      {children}
    </section>
  );
}
