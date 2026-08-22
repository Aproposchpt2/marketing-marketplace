'use strict';

const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

const heroStart = html.indexOf('<section class="hero"');
if (heroStart < 0) throw new Error('[marketplace-suite] homepage hero not found');
const heroEnd = html.indexOf('</section>', heroStart);
if (heroEnd < 0) throw new Error('[marketplace-suite] homepage hero closing tag not found');
const footerStart = html.indexOf('<footer class="cca-footer">', heroEnd);
if (footerStart < 0) throw new Error('[marketplace-suite] homepage footer not found');

const fontHref = 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600;6..96,700&family=Cormorant:ital,wght@0,500;0,600;1,500;1,600&family=Jost:wght@300;400;500;600;700&display=swap';
if (!html.includes(fontHref)) {
  html = html.replace('</head>', `<link href="${fontHref}" rel="stylesheet">\n</head>`);
}

const nav = `<div class="cca-nav-links">
    <a href="#ecosystem">Production Sites</a>
    <a href="#procurement">Procurement</a>
    <a href="#business-growth">Business Growth</a>
    <a href="#business-technology">Business Technology</a>
    <a href="#marketplace-resources">Resources</a>
  </div>`;
html = html.replace(/<div class="cca-nav-links">[\s\S]*?<\/div>/, nav);

