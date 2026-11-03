import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
import JSZip from 'jszip';

const base=process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1350,height:900},acceptDownloads:true});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'});
 await page.evaluate(()=>location.hash='#lysbilder/ai-thousand-analysts');
 await page.locator('.slide-library-detail-stage .capacity-field').waitFor();
 assert.equal(await page.locator('.slide-single-download [data-slide-download]').count(),4);
 await page.locator('[data-slide-preview-open="ai-thousand-analysts"]').click();
 await page.locator('#slide-library-fullscreen').waitFor();
 assert.equal(await page.evaluate(()=>location.hash),'#lysbilder/ai-thousand-analysts~fullskjerm');
 await page.locator('#slide-library-fullscreen .slide-fullscreen-download summary').click();
 assert.equal(await page.locator('#slide-library-fullscreen .slide-single-download [data-slide-download]').count(),4);
 await page.locator('.slide-library-fullscreen-overlay > .slide-library-exit').click();
 await page.locator('#slide-library-fullscreen').waitFor({state:'detached'});
 async function download(format,locator='.slide-single-download [data-slide-download="'+format+'"]'){
  const [file]=await Promise.all([page.waitForEvent('download',{timeout:30000}),page.locator(locator).first().click()]);
  assert.ok(file.suggestedFilename().endsWith('.'+format));
  return fs.readFileSync(await file.path());
 }
 const png=await download('png');
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','valid PNG');
 assert.equal(png.readUInt32BE(16),1920);
 assert.equal(png.readUInt32BE(20),1080);
 // Pixel regression: SVG fills must not become a black disk during foreignObject cloning.
 const blackShare=await page.evaluate(async base64=>{
  const img=new Image();img.src='data:image/png;base64,'+base64;
  await img.decode();
  const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let dark=0,examined=0;
  for(let y=250;y<900;y+=8)for(let x=1150;x<1850;x+=8){
   const i=(y*canvas.width+x)*4;examined++;
   if(pixels[i]<18&&pixels[i+1]<18&&pixels[i+2]<18)dark++;
  }
  return dark/examined;
 },png.toString('base64'));
 assert.ok(blackShare<.04,'SVG exporter created an opaque black shape: '+blackShare);

 const jpeg=await download('jpg');
 assert.equal(jpeg.subarray(0,2).toString('hex'),'ffd8','valid JPEG');
 const pdf=await download('pdf');
 assert.equal(pdf.subarray(0,4).toString(),'%PDF','valid PDF');
 const pptx=await download('pptx');
 assert.equal(pptx.subarray(0,2).toString(),'PK','PPTX zip');
 const zip=await JSZip.loadAsync(pptx);
 assert.ok(zip.file('ppt/slides/slide1.xml'),'PPTX slide');
 assert.ok(zip.file('ppt/media/image1.jpeg')||Object.keys(zip.files).some(x=>x.startsWith('ppt/media/')),'embedded image');
 // Export respects selected palette even though the single slide has no story number.
 await page.locator('#library-tone-mode').selectOption('strong');
 await page.addStyleTag({content:':root{--slide-strong-bg:#222222;--slide-strong-accent:#f2e500;--slide-strong-fg:#ffffff;--slide-strong-muted:#eeeeee}'});
 const custom=await download('png');
 assert.notDeepEqual(custom,png,'Custom skin and tone affect exported PNG');
 assert.equal(await page.locator('.slide-single-download [data-slide-download-id="ai-thousand-analysts"]').count(),4);
 // Presenter offers the currently selected slide, not the entire deck.
 await page.locator('#present-button').click();
 assert.equal(await page.locator('#present-modal .slide-single-download [data-slide-download]').count(),4);
 const presenter=await download('png','#present-modal .slide-single-download [data-slide-download="png"]');
 assert.equal(presenter.readUInt32BE(16),1920);
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,acceptDownloads:true});
 await mobile.goto(base,{waitUntil:'networkidle'});
 await mobile.evaluate(()=>location.hash='#lysbilder/ai-thousand-analysts');
 await mobile.locator('[data-slide-preview-open="ai-thousand-analysts"]').tap();
 await mobile.locator('#slide-library-fullscreen').waitFor();
 await mobile.locator('#slide-library-fullscreen .slide-fullscreen-download summary').tap();
 const [mobileExport]=await Promise.all([mobile.waitForEvent('download',{timeout:30000}),mobile.locator('#slide-library-fullscreen [data-slide-download="png"]').tap()]);
 const mobileBytes=fs.readFileSync(await mobileExport.path());
 assert.equal(mobileBytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Mobile download is a valid PNG');
 assert.equal(await mobile.locator('#slide-library-fullscreen').count(),1,'Mobile export does not dismiss fullscreen');
 await mobile.locator('.slide-library-fullscreen-overlay > .slide-library-exit').tap();
 await mobile.waitForTimeout(150);
 assert.equal(await mobile.locator('.slide-library-fullscreen-overlay').count(),0,'Fullscreen close works immediately after download menu use');
 await mobile.waitForTimeout(1100);
 assert.equal(await mobile.locator('.slide-library-fullscreen-overlay').count(),0,'No delayed ghost reopening');
 assert.equal(await mobile.locator('#slide-library-fullscreen').count(),0);
 await mobile.close();
 assert.ok(!errors.length,'Browser error: '+errors.join(' | '));
 console.log('PASS – PNG/JPG/PDF/PPTX valid, 16:9, re-skinning, detail view and Presenter single-slide export');
}finally{await browser.close()}
