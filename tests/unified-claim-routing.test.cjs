'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('claim-opportunity.html','utf8');

assert.match(html,/AP-XXXXXXXX or NG-XXXXXXXX/);
assert.match(html,/isFederal=\/\^NG-/);
assert.match(html,/isBusiness=\/\^AP-/);
assert.match(html,/\/api\/federal-opportunity\?action=claim/);
assert.match(html,/\/api\/complimentary-opportunity\?action=claim/);
// Federal claims land on OPS's own workspace page, not a marketplace-hosted
// one -- the token travels via URL query string (?t=...), not sessionStorage,
// since the claim (marketplace.aproposgroupllc.com) and the workspace
// (ops.aproposgroupllc.com) are different origins and sessionStorage does
// not cross origins.
assert.match(html,/https:\/\/ops\.aproposgroupllc\.com\/federal-opportunity-workspace\.html\?t=/);
assert.doesNotMatch(html,/aproposFederalOpportunityToken/,'federal claims must not rely on sessionStorage, which cannot cross the marketplace -> ops origin boundary');
assert.match(html,/aproposOpportunityToken/);
assert.match(html,/opportunity-workspace\.html/);

console.log('Unified APROPOS complimentary claim routing passed.');
