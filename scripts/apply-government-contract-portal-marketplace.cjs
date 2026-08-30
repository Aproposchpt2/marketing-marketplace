'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const homeFile = path.join(root, 'index.html');
const pageDir = path.join(root, 'government-contract-portal');
const pageFile = path.join(pageDir, 'index.html');
const sitemapFile = path.join(root, 'sitemap.xml');

const origin = 'https://marketplace.aproposgroupllc.com';
const live = 'https://acb.aproposgroupllc.com/';
const evaluation = 'https://acb.aproposgroupllc.com/agency-login.html';
const canonical = `${origin}/government-contract-portal/`;
const seoTitle = 'Government Contract Portal for Business Development Agencies | APROPOS';
const seoDescription = 'Government Contract Portal helps Business Development Agencies and Advisors identify public contract opportunities aligned with the capabilities of the businesses they serve.';

if (!fs.existsSync(homeFile)) throw new Error('[gcp-marketplace] index.html not found');
let home = fs.readFileSync(homeFile, 'utf8');

// ---------------------------------------------------------------------------
// Marketplace production-property card.
// This runs after the production-suite generator so the property survives
// every build without hand-editing generated index.html.
// ---------------------------------------------------------------------------
const ecosystemAnchor = `      <article class="amm-card">\n        <div class="amm-card-tag">Business Automation</div>`;
const gcpCard = `      <article class="amm-card amm-card-featured" data-property="government-contract-portal">\n        <div class="amm-card-tag">Agency Procurement Intelligence</div>\n        <h3>Government Contract Portal</h3>\n        <p>A contract-opportunity intelligence platform developed for Business Development Agencies and the Advisors who serve their business communities.</p>\n        <p>Help Advisors identify opportunities aligned with a client’s business capabilities and bring those opportunities directly into the advisory relationship — without spending valuable time searching fragmented procurement sources.</p>\n        <div class="amm-card-meta">30-DAY AGENCY EVALUATION</div>\n        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="${live}">Explore Government Contract Portal</a><a class="amm-btn amm-btn-outline" href="/government-contract-portal/">Learn More</a></div>\n      </article>\n`;
if (!home.includes('data-property="government-contract-portal"')) {
  if (!home.includes(ecosystemAnchor)) throw new Error('[gcp-marketplace] ecosystem insertion anchor not found');
  home = home.replace(ecosystemAnchor, gcpCard + ecosystemAnchor);
}

home = home.replace(
  'Explore the production platform that matches your business need — federal contracting, state and local procurement, business development, workflow automation, or website creation.',
  'Explore the production platform that matches the need — agency procurement intelligence, federal contracting, state and local procurement, business development, workflow automation, or website creation.'
);

