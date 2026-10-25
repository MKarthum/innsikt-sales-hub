/* Every library detail route must expose a real parent breadcrumb and valid leaf name. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const library=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const base=process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport});
  await page.goto(base,{waitUntil:'networkidle'});
  for(const slide of library){
   await page.evaluate(id=>location.hash='#lysbilder/'+id,slide.id);
   await page.waitForFunction(id=>
    location.hash==='#lysbilder/'+id
    &&!!document.querySelector('#crumb a[href="#lysbilder"]')
    &&document.querySelector('#crumb [aria-current="page"]')?.textContent?.trim()
      ===document.querySelector('#main h1')?.textContent?.trim(),slide.id);
   const parent=page.locator('#crumb a[href="#lysbilder"]');
   assert.equal((await parent.innerText()).trim(),'Lysbildebibliotek');
   assert.equal(await page.locator('#crumb [aria-current="page"]').count(),1);
   assert.equal((await page.locator('#crumb [aria-current="page"]').innerText()).trim(),slide.title);
   assert.equal(await page.locator('#crumb').getAttribute('aria-current'),null);
  }
  for(const [oldId,newId] of Object.entries(JSON.parse(fs.readFileSync('docs/data/pages.json','utf8')).retiredSlideRedirects||{})){
   await page.evaluate(id=>location.hash='#lysbilder/'+id,oldId);
   await page.waitForFunction(newId=>location.hash==='#lysbilder/'+newId&&!!document.querySelector('#crumb a[href="#lysbilder"]'),newId);
  }
  await page.evaluate(id=>location.hash='#lysbilder/'+id,library[0].id);
  await page.waitForFunction(id=>location.hash==='#lysbilder/'+id&&!!document.querySelector('#crumb a[href="#lysbilder"]'),library[0].id);
  // Navigation must work via real click on both devices, not just hash assignment.
  await page.locator('#crumb a[href="#lysbilder"]').click();
  await page.waitForFunction(()=>location.hash==='#lysbilder'&&document.querySelector('#crumb')?.getAttribute('aria-current')==='page');
  assert.equal(await page.locator('#crumb').getAttribute('aria-current'),'page');
  await page.locator('.breadcrumb-project[href="#oversikt"]').click();
  await page.waitForFunction(()=>location.hash==='#oversikt');
  const named=['#muligheter/rapportering','#forretning/okonomi','#arkitektur/bi','#verktoy/first','#prompter/account-research'];
  for(const route of named){
   await page.evaluate(route=>location.hash=route,route);
   await page.waitForFunction(route=>location.hash===route&&document.querySelector('#crumb a[href="#'+route.split('/')[0].slice(1)+'"]'),route);
   const parent='#'+route.slice(1).split('/')[0];
   assert.equal(await page.locator('#crumb a[href="'+parent+'"]').count(),1,'Parent for '+route);
  }
  // Glossary detail routes use the same breadcrumb, invalid-ID and history contract.
  await page.evaluate(()=>location.hash='#ordliste/dataplattform');
  await page.waitForFunction(()=>location.hash==='#ordliste/dataplattform'&&document.querySelector('#crumb [aria-current="page"]')?.textContent?.trim()==='Dataplattform');
  assert.equal(await page.locator('#crumb a[href="#ordliste"]').count(),1);
  assert.equal(await page.locator('#crumb [aria-current="page"]').count(),1);
  await page.locator('#crumb a[href="#ordliste"]').click();
  await page.waitForFunction(()=>location.hash==='#ordliste'&&document.querySelector('#crumb')?.getAttribute('aria-current')==='page');
  assert.equal(await page.locator('.glossary-item[open]').count(),0);
  await page.evaluate(()=>location.hash='#ordliste/bi');
  await page.waitForFunction(()=>location.hash==='#ordliste/bi'&&document.querySelector('.glossary-item[data-glossary-id="bi"]')?.open);
  await page.goBack();
  await page.waitForFunction(()=>location.hash==='#ordliste');
  await page.goForward();
  await page.waitForFunction(()=>location.hash==='#ordliste/bi'&&document.querySelector('.glossary-item[data-glossary-id="bi"]')?.open);
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(()=>location.hash==='#ordliste/bi'&&document.querySelector('.glossary-item[data-glossary-id="bi"]')?.open);
  await page.evaluate(()=>location.hash='#ordliste/ugyldig-begrep');
  await page.waitForFunction(()=>location.hash==='#ordliste'&&document.querySelector('#crumb')?.getAttribute('aria-current')==='page');
  await page.locator('.breadcrumb-project[href="#oversikt"]').click();
  await page.waitForFunction(()=>location.hash==='#oversikt');
  await page.evaluate(()=>location.hash='#guide');
  await page.waitForFunction(()=>location.hash==='#guide'&&document.querySelector('#main .lesson-story'));
  await page.close();
 }
 console.log('PASS – all '+library.length+' slide breadcrumbs and existing detail families navigate correctly on desktop and mobile');
}finally{await browser.close()}
