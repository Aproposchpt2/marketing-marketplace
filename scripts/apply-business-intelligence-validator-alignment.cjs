'use strict';

const fs = require('fs');
const file = 'scripts/validate-marketplace-article-engine.cjs';
let source = fs.readFileSync(file, 'utf8');
const from = "'The Government Contract Marketplace'";
const to = "'APROPOS BUSINESS INTELLIGENCE MARKETPLACE'";
if (!source.includes(from)) throw new Error('[business-intelligence-validator] legacy article-engine hero marker not found');
source = source.replace(from, to);
fs.writeFileSync(file, source, 'utf8');
console.log('[business-intelligence-validator] PASS — article-engine validator aligned to current Marketplace identity');
