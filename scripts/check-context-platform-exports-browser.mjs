/* Browser integration: inspect the bytes of real downloads, not just successful clicks.
   All three renderers, all four formats. Screenshots and exports remain CI artifacts. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import {chromium,webkit} from 'playwright';

const base=process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/';
const engine=process.env.EXPORT_BROWSER==='webkit'?'webkit':'chromium';
const fileId=process.env.EXPORT_SLIDE_ID||'ai-context-platforms-2027';
const output='artifacts/'+(fileId==='ai-context-platforms-2027'?'context-exports':fileId+'-exports')+'-'+engine;
fs.mkdirSync(output,{recursive:true});
const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{args:['--no-sandbox']}:{})});
const types=['png','jpg','pdf','pptx'];
const directions=(process.env.EXPORT_DIRECTIONS||'standard,rich,rich-image').split(',');
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:960},acceptDownloads:true});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'});
 await page.evaluate(()=>{window.__exportToasts=[];new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1&&n.classList?.contains('toast'))window.__exportToasts.push(n.textContent)}).observe(document.body,{childList:true})});
 await page.evaluate(id=>{location.hash='#lysbilder/'+id},fileId);
 await page.locator('.slide-library-detail-stage .story-scene').waitFor();
 await page.locator('#library-tone-mode').selectOption('strong');
 const files=[];
 let sharedMarkup=null;
 const read=async (button,format)=>{
  let download;
  try{
   [download]=await Promise.all([
    page.waitForEvent('download',{timeout:engine==='webkit'?20000:60000}),button.click()
   ]);
  }catch(error){
   const diagnostics=await page.evaluate(()=>({toasts:window.__exportToasts||[],current:document.querySelector('.toast')?.textContent||null}));
   throw Error(engine+'/'+format+' export failed. '+JSON.stringify(diagnostics)+'; '+error.message);
  }
  assert.ok(download.suggestedFilename().endsWith('.'+format),download.suggestedFilename());
  const bytes=fs.readFileSync(await download.path());
  assert.ok(bytes.length>8000,'Suspiciously small '+format+' export');
  return bytes;
 };
 const pdfImage=bytes=>{
  assert.equal(bytes.subarray(0,4).toString(),'%PDF');
  const src=bytes.toString('latin1');
  const media=src.match(/\/MediaBox\s*\[([^\]]+)\]/)?.[1].trim().split(/\s+/).map(Number);
  assert.ok(media&&media.length===4&&media.every((n,i)=>Math.abs(n-[0,0,960,540][i])<.02),'PDF page dimensions: '+media);
  const a=bytes.indexOf(Buffer.from([255,216,255]));
  const b=bytes.lastIndexOf(Buffer.from([255,217]));
  assert.ok(a>=0&&b>a,'PDF must embed its actual JPEG slide image');
  return bytes.subarray(a,b+2);
 };
 const pptxImage=async bytes=>{
  assert.equal(bytes.subarray(0,2).toString(),'PK');
  const zip=await JSZip.loadAsync(bytes);
  assert.ok(zip.file('ppt/slides/slide1.xml'),'PPTX slide missing');
  const media=Object.keys(zip.files).find(x=>/^ppt\/media\/[^/]+\.jpe?g$/i.test(x));
  assert.ok(media,'PPTX must embed a JPEG of the slide');
  const xml=await zip.file('ppt/presentation.xml').async('string');
  assert.match(xml,/cx="12192000" cy="6858000"/,'PPTX must be 16:9');
  return zip.file(media).async('nodebuffer');
 };
 const compare=async (actual,reference,mime)=>{
  return page.evaluate(async ([a,b,mime])=>{
   async function pixels(src,type){
    const img=new Image();
    img.src='data:'+type+';base64,'+src;
    await img.decode();
    const canvas=document.createElement('canvas');
    canvas.width=160;canvas.height=90;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(img,0,0,160,90);
    return {w:img.naturalWidth,h:img.naturalHeight,p:ctx.getImageData(0,0,160,90).data};
   }
   const actual=await pixels(a,mime),ref=await pixels(b,'image/png');
   let diff=0,points=0,spread=0,spreadMean=0;
   const groups=Array.from({length:9},()=>({sum:0,count:0}));
   for(let y=4;y<86;y++)for(let x=4;x<156;x++){
    const i=(y*160+x)*4;const zone=Math.floor(y/30)*3+Math.floor(x/54);
    const d=(Math.abs(actual.p[i]-ref.p[i])+Math.abs(actual.p[i+1]-ref.p[i+1])+Math.abs(actual.p[i+2]-ref.p[i+2]))/3;
    diff+=d;points++;groups[Math.min(8,zone)].sum+=d;groups[Math.min(8,zone)].count++;
    const intensity=(actual.p[i]+actual.p[i+1]+actual.p[i+2])/3;
    spreadMean+=intensity;spread+=intensity*intensity;
   }
   return {w:actual.w,h:actual.h,meanDiff:diff/points,
    stdDev:Math.sqrt(Math.max(0,spread/points-(spreadMean/points)**2)),
    zones:groups.map(x=>x.count?Math.round(x.sum/x.count):0)};
  },[actual.toString('base64'),reference.toString('base64'),mime]);
 };
 for(const direction of directions){
  await page.locator('#library-art-mode').selectOption(direction);
  const frame=page.locator('.slide-library-detail-stage .present-frame');
  const scene=frame.locator('.story-scene');
  await scene.waitFor();
  assert.equal(await scene.getAttribute('data-art-direction'),direction);
  const isModular=fileId==='ai-context-platforms-2027';
  assert.equal(await scene.locator(isModular?'svg.mc-svg':'svg.di-svg[data-layout-contract="1"]').count(),1,
   fileId+'/'+direction+': the selected style must render one live vector scene');
  assert.equal(await scene.locator('img.cp-approved-image').count(),0,
   fileId+'/'+direction+': no separately maintained diagram bitmap is allowed');
  assert.equal(await scene.locator('[data-node-id]').count(),isModular?22:4,
   fileId+'/'+direction+': all canonical object identities are present');
  assert.equal(await scene.locator('[data-edge-id]').count(),isModular?10:5,
   fileId+'/'+direction+': all semantic relations are present');
  const svgMarkup=await scene.locator(isModular?'svg.mc-svg':'svg.di-svg').evaluate(svg=>svg.outerHTML);
  if(sharedMarkup!==null){
   if(isModular)assert.equal(svgMarkup,sharedMarkup,
    'Different visual treatments must share the same semantic SVG and anchored geometry');
   else assert.equal(svgMarkup,sharedMarkup,'The unchanged chain renderer must be stable across styles');
  }
  sharedMarkup=svgMarkup;
  await scene.locator('img').evaluateAll(async imgs=>Promise.all(imgs.filter(x=>getComputedStyle(x).display!=='none').map(img=>img.decode())));
  const reference=await frame.screenshot();
  fs.writeFileSync(path.join(output,direction+'-screen.png'),reference);
  for(const format of types){
   const bytes=await read(page.locator('.slide-single-download [data-slide-download="'+format+'"]'),format);
   fs.writeFileSync(path.join(output,direction+'.'+format),bytes);
   const bitmap=format==='pdf'?pdfImage(bytes):format==='pptx'?await pptxImage(bytes):bytes;
   const metrics=await compare(bitmap,reference,format==='png'?'image/png':'image/jpeg');
   assert.equal(metrics.w,1920,direction+'/'+format+' width '+JSON.stringify(metrics));
   assert.equal(metrics.h,1080,direction+'/'+format+' height '+JSON.stringify(metrics));
   assert.ok(metrics.stdDev>12,direction+'/'+format+' looks like a blank slide '+JSON.stringify(metrics));
   assert.ok(metrics.meanDiff<48&&metrics.zones.every(z=>z<35),direction+'/'+format+' has missing content in a visual region '+JSON.stringify(metrics));
   files.push({direction,format,bytes:bytes.length,metrics});
   console.log('EXPORT '+direction+'/'+format+' '+bytes.length+' bytes; meanDiff='+metrics.meanDiff.toFixed(1)+' stdDev='+metrics.stdDev.toFixed(1));
  }
  // Independent logo overlay: verify actual decoded pixels in all FOUR formats,
  // not just a visual PNG saved by a successful download handler.
  await page.evaluate(()=>{
   const marker=document.createElement('canvas');
   marker.width=120;marker.height=48;
   const context=marker.getContext('2d');
   context.fillStyle='#ffe100';context.fillRect(0,0,120,48);
   context.fillStyle='#031526';context.fillRect(9,9,18,30);
   document.documentElement.style.setProperty('--slide-brand-logo','url("'+marker.toDataURL('image/png')+'")');
  });
  const brandedScreen=await frame.screenshot();
  for(const format of types){
   const branded=await read(page.locator('.slide-single-download [data-slide-download="'+format+'"]'),format);
   fs.writeFileSync(path.join(output,direction+'-with-brand.'+format),branded);
   const bitmap=format==='pdf'?pdfImage(branded):format==='pptx'?await pptxImage(branded):branded;
   const mime=format==='png'?'image/png':'image/jpeg';
   const brandedMetrics=await compare(bitmap,brandedScreen,mime);
   // Some browsers capture CSS data-URL backgrounds differently in an
   // element screenshot. Compare the untouched slide against the stable
   // reference and independently require the real logo pixels.
   assert.ok(brandedMetrics.meanDiff<48,
    direction+'/'+format+' brand layer diverges from live view: '+JSON.stringify(brandedMetrics));
   const contentMetrics=await compare(bitmap,reference,mime);
   assert.ok(contentMetrics.meanDiff<48&&contentMetrics.zones.every(z=>z<35),
    direction+'/'+format+' export lost content outside the separate logo: '+JSON.stringify(contentMetrics));
   const markerPixels=await page.evaluate(async ([base64,mime])=>{
    const img=new Image();img.src='data:'+mime+';base64,'+base64;await img.decode();
    const canvas=document.createElement('canvas');canvas.width=160;canvas.height=90;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,160,90);
    const pixels=ctx.getImageData(0,0,160,90).data;let count=0;
    for(let y=1;y<17;y++)for(let x=132;x<160;x++){
     const i=(y*160+x)*4;
     if(pixels[i]>220&&pixels[i+1]>160&&pixels[i+2]<65)count++;
    }
    return count;
   },[bitmap.toString('base64'),mime]);
   assert.ok(markerPixels>=9,direction+'/'+format+' separate logo missing: '+markerPixels);
  }
  await page.evaluate(()=>document.documentElement.style.removeProperty('--slide-brand-logo'));
  // Fullscreen must export the same selected direction, not a stale/detail default.
  await page.locator('[data-slide-preview-open="'+fileId+'"]').click();
  await page.locator('#slide-library-fullscreen-page .story-scene').waitFor();
  await page.locator('#slide-library-fullscreen-page .slide-fullscreen-download summary').click();
  for(const format of types){
   const full=await read(page.locator('#slide-library-fullscreen-page [data-slide-download="'+format+'"]'),format);
   fs.writeFileSync(path.join(output,direction+'-fullscreen.'+format),full);
   const bitmap=format==='pdf'?pdfImage(full):format==='pptx'?await pptxImage(full):full;
   const metrics=await compare(bitmap,reference,format==='png'?'image/png':'image/jpeg');
   assert.equal(metrics.w,1920);
   assert.equal(metrics.h,1080);
   assert.ok(metrics.meanDiff<48&&metrics.zones.every(z=>z<35),
    direction+'/'+format+' fullscreen differs from the chosen direction: '+JSON.stringify(metrics));
  }
  await page.locator('.slide-fullscreen-close').click();
  await page.locator('#slide-library-fullscreen-page').waitFor({state:'detached'});
 }
 // Benchmark is not part of the curated Presenter decks. Compare Presenter
 // against the slide it actually shows, not against a different library slide.
 await page.locator('#present-button').click();
 await page.locator('#present-motion-mode').selectOption('off');
 const presenterFrame=page.locator('#present-modal .present-frame');
 await presenterFrame.locator('.story-scene').waitFor();
 await page.waitForTimeout(800); // let the existing entrance blur finish before comparing
 const presenterScreen=await presenterFrame.screenshot();
 fs.writeFileSync(path.join(output,'presenter-screen.png'),presenterScreen);
 for(const format of types){
  const presenter=await read(page.locator('#present-modal [data-slide-download="'+format+'"]'),format);
  fs.writeFileSync(path.join(output,'presenter.'+format),presenter);
  const bitmap=format==='pdf'?pdfImage(presenter):format==='pptx'?await pptxImage(presenter):presenter;
  const metrics=await compare(bitmap,presenterScreen,format==='png'?'image/png':'image/jpeg');
  assert.equal(metrics.w,1920);
  assert.equal(metrics.h,1080);
  assert.ok(metrics.stdDev>12&&metrics.meanDiff<48&&metrics.zones.every(z=>z<35),
   'Presenter '+format+' must match its currently visible slide '+JSON.stringify(metrics));
 }
 await page.locator('#present-modal .modal-close').click();
 await page.locator('#present-modal').waitFor({state:'detached'});
 assert.equal(files.length,4*directions.length);
 assert.ok(!errors.length,'JavaScript errors: '+errors.join(' | '));
 fs.writeFileSync(path.join(output,'metrics.json'),JSON.stringify(files,null,2));
 console.log('PASS '+fileId+': '+files.length+' exports + '+files.length+' branded + '+files.length+' fullscreen + 4 Presenter formats, pixels compared to real screenshots.');
 console.log(files.map(f=>f.direction+'/'+f.format+': '+f.bytes+' bytes, difference '+f.metrics.meanDiff.toFixed(1)+', deviation '+f.metrics.stdDev.toFixed(1)).join('\n'));
}finally{await browser.close()}