const css = `
/* APROPOS_MARKETPLACE_PRODUCTION_SUITE_START */
html,body{width:100%;max-width:100%;overflow-x:hidden}
.cca-nav{flex-wrap:wrap;gap:.8rem 1.25rem;max-width:100vw}
.cca-brand{min-width:0;max-width:min(520px,100%)}
.cca-name{min-width:0;overflow-wrap:anywhere}
.cca-nav-links{flex-wrap:wrap;justify-content:flex-end;gap:.8rem 1.35rem}
.promo-row{max-width:100vw;flex-wrap:wrap}
.promo-row a{max-width:100%;white-space:normal;text-align:center;justify-content:center}
.hero{min-height:min(860px,calc(100svh - 76px));overflow:hidden;background-position:center center}
.hero-inner{width:min(1180px,calc(100% - 48px));margin-inline:auto;padding:clamp(64px,8vw,112px) 0}
.hero-content{max-width:760px;min-width:0}
.hero-title{font-size:clamp(2.85rem,5vw,5rem)!important;line-height:.98!important;max-width:900px;overflow-wrap:normal}
.hero-subtitle{font-size:clamp(1.2rem,1.55vw,1.62rem)!important;max-width:690px}
.hero-copy,.marketplace-positioning-correction{max-width:720px;font-size:clamp(.98rem,1.18vw,1.08rem)!important}

.amm-production{--amm-navy:#0a1c3f;--amm-navy2:#0c2350;--amm-navy3:#112c63;--amm-gold:#c6a052;--amm-gold-light:#ead49c;--amm-gold-dark:#8a6a24;--amm-paper:#fbfcfd;--amm-paper2:#f1f4f8;--amm-ink:#16233b;--amm-muted:#526581;--amm-line:rgba(10,28,63,.13);font-family:'Jost',system-ui,sans-serif;background:var(--amm-paper);color:var(--amm-ink)}
.amm-production *{min-width:0}
.amm-band{padding:clamp(70px,7.6vw,112px) 0;border-bottom:1px solid var(--amm-line)}
.amm-band-dark{background:linear-gradient(145deg,#07152f 0%,var(--amm-navy) 55%,#102b60 100%);color:#d4deef;border-color:rgba(255,255,255,.12)}
.amm-band-soft{background:var(--amm-paper2)}
.amm-shell{width:min(1200px,calc(100% - 48px));margin:0 auto}
.amm-kicker{display:flex;align-items:center;gap:12px;font-size:.68rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--amm-gold-dark);margin-bottom:16px}
.amm-kicker:before{content:"";width:34px;height:1px;background:var(--amm-gold)}
.amm-band-dark .amm-kicker{color:var(--amm-gold-light)}
.amm-title{font-family:'Bodoni Moda',Georgia,serif;font-size:clamp(2.15rem,4.2vw,3.7rem);line-height:1.06;letter-spacing:-.025em;font-weight:600;color:var(--amm-ink);max-width:900px;margin:0 0 20px}
.amm-title em{font-family:'Cormorant',Georgia,serif;font-weight:600;color:var(--amm-gold-dark)}
.amm-band-dark .amm-title{color:#fff}.amm-band-dark .amm-title em{color:var(--amm-gold-light)}
.amm-lead{font-size:clamp(1rem,1.25vw,1.15rem);line-height:1.75;color:var(--amm-muted);max-width:880px}
.amm-band-dark .amm-lead{color:#c3cee0}
.amm-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-top:42px}
.amm-card{display:flex;flex-direction:column;background:#fff;border:1px solid var(--amm-line);border-radius:14px;padding:28px;box-shadow:0 14px 34px rgba(10,28,63,.06);min-height:300px}
.amm-card-featured{border-top:3px solid var(--amm-gold)}
.amm-card-tag{font-size:.62rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--amm-gold-dark);margin-bottom:15px}
.amm-card h3{font-family:'Bodoni Moda',Georgia,serif;font-size:1.48rem;line-height:1.16;color:var(--amm-navy);margin:0 0 13px}
.amm-card p{color:var(--amm-muted);line-height:1.7;margin:0 0 20px}
.amm-card-meta{font-size:.79rem;font-weight:600;color:var(--amm-navy);padding-top:2px;margin-bottom:20px}
.amm-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:auto}
.amm-btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:4px;font-size:.67rem;font-weight:700;letter-spacing:.105em;text-transform:uppercase;text-decoration:none;transition:.2s;border:1px solid transparent;text-align:center}
.amm-btn-primary{background:linear-gradient(135deg,var(--amm-gold-dark),var(--amm-gold));color:#07152f}
.amm-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(198,160,82,.25)}
.amm-btn-outline{background:#fff;border-color:rgba(10,28,63,.22);color:var(--amm-navy)}
.amm-btn-outline:hover{border-color:var(--amm-gold-dark);color:var(--amm-gold-dark)}
.amm-band-dark .amm-card{background:rgba(10,30,66,.78);border-color:rgba(255,255,255,.13);box-shadow:none}
.amm-band-dark .amm-card h3{color:#fff}.amm-band-dark .amm-card p{color:#c3cee0}.amm-band-dark .amm-card-meta{color:var(--amm-gold-light)}
.amm-band-dark .amm-btn-outline{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.28);color:#fff}
.amm-band-dark .amm-btn-outline:hover{border-color:var(--amm-gold-light);color:var(--amm-gold-light)}
.amm-paths{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:rgba(198,160,82,.35);border:1px solid rgba(198,160,82,.35);margin-top:42px;border-radius:14px;overflow:hidden}
.amm-path{background:#081a3a;padding:26px}.amm-path strong{display:block;font-family:'Bodoni Moda',Georgia,serif;font-size:1.2rem;color:#fff;margin-bottom:8px}.amm-path span{font-size:.88rem;line-height:1.6;color:#bac8de}
.amm-resource-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:36px}
.amm-resource{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 20px;border:1px solid var(--amm-line);background:#fff;border-radius:8px;color:var(--amm-navy);font-weight:600;text-decoration:none}
.amm-resource:hover{border-color:var(--amm-gold);color:var(--amm-gold-dark)}
.amm-resource span{color:var(--amm-gold-dark)}
.amm-trust{display:grid;grid-template-columns:1.15fr .85fr;gap:42px;align-items:center}
.amm-trust-panel{background:#fff;border:1px solid var(--amm-line);border-radius:14px;padding:30px}
.amm-trust-panel strong{display:block;font-family:'Bodoni Moda',Georgia,serif;font-size:1.45rem;color:var(--amm-navy);margin-bottom:10px}
.amm-trust-panel p{color:var(--amm-muted);line-height:1.7;margin:0}
.amm-price-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:38px}
.amm-price{background:#fff;border:1px solid var(--amm-line);border-radius:12px;padding:26px}.amm-price h3{font-family:'Bodoni Moda',Georgia,serif;color:var(--amm-navy);font-size:1.35rem;margin-bottom:10px}.amm-price strong{display:block;font-size:1rem;color:var(--amm-gold-dark);margin-bottom:12px}.amm-price p{color:var(--amm-muted);line-height:1.65;margin-bottom:20px}
.amm-footer{background:#041027;color:#aebbd0;padding:48px 0 26px;font-family:'Jost',system-ui,sans-serif;border-top:1px solid rgba(255,255,255,.1)}
.amm-footer-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:40px;align-items:start}.amm-footer h3{font-family:'Bodoni Moda',Georgia,serif;color:#fff;font-size:1.35rem;margin-bottom:9px}.amm-footer p{max-width:640px;line-height:1.65}.amm-footer-links{display:flex;flex-wrap:wrap;gap:12px 20px;justify-content:flex-end}.amm-footer-links a{color:#d4deef;font-size:.8rem;text-decoration:none}.amm-footer-links a:hover{color:var(--amm-gold-light)}.amm-footer-bottom{border-top:1px solid rgba(255,255,255,.1);margin-top:30px;padding-top:20px;font-size:.75rem;line-height:1.6}
@media(min-width:1500px){.hero-inner{width:min(1200px,calc(100% - 72px))}.hero-title{font-size:4.9rem!important}.amm-shell{width:min(1200px,calc(100% - 72px))}}
@media(max-width:1100px){.cca-nav-links{display:none}.hero{min-height:auto}.hero-inner{padding:76px 0 82px}.amm-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.amm-paths{grid-template-columns:repeat(2,minmax(0,1fr))}.amm-price-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.amm-trust{grid-template-columns:1fr}.amm-footer-grid{grid-template-columns:1fr}.amm-footer-links{justify-content:flex-start}}
@media(max-width:760px){.cca-nav{padding:1rem 1.15rem}.cca-brand{max-width:calc(100% - 4px)}.cca-name{font-size:.92rem}.promo-row{padding:1rem 1.15rem}.promo-row a{width:100%}.hero{background-position:64% center}.hero-inner{width:min(100% - 30px,1180px);padding:58px 0 66px}.hero-title{font-size:clamp(2.45rem,12vw,3.55rem)!important;line-height:1.02!important}.hero-title br,.hero-subtitle br{display:none}.hero-subtitle{font-size:1.12rem!important}.hero-copy,.marketplace-positioning-correction{font-size:.98rem!important}.amm-band{padding:58px 0}.amm-shell{width:min(100% - 30px,1200px)}.amm-grid,.amm-price-grid,.amm-resource-grid,.amm-paths{grid-template-columns:1fr}.amm-card{min-height:0;padding:24px}.amm-actions{flex-direction:column}.amm-btn{width:100%}.amm-title{font-size:clamp(2rem,10vw,2.75rem)}.amm-lead{font-size:1rem}.amm-footer{padding-top:38px}}
@media(max-width:420px){.cca-mark{display:none}.cca-name{font-size:.86rem}.cca-name small{font-size:.5rem}.hero-inner{width:calc(100% - 24px)}.amm-shell{width:calc(100% - 24px)}.amm-card,.amm-price,.amm-trust-panel{padding:21px}}
/* APROPOS_MARKETPLACE_PRODUCTION_SUITE_END */
`;
if (!html.includes('APROPOS_MARKETPLACE_PRODUCTION_SUITE_START')) {
  if (!html.includes('</style>')) throw new Error('[marketplace-suite] style closing tag missing');
  html = html.replace('</style>', `${css}\n</style>`);
}

