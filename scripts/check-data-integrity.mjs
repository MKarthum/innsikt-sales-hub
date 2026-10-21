import fs from 'node:fs';
import vm from 'node:vm';
const resolverSandbox={window:{}};
vm.runInNewContext(fs.readFileSync('docs/assets/content.js','utf8'),resolverSandbox);
const read=n=>JSON.parse(fs.readFileSync('docs/data/'+n+'.json','utf8'));
const site=read('site'), pages=read('pages'), sources=read('sources'), market=read('market'), sales=read('sales'), tech=read('technologies'), backlog=read('backlog'), learning=read('learning');
const errors=[],fail=x=>errors.push(x),str=x=>typeof x==='string'&&Boolean(x.trim()),ids=(a,name)=>{if(!Array.isArray(a)||!a.length){fail(name+' er tom');return []}const v=a.map(x=>x.id);if(v.some(x=>!str(x)))fail(name+' har manglende ID');if(new Set(v).size!==v.length)fail(name+' har duplikat-ID');return v};
const date=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||'')&&!Number.isNaN(Date.parse(x));
const refSource=(id,from)=>{if(!sources[id])fail(from+' peker på ukjent kilde '+id)};
const refs=(a,from)=>{if(!Array.isArray(a)||!a.length)fail(from+' mangler kilde');else a.forEach(id=>refSource(id,from))};
if(!/^\d+\.\d+\.\d+$/.test(site.version||''))fail('Ugyldig site-versjon');
if(!date(site.released)||!date(site.reviewed))fail('Mangler dato for utgave eller faglig gjennomgang');
const pagesNeeded=['oversikt','guide','forretning','muligheter','kundedialog','marked','kompetanse','arkitektur','teknologi','ai','bransje','verktoy','kilder','utvikling','prompter','horisont','trendradar'];
for(const p of pagesNeeded)if(!str(pages.navigation?.[p]))fail('Mangler navigasjon '+p);
for(const [key,value] of Object.entries(pages.headers||{}))for(const field of ['eyebrow','title','intro'])if(!(str(value[field])||(value[field]&&typeof value[field].$content==='string')))fail('Ufullstendig header '+key+'.'+field);
if(Object.keys(pages.headers||{}).length<13)fail('Grunnkurs/arkitektur/verktøy mangler sidetitler');
for(const [key,source] of Object.entries(sources)){
 if(!str(source.title)||!str(source.publisher)||!/^https:\/\/[^ /]+/.test(source.url||'')||!date(source.checked))fail('Ufullstendig kilde '+key);
 if(source.published&&!date(source.published))fail('Ugyldig publiseringsdato '+key);
}
ids(sales.plays,'Salgsinnganger');ids(sales.scenarios,'Scenarioer');ids(sales.businessSignals,'Forretningsbehov');
ids(sales.industrySectors,'Bransjer');ids(sales.industryUseCases,'Bransjecaser');
if(sales.industrySectors.length<6||sales.industryUseCases.length<30)fail('For få bransjer eller praktiske eksempler');
const sectors=new Set(sales.industrySectors.map(x=>x.id)),playIds=new Set(sales.plays.map(x=>x.id));
for(const s of sales.industrySectors){
 if(!str(s.name)||!str(s.scope)||!str(s.functions)||!str(s.practice)||!str(s.openingQuestion))fail('Ufullstendig bransje '+s.id);
 if(!['kjerne','tillegg'].includes(s.coverage))fail('Ugyldig bransjekategori '+s.id);
 if(s.evidence!=='assessment'||!date(s.reviewed)||s.visibility!=='presented')fail('Ugyldig kunnskapsstatus '+s.id);
 refs(s.sourceIds,'Bransje '+s.id);
 const count=sales.industryUseCases.filter(c=>c.sectorId===s.id).length;
 if(count<3)fail('Mangler flere konkrete samtaler for '+s.id);
}
for(const c of sales.industryUseCases){
 if(!sectors.has(c.sectorId))fail('Bransjecase uten bransje: '+c.id);
 for(const field of ['title','owner','symptom','goal','dataHypothesis','pilot','expand','caution'])if(!str(c[field]))fail('Bransjecase mangler '+field+': '+c.id);
 if(!Array.isArray(c.questions)||c.questions.length<2||!c.questions.every(str))fail('Mangler dialogspørsmål: '+c.id);
 if(!Array.isArray(c.metrics)||!c.metrics.length||!c.metrics.every(str))fail('Mangler måleparametre: '+c.id);
 if(!Array.isArray(c.playIds)||!c.playIds.length||c.playIds.some(id=>!playIds.has(id)))fail('Ukjent leveranseinngang: '+c.id);
 if(c.evidence!=='assessment'||!date(c.reviewed)||c.visibility!=='presented')fail('Kunnskapsstatus mangler: '+c.id);
 if(c.maturitySteps)for(const step of c.maturitySteps)if(!str(step.label)||!str(step.description)||!str(step.value))fail('Ufullstendig modenhetstrinn i '+c.id);
}
if(sales.industryJourney?.steps?.length!==4||!str(sales.industryJourney.qualification)||!str(sales.industryJourney.maturityCaution))fail('Mangler forretningsdrevet kvalifiseringsløp');
const ui=pages.industryUi;
for(const field of ['homeTitle','homeIntro','sectorCases','symptom','goal','questions','metrics','data','pilot','expand','maturity'])if(!str(ui?.[field]))fail('Mangler bransjevisningsfelt: '+field);

