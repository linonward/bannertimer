import { phaseWindows, type VersionRecord } from "@/lib/banners";
import { defaultServer, intlLocale, type Lang } from "@/lib/i18n";
import { messages } from "@/lib/messages";
import { formatServerDay, instant } from "@/lib/time";
import { PhaseCell, type CellBanner } from "./phase-cell";

// docs/product.md §5 module 3: HTML and CSS only, never an image, so the names are indexed.
// One column per version, one cell per phase; `now` (the build time) marks the live phase. It is
// prerendered on the page language's default server.
export function Timeline({
  gameId,
  versions,
  estimated,
  now,
  lang = "en",
}: {
  gameId: string;
  versions: VersionRecord[];
  /** The next version when only its estimated start is known (§4 `estimate`). */
  estimated?: VersionRecord;
  now: number;
  lang?: Lang;
}) {
  const t = messages(lang);
  const server = defaultServer(lang);
  const day = (ms: number) => formatServerDay(ms, server, intlLocale(lang));
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
                  if (end <= now) return { banner, ended: true, note: t.ended(day(end)) };
                  if (end > w.end) return { banner, note: t.runsInto(p.phase + 1, day(end)) };
                  return { banner };
                });
                return (
                  <PhaseCell
                    key={p.phase}
                    phase={p}
                    dates={`${day(w.start)} → ${day(w.end)}`}
                    banners={banners}
                    now={w.start <= now && now < w.end}
                    lang={lang}
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
            {estimated?.estimate ? (
              <>
                <a
                  href={`/${gameId}/${estimated.version}/`}
                  className="font-display text-5xl leading-[43px] font-extrabold text-ink-3 italic hover:text-game md:text-[64px] md:leading-[58px]"
                >
                  {estimated.version}
                </a>
                <span className="font-mono text-xs text-ink-3">
                  {t.expected(day(instant(estimated.estimate.start, server)))}
                </span>
              </>
            ) : (
              <span className="font-display text-5xl leading-[43px] font-extrabold text-ink-3 italic md:text-[64px] md:leading-[58px]">
                {t.nextCaps}
              </span>
            )}
          </p>
          <div className="flex flex-col gap-3.5 md:border-l md:border-line md:px-4 md:pb-[18px]">
            <span aria-hidden="true" className="-mx-4 block h-1 bg-line max-md:hidden" />
            <p className="font-display text-8xl leading-[86px] font-extrabold text-line-strong italic max-md:hidden">
              {t.tba}
            </p>
            <p className="text-[13px] leading-5 text-ink-3">{t.timelineNoNext}</p>
          </div>
        </li>
      )}
    </ol>
  );
}
