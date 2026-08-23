'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, 'articles');
const CONTENT_DIR = path.join(ARTICLES_DIR, 'content');
const SITE = 'https://marketplace.aproposgroupllc.com';
const MARKETPLACE_WEBSITE = `${SITE}/#website`;
const CORPORATE_ORG = 'https://aproposgroupllc.com/#organization';
const EDITORIAL_TEAM = `${SITE}/#editorial-team`;

fs.mkdirSync(CONTENT_DIR, { recursive: true });

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const jsonFiles = fs.readdirSync(CONTENT_DIR).filter((name) => name.endsWith('.json')).sort();
const articles = jsonFiles.map((name) => {
  const file = path.join(CONTENT_DIR, name);
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  value.__file = name;
  return value;
}).filter((article) => article.published !== false);

const seen = new Set();
for (const article of articles) {
  const required = ['slug', 'title', 'description', 'category', 'publishedDate', 'updatedDate', 'sections'];
  for (const key of required) {
    if (!article[key] || (key === 'sections' && (!Array.isArray(article[key]) || !article[key].length))) {
      throw new Error(`[articles] ${article.__file}: missing ${key}`);
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) throw new Error(`[articles] ${article.__file}: invalid slug`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.publishedDate) || !/^\d{4}-\d{2}-\d{2}$/.test(article.updatedDate)) throw new Error(`[articles] ${article.__file}: invalid date format`);
  if (article.updatedDate < article.publishedDate) throw new Error(`[articles] ${article.__file}: updatedDate precedes publishedDate`);
  if (seen.has(article.slug)) throw new Error(`[articles] duplicate slug: ${article.slug}`);
  seen.add(article.slug);
}
for (const article of articles) {
  for (const slug of article.related || []) if (!seen.has(slug)) throw new Error(`[articles] ${article.__file}: unknown related slug ${slug}`);
  for (const source of article.sources || []) {
    try {
      const u = new URL(source.url);
      if (!['https:', 'http:'].includes(u.protocol)) throw new Error('unsupported protocol');
    } catch (_) { throw new Error(`[articles] ${article.__file}: invalid source URL`); }
  }
  if (article.pathway?.url) {
    try { new URL(article.pathway.url, SITE); }
    catch (_) { throw new Error(`[articles] ${article.__file}: invalid pathway URL`); }
  }
}

const analytics = `<script>\n(function(){\n  document.addEventListener('click',function(event){\n    var cta=event.target.closest&&event.target.closest('a[data-article-cta]');\n    if(cta&&typeof gtag==='function'){gtag('event','article_cta_click',{destination:cta.getAttribute('data-destination')||'',content_slug:cta.getAttribute('data-article-slug')||'',source_page:location.pathname,link_url:cta.href,transport_type:'beacon'});}\n    var related=event.target.closest&&event.target.closest('a[data-related-article]');\n    if(related&&typeof gtag==='function'){gtag('event','article_related_click',{content_slug:related.getAttribute('data-source-slug')||'',related_slug:related.getAttribute('data-related-article')||'',source_page:location.pathname,transport_type:'beacon'});}\n  });\n})();\n</script>`;

const rssLink = '<link rel="alternate" type="application/rss+xml" title="APROPOS Marketplace Articles" href="/articles/feed.xml">';
const sharedHead = (title, description, canonical, ogType = 'website', extra = '') => `\n<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-FGJG583DTL"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FGJG583DTL');</script>\n<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${esc(title)}</title>\n<meta name="description" content="${esc(description)}">\n<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">\n<link rel="canonical" href="${canonical}">\n<meta property="og:type" content="${ogType}"><meta property="og:site_name" content="APROPOS Marketing Marketplace"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${SITE}/og-marketplace.jpg"><meta property="og:image:alt" content="APROPOS Marketing Marketplace government contracting education">\n<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${SITE}/og-marketplace.jpg">\n<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/landing-pages.css">${rssLink}${extra}`;

const articleStyles = `<style>\n.article-meta{display:flex;flex-wrap:wrap;gap:.65rem 1rem;color:var(--muted);font-size:.84rem;margin-top:1.25rem}.article-body{max-width:820px}.article-body h2{margin-top:2.4rem}.article-body ul{padding-left:1.3rem}.article-body li{margin:.5rem 0}.article-body a,.source-list a{color:var(--gold2);font-weight:700;text-underline-offset:3px}.source-list{padding-left:1.2rem}.article-card .meta{font-size:.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}.article-card h2{font-size:1.7rem}.article-card a{color:inherit;text-decoration:none}.article-card a:hover h2,.article-card a:focus h2{color:var(--gold2)}.article-pathway{border-left:4px solid var(--gold);background:var(--panel-strong)}.empty-state{border:1px solid var(--line);background:var(--panel);padding:2rem;border-radius:var(--radius)}.article-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}.article-disclosure{font-size:13px;color:var(--muted);border-top:1px solid var(--line);padding-top:1rem;margin-top:1.5rem}@media(max-width:850px){.article-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.article-grid{grid-template-columns:1fr}}\n</style>`;

