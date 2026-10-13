import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync(new URL('../docs/data/content.json',import.meta.url),'utf8'));
const fail=(s)=>{console.error('FEIL:',s);process.exitCode=1};
const unique=(items,label)=>{const xs=items.map(x=>x.id);if(new Set(xs).size!==xs.length)fail(`Dupliserte id-er i ${label}`)};
for(const [key,val] of Object.entries({plays:d.plays,trends:d.trends,backlog:d.backlog})){
 if(!Array.isArray(val)||!val.length)fail(`${key} må inneholde poster`);
 unique(val,key);
}
if(!/^\d+\.\d+\.\d+$/.test(d.meta.version))fail('Versjon er ugyldig');
if(!/^\d{4}-\d{2}-\d{2}$/.test(d.meta.reviewed))fail('Mangler kontrolldato');
for(const [id,s] of Object.entries(d.sources)){
 if(!/^https:\/\//.test(s.url))fail(`Kilde ${id} trenger HTTPS`);
 if(!s.date||!s.publisher||!s.title)fail(`Kilde ${id} er ufullstendig`);
}
for(const entry of [...d.plays,...d.trends]){
 if(!entry.sources?.length)fail(`${entry.id} mangler kilde`);
 for(const id of entry.sources)if(!d.sources[id])fail(`${entry.id} peker til ukjent kilde ${id}`);
}
for(const p of d.plays){if(!p.questions?.length||!p.signals?.length||!p.next||!p.not)fail(`Salgsinngang ${p.id} er ufullstendig`)}
for(const t of d.tech)if(!d.sources[t.source])fail(`Teknologi ${t.name} peker til ukjent kilde`);
for(const s of d.scenarios)if(!d.plays.some(p=>p.id===s.play))fail(`Scenario peker til ukjent play: ${s.play}`);
for(const x of d.stats.ki)if(typeof x.value!=='number'||x.value<0||x.value>100)fail(`Ugyldig prosent: ${x.year}`);
for(const fn of ['docs/index.html','docs/assets/site.css','docs/assets/site.js'])if(!fs.existsSync(fn))fail(`Mangler fil: ${fn}`);
if(!process.exitCode)console.log('PASS – datamodell, referanser, statiske filer og kildegrunnlag OK');

if(!Array.isArray(d.businessSignals)||d.businessSignals.length<4)fail('Mangler forretningssignaler');
unique(d.businessSignals||[],'businessSignals');
for(const b of d.businessSignals||[]){
 for(const field of ['area','role','headline','says','dataNeed','next'])if(!b[field])fail('Manglende '+field+' i business '+b.id);
 for(const field of ['listen','ask','opportunities','plays','sources'])if(!Array.isArray(b[field])||!b[field].length)fail('Manglende '+field+' i business '+b.id);
 for(const id of b.plays||[])if(!d.plays.some(p=>p.id===id))fail('Ukjent salgsinngang '+id+' i '+b.id);
 for(const id of b.sources||[])if(!d.sources[id])fail('Ukjent kilde '+id+' i '+b.id);
}
for(const t of d.tech)if(t.logo && !fs.existsSync('docs/assets/brands/'+t.logo+'.svg'))fail('Mangler merkeikon for '+t.name);

for(const [key,items] of Object.entries({aiProducts:d.aiProducts,marketEvents:d.marketEvents,marketSignals:d.marketSignals})){
 if(!Array.isArray(items)||!items.length)fail('Mangler '+key);
 unique(items||[],key);
 for(const item of items||[]){
  const sources=item.sources||(item.source?[item.source]:[]);
  if(!sources.length)fail('Kilder mangler: '+item.id);
  for(const id of sources)if(!d.sources[id])fail('Ukjent kilde: '+id);
 }
}
for(const a of d.aiProducts||[])if(a.logo && !fs.existsSync('docs/assets/brands/'+a.logo+'.svg'))fail('Mangler KI-ikon '+a.logo);
for(const t of d.tech)if(t.logo && !fs.existsSync('docs/assets/brands/'+t.logo+'.svg'))fail('Mangler ikon '+t.logo);
if(d.aiProducts.some(a=>!a.group||!a.signal||!a.question))fail('KI-produkt mangler salgsforklaring');
if(d.marketSignals.some(x=>!x.ask||!x.listen))fail('Markedstrend mangler kundespørsmål');
