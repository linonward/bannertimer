import { notFound } from "next/navigation";
import { RootHtml } from "@/components/root-html";
import { isLang, LANGS } from "@/lib/i18n";

// docs/product.md §3.1: the root layout for /{lang}/ pages. English has its own at the root.
export { metadata } from "../(en)/layout";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.filter((lang) => lang !== "en").map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang) || lang === "en") notFound();
  return <RootHtml lang={lang}>{children}</RootHtml>;
}
