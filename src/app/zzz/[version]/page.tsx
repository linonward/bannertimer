import type { Metadata } from "next";
import { VersionPage, versionMetadata, versionStaticParams } from "@/components/version-page";

// docs/product.md §8: one page per version in src/data, built ahead of time; others are 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return versionStaticParams("zzz");
}

export async function generateMetadata({ params }: PageProps<"/zzz/[version]">): Promise<Metadata> {
  const { version } = await params;
  return versionMetadata("zzz", version);
}

export default async function Page({ params }: PageProps<"/zzz/[version]">) {
  const { version } = await params;
  return <VersionPage gameId="zzz" version={version} />;
}
