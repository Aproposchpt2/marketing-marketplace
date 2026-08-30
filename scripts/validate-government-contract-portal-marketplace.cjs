'use strict';

const fs = require('fs');

const failures = [];
const home = fs.existsSync('index.html') ? fs.readFileSync('index.html', 'utf8') : '';
const page = fs.existsSync('government-contract-portal/index.html') ? fs.readFileSync('government-contract-portal/index.html', 'utf8') : '';
const sitemap = fs.existsSync('sitemap.xml') ? fs.readFileSync('sitemap.xml', 'utf8') : '';
const css = fs.existsSync('landing-pages.css') ? fs.readFileSync('landing-pages.css', 'utf8') : '';

const LIVE = 'https://acb.aproposgroupllc.com/';
const EVALUATION = 'https://acb.aproposgroupllc.com/agency-login.html';
const CANONICAL = 'https://marketplace.aproposgroupllc.com/government-contract-portal/';

function requireText(source, value, label) {
  if (!source.includes(value)) failures.push(`missing ${label}: ${value}`);
}

function forbidText(source, value, label) {
  if (source.toLowerCase().includes(value.toLowerCase())) failures.push(`forbidden ${label}: ${value}`);
}

// Marketplace property card and institutional positioning.
requireText(home, 'data-property="government-contract-portal"', 'Government Contract Portal property card');
requireText(home, 'Agency Procurement Intelligence', 'agency procurement category');
requireText(home, '<h3>Government Contract Portal</h3>', 'exact product identity');
requireText(home, '30-DAY AGENCY EVALUATION', 'agency evaluation positioning');
requireText(home, `href="${LIVE}">Explore Government Contract Portal`, 'primary live-product CTA');
requireText(home, 'href="/government-contract-portal/">Learn More', 'secondary deep-dive CTA');
requireText(home, 'id="agency-procurement-intelligence"', 'institutional homepage section');
requireText(home, 'Less time searching.', 'homepage value proposition');
requireText(home, 'More time advising.', 'homepage value proposition completion');
requireText(home, 'Agency → Advisor → Business', 'three-way value hierarchy');

// Deep-dive route, audience, headline, and advisor experience.
requireText(page, '<title>Government Contract Portal for Business Development Agencies | APROPOS</title>', 'approved SEO title');
requireText(page, 'Government Contract Portal helps Business Development Agencies and Advisors identify public contract opportunities aligned with the capabilities of the businesses they serve.', 'approved SEO description');
requireText(page, '<h1>LESS TIME SEARCHING.<br>MORE TIME ADVISING.</h1>', 'approved hero headline');
requireText(page, 'AGENCY PROCUREMENT INTELLIGENCE', 'deep-dive eyebrow');
requireText(page, 'Give your Advisors a dedicated environment for identifying government contract opportunities aligned with the capabilities of the businesses they serve.', 'hero support');
requireText(page, 'BUILT AROUND THE ADVISORY RELATIONSHIP', 'advisor section headline');
for (const statement of ['The Portal searches.', 'The Contract Brief explains.', 'The Advisor advises.', 'The business decides.']) {
  requireText(page, statement, `advisor operating statement ${statement}`);
}
for (const step of ['BUSINESS CAPABILITY PROFILE', 'CONTRACT OPPORTUNITY DISCOVERY', 'OPPORTUNITY MATCHING', 'CONTRACT BRIEF', 'ADVISOR + CLIENT DISCUSSION', 'AUTHORITATIVE PROCUREMENT SOURCE']) {
  requireText(page, step, `advisor workflow step ${step}`);
}

// Current capability truth.
for (const capability of [
  'Agency-assisted business intake',
  'Business Capability Profiles',
  'Federal + State / Local discovery',
  'Requirement extraction',
  'Capability-to-contract matching',
  'Opportunity Match Scores',
  'Contract Briefs',
  'deadline awareness',
  'Advisor/client discussions',
  'Authoritative publisher links',
  'Agency Evaluation access'
]) {
  requireText(page, capability, `current capability ${capability}`);
}

