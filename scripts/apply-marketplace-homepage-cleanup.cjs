'use strict';
const fs=require('fs');
const file='index.html';
let s=fs.readFileSync(file,'utf8');
function all(from,to,label){if(!s.includes(from))throw new Error(`[marketplace-cleanup] missing ${label}`);s=s.split(from).join(to);}

// Customer-experience patch runs first and already owns the three-part proof strip.
// This pass removes retired product language, corrects pricing metadata, and adds
// final responsive/contrast overrides without duplicating the proof content.
all('contractor participation resources, proposal development services, and business readiness solutions','contractor participation resources, contract analysis services, and business readiness solutions','meta description');
all('federal opportunities, state procurement pathways, proposal development, and business readiness resources','federal opportunities, state procurement pathways, contract analysis, and business readiness resources','social description');
all('government contract intelligence, proposal support, campaigns, and institutional partnership pathways','government contract intelligence, contract analysis, campaigns, and institutional partnership pathways','organization schema');
all('government contract intelligence, Analyze Fit services, free trials, proposal support, and partnership opportunities','government contract intelligence, Analyze Fit services, free trials, contractor participation, and partnership opportunities','website schema');
all('"name":"Additional Analyze Fit Report"','"name":"Analyze Fit Report"','Analyze Fit schema name');
all('"description":"An additional one-time opportunity-fit analysis report."','"description":"A one-time plain-language contract analysis and opportunity-fit report."','Analyze Fit schema description');
all('"name":"Analyze Fit Report","price":"15.00"','"name":"Analyze Fit Report","price":"49.99"','Analyze Fit schema price');
all('The Contract Development Center is what turns a match into a submitted, competitive proposal — and makes sure you never miss the next one. Every service here is paid, priced per use or by subscription, and available the moment a business is ready to actively compete rather than simply search.','Analyze Fit helps a business understand the contract before deciding whether to pursue it. The service translates solicitation requirements, deadlines, qualifications, risks, and key considerations into clear, practical language without changing the business’s control of the decision.','development intro');
all('Use these focused guides to understand the opportunity, readiness, participation, analysis, or proposal pathway before continuing to the appropriate APROPOS operational service.','Use these focused guides to understand the opportunity, readiness, participation, or analysis pathway before continuing to the appropriate APROPOS operational service.','directory copy');

if(!s.includes('aria-label="How Apropos works"')) throw new Error('[marketplace-cleanup] existing authority proof strip missing');
const css=`\n/* Final homepage presentation cleanup */\n.hero-inner{width:min(1180px,calc(100% - 40px));margin-inline:auto}\n.marketplace-positioning-correction,.hero-copy{max-width:780px}\n.btn-gold,.btn-outline{display:inline-flex!important;align-items:center;justify-content:center;min-height:48px;padding:.82rem 1.15rem!important;font-weight:700!important;line-height:1.25!important;text-align:center}\n.btn-gold{background:var(--gold)!important;color:var(--navy)!important}\n.btn-outline{color:var(--white)!important;border-color:rgba(255,255,255,.48)!important;background:rgba(255,255,255,.04)!important}\n.apropos-proof-strip{border-radius:12px;overflow:hidden}\n@media(max-width:760px){.hero-inner{width:min(100% - 28px,1180px)}.hero-title{font-size:clamp(2.65rem,13vw,4.2rem)!important;max-width:none}.btn-gold,.btn-outline{width:100%;white-space:normal}}\n`;
if(!s.includes('</style>'))throw new Error('[marketplace-cleanup] style marker missing');
s=s.replace('</style>',`${css}</style>`);
fs.writeFileSync(file,s,'utf8');
console.log('[marketplace-cleanup] product-language, Analyze Fit pricing, and responsive CTA cleanup applied');
