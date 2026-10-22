/** A page section with the numbered eyebrow and the display H2 (uppercase comes from CSS). */
export function Section({
  id,
  eyebrow,
  title,
  sub,
  aside,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  sub?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 border-t border-line px-5 py-10 md:gap-8 md:px-20 md:py-16"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5 md:gap-2">
          <p className="font-mono text-[11px] font-semibold tracking-[2px] text-game md:text-xs">{eyebrow}</p>
          <h2
            id={id}
            className="font-display text-[38px] leading-[34px] font-extrabold uppercase italic md:text-[56px] md:leading-[50px]"
          >
            {title}
          </h2>
          {sub && <p className="text-[15px] text-ink-3 max-md:hidden">{sub}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** B/FAQ Item: question on the left, answer on the right; stacked on narrow screens. */
export function FaqItem({ q, a }: { q: string; a: string }) {
  // A heading per question, so each answer reads as its own section.
  return (
    <div className="flex flex-col gap-2 border-t border-line py-5 md:flex-row md:gap-12 md:py-6">
      <h3 className="font-display text-xl leading-6 font-semibold italic md:w-[420px] md:shrink-0 md:text-2xl md:leading-7">
        {q}
      </h3>
      <p className="text-[15px] leading-6 text-ink-2 md:text-base md:leading-[26px]">{a}</p>
    </div>
  );
}
