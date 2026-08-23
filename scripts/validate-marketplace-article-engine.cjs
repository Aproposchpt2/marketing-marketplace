'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT,'articles','content');
const SITE = 'https://marketplace.aproposgroupllc.com';
const CORPORATE_ORG = 'https://aproposgroupllc.com/#organization';
const EDITORIAL_TEAM = `${SITE}/#editorial-team`;

const requiredFiles = [
  'articles/index.html',
  'articles/feed.xml',
  'articles/content/README.md',
  'scripts/generate-marketplace-articles.cjs'
];
for (const file of requiredFiles) if (!fs.existsSync(file)) throw new Error(`[articles] required engine file missing: ${file}`);

const content = fs.readdirSync(CONTENT_DIR)
  .filter(name=>name.endsWith('.json'))
  .map(name=>JSON.parse(fs.readFileSync(path.join(CONTENT_DIR,name),'utf8')))
  .filter(article=>article.published!==false);
if (!content.length) throw new Error('[articles] no published article content records found');

const index = fs.readFileSync('articles/index.html','utf8');
const homepage = fs.readFileSync('index.html','utf8');
const sitemap = fs.readFileSync('sitemap.xml','utf8');
const feed = fs.readFileSync('articles/feed.xml','utf8');

const requiredIndexTokens = [
  '<link rel="canonical" href="https://marketplace.aproposgroupllc.com/articles/">',
  'Government Contracting Articles',
  'CollectionPage',
  'BreadcrumbList',
  'ItemList',
  CORPORATE_ORG,
  EDITORIAL_TEAM,
  'article_cta_click',
  'article_related_click',
  'type="application/rss+xml"'
];
for (const token of requiredIndexTokens) if (!index.includes(token)) throw new Error(`[articles] article index missing: ${token}`);

if (!homepage.includes('href="/articles/"')) throw new Error('[articles] homepage article navigation missing');
if (!sitemap.includes(`<loc>${SITE}/articles/</loc>`)) throw new Error('[articles] article index missing from sitemap');
if (!feed.includes('<rss version="2.0">')) throw new Error('[articles] RSS feed root missing');

const failures = [];
for (const article of content) {
  const file = path.join('articles',article.slug,'index.html');
  if (!fs.existsSync(file)) { failures.push(`${article.slug}: generated page missing`); continue; }
  const page = fs.readFileSync(file,'utf8');
  const canonical = `${SITE}/articles/${article.slug}/`;
  const required = [
    `<link rel="canonical" href="${canonical}">`,
    '"@type":"BlogPosting"',
    `"@id":"${canonical}#article"`,
    `"datePublished":"${article.publishedDate}"`,
    `"dateModified":"${article.updatedDate}"`,
    CORPORATE_ORG,
    EDITORIAL_TEAM,
    '"isAccessibleForFree":true',
    'BreadcrumbList',
    'By APROPOS Marketing Marketplace Editorial Team',
    'type="application/rss+xml"'
  ];
  for (const token of required) if (!page.includes(token)) failures.push(`${article.slug}: missing ${token}`);
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) failures.push(`${article.slug}: sitemap entry missing`);
  if (!feed.includes(`<link>${canonical}</link>`)) failures.push(`${article.slug}: RSS item missing`);
  if (article.sources?.length) {
    if (!page.includes('Sources and further reading')) failures.push(`${article.slug}: source section missing`);
    if (!page.includes('Official source material controls')) failures.push(`${article.slug}: source-control disclosure missing`);
    for (const source of article.sources) {
      if (!page.includes(source.url)) failures.push(`${article.slug}: visible source URL missing ${source.url}`);
      if (!page.includes('"citation":[')) failures.push(`${article.slug}: structured citations missing`);
    }
  }
  if (article.pathway?.url && !page.includes(article.pathway.url)) failures.push(`${article.slug}: pathway URL missing`);
  for (const related of article.related || []) if (!page.includes(`/articles/${related}/`)) failures.push(`${article.slug}: related article link missing ${related}`);
  if (page.includes('background:#fff') || page.includes('background:#f8f5ea')) failures.push(`${article.slug}: legacy light article surface remains`);
}

const publicRoutes = [
  'government-contract-intelligence','federal-contract-opportunities','state-local-contract-opportunities','contractor-opportunity-matching','contract-fit-analysis','business-contract-readiness','contractor-participation','procurement-partnerships',
  'registered-federal-contractors-portal','nat-corp-contract-exchange','national-enterprise-business-center','ai4-businesses','ai4-website-design','ai4-website-design-es','apropos-group-llc'
];
for (const route of publicRoutes) {
  const file = path.join(route,'index.html');
  if (!fs.existsSync(file)) continue;
  const page = fs.readFileSync(file,'utf8');
  if (!page.includes('href="/articles/"')) failures.push(`${route}: article navigation missing`);
}

const generator = fs.readFileSync('scripts/generate-marketplace-articles.cjs','utf8');
for (const token of ['BlogPosting','datePublished','dateModified','BreadcrumbList','citation','isAccessibleForFree','data-article-cta','data-related-article','APROPOS Marketing Marketplace Editorial Team','feed.xml']) {
  if (!generator.includes(token)) failures.push(`generator contract missing: ${token}`);
}

if (!homepage.includes('/hero-marketplace.webp')) failures.push('locked homepage image artifact missing after article generation');
if (!homepage.includes('rel="preload" as="image" href="/hero-marketplace.webp"')) failures.push('locked homepage image preload missing after article generation');

if (failures.length) {
  console.error('[articles] Validation failed:');
  failures.forEach(f=>console.error(`- ${f}`));
  process.exit(1);
}
console.log(`[articles] validation PASS — ${content.length} canonical BlogPosting pages, corporate/editorial entities, citations, RSS, sitemap, navigation, analytics and Platinum surfaces verified`);
