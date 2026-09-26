'use strict';

const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'ai4-contact-center', 'index.html');
if (!fs.existsSync(file)) throw new Error('[ai4-premium-style] AI4 Contact Center page missing');

let html = fs.readFileSync(file, 'utf8');

// The slogan belongs to brand messaging, not the Marketplace navigation treatment.
html = html
  .replace(' <span>· Premium Presence Before Persuasion</span>', '')
  .replace('<span>· Premium Presence Before Persuasion</span>', '');

const markerStart = '/* APROPOS_AI4_PREMIUM_PLATINUM_OVERRIDE_START */';
const markerEnd = '/* APROPOS_AI4_PREMIUM_PLATINUM_OVERRIDE_END */';

const override = `<style>
${markerStart}
:root{
  --ap-navy:#071a3c;
  --ap-navy-deep:#041329;
  --ap-blue:#0f2a6a;
  --ap-blue-2:#133574;
  --ap-blue-3:#0b2453;
  --ap-gold:#d5ae55;
  --ap-gold-light:#e8cb87;
  --ap-text:#eef3ff;
  --ap-muted:#c7d1e2;
  --ap-line:rgba(213,174,85,.40);
}
*{box-sizing:border-box}
body{background:var(--ap-navy)!important;color:var(--ap-text)!important;font-family:Arial,sans-serif!important}

.ai4-topbar{background:var(--ap-navy)!important;border-bottom:1px solid rgba(255,255,255,.12)!important;padding:1rem 1.5rem!important}
.ai4-brand{color:#fff!important;font:700 .78rem Arial,sans-serif!important;letter-spacing:.04em!important;text-transform:uppercase!important}
.ai4-market-link{color:var(--ap-gold-light)!important;font:700 .72rem Arial,sans-serif!important;letter-spacing:.08em!important;text-transform:uppercase!important}

.ai4-hero{background:var(--ap-navy)!important;border-bottom:1px solid var(--ap-line)!important;padding:6.6rem 1.5rem 5.6rem!important}
.ai4-hero:after{height:4px!important;background:var(--ap-gold)!important}
.ai4-kicker{color:var(--ap-gold)!important;font:700 .76rem Arial,sans-serif!important;letter-spacing:.18em!important;text-transform:uppercase!important}
.ai4-rule{width:72px!important;height:2px!important;background:var(--ap-gold)!important;margin:1.1rem 0 1.8rem!important}
.ai4-hero h1{
  font-family:Georgia,"Times New Roman",serif!important;
  font-size:clamp(2.8rem,6vw,5.4rem)!important;
  font-weight:400!important;
  line-height:1.04!important;
  letter-spacing:0!important;
  color:#fff!important;
  max-width:1040px!important;
  margin:0 0 1.5rem!important;
}
.ai4-hero h1 em{font-style:italic!important;font-weight:400!important;color:var(--ap-gold-light)!important}
.ai4-deck{max-width:900px!important;color:#dce5f3!important;font:400 clamp(1.05rem,1.9vw,1.3rem) Arial,sans-serif!important;line-height:1.72!important}
.ai4-deck strong{color:#fff!important;font-weight:700!important;letter-spacing:.035em!important}

.ai4-actions{gap:.8rem!important;margin-top:2.25rem!important}
.ai4-btn{border-radius:0!important;min-width:230px;text-align:center;padding:1rem 1.35rem!important;font:700 .76rem Arial,sans-serif!important;letter-spacing:.11em!important;text-transform:uppercase!important;border:1px solid var(--ap-gold)!important}
.ai4-btn-primary{background:var(--ap-gold)!important;color:var(--ap-navy)!important}
.ai4-btn-secondary{background:transparent!important;color:var(--ap-gold-light)!important}

/* Marketplace-wide blue section system: no white or ivory content bands. */
.ai4-band{background:var(--ap-blue)!important;color:var(--ap-text)!important;border-bottom:1px solid rgba(255,255,255,.10)!important;padding:5rem 1.5rem!important}
.ai4-band:nth-of-type(even){background:var(--ap-navy)!important}
.ai4-band-alt{background:var(--ap-navy)!important;color:var(--ap-text)!important;border-bottom:1px solid var(--ap-line)!important}
.ai4-final{background:var(--ap-blue-3)!important;border-top:1px solid var(--ap-gold)!important;border-bottom:1px solid var(--ap-gold)!important}

.ai4-title{
  font-family:Georgia,"Times New Roman",serif!important;
  font-weight:400!important;
  font-size:clamp(2.15rem,4.2vw,3.65rem)!important;
  line-height:1.1!important;
  letter-spacing:0!important;
  color:#fff!important;
  max-width:1000px!important;
  margin:.45rem 0 1rem!important;
}
.ai4-lead,.ai4-small{color:var(--ap-muted)!important;font-family:Arial,sans-serif!important;line-height:1.82!important}
.ai4-lead{font-size:1.05rem!important;max-width:900px!important}

.ai4-grid{gap:1rem!important;background:transparent!important;border:0!important;margin-top:2.35rem!important}
.ai4-card,.ai4-band-alt .ai4-card{
  background:var(--ap-blue-2)!important;
  border:1px solid rgba(232,203,135,.28)!important;
  border-top:3px solid var(--ap-gold)!important;
  border-radius:0!important;
  padding:1.55rem!important;
  box-shadow:none!important;
  color:var(--ap-text)!important;
}
.ai4-band:nth-of-type(even) .ai4-card{background:var(--ap-blue)!important}
.ai4-card h3,.ai4-band-alt .ai4-card h3{color:var(--ap-gold-light)!important;font-family:Georgia,"Times New Roman",serif!important;font-weight:400!important;font-size:1.18rem!important;line-height:1.3!important;letter-spacing:0!important;text-transform:none!important;margin:0 0 .65rem!important}
.ai4-card p,.ai4-band-alt .ai4-card p{color:#e0e6f0!important;font-family:Arial,sans-serif!important;line-height:1.7!important;margin:0!important}

.ai4-callout,.ai4-band-alt .ai4-callout{background:var(--ap-navy-deep)!important;border:1px solid var(--ap-line)!important;border-left:5px solid var(--ap-gold)!important;border-radius:0!important;color:#fff!important;font-family:Georgia,"Times New Roman",serif!important;font-weight:400!important;font-size:clamp(1.35rem,3vw,2.1rem)!important;line-height:1.35!important;padding:1.65rem 1.9rem!important}

.ai4-list{border-top:1px solid var(--ap-line)!important;margin-top:1.8rem!important}
.ai4-list div{color:#fff!important;border-bottom:1px solid rgba(255,255,255,.14)!important;font-family:Georgia,"Times New Roman",serif!important;font-weight:400!important;font-size:1.05rem!important;letter-spacing:0!important;padding:1rem 0!important}
.ai4-stat{color:var(--ap-gold-light)!important;font-family:Georgia,"Times New Roman",serif!important;font-weight:400!important;letter-spacing:0!important}

.ai4-footer{background:var(--ap-navy-deep)!important;color:#aebad0!important;border-top:1px solid var(--ap-gold)!important;padding:2.1rem 1.5rem!important}
.ai4-footer a{color:var(--ap-gold-light)!important}

@media(max-width:850px){
  .ai4-topbar-inner{align-items:flex-start!important;flex-direction:column!important}
  .ai4-hero{padding:4.6rem 1.25rem 4.4rem!important}
  .ai4-band{padding:3.8rem 1.25rem!important}
  .ai4-btn{width:100%!important;min-width:0!important}
  .ai4-grid{grid-template-columns:1fr!important}
  .ai4-list{grid-template-columns:1fr!important}
  .ai4-econ{grid-template-columns:1fr!important}
}
${markerEnd}
</style>`;

const existing = new RegExp(`<style>\\s*${markerStart.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}[\\s\\S]*?${markerEnd.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\s*<\\/style>`, 'm');
if (existing.test(html)) html = html.replace(existing, override);
else html = html.replace('</head>', `${override}\n</head>`);

fs.writeFileSync(file, html, 'utf8');

const required = [markerStart,'--ap-navy:#071a3c','--ap-blue:#0f2a6a','font-weight:400!important','Marketplace-wide blue section system'];
for (const token of required) if (!html.includes(token)) throw new Error('[ai4-premium-style] missing uniform-blue style token: ' + token);
if (html.includes('Premium Presence Before Persuasion')) throw new Error('[ai4-premium-style] navigation slogan must not render on the AI4 Marketplace page');

console.log('[ai4-premium-style] PASS — AI4 Contact Center aligned to Marketplace homepage typography and uniform blue visual system');
