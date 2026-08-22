'use strict';

const fs = require('fs');

const homepage = 'index.html';
const claimPage = 'claim-opportunity.html';
let html = fs.readFileSync(homepage, 'utf8');
let claim = fs.readFileSync(claimPage, 'utf8');

const heroPattern = /<p class="hero-copy">Every year, billions in federal and state contracts go unbid, under-bid, or awarded to the same short list of incumbents[\s\S]*?<\/p>/;
if (!heroPattern.test(html)) throw new Error('[marketplace-trust] legacy hero procurement claim not found');
html = html.replace(
  heroPattern,
  '<p class="hero-copy">Government contracting opportunities are distributed across many agencies, procurement systems, and solicitation formats. Qualified businesses can still struggle to discover relevant opportunities, understand the requirements, and decide where to focus. APROPOS Marketing Marketplace is designed to make that pathway clearer — from education and discovery to the specialized APROPOS service that fits the next step.</p>'
);

const legacyRegistryOne = '<p class="section-copy">Most solicitations evaluate past performance as 20 to 40 percent of the total award decision. A business with no prior government contract has no legitimate way to satisfy that requirement on its own — the classic catch-22 that keeps qualified, capable companies out of a market built to include them. The Sub-Contractor Registry and Partnership Portal exist to break that loop.</p>';
const registryOne = '<p class="section-copy">Past performance can be an important evaluation factor in federal negotiated acquisitions, but its relevance and relative importance depend on the solicitation. FAR 15.304 requires evaluation factors and their relative importance to be stated in the solicitation and generally requires past-performance evaluation for negotiated competitive acquisitions above the simplified acquisition threshold unless the contracting officer documents why it is not appropriate.</p>';
if (!html.includes(legacyRegistryOne)) throw new Error('[marketplace-trust] legacy 20–40 percent past-performance claim not found');
html = html.replace(legacyRegistryOne, registryOne);

const legacyRegistryTwo = '<p class="section-copy">A business registers free in the Registry, is matched to a prime through the Partnership Portal, fulfills the contract as a sub-contractor, and walks away with documented, verifiable past performance — the exact asset federal and state solicitations require. FAR 15.305(a)(2) explicitly allows evaluation of past performance built as a first-tier subcontractor, and current SBA rules require prime contractors to provide that performance documentation to small business subcontractors when requested. Enough fulfilled sub-contracts, and that business is positioned to bid as a prime in its own right. On the other side, primes get a searchable pool of vetted, capable subs without running their own vetting process from scratch.</p>';
const registryTwo = '<p class="section-copy">Subcontracting can help a business build documented performance history, relationships, and delivery experience. Whether subcontract performance is accepted as relevant past performance for a future prime bid depends on the specific solicitation and the evaluator’s stated criteria. SBA also identifies subcontracting as an established pathway for small businesses seeking federal contracting experience and encourages businesses to maintain complete capability and performance-history information.</p><p class="section-copy source-note"><strong>Authoritative references:</strong> <a href="https://www.acquisition.gov/far/15.304" target="_blank" rel="noopener noreferrer">FAR 15.304 — Evaluation factors and significant subfactors</a> · <a href="https://www.sba.gov/counseling/prime-and-subcontracting/" target="_blank" rel="noopener noreferrer">U.S. Small Business Administration — Prime and subcontracting</a>.</p>';
if (!html.includes(legacyRegistryTwo)) throw new Error('[marketplace-trust] legacy subcontractor past-performance claim not found');
html = html.replace(legacyRegistryTwo, registryTwo);

if (!claim.includes('<meta name="robots" content="index,follow">')) throw new Error('[marketplace-trust] claim-page robots marker not found');
claim = claim.replace('<meta name="robots" content="index,follow">', '<meta name="robots" content="noindex,nofollow">');

fs.writeFileSync(homepage, html, 'utf8');
fs.writeFileSync(claimPage, claim, 'utf8');
console.log('[marketplace-trust] PASS — procurement claims qualified, authoritative references added, claim crawl directive reconciled');
