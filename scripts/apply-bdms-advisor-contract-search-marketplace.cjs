'use strict';

const fs = require('fs');

const homepage = 'index.html';
const sitemap = 'sitemap.xml';
const pagePath = 'business-development-management-system/index.html';
const live = 'https://bdms.aproposgroupllc.com/';
const learn = '/business-development-management-system/';

if (!fs.existsSync(pagePath)) throw new Error('[bdms-marketplace] BDMS Marketplace page is missing');
if (!fs.existsSync(homepage)) throw new Error('[bdms-marketplace] Marketplace homepage is missing');

let html = fs.readFileSync(homepage, 'utf8');

const card = `
      <article class="amm-card amm-card-featured" data-property="bdms-advisor-contract-search">
        <div class="amm-card-tag">Business Development Management</div>
        <h3>Advisor Contract Search Portal</h3>
        <p>The first completed module of the Business Development Management System, developed for Business Development Agencies and Advisors to research Los Angeles County public-sector opportunities and nationwide Federal Government opportunities from one environment.</p>
        <div class="amm-card-meta">Professional Agency License · $149/month · up to 5 users</div>
        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="${live}">Visit Advisor Contract Search Portal</a><a class="amm-btn amm-btn-outline" href="${learn}">Learn More</a></div>
      </article>`;

if (!html.includes('data-property="bdms-advisor-contract-search"')) {
  const insertionMarkers = [
    '<article class="amm-card">\n        <div class="amm-card-tag">Business Automation</div>',
    '<article class="amm-card amm-card-featured">\n        <div class="amm-card-tag">Business Automation</div>'
  ];
  let inserted = false;
  for (const marker of insertionMarkers) {
    const index = html.indexOf(marker);
    if (index >= 0) {
      html = html.slice(0,index) + card + '\n      ' + html.slice(index);
      inserted = true;
      break;
    }
  }
  if (!inserted) throw new Error('[bdms-marketplace] Could not locate production ecosystem insertion point');
}

if (!html.includes('href="/business-development-management-system/"')) {
  const resourceMarker = '<a class="amm-resource" href="/government-contract-intelligence/">Government Contract Intelligence <span>→</span></a>';
  if (html.includes(resourceMarker)) {
    html = html.replace(resourceMarker, `<a class="amm-resource" href="/business-development-management-system/">Business Development Management System <span>→</span></a>\n      ${resourceMarker}`);
  }
}

fs.writeFileSync(homepage, html, 'utf8');

if (fs.existsSync(sitemap)) {
  let xml = fs.readFileSync(sitemap, 'utf8');
  const loc = 'https://marketplace.aproposgroupllc.com/business-development-management-system/';
  if (!xml.includes(loc)) {
    const entry = `  <url>\n    <loc>${loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    xml = xml.replace('</urlset>', `${entry}</urlset>`);
    fs.writeFileSync(sitemap, xml, 'utf8');
  }
}

console.log('[bdms-marketplace] PASS — Advisor Contract Search Portal page, Marketplace discovery card, resource link, and sitemap entry applied.');