import Link from "next/link";
import {
  bannersOf,
  bannerTitles,
  lastUpdated,
  pastBanners,
  scheduleAt,
  upcomingVersions,
  versionsOf,
} from "@/lib/banners";
import { BUILD_TIME } from "@/lib/build-time";
import { GAMES, getGame, SHARE_IMAGE, SITE_URL } from "@/lib/games";
import { defaultServer, gameLangs, gamePath, intlLocale, languageAlternates, pageCopy, type Lang } from "@/lib/i18n";
import { messages } from "@/lib/messages";
import { formatServerDay, formatServerTime, instant, utcOffsetLabel } from "@/lib/time";
import { ArchiveTable, type ArchiveRow } from "./archive-table";
import { BannerHero } from "./banner-hero";
import { JsonLd } from "./json-ld";
import { FaqItem, Section } from "./section";
import { SiteFooter } from "./site-footer";
import { StatusBadge } from "./status-badge";
import { Ticker } from "./ticker";
import { Timeline } from "./timeline";

/**
 * One game's banner page (docs/product.md §5): six modules, rendered from src/data only. Other
 * languages (§3.1) show the same data on their own default server, with the text translated.
 */
export function GamePage({ gameId, lang = "en" }: { gameId: string; lang?: Lang }) {
  const game = getGame(gameId);
  const copy = pageCopy(game, lang)!;
  const t = messages(lang);
  const locale = intlLocale(lang);
  const server = defaultServer(lang);
  const day = (ms: number) => formatServerDay(ms, server, locale);
  const time = (ms: number) => formatServerTime(ms, server, locale);
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
    dates: `${day(instant(b.start, server))} → ${day(instant(b.end, server))}`,
    five: b.featured5.map((c) => c.name),
    four: b.featured4,
    rerun: b.isRerun,
    // §5 module 4: every row links to its version page (§8).
    href: `/${game.id}/${b.version}/`,
  }));

  const faq = [
    {
      q: t.faqNext(game.shortName),
      a: next.length
        ? t.faqNextAnswer(
            bannerTitles(next, t.and),
            next.length,
            time(instant(next[0].start, server)),
            next[0].status === "official" ? t.official : t.leaked,
          )
        : t.faqNextNone,
    },
    {
      q: t.faqEnd,
      a: current.length
        ? t.faqEndAnswer(current.map((b) => ({ name: b.bannerName, at: time(instant(b.end, server)) })))
        : t.faqEndNone,
    },
    {
      q: t.faqChange,
      a: t.faqChangeAnswer({
        america: utcOffsetLabel("america"),
        europe: utcOffsetLabel("europe"),
        asia: utcOffsetLabel("asia"),
      }),
    },
  ];

  const pageUrl = `${SITE_URL}${gamePath(lang, game.id)}`;
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
            { "@type": "ListItem", position: 1, name: t.home, item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: game.name, item: pageUrl },
          ],
        }}
      />

      <main data-game={game.id}>
        <div className="relative flex flex-col gap-[18px] overflow-hidden bg-[radial-gradient(ellipse_90%_35%_at_90%_12%,var(--game-line),transparent)] px-5 pt-5 pb-9 md:gap-7 md:bg-[linear-gradient(180deg,transparent_60%,var(--color-bg)_100%),radial-gradient(ellipse_45%_70%_at_72%_45%,var(--game-line),transparent)] md:px-20 md:pt-8 md:pb-[72px]">
          {/* Decoration only: the version watermark and the game slashes. */}
          {current.length > 0 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-[-170px] left-[380px] font-display text-[640px] leading-[640px] font-extrabold tracking-[-20px] text-game-soft italic select-none max-md:hidden"
            >
              {current[0].version}
            </span>
          )}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[-30px] right-[22px] h-px w-[68px] [--step:20px] md:top-[-40px] md:right-[76px] md:w-[114px] md:[--step:26px]"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                style={{ left: `calc(var(--step) * ${i})` }}
                className={`absolute top-0 h-[180px] w-2 origin-top-left rotate-[28deg] md:h-[260px] md:w-2.5 ${i === 0 ? "bg-game" : "bg-game-line"} ${i === 4 ? "max-md:hidden" : ""}`}
              />
            ))}
          </span>

          <nav aria-label="Breadcrumb" className="relative font-mono text-[11px] text-ink-3 md:text-xs">
            <Link href="/" className="hover:text-ink">
              {t.home}
            </Link>{" "}
            / <span>{game.name}</span>
          </nav>
          <BannerHero
            shortName={game.shortName}
            versions={versions}
            banners={banners}
            nextVersionOf={nextVersionOf}
            renderedAt={renderedAt}
            lang={lang}
            intro={
              <>
                <h1 className="font-display text-[52px] leading-[46px] font-extrabold tracking-[-1px] uppercase italic md:text-[88px] md:leading-[77px]">
                  {copy.h1}
                </h1>
                <p className="flex items-center gap-2.5 font-mono text-[11px] text-ink-3 md:text-xs">
                  <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-ok" />
                  <span>{t.updated(<time dateTime={updated}>{formatUpdated(updated, locale)}</time>)}</span>
                </p>
              </>
            }
          />
        </div>
        <Ticker banners={banners} renderedAt={renderedAt} lang={lang} />

        <Section
          id="schedule"
          eyebrow={t.scheduleEyebrow}
          title={t.scheduleTitle(game.shortName)}
          aside={<StatusBadge status="official" lang={lang} />}
        >
          <Timeline
            gameId={game.id}
            versions={upcomingVersions(versions, renderedAt, server)}
            estimated={versions.find((v) => !v.phases.length && v.estimate && instant(v.estimate.start, server) > renderedAt)}
            now={renderedAt}
            lang={lang}
          />
        </Section>

        <Section
          id="archive"
          eyebrow={t.archiveEyebrow}
          title={t.archiveTitle(game.shortName)}
          sub={t.archiveSub}
        >
          <ArchiveTable rows={archive} lang={lang} />
        </Section>

        <Section id="faq" eyebrow={t.faqEyebrow} title={t.faqTitle(game.shortName)}>
          <dl>
            {faq.map((f) => (
              <FaqItem key={f.q} {...f} />
            ))}
          </dl>
        </Section>
      </main>

      <SiteFooter
        lang={lang}
        groups={[
          {
            heading: t.otherGames,
            // Same language where the other game has it (§3.1), else its English page.
            links: others.map((g) => {
              const l = gameLangs(g).includes(lang) ? lang : "en";
              return { href: gamePath(l, g.id), text: pageCopy(g, l)!.linkText };
            }),
          },
          {
            heading: t.thisGame,
            links: [
              { href: "#archive", text: t.archiveLink(game.shortName) },
              { href: "#faq", text: t.faqLink(game.shortName) },
            ],
          },
        ]}
      />
    </>
  );
}

/** "Oct 21, 2026" from the ISO lastUpdated. */
function formatUpdated(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function gameMetadata(gameId: string, lang: Lang = "en") {
  const game = getGame(gameId);
  const { title, description } = pageCopy(game, lang)!;
  const path = gamePath(lang, game.id);
  return {
    title: { absolute: title },
    description,
    // §3.1: canonical to itself, hreflang to every language version.
    alternates: { canonical: path, languages: languageAlternates(game) },
    openGraph: { title, description, url: path, images: [SHARE_IMAGE] },
  };
}
