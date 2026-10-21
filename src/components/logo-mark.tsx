/** The split-flap mark: its top half takes the current game colour. */
export function LogoMark({ className = "h-7 w-[22px]" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block shrink-0 overflow-hidden rounded-[3px] bg-flap outline outline-white/8 -outline-offset-1 ${className}`}
    >
      <span className="absolute inset-x-0 top-0 h-1/2 bg-game" />
      <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-flap-seam" />
    </span>
  );
}
