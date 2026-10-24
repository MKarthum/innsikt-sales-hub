import fs from 'node:fs';
import vm from 'node:vm';
const file=n=>fs.readFileSync(n,'utf8');
const read=n=>JSON.parse(file('docs/data/'+n+'.json'));
const files=['site','pages','sources','market','sales','technologies','backlog','learning','prompts','horizon','slides','visual-assets','architecture-profiles'].map(read);
const [meta,pages,sources,market,sales,technologies,backlog,learning,prompts,horizon,slides,visualAssets,architectureProfiles]=files;
const raw={meta,pages,sources,...market,...sales,...technologies,backlog,learning,prompts,horizon,slides,visualAssets,architectureProfiles};
const site= file('docs/assets/site.js');
const ending=/\binit\(\);\s*\}\)\(\);\s*$/;
if(!ending.test(site))throw Error('Endret initialisering – oppdater testinstrumentering');
const injected=site.replace(ending, `
D=globalThis.__fixture;
names=D.pages.navigation;
globalThis.__views=()=>{
 const basics=guide(),depth=horizon(),home=overview();
 const slideBody={innerHTML:''},searchBody={innerHTML:''};
 globalThis.document={getElementById:id=>id==='slide-body'?slideBody:id==='search-results'?searchBody:{textContent:'',disabled:false},querySelectorAll:()=>[]};
 selectedDeck='portal';slide=3;showSlide();
 searchResults('dataplattform');
 return {guide:basics,horizon:depth,presenter:slideBody.innerHTML,search:searchBody.innerHTML,home};
};
})();`);
function render(data){
 const x={window:{},__fixture:data,console,localStorage:{getItem:()=>null}};
 vm.createContext(x);
 for(const name of ['content','learning','prompts','horizon'])vm.runInContext(file('docs/assets/'+name+'.js'),x,{filename:name+'.js',timeout:3000});
 x.__fixture=x.window.InnsiktContent.materialize(data);
 vm.runInContext(file('docs/assets/slide-model.js'),x,{filename:'slide-model.js',timeout:3000});
 vm.runInContext(file('docs/assets/visual-assets.js'),x,{filename:'visual-assets.js',timeout:3000});
 vm.runInContext(file('docs/assets/architecture-visuals.js'),x,{filename:'architecture-visuals.js',timeout:3000});
 vm.runInContext(file('docs/assets/slide-visuals.js'),x,{filename:'slide-visuals.js',timeout:3000});
vm.runInContext(injected,x,{filename:'site.js',timeout:3000});
 return vm.runInContext('__views()',x,{timeout:3000});
}
const old=render(raw);
// Begrepsdefinisjoner må fortsatt oppdatere sine reelle konsumenter,
// men et lysbilde skal ikke tvinges til å vise en dataplattformskisse bare for testens skyld.
const changedGlossary=JSON.parse(JSON.stringify(raw));
const term=changedGlossary.learning.glossary.find(x=>x.id==='dataplattform');
if(!term)throw Error('Mangler kanonisk dataplattform-ID');
const glossaryMarker='Entydig testmarkør: kanonisk begrepsendring 2026.';
term.meaning=glossaryMarker;
const glossaryNext=render(changedGlossary);
for(const name of ['guide','horizon','search']){
 if(glossaryNext[name]===old[name]||!glossaryNext[name].includes(glossaryMarker))throw Error(name+' reagerer ikke på begrepsendringen');
}
if(glossaryNext.presenter!==old.presenter)throw Error('Lysbildet skal ikke få påtvunget et irrelevant begrep');
if(glossaryNext.home!==old.home)throw Error('Begrepsendringen påvirker en urelatert visning');
// Presenter skal derimot følge den kanoniske kundedialogveiledningen som naturlig brukes i historien.
const changedGuidance=JSON.parse(JSON.stringify(raw));
const guidance=changedGuidance.sharedGuidance.find(x=>x.id==='customer-first');
if(!guidance)throw Error('Mangler kanonisk kundedialogveiledning');
const guidanceMarker='Entydig testmarkør: kundedialogendring 2026.';
guidance.variants.normal=guidanceMarker;
const guidanceNext=render(changedGuidance);
if(guidanceNext.presenter===old.presenter||!guidanceNext.presenter.includes(guidanceMarker))throw Error('Presenter bruker ikke oppdatert kanonisk kundedialog');
if(guidanceNext.guide!==old.guide||guidanceNext.horizon!==old.horizon)throw Error('Kundedialogendring påvirker urelatert fordypning');
console.log('PASS – kanoniske begreper følger relevante konsumenter, mens Presenter følger relevant kundedialoginnhold');