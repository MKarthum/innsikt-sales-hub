/* Reelle Chromium-røykprøver for beta. Kjør etter at lokal HTTP-server er startet. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base=process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/';
const pages=['oversikt','guide','forretning','muligheter','kundedialog','marked','kompetanse','arkitektur','teknologi','ai','bransje','verktoy','kilder','utvikling','prompter','horisont'];
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
  assert.equal((await page.locator('#version-label').innerText()).trim(),'0.9.4',label+': versjon');
  for (const route of [...pages,...details]) {
   await page.evaluate(id=>{location.hash='#'+id},route);
   await page.waitForFunction(id=>location.hash==='#'+id,route);
   await page.locator('#main h1, #main h2').first().waitFor();
   const html=await page.locator('#main').innerHTML();
   assert.ok(html.length>120,label+': tom visning '+route);
   assert.ok(!html.includes('Kunne ikke laste nettsidens data'),label+': feilside '+route);
   assert.ok(!/\$\{[^{}]+\}/.test(html),label+': rå uttrykk '+route);
  }
  if(label==='mobil') {
   await page.locator('#menu-toggle').click();
   assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true','mobilmeny åpner');
   await page.locator('#menu-toggle').click();
  }
  await page.evaluate(()=>{location.hash='#prompter/account-research'});
  await page.locator('#prompt-editor').waitFor();
  const original=await page.locator('#prompt-editor').inputValue();
  assert.ok(original.includes('Bruk bare offentlig tilgjengelige'),'felles kildeinstruks i redigerbar prompt');
  await page.locator('#prompt-editor').fill('MIDLERTIDIG TEST');
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
  await page.locator('#search-button').click();
  await page.locator('#search-input').fill('dataplattform');
  assert.ok(await page.locator('.result-item').count()>0,'søk på begrep');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#search-input').count(),0,'lukke søk');
  await page.locator('#present-button').click();
  assert.equal(await page.locator('[data-deck]').count(),4,'Presenter-løp');
  assert.ok((await page.locator('#slide-body').innerText()).includes('Innsikt – fra markedssignal'),'demonstrasjonsløp er startpunkt');
  for(const deck of ['portal','intro','sales','technical']) {
   await page.locator('[data-deck="'+deck+'"]').click();
   assert.ok((await page.locator('#slide-body').innerText()).length>15,'Presenter '+deck);
   await page.locator('#slide-next').click();
   assert.ok((await page.locator('#slide-counter').innerText()).startsWith('2 av'),'neste lysbilde '+deck);
  }
  // Alle lysbilder beholder samme 16:9-flate på hver skjermstørrelse.
  for(const deck of ['portal','intro','sales','technical']){
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
   if(deck==='sales'||deck==='technical'){
    const prompt=page.locator('[data-deck-prompt]');
    await prompt.waitFor();
    await prompt.click();
    const copiedPrompt=await page.evaluate(()=>navigator.clipboard.readText());
    assert.ok(copiedPrompt.includes('Målgruppe: [MÅLGRUPPE]'),label+': kanonisk presentasjonsprompt '+deck);
   }
  }
  await page.locator('[data-deck="portal"]').click();
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#deck-download').click();
  const download=await downloadPromise;
  assert.ok(download.suggestedFilename().includes('0.9.4')&&download.suggestedFilename().endsWith('.html'),'versjonert nedlastbar presentasjon');
  const exported=(await import('node:fs')).readFileSync(await download.path(),'utf8');
  assert.ok(exported.includes('Innsikt – fra markedssignal')&&exported.includes('Skriv ut / PDF'),'selvstendig HTML-presentasjon');
  assert.equal((exported.match(/class="present-frame present-rich export-slide"/g)||[]).length,7,'alle portal-slides er eksportert');
  const popupPromise=context.waitForEvent('page');
  await page.locator('#deck-print').click();
  const printed=await popupPromise;
  await printed.waitForFunction(()=>document.querySelectorAll('.export-slide').length===7);
  assert.ok((await printed.locator('#export-print').count())===1,'utskriftsvisning har PDF-knapp');
  await printed.close();
  await page.locator('#speaker-toggle').check();
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
  await page.locator('#prompt-editor').waitFor();
  assert.equal(await page.locator('#prompt-editor .glossary-trigger').count(),0,label+': redigerbare prompter urørt');
  await page.evaluate(()=>{location.hash='#oversikt'});
  const widthCheck=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,window:innerWidth}));
  assert.ok(widthCheck.scroll<=widthCheck.window+5,label+': horisontal overflyt '+JSON.stringify(widthCheck));
  assert.deepEqual(failures,[],label+': ingen konsoll-/runtimefeil');
  console.log('PASS – '+label+': '+pages.length+' sider, '+details.length+' detaljer, søk, kopiering/tilbakestilling, Presenter, navigasjon og bredde');
  await context.close();
 }
} catch(error){problems.push(error.stack||String(error));} finally {await browser.close();}
if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}