// ---------------------------------------------------------------------------
// Institutional positioning section on the Marketplace homepage.
// ---------------------------------------------------------------------------
const businessGrowthAnchor = '<section class="amm-band" id="business-growth">';
const agencySection = `<section class="amm-band" id="agency-procurement-intelligence">\n  <div class="amm-shell amm-trust">\n    <div>\n      <div class="amm-kicker">Agency Procurement Intelligence</div>\n      <h2 class="amm-title">Less time searching. <em>More time advising.</em></h2>\n      <p class="amm-lead">The Government Contract Portal was developed specifically for Business Development Agencies and the Advisors who help businesses prepare, grow, and pursue opportunity. It allows an Advisor to identify an opportunity that aligns with a client’s business capabilities and bring that opportunity directly into the advisory relationship — without spending valuable time searching a fragmented procurement landscape.</p>\n      <div class="amm-actions" style="margin-top:28px"><a class="amm-btn amm-btn-primary" href="${live}">Explore Government Contract Portal</a><a class="amm-btn amm-btn-outline" href="/government-contract-portal/">Learn More</a></div>\n    </div>\n    <aside class="amm-trust-panel"><strong>Agency → Advisor → Business</strong><p><b>For the Agency:</b> add another valuable service to the support already provided to the business community. <b>For the Advisor:</b> spend less time searching fragmented procurement sources and more time advising businesses. <b>For the Business:</b> gain greater access to contract opportunities aligned with what the business is capable of providing.</p></aside>\n  </div>\n</section>\n\n`;
if (!home.includes('id="agency-procurement-intelligence"')) {
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
if (!home.includes(`<a href="${live}">Government Contract Portal</a>`)) {
  if (!home.includes(footerAnchor)) throw new Error('[gcp-marketplace] footer insertion anchor not found');
  home = home.replace(footerAnchor, `<a href="${live}">Government Contract Portal</a>\n        ` + footerAnchor);
}

// Add Government Contract Portal to homepage structured data after the core
// SEO generator has run, preserving its existing Organization/WebSite graph.
const jsonLdPattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
const match = home.match(jsonLdPattern);
if (!match) throw new Error('[gcp-marketplace] homepage JSON-LD not found');
try {
  const schema = JSON.parse(match[1]);
  const graph = Array.isArray(schema['@graph']) ? schema['@graph'] : [];
  const list = graph.find(node => node && node['@type'] === 'ItemList');
  if (!list || !Array.isArray(list.itemListElement)) throw new Error('Marketplace ItemList not found');
  if (!list.itemListElement.some(item => item && item.url === canonical)) {
    list.itemListElement.push({ '@type': 'ListItem', position: list.itemListElement.length + 1, name: 'Government Contract Portal', url: canonical });
  }
  list.itemListElement.forEach((item, index) => { item.position = index + 1; });
  list.numberOfItems = list.itemListElement.length;
  if (!graph.some(node => node && node['@type'] === 'Service' && node.name === 'Government Contract Portal')) {
    graph.push({
      '@type': 'Service',
      name: 'Government Contract Portal',
      serviceType: 'Agency procurement intelligence',
      url: canonical,
      provider: { '@id': 'https://aproposgroupllc.com/#organization' },
      audience: { '@type': 'Audience', audienceType: 'Business Development Agencies and business Advisors' },
      description: seoDescription
    });
  }
  home = home.replace(jsonLdPattern, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
} catch (error) {
  throw new Error(`[gcp-marketplace] homepage JSON-LD update failed: ${error.message}`);
}

fs.writeFileSync(homeFile, home, 'utf8');

// ---------------------------------------------------------------------------
// Dedicated institutional deep-dive page.
// ---------------------------------------------------------------------------
fs.mkdirSync(pageDir, { recursive: true });
const pageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': 'https://aproposgroupllc.com/#organization', name: 'APROPOS Group LLC', url: 'https://aproposgroupllc.com/' },
    { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: seoTitle, description: seoDescription, publisher: { '@id': 'https://aproposgroupllc.com/#organization' } },
    {
      '@type': 'Service',
      name: 'Government Contract Portal',
      serviceType: 'Agency procurement intelligence',
      url: canonical,
      provider: { '@id': 'https://aproposgroupllc.com/#organization' },
      audience: { '@type': 'Audience', audienceType: 'Business Development Agencies and business Advisors' },
      description: seoDescription
    },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'APROPOS Marketing Marketplace', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: 'Government Contract Portal', item: canonical }
    ] }
  ]
};

