import fs from 'node:fs';
import vm from 'node:vm';

const read=(path)=>fs.readFileSync(path,'utf8');
const json=(name)=>JSON.parse(read('docs/data/'+name+'.json'));
const [meta,pages,sources,market,sales,technologies,backlog,learning,prompts,horizon]=
  ['site','pages','sources','market','sales','technologies','backlog','learning','prompts','horizon'].map(json);
const resolverSandbox={window:{}};
vm.runInNewContext(read('docs/assets/content.js'),resolverSandbox,{filename:'content.js'});
const fixture=resolverSandbox.window.InnsiktContent.materialize({meta,pages,sources,...market,...sales,...technologies,backlog,learning,prompts,horizon});

const source=read('docs/assets/site.js');
const ending=/\binit\(\);\s*\}\)\(\);\s*$/;
if(!ending.test(source)){
  console.error('Kan ikke kjøre HTML-røyktest: site.js har endret oppstartspunkt.');
  process.exit(1);
}
const setup=[
'D=globalThis.__fixture;',
'names=D.pages.navigation;',
'globalThis.__renderAll=()=>{',
' const output=[];',
' const add=(name,fn)=>output.push({name,html:fn()});',
' for(const [name,fn] of Object.entries({',
'   oversikt:overview,guide,forretning:business,muligheter:plays,kundedialog:dialogue,',
'   marked:market,kompetanse:competence,arkitektur:()=>architecture(),',
'   teknologi:technology,ai:aiProducts,bransje:industry,',
'   verktoy:()=>toolkit(),prompter:()=>prompts(),horisont:horizon,trendradar:trendradar,kilder:sources,utvikling:dev',
' }))add(name,fn);',
" D.plays.forEach(x=>add('muligheter/'+x.id,()=>playDetail(x)));",
" D.businessSignals.forEach(x=>add('forretning/'+x.id,()=>businessDetail(x)));",
" D.industrySectors.forEach(x=>add('forretning/sektor-'+x.id,()=>industrySectorPage(x)));",
" D.industryUseCases.forEach(x=>add('forretning/case-'+x.id,()=>industryCasePage(x)));",
" D.learning.diagrams.forEach(x=>add('arkitektur/'+x.id,()=>architecture(x.id)));",
" D.learning.templates.forEach(x=>add('verktoy/'+x.id,()=>toolkit(x.id)));",
" D.prompts.items.forEach(x=>add('prompter/'+x.id,()=>prompts(x.id)));",
' const slideBody={innerHTML:""};',
' globalThis.document={',
"   getElementById:(id)=>id==='slide-body'?slideBody:{textContent:'',disabled:false},",
'   querySelectorAll:()=>[]',
' };',
' for(const [deck,contents] of Object.entries(D.pages.presentationDecks)){',
'   selectedDeck=deck;',
'   for(let i=0;i<contents.slides.length;i++){',
'     slide=i;showSlide();',
"     output.push({name:'presentasjon/'+deck+'/'+(i+1),html:slideBody.innerHTML});",
'   }',
' }',
' return output;',
'};',
'})();'
].join('\n');
const instrumented=source.replace(ending,setup);
const sandbox={
 console,
 __fixture:fixture,
 window:{},
 localStorage:{getItem:()=>null},
};
vm.createContext(sandbox);
vm.runInContext(read('docs/assets/learning.js'),sandbox,{timeout:3000,filename:'learning.js'});
vm.runInContext(read('docs/assets/prompts.js'),sandbox,{timeout:3000,filename:'prompts.js'});
vm.runInContext(read('docs/assets/horizon.js'),sandbox,{timeout:3000,filename:'horizon.js'});
vm.runInContext(instrumented,sandbox,{timeout:3000,filename:'site.js'});
let entries;
try {entries=vm.runInContext('__renderAll()',sandbox,{timeout:8000});}
catch(error) {console.error('Klarte ikke generere sidevisninger:',error);process.exit(1);}
const errors=[];
const caseHtml=new Map(entries.filter(x=>x.name.startsWith('forretning/case-')).map(x=>[x.name,x.html]));
for(const item of sales.industryUseCases){
 const html=caseHtml.get('forretning/case-'+item.id);
 if(!html||!html.includes(item.title)||!html.includes(item.pilot)||!html.includes(item.dataHypothesis))errors.push('Manglende kanonisk caseinnhold: '+item.id);
}
for(const sector of sales.industrySectors){
 const html=entries.find(x=>x.name==='forretning/sektor-'+sector.id)?.html;
 if(!html||!html.includes(sector.openingQuestion)||!html.includes(sector.practice))errors.push('Manglende sektorvisning: '+sector.id);
}

for(const {name,html} of entries){
 if(typeof html!=='string'||html.length<30){errors.push(name+': manglende HTML');continue;}
 const unresolved=html.match(/\$\{[^{}\r\n]{1,160}\}/g);
 if(unresolved)errors.push(name+': ufortolket uttrykk '+unresolved.slice(0,4).join(' | '));
}
if(errors.length){
 console.error('FEIL – generert HTML har problemer:\n'+errors.join('\n'));
 process.exit(1);
}
console.log('PASS – '+entries.length+' faktiske side-, detalj- og presentasjonsvisninger uten ufortolkede uttrykk');
