import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const items=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const stories=JSON.parse(fs.readFileSync('docs/data/pages.json','utf8')).presentationDecks;
const out='artifacts/library-v1';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const problems=[];
try{
 const p=await browser.newPage({viewport:{width:1536,height:1040},deviceScaleFactor:1});
 p.on('pageerror',e=>problems.push('JavaScript: '+e.message));
 await p.goto(process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/',{waitUntil:'networkidle'});
 await p.evaluate(()=>location.hash='#lysbilder');
 await p.locator('.slide-library-card').first().waitFor();
 assert.equal(await p.locator('.slide-library-card').count(),items.length,'Complete library');
 await p.screenshot({path:out+'/library.png',fullPage:false});
 // Clicking a card is a focused, screen-filling preview; the card's link remains
 // available for deep links/new tabs. Closing must preserve filter/scroll state.
 const card=p.locator('.slide-library-card').first();
 const slideId=await card.getAttribute('data-slide-fullscreen-open');
 assert.ok(slideId,'Cards expose stable slide IDs for fullscreen viewing');
 const originalHash=await p.evaluate(()=>location.hash);
 await card.click();
 const full=p.locator('#slide-library-fullscreen');
 await full.waitFor();
 assert.equal(await p.evaluate(()=>location.hash),originalHash,'Opening does not replace the library route');
 assert.equal(await full.locator('.present-frame').getAttribute('data-library-slide-id'),slideId);
 assert.ok(await full.locator('.modal-close').isVisible(),'Exit remains visible');
 const geometry=await full.evaluate(el=>{
  const r=el.getBoundingClientRect(),slide=el.querySelector('.slide-library-fullscreen-stage').getBoundingClientRect();
  return {dialog:{left:r.left,right:r.right,top:r.top,bottom:r.bottom},slide:{width:slide.width,height:slide.height,left:slide.left,right:slide.right}};
 });
 assert.ok(Math.abs(geometry.slide.width/geometry.slide.height-16/9)<0.02,'Fullscreen slide retains 16:9 ratio');
 assert.ok(geometry.slide.left>=0&&geometry.slide.right<=1536,'Fullscreen stage fits desktop');
 await full.screenshot({path:out+'/fullscreen-desktop.png'});
 await p.keyboard.press('Escape');
 await assert.equal(await full.count(),0,'Escape exits fullscreen in one action');
 assert.equal(await p.evaluate(()=>location.hash),originalHash,'Exiting preserves library route');
 assert.ok(await card.evaluate(x=>document.activeElement===x),'Focus returns to the selected card');

 await card.click();
 await full.locator('[data-slide-fullscreen-details]').click();
 await p.locator('.slide-library-detail-stage').waitFor();
 assert.equal(await p.evaluate(()=>location.hash),'#lysbilder/'+slideId,'Details link preserves the existing slide route');
 await p.evaluate(()=>location.hash='#lysbilder');
 await p.locator('.slide-library-card').first().waitFor();

 await p.setViewportSize({width:390,height:844});
 const mobileCard=p.locator('.slide-library-card').first();
 await mobileCard.click();
 await full.waitFor();
 const mobile=await full.evaluate(el=>{
  const body=el.querySelector('.slide-library-fullscreen-stage').getBoundingClientRect();
  const close=el.querySelector('.modal-close').getBoundingClientRect();
  return {stageLeft:body.left,stageRight:body.right,stageWidth:body.width,stageHeight:body.height,
    closeTop:close.top,closeRight:close.right,innerWidth:window.innerWidth};
 });
 assert.ok(mobile.stageLeft>=0&&mobile.stageRight<=mobile.innerWidth+1,'Fullscreen stage fits mobile viewport');
 assert.ok(mobile.closeTop>=0&&mobile.closeRight<=mobile.innerWidth+1,'Exit button fits mobile viewport');
 assert.ok(Math.abs(mobile.stageWidth/mobile.stageHeight-16/9)<0.02,'Mobile fullscreen slide remains 16:9');
 await full.screenshot({path:out+'/fullscreen-mobile.png'});
 await full.locator('.modal-close').click();
 assert.equal(await full.count(),0,'Explicit exit button closes mobile fullscreen');
 assert.ok(await mobileCard.evaluate(x=>document.activeElement===x),'Mobile focus restored');
 await p.setViewportSize({width:1536,height:1040});

 // Simulate real touch events, not mouse-clicks at a mobile viewport size.
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const tp=await ctx.newPage();
 tp.on('pageerror',e=>problems.push('Touch JavaScript: '+e.message));
 await tp.goto(process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/',{waitUntil:'networkidle'});
 await tp.evaluate(()=>location.hash='#lysbilder');
 await tp.locator('.slide-library-card').first().waitFor();
 const touchCard=tp.locator('.slide-library-card').first();
 await touchCard.tap();
 const touchFull=tp.locator('#slide-library-fullscreen');await touchFull.waitFor();
 await touchFull.locator('.modal-close').tap();
 assert.equal(await touchFull.count(),0,'Touch: close button dismisses in one tap');
 await touchCard.tap();await touchFull.waitFor();
 // A touch on the slide itself must never dismiss it.
 const frame=await touchFull.locator('.slide-library-fullscreen-stage').boundingBox();
 await tp.touchscreen.tap(frame.x+frame.width/2,frame.y+frame.height/2);
 assert.equal(await touchFull.count(),1,'Touch: slide remains open on internal tap');
 await tp.touchscreen.tap(18,130);
 assert.equal(await touchFull.count(),0,'Touch: outside tap closes fullscreen');
 await tp.locator('#menu-toggle').tap();
 assert.equal(await tp.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
 await tp.locator('#sidebar-close').tap();
 assert.equal(await tp.locator('#menu-toggle').getAttribute('aria-expanded'),'false','Touch: sidebar exit works');
 await tp.locator('#menu-toggle').tap();
 await tp.touchscreen.tap(370,280);
 assert.equal(await tp.locator('#menu-toggle').getAttribute('aria-expanded'),'false','Touch: backdrop closes sidebar');
 await ctx.close();

 const typeSeen=new Set();
 for(const s of items){
  await p.evaluate(id=>location.hash='#lysbilder/'+id,s.id);
  await p.locator('.slide-library-detail-stage .present-frame').waitFor();
  await p.waitForFunction(title=>document.querySelector('#main h1')?.textContent?.trim()===title,s.title);
  const stage=p.locator('.slide-library-detail-stage');
  const scene=stage.locator('.story-scene');
  assert.equal(await scene.count(),1,'Custom scene for '+s.id);
  const inspect=async()=>stage.evaluate(node=>{
   const root=node.querySelector('.story-scene'),r=root.getBoundingClientRect();
   const matches=[...root.querySelectorAll('h2,h3,p,small,strong')].filter(x=>x.textContent?.trim());
   const outside=[],clip=[];
   for(const el of matches){
    const b=el.getBoundingClientRect();
    if(b.width>0&&b.height>0&&(b.left<r.left-3||b.right>r.right+3||b.top<r.top-3||b.bottom>r.bottom+3))outside.push({text:el.textContent?.slice(0,36),x:b.x,y:b.y,w:b.width,h:b.height});
    if(el.scrollWidth>el.clientWidth+3||el.scrollHeight>el.clientHeight+4)clip.push({text:el.textContent?.slice(0,36),overflowX:el.scrollWidth-el.clientWidth,overflowY:el.scrollHeight-el.clientHeight});
   }
   return {outside,clip,scene:{width:r.width,height:r.height},title:matches[0]?.textContent};
  });
  const audit=await inspect();
  if(audit.outside.length||audit.clip.length)problems.push(s.id+' layout '+JSON.stringify(audit));
  const token=(s.visual?.scene||'visual').replace(/[^a-z]/g,'-');
  const filename=out+'/'+s.id+'.png';
  await stage.screenshot({path:filename});
  // Both palettes are inspected for every single slide, not just scene demos.
  await p.locator('#library-tone-mode').selectOption('strong');
  assert.equal(await stage.locator('.present-frame').getAttribute('data-tone'),'strong');
  const darkAudit=await inspect();
  if(darkAudit.outside.length||darkAudit.clip.length)problems.push(s.id+' dark layout '+JSON.stringify(darkAudit));
  if(['portal-opening','portal-three-ways','sales-questions','ai-thousand-analysts','architecture-snowflake','market-three-forces'].includes(s.id))
   await stage.screenshot({path:out+'/'+s.id+'-dark.png'});
  await p.locator('#library-tone-mode').selectOption('light');

  typeSeen.add(token);
 }
 await p.setViewportSize({width:390,height:844});
 await p.evaluate(()=>location.hash='#lysbilder');
 await p.locator('.slide-library-card').first().waitFor();
 await p.waitForTimeout(400);
 await p.screenshot({path:out+'/library-mobile.png',fullPage:false});
 assert.ok(typeSeen.size>=10,'Sufficient variety of visual scene families');
 console.log('Rendered '+items.length+' slides across '+typeSeen.size+' layout families and '+Object.keys(stories).length+' decks.');
 if(problems.length)throw Error(problems.slice(0,18).join('\n'));
 console.log('PASS – independent slide previews, visible text bounds, responsive library and JS.');
}finally{await browser.close()}
