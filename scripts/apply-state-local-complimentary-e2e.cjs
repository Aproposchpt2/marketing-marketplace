const fs=require('fs');
const file='index.html';
let html=fs.readFileSync(file,'utf8');

if(!html.includes('id="complimentaryClaimCta"')){
  const anchor=/<a\b([^>]*\bhref=["']\/claim-opportunity\.html["'][^>]*)>([\s\S]*?CLAIM\s+YOUR\s+COMPLIMENTARY\s+CONTRACT\s+OPPORTUNITY[\s\S]*?)<\/a>/i;
  if(!anchor.test(html))throw new Error('[state-local-e2e] homepage complimentary CTA marker not found');
  html=html.replace(anchor,(whole,attrs,label)=>`<a id="complimentaryClaimCta"${attrs}>${label}</a>`);
}
html=html.replace(/<script id="complimentaryReferenceHandoff">[\s\S]*?<\/script>\s*/g,'');
html=html.replace(/(<a\b[^>]*id="complimentaryClaimCta"[^>]*href=["'])\/claim-opportunity\.html\?ref=[^"']*(["'])/i,'$1/claim-opportunity.html$2');
fs.writeFileSync(file,html,'utf8');
console.log('[state-local-e2e] Marketplace homepage CTA preserved without reference handoff');
