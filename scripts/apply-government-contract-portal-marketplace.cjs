'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const homeFile = path.join(root, 'index.html');
const pageDir = path.join(root, 'government-contract-portal');
const pageFile = path.join(pageDir, 'index.html');
const origin = 'https://marketplace.aproposgroupllc.com';
const live = 'https://acb.aproposgroupllc.com/';

if (!fs.existsSync(homeFile)) throw new Error('[gcp-marketplace] index.html not found');
let home = fs.readFileSync(homeFile, 'utf8');

const ecosystemAnchor = `      <article class="amm-card">\n        <div class="amm-card-tag">Business Automation</div>`;
const gcpCard = `      <article class="amm-card amm-card-featured">\n        <div class="amm-card-tag">Agency Procurement Intelligence</div>\n        <h3>Government Contract Portal</h3>\n        <p>Built for business-development agencies and advisors to identify contract opportunities that align with client capabilities and bring those opportunities directly into the advisory relationship.</p>\n        <div class="amm-card-meta">30-day Agency Evaluation · Extended access available by request</div>\n        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="/government-contract-portal/">Explore Agency Portal</a><a class="amm-btn amm-btn-outline" href="${live}">Open Live Portal</a></div>\n      </article>\n`;
if (!home.includes('/government-contract-portal/')) {
  if (!home.includes(ecosystemAnchor)) throw new Error('[gcp-marketplace] ecosystem insertion anchor not found');
  home = home.replace(ecosystemAnchor, gcpCard + ecosystemAnchor);
}

home = home.replace(
  'Explore the production platform that matches your business need — federal contracting, state and local procurement, business development, workflow automation, or website creation.',
  'Explore the production platform that matches the need — agency procurement support, federal contracting, state and local procurement, business development, workflow automation, or website creation.'
);

const businessGrowthAnchor = '<section class="amm-band" id="business-growth">';
const agencySection = `<section class="amm-band" id="agency-partnerships">\n  <div class="amm-shell amm-trust">\n    <div>\n      <div class="amm-kicker">Business Development Agency Partnerships</div>\n      <h2 class="amm-title">Less time searching. <em>More time advising.</em></h2>\n      <p class="amm-lead">The Government Contract Portal was developed for business-development agencies and the advisors who serve their business communities. It helps an advisor identify an opportunity that aligns with a client’s business capabilities and bring that opportunity directly into the advisory relationship — without spending valuable time searching a fragmented procurement landscape.</p>\n      <div class="amm-actions" style="margin-top:28px"><a class="amm-btn amm-btn-primary" href="/government-contract-portal/">Explore Government Contract Portal</a><a class="amm-btn amm-btn-outline" href="${live}">Open Live Portal</a></div>\n    </div>\n    <aside class="amm-trust-panel"><strong>A win at every level.</strong><p><b>Agency:</b> add a practical procurement-support service. <b>Advisor:</b> spend less time searching and more time advising. <b>Business:</b> gain access to opportunities aligned with demonstrated capabilities.</p></aside>\n  </div>\n</section>\n\n`;
if (!home.includes('id="agency-partnerships"')) {
  if (!home.includes(businessGrowthAnchor)) throw new Error('[gcp-marketplace] agency section insertion anchor not found');
  home = home.replace(businessGrowthAnchor, agencySection + businessGrowthAnchor);
}

const resourceAnchor = '<a class="amm-resource" href="/government-contract-intelligence/">Government Contract Intelligence <span>→</span></a>';
const agencyResource = '<a class="amm-resource" href="/government-contract-portal/">Government Contract Portal for Agencies <span>→</span></a>\n      ';
if (!home.includes('Government Contract Portal for Agencies')) {
  if (!home.includes(resourceAnchor)) throw new Error('[gcp-marketplace] resource insertion anchor not found');
  home = home.replace(resourceAnchor, agencyResource + resourceAnchor);
}

const footerAnchor = '<a href="https://federalcontractorportal.aproposgroupllc.com/">Federal Contractors Portal</a>';
if (!home.includes('<a href="https://acb.aproposgroupllc.com/">Government Contract Portal</a>')) {
  if (!home.includes(footerAnchor)) throw new Error('[gcp-marketplace] footer insertion anchor not found');
  home = home.replace(footerAnchor, '<a href="https://acb.aproposgroupllc.com/">Government Contract Portal</a>\n        ' + footerAnchor);
}