function nav() {
  return `<nav class="site-nav" aria-label="Primary"><a class="brand" href="/"><span class="mark">AMM</span><span class="brand-name">APROPOS Marketing Marketplace<small>GOVERNMENT CONTRACT MARKETPLACE</small></span></a><div class="nav-links"><a href="/articles/">Articles</a><a href="/federal-contract-opportunities/">Federal</a><a href="/state-local-contract-opportunities/">State &amp; local</a><a href="/business-contract-readiness/">Business readiness</a><a href="https://aproposgroupllc.com/">APROPOS Group LLC</a></div></nav>`;
}

function footer() {
  return `<footer class="site-footer"><div class="wrap"><div class="footer-grid"><div><span class="mark">AMM</span><h3>APROPOS Marketing Marketplace</h3><p>Public education, service discovery, and routing by APROPOS Group LLC.</p></div><div class="footer-links"><a href="/articles/">Articles</a><a href="/government-contract-intelligence/">Contract Intelligence</a><a href="/federal-contract-opportunities/">Federal Opportunities</a><a href="/state-local-contract-opportunities/">State &amp; Local Opportunities</a><a href="/business-contract-readiness/">Business Readiness</a><a href="https://aproposgroupllc.com/">APROPOS Group LLC</a></div></div><p class="legal">© 2026 APROPOS Group LLC. The Marketplace is not affiliated with or endorsed by any government agency. Educational content does not guarantee eligibility, responsiveness, selection, funding, or contract award.</p></div></footer>`;
}

const corporateNode = { '@type':['Organization','Corporation'], '@id':CORPORATE_ORG, name:'APROPOS Group LLC', url:'https://aproposgroupllc.com/' };
const editorialNode = { '@type':'Organization', '@id':EDITORIAL_TEAM, name:'APROPOS Marketing Marketplace Editorial Team', url:`${SITE}/articles/`, parentOrganization:{'@id':CORPORATE_ORG} };

function renderIndex() {
  const canonical = `${SITE}/articles/`;
  const cards = articles.length ? articles.map((article) => `<article class="card article-card"><div class="meta">${esc(article.category)} · Updated ${esc(article.updatedDate)}</div><a href="/articles/${article.slug}/"><h2>${esc(article.title)}</h2><p>${esc(article.description)}</p><strong>Read article →</strong></a></article>`).join('') : `<div class="empty-state"><h2>Government contracting education is expanding here.</h2><p>The APROPOS editorial library is being prepared as the canonical home for broad government-contracting education. In the meantime, use the Marketplace pathways below to continue.</p><p><a class="btn" href="/federal-contract-opportunities/">Federal contracting</a><a class="btn secondary" href="/state-local-contract-opportunities/">State &amp; local</a><a class="btn secondary" href="/business-contract-readiness/">Business readiness</a></p></div>`;
  const itemList = articles.map((article, index) => ({ '@type':'ListItem', position:index+1, name:article.title, url:`${SITE}/articles/${article.slug}/` }));
  const schema = { '@context':'https://schema.org', '@graph':[
    corporateNode,
    editorialNode,
    { '@type':'CollectionPage', '@id':`${canonical}#webpage`, url:canonical, name:'Government Contracting Articles | APROPOS Marketplace', description:'Educational articles on federal, state and local government contracting, SLED procurement, readiness, solicitations, and bid decisions.', isPartOf:{'@id':MARKETPLACE_WEBSITE}, publisher:{'@id':CORPORATE_ORG}, inLanguage:'en-US' },
    { '@type':'BreadcrumbList', itemListElement:[{'@type':'ListItem',position:1,name:'APROPOS Marketing Marketplace',item:`${SITE}/`},{'@type':'ListItem',position:2,name:'Articles',item:canonical}] },
    { '@type':'ItemList', name:'APROPOS Marketplace Articles', numberOfItems:itemList.length, itemListElement:itemList }
  ]};
  const html = `<!doctype html><html lang="en"><head>${sharedHead('Government Contracting Articles | APROPOS Marketplace','Educational articles on federal, state and local government contracting, SLED procurement, readiness, solicitations, and bid decisions.',canonical,'website',`<script type="application/ld+json">${JSON.stringify(schema)}</script>${articleStyles}`)}</head><body><a class="skip" href="#main">Skip to main content</a>${nav()}<main id="main"><header class="hero"><div class="wrap"><div class="breadcrumbs"><a href="/">Marketplace</a> / Articles</div><div class="eyebrow">APROPOS GROUP LLC · PUBLIC EDUCATION</div><h1>Government Contracting Articles</h1><p class="lead">Plain-language education for businesses exploring federal, state, local, SLED, and public-sector contracting. Marketplace articles explain the landscape and route specialized operational needs to the correct APROPOS property.</p></div></header><section><div class="wrap"><div class="gold-rule"></div><div class="eyebrow">Learn before you pursue</div><h2>Explore the contracting landscape</h2><div class="article-grid">${cards}</div></div></section></main>${footer()}${analytics}</body></html>`;
  fs.writeFileSync(path.join(ARTICLES_DIR,'index.html'), html, 'utf8');
}

