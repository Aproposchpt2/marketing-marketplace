'use strict';

const fs = require('fs');

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

const BRAND = 'APROPOS Business Intelligence Marketplace';
const BRAND_UPPER = 'APROPOS BUSINESS INTELLIGENCE MARKETPLACE';
const TAGLINE = 'Business Development Management Systems • AI-Powered Communications • Business Intelligence System Development';
const META_DESCRIPTION = 'Explore APROPOS business intelligence systems, including the Business Development Management System, AI4 Contact Center, and custom business intelligence system development.';

function replaceRequired(pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`[business-intelligence-rebrand] missing ${label}`);
  html = html.replace(pattern, replacement);
}

function setMeta(selectorPattern, replacement, label) {
  replaceRequired(selectorPattern, replacement, label);
}

// Corporate/site identity.
html = html
  .replaceAll('APROPOS Marketing Marketplace', BRAND)
  .replaceAll('APROPOS MARKETING MARKETPLACE', BRAND_UPPER)
  .replaceAll('APROPOS Government Contract Marketplace', BRAND)
  .replaceAll('Government Contract Marketplace &amp; Business Opportunities | APROPOS', `${BRAND} | APROPOS Group LLC`)
  .replaceAll('Government Contract Marketplace | APROPOS Group LLC', `${BRAND} | APROPOS Group LLC`);

// Homepage hero — current market position.
replaceRequired(/<div class="hero-eyebrow">[\s\S]*?<\/div>/, '<div class="hero-eyebrow">APROPOS GROUP LLC &middot; BUSINESS INTELLIGENCE SYSTEM DEVELOPMENT</div>', 'hero eyebrow');
replaceRequired(/<h1 class="hero-title">[\s\S]*?<\/h1>/, `<h1 class="hero-title">${BRAND_UPPER}</h1>`, 'hero headline');
replaceRequired(/<p class="marketplace-positioning-correction">[\s\S]*?<\/p>/, '<p class="marketplace-positioning-correction">Apropos Group LLC develops practical business intelligence systems that improve business development, communications, opportunity access, and operational workflow.</p>', 'hero positioning statement');
replaceRequired(/<div class="hero-subtitle">[\s\S]*?<\/div>/, `<div class="hero-subtitle">${TAGLINE}</div>`, 'hero subtitle');
replaceRequired(/<p class="hero-copy">[\s\S]*?<\/p>/, '<p class="hero-copy">Our current flagship platforms are the Business Development Management System (BDMS), including the Advisor Contract Search Portal, and AI4 Contact Center. We also develop custom business intelligence systems around real operational needs.</p>', 'hero copy');

// Make the first product section reflect what APROPOS is actively marketing now.
const primarySection = `
<section class="amm-band amm-band-soft" id="ecosystem">
  <div class="amm-shell">
    <div class="amm-kicker">APROPOS Business Intelligence Systems</div>
    <h2 class="amm-title">Purpose-built systems for <em>real business operations.</em></h2>
    <p class="amm-lead">APROPOS Group LLC designs and operates focused technology platforms that solve specific business-development, communications, and workflow problems without forcing organizations to replace the systems they already rely on.</p>
    <div class="amm-grid">
      <article class="amm-card amm-card-featured">
        <div class="amm-card-tag">Business Development Management</div>
        <h3>Business Development Management System</h3>
        <p>Advisor-centered business-development technology. The Advisor Contract Search Portal gives Business Development Advisors a centralized environment for researching public-sector contracting opportunities across multiple levels of government.</p>
        <div class="amm-card-meta">Professional Advisor platform</div>
        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://bdms.aproposgroupllc.com/">Visit BDMS</a></div>
      </article>
      <article class="amm-card amm-card-featured">
        <div class="amm-card-tag">AI-Powered Communications</div>
        <h3>AI4 Contact Center</h3>
        <p>Intelligent voice management for businesses with high inbound call volume. Keep the existing business number while adding automated answering, routing, information capture, organization, and response workflow.</p>
        <div class="amm-card-meta">Stellar Voice Management</div>
        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://ai4contactcenter.aproposgroupllc.com/">Visit AI4 Contact Center</a></div>
      </article>
      <article class="amm-card amm-card-featured">
        <div class="amm-card-tag">Custom Systems</div>
        <h3>Business Intelligence System Development</h3>
        <p>Custom software, workflow, communications, and intelligence systems designed around a defined operational problem, with disciplined architecture and practical implementation.</p>
        <div class="amm-card-meta">Custom software &amp; systems engineering</div>
        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://aproposgroupllc.com/">Explore APROPOS Group LLC</a></div>
      </article>
    </div>
  </div>
</section>`;
replaceRequired(/<section class="amm-band amm-band-soft" id="ecosystem">[\s\S]*?<\/section>/, primarySection, 'primary ecosystem section');