// Add Government Contract Portal to the homepage ItemList after SEO generation.
const jsonLdPattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
const match = home.match(jsonLdPattern);
if (match) {
  try {
    const schema = JSON.parse(match[1]);
    const graph = Array.isArray(schema['@graph']) ? schema['@graph'] : [];
    const list = graph.find(node => node && node['@type'] === 'ItemList');
    if (list && Array.isArray(list.itemListElement)) {
      const url = `${origin}/government-contract-portal/`;
      if (!list.itemListElement.some(item => item && item.url === url)) {
        list.itemListElement.push({ '@type': 'ListItem', position: list.itemListElement.length + 1, name: 'Government Contract Portal', url });
        list.numberOfItems = list.itemListElement.length;
      }
    }
    if (!graph.some(node => node && node['@type'] === 'Service' && node.name === 'Government Contract Portal')) {
      graph.push({
        '@type': 'Service',
        name: 'Government Contract Portal',
        url: `${origin}/government-contract-portal/`,
        provider: { '@id': 'https://aproposgroupllc.com/#organization' },
        audience: { '@type': 'Audience', audienceType: 'Business-development agencies and business advisors' },
        description: 'Agency-first government contract opportunity intelligence that helps advisors identify relevant opportunities for the businesses they serve and route users to authoritative procurement sources.'
      });
    }
    home = home.replace(jsonLdPattern, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
  } catch (error) {
    throw new Error(`[gcp-marketplace] homepage JSON-LD update failed: ${error.message}`);
  }
}

fs.writeFileSync(homeFile, home, 'utf8');

fs.mkdirSync(pageDir, { recursive: true });
const canonical = `${origin}/government-contract-portal/`;
const title = 'Government Contract Portal for Business Development Agencies | APROPOS Marketplace';
const description = 'Explore the APROPOS Government Contract Portal, an agency-first contract opportunity intelligence service built for business-development advisors and the businesses they serve.';
const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': 'https://aproposgroupllc.com/#organization', name: 'APROPOS Group LLC', url: 'https://aproposgroupllc.com/' },
    { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: title, description, publisher: { '@id': 'https://aproposgroupllc.com/#organization' } },
    { '@type': 'Service', name: 'Government Contract Portal', url: canonical, provider: { '@id': 'https://aproposgroupllc.com/#organization' }, audience: { '@type': 'Audience', audienceType: 'Business-development agencies and business advisors' }, description },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'APROPOS Marketing Marketplace', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: 'Government Contract Portal', item: canonical }
    ] }
  ]
};

