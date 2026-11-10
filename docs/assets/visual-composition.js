/* Modular visual scene engine v1. Semantic data -> pluggable composition -> object registry -> SVG.
   Nothing in this file owns business copy, a brand palette or a particular slide geometry. */
(()=>{
'use strict';
const objectTypes=new Map(),compositions=new Map(),adapters=new Map(),routers=new Map(),decorators=new Map();
function registerAdapter(name,fn){if(!idOk(name)||typeof fn!=='function'||adapters.has(name))throw Error('Ugyldig sceneadapter: '+name);adapters.set(name,fn);}
function registerRouter(name,fn){if(!idOk(name)||typeof fn!=='function'||routers.has(name))throw Error('Ugyldig relasjonsruter: '+name);routers.set(name,fn);}
function registerDecoration(name,fn){if(!idOk(name)||typeof fn!=='function'||decorators.has(name))throw Error('Ugyldig dekorasjonslag: '+name);decorators.set(name,fn);}
const idOk=id=>typeof id==='string'&&/^[a-z][a-z0-9-]*(?::[a-z0-9-]+)?$/.test(id);
const numeric=n=>typeof n==='number'&&Number.isFinite(n);
const n=n=>Math.round(n*100)/100;
function registerObject(name,implementation){
 if(!idOk(name)||typeof implementation?.render!=='function'||objectTypes.has(name))
  throw Error('Ugyldig eller eksisterende objektkontrakt: '+name);
 objectTypes.set(name,Object.freeze({...implementation}));
}
function registerComposition(name,implementation){
 if(!idOk(name)||typeof implementation!=='function'||compositions.has(name))
  throw Error('Ugyldig eller eksisterende komposisjon: '+name);
 compositions.set(name,implementation);
}
function fromSlide(slide){
 const v=slide.visual||{},config=v.composition;
 if(config?.engine!=='modular-v1')throw Error('Lysbildet bruker ikke modulær scene: '+slide.id);
 const adapter=adapters.get(v.scene);
 if(adapter)return adapter(slide);
 if(v.scene!=='list')throw Error('Mangler semantisk adapter for '+v.scene);
 const family=config.family||'general';
 if(!idOk(family))throw Error('Ugyldig scenefamilie');
 const visualSystem=config.visualSystem||null;
 const nodes=(v.items||[]).map((title,i)=>({id:'item:'+i,type:'card',index:family==='story-flow'?i:undefined,
  visual:{system:visualSystem,artAssetId:v.itemArtAssetIds?.[i]||null},
  content:{title,detail:v.detail?.[i]||'',assetId:v.itemAssetIds?.[i]||null}}));
 if(v.conclusion)nodes.push({id:'outcome',type:'focus',visual:{
  system:visualSystem,artAssetId:v.conclusion.artAssetId||null},content:v.conclusion});
 return {version:1,id:slide.id,family,visualSystem,motion:config.motion||null,decoration:config.decoration||null,
  title:slide.title,cue:slide.cue,subtitle:slide.body||'',header:config.header||null,
  nodes,edges:config.edges||[],layers:config.layers||[],
  variants:config.variants||{standard:'columns'},overrides:config.overrides||{}};
}
function validate(scene){
 if(scene?.version!==1||!idOk(scene.id)||!Array.isArray(scene.nodes)||
    !scene.nodes.length||scene.nodes.length>24||!Array.isArray(scene.edges||[]))
  throw Error('Ugyldig faglig scene v1');
 const ids=new Set();
 for(const o of scene.nodes){
  if(!idOk(o.id)||ids.has(o.id)||!objectTypes.has(o.type))
   throw Error('Ugyldig, duplisert eller ukjent sceneobjekt: '+o.id);
  if(typeof o.content?.title!=='string'||!o.content.title.trim())
   throw Error('Objektet mangler kanonisk tittel: '+o.id);
  ids.add(o.id);
 }
 const edgeIds=new Set();
 for(const e of scene.edges||[]){
  if(!idOk(e.id)||edgeIds.has(e.id)||!ids.has(e.from)||!ids.has(e.to)||e.from===e.to||
     typeof e.relation!=='string'||!idOk(e.relation))
   throw Error('Ugyldig faglig relasjon: '+e.id);
  edgeIds.add(e.id);
 }
 const layers=new Set();
 for(const l of scene.layers||[]){
  if(!idOk(l.id)||layers.has(l.id)||!['image','glow','grid'].includes(l.type))
   throw Error('Ugyldig billedlag: '+l.id);
  layers.add(l.id);
  if(l.type==='image'&&!idOk(l.assetId)&&!l.themeAssets)throw Error('Billedlag mangler ressurs: '+l.id);
  for(const asset of Object.values(l.themeAssets||{}))if(!idOk(asset))throw Error('Ugyldig temaressurs: '+l.id);
 }
 for(const key of Object.values(scene.variants||{}))if(!compositions.has(key))
  throw Error('Ukjent komposisjon: '+key);
 return scene;
}
function band(nodes,{x=88,y=320,width=1424,gap=34,h=270}={}){
 const w=Math.min(430,(width-gap*(nodes.length-1))/nodes.length);
 const start=x+(width-(w*nodes.length+gap*(nodes.length-1)))/2;
 return nodes.map((o,i)=>({id:o.id,x:n(start+i*(w+gap)),y,w:n(w),h}));
}
registerComposition('columns',nodes=>band(nodes));
registerComposition('stagger',nodes=>band(nodes,{y:335,h:290}).map((b,i)=>({
 ...b,y:b.y+(i%2?68:-20)})));
registerComposition('orbit',nodes=>{
 if(nodes.length===3)return nodes.map((o,i)=>({id:o.id,
  x:[86,593,1100][i],y:[405,260,405][i],w:412,h:285}));
 const w=340,h=230,cx=800,cy=535,rX=550,rY=210;
 return nodes.map((o,i)=>{const a=-Math.PI/2+2*Math.PI*i/nodes.length;
  return {id:o.id,x:n(cx+rX*Math.cos(a)-w/2),y:n(cy+rY*Math.sin(a)-h/2),w,h};});
});
registerComposition('hierarchy',nodes=>{
 const top={id:nodes[0].id,x:585,y:245,w:430,h:220};
 return [top,...band(nodes.slice(1),{x:95,y:590,width:1410,gap:38,h:215})];
});
registerComposition('network',nodes=>{
 const cx=800,cy=490;
 return nodes.map((o,i)=>i===0?{id:o.id,x:625,y:365,w:350,h:235}:{
  id:o.id,x:n(cx+570*Math.cos(2*Math.PI*(i-1)/(nodes.length-1)-Math.PI/2)-170),
  y:n(cy+270*Math.sin(2*Math.PI*(i-1)/(nodes.length-1)-Math.PI/2)-110),w:340,h:220});
});
registerComposition('flow',nodes=>band(nodes,{y:340,h:250}));
/* Reusable four-stage explanation plus one takeaway. No copy or slide IDs here. */
registerComposition('flow-with-outcome',nodes=>{
 const steps=nodes.slice(0,-1),conclusion=nodes[nodes.length-1];
 if(steps.length<3||steps.length>5||conclusion?.type!=='focus'||
    steps.some(node=>node.type!=='card'))
  throw Error('Flow med konklusjon krever tre til fem steg og ett utfall');
 const base=band(steps,{x:84,y:312,width:1432,gap:36,h:300});
 return [...base,{id:conclusion.id,x:245,y:685,w:1110,h:140}];
});
function anchors(box){
 return {left:[box.x,box.y+box.h/2],right:[box.x+box.w,box.y+box.h/2],
  top:[box.x+box.w/2,box.y],bottom:[box.x+box.w/2,box.y+box.h]};
}
function route(from,to){
 const dx=to.x+to.w/2-(from.x+from.w/2),dy=to.y+to.h/2-(from.y+from.h/2);
 const horizontal=Math.abs(dx/Math.max(1,(from.w+to.w)/2))>=Math.abs(dy/Math.max(1,(from.h+to.h)/2));
 const side=horizontal?(dx>=0?'right':'left'):(dy>=0?'bottom':'top');
 const opposite={left:'right',right:'left',top:'bottom',bottom:'top'};
 const [sx,sy]=anchors(from)[side],[ex,ey]=anchors(to)[opposite[side]];
 const bend=horizontal?Math.max(32,Math.abs(ex-sx)*.45):Math.max(32,Math.abs(ey-sy)*.45);
 const sign=side==='right'||side==='bottom'?1:-1;
 const c1=horizontal?[sx+sign*bend,sy]:[sx,sy+sign*bend];
 const c2=horizontal?[ex-sign*bend,ey]:[ex,ey-sign*bend];
 return 'M'+n(sx)+' '+n(sy)+' C'+n(c1[0])+' '+n(c1[1])+' '+n(c2[0])+' '+n(c2[1])+' '+n(ex)+' '+n(ey);
}
function compile(input,direction='standard'){
 const scene=validate(input.visual?fromSlide(input):input);
 if(!['standard','rich','rich-image'].includes(direction))throw Error('Ukjent visuell fremstilling');
 const composition=scene.variants?.[direction]||scene.variants?.standard||'columns';
 const boxes=compositions.get(composition)(scene.nodes);
 if(!Array.isArray(boxes)||boxes.length!==scene.nodes.length)throw Error('Komposisjonen må plassere alle objekter');
 const overrides=scene.overrides?.[direction]?.positions||{};
 const geometry=new Map();
 for(const box of boxes){
  const p={...box,...(overrides[box.id]||{})};
  if(!['x','y','w','h'].every(k=>numeric(p[k]))||p.w<=0||p.h<=0||geometry.has(p.id))
   throw Error('Ugyldig komposisjonsgeometri: '+p.id);
  geometry.set(p.id,p);
 }
 for(const node of scene.nodes)if(!geometry.has(node.id))throw Error('Komposisjon mangler objekt: '+node.id);
 const customRoute=scene.router?routers.get(scene.router):null;
 if(scene.router&&!customRoute)throw Error('Ukjent relasjonsruter: '+scene.router);
 return {scene,direction,composition,geometry,
  edges:(scene.edges||[]).map(e=>{
   const result=customRoute?customRoute(e,geometry,direction):route(geometry.get(e.from),geometry.get(e.to));
   const details=typeof result==='string'?{path:result}:result;
   if(!details?.path||!/^M/.test(details.path))throw Error('Relasjon uten geometrisk bane: '+e.id);
   return {...e,...details};
  })};
}
function lines(value,max=34,limit=3){
 const chunks=[],words=String(value||'').trim().split(/\s+/).filter(Boolean);let line='';
 for(const word of words){
  if(word.length>max)throw Error('For langt ord i sceneobjekt: '+word);
  const next=line?line+' '+word:word;
  if(next.length>max&&line){chunks.push(line);line=word;}else line=next;
 }
 if(line)chunks.push(line);
 if(chunks.length>limit)throw Error('For mye tekst i sceneobjekt: '+value);
 return chunks;
}
function text(value,x,y,cls,esc,{max=40,limit=3,spacing=24}={}){
 return '<text class="'+cls+'" x="'+n(x)+'" y="'+n(y)+'">'+
  lines(value,max,limit).map((line,i)=>'<tspan x="'+n(x)+'" dy="'+(i?spacing:0)+'">'+esc(line)+'</tspan>').join('')+'</text>';
}
function basicCard({node,box:b,esc,assets,level}){
 if(node.visual?.system==='holographic-v1'){
  const language=window.InnsiktModularVisualLanguage;
  if(!language?.renderCard)throw Error('Den delte illustrasjonsmotoren er ikke lastet');
  return language.renderCard({node,box:b,esc,assets,level});
 }
 const c=node.content,compact=b.h<230,max=Math.max(18,Math.floor((b.w-56)/12.5));
 const src=c.assetId?window.InnsiktAssets.src(assets,c.assetId):null;
 if(node.type==='focus'){
  return '<g class="mc-card mc-card-focus" data-node-id="'+esc(node.id)+'" data-node-kind="focus">'
   +'<rect class="mc-card-shadow" x="'+n(b.x+6)+'" y="'+n(b.y+7)+'" width="'+n(b.w)+'" height="'+n(b.h)+'" rx="25"/>'
   +'<rect class="mc-card-surface" x="'+n(b.x)+'" y="'+n(b.y)+'" width="'+n(b.w)+'" height="'+n(b.h)+'" rx="25"/>'
   +(src?'<image class="mc-icon" href="'+esc(src)+'" x="'+n(b.x+27)+'" y="'+n(b.y+24)+'" width="72" height="72" preserveAspectRatio="xMidYMid meet"/>':'')
   +text(c.title,b.x+(src?125:36),b.y+52,'mc-card-title',esc,{max:72,limit:2,spacing:31})
   +(c.detail?text(c.detail,b.x+(src?125:36),b.y+85,'mc-card-detail',esc,{max:76,limit:2,spacing:22}):'')
   +'</g>';
 }
 return '<g class="mc-card" data-node-id="'+esc(node.id)+'" data-node-kind="'+esc(node.type)+'">'
  +'<rect class="mc-card-shadow" x="'+n(b.x+6)+'" y="'+n(b.y+12)+'" width="'+n(b.w)+'" height="'+n(b.h)+'" rx="27"/>'
  +'<rect class="mc-card-surface" x="'+n(b.x)+'" y="'+n(b.y)+'" width="'+n(b.w)+'" height="'+n(b.h)+'" rx="27"/>'
  +'<path class="mc-card-glint" d="M'+n(b.x+26)+' '+n(b.y+12)+' H'+n(b.x+b.w-26)+'"/>'
  +(Number.isInteger(node.index)?'<text class="mc-card-sequence" x="'+n(b.x+b.w-39)+'" y="'+n(b.y+56)+'" text-anchor="end">'+String(node.index+1).padStart(2,'0')+'</text>':'')
  +(src?'<image class="mc-icon" href="'+esc(src)+'" x="'+n(b.x+28)+'" y="'+n(b.y+27)+'" width="52" height="52" preserveAspectRatio="xMidYMid meet" aria-hidden="true"/>':'')
  +text(c.title,b.x+30,b.y+(compact?118:139),'mc-card-title',esc,{max,limit:3,spacing:31})
  +(c.detail?text(c.detail,b.x+30,b.y+(compact?177:213),'mc-card-detail',esc,{max:max+4,limit:3,spacing:22}):'')
  +'</g>';
}
registerObject('card',{version:1,render:basicCard,anchors});
registerObject('focus',{version:1,render:basicCard,anchors});
function drawLayers(layers,assets,esc){
 const result=[];
 for(const layer of layers){
  if(layer.type==='glow')result.push('<ellipse class="mc-layer-glow" data-layer-id="'+esc(layer.id)+'" cx="800" cy="560" rx="640" ry="310"/>');
  if(layer.type==='grid')result.push('<path class="mc-layer-grid" data-layer-id="'+esc(layer.id)+'" d="M0 700H1600M0 790H1600M260 200V900M800 200V900M1340 200V900"/>');
  if(layer.type==='image'){
   const images=layer.themeAssets?Object.entries(layer.themeAssets):[['all',layer.assetId]];
   for(const [tone,id] of images){
    const src=window.InnsiktAssets.src(assets,id);
    result.push('<image class="mc-layer-image" data-layer-id="'+esc(layer.id)+'" data-layer-tone="'+esc(tone)+'" href="'+esc(src)+'" x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"/>');
   }
  }
 }
 return result.join('');
}
/* An indicator travels along the already validated semantic edge.
   It is decorative, uses no extra graph relationship, and is styled only by
   the opt-in context skin. Negative beginnings distribute simultaneous signals. */
function edgePacket(edge,index,scene,esc){
 if(scene.motion!=='packets'&&scene.family!=='context-atlas')return '';
 const cycle=edge.from.startsWith('cycle:')&&edge.to.startsWith('cycle:');
 const shortFlow=scene.family==='story-flow';
 const duration=shortFlow?2.9:cycle?1.95:edge.relation==='updates'?6.4:
  edge.from.startsWith('sources:')?3.15:edge.to.startsWith('consumers:')?3.45:4.85;
 const delay=-((index*1.37)%duration).toFixed(2);
 return '<g class="mc-edge-packet" aria-hidden="true">'
  +'<circle class="mc-edge-packet-halo" r="12"/>'
  +'<circle class="mc-edge-packet-point" r="5.1"/>'
  +'<animateMotion dur="'+duration+'s" begin="'+delay+'s" repeatCount="indefinite" rotate="auto" path="'+esc(edge.path)+'"/>'
  +'</g>';
}
/* A visible direction cue belongs to the canonical path, never to a second
   hardcoded drawing. Draw it inside the available corridor so the destination
   card does not cover it. The same edge also carries the animated packet. */
function inlineEdgeArrow(edge,scene){
 if(!(scene.motion==='packets'||scene.family==='context-atlas')||
    !['supports','advances','updates'].includes(edge.relation))
  return '';
 const values=(edge.path.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
 if(values.length!==8||!values.every(Number.isFinite))
  throw Error('Kontekstsløyfen har ugyldig kurve: '+edge.id);
 const [x0,y0,x1,y1,x2,y2,x3,y3]=values;
 const point=t=>{
  const u=1-t;
  return [u*u*u*x0+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x3,
   u*u*u*y0+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3];
 };
 const t=edge.relation==='advances'?.72:.83;
 const [x,y]=point(t),[px,py]=point(t-.055);
 const distance=Math.hypot(x-px,y-py)||1,ux=(x-px)/distance,uy=(y-py)/distance;
 const bx=x-ux*10.5,by=y-uy*10.5,w=4.75,round=v=>Math.round(v*100)/100;
 return '<path class="mc-edge-direction" aria-hidden="true" d="M'
  +round(x)+' '+round(y)+'L'+round(bx-uy*w)+' '+round(by+ux*w)
  +'L'+round(bx+uy*w)+' '+round(by-ux*w)+'Z"/>';
}
function renderScene(input,assets,esc,direction='standard'){
 const plan=compile(input,direction),{scene,geometry}=plan;
 const marker='mc-arrow-'+scene.id;
 const header=scene.header||{};
 const head='<g class="mc-heading">'+text(scene.cue||'',86,header.cueY||80,'mc-eyebrow',esc,{max:90,limit:1})+
  text(scene.title||'',84,header.titleY||160,'mc-title',esc,{max:62,limit:2,spacing:55})+
  text(scene.subtitle||'',86,header.subtitleY||226,'mc-subtitle',esc,{max:112,limit:2,spacing:26})+'</g>';
 const layers=drawLayers(scene.layers||[],assets,esc);
 const decoration=scene.decoration?decorators.get(scene.decoration):null;
 if(scene.decoration&&!decoration)throw Error('Ukjent dekorasjonslag: '+scene.decoration);
 const decorativeSvg=decoration?decoration({scene,geometry,edges:plan.edges,direction,esc,assets}):'<ellipse cx="805" cy="535" rx="495" ry="230"/><ellipse cx="805" cy="535" rx="390" ry="165"/>';
 const decorationLayers=typeof decorativeSvg==='string'?{atmosphere:decorativeSvg}:decorativeSvg;
 const edges=plan.edges.map((e,i)=>{
  const fixedHead=inlineEdgeArrow(e,scene);
  return '<g class="mc-edge" data-edge-id="'+esc(e.id)+'" data-from="'+esc(e.from)+'" data-to="'+esc(e.to)+'" data-relation="'+esc(e.relation)+'"><title>'+esc(e.relation)+'</title><path class="mc-edge-ambient" d="'+e.path+'"/><path class="mc-edge-track" d="'+e.path+'"'+(e.head===false||fixedHead?'':' marker-end="url(#'+marker+')"')+'/><path class="mc-edge-lumen" d="'+e.path+'"/>'+fixedHead+edgePacket(e,i,scene,esc)+'</g>';
 }).join('');
 const objects=scene.nodes.map(o=>objectTypes.get(o.type).render({node:o,box:geometry.get(o.id),esc,assets,level:direction})).join('');
 return '<div class="story-scene scene-modular-v1" data-scene-contract="2" data-visual-system="'+esc(scene.visualSystem||'base')+'" data-composition-level="'+esc(direction)+'" data-composition="'+esc(plan.composition)+'" data-scene-id="'+esc(scene.id)+'" data-scene-family="'+esc(scene.family||'general')+'">'
  +'<svg class="mc-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" role="img" aria-label="'+esc(scene.title)+'">'
  +'<defs><marker id="'+marker+'" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 1L8 4.5L1 8Z" class="mc-arrow-head"/></marker></defs>'
  +'<rect class="mc-backdrop" width="1600" height="900"/>'
  +'<g class="mc-layers" aria-hidden="true">'+layers+'</g>'
  +'<g class="mc-decor" aria-hidden="true">'+(decorationLayers.atmosphere||'')+'</g>'
  +'<g class="mc-spatial" aria-hidden="true">'+(decorationLayers.spatial||'')+'</g>'
  +head+'<g class="mc-edges">'+edges+'</g><g class="mc-nodes">'+objects+'</g></svg>'
  +'<div class="cp-brand-overlay" data-brand-overlay="true" aria-hidden="true"></div></div>';
}
window.InnsiktVisualComposition={version:1,registerObject,registerComposition,registerAdapter,registerRouter,registerDecoration,fromSlide,validate,compile,route,renderScene,
 renderSlide:(slide,assets,esc,direction='standard')=>renderScene(fromSlide(slide),assets,esc,direction)};
})();
