// Cloudflare Web Analytics (docs/product.md §11): cookieless, no consent banner needed. The site
// token is public by design. The beacon loads deferred, off the critical path (§7), and only on
// bannertimer.com, so local runs, tests and previews never count as visits.
const TOKEN = "0360c442a9984e738a292cd684f3fd89";

const loader = `if(location.hostname==="bannertimer.com"){var s=document.createElement("script");s.defer=true;s.src="https://static.cloudflareinsights.com/beacon.min.js";s.setAttribute("data-cf-beacon",'{"token":"${TOKEN}"}');document.head.appendChild(s)}`;

export function Analytics() {
  return <script dangerouslySetInnerHTML={{ __html: loader }} />;
}
