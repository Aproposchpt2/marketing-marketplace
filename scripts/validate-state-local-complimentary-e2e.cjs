const fs=require('fs');
const read=f=>fs.readFileSync(f,'utf8');
const home=read('index.html');
const claim=read('claim-opportunity.html');
const proxy=read('netlify/functions/complimentary-opportunity.mjs');
const workspace=read('opportunity-workspace.html');
const thankYou=read('opportunity-thank-you.html');

for(const token of ['id="complimentaryClaimCta"','id="complimentaryReferenceHandoff"',"/claim-opportunity.html?ref="])if(!home.includes(token))throw new Error(`[state-local-e2e] homepage missing ${token}`);
for(const token of ['Contractor Name','Business Name','Opportunity Reference','emailField.hidden=isBusiness','aproposOpportunityToken','/api/complimentary-opportunity?action=claim'])if(!claim.includes(token))throw new Error(`[state-local-e2e] claim page missing ${token}`);
for(const token of ['BUSINESSCONTRACTS_BASE_URL',"action==='claim'",'/api/marketplace-claim',"action==='workspace'","action==='package'"])if(!proxy.includes(token))throw new Error(`[state-local-e2e] proxy missing ${token}`);
if(proxy.includes('status:410')||proxy.includes('route has been retired')||proxy.includes('https://businesscontracts.aproposgroupllc.com'))throw new Error('[state-local-e2e] state/local proxy is retired or publicly hardcoded');
for(const token of ['Contract & Addendums','Download Complete Package','Print','Purchase Analyze Fit Report','Explore Nat-Corp','/opportunity-thank-you.html','d.purchase_url'])if(!workspace.includes(token))throw new Error(`[state-local-e2e] workspace missing ${token}`);
for(const token of ['Thank You — Good Luck!','aproposOpportunityClaim','Submit Comment','/api/opportunity-experience'])if(!thankYou.includes(token))throw new Error(`[state-local-e2e] thank-you page missing ${token}`);
console.log('[state-local-e2e] Marketplace state/local complimentary E2E validation PASS');
