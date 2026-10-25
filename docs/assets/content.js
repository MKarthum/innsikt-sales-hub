/* Referanseløser for offentlige JSON-data. Teksten eies av ett domeneobjekt, ikke av visningen. */
(()=>{
'use strict';
const owners={
 glossary:d=>d.learning.glossary,
 guidance:d=>d.sharedGuidance,
 'prompt-rule':d=>d.prompts.rules,
 'ai-overview':d=>d.aiOverview?[d.aiOverview]:[],
 'market-guidance':d=>d.metricGuidance?[d.metricGuidance]:[],
 risk:d=>d.learning.risks,
 value:d=>d.valueThemes||[],
 'value-overview':d=>d.valueOverview?[d.valueOverview]:[],
 notice:d=>d.pages.sharedNotices||[]
};
function expandArchitectureProfiles(profiles){
 const byId=new Map(profiles.map(p=>[p.id,p])), cache=new Map(), active=new Set();
 if(byId.size!==profiles.length)throw Error('Duplisert arkitekturprofil-ID');
 function expand(id){
  if(cache.has(id))return cache.get(id);
  const p=byId.get(id);if(!p)throw Error('Ukjent basisprofil: '+id);
  if(active.has(id))throw Error('Sirkel i arkitekturprofiler: '+id);
  active.add(id);
  let value=p;
  if(p.baseProfileId){
   const base=expand(p.baseProfileId);
   value={...base,...p,
    sources:p.sources||base.sources,consumers:p.consumers||base.consumers,support:p.support||base.support,
    ingest:{...base.ingest,...p.ingest},platform:{...base.platform,...p.platform},serve:{...base.serve,...p.serve}
   };
  }
  active.delete(id);cache.set(id,value);return value;
 }
 return profiles.map(p=>expand(p.id));
}
function materialize(data){
 const registry=new Map();
 for(const [owner,get] of Object.entries(owners)){
  const items=get(data)||[];
  if(!Array.isArray(items))throw Error('Ugyldig innholdseier: '+owner);
  for(const item of items){
   const key=owner+':'+item.id;
   if(!item.id||registry.has(key))throw Error('Manglende eller duplisert innholds-ID: '+key);
   registry.set(key,item);
  }
 }
 const active=new Set();
 function resolve(value){
  if(Array.isArray(value))return value.map(resolve);
  if(!value||typeof value!=='object')return value;
  if(Object.hasOwn(value,'$content')){
   const key=value.$content,variant=value.variant||'normal',record=registry.get(key);
   if(Object.keys(value).some(k=>k!=='$content'&&k!=='variant'))throw Error('Ukjent referansefelt: '+key);
   if(!record)throw Error('Ukjent innholdsreferanse: '+key);
   const selected=record.variants?.[variant] ?? (variant==='normal'?(record.meaning??record.text):undefined);
   if(typeof selected!=='string'||!selected.trim())throw Error('Mangler tekstvariant: '+key+' / '+variant);
   if(active.has(key))throw Error('Sirkelreferanse: '+key);
   active.add(key);
   const resolved=resolve(selected);
   active.delete(key);
   return resolved;
  }
  const result={};
  for(const [key,item] of Object.entries(value)){
   if(key==='promptParts')continue;
   result[key]=resolve(item);
  }
  if(value.promptParts){
   if(Object.hasOwn(value,'prompt'))throw Error('Prompt har både tekst og referansedeler: '+(value.id||''));
   if(!Array.isArray(value.promptParts)||!value.promptParts.length)throw Error('Tom promptkomposisjon');
   result.prompt=value.promptParts.map(resolve).join('');
  }
  return result;
 }
 const output=resolve(data);
 if(output.architectureProfiles?.profiles)output.architectureProfiles.profiles=expandArchitectureProfiles(output.architectureProfiles.profiles);
 return output;
}
window.InnsiktContent={materialize,expandArchitectureProfiles};
})();
