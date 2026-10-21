// The hourly rebuild (docs/product.md §14 item 2). The Worker's Cron Trigger calls this; it asks
// Workers Builds to build the `production` branch again through a deploy hook. The hook URL is a
// Worker secret (docs/workflow.md §8), never in the repo.
export type RebuildEnv = { DEPLOY_HOOK_URL?: string };

export async function triggerRebuild(
  env: RebuildEnv,
  fetcher: typeof fetch = fetch,
): Promise<"triggered" | "skipped"> {
  if (!env.DEPLOY_HOOK_URL) return "skipped";
  const res = await fetcher(env.DEPLOY_HOOK_URL, { method: "POST" });
  if (!res.ok) throw new Error(`Deploy hook returned ${res.status}`);
  return "triggered";
}
