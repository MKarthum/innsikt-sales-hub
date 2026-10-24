/* Representative visual regression checks drawn from the curated main story; full library is tested separately. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const output='artifacts/visual-pilot';
const library=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const decks=JSON.parse(fs.readFileSync('docs/data/pages.json','utf8')).presentationDecks;
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1536,height:940}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto(process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/',{waitUntil:'networkidle'});
 await page.evaluate(()=>{location.hash='#lysbilder'});
 await page.locator('.slide-library-card').first().waitFor();
 assert.equal(await page.locator('.slide-library-card').count(),library.length,'Alle selvstendige lysbilder');
 await page.screenshot({path:output+'/library-desktop.png',fullPage:false});
 await page.locator('[data-slide-filter="topic"]').selectOption('KI og kapasitet');
 assert.equal(await page.locator('.slide-library-card').count(),4,'Temafilter');
 await page.locator('[data-slide-filter="topic"]').selectOption('all');
 await page.locator('[data-slide-scope="shared"]').click();
 assert.equal(await page.locator('.slide-library-card').count(),library.filter(s=>s.scope==='shared').length,'Delbare slides');
 await page.locator('[data-slide-scope="story"]').click();
 assert.equal(await page.locator('.slide-library-card').count(),library.filter(s=>s.scope==='story').length,'Historiespesifikke slides');
 await page.locator('[data-slide-reset]').click();
 await page.locator('[data-slide-filter="story"]').selectOption('innsikt');
 assert.equal(await page.locator('.slide-library-card').count(),decks.innsikt.slides.length,'Historiefilter');
 await page.locator('[data-slide-reset]').click();
 await page.locator('[data-slide-search]').fill('analytikere');
 assert.ok(await page.locator('.slide-library-card').count()>0,'Tekstsøk');
 await page.locator('[data-slide-reset]').click();
 await page.locator('#present-button').click();
 await page.locator('[data-deck="innsikt"]').click();
 for(let index=1;index<=3;index++){
  const slide=page.locator('#slide-body');
  await slide.locator('.story-scene').waitFor();
  const metrics=await slide.evaluate(el=>{
   const box=el.getBoundingClientRect();
   return {width:box.width,height:box.height,overflowX:el.scrollWidth-el.clientWidth,overflowY:el.scrollHeight-el.clientHeight,
     title:el.querySelector('.story-scene')?.textContent?.slice(0,100)};
  });
  assert.ok(Math.abs(metrics.width/metrics.height-16/9)<.02,'Stabilt format '+index);
  assert.ok(metrics.overflowX<=3&&metrics.overflowY<=3,'Ingen avklipping '+index+': '+JSON.stringify(metrics));
  const artwork=await slide.locator('.scene-analysts-figure, .v5-capacity-layout, .v4-bridge-visual, .scene-duality-graph').first().evaluate(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height}});
  assert.ok(artwork.width>150&&artwork.height>100,'Illustrasjonen må være synlig og stor: '+index+' '+JSON.stringify(artwork));
  await slide.screenshot({path:output+'/slide-'+index+'.png'});
  if(index<3)await page.locator('#slide-next').click();
 }
 await page.keyboard.press('Escape');
 await page.evaluate(()=>location.hash='#lysbilder/ai-thousand-analysts');
 await page.locator('.slide-library-detail-stage .story-scene').waitFor();
 await page.locator('.slide-library-detail-stage').screenshot({path:output+'/slide-detail.png'});
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(350); // Let sidebar transition settle before capture.
 await page.evaluate(()=>location.hash='#lysbilder');
 await page.locator('.slide-library-card').first().waitFor();
 await page.screenshot({path:output+'/library-mobile.png',fullPage:false});
 assert.deepEqual(errors,[],'Feilfri Javascript-konsoll');
 console.log('PASS – bibliotekfiltre, tre visuelt renderte slides og mobilvisning');
}finally{await browser.close()}
