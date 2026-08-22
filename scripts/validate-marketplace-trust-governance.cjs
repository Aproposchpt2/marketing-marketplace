'use strict';

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const claim = fs.readFileSync('claim-opportunity.html', 'utf8');

const required = [
  'Government contracting opportunities are distributed across many agencies',
  'Past performance can be an important evaluation factor in federal negotiated acquisitions',
  'https://www.acquisition.gov/far/15.304',
  'https://www.sba.gov/counseling/prime-and-subcontracting/',
  'Whether subcontract performance is accepted as relevant past performance',
  'We Deliver the Opportunity',
  'Choose Your APROPOS Path',
  'https://aproposgroupllc.com/'
];
for (const token of required) {
  if (!html.includes(token)) throw new Error(`[marketplace-trust] validation missing: ${token}`);
}

const forbidden = [
  '20 to 40 percent of the total award decision',
  'billions in federal and state contracts go unbid',
  'FAR 15.305(a)(2) explicitly allows evaluation of past performance built as a first-tier subcontractor',
  'current SBA rules require prime contractors to provide that performance documentation',
  'We Deliver the Contract',
  'Contract Development Center is available as the next step'
];
for (const token of forbidden) {
  if (html.toLowerCase().includes(token.toLowerCase())) throw new Error(`[marketplace-trust] unsupported/retired claim remains: ${token}`);
}

if (!claim.includes('<meta name="robots" content="noindex,nofollow">')) throw new Error('[marketplace-trust] claim page is not noindex,nofollow');
if (claim.includes('<meta name="robots" content="index,follow">')) throw new Error('[marketplace-trust] conflicting claim-page index directive remains');

if (!html.includes('/hero-marketplace.webp')) throw new Error('[marketplace-trust] optimized approved homepage image reference missing');
if (!html.includes('rel="preload" as="image" href="/hero-marketplace.webp"')) throw new Error('[marketplace-trust] approved homepage image preload missing');

console.log('[marketplace-trust] validation PASS — claims, crawl directives, routing, and locked-image delivery are governed');
