/* One semantic scene, one object geometry and one connection plan per slide.
 * Three art directions change only CSS and optional atmosphere, never layout
 * coordinates, semantic nodes, text, arrows or icons.
 * The DOM/SVG is the export source in all directions.
 */
(()=>{
'use strict';
const E=(v,escape)=>escape(String(v??''));
const fmt=v=>Number(v.toFixed(2));
const path=(points)=>points.map(([x,y],i)=>(i?'L':'M')+fmt(x)+' '+fmt(y)).join('')+'Z';
function superellipse(cx,cy,rx,ry,p=4){
 const points=[];
 for(let i=0;i<240;i++){
  const a=2*Math.PI*i/240,c=Math.cos(a),s=Math.sin(a);
  points.push([cx+rx*Math.sign(c)*Math.pow(Math.abs(c),2/p),
   cy+ry*Math.sign(s)*Math.pow(Math.abs(s),2/p)]);
 }
 return path(points);
}
function textLines(value,maxChars=32,maxLines=3){
 const words=String(value??'').split(/\s+/).filter(Boolean),out=[];
 let line='';
 for(const word of words){
  const next=(line?line+' ':'')+word;
  if(line&&next.length>maxChars){out.push(line);line=word;}
  else line=next;
 }
 if(line)out.push(line);
 if(out.length>maxLines)throw Error('Teksten får ikke plass i figuren: '+value);
 return out;
}
function caption(value,x,y,cls,esc,{max=30,lines=2,step=22,anchor='start'}={}){
 return '<text class="'+cls+'" x="'+x+'" y="'+y+'" text-anchor="'+anchor+'">'
  +textLines(value,max,lines).map((t,i)=>'<tspan x="'+x+'" dy="'+(i?step:0)+'">'+E(t,esc)+'</tspan>').join('')
  +'</text>';
}
function title(value,x,y,cls,esc,anchor='start'){
 return '<text class="'+cls+'" x="'+x+'" y="'+y+'" text-anchor="'+anchor+'">'+E(value,esc)+'</text>';
}
function lineArrow(a,b,size=10){
 const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);
 if(l<1)throw Error('Pilretningen er ugyldig');
 const ux=dx/l,uy=dy/l,back=[b[0]-ux*size,b[1]-uy*size],half=size*.4;
 return path([b,[back[0]-uy*half,back[1]+ux*half],[back[0]+uy*half,back[1]-ux*half]]);
}
function edgeSvg(e,esc){
 const attrs=' data-edge-id="'+E(e.id,esc)+'" data-from="'+E(e.from,esc)
  +'" data-to="'+E(e.to,esc)+'" data-relation="'+E(e.relation,esc)+'"';
 return '<g class="di-edge di-edge--'+E(e.kind||'normal',esc)+'"'+attrs+'>'
  +'<path class="di-edge-track" d="'+e.path+'"/>'
  +(e.head?'<path class="di-edge-head" d="'+lineArrow(e.prior,e.tip)+'"/>':'')
  +'</g>';
}
function icon(item,x,y,w,h,assets,esc){
 if(!item.assetId)throw Error('Et semantisk objekt mangler ikon: '+item.label);
 const url=window.InnsiktAssets.src(assets,item.assetId);
 return '<image class="di-icon" data-icon-id="'+E(item.assetId,esc)+'" x="'+x+'" y="'+y
   +'" width="'+w+'" height="'+h+'" href="'+E(url,esc)+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true"/>';
}
function box(x,y,w,h,cls='di-panel',rx=18){
 return '<rect class="'+cls+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'"/>';
}
function genericNode(node,assets,esc){
 const {id,item,x,y,w,h,kind,theme}=node;
 const base='<g class="di-node di-node--'+kind+(theme?' di-node--'+theme:'')
  +'" data-node-id="'+E(id,esc)+'" data-node-kind="'+kind+'">';
 const bg=box(x,y,w,h,'di-node-panel',kind==='facet'?16:19);
 const ix=x+18,iy=y+(h-36)/2;
 const content=icon(item,ix,iy,36,36,assets,esc);
 const textX=x+67;
 const labelY=y+(h>=90?37:32);
 return base+bg+content
  +caption(item.label,textX,labelY,'di-node-title',esc,{max:kind==='cycle'?24:26,lines:2,step:20})
  +caption(item.detail,textX,labelY+25,'di-node-detail',esc,{max:kind==='source'?30:26,lines:2,step:18})
  +'</g>';
}
function contextModel(slide){
 const v=slide.visual;
 for(const key of ['consumers','facets','sources','cycle','outcomes'])
  if(!Array.isArray(v[key])||v[key].length!==3)
   throw Error('Kontekstkomposisjon krever tre elementer i '+key);
 const graph=window.InnsiktSlideGraph.validate(v.graph,v);
 const nodes=[];
 const add=(group,coords)=>v[group].forEach((item,i)=>nodes.push({
  id:group+':'+i,kind:group==='consumers'?'consumer':group==='facets'?'facet':
   group==='sources'?'source':group==='cycle'?'cycle':'outcome',
  item,...coords[i]}));
 add('consumers',[{x:123,y:218,w:308,h:82},{x:446,y:218,w:308,h:82},{x:769,y:218,w:308,h:82}]);
 add('facets',[{x:144,y:462,w:294,h:82},{x:453,y:462,w:294,h:82},{x:762,y:462,w:294,h:82}]);
 add('sources',[{x:122,y:600,w:312,h:88},{x:444,y:600,w:312,h:88},{x:766,y:600,w:312,h:88}]);
 add('cycle',[{x:198,y:746,w:266,h:78},{x:488,y:746,w:266,h:78},{x:778,y:746,w:266,h:78}]);
 add('outcomes',[{x:1207,y:392,w:313,h:96},{x:1207,y:508,w:313,h:96},{x:1207,y:624,w:313,h:96}]);
 const routes=new Map();
 const route=(from,to,p,tip,prior,head=true,kind='normal')=>
  routes.set(from+'>'+to,{path:p,tip,prior,head,kind});
 const tops=[276,600,924];
 for(let i=0;i<3;i++){
  const x=tops[i];
  route('context','consumers:'+i,'M'+x+' 346V300',[x,300],[x,346],true,'supply');
 }
 // All three sources share one inlet, but retain three canonical edge IDs.
 route('sources:0','context','M278 600V579Q278 573 284 573H600',null,null,false,'inlet');
 route('sources:1','context','M600 600V578',[600,578],[600,600],true,'inlet');
 route('sources:2','context','M922 600V579Q922 573 916 573H600',null,null,false,'inlet');
 route('context','cycle:0','M74 481C23 503 24 717 95 761Q129 784 198 784',
  [198,784],[129,784],true,'feedback');
 route('cycle:0','cycle:1','M464 784H488',[488,784],[464,784],true,'process');
 route('cycle:1','cycle:2','M754 784H778',[778,784],[754,784],true,'process');
 route('cycle:2','context','M1044 784C1155 786 1160 697 1160 618C1160 550 1142 502 1140 482',
  [1140,482],[1142,502],true,'feedback');
 const edges=graph.edges.map(g=>{
  const r=routes.get(g.from+'>'+g.to);
  if(!r)throw Error('Ingen geometrisk rute for '+g.id);
  return {...g,...r};
 });
 return {id:slide.id,scene:v.scene,kind:'context',slide,
  nodes,edges,context:{cx:600,cy:455,rx:545,ry:122,power:4},
  backgrounds:['context-rich-background']};
}
function chainModel(slide){
 const v=slide.visual;
 if(v.stages?.length!==4||v.guardrails?.length!==3)
  throw Error('Verdikjeden krever fire prosesstrinn og tre forutsetninger');
 const xs=[91,460,829,1198];
 const nodes=v.stages.map((item,i)=>({
  id:'stages:'+i,kind:'stage',item,x:xs[i],y:411,w:309,h:273
 }));
 const edges=[];
 const add=(id,from,to,d,tip,prior)=>edges.push({id,from,to,relation:'advances',
  path:d,tip,prior,head:true,kind:'process'});
 // Explicitly derived from canonical stage order, without a second visual graph.
 add('flow-start','input','stages:0','M363 341V374H245V411',[245,411],[245,374]);
 for(let i=0;i<3;i++){
  const x=xs[i]+309,end=xs[i+1];
  add('flow-'+i,'stages:'+i,'stages:'+(i+1),
   'M'+x+' 548H'+end,[end,548],[x,548]);
 }
 add('flow-result','stages:3','output','M1352 411V374H1268V341',
  [1268,341],[1268,374]);
 return {id:slide.id,scene:v.scene,kind:'chain',slide,nodes,edges,backgrounds:[]};
}
function create(slide){
 if(slide.visual?.scene==='context-platforms')return contextModel(slide);
 if(slide.visual?.scene==='insight-ecosystem')return chainModel(slide);
 throw Error('Ingen felles scenekomposisjon for '+slide.visual?.scene);
}
function contextContent(model,assets,esc){
 const v=model.slide.visual;
 const core=model.context;
 const primary=box(104,205,988,106,'di-consumer-band',29)
   +'<path class="di-division" d="M440 222V292M763 222V292"/>';
 const shape='<path data-node-id="context" class="di-context-panel" d="'
  +superellipse(core.cx,core.cy,core.rx,core.ry,core.power)+'"/>';
 const coreHead=title(v.contextLabel,600,415,'di-context-title',esc,'middle')
   +title(v.contextLead,600,444,'di-context-lead',esc,'middle');
 const process=box(180,732,897,106,'di-process-band',23);
 const outcome=box(1189,321,346,434,'di-outcome-band',24)
  +title(v.outcomesTitle||'Mulig verdi',1213,364,'di-outcome-heading',esc)
  +'<path class="di-divider" d="M1215 376H1505"/>';
 const gover='<g class="di-governance"><path d="M100 860H1113" class="di-governance-rule"/>'
  +title(v.governanceLabel,298,883,'di-governance-name',esc)
  +title(v.governance.join(' · '),460,883,'di-governance-detail',esc)+'</g>';
 return '<g class="di-geometry">'+primary+shape+coreHead+process+outcome
  +gover+'</g>';
}
function chainContent(model,assets,esc){
 const v=model.slide.visual;
 const start=box(84,225,562,116,'di-endpoint-band',22)
  +title(v.inputLabel,108,258,'di-endpoint-kicker',esc)
  +caption(v.input,108,296,'di-endpoint-value',esc,{max:37,lines:2,step:30});
 const end=box(916,225,600,116,'di-endpoint-band',22)
  +title(v.outputLabel,942,258,'di-endpoint-kicker',esc)
  +caption(v.output,942,293,'di-endpoint-value',esc,{max:39,lines:2,step:29});
 const bar=box(86,734,1430,95,'di-foundation-band',19);
 const labels=title(v.foundationLabel,112,760,'di-foundation-heading',esc)
  +v.guardrails.map((g,i)=>title(g,[336,755,1110][i],789,
   'di-foundation-label',esc)).join('');
 const conclusion=caption(v.conclusion,89,861,'di-conclusion',esc,{max:108,lines:2,step:22});
 return '<g class="di-geometry">'+start+end+bar+labels+conclusion+'</g>';
}
function nodesSvg(model,assets,esc){
 if(model.kind==='context')return model.nodes.map(n=>genericNode(n,assets,esc)).join('');
 return model.nodes.map((n,i)=>{
  const {x,y,w,h,item}=n;
  return '<g class="di-node di-node--stage" data-node-id="'+n.id+'" data-node-kind="stage">'
   +box(x,y,w,h,'di-node-panel',20)
   +title(String(i+1).padStart(2,'0'),x+23,y+448-411,'di-stage-number',esc)
   +icon(item,x+w-79,y+37,46,46,assets,esc)
   +caption(item.title,x+24,y+135,'di-stage-title',esc,{max:23,lines:2,step:29})
   +caption(item.detail,x+24,y+208,'di-stage-detail',esc,{max:31,lines:2,step:24})
   +'</g>';
 }).join('');
}
function stageBackground(model,assets,esc){
 const photo=model.backgrounds.length?window.InnsiktAssets.src(assets,model.backgrounds[0]):null;
 return '<g class="di-atmosphere" aria-hidden="true">'
  +'<rect class="di-background-base" x="0" y="0" width="1600" height="900"/>'
  +(photo?'<image class="di-background-photo" data-photo-role="atmosphere" href="'
   +E(photo,esc)+'" x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice"/>':'')
  +'<ellipse class="di-background-halo" cx="1280" cy="240" rx="385" ry="355"/>'
  +'<circle class="di-orbit" cx="1315" cy="161" r="115"/>'
  +'<circle class="di-orbit di-orbit--small" cx="1315" cy="161" r="68"/>'
  +'<path class="di-orbit-track" d="M1177 183Q1315 10 1460 181"/>'
  +'<path class="di-mesh" d="M0 700L800 367L1600 700M0 800L800 490L1600 800M0 880L800 620L1600 880"/>'
  +'</g>';
}
function render(slide,assets,esc){
 const model=create(slide),v=slide.visual;
 const head='<g class="di-header">'
  +'<path class="di-kicker-rule" d="M66 57H107"/>'
  +title(slide.cue,125,65,'di-kicker',esc)
  +title(slide.title,68,130,'di-main-title'+(model.kind==='chain'?' di-main-title--long':''),esc)
  +(v.period?title(v.period,875,130,'di-period',esc):'')
  +caption(model.kind==='context'?slide.body:v.subtitle,68,174,
   'di-subtitle',esc,{max:135,lines:2,step:26})
  +'</g>';
 const elements=model.kind==='context'?contextContent(model,assets,esc):chainContent(model,assets,esc);
 const svg='<svg class="di-svg" data-unified-scene="'+E(model.scene,esc)+'"'
  +' data-layout-contract="1" xmlns="http://www.w3.org/2000/svg" width="1600" height="900"'
  +' viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" role="img"'
  +' aria-label="'+E(slide.title,esc)+'">'
  +stageBackground(model,assets,esc)+head
  +'<g class="di-edges" aria-hidden="true">'+model.edges.map(e=>edgeSvg(e,esc)).join('')+'</g>'
  +elements+'<g class="di-nodes">'+nodesSvg(model,assets,esc)+'</g>'
  +'</svg>';
 return '<div class="story-scene scene-'+E(model.scene,esc)
  +' scene-unified-diagram" data-scene-contract="1" data-scene-layout="'+model.kind+'">'
  +svg+'<div class="cp-brand-overlay" data-brand-overlay="true" aria-hidden="true"></div></div>';
}
window.InnsiktDiagramScene={create,render,superellipse,textLines};
})();