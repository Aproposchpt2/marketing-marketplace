'use strict';
const fs=require('fs');
const file='index.html';
let html=fs.readFileSync(file,'utf8');

// Keep a permanent REVIEWS route in the public navigation without rebuilding
// or redeploying source HTML for each individual review submission.
if(!html.includes('href="/reviews.html">Reviews</a>')){
  const navEnd='</div>';
  const navStart=html.indexOf('<div class="cca-nav-links">');
  if(navStart<0)throw new Error('[marketplace-reviews-home] navigation block not found');
  const end=html.indexOf(navEnd,navStart);
  if(end<0)throw new Error('[marketplace-reviews-home] navigation closing tag not found');
  html=html.slice(0,end)+`    <a href="/reviews.html">Reviews</a>\n  `+html.slice(end);
}

const marker='APROPOS_MARKETPLACE_REVIEWS_HOME_START';
if(!html.includes(marker)){
  const footerIndex=html.indexOf('<footer class="cca-footer">');
  if(footerIndex<0)throw new Error('[marketplace-reviews-home] homepage footer not found');
  const section=`\n<!-- ${marker} -->\n<section id="reviews" class="amm-band amm-band-soft" aria-labelledby="marketplace-reviews-title">\n  <div class="amm-shell">\n    <div class="amm-kicker">Marketplace Reviews</div>\n    <h2 class="amm-title" id="marketplace-reviews-title">What businesses say about the <em>APROPOS opportunity experience.</em></h2>\n    <p class="amm-lead">Approved comments from businesses that received APROPOS opportunity and contract-delivery services.</p>\n    <div id="marketplaceReviewPreview" class="amm-grid" style="margin-top:34px"><article class="amm-card"><p>Loading approved reviews…</p></article></div>\n    <div class="amm-actions" style="margin-top:24px"><a class="amm-btn amm-btn-primary" href="/reviews.html">View All Reviews</a></div>\n  </div>\n</section>\n<script>\n(()=>{const root=document.getElementById('marketplaceReviewPreview');if(!root)return;const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));fetch('/api/marketplace-reviews?limit=3',{headers:{accept:'application/json'}}).then(r=>r.json().then(d=>({r,d}))).then(({r,d})=>{if(!r.ok||!d.ok)throw new Error(d.error||'Reviews unavailable');const rows=Array.isArray(d.reviews)?d.reviews:[];root.innerHTML=rows.length?rows.map(x=>{const stars=Number(x.rating)?'<div style="color:#8a6a24;font-size:1.05rem;margin-bottom:12px">'+('★'.repeat(Math.max(1,Math.min(5,Number(x.rating)))))+'</div>':'';return '<article class="amm-card">'+stars+'<p style="font-family:\'Cormorant\',Georgia,serif;font-size:1.28rem;line-height:1.45;color:#16233b">“'+esc(x.comment)+'”</p><div class="amm-card-meta" style="margin-top:auto">'+esc(x.business_name||'APROPOS Marketplace User')+(x.reviewer_name?'<br><span style="font-weight:400;color:#526581">'+esc(x.reviewer_name)+'</span>':'')+'</div></article>'}).join(''):'<article class="amm-card"><p>Approved Marketplace reviews will appear here as businesses share their experiences.</p></article>'}).catch(()=>{root.innerHTML='<article class="amm-card"><p>Marketplace reviews are temporarily unavailable. <a href="/reviews.html">Visit the Reviews page</a>.</p></article>'})})();\n</script>\n<!-- APROPOS_MARKETPLACE_REVIEWS_HOME_END -->\n`;
  html=html.slice(0,footerIndex)+section+html.slice(footerIndex);
}

fs.writeFileSync(file,html,'utf8');
console.log('[marketplace-reviews-home] REVIEWS navigation and homepage review preview applied.');
