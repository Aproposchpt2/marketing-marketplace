'use strict';
const fs=require('fs');
const s=fs.readFileSync('index.html','utf8');
const required=[
  'We Find the Opportunity',
  'We Deliver the Opportunity',
  'You Decide Whether to Pursue',
  'aria-label="How Apropos works"',
  '"name":"Analyze Fit Report","price":"79.00"',
  '.apropos-proof-strip',
  '.btn-gold,.btn-outline{display:inline-flex!important',
  '.cca-nav-links{display:flex!important',
  'data-marketplace-route="corporate"',
  'marketplace_route_click',
];
for(const token of required) if(!s.includes(token)) throw new Error(`[marketplace-cleanup] validation missing: ${token}`);
const retired=['proposal development services','proposal development,','proposal support','submitted, competitive proposal','"price":"15.00"','"price":"49.99"','Contract Development Center','We Deliver the Contract'];
for(const token of retired) if(s.toLowerCase().includes(token.toLowerCase())) throw new Error(`[marketplace-cleanup] retired/stale content remains: ${token}`);
if(s.includes('href="https://federalcontractorportal.aproposgroupllc.com/onboarding">Start Your 14-Day Free Trial')) throw new Error('[marketplace-cleanup] generic free-trial CTA still defaults to RFCP');
console.log('[marketplace-cleanup] validation PASS — message integrity, intent routing, mobile navigation, corporate handoff, analytics, and Analyze Fit $79.00 contract satisfied');
