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
import { DEFAULT_SERVER, formatServerDate, formatServerTime, instant, utcOffsetLabel } from "@/lib/time";
import { ArchiveTable, type ArchiveRow } from "./archive-table";
import { BannerHero } from "./banner-hero";
import { JsonLd } from "./json-ld";
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
    dates: `${formatServerDate(instant(b.start, server), server)} – ${formatServerDate(instant(b.end, server), server)}`,
    half: b.phase === 1 ? "1st half" : "2nd half",
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
            { "@type": "ListItem", position: 1, name: "Banner timers", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: game.linkText, item: pageUrl },
          ],
        }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/">Banner timers</Link> › <span>{game.linkText}</span>
      </nav>

      <h1 className="mt-3 text-3xl font-bold md:text-4xl">{game.h1}</h1>
      <p className="mt-1 mb-4 text-sm text-muted">
        Last updated <time dateTime={updated}>{updated.slice(0, 10)}</time> · Times shown in your timezone
      </p>

      <BannerHero shortName={game.shortName} banners={banners} nextVersionOf={nextVersionOf} renderedAt={renderedAt} />

      <section className="mt-12" aria-labelledby="schedule">
        <h2 id="schedule" className="mb-4 text-2xl font-bold">
          Upcoming {game.shortName} banners
        </h2>
        <Timeline versions={upcomingVersions(versions, renderedAt, server)} />
      </section>

      <section className="mt-12" aria-labelledby="archive">
        <h2 id="archive" className="mb-4 text-2xl font-bold">
          {game.shortName} banner history
        </h2>
        <ArchiveTable rows={archive} />
      </section>

      <section className="mt-12" aria-labelledby="faq">
        <h2 id="faq" className="mb-4 text-2xl font-bold">
          FAQ
        </h2>
        <dl className="space-y-4">
          {faq.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-1 text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav aria-label="More banner timers" className="mt-12 border-t border-line pt-6 text-sm">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {others.map((g) => (
            <li key={g.id}>
              <Link href={`/${g.id}/`}>{g.linkText}</Link>
            </li>
          ))}
          <li>
            <a href="#archive">{game.shortName} banner history</a>
          </li>
        </ul>
      </nav>
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
