import type { BannerEntry } from "@/lib/banners";
import { intlLocale, type Lang } from "@/lib/i18n";
import { messages } from "@/lib/messages";

/** The notices the banners come from (one link per notice), with the date they were checked. */
export function Sources({ banners, lang = "en" }: { banners: BannerEntry[]; lang?: Lang }) {
  const t = messages(lang);
  const sources = [...new Map(banners.filter((b) => b.sourceUrl).map((b) => [b.sourceUrl!, b])).values()];
  if (!sources.length) return null;
  const host = (b: BannerEntry) => new URL(b.sourceUrl!).hostname.replace(/^www\./, "");
  // Two notices on one host would read as the same link; number them.
  const shared = (b: BannerEntry) => sources.filter((s) => host(s) === host(b)).length > 1;
  const checked = sources[0].sourceCheckedAt;
  return (
    <p className="font-mono text-[11px] text-ink-3">
      {t.source}{" "}
      {sources.map((b, i) => (
        <span key={b.sourceUrl}>
          {i > 0 && ", "}
          <a href={b.sourceUrl} rel="nofollow noopener" className="underline">
            {shared(b) ? `${host(b)} (${sources.filter((s) => host(s) === host(b)).indexOf(b) + 1})` : host(b)}
          </a>
        </span>
      ))}
      {checked && (
        <time dateTime={checked}>
          {t.checked(
            new Date(checked).toLocaleDateString(intlLocale(lang), {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            }),
          )}
        </time>
      )}
    </p>
  );
}
