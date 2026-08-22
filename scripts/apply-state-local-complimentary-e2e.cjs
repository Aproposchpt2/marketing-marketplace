const fs=require('fs');
const file='index.html';
let html=fs.readFileSync(file,'utf8');

if(!html.includes('id="complimentaryClaimCta"')){
  const anchor=/<a\b([^>]*\bhref=["']\/claim-opportunity\.html["'][^>]*)>([\s\S]*?CLAIM\s+YOUR\s+COMPLIMENTARY\s+CONTRACT\s+OPPORTUNITY[\s\S]*?)<\/a>/i;
  if(!anchor.test(html))throw new Error('[state-local-e2e] homepage complimentary CTA marker not found');
  html=html.replace(anchor,(whole,attrs,label)=>`<a id="complimentaryClaimCta"${attrs}>${label}</a>`);
}

const handoff=`<script id="complimentaryReferenceHandoff">(()=>{const raw=(new URLSearchParams(location.search).get('ref')||'').trim().toUpperCase();if(!/^(?:AP|NG)-[A-Z0-9]{8}$/.test(raw))return;const cta=document.getElementById('complimentaryClaimCta');if(cta)cta.href='/claim-opportunity.html?ref='+encodeURIComponent(raw);})();</script>`;
if(!html.includes('id="complimentaryReferenceHandoff"')){
  if(!html.includes('</body>'))throw new Error('[state-local-e2e] homepage closing body marker not found');
  html=html.replace('</body>',`${handoff}\n</body>`);
}
fs.writeFileSync(file,html,'utf8');
console.log('[state-local-e2e] Marketplace reference handoff applied');
