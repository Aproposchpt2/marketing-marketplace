'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT,'articles','content');
const SITE = 'https://marketplace.aproposgroupllc.com';
const CORPORATE_ORG = 'https://aproposgroupllc.com/#organization';
const EDITORIAL_TEAM = `${SITE}/#editorial-team`;
const ENGINE_MARKER = '<!-- APROPOS_MARKETPLACE_ARTICLE_ENGINE_OUTPUT -->';
const MANIFEST_FILE = path.join('articles', '.generated-article-slugs.json');

function parseXml(xml, label) {
  const invalidEntity = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/;
  if (invalidEntity.test(xml)) throw new Error(`[articles] ${label}: unescaped XML entity`);
  const input = xml
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  const stack = [];
  let rootCount = 0;
  let cursor = 0;
  const tagPattern = /<([^>]+)>/g;
  for (let match; (match = tagPattern.exec(input));) {
    if (input.slice(cursor, match.index).includes('<')) throw new Error(`[articles] ${label}: malformed tag`);
    cursor = tagPattern.lastIndex;
    const raw = match[1].trim();
    if (!raw || raw.startsWith('!')) continue;
    if (raw.startsWith('/')) {
      const name = raw.slice(1).trim();
      if (stack.pop() !== name) throw new Error(`[articles] ${label}: mismatched closing tag ${name}`);
      continue;
    }
    const selfClosing = raw.endsWith('/');
    const name = raw.match(/^([A-Za-z_][\w:.-]*)/)?.[1];
    if (!name) throw new Error(`[articles] ${label}: invalid opening tag`);
    if (!stack.length) rootCount += 1;
    if (!selfClosing) stack.push(name);
  }
  if (cursor !== input.length && input.slice(cursor).includes('<')) throw new Error(`[articles] ${label}: unterminated tag`);
  if (stack.length) throw new Error(`[articles] ${label}: unclosed tag ${stack.at(-1)}`);
  if (rootCount !== 1) throw new Error(`[articles] ${label}: expected one root element, found ${rootCount}`);
  return true;
}

function navContainsArticleLink(page) {
  const nav = page.match(/<nav\b[\s\S]*?<\/nav>/i)?.[0] || '';
  return /href=["']\/articles\/["']/.test(nav);
}

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
  .filter(article=>article.published!==false)
  .sort((a,b)=>b.updatedDate.localeCompare(a.updatedDate) || a.slug.localeCompare(b.slug));
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

if (!navContainsArticleLink(homepage)) throw new Error('[articles] homepage article link is not inside the navigation container');
if (!sitemap.includes(`<loc>${SITE}/articles/</loc>`)) throw new Error('[articles] article index missing from sitemap');
if (!feed.includes('<rss version="2.0">')) throw new Error('[articles] RSS feed root missing');

parseXml(sitemap, 'sitemap.xml');
parseXml(feed, 'articles/feed.xml');

const failures = [];
const sitemapLocations = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match)=>match[1].trim());
for (const location of new Set(sitemapLocations)) {
  if (sitemapLocations.filter((candidate)=>candidate===location).length > 1) failures.push(`duplicate sitemap URL: ${location}`);
}

const publishedSlugs = new Set(content.map((article)=>article.slug));
const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
if (JSON.stringify(manifest) !== JSON.stringify([...publishedSlugs])) failures.push('generated article manifest does not match stable published order');
for (const entry of fs.readdirSync('articles', { withFileTypes:true })) {
  if (!entry.isDirectory() || entry.name === 'content' || publishedSlugs.has(entry.name)) continue;
  const candidate = path.join('articles',entry.name,'index.html');
  if (!fs.existsSync(candidate)) continue;
  const page = fs.readFileSync(candidate,'utf8');
  const legacyEngineOutput = page.includes(`${SITE}/articles/${entry.name}/`) && page.includes(EDITORIAL_TEAM) && page.includes('article_cta_click');
  if (page.includes(ENGINE_MARKER) || legacyEngineOutput) failures.push(`${entry.name}: stale engine-owned article page remains`);
}
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
  if (!navContainsArticleLink(page)) failures.push(`${route}: article link is not inside the navigation container`);
}

