import { describe, expect, it } from "vitest";
import { GAMES } from "./games";

describe("game copy (docs/product.md §6)", () => {
  it.each(GAMES)("$id: title is at most 60 characters and differs from the H1", (game) => {
    expect(game.title.length).toBeLessThanOrEqual(60);
    expect(game.title).not.toBe(game.h1);
  });
});
