'use strict';
const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

// This build-time pass deliberately starts after the existing homepage hero.
const heroStart = html.indexOf('<section class="hero"');
if (heroStart < 0) throw new Error('[marketplace-dark-sections] hero section not found');
const heroEnd = html.indexOf('</section>', heroStart);
if (heroEnd < 0) throw new Error('[marketplace-dark-sections] hero closing section not found');

const splitAt = heroEnd + '</section>'.length;
const head = html.slice(0, splitAt);
let tail = html.slice(splitAt);

tail = tail.replace(/<section\b([^>]*)>/g, (match, attrs) => {
  if (/\bclass\s*=/.test(attrs)) {
    return match.replace(/class=(['"])(.*?)\1/, (m, q, classes) => `class=${q}apropos-dark-section ${classes}${q}`);
  }
  return `<section class="apropos-dark-section"${attrs}>`;
});

const style = `
<style id="apropos-marketplace-dark-sections">
:root{--apropos-deep:#061126;--apropos-deep-2:#091a33;--apropos-panel:#0d2344;--apropos-panel-2:#102a50;--apropos-gold:#d5aa4d;--apropos-gold-soft:#e8c982;--apropos-text:#f7f9fc;--apropos-muted:#aab9cc;--apropos-line:rgba(255,255,255,.13);--apropos-gold-line:rgba(213,170,77,.34)}
.apropos-dark-section{position:relative;background:linear-gradient(180deg,var(--apropos-deep-2) 0%,var(--apropos-deep) 100%)!important;color:var(--apropos-text)!important;border-top:1px solid var(--apropos-line)!important}
.apropos-dark-section:nth-of-type(even){background:linear-gradient(180deg,#07162a 0%,#0a1d38 100%)!important}
.apropos-dark-section h1,.apropos-dark-section h2,.apropos-dark-section h3,.apropos-dark-section h4,.apropos-dark-section strong{color:var(--apropos-text)!important}
.apropos-dark-section p,.apropos-dark-section li,.apropos-dark-section .section-intro,.apropos-dark-section .sub,.apropos-dark-section .description{color:var(--apropos-muted)!important}
.apropos-dark-section .eyebrow,.apropos-dark-section .kicker,.apropos-dark-section .section-kicker,.apropos-dark-section .tag,.apropos-dark-section [class*="eyebrow"],.apropos-dark-section [class*="kicker"]{color:var(--apropos-gold)!important}
.apropos-dark-section a:not(.btn):not([class*="button"]){color:var(--apropos-gold-soft)}
.apropos-dark-section .card,.apropos-dark-section [class*="card"],.apropos-dark-section article,.apropos-dark-section .step,.apropos-dark-section .faq-item,.apropos-dark-section .service-card,.apropos-dark-section .market-card,.apropos-dark-section .offer-card{background:linear-gradient(180deg,rgba(16,42,80,.88),rgba(10,27,52,.94))!important;border-color:var(--apropos-line)!important;color:var(--apropos-text)!important;box-shadow:0 18px 48px rgba(0,0,0,.18)!important}
.apropos-dark-section .card:hover,.apropos-dark-section [class*="card"]:hover,.apropos-dark-section article:hover{border-color:var(--apropos-gold-line)!important}
.apropos-dark-section .btn-gold,.apropos-dark-section .btn.primary,.apropos-dark-section .btn-primary,.apropos-dark-section [class*="button-primary"]{background:var(--apropos-gold)!important;color:#07162a!important;border-color:var(--apropos-gold)!important;box-shadow:none!important}
.apropos-dark-section .btn-outline,.apropos-dark-section .btn.secondary,.apropos-dark-section .btn-secondary{background:rgba(255,255,255,.045)!important;color:#fff!important;border-color:rgba(255,255,255,.28)!important}
.apropos-dark-section input,.apropos-dark-section select,.apropos-dark-section textarea{background:#07172c!important;color:#fff!important;border-color:var(--apropos-line)!important}
.apropos-dark-section hr{border-color:var(--apropos-line)!important}
.apropos-dark-section [style*="background:#fff"],.apropos-dark-section [style*="background: #fff"],.apropos-dark-section [style*="background:white"],.apropos-dark-section [style*="background: white"]{background:var(--apropos-panel)!important}
.apropos-dark-section [style*="color:#111"],.apropos-dark-section [style*="color: #111"],.apropos-dark-section [style*="color:#000"],.apropos-dark-section [style*="color: #000"]{color:var(--apropos-text)!important}
footer{background:#020914!important;color:var(--apropos-muted)!important;border-top:1px solid var(--apropos-line)!important}
footer a{color:var(--apropos-gold-soft)!important}
@media(max-width:800px){.apropos-dark-section{overflow-x:hidden}.apropos-dark-section .cards,.apropos-dark-section [class*="grid"],.apropos-dark-section [class*="cards"]{grid-template-columns:1fr!important}.apropos-dark-section .btn,.apropos-dark-section [class*="button"]{max-width:100%}}
</style>`;

html = head + tail;
if (!html.includes('</head>')) throw new Error('[marketplace-dark-sections] head closing tag missing');
html = html.replace('</head>', `${style}\n</head>`);
fs.writeFileSync(file, html, 'utf8');
console.log('[marketplace-dark-sections] premium navy/gold treatment applied to all sections below hero');