// Federal + state/local framing and authoritative-source boundary.
requireText(page, 'Registered Federal Contractors:', 'registered federal contractor pathway');
requireText(page, 'SAM.gov', 'federal source truth');
requireText(page, 'Licensed Businesses:', 'licensed business pathway');
requireText(page, 'validated public procurement sources', 'state/local source truth');
requireText(page, 'does not imply a formal API partnership or publisher relationship', 'publisher-independence disclaimer');
for (const sourceItem of ['Complete solicitation documents', 'Amendments', 'Vendor registration', 'Submission requirements', 'Official deadlines', 'Bid submission']) {
  requireText(page, sourceItem, `authoritative source item ${sourceItem}`);
}
for (const boundary of [
  'THE PORTAL INFORMS.',
  'THE AUTHORITATIVE SOURCE ESTABLISHES THE OFFICIAL PROCUREMENT REQUIREMENTS.',
  'THE ADVISOR HELPS THE BUSINESS UNDERSTAND THE OPPORTUNITY.',
  'THE CONTRACTOR DECIDES WHETHER TO PURSUE.'
]) {
  requireText(page, boundary, `product boundary ${boundary}`);
}

// Three-way value and evaluation routing.
for (const value of ['FOR THE AGENCY', 'FOR THE ADVISOR', 'FOR THE BUSINESS']) requireText(page, value, `three-way value ${value}`);
requireText(page, '30-Day Agency Evaluation', 'deep-dive evaluation label');
requireText(page, `href="${EVALUATION}">Begin Agency Evaluation`, 'approved evaluation entry route');
requireText(page, 'AGENCY30', 'agency evaluation access code');
requireText(page, `href="${LIVE}">Explore Government Contract Portal`, 'deep-dive live destination');

// SEO, sitemap, and structured data.
requireText(page, `href="${CANONICAL}"`, 'deep-dive canonical');
requireText(sitemap, CANONICAL, 'sitemap route');
requireText(home, CANONICAL, 'homepage structured-data route');
requireText(home, '"name":"Government Contract Portal"', 'homepage structured-data product identity');
requireText(page, '"@type":"Service"', 'deep-dive Service schema');
requireText(page, '"serviceType":"Agency procurement intelligence"', 'deep-dive service type');

// Responsive acceptance: shared deep-dive design system must retain desktop,
// tablet, and mobile layouts.
requireText(css, 'grid-template-columns:repeat(3,minmax(0,1fr))', 'desktop three-column layout');
requireText(css, '@media(max-width:850px)', 'tablet breakpoint');
requireText(css, 'grid-template-columns:1fr 1fr', 'tablet two-column layout');
requireText(css, '@media(max-width:560px)', 'mobile breakpoint');
requireText(css, '.btn{width:100%', 'mobile full-width CTA treatment');

// Product-truth restrictions: these future package-analysis capabilities are
// explicitly not approved for Marketplace publication at this baseline.
for (const claim of [
  'customer-uploaded solicitation-package analysis',
  'Package-Verified Contract Evaluation',
  'full capability-by-capability match breakdown',
  'complete customer-facing package-analysis report generator'
]) {
  forbidText(page, claim, `unvalidated future capability ${claim}`);
}

// Do not publish affirmative endorsement or guaranteed-outcome claims.
for (const claim of [
  'endorsed by Los Angeles County',
  'endorsed by SBDC',
  'approved by SBDC',
  'guaranteed eligibility',
  'guaranteed responsiveness',
  'guaranteed contract award',
  'guaranteed business growth'
]) {
  forbidText(page, claim, `unsupported public claim ${claim}`);
}

// No consumer pricing and no internal credentials/secrets. AGENCY30 is the
// only approved public evaluation code on this page.
forbidText(page, '$', 'consumer pricing on institutional deep-dive');
for (const token of ['SUPABASE_SERVICE', 'API_KEY', 'AUTH_TOKEN_SECRET', 'CBRIEF_COMMAND_KEY', 'Bearer ']) {
  forbidText(page, token, `internal credential marker ${token}`);
}

if (failures.length) {
  console.error('[gcp-marketplace-validation] FAIL');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[gcp-marketplace-validation] PASS — Government Contract Portal card, institutional deep-dive, Agency Evaluation routing, responsive design, sitemap, structured data, product boundaries, and public-claim restrictions verified.');
