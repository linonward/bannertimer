import { confirmationLabel, type Status } from "@/lib/banners";

// docs/product.md §5 module 2: official and leaked must differ at a glance. Official is the
// only green; leaked is a hollow grey light.
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      data-status={status}
      className={
        status === "official"
          ? "inline-flex w-fit shrink-0 items-center gap-[7px] rounded-[3px] bg-ok-soft px-2.5 py-[5px] font-mono text-xs font-medium text-ok outline outline-ok-line -outline-offset-1"
          : "inline-flex w-fit shrink-0 items-center gap-[7px] rounded-[3px] bg-leak-soft px-2.5 py-[5px] font-mono text-xs font-medium text-leak outline outline-leak-line -outline-offset-1"
      }
    >
      <span
        aria-hidden="true"
        className={
          status === "official"
            ? "size-[7px] rounded-full bg-ok shadow-[0_0_8px_var(--color-ok)]"
            : "size-[7px] rounded-full border-[1.5px] border-leak"
        }
      />
      {confirmationLabel(status)}
    </span>
  );
}

/** "NEW" for a 5★ on its first run, "RERUN" otherwise. */
export function CharacterTag({ isNew }: { isNew: boolean }) {
  return isNew ? (
    <span className="shrink-0 rounded-[2px] bg-game px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[1px] text-game-ink">
      NEW
    </span>
  ) : (
    <span className="shrink-0 rounded-[2px] px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[1px] text-ink-2 outline outline-line-strong -outline-offset-1">
      RERUN
    </span>
  );
}
