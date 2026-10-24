import fs from 'node:fs';
import vm from 'node:vm';
const read=n=>JSON.parse(fs.readFileSync('docs/data/'+n+'.json','utf8'));
const raw={meta:read('site'),pages:read('pages'),sources:read('sources'),...read('market'),...read('sales'),...read('technologies'),backlog:read('backlog'),learning:read('learning'),prompts:read('prompts'),horizon:read('horizon'),slides:read('slides')};
const source=fs.readFileSync('docs/assets/content.js','utf8');
const box={window:{}};vm.runInNewContext(source,box);
let materialized;
try{materialized=box.window.InnsiktContent.materialize(raw)}catch(error){console.error(error);process.exit(1)}
const errors=[],fail=x=>errors.push(x),has=x=>typeof x==='string'&&Boolean(x.trim());
const date=x=>/^\d{4}-\d\d-\d\d$/.test(x||'')&&!Number.isNaN(Date.parse(x));
const evidence=new Set(['documented','vendor','assessment','hypothesis','open-question']);
const owners={glossary:raw.learning.glossary,guidance:raw.sharedGuidance,'prompt-rule':raw.prompts.rules,'market-guidance':[raw.metricGuidance],risk:raw.learning.risks,'ai-overview':[raw.aiOverview],value:raw.valueThemes,'value-overview':[raw.valueOverview],notice:raw.pages.sharedNotices,tech:raw.tech,ai:raw.aiProducts,plays:raw.plays,events:raw.marketEvents,radar:raw.emergingSignals};
for(const [domain,rows] of Object.entries(owners)){
 const ids=new Set();
 for(const x of rows||[]){
  if(!has(x.id)||ids.has(x.id))fail('Manglende/duplisert ID i '+domain+': '+x.id);
  ids.add(x.id);
  if(!evidence.has(x.evidence)||!date(x.reviewed))fail('Manglende kunnskapsstatus og faglig dato: '+domain+'/'+x.id);
  const provenance=x.sourceIds??x.sources??(x.source?[x.source]:[]);
  if(!Array.isArray(provenance))fail('Ugyldig kildeformat: '+domain+'/'+x.id);
  if(['documented','vendor'].includes(x.evidence)&&!provenance?.length)fail('Fakta eller leverandørpåstand uten kilde: '+domain+'/'+x.id);
  for(const id of provenance||[])if(!raw.sources[id])fail('Ukjent kilde '+id+' for '+domain+'/'+x.id);
  if(x.visibility&& !['presented','not-presented'].includes(x.visibility))fail('Ukjent visningstilstand '+domain+'/'+x.id);
 }
}
const refs=new Map();
function walk(v,path='root'){
 if(Array.isArray(v))return v.forEach((x,i)=>walk(x,path+'['+i+']'));
 if(!v||typeof v!=='object')return;
 if(v.$content){refs.set(v.$content,(refs.get(v.$content)||[]).concat(path));return;}
 for(const [k,x] of Object.entries(v))walk(x,path+'.'+k);
}
walk(raw);
const ui=fs.readFileSync('docs/assets/site.js','utf8');
for(const item of [raw.metricGuidance,raw.aiOverview]){if(item.visibility==='presented'&&!refs.has((item.id==='ki-use'?'market-guidance:':'ai-overview:')+item.id))fail('Felles budskap uten referanser '+item.id);}
for(const item of raw.sharedGuidance){
 const used=refs.has('guidance:'+item.id)||ui.includes("guidance('"+item.id+"'");
 if(item.visibility==='presented'&&!used)fail('Synlig budskap uten visning '+item.id);
 if(item.visibility==='not-presented'&&used)fail('Ikke-vist budskap brukt i UI '+item.id);
}
for(const rule of raw.prompts.rules){
 if(!refs.has('prompt-rule:'+rule.id)&&rule.visibility!=='not-presented')fail('Promptregel uten bruk '+rule.id);
}
for(const item of raw.prompts.items){
 if(item.promptParts&&item.prompt)fail('Duplisert lagring av sammensatt prompt: '+item.id);
 if(!has(materialized.prompts.items.find(x=>x.id===item.id)?.prompt))fail('Prompt kan ikke komponeres: '+item.id);
}
for(const slide of materialized.slides.items){
 if(typeof slide.body==='object'||typeof slide.note==='object'||slide.bullets?.some(b=>typeof b!=='string'))fail('Uoppløst slide '+slide.id);
}
for(const item of raw.learning.glossary){if(!has(item.meaning)||!has(item.term))fail('Begrep uten definisjon '+item.id);}
if(!raw.horizon.notPublished.every(x=>x.visibility==='not-presented'))fail('Fordypningens usynlige innhold uten markering');
for(const x of raw.emergingSignals){if(ui.includes(x.title)||ui.includes(x.summary))fail('Trendradar-fagtekst hardkodet i visningskode: '+x.id);}
if(ui.includes('Begynn med kundens problem, konsekvens og tidspunkt.'))fail('Kopiert salgsbudskap i JS');
if(ui.includes('Redaksjonelt eksempel på hva som kan utløse behov for analysekompetanse'))fail('Kopiert kundecase-avgrensning i JS');
// Identiske lange fagtekster skal ikke vedlikeholdes uavhengig i domenefilene.
// Eksakte kopier er maskinelt verifiserbare; semantiske parafraser må revideres redaksjonelt.
const copies=new Map();
function inspectCopies(value,where){
 if(Array.isArray(value)){value.forEach((part,i)=>inspectCopies(part,where+'['+i+']'));return;}
 if(value&&typeof value==='object'){
  if(value.$content)return;
  for(const [key,part] of Object.entries(value))inspectCopies(part,where+'.'+key);
  return;
 }
 if(typeof value!=='string')return;
 const normalized=value.replace(/\s+/g,' ').trim().toLocaleLowerCase('no');
 if(normalized.length<80||normalized.startsWith('https://'))return;
 const previous=copies.get(normalized);
 if(previous)fail('Uavhengig tekstkopi (80+ tegn): '+previous+' og '+where);
 else copies.set(normalized,where);
}
for(const name of ['learning','sales','market','technologies','pages','prompts','horizon','slides'])inspectCopies(read(name),'docs/data/'+name+'.json');

if(!fs.readFileSync('docs/index.html','utf8').includes('content.js?v='+raw.meta.version))fail('Innholdsløser er ikke koblet til nettsiden');
if(errors.length){console.error('FAIL – innholdskontrakt:\n'+errors.join('\n'));process.exit(1)}
console.log('PASS – '+Object.values(owners).reduce((n,a)=>n+a.length,0)+' kanoniske objekt-ID-er, '+[...refs.values()].flat().length+' brukte innholdsreferanser, kildestatus, skjult innhold og promptkomposisjon');
