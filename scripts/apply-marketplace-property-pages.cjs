'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const origin = 'https://marketplace.aproposgroupllc.com';
const analytics = `<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-FGJG583DTL"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FGJG583DTL');</script>`;

const pages = [
  {
    dir: 'registered-federal-contractors-portal',
    eyebrow: 'Federal Procurement Intelligence',
    title: 'Registered Federal Contractors Portal',
    description: 'Learn how the Registered Federal Contractors Portal helps registered federal contractors use personalized opportunity matching, intelligent rankings, guided review, and Analyze Fit support.',
    lead: 'A business-first federal procurement platform for registered federal contractors that turns a contractor profile into personalized opportunity intelligence, guided evaluation, and a clearer path to action.',
    audience: 'Registered federal contractors that want a more focused way to identify and evaluate federal opportunities without beginning with a broad, manual search process.',
    cards: [
      ['Guided onboarding','A structured starting point establishes the contractor profile, capabilities, registrations, and procurement context used by the portal.'],
      ['Personalized contract matching','Federal opportunities are organized around the contractor rather than presented as an undifferentiated list of solicitations.'],
      ['Intelligent ranking','Opportunity intelligence helps the contractor focus attention on contracts that appear more relevant to the business profile and capabilities.'],
      ['Opportunity review','Members can move from a match into the solicitation context and review the contract information needed for the next decision.'],
      ['Analyze Fit','For a selected opportunity, Analyze Fit provides additional decision intelligence about apparent alignment, potential gaps, verification needs, important questions, and bid/no-bid considerations.'],
      ['Continuing member access','A recurring membership experience supports ongoing federal opportunity discovery and review over time.']
    ],
    steps: [
      ['Start the membership','Begin with the current 14-day free trial and create access to the federal contractor experience.'],
      ['Build the business profile','Provide the information needed to understand what the business does and how it participates in federal procurement.'],
      ['Review personalized opportunities','Use the resulting dashboard and rankings to focus on opportunities that appear more relevant to the business.'],
      ['Evaluate before committing','Review the official solicitation and, when useful, use Analyze Fit for additional decision support before pursuing the opportunity.']
    ],
    terms: 'Current published access: 14-day free trial, then $99 per month. Additional Analyze Fit reports are currently published at $79 one-time. Pricing and availability remain subject to the current terms on the production site.',
    live: 'https://federalcontractorportal.aproposgroupllc.com/',
    liveLabel: 'Visit the Registered Federal Contractors Portal',
    related: [['Federal opportunity guidance','/federal-contract-opportunities/'],['Contract fit analysis','/contract-fit-analysis/'],['Government contract intelligence','/government-contract-intelligence/']],
    disclaimer: 'The Registered Federal Contractors Portal is operated by APROPOS Group LLC. It is not a government agency and does not replace SAM.gov, the issuing agency, or the official solicitation. No contract award is guaranteed.'
  },
  {
    dir: 'nat-corp-contract-exchange',
    eyebrow: 'State & Local Procurement Intelligence',
    title: 'National Corporate Contract Exchange — NAT-CORP',
    description: 'Learn how NAT-CORP uses business capability intelligence and personalized matching to help licensed contractors discover and evaluate state and local public-sector opportunities.',
    lead: 'NAT-CORP starts with the business. It is designed to help licensed contractors discover and evaluate state and local public-sector opportunities through business capability intelligence rather than requiring the contractor to know every portal, classification, or search term in advance.',
    audience: 'Licensed contractors seeking state and local government opportunities and a guided way to connect business capabilities with relevant public-sector procurement demand.',
    cards: [
      ['Business-first capability profile','The experience begins with the business and builds an evidence-backed understanding of the services, capabilities, and operating profile used for opportunity matching.'],
      ['State and local opportunity matching','Qualified opportunities can be compared against the business profile so contractors can focus on public-sector work that appears more relevant.'],
      ['Intelligent rankings','The exchange helps prioritize opportunities rather than forcing the business owner to manually sort through large, unrelated procurement inventories.'],
      ['Guided opportunity review','The contractor can move from discovery into the opportunity context and review the information that matters for the next procurement decision.'],
      ['Analyze Fit support','Selected opportunities can be examined for apparent alignment, gaps, verification needs, and bid/no-bid questions while preserving the official solicitation as the authority.'],
      ['Expanding multi-state coverage','NAT-CORP is built as a multi-state public-sector procurement service with continued expansion toward broader nationwide coverage.']
    ],
    steps: [
      ['Start with the business','Provide the business information and website context used to understand what the company actually offers.'],
      ['Build capability intelligence','Translate available evidence into a structured capability picture that can support opportunity matching.'],
      ['Match released opportunities','Compare the business profile with qualified state and local opportunities in the supported inventory.'],
      ['Investigate the best candidates','Review source material, verify requirements, and decide which opportunities deserve deeper pursuit.']
    ],
    terms: 'Current published access: 14-day free trial, then $119 per month. Current production messaging describes multi-state coverage with continued expansion. Pricing, geographic coverage, and availability remain subject to current production terms.',
    live: 'https://natcorp.aproposgroupllc.com/',
    liveLabel: 'Visit NAT-CORP',
    related: [['State & local opportunity guidance','/state-local-contract-opportunities/'],['Contractor opportunity matching','/contractor-opportunity-matching/'],['Contract fit analysis','/contract-fit-analysis/']],
    disclaimer: 'NAT-CORP is operated by APROPOS Group LLC and is not a government procurement portal or awarding authority. Businesses must verify eligibility, deadlines, attachments, addenda, and response requirements with the issuing organization.'
  },
  {
    dir: 'national-enterprise-business-center',
    eyebrow: 'Business Development & Readiness',
    title: 'National Enterprise Business Center — NEBC',
    description: 'Learn how NEBC supports business assessment, personalized action planning, post-assessment guidance, funding readiness, growth, and procurement preparation.',
    lead: 'NEBC is an online full-service business center designed to help owners understand where the business stands, identify practical next steps, and move into the business-development service pathway that fits the company’s current needs.',
    audience: 'Established businesses, growth-stage companies, and early-stage owners that need structured business assessment, readiness guidance, planning, funding guidance, procurement preparation, or other business-development support.',
    cards: [
      ['Business assessment','The experience begins with a structured assessment that gathers the information needed to understand the business and its current stage.'],
      ['Personalized assessment report','The owner receives a business-specific report that organizes findings, priorities, and practical development considerations.'],
      ['Morgan’s Office','After the assessment and report, the owner can continue into Morgan’s Office for post-assessment business-development guidance grounded in the business context already provided.'],
      ['Readiness and action planning','NEBC helps organize preparation work across business fundamentals, planning, management, financial readiness, and growth priorities.'],
      ['Funding guidance and leads','Funding support focuses on readiness, purpose, preparation, available lead pathways, and responsible next steps. It does not promise grants, loans, or approvals.'],
      ['Procurement preparation','Businesses pursuing public-sector work can receive guidance that helps them prepare for contracting and connect to the appropriate procurement pathway.']
    ],
    steps: [
      ['Complete the assessment','Start with the business assessment and provide the operating information needed to evaluate the business.'],
      ['Review the personalized report','Use the generated report to understand priorities, strengths, preparation needs, and possible next actions.'],
      ['Enter Morgan’s Office','Continue into the post-assessment advisory experience with the assessment context already available.'],
      ['Route to the right service','Move into the business-development, funding, planning, procurement, or specialist pathway that best matches the business need.']
    ],
    terms: 'Current published access: 14-day free trial, then $39 per month. The assessment and service experience should be reviewed on the production site for the latest terms and availability.',
    live: 'https://nebc.aproposgroupllc.com/',
    liveLabel: 'Visit NEBC',
    related: [['Business contract readiness','/business-contract-readiness/'],['Contractor participation','/contractor-participation/'],['Procurement partnerships','/procurement-partnerships/']],
    disclaimer: 'NEBC provides business-development guidance and decision support. Funding guidance and leads do not constitute a promise of financing, grant eligibility, approval, or award. Final decisions remain with the applicable lender, funder, agency, or program.'
  },
  {
    dir: 'ai4-businesses',
    eyebrow: 'Business Automation',
    title: 'AI4 Businesses',
    description: 'Explore AI4 Businesses automation systems for call routing, lead capture, customer intake, AI voice response, routing, response management, and structured follow-up.',
    lead: 'AI4 Businesses brings practical automation into everyday operating workflows so businesses can reduce repetitive handling, respond more consistently, and route customer activity into clearer next steps.',
    audience: 'Businesses that want to automate recurring customer and operational workflows without turning the entire company into a software project.',
    cards: [
      ['Smart call routing','Route inbound calls and requests according to business rules, customer needs, and the appropriate destination.'],
      ['Lead capture and management','Capture prospect information in a structured workflow so inquiries are less likely to disappear between channels or handoffs.'],
      ['AI voice response','Use conversational automation for defined customer interactions while maintaining clear escalation and operational boundaries.'],
      ['Customer intake','Collect the information needed to understand the request before routing it to a person, workflow, or next action.'],
      ['Response management','Standardize routine responses and make follow-up more consistent across common business scenarios.'],
      ['Live demonstration pathway','Businesses can explore live demonstrations of available automation experiences before deciding which workflow is relevant.']
    ],
    steps: [
      ['Identify the repetitive workflow','Start with a real operating bottleneck such as calls, leads, intake, routing, or follow-up.'],
      ['Review the matching automation','Explore the AI4 Businesses system or demo built for that type of workflow.'],
      ['Define business rules','Clarify what the automation should collect, decide, route, and escalate.'],
      ['Move toward implementation','Use the production service to evaluate the appropriate automation pathway for the business.']
    ],
    terms: 'AI4 Businesses currently presents live automation demonstrations and service pathways. Product scope, implementation terms, and pricing should be verified on the production site for the selected automation.',
    live: 'https://ai4businesses.org/',
    liveLabel: 'Explore AI4 Businesses',
    related: [['APROPOS corporate capabilities','/apropos-group-llc/'],['Business readiness','/business-contract-readiness/'],['AI4 Website Design','/ai4-website-design/']],
    disclaimer: 'Automation suitability depends on the business process, data, integrations, operating rules, and human-escalation requirements. A demonstration is not a guarantee of a specific business outcome.'
  },
  {
    dir: 'ai4-website-design',
    eyebrow: 'AI-Powered Website Creation',
    title: 'AI4 Website Design Studio',
    description: 'Learn how AI4 Website Design Studio turns business information into multiple website design options with a guided AI workflow, live preview, and English or Spanish pathways.',
    lead: 'AI4 Website Design Studio is a guided website-creation experience that turns a small set of business details into professional site concepts a user can review before choosing a direction.',
    audience: 'Small businesses, entrepreneurs, independent professionals, and individuals who need a professional web presence without beginning with a blank page or a traditional design project.',
    cards: [
      ['Guided business questions','The experience collects the information needed to understand the site purpose, audience, services, message, and design direction.'],
      ['Multi-agent creation','Specialized AI agents help transform the submitted business information into a structured website concept and presentation.'],
      ['Multiple design directions','The production experience presents multiple design options so the user can compare approaches instead of accepting a single first draft.'],
      ['Live preview','Users can review the generated website experience directly before deciding how to proceed.'],
      ['No-login entry','The public creation pathway is designed to let users begin the guided experience without first creating a traditional account.'],
      ['English and Spanish pathways','Dedicated English and Spanish production experiences support users in the language pathway that fits them best.']
    ],
    steps: [
      ['Tell the studio about the site','Answer the guided questions about the business, purpose, audience, and desired website.'],
      ['Let the agents build','The system turns those answers into structured page content and design alternatives.'],
      ['Compare the concepts','Review the available website directions and open the live preview.'],
      ['Choose the next step','Continue from the production studio once the preferred direction is clear.']
    ],
    terms: 'The production studio currently promotes a free website-building entry experience. Any optional paid services, publishing, domains, ongoing management, or custom implementation should be verified on the production site.',
    live: 'https://ai4websitedesign.com/',
    liveLabel: 'Open the English Website Studio',
    related: [['Spanish Website Studio','/ai4-website-design-es/'],['AI4 Businesses','/ai4-businesses/'],['APROPOS corporate capabilities','/apropos-group-llc/']],
    disclaimer: 'Generated website content and designs should be reviewed by the site owner for factual accuracy, legal requirements, accessibility, intellectual-property concerns, and final publication decisions.'
  },
  {
    dir: 'ai4-website-design-es',
    lang: 'es',
    eyebrow: 'Creación de Sitios Web con IA',
    title: 'AI4 Website Design Studio — Español',
    description: 'Conozca la experiencia en español de AI4 Website Design Studio para convertir información de un negocio en opciones de diseño web, vista previa y un camino claro para continuar.',
    lead: 'AI4 Website Design Studio ofrece una experiencia guiada en español para transformar información sobre un negocio, servicio o proyecto en conceptos de sitio web que el usuario puede revisar antes de elegir una dirección.',
    audience: 'Emprendedores, pequeñas empresas, profesionales independientes y personas que prefieren crear y revisar su experiencia web en español.',
    cards: [
      ['Preguntas guiadas','La experiencia recopila la información necesaria para entender el propósito del sitio, la audiencia, los servicios y el mensaje principal.'],
      ['Creación asistida por IA','Agentes especializados convierten la información proporcionada en contenido estructurado y conceptos de presentación.'],
      ['Opciones de diseño','El usuario puede comparar diferentes direcciones visuales en lugar de depender de una sola propuesta inicial.'],
      ['Vista previa','La experiencia permite revisar el sitio generado antes de decidir cómo continuar.'],
      ['Entrada pública','El proceso está diseñado para que el usuario pueda comenzar desde la experiencia pública sin un registro tradicional previo.'],
      ['Experiencias en inglés y español','Las versiones de producción en ambos idiomas permiten elegir el camino lingüístico más apropiado.']
    ],
    steps: [
      ['Cuéntenos sobre el sitio','Responda las preguntas guiadas sobre el negocio, el propósito, la audiencia y el sitio deseado.'],
      ['Permita que los agentes creen','El sistema convierte las respuestas en contenido estructurado y alternativas de diseño.'],
      ['Compare los conceptos','Revise las opciones disponibles y abra la vista previa del sitio.'],
      ['Elija el próximo paso','Continúe desde el estudio de producción cuando tenga clara la dirección preferida.']
    ],
    terms: 'La experiencia de producción actualmente promociona una entrada gratuita para crear un sitio web. Cualquier servicio opcional de pago, publicación, dominio, administración continua o implementación personalizada debe verificarse en el sitio de producción.',
    live: 'https://espanola.ai4websitedesign.com/',
    liveLabel: 'Abrir el Estudio en Español',
    related: [['English Website Studio','/ai4-website-design/'],['AI4 Businesses','/ai4-businesses/'],['APROPOS Group LLC','/apropos-group-llc/']],
    disclaimer: 'El propietario debe revisar el contenido y el diseño generados para confirmar exactitud, requisitos legales, accesibilidad, propiedad intelectual y decisiones finales de publicación.'
  },
  {
    dir: 'apropos-group-llc',
    eyebrow: 'Corporate Authority',
    title: 'APROPOS Group LLC',
    description: 'Learn how APROPOS Group LLC connects procurement intelligence, business development, automation, website creation, and institutional partnership pathways across its production ecosystem.',
    lead: 'APROPOS Group LLC is the parent organization and corporate authority behind a connected ecosystem of procurement-intelligence, business-development, marketing, and business-technology properties.',
    audience: 'Businesses, contractors, institutions, economic-development organizations, strategic partners, and organizations evaluating APROPOS capabilities or ecosystem programs.',
    cards: [
      ['Procurement intelligence','APROPOS develops systems and pathways that help businesses identify public-sector opportunities, understand requirements, and evaluate fit more efficiently.'],
      ['Business development','The ecosystem includes structured assessment, readiness, planning, funding guidance, and growth-support pathways through NEBC.'],
      ['Business automation','AI4 Businesses provides practical automation experiences for customer and operating workflows such as calls, leads, intake, routing, and follow-up.'],
      ['Website creation','AI4 Website Design Studio provides guided English and Spanish website-creation experiences for businesses and individuals.'],
      ['Marketing and service discovery','APROPOS Marketing Marketplace explains the ecosystem, supports public campaigns, and routes visitors to the appropriate production service.'],
      ['Institutional partnerships','The corporate site remains the authority for capability discussions, partnerships, pilots, and institutional engagement.']
    ],
    steps: [
      ['Identify the business need','Determine whether the need is procurement, business development, automation, website creation, or an institutional relationship.'],
      ['Use the Marketplace to understand the pathway','Review the public explanation and the service that fits the need.'],
      ['Continue to the production property','Move into the operational site where the applicable service is delivered.'],
      ['Use corporate contact for institutional work','Partnerships, capability briefings, pilots, and corporate inquiries remain anchored at APROPOS Group LLC.']
    ],
    terms: 'Each APROPOS production property publishes its own current service scope, access terms, pricing, and operational conditions. Corporate and institutional engagements are evaluated according to the specific requirement.',
    live: 'https://aproposgroupllc.com/',
    liveLabel: 'Visit APROPOS Group LLC',
    related: [['Registered Federal Contractors Portal','/registered-federal-contractors-portal/'],['NAT-CORP','/nat-corp-contract-exchange/'],['NEBC','/national-enterprise-business-center/']],
    disclaimer: 'APROPOS Group LLC is an independent private company and is not a government agency. Procurement, funding, automation, and business-development services do not guarantee contract awards, financing, or specific commercial outcomes.'
  }
];

function escapeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function render(page) {
  const lang = page.lang || 'en';
  const canonical = `${origin}/${page.dir}/`;
  const related = page.related.map(([label,href]) => `<li><a href="${href}">${label}</a></li>`).join('');
  const cards = page.cards.map(([title,copy]) => `<article class="card"><h3>${title}</h3><p>${copy}</p></article>`).join('');
  const steps = page.steps.map(([title,copy],i) => `<article class="card"><div class="step-number">${String(i+1).padStart(2,'0')}</div><h3>${title}</h3><p>${copy}</p></article>`).join('');
  const schema = {
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'Organization','@id':'https://aproposgroupllc.com/#organization',name:'APROPOS Group LLC',url:'https://aproposgroupllc.com/'},
      {'@type':'WebPage','@id':`${canonical}#webpage`,url:canonical,name:page.title,description:page.description,publisher:{'@id':'https://aproposgroupllc.com/#organization'}},
      {'@type':'BreadcrumbList',itemListElement:[
        {'@type':'ListItem',position:1,name:'APROPOS Marketing Marketplace',item:`${origin}/`},
        {'@type':'ListItem',position:2,name:page.title,item:canonical}
      ]}
    ]
  };
  return `<!doctype html><html lang="${lang}"><head>\n${analytics}\n<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${page.title} | APROPOS Marketplace</title><meta name="description" content="${page.description}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:site_name" content="APROPOS Marketing Marketplace"><meta property="og:title" content="${page.title} | APROPOS Marketplace"><meta property="og:description" content="${page.description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${origin}/og-marketplace.jpg"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${page.title} | APROPOS Marketplace"><meta name="twitter:description" content="${page.description}"><meta name="twitter:image" content="${origin}/og-marketplace.jpg"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/landing-pages.css"><script type="application/ld+json">${escapeJson(schema)}</script></head><body><a class="skip" href="#main">Skip to main content</a><nav class="site-nav" aria-label="Primary"><a class="brand" href="/"><span class="mark">AMM</span><span class="brand-name">APROPOS Marketing Marketplace<small>APROPOS GROUP LLC</small></span></a><div class="nav-links"><a href="/#ecosystem">Production Sites</a><a href="/government-contract-intelligence/">Procurement</a><a href="/business-contract-readiness/">Business Growth</a><a href="/apropos-group-llc/">Corporate</a></div></nav><main id="main"><header class="hero"><div class="wrap"><div class="breadcrumbs"><a href="/">Marketplace</a> / ${page.title}</div><div class="eyebrow">APROPOS GROUP LLC · ${page.eyebrow}</div><h1>${page.title}</h1><p class="lead">${page.lead}</p><div class="stat-row"><span class="stat">Public service overview</span><span class="stat">Verified production destination</span><span class="stat">APROPOS ecosystem</span></div></div></header><section><div class="wrap section-grid"><div><div class="gold-rule"></div><div class="eyebrow">Who this is for</div><h2>A service built around a defined business need.</h2><p>${page.audience}</p></div><aside class="card pathway"><h3>Marketplace role</h3><p>The Marketplace explains the service, its customer pathway, and its relationship to the APROPOS ecosystem. Operational service delivery remains on the verified production site.</p><a class="btn" href="${page.live}">${page.liveLabel}</a></aside></div></section><section><div class="wrap"><div class="gold-rule"></div><div class="eyebrow">Service capabilities</div><h2>What this APROPOS property provides</h2><div class="service-grid">${cards}</div></div></section><section><div class="wrap"><div class="gold-rule"></div><div class="eyebrow">Customer journey</div><h2>How the experience works</h2><div class="steps-grid">${steps}</div><div class="service-note"><strong>Current terms:</strong> ${page.terms}</div></div></section><section><div class="wrap section-grid"><div><div class="gold-rule"></div><div class="eyebrow">Related APROPOS guidance</div><h2>Continue your research</h2><div class="related"><ul>${related}</ul></div></div><aside class="card"><h3>Important service boundary</h3><p>${page.disclaimer}</p></aside></div></section><section class="cta-band"><div class="wrap"><div class="eyebrow">Verified production destination</div><h2>Move from explanation to the live service.</h2><p>The Marketplace is the public marketing and service-discovery layer. The link below opens the current APROPOS production property.</p><a class="btn" href="${page.live}">${page.liveLabel} →</a><a class="btn secondary" href="/">Return to Marketplace</a></div></section></main><footer class="site-footer"><div class="wrap"><div class="footer-grid"><div><span class="mark">AMM</span><h3>APROPOS Marketing Marketplace</h3><p>Public marketing, service discovery, and routing for the APROPOS Group LLC ecosystem.</p></div><div class="footer-links"><a href="/registered-federal-contractors-portal/">Federal Contractors Portal</a><a href="/nat-corp-contract-exchange/">NAT-CORP</a><a href="/national-enterprise-business-center/">NEBC</a><a href="/ai4-businesses/">AI4 Businesses</a><a href="/ai4-website-design/">AI4 Website Design</a><a href="/ai4-website-design-es/">Español</a><a href="/apropos-group-llc/">APROPOS Group LLC</a></div></div><p class="legal">© 2026 APROPOS Group LLC. APROPOS is an independent private company and is not affiliated with or endorsed by any government agency. Verify authoritative government opportunity requirements with the issuing organization.</p></div></footer></body></html>`;
}

