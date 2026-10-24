/* Canonical asset lookup and usage: never duplicate a logo inside slide data or renderers. */
(()=>{
'use strict';
const goodPath=p=>typeof p==='string'&&/^assets\/library\/(?:vendor|external|original)\/[a-z0-9-]+\.(?:svg|png|jpg|jpeg|webp)$/.test(p);
function get(catalog,id){
 const asset=catalog?.items?.find(a=>a.id===id);
 if(!asset||!goodPath(asset.path))throw Error('Ukjent eller utrygg visuell ressurs: '+id);
 return asset;
}
function src(catalog,id){return './'+get(catalog,id).path;}
function usedBy(assetId,profiles,slides){
 function hasRef(value){
  if(Array.isArray(value))return value.some(hasRef);
  if(value&&typeof value==='object')return value.assetId===assetId||value.vendorId===assetId||value.brand===assetId
   ||value.lakeAsset===assetId||Object.values(value).some(hasRef);
  return false;
 }
 const ids=new Set((profiles?.profiles||[]).filter(hasRef).map(p=>p.id));
 return (slides?.items||[]).filter(s=>ids.has(s.profileId)).map(s=>({id:s.id,title:s.title}));
}

window.InnsiktAssets={get,src,usedBy};
})();
