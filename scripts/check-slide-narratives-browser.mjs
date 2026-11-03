import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const BASE=process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/';
const items=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const cases=[
 ['ai-two-directions','amplifier-flow','.scene-amplifier','.scene-editorial-outcomes',2],
 ['ai-good-vs-fast','editorial-equation','.v15-equation-layout','.v2-contrast-grid',2],
 ['ai-two-extremes','editorial-balance','.v15-balance-layout','.v2-contrast-grid',2],
 ['portal-market','editorial-relation','.v15-relation-stage','.v5-truths-layout',2],
 ['market-why-now','editorial-relation','.v15-relation-stage','.v5-truths-layout',2],
 ['portal-three-ways','editorial-choices','.v15-choices-options','.v4-list-grid',3],
 ['portal-customer-signal','editorial-journey','.v15-journey-track','.v4-list-grid',3]
];
for(const [id,variant] of cases){
 const slide=items.find(s=>s.id===id);
 assert.ok(slide,'Missing redesigned slide '+id);
 assert.equal(slide.visual.variant,variant,id+' must select its real composition from canonical JSON');
}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1400,height:900},acceptDownloads:true});
 const failures=[];page.on('pageerror',e=>failures.push(e.message));
 for(const [id,variant,selector,old,count] of cases){
  await page.goto(BASE+'#lysbilder/'+id,{waitUntil:'networkidle'});
  const scene=page.locator('.slide-library-detail-stage .story-scene');
  await scene.waitFor();
  assert.equal(await page.locator('.slide-library-detail-stage '+selector).count(),1,id+' has substantive visual structure');
  assert.equal(await scene.locator(old).count(),0,id+' has removed the old card structure');
  const slide=items.find(s=>s.id===id);
  if(id==='ai-two-directions'){
   assert.equal(await scene.locator('.scene-amplifier-input').count(),count);
   assert.equal(await scene.locator('.scene-amplifier-result').count(),count);
   assert.equal(await scene.locator('.scene-amplifier-track').count(),count);
   for(const side of ['positiveInput','positiveInputDetail','negativeInput','negativeInputDetail','positive','negative','takeaway']){
    assert.ok((await scene.innerText()).includes(slide.visual[side]),'All narrative copy must come from JSON: '+side);
   }
  }
  if(id==='portal-three-ways')assert.equal(await scene.locator('.v15-choices-options li').count(),count);
  if(id==='portal-customer-signal')assert.equal(await scene.locator('.v15-journey-step').count(),count);
  if(variant==='editorial-relation')assert.equal(await scene.locator('.v15-relation-idea').count(),count);
  for(const tone of ['strong','light']){
   await page.locator('#library-tone-mode').selectOption(tone);
   const g=await scene.evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {ratio:r.width/r.height,excessX:el.scrollWidth-el.clientWidth,excessY:el.scrollHeight-el.clientHeight,
      accent:getComputedStyle(el.querySelector('.scene-eyebrow'),'::before').backgroundColor};
   });
   assert.ok(Math.abs(g.ratio-16/9)<.03,id+'/'+tone+': incorrect aspect ratio');
   assert.ok(g.excessX<=3&&g.excessY<=3,id+'/'+tone+': scene overflows');
  }
 }
 // The three new standalone scenes require a real, data-bound composition in both themes.
 for(const [id,selector,parts,count,term] of [
  ['ai-context-for-agents','.ai-context-scene','.ai-context-factor',3,'question'],
  ['ai-development-workflow','.ai-work-scene','.ai-work-diff code',3,'prompt'],
  ['ai-natural-language-bi','.ai-usage-scene','.ai-usage-bar-col',5,'question']
 ]){
  await page.goto(BASE+'#lysbilder/'+id,{waitUntil:'networkidle'});
  const scene=page.locator('.slide-library-detail-stage '+selector);
  await scene.waitFor();
  assert.equal(await scene.locator(parts).count(),count,id+': semantic scene elements');
  assert.ok((await scene.innerText()).includes(items.find(s=>s.id===id).visual[term]),id+': texts must come from canonical JSON');
  for(const tone of ['light','strong']){
   await page.locator('#library-tone-mode').selectOption(tone);
   const g=await scene.evaluate(el=>({x:el.scrollWidth-el.clientWidth,y:el.scrollHeight-el.clientHeight,ratio:el.clientWidth/el.clientHeight}));
   assert.ok(g.x<=3&&g.y<=3&&Math.abs(g.ratio-16/9)<.03,id+'/'+tone+': no overflow, 16:9');
  }
 }
 // A copy changes only public color roles; the diagram is still intact.
 await page.goto(BASE+'#lysbilder/ai-two-directions',{waitUntil:'networkidle'});
 await page.locator('#library-tone-mode').selectOption('strong');
 const first=await page.locator('.scene-amplifier-track-good').evaluate(el=>getComputedStyle(el).stroke);
 await page.addStyleTag({content:':root{--slide-strong-bg:#292434;--slide-strong-fg:#fffaf4;--slide-strong-muted:#d2cbd7;--slide-strong-accent:#eca94b;--slide-strong-warning:#e78696;}'});
 const next=await page.locator('.scene-amplifier-track-good').evaluate(el=>getComputedStyle(el).stroke);
 const risk=await page.locator('.scene-amplifier-track-risk').evaluate(el=>getComputedStyle(el).stroke);
 assert.notEqual(next,first,'Genuinely structural SVG must recolor with copied skin');
 assert.equal(next,'rgb(236, 169, 75)');
 assert.equal(risk,'rgb(231, 134, 150)');
 // Actual exported image, not just a DOM assertion.
 const [download]=await Promise.all([
  page.waitForEvent('download',{timeout:30000}),
  page.locator('[data-slide-download="png"]').click()
 ]);
 const png=fs.readFileSync(await download.path());
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),1920);
 assert.equal(png.readUInt32BE(20),1080);
 assert.ok(png.length>60000,'Exported image must contain substantive artwork');
 // The viewer continues to be an in-flow standalone document (iPhone).
 await page.goto(BASE+'?fullslide=ai-two-directions',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.scene-amplifier').count(),1,'Standalone browser document shares renderer');
 assert.equal(await page.locator('.slide-fullscreen-close').evaluate(el=>el.tagName),'A');
 await page.locator('.slide-fullscreen-close').click();
 await page.locator('.slide-library-info').waitFor();
 assert.deepEqual(failures,[],'No browser runtime errors');
 console.log('PASS – 7 actual structural redesigns, 16:9, light/dark, copy-specific CSS skin, PNG and standalone viewer');
}finally{await browser.close()}
