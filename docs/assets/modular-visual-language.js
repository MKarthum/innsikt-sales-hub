/* Reusable SVG visual language. Geometry is derived from scene objects, never slide IDs.
   No business wording, brand colors, absolute screen images or hidden graph edges. */
(()=>{
'use strict';
const api=window.InnsiktVisualComposition;
if(!api)throw Error('Den modulære scenemotoren må lastes først');
const n=x=>Math.round(x*100)/100;
const rect=(x,y,w,h,r,cls)=>'<rect class="'+cls+'" x="'+n(x)+'" y="'+n(y)+'" width="'+n(w)+'" height="'+n(h)+'" rx="'+n(r)+'"/>';
const paintRect=(x,y,w,h,r,cls,paint)=>'<rect class="'+cls+'" x="'+n(x)+'" y="'+n(y)+'" width="'+n(w)+'" height="'+n(h)+'" rx="'+n(r)+'" fill="url(#'+paint+')"/>';
function material(b){
 const id='mv-material-'+String(b.id).replace(/[^a-z0-9-]/gi,'-');
 const defs='<defs><linearGradient id="'+id+'-surface" x1="0%" y1="0%" x2="92%" y2="100%">'+
  '<stop offset="0" class="mv-material-top"/><stop offset=".49" class="mv-material-mid"/>'+
  '<stop offset="1" class="mv-material-bottom"/></linearGradient>'+
  '<linearGradient id="'+id+'-gloss" x1="0%" y1="0%" x2="0%" y2="100%">'+
  '<stop offset="0" class="mv-gloss-start"/><stop offset="1" class="mv-gloss-end"/>'+
  '</linearGradient></defs>';
 return {defs,base:id+'-surface',gloss:id+'-gloss'};
}
const words=(value,max=35,limit=2)=>{
 const result=[];let line='';
 for(const word of String(value||'').split(/\s+/).filter(Boolean)){
  if(word.length>max)throw Error('For langt ord i visuelt objekt: '+word);
  const proposed=line?line+' '+word:word;
  if(proposed.length>max&&line){result.push(line);line=word}else line=proposed;
 }
 if(line)result.push(line);
 if(result.length>limit)throw Error('Tekst må redigeres eller få mer plass: '+value);
 return result;
};
function label(value,x,y,cls,esc,{max=42,limit=2,step=26}={}){
 return '<text class="'+cls+'">'+words(value,max,limit).map((line,i)=>
  '<tspan x="'+n(x)+'" y="'+n(y+i*step)+'">'+esc(line)+'</tspan>').join('')+'</text>';
}
function artwork(content,b,assets,esc,{takeaway=false}={}){
 const artId=content.artAssetId||null;
 const iconId=content.assetId||null;
 if(!artId&&!iconId)return '';
 const x=b.x+(takeaway?24:27),y=b.y+(takeaway?10:21);
 const w=takeaway?126:151,h=takeaway?107:130;
 const art=artId?window.InnsiktAssets.src(assets,artId):'';
 const icon=iconId?window.InnsiktAssets.src(assets,iconId):'';
 const imageId='mv-art-'+String(b.id).replace(/[^a-z0-9-]/gi,'-');
 const feather=art?'<defs><radialGradient id="'+imageId+'-fade" cx="50%" cy="50%" r="70%">'+
  '<stop offset=".32" stop-color="white"/><stop offset=".68" stop-color="white" stop-opacity=".96"/>'+
  '<stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient>'+
  '<mask id="'+imageId+'-mask" maskUnits="userSpaceOnUse" x="'+n(x)+'" y="'+n(y)+
  '" width="'+n(w)+'" height="'+n(h)+'"><rect x="'+n(x)+'" y="'+n(y)+'" width="'+n(w)+
  '" height="'+n(h)+'" fill="url(#'+imageId+'-fade)"/></mask></defs>':'';
 return '<g class="mv-artwork" data-art-owner="'+esc(b.id)+'" aria-hidden="true">'+feather+
  '<ellipse class="mv-artwork-halo" cx="'+n(x+w*.49)+'" cy="'+n(y+h*.65)+'" rx="'+n(w*.53)+'" ry="'+n(h*.47)+'"/>'+
  '<ellipse class="mv-artwork-disc" cx="'+n(x+w*.49)+'" cy="'+n(y+h*.87)+'" rx="'+n(w*.44)+'" ry="'+n(h*.095)+'"/>'+
  '<ellipse class="mv-artwork-orbit" cx="'+n(x+w*.49)+'" cy="'+n(y+h*.87)+'" rx="'+n(w*.35)+'" ry="'+n(h*.07)+'"/>'+
  (art?'<image class="mv-artwork-raster" data-art-asset-id="'+esc(artId)+'" x="'+n(x)+'" y="'+n(y)+'" width="'+n(w)+'" height="'+n(h)+'" href="'+esc(art)+'" mask="url(#'+imageId+'-mask)" preserveAspectRatio="xMidYMid meet"/>':'')+
  (icon?'<image class="mv-artwork-icon" data-icon-asset-id="'+esc(iconId)+'" x="'+n(x+w*.3)+'" y="'+n(y+h*.17)+'" width="'+n(w*.4)+'" height="'+n(h*.48)+'" href="'+esc(icon)+'" preserveAspectRatio="xMidYMid meet"/>':'')+
  '</g>';
}
function renderCard({node,box:b,esc,assets}){
 const c=node.content||{},focus=node.type==='focus',rx=focus?27:26;
 const content=Object.assign({},c,{artAssetId:node.visual?.artAssetId||c.artAssetId});
 const surface=material(b);
 if(focus){
  const x=b.x+194;
  const textWidth=b.w-(x-b.x)-38;
  const titleMax=Math.max(18,Math.floor(textWidth/(33*.55)));
  const detailMax=Math.max(23,Math.floor(textWidth/(22*.56)));
  return '<g class="mc-card mv-card mv-card--conclusion" data-node-id="'+esc(node.id)+'" data-node-kind="focus">'+surface.defs+
    rect(b.x+6,b.y+12,b.w,b.h,rx,'mv-card-shadow')+
    rect(b.x+9,b.y+7,b.w-5,b.h,rx,'mv-card-backplate')+
    rect(b.x,b.y,b.w,b.h,rx,'mv-card-surface')+
    paintRect(b.x+2,b.y+2,b.w-4,b.h-4,rx-2,'mv-card-material',surface.base)+
    paintRect(b.x+6,b.y+4,b.w-12,b.h*.49,rx-4,'mv-card-gloss',surface.gloss)+
    rect(b.x+24,b.y+10,b.w-48,4,2,'mv-card-topline')+
    artwork(content,b,assets,esc,{takeaway:true})+
    '<path class="mv-conclusion-rule" d="M'+n(x-31)+' '+n(b.y+28)+'V'+n(b.y+b.h-29)+'"/>'+
    label(c.title,x,b.y+60,'mv-conclusion-title',esc,{max:titleMax,limit:1})+
    (c.detail?label(c.detail,x,b.y+100,'mv-conclusion-detail',esc,{max:detailMax,limit:2,step:23}):'')+
    '</g>';
 }
 const titleMax=Math.max(12,Math.floor((b.w-68)/(34*.54)));
 const detailMax=Math.max(17,Math.floor((b.w-68)/(22*.54)));
 const twoTitleLines=words(c.title,titleMax,2).length===2;
 const titleY=b.y+(twoTitleLines?179:194);
 const detailY=b.y+(twoTitleLines?250:239);
 return '<g class="mc-card mv-card mv-card--step" data-node-id="'+esc(node.id)+'" data-node-kind="'+esc(node.type)+'">'+surface.defs+
   rect(b.x+6,b.y+13,b.w,b.h,rx,'mv-card-shadow')+
   rect(b.x+9,b.y+6,b.w-4,b.h,rx,'mv-card-backplate')+
   rect(b.x,b.y,b.w,b.h,rx,'mv-card-surface')+
   paintRect(b.x+2,b.y+2,b.w-4,b.h-4,rx-2,'mv-card-material',surface.base)+
   paintRect(b.x+5,b.y+5,b.w-10,b.h*.48,rx-5,'mv-card-gloss',surface.gloss)+
   rect(b.x+27,b.y+12,b.w-54,5,2.5,'mv-card-topline')+
   '<path class="mv-card-midline" d="M'+n(b.x+27)+' '+n(b.y+160)+'H'+n(b.x+b.w-27)+'"/>'+
   artwork(content,b,assets,esc)+
   (Number.isInteger(node.index)?'<text class="mv-card-index" text-anchor="end" x="'+n(b.x+b.w-31)+'" y="'+n(b.y+57)+'">'+String(node.index+1).padStart(2,'0')+'</text>':'')+
   label(c.title,b.x+34,titleY,'mv-card-title',esc,{max:titleMax,limit:2,step:34})+
   (c.detail?label(c.detail,b.x+34,detailY,'mv-card-detail',esc,{max:detailMax,limit:2,step:24}):'')+
   '</g>';
}
function renderStage({scene,geometry}){
 const steps=scene.nodes.filter(x=>x.type==='card').map(x=>geometry.get(x.id)).filter(Boolean);
 if(steps.length<2)return '';
 const left=Math.min(...steps.map(x=>x.x)),right=Math.max(...steps.map(x=>x.x+x.w));
 const top=Math.min(...steps.map(x=>x.y)),bottom=Math.max(...steps.map(x=>x.y+x.h));
 const focus=scene.nodes.find(x=>x.type==='focus'),f=focus?geometry.get(focus.id):null;
 const cx=(left+right)/2,cy=(top+bottom)/2+87,rx=(right-left)/2+67,ry=(f?f.y+f.h-top:bottom-top)*.61;
 const id='mv-light-'+scene.id;
 const upper=top-67,lower=f?f.y+f.h+27:bottom+92;
 const sparks=Array.from({length:47},(_,i)=>{
  const angle=(i+2)*Math.PI*1.67/51+Math.PI*.58;
  const px=cx+Math.cos(angle)*(rx*.83),py=cy+Math.sin(angle)*(ry*.64);
  return '<circle class="mv-stage-spark" cx="'+n(px)+'" cy="'+n(py)+'" r="'+n(.9+i%3*.42)+'"/>';
 }).join('');
 const atmosphere='<defs><radialGradient id="'+id+'-space" cx="49%" cy="54%" r="66%">'+
  '<stop offset="0" class="mv-stage-stop-core"/><stop offset=".57" class="mv-stage-stop-mid"/>'+
  '<stop offset="1" class="mv-stage-stop-edge"/></radialGradient>'+
  '<linearGradient id="'+id+'-shell" x1="0" y1="0" x2="0" y2="1">'+
  '<stop offset="0" class="mv-stage-shell-light"/><stop offset="1" class="mv-stage-shell-dark"/>'+
  '</linearGradient></defs>'+
  '<g class="mv-atmosphere" aria-hidden="true">'+
  '<ellipse class="mv-atmosphere-field" cx="'+n(cx)+'" cy="'+n(cy)+'" rx="'+n(rx*1.13)+'" ry="'+n(ry*1.28)+'" fill="url(#'+id+'-space)"/>'+
  '<path class="mv-stage-current mv-stage-current--high" d="M'+n(left+12)+' '+n(top+18)+' C'+n(cx-rx*.42)+' '+n(upper)+' '+n(cx+rx*.34)+' '+n(upper)+' '+n(right-12)+' '+n(top+18)+'"/>'+
  '<path class="mv-stage-current mv-stage-current--low" d="M'+n(left+50)+' '+n(bottom-25)+' C'+n(cx-rx*.5)+' '+n(lower)+' '+n(cx+rx*.5)+' '+n(lower)+' '+n(right-50)+' '+n(bottom-25)+'"/>'+
  '<g class="mv-stage-sparks">'+sparks+'</g></g>';
 const spatial='<g class="mv-stage-platform" aria-hidden="true">'+
  '<ellipse class="mv-stage-platform-shell" cx="'+n(cx)+'" cy="'+n(cy+29)+'" rx="'+n(rx*.91)+'" ry="'+n(ry*.86)+'" fill="url(#'+id+'-shell)"/>'+
  '<ellipse class="mv-stage-platform-orbit" cx="'+n(cx)+'" cy="'+n(cy+29)+'" rx="'+n(rx*.91)+'" ry="'+n(ry*.86)+'"/>'+
  '<ellipse class="mv-stage-platform-inset" cx="'+n(cx)+'" cy="'+n(cy+29)+'" rx="'+n(rx*.78)+'" ry="'+n(ry*.68)+'"/>'+
  '</g>';
 return {atmosphere,spatial};
}
api.registerDecoration('modular-holographic-stage',renderStage);
window.InnsiktModularVisualLanguage=Object.freeze({version:1,renderCard,renderStage});
})();