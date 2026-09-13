import type { Context, Config } from "@netlify/edge-functions";

export default async (_req: Request, context: Context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let html = await response.text();
  if (html.includes('id="aboa-marketplace-promo"')) return new Response(html, response);

  const styles = `
<style id="aboa-marketplace-promo-style">
  .aboa-marketplace-promo{background:#08172f;border-bottom:1px solid rgba(200,168,75,.28);color:#fff;padding:1.1rem clamp(1.25rem,4vw,3rem)}
  .aboa-marketplace-promo-inner{width:min(1380px,100%);margin:0 auto;display:grid;grid-template-columns:auto 1fr auto;gap:1.15rem;align-items:center}
  .aboa-marketplace-promo-kicker{font-family:Arial,sans-serif;font-size:.62rem;font-weight:700;letter-spacing:.17em;text-transform:uppercase;color:#E4C878;white-space:nowrap}
  .aboa-marketplace-promo-copy{font-family:Georgia,serif;font-size:clamp(1.05rem,1.7vw,1.35rem);line-height:1.25;color:#fff}
  .aboa-marketplace-promo-copy strong{color:#E4C878;font-weight:400;font-style:italic}
  .aboa-marketplace-promo-link{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:.65rem 1rem;border:1px solid rgba(228,200,120,.62);font-family:Arial,sans-serif;font-size:.66rem;font-weight:700;letter-spacing:.11em;text-transform:uppercase;color:#E4C878;text-decoration:none;white-space:nowrap}
  .aboa-marketplace-promo-link:hover,.aboa-marketplace-promo-link:focus{background:#C8A84B;color:#071A3C;border-color:#C8A84B}
  @media(max-width:820px){.aboa-marketplace-promo-inner{grid-template-columns:1fr;gap:.55rem}.aboa-marketplace-promo-kicker{white-space:normal}.aboa-marketplace-promo-link{width:100%;margin-top:.35rem}}
</style>`;

  const promo = `
<section class="aboa-marketplace-promo" id="aboa-marketplace-promo" aria-label="Apropos Business Opportunity Agency announcement">
  <div class="aboa-marketplace-promo-inner">
    <div class="aboa-marketplace-promo-kicker">New Opportunity-Development Organization</div>
    <div class="aboa-marketplace-promo-copy">Meet <strong>Apropos Business Opportunity Agency</strong> — creating business success through procurement intelligence.</div>
    <a class="aboa-marketplace-promo-link" href="/apropos-business-opportunity-agency/">Explore the Agency →</a>
  </div>
</section>`;

  html = html.replace("</head>", `${styles}\n</head>`);
  const navEnd = html.indexOf("</nav>");
  if (navEnd >= 0) {
    const insertAt = navEnd + "</nav>".length;
    html = html.slice(0, insertAt) + promo + html.slice(insertAt);
  } else {
    html = html.replace("<main", `${promo}\n<main`);
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.delete("etag");
  headers.set("cache-control", "public, max-age=0, must-revalidate");
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
};

export const config: Config = { path: "/" };
