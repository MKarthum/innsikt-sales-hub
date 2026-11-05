import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
const base=process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/';
const slides=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1360,height:900}});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'});
 const styles=await page.locator('link[rel="stylesheet"]').evaluateAll(els=>els.map(x=>x.href));
 assert.ok(styles.some(x=>x.includes('slide-editorial-system.css')),'Shared editorial styles must load');
 const tested=new Set();
 for(const [idx,s] of slides.entries()){
  await page.evaluate(id=>{location.hash='#lysbilder/'+id},s.id);
  const scene=page.locator('.slide-library-detail-stage .story-scene');
  await scene.waitFor();
  const role=await scene.getAttribute('data-editorial'),focus=await scene.getAttribute('data-design-focus');
  assert.equal(role,s.design.archetype,'Editorial archetype propagated: '+s.id);
  assert.equal(focus,s.design.focus,'Focal role propagated: '+s.id);
  assert.equal(await scene.locator('.scene-eyebrow').count(),1,'Slide eyebrow is present: '+s.id);
  const geometry=await scene.evaluate(el=>{
   const r=el.getBoundingClientRect();
   return {w:r.width,h:r.height,shadow:getComputedStyle(el).boxShadow,
    marker:getComputedStyle(el.querySelector('.scene-eyebrow'),'::before').width,
    excessW:el.scrollWidth-el.clientWidth,excessH:el.scrollHeight-el.clientHeight};
  });
  assert.ok(Math.abs(geometry.w/geometry.h-16/9)<.03,'16:9 slide geometry: '+s.id);
  assert.ok(geometry.shadow.includes('inset'),'Design accent rail should be visible: '+s.id);
  assert.ok(parseFloat(geometry.marker)>=12,'Design signature should be visible: '+s.id);
  assert.ok(geometry.excessW<=3&&geometry.excessH<=3,'No slide clipping: '+s.id);
  tested.add(role);
  if(idx%11===0||s.type==='architecture'&&s.id==='architecture-fabric') {
   await page.locator('#library-tone-mode').selectOption('strong');
   const dark=await scene.evaluate(el=>({accent:getComputedStyle(el).getPropertyValue('--pres-accent').trim(),bg:getComputedStyle(el).getPropertyValue('--pres-bg').trim()}));
   await page.locator('#library-tone-mode').selectOption('light');
   const light=await scene.evaluate(el=>({accent:getComputedStyle(el).getPropertyValue('--pres-accent').trim(),bg:getComputedStyle(el).getPropertyValue('--pres-bg').trim()}));
   assert.notEqual(dark.bg,light.bg,'Light/dark roles are independent: '+s.id);
  }
 }
 assert.equal(tested.size,10,'All ten archetypes rendered');
 // A copied company can replace only public CSS roles; do not touch HTML/JS/JSON.
 await page.evaluate(()=>location.hash='#lysbilder/architecture-modern');
 const sample=page.locator('.slide-library-detail-stage .story-scene');
 await sample.waitFor();
 await page.locator('#library-tone-mode').selectOption('strong');
 const original=await sample.evaluate(el=>getComputedStyle(el.querySelector('.scene-eyebrow'),'::before').backgroundColor);
 await page.addStyleTag({content:':root{--slide-strong-bg:#29232b;--slide-strong-fg:#fffdf7;--slide-strong-muted:#d5c6d0;--slide-strong-accent:#e8ae4c;--slide-strong-warning:#ecae8c;}'});
 const custom=await sample.evaluate(el=>getComputedStyle(el.querySelector('.scene-eyebrow'),'::before').backgroundColor);
 assert.notEqual(original,custom,'CSS-only replacement changes the technical slide');
 assert.equal(custom,'rgb(232, 174, 76)');
 assert.equal(await sample.getAttribute('data-editorial'),'blueprint','Data survives skin override');
 // The illustrated option uses exactly the same slide data and can be switched back.
 await page.evaluate(()=>location.hash='#lysbilder/ai-context-platforms-2027');
 const platform=page.locator('.slide-library-detail-stage .story-scene');await platform.waitFor();
 await page.locator('#library-tone-mode').selectOption('illustrated');
 assert.equal(await platform.getAttribute('data-art-direction'),'illustrated');
 assert.equal(await platform.locator('.cp-landscape-svg').count(),1);
 fs.mkdirSync('artifacts/visual-pilot',{recursive:true});
 await platform.screenshot({path:'artifacts/visual-pilot/context-platforms-illustrated.png'});
 assert.equal(await page.locator('.slide-library-detail-stage .present-frame').getAttribute('data-tone'),'strong');
 const ex=await platform.evaluate(el=>({w:el.scrollWidth-el.clientWidth,h:el.scrollHeight-el.clientHeight}));
 assert.ok(ex.w<=3&&ex.h<=3,'Illustration stays inside slide');
 await page.locator('#library-tone-mode').selectOption('light');
 assert.equal(await platform.getAttribute('data-art-direction'),'standard');
 await platform.screenshot({path:'artifacts/visual-pilot/context-platforms-standard.png'});
 assert.equal(await platform.locator('.cp-core-head h3').textContent(),'Virksomhetskontekst');
 assert.deepEqual(errors,[],'Browser runtime errors');
 console.log('PASS – '+slides.length+' standalone slides with editorial roles, 10 archetypes, mobile-safe 16:9, dark/light and CSS-only company skin');
}finally{await browser.close()}
