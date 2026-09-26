'use strict';

const fs = require('fs');

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

const OLD_CARD = `      <article class="amm-card amm-card-featured">
        <div class="amm-card-tag">AI-Powered Communications</div>
        <h3>AI4 Contact Center</h3>
        <p>Intelligent voice management for businesses with high inbound call volume. Keep the existing business number while adding automated answering, routing, information capture, organization, and response workflow.</p>
        <div class="amm-card-meta">Stellar Voice Management</div>
        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://ai4contactcenter.aproposgroupllc.com/">Visit AI4 Contact Center</a></div>
      </article>`;

const NEW_CARD = `      <article class="amm-card amm-card-featured" data-property="ai4-contact-center">
        <div class="amm-card-tag">Intelligent Customer Engagement</div>
        <h3>AI4 Contact Center</h3>
        <p><strong>Intelligent Customer Engagement Operation Center.</strong> The Intelligence Layer — Not the Replacement Layer. Keep your number, phones, current provider, and established workflows while adding intelligent customer engagement, routing, queue management, customer intake, lead qualification, workflow automation, analytics, and 24/7/365 coverage.</p>
        <p>Built for high-volume businesses and departments that need enterprise-style customer operations without an enterprise-wide rip-and-replace project.</p>
        <div class="amm-card-meta">KEEP YOUR NUMBER. ADD THE INTELLIGENCE.</div>
        <div class="amm-actions"><a class="amm-btn amm-btn-primary" href="/ai4-contact-center/">Learn More</a><a class="amm-btn amm-btn-outline" href="https://ai4contactcenter.aproposgroupllc.com/">Visit AI4 Contact Center</a></div>
      </article>`;

if (!html.includes(OLD_CARD)) {
  throw new Error('[ai4-intelligence-messaging] current AI4 Marketplace card was not found; refusing an ambiguous rewrite');
}

html = html.replace(OLD_CARD, NEW_CARD);

html = html
  .replaceAll('AI-Powered Communications', 'Intelligent Customer Engagement')
  .replaceAll('AI-powered communications', 'intelligent customer engagement');

const required = [
  'data-property="ai4-contact-center"',
  'Intelligent Customer Engagement Operation Center',
  'The Intelligence Layer — Not the Replacement Layer.',
  'KEEP YOUR NUMBER. ADD THE INTELLIGENCE.',
  '24/7/365 coverage',
  'href="/ai4-contact-center/"',
  'https://ai4contactcenter.aproposgroupllc.com/'
];

for (const token of required) {
  if (!html.includes(token)) throw new Error(`[ai4-intelligence-messaging] validation missing: ${token}`);
}

if (html.includes('Intelligent voice management for businesses with high inbound call volume')) {
  throw new Error('[ai4-intelligence-messaging] retired AI4 voice-management copy remains');
}

fs.writeFileSync(file, html, 'utf8');
console.log('[ai4-intelligence-messaging] PASS — AI4 Marketplace messaging aligned and routed through standalone product page');
