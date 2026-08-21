'use strict';

const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

// Analyze Fit has one authoritative one-time price across APROPOS.
// Normalize legacy and shorthand visible values before validating the final build.
html = html.replace(/\$(?:15(?:\.00)?|49\.99|79)(?=\s*one-time)/gi, '$79.00');

const match = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
if (!match) throw new Error('Marketplace entity remediation: JSON-LD block not found.');

const data = JSON.parse(match[1]);
const graph = Array.isArray(data['@graph']) ? data['@graph'] : [];
const corporateId = 'https://aproposgroupllc.com/#organization';
const marketplaceId = 'https://marketplace.aproposgroupllc.com/#organization';
const websiteId = 'https://marketplace.aproposgroupllc.com/#website';

if (!graph.some(node => node && node['@id'] === corporateId)) {
  graph.unshift({ '@type': 'Organization', '@id': corporateId, name: 'APROPOS Group LLC', url: 'https://aproposgroupllc.com/' });
}

let marketplace = graph.find(node => node && node['@id'] === marketplaceId);
if (!marketplace) {
  marketplace = {
    '@type': 'Organization',
    '@id': marketplaceId,
    name: 'APROPOS Marketing Marketplace',
    alternateName: 'APROPOS Government Contract Marketplace',
    url: 'https://marketplace.aproposgroupllc.com/',
    parentOrganization: { '@id': corporateId }
  };
  graph.splice(1, 0, marketplace);
} else {
  marketplace.parentOrganization = { '@id': corporateId };
}

const website = graph.find(node => node && node['@id'] === websiteId);
if (!website) throw new Error('Marketplace entity remediation: WebSite node not found.');
website.publisher = { '@id': marketplaceId };

const webpage = graph.find(node => node && node['@id'] === 'https://marketplace.aproposgroupllc.com/#webpage');
if (webpage) webpage.publisher = { '@id': marketplaceId };

data['@graph'] = graph;
const replacement = `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
html = html.replace(match[0], replacement);

// Phase 2B performance: the hero was embedded as a base64 WebP in CSS, which
// inflated the HTML and prevented independent image prioritization/caching.
const beforeBytes = Buffer.byteLength(html, 'utf8');
const embeddedHeroes = [...html.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g)];
if (embeddedHeroes.length !== 1) {
  throw new Error(`Marketplace performance remediation: expected exactly one embedded WebP hero, found ${embeddedHeroes.length}.`);
}
const embeddedHero = embeddedHeroes[0];
const heroBytes = Buffer.from(embeddedHero[1], 'base64');
if (heroBytes.length < 50000) throw new Error('Marketplace performance remediation: embedded hero payload is unexpectedly small.');
const heroFile = 'hero-marketplace.webp';
const heroHref = `/${heroFile}`;
fs.writeFileSync(heroFile, heroBytes);
html = html.replace(embeddedHero[0], heroHref);

const heroPreload = `<link rel="preload" as="image" href="${heroHref}" type="image/webp" fetchpriority="high">`;
if (!html.includes(heroPreload)) {
  if (!/<\/head>/i.test(html)) throw new Error('Marketplace performance remediation: closing head tag not found.');
  html = html.replace(/<\/head>/i, `${heroPreload}\n</head>`);
}

const afterBytes = Buffer.byteLength(html, 'utf8');
const failures = [];
if (!html.includes('"price":"79.00"')) failures.push('Analyze Fit $79.00 structured price missing');
if (!html.includes('$79.00 one-time')) failures.push('Analyze Fit $79.00 visible price missing');
if (!html.includes(marketplaceId) || !html.includes(corporateId)) failures.push('canonical entity IDs missing');
if (html.includes('"price":"15.00"') || html.includes('"price":"49.99"')) failures.push('legacy Analyze Fit structured price remains');
if (/\$(?:15(?:\.00)?|49\.99|79)(?=\s*one-time)/i.test(html)) failures.push('legacy or shorthand Analyze Fit visible price remains');
if (html.includes('https://ngcc.aproposgroupllc.com')) failures.push('former NGCC primary domain remains on Marketplace homepage');
if (html.includes('National Government Contract Center')) failures.push('former federal portal primary name remains on Marketplace homepage');
if (html.includes('data:image/webp;base64')) failures.push('embedded WebP hero remains in homepage HTML');
if (!html.includes(heroPreload)) failures.push('hero preload missing');
if (!fs.existsSync(heroFile) || fs.statSync(heroFile).size !== heroBytes.length) failures.push('external hero file missing or incomplete');
if (afterBytes >= beforeBytes) failures.push('homepage HTML did not shrink after hero extraction');
if (afterBytes > 180000) failures.push(`homepage HTML remains unexpectedly large after hero extraction (${afterBytes} bytes)`);

if (failures.length) {
  console.error('[marketplace-entity-graph] Validation failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

fs.writeFileSync(file, html, 'utf8');
console.log(`[marketplace-entity-graph] PASS — entity graph, $79.00 pricing, and hero delivery optimized. HTML ${beforeBytes} -> ${afterBytes} bytes; hero ${heroBytes.length} bytes externalized.`);
require('./apply-nonblocking-fonts.cjs');
