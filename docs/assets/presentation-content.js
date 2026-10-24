/* A protected content package is supplied only by a separately access-controlled deployment.
   This file contains no non-public data, credentials, or access-control decisions. */
(()=>{
'use strict';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const validId=s=>typeof s==='string'&&/^[a-z0-9][a-z0-9_-]{2,80}$/.test(s);
const list=(x,label,limit=200)=>{
 if(x===undefined)return [];
 if(!Array.isArray(x)||x.length>limit)throw Error('Ugyldig intern samling: '+label);
 return x;
};
const plainObject=(v,label)=>{
 if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Ugyldig internt objekt: '+label);
 return v;
};
function checkDeployment(config){
 plainObject(config,'deployment');
 if(config.mode==='public'){
  if(config.protectedPresentationContent!==null)throw Error('Offentlig distribusjon kan ikke ha intern datakilde');
  return null;
 }
 if(config.mode!=='internal')throw Error('Ukjent distribusjonsmodus');
 const url=config.protectedPresentationContent;
 if(typeof url!=='string'||!/^\/internal\/[a-zA-Z0-9_/-]+\.json$/.test(url)||url.includes('..'))
  throw Error('Internt innhold krever autorisert same-origin endepunkt under /internal/');
 return url;
}
async function load(config,fetcher=fetch){
 const endpoint=checkDeployment(config);
 if(!endpoint)return null;
 const res=await fetcher(endpoint,{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});
 if(!res.ok)throw Error('Internt innhold er ikke tilgjengelig (HTTP '+res.status+'). Ingen offentlige fallbackdata vises som internt innhold.');
 const json=await res.json();
 return plainObject(json,'content');
}
function combine(base,content){
 if(!content)return base;
 if(content.classification!=='internal'||content.schemaVersion!==1)
  throw Error('Ugyldig intern innholdspakke');
 const slides=list(content.slides,'slides',250);
 const customerStories=list(content.customerStories,'customerStories',100);
 const solutions=list(content.solutions,'solutions',100);
 const decks=content.presentationDecks===undefined?{}:plainObject(content.presentationDecks,'presentationDecks');
 const sources=content.sources===undefined?{}:plainObject(content.sources,'sources');
 const slideIds=new Set(base.slides.items.map(x=>x.id));
 const sourceIds=new Set(Object.keys(base.sources));
 const deckIds=new Set(Object.keys(base.pages.presentationDecks));
 for(const [id,source] of Object.entries(sources)){
  if(!validId(id)||sourceIds.has(id))throw Error('Duplisert/ugyldig intern kilde-ID: '+id);
  plainObject(source,'source '+id);
  if(typeof source.url!=='string'||!/^https:\/\//.test(source.url))
   throw Error('Interne kilder må bruke HTTPS: '+id);
  sourceIds.add(id);
 }
 for(const s of slides){
  plainObject(s,'slide');if(!validId(s.id)||slideIds.has(s.id))throw Error('Duplisert/ugyldig intern lysbilde-ID: '+s.id);
  if(s.classification!=='internal'||!['story','shared'].includes(s.scope)||typeof s.title!=='string'||typeof s.speakerBase!=='string')throw Error('Ufullstendig intern slide: '+s.id);
  if(s.scope==='story'&&!validId(s.storyId))throw Error('Historiespesifikk intern slide mangler eier');
  if(!Array.isArray(s.sourceIds)||s.sourceIds.some(id=>!sourceIds.has(id)))throw Error('Ukjent kilde i intern slide: '+s.id);
  slideIds.add(s.id);
 }
 for(const [id,d] of Object.entries(decks)){
  if(!validId(id)||deckIds.has(id))throw Error('Duplisert/ugyldig intern historie-ID: '+id);
  plainObject(d,'story '+id);
  if(d.classification!=='internal'||!Array.isArray(d.slides)||!d.slides.length)throw Error('Intern historie mangler klassifisering/lysbilder: '+id);
  for(const entry of d.slides){
   if(!slideIds.has(entry.slideId))throw Error('Historie viser til manglende slide: '+id+'/'+entry.slideId);
   const slide=slides.find(s=>s.id===entry.slideId)||base.slides.items.find(s=>s.id===entry.slideId);
   if(slide?.scope==='story'&&slide.storyId!==id)throw Error('Eierkonflikt for slide: '+entry.slideId);
  }
  deckIds.add(id);
 }
 for(const s of slides)if(s.scope==='story'&&!own(decks,s.storyId))throw Error('Intern eierhistorie mangler: '+s.id);
 for(const [label,arr] of [['customerStories',customerStories],['solutions',solutions]]){
  const ids=new Set();
  for(const item of arr){
   plainObject(item,label);if(!validId(item.id)||ids.has(item.id)||item.classification!=='internal'||typeof item.title!=='string')
    throw Error('Ugyldig intern oppføring i '+label);
   if(item.sourceIds?.some(id=>!sourceIds.has(id)))throw Error('Ukjent kilde i '+label+'/'+item.id);
   ids.add(item.id);
  }
 }
 return {...base,
  sources:{...base.sources,...sources},
  slides:{...base.slides,items:[...base.slides.items,...slides]},
  pages:{...base.pages,presentationDecks:{...base.pages.presentationDecks,...decks}},
  internalCollections:{customerStories,solutions}
 };
}
window.InnsiktPresentationContent={load,combine,checkDeployment};
})();
