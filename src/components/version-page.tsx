import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { phaseWindows, versionsOf, type Phase, type VersionRecord } from "@/lib/banners";
import { BUILD_TIME } from "@/lib/build-time";
import { GAMES, getGame, SITE_URL } from "@/lib/games";
import { DEFAULT_SERVER, formatServerDay, instant } from "@/lib/time";
import { formatTimePoint, versionAnswer, versionH1, versionTitle } from "@/lib/version-page";
import { BannerLine } from "./banner-line";
import { JsonLd } from "./json-ld";
import { Section } from "./section";
import { SiteFooter } from "./site-footer";
import { StatusBadge } from "./status-badge";
import { VersionCountdown } from "./version-countdown";

const server = DEFAULT_SERVER;

function findVersion(gameId: string, version: string): { versions: VersionRecord[]; index: number } {
  const versions = versionsOf(gameId);
  const index = versions.findIndex((v) => v.version === version);
  if (index < 0) notFound();
  return { versions, index };
}

const isOfficial = (v: VersionRecord) => v.phases.every((p) => p.status === "official");

function versionDates(v: VersionRecord): string {
  const windows = phaseWindows(v, server);
  return `${formatServerDay(windows[0].start, server)} → ${formatServerDay(windows.at(-1)!.end, server)}`;
}

/** "Oct 21, 03:00 UTC → Nov 11, 11:59 server": the phase's first start to its last end. */
function phaseDates(p: Phase): string {
  const byAsia = (a: Phase["banners"][number]["start"]) => instant(a, "asia");
  const start = p.banners.map((b) => b.start).sort((a, b) => byAsia(a) - byAsia(b))[0];
  const end = p.banners.map((b) => b.end).sort((a, b) => byAsia(b) - byAsia(a))[0];
  return `${formatTimePoint(start)} → ${formatTimePoint(end)}`.replaceAll(" server time", " server");
}

