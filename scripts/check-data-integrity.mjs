import fs from 'node:fs';
import vm from 'node:vm';
const resolverSandbox={window:{}};
vm.runInNewContext(fs.readFileSync('docs/assets/content.js','utf8'),resolverSandbox);
const read=n=>JSON.parse(fs.readFileSync('docs/data/'+n+'.json','utf8'));
const site=read('site'), pages=read('pages'), slides=read('slides'), sources=read('sources'), market=read('market'), sales=read('sales'), tech=read('technologies'), backlog=read('backlog'), learning=read('learning');
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
const slideIds=ids(slides.items,'Lysbildebibliotek'),slidesById=new Map(slides.items.map(x=>[x.id,x]));
for(const s of slides.items){
 if(!['shared','story'].includes(s.scope))fail('Ugyldig lysbildescope: '+s.id);
 if(s.scope==='story'&&!pages.presentationDecks[s.storyId])fail('Ukjent lysbildeeier: '+s.id);
 if(!str(s.title)||!str(s.cue)||!['intro','diagram','metric','case','sector-case','bullets','takeaway','prompt','visual'].includes(s.type))fail('Ugyldig lysbilde: '+s.id);
 if(s.type==='visual'&&(!s.visual||!['analyst-grid','two-directions','value-system','impact','list','road','business-case','definition','contrast','loop','domains','portal'].includes(s.visual.scene)))fail('Ukjent visuell scene: '+s.id);
 if(!s.topic)fail('Lysbilde mangler tema: '+s.id);
 if(s.diagram&&!ds.has(s.diagram))fail('Ukjent diagram i lysbilde '+s.id);
 if(s.business&&!bs.has(s.business))fail('Ukjent kundesignal i lysbilde '+s.id);
 if(s.type==='sector-case'&&!sales.industryUseCases.some(c=>c.id===s.industryCase))fail('Ukjent bransjecase i lysbilde '+s.id);
 if(s.type==='prompt'&&!read('prompts').items.some(p=>p.id===s.promptId))fail('Ukjent prompt i lysbilde '+s.id);
 if(s.bullets?.length>3)fail('For mye tekst i lysbilde '+s.id);
 if(s.sourceIds?.length)s.sourceIds.forEach(id=>refSource(id,'Lysbilde '+s.id));
 if(s.sourceDisplay&&s.sourceDisplay!=='required')fail('Ukjent kildemarkering: '+s.id);
 if(s.tone&&!['strong','light'].includes(s.tone))fail('Ukjent fargetone: '+s.id);
 if(typeof s.speakerBase!=='string')fail('Mangler grunnnotat: '+s.id);
}
if(!pages.presentationDecks?.portal||!pages.presentationDecks?.sales)fail('Presenter må inneholde eksisterende historier');
for(const [key,d] of Object.entries(pages.presentationDecks||{})){
 if(!str(d.label)||!d.slides?.length)fail('Presentasjonsløp mangler '+key);
 const story=d.narrative;
 if(!str(d.audience)||!str(d.intro)||!story||!str(story.mode)||!str(story.use)||!str(story.centralQuestion)||!str(story.turn)||!str(story.resolution))fail('Presenter mangler fortellingsgrunnlag: '+key);
 const beatIds=Array.isArray(story?.beats)?story.beats.map(b=>b.id):[];
 if(!beatIds.length||beatIds.some(id=>!str(id))||new Set(beatIds).size!==beatIds.length||story.beats.some(b=>!str(b.function)))fail('Presenter mangler fortellingskurve: '+key);
 if(!str(story.story)||story.story.length<500)fail('Fortellingen må skrives før lysbildene: '+key);
 let prev=-1;
 for(const placement of d.slides){
  const x=slidesById.get(placement.slideId);
  if(!x)fail('Historie peker på ukjent lysbilde: '+key+'/'+placement.slideId);
  if(x?.scope==='story'&&x.storyId!==key)fail('Historiespesifikt lysbilde gjenbrukt: '+key+'/'+x.id);
  if(!str(placement.beat)||!beatIds.includes(placement.beat)||!['tell','debrief'].includes(placement.delivery))fail('Ugyldig plassering: '+key+'/'+placement.slideId);
  const at=beatIds.indexOf(placement.beat);if(at<prev)fail('Feil dramaturgisk rekkefølge: '+key);prev=at;
  if(!str(placement.note)||placement.note.length<110||(placement.note.length+(x?.speakerBase?.length||0)<300))fail('Mangler sammensatte foredragsnotater: '+key+'/'+placement.slideId);
  if(placement!==d.slides.at(-1)&&!placement.note.includes('Overgang:'))fail('Mangler overgang: '+key+'/'+placement.slideId);
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

if(!Array.isArray(prompts.variableGroups)||!prompts.variableGroups.length)fail('Mangler variabelgrupper');
if(!prompts.page.variableUi||!str(prompts.page.variableUi.privacyNotice))fail('Mangler tekst og personvernsinformasjon for variabler');
if(!Array.isArray(prompts.variables)||!prompts.variables.length)fail('Mangler kanonisk variabelregister');
const groups=new Set((prompts.variableGroups||[]).map(x=>x.id)), variables=new Map(),aliasToId=new Map();
for(const v of prompts.variables||[]){
 if(!str(v.id)||!/^[A-ZÆØÅ][A-ZÆØÅ0-9_]*$/.test(v.id)||variables.has(v.id))fail('Ugyldig eller duplisert variabel-ID '+v.id);
 variables.set(v.id,v);
 if(!str(v.label)||!groups.has(v.group)||!['session','memory'].includes(v.retention))fail('Ufullstendig variabel '+v.id);
 if(!Number.isInteger(v.maxLength)||v.maxLength<1||v.maxLength>4000)fail('Ugyldig maksimal tekstlengde '+v.id);
 for(const name of [v.id,...(v.aliases||[])]){
  if(!/^[A-ZÆØÅ][A-ZÆØÅ0-9_]*$/.test(name)||aliasToId.has(name))fail('Ugyldig eller kolliderende variabelalias '+name);
  aliasToId.set(name,v.id);
 }
}
const usedVariables=new Set();
for(const t of prompts.items){
 for(const n of [...t.placeholders,...(t.contextVariables||[])]){
  if(!aliasToId.has(n))fail('Plassholder eller kontekst uten variabeldefinisjon '+n+' i '+t.id);
  else usedVariables.add(aliasToId.get(n));
 }
}
if(!prompts.outputSettings?.depth?.options?.length||!prompts.outputSettings?.format?.options?.length||!str(prompts.outputSettings?.handoff?.instruction))fail('Manglende globale valg eller kontekstoverlevering');
const design=prompts.outputSettings.organizationTemplates;
if(!design||!str(design.label)||!str(design.hint)||!str(design.instruction)||!Array.isArray(design.formats)||!design.formats.length)fail('Mangler valgfritt firmamalsystem');
if(design.formats.some(id=>!['slides','pdf','word'].includes(id)))fail('Firmamaler må bare gjelde dokumenter og presentasjoner');
if(!str(prompts.outputSettings.missingEssentialInstruction)||!prompts.outputSettings.missingEssentialInstruction.includes('{fields}'))fail('Mangler generisk instruks om nødvendige opplysninger');

for(const key of ['groupPrefix','depthPrefix','formatPrefix'])if(!str(prompts.outputSettings[key]))fail('Tekstblokk mangler kanonisk overskrift: '+key);
for(const key of ['startMarker','endMarker'])if(!str(prompts.outputSettings.context?.[key]))fail('Mangler kanonisk kontekstmarkør: '+key);
for(const key of ['previewTitle','previewIntro','previewDirty','copySuccess','copyFailure','copyUnsupported'])if(!str(prompts.page.variableUi?.[key]))fail('Tekst for promptforhåndsvisning mangler: '+key);
if(!str(prompts.page.cardLinkLabel)||!str(prompts.page.filterAriaLabel))fail('Oppgavekort mangler dataeid grensesnittstekst');
const choiceGroups=prompts.choiceGroups||{},allFormatIds=new Set(prompts.outputSettings.format.options.map(o=>o.id));
for(const [id,g] of Object.entries({...choiceGroups,depth:prompts.outputSettings.depth,format:prompts.outputSettings.format})){
 if(!str(g.label)||!Array.isArray(g.options)||g.options.length<2)fail('Ufullstendig valggruppe '+id);
 const optionIds=new Set();
 for(const o of g.options){if(!str(o.id)||optionIds.has(o.id)||!str(o.label)||!str(o.instruction))fail('Ugyldig valgalternativ '+id+'/'+o.id);optionIds.add(o.id)}
}
for(const t of prompts.items){
 if(!Array.isArray(t.choiceGroups)||!Array.isArray(t.contextVariables)||!Array.isArray(t.formats)||!t.formats.length)fail('Prompt uten variantkontrakt '+t.id);
 if(t.cvOutput){
  const c=t.cvOutput;
  if(!str(c.modeGroup)||!str(c.draftValue)||!str(c.lengthGroup)||!choiceGroups[c.modeGroup]||!choiceGroups[c.lengthGroup]||!t.choiceGroups.includes(c.modeGroup))fail('Ufullstendig CV-resultatvalg i '+t.id);
  if(!choiceGroups[c.modeGroup].options.some(o=>o.id===c.draftValue))fail('Ukjent CV-utkastvalg i '+t.id);
  if(!Array.isArray(c.reviewFormats)||!Array.isArray(c.draftFormats)||!c.reviewFormats.length||!c.draftFormats.length||c.reviewFormats.some(k=>!t.formats.includes(k))||c.draftFormats.some(k=>!t.formats.includes(k)))fail('Ugyldig formatgrense for CV '+t.id);
  if(c.reviewFormats.some(k=>!['plain','markdown'].includes(k))||c.draftFormats.some(k=>!['word','pdf'].includes(k)))fail('CV-vurdering og CV-fil må ha separate formatvalg');
  if(!str(c.template?.label)||!str(c.template?.hint)||!str(c.template?.instruction))fail('CV-kravmal mangler datakontrakt');
 }

 if(!Array.isArray(t.optionalPlaceholders)||!Array.isArray(t.essentialPlaceholders))fail('Manglende kontrakt for valgfrie og nødvendige opplysninger i '+t.id);
 if(new Set(t.optionalPlaceholders).size!==t.optionalPlaceholders.length||new Set(t.essentialPlaceholders).size!==t.essentialPlaceholders.length)fail('Duplisert inputfelt '+t.id);
 if(t.optionalPlaceholders.some(n=>!t.placeholders.includes(n))||t.essentialPlaceholders.some(n=>!t.placeholders.includes(n)))fail('Ukjent optional/essential input '+t.id);
 const optionalSpans=[...t.prompt.matchAll(/\{\{\?([A-ZÆØÅ][A-ZÆØÅ0-9_]*)\}\}([\s\S]*?)\{\{\/\1\}\}/g)];
 const actualIds=optionalSpans.map(m=>m[1]);
 if(t.placeholders.length!==actualIds.length||t.placeholders.some(n=>actualIds.filter(k=>k===n).length!==1))fail('Alle inputfelt må være én unik betinget blokk: '+t.id);
 if(optionalSpans.some(m=>!m[2].includes('['+m[1]+']')))fail('Betinget felt uten egen verdi '+t.id);
 const withoutSpans=t.prompt.replace(/\{\{\?([A-ZÆØÅ][A-ZÆØÅ0-9_]*)\}\}[\s\S]*?\{\{\/\1\}\}/g,'');
 if(withoutSpans.includes('{{?')||withoutSpans.includes('{{/'))fail('Ubalansert betinget felt '+t.id);

 if(new Set(t.choiceGroups).size!==t.choiceGroups.length)fail('Dupliserte valggrupper '+t.id);
 for(const key of t.choiceGroups)if(!choiceGroups[key])fail('Ukjent valggruppe '+key+' i '+t.id);
 for(const f of t.formats)if(!allFormatIds.has(f))fail('Ukjent svarformat '+f+' i '+t.id);
 if(!t.contextVariables.includes('KUNDEKONTEKST'))fail('Mangler felles kundekontekst i '+t.id);
}
const primary=prompts.page.primaryIds||[],featured=prompts.page.featuredIds||[];
if(new Set(primary).size!==primary.length||primary.length<4||primary.some(id=>!prompts.items.some(x=>x.id===id))||featured.some(id=>!primary.includes(id)))fail('Ugyldig oppgaveprioritering for promptbiblioteket');
for(const id of variables.keys())if(!usedVariables.has(id))fail('Død variabel i registeret: '+id+' (fjern den eller knytt den til en aktiv prompt)');
if(!fs.existsSync('docs/assets/prompt-context.js')||!html.includes('prompt-context.js?v='+site.version))fail('Manglende versjonert kontekstmodul');
if(html.indexOf('prompt-context.js?v='+site.version)>html.indexOf('prompts.js?v='+site.version))fail('Kontekstmodul må lastes før promptvisning');

// Antall prompter er ikke et kvalitetskriterium – kvalitet og bruksoppgaver vurderes redaksjonelt.
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
