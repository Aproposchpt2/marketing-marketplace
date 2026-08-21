'use strict';

const fs = require('fs');
const path = require('path');
const root = process.cwd();

const replacements = [
  ['https://ngcc.aproposgroupllc.com', 'https://federalcontractorportal.aproposgroupllc.com'],
  ['https://capgenmkt.aproposgroupllc.com', 'https://federalcontractorportal.aproposgroupllc.com'],
  ['National Government Contract Center', 'Registered Federal Contractors Portal'],
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'docs', 'validation'].includes(entry.name)) return [];
      return walk(full);
    }
    return [full];
  });
}

const htmlFiles = walk(root).filter(file => file.endsWith('.html'));
for (const file of htmlFiles) {
  let value = fs.readFileSync(file, 'utf8');
  for (const [from, to] of replacements) value = value.replaceAll(from, to);
  fs.writeFileSync(file, value, 'utf8');
}

const runtimeFiles = [
  ...htmlFiles,
  ...walk(path.join(root, 'netlify', 'functions')).filter(file => /\.(?:js|mjs|cjs)$/.test(file)),
  path.join(root, 'netlify.toml'),
].filter(fs.existsSync);

const forbidden = [
  'https://ngcc.aproposgroupllc.com',
  'https://capgenmkt.aproposgroupllc.com',
  'https://businesscontracts.aproposgroupllc.com',
  'https://gcpdc.aproposgroupllc.com',
  'https://ai4websitedesign.com',
  'https://ai4-product-purchasing.ai4businesses.org',
];
const failures = [];
for (const file of runtimeFiles) {
  const value = fs.readFileSync(file, 'utf8');
  for (const token of forbidden) if (value.includes(token)) failures.push(`${path.relative(root, file)} contains retired property: ${token}`);
}

const federal = fs.readFileSync(path.join(root, 'netlify/functions/federal-opportunity.mjs'), 'utf8');
if (!federal.includes('https://federalcontractorportal.aproposgroupllc.com')) failures.push('federal-opportunity does not use RFCP');
const complimentary = fs.readFileSync(path.join(root, 'netlify/functions/complimentary-opportunity.mjs'), 'utf8');
if (!complimentary.includes('https://natcorp.aproposgroupllc.com')) failures.push('legacy state/local claim route does not hand off to NAT-CORP');

if (failures.length) {
  console.error('[marketplace-live-property-allowlist] Validation failed:');
  failures.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}
console.log('[marketplace-live-property-allowlist] PASS — public/runtime APROPOS references are limited to approved live properties.');
