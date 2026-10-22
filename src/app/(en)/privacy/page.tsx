import type { Metadata } from "next";
import { TextPage, TextSection } from "@/components/text-page";
import { SHARE_IMAGE } from "@/lib/games";

// docs/product.md §3: what the site collects today. Update this page before AdSense or any other
// third-party script goes live (§10).
const title = "Privacy Policy — What Bannertimer Collects";
const description =
  "bannertimer uses cookieless analytics, keeps your server choice in your own browser and has no accounts or ads.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/privacy/" },
  openGraph: { title, description, url: "/privacy/", images: [SHARE_IMAGE] },
};

const CONTACT = "hello@bannertimer.com";

export default function Privacy() {
  return (
    <TextPage
      eyebrow="PRIVACY"
      title="Privacy"
      lede="bannertimer has no accounts, no ads and no cookies. This page lists everything the site stores or measures."
      updated="2026-10-22"
    >
      <TextSection title="Analytics">
        <p>
          We count visits with Cloudflare Web Analytics. It sets no cookie and does not track you across sites. It
          reports page views, the page that sent you here, load times and Core Web Vitals, as totals. It runs only on
          bannertimer.com.
        </p>
      </TextSection>
      <TextSection title="Your server choice">
        <p>
          When you pick a server (America, Europe or Asia), your browser keeps the choice in localStorage under{" "}
          <code>bannertimer:server</code>, so the next visit opens on the same server. It never leaves your browser.
          Clear your site data to remove it.
        </p>
      </TextSection>
      <TextSection title="Hosting">
        <p>
          The site runs on Cloudflare. Like any web host, Cloudflare handles each request, including your IP address,
          to deliver the page and protect the site from abuse. Calendar feeds are requested the same way as pages.
        </p>
      </TextSection>
      <TextSection title="Changes and contact">
        <p>
          We update this page before adding anything that collects more, such as ads. Questions: email{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
      </TextSection>
    </TextPage>
  );
}
