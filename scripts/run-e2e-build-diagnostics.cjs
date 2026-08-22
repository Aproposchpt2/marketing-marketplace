'use strict';
const fs=require('fs');
const {spawnSync}=require('child_process');

const commands=[
'node scripts/apply-marketplace-customer-experience.cjs',
'node scripts/apply-marketplace-homepage-cleanup.cjs',
'node scripts/apply-marketplace-dark-sections.cjs',
'node scripts/validate-marketplace-customer-experience.cjs',
'node scripts/validate-marketplace-homepage-cleanup.cjs',
'node scripts/validate-marketplace-dark-sections.cjs',
'node scripts/apply-seo-production.cjs',
'node scripts/apply-entity-graph-remediation.cjs',
'node scripts/apply-live-property-allowlist.cjs',
'node scripts/apply-marketplace-authority-handoffs.cjs',
'node scripts/validate-marketplace-authority-handoffs.cjs',
'node scripts/apply-marketplace-trust-governance.cjs',
'node scripts/validate-marketplace-trust-governance.cjs',
'node scripts/generate-marketplace-articles.cjs',
'node scripts/validate-marketplace-article-engine.cjs',
'node scripts/validate-marketplace-initial-articles.cjs',
'node scripts/apply-business-funding-services.cjs',
'node scripts/apply-state-local-complimentary-e2e.cjs',
'node scripts/validate-state-local-complimentary-e2e.cjs'
];
const report={ok:true,started_at:new Date().toISOString(),steps:[]};
for(const command of commands){
  const r=spawnSync(command,{shell:true,encoding:'utf8',env:process.env,maxBuffer:10*1024*1024});
  const step={command,status:r.status,stdout:String(r.stdout||'').slice(-12000),stderr:String(r.stderr||'').slice(-12000)};
  report.steps.push(step);
  if(r.status!==0){report.ok=false;report.failed_command=command;report.failure_text=(step.stderr||step.stdout||'unknown failure').trim();break;}
}
report.finished_at=new Date().toISOString();
fs.writeFileSync('build-diagnostics.json',JSON.stringify(report,null,2));
const slug=v=>String(v||'').replace(/^node scripts\//,'').replace(/\.cjs$/,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,120).toUpperCase();
const commandLabel=slug(report.failed_command||'ALL-STAGES-PASS');
const reasonLine=report.ok?'':String(report.failure_text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).reverse().find(x=>x.startsWith('- '))||String(report.failure_text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).pop()||'UNKNOWN';
const reasonLabel=report.ok?'':`-${slug(reasonLine)}`;
fs.writeFileSync(`00-DIAGNOSTIC-${report.ok?'PASS':'FAIL'}-${commandLabel}${reasonLabel}.html`,`<!doctype html><title>Build diagnostic</title><pre>${JSON.stringify(report,null,2).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre>`);
console.log(`[e2e-build-diagnostics] ${report.ok?'PASS':'captured failure'}: ${report.failed_command||'all stages passed'} ${reasonLine}`);
process.exit(0);