for (const page of pages) {
  const dir = path.join(root,page.dir);
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),render(page),'utf8');
}

const indexFile = path.join(root,'index.html');
let index = fs.readFileSync(indexFile,'utf8');
const replacements = [
  ['href="/federal-contract-opportunities/">Learn About Federal Opportunities','href="/registered-federal-contractors-portal/">Learn More'],
  ['href="/state-local-contract-opportunities/">Explore State & Local Opportunities','href="/nat-corp-contract-exchange/">Learn More'],
  ['href="/business-contract-readiness/">Business Readiness Guide','href="/national-enterprise-business-center/">Learn More'],
  ['<div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://ai4businesses.org/">Explore AI4 Businesses</a></div>','<div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://ai4businesses.org/">Explore AI4 Businesses</a><a class="amm-btn amm-btn-outline" href="/ai4-businesses/">Learn More</a></div>'],
  ['<div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://ai4websitedesign.com/">Build in English</a><a class="amm-btn amm-btn-outline" href="https://espanola.ai4websitedesign.com/">Sitio en Español</a></div>','<div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://ai4websitedesign.com/">Build in English</a><a class="amm-btn amm-btn-outline" href="/ai4-website-design/">Learn More</a><a class="amm-btn amm-btn-outline" href="/ai4-website-design-es/">Español</a></div>'],
  ['<div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://aproposgroupllc.com/">Visit Corporate Headquarters</a></div>','<div class="amm-actions"><a class="amm-btn amm-btn-primary" href="https://aproposgroupllc.com/">Visit Corporate Headquarters</a><a class="amm-btn amm-btn-outline" href="/apropos-group-llc/">Learn More</a></div>']
];
for (const [before,after] of replacements) index = index.replace(before,after);
fs.writeFileSync(indexFile,index,'utf8');

console.log(`[marketplace-property-pages] PASS — generated ${pages.length} property pages and added Marketplace deep-dive links without changing primary production destinations.`);
