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

function replaceMatchingSection(html) {
  const pattern = /<section\b[^>]*\bid=["']matching["'][^>]*>[\s\S]*?<\/section>/i;
  if (!pattern.test(html)) {
    throw new Error('[rfcp-truth] Marketplace homepage is missing the #matching procurement section.');
  }

  const section = `<section class="section-band alt" id="matching">
  <div class="section-inner">
    <div class="gold-rule"></div>
    <div class="eyebrow">Service One &middot; Contract Intelligence</div>
    <h2 class="section-title">Government opportunities matched to the business before the business has to search every portal.</h2>
    <p class="section-copy">Federal, state, and local procurement opportunities are distributed across different government systems, agencies, formats, and solicitation processes. APROPOS organizes that fragmented market around the business so contractors can focus on opportunities that align with their capabilities while preserving each issuing agency and official solicitation as the controlling authority.</p>
    <p class="section-copy">Registered Federal Contractors use the Registered Federal Contractors Portal for personalized federal opportunities and released state opportunities matched to their contractor profile. Licensed businesses use NAT-CORP for state and local opportunity pathways. Federal and state opportunities remain distinct procurement markets with their own portals, solicitations, amendments, eligibility rules, deadlines, and submission requirements.</p>
    <div class="help-grid">
      <article class="help-card">
        <h3 class="help-head">Registered Federal Contractors Portal</h3>
        <p class="help-text">Personalized federal opportunities plus released state opportunities for registered federal contractors, organized around the contractor profile for guided review.</p>
      </article>
      <article class="help-card">
        <h3 class="help-head">NAT-CORP Contract Exchange</h3>
        <p class="help-text">State and local public-sector opportunity matching for licensed businesses, built around business capabilities and supported geographic coverage.</p>
      </article>
      <article class="help-card">
        <h3 class="help-head">Analyze Fit</h3>
        <p class="help-text">Decision support for a selected opportunity, helping a business review apparent alignment, requirements, gaps, and next-step questions before committing resources.</p>
      </article>
    </div>
    <div class="service-cta-row">
      <a class="btn-gold" href="${RFCP}">Visit Federal Contractors Portal &rarr;</a>
      <a class="btn-outline" href="${NATCORP}">Explore NAT-CORP &rarr;</a>
      <a class="btn-outline" href="/contract-fit-analysis/">Explore Analyze Fit &rarr;</a>
    </div>
  </div>
</section>`;

  return html.replace(pattern, section);
}

let homepage = patchFile(homepageFile, [
  ['National Government Contract Center', 'Registered Federal Contractors Portal'],
  ['NGCC — 14-day free trial, then $99/month', 'Registered Federal Contractors Portal — 14-day free trial, then $99/month'],
  ['Government contract intelligence and opportunity access.', 'Personalized federal opportunities, released state opportunities, and guided opportunity review for registered federal contractors.'],
  ['https://ngcc.aproposgroupllc.com/', `${RFCP}/`],
  ['https://ngcc.aproposgroupllc.com', RFCP],
  ['https://nevadastategen.aproposgroupllc.com', NATCORP],
  ['https://calstategen.aproposgroupllc.com', '/contract-fit-analysis/'],
  ['NGCC &mdash; Federal Contract Intelligence', 'Registered Federal Contractors Portal &mdash; Federal + State Opportunity Intelligence'],
  ['>Nevada Procurement</a>', '>NAT-CORP Contract Exchange</a>'],
  ['>California Procurement</a>', '>Analyze Fit</a>']
]);

homepage = replaceMatchingSection(homepage);
fs.writeFileSync(homepageFile, homepage, 'utf8');

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
const matchingSection = homepage.match(/<section\b[^>]*\bid=["']matching["'][^>]*>[\s\S]*?<\/section>/i)?.[0] || '';

for (const token of ['NGCC', 'nevadastategen.aproposgroupllc.com', 'calstategen.aproposgroupllc.com']) {
  if (homepage.includes(token)) failures.push(`homepage still contains retired public product token: ${token}`);
}

for (const marker of [
  'Registered Federal Contractors Portal',
  'personalized federal opportunities',
  'released state opportunities',
  'NAT-CORP Contract Exchange',
  RFCP,
  NATCORP,
  '/contract-fit-analysis/'
]) {
  if (!matchingSection.includes(marker)) failures.push(`homepage #matching section missing current product-truth marker: ${marker}`);
}

for (const stale of [
  'Registered Federal Contractors see federal solicitations',
  '>Nevada Procurement<',
  '>California Procurement<',
  'Explore NGCC'
]) {
  if (matchingSection.includes(stale)) failures.push(`homepage #matching section still contains stale product wording: ${stale}`);
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

console.log('[rfcp-truth] PASS — Marketplace homepage and RFCP deep-dive express the current Federal + State product model with deterministic section-level validation.');
