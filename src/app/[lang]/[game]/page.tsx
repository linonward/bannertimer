import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { gameMetadata, GamePage } from "@/components/game-page";
import { GAMES } from "@/lib/games";
import { gameLangs, isLang } from "@/lib/i18n";

// docs/product.md §3.1: a game page exists in a language only when games.ts has its copy.
export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { lang: string } }) {
  return GAMES.filter((g) => isLang(params.lang) && gameLangs(g).includes(params.lang)).map((g) => ({ game: g.id }));
}

async function pageOf(params: PageProps<"/[lang]/[game]">["params"]) {
  const { lang, game } = await params;
  const found = GAMES.find((g) => g.id === game);
  if (!isLang(lang) || lang === "en" || !found || !gameLangs(found).includes(lang)) notFound();
  return { lang, game };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[game]">): Promise<Metadata> {
  const { lang, game } = await pageOf(params);
  return gameMetadata(game, lang);
}

export default async function Page({ params }: PageProps<"/[lang]/[game]">) {
  const { lang, game } = await pageOf(params);
  return <GamePage gameId={game} lang={lang} />;
}
