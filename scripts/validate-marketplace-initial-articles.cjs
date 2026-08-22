'use strict';

const fs = require('fs');
const path = require('path');

const slugs = [
  'how-to-find-government-contracts',
  'federal-vs-state-local-government-contracts',
  'what-is-sled-contracting',
  'how-to-decide-whether-to-bid',
  'what-is-a-capability-statement',
  'how-to-read-a-government-solicitation',
  'understanding-naics-codes',
  'preparing-your-business-for-government-contracting'
];

const sitemap = fs.readFileSync('sitemap.xml','utf8');
const index = fs.readFileSync('articles/index.html','utf8');

for (const slug of slugs) {
  const sourceFile = path.join('articles','content',`${slug}.json`);
  const pageFile = path.join('articles',slug,'index.html');
  if (!fs.existsSync(sourceFile)) throw new Error(`[initial-articles] source missing: ${slug}`);
  if (!fs.existsSync(pageFile)) throw new Error(`[initial-articles] generated page missing: ${slug}`);
  const source = JSON.parse(fs.readFileSync(sourceFile,'utf8'));
  const page = fs.readFileSync(pageFile,'utf8');
  if (source.slug !== slug) throw new Error(`[initial-articles] slug mismatch: ${slug}`);
  if (!Array.isArray(source.sources) || source.sources.length < 2) throw new Error(`[initial-articles] insufficient sources: ${slug}`);
  if (!source.pathway || !source.pathway.url || !source.pathway.destination) throw new Error(`[initial-articles] contextual pathway missing: ${slug}`);
  if (!page.includes('"@type":"Article"')) throw new Error(`[initial-articles] Article JSON-LD missing: ${slug}`);
  if (!page.includes('"@type":"BreadcrumbList"')) throw new Error(`[initial-articles] BreadcrumbList missing: ${slug}`);
  if (!page.includes(`<link rel="canonical" href="https://marketplace.aproposgroupllc.com/articles/${slug}/">`)) throw new Error(`[initial-articles] canonical missing: ${slug}`);
  if (!page.includes('APROPOS Marketing Marketplace Editorial Team')) throw new Error(`[initial-articles] publisher attribution missing: ${slug}`);
  if (!sitemap.includes(`<loc>https://marketplace.aproposgroupllc.com/articles/${slug}/</loc>`)) throw new Error(`[initial-articles] sitemap entry missing: ${slug}`);
}

const expectedSourceDomains = ['sam.gov','sba.gov','census.gov','acquisition.gov','gsa.gov','naspo.org'];
const content = slugs.map((slug)=>fs.readFileSync(path.join('articles','content',`${slug}.json`),'utf8')).join('\n');
for (const domain of expectedSourceDomains) if (!content.includes(domain)) throw new Error(`[initial-articles] source coverage missing domain: ${domain}`);

const prohibited = [
  'guaranteed contract award',
  'guaranteed funding',
  'guaranteed ranking',
  '20 to 40 percent of the total award decision',
  'billions in federal and state contracts go unbid'
];
for (const phrase of prohibited) if (content.toLowerCase().includes(phrase.toLowerCase())) throw new Error(`[initial-articles] prohibited/unsupported phrase: ${phrase}`);

const cards = (index.match(/class="card article-card"/g)||[]).length;
if (cards !== slugs.length) throw new Error(`[initial-articles] expected ${slugs.length} article cards, found ${cards}`);

console.log(`[initial-articles] validation PASS — ${slugs.length} sourced canonical articles generated with schema, sitemap entries, and contextual APROPOS pathways`);
