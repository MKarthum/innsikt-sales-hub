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
 // Palette and art direction are separate, and auto makes the rich photo visible.
 await page.locator('#library-tone-mode').selectOption('strong');
 await page.locator('#library-art-mode').selectOption('auto');
 assert.equal(await platform.getAttribute('data-art-direction'),'rich','Auto selects the recommended rich scene');
 assert.equal(await page.locator('#library-tone-mode').inputValue(),'strong');
 assert.equal(await page.locator('#library-art-mode').inputValue(),'auto');
 await page.locator('#library-art-mode').selectOption('illustrated');
 assert.equal(await platform.getAttribute('data-art-direction'),'illustrated');
 assert.equal(await platform.locator('.scene-art-object--asset').count(),8);
 assert.equal(await platform.locator('.scene-art-object--glow').count(),1);
 fs.mkdirSync('artifacts/visual-pilot',{recursive:true});
 await platform.locator('.scene-art-object--asset img').first().evaluate(img=>img.decode());
 await platform.screenshot({path:'artifacts/visual-pilot/context-platforms-illustrated.png'});
 assert.equal(await page.locator('.slide-library-detail-stage .present-frame').getAttribute('data-tone'),'strong');
 const ex=await platform.evaluate(el=>({w:el.scrollWidth-el.clientWidth,h:el.scrollHeight-el.clientHeight}));
 assert.ok(ex.w<=3&&ex.h<=3,'Illustration stays inside slide');
 // The rich scene must have a real, separately loaded photo. No text or semantic connections may change.
 const simpleText=await platform.locator('.cp-diagram').innerText();
 await page.locator('#library-art-mode').selectOption('rich');
 assert.equal(await platform.getAttribute('data-art-direction'),'rich');
 assert.equal(await platform.locator('.cp-cycle-arrow').count(),2,'Both lower process arrows must be present');
 assert.equal(await platform.locator('.cp-feedback-return').count(),1,'Closed feedback path is present');
 const image=platform.locator('[data-scene-object="rich-mountain-background"] img');
 await image.evaluate(img=>img.decode());
 assert.equal(await image.evaluate(img=>img.naturalWidth>0),true,'Rich photo loads');
 assert.equal(await platform.locator('[data-scene-object="rich-mountain-background"]').evaluate(el=>getComputedStyle(el).display),'block');
 assert.equal(await platform.locator('.cp-diagram').innerText(),simpleText,'Factual text is identical in both illustration modes');
 const richScreenshot=await platform.screenshot({path:'artifacts/visual-pilot/context-platforms-rich.png'});
 // A dark palette with Standard art direction must not display the same photo.
 await page.locator('#library-art-mode').selectOption('standard');
 const standardDarkScreenshot=await platform.screenshot({path:'artifacts/visual-pilot/context-platforms-dark-standard.png'});
 await page.locator('#library-art-mode').selectOption('rich');
 assert.equal(await platform.getAttribute('data-art-direction'),'rich','Dark palette must retain rich art');
 // The actual downloaded PNG must match the selected rendering, not just contain some warm pixels.
 const button=page.locator('[data-slide-download="png"][data-slide-download-id="ai-context-platforms-2027"]').first();
 const [download]=await Promise.all([page.waitForEvent('download',{timeout:60000}),button.click()]);
 const exported=fs.readFileSync(await download.path());
 assert.equal(exported.subarray(1,4).toString(),'PNG','Downloaded bytes must be PNG');
 const photo=await page.evaluate(async base64=>{
  const image=new Image();
  image.src='data:image/png;base64,'+base64;
  await image.decode();
  const canvas=document.createElement('canvas');canvas.width=80;canvas.height=45;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,80,45);
  const pixels=ctx.getImageData(0,0,80,45).data;
  let warm=0,variance=0;
  const samples=[];
  for(let y=3;y<35;y+=2)for(let x=64;x<79;x+=2){
   const i=(y*80+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
   if(r>130&&r>g*1.06&&r>b*1.18)warm++;
   samples.push((r+g+b)/3);
  }
  const avg=samples.reduce((a,b)=>a+b,0)/samples.length;
  variance=samples.reduce((a,b)=>a+(b-avg)**2,0)/samples.length;
  return {warm,variance,width:image.width,height:image.height};
 },exported.toString('base64'));
 assert.ok(photo.warm>=8&&photo.variance>350,'Exported PNG lost the scenic image: '+JSON.stringify(photo));
 fs.writeFileSync('artifacts/visual-pilot/context-platforms-downloaded.png',exported);

 // Compare entire decoded screen and exported image (same palette, same art).
 // This catches dropped backgrounds, wrong art direction and stale slide captures.
 const parity=await page.evaluate(async data=>{
  const read=async base64=>{
   const im=new Image();im.src='data:image/png;base64,'+base64;await im.decode();
   const canvas=document.createElement('canvas');canvas.width=160;canvas.height=90;
   const context=canvas.getContext('2d',{willReadFrequently:true});
   context.drawImage(im,0,0,160,90);
   return context.getImageData(0,0,160,90).data;
  };
  const [before,after,plain]=await Promise.all([read(data.before),read(data.after),read(data.plain)]);
  const measure=(a,b,rect)=>{
   let total=0,large=0,count=0;
   for(let y=rect.y;y<rect.y+rect.h;y++)for(let x=rect.x;x<rect.x+rect.w;x++){
    const k=(y*160+x)*4;
    const d=(Math.abs(a[k]-b[k])+Math.abs(a[k+1]-b[k+1])+Math.abs(a[k+2]-b[k+2]))/3;
    total+=d;if(d>64)large++;count++;
   }
   return {mae:total/count,largeFraction:large/count};
  };
  return {
   entire:measure(before,after,{x:4,y:4,w:151,h:82}),
   right:measure(before,after,{x:110,y:5,w:46,h:74}),
   photoDifference:measure(before,plain,{x:120,y:7,w:35,h:52})
  };
 },{before:richScreenshot.toString('base64'),after:exported.toString('base64'),plain:standardDarkScreenshot.toString('base64')});
 assert.ok(parity.photoDifference.mae>22,'Rich illustration visually indistinguishable from standard: '+JSON.stringify(parity));
 assert.ok(parity.entire.mae<38&&parity.right.mae<40&&parity.entire.largeFraction<.27,
  'Export differs visually from the on-screen slide: '+JSON.stringify(parity));
 console.log('PASS – visual export parity '+JSON.stringify(parity));

 const richEx=await platform.evaluate(el=>({w:el.scrollWidth-el.clientWidth,h:el.scrollHeight-el.clientHeight}));
 assert.ok(richEx.w<=3&&richEx.h<=3,'Rich illustration stays inside 16:9');
 await page.locator('#library-art-mode').selectOption('standard');
 assert.equal(await platform.getAttribute('data-art-direction'),'standard');
 await platform.screenshot({path:'artifacts/visual-pilot/context-platforms-standard.png'});
 assert.equal(await platform.locator('.cp-core-head h3').textContent(),'Virksomhetskontekst');
 assert.deepEqual(errors,[],'Browser runtime errors');
 console.log('PASS – '+slides.length+' standalone slides with editorial roles, 10 archetypes, mobile-safe 16:9, dark/light and CSS-only company skin');
}finally{await browser.close()}
