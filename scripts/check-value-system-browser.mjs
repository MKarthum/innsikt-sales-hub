import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const BASE=process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/';
const slide=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items.find(x=>x.id==='ai-value-in-context');
assert.equal(slide.visual.variant,'editorial-triad');
assert.deepEqual(slide.visual.nodes.map(x=>x.key),['need','data','control']);
assert.ok(slide.visual.nodes.every(n=>n.label&&n.question&&n.icon));
assert.ok(slide.speakerBase.includes('Behovet setter retningen'));
assert.deepEqual(slide.sourceIds,[],'Conceptual slide has no quantitative claims');

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const viewport of [{width:1440,height:900,label:'desktop'},{width:390,height:844,label:'mobile'}]){
  const page=await browser.newPage({viewport,acceptDownloads:true});
  const exceptions=[];
  page.on('pageerror',e=>exceptions.push(e.message));
  await page.goto(BASE+'#lysbilder/ai-value-in-context',{waitUntil:'networkidle'});
  const scene=page.locator('.slide-library-detail-stage .scene-system-editorial');
  await scene.waitFor();
  assert.equal(await scene.locator('.scene-value-node').count(),3);
  assert.equal(await scene.locator('.scene-value-core').innerText(),'VERDI I PRAKSIS');
  assert.equal(await scene.locator('h2').innerText(),slide.title);
  for(const n of slide.visual.nodes){
   const el=scene.locator('.scene-value-node--'+n.key);
   assert.equal(await el.locator('h3').innerText(),n.label);
   assert.equal(await el.locator('p').innerText(),n.question);
  }
  for(const tone of ['strong','light']){
   await page.locator('#library-tone-mode').selectOption(tone);
   const geo=await scene.evaluate(el=>{
    const stage=el.querySelector('.scene-value-stage').getBoundingClientRect();
    const svg=el.querySelector('.scene-value-geometry').getBoundingClientRect();
    const slideRect=el.getBoundingClientRect();
    const text=[...el.querySelectorAll('h2,h3,p,.scene-value-core span')].map(e=>e.getBoundingClientRect());
    return {w:svg.width/stage.width,h:svg.height/stage.height,
      outside:text.filter(r=>r.left<slideRect.left-2||r.right>slideRect.right+2||r.top<slideRect.top-2||r.bottom>slideRect.bottom+2).length,
      accent:getComputedStyle(el.querySelector('.scene-value-orbit')).stroke};
   });
   assert.ok(geo.w>.95&&geo.h>.95,viewport.label+'/'+tone+': diagram fills stage');
   assert.equal(geo.outside,0,viewport.label+'/'+tone+': text clipped');
   assert.notEqual(geo.accent,'none',viewport.label+'/'+tone+': SVG roles missing');
  }
  if(viewport.label==='desktop'){
   await page.locator('#library-tone-mode').selectOption('strong');
   const initial=await scene.locator('.scene-value-orbit').evaluate(e=>getComputedStyle(e).stroke);
   // A copied solution changes only the public CSS roles.
   await page.addStyleTag({content:':root{--slide-strong-bg:#24202f;--slide-strong-fg:#f9f4f2;--slide-strong-muted:#d7cedf;--slide-strong-accent:#db9548;--slide-strong-warning:#c5b7ab;}'});
   const custom=await scene.locator('.scene-value-orbit').evaluate(e=>getComputedStyle(e).stroke);
   assert.notEqual(custom,initial,'SVG must recolor from public CSS skin');
   assert.equal(custom,'rgb(219, 149, 72)');
   assert.equal(await scene.locator('.scene-value-node').count(),3,'Skin must not change data');
   const [download]=await Promise.all([
    page.waitForEvent('download',{timeout:30000}),
    page.locator('.slide-single-download [data-slide-download="png"]').click(),
   ]);
   const bytes=fs.readFileSync(await download.path());
   assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
   assert.equal(bytes.readUInt32BE(16),1920);
   assert.equal(bytes.readUInt32BE(20),1080);
   assert.ok(bytes.length>60000,'Expected high-resolution diagram');
  }
  assert.deepEqual(exceptions,[],viewport.label+' runtime errors');
  await page.close();
 }
 console.log('PASS – triad content, two themes, CSS-only skin override, SVG geometry, mobile bounds and PNG export');
}finally{await browser.close()}
