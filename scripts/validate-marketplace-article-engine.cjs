'use strict';

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'articles/index.html',
  'articles/content/README.md',
  'scripts/generate-marketplace-articles.cjs'
];
for (const file of requiredFiles) if (!fs.existsSync(file)) throw new Error(`[articles] required engine file missing: ${file}`);

const index = fs.readFileSync('articles/index.html','utf8');
const homepage = fs.readFileSync('index.html','utf8');
const sitemap = fs.readFileSync('sitemap.xml','utf8');

const requiredIndexTokens = [
  '<link rel="canonical" href="https://marketplace.aproposgroupllc.com/articles/">',
  'Government Contracting Articles',
  'CollectionPage',
  'BreadcrumbList',
  'ItemList',
  'APROPOS Marketing Marketplace Editorial Team',
  'article_cta_click',
  'article_related_click'
];
for (const token of requiredIndexTokens) if (!index.includes(token)) throw new Error(`[articles] article index missing: ${token}`);

if (!homepage.includes('href="/articles/">Learn</a>')) throw new Error('[articles] homepage Learn navigation missing');
if (!sitemap.includes('<loc>https://marketplace.aproposgroupllc.com/articles/</loc>')) throw new Error('[articles] article index missing from sitemap');

const landingPages = ['government-contract-intelligence','federal-contract-opportunities','state-local-contract-opportunities','contractor-opportunity-matching','contract-fit-analysis','business-contract-readiness','contractor-participation','procurement-partnerships'];
for (const route of landingPages) {
  const file = path.join(route,'index.html');
  const page = fs.readFileSync(file,'utf8');
  if (!page.includes('href="/articles/">Learn</a>')) throw new Error(`[articles] Learn navigation missing on ${route}`);
}

const generator = fs.readFileSync('scripts/generate-marketplace-articles.cjs','utf8');
for (const token of ['Article','datePublished','dateModified','BreadcrumbList','canonical','data-article-cta','data-related-article']) {
  if (!generator.includes(token)) throw new Error(`[articles] generator contract missing: ${token}`);
}

if (!homepage.includes('/hero-marketplace.webp')) throw new Error('[articles] locked homepage image artifact missing after article generation');
if (!homepage.includes('rel="preload" as="image" href="/hero-marketplace.webp"')) throw new Error('[articles] locked homepage image preload missing after article generation');

console.log('[articles] validation PASS — index, schema, sitemap, navigation, analytics, and locked-image protections are intact');
