import Link from "next/link";
import {
  bannersOf,
  bannerTitles,
  confirmationLabel,
  lastUpdated,
  pastBanners,
  scheduleAt,
  upcomingVersions,
  versionsOf,
} from "@/lib/banners";
import { BUILD_TIME } from "@/lib/build-time";
import { GAMES, getGame, SITE_URL } from "@/lib/games";
import { DEFAULT_SERVER, formatServerDay, formatServerTime, instant, utcOffsetLabel } from "@/lib/time";
import { ArchiveTable, type ArchiveRow } from "./archive-table";
import { BannerHero } from "./banner-hero";
import { JsonLd } from "./json-ld";
import { FaqItem, Section } from "./section";
import { SiteFooter } from "./site-footer";
import { StatusBadge } from "./status-badge";
import { Timeline } from "./timeline";

const server = DEFAULT_SERVER;

/** One game's banner page (docs/product.md §5): six modules, rendered from src/data only. */
export function GamePage({ gameId }: { gameId: string }) {
  const game = getGame(gameId);
  const versions = versionsOf(game.id);
  const banners = bannersOf(versions);
  const renderedAt = BUILD_TIME;
  const { current, next } = scheduleAt(banners, renderedAt, server);
  const updated = lastUpdated(versions);

  const nextVersionOf = Object.fromEntries(versions.map((v, i) => [v.version, versions[i + 1]?.version]));

  const archive: ArchiveRow[] = pastBanners(banners, renderedAt, server).map((b) => ({
    key: `${b.version}-${b.phase}-${b.bannerName}`,
    version: b.version,
    phase: b.phase,
    bannerName: b.bannerName,
    dates: `${formatServerDay(instant(b.start, server), server)} → ${formatServerDay(instant(b.end, server), server)}`,
    five: b.featured5.map((c) => c.name),
    four: b.featured4,
    rerun: b.isRerun,
  }));

  const faq = [
    {
      q: `What is the next ${game.shortName} banner?`,
      a: next.length
        ? `${bannerTitles(next)} ${next.length > 1 ? "start" : "starts"} ${formatServerTime(instant(next[0].start, server), server)}. Status: ${confirmationLabel(next[0].status)}.`
        : "The next banner has not been announced yet.",
    },
    {
      q: "When does the current banner end?",
      a: current.length
        ? `${current.map((b) => `${b.bannerName} ends ${formatServerTime(instant(b.end, server), server)}`).join(". ")}. The live countdown at the top of this page shows the time left.`
        : "No banner is live right now. The countdown at the top of this page shows when the next one starts.",
    },
    {
      q: "What time do banners change?",
      a: `A new version's first banner opens for every server at the same moment, when update maintenance ends. Second-half banners open at 18:00 server time: ${utcOffsetLabel("america")} on America, ${utcOffsetLabel("europe")} on Europe and ${utcOffsetLabel("asia")} on Asia. Pick your server at the top of the page to see the time in your own time zone.`,
    },
  ];

  const pageUrl = `${SITE_URL}/${game.id}/`;
  const others = GAMES.filter((g) => g.id !== game.id);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: game.name, item: pageUrl },
          ],
        }}
      />

      <main data-game={game.id}>
        <div className="flex flex-col gap-[18px] px-5 pt-5 pb-9 md:gap-7 md:px-20 md:pt-8 md:pb-[72px]">
          <nav aria-label="Breadcrumb" className="font-mono text-[11px] text-ink-3 md:text-xs">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>{" "}
            / <span>{game.name}</span>
          </nav>
          <div className="flex flex-col gap-3 md:gap-5">
            <h1 className="max-w-[900px] font-display text-[52px] leading-[46px] font-extrabold tracking-[-1px] uppercase italic md:text-[88px] md:leading-[77px]">
              {game.h1}
            </h1>
            <p className="flex items-center gap-2.5 font-mono text-[11px] text-ink-3 md:text-xs">
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-ok" />
              <span>
                Last updated <time dateTime={updated}>{updated.slice(0, 10)}</time> · Times shown in your timezone
              </span>
            </p>
          </div>
          <BannerHero
            shortName={game.shortName}
            versions={versions}
            banners={banners}
            nextVersionOf={nextVersionOf}
            renderedAt={renderedAt}
          />
        </div>

        <Section
          id="schedule"
          eyebrow="01 ── TIMETABLE"
          title={`Upcoming ${game.shortName} banners`}
          aside={<StatusBadge status="official" />}
        >
          <Timeline versions={upcomingVersions(versions, renderedAt, server)} now={renderedAt} />
        </Section>

        <Section
          id="archive"
          eyebrow="02 ── ARCHIVE"
          title={`Past ${game.shortName} banners`}
          sub="One row per banner, newest first"
        >
          <ArchiveTable rows={archive} />
        </Section>

        <Section id="faq" eyebrow="03 ── FAQ" title={`${game.shortName} banner questions`}>
          <dl>
            {faq.map((f) => (
              <FaqItem key={f.q} {...f} />
            ))}
          </dl>
        </Section>
      </main>

      <SiteFooter
        groups={[
          { heading: "Other games", links: others.map((g) => ({ href: `/${g.id}/`, text: g.linkText })) },
          {
            heading: "This game",
            links: [
              { href: "#archive", text: `${game.shortName} banner archive` },
              { href: "#faq", text: `${game.shortName} banner FAQ` },
            ],
          },
        ]}
      />
    </>
  );
}

export function gameMetadata(gameId: string) {
  const game = getGame(gameId);
  return {
    title: { absolute: game.title },
    description: game.description,
    alternates: { canonical: `/${game.id}/` },
    openGraph: { title: game.title, description: game.description, url: `/${game.id}/` },
  };
}
