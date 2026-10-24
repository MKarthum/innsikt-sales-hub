import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=n=>JSON.parse(fs.readFileSync('docs/data/'+n+'.json','utf8'));
const raw=()=>{const [meta,pages,sources,market,sales,technologies,backlog,learning,prompts,horizon,slides,visualAssets,architectureProfiles]=['site','pages','sources','market','sales','technologies','backlog','learning', 'prompts','horizon','slides','visual-assets','architecture-profiles'].map(read);return {meta,pages,sources,...market,...sales,...technologies,backlog,learning,prompts,horizon,slides,visualAssets,architectureProfiles}};
const js=n=>fs.readFileSync('docs/assets/'+n+'.js','utf8');
const match=(data,path)=>path.split('.').reduce((acc,key)=>acc[key],data);
const owners={
 'value:platform':d=>d.valueThemes.find(x=>x.id==='platform'),
 'value:insight':d=>d.valueThemes.find(x=>x.id==='insight'),
 'value:ai':d=>d.valueThemes.find(x=>x.id==='ai'),
 'value-overview:three-needs':d=>d.valueOverview,
 'market-guidance:ki-use':d=>d.metricGuidance,
 'guidance:customer-first':d=>d.sharedGuidance.find(x=>x.id==='customer-first'),
 'glossary:dataplattform':d=>d.learning.glossary.find(x=>x.id==='dataplattform'),
 'notice:public-boundary':d=>d.pages.sharedNotices.find(x=>x.id==='public-boundary'),
 'notice:feedback-privacy':d=>d.pages.sharedNotices.find(x=>x.id==='feedback-privacy')
};
const contracts=[
 // Route of the consumer, canonical record, and requested variant.
 ['pages.home.pillars.0.summary','value:platform','home'],
 ['pages.home.pillars.1.summary','value:insight','home'],
 ['pages.home.pillars.2.summary','value:ai','home'],
 ['pages.marketIntro.dataStory.0.body','value:platform','market'],
 ['pages.marketIntro.dataStory.1.body','value:insight','market'],
 ['pages.marketIntro.dataStory.2.body','value:ai','market'],
 ['pages.home.pillarIntro','value-overview:three-needs','home'],
 ['pages.marketIntro.dataLead','value-overview:three-needs','market'],
 ['pages.home.kiEvidenceBody','market-guidance:ki-use','homeEvidence'],
 ['pages.marketIntro.aiDetail','market-guidance:ki-use','marketDetail'],
 ['pages.marketIntro.sectorIntro','market-guidance:ki-use','sectorContext'],
 ['pages.home.intro','guidance:customer-first','home'],
 ['learning.beginner.chapters.4.text','guidance:customer-first','beginner'],
 ['learning.beginner.chapters.2.text','glossary:dataplattform','beginner'],
 ['pages.site.disclaimer','notice:public-boundary','disclaimer'],
 ['pages.site.publicNotice','notice:public-boundary','sidebar'],
 ['pages.copy.publicRegister','notice:public-boundary','register'],
 ['prompts.page.publicWarning','notice:public-boundary','prompt'],
 ['pages.copy.localFeedbackCaution','notice:feedback-privacy','compact'],
 ['pages.copy.feedbackModalNotice','notice:feedback-privacy','modal']
];
const baseline=raw();
for(const [path,key,variant] of contracts){
 assert.deepEqual(match(baseline,path),{'$content':key,variant},'Semantisk konsument har hardkodet kopi: '+path);
 assert.equal(typeof owners[key](baseline)?.variants?.[variant],'string','Kanonisk variant mangler: '+key+'/'+variant);
}
const viewScript=js('site');
const ending=/\binit\(\);\s*\}\)\(\);\s*$/;
assert.ok(ending.test(viewScript),'Kan ikke instrumentere reelle visninger');
function getViews(data){
 const sandbox={console,window:{},localStorage:{getItem:()=>null},__fixture:data};
 vm.createContext(sandbox);
 for(const n of ['content','learning','prompt-context','prompts','horizon'])vm.runInContext(js(n),sandbox,{timeout:3000});
 sandbox.__fixture=sandbox.window.InnsiktContent.materialize(data);
 sandbox.window.InnsiktPromptContext.configure(sandbox.__fixture.prompts);
 const injected=viewScript.replace(ending,
 "D=globalThis.__fixture;names=D.pages.navigation;globalThis.__views=()=>({oversikt:overview(),marked:market(),guide:guide(),prompter:prompts()});})();");
 vm.runInContext(injected,sandbox,{timeout:3000});
 return {materialized:sandbox.__fixture,views:vm.runInContext('__views()',sandbox,{timeout:6000})};
}
const original=getViews(baseline);
let changedChecks=0;
const scenarios=[
 ['value:insight','home','oversikt'],
 ['value:insight','market','marked'],
 ['value-overview:three-needs','home','oversikt'],
 ['value-overview:three-needs','market','marked'],
 ['market-guidance:ki-use','homeEvidence','oversikt'],
 ['market-guidance:ki-use','marketDetail','marked'],
 ['guidance:customer-first','home','oversikt'],
 ['guidance:customer-first','beginner','guide'],
 ['glossary:dataplattform','beginner','guide'],
 ['notice:public-boundary','register','oversikt'],
 ['notice:public-boundary','prompt','prompter']
];
for(const [key,variant,route] of scenarios){
 const candidate=structuredClone(baseline);
 const marker='KANONISK ENDRING '+key+'/'+variant+'!';
 owners[key](candidate).variants[variant]=marker;
 const {materialized,views}=getViews(candidate);
 assert.ok(views[route].includes(marker),key+'/'+variant+' når ikke '+route);
 for(const [other,html] of Object.entries(views))if(other!==route)assert.ok(!html.includes(marker),key+'/'+variant+' lekket til '+other);
 assert.equal(materialized.pages.home.pillars.length,3);
 changedChecks++;
}
for(const [path,key,variant] of contracts){
 const materialized=original.materialized;
 assert.equal(match(materialized,path),owners[key](baseline).variants[variant],path+' har feil oppløst fagtekst');
}
console.log('PASS – '+contracts.length+' navngitte konsumentkoblinger og '+changedChecks+' endringer vist på riktig side uten utilsiktet spredning');