const suite = `
<div class="amm-production">
<section class="amm-band amm-band-soft" id="ecosystem">
  <div class="amm-shell">
    <div class="amm-kicker">APROPOS Production Ecosystem</div>
    <h2 class="amm-title">One company. Multiple production platforms. <em>One clear next step.</em></h2>
    <p class="amm-lead">APROPOS Marketing Marketplace is the public discovery and conversion hub for the current APROPOS Group LLC ecosystem. Explore the production platform that matches your business need — federal contracting, state and local procurement, business development, workflow automation, or website creation.</p>
    <div class="amm-grid">
      <article class="amm-card amm-card-featured">
        <div class="amm-card-tag">Federal Procurement</div>
        <h3>Registered Federal Contractors Portal</h3>
        <p>Personalized federal procurement intelligence for businesses registered to pursue federal contracting opportunities.</p>
        <div class="amm-card-meta">14-day free trial · $99/month after trial</div>
        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://federalcontractorportal.aproposgroupllc.com/">Visit Federal Portal</a><a class="amm-btn amm-btn-outline" href="/federal-contract-opportunities/">Learn About Federal Opportunities</a></div>
      </article>
      <article class="amm-card amm-card-featured">
        <div class="amm-card-tag">State & Local Procurement</div>
        <h3>NAT-CORP Contract Exchange</h3>
        <p>Personalized state and local procurement intelligence for licensed contractors, with current multi-state coverage and continued expansion.</p>
        <div class="amm-card-meta">14-day free trial · $119/month after trial</div>
        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://natcorp.aproposgroupllc.com/">Visit NAT-CORP</a><a class="amm-btn amm-btn-outline" href="/state-local-contract-opportunities/">Explore State & Local Opportunities</a></div>
      </article>
      <article class="amm-card amm-card-featured">
        <div class="amm-card-tag">Business Development</div>
        <h3>National Enterprise Business Center</h3>
        <p>An online full-service business center supporting assessment, readiness, planning, growth, funding guidance, and procurement preparation.</p>
        <div class="amm-card-meta">14-day free trial · $39/month after trial</div>
        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://nebc.aproposgroupllc.com/">Visit NEBC</a><a class="amm-btn amm-btn-outline" href="/business-contract-readiness/">Business Readiness Guide</a></div>
      </article>
      <article class="amm-card">
        <div class="amm-card-tag">Business Automation</div>
        <h3>AI4 Businesses</h3>
        <p>Practical workflow automation systems for call handling, lead capture, customer intake, routing, response management, and structured follow-up.</p>
        <div class="amm-card-meta">Live demos available</div>
        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://ai4businesses.org/">Explore AI4 Businesses</a></div>
      </article>
      <article class="amm-card">
        <div class="amm-card-tag">Website Creation</div>
        <h3>AI4 Website Design Studio</h3>
        <p>AI-powered website creation for business and personal sites with multiple design systems and a same-day preview experience.</p>
        <div class="amm-card-meta">English + Español experiences</div>
        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://ai4websitedesign.com/">Build in English</a><a class="amm-btn amm-btn-outline" href="https://espanola.ai4websitedesign.com/">Sitio en Español</a></div>
      </article>
      <article class="amm-card">
        <div class="amm-card-tag">Corporate Authority</div>
        <h3>APROPOS Group LLC</h3>
        <p>The parent organization behind the APROPOS business-development, procurement-intelligence, marketing, and business-technology ecosystem.</p>
        <div class="amm-card-meta">Corporate · Partnerships · Capabilities</div>
        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://aproposgroupllc.com/">Visit Corporate Headquarters</a></div>
      </article>
    </div>
  </div>
</section>

<section class="amm-band amm-band-dark" id="procurement">
  <div class="amm-shell">
    <div class="amm-kicker">Procurement Intelligence</div>
    <h2 class="amm-title">Start with the market your business is <em>actually pursuing.</em></h2>
    <p class="amm-lead">APROPOS separates federal and state/local procurement into dedicated production pathways, while NEBC supports the business-readiness and development work that helps companies prepare for growth.</p>
    <div class="amm-grid">
      <article class="amm-card"><div class="amm-card-tag">Federal</div><h3>Registered Federal Contractors Portal</h3><p>For registered federal contractors seeking personalized opportunity intelligence and a clearer path through federal solicitations.</p><div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://federalcontractorportal.aproposgroupllc.com/">Open Federal Portal</a></div></article>
      <article class="amm-card"><div class="amm-card-tag">State & Local</div><h3>NAT-CORP Contract Exchange</h3><p>For licensed businesses pursuing state, local, institutional, and public-sector opportunities through a dedicated contract exchange.</p><div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://natcorp.aproposgroupllc.com/">Open NAT-CORP</a></div></article>
      <article class="amm-card"><div class="amm-card-tag">Prepare & Grow</div><h3>National Enterprise Business Center</h3><p>For businesses that need assessment, development guidance, readiness support, funding pathways, or structured preparation before the next opportunity.</p><div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://nebc.aproposgroupllc.com/">Open NEBC</a></div></article>
    </div>
    <div class="amm-paths" aria-label="APROPOS procurement journey">
      <div class="amm-path"><strong>01 · Prepare</strong><span>Clarify the business, capabilities, readiness, and growth objectives.</span></div>
      <div class="amm-path"><strong>02 · Discover</strong><span>Use the correct federal or state/local production platform to identify relevant opportunity.</span></div>
      <div class="amm-path"><strong>03 · Understand</strong><span>Review requirements, fit, risks, questions, and the official solicitation before committing resources.</span></div>
      <div class="amm-path"><strong>04 · Decide</strong><span>The business remains in control of whether and how to pursue each opportunity.</span></div>
    </div>
  </div>
</section>

<section class="amm-band" id="business-growth">
  <div class="amm-shell amm-trust">
    <div>
      <div class="amm-kicker">Business Growth</div>
      <h2 class="amm-title">Business development does not stop at <em>contract discovery.</em></h2>
      <p class="amm-lead">NEBC extends the ecosystem beyond procurement search. Businesses can begin with an assessment, receive a personalized report, continue into Morgan’s Office, and move toward the department or service pathway appropriate to the business situation.</p>
      <div class="amm-actions" style="margin-top:28px"><a class="amm-btn amm-btn-primary" href="https://nebc.aproposgroupllc.com/">Start at NEBC</a><a class="amm-btn amm-btn-outline" href="/business-contract-readiness/">Explore Business Readiness</a></div>
    </div>
    <aside class="amm-trust-panel"><strong>Built around the business first.</strong><p>APROPOS platforms are designed to reduce the amount of searching, sorting, and disconnected decision-making a business must do before it reaches the right opportunity or service path.</p></aside>
  </div>
</section>

<section class="amm-band amm-band-soft" id="business-technology">
  <div class="amm-shell">
    <div class="amm-kicker">Business Technology</div>
    <h2 class="amm-title">Market the business. Automate the workflow. <em>Operate with more structure.</em></h2>
    <p class="amm-lead">The APROPOS ecosystem also includes production technology built for everyday business operations — from website creation to customer intake, call handling, lead management, routing, and follow-up.</p>
    <div class="amm-grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">
      <article class="amm-card amm-card-featured"><div class="amm-card-tag">AI4 Businesses</div><h3>Automation systems built for the way businesses operate today.</h3><p>Explore practical automation for smart call routing, lead management, AI voice response, business intake, and other structured workflows. Live demos let businesses experience the systems before committing.</p><div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://ai4businesses.org/">Explore Automation Systems</a></div></article>
      <article class="amm-card amm-card-featured"><div class="amm-card-tag">AI4 Website Design Studio</div><h3>Turn business information into a professional website experience.</h3><p>Provide the business details, generate a site, review the preview, and explore alternate designs. The production experience supports both English and Spanish pathways.</p><div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://ai4websitedesign.com/">English Website Studio</a><a class="amm-btn amm-btn-outline" href="https://espanola.ai4websitedesign.com/">Estudio en Español</a></div></article>
    </div>
  </div>
</section>

<section class="amm-band" id="marketplace-resources">
  <div class="amm-shell">
    <div class="amm-kicker">Marketplace Resource Library</div>
    <h2 class="amm-title">Learn the pathway before you <em>choose the platform.</em></h2>
    <p class="amm-lead">The Marketplace’s search-optimized guides remain available as educational entry points. They explain major opportunity and readiness topics, then route visitors toward the production APROPOS property that owns the operational experience.</p>
    <div class="amm-resource-grid">
      <a class="amm-resource" href="/government-contract-intelligence/">Government Contract Intelligence <span>→</span></a>
      <a class="amm-resource" href="/federal-contract-opportunities/">Federal Contract Opportunities <span>→</span></a>
      <a class="amm-resource" href="/state-local-contract-opportunities/">State & Local Contract Opportunities <span>→</span></a>
      <a class="amm-resource" href="/contractor-opportunity-matching/">Contractor Opportunity Matching <span>→</span></a>
      <a class="amm-resource" href="/contract-fit-analysis/">Contract Fit Analysis <span>→</span></a>
      <a class="amm-resource" href="/business-contract-readiness/">Business Contract Readiness <span>→</span></a>
      <a class="amm-resource" href="/contractor-participation/">Contractor Participation <span>→</span></a>
      <a class="amm-resource" href="/procurement-partnerships/">Procurement Partnerships <span>→</span></a>
      <a class="amm-resource" href="/government-proposal-development/">Proposal Development Guide <span>→</span></a>
    </div>
  </div>
</section>

<section class="amm-band amm-band-dark" id="current-access">
  <div class="amm-shell">
    <div class="amm-kicker">Current Subscription Access</div>
    <h2 class="amm-title">Choose the production service that matches <em>your next move.</em></h2>
    <p class="amm-lead">Current subscription programs begin with a 14-day free trial. Pricing and availability remain subject to the current terms published by the applicable production property.</p>
    <div class="amm-price-grid">
      <article class="amm-price"><h3>Registered Federal Contractors Portal</h3><strong>14-day free trial · then $99/month</strong><p>Federal procurement intelligence for registered federal contractors.</p><a class="amm-btn amm-btn-primary" href="https://federalcontractorportal.aproposgroupllc.com/">Visit Federal Portal</a></article>
      <article class="amm-price"><h3>NAT-CORP Contract Exchange</h3><strong>14-day free trial · then $119/month</strong><p>State and local procurement intelligence for licensed contractors.</p><a class="amm-btn amm-btn-primary" href="https://natcorp.aproposgroupllc.com/">Visit NAT-CORP</a></article>
      <article class="amm-price"><h3>National Enterprise Business Center</h3><strong>14-day free trial · then $39/month</strong><p>Business development, readiness, growth, and guided support.</p><a class="amm-btn amm-btn-primary" href="https://nebc.aproposgroupllc.com/">Visit NEBC</a></article>
    </div>
  </div>
</section>

<section class="amm-band amm-band-soft" id="corporate-authority">
  <div class="amm-shell amm-trust">
    <div><div class="amm-kicker">APROPOS Group LLC</div><h2 class="amm-title">A connected ecosystem with a <em>single corporate authority.</em></h2><p class="amm-lead">APROPOS Group LLC is the parent organization behind the Marketplace and its production business-development, procurement-intelligence, and business-technology properties. Corporate capabilities, partnerships, and institutional inquiries remain anchored at the APROPOS corporate site.</p><div class="amm-actions" style="margin-top:28px"><a class="amm-btn amm-btn-primary" href="https://aproposgroupllc.com/">Visit APROPOS Group LLC</a></div></div>
    <aside class="amm-trust-panel"><strong>Private company. Business-first guidance.</strong><p>APROPOS is an independent private company, not a government agency. Government opportunity information should always be verified against the official solicitation and authoritative source before a business makes a bid or investment decision.</p></aside>
  </div>
</section>
</div>
`;