const page = `<!doctype html><html lang="en"><head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-FGJG583DTL"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FGJG583DTL');</script>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:site_name" content="APROPOS Marketing Marketplace"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${origin}/og-marketplace.jpg"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${origin}/og-marketplace.jpg"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/landing-pages.css"><script type="application/ld+json">${JSON.stringify(schema)}</script></head><body><a class="skip" href="#main">Skip to main content</a><nav class="site-nav" aria-label="Primary"><a class="brand" href="/"><span class="mark">AMM</span><span class="brand-name">APROPOS Marketing Marketplace<small>APROPOS GROUP LLC</small></span></a><div class="nav-links"><a href="/#ecosystem">Production Sites</a><a href="/government-contract-intelligence/">Procurement</a><a href="/procurement-partnerships/">Partnerships</a><a href="/apropos-group-llc/">Corporate</a></div></nav><main id="main"><header class="hero"><div class="wrap"><div class="breadcrumbs"><a href="/">Marketplace</a> / Government Contract Portal</div><div class="eyebrow">APROPOS GROUP LLC · AGENCY PROCUREMENT INTELLIGENCE</div><h1>Government Contract Portal</h1><p class="lead">A contract-opportunity intelligence environment developed for business-development agencies and the advisors who serve their business communities.</p><div class="stat-row"><span class="stat">Advisor-first workflow</span><span class="stat">Federal + California opportunity intelligence</span><span class="stat">Authoritative-source handoff</span></div></div></header><section><div class="wrap section-grid"><div><div class="gold-rule"></div><div class="eyebrow">Who this is for</div><h2>Built for the advisor relationship.</h2><p>Government Contract Portal is designed for Business Development Centers, SBDC organizations, economic-development agencies, chambers, procurement-support programs, and advisors who help businesses prepare for growth and pursue new opportunities.</p><p>This allows an advisor to identify an opportunity that aligns with a client’s business capabilities and bring that opportunity directly into the advisory relationship — without spending valuable time searching a fragmented procurement landscape.</p></div><aside class="card pathway"><h3>Agency Evaluation</h3><p>Selected agencies can evaluate the Portal for 30 days, with additional evaluation time available upon request.</p><a class="btn" href="${live}">Open Government Contract Portal</a></aside></div></section><section><div class="wrap"><div class="gold-rule"></div><div class="eyebrow">What the Portal provides</div><h2>Less searching. Better-informed advising.</h2><div class="service-grid"><article class="card"><h3>Advisor-assisted client intake</h3><p>An advisor can bring a client business into the experience directly, allowing the business profile and opportunity workflow to begin inside the advisory relationship.</p></article><article class="card"><h3>Business Capability Profile</h3><p>The Portal develops an evidence-based understanding of the business capabilities used to evaluate apparent opportunity alignment.</p></article><article class="card"><h3>Opportunity matching</h3><p>Prepared contract opportunities are evaluated against the business profile so advisors can focus attention on opportunities that appear relevant to what the client can provide.</p></article><article class="card"><h3>Contract opportunity intelligence</h3><p>Opportunity information is organized into a clearer advisor-facing view with match context, important requirements, timing, and next-step considerations.</p></article><article class="card"><h3>Federal and California inventory</h3><p>Federal opportunity discovery is anchored to SAM.gov, while current state and local inventory is focused on California public procurement sources.</p></article><article class="card"><h3>Authoritative-source transparency</h3><p>The Portal supports discovery and evaluation while directing the advisor or contractor back to the originating procurement authority for the official solicitation, documents, amendments, registration requirements, and bid process.</p></article></div></div></section><section><div class="wrap"><div class="gold-rule"></div><div class="eyebrow">Advisor workflow</div><h2>Bring opportunity directly into the client conversation.</h2><div class="steps-grid"><article class="card"><div class="step-number">01</div><h3>Bring in the business</h3><p>Use the agency-assisted intake to establish or access the client’s business profile.</p></article><article class="card"><div class="step-number">02</div><h3>Review aligned opportunities</h3><p>The Portal evaluates prepared opportunities against the client’s capabilities and surfaces the strongest apparent matches.</p></article><article class="card"><div class="step-number">03</div><h3>Discuss the Contract Brief</h3><p>Use the opportunity intelligence to understand the work, requirements, timing, fit, and questions that deserve discussion with the client.</p></article><article class="card"><div class="step-number">04</div><h3>Continue at the official source</h3><p>When the client wants to proceed, use the authoritative publisher link to review the official solicitation and procurement requirements.</p></article></div><div class="service-note"><strong>Operating principle:</strong> The Portal informs. The authoritative procurement source establishes the official requirement. The advisor helps the business understand the opportunity. The contractor decides whether to pursue it.</div></div></section><section><div class="wrap section-grid"><div><div class="gold-rule"></div><div class="eyebrow">Agency value</div><h2>A win for the Agency. A win for the Advisor. A win for the Client.</h2><div class="related"><ul><li><strong>Agency:</strong> add a practical procurement-support capability to the services already provided.</li><li><strong>Advisor:</strong> reduce time spent navigating fragmented procurement systems.</li><li><strong>Client:</strong> gain greater access to public opportunities aligned with demonstrated business capabilities.</li></ul></div></div><aside class="card"><h3>Current service boundary</h3><p>Government Contract Portal is operated by APROPOS Group LLC and is not a government agency, procurement portal, or awarding authority. Opportunity information must be verified against the official solicitation and issuing organization. Eligibility, responsiveness, selection, and contract award are never guaranteed.</p></aside></div></section><section class="cta-band"><div class="wrap"><div class="eyebrow">Agency Evaluation Program</div><h2>Put the Portal in your advisors’ hands.</h2><p>Explore how Government Contract Portal can complement the work your organization already performs for businesses in your community.</p><a class="btn" href="${live}">Open Government Contract Portal →</a><a class="btn secondary" href="/procurement-partnerships/">Explore APROPOS Partnerships →</a></div></section></main><footer class="site-footer"><div class="wrap"><div class="footer-grid"><div><span class="mark">AMM</span><h3>APROPOS Marketing Marketplace</h3><p>Public marketing, service discovery, and routing for the APROPOS Group LLC ecosystem.</p></div><div class="footer-links"><a href="/government-contract-portal/">Government Contract Portal</a><a href="/registered-federal-contractors-portal/">Federal Contractors Portal</a><a href="/nat-corp-contract-exchange/">NAT-CORP</a><a href="/national-enterprise-business-center/">NEBC</a><a href="/apropos-group-llc/">APROPOS Group LLC</a></div></div><p class="legal">© 2026 APROPOS Group LLC. APROPOS is an independent private company and is not affiliated with or endorsed by any government agency. Verify authoritative government opportunity requirements with the issuing organization.</p></div></footer></body></html>`;
fs.writeFileSync(pageFile, page, 'utf8');

// Append the agency property to the sitemap created by apply-seo-production.
const sitemapFile = path.join(root, 'sitemap.xml');
if (fs.existsSync(sitemapFile)) {
  let sitemap = fs.readFileSync(sitemapFile, 'utf8');
  if (!sitemap.includes(canonical)) {
    const lastmod = new Date().toISOString().slice(0, 10);
    const entry = `  <url>\n    <loc>${canonical}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    sitemap = sitemap.replace('</urlset>', `${entry}</urlset>`);
    fs.writeFileSync(sitemapFile, sitemap, 'utf8');
  }
}

console.log('[gcp-marketplace] PASS — Government Contract Portal agency property added to Marketplace homepage, resource library, deep-dive route, structured data, and sitemap.');
