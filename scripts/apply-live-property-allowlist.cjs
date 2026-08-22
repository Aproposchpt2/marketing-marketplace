'use strict';

const fs = require('fs');
const path = require('path');
const root = process.cwd();
const RFCP = 'https://federalcontractorportal.aproposgroupllc.com';
const NATCORP = 'https://natcorp.aproposgroupllc.com';
const NEBC = 'https://nebc.aproposgroupllc.com';
const MARKETPLACE = 'https://marketplace.aproposgroupllc.com';
const AI4WEBSITE = 'https://ai4websitedesign.com';
const AI4WEBSITE_ES = 'https://espanola.ai4websitedesign.com';

function normalize(value) {
  return value
    .replaceAll('https://ngcc.aproposgroupllc.com', RFCP)
    .replaceAll('https://capgenmkt.aproposgroupllc.com', RFCP)
    .replaceAll('https://businesscontracts.aproposgroupllc.com', NATCORP)
    .replaceAll('https://gcpdc.aproposgroupllc.com', `${MARKETPLACE}/government-proposal-development`)
    .replace(/https:\/\/ai4-product-purchasing\.ai4businesses\.org\/(?:ngcc|capgen)[^"'\s<]*/gi, RFCP)
    .replace(/https:\/\/ai4-product-purchasing\.ai4businesses\.org\/natcorp[^"'\s<]*/gi, NATCORP)
    .replace(/https:\/\/ai4-product-purchasing\.ai4businesses\.org\/nebc[^"'\s<]*/gi, NEBC)
    .replace(/https:\/\/ai4-product-purchasing\.ai4businesses\.org\/analyze-fit[^"'\s<]*/gi, `${MARKETPLACE}/contract-fit-analysis/`)
    .replace(/https:\/\/ai4-product-purchasing\.ai4businesses\.org\/[A-Za-z0-9._~!$&()*+,;=:@%/?#-]*/gi, `${MARKETPLACE}/`)
    .replaceAll('National Government Contract Center', 'Registered Federal Contractors Portal');
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'docs', 'validation', 'scripts'].includes(entry.name)) return [];
      return walk(full);
    }
    return [full];
  });
}

const htmlFiles = walk(root).filter(file => file.endsWith('.html'));
const functionFiles = walk(path.join(root, 'netlify', 'functions')).filter(file => /\.(?:js|mjs|cjs)$/.test(file));
const runtimeFiles = [...htmlFiles, ...functionFiles, path.join(root, 'netlify.toml')].filter(fs.existsSync);
for (const file of runtimeFiles) {
  const before = fs.readFileSync(file, 'utf8');
  const after = normalize(before);
  if (after !== before) fs.writeFileSync(file, after, 'utf8');
}

const forbidden = [
  'ngcc.aproposgroupllc.com',
  'capgenmkt.aproposgroupllc.com',
  'businesscontracts.aproposgroupllc.com',
  'gcpdc.aproposgroupllc.com',
  'ai4-product-purchasing.ai4businesses.org',
];
const failures = [];
for (const file of runtimeFiles) {
  const value = fs.readFileSync(file, 'utf8');
  for (const token of forbidden) if (value.includes(token)) failures.push(`${path.relative(root, file)} contains retired property: ${token}`);
}

const federal = fs.readFileSync(path.join(root, 'netlify/functions/federal-opportunity.mjs'), 'utf8');
if (!federal.includes(RFCP)) failures.push('federal-opportunity does not use RFCP');
const complimentary = fs.readFileSync(path.join(root, 'netlify/functions/complimentary-opportunity.mjs'), 'utf8');
if (!complimentary.includes(NATCORP)) failures.push('legacy state/local claim route does not hand off to NAT-CORP');

const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!homepage.includes(AI4WEBSITE)) failures.push('Marketplace homepage does not retain live AI4 Website Design destination');
if (!homepage.includes(AI4WEBSITE_ES)) failures.push('Marketplace homepage does not retain live Spanish AI4 Website Design destination');

if (failures.length) {
  console.error('[marketplace-live-property-allowlist] Validation failed:');
  failures.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}
console.log('[marketplace-live-property-allowlist] PASS — public/runtime APROPOS references are limited to approved live properties, including AI4 Website Design English and Spanish production sites.');