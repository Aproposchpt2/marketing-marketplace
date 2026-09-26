'use strict';

const fs = require('fs');

const failures = [];
const html = fs.readFileSync('index.html', 'utf8');
const robots = fs.existsSync('robots.txt') ? fs.readFileSync('robots.txt', 'utf8') : '';
const sitemap = fs.existsSync('sitemap.xml') ? fs.readFileSync('sitemap.xml', 'utf8') : '';

function requireText(value, label) {
  if (!html.includes(value)) failures.push(`missing ${label}: ${value}`);
}

function forbidText(value, label) {
  if (html.includes(value)) failures.push(`retired ${label} remains: ${value}`);
}

// Responsive/presentation gate.
requireText('APROPOS_MARKETPLACE_PRODUCTION_SUITE_START', 'production suite responsive CSS');
requireText('width:min(1200px,calc(100% - 48px))', 'desktop max-width shell');
requireText('@media(max-width:1100px)', 'tablet breakpoint');
requireText('@media(max-width:760px)', 'mobile breakpoint');
requireText('@media(max-width:420px)', 'small-mobile breakpoint');
requireText('overflow-x:hidden', 'horizontal overflow protection');
requireText('id="ecosystem"', 'primary systems section');
requireText('id="procurement"', 'procurement section');
requireText('id="business-growth"', 'business growth section');
requireText('id="business-technology"', 'business technology section');
requireText('id="marketplace-resources"', 'resource library section');

// Current business-intelligence properties and corporate authority.
const destinations = [
  'https://bdms.aproposgroupllc.com/',
  'https://ai4contactcenter.aproposgroupllc.com/',
  'https://aproposgroupllc.com/'
];
for (const url of destinations) requireText(url, `production destination ${url}`);
requireText('Business Development Management System', 'BDMS identity');
requireText('Advisor Contract Search Portal', 'Advisor Contract Search Portal identity');
requireText('AI4 Contact Center', 'AI4 Contact Center identity');
requireText('Intelligent Customer Engagement Operation Center', 'AI4 subscribed product identity');
requireText('Business Intelligence System Development', 'system-development identity');

// Existing ecosystem routes can remain available, but retired homepage positioning must not.
forbidText('https://nevadastategen.aproposgroupllc.com', 'Nevada generator domain');
forbidText('https://calstategen.aproposgroupllc.com', 'California generator domain');
forbidText('https://cdc.aproposgroupllc.com', 'retired Contract Development Center domain');
forbidText('Contract Development Center', 'retired Contract Development Center label');
forbidText('The Government Contract Marketplace', 'retired homepage headline');
forbidText('Where government contracts', 'retired homepage supporting message');
forbidText("Whether you're a startup", 'retired startup hero message');
forbidText('<small>GOVERNMENT CONTRACT MARKETPLACE</small>', 'retired header identity');
forbidText('Business Development Management Systems • AI-Powered Communications • Business Intelligence System Development', 'retired AI-Powered Communications hero supporting message');

// Approved current hero identity.
requireText('<section class="hero" id="top">', 'approved hero section');
requireText('APROPOS BUSINESS INTELLIGENCE MARKETPLACE', 'approved hero headline');
requireText('Business Development Management Systems • Intelligent Customer Engagement • Business Intelligence System Development', 'approved hero supporting message');

// SEO/social integrity gate.
requireText('<meta name="viewport" content="width=device-width,initial-scale=1.0"', 'viewport metadata');
requireText('<link rel="canonical" href="https://marketplace.aproposgroupllc.com/">', 'homepage canonical');
requireText('<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">', 'indexable robots metadata');
requireText('<meta property="og:type" content="website">', 'Open Graph metadata');
requireText('<meta property="og:site_name" content="APROPOS Business Intelligence Marketplace">', 'Open Graph site identity');
requireText('business-intelligence-marketplace.svg', 'current social thumbnail');
requireText('<meta name="twitter:card" content="summary_large_image">', 'Twitter card metadata');
requireText('<script type="application/ld+json">', 'JSON-LD structured data');
requireText('"@type":"WebSite"', 'WebSite structured data');
requireText('"@type":"WebPage"', 'WebPage structured data');
requireText('"@type":"ItemList"', 'ItemList structured data');

if (!robots.includes('Sitemap: https://marketplace.aproposgroupllc.com/sitemap.xml')) failures.push('robots.txt sitemap declaration missing');
const sitemapRoutes = [
  'https://marketplace.aproposgroupllc.com/',
  'https://marketplace.aproposgroupllc.com/government-contract-intelligence/',
  'https://marketplace.aproposgroupllc.com/federal-contract-opportunities/',
  'https://marketplace.aproposgroupllc.com/state-local-contract-opportunities/',
  'https://marketplace.aproposgroupllc.com/contractor-opportunity-matching/',
  'https://marketplace.aproposgroupllc.com/contract-fit-analysis/',
  'https://marketplace.aproposgroupllc.com/business-contract-readiness/',
  'https://marketplace.aproposgroupllc.com/contractor-participation/',
  'https://marketplace.aproposgroupllc.com/procurement-partnerships/'
];
for (const route of sitemapRoutes) if (!sitemap.includes(route)) failures.push(`sitemap route missing: ${route}`);

// Internal educational resource links remain connected to the homepage.
for (const route of [
  '/government-contract-intelligence/',
  '/federal-contract-opportunities/',
  '/state-local-contract-opportunities/',
  '/contractor-opportunity-matching/',
  '/contract-fit-analysis/',
  '/business-contract-readiness/',
  '/contractor-participation/',
  '/procurement-partnerships/',
  '/government-proposal-development/'
]) requireText(`href="${route}"`, `internal SEO link ${route}`);

if (failures.length) {
  console.error('[marketplace-suite-validation] FAIL');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[marketplace-suite-validation] PASS — APROPOS Business Intelligence Marketplace positioning, retired-copy guardrails, responsive presentation, routing, and SEO integrity verified');
