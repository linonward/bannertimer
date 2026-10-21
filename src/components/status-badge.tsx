import { confirmationLabel, type Status } from "@/lib/banners";

// docs/product.md §5 module 2: official and leaked must differ at a glance.
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      data-status={status}
      className={
        status === "official"
          ? "rounded-full bg-official px-2.5 py-0.5 text-xs font-semibold text-white"
          : "rounded-full bg-leaked px-2.5 py-0.5 text-xs font-semibold text-ink"
      }
    >
      {confirmationLabel(status)}
    </span>
  );
}
