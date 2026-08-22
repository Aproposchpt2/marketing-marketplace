const fs=require('fs');
const file='index.html';
let html=fs.readFileSync(file,'utf8');
const marker='<a class="btn-gold" href="/claim-opportunity.html">CLAIM YOUR COMPLIMENTARY CONTRACT OPPORTUNITY &rarr;</a>';
const replacement='<a id="complimentaryClaimCta" class="btn-gold" href="/claim-opportunity.html">CLAIM YOUR COMPLIMENTARY CONTRACT OPPORTUNITY &rarr;</a>';
if(!html.includes(marker)&&!html.includes('id="complimentaryClaimCta"'))throw new Error('[state-local-e2e] homepage complimentary CTA marker not found');
if(html.includes(marker))html=html.replace(marker,replacement);
const handoff=`<script id="complimentaryReferenceHandoff">(()=>{const raw=(new URLSearchParams(location.search).get('ref')||'').trim().toUpperCase();if(!/^(?:AP|NG)-[A-Z0-9]{8}$/.test(raw))return;const cta=document.getElementById('complimentaryClaimCta');if(cta)cta.href='/claim-opportunity.html?ref='+encodeURIComponent(raw);})();</script>`;
if(!html.includes('id="complimentaryReferenceHandoff"')){
  if(!html.includes('</body>'))throw new Error('[state-local-e2e] homepage closing body marker not found');
  html=html.replace('</body>',`${handoff}\n</body>`);
}
fs.writeFileSync(file,html,'utf8');
console.log('[state-local-e2e] Marketplace reference handoff applied');
