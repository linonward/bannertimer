import type { VersionRecord } from "@/lib/banners";
import { DEFAULT_SERVER, formatServerTime, instant } from "@/lib/time";
import { StatusBadge } from "./status-badge";

// docs/product.md §5 module 3: HTML and CSS only, never an image, so the names are indexed.
export function Timeline({ versions }: { versions: VersionRecord[] }) {
  return (
    <ol className="flex snap-x gap-4 overflow-x-auto pb-2">
      {versions.map((v) => (
        <li key={v.version} className="w-72 shrink-0 snap-start rounded-xl border border-line bg-surface p-4">
          <p className="text-lg font-bold">Version {v.version}</p>
          <p className="text-sm text-muted">
            Starts {formatServerTime(instant(v.phases[0].banners[0].start, DEFAULT_SERVER), DEFAULT_SERVER)}
          </p>
          <ol className="mt-3 space-y-3">
            {v.phases.map((p) => (
              <li key={p.phase} className="border-t border-line pt-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">Phase {p.phase}</span>
                  <StatusBadge status={p.status} />
                </div>
                <ul className="space-y-1">
                  {p.banners.map((b) => (
                    <li key={b.bannerName}>
                      <p className="mt-1 text-sm">5★ {b.featured5.map((c) => c.name).join(", ")}</p>
                      {b.featured4.length > 0 && <p className="text-sm text-muted">4★ {b.featured4.join(", ")}</p>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}