function renderArticle(article) {
  const canonical = `${SITE}/articles/${article.slug}/`;
  const pageDir = path.join(ARTICLES_DIR, article.slug);
  fs.mkdirSync(pageDir, { recursive:true });
  const sections = article.sections.map((section) => `<section><div class="wrap article-body"><h2>${esc(section.heading)}</h2>${(section.paragraphs||[]).map((p)=>`<p>${esc(p)}</p>`).join('')}${section.bullets?.length?`<ul>${section.bullets.map((b)=>`<li>${esc(b)}</li>`).join('')}</ul>`:''}</div></section>`).join('');
  const sources = article.sources?.length ? `<section><div class="wrap article-body"><h2>Sources and further reading</h2><ul class="source-list">${article.sources.map((source)=>`<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a></li>`).join('')}</ul><p class="article-disclosure">Official source material controls where it differs from educational summaries. Always review the current solicitation, amendment, regulation, or agency guidance applicable to your opportunity.</p></div></section>` : '';
  const pathway = article.pathway ? `<section><div class="wrap"><div class="card article-pathway"><div class="eyebrow">Continue with APROPOS</div><h2>${esc(article.pathway.heading||'Continue to the right APROPOS pathway')}</h2><p>${esc(article.pathway.description||'Use the specialized APROPOS service that matches your next step.')}</p><a class="btn" data-article-cta="1" data-article-slug="${esc(article.slug)}" data-destination="${esc(article.pathway.destination||'marketplace')}" href="${esc(article.pathway.url)}">${esc(article.pathway.label)} →</a></div></div></section>` : '';
  const related = (article.related||[]).map((slug)=>articles.find((item)=>item.slug===slug)).filter(Boolean);
  const relatedHtml = related.length ? `<section><div class="wrap article-body"><h2>Related articles</h2><ul>${related.map((item)=>`<li><a data-related-article="${esc(item.slug)}" data-source-slug="${esc(article.slug)}" href="/articles/${item.slug}/">${esc(item.title)}</a></li>`).join('')}</ul></div></section>` : '';
  const citations = (article.sources || []).map((source) => source.url);
  const schema = { '@context':'https://schema.org', '@graph':[
    corporateNode,
    editorialNode,
    { '@type':'BlogPosting', '@id':`${canonical}#article`, headline:article.title, description:article.description, datePublished:article.publishedDate, dateModified:article.updatedDate, mainEntityOfPage:{'@id':`${canonical}#webpage`}, author:{'@id':EDITORIAL_TEAM}, publisher:{'@id':CORPORATE_ORG}, about:{'@type':'Thing',name:article.category}, image:`${SITE}/og-marketplace.jpg`, inLanguage:'en-US', isAccessibleForFree:true, ...(citations.length?{citation:citations}:{}) },
    { '@type':'WebPage', '@id':`${canonical}#webpage`, url:canonical, name:article.title, isPartOf:{'@id':MARKETPLACE_WEBSITE}, publisher:{'@id':CORPORATE_ORG}, primaryImageOfPage:{'@type':'ImageObject',url:`${SITE}/og-marketplace.jpg`}, inLanguage:'en-US' },
    { '@type':'BreadcrumbList', itemListElement:[{'@type':'ListItem',position:1,name:'APROPOS Marketing Marketplace',item:`${SITE}/`},{'@type':'ListItem',position:2,name:'Articles',item:`${SITE}/articles/`},{'@type':'ListItem',position:3,name:article.title,item:canonical}] }
  ]};
  const extra = `<meta property="article:published_time" content="${esc(article.publishedDate)}"><meta property="article:modified_time" content="${esc(article.updatedDate)}"><meta property="article:section" content="${esc(article.category)}"><script type="application/ld+json">${JSON.stringify(schema)}</script>${articleStyles}`;
  const html = `<!doctype html><html lang="en"><head>${sharedHead(`${article.title} | APROPOS Marketplace`,article.description,canonical,'article',extra)}</head><body><a class="skip" href="#main">Skip to main content</a>${nav()}<main id="main"><header class="hero"><div class="wrap"><div class="breadcrumbs"><a href="/">Marketplace</a> / <a href="/articles/">Articles</a> / ${esc(article.title)}</div><div class="eyebrow">${esc(article.category)} · APROPOS MARKETPLACE</div><h1>${esc(article.title)}</h1><p class="lead">${esc(article.description)}</p><div class="article-meta"><span>Published ${esc(article.publishedDate)}</span><span>Updated ${esc(article.updatedDate)}</span><span>By APROPOS Marketing Marketplace Editorial Team</span></div></div></header>${sections}${sources}${pathway}${relatedHtml}</main>${footer()}${analytics}</body></html>`;
  fs.writeFileSync(path.join(pageDir,'index.html'), html, 'utf8');
}

