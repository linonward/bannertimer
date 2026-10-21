"use client";

import type { VersionRecord } from "@/lib/banners";
import { useNow, useServer } from "@/lib/live";
import { formatCountdown, formatServerTime } from "@/lib/time";
import { countdownTarget } from "@/lib/version-page";
import { FlapCountdown } from "./flap-countdown";

/** The version page countdown: to the version start, the next phase, or the version end (§8). */
export function VersionCountdown({ version, renderedAt }: { version: VersionRecord; renderedAt: number }) {
  const { now, live } = useNow(renderedAt);
  const server = useServer();
  const target = countdownTarget(version, now, server);
  if (!target) {
    return (
      <p className="font-mono text-[11px] font-semibold tracking-[2px] text-ink-3">
        {version.version} HAS ENDED. ITS BANNERS ARE IN THE ARCHIVE.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-[11px] font-semibold tracking-[2px] text-game">{target.label}</p>
      <FlapCountdown ms={live ? target.at - now : null} size="L" />
      <p className="sr-only" data-testid="countdown">
        {live ? formatCountdown(target.at - now) : formatServerTime(target.at, server)}
      </p>
    </div>
  );
}
