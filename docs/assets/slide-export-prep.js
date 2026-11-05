/* Convert already-selected native markup into a self-contained, source-verified
   export input. Keep the actual art-direction attribute and inline all local images
   before html-to-image clones the off-screen slide. */
const safePath=/^\.\/assets\/library\/(?:vendor|external|original)\/[a-z0-9-]+\.(?:svg|png|jpg|jpeg|webp)$/;
async function toDataUrl(url){
 const response=await fetch(url,{cache:'no-store'});
 if(!response.ok)throw Error('Kunne ikke laste illustrasjonsobjekt: '+url);
 const blob=await response.blob();
 if(!blob.type.startsWith('image/'))throw Error('Ugyldig illustrasjonsformat: '+url);
 return await new Promise((resolve,reject)=>{
  const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));
  reader.onerror=()=>reject(reader.error||Error('Bilde kunne ikke leses'));
  reader.readAsDataURL(blob);
 });
}
export async function prepareSlideMarkupForExport(markup){
 const parsed=new DOMParser().parseFromString(markup,'text/html');
 const scene=parsed.body.querySelector('.story-scene');
 if(!scene)throw Error('Mangler lysbildescene i eksporten');
 const sources=[...parsed.body.querySelectorAll('img[src]')];
 const urls=[...new Set(sources.map(img=>img.getAttribute('src')).filter(s=>safePath.test(s||'')))];
 const replacements=new Map(await Promise.all(urls.map(async url=>[url,await toDataUrl(url)])));
 for(const img of sources){
  const src=img.getAttribute('src');
  if(src?.startsWith('./assets/library/')&&!safePath.test(src))
   throw Error('Ugyldig ressursbane ved eksport: '+src);
  if(replacements.has(src)){
   img.setAttribute('src',replacements.get(src));
   img.removeAttribute('srcset');
   img.setAttribute('loading','eager');
  }
 }
 if(scene.dataset.artDirection==='rich'){
  const source=parsed.body.querySelector('[data-scene-object="rich-mountain-background"] img');
  if(!source?.getAttribute('src')?.startsWith('data:image/'))
   throw Error('Rik illustrasjon mangler bakgrunnsbilde ved eksport');
 }
 return parsed.body.innerHTML;
}
