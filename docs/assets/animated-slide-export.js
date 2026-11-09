/* Browser-native motion export for semantic SVG scenes. No duplicated slide content,
   no server and no third-party recording service. GIF is intentionally small/short
   for social posts; video uses the browser's supported recorder codec. */
const SOURCE_WIDTH=1600,SOURCE_HEIGHT=900;
const MOTION_SECONDS=6,GIF_FPS=8,GIF_WIDTH=640,GIF_HEIGHT=360;
const VIDEO_FPS=12,VIDEO_WIDTH=1280,VIDEO_HEIGHT=720;
const SVG_NS='http://www.w3.org/2000/svg';
const presentationProperties=[
 'fill','fill-opacity','fill-rule','stroke','stroke-opacity','stroke-width',
 'stroke-linecap','stroke-linejoin','stroke-dasharray','stroke-dashoffset',
 'opacity','font-family','font-size','font-weight','font-style','letter-spacing',
 'text-anchor','dominant-baseline','display','visibility','stop-color','stop-opacity',
 'color','paint-order'
];
function downloadBlob(blob,filename){
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function readDataUrl(blob){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));
  reader.onerror=()=>reject(reader.error||Error('Ressursen kunne ikke leses'));
  reader.readAsDataURL(blob);
 });
}
async function inlineSvgImages(svg){
 const images=[...svg.querySelectorAll('image[href]')];
 await Promise.all(images.map(async image=>{
  const href=image.getAttribute('href');
  if(!href||href.startsWith('data:'))return;
  const url=new URL(href,document.baseURI);
  if(url.origin!==location.origin)throw Error('Eksterne bilder kan ikke tas med i animasjonen');
  const response=await fetch(url.href,{cache:'force-cache'});
  if(!response.ok)throw Error('Illustrasjonsressursen mangler: '+url.pathname);
  const blob=await response.blob();
  if(!blob.type.startsWith('image/'))throw Error('Ugyldig illustrasjonsressurs');
  image.setAttribute('href',await readDataUrl(blob));
 }));
}
async function freezeSvg(svg){
 const copy=svg.cloneNode(true);
 const original=[svg,...svg.querySelectorAll('*')],duplicates=[copy,...copy.querySelectorAll('*')];
 if(original.length!==duplicates.length)throw Error('Ufullstendig SVG-kloning');
 for(let i=0;i<original.length;i++){
  const style=getComputedStyle(original[i]),dest=duplicates[i];
  for(const property of presentationProperties){
   const value=style.getPropertyValue(property);
   if(value&&value!=='initial'&&value!=='normal')dest.style.setProperty(property,value);
  }
 }
 copy.querySelectorAll('.mc-edge-packet,animateMotion,animateTransform').forEach(el=>el.remove());
 copy.setAttribute('xmlns',SVG_NS);
 copy.setAttribute('viewBox','0 0 '+SOURCE_WIDTH+' '+SOURCE_HEIGHT);
 copy.setAttribute('width',String(SOURCE_WIDTH));
 copy.setAttribute('height',String(SOURCE_HEIGHT));
 await inlineSvgImages(copy);
 const xml=new XMLSerializer().serializeToString(copy);
 const url=URL.createObjectURL(new Blob([xml],{type:'image/svg+xml;charset=utf-8'}));
 try{
  const image=new Image();image.src=url;
  await image.decode();
  if(image.naturalWidth<1||image.naturalHeight<1)throw Error('Tom SVG-illustrasjon');
  return image;
 }catch(error){
  throw Error('Kunne ikke lage videoramme fra SVG: '+error.message);
 }finally{
  // The decoded image can be retained after the source URL has been revoked.
  URL.revokeObjectURL(url);
 }
}
function parseDuration(value,fallback){
 const parsed=parseFloat(value||'');
 return Number.isFinite(parsed)&&parsed>0?parsed:fallback;
}
function findTracks(svg){
 return [...svg.querySelectorAll('.mc-edge')].map((group,i)=>{
  const path=group.querySelector('.mc-edge-track');
  if(!path||typeof path.getTotalLength!=='function')return null;
  const length=path.getTotalLength();
  if(!Number.isFinite(length)||length<1)return null;
  const motion=group.querySelector('animateMotion');
  const duration=parseDuration(motion?.getAttribute('dur'),3.5);
  const begin=parseFloat(motion?.getAttribute('begin')||'0')||0;
  const stroke=getComputedStyle(path).stroke;
  return {path,length,duration,begin,stroke,i};
 }).filter(Boolean);
}
function drawSignals(ctx,tracks,t,scaleX,scaleY){
 ctx.save();ctx.scale(scaleX,scaleY);
 for(const track of tracks){
  const phase=((t-track.begin)%track.duration+track.duration)%track.duration/track.duration;
  for(let j=3;j>=0;j--){
   const fraction=(phase-j*.019+1)%1;
   const point=track.path.getPointAtLength(fraction*track.length);
   const radius=j===0?6.6:Math.max(1.1,4.2-j);
   ctx.beginPath();ctx.arc(point.x,point.y,radius,0,Math.PI*2);
   ctx.fillStyle=track.stroke;ctx.globalAlpha=j===0?.95:.24;
   ctx.shadowColor=track.stroke;ctx.shadowBlur=j===0?16:7;ctx.fill();
  }
 }
 ctx.restore();ctx.globalAlpha=1;ctx.shadowBlur=0;
}
function buildPainter(base,tracks,width,height){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d',{willReadFrequently:width===GIF_WIDTH});
 if(!ctx)throw Error('Nettleseren støtter ikke bildeopptak');
 const draw=t=>{
  ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.clearRect(0,0,width,height);
  ctx.drawImage(base,0,0,width,height);
  drawSignals(ctx,tracks,t,width/SOURCE_WIDTH,height/SOURCE_HEIGHT);
 };
 return {canvas,ctx,draw};
}
function gifPalette(){
 const palette=[];
 for(let i=0;i<256;i++)palette.push(
  Math.round(((i>>5)&7)*255/7),Math.round(((i>>2)&7)*255/7),Math.round((i&3)*255/3));
 return palette;
}
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function indexedFrame(pixels,width,height){
 const indices=new Uint8Array(width*height);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const pos=y*width+x,index=pos*4;
  const d=(BAYER[(y&3)*4+(x&3)]-7.5)*2.1;
  const red=Math.max(0,Math.min(255,pixels[index]+d));
  const green=Math.max(0,Math.min(255,pixels[index+1]+d));
  const blue=Math.max(0,Math.min(255,pixels[index+2]+d));
  indices[pos]=((red>>5)<<5)|((green>>5)<<2)|(blue>>6);
 }
 return indices;
}
/* GIF89a writer. Frequent CLEAR codes keep 9-bit LZW codes valid on every
   decoder, using more space in exchange for portability and simple auditing. */
