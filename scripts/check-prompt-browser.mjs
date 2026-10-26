/* Ekte nettlesertest av promptkontekst, inkludert mobil og lagringsgrenser. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const {label,width,height} of [{label:'desktop',width:1440,height:900},{label:'mobil',width:390,height:844}]){
  const context=await browser.newContext({viewport:{width,height},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  const navigate=async route=>{
   await page.evaluate(r=>{location.hash='#'+r},route);
   await page.waitForFunction(r=>location.hash==='#'+r,route);
   await page.locator('#main h1').first().waitFor();
  };
  // Demoflyt: kanonisk salgsinngang -> behovsprompt -> valgt instruksjon -> eksakt kopiert tekst.
  // Utsagnet er syntetisk; ingen kundedata skal lagres i URL eller sessionStorage.
  const example='Vi bruker mye tid på å samle rapporter i Excel';
  const promptData=await (await page.request.get(base+'data/prompts.json')).json();
  const options=promptData.choiceGroups.needSituation.options;
  const verifyInstruction=options.find(option=>option.id==='verify').instruction;
  const progressInstruction=options.find(option=>option.id==='progress').instruction;
  assert.ok(verifyInstruction&&progressInstruction&&verifyInstruction!==progressInstruction,label+': dataeide valginstruksjoner er forskjellige');
  await page.goto(base+'#muligheter/rapportering',{waitUntil:'networkidle'});
  const discoveryLink=page.locator('#main a[href="#prompter/discovery"]');
  assert.equal(await discoveryLink.count(),1,label+': rapportering har én lenke til behovsprompten');
  await discoveryLink.click();
  await page.locator('[data-context-var="KUNDENS_UTSAGN"]').waitFor();
  assert.equal(new URL(page.url()).hash,'#prompter/discovery',label+': lenken åpner riktig oppgave');
  await page.locator('[data-context-var="KUNDENS_UTSAGN"]').fill(example);
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes(example),label+': anonymisert signal inngår i prompten');
  assert.ok(!(await page.locator('#prompt-editor').inputValue()).includes('[BRANSJE]'),label+': tomt valgfritt felt gir ikke rå plassholder');
  assert.ok(!(await page.locator('#prompt-editor').inputValue()).includes('Bransje:'),label+': tomt bransjefelt gir ikke løs ledetekst');
  await page.locator('[data-prompt-choice="needSituation"][value="verify"]').check();
  const verifyText=await page.locator('#prompt-editor').inputValue();
  assert.ok(verifyText.includes(verifyInstruction),label+': hypotesevalg legger til kanonisk instruksjon');
  assert.ok(verifyText.includes('Ikke anta at kunden trenger'),label+': prompten lover ikke en løsning');
  await page.locator('[data-prompt-copy]').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),verifyText,label+': verify kopieres eksakt fra editor');
  await page.locator('[data-prompt-choice="needSituation"][value="progress"]').check();
  const progressText=await page.locator('#prompt-editor').inputValue();
  assert.ok(progressText.includes(progressInstruction),label+': neste-steg-valget legger til kanonisk instruksjon');
  assert.ok(!progressText.includes(verifyInstruction),label+': forrige instruksjon er fjernet');
  assert.ok(progressText.includes(example),label+': syntetisk signal beholdes ved valgbytte');
  await page.locator('[data-prompt-copy]').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),progressText,label+': progress kopieres eksakt fra editor');
  assert.ok(!page.url().includes(example),label+': fritekst er ikke del av URL');
  const privateStorage=await page.evaluate(()=>sessionStorage.getItem('innsikt-prompt-context-v1')||'');
  assert.ok(!privateStorage.includes('KUNDENS_UTSAGN')&&!privateStorage.includes(example),label+': fritekst er ikke persistert');
  if(label==='desktop'){
   await (await import('node:fs/promises')).mkdir('artifacts/visual-pilot',{recursive:true});
   await page.waitForTimeout(2800); // Kopi-toast skal ikke dekke kontrollene i skjermbildet.
   for(const [w,h] of [[320,700],[390,844],[900,900],[1512,980]]){
    await page.setViewportSize({width:w,height:h});
    await page.waitForTimeout(350); // Mobilmenyen animeres ut når desktopviewporten krympes.
    await page.locator('[data-prompt-choice="needSituation"][value="progress"]').scrollIntoViewIfNeeded();
    const dimensions=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth}));
    // 900px har en kjent eldre toppmeny-overflyt (#26); dokumenter, men ikke blokker prompttesten.
    if(w===900&&dimensions.scrollWidth>dimensions.viewport+2)console.warn('KJENT 900px-overflyt: '+JSON.stringify(dimensions));
    else assert.ok(dimensions.scrollWidth<=dimensions.viewport+2,label+': ingen horisontal overflyt ved '+w+' '+JSON.stringify(dimensions));
    await page.screenshot({path:'artifacts/visual-pilot/prompt-discovery-'+w+'.png'});
   }
   await page.setViewportSize({width,height});
  }
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-context-var="KUNDENS_UTSAGN"]').inputValue(),'',label+': anonymisert fritekst slettes ved reload');
  assert.ok(!page.url().includes(example),label+': URL inneholder aldri syntetisk fritekst');
  await navigate('prompter/account-research');

  await page.locator('#prompt-editor').waitFor({state:'attached'});
  assert.ok(await page.locator('#prompt-preview-lines .prompt-preview-line').count()>=3,label+': synlig instruksjonsoversikt');
  assert.equal(await page.locator('.prompt-live-panel [data-prompt-copy]').count(),0,label+': ingen kopierknapp i forhåndsvisningen');
  assert.equal(await page.locator('#main [data-prompt-copy]').count(),1,label+': bare én kopierknapp');
  assert.equal(await page.locator('.prompt-preview-meta').count(),0,label+': ingen redundant statuslinje');
  assert.ok(await page.locator('.prompt-advanced + .prompt-primary-copy [data-prompt-copy]').count()===1,label+': kopiering ligger etter valg og fulltekst');
  assert.equal(await page.locator('#prompt-advanced').evaluate(el=>el.open),false,label+': avansert redigering kan være lukket');
  assert.equal(await page.locator('.prompt-choice-impact').count(),0,label+': ingen dobbeltforklaringer under radioknapper');
  const guide=page.locator('.prompt-guide-details');
  assert.equal(await guide.count(),1,label+': én samlet veiledning, ikke to separate bokser');
  assert.equal(await guide.evaluate(el=>el.open),false,label+': kvalitetssjekk er progressiv');
  assert.equal(await page.locator('.prompt-side-panel').isVisible(),false,label+': tips skjules inntil de åpnes');
  await guide.locator('summary').click();
  assert.equal(await page.locator('.prompt-side-panel').isVisible(),true,label+': tips kan åpnes');
  assert.ok((await page.locator('.prompt-side-panel').innerText()).includes('Sjekk resultatet'),label+': konkrete kontrollpunkter tilgjengelige');
  assert.equal(await page.locator('.prompt-side-panel').getByText('Når er denne nyttig?').count(),0,label+': headerinformasjonen skal ikke gjentas');
  const positions=await page.evaluate(()=>{
    const preview=document.querySelector('.prompt-live-panel'),guide=document.querySelector('.prompt-guide-details'),side=document.querySelector('.prompt-detail-aside'),main=document.querySelector('.prompt-main-panel');
    const p=preview.getBoundingClientRect(),g=guide.getBoundingClientRect(),s=side.getBoundingClientRect(),m=main.getBoundingClientRect();
    return {position:getComputedStyle(preview).position,overflow:getComputedStyle(document.querySelector('.prompt-preview-lines')).overflowY,guideBelow:g.top>=p.bottom-2,previewBeforeForm:p.top<m.top,guideAndPreviewSameCol:Math.abs(p.left-g.left)<3,rightOfForm:s.left>m.left+30};
  });
  assert.equal(positions.position,'static',label+': forklaringen skal ikke overlappe annet innhold ved scrolling');
  assert.equal(positions.overflow,'visible',label+': ingen sekundær scrollbar i forklaringen');
  assert.equal(positions.guideBelow,true,label+': veiledning skal ligge under forhåndsvisningen');
  if(label==='desktop')assert.equal(positions.guideAndPreviewSameCol,true,label+': én kolonne på desktop');
  if(label==='mobil')assert.equal(positions.previewBeforeForm,true,label+': mobil viser forklaring før valg');
  await guide.locator('summary').click();

  const templateChoice=page.locator('[data-prompt-toggle="organizationTemplates"]');
  const templateSubchoice=page.locator('[data-prompt-format-subchoice]');
  assert.equal(await templateSubchoice.isVisible(),false,label+': firmamaler skjult ved ren tekst');
  assert.equal(await templateChoice.isChecked(),true,label+': firmamaler er forhåndsvalgt før et filformat velges');
  assert.ok(!(await page.locator('#prompt-editor').inputValue()).includes('virksomhetens egne dokument- eller presentasjonsmaler'),label+': ingen skjult firmamalinstruks ved ren tekst');
  assert.ok(!(await page.locator('#prompt-editor').inputValue()).includes('[ANALYSESPØRSMÅL]'),label+': tom valgfri variabel skal ikke stå som plassholder');
  assert.ok(!(await page.locator('#prompt-editor').inputValue()).includes('Spesifikke spørsmål eller prioriteringer:'),label+': tilhørende frase utelates når feltet er tomt');
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('Be kort om den'),label+': manglende selskapsnavn skal etterspørres, ikke oppfinnes');
  await page.locator('[data-context-var="ANALYSESPØRSMÅL"]').fill('Kjente dataplattformvalg');
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('Spesifikke spørsmål eller prioriteringer: Kjente dataplattformvalg'),label+': valgfri frase vises når utfylt');
  await page.locator('[data-context-var="ANALYSESPØRSMÅL"]').fill('');
  assert.ok(!(await page.locator('#prompt-editor').inputValue()).includes('Spesifikke spørsmål eller prioriteringer:'),label+': valgfri frase fjernes ved tømming');


  const cust=page.locator('[data-context-var="KUNDENAVN"]');
  await cust.fill('Eksempelbedriften AS');
  assert.ok(!(await page.locator('#prompt-editor').inputValue()).includes('Be kort om den'),label+': selskapsnavn fjerner behovet for avklaringsspørsmål');

  assert.equal(await page.locator('#prompt-preview-filled').count(),0,label+': ingen overflødig feltteller');

  await page.locator('[data-context-var="BRANSJE"]').fill('Energi');
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('Eksempelbedriften AS'),label+': prompt utfylt');
  await navigate('prompter/meeting-prep');
  await page.locator('[data-context-var="KUNDENAVN"]').waitFor();
  assert.equal(await page.locator('[data-context-var="KUNDENAVN"]').inputValue(),'Eksempelbedriften AS',label+': alias brukt');
  await page.locator('[data-context-var="MØTEFORMÅL"]').fill('Utforske muligheter');
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('Utforske muligheter'),label+': felles mål');
  await page.locator('#prompt-advanced summary').click();
  await page.locator('#prompt-editor').fill('Min manuelle tilpasning');
  assert.equal(await page.locator('#prompt-preview-dirty').isVisible(),true,label+': bruker ser at valgene ikke overstyrer manuell tekst');

  await page.locator('[data-context-var="KUNDENAVN"]').fill('Byttet navn');
  assert.equal(await page.locator('#prompt-editor').inputValue(),'Min manuelle tilpasning',label+': fritekst beholdes');
  assert.ok((await page.locator('#prompt-editor-status').innerText()).includes('manuelt redigert'),label+': tydelig status');
  page.once('dialog',d=>d.accept());
  await page.locator('[data-prompt-reset]').click();
  assert.equal(await page.locator('#prompt-preview-dirty').isVisible(),false,label+': reset kobler valgene til editoren igjen');

  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('Byttet navn'),label+': gjenoppbygg');
  await page.locator('[data-prompt-copy]').click();
  const copied=await page.evaluate(()=>navigator.clipboard.readText());
  assert.ok(copied.includes('Byttet navn'),label+': kopiering bruker aktive variabler');
  await navigate('prompter/contact-prep');
  await page.locator('#prompt-editor').waitFor({state:'attached'});
  assert.equal(await page.locator('[data-prompt-choice="contactSituation"][value="first"]').isChecked(),true,label+': riktig standardkontakt');
  await page.locator('[data-prompt-choice="contactSituation"][value="referral"]').check();
  await page.locator('[data-prompt-choice="contactChannel"][value="email"]').check();
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('faktisk introduksjon'),label+': situasjon endrer prompt');
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('e-postutkast'),label+': kanal endrer prompt');
  await page.locator('[data-prompt-choice="depth"][value="deep"]').check();
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('grundig, strukturert'),label+': dybde endrer prompt');
  assert.equal(await page.locator('[data-prompt-choice="format"][value="slides"]').count(),0,label+': irrelevant presentasjonsformat er ikke tilgjengelig');
  await page.locator('[data-prompt-toggle="handoff"]').uncheck();
  assert.ok(!(await page.locator('#prompt-editor').inputValue()).includes('KONTEKST TIL NESTE PROMPT'),label+': valgfri overlevering');
  await page.locator('[data-prompt-toggle="handoff"]').check();
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('KONTEKST TIL NESTE PROMPT'),label+': overlevering aktivert');
  await page.locator('.prompt-context-more summary').click();
  await page.locator('[data-context-var="KUNDEKONTEKST"]').fill('Offentlig signal: valgt Snowflake.');
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('valgt Snowflake'),label+': felles kontekst følger prompt');
  await navigate('prompter/account-research');
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('valgt Snowflake'),label+': kontekst gjenbrukes i neste prompt');
  await page.locator('[data-prompt-choice="researchFocus"][value="technology"]').check();
  assert.ok((await page.locator('#prompt-preview-lines').innerText()).includes('Teknologi og KI'),label+': forhåndsvisningen reagerer direkte på valg');
  assert.ok((await page.locator('#prompt-preview-lines').innerText()).includes('dataplattformer'),label+': bare samlet forklaring reagerer på valget');

  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('dataplattformer'),label+': bransjefokus endrer analyse');
  await page.locator('[data-prompt-choice="format"][value="slides"]').check();
  assert.equal(await templateSubchoice.isVisible(),true,label+': firmamaler vises bare etter valg av filformat');
  assert.equal(await templateChoice.isChecked(),true,label+': firmamaler er på som standard');
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('virksomhetens egne dokument- eller presentasjonsmaler'),label+': dokumentformat ber om organisasjonens tilgjengelige maler');
  await templateChoice.uncheck();
  assert.ok(!(await page.locator('#prompt-editor').inputValue()).includes('virksomhetens egne dokument- eller presentasjonsmaler'),label+': teksten fjernes når firmamaler skrus av');
  await page.locator('[data-prompt-choice="format"][value="markdown"]').check();
  assert.equal(await templateSubchoice.isVisible(),false,label+': firmamalvalget forsvinner ved Markdown');
  assert.ok(!(await page.locator('#prompt-editor').inputValue()).includes('virksomhetens egne dokument- eller presentasjonsmaler'),label+': ingen malinstruks ved Markdown');
  await page.locator('[data-prompt-choice="format"][value="pdf"]').check();
  assert.equal(await templateSubchoice.isVisible(),true,label+': firmamaler gjelder også PDF');
  assert.equal(await templateChoice.isChecked(),false,label+': bevisst avhaking bevares');
  await templateChoice.check();
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('virksomhetens egne dokument- eller presentasjonsmaler'),label+': avhuking legger instruksen til igjen');
  await page.locator('[data-prompt-choice="format"][value="word"]').check();
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('virksomhetens egne dokument- eller presentasjonsmaler'),label+': firmamaler gjelder også Word');
  await page.locator('[data-prompt-choice="format"][value="slides"]').check();
  assert.equal((await page.locator('#prompt-preview-lines').innerText()).includes('Bruk firmamaler'),false,label+': diskret firmamalvalg dobbelvises ikke i forhåndsvisningen');

  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('presentasjonsdisposisjon'),label+': presentasjon er outputvalg');
  await page.locator('[data-prompt-toggle="context"]').uncheck();
  assert.ok(!(await page.locator('#prompt-editor').inputValue()).includes('valgt Snowflake'),label+': kontekst kan slås av');
  await page.locator('[data-prompt-toggle="context"]').check();
  await page.locator('[data-prompt-copy]').click();
  assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).includes('valgt Snowflake'),label+': valgt kontekst følger kopiert prompt');
  const storedContext=await page.evaluate(()=>sessionStorage.getItem('innsikt-prompt-context-v1'));
  assert.ok(!storedContext.includes('KUNDEKONTEKST'),label+': lang kontekst blir i minnet');
  await navigate('prompter');
  assert.equal(await page.locator('.prompt-more-tasks').count(),1,label+': avanserte oppgaver er tilgjengelige uten å dominere');
  await page.locator('.prompt-more-tasks summary').click();
  assert.ok(await page.locator('.prompt-more-tasks .prompt-card').count()>3,label+': andre oppgaver vises ved behov');
  // CV-vurdering skal være kritisk og kompakt uten ekstra felt før CV-utkast velges.
  assert.equal(await page.locator('.prompt-primary .prompt-card[href="#prompter/cv-request-match"]').count(),1,label+': CV-vurdering er en av de sentrale oppgavene');
  await navigate('prompter/cv-request-match');
  await page.locator('#prompt-editor').waitFor({state:'attached'});
  assert.equal(await page.locator('[data-prompt-choice="cvDeliverable"][value="review"]').isChecked(),true,label+': kritisk vurdering som standard');
  assert.equal(await page.locator('[data-prompt-toggle="handoff"]').isChecked(),false,label+': ingen ekstra konteksthale på CV-vurdering som standard');
  assert.equal(await page.locator('[data-prompt-choice="format"]').count(),4,label+': begge modus formater finnes i DOM');
  assert.equal(await page.locator('[data-prompt-cv-options]').isVisible(),false,label+': ingen CV-produksjonsvalg ved ren analyse');
  assert.equal(await page.locator('[data-prompt-choice="format"][value="plain"]').isChecked(),true,label+': kort ren tekst som standard');
  assert.equal(await page.locator('[data-prompt-choice="format"][value="word"]').isVisible(),false,label+': Word skjult inntil utkast velges');
  assert.equal(await page.locator('[data-context-var="CV_KONSULENTNAVN"]').count(),1,label+': oppslag via konsulentnavn er valgfritt');
  assert.equal(await page.locator('[data-context-var="CV_FORESPØRSEL"]').count(),1,label+': forespørsel kan også limes inn');
  await page.locator('[data-context-var="CV_KONSULENTNAVN"]').fill('Eksempelkonsulent');
  await page.locator('[data-context-var="CV_FORESPØRSEL"]').fill('Anonymisert behov: Azure DevOps og datakvalitet');
  let content=await page.locator('#prompt-editor').inputValue();
  assert.ok(content.includes('Eksempelkonsulent')&&content.includes('Azure DevOps'),label+': kildehenvisning og oppgave tekst følger prompten');
  assert.ok(content.includes('ikke bør foreslås'),label+': CV-vurderingen kan fraråde innsending');
  assert.ok(!content.includes('målrettet CV-utkast'),label+': ren vurdering skal ikke produsere CV');
  await page.locator('[data-prompt-choice="cvDeliverable"][value="draft"]').check();
  assert.equal(await page.locator('[data-prompt-cv-options]').isVisible(),true,label+': CV-lengde og kundemal vises bare når nødvendig');
  assert.equal(await page.locator('[data-prompt-choice="format"][value="word"]').isChecked(),true,label+': Word velges automatisk for CV-utkast');
  assert.equal(await page.locator('[data-prompt-choice="format"][value="plain"]').isVisible(),false,label+': ren tekst er ikke CV-filformat');
  await page.locator('[data-prompt-choice="cvLength"][value="short"]').check();
  content=await page.locator('#prompt-editor').inputValue();
  assert.ok(content.includes('2–3 sider'),label+': ønsket CV-lengde må påvirke prompten');
  assert.ok(content.includes('redigerbart, målrettet CV-utkast'),label+': CV-valget må inkludere storytelling');
  const template=page.locator('[data-prompt-toggle="clientTemplate"]');
  const company=page.locator('[data-prompt-format-subchoice]');
  assert.equal(await template.isChecked(),false,label+': spesifikk kundemal er av som default');
  assert.equal(await company.isVisible(),true,label+': firmamal kan brukes uten krav om kundemal');
  await template.check();
  assert.equal(await company.isVisible(),false,label+': kundens påkrevde mal overstyrer firmamal');
  content=await page.locator('#prompt-editor').inputValue();
  assert.ok(content.includes('Kunden har en påkrevd CV-mal'),label+': kundemal eksplisitt med vedleggskrav');
  assert.ok(!content.includes('virksomhetens egne dokument- eller presentasjonsmaler'),label+': ingen motstridende malinstruksjoner');
  await page.locator('[data-prompt-copy]').click();
  const exported=await page.evaluate(()=>navigator.clipboard.readText());
  assert.ok(exported.includes('Kunden har en påkrevd CV-mal')&&exported.includes('2–3 sider'),label+': kopiert prompt inneholder de valgte CV-kravene');
  await page.locator('[data-prompt-choice="format"][value="pdf"]').check();
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('Opprett PDF-filen'),label+': PDF CV kan velges');
  await template.uncheck();
  assert.equal(await company.isVisible(),true,label+': firmamal dukker opp igjen når kundemal deaktiveres');
  assert.ok(!(await page.locator('#prompt-editor').inputValue()).includes('Kunden har en påkrevd CV-mal'),label+': avhaking fjerner kundemaltekst');
  await page.locator('[data-prompt-choice="cvDeliverable"][value="review"]').check();
  assert.equal(await page.locator('[data-prompt-cv-options]').isVisible(),false,label+': tilleggsvalg skjules ved vurdering');
  assert.equal(await page.locator('[data-prompt-choice="format"][value="plain"]').isChecked(),true,label+': format går tilbake til tekst');
  assert.equal(await company.isVisible(),false,label+': firmamaler skjules ved analyse');
  content=await page.locator('#prompt-editor').inputValue();
  assert.ok(!content.includes('Kunden har en påkrevd CV-mal')&&!content.includes('2–3 sider'),label+': CV-produksjon forsvinner helt fra analysen');
  const storedCandidate=await page.evaluate(()=>sessionStorage.getItem('innsikt-prompt-context-v1')||'');
  assert.ok(!storedCandidate.includes('CV_KONSULENTNAVN')&&!storedCandidate.includes('CV_FORESPØRSEL'),label+': konsulentnavn og forespørsel er bare i minnet');
  await navigate('prompter');
  await navigate('prompter/followup');
  await page.locator('[data-prompt-choice="followupChannel"][value="phone"]').check();
  assert.ok((await page.locator('#prompt-preview-lines').innerText()).includes('Telefon'),label+': oppfølging kan være telefon');
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('muntlig samtaleåpning'),label+': kanalvalg endrer oppfølging');
  await navigate('prompter/discovery');
  await page.locator('[data-context-var="KUNDENS_UTSAGN"]').fill('Kun anonymisert testtekst');
  const stored=await page.evaluate(()=>sessionStorage.getItem('innsikt-prompt-context-v1'));
  assert.ok(!stored.includes('KUNDENS_UTSAGN'),label+': fritekst skal ikke persisteres');
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-context-var="KUNDENS_UTSAGN"]').inputValue(),'',label+': memory-only borte etter refresh');
  assert.equal(await page.locator('[data-context-var="BRANSJE"]').inputValue(),'Energi',label+': generisk verdi huskes');
  await navigate('prompter/variabler');
  await page.locator('.prompt-overview-grid').first().waitFor();
  assert.equal(await page.locator('[data-context-var="KUNDENAVN"]').inputValue(),'Byttet navn',label+': redigering fra oversikten');
  assert.equal(await page.locator('.prompt-no-orphans').count(),1,label+': ingen døde variabler');
  await page.evaluate(()=>{
   const key='innsikt-prompt-context-v1';
   const raw=JSON.parse(sessionStorage.getItem(key)||'{}');
   raw.UTGÅTT_ID='Gammel verdi';
   sessionStorage.setItem(key,JSON.stringify(raw));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.prompt-orphans').waitFor();
  assert.ok((await page.locator('.prompt-orphans').innerText()).includes('UTGÅTT_ID'),label+': utgått variabel synlig');
  await page.locator('[data-context-clear="UTGÅTT_ID"]').click();
  assert.equal(await page.locator('.prompt-orphans').count(),0,label+': utgått variabel ryddet');
  await page.locator('[data-context-clear="KUNDENAVN"]').click();
  assert.equal(await page.locator('[data-context-var="KUNDENAVN"]').inputValue(),'',label+': enkeltreset');
  assert.equal(await page.locator('[data-context-var="BRANSJE"]').inputValue(),'Energi',label+': andre verdier beholdes');
  page.once('dialog',d=>d.accept());
  await page.locator('[data-context-clear-all]').click();
  assert.equal(await page.locator('[data-context-var="BRANSJE"]').inputValue(),'',label+': totalreset');
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('innsikt-prompt-context-v1')),null,label+': lagrede data slettet');
  const noOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2);
  assert.ok(noOverflow,label+': ingen horisontal overflyt');
  assert.deepEqual(errors,[],label+': ingen sidefeil');
  await context.close();
 }
 console.log('PASS – nettlesertest desktop/mobil: variabler, alias, kontekst, fritekst, kopiering, oppfriskning, opprydding og nullstilling');
}finally{await browser.close()}
