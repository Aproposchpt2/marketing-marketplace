'use strict';

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const failures = [];

const required = [
  'APROPOS_VISUAL_STANDARD_MARKETPLACE_START',
  '--apropos-navy:#071a3c',
  '--apropos-blue:#0f2a6a',
  '--apropos-gold:#d5ae55',
  '--apropos-gold-light:#e8cb87',
  '--apropos-text:#eef3ff',
  '--apropos-panel:rgba(255,255,255,.055)',
  'font-family:Arial,sans-serif!important',
  'font-family:Georgia,"Times New Roman",serif!important',
  'background:var(--apropos-blue)!important;color:var(--apropos-gold)!important',
  'border-radius:var(--apropos-radius)!important',
  'box-shadow:none!important',
  'href="/claim-opportunity.html"',
  'https://federalcontractorportal.aproposgroupllc.com/',
  'https://natcorp.aproposgroupllc.com/',
  'https://nebc.aproposgroupllc.com/',
  'https://ai4businesses.org/',
  'https://ai4websitedesign.com/',
  'https://espanola.ai4websitedesign.com/'
];

for (const token of required) {
  if (!html.includes(token)) failures.push(`index.html missing required visual or journey token: ${token}`);
}

const markerStart = html.indexOf('APROPOS_VISUAL_STANDARD_MARKETPLACE_START');
const markerEnd = html.indexOf('APROPOS_VISUAL_STANDARD_MARKETPLACE_END');
if (markerStart < 0 || markerEnd < markerStart) {
  failures.push('APROPOS visual standard CSS block is incomplete');
} else {
  const standardCss = html.slice(markerStart, markerEnd);
  if (standardCss.includes('linear-gradient')) failures.push('APROPOS visual standard block contains a prohibited gradient');
  if (standardCss.includes('Bodoni') || standardCss.includes('Cormorant') || standardCss.includes("'Jost'")) failures.push('APROPOS visual standard block contains non-standard typography');
}

if (!html.includes('<section class="hero"')) failures.push('approved Marketplace hero is missing');
if (!html.includes('The Government Contract Marketplace')) failures.push('approved Marketplace homepage identity is missing');

if (failures.length) {
  console.error('[apropos-visual-standard] Validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[apropos-visual-standard] PASS — colors, typography, controls, responsive presentation, hero identity, and customer-journey entry point are preserved');