const prefix = html.slice(0, heroEnd + '</section>'.length);
html = prefix + '\n' + suite + '\n' + html.slice(footerStart);

const footer = `<footer class="amm-footer">
  <div class="amm-shell">
    <div class="amm-footer-grid">
      <div><h3>APROPOS Marketing Marketplace</h3><p>The public discovery and conversion hub for the current APROPOS Group LLC ecosystem.</p></div>
      <div class="amm-footer-links">
        <a href="https://federalcontractorportal.aproposgroupllc.com/">Federal Contractors Portal</a>
        <a href="https://natcorp.aproposgroupllc.com/">NAT-CORP</a>
        <a href="https://nebc.aproposgroupllc.com/">NEBC</a>
        <a href="https://ai4businesses.org/">AI4 Businesses</a>
        <a href="https://ai4websitedesign.com/">AI4 Website Design</a>
        <a href="https://espanola.ai4websitedesign.com/">Español</a>
        <a href="https://aproposgroupllc.com/">APROPOS Group LLC</a>
      </div>
    </div>
    <div class="amm-footer-bottom">© 2026 APROPOS Group LLC. All rights reserved. APROPOS is an independent private company and is not affiliated with, endorsed by, or a subdivision of any federal or state government agency. Government opportunity information must be verified against the official solicitation and authoritative source.</div>
  </div>
</footer>`;
html = html.replace(/<footer class="cca-footer">[\s\S]*?<\/footer>/, footer);

fs.writeFileSync(file, html, 'utf8');
console.log('[marketplace-suite] PASS — responsive production-suite marketing presentation applied while preserving the approved hero');