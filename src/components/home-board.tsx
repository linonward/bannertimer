"use client";

import Link from "next/link";
import { scheduleAt, type BannerEntry } from "@/lib/banners";
import type { Game } from "@/lib/games";
import { useNow, useServer } from "@/lib/live";
import { formatCountdown, formatServerShort, instant, utcOffsetLabel } from "@/lib/time";
import { fiveNames } from "./banner-line";
import { FlapCountdown } from "./flap-countdown";
import { ArrowRightIcon } from "./icons";
import { Sources } from "./sources";
import { StatusBadge } from "./status-badge";

/** One game's board on the home page: what is live, a small countdown, what is next. */
export function HomeBoard({
  game,
  banners,
  renderedAt,
}: {
  game: Pick<Game, "id" | "name" | "shortName" | "linkText">;
  banners: BannerEntry[];
  renderedAt: number;
}) {
  const { now, live } = useNow(renderedAt);
  const server = useServer();
  const { current, next } = scheduleAt(banners, now, server);
  const endsAt = current.length ? instant(current[0].end, server) : 0;

  return (
    <li
      data-game={game.id}
      className="relative flex flex-1 flex-col overflow-hidden rounded bg-panel bg-[radial-gradient(ellipse_70%_50%_at_90%_0%,var(--game-line),transparent)] outline outline-game-line -outline-offset-1"
    >
      <span aria-hidden="true" className="relative h-1 bg-game" />
      {current.length > 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[-60px] left-[250px] font-display text-[300px] leading-none font-extrabold text-game-soft italic select-none"
        >
          {current[0].version}
        </span>
      )}
      <div className="relative flex flex-1 flex-col gap-[18px] px-7 pt-6 pb-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-mono text-xs font-bold tracking-[2px] text-game uppercase">{game.name}</h2>
          {current.length > 0 && (
            <p className="font-mono text-xs text-ink-3">
              v{current[0].version} · {current.length} LIVE
            </p>
          )}
        </div>
        {current.length ? (
          <>
            <p className="font-display text-[44px] leading-[42px] font-extrabold uppercase italic">
              {current.map(fiveNames).join(" & ")}
            </p>
            <p className="text-[13px] text-ink-2">{current.map((b) => b.bannerName).join(" · ")}</p>
            <div className="flex flex-col gap-2.5 pt-1.5">
              <p className="font-mono text-[11px] font-semibold tracking-[2px] text-game">
                {current.length > 1 ? "FIRST BANNER ENDS IN" : "BANNER ENDS IN"}
              </p>
              <FlapCountdown ms={live ? endsAt - now : null} size="S" />
              <p className="sr-only">{live ? formatCountdown(endsAt - now) : formatServerShort(endsAt, server)}</p>
            </div>
            <Sources banners={current} />
          </>
        ) : (
          <p className="font-display text-[44px] leading-[42px] font-extrabold text-ink-3 italic">NO BANNER LIVE</p>
        )}
      </div>
      <div className="relative flex items-center justify-between gap-4 border-t border-line bg-panel-2 px-7 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-mono text-[11px] tracking-[1px] text-ink-3 uppercase">
            {next.length
              ? `NEXT · ${formatServerShort(instant(next[0].start, server), server).replace(",", " ·")} ${utcOffsetLabel(server)}`
              : "NEXT · NOT ANNOUNCED"}
          </p>
          <p
            className={`font-display text-[22px] font-extrabold uppercase italic ${next.length ? "text-ink" : "text-ink-3"}`}
          >
            {next.length ? next.map(fiveNames).join(" & ") : "TBA"}
          </p>
        </div>
        {next.length > 0 && <StatusBadge status={next[0].status} />}
      </div>
      <Link
        href={`/${game.id}/`}
        className="relative flex items-center justify-between bg-game px-7 py-4 font-display text-xl font-extrabold text-game-ink uppercase italic"
      >
        {game.linkText}
        <ArrowRightIcon className="size-5" />
      </Link>
    </li>
  );
}