function makeGif(frames,width,height,delay){
 const out=[],push=(...values)=>out.push(...values),word=n=>push(n&255,(n>>8)&255);
 const ascii=s=>{for(let i=0;i<s.length;i++)out.push(s.charCodeAt(i));};
 ascii('GIF89a');word(width);word(height);push(0xF7,0,0);push(...gifPalette());
 push(0x21,0xFF,0x0B);ascii('NETSCAPE2.0');push(3,1,0,0,0);
 const encode=pixels=>{
  const data=[];let bits=0,count=0;
  const code=n=>{
   bits|=n<<count;count+=9;
   while(count>=8){data.push(bits&255);bits>>>=8;count-=8;}
  };
  for(let i=0;i<pixels.length;i++){
   if(i%128===0)code(256);
   code(pixels[i]);
  }
  code(257);if(count)data.push(bits&255);
  for(let i=0;i<data.length;i+=255){
   const end=Math.min(i+255,data.length);push(end-i);
   for(let p=i;p<end;p++)out.push(data[p]);
  }
  push(0);
 };
 for(const frame of frames){
  push(0x21,0xF9,4,0x04);word(delay);push(0,0,0x2C);
  word(0);word(0);word(width);word(height);push(0,8);
  encode(frame);
 }
 push(0x3B);
 return new Blob([new Uint8Array(out)],{type:'image/gif'});
}
async function exportGif(base,tracks,id,version){
 const {ctx,draw}=buildPainter(base,tracks,GIF_WIDTH,GIF_HEIGHT);
 const frames=[],count=MOTION_SECONDS*GIF_FPS;
 for(let i=0;i<count;i++){
  draw(i/GIF_FPS);
  frames.push(indexedFrame(ctx.getImageData(0,0,GIF_WIDTH,GIF_HEIGHT).data,GIF_WIDTH,GIF_HEIGHT));
  if(i%8===7)await new Promise(resolve=>setTimeout(resolve,0));
 }
 const blob=makeGif(frames,GIF_WIDTH,GIF_HEIGHT,Math.round(100/GIF_FPS));
 if(blob.size<1000)throw Error('Den animerte GIF-filen ble tom');
 downloadBlob(blob,'innsikt-'+id+'-v'+version+'.gif');
}
function recorderMime(){
 if(typeof MediaRecorder==='undefined'||typeof MediaRecorder.isTypeSupported!=='function')return '';
 return ['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp8','video/webm']
  .find(type=>MediaRecorder.isTypeSupported(type))||'';
}
async function exportVideo(base,tracks,id,version){
 if(typeof HTMLCanvasElement.prototype.captureStream!=='function')
  throw Error('Denne nettleseren kan ikke ta opp video. Prøv GIF eller en oppdatert nettleser.');
 const mime=recorderMime();
 if(!mime)throw Error('Nettleseren støtter ikke videoopptak. Bruk GIF i stedet.');
 const {canvas,draw}=buildPainter(base,tracks,VIDEO_WIDTH,VIDEO_HEIGHT);
 const stream=canvas.captureStream(VIDEO_FPS);
 let recorder;
 try{
  recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3000000});
 }catch(error){
  stream.getTracks().forEach(track=>track.stop());
  throw Error('Videoopptak kunne ikke startes: '+error.message);
 }
 const chunks=[];
 const output=new Promise((resolve,reject)=>{
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  recorder.onerror=e=>reject(Error('Videoopptak feilet: '+(e.error?.message||'ukjent feil')));
  recorder.onstop=()=>resolve(new Blob(chunks,{type:recorder.mimeType||mime}));
 });
 draw(0);recorder.start(300);
 const start=performance.now();
 await new Promise(resolve=>{
  let previous=-Infinity;
  const tick=now=>{
   const seconds=(now-start)/1000;
   if(seconds>=MOTION_SECONDS){draw(MOTION_SECONDS);resolve();return;}
   if(now-previous>=1000/VIDEO_FPS-3){draw(seconds);previous=now;}
   requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
 });
 recorder.stop();
 const blob=await output;
 stream.getTracks().forEach(track=>track.stop());
 if(blob.size<1000)throw Error('Videofilen er tom');
 const extension=blob.type.includes('mp4')?'mp4':'webm';
 downloadBlob(blob,'innsikt-'+id+'-v'+version+'.'+extension);
 return extension;
}
export async function downloadAnimatedSlide({scene,format,id,version}){
 if(!/^[a-z0-9-]+$/.test(id))throw Error('Ugyldig lysbilde-ID');
 if(!['gif','video'].includes(format))throw Error('Ukjent animert format');
 const svg=scene?.querySelector('svg.mc-svg');
 if(!svg)throw Error('Animasjonseksport krever en modulær SVG-scene');
 const tracks=findTracks(svg);
 if(!tracks.length)throw Error('Lysbildet har ingen definerte bevegelige forbindelser');
 const bitmap=await freezeSvg(svg);
 if(format==='gif'){await exportGif(bitmap,tracks,id,version);return 'gif';}
 return exportVideo(bitmap,tracks,id,version);
}
/* Small, pure hooks so CI can verify the container format without a browser. */
export const animationExportContract=Object.freeze({
 duration:MOTION_SECONDS,gifWidth:GIF_WIDTH,gifHeight:GIF_HEIGHT,
 gifFps:GIF_FPS,videoWidth:VIDEO_WIDTH,videoHeight:VIDEO_HEIGHT,
 frameCount:MOTION_SECONDS*GIF_FPS
});
