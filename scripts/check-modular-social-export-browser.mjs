/* Full browser check: two different semantic scenes, three skins, real animated
   downloads. Run with a local web server serving the repository root. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
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
  parts.push(buffer.subarray(start,position).subarray(0,64).toString('hex'));
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
