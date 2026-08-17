'use strict';
const fs=require('fs');
const file='index.html';
let html=fs.readFileSync(file,'utf8');

if(!html.includes('apropos-customer-experience-style')){
  const style=`<style id="apropos-customer-experience-style">
  .promo-row .btn-gold{font-size:clamp(.78rem,.7rem + .18vw,.92rem)!important;font-weight:700!important;letter-spacing:.035em!important;padding:1rem 1.55rem!important;line-height:1.25!important}
  .apropos-proof-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin-top:2rem;border:1px solid rgba(200,168,75,.24);background:rgba(200,168,75,.18);max-width:900px}
  .apropos-proof{background:rgba(7,20,39,.88);padding:1.25rem 1.35rem}.apropos-proof strong{display:block;color:#E4C878;font-family:'Syncopate',sans-serif;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;margin-bottom:.55rem}.apropos-proof span{display:block;color:#D2D9E4;font-size:.92rem;line-height:1.55}
  @media(min-width:1180px){.hero-inner{width:min(1600px,100%)!important;max-width:1600px!important;padding-left:clamp(3rem,5vw,7rem)!important;padding-right:clamp(3rem,5vw,7rem)!important}.hero-content{max-width:680px!important}.hero-title{font-size:clamp(3.65rem,4.25vw,5.8rem)!important;line-height:.96!important;letter-spacing:-.02em!important}.hero-copy{max-width:650px!important}.hero-subtitle{font-size:clamp(1.25rem,1.4vw,1.65rem)!important}}
  @media(max-width:800px){.apropos-proof-strip{grid-template-columns:1fr}.hero-title br{display:none}.promo-row .btn-gold{width:100%;justify-content:center;text-align:center}}
  </style>`;
  html=html.replace('</head>',style+'</head>');
}

const anchor=`<p class="hero-copy">Whether you're a startup with no contract history, a prime contractor short on vetted subs, or a business ready to compete for real — the Marketplace was built for the moment you're in right now.</p>`;
if(html.includes(anchor)&&!html.includes('apropos-proof-strip')){
  const proof=`${anchor}\n      <div class="apropos-proof-strip" aria-label="How Apropos works">\n        <div class="apropos-proof"><strong>We Find the Opportunity</strong><span>Apropos identifies government contracts aligned with registered businesses.</span></div>\n        <div class="apropos-proof"><strong>We Deliver the Contract</strong><span>Selected businesses receive complimentary contract opportunities directly.</span></div>\n        <div class="apropos-proof"><strong>You Decide Whether to Pursue</strong><span>Review the contract, requirements and documents before deciding your next move.</span></div>\n      </div>`;
  html=html.replace(anchor,proof);
}

html=html.replace('Discover APROPOS government contract services, federal and state opportunity pathways, business readiness resources, contractor participation, proposal development services, and business growth solutions through the APROPOS Marketing Marketplace.','Discover APROPOS government contract opportunities, federal and state opportunity pathways, Analyze Fit contract intelligence, contractor participation resources, and business growth solutions through the APROPOS Marketing Marketplace.');
html=html.replace('One marketplace, three services, a single purpose: close the gap between the work that needs doing and the businesses ready to do it.','One marketplace, one purpose: close the gap between the work that needs doing and the businesses ready to do it.');

fs.writeFileSync(file,html,'utf8');
console.log('[marketplace-customer-experience] homepage authority proof and responsive improvements applied');
