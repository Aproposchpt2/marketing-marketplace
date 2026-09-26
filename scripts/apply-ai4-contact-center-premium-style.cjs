'use strict';

const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'ai4-contact-center', 'index.html');
if (!fs.existsSync(file)) throw new Error('[ai4-premium-style] AI4 Contact Center page missing');

let html = fs.readFileSync(file, 'utf8');

const markerStart = '/* APROPOS_AI4_PREMIUM_PLATINUM_OVERRIDE_START */';
const markerEnd = '/* APROPOS_AI4_PREMIUM_PLATINUM_OVERRIDE_END */';

const override = `<style>
${markerStart}
:root{
  --ap-navy:#061733;
  --ap-navy-2:#0a214b;
  --ap-blue:#102f6f;
  --ap-blue-2:#163b82;
  --ap-gold:#d7b25a;
  --ap-gold-deep:#bd9132;
  --ap-gold-light:#ecd18c;
  --ap-platinum:#e7e3da;
  --ap-platinum-2:#d8d4cb;
  --ap-ivory:#f1eee6;
  --ap-ink:#0b1f43;
  --ap-copy:#35445f;
  --ap-line:rgba(215,178,90,.44);
}

body{
  background:var(--ap-navy)!important;
  color:var(--ap-platinum)!important;
  font-family:Arial,Helvetica,sans-serif!important;
  letter-spacing:.005em;
}

.ai4-topbar{
  background:#041329!important;
  border-bottom:1px solid var(--ap-gold-deep)!important;
  padding:1rem 1.5rem!important;
}
.ai4-brand{
  color:var(--ap-gold)!important;
  font-size:.73rem!important;
  letter-spacing:.19em!important;
}
.ai4-brand span{color:var(--ap-platinum)!important}
.ai4-market-link{color:var(--ap-gold-light)!important;letter-spacing:.13em!important}

.ai4-hero{
  background:var(--ap-navy)!important;
  border-bottom:5px solid var(--ap-gold)!important;
  padding:7rem 1.5rem 6rem!important;
}
.ai4-hero:after{display:none!important}
.ai4-kicker{
  color:var(--ap-gold)!important;
  font-size:.74rem!important;
  letter-spacing:.22em!important;
  font-weight:700!important;
}
.ai4-rule{
  width:86px!important;
  height:2px!important;
  background:var(--ap-gold)!important;
  margin:1.25rem 0 2rem!important;
}
.ai4-hero h1{
  font-family:Georgia,'Times New Roman',serif!important;
  font-size:clamp(3rem,6.6vw,6rem)!important;
  font-weight:700!important;
  line-height:.98!important;
  letter-spacing:-.035em!important;
  max-width:980px!important;
  color:var(--ap-ivory)!important;
  text-wrap:balance;
}
.ai4-hero h1 em{color:var(--ap-gold-light)!important}
.ai4-deck{
  max-width:820px!important;
  color:var(--ap-platinum)!important;
  line-height:1.72!important;
  font-size:clamp(1.04rem,1.8vw,1.28rem)!important;
}
.ai4-deck strong{
  color:var(--ap-ivory)!important;
  letter-spacing:.065em!important;
  font-size:.94em!important;
}

.ai4-actions{gap:.75rem!important;margin-top:2.45rem!important}
.ai4-btn{
  border-radius:0!important;
  min-width:230px;
  text-align:center;
  padding:1rem 1.5rem!important;
  font-size:.74rem!important;
  letter-spacing:.14em!important;
  border-width:1px!important;
}
.ai4-btn-primary{
  background:var(--ap-gold)!important;
  border-color:var(--ap-gold)!important;
  color:var(--ap-navy)!important;
}
.ai4-btn-secondary{
  background:transparent!important;
  color:var(--ap-gold-light)!important;
  border-color:var(--ap-gold-deep)!important;
}

.ai4-band{
  background:var(--ap-platinum)!important;
  color:var(--ap-ink)!important;
  border-bottom:1px solid rgba(6,23,51,.18)!important;
  padding:5.25rem 1.5rem!important;
}
.ai4-band:nth-of-type(odd):not(.ai4-band-alt):not(.ai4-final){
  background:var(--ap-ivory)!important;
}
.ai4-band-alt{
  background:var(--ap-navy-2)!important;
  color:var(--ap-platinum)!important;
  border-bottom:1px solid var(--ap-line)!important;
}
.ai4-final{
  background:var(--ap-blue)!important;
  border-top:1px solid var(--ap-gold-deep)!important;
  border-bottom:1px solid var(--ap-gold-deep)!important;
}

.ai4-title{
  font-family:Georgia,'Times New Roman',serif!important;
  font-weight:700!important;
  font-size:clamp(2.25rem,4.4vw,3.8rem)!important;
  line-height:1.08!important;
  letter-spacing:-.025em!important;
  color:var(--ap-navy)!important;
  max-width:980px;
  text-wrap:balance;
}
.ai4-band-alt .ai4-title,.ai4-final .ai4-title{color:var(--ap-ivory)!important}
.ai4-lead{
  color:var(--ap-copy)!important;
  font-size:1.04rem!important;
  line-height:1.9!important;
  max-width:860px!important;
}
.ai4-band-alt .ai4-lead,.ai4-final .ai4-lead,.ai4-band-alt .ai4-small{color:#d7dce5!important}

.ai4-grid{
  gap:14px!important;
  background:transparent!important;
  border:0!important;
  margin-top:2.5rem!important;
}
.ai4-card{
  background:#e2ded5!important;
  border:1px solid rgba(6,23,51,.23)!important;
  border-top:3px solid var(--ap-gold-deep)!important;
  border-radius:0!important;
  padding:1.65rem 1.55rem!important;
  box-shadow:none!important;
}
.ai4-card h3{
  color:var(--ap-navy)!important;
  font-family:Georgia,'Times New Roman',serif!important;
  font-size:1.12rem!important;
  line-height:1.25!important;
  letter-spacing:.01em!important;
  text-transform:none!important;
}
.ai4-card p{color:#3d4960!important;line-height:1.72!important}
.ai4-band-alt .ai4-card{
  background:var(--ap-blue)!important;
  border:1px solid rgba(236,209,140,.25)!important;
  border-top:3px solid var(--ap-gold)!important;
}
.ai4-band-alt .ai4-card h3{color:var(--ap-gold-light)!important}
.ai4-band-alt .ai4-card p{color:#e1e5ec!important}

.ai4-callout{
  background:var(--ap-blue)!important;
  border:0!important;
  border-left:5px solid var(--ap-gold)!important;
  border-radius:0!important;
  color:var(--ap-ivory)!important;
  font-family:Georgia,'Times New Roman',serif!important;
  font-weight:700!important;
  font-size:clamp(1.35rem,3vw,2.15rem)!important;
  line-height:1.32!important;
  padding:1.7rem 2rem!important;
}
.ai4-band-alt .ai4-callout{
  background:#081b3d!important;
  border:1px solid var(--ap-line)!important;
  border-left:5px solid var(--ap-gold)!important;
}

.ai4-list{
  border-top:1px solid rgba(6,23,51,.26)!important;
  margin-top:2rem!important;
}
.ai4-list div{
  color:var(--ap-navy)!important;
  border-bottom:1px solid rgba(6,23,51,.18)!important;
  font-family:Georgia,'Times New Roman',serif!important;
  font-size:1.05rem!important;
  font-weight:700!important;
  letter-spacing:0!important;
  padding:1.05rem 0!important;
}

.ai4-stat{
  color:var(--ap-gold-light)!important;
  font-family:Georgia,'Times New Roman',serif!important;
  font-weight:700!important;
  letter-spacing:-.04em!important;
}
.ai4-small{line-height:1.85!important}

.ai4-footer{
  background:#031025!important;
  color:#9da9bc!important;
  border-top:1px solid var(--ap-gold-deep)!important;
  padding:2.25rem 1.5rem!important;
}
.ai4-footer a{color:var(--ap-gold-light)!important}

@media(max-width:850px){
  .ai4-hero{padding:4.75rem 1.25rem 4.5rem!important}
  .ai4-band{padding:4rem 1.25rem!important}
  .ai4-btn{width:100%;min-width:0}
  .ai4-card{padding:1.45rem!important}
}
${markerEnd}
</style>`;

const existing = new RegExp(`<style>\\s*${markerStart.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}[\\s\\S]*?${markerEnd.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\s*<\\/style>`, 'm');
if (existing.test(html)) html = html.replace(existing, override);
else html = html.replace('</head>', `${override}\n</head>`);

fs.writeFileSync(file, html, 'utf8');

for (const token of [markerStart,'--ap-platinum:#e7e3da','Georgia','border-radius:0!important','Premium Presence Before Persuasion']) {
  if (!html.includes(token)) throw new Error('[ai4-premium-style] missing premium style token: ' + token);
}

console.log('[ai4-premium-style] PASS — APROPOS Premium Platinum Presence override applied to AI4 Contact Center page');
