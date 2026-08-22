'use strict';

const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

if (html.includes('APROPOS_VISUAL_STANDARD_MARKETPLACE_START')) {
  console.log('[apropos-visual-standard] PASS — visual standard already applied');
  process.exit(0);
}

const css = `
/* APROPOS_VISUAL_STANDARD_MARKETPLACE_START */
:root{
  --apropos-navy:#071a3c;
  --apropos-blue:#0f2a6a;
  --apropos-gold:#d5ae55;
  --apropos-gold-light:#e8cb87;
  --apropos-text:#eef3ff;
  --apropos-muted:rgba(255,255,255,.58);
  --apropos-line:rgba(255,255,255,.13);
  --apropos-panel:rgba(255,255,255,.055);
  --apropos-success:#3ee391;
  --apropos-danger:#ff7777;
  --apropos-radius:12px;
  --apropos-control-radius:6px;
}
html{color-scheme:dark}
body{background:var(--apropos-navy)!important;color:var(--apropos-text)!important;font-family:Arial,sans-serif!important;font-size:14px;line-height:1.5}
body p,body li,body label,body input,body select,body textarea,body button,body a,.hero-subtitle,.hero-copy,.marketplace-positioning-correction,.amm-production,.amm-production p,.amm-production a,.amm-card-meta,.amm-footer{font-family:Arial,sans-serif!important}
h1,h2,h3,.hero-title,.amm-title,.amm-card h3,.amm-price h3,.amm-footer h3,.amm-trust-panel strong,.amm-path strong{font-family:Georgia,"Times New Roman",serif!important;font-weight:400!important;letter-spacing:0!important}

.cca-nav{background:rgba(7,26,60,.97)!important;color:var(--apropos-text)!important;border-bottom:1px solid var(--apropos-line)!important;min-height:68px!important;padding:.8rem clamp(1.1rem,2.4vw,2rem)!important;box-shadow:none!important}
.cca-brand,.cca-name,.cca-name small,.cca-nav-links,.cca-nav-links a{font-family:Arial,sans-serif!important}
.cca-name{font-size:1rem!important;font-weight:700!important;color:var(--apropos-text)!important;letter-spacing:0!important}
.cca-name small{font-size:.65rem!important;font-weight:700!important;letter-spacing:.08em!important;color:var(--apropos-muted)!important}
.cca-mark{font-family:Arial,sans-serif!important;color:var(--apropos-gold)!important;border-color:rgba(213,174,85,.72)!important}
.cca-nav-links{gap:.75rem 1.25rem!important;font-size:13px!important;font-weight:700!important;letter-spacing:0!important;text-transform:none!important}
.cca-nav-links a{font-size:13px!important;font-weight:700!important;letter-spacing:0!important;text-transform:none!important;color:var(--apropos-text)!important}
.cca-nav-links a:hover{color:var(--apropos-gold)!important}

.promo-row{background:var(--apropos-navy)!important;border-bottom:1px solid var(--apropos-line)!important;padding:.75rem clamp(1.1rem,2.4vw,2rem)!important;gap:.75rem!important}
.btn-gold,.amm-btn-primary{background:var(--apropos-blue)!important;color:var(--apropos-gold)!important;border:1px solid rgba(213,174,85,.72)!important;border-radius:var(--apropos-control-radius)!important;min-height:40px!important;padding:10px 14px!important;font:700 14px Arial,sans-serif!important;letter-spacing:0!important;text-transform:none!important;box-shadow:none!important;transform:none!important}
.btn-gold:hover,.amm-btn-primary:hover{background:#0b255d!important;color:var(--apropos-gold-light)!important;border-color:var(--apropos-gold)!important;box-shadow:none!important;transform:none!important}
.btn-outline,.amm-btn-outline{background:transparent!important;color:var(--apropos-text)!important;border:1px solid var(--apropos-line)!important;border-radius:var(--apropos-control-radius)!important;min-height:40px!important;padding:10px 14px!important;font:700 14px Arial,sans-serif!important;letter-spacing:0!important;text-transform:none!important;box-shadow:none!important}
.btn-outline:hover,.amm-btn-outline:hover{background:rgba(255,255,255,.07)!important;color:var(--apropos-gold-light)!important;border-color:rgba(255,255,255,.26)!important}

.hero{background-color:var(--apropos-navy)!important;min-height:min(820px,calc(100svh - 68px))!important}
.hero-inner{width:min(1160px,calc(100% - 48px))!important;padding:clamp(54px,6.5vw,86px) 0!important}
.hero-content{max-width:760px!important}
.hero-eyebrow,.amm-kicker{font-family:Arial,sans-serif!important;font-size:11px!important;font-weight:700!important;letter-spacing:.16em!important;text-transform:uppercase!important;color:var(--apropos-gold)!important}
.hero-title{font-size:clamp(30px,3.1vw,42px)!important;line-height:1.15!important;color:var(--apropos-text)!important;max-width:820px!important;margin:18px 0 18px!important;text-shadow:none!important}
.hero-subtitle{font-size:clamp(16px,1.35vw,18px)!important;line-height:1.45!important;color:var(--apropos-gold-light)!important;max-width:680px!important}
.hero-copy,.marketplace-positioning-correction{font-size:clamp(14px,1.15vw,17px)!important;line-height:1.6!important;color:rgba(238,243,255,.82)!important;max-width:720px!important}

.amm-production{--amm-navy:var(--apropos-navy);--amm-navy2:var(--apropos-blue);--amm-navy3:var(--apropos-blue);--amm-gold:var(--apropos-gold);--amm-gold-light:var(--apropos-gold-light);--amm-gold-dark:var(--apropos-gold);--amm-paper:var(--apropos-navy);--amm-paper2:var(--apropos-navy);--amm-ink:var(--apropos-text);--amm-muted:var(--apropos-muted);--amm-line:var(--apropos-line);font-family:Arial,sans-serif!important;background:var(--apropos-navy)!important;color:var(--apropos-text)!important}
.amm-band,.amm-band-soft{background:var(--apropos-navy)!important;color:var(--apropos-text)!important;border-bottom:1px solid var(--apropos-line)!important;padding:clamp(58px,6vw,86px) 0!important}
.amm-band-dark{background:var(--apropos-blue)!important;color:var(--apropos-text)!important;border-bottom:1px solid var(--apropos-line)!important;background-image:none!important}
.amm-shell{width:min(1180px,calc(100% - 48px))!important}
.amm-title{font-size:clamp(28px,2.7vw,36px)!important;line-height:1.2!important;color:var(--apropos-text)!important;max-width:900px!important;margin:0 0 16px!important}
.amm-title em{font-family:Georgia,"Times New Roman",serif!important;font-weight:400!important;color:var(--apropos-gold-light)!important}
.amm-lead{font-size:clamp(14px,1.1vw,17px)!important;line-height:1.65!important;color:rgba(238,243,255,.76)!important;max-width:880px!important}
.amm-grid{gap:16px!important;margin-top:32px!important}
.amm-card,.amm-price,.amm-trust-panel,.amm-resource,.amm-path{background:var(--apropos-panel)!important;border:1px solid var(--apropos-line)!important;border-radius:var(--apropos-radius)!important;box-shadow:none!important;color:var(--apropos-text)!important}
.amm-card{padding:18px!important;min-height:0!important}
.amm-card-featured{border-top:2px solid var(--apropos-gold)!important}
.amm-card-tag{font-family:Arial,sans-serif!important;font-size:11px!important;font-weight:700!important;letter-spacing:.16em!important;text-transform:uppercase!important;color:var(--apropos-gold)!important;margin-bottom:12px!important}
.amm-card h3,.amm-price h3{font-size:18px!important;line-height:1.3!important;color:var(--apropos-text)!important;margin:0 0 10px!important}
.amm-card p,.amm-price p,.amm-trust-panel p{font-size:14px!important;line-height:1.55!important;color:var(--apropos-muted)!important}
.amm-card-meta,.amm-price strong{font-size:14px!important;font-weight:700!important;color:var(--apropos-gold-light)!important}
.amm-actions{gap:8px!important}
.amm-btn{min-height:40px!important;padding:10px 14px!important;border-radius:var(--apropos-control-radius)!important;font:700 14px Arial,sans-serif!important;letter-spacing:0!important;text-transform:none!important}
.amm-paths{gap:1px!important;background:var(--apropos-line)!important;border:1px solid var(--apropos-line)!important;border-radius:var(--apropos-radius)!important;margin-top:32px!important;box-shadow:none!important}
.amm-path{padding:18px!important;border-radius:0!important}
.amm-path strong{font-size:18px!important;color:var(--apropos-text)!important;margin-bottom:6px!important}
.amm-path span{font-size:14px!important;line-height:1.55!important;color:var(--apropos-muted)!important}
.amm-resource-grid{gap:12px!important;margin-top:28px!important}
.amm-resource{padding:14px 16px!important;font-size:14px!important;font-weight:700!important;color:var(--apropos-gold-light)!important}
.amm-resource:hover{background:rgba(255,255,255,.07)!important;border-color:rgba(255,255,255,.26)!important;color:var(--apropos-gold)!important}
.amm-resource span{color:var(--apropos-gold)!important}
.amm-trust{gap:28px!important}
.amm-trust-panel{padding:18px!important}
.amm-trust-panel strong{font-size:18px!important;color:var(--apropos-text)!important}
.amm-price-grid{gap:16px!important;margin-top:30px!important}
.amm-price{padding:18px!important}
.amm-footer{background:var(--apropos-navy)!important;color:var(--apropos-muted)!important;padding:38px 0 24px!important;border-top:1px solid var(--apropos-line)!important;font-family:Arial,sans-serif!important}
.amm-footer h3{font-size:18px!important;color:var(--apropos-text)!important}
.amm-footer-links a{font-family:Arial,sans-serif!important;font-size:13px!important;font-weight:700!important;color:var(--apropos-gold-light)!important}
.amm-footer-links a:hover{color:var(--apropos-gold)!important}
.amm-footer-bottom{border-top:1px solid var(--apropos-line)!important;font-size:12px!important;line-height:1.5!important}

@media(min-width:1500px){.hero-title{font-size:42px!important}.hero-inner,.amm-shell{width:min(1180px,calc(100% - 72px))!important}}
@media(max-width:1100px){.hero{min-height:auto!important}.hero-inner{padding:58px 0 66px!important}.amm-grid,.amm-price-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.amm-paths{grid-template-columns:repeat(2,minmax(0,1fr))!important}.amm-trust,.amm-footer-grid{grid-template-columns:1fr!important}}
@media(max-width:760px){body{font-size:14px}.cca-nav{padding:.8rem 1rem!important}.promo-row{padding:.75rem 1rem!important}.promo-row a{width:100%!important}.hero-inner{width:calc(100% - 30px)!important;padding:46px 0 54px!important}.hero-title{font-size:30px!important;line-height:1.15!important}.hero-subtitle{font-size:16px!important}.hero-copy,.marketplace-positioning-correction{font-size:14px!important}.amm-band,.amm-band-dark,.amm-band-soft{padding:48px 0!important}.amm-shell{width:calc(100% - 30px)!important}.amm-grid,.amm-price-grid,.amm-resource-grid,.amm-paths{grid-template-columns:1fr!important}.amm-card,.amm-price,.amm-trust-panel{padding:16px!important}.amm-title{font-size:26px!important;line-height:1.22!important}.amm-lead{font-size:14px!important}.amm-btn{width:100%!important;min-height:42px!important}}
@media(max-width:420px){.cca-mark{display:none!important}.cca-name{font-size:.92rem!important}.hero-inner,.amm-shell{width:calc(100% - 24px)!important}.hero-title{font-size:28px!important}}
/* APROPOS_VISUAL_STANDARD_MARKETPLACE_END */
`;

html = html.replace('</head>', `<style id="apropos-visual-standard-marketplace">${css}</style>\n</head>`);
fs.writeFileSync(file, html, 'utf8');
console.log('[apropos-visual-standard] PASS — APROPOS presentation standard applied without changing routes, CTAs, forms, functions, or business logic');
