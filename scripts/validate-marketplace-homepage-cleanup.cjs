'use strict';
const fs=require('fs');
const s=fs.readFileSync('index.html','utf8');
const required=[
  'We Find the Opportunity',
  'We Deliver the Contract',
  'You Decide Whether to Pursue',
  'Government contract opportunity — without making your business do all the searching.',
  '"name":"Analyze Fit Report","price":"49.99"',
  '.apropos-proof-grid',
  '.hero-title{font-size:clamp(',
];
for(const token of required) if(!s.includes(token)) throw new Error(`[marketplace-cleanup] validation missing: ${token}`);
const retired=['proposal development services','proposal development,','proposal support','submitted, competitive proposal','"price":"15.00"'];
for(const token of retired) if(s.toLowerCase().includes(token.toLowerCase())) throw new Error(`[marketplace-cleanup] retired/stale content remains: ${token}`);
console.log('[marketplace-cleanup] validation PASS');