ids(market.emergingSignals,'Trendradar');
if(!pages.headers.TRENDRADAR||!pages.trendRadarUi)fail('Trendradar mangler dataeide overskrifter og UI-etiketter');
const radarFields=['title','stage','summary','whyFollow','uncertainty','watch','relatedRoute'];
for(const x of market.emergingSignals||[]){for(const f of radarFields)if(!str(x[f]))fail('Trendradar mangler '+f+': '+x.id);if(x.evidence!=='assessment'||!date(x.reviewed))fail('Trendradar uten vurdering/dato: '+x.id);refs(x.sources,'Trendradar '+x.id);if(x.relatedRoute.startsWith('#')||x.relatedRoute.startsWith('http'))fail('Trendradar skal bruke intern hash-rute: '+x.id);}
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
 if(x.direction&&!['up','right'].includes(x.direction))fail('Ukjent diagramretning '+x.id);
 if(x.id==='ai-on-data'&&(x.direction!=='up'||x.steps.at(0).title!=='Datagrunnlag'||x.steps.at(-1).title!=='Organisasjonen'))fail('Verdiarkitekturen må bygge nedenfra og opp');
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
  if(!str(x.title)||!['intro','diagram','metric','case','sector-case','bullets','takeaway','prompt'].includes(x.type))fail('Ugyldig slide '+key);
  if(x.diagram&&!ds.has(x.diagram))fail('Ukjent diagram i presentasjon '+x.diagram);
  if(x.business&&!bs.has(x.business))fail('Ukjent kundesignal i presentasjon '+x.business);
  if(x.type==='sector-case'&&!sales.industryUseCases.some(c=>c.id===x.industryCase))fail('Ukjent bransjecase i presentasjon '+x.industryCase);
  if(x.type==='prompt'&&!read('prompts').items.some(p=>p.id===x.promptId))fail('Ukjent presentasjonsprompt '+x.promptId);
  if(typeof x.note!=='string'||x.note.length<300)fail('Presenter trenger faglig presentatørnotat: '+key+' / '+x.title);
  if(typeof x.note==='string'&&!x.note.includes('Overgang:'))fail('Presenter mangler overgang: '+key+' / '+x.title);
  if(x.bullets?.length>3)fail('For mye tekst i Presenter: '+key+' / '+x.title);
  if(x.sources)refs(x.sources,'Slide '+x.title);
 }
}
for(const file of ['docs/index.html','docs/assets/site.js','docs/assets/learning.js','docs/assets/presenter-export.js','docs/assets/site.css'])if(!fs.existsSync(file))fail('Mangler fil '+file);
const html=fs.readFileSync('docs/index.html','utf8');
for(const n of pagesNeeded)if(!html.includes('data-page="'+n+'"'))fail('HTML mangler menypunkt '+n);
if(!html.includes('content.js?v='+site.version))fail('Manglende versjon eller registrering for innholdsløser');
if(!html.includes('site.js?v='+site.version)||!html.includes('learning.js?v='+site.version)||!html.includes('site.css?v='+site.version))fail('Manglende felles assetversjon');
const resolvedData=resolverSandbox.window.InnsiktContent.materialize({pages,learning,...sales,...market,...tech,prompts:read('prompts')});
const prompts=resolvedData.prompts, resolvedPages=resolvedData.pages;
if(!Array.isArray(resolvedPages.home.pillars)||resolvedPages.home.pillars.length!==3)fail('Forsiden må ha tre verdibudskap');
else {
 const types=new Set(resolvedPages.home.pillars.map(x=>x.id));
 for(const n of ['platform','insight','ai'])if(!types.has(n))fail('Mangler hovedbudskap: '+n);
 for(const x of resolvedPages.home.pillars){if(!str(x.title)||!str(x.summary)||!str(x.question)||!str(x.example)||!str(x.link))fail('Ufullstendig hovedbudskap '+x.id);refs(x.sourceIds,x.title);}
}
if(market.stats.euAnalytics)fail('Utdatert EU-analysetall skal ikke stå i markedstall');
if(!pages.marketIntro?.dataStory?.length)fail('Markedssiden mangler datagrunnlagshistorie');

