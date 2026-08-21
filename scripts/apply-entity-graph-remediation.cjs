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

const failures = [];
if (!html.includes('"price":"79.00"')) failures.push('Analyze Fit $79.00 structured price missing');
if (!html.includes('$79.00 one-time')) failures.push('Analyze Fit $79.00 visible price missing');
if (!html.includes(marketplaceId) || !html.includes(corporateId)) failures.push('canonical entity IDs missing');
if (html.includes('"price":"15.00"') || html.includes('"price":"49.99"')) failures.push('legacy Analyze Fit structured price remains');
if (/\$(?:15(?:\.00)?|49\.99|79)(?=\s*one-time)/i.test(html)) failures.push('legacy or shorthand Analyze Fit visible price remains');
if (html.includes('https://ngcc.aproposgroupllc.com')) failures.push('former NGCC primary domain remains on Marketplace homepage');
if (html.includes('National Government Contract Center')) failures.push('former federal portal primary name remains on Marketplace homepage');

if (failures.length) {
  console.error('[marketplace-entity-graph] Validation failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

fs.writeFileSync(file, html, 'utf8');
console.log('[marketplace-entity-graph] PASS — Marketplace entity graph, portal identity, and Analyze Fit $79.00 pricing are consistent.');