const generator = fs.readFileSync('scripts/generate-marketplace-articles.cjs','utf8');
for (const token of ['BlogPosting','datePublished','dateModified','BreadcrumbList','citation','isAccessibleForFree','data-article-cta','data-related-article','APROPOS Marketing Marketplace Editorial Team','feed.xml']) {
  if (!generator.includes(token)) failures.push(`generator contract missing: ${token}`);
}

// The current homepage image and composition are protected by the production-suite,
// APROPOS visual-standard, and hero-building-balance gates that run immediately
// before this validator. Re-check the current markers here rather than reviving the
// retired /hero-marketplace.webp assertion from Article Engine V1.
for (const token of [
  '<section class="hero" id="top">',
  'The Government Contract Marketplace',
  'APROPOS_VISUAL_STANDARD_MARKETPLACE_START',
  'APROPOS_MARKETPLACE_HERO_BUILDING_BALANCE_START'
]) {
  if (!homepage.includes(token)) failures.push(`current Platinum homepage/hero marker missing after article generation: ${token}`);
}

function snapshotGeneratedOutputs(root) {
  const files = [
    'index.html','sitemap.xml','articles/index.html','articles/feed.xml',MANIFEST_FILE,
    ...publicRoutes.map((route)=>path.join(route,'index.html')),
    ...content.map((article)=>path.join('articles',article.slug,'index.html'))
  ].filter((file)=>fs.existsSync(path.join(root,file))).sort();
  const hash = crypto.createHash('sha256');
  for (const file of files) hash.update(file).update('\0').update(fs.readFileSync(path.join(root,file))).update('\0');
  return hash.digest('hex');
}

function validateCleanAndRepeatBuildDeterminism() {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(),'marketplace-article-determinism-'));
  try {
    fs.cpSync(ROOT, temporaryRoot, { recursive:true, filter:(source)=>!['.git','node_modules'].includes(path.basename(source)) });
    for (const article of content) fs.rmSync(path.join(temporaryRoot,'articles',article.slug), { recursive:true, force:true });
    for (const file of ['articles/index.html','articles/feed.xml',MANIFEST_FILE]) fs.rmSync(path.join(temporaryRoot,file), { force:true });
    const staleDir = path.join(temporaryRoot,'articles','stale-engine-test');
    fs.mkdirSync(staleDir,{recursive:true});
    fs.writeFileSync(path.join(staleDir,'index.html'),`${ENGINE_MARKER}<html></html>`,'utf8');
    const run = () => spawnSync(process.execPath,['scripts/generate-marketplace-articles.cjs'],{cwd:temporaryRoot,encoding:'utf8'});
    const clean = run();
    if (clean.status !== 0) throw new Error(`clean generation failed: ${clean.stderr || clean.stdout}`);
    if (fs.existsSync(staleDir)) throw new Error('clean generation did not remove stale engine-owned output');
    const cleanHash = snapshotGeneratedOutputs(temporaryRoot);
    const repeat = run();
    if (repeat.status !== 0) throw new Error(`repeat generation failed: ${repeat.stderr || repeat.stdout}`);
    const repeatHash = snapshotGeneratedOutputs(temporaryRoot);
    if (cleanHash !== repeatHash) throw new Error(`output hash changed (${cleanHash} != ${repeatHash})`);
  } finally {
    fs.rmSync(temporaryRoot,{recursive:true,force:true});
  }
}

if (!failures.length) {
  try { validateCleanAndRepeatBuildDeterminism(); }
  catch (error) { failures.push(`clean-build/repeat-build determinism failed: ${error.message}`); }
}

if (failures.length) {
  console.error('[articles] Validation failed:');
  failures.forEach(f=>console.error(`- ${f}`));
  process.exit(1);
}
console.log(`[articles] validation PASS — ${content.length} canonical BlogPosting pages, stale-output reconciliation, stable ordering, XML parsing, duplicate sitemap detection, navigation placement and clean/repeat determinism verified`);
