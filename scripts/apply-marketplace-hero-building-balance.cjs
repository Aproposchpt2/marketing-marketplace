'use strict';

const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

const marker = 'APROPOS_MARKETPLACE_HERO_BUILDING_BALANCE_START';
if (html.includes(marker)) {
  console.log('[marketplace-hero-building-balance] PASS — hero balance already applied');
  process.exit(0);
}

const css = `
/* APROPOS_MARKETPLACE_HERO_BUILDING_BALANCE_START */
@media (min-width: 900px) {
  .hero-inner{
    width:min(1080px,calc(100% - 56px))!important;
    margin-left:clamp(24px,4vw,72px)!important;
    margin-right:auto!important;
  }
  .hero-content{max-width:620px!important}
  .hero-title{max-width:620px!important}
  .hero-subtitle{max-width:600px!important}
  .hero-copy,.marketplace-positioning-correction{max-width:610px!important}
}
@media (min-width: 1500px) {
  .hero-inner{
    width:min(1100px,calc(100% - 72px))!important;
    margin-left:clamp(36px,4.5vw,86px)!important;
  }
}
/* APROPOS_MARKETPLACE_HERO_BUILDING_BALANCE_END */
`;

html = html.replace('</head>', `<style id="apropos-marketplace-hero-building-balance">${css}</style>\n</head>`);
fs.writeFileSync(file, html, 'utf8');
console.log('[marketplace-hero-building-balance] PASS — desktop hero copy shifted left and narrowed so the building shares the hero; content, SEO, CTAs, and workflows unchanged');
