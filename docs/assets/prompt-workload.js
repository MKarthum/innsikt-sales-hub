/* Oppgavebasert belastningsestimat. Ingen modellkatalog, nettverkskall eller brukerlagring. */
(()=>{
'use strict';
const cutoffs=[14,32,68,130,280,460];
const ceiling=(n)=>Math.max(0,Math.ceil(Number(n)||0));
function estimate(item,prompts,ctx,actualText='',edited=false){
 const levels=prompts.workloadUi.levels;
 const profile=item.workload;
 if(!profile||!profile.base)throw Error('Mangler vurdert arbeidsprofil for '+item.id);
 const mode=key=>ctx.getChoice(item,key);
 const base=profile.base;
 let sources=base.sources,reviews=base.reviews,outputs=base.outputs,contacts=0,crm=0,companies=0;
 if(profile.kind==='market'){
  const selected=mode('prospectCount');
  const ranges={few:8,standard:15,broad:25};
  const custom=Number(ctx.get('ANTALL_VIRKSOMHETER'));
  companies=selected==='custom'?(Number.isInteger(custom)&&custom>0?custom:25):(ranges[selected]||15);
  const candidates=ceiling(companies*2);
  sources+=candidates*.5+companies*2.2;
  reviews+=companies;
  outputs+=companies;
  if(mode('ringelist')){
   contacts=Math.min(8,companies);
   sources+=contacts*2.5;
   if(mode('prospectContactQuality')==='strict')sources+=contacts;
  }
  if(mode('crmLookup'))crm=companies;
  if(mode('prospectEvidence')==='strict')sources+=companies;
  if(mode('prospectEvidence')==='exploratory')reviews+=companies*.35;
  if(mode('extendedResearch')){sources*=1.65;reviews*=1.2;}
 }
 if(item.id==='cv-request-match'&&ctx.isCvDraft(item)){
  const cvLength=mode('cvLength');
  outputs+=cvLength==='short'?5:cvLength==='standard'?9:7;
  reviews+=3;
 }
 const depth=mode('depth');
 if(depth==='deep'){reviews*=1.17;outputs*=1.45;}
 if(depth==='quick')outputs*=.66;
 const format=mode('format');
 let fileOps=0;
 if(['word','pdf','slides'].includes(format)){
  let pages=Math.max(2,Math.ceil(outputs*.65));
  if(item.id==='deck-outline'){
   const amount=Number(ctx.get('ANTALL_LYSBILDER'));
   pages=Number.isInteger(amount)&&amount>0?amount:Math.max(8,pages);
  }
  if(format==='slides')fileOps=14+pages*6;
  else fileOps=12+pages*(format==='pdf'?5.3:4.2);
  if(ctx.supportsOrganizationTemplates(item,prompts)&&mode('organizationTemplates'))fileOps+=10+pages*4;
  if(item.id==='cv-request-match'&&ctx.isCvDraft(item)&&mode('clientTemplate'))fileOps+=8+pages*3;
 }
 const inputTokens=ceiling(String(actualText||'').length/2.8);
 let score=sources*1.5+reviews*2.5+outputs*2+contacts*5+crm*1.2+fileOps+inputTokens/260;
 // Manuelle endringer kan legge til oppgaver som ikke fremgår av strukturerte valg.
 if(edited)score=score*1.18+Math.max(8,inputTokens/80);
 const levelIndex=cutoffs.findIndex(v=>score<=v);
 const index=levelIndex<0?levels.length-1:levelIndex;
 return {
  score:Math.round(score),level:levels[index],levelIndex:index,
  segments:Math.min(6,index+1),overflow:index===6,
  sources:ceiling(sources),reviews:ceiling(reviews),outputs:ceiling(outputs),
  contacts:ceiling(contacts),crm:ceiling(crm),companies:ceiling(companies),
  fileWork:fileOps>0,inputTokens,edited:Boolean(edited)
 };
}
window.InnsiktPromptWorkload={estimate,cutoffs};
})();