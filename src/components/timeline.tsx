import { phaseWindows, type VersionRecord } from "@/lib/banners";
import { DEFAULT_SERVER, formatServerDay, instant } from "@/lib/time";
import { PhaseCell, type CellBanner } from "./phase-cell";

const server = DEFAULT_SERVER;

// docs/product.md §5 module 3: HTML and CSS only, never an image, so the names are indexed.
// One column per version, one cell per phase; `now` (the build time) marks the live phase.
export function Timeline({ gameId, versions, now }: { gameId: string; versions: VersionRecord[]; now: number }) {
  const day = (ms: number) => formatServerDay(ms, server);
  return (
    <ol className="flex flex-col gap-5 md:flex-row md:gap-0 md:border-r md:border-line">
      {versions.map((v) => {
        const windows = phaseWindows(v, server);
        return (
          <li key={v.version} className="flex flex-1 flex-col gap-4">
            <p className="flex items-end gap-2.5 pt-2 md:gap-3 md:px-4 md:pt-0">
              {/* Plain <a>: <Link> drops the trailing slash when the last segment has a dot ("4.6"). */}
              <a
                href={`/${gameId}/${v.version}/`}
                className="font-display text-5xl leading-[43px] font-extrabold italic hover:text-game md:text-[64px] md:leading-[58px]"
              >
                {v.version}
              </a>
              <span className="font-mono text-xs text-ink-3">
                {v.versionName ? `${v.versionName} · ` : ""}
                {day(windows[0].start)} → {day(windows.at(-1)!.end)}
              </span>
            </p>
            <ol className="flex flex-col gap-5 md:flex-row md:gap-0">
              {v.phases.map((p, i) => {
                const w = windows[i];
                const banners: CellBanner[] = p.banners.map((banner) => {
                  const end = instant(banner.end, server);
                  if (end <= now) return { banner, ended: true, note: `Ended ${day(end)}` };
                  if (end > w.end) return { banner, note: `Runs into phase ${p.phase + 1} · until ${day(end)}` };
                  return { banner };
                });
                return (
                  <PhaseCell
                    key={p.phase}
                    phase={p}
                    dates={`${day(w.start)} → ${day(w.end)}`}
                    banners={banners}
                    now={w.start <= now && now < w.end}
                  />
                );
              })}
            </ol>
          </li>
        );
      })}
      {versions.length === 1 && (
        // No next version in the data yet (Components: Multi-banner cases).
        <li className="flex flex-col gap-4 md:w-[400px]">
          <p className="flex items-end gap-2.5 pt-2 md:px-4 md:pt-0">
            <span className="font-display text-5xl leading-[43px] font-extrabold text-ink-3 italic md:text-[64px] md:leading-[58px]">
              NEXT
            </span>
          </p>
          <div className="flex flex-col gap-3.5 md:border-l md:border-line md:px-4 md:pb-[18px]">
            <span aria-hidden="true" className="-mx-4 block h-1 bg-line max-md:hidden" />
            <p className="font-display text-8xl leading-[86px] font-extrabold text-line-strong italic max-md:hidden">
              TBA
            </p>
            <p className="text-[13px] leading-5 text-ink-3">
              Not announced yet. The next phases appear here when HoYoverse posts the banner notice or a reliable leak
              with a source lands.
            </p>
          </div>
        </li>
      )}
    </ol>
  );
}
