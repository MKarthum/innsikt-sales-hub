/* Representative visual regression checks drawn from the curated main story; full library is tested separately. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync,spawn} from 'node:child_process';
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
 // Core pages changed by the organization-profile integration must also have visual evidence.
 // Capture the public baseline; synthetic internal profile rendering is validated separately.
 for(const [size,width,height] of [['desktop',1536,864],['mobile',390,844]]){
  await page.setViewportSize({width,height});
  for(const [route,selector] of [['oversikt','.hero h1'],['kompetanse','.page-title'],['forretning','.sector-card'],['ordliste/bi','.glossary-item[data-glossary-id="bi"]']]){
   await page.evaluate(route=>{location.hash='#'+route},route);
   await page.locator(selector).first().waitFor();
   if(route==='ordliste/bi')await page.waitForFunction(()=>document.querySelector('.glossary-item[data-glossary-id="bi"]')?.open);
   await page.waitForTimeout(450); // Wait for responsive sidebar and scroll transitions before capturing.
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   assert.ok(overflow<=3,'Ingen horisontal sideavklipping '+route+'/'+size+': '+overflow);
   if(route==='forretning'){
    assert.equal(await page.locator('.sector-card').count(),9,'Ni offentlige bransjer');
    assert.equal(await page.locator('.sector-card-type').filter({hasText:'Prioritert bransje'}).count(),0,'Ingen offentlig prioritet');
   }
   await page.screenshot({path:output+'/core-'+route.replace('/','-')+'-'+size+'.png',fullPage:false});
  }
 }
 // Isolated browser contexts avoid inherited sidebar/scroll state when switching viewport.
 for(const [width,height] of [[1512,980],[900,900],[390,844],[320,700]]){
  const shot=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await shot.goto((process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/')+'#kompetanse',{waitUntil:'networkidle'});
  await shot.locator('[data-competence-path]').waitFor();
  assert.ok(await shot.locator('[data-competence-step="signal"] blockquote').isVisible(),'Signal synlig '+width);
  assert.ok(await shot.locator('[data-competence-step="questions"] li').first().isVisible(),'Spørsmål synlig '+width);
  assert.ok((await shot.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,'Ingen horisontal overflyt i kompetanse '+width);
  assert.equal(await shot.locator('#sidebar.open').count(),0,'Mobilmeny lukket '+width);
  await shot.screenshot({path:output+'/competence-'+width+'-default.png',fullPage:true});
  await shot.locator('[data-competence-audience]').selectOption('audience-7');
  assert.equal(await shot.locator('[data-competence-play]').getAttribute('data-competence-play'),'modernisering','CIO-valg '+width);
  await shot.screenshot({path:output+'/competence-'+width+'-cio.png',fullPage:true});
  await shot.close();
 }
 // Compare the actual 0.18.9 main commit with this PR, not a changing live deployment.
 const baselineSha='8524f29cce8495f5b20a656284ae29ca5ce99067';
 const baselineDir=fs.mkdtempSync(path.join(os.tmpdir(),'innsikt-plays-before-'));
 const archive=path.join(baselineDir,'site.tar');
 let baselineServer;
 try{
  execFileSync('git',['fetch','--depth=1','origin',baselineSha],{stdio:'ignore'});
  const archiveFd=fs.openSync(archive,'w');
  try{execFileSync('git',['archive','--format=tar',baselineSha,'docs'],{stdio:['ignore',archiveFd,'pipe']});}
  finally{fs.closeSync(archiveFd);}
  execFileSync('tar',['-xf',archive,'-C',baselineDir]);
  baselineServer=spawn('python3',['-m','http.server','8771','--bind','127.0.0.1','--directory',baselineDir],{stdio:'ignore'});
  await new Promise(resolve=>setTimeout(resolve,450));
  for(const width of [320,390,900,1512]){
   const height=width===320?700:width===390?844:width===900?900:980;
   for(const [state,url] of [['before','http://127.0.0.1:8771/docs/#muligheter'],['after',(process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/')+'#muligheter']]){
    const shot=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    await shot.goto(url,{waitUntil:'networkidle'});
    await shot.locator('.play-grid .play-card').first().waitFor();
    await shot.waitForTimeout(200);
    const overflow=await shot.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    if(overflow>3){
     const offenders=await shot.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+3).slice(0,8).map(el=>({tag:el.tagName,cls:el.className?.baseVal||el.className,right:Math.round(el.getBoundingClientRect().right)})));
     console.log('OVERFLOW '+state+' '+width+' '+overflow+' '+JSON.stringify(offenders));
    }
    await shot.screenshot({path:output+'/plays-'+width+'-'+state+'-viewport.png',fullPage:false});
    await shot.screenshot({path:output+'/plays-'+width+'-'+state+'-full.png',fullPage:true});
    if(state==='after'){
     assert.ok(overflow<=3,'Ingen horisontal overflyt i salgsinnganger '+width+': '+overflow);
     await shot.locator('[data-play-journey-select]').selectOption('ki-data');
     assert.equal(await shot.locator('[data-play-journey-id]').getAttribute('data-play-journey-id'),'ki-data','KI-signal ved '+width);
     await shot.screenshot({path:output+'/plays-'+width+'-ki-data.png',fullPage:false});
    }
    await shot.close();
   }
  }
 }finally{
  baselineServer?.kill();
  fs.rmSync(baselineDir,{recursive:true,force:true});
 }
 // Teknologikart: før/etter fra eksakt v0.18.11, ikke skiftende live Pages.
 const techBaseDir=fs.mkdtempSync(path.join(os.tmpdir(),'innsikt-tech-before-'));
 let techBaseServer;
 try{
  const techBaseSha='1639193b5817f7da24ec8838251304708799fb15';
  execFileSync('git',['fetch','--depth=1','origin',techBaseSha],{stdio:'ignore'});
  const fd=fs.openSync(path.join(techBaseDir,'site.tar'),'w');
  try{execFileSync('git',['archive','--format=tar',techBaseSha,'docs'],{stdio:['ignore',fd,'pipe']});}finally{fs.closeSync(fd);}
  execFileSync('tar',['-xf',path.join(techBaseDir,'site.tar'),'-C',techBaseDir]);
  techBaseServer=spawn('python3',['-m','http.server','8772','--bind','127.0.0.1','--directory',techBaseDir],{stdio:'ignore'});
  await new Promise(resolve=>setTimeout(resolve,500));
  for(const width of [320,390,900,1512]){
   const height=width===320?700:width===390?844:width===900?900:980;
   for(const [state,url] of [['before','http://127.0.0.1:8772/docs/#teknologi'],['after',(process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/')+'#teknologi']]){
    const shot=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    await shot.goto(url,{waitUntil:'networkidle'});
    await shot.locator('.tech-item').first().waitFor();
    const overflow=await shot.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    if(state==='after')assert.ok(overflow<=3,'Teknologikart uten horisontal overflyt '+width+': '+overflow);
    await shot.screenshot({path:output+'/technology-'+width+'-'+state+'-viewport.png'});
    await shot.screenshot({path:output+'/technology-'+width+'-'+state+'-full.png',fullPage:true});
    if(state==='after'){
     await shot.locator('[data-tech-journey-select]').selectOption('datakvalitet');
     await shot.locator('[data-tech-journey-kind]').first().click();
     assert.equal(await shot.locator('.tech-item').count(),1,'Datakvalitet filtrerer ved '+width);
     await shot.screenshot({path:output+'/technology-'+width+'-datakvalitet.png'});
    }
    await shot.close();
   }
  }
 }finally{techBaseServer?.kill();fs.rmSync(techBaseDir,{recursive:true,force:true})}

 // Kildespor: låst main før endringen, sammenlign mobil og desktop.
 const sourceBaseDir=fs.mkdtempSync(path.join(os.tmpdir(),'innsikt-sources-before-'));
 let sourceBaseServer;
 try{
  const sourceBaseSha='f0cf8a7fb76addc83a7a52737022ca6ebe1ae7eb';
  execFileSync('git',['fetch','--depth=1','origin',sourceBaseSha],{stdio:'ignore'});
  const fd=fs.openSync(path.join(sourceBaseDir,'site.tar'),'w');
  try{execFileSync('git',['archive','--format=tar',sourceBaseSha,'docs'],{stdio:['ignore',fd,'pipe']});}finally{fs.closeSync(fd);}
  execFileSync('tar',['-xf',path.join(sourceBaseDir,'site.tar'),'-C',sourceBaseDir]);
  sourceBaseServer=spawn('python3',['-m','http.server','8773','--bind','127.0.0.1','--directory',sourceBaseDir],{stdio:'ignore'});
  await new Promise(resolve=>setTimeout(resolve,500));
  for(const width of [320,390,900,1512]){
   const height=width===320?700:width===390?844:width===900?900:980;
   for(const [state,url] of [['before','http://127.0.0.1:8773/docs/#kilder'],['after',(process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/')+'#kilder']]){
    const shot=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    await shot.goto(url,{waitUntil:'networkidle'});
    await shot.locator('.source-card').first().waitFor();
    const overflow=await shot.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    if(state==='after'){
     assert.ok(overflow<=3,'Kildespor uten horisontal overflyt '+width+': '+overflow);
     await shot.locator('[data-source-trace-select]').waitFor();
    }
    await shot.screenshot({path:output+'/sources-'+width+'-'+state+'-viewport.png'});
    await shot.screenshot({path:output+'/sources-'+width+'-'+state+'-full.png',fullPage:true});
    if(state==='after'){
     await shot.locator('[data-source-trace-select]').selectOption('signal:embeddedai');
     await shot.screenshot({path:output+'/sources-'+width+'-assessment.png'});
    }
    await shot.close();
   }
  }
 }finally{sourceBaseServer?.kill();fs.rmSync(sourceBaseDir,{recursive:true,force:true})}
 assert.deepEqual(errors,[],'Feilfri Javascript-konsoll');
 console.log('PASS – bibliotekfiltre, tre visuelt renderte slides og mobilvisning');
}finally{await browser.close()}
