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
  assert.equal((await page.locator('#version-label').innerText()).trim(),'0.9.2',label+': versjon');
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
  assert.equal(await page.locator('[data-deck]').count(),3,'Presenter-løp');
  for(const deck of ['intro','sales','technical']) {
   await page.locator('[data-deck="'+deck+'"]').click();
   assert.ok((await page.locator('#slide-body').innerText()).length>15,'Presenter '+deck);
   await page.locator('#slide-next').click();
   assert.ok((await page.locator('#slide-counter').innerText()).startsWith('2 av'),'neste lysbilde '+deck);
  }
  await page.locator('#speaker-toggle').check();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#present-modal').count(),0,'lukke Presenter');
  await page.evaluate(()=>{location.hash='#oversikt'});
  const widthCheck=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,window:innerWidth}));
  assert.ok(widthCheck.scroll<=widthCheck.window+5,label+': horisontal overflyt '+JSON.stringify(widthCheck));
  assert.deepEqual(failures,[],label+': ingen konsoll-/runtimefeil');
  console.log('PASS – '+label+': '+pages.length+' sider, '+details.length+' detaljer, søk, kopiering/tilbakestilling, Presenter, navigasjon og bredde');
  await context.close();
 }
} catch(error){problems.push(error.stack||String(error));} finally {await browser.close();}
if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}
