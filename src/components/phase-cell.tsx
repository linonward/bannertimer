import type { Phase } from "@/lib/banners";
import { BannerLine } from "./banner-line";
import { StatusBadge } from "./status-badge";

export type CellBanner = { banner: Phase["banners"][number]; note?: string; ended?: boolean };

/**
 * B/Phase Cell: one phase in the timetable. Official and leaked cells differ (§5 module 2);
 * the current phase gets the game rail.
 */
export function PhaseCell({
  phase,
  dates,
  banners,
  now,
}: {
  phase: Phase;
  dates: string;
  banners: CellBanner[];
  now: boolean;
}) {
  const leaked = phase.status === "leaked";
  const frame = now
    ? "bg-game-soft border-game shadow-[0_0_40px_var(--game-line)] max-md:order-first max-md:outline max-md:outline-game max-md:rounded"
    : leaked
      ? "bg-leak-soft border-leak-line max-md:outline max-md:outline-leak-line max-md:rounded"
      : "bg-panel border-line max-md:outline max-md:outline-line max-md:rounded";
  return (
    <li className={`flex flex-1 flex-col gap-3 overflow-hidden px-4 pb-[18px] md:border-l ${frame}`}>
      <span aria-hidden="true" className={`-mx-4 block ${now ? "h-1.5 bg-game" : leaked ? "h-1 bg-leak-line" : "h-1 bg-line-strong"}`} />
      <div className="flex flex-col gap-2.5 pt-1.5">
        <StatusBadge status={phase.status} />
        <p className={`font-mono text-[11px] font-semibold tracking-[1.5px] ${now ? "text-game" : "text-ink-3"}`}>
          PHASE {phase.phase}
          {now ? " · NOW" : ""}
        </p>
      </div>
      <p className="font-mono text-[13px] text-ink-2">{dates}</p>
      <ul className="flex flex-col gap-4 pt-1 md:gap-[18px]">
        {banners.map((b) => (
          <BannerLine key={b.banner.bannerName} {...b} />
        ))}
      </ul>
    </li>
  );
}
