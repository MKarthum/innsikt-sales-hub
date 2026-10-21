import fs from 'node:fs';
import vm from 'node:vm';
const file=n=>fs.readFileSync(n,'utf8');
const read=n=>JSON.parse(file('docs/data/'+n+'.json'));
const files=['site','pages','sources','market','sales','technologies','backlog','learning','prompts','horizon'].map(read);
const [meta,pages,sources,market,sales,technologies,backlog,learning,prompts,horizon]=files;
const raw={meta,pages,sources,...market,...sales,...technologies,backlog,learning,prompts,horizon};
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
 selectedDeck='technical';slide=2;showSlide();
 searchResults('dataplattform');
 return {guide:basics,horizon:depth,presenter:slideBody.innerHTML,search:searchBody.innerHTML,home};
};
})();`);
function render(data){
 const x={window:{},__fixture:data,console,localStorage:{getItem:()=>null}};
 vm.createContext(x);
 for(const name of ['content','learning','prompts','horizon'])vm.runInContext(file('docs/assets/'+name+'.js'),x,{filename:name+'.js',timeout:3000});
 x.__fixture=x.window.InnsiktContent.materialize(data);
 vm.runInContext(injected,x,{filename:'site.js',timeout:3000});
 return vm.runInContext('__views()',x,{timeout:3000});
}
const old=render(raw);
const changed=JSON.parse(JSON.stringify(raw));
const term=changed.learning.glossary.find(x=>x.id==='dataplattform');
if(!term)throw Error('Mangler kanonisk dataplattform-ID');
const marker='Entydig testmarkør: kanonisk begrepsendring 2026.';
term.meaning=marker;
const next=render(changed);
for(const name of ['guide','horizon','presenter','search']){
 if(next[name]===old[name])throw Error(name+' reagerer ikke på én kanonisk endring');
 if(!next[name].includes(marker))throw Error(name+' bruker ikke endret kanonisk tekst');
 if(old[name].includes(marker))throw Error(name+' hadde testmarkør før endring');
}
if(old.home!==next.home)throw Error('Endringen påvirker en urelatert visning');
console.log('PASS – ett kanonisk begrep oppdaterer Start her, fordypning, Presenter og søk (fire visninger) uten flere tekstkopier');
