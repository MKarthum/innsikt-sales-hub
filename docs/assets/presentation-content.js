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
 if(content.classification!=='internal'||![1,2].includes(content.schemaVersion))
  throw Error('Ugyldig intern innholdspakke');
 const slides=list(content.slides,'slides',250);
 const customerStories=list(content.customerStories,'customerStories',100);
 const solutions=list(content.solutions,'solutions',100);
 const tools=list(content.tools,'tools',150);
 const extras=content.collections===undefined?{}:plainObject(content.collections,'collections');
 const reserved=new Set(['customerStories','solutions','tools','slides','sources','presentationDecks','pages','prompts']);
 for(const [key,items] of Object.entries(extras)){
  if(!validId(key)||reserved.has(key))throw Error('Ugyldig eller reservert intern samling: '+key);
  list(items,'collections.'+key,200);
 }
 const collections={customerStories,solutions,tools,...extras};

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
 const allItemIds=new Set();
 for(const [label,arr] of Object.entries(collections)){
  for(const item of arr){
   plainObject(item,label);
   if(!validId(item.id)||allItemIds.has(item.id)||item.classification!=='internal'||typeof item.title!=='string'||!item.title.trim())
    throw Error('Ugyldig eller duplisert intern oppføring i '+label);
   if(item.sourceIds!==undefined&&(!Array.isArray(item.sourceIds)||item.sourceIds.some(id=>!sourceIds.has(id))))
    throw Error('Ukjent kilde i '+label+'/'+item.id);
   if(item.href!==undefined&&(typeof item.href!=='string'||!(/^(https:\/\/[^\s]+|\/internal\/[a-zA-Z0-9/_-]+)$/.test(item.href))||item.href.includes('..')))
    throw Error('Utrygg lenke i '+label+'/'+item.id);
   for(const key of ['summary','description','body'])if(item[key]!==undefined&&typeof item[key]!=='string')
    throw Error('Ugyldig tekstfelt i '+label+'/'+item.id);
   allItemIds.add(item.id);
  }
 }
 // Organization-specific positioning is only accepted from an authenticated internal package.
 // Generic guidance and factual data remain owned by the public core.
 let organizationProfile=null;
 if(content.organizationProfile!==undefined){
  if(content.schemaVersion!==2)throw Error('Virksomhetsprofil krever schemaVersion 2');
  const profile=plainObject(content.organizationProfile,'organizationProfile');
  const allowed=new Set(['name','brandSubtitle','home','competenceHeader','competences','competenceSourceIds','focusSectorIds']);
  for(const field of Object.keys(profile))if(!allowed.has(field))throw Error('Ukjent virksomhetsprofilfelt: '+field);
  const requiredText=(v,field)=>{if(typeof v!=='string'||!v.trim()||v.length>350)throw Error('Ugyldig virksomhetsprofiltekst: '+field);return v;};
  requiredText(profile.name,'name');
  if(profile.brandSubtitle!==undefined)requiredText(profile.brandSubtitle,'brandSubtitle');
  const readTextFields=(value,label,allowedFields)=>{
   if(value===undefined)return null;
   const item=plainObject(value,label);
   for(const [key,text] of Object.entries(item)){
    if(!allowedFields.includes(key))throw Error('Ukjent felt i '+label+': '+key);
    requiredText(text,label+'.'+key);
   }
   return item;
  };
  const home=readTextFields(profile.home,'organizationProfile.home',['eyebrow','titleLine1','titleLine2','intro']);
  const competenceHeader=readTextFields(profile.competenceHeader,'organizationProfile.competenceHeader',['title','intro']);
  const competences=profile.competences===undefined?null:list(profile.competences,'organizationProfile.competences',24);
  if(competences){
   if(!competences.length)throw Error('Tomt kompetanseregister i virksomhetsprofil');
   const ids=new Set();
   for(const skill of competences){
    plainObject(skill,'organization competence');
    if(!validId(skill.id)||ids.has(skill.id))throw Error('Ugyldig/duplisert virksomhetskompetanse');
    for(const key of Object.keys(skill))if(!['id','label','description'].includes(key))throw Error('Ukjent kompetansefelt: '+key);
    requiredText(skill.label,'competence.label');requiredText(skill.description,'competence.description');ids.add(skill.id);
   }
  }
  const competenceSourceIds=list(profile.competenceSourceIds,'organizationProfile.competenceSourceIds',20);
  if(competenceSourceIds.some(id=>!sourceIds.has(id))||new Set(competenceSourceIds).size!==competenceSourceIds.length)
   throw Error('Ukjente eller dupliserte kompetansekilder i virksomhetsprofil');
  const focusSectorIds=list(profile.focusSectorIds,'organizationProfile.focusSectorIds',24);
  const validSectors=new Set(base.industrySectors.map(s=>s.id));
  if(focusSectorIds.some(id=>!validSectors.has(id))||new Set(focusSectorIds).size!==focusSectorIds.length)
   throw Error('Ukjente eller dupliserte prioriterte bransjer i virksomhetsprofil');
  organizationProfile={...profile,home,competenceHeader,competences,competenceSourceIds,focusSectorIds};
 }
 const config=content.navigation===undefined?null:plainObject(content.navigation,'navigation');
 if(config&&content.schemaVersion!==2)throw Error('Intern navigasjon krever schemaVersion 2');
 const groups=config?list(config.groups,'navigation.groups',30):[{id:'organization',label:'VIRKSOMHETENS RESSURSER',collapsible:true}];
 const views=config?list(config.views,'navigation.views',100):
  [['customerStories','Kundehistorier'],['solutions','Løsninger'],['tools','Egne verktøy']].filter(([key])=>collections[key].length).map(([collection,label])=>({
   id:collection.toLowerCase(),label,collection,groupId:'organization'
  }));
 const groupIds=new Set(),viewIds=new Set();
 for(const group of groups){
  plainObject(group,'navigation group');
  if(!validId(group.id)||groupIds.has(group.id)||typeof group.label!=='string'||!group.label.trim())
   throw Error('Ugyldig intern navigasjonsgruppe');
  groupIds.add(group.id);
 }
 for(const view of views){
  plainObject(view,'navigation view');
  if(!validId(view.id)||viewIds.has(view.id)||!groupIds.has(view.groupId)||!Object.hasOwn(collections,view.collection)||
   typeof view.label!=='string'||!view.label.trim())throw Error('Ugyldig intern menyside');
  for(const field of ['title','intro','icon'])if(view[field]!==undefined&&typeof view[field]!=='string')
   throw Error('Ugyldig internt menyfelt: '+field);
  viewIds.add(view.id);
 }
 return {...base,
  sources:{...base.sources,...sources},
  slides:{...base.slides,items:[...base.slides.items,...slides]},
  pages:{...base.pages,presentationDecks:{...base.pages.presentationDecks,...decks}},
  organizationProfile,
  internalCollections:collections,
  internalNavigation:{groups,items:views}
 };
}
window.InnsiktPresentationContent={load,combine,checkDeployment};
})();
