import type { Metadata } from "next";
import { VersionPage, versionMetadata, versionStaticParams } from "@/components/version-page";

// docs/product.md §8: one page per version in src/data, built ahead of time; others are 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return versionStaticParams("hsr");
}

export async function generateMetadata({ params }: PageProps<"/hsr/[version]">): Promise<Metadata> {
  const { version } = await params;
  return versionMetadata("hsr", version);
}

export default async function Page({ params }: PageProps<"/hsr/[version]">) {
  const { version } = await params;
  return <VersionPage gameId="hsr" version={version} />;
}
