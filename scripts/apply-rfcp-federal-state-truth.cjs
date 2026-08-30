'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const homepageFile = path.join(root, 'index.html');
const rfcpFile = path.join(root, 'registered-federal-contractors-portal', 'index.html');
const RFCP = 'https://federalcontractorportal.aproposgroupllc.com';
const NATCORP = 'https://natcorp.aproposgroupllc.com';

function patchFile(file, replacements) {
  if (!fs.existsSync(file)) throw new Error(`[rfcp-truth] required file missing: ${path.relative(root, file)}`);
  let value = fs.readFileSync(file, 'utf8');
  for (const [before, after] of replacements) value = value.replaceAll(before, after);
  fs.writeFileSync(file, value, 'utf8');
  return value;
}

const homepage = patchFile(homepageFile, [
  [
    'NGCC and its state-level counterparts do that work continuously, so businesses see only the opportunities that actually fit — scored against NAICS alignment, past performance, and certification eligibility — delivered to a personalized dashboard instead of a manual search.',
    'APROPOS procurement platforms organize this fragmented market around the business. The Registered Federal Contractors Portal gives registered federal contractors personalized federal opportunities and released state opportunities, while NAT-CORP provides the state and local pathway for licensed businesses — reducing manual search and helping each business focus on opportunities that fit its capabilities.'
  ],
  [
    'Coverage is built around how businesses are actually classified: Registered Federal Contractors see federal solicitations; Licensed State Businesses see the state opportunities available to them. APROPOS provides guided government-contract opportunity pathways through subscription services that begin with 14-day free trials, connecting procurement intelligence to the service path appropriate for each business.',
    'Coverage is built around how businesses are actually classified: Registered Federal Contractors can review matched federal opportunities and released state opportunities through the Registered Federal Contractors Portal; licensed businesses use NAT-CORP for state and local opportunity pathways. APROPOS connects procurement intelligence to the service path appropriate for each business.'
  ],
  ['National Government Contract Center', 'Registered Federal Contractors Portal'],
  ['<h3 class="help-head">NGCC</h3>', '<h3 class="help-head">Registered Federal Contractors Portal</h3>'],
  [
    'Federal contract intelligence for Registered Federal Contractors — every open federal solicitation, scored for fit and delivered to a personalized dashboard.',
    'Federal and released state opportunity intelligence for Registered Federal Contractors — matched to the business and organized in a personalized dashboard for guided review.'
  ],
  [
    '<h3 class="help-head">Nevada Procurement</h3>\n        <p class="help-text">The same intelligence applied to Nevada state and local government solicitations, for Nevada Licensed State Businesses.</p>',
    '<h3 class="help-head">NAT-CORP Contract Exchange</h3>\n        <p class="help-text">State and local public-sector opportunity matching for licensed businesses, built around business capabilities and supported geographic coverage.</p>'
  ],
  [
    '<h3 class="help-head">California Procurement</h3>\n        <p class="help-text">California state and local government solicitations, matched and scored for California Licensed State Businesses.</p>',
    '<h3 class="help-head">Analyze Fit</h3>\n        <p class="help-text">Decision support for a selected opportunity, helping a business review apparent alignment, requirements, gaps, and next-step questions before committing resources.</p>'
  ],
  ['Explore NGCC &rarr;', 'Visit Federal Contractors Portal &rarr;'],
  ['Nevada Procurement &rarr;', 'Explore NAT-CORP &rarr;'],
  ['California Procurement &rarr;', 'Explore Analyze Fit &rarr;'],
  ['NGCC &mdash; Federal Contract Intelligence', 'Registered Federal Contractors Portal &mdash; Federal + State Opportunity Intelligence'],
  ['>Nevada Procurement</a>', '>NAT-CORP Contract Exchange</a>'],
  ['>California Procurement</a>', '>Analyze Fit</a>'],
  ['NGCC — 14-day free trial, then $99/month', 'Registered Federal Contractors Portal — 14-day free trial, then $99/month'],
  ['Government contract intelligence and opportunity access.', 'Personalized federal opportunities, released state opportunities, and guided opportunity review for registered federal contractors.'],
  ['https://ngcc.aproposgroupllc.com/', `${RFCP}/`],
  ['https://ngcc.aproposgroupllc.com', RFCP],
  ['https://nevadastategen.aproposgroupllc.com', NATCORP],
  ['https://calstategen.aproposgroupllc.com', '/contract-fit-analysis/']
]);

