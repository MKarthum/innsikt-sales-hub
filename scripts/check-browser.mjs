/* Reelle Chromium-røykprøver for beta. Kjør etter at lokal HTTP-server er startet. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readFileSync as readTechFixture} from 'node:fs';
import { chromium } from 'playwright';
const base=process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/';
const expectedVersion=JSON.parse(fs.readFileSync('docs/data/site.json','utf8')).version;
const expectedPromptCount=JSON.parse(fs.readFileSync('docs/data/prompts.json','utf8')).items.length;
const expectedSlideCount=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items.length;
const expectedSales=JSON.parse(fs.readFileSync('docs/data/sales.json','utf8'));
const canonicalSlideTitles=new Map(JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items.map(x=>[x.id,x.title]));
const expectedDeckCount=Object.keys(JSON.parse(fs.readFileSync('docs/data/pages.json','utf8')).presentationDecks).length;
const pages=['oversikt','om-innsikt','ordliste','guide','forretning','muligheter','kundedialog','marked','kompetanse','arkitektur','teknologi','ai','bransje','verktoy','lysbilder','kilder','utvikling','prompter','horisont','trendradar'];
const details=['forretning/okonomi','forretning/sektor-transport','forretning/case-transport-catering','forretning/case-nett-investering','forretning/sektor-havbruk','muligheter/rapportering','arkitektur/bi','verktoy/first','prompter/account-research'];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const problems=[];
try {
 for (const {label,width,height} of [{label:'desktop',width:1440,height:900},{label:'mobil',width:390,height:844}]) {
  const context=await browser.newContext({viewport:{width,height},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();
  const failures=[];
  page.on('pageerror',e=>failures.push('JavaScript-feil: '+e.message));
  page.on('console',msg=>{if(msg.type()==='error')failures.push('Konsoll: '+msg.text())});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.locator('#main .hero').waitFor();
  assert.equal((await page.locator('#version-label').innerText()).trim(),expectedVersion,label+': versjon');
  assert.equal(await page.locator('.home-task').count(),4,label+': rask oppgavestart');
  assert.equal(await page.locator('#main .prompt-card').count(),3,label+': fremhevede prompter');
  for (const route of [...pages,...details]) {
   await page.evaluate(id=>{location.hash='#'+id},route);
   await page.waitForFunction(id=>location.hash==='#'+id,route);
   await page.locator('#main h1, #main h2').first().waitFor();
   const html=await page.locator('#main').innerHTML();
   assert.ok(html.length>120,label+': tom visning '+route);
   assert.ok(!html.includes('Kunne ikke laste nettsidens data'),label+': feilside '+route);
   assert.ok(!/\$\{[^{}]+\}/.test(html),label+': rå uttrykk '+route);
  }
  // Møteforberedelse skal bruke samme stabile salgsinnganger som detaljrutene.
  await page.evaluate(()=>{location.hash='#kompetanse'});
  await page.locator('[data-competence-audience]').waitFor();
  assert.equal(await page.locator('[data-competence-audience]').inputValue(),'audience-1',label+': første rolle valgt');
  assert.equal(await page.locator('[data-competence-audience] option').count(),expectedSales.audiences.length,label+': alle roller');
  assert.equal(await page.locator('.competence-path-step').count(),4,label+': fire meningsfulle ledd');
  assert.equal(await page.locator('.competence-role-details .person-card').count(),8,label+': gamle rolleinnganger bevart');
  assert.equal(await page.locator('.competence-overview .tile').count(),4,label+': eksisterende fagområder bevart');
  for(const id of ['audience-1','audience-7','audience-4',...expectedSales.audiences.map(x=>x.id).filter(x=>!['audience-1','audience-7','audience-4'].includes(x))]){
   const audience=expectedSales.audiences.find(x=>x.id===id);
   const play=expectedSales.plays.find(x=>x.id===audience.entry);
   assert.ok(play,label+': salgsinngang finnes for '+id);
   await page.locator('[data-competence-audience]').selectOption(id);
   assert.equal(await page.locator('[data-competence-play]').getAttribute('data-competence-play'),play.id,label+': korrekt salgsinngang '+id);
   assert.equal((await page.locator('.competence-path-role').innerText()).trim(),audience.label,label+': rolle '+id);
   assert.equal((await page.locator('[data-competence-step="signal"] blockquote').innerText()).trim(),play.hook,label+': kanonisk signal '+id);
   assert.deepEqual((await page.locator('.competence-path-questions li').allTextContents()).map(x=>x.trim()),play.questions.slice(0,2),label+': spørsmål i riktig rekkefølge '+id);
   assert.deepEqual((await page.locator('.competence-path-tags span').allTextContents()).map(x=>x.trim()),play.competence,label+': fagfelt uten mapping '+id);
   assert.equal(await page.locator('.competence-path-footer a').getAttribute('href'),'#muligheter/'+play.id,label+': korrekt CTA '+id);
   assert.equal(await page.locator('[data-competence-status]').innerText(),'Viser samtaleflyt for '+audience.label,label+': høflig statusmelding '+id);
   assert.equal(await page.evaluate(()=>location.hash),'#kompetanse',label+': rollevalg endrer ikke ruten');
  }
  const competenceOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(competenceOverflow<=3,label+': ingen horisontal avklipping i kompetanseflyten '+competenceOverflow);
  await page.locator('.competence-role-details summary').click();
  assert.equal(await page.locator('.competence-role-details a[href^="#muligheter/"]').count(),8,label+': gamle direktelenker tilgjengelige');
  // Salgsinnganger: dataeid samtaleflyt uten å erstatte filter, detaljer eller ruter.
  await page.evaluate(()=>{location.hash='#muligheter'});
  await page.locator('[data-play-journey-select]').waitFor();
  assert.equal(await page.locator('[data-play-journey-select]').inputValue(),'rapportering',label+': første signal');
  assert.deepEqual(await page.locator('[data-play-journey-select] option').evaluateAll(nodes=>nodes.map(n=>n.value)),expectedSales.plays.map(p=>p.id),label+': ni kanoniske signaler');
  for(const id of ['rapportering','modernisering','ki-data',...expectedSales.plays.map(p=>p.id).filter(id=>!['rapportering','modernisering','ki-data'].includes(id))]){
   const play=expectedSales.plays.find(p=>p.id===id);
   await page.locator('[data-play-journey-select]').selectOption(id);
   assert.equal(await page.locator('[data-play-journey-id]').getAttribute('data-play-journey-id'),id,label+': valgt signal '+id);
   assert.equal((await page.locator('[data-play-step="signal"] blockquote').innerText()).trim(),play.hook,label+': eksakt kanonisk signal '+id);
   assert.deepEqual((await page.locator('[data-play-step="questions"] li').allTextContents()).map(x=>x.trim()),play.questions.slice(0,2),label+': to spørsmål '+id);
   assert.deepEqual((await page.locator('[data-play-step="qualify"] ul li').allTextContents()).map(x=>x.trim()),play.qualify,label+': åpne kriterier '+id);
   await page.locator('.play-journey-not summary').click();
   assert.equal((await page.locator('.play-journey-not p').innerText()).trim(),play.not,label+': ikke anta '+id);
   assert.equal(await page.locator('.play-journey-footer a').getAttribute('href'),'#muligheter/'+id,label+': korrekt CTA '+id);
   assert.equal(await page.evaluate(()=>location.hash),'#muligheter',label+': valg uten navigasjon '+id);
   if(id!=='rapportering')assert.equal(await page.locator('[data-play-journey-status]').innerText(),'Viser samtaleflyt for '+play.name,label+': statusmelding '+id);
  }
  // A real keyboard change must retain focus in the native select.
  await page.locator('[data-play-journey-select]').selectOption('rapportering');
  await page.locator('[data-play-journey-select]').focus();
  await page.keyboard.press('ArrowDown');
  await page.waitForFunction(()=>document.querySelector('[data-play-journey-select]')?.value==='kundevekst');
  assert.equal(await page.locator('[data-play-journey-select]').evaluate(el=>el===document.activeElement),true,label+': fokus bevart ved tastaturvalg');
  assert.equal(await page.locator('[data-play-journey-id]').getAttribute('data-play-journey-id'),'kundevekst',label+': tastaturvalg oppdaterer data');
  assert.ok((await page.locator('[data-play-step="signal"] .play-journey-caution').innerText()).includes('ikke en dokumentert kundereferanse'),label+': fiktivt signal merket');
  assert.ok((await page.locator('[data-play-step="qualify"] .play-journey-caution').innerText()).includes('Åpne kriterier'),label+': kvalifisering ikke bekreftet');
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,label+': ingen horisontal overflyt i salgsinnganger');
  await page.locator('[data-play-journey-select]').selectOption('ki-data');
  await page.locator('.play-journey-footer a').click();
  await page.locator('.detail-banner h2').waitFor();
  assert.equal(await page.evaluate(()=>location.hash),'#muligheter/ki-data',label+': eksisterende detaljrute');
  await page.locator('.back-link[href="#muligheter"]').click();
  await page.locator('[data-play-journey-select]').waitFor();
  await page.locator('[data-filter="Dataplattform"]').click();
  assert.equal(await page.locator('.play-grid .play-card').count(),1,label+': eksisterende kategorifilter');
  assert.equal(await page.locator('[data-play-journey-select]').inputValue(),'ki-data',label+': valg beholdes ved kategorifilter');
  await page.locator('[data-filter="Alle"]').click();
  assert.equal(await page.locator('.play-grid .play-card').count(),expectedSales.plays.length,label+': alle ni kort bevart');
  // Teknologikart: behov, områder og avklaringsspørsmål uten parallelle fakta.
  await page.evaluate(()=>{location.hash='#teknologi'});
  await page.locator('[data-tech-journey-select]').waitFor();
  assert.equal(await page.locator('[data-tech-journey-select]').inputValue(),'rapportering',label+': teknologi standardbehov');
  const expectedPaths=JSON.parse(readTechFixture('docs/data/pages.json','utf8')).technologyJourneyUi.paths;
  const expectedTech=JSON.parse(readTechFixture('docs/data/technologies.json','utf8')).tech;
  assert.deepEqual(await page.locator('[data-tech-journey-select] option').evaluateAll(nodes=>nodes.map(n=>n.value)),expectedPaths.map(p=>p.playId),label+': tre kanoniske behov');
  for(const path of expectedPaths){
   const play=expectedSales.plays.find(p=>p.id===path.playId);
   await page.locator('[data-tech-journey-select]').selectOption(path.playId);
   assert.equal(await page.locator('[data-tech-journey-play]').getAttribute('data-tech-journey-play'),path.playId,label+': valgt behov');
   assert.equal((await page.locator('[data-tech-journey-step="signal"] blockquote').innerText()).trim(),play.hook,label+': kanonisk signal');
   assert.deepEqual((await page.locator('[data-tech-journey-step="questions"] li').allTextContents()).map(x=>x.trim()),play.questions.slice(0,2),label+': kanoniske spørsmål');
   assert.ok((await page.locator('.technology-journey-caution').innerText()).includes(play.not),label+': kanonisk forbehold');
   assert.deepEqual(await page.locator('[data-tech-journey-kind]').evaluateAll(nodes=>nodes.map(x=>x.dataset.techJourneyKind)),path.kinds,label+': to områder');
   assert.equal(await page.locator('[data-tech-catalog-cards] .tech-item').count(),expectedTech.length,label+': behov nullstiller filter');
   for(const kind of path.kinds){
    await page.locator('[data-tech-journey-kind]').filter({hasText:kind}).click();
    assert.equal(await page.locator('[data-tech-catalog-cards] .tech-item').count(),expectedTech.filter(x=>x.kind===kind).length,label+': filtrerte produkter');
    if(expectedTech.filter(x=>x.kind===kind).length===1)assert.equal((await page.locator('[data-tech-catalog-label]').innerText()).trim(),'teknologi eller område',label+': entall i resultat');
    assert.deepEqual((await page.locator('[data-tech-catalog-cards] .kind').allTextContents()).map(x=>x.trim()),expectedTech.filter(x=>x.kind===kind).map(x=>x.kind),label+': riktig kategori');
    assert.equal(await page.locator('[data-tech-filter="'+kind+'"]').getAttribute('aria-pressed'),'true',label+': filter synkronisert');
    assert.equal(await page.locator('[data-tech-journey-kind][aria-pressed="true"]').count(),1,label+': ett aktivt område');
    assert.equal(await page.evaluate(()=>location.hash),'#teknologi',label+': ingen hash-endring');
   }
   await page.locator('[data-tech-journey-reset]').click();
   assert.equal(await page.locator('[data-tech-catalog-cards] .tech-item').count(),expectedTech.length,label+': reset Alle');
   assert.equal(await page.locator('[data-tech-filter="Alle"]').getAttribute('aria-pressed'),'true',label+': Alle markert');
   assert.equal(await page.locator('.technology-journey-footer a').getAttribute('href'),'#muligheter/'+path.playId,label+': detaljrute');
  }
  await page.locator('[data-tech-journey-select]').focus();
  assert.ok(await page.locator('[data-tech-journey-select]').evaluate(el=>document.activeElement===el),label+': tastaturfokus');
  await page.locator('[data-tech-filter="Dataplattform"]').click();
  assert.equal(await page.locator('[data-tech-catalog-cards] .tech-item').count(),expectedTech.filter(x=>x.kind==='Dataplattform').length,label+': eksisterende filter');
  await page.locator('[data-tech-filter="Alle"]').click();
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,label+': ingen teknologioverløp');
  await page.locator('.technology-journey-footer a').click();
  await page.locator('.detail-banner h2').waitFor();
  assert.equal(await page.evaluate(()=>location.hash),'#muligheter/modernisering',label+': detaljlenke');
  await page.evaluate(()=>{location.hash='#teknologi'});
  await page.locator('[data-tech-journey-select]').waitFor();
  assert.equal(await page.locator('[data-tech-journey-select]').inputValue(),'modernisering',label+': valg beholdes');
  await page.evaluate(()=>{location.hash='#horisont'});
  await page.locator('.horizon-concept-grid .horizon-concept').first().waitFor();
  assert.equal(await page.locator('.horizon-concept-grid .horizon-concept').count(),6,label+': seks begreper med én kanonisk kilde');
  const brainChapter=page.locator('.horizon-chapter').filter({has:page.locator('h3',{hasText:'«Company Brain»'})});
  assert.equal(await brainChapter.count(),1,label+': ett fordypningskapittel om Company Brain');
  const brainText=await brainChapter.innerText();
  for(const vendor of ['Glean','Microsoft IQ','Snowflake','Palantir'])assert.ok(brainText.includes(vendor),label+': kildebelagt perspektiv '+vendor);
  assert.ok(brainText.includes('ikke definisjonen'),label+': Glean er ikke definisjonen av Company Brain');
  assert.ok(brainText.includes('Organizational Second Brain')&&brainText.includes('Meta'),label+': Meta som organisatorisk eksempel, ikke ny plattformstandard');
  assert.ok((await page.locator('body').innerText()).includes('Second Brain'),label+': beslektet terminologi i fordypningen');
  assert.ok((await page.locator('.horizon-concept-grid').innerText()).includes('Kunnskapsgraf er én mulig byggestein'),label+': graf er ikke synonym for Company Brain');
  assert.equal(await page.locator('.horizon-concept-grid').evaluate(el=>document.documentElement.scrollWidth>innerWidth+3),false,label+': ingen horisontal overløp i begrepssammenligning');
  // Lysbildedetaljer må vise klikkbart bibliotek og navn på objektet.
  for(const slideId of ['portal-opening','architecture-snowflake']){
   await page.evaluate(id=>{location.hash='#lysbilder/'+id},slideId);
   await page.waitForFunction(id=>location.hash==='#lysbilder/'+id&&document.querySelector('.breadcrumb-trail a[href="#lysbilder"]'),slideId);
   const parent=page.locator('.breadcrumb-trail a[href="#lysbilder"]');
   assert.equal(await parent.count(),1,label+': klikkbart bibliotek fra '+slideId);
   assert.equal((await parent.innerText()).trim(),'Lysbildebibliotek',label+': riktig foreldretittel');
   assert.equal(await page.locator('.breadcrumb-trail [aria-current="page"]').count(),1,label+': ett gjeldende nivå');
   assert.equal((await page.locator('.breadcrumb-trail [aria-current="page"]').innerText()).trim(),canonicalSlideTitles.get(slideId),label+': lysbildenavn i sti');
   assert.equal(await page.locator('#crumb').getAttribute('aria-current'),null,label+': beholder er ikke gjeldende side');
   await parent.click();
   await page.waitForFunction(()=>location.hash==='#lysbilder'&&document.querySelector('.slide-library-card'));
   assert.equal(await page.locator('.breadcrumb-trail a[href="#lysbilder"]').count(),0,label+': foreldrenivå er sluttpunkt');
   assert.equal(await page.locator('#crumb').getAttribute('aria-current'),'page',label+': biblioteket er gjeldende side');
  }
  // Foreldrenivå og hjem skal kunne åpnes fra navigasjonsstien.
  await page.evaluate(()=>{location.hash='#muligheter/datasuverenitet'});
  await page.locator('#main .detail-banner').waitFor();
  assert.equal(await page.locator('.breadcrumb-trail a[href="#muligheter"]').count(),1,label+': forelder i navigasjonsstien');
  await page.locator('.breadcrumb-trail a[href="#muligheter"]').click();
  await page.waitForFunction(()=>location.hash==='#muligheter');
  assert.equal(await page.locator('.breadcrumb-project[href="#oversikt"]').count(),1,label+': hjem i navigasjonsstien');
  await page.locator('.breadcrumb-project').click();
  await page.waitForFunction(()=>location.hash==='#oversikt');
  const menuRoutes=await page.locator('#nav-groups .nav a').evaluateAll(links=>links.map(a=>a.dataset.navRoute));
  assert.ok(menuRoutes.indexOf('prompter')<menuRoutes.indexOf('guide'),label+': arbeidsverktøy før fagintroduksjon');
  assert.ok(menuRoutes.includes('om-innsikt')&&menuRoutes.includes('kundedialog/stotte')&&menuRoutes.includes('kundedialog/trening'),label+': oppgaver og læring har tydelige innganger');
  await page.evaluate(()=>{location.hash='#ordliste'});
  await page.locator('.glossary-item').first().waitFor();
  assert.ok((await page.locator('.glossary-item').allTextContents()).some(t=>t.includes('Business intelligence')),label+': fullt navn i ordlisten');
  // Brukerreise A og C: naviger direkte fra to valg til skjermede rollekort og refleksjon.
  await page.evaluate(()=>{location.hash='#kundedialog'});
  await page.locator('.dialogue-choice-grid').waitFor();
  assert.equal(await page.locator('.dialogue-choice').count(),2,label+': trening og støtte er tydelige valg');
  await page.locator('.dialogue-choice[href="#kundedialog/trening"]').click();
  await page.locator('.dialogue-scenario').first().waitFor();
  assert.equal(await page.locator('.dialogue-scenario').count(),8,label+': alle fiktive scenarioer');
  await page.locator('.dialogue-scenario[href="#kundedialog/tren-scenario-08"]').click();
  await page.locator('.dialogue-role-sheet').waitFor();
  const sellerText=await page.locator('.dialogue-role-sheet').innerText();
  assert.ok(sellerText.includes('sikkerhetsansvarlig'),label+': krevende selgerrolle');
  assert.ok(!sellerText.includes('Ved spørsmål om data:'),label+': kunden sine opplysninger skjules');
  assert.equal(await page.locator('.breadcrumb-trail a[href="#kundedialog"]').count(),1,label+': treningsrute med klikkbar forelder');
  await page.locator('[data-dialogue-copy]').click();
  assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).endsWith('#kundedialog/kunde-scenario-08'),label+': delbar kunderolle');
  await page.locator('.dialogue-role-nav a[href="#kundedialog/kunde-scenario-08"]').click();
  assert.ok((await page.locator('.dialogue-customer').innerText()).includes('Ved spørsmål om data:'),label+': kundens egen bakgrunn');
  await page.locator('.dialogue-role-nav a[href="#kundedialog/evaluer-scenario-08"]').click();
  assert.equal(await page.locator('.dialogue-debrief[open]').count(),0,label+': fasit skjult før refleksjon');
  await page.locator('.dialogue-debrief summary').click();
  assert.ok((await page.locator('.dialogue-debrief-body').innerText()).includes('EU-region'),label+': etterprat viser faglige fallgruver');
  await page.locator('.dialogue-actions a[href="#kundedialog/trening"]').click();
  await page.locator('.dialogue-scenario').first().waitFor();
  assert.equal(await page.locator('.dialogue-scenario').count(),8,label+': bytte øvelse');
  // Brukerreise B: direkte møteforberedelse uten trening.
  await page.evaluate(()=>{location.hash='#kundedialog/stotte'});
  await page.locator('.dialogue-support-grid').waitFor();
  assert.equal(await page.locator('.dialogue-support-item').count(),6,label+': seks praktiske innganger');
  assert.equal(await page.locator('a[href="#prompter/meeting-prep"]').count()>0,true,label+': møtebrief finnes');
  assert.equal(await page.locator('.breadcrumb-trail a[href="#kundedialog"]').count(),1,label+': støtte med foreldrenivå');
  assert.ok((await page.locator('.dialogue-support-grid').innerText()).includes('Hva skjer i dag'),label+': konkrete oppfølgingsspørsmål');
  if(label==='mobil') {
   await page.locator('#menu-toggle').click();
   assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true','mobilmeny åpner');
   await page.locator('#sidebar-close').click();
   assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false','mobilmeny har egen lukkeknapp');
   await page.locator('#menu-toggle').click();
   await page.locator('#sidebar-backdrop').click({position:{x:385,y:300},force:true});
   assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false','trykk utenfor lukker mobilmeny');
   await page.locator('#menu-toggle').click();
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false','Escape lukker mobilmeny');
  }
  await page.evaluate(()=>{location.hash='#trendradar'});
  await page.locator('#radar-world-models').waitFor();
  assert.equal(await page.locator('#main .horizon-chapter').count(),5,label+': trendradar viser fem dataeide signaler');
  await page.evaluate(()=>{location.hash='#arkitektur/ai-on-data'});
  await page.locator('.diagram-flow-up').waitFor();
  assert.equal(await page.locator('.diagram-flow-up').evaluate(el=>getComputedStyle(el).flexDirection),'column-reverse',label+': diagram leses nedenfra og opp');
  await page.evaluate(()=>{location.hash='#prompter'});await page.locator('.prompt-primary').waitFor();
  assert.equal(await page.locator('.prompt-primary .prompt-card').count(),7,label+': syv prioriterte oppgaver i én samlet seksjon');
  assert.equal(await page.locator('.prompt-featured').count(),0,label+': ingen kunstig oppdeling av vanlige oppgaver');
  assert.equal(await page.locator('#main .prompt-card').count(),expectedPromptCount,label+': alle oppgaver, også de bak utvidet visning, uten duplikater');
  await page.evaluate(()=>{location.hash='#muligheter/rapportering'});await page.locator('.related-prompt a[href="#prompter/discovery"]').waitFor();
  await page.evaluate(()=>{location.hash='#forretning/okonomi'});await page.locator('.related-prompt a[href="#prompter/opportunity-map"]').waitFor();
  await page.evaluate(()=>{location.hash='#prompter/account-research'});
  await page.locator('#prompt-editor').waitFor({state:'attached'});
  const original=await page.locator('#prompt-editor').inputValue();
  assert.ok(original.includes('Bruk bare offentlig tilgjengelige'),'felles kildeinstruks i redigerbar prompt');
  await page.locator('#prompt-advanced summary').click();
  await page.locator('#prompt-editor').fill('MIDLERTIDIG TEST');
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('[data-prompt-reset]').click();
  assert.equal(await page.locator('#prompt-editor').inputValue(),original,'prompt tilbakestilling');
  await page.locator('[data-prompt-copy]').click();
  await page.waitForTimeout(80);
  const copied=await page.evaluate(()=>navigator.clipboard.readText());
  assert.equal(copied,original,'prompt kopieres i sin helhet');
  await page.evaluate(()=>{location.hash='#forretning'});
  await page.locator('.sector-card').first().waitFor();
  assert.equal(await page.locator('.sector-card').count(),9,label+': bransjeoversikt');
  await page.evaluate(()=>{location.hash='#forretning/sektor-transport'});
  await page.locator('.industry-case-card').first().waitFor();
  assert.equal(await page.locator('.industry-case-card').count(),4,label+': transport-caser');
  await page.locator('.industry-case-card').first().click();
  await page.locator('.business-detail-grid').waitFor();
  assert.ok((await page.locator('.business-detail-grid').innerText()).includes('avgrensede') || (await page.locator('.business-detail-grid').innerText()).length>100, label+': detaljvisning');
  // Search must open the canonical glossary definition, not the separate introduction.
  await page.locator('#search-button').click();
  await page.locator('#search-input').fill('dataplattform');
  const glossaryHit=page.locator('.result-item[href="#ordliste/dataplattform"]');
  await glossaryHit.waitFor();
  assert.ok((await glossaryHit.innerText()).includes('Dataplattform'),label+': treff med stabil begrepsrute');
  await glossaryHit.click();
  await page.waitForFunction(()=>location.hash==='#ordliste/dataplattform'&&document.querySelector('.glossary-item[data-glossary-id="dataplattform"]')?.open);
  assert.equal(await page.locator('#search-input').count(),0,label+': søk lukkes ved valg');
  assert.equal(await page.locator('.glossary-item[open]').count(),1,label+': bare valgt begrep åpnes');
  await page.waitForFunction(()=>document.activeElement===document.querySelector('.glossary-item[data-glossary-id="dataplattform"] summary'));
  const focusPosition=await page.locator('.glossary-item[data-glossary-id="dataplattform"] summary').evaluate(el=>({top:el.getBoundingClientRect().top,header:document.querySelector('.topbar').getBoundingClientRect().height}));
  assert.ok(focusPosition.top>=focusPosition.header+8,label+': valgt begrep er synlig under fast toppmeny');
  assert.equal(await page.locator('#crumb a[href="#ordliste"]').count(),1,label+': ordliste som klikkbar forelder');
  assert.equal((await page.locator('#crumb [aria-current="page"]').innerText()).trim(),'Dataplattform',label+': riktig begrep i sti');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3),false,label+': ordliste uten horisontalt overløp');
  await page.locator('#search-button').click();
  await page.locator('#search-input').fill('Business intelligence');
  await page.locator('.result-item[href="#ordliste/bi"]').click();
  await page.waitForFunction(()=>location.hash==='#ordliste/bi'&&document.querySelector('.glossary-item[data-glossary-id="bi"]')?.open);
  assert.ok((await page.locator('.glossary-item[data-glossary-id="bi"]').innerText()).includes('Business intelligence'),label+': fullt navn er indeksert og vist');
  for(const term of ['SQL','dbt']){
   await page.locator('#search-button').click();
   await page.locator('#search-input').fill(term);
   assert.ok(await page.locator('.result-item[href^="#ordliste/"]').count()>0,label+': begrepssøk '+term);
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#search-input').count(),0,label+': Escape lukker søk');
  }
  await page.evaluate(()=>location.hash='#ordliste');
  await page.waitForFunction(()=>location.hash==='#ordliste'&&document.querySelectorAll('.glossary-item').length>0);
  assert.equal(await page.locator('.glossary-item[open]').count(),0,label+': ordinær ordliste starter lukket');
  // Bibliotek: enhetlig ID, detaljvisning, kildepolicy og direkte åpning.
  await page.evaluate(()=>{location.hash='#lysbilder'});
  await page.locator('.slide-library-card').first().waitFor();
  assert.equal(await page.locator('.slide-library-card').count(),expectedSlideCount,label+': alle selvstendige lysbilder');
  await page.locator('.slide-library-card[href="#lysbilder/portal-opening"]').click();
  await page.locator('.slide-library-info').waitFor();
  await page.locator('.slide-library-detail-stage .present-frame').waitFor();
  // The detail page remains the first step; only its slide is fullscreen-capable.
  await page.locator('[data-slide-preview-open]').click();
  await page.locator('#slide-library-fullscreen .present-frame').waitFor();
  await page.locator('#slide-library-fullscreen .modal-close').click();
  assert.equal(await page.locator('#slide-library-fullscreen').count(),0,label+': close returns to slide details');
  assert.ok(await page.locator('.slide-library-info').isVisible(),label+': notes and sources retained on detail page');
  assert.equal(await page.locator('.slide-library-detail-stage .text-source').count(),0,label+': ingen kildeliste på åpningsbildet');
  const tonePair=await page.locator('.slide-library-detail-stage .present-frame').evaluate(el=>{
   el.dataset.tone='strong';
   const strong={bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el).color};
   el.dataset.tone='light';
   const light={bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el).color};
   return {strong,light};
  });
  assert.notEqual(tonePair.strong.bg,tonePair.light.bg,label+': tema endrer bakgrunn');
  assert.notEqual(tonePair.strong.fg,tonePair.light.fg,label+': tema endrer tilhørende tekstfarge');
  await page.locator('[data-slide-open][data-deck-open="portal"]').click();
  assert.ok((await page.locator('#slide-body').innerText()).includes(canonicalSlideTitles.get('portal-opening')),label+': åpne bestemt lysbilde fra biblioteket');
  await page.locator('#speaker-toggle').check();
  assert.ok((await page.locator('#slide-speaker-notes').innerText()).includes('Overgang:'),label+': storiespesifikke notater følger lysbildet');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#present-modal').count(),0,label+': tilbake til bibliotek etter Presenter');
  await page.locator('#present-button').click();
  assert.equal(await page.locator('[data-deck]').count(),expectedDeckCount,'Alle kuraterte Presenter-løp');
  assert.ok((await page.locator('#slide-body').innerText()).includes('Tenk om virksomheten din fikk'),label+': Hvorfor Innsikt starter som hovedfortelling');
  for(const deck of ['portal','sales']) {
   await page.locator('[data-deck="'+deck+'"]').click();
   assert.ok((await page.locator('#slide-body').innerText()).length>15,'Presenter '+deck);
   await page.locator('#slide-next').click();
   assert.ok((await page.locator('#slide-counter').innerText()).startsWith('2 av'),'neste lysbilde '+deck);
  }
  // Hovedfortellingen skal følge de samme oppgavene som den nye forsiden.
  await page.locator('[data-deck="portal"]').click();
  await page.locator('#slide-next').click();
  assert.ok((await page.locator('#slide-body').innerText()).includes(canonicalSlideTitles.get('portal-meeting-brief')),label+': direkte til møtebrief etter åpning');
  await page.locator('#speaker-toggle').check();
  assert.ok((await page.locator('#slide-speaker-notes').innerText()).includes('møtebrief'),label+': presenter-notat følger ny overgang');
  await page.locator('#slide-next').click();
  assert.ok((await page.locator('#slide-body').innerText()).includes(canonicalSlideTitles.get('portal-customer-signal')),label+': kundebehov er neste alternativ');
  await page.locator('#slide-next').click();
  assert.ok((await page.locator('#slide-body').innerText()).includes(canonicalSlideTitles.get('portal-learning')),label+': fagdybde kommer når nødvendig');
  // Eksempelet skal gjenbruke et kanonisk forretningsbehov, ikke være en kundereferanse.
  await page.locator('[data-deck="sales"]').click();
  const exampleOpening=await page.locator('#slide-body').innerText();
  assert.ok(exampleOpening.toLowerCase().includes('fiktiv'),label+': eksempel tydelig merket');
  await page.locator('#slide-next').click();
  const exampleContent=await page.locator('#slide-body').innerText();
  assert.ok(exampleContent.includes('månedsavslutning')&&exampleContent.includes('Vi bruker flere dager'),label+': kanonisk forretningsbehov i eksempel');
  await page.locator('#slide-next').click();
  const explanation=await page.locator('#slide-body').innerText();
  assert.ok(explanation.includes(canonicalSlideTitles.get('sales-hypotheses')),label+': årsaker vurderes etter symptomet');
  // Eksempelløpet må peke til en faktisk tilgjengelig, kanonisk prompt.
  await page.locator('#slide-next').click();
  await page.locator('#slide-next').click();
  assert.ok((await page.locator('#slide-body').innerText()).includes('Forbered en behovssamtale'),label+': prompt som eksisterer i biblioteket');
  // Alle lysbilder beholder samme 16:9-flate på hver skjermstørrelse.
  for(const deck of ['portal','sales']){
   await page.locator('[data-deck="'+deck+'"]').click();
   const count=await page.locator('#slide-counter').innerText();
   const total=Number(count.split(' av ')[1]);
   let expected=null;
   for(let i=0;i<total;i++){
    const measures=await page.locator('#slide-body').evaluate(el=>{
     const rect=el.getBoundingClientRect();
     return {width:rect.width,height:rect.height,overflowY:el.scrollHeight-el.clientHeight,overflowX:el.scrollWidth-el.clientWidth};
    });
    assert.ok(Math.abs(measures.width/measures.height-16/9)<0.02,label+': 16:9 '+deck+' '+i);
    if(expected)assert.ok(Math.abs(expected.height-measures.height)<2,label+': stabil slidehøyde '+deck);
    expected=measures;
    // Innhold må ikke klippes av den faste visningsflaten.
    assert.ok(measures.overflowY<=3&&measures.overflowX<=3,label+': slide-overflyt '+deck+' '+i+' '+JSON.stringify(measures));
    if(i<total-1)await page.locator('#slide-next').click();
   }
  }
  // Horisontale sveip navigerer begge veier; vanlig vertikal gest skal ikke utløse skifte.
  await page.locator('[data-deck="portal"]').click();
  await page.locator('#present-stage').evaluate(stage=>{
    const fire=(name,x,y)=>{const ev=new Event(name,{bubbles:true});Object.defineProperty(ev,name==='touchstart'?'touches':'changedTouches',{value:[{clientX:x,clientY:y}]});stage.dispatchEvent(ev)};
    fire('touchstart',280,150);fire('touchend',100,152);
  });
  assert.ok((await page.locator('#slide-counter').innerText()).startsWith('2 av'),label+': sveip til neste slide');
  await page.locator('#present-stage').evaluate(stage=>{
    const fire=(name,x,y)=>{const ev=new Event(name,{bubbles:true});Object.defineProperty(ev,name==='touchstart'?'touches':'changedTouches',{value:[{clientX:x,clientY:y}]});stage.dispatchEvent(ev)};
    fire('touchstart',100,150);fire('touchend',280,151);
  });
  assert.ok((await page.locator('#slide-counter').innerText()).startsWith('1 av'),label+': sveip tilbake');
  await page.locator('#present-stage').evaluate(stage=>{
    const fire=(name,x,y)=>{const ev=new Event(name,{bubbles:true});Object.defineProperty(ev,name==='touchstart'?'touches':'changedTouches',{value:[{clientX:x,clientY:y}]});stage.dispatchEvent(ev)};
    fire('touchstart',200,100);fire('touchend',190,290);
  });
  assert.ok((await page.locator('#slide-counter').innerText()).startsWith('1 av'),label+': vertikal gest påvirker ikke slide');
  // Slide, modal og navigasjonskontroller skal være synlige uten scrolling i dialogen.
  const viewports=[{width,height},{width:1280,height:720},{width:390,height:667},{width:844,height:390}];
  for(const viewport of viewports){
   await page.setViewportSize(viewport);
   await page.waitForTimeout(100);
   for(const deck of ['portal','sales']){
    await page.locator('[data-deck="'+deck+'"]').click();
    const measurements=await page.evaluate(()=>{
     const modal=document.getElementById('present-modal'),stage=document.getElementById('present-stage');
     const slide=document.getElementById('slide-body'),next=document.getElementById('slide-next'),download=document.getElementById('deck-download');
     const rect=node=>{const r=node.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
     return {modal:rect(modal),stage:rect(stage),slide:rect(slide),next:rect(next),download:rect(download),
       viewport:{width:innerWidth,height:innerHeight}, scrollHeight:modal.scrollHeight,clientHeight:modal.clientHeight};
    });
    const m=measurements,v=m.viewport,tolerance=3;
    const inside=(child,parent)=>child.left>=parent.left-tolerance&&child.top>=parent.top-tolerance&&child.right<=parent.right+tolerance&&child.bottom<=parent.bottom+tolerance;
    assert.ok(inside(m.modal,{left:0,top:0,right:v.width,bottom:v.height}),label+': modal utenfor viewport '+deck+' '+JSON.stringify(m));
    assert.ok(inside(m.slide,m.stage),label+': slide klippes i stage '+deck+' '+JSON.stringify(m));
    assert.ok(inside(m.slide,m.modal),label+': slide utenfor modal '+deck+' '+JSON.stringify(m));
    assert.ok(inside(m.next,m.modal)&&inside(m.download,m.modal),label+': kontroller utenfor modal '+deck);
    assert.ok(m.scrollHeight<=m.clientHeight+3,label+': modal trenger scrolling '+deck+' '+JSON.stringify(m));
    assert.ok(Math.abs(m.slide.width/m.slide.height-16/9)<0.02,label+': 16:9 ved '+v.width+'×'+v.height);
   }
  }
  await page.setViewportSize({width,height});
  await page.locator('[data-deck="portal"]').click();
  // Presentatørfullskjerm: native nettleser-API når mulig, CSS-reserve hvis API ikke støttes.
  await page.locator('#present-fullscreen-toggle').click();
  await page.waitForFunction(()=>document.querySelector('#present-modal.presenter-fullscreen'));
  assert.equal(await page.locator('#present-fullscreen-toggle').getAttribute('aria-pressed'),'true',label+': fullskjerm er aktiv');
  assert.equal(await page.locator('#present-modal .modal-header').isVisible(),false,label+': tittellinjen skjules i fullskjerm');
  assert.equal(await page.locator('#present-modal .deck-controls').isVisible(),false,label+': deckvalg skjules i fullskjerm');
  assert.equal(await page.locator('#deck-download').isVisible(),false,label+': eksportkontroller skjules i fullskjerm');
  const slideInFullscreen=await page.evaluate(()=>{
   const modal=document.getElementById('present-modal').getBoundingClientRect(),
    stage=document.getElementById('present-stage').getBoundingClientRect(),
    slide=document.getElementById('slide-body').getBoundingClientRect();
   return {m:{x:modal.x,y:modal.y,width:modal.width,height:modal.height},
    stage:{x:stage.x,y:stage.y,width:stage.width,height:stage.height},
    slide:{x:slide.x,y:slide.y,width:slide.width,height:slide.height},
    viewport:{width:innerWidth,height:innerHeight}};
  });
  const fs=slideInFullscreen;
  assert.ok(fs.m.x>=-2&&fs.m.y>=-2&&fs.m.width>=fs.viewport.width-3&&fs.m.height>=fs.viewport.height-3,label+': fullskjerm dekker viewport '+JSON.stringify(fs));
  assert.ok(fs.slide.x>=fs.stage.x-3&&fs.slide.y>=fs.stage.y-3&&fs.slide.x+fs.slide.width<=fs.stage.x+fs.stage.width+3&&fs.slide.y+fs.slide.height<=fs.stage.y+fs.stage.height+3,label+': lysbilde får plass i fullskjerm '+JSON.stringify(fs));
  assert.ok(Math.abs(fs.slide.width/fs.slide.height-16/9)<0.02,label+': fullskjerm beholder 16:9');
  await page.keyboard.press('ArrowRight');
  assert.ok((await page.locator('#slide-counter').innerText()).startsWith('2 av'),label+': neste lysbilde i fullskjerm');
  await page.keyboard.press('ArrowLeft');
  assert.ok((await page.locator('#slide-counter').innerText()).startsWith('1 av'),label+': forrige lysbilde i fullskjerm');
  await page.locator('#present-fullscreen-toggle').click();
  await page.waitForFunction(()=>!document.querySelector('#present-modal.presenter-fullscreen')&&!document.fullscreenElement);
  assert.equal(await page.locator('#present-modal').count(),1,label+': ut av fullskjerm uten å lukke Presenter');
  assert.equal(await page.locator('#present-fullscreen-toggle').getAttribute('aria-pressed'),'false',label+': knapp tilbakestilt');
  // Test eksplisitt CSS-reserve for mobilnettlesere uten fullscreen-API.
  await page.locator('#present-modal').evaluate(el=>{el.requestFullscreen=undefined;});
  await page.locator('#present-fullscreen-toggle').click();
  await page.waitForFunction(()=>document.querySelector('#present-modal.presenter-fullscreen'));
  assert.equal(await page.evaluate(()=>document.fullscreenElement),null,label+': CSS-reserve uten Fullscreen API');
  await page.setViewportSize({width:844,height:390});
  await page.waitForTimeout(90);
  const compact=await page.evaluate(()=>{
   const stage=document.getElementById('present-stage').getBoundingClientRect();
   const slide=document.getElementById('slide-body').getBoundingClientRect();
   return {x:slide.x,y:slide.y,r:slide.right,b:slide.bottom,
    stageX:stage.x,stageY:stage.y,stageR:stage.right,stageB:stage.bottom};
  });
  assert.ok(compact.x>=compact.stageX-3&&compact.y>=compact.stageY-3&&compact.r<=compact.stageR+3&&compact.b<=compact.stageB+3,label+': fullskjerm også i lavt landskapsvindu '+JSON.stringify(compact));
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('#present-modal.presenter-fullscreen'));
  assert.equal(await page.locator('#present-modal').count(),1,label+': Esc går ut av CSS-fullskjerm uten å lukke Presenter');
  await page.setViewportSize({width,height});
  await page.locator('[data-deck="portal"]').click();
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#deck-download').click();
  const download=await downloadPromise;
  assert.ok(download.suggestedFilename().includes(expectedVersion)&&download.suggestedFilename().endsWith('.html'),'versjonert nedlastbar presentasjon');
  const exported=(await import('node:fs')).readFileSync(await download.path(),'utf8');
  assert.ok(exported.includes(canonicalSlideTitles.get('portal-opening'))&&exported.includes('Skriv ut / PDF'),'selvstendig HTML-presentasjon');
  assert.equal((exported.match(/class="present-frame present-rich export-slide"/g)||[]).length,6,'alle seks portal-slides er eksportert');
  const popupPromise=context.waitForEvent('page');
  await page.locator('#deck-print').click();
  const printed=await popupPromise;
  await printed.waitForFunction(()=>document.querySelectorAll('.export-slide').length===6);
  assert.ok((await printed.locator('#export-print').count())===1,'utskriftsvisning har PDF-knapp');
  await printed.close();
  await page.locator('#speaker-toggle').check();
  // Kontroller at notatene faktisk inneholder forklaring, eksempel og en bro videre.
  for(const deck of ['portal','sales']){
   await page.locator('[data-deck="'+deck+'"]').click();
   const count=Number((await page.locator('#slide-counter').innerText()).split(' av ')[1]);
   for(let index=0;index<count;index++){
    const note=await page.locator('#slide-speaker-notes').innerText();
    assert.ok(note.length>320,label+': substans i notat '+deck+'/'+index);
    if(index<count-1)assert.ok(/Overgang:/.test(note),label+': fortellingsbro i notat '+deck+'/'+index);
    if(index<count-1)await page.locator('#slide-next').click();
   }
  }
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#present-modal').count(),0,'lukke Presenter');
  // Popover testes i faktiske DOM-visninger på både mobil og desktop.
  for(const route of ['horisont','teknologi','guide']){
   await page.evaluate(id=>{location.hash='#'+id},route);
   await page.waitForFunction(id=>{
    const target=id==='horisont'?'.horizon-intro':id==='guide'?'.lesson-chapter':'.tech-item';
    return location.hash==='#'+id&&document.querySelector(target)&&document.querySelector('#main .glossary-trigger');
   },route);
   const term=page.locator('#main .glossary-trigger').first();
   const word=await term.innerText(),id=await term.getAttribute('data-glossary-id');
   assert.ok(word.trim().length>1,label+': begrep bevart '+route);
   const meaning=await page.evaluate(async id=>{
    const data=await (await fetch('./data/learning.json')).json();
    return data.glossary.find(x=>x.id===id)?.meaning;
   },id);
   await term.click();
   const popup=page.locator('#innsikt-glossary-popover');await popup.waitFor();
   assert.ok((await popup.innerText()).includes(meaning),label+': kanonisk definisjon '+route);
   assert.equal(await term.getAttribute('aria-expanded'),'true',label+': aria-expanded');
   const b=await popup.boundingBox();
   assert.ok(b&&b.x>=-1&&b.y>=-1&&b.x+b.width<=width+2&&b.y+b.height<=height+2,label+': popup innenfor skjerm');
   await page.keyboard.press('Escape');
   assert.equal(await popup.count(),0,label+': Escape lukker');
   assert.ok(await term.evaluate(el=>document.activeElement===el),label+': fokus tilbake');
   await term.press('Enter');await popup.waitFor();
   await page.locator('.topbar .breadcrumb').click();
   assert.equal(await popup.count(),0,label+': uteklikk lukker');
  }
  await page.evaluate(()=>{location.hash='#horisont'});
  await page.locator('#main .glossary-trigger').first().click();
  await page.evaluate(()=>{location.hash='#teknologi'});
  await page.waitForFunction(()=>location.hash==='#teknologi'&&document.querySelector('.tech-item'));
  assert.equal(await page.locator('#innsikt-glossary-popover').count(),0,label+': popup ryddet ved hash-navigasjon');
  await page.evaluate(()=>{location.hash='#prompter/account-research'});
  await page.locator('#prompt-editor').waitFor({state:'attached'});
  assert.equal(await page.locator('#prompt-editor .glossary-trigger').count(),0,label+': redigerbare prompter urørt');
  await page.evaluate(()=>{location.hash='#oversikt'});
  const widthCheck=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,window:innerWidth}));
  assert.ok(widthCheck.scroll<=widthCheck.window+5,label+': horisontal overflyt '+JSON.stringify(widthCheck));
  assert.deepEqual(failures,[],label+': ingen konsoll-/runtimefeil');
  console.log('PASS – '+label+': '+pages.length+' sider, '+details.length+' detaljer, søk, kopiering/tilbakestilling, Presenter, navigasjon og bredde');
  await context.close();
 }
 const fixture=await browser.newContext({viewport:{width:390,height:844}});
 await fixture.route('**/data/sales.json',async route=>{
  const response=await route.fetch();
  const sales=await response.json();
  sales.plays.find(x=>x.id==='rapportering').hook='QA_KANONISK_SIGNAL_FRA_SALES';
  sales.plays.find(x=>x.id==='rapportering').questions[0]='QA_KANONISK_SPORSMAL_FRA_SALES';
  await route.fulfill({response,body:JSON.stringify(sales)});
 });
 const fixturePage=await fixture.newPage();
 await fixturePage.goto(base+'#kompetanse',{waitUntil:'networkidle'});
 await fixturePage.locator('[data-competence-step="signal"] blockquote').waitFor();
 assert.equal((await fixturePage.locator('[data-competence-step="signal"] blockquote').innerText()).trim(),'QA_KANONISK_SIGNAL_FRA_SALES','Kanonisk endring i sales.json slår ut uten kopi');
 await fixturePage.evaluate(()=>{location.hash='#muligheter'});
 await fixturePage.locator('[data-play-journey-id="rapportering"]').waitFor();
 assert.equal((await fixturePage.locator('[data-play-step="signal"] blockquote').innerText()).trim(),'QA_KANONISK_SIGNAL_FRA_SALES','Metamorfisk signal på salgsinnganger følger sales.json uten kopiering');
 await fixturePage.evaluate(()=>{location.hash='#teknologi'});
 await fixturePage.locator('[data-tech-journey-play="rapportering"]').waitFor();
 assert.equal((await fixturePage.locator('[data-tech-journey-step="signal"] blockquote').innerText()).trim(),'QA_KANONISK_SIGNAL_FRA_SALES','Teknologikart bruker sales.json hook');
 assert.equal((await fixturePage.locator('[data-tech-journey-step="questions"] li').first().innerText()).trim(),'QA_KANONISK_SPORSMAL_FRA_SALES','Teknologikart bruker sales.json questions');
 await fixture.close();
} catch(error){problems.push(error.stack||String(error));} finally {await browser.close();}
if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}
