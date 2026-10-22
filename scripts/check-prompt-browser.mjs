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
  await page.goto(base+'#prompter/account-research',{waitUntil:'networkidle'});
  await page.locator('#prompt-editor').waitFor();
  const cust=page.locator('[data-context-var="KUNDENAVN"]');
  await cust.fill('Eksempelbedriften AS');
  await page.locator('[data-context-var="BRANSJE"]').fill('Energi');
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('Eksempelbedriften AS'),label+': prompt utfylt');
  await navigate('prompter/meeting-prep');
  await page.locator('[data-context-var="KUNDENAVN"]').waitFor();
  assert.equal(await page.locator('[data-context-var="KUNDENAVN"]').inputValue(),'Eksempelbedriften AS',label+': alias brukt');
  await page.locator('[data-context-var="MØTEFORMÅL"]').fill('Utforske muligheter');
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('Utforske muligheter'),label+': felles mål');
  await page.locator('#prompt-editor').fill('Min manuelle tilpasning');
  await page.locator('[data-context-var="KUNDENAVN"]').fill('Byttet navn');
  assert.equal(await page.locator('#prompt-editor').inputValue(),'Min manuelle tilpasning',label+': fritekst beholdes');
  assert.ok((await page.locator('#prompt-editor-status').innerText()).includes('manuelt redigert'),label+': tydelig status');
  page.once('dialog',d=>d.accept());
  await page.locator('[data-prompt-reset]').click();
  assert.ok((await page.locator('#prompt-editor').inputValue()).includes('Byttet navn'),label+': gjenoppbygg');
  await page.locator('[data-prompt-copy]').click();
  const copied=await page.evaluate(()=>navigator.clipboard.readText());
  assert.ok(copied.includes('Byttet navn'),label+': kopiering bruker aktive variabler');
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
