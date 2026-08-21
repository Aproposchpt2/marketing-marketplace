'use strict';

const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

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

if (!html.includes('"price":"79.00"')) throw new Error('Marketplace entity remediation: Analyze Fit $79 structured price missing.');
if (!html.includes(marketplaceId) || !html.includes(corporateId)) throw new Error('Marketplace entity remediation: entity IDs missing.');

fs.writeFileSync(file, html, 'utf8');
console.log('[marketplace-entity-graph] PASS — Marketplace is linked to the corporate APROPOS entity.');
