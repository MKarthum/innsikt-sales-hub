import fs from 'node:fs';
const read=n=>JSON.parse(fs.readFileSync('docs/data/'+n+'.json','utf8'));
const site=read('site'), pages=read('pages'), sources=read('sources'), market=read('market'), sales=read('sales'), tech=read('technologies'), backlog=read('backlog'), learning=read('learning');
const errors=[],fail=x=>errors.push(x),str=x=>typeof x==='string'&&Boolean(x.trim()),ids=(a,name)=>{if(!Array.isArray(a)||!a.length){fail(name+' er tom');return []}const v=a.map(x=>x.id);if(v.some(x=>!str(x)))fail(name+' har manglende ID');if(new Set(v).size!==v.length)fail(name+' har duplikat-ID');return v};
const date=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||'')&&!Number.isNaN(Date.parse(x));
const refSource=(id,from)=>{if(!sources[id])fail(from+' peker på ukjent kilde '+id)};
const refs=(a,from)=>{if(!Array.isArray(a)||!a.length)fail(from+' mangler kilde');else a.forEach(id=>refSource(id,from))};
if(!/^\d+\.\d+\.\d+$/.test(site.version||''))fail('Ugyldig site-versjon');
if(!date(site.released)||!date(site.reviewed))fail('Mangler dato for utgave eller faglig gjennomgang');
const pagesNeeded=['oversikt','guide','forretning','muligheter','kundedialog','marked','kompetanse','arkitektur','teknologi','ai','bransje','verktoy','kilder','utvikling'];
for(const p of pagesNeeded)if(!str(pages.navigation?.[p]))fail('Mangler navigasjon '+p);
for(const [key,value] of Object.entries(pages.headers||{}))for(const field of ['eyebrow','title','intro'])if(!str(value[field]))fail('Ufullstendig header '+key+'.'+field);
if(Object.keys(pages.headers||{}).length<13)fail('Grunnkurs/arkitektur/verktøy mangler sidetitler');
for(const [key,source] of Object.entries(sources)){
 if(!str(source.title)||!str(source.publisher)||!/^https:\/\/[^ /]+/.test(source.url||'')||!date(source.checked))fail('Ufullstendig kilde '+key);
 if(source.published&&!date(source.published))fail('Ugyldig publiseringsdato '+key);
}
ids(sales.plays,'Salgsinnganger');ids(sales.scenarios,'Scenarioer');ids(sales.businessSignals,'Forretningsbehov');
ids(market.trends,'Trender');ids(market.marketEvents,'Markedshendelser');ids(market.marketSignals,'Markedsforhold');
ids(tech.aiProducts,'KI-produkter');ids(backlog,'Forbedringspunkter');ids(learning.diagrams,'Arkitekturer');ids(learning.templates,'Maler');
if(!Array.isArray(learning.glossary)||learning.glossary.length<10)fail('For få begrepsforklaringer');
else{const terms=learning.glossary.map(x=>x.term);if(new Set(terms).size!==terms.length)fail('Dupliserte begreper');}
for(const x of sales.plays){refs(x.sources,'Salgsinngang '+x.id);if(!x.questions?.length||!x.signals?.length||!str(x.next)||!str(x.why))fail('Salgsinngang er ufullstendig '+x.id)}
for(const x of sales.scenarios)if(!sales.plays.some(p=>p.id===x.play))fail('Scenario uten salgsinngang '+x.id);
for(const x of sales.businessSignals){refs(x.sources,'Forretningsbehov '+x.id);for(const y of x.plays||[])if(!sales.plays.some(p=>p.id===y))fail('Ukjent kobling fra forretning til salg '+y)}
for(const x of sales.audiences)if(!sales.plays.some(p=>p.id===x.entry))fail('Ukjent målgruppekobling '+x.entry);
for(const x of [...market.trends,...market.marketEvents,...market.marketSignals])refs(x.sources,'Markedsfakta '+x.id);
for(const x of market.stats?.ki||[])if(typeof x.value!=='number'||x.value<0||x.value>100)fail('Ugyldig KI-statistikk');
for(const x of tech.tech){refSource(x.source,x.name);if(x.logo&&!fs.existsSync('docs/assets/brands/'+x.logo+'.svg'))fail('Mangler produktlogo '+x.logo)}
for(const x of tech.aiProducts){refSource(x.source,x.name);if(x.logo&&!fs.existsSync('docs/assets/brands/'+x.logo+'.svg'))fail('Mangler KI-logo '+x.logo);if(!str(x.signal)||!str(x.question))fail('Produkt mangler salgsvinkel '+x.name)}
for(const x of learning.diagrams){
 if(!str(x.title)||!str(x.description)||!str(x.caution)||!str(x.outcome)||!Array.isArray(x.steps)||x.steps.length<3)fail('Ufullstendig diagram '+x.id);
 if(!x.questions?.length)fail('Diagram mangler kundespørsmål '+x.id);
 refs(x.sources,'Diagram '+x.id);
}
for(const x of learning.templates)if(!str(x.title)||!str(x.purpose)||!str(x.caution)||!x.sections?.length||x.sections.some(s=>!s.questions?.length))fail('Ufullstendig mal '+x.id);
const ds=new Set(learning.diagrams.map(x=>x.id)),bs=new Set(sales.businessSignals.map(x=>x.id));
if(!pages.presentationDecks||Object.keys(pages.presentationDecks).length<3)fail('Mangler tre presentasjonsløp');
for(const [key,d] of Object.entries(pages.presentationDecks||{})){
 if(!str(d.label)||!d.slides?.length)fail('Presentasjonsløp mangler '+key);
 for(const x of d.slides||[]){
  if(!str(x.title)||!['intro','diagram','metric','case','bullets','takeaway'].includes(x.type))fail('Ugyldig slide '+key);
  if(x.diagram&&!ds.has(x.diagram))fail('Ukjent diagram i presentasjon '+x.diagram);
  if(x.business&&!bs.has(x.business))fail('Ukjent kundesignal i presentasjon '+x.business);
  if(x.sources)refs(x.sources,'Slide '+x.title);
 }
}
for(const file of ['docs/index.html','docs/assets/site.js','docs/assets/learning.js','docs/assets/site.css'])if(!fs.existsSync(file))fail('Mangler fil '+file);
const html=fs.readFileSync('docs/index.html','utf8');
for(const n of pagesNeeded)if(!html.includes('data-page="'+n+'"'))fail('HTML mangler menypunkt '+n);
if(!html.includes('site.js?v='+site.version)||!html.includes('learning.js?v='+site.version)||!html.includes('site.css?v='+site.version))fail('Manglende felles assetversjon');
if(!Array.isArray(pages.home.homeSignals)||pages.home.homeSignals.length!==3)fail('Forsiden må ha tre distinkte innganger: datagrunnlag, analyse og KI');
else{
 const signals=pages.home.homeSignals;
 if(new Set(signals.map(x=>x.id)).size!==3)fail('Forsiden inneholder dupliserte innganger');
 for(const sig of signals)refs(sig.sources,'Forsidekort '+sig.id);
 const kinds=new Set(signals.map(x=>x.type));
 for(const kind of ['foundation','eu-analytics','norway-ai'])if(!kinds.has(kind))fail('Mangler inngangstype '+kind);
}
if(!market.stats.euAnalytics||!sources[market.stats.euAnalytics.source])fail('Dataanalyse-statistikk mangler kilde');
if(!pages.marketIntro?.dataStory?.length)fail('Markedssiden mangler beskrivelse av datagrunnlag');

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('PASS – '+pagesNeeded.length+' sider, '+learning.diagrams.length+' arkitekturer, '+learning.templates.length+' maler, '+Object.keys(sources).length+' kilder og '+Object.keys(pages.presentationDecks).length+' presentasjonsløp validert');
