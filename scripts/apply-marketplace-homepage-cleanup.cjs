'use strict';
const fs=require('fs');
const file='index.html';
let s=fs.readFileSync(file,'utf8');
function all(from,to,label){if(!s.includes(from))throw new Error(`[marketplace-cleanup] missing ${label}`);s=s.split(from).join(to);}

// Customer-experience patch runs first and already owns the three-part proof strip.
// This pass removes retired product language, corrects pricing metadata, strengthens
// intent routing, and adds final responsive/accessibility overrides without
// modifying the approved homepage image.
all('contractor participation resources, proposal development services, and business readiness solutions','contractor participation resources, contract analysis services, and business readiness solutions','meta description');
all('federal opportunities, state procurement pathways, proposal development, and business readiness resources','federal opportunities, state procurement pathways, contract analysis, and business readiness resources','social description');
all('government contract intelligence, proposal support, campaigns, and institutional partnership pathways','government contract intelligence, contract analysis, campaigns, and institutional partnership pathways','organization schema');
all('government contract intelligence, Analyze Fit services, free trials, proposal support, and partnership opportunities','government contract intelligence, Analyze Fit services, free trials, contractor participation, and partnership opportunities','website schema');
all('"name":"Additional Analyze Fit Report"','"name":"Analyze Fit Report"','Analyze Fit schema name');
all('"description":"An additional one-time opportunity-fit analysis report."','"description":"A one-time plain-language contract analysis and opportunity-fit report."','Analyze Fit schema description');
all('"name":"Analyze Fit Report","price":"15.00"','"name":"Analyze Fit Report","price":"79.00"','Analyze Fit schema price');
all('The Contract Development Center is what turns a match into a submitted, competitive proposal — and makes sure you never miss the next one. Every service here is paid, priced per use or by subscription, and available the moment a business is ready to actively compete rather than simply search.','Analyze Fit helps a business understand the contract before deciding whether to pursue it. The service translates solicitation requirements, deadlines, qualifications, risks, and key considerations into clear, practical language without changing the business’s control of the decision.','development intro');
all('Use these focused guides to understand the opportunity, readiness, participation, analysis, or proposal pathway before continuing to the appropriate APROPOS operational service.','Use these focused guides to understand the opportunity, readiness, participation, or analysis pathway before continuing to the appropriate APROPOS operational service.','directory copy');

// Retired-service integrity: the former Contract Development Center is no longer
// promoted as a current Marketplace destination.
if(s.includes('Contract Development Center')){
  s=s.split('Contract Development Center').join('Contract Analysis & Next-Step Support');
}

// Avoid implying that APROPOS delivers an awarded contract.
if(s.includes('We Deliver the Contract')){
  s=s.split('We Deliver the Contract').join('We Deliver the Opportunity');
}

// A generic Marketplace CTA must not default every visitor to the federal portal.
const federalTrial='<a class="btn-gold" href="https://federalcontractorportal.aproposgroupllc.com/onboarding">Start Your 14-Day Free Trial &rarr;</a>';
if(s.includes(federalTrial)){
  s=s.replace(federalTrial,'<a class="btn-gold" href="#marketplace-directory" data-marketplace-route="directory" data-intent="choose_path">Choose Your Contracting Path &rarr;</a>');
}

// Corporate authority must be a visible, contextual destination rather than plain text.
const corporateText='A marketplace by Apropos Group LLC';
if(s.includes(corporateText)){
  s=s.replace(corporateText,'<a href="https://aproposgroupllc.com/" data-marketplace-route="corporate" data-intent="corporate_ai">A marketplace by APROPOS Group LLC &middot; Corporate &amp; AI Procurement</a>');
}