// Homepage metadata/social identity. Remove the retired graphic that advertised
// contractor matching / proposal-oriented Marketplace positioning.
setMeta(/<title>[\s\S]*?<\/title>/i, `<title>${BRAND} | APROPOS Group LLC</title>`, 'page title');
setMeta(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${META_DESCRIPTION}">`, 'meta description');
setMeta(/<meta\s+property="og:site_name"[^>]*>/i, `<meta property="og:site_name" content="${BRAND}">`, 'Open Graph site name');
setMeta(/<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${BRAND}">`, 'Open Graph title');
setMeta(/<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${META_DESCRIPTION}">`, 'Open Graph description');
setMeta(/<meta\s+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${BRAND}">`, 'Twitter title');
setMeta(/<meta\s+name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${META_DESCRIPTION}">`, 'Twitter description');

// Replace the legacy social thumbnail with a clean, text-only APROPOS brand card.
const socialAsset = 'business-intelligence-marketplace.svg';
const socialUrl = `https://marketplace.aproposgroupllc.com/${socialAsset}`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0A1C3F"/><rect width="12" height="630" fill="#C6A052"/><circle cx="1085" cy="65" r="190" fill="#0D2450"/><text x="72" y="92" fill="#C6A052" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="2">APROPOS GROUP LLC</text><text x="72" y="190" fill="#F5F2E8" font-family="Georgia,serif" font-size="58">APROPOS BUSINESS</text><text x="72" y="258" fill="#F5F2E8" font-family="Georgia,serif" font-size="58">INTELLIGENCE MARKETPLACE</text><line x1="72" y1="302" x2="510" y2="302" stroke="#C6A052" stroke-width="3"/><text x="72" y="366" fill="#DAE2F0" font-family="Arial,sans-serif" font-size="28">Business Development Management Systems</text><text x="72" y="416" fill="#DAE2F0" font-family="Arial,sans-serif" font-size="28">AI-Powered Communications</text><text x="72" y="466" fill="#DAE2F0" font-family="Arial,sans-serif" font-size="28">Business Intelligence System Development</text><text x="72" y="570" fill="#C6A052" font-family="Arial,sans-serif" font-size="23">aproposgroupllc.com</text></svg>`;
fs.writeFileSync(socialAsset, svg, 'utf8');
html = html.replace(/<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${socialUrl}">`);
html = html.replace(/<meta\s+name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${socialUrl}">`);
html = html.replace(/<meta\s+property="og:image:alt"[^>]*>/i, `<meta property="og:image:alt" content="${BRAND} — ${TAGLINE}">`);

// Clean the most visible retired homepage SEO language while retaining the
// educational procurement pages elsewhere in the site.
html = html
  .replaceAll('contractor matching, contract fit analysis, proposal development, business growth, automation, and website services', 'business development management systems, AI-powered communications, and business intelligence system development')
  .replaceAll('government contract intelligence, proposal support, campaigns, and institutional partnership pathways', 'business intelligence systems, business development technology, AI-powered communications, and institutional solutions')
  .replaceAll('government contract intelligence, Analyze Fit services, free trials, proposal support, and partnership opportunities', 'business intelligence systems, Advisor technology, AI-powered communications, and custom system development');

const required = [
  BRAND_UPPER,
  TAGLINE,
  'Business Development Management System',
  'AI4 Contact Center',
  'Business Intelligence System Development',
  'https://bdms.aproposgroupllc.com/',
  'https://ai4contactcenter.aproposgroupllc.com/',
  socialUrl
];
for (const token of required) if (!html.includes(token)) throw new Error(`[business-intelligence-rebrand] validation missing: ${token}`);
if (html.includes('The Government Contract Marketplace')) throw new Error('[business-intelligence-rebrand] retired homepage headline remains');

fs.writeFileSync(file, html, 'utf8');
console.log('[business-intelligence-rebrand] PASS — homepage repositioned as APROPOS Business Intelligence Marketplace');