const page = `<!doctype html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-FGJG583DTL"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FGJG583DTL');</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${seoTitle}</title>
<meta name="description" content="${seoDescription}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="APROPOS Marketing Marketplace">
<meta property="og:title" content="${seoTitle}">
<meta property="og:description" content="${seoDescription}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${origin}/og-marketplace.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${seoTitle}">
<meta name="twitter:description" content="${seoDescription}">
<meta name="twitter:image" content="${origin}/og-marketplace.jpg">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="/landing-pages.css">
<script type="application/ld+json">${JSON.stringify(pageSchema)}</script>
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>
<nav class="site-nav" aria-label="Primary">
  <a class="brand" href="/"><span class="mark">AMM</span><span class="brand-name">APROPOS Marketing Marketplace<small>APROPOS GROUP LLC</small></span></a>
  <div class="nav-links"><a href="/#ecosystem">Production Sites</a><a href="/government-contract-intelligence/">Procurement</a><a href="/procurement-partnerships/">Institutional</a><a href="/apropos-group-llc/">Corporate</a></div>
</nav>
<main id="main">
<header class="hero">
  <div class="wrap">
    <div class="breadcrumbs"><a href="/">Marketplace</a> / Government Contract Portal</div>
    <div class="eyebrow">APROPOS GROUP LLC · AGENCY PROCUREMENT INTELLIGENCE</div>
    <h1>LESS TIME SEARCHING.<br>MORE TIME ADVISING.</h1>
    <p class="lead">Give your Advisors a dedicated environment for identifying government contract opportunities aligned with the capabilities of the businesses they serve.</p>
    <div class="stat-row"><span class="stat">Agency → Advisor → Business</span><span class="stat">Federal + State / Local</span><span class="stat">30-Day Agency Evaluation</span></div>
  </div>
</header>

<section>
  <div class="wrap section-grid">
    <div>
      <div class="gold-rule"></div><div class="eyebrow">Government Contract Portal</div>
      <h2>Procurement intelligence developed for the advisory relationship.</h2>
      <p>The Government Contract Portal was developed specifically for Business Development Agencies and the Advisors who serve their business communities.</p>
      <p>Government contracting opportunities are distributed across numerous agencies, jurisdictions, procurement platforms, and publisher systems. The Government Contract Portal reduces that search burden.</p>
      <p>It helps an Advisor identify an opportunity aligned with a client’s business capabilities and bring that opportunity directly into the advisory relationship.</p>
    </div>
    <aside class="card pathway">
      <h3>30-Day Agency Evaluation</h3>
      <p>Evaluate the Government Contract Portal with your Advisors and determine how it can complement the business-development services your organization already provides. Additional evaluation time may be requested when needed.</p>
      <a class="btn" href="${evaluation}">Begin Agency Evaluation</a>
      <p class="notice"><strong>Evaluation access code:</strong> AGENCY30</p>
    </aside>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="gold-rule"></div><div class="eyebrow">Advisor Experience</div>
    <h2>BUILT AROUND THE ADVISORY RELATIONSHIP</h2>
    <div class="service-grid">
      <article class="card"><h3>The Portal searches.</h3><p>Opportunity discovery reduces the time an Advisor must spend navigating fragmented procurement sources.</p></article>
      <article class="card"><h3>The Contract Brief explains.</h3><p>Extracted opportunity intelligence organizes the work, important requirements, timing, match context, and items requiring confirmation.</p></article>
      <article class="card"><h3>The Advisor advises.</h3><p>The opportunity is brought directly into the Advisor and client discussion so the business can understand what deserves attention.</p></article>
      <article class="card"><h3>The business decides.</h3><p>The contractor remains responsible for deciding whether to pursue the opportunity and for verifying the official procurement requirements.</p></article>
    </div>
    <div class="service-note"><strong>Advisor workflow:</strong> BUSINESS CAPABILITY PROFILE → CONTRACT OPPORTUNITY DISCOVERY → OPPORTUNITY MATCHING → CONTRACT BRIEF → ADVISOR + CLIENT DISCUSSION → AUTHORITATIVE PROCUREMENT SOURCE</div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="gold-rule"></div><div class="eyebrow">Current Capabilities</div>
    <h2>Opportunity intelligence that supports the Advisor and the business.</h2>
    <div class="service-grid">
      <article class="card"><h3>Agency-assisted business intake</h3><p>An Advisor can bring a client business into the Portal through the agency access workflow.</p></article>
      <article class="card"><h3>Business Capability Profiles</h3><p>The business profile can be developed from evidence on the business’s official website or through Advisor-assisted intake.</p></article>
      <article class="card"><h3>Federal + State / Local discovery</h3><p>The Portal supports federal opportunity discovery and state/local opportunity discovery through the applicable public procurement pathways.</p></article>
      <article class="card"><h3>Requirement extraction</h3><p>Available contract requirements are extracted so matching can consider more than a solicitation title alone.</p></article>
      <article class="card"><h3>Capability-to-contract matching</h3><p>Opportunity Match Scores and match explanations help Advisors understand why an opportunity appears aligned with the business profile.</p></article>
      <article class="card"><h3>Contract Briefs</h3><p>Contract Briefs surface important requirements, deadline awareness, and items such as licenses, insurance, bonding, certifications, or registration that the contractor may need to confirm.</p></article>
      <article class="card"><h3>Advisor/client discussions</h3><p>The Portal is structured to bring an opportunity into the advisory relationship rather than end the process at discovery.</p></article>
      <article class="card"><h3>Authoritative publisher links</h3><p>Each opportunity routes the Advisor or contractor to the authoritative procurement source for official documents and actions.</p></article>
      <article class="card"><h3>Agency Evaluation access</h3><p>Business Development Agencies can evaluate the Portal with their Advisors through the approved 30-Day Agency Evaluation pathway.</p></article>
    </div>
  </div>
</section>

<section>
  <div class="wrap section-grid">
    <div>
      <div class="gold-rule"></div><div class="eyebrow">Federal + State / Local</div>
      <h2>One advisory environment. Distinct procurement authorities.</h2>
      <p><strong>Registered Federal Contractors:</strong> Federal opportunity inventory is sourced through the applicable federal procurement pathway, including SAM.gov.</p>
      <p><strong>Licensed Businesses:</strong> State and local opportunity inventory is discovered through validated public procurement sources. Source families can include public procurement platforms and agency-operated procurement pages.</p>
      <p>The Marketplace does not imply a formal API partnership or publisher relationship. Each issuing agency and procurement publisher remains independent and authoritative for its solicitation.</p>
    </div>
    <aside class="card">
      <h3>The authoritative source remains controlling.</h3>
      <ul class="feature-list">
        <li>Complete solicitation documents</li>
        <li>Amendments</li>
        <li>Vendor registration</li>
        <li>Submission requirements</li>
        <li>Official deadlines</li>
        <li>Bid submission</li>
      </ul>
    </aside>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="gold-rule"></div><div class="eyebrow">Three-Way Value</div>
    <h2>Agency → Advisor → Business</h2>
    <div class="service-grid">
      <article class="card"><h3>FOR THE AGENCY</h3><p>Add another valuable service to the support already provided to the business community.</p></article>
      <article class="card"><h3>FOR THE ADVISOR</h3><p>Spend less time searching fragmented procurement sources and more time advising businesses.</p></article>
      <article class="card"><h3>FOR THE BUSINESS</h3><p>Gain greater access to contract opportunities aligned with what the business is capable of providing.</p></article>
    </div>
  </div>
</section>

<section>
  <div class="wrap section-grid">
    <div>
      <div class="gold-rule"></div><div class="eyebrow">Product Boundary</div>
      <h2>Information, context, and a clearer path to the official source.</h2>
      <p><strong>THE PORTAL INFORMS.</strong></p>
      <p><strong>THE AUTHORITATIVE SOURCE ESTABLISHES THE OFFICIAL PROCUREMENT REQUIREMENTS.</strong></p>
      <p><strong>THE ADVISOR HELPS THE BUSINESS UNDERSTAND THE OPPORTUNITY.</strong></p>
      <p><strong>THE CONTRACTOR DECIDES WHETHER TO PURSUE.</strong></p>
    </div>
    <aside class="card"><h3>Independent APROPOS property</h3><p>The Government Contract Portal is operated by APROPOS Group LLC. It is not a government agency and does not replace SAM.gov, an issuing agency, an originating procurement portal, or the official solicitation. Eligibility, responsiveness, business growth, selection, and contract award are not guaranteed.</p></aside>
  </div>
</section>

<section class="cta-band">
  <div class="wrap">
    <div class="eyebrow">30-Day Agency Evaluation</div>
    <h2>Evaluate the Portal with your Advisors.</h2>
    <p>Determine how the Government Contract Portal can complement the business-development services your organization already provides.</p>
    <a class="btn" href="${evaluation}">Begin Agency Evaluation →</a>
    <a class="btn secondary" href="${live}">Explore Government Contract Portal →</a>
    <p class="notice">Additional evaluation time may be requested when needed. Permanent Agency Licensing pricing is not published on this Marketplace page.</p>
  </div>
</section>
</main>
<footer class="site-footer">
  <div class="wrap"><div class="footer-grid"><div><span class="mark">AMM</span><h3>APROPOS Marketing Marketplace</h3><p>Public marketing, service discovery, and routing for the APROPOS Group LLC ecosystem.</p></div><div class="footer-links"><a href="/government-contract-portal/">Government Contract Portal</a><a href="/registered-federal-contractors-portal/">Federal Contractors Portal</a><a href="/nat-corp-contract-exchange/">NAT-CORP</a><a href="/national-enterprise-business-center/">NEBC</a><a href="/procurement-partnerships/">Institutional</a><a href="/apropos-group-llc/">APROPOS Group LLC</a></div></div><p class="legal">© 2026 APROPOS Group LLC. APROPOS is an independent private company and is not affiliated with or endorsed by any government agency. Verify authoritative government opportunity requirements with the issuing organization.</p></div>
</footer>
</body>
</html>`;

fs.writeFileSync(pageFile, page, 'utf8');

// Add the route after the core SEO generator and article generator have run,
// preserving all existing sitemap entries.
if (!fs.existsSync(sitemapFile)) throw new Error('[gcp-marketplace] sitemap.xml not found');
let sitemap = fs.readFileSync(sitemapFile, 'utf8');
if (!sitemap.includes(canonical)) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const entry = `  <url>\n    <loc>${canonical}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  sitemap = sitemap.replace('</urlset>', `${entry}</urlset>`);
  fs.writeFileSync(sitemapFile, sitemap, 'utf8');
}

console.log('[gcp-marketplace] PASS — Government Contract Portal added as an institutional Marketplace property with approved Agency Evaluation routing, structured data, and sitemap coverage.');
