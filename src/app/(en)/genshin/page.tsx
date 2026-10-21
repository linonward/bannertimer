import type { Metadata } from "next";
import { gameMetadata, GamePage } from "@/components/game-page";

export const metadata: Metadata = gameMetadata("genshin");

export default function Page() {
  return <GamePage gameId="genshin" />;
}
