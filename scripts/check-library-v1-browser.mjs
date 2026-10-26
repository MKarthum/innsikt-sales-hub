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
 assert.equal(await p.locator('.slide-library-card .scene-id,.slide-library-card .slide-placement-number').count(),0,'Independent library cards have no presentation numbers');
 await p.screenshot({path:out+'/library.png',fullPage:false});
 // Detail page is mandatory first step; its actual 16:9 slide opens fullscreen.
 const card=p.locator('.slide-library-card').first();
 const slideId=await card.getAttribute('href').then(h=>h.split('/').at(-1));
 const originalHash=await p.evaluate(()=>location.hash);
 await card.click();
 assert.equal(await p.evaluate(()=>location.hash),'#lysbilder/'+slideId,'Card opens its detailed content page');
 assert.equal(await p.locator('.slide-library-detail-stage .scene-id,.slide-library-detail-stage .slide-placement-number').count(),0,'Independent detail preview has no presentation numbers');
 await p.locator('.slide-library-info').waitFor();
 assert.ok(await p.locator('.slide-library-info h2').count()>=2,'Speaker notes, sources and use remain on detail page');
 const opener=p.locator('[data-slide-preview-open]');
 assert.equal(await opener.getAttribute('data-slide-preview-open'),slideId);
 await opener.click();
 const full=p.locator('#slide-library-fullscreen');
 await full.waitFor();
 assert.equal(await p.evaluate(()=>location.hash),'#lysbilder/'+slideId,'Fullscreen does not change details route');
 assert.equal(await full.locator('.present-frame').getAttribute('data-library-slide-id'),slideId);
 assert.equal(await full.locator('.scene-id,.slide-placement-number').count(),0,'Fullscreen of an independent slide stays unnumbered');
 const geometry=await full.evaluate(el=>{
  const slide=el.querySelector('.slide-library-fullscreen-stage').getBoundingClientRect();
  return {slide:{width:slide.width,height:slide.height,left:slide.left,right:slide.right}};
 });
 assert.ok(Math.abs(geometry.slide.width/geometry.slide.height-16/9)<0.02,'Fullscreen slide retains 16:9 ratio');
 assert.ok(geometry.slide.left>=0&&geometry.slide.right<=1536,'Fullscreen stage fits desktop');
 await full.screenshot({path:out+'/fullscreen-desktop.png'});
 await p.keyboard.press('Escape');
 assert.equal(await full.count(),0,'Escape exits fullscreen');
 assert.equal(await p.evaluate(()=>location.hash),'#lysbilder/'+slideId,'Exit returns to details');
 assert.ok(await opener.evaluate(x=>document.activeElement===x),'Focus returns to detail-page preview');
 // Safari may emit a late compatibility click directed at the exposed preview.
 await opener.evaluate(x=>x.click());
 assert.equal(await full.count(),0,'Late click after Escape must not reopen');
 await p.waitForTimeout(950);
 await opener.focus();
 await p.keyboard.press('Enter');
 await full.waitFor();
 await full.locator('.modal-close').click();
 assert.equal(await full.count(),0,'Explicit close button works');
 await opener.evaluate(x=>x.click());
 assert.equal(await full.count(),0,'Late click after button close does not reopen');
 await p.waitForTimeout(950);
 await p.setViewportSize({width:390,height:844});
 await opener.click();
 await full.waitFor();
 const mobile=await full.evaluate(el=>{
  const body=el.querySelector('.slide-library-fullscreen-stage').getBoundingClientRect();
  const close=el.querySelector('.modal-close').getBoundingClientRect();
  return {stageLeft:body.left,stageRight:body.right,stageWidth:body.width,stageHeight:body.height,
    closeTop:close.top,closeRight:close.right,innerWidth:window.innerWidth};
 });
 assert.ok(mobile.stageLeft>=0&&mobile.stageRight<=mobile.innerWidth+1,'Fullscreen stage fits mobile viewport');
 assert.ok(mobile.closeTop>=0&&mobile.closeRight<=mobile.innerWidth+1,'Exit button fits mobile viewport');
 assert.ok(mobile.closeTop>mobile.stageHeight,'Mobile exit stays below the stage instead of covering slide content');
 assert.ok(Math.abs(mobile.stageWidth/mobile.stageHeight-16/9)<0.02,'Mobile fullscreen slide remains 16:9');
 await full.screenshot({path:out+'/fullscreen-mobile.png'});
 await full.locator('.modal-close').click();
 assert.equal(await full.count(),0,'Mobile close works');
 await p.setViewportSize({width:1536,height:1040});

 // Simulate actual touch gestures and check *after* synthetic clicks have fired.
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const tp=await ctx.newPage();
 tp.on('pageerror',e=>problems.push('Touch JavaScript: '+e.message));
 await tp.goto(process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/',{waitUntil:'networkidle'});
 await tp.evaluate(()=>location.hash='#lysbilder');
 await tp.locator('.slide-library-card').first().tap();
 await tp.locator('.slide-library-info').waitFor();
 const touchOpener=tp.locator('[data-slide-preview-open]');
 await touchOpener.tap();
 const touchFull=tp.locator('#slide-library-fullscreen');await touchFull.waitFor();
 await touchFull.locator('.modal-close').tap();
 await tp.waitForTimeout(150);
 assert.equal(await touchFull.count(),0,'Touch close stays dismissed after compatibility click');
 assert.ok(await tp.locator('.slide-library-info').isVisible(),'Touch returns to details');
 await touchOpener.evaluate(x=>x.click());
 assert.equal(await touchFull.count(),0,'Delayed touch compatibility click does not reopen');
 await tp.waitForTimeout(950);
 await touchOpener.tap();await touchFull.waitFor();
 const frame=await touchFull.locator('.slide-library-fullscreen-stage').boundingBox();
 await tp.touchscreen.tap(frame.x+frame.width/2,frame.y+frame.height/2);
 assert.equal(await touchFull.count(),1,'Tapping slide does not dismiss fullscreen');
 await tp.touchscreen.tap(18,130);
 await tp.waitForTimeout(150);
 assert.equal(await touchFull.count(),0,'Touch outside stays dismissed after synthetic click');
 assert.ok(await tp.locator('.slide-library-info').isVisible(),'Outside tap returns to details');
 await tp.locator('#menu-toggle').tap();
 assert.equal(await tp.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
 await tp.locator('#sidebar-close').tap();
 assert.equal(await tp.locator('#menu-toggle').getAttribute('aria-expanded'),'false','Touch menu exit');
 await ctx.close();
 await p.evaluate(()=>location.hash='#lysbilder');
 await p.locator('.slide-library-card').first().waitFor();
 const typeSeen=new Set();
 for(const s of items){
  await p.evaluate(id=>location.hash='#lysbilder/'+id,s.id);
  await p.locator('.slide-library-detail-stage .present-frame').waitFor();
  await p.waitForFunction(title=>document.querySelector('#main h1')?.textContent?.trim()===title,s.title);
  const stage=p.locator('.slide-library-detail-stage');
  const scene=stage.locator('.story-scene');
  assert.equal(await scene.count(),1,'Custom scene for '+s.id);
   if(s.id==='market-customer-pressure'){
    assert.equal(await stage.locator('.v11-readiness-number').innerText(),'42 %','Survey figure is visible');
    assert.deepEqual(await stage.locator('.v11-readiness-operations li').allInnerTexts(),['Infrastruktur','Data','Risiko','Kompetanse'],'Four qualitative readiness dimensions');
    assert.ok((await stage.locator('.v11-readiness-question').innerText()).includes('Hvor stopper ambisjonene'),'Customer question is visible');
    assert.ok((await stage.locator('.v11-readiness-caveat').innerText()).includes('ikke en diagnose'),'Global caveat is visible');
    assert.equal(await stage.locator('.v5-voice-line').count(),0,'No old three-customer-quote layout');
   }
   if(s.id==='market-priorities'){
    assert.equal(await stage.locator('.v6-priority-row').count(),3,'Priorities retain three illustrative pathways');
   }
   if(s.id==='portal-learning'){
    const rag=JSON.parse(fs.readFileSync('docs/data/learning.json','utf8')).diagrams.find(d=>d.id==='rag');
    assert.ok((await stage.locator('.v10-lookup-question').innerText()).includes('FIKTIVT SPØRSMÅL'),'Fictional seller question is labeled');
    assert.ok((await stage.locator('.v10-lookup-source').innerText()).includes(rag.description),'Lookup uses canonical description');
    assert.deepEqual(await stage.locator('.v10-lookup-takeaways li strong').allInnerTexts(),rag.questions,'Two questions come from canonical RAG diagram');
    assert.ok((await stage.locator('.v10-lookup-boundary').innerText()).includes('DETTE VET VI IKKE'),'Unknowns are visible');
   }
   if(s.id==='sales-questions'){
    assert.ok((await stage.locator('.v12-example').innerText()).includes('FIKTIVT'),'Example is clearly fictional');
    assert.ok((await stage.locator('.v12-pause-answer').innerText()).includes('MULIG KUNDESVAR · FIKTIVT'),'Answer is labeled hypothetical');
    assert.ok((await stage.locator('.v12-pause-insight').innerText()).includes('En godkjenning blir forsinket'),'One consequence is known');
    assert.equal(await stage.locator('.v12-pause-open li').count(),2,'Exactly two unanswered follow-up questions');
    assert.ok((await stage.locator('.v12-pause-guardrail').innerText()).includes('ukjent'),'Cause remains explicitly unknown');
    assert.equal(await stage.locator('.v5-case-questions').count(),0,'No recycled three-card scene');
    const fontSizes=await stage.evaluate(el=>[...el.querySelectorAll('.v12-pause-question h3,.v12-pause-answer blockquote,.v12-pause-open li strong')].map(x=>parseFloat(getComputedStyle(x).fontSize)));
    assert.ok(fontSizes[0]>=20&&fontSizes[1]>=20&&fontSizes.slice(2).every(px=>px>=18),'Guided dialogue readable at canonical 960×540: '+fontSizes);
   }
   if(s.id==='seller-better-questions'){
    assert.equal(await stage.locator('.v9-dialogue-signal blockquote').count(),1,'Fictional customer signal is prominent');
    assert.ok((await stage.locator('.v9-dialogue-signal').innerText()).includes('FIKTIVT EKSEMPEL'),'Fictional label is visible');
    assert.equal(await stage.locator('.v9-dialogue-rows li').count(),3,'Three question/answer/inference rows');
    assert.equal(await stage.locator('.v9-dialogue-rows li section').count(),9,'Each row keeps the three semantic roles');
    assert.ok((await stage.locator('.v9-dialogue-next').innerText()).includes('Årsak og løsning er fortsatt ukjent'),'Next action retains uncertainty');
    assert.ok((await stage.locator('.v9-dialogue-next').innerText()).includes('prosesseier og dataansvarlig'),'Next step is a bounded investigation');
   }
   if(s.id==='ai-improve-data'){
    assert.ok((await stage.locator('.v13-quality-example').innerText()).includes('FIKTIVT'),'Quality example is explicitly fictional');
    assert.equal(await stage.locator('.v13-quality-observation tbody tr').count(),2,'Exactly two illustrative registrations');
    assert.deepEqual(await stage.locator('.v13-quality-observation tbody td').allInnerTexts(),['Fakturafeil A','Kundeservice','Fakturafeil B','Økonomi'],'Labels are illustrative and consistent');
    assert.ok((await stage.locator('.v13-quality-proposal blockquote').innerText()).endsWith('?'),'KI asks a question, not an automatic decision');
    assert.ok((await stage.locator('.v13-quality-review').innerText()).includes('FAGANSVARLIG VERIFISERER'),'Human control is visible');
    assert.ok((await stage.locator('.v13-quality-result').innerText()).includes('BARE ETTER GODKJENT ENDRING'),'Outcome is conditional');
    assert.ok((await stage.locator('.v13-quality-caveat').innerText()).includes(s.visual.guardrail),'Caveat comes from the canonical slide content, not a copied test phrase');
    assert.equal(await stage.locator('.scene-loop').count(),0,'Generic two-circle loop was replaced');
   }
   if(s.id==='ai-pragmatic'){
    assert.equal(await stage.locator('.v14-pilot-steps li').count(),3,'Three distinct stages');
    assert.ok((await stage.locator('.v14-pilot-context').innerText()).includes('FIKTIVT'),'Illustrative scenario');
    assert.ok((await stage.locator('.v14-pilot-steps li').nth(0).innerText()).includes('dagens arbeid'),'Baseline first');
    assert.ok((await stage.locator('.v14-pilot-steps li').nth(1).innerText()).includes('ansatte avgjør'),'Human decides');
    assert.ok((await stage.locator('.v14-pilot-steps li').nth(2).innerText()).includes('Sammenlign og juster'),'Decision after test');
    const proof=await stage.locator('.v14-pilot-evidence').innerText();
    assert.ok(proof.includes('Riktig team')&&proof.includes('Tidsbruk'),'Quality and time are measured');
    assert.ok(proof.includes('menneskelig beslutning'),'No autonomous routing');
    assert.equal(await stage.locator('.v8-compare-option').count(),0,'Dense comparison is no longer used');
   }
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
  assert.equal(await stage.locator('.scene-id,.slide-placement-number').count(),0,'Preview must not derive placement from the first story: '+s.id);
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