function addArticleNav(page, label = 'Articles') {
  if (page.includes('href="/articles/"')) return page;
  if (page.includes('<a href="#marketplace-resources">Resources</a>')) return page.replace('<a href="#marketplace-resources">Resources</a>', `<a href="#marketplace-resources">Resources</a><a href="/articles/">${label}</a>`);
  if (page.includes('<a href="/contractor-participation/">Participate</a>')) return page.replace('<a href="/contractor-participation/">Participate</a>', `<a href="/contractor-participation/">Participate</a><a href="/articles/">${label}</a>`);
  for (const klass of ['cca-nav-links','nav-links']) {
    const re = new RegExp(`(<div class="${klass}">[\\s\\S]*?)(</div>)`);
    if (re.test(page)) return page.replace(re, `$1<a href="/articles/">${label}</a>$2`);
  }
  return page;
}

function patchNavigation() {
  const homepageFile = path.join(ROOT,'index.html');
  let homepage = fs.readFileSync(homepageFile,'utf8');
  homepage = addArticleNav(homepage);
  if (!homepage.includes('href="/articles/"')) throw new Error('[articles] could not add homepage article navigation');
  fs.writeFileSync(homepageFile, homepage, 'utf8');

  const publicRoutes = [
    'government-contract-intelligence','federal-contract-opportunities','state-local-contract-opportunities','contractor-opportunity-matching','nat-corp-contract-matching','contract-fit-analysis','government-proposal-development','business-contract-readiness','contractor-participation','procurement-partnerships',
    'registered-federal-contractors-portal','nat-corp-contract-exchange','national-enterprise-business-center','ai4-businesses','ai4-website-design','ai4-website-design-es','apropos-group-llc'
  ];
  for (const route of publicRoutes) {
    const file = path.join(ROOT,route,'index.html');
    if (!fs.existsSync(file)) continue;
    let page = fs.readFileSync(file,'utf8');
    page = addArticleNav(page);
    fs.writeFileSync(file,page,'utf8');
  }
}

function updateSitemap() {
  const file = path.join(ROOT,'sitemap.xml');
  let sitemap = fs.readFileSync(file,'utf8');
  sitemap = sitemap.replace(/\s*<url>\s*<loc>https:\/\/marketplace\.aproposgroupllc\.com\/articles\/[\s\S]*?<\/url>/g,'');
  const latest = articles.map((a)=>a.updatedDate).sort().at(-1) || new Date().toISOString().slice(0,10);
  const entries = [`  <url>\n    <loc>${SITE}/articles/</loc>\n    <lastmod>${latest}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`, ...articles.map((article)=>`  <url>\n    <loc>${SITE}/articles/${article.slug}/</loc>\n    <lastmod>${article.updatedDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`)].join('\n');
  sitemap = sitemap.replace('</urlset>', `${entries}\n</urlset>`);
  fs.writeFileSync(file,sitemap,'utf8');
}

function renderFeed() {
  const ordered = [...articles].sort((a,b)=>b.updatedDate.localeCompare(a.updatedDate));
  const items = ordered.map((article)=>`    <item>\n      <title>${esc(article.title)}</title>\n      <link>${SITE}/articles/${article.slug}/</link>\n      <guid isPermaLink="true">${SITE}/articles/${article.slug}/</guid>\n      <description>${esc(article.description)}</description>\n      <category>${esc(article.category)}</category>\n      <pubDate>${new Date(`${article.publishedDate}T12:00:00Z`).toUTCString()}</pubDate>\n    </item>`).join('\n');
  const feed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>APROPOS Marketplace Articles</title>\n    <link>${SITE}/articles/</link>\n    <description>Government contracting education and APROPOS business-opportunity guidance.</description>\n    <language>en-us</language>\n${items}\n  </channel>\n</rss>\n`;
  fs.writeFileSync(path.join(ARTICLES_DIR,'feed.xml'), feed, 'utf8');
}

renderIndex();
articles.forEach(renderArticle);
renderFeed();
patchNavigation();
updateSitemap();
console.log(`[articles] generated article index, RSS feed and ${articles.length} canonical article page(s); navigation and sitemap updated`);
