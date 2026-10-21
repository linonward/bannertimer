"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { messages } from "@/lib/messages";
import { ArrowDownIcon, ChevronDownIcon, SearchIcon } from "./icons";
import { CharacterTag } from "./status-badge";

export type ArchiveRow = {
  key: string;
  version: string;
  phase: number;
  bannerName: string;
  dates: string;
  five: string[];
  four: string[];
  rerun: boolean;
  /** Set once the version page exists (docs/product.md §14 item 5). */
  href?: string;
};

/** Rows shown before "Show more"; every row is in the HTML either way. */
const FIRST_ROWS = 6;

// docs/product.md §5 module 4: one row per banner, newest first by default, filterable by
// character name. On narrow screens each row stacks into a card.
export function ArchiveTable({ rows, lang = "en" }: { rows: ArchiveRow[]; lang?: Lang }) {
  const t = messages(lang);
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const needle = query.trim().toLowerCase();
  const sorted = newestFirst ? rows : [...rows].reverse();
  const matches = needle
    ? sorted.filter((r) => [...r.five, ...r.four].some((name) => name.toLowerCase().includes(needle)))
    : sorted;
  const collapsed = !needle && !expanded && matches.length > FIRST_ROWS;

  const cell = "md:px-2 md:py-3.5 md:first:pl-5 md:last:pr-5";
  return (
    <div className="flex flex-col gap-4 md:gap-7">
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex flex-1 items-center gap-2 rounded-md bg-panel px-3 py-[11px] outline outline-line-strong -outline-offset-1 md:max-w-[280px] md:flex-none md:py-[9px]">
          <SearchIcon className="size-[15px] shrink-0 text-ink-3" />
          <span className="sr-only">{t.filter}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.filter}
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={() => setNewestFirst(!newestFirst)}
          className="flex items-center gap-1.5 rounded-md px-3 py-[9px] text-sm text-ink-2 outline outline-line-strong -outline-offset-1 max-md:hidden"
        >
          {newestFirst ? t.newestFirst : t.oldestFirst}
          <ArrowDownIcon className={`size-3.5 ${newestFirst ? "" : "rotate-180"}`} />
        </button>
      </div>

      <div className="md:overflow-hidden md:rounded-md md:outline md:outline-line md:-outline-offset-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-panel-2 font-mono text-[11px] tracking-[1.5px] text-ink-3 max-md:sr-only">
            <tr className="border-b border-line">
              <th className={`${cell} w-[84px] font-medium`}>{t.columns.version}</th>
              <th className={`${cell} w-[88px] font-medium`}>{t.columns.phase}</th>
              <th className={`${cell} font-medium`}>{t.columns.banner}</th>
              <th className={`${cell} font-medium`}>5★</th>
              <th className={`${cell} font-medium`}>4★</th>
              <th className={`${cell} w-[206px] font-medium`}>{t.columns.dates}</th>
              <th className={`${cell} w-24 font-medium`}>{t.columns.rerun}</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((r, i) => (
              <tr
                key={r.key}
                className={`border-b border-line max-md:flex-wrap max-md:items-center max-md:gap-x-2.5 max-md:gap-y-[5px] max-md:py-3.5 ${
                  collapsed && i >= FIRST_ROWS ? "hidden" : "max-md:flex"
                }`}
              >
                <td className={`${cell} font-mono font-semibold text-game max-md:text-xs`}>
                  {r.href ? (
                    <a href={r.href} className="hover:underline">
                      {r.version}
                    </a>
                  ) : (
                    r.version
                  )}
                </td>
                <td
                  className={`${cell} text-ink-2 max-md:-ml-1 max-md:font-mono max-md:text-xs max-md:font-semibold max-md:text-game`}
                >
                  P{r.phase}
                </td>
                <td
                  className={`${cell} font-semibold text-ink max-md:order-4 max-md:basis-full max-md:text-xs max-md:font-normal max-md:text-ink-3`}
                >
                  {r.bannerName}
                  <span className="md:hidden"> · 4★ {r.four.length ? r.four.join(" · ") : t.pickedInGameShort}</span>
                </td>
                <td
                  className={`${cell} font-medium text-ink-2 max-md:order-3 max-md:basis-full max-md:text-[15px] max-md:font-semibold max-md:text-ink`}
                >
                  <span className="md:hidden">5★ </span>
                  {r.five.join(" & ")}
                </td>
                <td className={`${cell} text-ink-2 max-md:hidden`}>{r.four.length ? r.four.join(" · ") : "—"}</td>
                <td className={`${cell} font-mono text-ink-2 max-md:order-1 max-md:text-xs max-md:text-ink-3`}>
                  {r.dates}
                </td>
                <td className={`${cell} text-ink-2 max-md:order-2`}>
                  {r.rerun ? <CharacterTag isNew={false} lang={lang} /> : <span className="max-md:hidden">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {collapsed && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-semibold text-game md:bg-panel"
          >
            {t.showMore(matches.length - FIRST_ROWS)}
            <ChevronDownIcon className="size-4" />
          </button>
        )}
        {matches.length === 0 && (
          <p className="px-5 py-3.5 text-sm text-ink-3">{t.noMatch}</p>
        )}
      </div>
    </div>
  );
}
