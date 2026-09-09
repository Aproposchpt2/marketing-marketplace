'use strict';

const fs = require('fs');

const failures = [];
const pagePath = 'business-development-management-system/index.html';
const homepage = fs.existsSync('index.html') ? fs.readFileSync('index.html','utf8') : '';
const page = fs.existsSync(pagePath) ? fs.readFileSync(pagePath,'utf8') : '';
const sitemap = fs.existsSync('sitemap.xml') ? fs.readFileSync('sitemap.xml','utf8') : '';

function requireIn(value, token, label) {
  if (!value.includes(token)) failures.push(`missing ${label}: ${token}`);
}

if (!page) failures.push('BDMS Marketplace page file is missing');
if (page) {
  requireIn(page, 'Advisor Contract Search Portal', 'product name');
  requireIn(page, 'Business Development Management System', 'BDMS parent identity');
  requireIn(page, '1,000+ active Los Angeles County opportunities', 'Los Angeles County inventory statement');
  requireIn(page, 'Nationwide Federal Government opportunities', 'Federal opportunity statement');
  requireIn(page, '$149 per month', 'Professional Agency License price');
  requireIn(page, 'Up to 5 licensed Agency users', 'five-user license scope');
  requireIn(page, 'https://bdms.aproposgroupllc.com/', 'live BDMS destination');
  requireIn(page, 'Less time searching. More time advising.', 'advisor value proposition');
  requireIn(page, 'not affiliated with or endorsed by any government agency', 'government affiliation disclaimer');
}

requireIn(homepage, 'data-property="bdms-advisor-contract-search"', 'Marketplace BDMS card');
requireIn(homepage, 'href="https://bdms.aproposgroupllc.com/"', 'Marketplace live BDMS destination');
requireIn(homepage, 'href="/business-development-management-system/"', 'Marketplace BDMS deep-dive link');
requireIn(sitemap, 'https://marketplace.aproposgroupllc.com/business-development-management-system/', 'BDMS sitemap URL');

if (failures.length) {
  console.error('[bdms-marketplace-validation] FAIL');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[bdms-marketplace-validation] PASS — BDMS Advisor Contract Search page, Marketplace discovery, live routing, pricing, and sitemap entry verified.');