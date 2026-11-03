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
 await Promise.all([...frame.querySelectorAll('img')].map(img=>{
  if(img.complete)return;
  return new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});});
 }));
}
export async function downloadSingleSlide({id,title,html,tone='light',format='png',version=''}){
 if(!formats.has(format))throw Error('Ukjent eksportformat: '+format);
 if(!/^[a-z0-9-]+$/.test(id))throw Error('Ugyldig lysbilde-ID');
 const {host,frame}=captureElement(html,tone);
 try{
  await waitForAssets(frame);
  const opts={width:WIDTH,height:HEIGHT,pixelRatio:2,cacheBust:false,skipAutoScale:true};
  const filename='innsikt-'+id+'-'+tone+'-v'+version;
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
