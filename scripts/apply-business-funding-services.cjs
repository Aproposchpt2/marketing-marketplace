const fs = require('fs');
const path = require('path');

const indexPath = path.join(process.cwd(), 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const marker = '<!-- APROPOS_BUSINESS_FUNDING_START -->';
if (!html.includes(marker)) {
  const styles = `
  /* APROPOS business funding pathway */
  .funding-home{background:linear-gradient(135deg,#f8fafc 0%,#eef3f8 100%);color:#182238;padding:5.5rem 2rem;border-top:1px solid rgba(14,29,54,.12)}
  .funding-home-inner{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1.25fr .75fr;gap:3rem;align-items:center}
  .funding-home .eyebrow{color:#9a7b24}.funding-home h2{font-family:var(--disp);font-size:clamp(2.5rem,5vw,4.6rem);line-height:.98;color:#0e1d36;font-weight:500;margin:.5rem 0 1.2rem}
  .funding-home p{max-width:760px;color:#4d5b74;font-size:1.05rem}.funding-home-actions{display:flex;flex-wrap:wrap;gap:.8rem;margin-top:1.7rem}
  .funding-home-card{background:#0e1d36;color:#d2d9e4;padding:2rem;border:1px solid rgba(200,168,75,.28)}.funding-home-card strong{display:block;color:#e4c878;font-family:var(--mark);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:.9rem}.funding-home-card ul{padding-left:1.15rem}.funding-home-card li{margin:.55rem 0}
  @media(max-width:820px){.funding-home{padding:4rem 1.4rem}.funding-home-inner{grid-template-columns:1fr;gap:1.7rem}}
`;
  html = html.replace('</style>', styles + '\n</style>');

  const section = `
${marker}
<section class="funding-home" id="business-funding">
  <div class="funding-home-inner">
    <div>
      <div class="eyebrow">Business Funding Opportunities</div>
      <h2>Find a clearer path to business capital.</h2>
      <p>APROPOS now helps established companies and startups identify potential funding leads across grants, loans, and other business-capital pathways. Through the National Enterprise Business Center, business owners can assess readiness, clarify what funding may fit their purpose, and receive guided leads to programs worth investigating.</p>
      <div class="funding-home-actions">
        <a class="btn-navy" href="/business-funding/">Explore Funding Services</a>
        <a class="btn-gold" href="https://nebc.aproposgroupllc.com/">Visit NEBC</a>
      </div>
    </div>
    <aside class="funding-home-card" aria-label="Funding pathways">
      <strong>Funding pathways may include</strong>
      <ul><li>Grant opportunity leads</li><li>Business loan and working-capital leads</li><li>Startup and early-stage funding resources</li><li>Equipment and expansion financing pathways</li><li>Contract-to-capital and growth funding guidance</li></ul>
    </aside>
  </div>
</section>
<!-- APROPOS_BUSINESS_FUNDING_END -->
`;
  if (html.includes('</main>')) html = html.replace('</main>', section + '\n</main>');
  else if (html.includes('<footer')) html = html.replace('<footer', section + '\n<footer');
  else html = html.replace('</body>', section + '\n</body>');

  fs.writeFileSync(indexPath, html);
}

const dir = path.join(process.cwd(), 'business-funding');
fs.mkdirSync(dir, { recursive: true });
const page = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Business Funding Leads for Startups & Established Businesses | APROPOS</title>
<meta name="description" content="Explore APROPOS business funding services for startups and established businesses, including guided leads for grants, loans, working capital, equipment, expansion, and contract-to-capital pathways.">
<link rel="canonical" href="https://marketplace.aproposgroupllc.com/business-funding/">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta property="og:type" content="website"><meta property="og:site_name" content="APROPOS Marketing Marketplace"><meta property="og:title" content="Business Funding Leads | APROPOS"><meta property="og:description" content="Guided business funding leads for grants, loans, working capital, equipment, expansion, and other capital pathways."><meta property="og:url" content="https://marketplace.aproposgroupllc.com/business-funding/">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Service","name":"Business Funding Lead Guidance","serviceType":"Business funding opportunity guidance","provider":{"@type":"Organization","name":"APROPOS Group LLC","url":"https://aproposgroupllc.com/"},"url":"https://marketplace.aproposgroupllc.com/business-funding/","description":"Guided identification of potential business funding leads for startups and established businesses, including grants, loans, working capital, equipment, expansion, and contract-to-capital pathways.","areaServed":"US"}</script>
<style>
:root{--navy:#0e1d36;--navy2:#0b1830;--gold:#c8a84b;--gold2:#e4c878;--white:#fff;--silver:#d2d9e4;--muted:#9ca8bc;--paper:#f7f9fc;--ink:#182238}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:var(--ink);background:var(--paper);line-height:1.65}a{text-decoration:none}.nav{background:var(--navy);color:#fff;padding:1.15rem 6vw;display:flex;justify-content:space-between;align-items:center;gap:1rem}.brand{font-weight:700;letter-spacing:.08em}.nav a{color:#fff}.hero{background:linear-gradient(135deg,var(--navy),#162b4e);color:var(--silver);padding:7rem 7vw 6rem}.wrap{max-width:1120px;margin:auto}.eyebrow{color:var(--gold2);text-transform:uppercase;letter-spacing:.14em;font-size:.76rem;font-weight:700}.hero h1{color:#fff;font-family:Georgia,serif;font-weight:500;font-size:clamp(3rem,7vw,6.2rem);line-height:.95;max-width:980px;margin:.8rem 0 1.4rem}.hero p{font-size:1.15rem;max-width:790px}.actions{display:flex;flex-wrap:wrap;gap:.8rem;margin-top:2rem}.btn{display:inline-block;padding:.95rem 1.35rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:.78rem}.gold{background:var(--gold);color:var(--navy)}.outline{border:1px solid rgba(255,255,255,.35);color:#fff}.section{padding:5rem 7vw}.section h2{font-family:Georgia,serif;color:var(--navy);font-size:clamp(2.2rem,4vw,3.6rem);font-weight:500;line-height:1.05}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:2rem}.card{background:#fff;border:1px solid #dce2ea;padding:1.6rem}.card h3{color:var(--navy);margin-top:0}.dark{background:var(--navy2);color:var(--silver)}.dark h2{color:#fff}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem}.step{border-top:2px solid var(--gold);padding-top:1rem}.step b{color:var(--gold2)}.notice{background:#fff8e8;border-left:4px solid var(--gold);padding:1.3rem;margin-top:2rem}.final{background:#e9eef5;text-align:center}.final p{max-width:760px;margin:0 auto 1.5rem}@media(max-width:760px){.hero,.section{padding-left:1.3rem;padding-right:1.3rem}.grid,.steps{grid-template-columns:1fr}.nav{padding:1rem 1.3rem}}
</style></head><body>
<nav class="nav"><a class="brand" href="/">APROPOS MARKETING MARKETPLACE</a><a href="/">Marketplace Home</a></nav>
<header class="hero"><div class="wrap"><div class="eyebrow">Business Funding Services</div><h1>Funding leads built around where your business is going.</h1><p>Whether you are launching, stabilizing, expanding, purchasing equipment, preparing for a contract, or pursuing your next stage of growth, APROPOS helps you identify potential funding pathways and understand what to investigate next.</p><div class="actions"><a class="btn gold" href="https://nebc.aproposgroupllc.com/">Start with NEBC</a><a class="btn outline" href="#pathways">Explore Funding Pathways</a></div></div></header>
<main>
<section class="section" id="pathways"><div class="wrap"><div class="eyebrow">Capital pathways</div><h2>Guidance for established businesses and startups.</h2><p>Funding is rarely one-size-fits-all. The right lead depends on the business, the purpose of the capital, readiness, timing, financial information, and the requirements of the funding source.</p><div class="grid"><article class="card"><h3>Grants</h3><p>Potential public, private, local, industry, and program-specific grant leads where the business appears aligned with published eligibility and purpose.</p></article><article class="card"><h3>Business Loans</h3><p>Potential lending pathways for working capital, expansion, equipment, inventory, facilities, and other defined business needs.</p></article><article class="card"><h3>Startup Resources</h3><p>Funding leads and preparation guidance for newer businesses that may need to build financial, planning, or operating readiness before pursuing capital.</p></article><article class="card"><h3>Equipment & Expansion</h3><p>Potential financing routes for equipment purchases, capacity increases, facilities, hiring, and growth initiatives.</p></article><article class="card"><h3>Working Capital</h3><p>Potential sources that may support operating cash needs when the amount, purpose, repayment capacity, and timing are sufficiently defined.</p></article><article class="card"><h3>Contract-to-Capital</h3><p>Guidance for businesses evaluating capital needs connected to performing an awarded or anticipated government or commercial contract.</p></article></div></div></section>
<section class="section dark"><div class="wrap"><div class="eyebrow">How it works</div><h2>From business situation to actionable leads.</h2><div class="steps"><div class="step"><b>01 — Assess</b><h3>Understand the business.</h3><p>Start with business stage, operating profile, financial readiness, capital purpose, timing, and growth objective.</p></div><div class="step"><b>02 — Guide</b><h3>Clarify the funding path.</h3><p>NEBC guidance helps distinguish what appears ready for further evaluation from what requires preparation or specialist review.</p></div><div class="step"><b>03 — Investigate</b><h3>Review potential leads.</h3><p>Use identified grant, loan, and capital leads as starting points for direct review with the funding source and its current requirements.</p></div></div></div></section>
<section class="section"><div class="wrap"><div class="eyebrow">Important distinction</div><h2>We help you find and evaluate pathways. We do not promise funding.</h2><p>APROPOS and NEBC provide business-development guidance and potential funding leads. APROPOS is not representing itself as the lender, grantor, or approval authority for third-party funding programs.</p><div class="notice"><strong>No approval or award guarantee.</strong> Funding availability, eligibility, underwriting, application requirements, rates, terms, deadlines, and award decisions are controlled by the applicable third-party funding source and may change. Business owners should verify all current terms directly with that source before applying or making financial decisions.</div></div></section>
<section class="section final"><div class="wrap"><div class="eyebrow">National Enterprise Business Center</div><h2>Start with your business. Then find the funding path.</h2><p>Use NEBC to assess business readiness, work through your funding objective, and receive guidance toward potential grants, loans, and other capital resources worth investigating.</p><a class="btn gold" href="https://nebc.aproposgroupllc.com/">Explore Funding Through NEBC</a></div></section>
</main></body></html>`;
fs.writeFileSync(path.join(dir, 'index.html'), page);
console.log('Business funding marketplace pathway applied.');