// Attach destination metadata to approved downstream property links for GA4 routing measurement.
s=s.replaceAll('href="https://federalcontractorportal.aproposgroupllc.com','data-marketplace-route="rfcp" data-intent="federal" href="https://federalcontractorportal.aproposgroupllc.com');
s=s.replaceAll('href="https://natcorp.aproposgroupllc.com','data-marketplace-route="natcorp" data-intent="state_local" href="https://natcorp.aproposgroupllc.com');
s=s.replaceAll('href="https://nebc.aproposgroupllc.com','data-marketplace-route="nebc" data-intent="business_readiness" href="https://nebc.aproposgroupllc.com');

if(!s.includes('aria-label="How Apropos works"')) throw new Error('[marketplace-cleanup] existing authority proof strip missing');
const css=`\n/* Final homepage presentation cleanup */\n.hero-inner{width:min(1180px,calc(100% - 40px));margin-inline:auto}\n.marketplace-positioning-correction,.hero-copy{max-width:780px}\n.btn-gold,.btn-outline{display:inline-flex!important;align-items:center;justify-content:center;min-height:48px;padding:.82rem 1.15rem!important;font-weight:700!important;line-height:1.25!important;text-align:center}\n.btn-gold{background:var(--gold)!important;color:var(--navy)!important}\n.btn-outline{color:var(--white)!important;border-color:rgba(255,255,255,.48)!important;background:rgba(255,255,255,.04)!important}\n.apropos-proof-strip{border-radius:12px;overflow:hidden}\n@media(max-width:760px){.hero-inner{width:min(100% - 28px,1180px)}.hero-title{font-size:clamp(2.65rem,13vw,4.2rem)!important;max-width:none}.btn-gold,.btn-outline{width:100%;white-space:normal}.cca-nav{align-items:flex-start}.cca-nav-links{display:flex!important;width:100%;justify-content:center;gap:.55rem 1rem!important;padding-top:.35rem}.cca-nav-links a{font-size:.72rem;line-height:1.35}.cca-nav-cta{min-height:44px;display:inline-flex;align-items:center;justify-content:center}}\n`;
if(!s.includes('</style>'))throw new Error('[marketplace-cleanup] style marker missing');
s=s.replace('</style>',`${css}</style>`);

// Lightweight GA4 pathway instrumentation. The claim event remains separately owned.
if(!s.includes('marketplace_route_click')){
  const analytics=`<script>\n(function(){\n  document.addEventListener('click',function(event){\n    var link=event.target.closest&&event.target.closest('a[data-marketplace-route]');\n    if(!link||typeof gtag!=='function')return;\n    gtag('event','marketplace_route_click',{\n      destination:link.getAttribute('data-marketplace-route')||'',\n      intent:link.getAttribute('data-intent')||'',\n      source_page:location.pathname,\n      link_url:link.href,\n      transport_type:'beacon'\n    });\n  });\n})();\n</script>`;
  if(!s.includes('</body>'))throw new Error('[marketplace-cleanup] body marker missing for analytics');
  s=s.replace('</body>',`${analytics}\n</body>`);
}

const failures=[];
if(s.includes('Contract Development Center'))failures.push('retired Contract Development Center promotion remains');
if(s.includes('We Deliver the Contract'))failures.push('ambiguous contract-delivery proof remains');
if(s.includes('Start Your 14-Day Free Trial')&&s.includes('federalcontractorportal.aproposgroupllc.com/onboarding'))failures.push('generic free-trial CTA still defaults to RFCP');
if(!s.includes('data-marketplace-route="corporate"'))failures.push('corporate authority handoff missing');
if(!s.includes('marketplace_route_click'))failures.push('GA4 route event missing');
if(!s.includes('.cca-nav-links{display:flex!important'))failures.push('mobile navigation links are not restored');
if(failures.length){console.error('[marketplace-cleanup] validation failed:');failures.forEach(f=>console.error(`- ${f}`));process.exit(1);}

fs.writeFileSync(file,s,'utf8');
console.log('[marketplace-cleanup] PASS — message integrity, intent routing, corporate handoff, mobile navigation, GA4 route events, and $79 Analyze Fit cleanup applied; homepage image untouched');
