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
  if(s.id!=='ai-context-platforms-2027')assert.equal(await scene.locator('.scene-eyebrow').count(),1,'Slide eyebrow is present: '+s.id);
  const geometry=await scene.evaluate(el=>{
   const r=el.getBoundingClientRect();
   return {w:r.width,h:r.height,shadow:getComputedStyle(el).boxShadow,
    marker:el.querySelector('.scene-eyebrow')?getComputedStyle(el.querySelector('.scene-eyebrow'),'::before').width:'0',
    excessW:el.scrollWidth-el.clientWidth,excessH:el.scrollHeight-el.clientHeight};
  });
  assert.ok(Math.abs(geometry.w/geometry.h-16/9)<.03,'16:9 slide geometry: '+s.id);
  assert.ok(geometry.shadow.includes('inset'),'Design accent rail should be visible: '+s.id);
  if(s.id!=='ai-context-platforms-2027')assert.ok(parseFloat(geometry.marker)>=12,'Design signature should be visible: '+s.id);
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
 // Same content, three genuinely different representations; no duplicate choices.
 await page.evaluate(()=>location.hash='#lysbilder/ai-context-platforms-2027');
 const platform=page.locator('.slide-library-detail-stage .story-scene');
 await platform.waitFor();
 const selector=page.locator('#library-art-mode');
 assert.deepEqual(await selector.locator('option').evaluateAll(xs=>xs.map(x=>x.value)),['standard','rich','rich-image']);
 await page.locator('#library-tone-mode').selectOption('strong');
 const shots=[];
 for(const style of ['standard','rich','rich-image']){
  await selector.selectOption(style);
  assert.equal(await platform.getAttribute('data-art-direction'),style);
  const screenshot=await platform.screenshot({path:'artifacts/visual-pilot/context-platforms-'+style+'.png'});
  shots.push(screenshot.toString('base64'));
  if(style==='rich'){
   const asset=platform.locator('[data-scene-object="rich-mountain-background"] img');
   await asset.evaluate(img=>img.decode());
   assert.ok(await asset.evaluate(img=>img.naturalWidth>0));
  }
  if(style==='rich-image'){
   const art=platform.locator('img.cp-approved-image');
   await art.evaluate(img=>img.decode());
   assert.equal(await art.evaluate(img=>img.naturalWidth),1600);
  }
 }
 const separations=await page.evaluate(async shots=>{
  const load=async encoded=>{
   const im=new Image();im.src='data:image/png;base64,'+encoded;await im.decode();
   const canvas=document.createElement('canvas');canvas.width=160;canvas.height=90;
   const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0,160,90);
   return ctx.getImageData(0,0,160,90).data;
  };
  const bitmaps=await Promise.all(shots.map(load));
  const distance=(a,b)=>{
   let sum=0,n=0;
   for(let y=8;y<83;y++)for(let x=4;x<156;x++){
    const at=(y*160+x)*4;
    for(let k=0;k<3;k++){sum+=Math.abs(a[at+k]-b[at+k]);n++;}
   }
   return sum/n;
  };
  return [distance(bitmaps[0],bitmaps[1]),distance(bitmaps[0],bitmaps[2]),distance(bitmaps[1],bitmaps[2])];
 },shots);
 assert.ok(separations.every(d=>d>4),'Every selected style must be visibly distinct: '+JSON.stringify(separations));
 await selector.selectOption('standard');
 assert.equal(await platform.locator('.cp-core-head h3').textContent(),'Virksomhetskontekst');
 assert.deepEqual(errors,[],'Browser runtime errors');
 console.log('PASS – '+slides.length+' standalone slides with editorial roles, 10 archetypes, mobile-safe 16:9, dark/light and CSS-only company skin');
}finally{await browser.close()}