const oldDescription = 'Learn how the Registered Federal Contractors Portal helps registered federal contractors use personalized opportunity matching, intelligent rankings, guided review, and Analyze Fit support.';
const newDescription = 'Learn how the Registered Federal Contractors Portal helps registered federal contractors review personalized federal opportunities and released state opportunities, use intelligent rankings, guided review, and Analyze Fit support.';

const rfcp = patchFile(rfcpFile, [
  [oldDescription, newDescription],
  ['Federal Procurement Intelligence', 'Federal + State Procurement Intelligence'],
  [
    'A business-first federal procurement platform for registered federal contractors that turns a contractor profile into personalized opportunity intelligence, guided evaluation, and a clearer path to action.',
    'A business-first procurement platform for registered federal contractors that turns one contractor profile into personalized federal opportunities, released state opportunities, guided evaluation, and a clearer path to action.'
  ],
  [
    'Registered federal contractors that want a more focused way to identify and evaluate federal opportunities without beginning with a broad, manual search process.',
    'Registered federal contractors that want a more focused way to identify and evaluate federal opportunities while also seeing released state opportunities that align with the same business profile.'
  ],
  [
    'Federal opportunities are organized around the contractor rather than presented as an undifferentiated list of solicitations.',
    'Federal opportunities and released state opportunities are organized around the contractor rather than presented as an undifferentiated list of solicitations.'
  ],
  [
    'A recurring membership experience supports ongoing federal opportunity discovery and review over time.',
    'A recurring membership experience supports ongoing federal opportunity discovery plus review of released state opportunities matched to the contractor profile.'
  ],
  [
    'Begin with the current 14-day free trial and create access to the federal contractor experience.',
    'Begin with the current 14-day free trial and create access to the registered federal contractor experience.'
  ],
  [
    'Provide the information needed to understand what the business does and how it participates in federal procurement.',
    'Provide the information needed to understand what the business does, its federal contractor profile, and the capabilities used to match both federal and released state opportunities.'
  ],
  [
    'Use the resulting dashboard and rankings to focus on opportunities that appear more relevant to the business.',
    'Use the resulting dashboard and rankings to focus on relevant federal opportunities and released state opportunities matched to the business.'
  ],
  [
    'The Registered Federal Contractors Portal is operated by APROPOS Group LLC. It is not a government agency and does not replace SAM.gov, the issuing agency, or the official solicitation. No contract award is guaranteed.',
    'The Registered Federal Contractors Portal is operated by APROPOS Group LLC. It is not a government agency and does not replace SAM.gov, state or local procurement portals, an issuing agency, or the official solicitation. No contract award is guaranteed.'
  ]
]);

const failures = [];
for (const token of ['NGCC', 'nevadastategen.aproposgroupllc.com', 'calstategen.aproposgroupllc.com']) {
  if (homepage.includes(token)) failures.push(`homepage still contains retired public product token: ${token}`);
}
for (const marker of [RFCP, NATCORP, 'Registered Federal Contractors can review matched federal opportunities and released state opportunities']) {
  if (!homepage.includes(marker)) failures.push(`homepage missing current product-truth marker: ${marker}`);
}
for (const marker of [newDescription, 'Federal + State Procurement Intelligence', 'personalized federal opportunities, released state opportunities']) {
  if (!rfcp.includes(marker)) failures.push(`RFCP Marketplace page missing current product-truth marker: ${marker}`);
}
for (const stale of [oldDescription, 'business-first federal procurement platform', 'ongoing federal opportunity discovery and review over time']) {
  if (rfcp.includes(stale)) failures.push(`RFCP Marketplace page still contains stale federal-only wording: ${stale}`);
}

if (failures.length) {
  console.error('[rfcp-truth] Validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[rfcp-truth] PASS — Marketplace homepage and RFCP deep-dive now express the current Federal + State product model and remove retired public pathway language.');
