"use client";

import { calendarLinks } from "@/lib/calendar";
import { defaultServer, type Lang } from "@/lib/i18n";
import { useServer } from "@/lib/live";
import { messages } from "@/lib/messages";
import { utcOffsetLabel } from "@/lib/time";
import { CalendarPlusIcon, ChevronDownIcon, DownloadIcon, GlobeIcon, MonitorSmartphoneIcon } from "./icons";

/**
 * "Add to calendar": subscribe to the game's feed for the chosen server, or download it once.
 * A details menu, so it opens without JS; it opens in the page flow, so no hero clips it. The links
 * follow the server switch after hydration.
 */
export function CalendarMenu({ gameId, lang = "en" }: { gameId: string; lang?: Lang }) {
  const t = messages(lang);
  const server = useServer(defaultServer(lang));
  const links = calendarLinks(gameId, server);
  const items = [
    { href: links.webcal, icon: MonitorSmartphoneIcon, title: t.calendarApple, hint: t.calendarSubscribe },
    { href: links.google, icon: GlobeIcon, title: t.calendarGoogle, hint: t.calendarSubscribe, external: true },
    { href: links.download, icon: DownloadIcon, title: t.calendarDownload, hint: t.calendarOnce, download: `${gameId}-${server}.ics` },
  ];

  return (
    <div className="flex flex-col items-start gap-2">
      <details className="group">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-2.5 rounded bg-panel px-3.5 py-2.5 font-mono text-xs font-bold tracking-[1.5px] text-ink uppercase outline outline-game-line -outline-offset-1 hover:bg-panel-2 [&::-webkit-details-marker]:hidden">
          <CalendarPlusIcon className="size-4 text-game" />
          {t.calendarAdd}
          <ChevronDownIcon className="size-3.5 text-ink-3 group-open:rotate-180" />
        </summary>
        <ul className="mt-1.5 flex w-80 max-w-[calc(100vw-40px)] flex-col gap-0.5 rounded bg-panel p-1 outline outline-line -outline-offset-1">
          {items.map(({ href, icon: ItemIcon, title, hint, external, download }) => (
            <li key={title}>
              <a
                href={href}
                download={download}
                rel={external ? "noopener" : undefined}
                target={external ? "_blank" : undefined}
                className="flex items-center gap-3 rounded-[3px] px-3 py-2.5 hover:bg-panel-2"
              >
                <ItemIcon className="size-4 shrink-0 text-ink-2" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-ink">{title}</span>
                  <span className="font-mono text-[11px] text-ink-3">{hint}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </details>
      <p className="font-mono text-[11px] text-ink-3">{t.calendarNote(t.servers[server], utcOffsetLabel(server))}</p>
    </div>
  );
}
