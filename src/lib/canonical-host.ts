// One host for every page (docs/workflow.md §8): www.bannertimer.com redirects to bannertimer.com.
// It runs in the Worker before OpenNext, so prerendered pages served from the cache redirect too.
export function canonicalRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.hostname !== "www.bannertimer.com") return null;
  url.hostname = "bannertimer.com";
  url.protocol = "https:";
  return Response.redirect(url.toString(), 301);
}
