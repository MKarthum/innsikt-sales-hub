/* Composable, data-owned illustration objects. No factual text or brand palette lives here. */
(()=>{
'use strict';
const types=new Set(['asset','glow','shape']);
const roles=new Set(['atmosphere','distance','landscape','summit','route','foreground','goal','haze','accent']);
const fits=new Set(['fill','cover','contain']);
const shapes=new Set(['disc','panel','rule']);
const styles=new Set(['natural','muted','corporate']);
const modes=new Set(['all','illustrated','standard','rich']);
const validId=id=>typeof id==='string'&&/^[a-z][a-z0-9-]{1,63}$/.test(id);
const number=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
function validate(art,catalog){
 if(!art||art.version!==1||!Array.isArray(art.objects)||!art.objects.length||art.objects.length>24)
  throw Error('Scene-art krever versjon 1 og 1–24 objekter');
 const ids=new Set();
 for(const o of art.objects){
  if(!validId(o.id)||ids.has(o.id))throw Error('Duplisert/ugyldig sceneobjekt: '+o.id);
  ids.add(o.id);
  if(!types.has(o.type)||!roles.has(o.role))throw Error('Ugyldig sceneobjekttype/-rolle: '+o.id);
  for(const [key,min,max] of [['x',-100,200],['y',-100,200],['w',.01,250],['h',.01,250]]){
   if(!number(o[key],min,max))throw Error('Ugyldig scenegeometri: '+o.id+'/'+key);
  }
  if(o.opacity!==undefined&&!number(o.opacity,0,1))throw Error('Ugyldig opasitet: '+o.id);
  if(o.rotate!==undefined&&!number(o.rotate,-180,180))throw Error('Ugyldig rotasjon: '+o.id);
  if(o.scale!==undefined&&!number(o.scale,.1,5))throw Error('Ugyldig skala: '+o.id);
  if(o.mode!==undefined&&!modes.has(o.mode))throw Error('Ugyldig art direction: '+o.id);
  if(o.type==='asset'){
   if(!validId(o.assetId))throw Error('Mangler ressurs-ID: '+o.id);
   const a=window.InnsiktAssets.get(catalog,o.assetId);
   if(!['original-figure','licensed-external'].includes(a.category))throw Error('Logo er ikke illustrasjon: '+o.id);
   if(o.fit!==undefined&&!fits.has(o.fit))throw Error('Ugyldig bildeformat: '+o.id);
   if(o.style!==undefined&&!styles.has(o.style))throw Error('Ugyldig illustrasjonsstil: '+o.id);
  } else {
   if(o.type==='shape'&&!shapes.has(o.shape))throw Error('Ugyldig form: '+o.id);
   if(o.assetId!==undefined)throw Error('Objekttype kan ikke ha assetId: '+o.id);
  }
 }
 return true;
}
const fmt=n=>String(Math.round(n*1000)/1000);
function render(art,catalog,escape){
 if(!art)return '';
 validate(art,catalog);
 const out=art.objects.map(o=>{
  const style='--sa-x:'+fmt(o.x)+'%;--sa-y:'+fmt(o.y)+'%;--sa-w:'+fmt(o.w)+'%;--sa-h:'+fmt(o.h)+'%;--sa-alpha:'+fmt(o.opacity??1)+';--sa-scale:'+fmt(o.scale??1)+';--sa-rotate:'+fmt(o.rotate??0)+'deg';
  const attrs=' data-scene-object="'+escape(o.id)+'" data-scene-role="'+escape(o.role)+'" data-scene-mode="'+escape(o.mode||'all')+'"'+(o.type==='shape'?' data-scene-shape="'+escape(o.shape)+'"':'');
  const cls='scene-art-object scene-art-object--'+o.type;
  let inner='';
  if(o.type==='asset'){
   const src=window.InnsiktAssets.src(catalog,o.assetId);
   inner='<img src="'+escape(src)+'" alt="" aria-hidden="true" loading="eager" decoding="async" class="scene-art-image" data-scene-fit="'+escape(o.fit||'fill')+'" data-scene-style="'+escape(o.style||'natural')+'">';
  }
  return '<div class="'+cls+'"'+attrs+' style="'+style+'" aria-hidden="true">'+inner+'</div>';
 });
 return '<div class="scene-art" aria-hidden="true" data-scene-art-version="1">'+out.join('')+'</div>';
}
window.InnsiktSceneArt={validate,render};
})();