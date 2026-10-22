import { spawnSync } from 'node:child_process';
for(const script of ['check-public-content.mjs','check-data-integrity.mjs','check-content-style.mjs','check-content-contract.mjs','check-glossary.mjs','check-prompt-context.mjs','check-content-propagation.mjs','check-semantic-propagation.mjs','check-render-output.mjs','check-release-discipline.mjs']){
 const r=spawnSync(process.execPath,['scripts/'+script],{stdio:'inherit'});
 if(r.status!==0)process.exitCode=1;
}
if(!process.exitCode)console.log('PASS – alle publiseringskontroller bestått');
