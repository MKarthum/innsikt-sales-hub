/* Browser native SVG snapshot for an editable, portable semantic diagram.
   Independent of html-to-image and all decorative CSS background layers.
   Only the disposable export copy is rasterized; canonical slide data stays SVG. */

const styleFields=[
 'fill','stroke','stroke-width','stroke-dasharray','stroke-opacity','fill-opacity',
 'stroke-linecap','stroke-linejoin','stroke-miterlimit','color','opacity',
 'font-family','font-size','font-weight','font-style','letter-spacing','text-anchor',
 'dominant-baseline','paint-order','stop-color','stop-opacity'
];

async function snapshotNativeSvg(source){
 const cloned=source.cloneNode(true);
 // Raster photos embedded in a serialized SVG may be silently omitted by
 // browser image decoders. Composite the verified PNG directly on canvas.
 const photo=source.querySelector('image[data-photo-role="landscape"]');
 const raster=photo?.getAttribute('href');
 if(!raster?.startsWith('data:image/png;base64,'))
  throw Error('Fjellbakgrunnen er ikke bygget inn som PNG');
 const photoOpacity=Number(getComputedStyle(photo).opacity)||1;
 cloned.querySelector('image[data-photo-role="landscape"]')?.remove();
 const originals=[source,...source.querySelectorAll('*')].filter(el=>el!==photo);
 const copies=[cloned,...cloned.querySelectorAll('*')];
 if(originals.length!==copies.length)throw Error('SVG-kopien er ufullstendig');
 originals.forEach((item,index)=>{
  const computed=getComputedStyle(item),copy=copies[index];
  for(const name of styleFields){
   const value=computed.getPropertyValue(name);
   if(value&&value!=='normal'&&value!=='initial'&&value!=='auto')
    copy.style.setProperty(name,value);
  }
  const filter=computed.getPropertyValue('filter');
  const local=filter&&filter.match(/#(cpn-[a-z-]+)/);
  if(local)copy.style.setProperty('filter','url(#'+local[1]+')');
 });
 for(const picture of cloned.querySelectorAll('image[href]')){
  const href=picture.getAttribute('href');
  if(!href?.startsWith('data:image/'))
   throw Error('Bilde i SVG er ikke bygget inn før eksport');
 }
 cloned.setAttribute('xmlns','http://www.w3.org/2000/svg');
 cloned.setAttribute('width','1600');
 cloned.setAttribute('height','900');
 const serialized=new XMLSerializer().serializeToString(cloned);
 const objectUrl=URL.createObjectURL(new Blob([serialized],{type:'image/svg+xml;charset=utf-8'}));
 try{
  const image=new Image();image.src=objectUrl;
  await image.decode();
  const canvas=document.createElement('canvas');
  canvas.width=1920;canvas.height=1080;
  const context=canvas.getContext('2d');
  if(!context)throw Error('Ingen canvas-kontekst tilgjengelig');
  const background=new Image();background.src=raster;
  await background.decode();
  if(background.naturalWidth<1||background.naturalHeight<1)
   throw Error('Kunne ikke dekode fjellbildet');
  context.globalAlpha=photoOpacity;
  context.drawImage(background,0,0,1920,1080);
  context.globalAlpha=1;
  context.drawImage(image,0,0,1920,1080);
  return canvas.toDataURL('image/png');
 }finally{URL.revokeObjectURL(objectUrl);}
}

export async function flattenNativeScene(html,tone){
 const host=document.createElement('div');
 host.style.cssText='position:fixed;left:-15000px;top:0;width:960px;height:540px;pointer-events:none;z-index:-1';
 const frame=document.createElement('div');
 frame.className='present-frame present-rich export-slide';
 frame.dataset.tone=tone;
 frame.style.cssText='position:relative;width:960px;height:540px;min-width:960px;max-width:960px;min-height:540px;max-height:540px;container-type:inline-size;overflow:hidden;padding:4.5% 6%;display:flex;align-items:stretch;justify-content:center;box-sizing:border-box';
 frame.innerHTML=html;host.append(frame);document.body.append(host);
 try{
  await document.fonts?.ready;
  const scene=frame.querySelector('.story-scene[data-art-direction="cinematic"]');
  const svg=scene?.querySelector('svg[data-native-slide-scene="context-platforms"]');
  if(!svg||getComputedStyle(svg).display==='none')return html;
  const png=await snapshotNativeSvg(svg);
  // The downstream PNG/JPG/PDF/PPTX exporter receives one verified raster.
  // No external imagery or SVG foreignObject survives into that pipeline.
  const url=png.replaceAll('&','&amp;').replaceAll('"','&quot;');
  return '<div class="story-scene scene-context-platforms" style="position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;display:block">'
   +'<img src="'+url+'" alt="" aria-hidden="true" style="display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:fill" decoding="sync" loading="eager">'
   +'</div>';
 }finally{host.remove();}
}
