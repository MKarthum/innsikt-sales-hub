import fs from 'node:fs';
const base='docs/data/';
const read=n=>JSON.parse(fs.readFileSync(base+n+'.json','utf8'));
const site=read('site'),pages=read('pages'),sources=read('sources'),sales=read('sales'),market=read('market'),technologies=read('technologies'),backlog=read('backlog');
const errors=[];
const fail=x=>errors.push(x);
const populated=(x)=>typeof x==='string'&&x.trim().length>0;
const unique=(arr,key)=>{if(!Array.isArray(arr)||!arr.length){fail(key+' må ha poster');return}
 const ids=arr.map(x=>x.id);if(ids.some(x=>!populated(x)))fail(key+' mangler id');
 if(new Set(ids).size!==ids.length)fail(key+' har dupliserte id-er')};
const knownSource=(ids,label)=>{for(const id of ids||[])if(!sources[id])fail(label+' peker til ukjent kilde '+id)};
const knownLogo=(slug,label)=>{if(slug&&!fs.existsSync('docs/assets/brands/'+slug+'.svg'))fail(label+' mangler logo '+slug)};
if(!/^\d+\.\d+\.\d+$/.test(site.version||''))fail('Ugyldig versjon');
if(!/^\d{4}-\d{2}-\d{2}$/.test(site.released||'')||!/^\d{4}-\d{2}-\d{2}$/.test(site.reviewed||''))fail('Datoer mangler');
for(const key of ['oversikt','marked','muligheter','kundedialog','forretning','kompetanse','teknologi','ai','bransje','kilder','utvikling'])if(!populated(pages.navigation?.[key]))fail('Navigasjon mangler '+key);
for(const [id,entry] of Object.entries(pages.headers||{}))for(const key of ['eyebrow','title','intro'])if(!populated(entry[key]))fail('Sidens '+id+' mangler '+key);
if(Object.keys(pages.headers||{}).length!==10)fail('Krever ti sidebeskrivelser');
if(!Array.isArray(pages.slides)||pages.slides.length<5||pages.slides.some(x=>!populated(x.title)||!populated(x.body)))fail('Presentasjonsinnhold mangler');
if(!Array.isArray(pages.qualification?.items)||pages.qualification.items.length!==6)fail('Kvalifisering må ha seks trinn');
if(!Array.isArray(market.stats?.ki)||market.stats.ki.length<2)fail('KI-statistikken mangler');
for(const v of market.stats?.ki||[])if(typeof v.value!=='number'||v.value<0||v.value>100||!/^\d{4}$/.test(String(v.year)))fail('Ugyldig KI-måling');
for(const [id,s] of Object.entries(sources))if(!populated(s.title)||!populated(s.publisher)||!populated(s.date)||!/^https:\/\//.test(s.url||''))fail('Ugyldig kilde '+id);
for(const [key,arr] of Object.entries({plays:sales.plays,scenarios:sales.scenarios,businessSignals:sales.businessSignals,trends:market.trends,marketEvents:market.marketEvents,marketSignals:market.marketSignals,aiProducts:technologies.aiProducts,backlog}))unique(arr,key);
for(const p of sales.plays){knownSource(p.sources,'Salgsinngang '+p.id);for(const key of ['questions','signals','roles','competence'])if(!Array.isArray(p[key])||!p[key].length)fail(p.id+' mangler '+key);for(const key of ['next','why','not'])if(!populated(p[key]))fail(p.id+' mangler '+key)}
for(const a of sales.scenarios)if(!sales.plays.some(x=>x.id===a.play))fail('Ukjent scenario-play '+a.play);
for(const b of sales.businessSignals){knownSource(b.sources,'Forretningsbehov '+b.id);
 for(const id of b.plays||[])if(!sales.plays.some(x=>x.id===id))fail('Ukjent salgsinngang '+id+' på '+b.id);
 for(const key of ['listen','ask','opportunities'])if(!b[key]?.length)fail(b.id+' mangler '+key)}
for(const t of [...market.trends,...market.marketEvents,...market.marketSignals])knownSource(t.sources,t.id);
for(const t of technologies.tech){knownSource([t.source],t.name);knownLogo(t.logo,t.name)}
for(const t of technologies.aiProducts){knownSource([t.source],t.name);knownLogo(t.logo,t.name);if(!populated(t.question)||!populated(t.signal)||!populated(t.limits))fail(t.name+' mangler salgsinformasjon')}
for(const a of sales.audiences)if(!sales.plays.some(x=>x.id===a.entry))fail('Ukjent audience entry '+a.entry);
for(const path of ['docs/index.html','docs/assets/site.js','docs/assets/site.css'])if(!fs.existsSync(path))fail('Mangler '+path);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('PASS – autoritative data, kilder, lenker, logoer, tekster og referanser');
