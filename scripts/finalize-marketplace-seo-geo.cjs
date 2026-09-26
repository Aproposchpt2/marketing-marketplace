'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://marketplace.aproposgroupllc.com';
const sitemapFile = path.join(ROOT, 'sitemap.xml');
const robotsFile = path.join(ROOT, 'robots.txt');
const lastmod = new Date().toISOString().slice(0,10);

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

function routeFile(route) {
  if (route === '/') return path.join(ROOT, 'index.html');
  if (route === '/articles/') return path.join(ROOT, 'articles', 'index.html');
  return path.join(ROOT, route.replace(/^\//,'').replace(/\/$/,''), 'index.html');
}

if (!fs.existsSync(sitemapFile)) throw new Error('[marketplace-seo-geo-final] sitemap.xml missing');

let sitemap = fs.readFileSync(sitemapFile,'utf8');
if (!/<urlset\b/.test(sitemap) || !/<\/urlset>/.test(sitemap)) {
  throw new Error('[marketplace-seo-geo-final] invalid sitemap root');
}

const articleDir = path.join(ROOT,'articles');
if (fs.existsSync(articleDir)) {
  for (const entry of fs.readdirSync(articleDir,{withFileTypes:true})) {
    if (!entry.isDirectory() || entry.name === 'content') continue;
    const file = path.join(articleDir,entry.name,'index.html');
    if (fs.existsSync(file)) publicRoutes.push('/articles/' + entry.name + '/');
  }
}

const uniqueRoutes = [...new Set(publicRoutes)];
for (const route of uniqueRoutes) {
  const file = route.startsWith('/articles/') && route !== '/articles/'
    ? path.join(ROOT, route.replace(/^\//,'').replace(/\/$/,''), 'index.html')
    : routeFile(route);
  if (!fs.existsSync(file)) continue;
  const canonical = SITE + route;
  if (!sitemap.includes('<loc>' + canonical + '</loc>')) {
    const priority = route === '/' ? '1.0' : route === '/articles/' ? '0.9' : '0.8';
    const changefreq = route === '/' || route === '/articles/' ? 'weekly' : 'monthly';
    const entry = '  <url>\n    <loc>' + canonical + '</loc>\n    <lastmod>' + lastmod + '</lastmod>\n    <changefreq>' + changefreq + '</changefreq>\n    <priority>' + priority + '</priority>\n  </url>\n';
    sitemap = sitemap.replace('</urlset>', entry + '</urlset>');
  }
}

const seen = new Set();
sitemap = sitemap.replace(/\s*<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g, (block,loc) => {
  const key = loc.trim();
  if (seen.has(key)) return '';
  seen.add(key);
  return '\n' + block.trim();
});
sitemap = sitemap.replace(/\s*<\/urlset>/,'\n</urlset>\n');
fs.writeFileSync(sitemapFile,sitemap,'utf8');

const robots = 'User-agent: *\nAllow: /\n\nSitemap: ' + SITE + '/sitemap.xml\n';
fs.writeFileSync(robotsFile,robots,'utf8');

console.log('[marketplace-seo-geo-final] PASS — final public-route sitemap ownership and robots pointer enforced for ' + seen.size + ' URLs.');
