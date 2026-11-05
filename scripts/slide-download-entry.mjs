/* Browser-only single-slide export. Source stays outside docs; bundle with npm run build:slide-download. */
import {toPng,toJpeg} from 'html-to-image';
import {jsPDF} from 'jspdf';
import pptxgen from 'pptxgenjs';

const WIDTH=960, HEIGHT=540;
const formats=new Set(['png','jpg','pdf','pptx']);

function save(blob,name){
 const href=URL.createObjectURL(blob);
 const link=document.createElement('a');
 link.href=href;link.download=name;document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(href),60000);
}
function fromDataUrl(uri){
 const [meta,data]=uri.split(',');
 const type=meta.match(/data:([^;]+)/)?.[1]||'application/octet-stream';
 const binary=atob(data);const array=new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++)array[i]=binary.charCodeAt(i);
 return new Blob([array],{type});
}
function captureElement(html,tone){
 const host=document.createElement('div');
 host.setAttribute('aria-hidden','true');
 host.style.cssText='position:fixed;left:-12000px;top:0;width:960px;height:540px;z-index:-1;pointer-events:none;overflow:visible';
 const frame=document.createElement('div');
 frame.className='present-frame present-rich export-slide';
 frame.dataset.tone=tone;
 frame.dataset.motion='off';
 frame.style.cssText='box-sizing:border-box;position:relative;transform:none!important;width:960px;height:540px;min-width:960px;min-height:540px;max-width:960px;max-height:540px;container-type:inline-size;overflow:hidden;border:0;border-radius:0;padding:4.5% 6%;display:flex;flex-direction:column;justify-content:center';
 frame.innerHTML=html;
 host.append(frame);document.body.append(host);
 return {host,frame};
}
async function waitForAssets(frame){
 await document.fonts?.ready;
 // An HTTP 404 sets complete=true, so complete alone is not a validity check.
 await Promise.all([...frame.querySelectorAll('img')].map(async img=>{
  const source=img.getAttribute('src')||'';
  try {
   if(!img.complete)await new Promise((resolve,reject)=>{
    img.addEventListener('load',resolve,{once:true});
    img.addEventListener('error',()=>reject(Error('Ressursen ble ikke lastet')),{once:true});
   });
   if(img.decode)await img.decode();
   if(!img.naturalWidth||!img.naturalHeight)throw Error('Tom bildeflate');
  }catch(error){throw Error('Kan ikke eksportere lysbilde med manglende illustrasjon: '+source.slice(0,80)+' / '+error.message);}
 }));
}
// html-to-image serializes SVG elements inside an SVG foreignObject. In that
// context external styles and inherited fill:none may disappear (black blobs).
// Freeze *computed* SVG presentation only in the disposable export clone, so
// the on-screen SVG and every organization's CSS palette remain unchanged.
function freezeSvgPresentation(frame){
 const properties=['fill','stroke','stroke-width','stroke-opacity','fill-opacity','stroke-dasharray','stroke-linecap','stroke-linejoin','opacity','stop-color','stop-opacity'];
 for(const svg of frame.querySelectorAll('svg')){
  for(const el of [svg,...svg.querySelectorAll('*')]){
   const style=getComputedStyle(el);
   for(const key of properties){
    const value=style.getPropertyValue(key);
    if(value&&value!=='normal'&&value!=='initial')el.style.setProperty(key,value);
   }
   // Older WebKit can retain an unresolved gradient stop color.
   if(el.tagName.toLowerCase()==='stop'){
    const defined=el.getAttribute('stop-color');
    if(defined?.includes('var(')){
     const match=defined.match(/var\((--[^)]+)\)/);
     const value=match&&getComputedStyle(frame).getPropertyValue(match[1]).trim();
     if(value)el.style.setProperty('stop-color',value);
    }
   }
  }
 }
}
export async function downloadSingleSlide({id,title,html,tone='light',artDirection='standard',format='png',version=''}){
 if(!formats.has(format))throw Error('Ukjent eksportformat: '+format);
 if(!/^[a-z0-9-]+$/.test(id))throw Error('Ugyldig lysbilde-ID');
 const {host,frame}=captureElement(html,tone);
 try{
  await waitForAssets(frame);
  freezeSvgPresentation(frame);
  const opts={width:WIDTH,height:HEIGHT,pixelRatio:2,cacheBust:false,skipAutoScale:true};
  const direction=['standard','illustrated','rich'].includes(artDirection)?artDirection:'standard';
 const filename='innsikt-'+id+'-'+tone+'-'+direction+'-v'+version;
  // All formats are derived from the same static, unnumbered 16:9 rendering.
  if(format==='png'){
   const data=await toPng(frame,opts);
   save(fromDataUrl(data),filename+'.png');return;
  }
  const jpeg=await toJpeg(frame,{...opts,quality:.96});
  if(format==='jpg'){save(fromDataUrl(jpeg),filename+'.jpg');return;}
  if(format==='pdf'){
   const pdf=new jsPDF({orientation:'landscape',unit:'pt',format:[WIDTH,HEIGHT],compress:true,putOnlyUsedFonts:true});
   pdf.setProperties({title,subject:'Innsikt – enkeltlysbilde'});
   pdf.addImage(jpeg,'JPEG',0,0,WIDTH,HEIGHT);
   save(pdf.output('blob'),filename+'.pdf');return;
  }
  const pptx=new pptxgen();
  pptx.defineLayout({name:'INNSIKT_WIDE',width:13.3333333333,height:7.5});
  pptx.layout='INNSIKT_WIDE';pptx.author='Innsikt';pptx.subject='Enkeltlysbilde (bildebasert)';
  pptx.title=title;pptx.lang='nb-NO';
  const slide=pptx.addSlide();
  slide.addImage({data:jpeg,x:0,y:0,w:13.3333333333,h:7.5});
  const blob=await pptx.write({outputType:'blob',compression:true});
  save(blob,filename+'.pptx');
 }finally{host.remove();}
}
