import { describe, expect, it, vi } from "vitest";
import { triggerRebuild } from "./rebuild";

// docs/product.md §14 item 2: pages are prerendered, so a rebuild every hour keeps them current.
describe("triggerRebuild", () => {
  it("POSTs to the Workers Builds deploy hook", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    await expect(triggerRebuild({ DEPLOY_HOOK_URL: "https://hook.example/x" }, fetcher)).resolves.toBe("triggered");
    expect(fetcher).toHaveBeenCalledWith("https://hook.example/x", { method: "POST" });
  });

  it("skips without a hook URL, so local and preview runs never build", async () => {
    const fetcher = vi.fn();
    await expect(triggerRebuild({}, fetcher)).resolves.toBe("skipped");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("throws when the hook answers with an error, so the cron run shows as failed", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("nope", { status: 404 }));
    await expect(triggerRebuild({ DEPLOY_HOOK_URL: "https://hook.example/x" }, fetcher)).rejects.toThrow(
      "Deploy hook returned 404",
    );
  });
});
