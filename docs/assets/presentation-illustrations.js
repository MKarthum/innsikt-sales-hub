/* Image variants for presentation slides. The JSON slide remains the sole
   owner of all text and semantic connections. Images are approved snapshots. */
(()=>{
'use strict';
function semanticModel(slide){
 const v=slide?.visual||{};
 const parts=items=>(items||[]).map(x=>({label:x.label,detail:x.detail}));
 const edges=String(v.graph?.source||'').split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&!x.startsWith('#'));
 return {
  slideId:slide.id,cue:slide.cue,title:slide.title,body:slide.body,
  period:v.period,consumers:parts(v.consumers),
  contextLabel:v.contextLabel,contextLead:v.contextLead,
  facets:parts(v.facets),sources:parts(v.sources),cycle:parts(v.cycle),
  outcomesTitle:v.outcomesTitle,outcomes:parts(v.outcomes),
  governanceLabel:v.governanceLabel,governance:v.governance,
  edges
 };
}
function canonicalText(slide){return JSON.stringify(semanticModel(slide));}
async function sha256(input){
 if(!globalThis.crypto?.subtle||typeof TextEncoder==='undefined')return null;
 const digest=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(input));
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const validPath=/^\.\/assets\/illustrations\/[a-z0-9-]+\.webp$/;
async function reconcile(slides,manifest){
 if(manifest?.schemaVersion!==1||!Array.isArray(manifest.variants))throw Error('Ugyldig illustrasjonsmanifest');
 const byId=new Map(slides.map(slide=>[slide.id,slide]));
 const hashes=new Map();
 const variants=[];
 const ids=new Set();
 for(const item of manifest.variants){
  const key=item.sourceSlideId+':'+item.styleId;
  if(ids.has(key))throw Error('Duplisert illustrasjon: '+key);
  ids.add(key);
  const slide=byId.get(item.sourceSlideId);
  if(!slide)throw Error('Ukjent kilde-lysbilde: '+key);
  if(!hashes.has(slide.id))hashes.set(slide.id,await sha256(canonicalText(slide)));
  const current=hashes.get(slide.id);
  const active=item.approvalStatus==='approved'
   &&Boolean(current&&current===item.contentHash&&validPath.test(item.publicPath||'')&&item.approvedAt);
  variants.push({...item,runtimeStatus:active?'ready':item.approvalStatus==='approved'?'stale':item.approvalStatus});
 }
 return {schemaVersion:1,variants};
}
function select(slide,style,manifest){
 return manifest?.variants?.find(x=>x.sourceSlideId===slide.id&&x.styleId===style&&x.runtimeStatus==='ready')||null;
}
function render(slide,style,manifest,escape){
 const variant=select(slide,style,manifest);
 if(!variant)return null;
 const alt=slide.title+'. '+slide.visual.contextLabel+'. '+slide.body;
 return '<div class="story-scene scene-context-platforms scene-context-image">'
  +'<img data-image-style="'+escape(style)+'" data-image-sha="'+escape(variant.fileSha256)+'" class="cp-approved-image" src="'+escape(variant.publicPath)+'" alt="'+escape(alt)+'" decoding="async" loading="eager">'
  +'<div class="cp-brand-overlay" data-brand-overlay="true" aria-hidden="true"></div></div>';
}
window.InnsiktPresentationIllustrations={semanticModel,canonicalText,sha256,reconcile,select,render};
})();