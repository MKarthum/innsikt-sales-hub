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
 assert.equal(await p.evaluate(()=>document.body.classList.contains('slide-fullscreen-view')),false,'Library route is not fullscreen');
 await p.evaluate(()=>location.hash='#oversikt');
 await p.waitForTimeout(150);
 await p.evaluate(()=>location.hash='#lysbilder');
 await p.locator('.slide-library-card').first().waitFor();
 assert.equal(await p.evaluate(()=>document.body.classList.contains('slide-fullscreen-view')),false,'Repeated library route cannot toggle fullscreen on');
 assert.ok(await p.locator('#present-button').isVisible(),'Normal navigation remains available');

 assert.equal(await p.locator('.slide-library-card .scene-id,.slide-library-card .slide-placement-number').count(),0,'Independent library cards have no presentation numbers');
 await p.screenshot({path:out+'/library.png',fullPage:false});
 // Detail page is mandatory first step; its actual 16:9 slide opens fullscreen.
 const card=p.locator('.slide-library-card').first();
 const slideId=await card.getAttribute('href').then(h=>h.split('/').at(-1));
 await card.click();
 assert.equal(await p.evaluate(()=>location.hash),'#lysbilder/'+slideId,'Card opens details');
 const opener=p.locator('[data-slide-preview-open]');
 await p.locator('.slide-library-info').waitFor();
 assert.ok(await p.locator('.slide-library-info').isVisible(),'Speaker notes and sources retained');
 assert.equal(await opener.getAttribute('data-slide-preview-open'),slideId);
 await opener.click();
 const full=p.locator('#slide-library-fullscreen-page');
 await full.waitFor();
 assert.equal(await p.evaluate(()=>new URL(location.href).searchParams.get('fullslide')),slideId,'Fullscreen loads as a separate browser document');
 assert.equal(await p.locator('#overlay-root .overlay').count(),0,'Fullscreen no longer creates a modal overlay');
 assert.ok(await p.evaluate(()=>document.body.classList.contains('slide-fullscreen-view')),'Full page owns fullscreen state');
 assert.equal(await p.locator('body > .overlay').count(),0,'No overlay attached to body');

 assert.ok((await p.locator('.slide-fullscreen-close').getAttribute('href')).endsWith('/#lysbilder/'+slideId),'Close is a full-document navigation link, not hash-only');
 assert.equal(await p.locator('.slide-fullscreen-close').evaluate(el=>el.tagName),'A');
 assert.ok((await p.locator('.slide-fullscreen-close').innerText()).includes('Lukk'));
 assert.equal(await full.locator('.present-frame').getAttribute('data-library-slide-id'),slideId);
 assert.equal(await full.locator('.scene-id,.slide-placement-number').count(),0,'Independent slide stays unnumbered');
 const geometry=await full.evaluate(el=>{
  const slide=el.querySelector('.slide-library-fullscreen-stage').getBoundingClientRect();
  const close=el.querySelector('.slide-fullscreen-close').getBoundingClientRect();
  const fixed=[...el.querySelectorAll('*')].filter(x=>getComputedStyle(x).position==='fixed').length;
  return {slide:{width:slide.width,height:slide.height,left:slide.left,right:slide.right},close:{top:close.top,bottom:close.bottom},fixed};
 });
 assert.equal(geometry.fixed,0,'No fixed-position descendants in fullscreen view');
 assert.ok(Math.abs(geometry.slide.width/geometry.slide.height-16/9)<0.02,'Fullscreen slide retains 16:9 ratio');
 assert.ok(geometry.slide.left>=0&&geometry.slide.right<=1536,'Slide fits desktop');
 await full.screenshot({path:out+'/fullscreen-desktop.png'});
 // Escape navigates to the details page.
 await p.keyboard.press('Escape');
 await full.waitFor({state:'detached'});
 assert.equal(await p.evaluate(()=>location.hash),'#lysbilder/'+slideId);
 await opener.waitFor({state:'visible'});
 assert.ok(await opener.isVisible(),'Escape returns to slide details');
 // Normal click on the native anchor closes, without any handler.
 await opener.focus();await p.keyboard.press('Enter');await full.waitFor();
 await p.evaluate(()=>{
  const a=document.querySelector('.slide-fullscreen-close');
  a.addEventListener('click',e=>e.stopImmediatePropagation(),{capture:true,once:true});
 });
 await p.locator('.slide-fullscreen-close').click();
 await full.waitFor({state:'detached'});
 await p.locator('.slide-library-info').waitFor();
 assert.ok(await opener.isVisible(),'Native close works when JS bubbling is disabled');
 await p.setViewportSize({width:390,height:844});
 await opener.click();await full.waitFor();
 const mobile=await full.evaluate(el=>{
  const frame=el.querySelector('.slide-library-fullscreen-stage').getBoundingClientRect();
  const close=el.querySelector('.slide-fullscreen-close').getBoundingClientRect();
  return {frame:{left:frame.left,right:frame.right,width:frame.width,height:frame.height,bottom:frame.bottom},close:{left:close.left,right:close.right,top:close.top,bottom:close.bottom},viewport:innerWidth,
    inFlow:getComputedStyle(el.querySelector('.slide-fullscreen-close')).position!=='fixed'};
 });
 assert.ok(mobile.frame.left>=0&&mobile.frame.right<=mobile.viewport+1,'Slide fits portrait mobile');
 assert.ok(mobile.close.left>=0&&mobile.close.right<=mobile.viewport+1,'Close fits portrait mobile');
 assert.ok(mobile.close.top>mobile.frame.bottom,'Close is in flow, below slide');
 assert.ok(mobile.inFlow,'Close is not fixed');
 assert.ok(Math.abs(mobile.frame.width/mobile.frame.height-16/9)<0.02,'Mobile slide retains 16:9');
 await full.screenshot({path:out+'/fullscreen-mobile.png'});
 await p.locator('.slide-fullscreen-close').click();await full.waitFor({state:'detached'});
 await opener.click();
 await full.waitFor();
 await p.goBack({waitUntil:'domcontentloaded'});
 await full.waitFor({state:'detached'});
 await p.locator('.slide-library-info').waitFor();
 assert.equal(await p.evaluate(()=>location.hash),'#lysbilder/'+slideId,'Browser Back closes fullscreen');
 await p.setViewportSize({width:1536,height:1040});
 // Touch the controls in a portrait-phone viewport and test surrounding
 // normal-flow native links, with no fixed overlay hit-testing.
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const tp=await ctx.newPage();
 tp.on('pageerror',e=>problems.push('Touch JavaScript: '+e.message));
 await tp.goto(process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/',{waitUntil:'networkidle'});
 await tp.evaluate(id=>location.hash='#lysbilder/'+id,slideId);
 await tp.locator('[data-slide-preview-open]').tap();
 const touchFull=tp.locator('#slide-library-fullscreen-page');await touchFull.waitFor();
 await tp.locator('.slide-fullscreen-close').tap();await touchFull.waitFor({state:'detached'});
 assert.equal(await tp.evaluate(()=>location.hash),'#lysbilder/'+slideId,'Touch close is a native link');
 await tp.waitForTimeout(500);
 assert.equal(await touchFull.count(),0,'No ghost opening after touch');
 await tp.locator('[data-slide-preview-open]').tap();await touchFull.waitFor();
 const stage=await touchFull.locator('.slide-library-fullscreen-stage').boundingBox();
 await tp.touchscreen.tap(stage.x+stage.width/2,stage.y+stage.height/2);
 assert.equal(await touchFull.count(),1,'Touching image does not close');
 await tp.locator('.slide-fullscreen-page > .slide-fullscreen-empty').first().tap();
 await touchFull.waitFor({state:'detached'});
 assert.equal(await tp.evaluate(()=>location.hash),'#lysbilder/'+slideId,'Outside top closes using plain link');
 await tp.locator('[data-slide-preview-open]').tap();await touchFull.waitFor();
 await tp.locator('.slide-fullscreen-page > .slide-fullscreen-empty').last().tap();
 await touchFull.waitFor({state:'detached'});
 assert.equal(await tp.evaluate(()=>location.hash),'#lysbilder/'+slideId,'Outside bottom closes using plain link');
 await tp.setViewportSize({width:844,height:390});
 await tp.locator('[data-slide-preview-open]').tap();await touchFull.waitFor();
 await tp.locator('.slide-fullscreen-body > .slide-fullscreen-empty').first().tap();
 await touchFull.waitFor({state:'detached'});
 assert.equal(await tp.evaluate(()=>location.hash),'#lysbilder/'+slideId,'Outside side closes using plain link');
 await tp.goto((process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/')+'?fullslide='+slideId,{waitUntil:'networkidle'});
 await touchFull.waitFor();
 assert.ok(await tp.locator('.slide-fullscreen-close').isVisible(),'Direct deep link works after page reload');
 await tp.locator('.slide-fullscreen-close').tap();
 await touchFull.waitFor({state:'detached'});
 await tp.locator('.slide-library-info').waitFor();
 assert.ok(await tp.locator('.slide-library-info').isVisible(),'Deep link closes to canonical detail');
 // Organization/copy-specific URL query parameters survive both navigations.
 await tp.goto((process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/')+'?skin=customer-test#lysbilder/'+slideId,{waitUntil:'networkidle'});
 await tp.locator('[data-slide-preview-open]').tap();
 await touchFull.waitFor();
 assert.equal(await tp.evaluate(()=>new URL(location.href).searchParams.get('skin')),'customer-test','Copy query parameter is preserved when opening');
 await tp.locator('.slide-fullscreen-close').tap();
 await touchFull.waitFor({state:'detached'});
 assert.equal(await tp.evaluate(()=>new URL(location.href).searchParams.get('skin')),'customer-test','Copy query parameter is preserved when closing');
 assert.equal(await tp.evaluate(()=>new URL(location.href).searchParams.has('fullslide')),false,'Viewer query parameter removed on close');


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
   if(s.id==='data-meaning-customer'){
    const circle=await stage.locator('.v2-def-word').evaluate(el=>{
     const bounds=el.getBoundingClientRect();
     return {wordCount:el.querySelectorAll('span').length,words:[...el.querySelectorAll('span')].map(x=>{
      const b=x.getBoundingClientRect();
      return {horizontalOffset:Math.abs((b.left+b.right)/2-(bounds.left+bounds.right)/2),inside:b.left>=bounds.left+1&&b.right<=bounds.right-1&&b.top>=bounds.top+1&&b.bottom<=bounds.bottom-1};
     })};
    });
    assert.equal(circle.wordCount,2,'Multiword definition should use two centered lines');
    assert.ok(circle.words.every(w=>w.inside&&w.horizontalOffset<=2),'Both definition words must remain centered inside the circle: '+JSON.stringify(circle));
   }
   if(s.id==='ai-thousand-analysts'){
    const count=await stage.locator('.capacity-marks .capacity-dot').count();
    assert.equal(count,1000,'One data point per hypothetical analyst; no decorative humanoid grid');
    assert.equal(await stage.locator('.capacity-field').count(),1,'Skin-compatible vector scene');
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
