/* Normalize slide media for portable SVG foreignObject capture.
   WebP inside SVG foreignObject can be omitted by WebKit even when displayed
   normally; convert local raster images to PNG in a disposable export clone.
   Semantic markup and the live DOM are never modified. */
const safePath=/^\.\/assets\/(?:library\/(?:vendor|external|original)\/[a-z0-9-]+\.(?:svg|png|jpg|jpeg|webp)|illustrations\/[a-z0-9-]+\.webp)$/;
function readAsDataUrl(blob){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(String(reader.result));
  reader.onerror=()=>reject(reader.error||Error('Bilde kunne ikke leses'));
  reader.readAsDataURL(blob);
 });
}
async function toDataUrl(url){
 const response=await fetch(url,{cache:'no-store'});
 if(!response.ok)throw Error('Kunne ikke laste illustrasjonsobjekt: '+url);
 const blob=await response.blob();
 if(!blob.type.startsWith('image/'))throw Error('Ugyldig illustrasjonsformat: '+url);
 // Leave SVG assets as scalable, self-contained images.
 if(/\.svg$/.test(url))return readAsDataUrl(blob);
 const objectUrl=URL.createObjectURL(blob);
 try{
  const image=new Image();
  image.src=objectUrl;
  if(typeof image.decode==='function')await image.decode();
  else await new Promise((resolve,reject)=>{
   image.onload=resolve;
   image.onerror=()=>reject(Error('Bilde kunne ikke dekodes: '+url));
  });
  if(!image.naturalWidth||!image.naturalHeight)
   throw Error('Illustrasjonsbilde kan ikke dekodes: '+url);
  const canvas=document.createElement('canvas');
  canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw Error('Bildekonvertering er ikke tilgjengelig');
  ctx.drawImage(image,0,0);
  const png=canvas.toDataURL('image/png');
  if(!png.startsWith('data:image/png;base64,'))
   throw Error('Kunne ikke bygge inn illustrasjonsbilde');
  return png;
 }finally{URL.revokeObjectURL(objectUrl);}
}
export async function prepareSlideMarkupForExport(markup){
 const parsed=new DOMParser().parseFromString(markup,'text/html');
 const scene=parsed.body.querySelector('.story-scene');
 if(!scene)throw Error('Mangler lysbildescene i eksporten');
 // The native 1600x900 SVG is a dormant alternate renderer for ordinary
 // diagram/illustration directions. Leaving it in html-to-image's foreignObject
 // clone causes very expensive SVG serialization in WebKit, despite display:none.
 // Strip only the inactive scene from the disposable export document.
 if(!['cinematic','rich'].includes(scene.dataset.artDirection))
  scene.querySelector('svg[data-native-slide-scene]')?.remove();
 const images=[...parsed.body.querySelectorAll('img[src]')];
 const svgImages=[...parsed.body.querySelectorAll('svg image[href]')];
 const originals=[...images.map(img=>img.getAttribute('src')),
  ...svgImages.map(img=>img.getAttribute('href'))];
 const urls=[...new Set(originals.filter(s=>safePath.test(s||'')))];
 const replacements=new Map(await Promise.all(urls.map(async url=>[url,await toDataUrl(url)])));
 for(const img of images){
  const src=img.getAttribute('src');
  if(src?.startsWith('./assets/')&&!safePath.test(src))
   throw Error('Ugyldig ressursbane ved eksport: '+src);
  if(replacements.has(src)){
   img.setAttribute('src',replacements.get(src));
   img.removeAttribute('srcset');
   img.setAttribute('loading','eager');
  }
 }
 for(const image of svgImages){
  const href=image.getAttribute('href');
  if(href?.startsWith('./assets/')&&!safePath.test(href))
   throw Error('Ugyldig SVG-bildebane ved eksport: '+href);
  if(replacements.has(href))image.setAttribute('href',replacements.get(href));
 }
 const native=scene.querySelector('svg[data-native-slide-scene]');
 if(native){
  const photo=native.querySelector('image[data-photo-role="landscape"]');
  if(!photo?.getAttribute('href')?.startsWith('data:image/png;base64,'))
   throw Error('Manglende fotografi i eksportens native SVG-scene');
 }
 // A photographic direction without its image is a failed export, not a
 // superficially successful download. This tests generic object roles rather
 // than depending on one slide ID or its current CSS classes.
 if(['rich','cinematic'].includes(scene.dataset.artDirection)){
  const photos=[...scene.querySelectorAll('[data-scene-mode="rich"] img[data-scene-fit]')];
  if(!photos.length||photos.some(img=>!img.getAttribute('src')?.startsWith('data:image/png;base64,')))
   throw Error('Fotografisk illustrasjon mangler i eksportgrunnlaget');
 }
 return parsed.body.innerHTML;
}
