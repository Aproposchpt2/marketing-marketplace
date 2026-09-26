'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://marketplace.aproposgroupllc.com';
const sitemap = fs.readFileSync(path.join(ROOT,'sitemap.xml'),'utf8');
const failures = [];

const publicRoutes = [
  '/',
  '/apropos-business-opportunity-agency/',
  '/government-contract-intelligence/',
  '/federal-contract-opportunities/',
  '/state-local-contract-opportunities/',
  '/contractor-opportunity-matching/',
  '/nat-corp-contract-matching/',
  '/contract-fit-analysis/',
  '/government-proposal-development/',
  '/business-contract-readiness/',
  '/contractor-participation/',
  '/procurement-partnerships/',
  '/registered-federal-contractors-portal/',
  '/nat-corp-contract-exchange/',
  '/national-enterprise-business-center/',
  '/ai4-businesses/',
  '/ai4-contact-center/',
  '/ai4-website-design/',
  '/ai4-website-design-es/',
  '/apropos-group-llc/',
  '/government-contract-portal/',
  '/articles/'
];

const articleDir = path.join(ROOT,'articles');
if (fs.existsSync(articleDir)) {
  for (const entry of fs.readdirSync(articleDir,{withFileTypes:true})) {
    if (!entry.isDirectory() || entry.name === 'content') continue;
    const file = path.join(articleDir,entry.name,'index.html');
    if (fs.existsSync(file)) publicRoutes.push('/articles/' + entry.name + '/');
  }
}

function routeFile(route) {
  if (route === '/') return path.join(ROOT,'index.html');
  return path.join(ROOT,route.replace(/^\//,'').replace(/\/$/,''),'index.html');
}

for (const route of [...new Set(publicRoutes)]) {
  const file = routeFile(route);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file,'utf8');
  const expected = SITE + route;
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)?.[1]
    || html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["'][^>]*>/i)?.[1];
  if (!canonical) failures.push(route + ': canonical missing');
  else if (canonical !== expected) failures.push(route + ': canonical mismatch (' + canonical + ' != ' + expected + ')');

  const robots = html.match(/<meta\s+name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1]
    || html.match(/<meta\s+content=["']([^"']+)["'][^>]*name=["']robots["'][^>]*>/i)?.[1]
    || '';
  if (/noindex/i.test(robots)) failures.push(route + ': public page is noindex');
  if (!sitemap.includes('<loc>' + expected + '</loc>')) failures.push(route + ': sitemap entry missing');
}

const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].trim());
for (const loc of new Set(locs)) {
  if (locs.filter(x=>x===loc).length > 1) failures.push('duplicate sitemap URL: ' + loc);
}

for (const forbidden of [
  '/claim-opportunity.html',
  '/claim-federal-opportunity.html',
  '/federal-opportunity-workspace.html',
  '/opportunity-workspace.html',
  '/opportunity-thank-you.html'
]) {
  if (sitemap.includes(SITE + forbidden)) failures.push('private/transaction route exposed in sitemap: ' + forbidden);
}

const brandPages = [
  'registered-federal-contractors-portal/index.html',
  'articles/index.html',
  'government-contract-portal/index.html',
  'apropos-business-opportunity-agency/index.html',
  'ai4-contact-center/index.html'
];
for (const relative of brandPages) {
  const file=path.join(ROOT,relative);
  if (!fs.existsSync(file)) { failures.push('brand validation file missing: ' + relative); continue; }
  const html=fs.readFileSync(file,'utf8');
  if (!html.includes('APROPOS Business Intelligence Marketplace')) failures.push(relative + ': current Marketplace identity missing');
}

const ai4 = fs.readFileSync(path.join(ROOT,'ai4-contact-center','index.html'),'utf8');
for (const token of [
  'Intelligent Customer Engagement Operation Center',
  'THE INTELLIGENCE LAYER. NOT THE REPLACEMENT LAYER.',
  '8,760',
  'START WITH THE DEPARTMENT. SOLVE THE PRESSURE POINT. PROVE THE VALUE. EXPAND.'
]) {
  if (!ai4.includes(token)) failures.push('AI4 Contact Center page missing approved positioning: ' + token);
}

const aboa = fs.readFileSync(path.join(ROOT,'apropos-business-opportunity-agency','index.html'),'utf8');
if (/\bnonprofit\b/i.test(aboa)) failures.push('ABOA page still contains unsupported nonprofit characterization');
for (const token of [
  'https://aproposgroupllc.com/#organization',
  'https://aproposopportunity.org/#service',
  'APROPOS Business Opportunity Agency | Business Opportunity Service'
]) {
  if (!aboa.includes(token)) failures.push('ABOA entity correction missing: ' + token);
}

const home = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
if (!home.includes('APROPOS BUSINESS INTELLIGENCE MARKETPLACE')) failures.push('homepage current Marketplace identity missing');
if (!home.includes('https://aproposgroupllc.com/#organization')) failures.push('homepage corporate entity relationship missing');
if (!home.includes('href="/ai4-contact-center/"')) failures.push('homepage AI4 card does not route through standalone AI4 Contact Center page');

if (failures.length) {
  console.error('[marketplace-seo-geo-validation] FAIL');
  failures.forEach(f=>console.error(' - ' + f));
  process.exit(1);
}
console.log('[marketplace-seo-geo-validation] PASS — canonical coverage, final sitemap ownership, AI4 product-page positioning, entity consistency, current branding and private-route exclusion verified.');