/** One version's banners (docs/product.md §8): generated from the §4 data, no hand-written copy. */
export function VersionPage({ gameId, version }: { gameId: string; version: string }) {
  const game = getGame(gameId);
  const { versions, index } = findVersion(game.id, version);
  const v = versions[index];
  const prev = versions[index - 1];
  const next = versions[index + 1];
  const now = BUILD_TIME;
  const official = isOfficial(v);
  const checked = v.phases
    .map((p) => p.sourceCheckedAt ?? "")
    .sort()
    .at(-1);
  const windows = phaseWindows(v, server);
  const pageUrl = `${SITE_URL}/${game.id}/${v.version}/`;
  const others = GAMES.filter((g) => g.id !== game.id);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: game.name, item: `${SITE_URL}/${game.id}/` },
            { "@type": "ListItem", position: 3, name: v.version, item: pageUrl },
          ],
        }}
      />
      <main data-game={game.id}>
        <div
          className={`flex flex-wrap items-center gap-3 border-b px-5 py-3 md:px-20 ${official ? "border-ok-line bg-ok-soft" : "border-leak-line bg-leak-soft"}`}
        >
          <StatusBadge status={official ? "official" : "leaked"} />
          <p className="text-sm text-ink-2">
            {official
              ? `Every banner on this page comes from the official ${game.shortName} ${game.notices}.`
              : "Some banners on this page are leaked and unconfirmed. Each phase shows its own status."}
          </p>
          {checked && (
            <p className={`font-mono text-xs ${official ? "text-ok" : "text-leak"}`}>
              Source checked{" "}
              {new Date(checked).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-6 overflow-hidden bg-[radial-gradient(ellipse_80%_40%_at_20%_20%,var(--game-line),transparent)] px-5 pt-6 pb-10 md:flex-row md:gap-12 md:bg-[radial-gradient(ellipse_40%_75%_at_20%_50%,var(--game-line),transparent)] md:px-20 md:pt-10 md:pb-16">
          <div className="relative flex flex-col md:w-[520px] md:shrink-0">
            <nav aria-label="Breadcrumb" className="relative font-mono text-[11px] text-ink-3 md:text-xs">
              <Link href="/" className="hover:text-ink">
                Home
              </Link>{" "}
              /{" "}
              <Link href={`/${game.id}/`} className="hover:text-ink">
                {game.name}
              </Link>{" "}
              / <span>{v.version}</span>
            </nav>
            <p
              aria-hidden="true"
              className="font-display text-[200px] leading-[180px] font-extrabold tracking-[-6px] text-game italic drop-shadow-[0_0_40px_var(--game-line)] md:text-[400px] md:leading-[360px] md:tracking-[-12px]"
            >
              {v.version}
            </p>
            <span
              aria-hidden="true"
              className={`absolute top-[150px] left-[180px] flex origin-top-left -rotate-[8deg] items-center gap-2 rounded-[3px] bg-bg px-3.5 py-2 font-display text-xl font-extrabold tracking-[1px] italic outline-2 -outline-offset-1 md:top-[300px] md:left-[300px] md:text-[26px] ${official ? "text-ok outline-ok" : "text-leak outline-leak"}`}
            >
              <span className={`size-[9px] rounded-full ${official ? "bg-ok" : "border-2 border-leak"}`} />
              {official ? "OFFICIAL" : "LEAKED"}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-5 md:gap-[22px] md:pt-10">
            <h1 className="font-display text-[52px] leading-[46px] font-extrabold uppercase italic md:text-7xl md:leading-[65px]">
              {versionH1(game.shortName, v.version)}
            </h1>
            <p className="text-[15px] leading-6 text-ink-2 md:text-base md:leading-[26px]" data-testid="answer">
              {versionAnswer(game.shortName, v, now)}
            </p>
            <VersionCountdown version={v} renderedAt={now} />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="h-7 bg-game bg-[repeating-linear-gradient(125deg,#111214_0_12px,transparent_12px_28px)]"
        />

        <Section id="lineup" eyebrow="01 ── LINEUP" title={`${v.version} phase by phase`}>
          <ol className="flex flex-col gap-5 md:flex-row">
            {v.phases.map((p, i) => {
              const w = windows[i];
              const live = w.start <= now && now < w.end;
              return (
                <li
                  key={p.phase}
                  className={`relative flex flex-1 flex-col overflow-hidden rounded outline -outline-offset-1 ${
                    live ? "bg-game-soft outline-game" : p.status === "leaked" ? "bg-leak-soft outline-leak-line" : "bg-panel outline-line"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute top-2.5 right-6 font-display text-[160px] leading-[150px] font-extrabold italic select-none md:text-[220px] md:leading-[198px] ${live ? "text-game-soft" : "text-panel-2"}`}
                  >
                    {String(p.phase).padStart(2, "0")}
                  </span>
                  <span aria-hidden="true" className={`relative ${live ? "h-1.5 bg-game" : "h-1 bg-line-strong"}`} />
                  <div className="relative flex flex-col gap-[22px] p-5 md:p-7">
                    <div className="flex items-center justify-between gap-3">
                      <h3
                        className={`font-mono text-xs font-semibold tracking-[2px] ${live ? "text-game" : "text-ink-3"}`}
                      >
                        PHASE {p.phase}
                        {live ? " · NOW" : ""}
                      </h3>
                      <StatusBadge status={p.status} />
                    </div>
                    <ul className="flex flex-col gap-[22px]">
                      {p.banners.map((banner) => {
                        const end = instant(banner.end, server);
                        const note =
                          end > w.end ? `Runs into phase ${p.phase + 1} · until ${formatServerDay(end, server)}` : undefined;
                        return <BannerLine key={banner.bannerName} banner={banner} note={note} size="L" />;
                      })}
                    </ul>
                    <p className="font-mono text-[13px] text-ink-2">{phaseDates(p)}</p>
                    {p.status === "leaked" && p.sourceUrl && (
                      <p className="font-mono text-[11px] text-ink-3">
                        Source:{" "}
                        <a href={p.sourceUrl} rel="nofollow noopener" className="underline">
                          {new URL(p.sourceUrl).hostname.replace(/^www\./, "")}
                        </a>
                        {p.sourceCheckedAt ? ` · checked ${p.sourceCheckedAt}` : ""}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>

        {/* Plain <a> for version URLs: <Link> drops the trailing slash when the last segment has a dot ("3.2"). */}
        <nav aria-label="Versions" className="flex flex-col gap-5 px-5 pb-10 md:flex-row md:px-20 md:pb-16">
          {prev ? (
            <a
              href={`/${game.id}/${prev.version}/`}
              className="flex flex-1 flex-col gap-1 rounded px-7 py-5 outline outline-line-strong -outline-offset-1 hover:outline-game"
            >
              <span className="font-mono text-[11px] tracking-[2px] text-ink-3">← PREVIOUS VERSION</span>
              <span className="font-display text-[32px] font-extrabold uppercase italic">
                {versionH1(game.shortName, prev.version)}
              </span>
              <span className="text-[13px] text-ink-3">
                {versionDates(prev)} · {isOfficial(prev) ? "Official" : "Leaked — unconfirmed"}
              </span>
            </a>
          ) : (
            <div className="flex flex-1 flex-col gap-1 rounded px-7 py-5 outline outline-line -outline-offset-1">
              <span className="font-mono text-[11px] tracking-[2px] text-ink-3">← PREVIOUS VERSION</span>
              <span className="font-display text-[32px] font-extrabold text-ink-3 italic">—</span>
              <span className="text-[13px] text-ink-3">Not in the archive</span>
            </div>
          )}
          <Link
            href={`/${game.id}/`}
            className="flex flex-1 flex-col items-center gap-1 rounded bg-game px-7 py-5 text-game-ink"
          >
            <span className="font-mono text-[11px] tracking-[2px]">ALL VERSIONS</span>
            <span className="font-display text-[32px] font-extrabold uppercase italic">{game.linkText}</span>
            <span className="text-[13px]">Live countdown and full archive</span>
          </Link>
          {next ? (
            <a
              href={`/${game.id}/${next.version}/`}
              className="flex flex-1 flex-col gap-1 rounded px-7 py-5 outline outline-line-strong -outline-offset-1 hover:outline-game md:items-end"
            >
              <span className="font-mono text-[11px] tracking-[2px] text-ink-3">NEXT VERSION →</span>
              <span className="font-display text-[32px] font-extrabold uppercase italic">
                {versionH1(game.shortName, next.version)}
              </span>
              <span className="text-[13px] text-ink-3">
                {versionDates(next)} · {isOfficial(next) ? "Official" : "Leaked — unconfirmed"}
              </span>
            </a>
          ) : (
            <div className="flex flex-1 flex-col gap-1 rounded px-7 py-5 outline outline-line-strong -outline-offset-1 md:items-end">
              <span className="font-mono text-[11px] tracking-[2px] text-ink-3">NEXT VERSION →</span>
              <span className="font-display text-[32px] font-extrabold text-ink-3 italic">TBA</span>
              <span className="text-[13px] text-ink-3">Not announced yet</span>
            </div>
          )}
        </nav>
      </main>

      <SiteFooter
        groups={[
          { heading: "Other games", links: others.map((g) => ({ href: `/${g.id}/`, text: g.linkText })) },
          {
            heading: "This game",
            links: [
              { href: `/${game.id}/`, text: game.linkText },
              ...(prev
                ? [{ href: `/${game.id}/${prev.version}/`, text: `${game.shortName} ${prev.version} banners` }]
                : []),
            ],
          },
        ]}
      />
    </>
  );
}

export function versionStaticParams(gameId: string) {
  return versionsOf(gameId).map((v) => ({ version: v.version }));
}

export function versionMetadata(gameId: string, version: string): Metadata {
  const game = getGame(gameId);
  const { versions, index } = findVersion(game.id, version);
  const v = versions[index];
  const title = versionTitle(game.shortName, v.version);
  const description = `Every ${game.shortName} ${v.version} banner by phase: featured 5★ and 4★ characters, start and end times in your timezone, and a live countdown.`;
  const url = `/${game.id}/${v.version}/`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  };
}
