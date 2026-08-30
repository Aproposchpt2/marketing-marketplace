'use strict';

const fs = require('fs');

const failures = [];
const home = fs.existsSync('index.html') ? fs.readFileSync('index.html', 'utf8') : '';
const page = fs.existsSync('government-contract-portal/index.html') ? fs.readFileSync('government-contract-portal/index.html', 'utf8') : '';
const sitemap = fs.existsSync('sitemap.xml') ? fs.readFileSync('sitemap.xml', 'utf8') : '';

function requireText(source, value, label) {
  if (!source.includes(value)) failures.push(`missing ${label}: ${value}`);
}

function forbidText(source, value, label) {
  if (source.includes(value)) failures.push(`forbidden ${label}: ${value}`);
}

requireText(home, 'Government Contract Portal', 'Marketplace Government Contract Portal identity');
requireText(home, 'https://acb.aproposgroupllc.com/', 'live Government Contract Portal destination');
requireText(home, '/government-contract-portal/', 'Marketplace deep-dive route');
requireText(home, 'id="agency-partnerships"', 'agency partnership section');
requireText(home, 'Less time searching.', 'advisor-first value proposition');
requireText(home, '30-day Agency Evaluation', 'evaluation program positioning');

requireText(page, '<h1>Government Contract Portal</h1>', 'deep-dive headline');
requireText(page, 'Built for the advisor relationship.', 'advisor audience framing');
requireText(page, 'Business Capability Profile', 'business capability profile capability');
requireText(page, 'Federal and California inventory', 'current inventory scope');
requireText(page, 'SAM.gov', 'federal source truth');
requireText(page, 'Authoritative-source transparency', 'publisher handoff principle');
requireText(page, 'The Portal informs.', 'operating principle');
requireText(page, 'https://acb.aproposgroupllc.com/', 'deep-dive live destination');
requireText(page, 'https://marketplace.aproposgroupllc.com/government-contract-portal/', 'deep-dive canonical');

forbidText(page, 'Package-Verified Contract Evaluation', 'unreleased package-verified evaluation claim');
forbidText(page, 'Request More Evaluation', 'unreleased Request More Evaluation claim');
forbidText(page, 'guarantee contract', 'award guarantee language');
forbidText(page, '$', 'consumer pricing on agency deep-dive page');

requireText(sitemap, 'https://marketplace.aproposgroupllc.com/government-contract-portal/', 'sitemap route');

if (failures.length) {
  console.error('[gcp-marketplace-validation] FAIL');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[gcp-marketplace-validation] PASS — agency-first Government Contract Portal Marketplace integration verified.');
