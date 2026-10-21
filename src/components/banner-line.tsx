import type { Banner } from "@/lib/banners";
import { CharacterTag } from "./status-badge";

/** 5★ names first; several 5★ on one banner join with "&" (Components: Multi-banner cases). */
export function fiveNames(banner: Banner): string {
  return banner.featured5.map((c) => c.name).join(" & ");
}

/** An empty featured4 means players pick the 4★ in game; it never shows as a blank. */
export function fourText(banner: Banner): string {
  return banner.featured4.length ? `4★ ${banner.featured4.join(" · ")}` : "4★ Picked in game — no default lineup";
}

function isNew(banner: Banner): boolean {
  return banner.featured5.some((c) => c.isNew);
}

/** B/Live Banner Row: one live banner in the hero, with its own end on the right. */
export function LiveBannerRow({ banner, end }: { banner: Banner; end: string }) {
  return (
    <li className="flex items-center gap-3 border-t border-line py-3 md:gap-6 md:py-3.5">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-[13px] font-semibold text-game">5★</span>
          <span className="font-display text-[26px] leading-none font-extrabold italic md:text-[34px]">
            {fiveNames(banner)}
          </span>
          <CharacterTag isNew={isNew(banner)} />
        </div>
        <p className="font-mono text-[11px] text-ink-3 md:text-xs">
          {banner.bannerName} · {fourText(banner)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-mono text-[10px] tracking-[2px] text-ink-3">ENDS</span>
        <span className="font-mono text-[13px] font-medium md:text-[15px]">{end}</span>
      </div>
    </li>
  );
}

/** B/Banner Line: one banner inside a timetable phase cell. */
export function BannerLine({ banner, note, ended }: { banner: Banner; note?: string; ended?: boolean }) {
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-semibold text-game">5★</span>
        <span
          className={`min-w-0 font-display text-2xl leading-6 font-extrabold italic ${ended ? "text-ink-3" : "text-ink"}`}
        >
          {fiveNames(banner)}
        </span>
        <CharacterTag isNew={isNew(banner)} />
      </div>
      <p className="font-mono text-xs text-ink-2">{banner.bannerName}</p>
      <p className={`text-[13px] text-ink-3 ${banner.featured4.length ? "" : "italic"}`}>{fourText(banner)}</p>
      {note && <p className="font-mono text-[11px] text-game">{note}</p>}
    </li>
  );
}
