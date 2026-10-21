import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const items=JSON.parse(read('docs/data/learning.json')).glossary;
const errors=[],ids=new Set(),aliases=new Map();
for(const item of items){
 if(!item.id||ids.has(item.id))errors.push('Duplisert eller manglende ID '+item.id);
 ids.add(item.id);
 if(!item.inline?.enabled)continue;
 if(!item.meaning?.trim())errors.push('Manglende definisjon '+item.id);
 if(!item.inline.aliases?.length)errors.push('Manglende aliaser '+item.id);
 for(const alias of item.inline.aliases||[]){
  const key=alias.toLocaleLowerCase('no').trim();
  if(!key||(aliases.has(key)&&aliases.get(key)!==item.id))errors.push('Ugyldig/dobbelt alias '+alias);
  aliases.set(key,item.id);
 }
}
for(const term of ['crm','erp','bi','sql','dbt','llm-spra-kmodell','rag']){
 const entry=items.find(x=>x.id===term);
 if(!entry?.fullName?.trim())errors.push('Forkortelse mangler fullt navn: '+term);
}
for(const item of items)if(!item.meaning?.trim()||!item.example?.trim())errors.push('Begrep mangler forklaring eller eksempel: '+item.id);
if(!items.some(x=>x.id==='datavarehus')||!items.some(x=>x.id==='lakehouse'))errors.push('Datavarehus og lakehouse skal forklares hver for seg');
const frontend=read('docs/assets/glossary.js');
for(const x of items)if(x.meaning.length>35&&frontend.includes(x.meaning))errors.push('Hardkodet definisjon '+x.id);
if(!frontend.includes('record.meaning')||!frontend.includes('createTreeWalker')||!frontend.includes('Escape')||!frontend.includes('getBoundingClientRect'))errors.push('Komponenten mangler sentrale mekanismer');
const js=read('docs/assets/site.js'),html=read('docs/index.html'),v=JSON.parse(read('docs/data/site.json')).version;
if(!html.includes('glossary.js?v='+v))errors.push('Uregistrert eller utdatert asset');
for(const s of ['InnsiktGlossary?.init(D.learning.glossary)',"InnsiktGlossary?.enhance(document.getElementById('main'))","InnsiktGlossary?.enhance(document.getElementById('slide-body'))"])if(!js.includes(s))errors.push('Manglende rendering-kobling '+s);
if(errors.length){console.error('FAIL – begrepshjelp:\n'+errors.join('\n'));process.exit(1);}
console.log('PASS – '+ids.size+' stabile definisjons-ID-er, '+aliases.size+' unike aliaser og kanonisk popup-kilde');
