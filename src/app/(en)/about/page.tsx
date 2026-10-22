import type { Metadata } from "next";
import { TextPage, TextSection } from "@/components/text-page";
import { GAMES, SHARE_IMAGE } from "@/lib/games";
import { SERVERS, utcOffsetLabel, type Server } from "@/lib/time";

// docs/product.md §3: what the site is, where the data comes from and how to reach us.
const title = "About Bannertimer — Data Sources and Contact";
const description =
  "Who runs bannertimer, where every banner date comes from, how leaks and estimates are marked, and how to report a mistake.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/about/" },
  openGraph: { title, description, url: "/about/", images: [SHARE_IMAGE] },
};

const CONTACT = "hello@bannertimer.com";
const names = GAMES.map((g) => g.name);
const gameList = `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
const servers = (Object.keys(SERVERS) as Server[]).map((s) => `${SERVERS[s].label} ${utcOffsetLabel(s)}`).join(", ");

export default function About() {
  return (
    <TextPage
      eyebrow="ABOUT"
      title="About bannertimer"
      lede={`bannertimer shows the current and next gacha banners for ${gameList}, with a live countdown to every banner change.`}
      updated="2026-10-22"
    >
      <TextSection title="Who runs it">
        <p>
          bannertimer is a fan-made site. Not affiliated with HoYoverse. Game and character names belong to their
          owners.
        </p>
      </TextSection>
      <TextSection title="Where the data comes from">
        <p>
          Every banner comes from an official notice: HoYoLAB posts and the news pages of each game. Each banner on the
          site links the notice it comes from, with the date we last checked it.
        </p>
        <p>
          A leak appears only with a source, in grey and marked &ldquo;Leaked — unconfirmed&rdquo;. When a version is
          announced but its banners are not, the page shows an estimated start marked &ldquo;Estimate — not
          announced&rdquo;, worked out from official times only.
        </p>
      </TextSection>
      <TextSection title="How times work">
        <p>
          Times are stored once and converted when the page shows them. Server times use fixed offsets: {servers}.
          Each page also shows the time in your own time zone.
        </p>
      </TextSection>
      <TextSection title="Contact and corrections">
        <p>
          Found a wrong date or a missing banner? Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> with a link to the
          official notice, and we will fix the page.
        </p>
      </TextSection>
    </TextPage>
  );
}
