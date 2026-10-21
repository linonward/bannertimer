import type { Lang } from "@/lib/i18n";
import { messages } from "@/lib/messages";
import { countdownParts } from "@/lib/time";

/**
 * The split-flap countdown: two tiles per unit. `ms` is null before the clock runs, so the
 * prerendered HTML shows dashes in tiles of the final size (no layout shift).
 */
export function FlapCountdown({ ms, size, lang = "en" }: { ms: number | null; size: "L" | "S"; lang?: Lang }) {
  const units = messages(lang).units;
  const parts = ms === null ? ["--", "--", "--", "--"] : countdownParts(ms);
  const large = size === "L";
  return (
    <div aria-hidden="true" className={`flex ${large ? "gap-[11px] md:gap-[22px]" : "gap-[11px]"}`}>
      {parts.map((digits, i) => (
        <div key={i} className={`flex flex-col ${large ? "gap-1.5 md:gap-2.5" : "gap-1.5"}`}>
          <div className={`flex ${large ? "gap-[3px] md:gap-1" : "gap-[3px]"}`}>
            {[...digits].map((d, j) => (
              <span
                key={j}
                className={`relative grid place-items-center overflow-hidden bg-flap font-mono font-bold text-flap-ink outline outline-white/5 -outline-offset-1 ${
                  large
                    ? "h-[50px] w-[33px] rounded text-[34px] md:h-[112px] md:w-[76px] md:rounded-md md:text-[80px] md:shadow-[0_10px_24px_#000000b3,inset_0_-2px_0_var(--game-line)]"
                    : "h-[50px] w-[33px] rounded text-[34px]"
                }`}
              >
                <span className="absolute inset-x-0 top-0 h-1/2 bg-flap-hi" />
                <span className="relative">{d}</span>
                <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-flap-seam" />
              </span>
            ))}
          </div>
          <span
            className={`font-mono text-ink-3 ${large ? "text-[10px] tracking-[1.5px] md:text-[11px] md:tracking-[2px]" : "text-[10px] tracking-[1.5px]"}`}
          >
            {units[i]}
          </span>
        </div>
      ))}
    </div>
  );
}
