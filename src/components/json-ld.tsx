// Structured data (docs/product.md §7): FAQPage and BreadcrumbList, plus WebSite and Organization on the home page only.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