if(!str(pages.navigation.prompter))fail('Promptnavigasjon mangler');
if(!prompts?.page||!Array.isArray(prompts.categories)||prompts.categories.length<4)fail('Manglende promptbibliotek og kategorier');
ids(prompts.items,'Promptmaler');
for(const t of prompts.items){
 if(!prompts.categories.includes(t.category))fail('Ukjent promptkategori '+t.id);
 if(!str(t.title)||!str(t.summary)||!str(t.prompt)||t.prompt.length<300)fail('Prompt mangler innhold: '+t.id);
 if(!['public','approved-internal'].includes(t.sourceMode))fail('Ugyldig datatilgang '+t.id);
 if(!Array.isArray(t.placeholders)||!Array.isArray(t.before)||!Array.isArray(t.review)||!t.review.length)fail('Prompt mangler bruksveiledning '+t.id);
 for(const field of t.placeholders)if(!t.prompt.includes('['+field+']'))fail('Ubrukt promptfelt '+field+' i '+t.id);
 const used=[...t.prompt.matchAll(/\[([A-ZÆØÅ][A-ZÆØÅ0-9_]+)\]/g)].map(x=>x[1]);
 for(const field of used)if(!t.placeholders.includes(field)&&field!=='MÅ UNDERSØKES')fail('Ukjent promptfelt '+field+' i '+t.id);
}
if(prompts.items.length<12)fail('For få promptmaler');
refs(prompts.sourceIds,'Promptveiledning');
if(!fs.existsSync('docs/assets/prompts.js'))fail('Promptvisning mangler');
const pageHtml=fs.readFileSync('docs/index.html','utf8');
if(!pageHtml.includes('prompts.js?v='+site.version))fail('Promptvisning har feil asset-versjon');
const horizon=read('horizon');
if(!horizon?.meta?.reviewed||!date(horizon.meta.reviewed))fail('Fordypning mangler kontrolltid');
const idsForGlossary=learning.glossary.map(x=>x.id).filter(Boolean);
if(new Set(idsForGlossary).size!==idsForGlossary.length)fail('Dupliserte glossary-ID-er');
const knownConcept=(id,owner)=>{if(!idsForGlossary.includes(id))fail(owner+' peker til ukjent begrep '+id)};
if(!pages.headers['I GRENSLANDET'])fail('Fordypning mangler sidebeskrivelse');
if(!Array.isArray(horizon.chapters)||horizon.chapters.length<3)fail('Fordypningen mangler tematiske deler');
if(!horizon.ui||!horizon.evidenceLabels)fail('Fordypningen mangler tekst- og statusregister');
ids(horizon.chapters,'Fordypningsartikler');
for(const x of [horizon.comparison,...horizon.chapters]){
 refs(x.sourceIds,x.id||'Sammenligning');
 for(const id of x.conceptIds||[])knownConcept(id,x.id||'Sammenligning');
}
for(const a of horizon.lenses.items)knownConcept(a.conceptId,'Strategisk hensyn '+a.id);
for(const x of horizon.chapters){
 if(!['documented','vendor','hypothesis','open-question'].includes(x.evidence))fail('Ukjent innholdskategori '+x.id);
 if(!str(x.status)||!str(x.interpretation)||!str(x.customerQuestion))fail('Ufullstendig vurdering '+x.id);
 for(const link of x.relatedLinks||[])if(!str(link.route)||!str(link.label))fail('Ugyldig relasjonslenke '+x.id);
}
for(const x of horizon.notPublished||[])if(x.visibility!=='not-presented')fail('Ikke-vist innhold må ha eksplisitt visibility');
if(!fs.existsSync('docs/assets/horizon.js'))fail('Mangler visning for fordypningen');
if(!html.includes('horizon.js?v='+site.version))fail('Utdatert versjon på fordypningsscript');
if(!html.includes('presenter-export.js?v='+site.version))fail('Utdatert versjon på presentasjonseksport');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('PASS – '+pagesNeeded.length+' sider, '+learning.diagrams.length+' arkitekturer, '+learning.templates.length+' maler, '+Object.keys(sources).length+' kilder og '+Object.keys(pages.presentationDecks).length+' presentasjonsløp validert');
