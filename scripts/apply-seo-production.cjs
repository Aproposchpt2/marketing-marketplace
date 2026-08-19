const fs = require('fs');
const path = require('path');

const root = process.cwd();
const origin = 'https://marketplace.aproposgroupllc.com';
const corporateOrigin = 'https://aproposgroupllc.com';
const homepage = path.join(root, 'index.html');

const HOME = {
  title: 'Government Contract Marketplace | APROPOS Group LLC',
  description: 'Discover government contract opportunities, federal and state procurement intelligence, contractor matching, contract fit analysis, proposal development, and business growth pathways from APROPOS Group LLC.',
  canonical: `${origin}/`
};

const ROUTES = [
  { dir: 'government-contract-intelligence', title: 'Government Contract Intelligence | APROPOS Marketplace', description: 'Use APROPOS government contract intelligence to understand procurement opportunities, requirements, fit, and next-step contracting pathways.' },
  { dir: 'federal-contract-opportunities', title: 'Federal Contract Opportunities | APROPOS Marketplace', description: 'Discover federal contract opportunities and procurement pathways for businesses seeking relevant government contracting work.' },
  { dir: 'state-local-contract-opportunities', title: 'State & Local Government Contract Opportunities | APROPOS', description: 'Explore state and local government contract opportunities, procurement intelligence, and business participation pathways.' },
  { dir: 'contractor-opportunity-matching', title: 'Government Contract Matching | APROPOS Marketplace', description: 'Match business capabilities with relevant government contract opportunities using APROPOS contractor opportunity intelligence.' },
  { dir: 'contract-fit-analysis', title: 'Government Contract Fit Analysis | APROPOS Marketplace', description: 'Evaluate whether a government solicitation fits your business capabilities, qualifications, timing, and proposal readiness.' },
  { dir: 'government-proposal-development', title: 'Government Proposal Development | APROPOS Marketplace', description: 'Build stronger government contract proposals with structured solicitation analysis, compliance guidance, and proposal-development support.' },
  { dir: 'business-contract-readiness', title: 'Government Contract Readiness | APROPOS Marketplace', description: 'Prepare your business for government contracting with readiness guidance, capability alignment, and procurement participation resources.' },
  { dir: 'contractor-participation', title: 'Government Contractor Participation | APROPOS Marketplace', description: 'Access government contractor participation pathways, procurement programs, and opportunity resources from APROPOS Group LLC.' },
  { dir: 'procurement-partnerships', title: 'Government Procurement Partnerships | APROPOS Marketplace', description: 'Explore procurement partnerships, teaming pathways, and institutional business-development opportunities with APROPOS Group LLC.' }
];

const robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
const image = `${origin}/og-marketplace.jpg`;

function replaceOrInsert(html, pattern, tag) {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace(/<\/head>/i, `${tag}\n</head>`);
}

