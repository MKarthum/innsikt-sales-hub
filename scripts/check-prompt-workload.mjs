import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const prompts=JSON.parse(fs.readFileSync('docs/data/prompts.json','utf8'));
const items=prompts.items;
const stable=value=>JSON.stringify(value);
function fingerprint(item){
 const usedRules=(item.promptParts||[]).filter(p=>p&&typeof p==='object'&&p.$content).map(part=>({
  ref:part.$content,variant:part.variant,text:prompts.rules.find(r=>r.id===part.$content.split(':')[1])?.text||''
 }));
 const payload=stable({prompt:item.prompt||null,promptParts:item.promptParts||null,rules:usedRules,
  placeholders:item.placeholders,essentialPlaceholders:item.essentialPlaceholders,
  choiceGroups:(item.choiceGroups||[]).map(k=>[k,prompts.choiceGroups[k]]),
  toggles:item.toggles||[],choiceDefaults:item.choiceDefaults||{},
  formats:item.formats,cvOutput:item.cvOutput||null,outputSettings:prompts.outputSettings});
 let hash=2166136261;
 for(let i=0;i<payload.length;i++)hash=Math.imul(hash^payload.charCodeAt(i),16777619)>>>0;
 return hash.toString(16).padStart(8,'0');
}
assert.ok(items.length>0);
for(const item of items){
 assert.ok(item.workload&&item.workload.base,'Mangler arbeidsprofil: '+item.id);
 assert.ok(['fixed','market'].includes(item.workload.kind),'Ukjent arbeidstype: '+item.id);
 for(const key of ['sources','reviews','outputs'])assert.ok(
  Number.isFinite(item.workload.base[key])&&item.workload.base[key]>=0,
  'Manglende arbeidsoperasjon '+item.id+'/'+key);
 assert.equal(item.workload.fingerprint,fingerprint(item),'Arbeidsprofil må gjennomgås ved endret prompt eller valginstruks: '+item.id);
}
const sandbox={window:{},sessionStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('docs/assets/prompt-context.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('docs/assets/prompt-workload.js','utf8'),sandbox);
const ctx=sandbox.window.InnsiktPromptContext;
ctx.configure(prompts);
const workload=sandbox.window.InnsiktPromptWorkload;
const prospect=items.find(x=>x.id==='market-prospecting');
const text='Markedsanalyse med kildekontroll';
const estimate=(item=prospect,body=text,edited=false)=>workload.estimate(item,prompts,ctx,body,edited);
const original=estimate();
assert.ok(original.score>0&&original.levelIndex>=0);
ctx.setChoice(prospect,'ringelist',false);const noContacts=estimate();
assert.ok(noContacts.score<original.score,'ringeliste må gi reelt ekstra kilde-/personarbeid');
ctx.setChoice(prospect,'crmLookup',false);
ctx.setChoice(prospect,'prospectCount','few');const few=estimate();
ctx.setChoice(prospect,'prospectCount','broad');const broad=estimate();
assert.ok(broad.score>few.score,'flere virksomheter gir gjentatt arbeid');
ctx.setChoice(prospect,'extendedResearch',true);
assert.ok(estimate().score>broad.score,'utvidet research må øke kildedekning');
ctx.setChoice(prospect,'ringelist',true);ctx.setChoice(prospect,'crmLookup',true);ctx.setChoice(prospect,'depth','deep');
assert.ok(estimate().score>original.score,'alle tunge valg må gi høyere belastning');
assert.ok(estimate().segments<=6,'skalaen skal aldri vokse horisontalt');
assert.ok(estimate(prospect,text+' ekstra instruksjon '.repeat(400),true).score>estimate().score,'fri redigering påvirker estimatet');
const research=items.find(x=>x.id==='account-research');
ctx.setChoice(research,'format','plain');const plain=estimate(research);
ctx.setChoice(research,'format','pdf');const pdf=estimate(research);
assert.ok(pdf.score>plain.score+15,'PDF skal inkludere filproduksjon og layout');
ctx.setChoice(research,'organizationTemplates',false);const noTemplate=estimate(research);
assert.ok(noTemplate.score<pdf.score,'firmamal tilfører gjennomgang og tilpasning');
const short=items.find(x=>x.id==='contact-prep');
assert.ok(estimate(short).score<original.score,'kort kontaktutkast skal ikke likestilles med markedsresearch');
const changed=JSON.parse(JSON.stringify(prospect));
changed.promptParts[0]+=' Ny nødvendig undersøkelse.';
assert.notEqual(fingerprint(changed),prospect.workload.fingerprint,'tekstendring skal tvinge ny ressursvurdering');
const changedChoice=structuredClone(prospect);
const saved=prompts.choiceGroups.prospectCount.options[0].instruction;
prompts.choiceGroups.prospectCount.options[0].instruction+=' ekstra kilder';
assert.notEqual(fingerprint(prospect),prospect.workload.fingerprint,'endrede valginstruksjoner skal tvinge ny ressursvurdering');
prompts.choiceGroups.prospectCount.options[0].instruction=saved;
console.log('PASS – arbeidsprofil for alle prompter, endringsvakt, dynamiske operasjoner, filformat og skala');