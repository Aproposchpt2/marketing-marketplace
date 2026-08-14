'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('claim-opportunity.html','utf8');

assert.match(html,/AP-XXXXXXXX or NG-XXXXXXXX/);
assert.match(html,/isFederal=\/\^NG-/);
assert.match(html,/isBusiness=\/\^AP-/);
assert.match(html,/\/api\/federal-opportunity\?action=claim/);
assert.match(html,/\/api\/complimentary-opportunity\?action=claim/);
assert.match(html,/aproposFederalOpportunityToken/);
assert.match(html,/federal-opportunity-workspace\.html/);
assert.match(html,/aproposOpportunityToken/);
assert.match(html,/opportunity-workspace\.html/);

console.log('Unified APROPOS complimentary claim routing passed.');
