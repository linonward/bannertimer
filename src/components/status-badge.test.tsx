import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

// docs/product.md §5 module 2: official and leaked must differ at a glance.
describe("StatusBadge", () => {
  it("labels official and leaked banners differently", () => {
    render(
      <>
        <StatusBadge status="official" />
        <StatusBadge status="leaked" />
      </>,
    );
    const official = screen.getByText("Official");
    const leaked = screen.getByText("Leaked — unconfirmed");
    expect(official.dataset.status).toBe("official");
    expect(leaked.dataset.status).toBe("leaked");
    expect(official.className).not.toBe(leaked.className);
  });
});
