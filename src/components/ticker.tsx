"use client";

import { scheduleAt, type BannerEntry } from "@/lib/banners";
import { defaultServer, intlLocale, type Lang } from "@/lib/i18n";
import { useNow, useServer } from "@/lib/live";
import { messages } from "@/lib/messages";
import { formatServerDay, formatServerShort, instant, utcOffsetLabel } from "@/lib/time";
import { fiveNames } from "./banner-line";

/**
 * The ticker band under the hero: what is live, when the first one ends, what is next. It repeats
 * the board, so screen readers skip it; it scrolls unless the reader asks for less motion.
 */
export function Ticker({
  banners,
  renderedAt,
  lang = "en",
}: {
  banners: BannerEntry[];
  renderedAt: number;
  lang?: Lang;
}) {
  const t = messages(lang);
  const locale = intlLocale(lang);
  const { now } = useNow(renderedAt);
  const server = useServer(defaultServer(lang));
  const { current, next } = scheduleAt(banners, now, server);

  const items: { long: string; short: string }[] = [];
  if (current.length) {
    items.push({ long: t.tickerNow, short: t.tickerNow });
    for (const b of current) items.push({ long: `${b.bannerName} · ${fiveNames(b)}`, short: fiveNames(b) });
    const end = instant(current[0].end, server);
    items.push({
      long: `${t.tickerEnds(current.length)} ${formatServerShort(end, server, locale).replace(/,(?=[^,]*$)/, " ·")} ${utcOffsetLabel(server)}`,
      short: `${t.tickerShortEnds} ${formatServerDay(end, server, locale)}`,
    });
  }
  items.push(
    next.length
      ? {
          long: `${t.tickerNext} · ${next.map(fiveNames).join(" & ")} · ${formatServerDay(instant(next[0].start, server), server, locale)}`,
          short: `${t.tickerNext} · ${next.map(fiveNames).join(" & ")}`,
        }
      : { long: t.tickerNoNext, short: t.tickerShortNoNext },
  );

  const run = (copy: number) =>
    items.map((item, i) => (
      <span key={`${copy}-${i}`} className="flex shrink-0 items-center gap-4 md:gap-7">
        <span className="max-md:hidden">{item.long}</span>
        <span className="md:hidden">{item.short}</span>
        <span className="size-[7px] rotate-45 bg-game-ink md:size-[9px]" />
      </span>
    ));

  return (
    <div aria-hidden="true" className="h-10 overflow-hidden bg-game md:h-[52px]">
      <div className="ticker-track flex h-full w-max items-center gap-4 font-display text-lg font-extrabold tracking-[0.5px] text-game-ink uppercase italic md:gap-7 md:text-2xl">
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}