function setPageMetadata(filePath, meta, structuredData) {
  if (!fs.existsSync(filePath)) return false;
  let html = fs.readFileSync(filePath, 'utf8');
  html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);
  html = replaceOrInsert(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${meta.description}">`);
  html = replaceOrInsert(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${meta.canonical}">`);
  html = replaceOrInsert(html, /<meta\s+name=["']robots["'][^>]*>/i, `<meta name="robots" content="${robots}">`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:type["'][^>]*>/i, '<meta property="og:type" content="website">');
  html = replaceOrInsert(html, /<meta\s+property=["']og:site_name["'][^>]*>/i, '<meta property="og:site_name" content="APROPOS Marketing Marketplace">');
  html = replaceOrInsert(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${meta.title}">`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${meta.description}">`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${meta.canonical}">`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${image}">`);
  html = replaceOrInsert(html, /<meta\s+name=["']twitter:card["'][^>]*>/i, '<meta name="twitter:card" content="summary_large_image">');
  html = replaceOrInsert(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${meta.title}">`);
  html = replaceOrInsert(html, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${meta.description}">`);
  html = replaceOrInsert(html, /<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${image}">`);

  if (structuredData) {
    const jsonLd = `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;
    const existing = /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi;
    if (existing.test(html)) html = html.replace(existing, jsonLd);
    else html = html.replace(/<\/head>/i, `${jsonLd}\n</head>`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  return true;
}

function homepageSchema() {
  const orgId = `${corporateOrigin}/#organization`;
  const websiteId = `${origin}/#website`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': orgId, name: 'APROPOS Group LLC', url: `${corporateOrigin}/` },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${origin}/`,
        name: 'APROPOS Marketing Marketplace',
        alternateName: 'APROPOS Government Contract Marketplace',
        description: HOME.description,
        publisher: { '@id': orgId }
      },
      {
        '@type': 'WebPage',
        '@id': `${origin}/#webpage`,
        url: `${origin}/`,
        name: HOME.title,
        description: HOME.description,
        isPartOf: { '@id': websiteId },
        about: [
          { '@type': 'Thing', name: 'Government Contract Opportunities' },
          { '@type': 'Thing', name: 'Government Procurement' },
          { '@type': 'Thing', name: 'Government Contract Intelligence' }
        ]
      },
      {
        '@type': 'ItemList',
        name: 'APROPOS Government Contract Services',
        numberOfItems: ROUTES.length,
        itemListElement: ROUTES.map((route, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: route.title.replace(/ \| APROPOS.*$/, ''),
          url: `${origin}/${route.dir}/`
        }))
      },
      {
        '@type': 'Service',
        name: 'Analyze Fit',
        url: `${origin}/contract-fit-analysis/`,
        provider: { '@id': orgId },
        description: 'Government contract fit analysis and solicitation intelligence.',
        offers: {
          '@type': 'Offer',
          price: '79.00',
          priceCurrency: 'USD',
          category: 'One-time service',
          availability: 'https://schema.org/InStock'
        }
      }
    ]
  };
}

function landingSchema(meta) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${corporateOrigin}/#organization`, name: 'APROPOS Group LLC', url: `${corporateOrigin}/` },
      { '@type': 'WebPage', '@id': `${meta.canonical}#webpage`, url: meta.canonical, name: meta.title, description: meta.description, publisher: { '@id': `${corporateOrigin}/#organization` } }
    ]
  };
}

function correctAnalyzeFitPrice() {
  if (!fs.existsSync(homepage)) return;
  let html = fs.readFileSync(homepage, 'utf8');
  html = html
    .replace(/(<h3>Additional Analyze Fit Report<\/h3>[\s\S]{0,500}?)\$15\s*(?:one-time|one time)?/gi, '$1$79 one-time')
    .replace(/("name":"Additional Analyze Fit Report"[\s\S]{0,700}?"price":")15\.00("?)/gi, '$179.00$2');
  fs.writeFileSync(homepage, html, 'utf8');
}

function writeCrawlFiles() {
  fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`, 'utf8');
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [{ route: '/', priority: '1.0' }, ...ROUTES.map((r) => ({ route: `/${r.dir}/`, priority: '0.8' }))]
    .filter(({ route }) => route === '/' || fs.existsSync(path.join(root, route, 'index.html')))
    .map(({ route, priority }) => `  <url>\n    <loc>${origin}${route}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${priority}</priority>\n  </url>`)
    .join('\n');
  fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');
}

function validate() {
  const home = fs.readFileSync(homepage, 'utf8');
  const required = [HOME.title, HOME.description, `${corporateOrigin}/#organization`, `${origin}/#website`, '"price":"79.00"'];
  for (const value of required) if (!home.includes(value)) throw new Error(`Marketplace SEO validation failed: missing ${value}`);
  if ((home.match(/<title>/gi) || []).length !== 1) throw new Error('Marketplace SEO validation failed: duplicate title.');
  for (const route of ROUTES) {
    const file = path.join(root, route.dir, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes(`${origin}/${route.dir}/`)) throw new Error(`Marketplace SEO validation failed: canonical missing for ${route.dir}.`);
  }
}

function main() {
  if (!fs.existsSync(homepage)) throw new Error('Marketplace homepage not found.');
  correctAnalyzeFitPrice();
  setPageMetadata(homepage, HOME, homepageSchema());
  for (const route of ROUTES) {
    const meta = { ...route, canonical: `${origin}/${route.dir}/` };
    setPageMetadata(path.join(root, route.dir, 'index.html'), meta, landingSchema(meta));
  }
  writeCrawlFiles();
  validate();
  console.log('Marketplace SEO production setup applied and validated.');
}

main();
