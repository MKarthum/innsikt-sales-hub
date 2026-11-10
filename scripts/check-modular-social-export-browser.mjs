/* Full browser check: two different semantic scenes, three skins, real animated
   downloads. Run with a local web server serving the repository root. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium,webkit} from 'playwright';
const base=process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/';
const kind=process.env.EXPORT_BROWSER==='webkit'?'webkit':'chromium';
const folder='artifacts/modular-motion-'+kind;
fs.mkdirSync(folder,{recursive:true});
const browser=await (kind==='webkit'?webkit:chromium).launch({
 headless:true,...(kind==='chromium'?{args:['--no-sandbox']}:{})
});
const errors=[];
function inspectGif(buffer){
 assert.equal(buffer.subarray(0,6).toString('ascii'),'GIF89a');
 const w=buffer.readUInt16LE(6),h=buffer.readUInt16LE(8);
 assert.equal(w,640);assert.equal(h,360);
 assert.equal(buffer.at(-1),0x3b);
 // Skip GIF89a logical screen, 256-color palette and loop extension.
 let position=13+768+19,count=0;const parts=[];
 while(position<buffer.length-1){
  assert.equal(buffer[position++],0x21);
  assert.equal(buffer[position++],0xf9);
  assert.equal(buffer[position++],4);
  position+=5;assert.equal(buffer[position++],0x2c);
  position+=9;assert.equal(buffer[position++],8);
  const start=position;
  for(;;){
   const size=buffer[position++];
   if(!size)break;
   position+=size;
   assert.ok(position<=buffer.length,'Invalid GIF frame length');
  }
  parts.push(createHash('sha256').update(buffer.subarray(start,position)).digest('hex'));
  count++;
 }
 assert.equal(count,48,'GIF must contain 48 moving frames');
 assert.ok(new Set(parts).size>1,'Frames must differ, not just a static screenshot');
 return {width:w,height:h,count,bytes:buffer.length};
}
try{
 const page=await browser.newPage({viewport:{width:1440,height:960},acceptDownloads:true});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'});
 for(const [id,nodes,edges] of [
  ['ai-context-platforms-2027',22,10],
  ['delivery-time-context-flow',5,3]
 ]){
  await page.evaluate(value=>{location.hash='#lysbilder/'+value},id);
  await page.locator('.slide-library-detail-stage svg.mc-svg').waitFor();
  // Capture all visual intensities from the same source and SVG geometry.
  for(const style of ['standard','rich','rich-image']){
   await page.locator('#library-art-mode').selectOption(style);
   const candidate=page.locator('.slide-library-detail-stage .scene-modular-v1');
   await candidate.waitFor();
   assert.equal(await candidate.locator('[data-node-id]').count(),nodes);
   assert.equal(await candidate.locator('.mc-edge-track').count(),edges);
   if(id==='delivery-time-context-flow'){
    assert.equal(await candidate.getAttribute('data-visual-system'),'holographic-v1');
    assert.equal(await candidate.locator('.mv-card-surface').count(),5);
    assert.equal(await candidate.locator('.mv-artwork-raster').count(),5);
    const visuals=await candidate.evaluate(root=>{
     const image=root.querySelector('.mv-artwork-raster');
     const atmosphere=root.querySelector('.mv-atmosphere-field');
     const title=root.querySelector('.mc-title');
     const cards=[...root.querySelectorAll('.mv-card')];
     const geometries=cards.map(card=>{
      const rect=card.querySelector('.mv-card-surface').getBBox();
      return [...card.querySelectorAll('text')].every(text=>{
       const b=text.getBBox();
       return b.x>=rect.x-2&&b.x+b.width<=rect.x+rect.width+4
        &&b.y>=rect.y-7&&b.y+b.height<=rect.y+rect.height+6;
      });
     });
     return {
      opacity:Number(getComputedStyle(image).opacity),
      stageOpacity:Number(getComputedStyle(atmosphere).opacity),
      titleSize:Number.parseFloat(getComputedStyle(title).fontSize),
      fits:geometries
     };
    });
    assert.ok(visuals.titleSize>=44,'Main headline must be presentation sized');
    assert.ok(visuals.fits.every(Boolean),'Card content clipped or outside its panel');
    if(style==='rich-image'){
     assert.ok(visuals.opacity>.8,'Advanced stage must render holographic assets');
     assert.ok(visuals.stageOpacity>.5,'Advanced stage atmosphere must be visible');
     const href=await candidate.locator('.mv-artwork-raster').first().getAttribute('href');
     assert.ok((await page.request.get(new URL(href,page.url()).href)).ok(),
      'Canonical artwork resource is unavailable');
    }else assert.ok(visuals.opacity<.01,'Raster artwork should not hide the quieter vector styles');
   }
   await candidate.screenshot({path:folder+'/'+id+'-'+style+'.png'});
  }
  await page.locator('#library-art-mode').selectOption('rich-image');
  await page.locator('#library-motion-mode').selectOption('on');
  const scene=page.locator('.slide-library-detail-stage .scene-modular-v1');
  assert.equal(await scene.locator('[data-node-id]').count(),nodes);
  assert.equal(await scene.locator('.mc-edge-track').count(),edges);
  assert.equal(await scene.locator('animateMotion').count(),edges);
  if(id==='ai-context-platforms-2027')
   assert.equal(await scene.locator('.acp-core-pulse').count(),0);
  await scene.screenshot({path:folder+'/'+id+'.png'});
  const button=page.locator('.slide-single-download [data-slide-download="gif"]');
  assert.equal(await button.count(),1,'GIF button missing on modular slide');
  const [download]=await Promise.all([
   page.waitForEvent('download',{timeout:120000}),button.click()
  ]);
  assert.match(download.suggestedFilename(),/\.gif$/);
  const bytes=fs.readFileSync(await download.path());
  fs.writeFileSync(folder+'/'+id+'.gif',bytes);
  console.log('GIF',id,JSON.stringify(inspectGif(bytes)));
 }
 const recorder=await page.evaluate(()=>typeof MediaRecorder!=='undefined'
  &&typeof HTMLCanvasElement.prototype.captureStream==='function'
  &&['video/mp4','video/webm'].some(x=>MediaRecorder.isTypeSupported(x)));
 if(recorder){
  const [videoDownload]=await Promise.all([
   page.waitForEvent('download',{timeout:60000}),
   page.locator('.slide-single-download [data-slide-download="video"]').click()
  ]);
  const ext=videoDownload.suggestedFilename().split('.').pop();
  assert.ok(['mp4','webm'].includes(ext));
  const bytes=fs.readFileSync(await videoDownload.path());
  assert.ok(bytes.length>75000,'Video should be larger than a thumbnail');
  if(ext==='webm')assert.equal(bytes.subarray(0,4).toString('hex'),'1a45dfa3');
  if(ext==='mp4')assert.equal(bytes.subarray(4,8).toString('ascii'),'ftyp');
  fs.writeFileSync(folder+'/delivery-time-context-flow.'+ext,bytes);
  console.log('VIDEO',ext,bytes.length);
 }else console.log('SKIP video: this browser does not support canvas MediaRecorder');
 assert.deepEqual(errors,[],'Unexpected runtime errors');
 console.log('PASS – two modular scenes, GIF motion, supported browser video, screenshot artifacts');
}finally{
 await browser.close();
}
