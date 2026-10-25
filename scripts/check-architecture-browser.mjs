import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const out='artifacts/architecture';fs.mkdirSync(out,{recursive:true});
const allSlides=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const list=allSlides.filter(x=>x.type==='architecture');
const catalog=JSON.parse(fs.readFileSync('docs/data/visual-assets.json','utf8'));
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1512,height:980},deviceScaleFactor:1,acceptDownloads:true});
 page.on('pageerror',err=>errors.push(err.message));
 await page.goto(process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/',{waitUntil:'networkidle'});
 await page.evaluate(()=>location.hash='#arkitektur');
 await page.locator('[data-architecture-explorer]').waitFor();
 assert.equal(await page.locator('[data-arch-option]').count(),4,'One reference model and three platform examples');
 assert.equal(await page.locator('[data-arch-option="modern"],[data-arch-option="ai-on-data"]').count(),0,'Technical detail and AI use are not competing base architectures');
 assert.equal(await page.locator('[data-arch-panel]:not([hidden])').count(),1,'Exactly one architecture perspective shown');
 assert.equal(await page.locator('[data-arch-panel="conceptual"]:not([hidden]) .da-scene').count(),1,'Page reuses presentation renderer');
 const details=page.locator('[data-arch-technical]');
 await details.locator('summary').click();
 assert.equal(await details.locator('li').count(),6,'Technical expansion contains three canonical pairs of technical details');
 assert.ok((await details.textContent()).includes('ELT / CDC'),'Modern data flow is technical depth, not an alternative architecture');
 assert.equal(await page.locator('.arch-applications .learning-card').count(),2,'Two distinctly purposeful BI and document RAG examples');
 assert.equal(await page.locator('.arch-applications a[href="#arkitektur/bi"]').count(),1,'BI example keeps deep link');
 assert.equal(await page.locator('.arch-applications a[href="#arkitektur/rag"]').count(),1,'Document RAG example keeps deep link');
 await page.screenshot({path:out+'/architecture-page-desktop.png',fullPage:false});
 await page.locator('[data-arch-option="fabric"]').click();
 assert.equal(await page.locator('[data-arch-option="fabric"]').getAttribute('aria-pressed'),'true','Platform option is accessible');
 assert.equal(await page.locator('[data-arch-panel="fabric"]:not([hidden]) .vp-fabric').count(),1,'Vendor composition preserved on the page');
 for(const width of [1100,900]){
  await page.setViewportSize({width,height:900});
  const dims=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  assert.ok(dims.sw<=dims.cw+1,'No horizontal overflow at '+width+'px '+JSON.stringify(dims));
  await page.screenshot({path:out+'/architecture-page-'+width+'.png',fullPage:false});
 }
 await page.setViewportSize({width:1512,height:980});
 // A new mobile page avoids inheriting the resized desktop session's sidebar state.
 const base=process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/';
 for(const width of [390,320]){
  const mobile=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
  mobile.on('pageerror',err=>errors.push(err.message));
  await mobile.goto(base+'#arkitektur',{waitUntil:'networkidle'});
  await mobile.locator('[data-architecture-explorer]').waitFor();
  assert.equal(await mobile.locator('#sidebar').evaluate(x=>x.classList.contains('open')),false,'Mobile sidebar is closed at load');
  assert.equal(await mobile.locator('#sidebar-backdrop').evaluate(x=>x.classList.contains('open')),false,'Mobile backdrop does not cover architecture');
  await mobile.screenshot({path:out+'/architecture-mobile-'+width+'-top.png',fullPage:false});
  for(const vendorId of ['snowflake','fabric','databricks']){
   await mobile.locator('[data-arch-option="'+vendorId+'"]').click();
   const region=mobile.locator('[data-arch-panel="'+vendorId+'"]:not([hidden])');
   assert.equal(await region.count(),1,'Only selected vendor region visible');
   assert.equal(await region.locator('.arch-explorer-stage').isVisible(),false,'Tiny slide hidden on mobile');
   assert.equal(await region.locator('.arch-explorer-mobile').isVisible(),true,'Mobile model visible');
   const expected=JSON.parse(fs.readFileSync('docs/data/architecture-profiles.json','utf8')).profiles.find(p=>p.id===vendorId);
   assert.ok((await region.locator('[data-arch-scene-note]').textContent()).includes(expected.diagram.foot),'Vendor-specific footnote visible: '+vendorId);
   assert.ok((await region.locator('[data-arch-vendor-notice]').textContent()).includes(expected.brandNotice),'Canonical legal caveat visible: '+vendorId);
   const relationship=await region.locator('[data-arch-vendor-detail]').textContent();
   assert.ok(relationship.includes(({snowflake:'Snowpipe Streaming',fabric:'OneLake',databricks:'Bronze'})[vendorId]),'Distinct vendor-specific mobile model: '+vendorId);
   const dims=await mobile.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
   assert.ok(dims.sw<=dims.cw+1,'No horizontal overflow at '+width+'/'+vendorId+': '+JSON.stringify(dims));
   if(vendorId==='fabric')await region.locator('.arch-explorer-mobile').screenshot({path:out+'/architecture-mobile-'+width+'-fabric-model.png'});
  }
  await mobile.close();
 }
 await page.evaluate(()=>location.hash='#arkitektur/bi');
 await page.locator('.diagram').waitFor();
 await page.evaluate(()=>location.hash='#arkitektur/rag');
 await page.locator('.diagram').waitFor();
 await page.evaluate(()=>location.hash='#lysbilder/architecture-modern');
 await page.locator('.slide-library-detail-stage .da-scene').waitFor();
 await page.evaluate(()=>location.hash='#lysbilder/architecture-ai');
 await page.locator('.slide-library-detail-stage .da-scene').waitFor();
 await page.setViewportSize({width:1512,height:980});
 await page.evaluate(()=>location.hash='#ressurser');
 await page.locator('.asset-library-card').first().waitFor();
 assert.equal(await page.locator('.asset-library-card').count(),catalog.items.length,'Asset gallery renders all assets');
 assert.equal(await page.locator('.asset-library-section').count(),3,'Separate categories');
 await page.waitForFunction(()=>[...document.querySelectorAll('.asset-library-thumb img')].every(img=>img.complete&&img.naturalWidth>0));
 await page.screenshot({path:out+'/asset-library.png',fullPage:false});
 await page.evaluate(()=>location.hash='#lysbilder');
 await page.locator('.slide-library-card').first().waitFor();
 assert.equal(await page.locator('.slide-library-card').count(),allSlides.length);
 assert.equal(await page.locator('#library-tone-mode').inputValue(),'light');
 await page.locator('#library-tone-mode').selectOption('strong');
 assert.equal(await page.locator('.slide-library-card .present-frame[data-tone=\"strong\"]').count(),allSlides.length);
 await page.locator('#library-tone-mode').selectOption('light');
 assert.equal(await page.locator('.slide-library-card .present-frame[data-tone=\"light\"]').count(),39);
 for(const [i,s] of list.entries()){
  await page.evaluate(id=>location.hash='#lysbilder/'+id,s.id);
  await page.waitForFunction(title=>document.querySelector('main h1')?.textContent?.trim()===title,s.title);
  await page.locator('.slide-library-detail-stage .da-scene, .slide-library-detail-stage .vp-scene').waitFor();
  const stage=page.locator('.slide-library-detail-stage');
  await stage.waitFor();
  assert.equal(await page.locator('#library-tone-mode').inputValue(),'light');
  assert.equal(await stage.locator('.present-frame').getAttribute('data-tone'),'light');
  const audit=await stage.evaluate(node=>{
   const scene=node.querySelector('.da-scene, .vp-scene');
   const bounds=scene.getBoundingClientRect();
   const text=[...scene.querySelectorAll('h2,h3,p,li,strong,.da-col-title,.da-data-tiers span,.da-foundation-title,.vp-atom-label span,.vp-tier small,.vp-section-label')];
   const outside=[];
   for(const el of text){
    if(!el.textContent?.trim())continue;
    const r=el.getBoundingClientRect();
    if(r.width&&r.height&&(r.x<bounds.x-4||r.y<bounds.y-4||r.right>bounds.right+4||r.bottom>bounds.bottom+4))outside.push({text:el.textContent.slice(0,35),x:r.x,y:r.y});
   }
   const imageChecks=[...scene.querySelectorAll('img')].map(img=>({name:img.alt,complete:img.complete,width:img.naturalWidth}));
   return {outside,imageChecks,width:bounds.width,height:bounds.height,foundation:scene.querySelector('.da-foundation,.vp-support')!=null};
  });
  assert.equal(audit.outside.length,0,s.id+' text outside '+JSON.stringify(audit.outside));
  assert.ok(audit.foundation&&audit.imageChecks.length>=10,s.id+' missing shared imagery');
  await page.waitForFunction(()=>[...document.querySelectorAll('.slide-library-detail-stage .da-scene img, .slide-library-detail-stage .vp-scene img')].every(x=>x.complete&&x.naturalWidth>0));
  if(s.profileId==='snowflake'){
   assert.equal(await stage.locator('.vp-snow-shell').count(),1,'Snowflake hub layout');
   const legibility=await stage.evaluate(node=>{
    const scene=node.querySelector('.vp-scene');
    const sceneWidth=scene.getBoundingClientRect().width;
    return [...scene.querySelectorAll('.vp-snow-shell .vp-trio .vp-atom')].map(atom=>{
     const label=atom.querySelector('.vp-atom-label');
     const title=label.querySelector('strong'),detail=label.querySelector('span');
     const ar=atom.getBoundingClientRect(),lr=label.getBoundingClientRect();
     const titlePx=parseFloat(getComputedStyle(title).fontSize)*960/sceneWidth;
     const detailPx=parseFloat(getComputedStyle(detail).fontSize)*960/sceneWidth;
     return {title:title.textContent,titlePx,detailPx,clipped:lr.right>ar.right+1||lr.bottom>ar.bottom+1||lr.left<ar.left-1||lr.top<ar.top-1||label.scrollWidth>label.clientWidth+1};
    });
   });
   assert.equal(legibility.length,6,'Snowflake retains six ingest/model alternatives');
   assert.deepEqual(legibility.slice(0,3).map(x=>x.title),['Snowpipe','Snowpipe Streaming','Openflow'],'Distinct ingestion options, not sharing');
   assert.ok(legibility.every(x=>x.titlePx>=12.5&&x.detailPx>=10.5),'Snowflake text legible at 960px: '+JSON.stringify(legibility));
   assert.ok(legibility.every(x=>!x.clipped),'Snowflake labels must fit: '+JSON.stringify(legibility));
  }
  if(s.profileId==='fabric')assert.equal(await stage.locator('.vp-fabric-lake').count(),1,'Fabric OneLake-led layout');
  if(s.profileId==='databricks')assert.equal(await stage.locator('.vp-medallion').count(),1,'Databricks medallion layout');
  await stage.screenshot({path:out+'/'+s.id+'.png'});
 }
 await page.locator('#library-tone-mode').selectOption('strong');
 await page.locator('.slide-library-detail-stage .present-frame[data-tone="strong"]').waitFor();
 await page.locator('.slide-library-detail-stage').screenshot({path:out+'/architecture-databricks-dark.png'});
 await page.locator('#library-tone-mode').selectOption('light');
 await page.locator('#present-button').click();
 assert.equal(await page.locator('#present-tone-mode').inputValue(),'light','Presenter shares library mode');
 await page.locator('[data-deck="dataarkitektur"]').click();
 await page.locator('#slide-body .da-scene').waitFor();
 await page.locator('#present-tone-mode').selectOption('strong');
 assert.equal(await page.locator('#slide-body').getAttribute('data-tone'),'strong');
 await page.locator('#present-tone-mode').selectOption('light');
 assert.equal(await page.locator('#slide-body').getAttribute('data-tone'),'light');
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#deck-download').click()]);
 const f=out+'/self-contained-export.html';await download.saveAs(f);
 const html=fs.readFileSync(f,'utf8');
 assert.ok(html.includes('data:image/svg+xml'), 'Asset imagery embedded in portable HTML');
 assert.ok(html.includes('.da-flow')&&html.includes('.vp-flow'), 'Both generic and vendor architecture styles embedded in portable HTML');
 assert.ok(!html.includes('src="./assets/library/'), 'No broken external image URLs in export');
 await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>location.hash='#ressurser');
 await page.locator('.asset-library-card').first().waitFor();
 await page.screenshot({path:out+'/asset-library-mobile.png',fullPage:false});
 assert.deepEqual(errors,[]);
 console.log('PASS – '+catalog.items.length+' asset thumbnails, 6 architecture scenes, theme switching, and truly portable HTML export');
}finally{await browser.close();}
