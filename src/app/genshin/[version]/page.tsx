import type { Metadata } from "next";
import { VersionPage, versionMetadata, versionStaticParams } from "@/components/version-page";

// docs/product.md §8: one page per version in src/data, built ahead of time; others are 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return versionStaticParams("genshin");
}

export async function generateMetadata({ params }: PageProps<"/genshin/[version]">): Promise<Metadata> {
  const { version } = await params;
  return versionMetadata("genshin", version);
}

export default async function Page({ params }: PageProps<"/genshin/[version]">) {
  const { version } = await params;
  return <VersionPage gameId="genshin" version={version} />;
}
