/* Context-platform pilot: one source graph, stable composition and object-bound illustrations.
   All factual copy and all edge directions come from slides.json. */
(()=>{
'use strict';
const api=window.InnsiktVisualComposition;
const N=x=>Math.round(x*100)/100;
const P=(b)=>`${N(b.x)} ${N(b.y)} ${N(b.w)} ${N(b.h)}`;
const rect=(b,cls,rx=20)=>`<rect class="${cls}" x="${N(b.x)}" y="${N(b.y)}" width="${N(b.w)}" height="${N(b.h)}" rx="${rx}"/>`;
const txt=(text,x,y,cls,esc,anchor)=>`<text class="${cls}" x="${N(x)}" y="${N(y)}"${anchor?' text-anchor="'+anchor+'"':''}>${esc(text)}</text>`;
function wrap(value,max=34){
 const out=[];let current='';for(const word of String(value||'').split(/\s+/).filter(Boolean)){
  if((current+' '+word).trim().length>max&&current){out.push(current);current=word;}
  else current=(current+' '+word).trim();
 }if(current)out.push(current);if(out.length>2)throw Error('Kontekstkort trenger kortere fagtekst: '+value);return out;
}
function subtext(value,x,y,cls,esc,max=35,step=18){return '<text class="'+cls+'">'+wrap(value,max).map((line,i)=>'<tspan x="'+N(x)+'" y="'+N(y+i*step)+'">'+esc(line)+'</tspan>').join('')+'</text>';}
function pictogram(id,b,assets,esc,side=36){
 if(!id)return '';
 const src=window.InnsiktAssets.src(assets,id);
 return `<image class="acp-icon" data-icon-id="${esc(id)}" x="${N(b.x)}" y="${N(b.y)}" width="${side}" height="${side}" href="${esc(src)}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"/>`;
}
function nodeRoot(node,cls,children,esc){return `<g class="acp-node ${cls}" data-node-id="${esc(node.id)}" data-node-kind="${esc(node.type)}">${children}</g>`;}
const contentFrom=(item)=>({title:item.label,detail:item.detail,assetId:item.assetId});
function contextAdapter(slide){
 const v=slide.visual,config=v.composition;
 const graph=window.InnsiktSlideGraph.validate(v.graph,v);
 const nodes=[{id:'context',type:'context-hub',content:{title:v.contextLabel,detail:v.contextLead}}];
 for(const [group,type] of [['consumers','context-person'],['facets','context-facet'],['sources','context-source'],['cycle','context-step'],['outcomes','context-outcome']]){
  v[group].forEach((item,index)=>nodes.push({id:group+':'+index,type,content:contentFrom(item),index,visual:{motif:(config.motifs||{})[group+':'+index]||({consumers:['collaboration','applications','agents'],facets:['meaning','timeline','boundaries'],sources:['storage','operations','external'],cycle:['decision','action','feedback'],outcomes:['value','delivery','learning']}[group]||[])[index]}}));
 }
 nodes.push({id:'governance',type:'context-governance',content:{title:v.governanceLabel,items:v.governance}});
 nodes.push({id:'heading-consumers',type:'context-section',content:{title:config.labels.consumers}});
 nodes.push({id:'heading-sources',type:'context-section',content:{title:config.labels.sources}});
 nodes.push({id:'heading-cycle',type:'context-section',content:{title:config.labels.cycle}});
 nodes.push({id:'heading-outcomes',type:'context-section',content:{title:v.outcomesTitle}});
 nodes.push({id:'period',type:'context-period',content:{title:v.period}});
 return {version:1,family:'context-atlas',id:slide.id,title:slide.title,cue:slide.cue,subtitle:slide.body||'',
  header:{cueY:65,titleY:130,subtitleY:175},nodes,edges:graph.edges,layers:config.layers||[],variants:config.variants,overrides:config.overrides||{},
  router:'context-atlas',decoration:'context-atlas'};
}
api.registerAdapter('context-platforms',contextAdapter);
const presets={
 'context-architecture':{core:[92,360,1010,192],consumers:[224,224,224],sources:602,cycle:743,facets:463,
   outcomeX:1191,outcomeY:408,outcomeGap:118}
};
for(const [id,plan] of Object.entries(presets)){
 api.registerComposition(id,nodes=>{
  const b=new Map(),{core,consumers,sources,cycle,facets,outcomeX,outcomeY,outcomeGap}=plan;
  const put=(id,x,y,w,h)=>b.set(id,{id,x,y,w,h});
  put('context',...core);
  const columns=[105,443,781],width=315;
  for(let i=0;i<3;i++){
   put('consumers:'+i,columns[i],consumers[i],width,92);
   put('facets:'+i,core[0]+29+i*((core[2]-58-3*296)/2+296),facets,296,81);
   put('sources:'+i,columns[i],sources,width,91);
   put('cycle:'+i,columns[i]+4,cycle,width-8,75);
   put('outcomes:'+i,outcomeX,outcomeY+i*outcomeGap,343,105);
  }
  put('heading-consumers',106,196,290,27);
  put('heading-sources',106,sources-29,290,24);
  put('heading-cycle',106,cycle-31,430,25);
  put('heading-outcomes',outcomeX+16,349,320,38);
  put('governance',88,847,1440,42);
  put('period',1320,87,192,39);
  return nodes.map(node=>{const box=b.get(node.id);if(!box)throw Error('Uplassert kontekstobjekt: '+node.id);return box;});
 });
}
function contextRouter(edge,geom){
 const from=geom.get(edge.from),to=geom.get(edge.to),core=geom.get('context');
 const mid=b=>b.x+b.w/2;
 const hmid=b=>b.y+b.h/2;
 const path=(parts)=>parts.join(' ');
 if(edge.from==='context'&&edge.to.startsWith('consumers:')){
  // The logical link has no reason to bend: align it with the consumer.
  const x=mid(to),start=core.y-3,end=to.y+to.h+4;
  return {path:`M${N(x)} ${N(start)}V${N(end)}`};
 }
 if(edge.from.startsWith('sources:')&&edge.to==='context'){
  // Sources feed the shared context, not the facet directly above them.
  // Straight vertical routes avoid suggesting an unintended one-to-one mapping.
  const x=mid(from),start=from.y-4,end=core.y+core.h+2;
  return {path:`M${N(x)} ${N(start)}V${N(end)}`};
 }
 if(edge.from==='context'&&edge.to==='cycle:0'){
  const x=core.x-5,y=core.y+core.h*.58,tx=to.x,ty=hmid(to);
  return {path:`M${N(x)} ${N(y)} C${N(x-66)} ${N(y+45)} ${N(tx-70)} ${N(ty-56)} ${N(tx-5)} ${N(ty)}`};
 }
 if(edge.from.startsWith('cycle:')&&edge.to.startsWith('cycle:')){
  const x=from.x+from.w+4,y=hmid(from),tx=to.x-5,ty=hmid(to);
  return {path:`M${N(x)} ${N(y)} C${N(x+15)} ${N(y)} ${N(tx-15)} ${N(ty)} ${N(tx)} ${N(ty)}`};
 }
 if(edge.from==='cycle:2'&&edge.to==='context'){
  const x=from.x+from.w+3,y=hmid(from),tx=core.x+core.w+5,ty=core.y+core.h*.57;
  return {path:`M${N(x)} ${N(y)} C${N(x+71)} ${N(y)} ${N(tx+70)} ${N(ty+97)} ${N(tx)} ${N(ty)}`};
 }
 throw Error('Ingen kontekstrelasjonsrute: '+edge.id);
}
api.registerRouter('context-atlas',contextRouter);
function conceptArt(node,b,esc){
 const motif=node.visual?.motif||node.type;
 const shapes={
  collaboration:'<circle cx="-10" cy="-12" r="8"/><circle cx="12" cy="-10" r="7"/><path d="M-28 17Q-26 1-11 1Q4 1 5 19M-2 22Q0 7 14 7Q27 7 29 22"/>',
  applications:'<rect x="-25" y="-20" width="35" height="32" rx="5"/><rect x="-6" y="-7" width="34" height="30" rx="5"/><path d="M-19 -11H1M-1 2H21"/>',
  agents:'<path d="M0-26L23-13V13L0 26L-23 13V-13Z"/><circle r="9"/><path d="M0-26V-34M23 13L30 18M-23 13L-30 18M-9 0H9"/>',
  meaning:'<circle cx="0" cy="-18" r="8"/><circle cx="-21" cy="16" r="8"/><circle cx="21" cy="16" r="8"/><path d="M-5-11L-17 8M5-11L17 8M-12 16H12"/>',
  timeline:'<path d="M-31 0H31M-27-11V11M0-15V15M27-11V11"/><circle cx="-27" cy="0" r="5"/><circle cy="0" r="7"/><circle cx="27" cy="0" r="5"/>',
  boundaries:'<path d="M0-27L25-17V3Q23 23 0 30Q-23 23-25 3V-17Z"/><path d="M-12 1L-2 11L15-9"/>',
  storage:'<ellipse cx="0" cy="-20" rx="25" ry="9"/><path d="M-25-20V18Q0 34 25 18V-20M-25-1Q0 16 25-1"/>',
  operations:'<rect x="-31" y="-22" width="27" height="22" rx="4"/><rect x="5" y="1" width="27" height="22" rx="4"/><path d="M-4-11H9V-6M5 12H-9V17"/>',
  external:'<circle r="27"/><path d="M-27 0H27M0-27Q-19 0 0 27Q19 0 0-27M-19-16H19M-19 16H19"/>',
  decision:'<path d="M0-26L26 0L0 26L-26 0Z"/><path d="M-2-15V0H15M-2 0L-15 13"/>',
  action:'<rect x="-27" y="-21" width="54" height="42" rx="7"/><path d="M-16 0H12M5-10L15 0L5 10"/>',
  feedback:'<path d="M14-20A25 25 0 1 0 25 6M14-20L26-20L23-7"/><circle cx="0" cy="4" r="8"/>',
  value:'<path d="M-28 23H28M-23 14V-2H-11V14M-5 14V-16H7V14M13 14V-25H25V14"/>',
  delivery:'<path d="M-29 15L-8-6L6 5L28-20M12-20H28V-4"/><circle cx="-29" cy="15" r="4"/>',
  learning:'<circle r="8"/><path d="M0-30A30 30 0 0 1 26 15M0 30A30 30 0 0 1-26-15M25 5L26 15L15 14M-25-5L-26-15L-15-14"/>'
 };
 const drawing=shapes[motif]||shapes.meaning;
 const cx=b.x+39,cy=b.y+b.h/2;
 return `<g class="acp-concept" data-concept-role="${esc(motif)}" aria-hidden="true" transform="translate(${N(cx)} ${N(cy)}) scale(.72)">
   <g class="acp-concept-volume"><circle class="acp-concept-disc" r="43"/><circle class="acp-concept-disc acp-concept-disc--inner" cx="-7" cy="-8" r="26"/><path class="acp-concept-shine" d="M-34 14Q-40-25-1-42"/></g>
   <g class="acp-concept-structure">${drawing}</g>
   <g class="acp-concept-points"><circle cx="-37" cy="33" r="3.3"/><circle cx="32" cy="-33" r="2.7"/></g>
  </g>`;
}
function coreNode({node,box:b,esc,assets}){
 const c=node.content;
 return nodeRoot(node,'acp-core',
  rect({x:b.x+16,y:b.y+18,w:b.w-8,h:b.h},'acp-core-depth',33)
  +`<path class="acp-core-architectural-base" d="M${N(b.x+31)} ${N(b.y+9)}H${N(b.x+b.w-12)}L${N(b.x+b.w+11)} ${N(b.y+27)}V${N(b.y+b.h+15)}L${N(b.x+31)} ${N(b.y+b.h+15)}Z"/>`
  +rect({x:b.x+8,y:b.y+8,w:b.w-5,h:b.h},'acp-core-stack',32)
  +rect(b,'acp-core-glass',32)
  +rect({x:b.x+7,y:b.y+6,w:b.w-14,h:b.h*.4},'acp-core-gloss',27)
  +`<path class="acp-core-lightline" d="M${N(b.x+34)} ${N(b.y+3)} H${N(b.x+b.w-34)}"/>`
  +`<rect class="acp-core-marker" x="${N(b.x+23)}" y="${N(b.y+29)}" width="5" height="35" rx="2.5"/>`
  +txt(c.title,b.x+47,b.y+50,'acp-core-title',esc)
  +txt(c.detail,b.x+47,b.y+75,'acp-core-lead',esc)
  +`<circle class="acp-core-pulse" cx="${N(b.x+b.w-45)}" cy="${N(b.y+46)}" r="6"/>`,esc);
}
api.registerObject('context-hub',{version:1,render:coreNode});
function contextCard({node,box:b,esc,assets,level}){
 const c=node.content,t=node.type;
 const visual=t==='context-facet'?'acp-facet':t==='context-person'?'acp-person':t==='context-source'?'acp-source':t==='context-step'?'acp-step':'acp-outcome';
 const ix=t==='context-outcome'?b.x+22:b.x+17,iy=b.y+(b.h-42)/2;
 const tx=(t==='context-outcome'?b.x+84:b.x+78)+(level==='rich-image'?40:0);
 const titleY=b.y+(t==='context-facet'?30:b.h>96?43:35),detailY=titleY+(t==='context-facet'?24:b.h>96?29:27);
 const pill=t==='context-step'?`<circle class="acp-step-index-ring" cx="${N(b.x+b.w-20)}" cy="${N(b.y+20)}" r="11"/>`:'';
 return nodeRoot(node,visual,
  rect({x:b.x+4,y:b.y+8,w:b.w,h:b.h},'acp-card-depth',20)
  +`<path class="acp-card-architectural-base" d="M${N(b.x+15)} ${N(b.y+3)}H${N(b.x+b.w-8)}L${N(b.x+b.w+9)} ${N(b.y+17)}V${N(b.y+b.h+8)}H${N(b.x+15)}Z"/>`
  +rect(b,'acp-card-panel',20)
  +rect({x:b.x+4,y:b.y+3,w:b.w-8,h:b.h*.47},'acp-card-gloss',16)
  +`<ellipse class="acp-card-lens" cx="${N(b.x+55)}" cy="${N(b.y+b.h/2)}" rx="54" ry="${N(b.h*.61)}"/>
  <path class="acp-card-light-rim" d="M${N(b.x+24)} ${N(b.y+4)}H${N(b.x+b.w-29)}"/>`
  +rect({x:b.x+12,y:b.y+12,w:49,h:b.h-24},'acp-icon-plate',14)
  +conceptArt(node,b,esc)
  +(window.InnsiktContextArt?.render(node,b,esc,assets)||'')
  +pictogram(c.assetId,{x:ix+6,y:iy+4},assets,esc,35)
  +txt(c.title,tx,titleY,'acp-card-title',esc)
  +subtext(c.detail,tx,detailY,'acp-card-detail',esc,t==='context-source'?25:t==='context-facet'?24:25,17)
  +pill,esc);
}
for(const kind of ['context-person','context-facet','context-source','context-step','context-outcome'])
 api.registerObject(kind,{version:1,render:contextCard});
api.registerObject('context-section',{version:1,render:({node,box:b,esc})=>nodeRoot(node,'acp-section',
 `<rect x="${N(b.x)}" y="${N(b.y+7)}" width="20" height="3" rx="1.5" class="acp-section-stroke"/>`
 +txt(node.content.title,b.x+29,b.y+15,'acp-section-text',esc),esc)});
api.registerObject('context-period',{version:1,render:({node,box:b,esc})=>nodeRoot(node,'acp-period',
 rect(b,'acp-period-panel',18)+txt(node.content.title,b.x+b.w/2,b.y+25,'acp-period-text',esc,'middle'),esc)});
api.registerObject('context-governance',{version:1,render:({node,box:b,esc})=>{
 const labels=node.content.items||[];
 const xs=[b.x+430,b.x+650,b.x+880,b.x+1150];
 return nodeRoot(node,'acp-governance',rect(b,'acp-governance-panel',16)
  +txt(node.content.title,b.x+22,b.y+27,'acp-governance-title',esc)
  +labels.map((label,i)=>`<circle class="acp-guard-dot" cx="${N(xs[i])}" cy="${N(b.y+22)}" r="4"/>`+txt(label,xs[i]+13,b.y+27,'acp-governance-item',esc)).join(''),esc);
}});
/* Layer A is scene-wide and decorative. Layer B derives solely from actual semantic boxes.
   Never draw an extra relationship: the engine owns the only ten edge paths. */
api.registerDecoration('context-atlas',({geometry,scene})=>{
 const core=geometry.get('context'),id='acp-'+scene.id.replace(/[^a-z0-9-]/g,'');
 const num=v=>N(v);
 const cx=num(core.x+core.w/2),cy=num(core.y+core.h/2);
 const random=n=>{const q=Math.sin(n*78.233+11.71)*43758.5453;return q-Math.floor(q);};
 const dust=Array.from({length:118},(_,i)=>{
  const anchors=[[cx-360,cy-125],[cx+205,cy-30],[cx+575,cy+85],[cx-80,cy+285],[cx+245,cy-260]];
  const [ax,ay]=anchors[i%anchors.length],theta=random(i*4.87)*Math.PI*2;
  const distance=Math.sqrt(random(i*8.41+3))*(110+(i%5)*39);
  const x=N(Math.max(16,Math.min(1584,ax+Math.cos(theta)*distance)));
  const y=N(Math.max(205,Math.min(843,ay+Math.sin(theta)*distance*.8)));
  const radius=N(.4+1.5*random(i*6.89+5));
  return '<circle class="acp-dust-dot" cx="'+x+'" cy="'+y+'" r="'+radius+'" opacity="'+N(.25+random(i*7.22+2)*.65)+'"/>';
 }).join('');
 const nodes=['context',...Array.from({length:3},(_,i)=>['consumers:','facets:','sources:','cycle:','outcomes:'].map(g=>g+i)).flat()];
 const lights=nodes.map(nodeId=>{
  const b=geometry.get(nodeId),focus=nodeId==='context';
  if(!b)return '';
  return '<ellipse class="acp-node-light'+(focus?' acp-node-light--core':'')+'" data-node-light="'+nodeId+'" cx="'+num(b.x+b.w/2)+'" cy="'+num(b.y+b.h*.67)+'" rx="'+num(b.w*(focus?.73:.72))+'" ry="'+num(b.h*(focus?1.95:1.48))+'" fill="url(#'+id+'-node)"/>'+
   '<ellipse class="acp-node-shadow" data-node-shadow="'+nodeId+'" cx="'+num(b.x+b.w/2)+'" cy="'+num(b.y+b.h+10)+'" rx="'+num(b.w*.53)+'" ry="'+num(focus?28:12)+'"/>';
 }).join('');
 const definitions='<defs>'+
  '<radialGradient id="'+id+'-space"><stop offset="0" class="acp-space-inner"/><stop offset=".53" class="acp-space-mid"/><stop offset="1" class="acp-space-outer"/></radialGradient>'+
  '<radialGradient id="'+id+'-node"><stop offset="0" class="acp-node-inner"/><stop offset=".55" class="acp-node-mid"/><stop offset="1" class="acp-node-outer"/></radialGradient>'+
  '<linearGradient id="'+id+'-veil" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" class="acp-veil-top"/><stop offset=".55" class="acp-veil-mid"/><stop offset="1" class="acp-veil-end"/></linearGradient>'+
  '<radialGradient id="'+id+'-cinema" cx=".45" cy=".52" r=".88"><stop offset="0" class="acp-cinema-core"/><stop offset=".52" class="acp-cinema-middle"/><stop offset="1" class="acp-cinema-edge"/></radialGradient>'+
  '<radialGradient id="'+id+'-mist"><stop offset="0" class="acp-organic-mist-core"/><stop offset=".48" class="acp-organic-mist-middle"/><stop offset="1" class="acp-organic-mist-edge"/></radialGradient>'+
  '<linearGradient id="'+id+'-stream" x1="0%" y1="45%" x2="100%" y2="62%"><stop offset="0" class="acp-organic-stream-start"/><stop offset=".47" class="acp-organic-stream-peak"/><stop offset="1" class="acp-organic-stream-end"/></linearGradient>'+
  '<filter id="'+id+'-soften" x="-35%" y="-80%" width="170%" height="260%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="30"/></filter>'+
  '<linearGradient id="acp-context-card-paint" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0" class="acp-card-paint-top"/><stop offset=".53" class="acp-card-paint-mid"/><stop offset="1" class="acp-card-paint-bottom"/></linearGradient>'+
  '<linearGradient id="acp-context-core-paint" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0" class="acp-core-paint-top"/><stop offset=".6" class="acp-core-paint-mid"/><stop offset="1" class="acp-core-paint-bottom"/></linearGradient>'+
  '</defs>';
 const atmosphere=definitions+
  '<rect class="acp-ambient-veil" width="1600" height="900" fill="url(#'+id+'-veil)"/>'+
  '<rect class="acp-cinematic-backdrop" x="0" y="178" width="1600" height="722" fill="url(#'+id+'-cinema)"/>'+

  // Diffuse currents and irregular mist belong to the backdrop, not the semantic graph.
  '<g class="acp-organic-atmosphere" data-atmosphere="organic">'+
   '<g class="acp-organic-mist" filter="url(#'+id+'-soften)">'+
    '<path d="M-100 478C62 304 207 322 353 382C539 462 676 282 860 335C1101 403 1055 507 852 527C660 549 507 482 325 568C144 644 -16 591 -100 478Z" fill="url(#'+id+'-mist)"/>'+
    '<path d="M662 697C815 554 946 554 1081 591C1260 639 1361 428 1640 484L1640 753C1496 848 1306 777 1145 740C958 693 825 830 662 697Z" fill="url(#'+id+'-mist)"/>'+
    '<path d="M-82 753C169 659 308 800 520 733C689 681 817 752 942 807C1107 877 1258 792 1644 774L1644 923H-82Z" fill="url(#'+id+'-mist)"/>'+
    '<ellipse cx="'+num(cx-265)+'" cy="'+num(cy-204)+'" rx="268" ry="148" fill="url(#'+id+'-mist)"/>'+
    '<ellipse cx="'+num(cx+525)+'" cy="'+num(cy-75)+'" rx="258" ry="237" fill="url(#'+id+'-mist)"/>'+
   '</g>'+
   '<g class="acp-organic-streams" filter="url(#'+id+'-soften)">'+
    '<path d="M-110 508C170 364 312 632 563 467C786 319 903 449 1101 425C1280 404 1405 292 1710 347" stroke="url(#'+id+'-stream)" stroke-width="93"/>'+
    '<path d="M-100 665C160 500 318 694 516 579C699 475 854 652 1048 526C1209 422 1446 572 1680 459" stroke="url(#'+id+'-stream)" stroke-width="68"/>'+
    '<path d="M-80 785C150 673 321 820 526 729C760 625 905 792 1108 714C1285 650 1437 697 1690 633" stroke="url(#'+id+'-stream)" stroke-width="121"/>'+
   '</g>'+
   '<g class="acp-organic-twilight">'+
    '<ellipse cx="'+num(cx-170)+'" cy="'+num(cy-90)+'" rx="430" ry="239" fill="url(#'+id+'-mist)"/>'+
    '<ellipse cx="'+num(cx+650)+'" cy="'+num(cy+155)+'" rx="480" ry="270" fill="url(#'+id+'-mist)"/>'+
   '</g>'+
  '</g>'+
  '<ellipse class="acp-ambient-volume" cx="'+cx+'" cy="'+cy+'" rx="'+num(core.w*.89)+'" ry="'+num(core.h*2.5)+'" fill="url(#'+id+'-space)"/>'+
  '<g class="acp-ambient-waves">'+
   '<path d="M-100 686Q390 575 '+cx+' '+num(core.y+core.h*.68)+' T1730 697"/>'+
   '<path d="M-60 753Q480 632 '+cx+' '+num(core.y+core.h*.9)+' T1660 748"/>'+
   '<path d="M-30 835Q560 700 '+cx+' '+num(core.y+core.h*1.35)+' T1640 834"/>'+
  '</g><g class="acp-ambient-particles">'+dust+'</g>';
 const values=Array.from({length:3},(_,i)=>geometry.get('outcomes:'+i));
 const vx=Math.min(...values.map(b=>b.x))-19,vy=Math.min(...values.map(b=>b.y))-14;
 const vw=Math.max(...values.map(b=>b.x+b.w))-vx+23,vh=Math.max(...values.map(b=>b.y+b.h))-vy+23;
 const floor='<g class="acp-scene-stage" data-stage-owner="context">'+
   '<path class="acp-scene-stage-shadow" d="M'+num(core.x-45)+' '+num(core.y+core.h+11)+
    'L'+num(core.x+core.w+29)+' '+num(core.y+core.h+11)+
    'L'+num(core.x+core.w+65)+' '+num(core.y+core.h+42)+
    'L'+num(core.x-20)+' '+num(core.y+core.h+42)+'Z"/>'+
   '<path class="acp-scene-stage-top" d="M'+num(core.x-20)+' '+num(core.y+core.h-15)+
    'L'+num(core.x+core.w+11)+' '+num(core.y+core.h-15)+
    'L'+num(core.x+core.w+31)+' '+num(core.y+core.h+8)+
    'L'+num(core.x+7)+' '+num(core.y+core.h+8)+'Z"/>'+
   '</g>';
 const spatial=floor+
  '<rect class="acp-value-region" x="'+num(vx)+'" y="'+num(vy)+'" width="'+num(vw)+'" height="'+num(vh)+'" rx="35"/>'+
  '<g class="acp-object-light-fields">'+lights+'</g>'+
  '<ellipse class="acp-hub-horizon" cx="'+cx+'" cy="'+num(core.y+core.h*.79)+'" rx="'+num(core.w*.58)+'" ry="'+num(core.h*.65)+'"/>'+
  '<ellipse class="acp-hub-horizon acp-hub-horizon--inner" cx="'+cx+'" cy="'+num(core.y+core.h*.8)+'" rx="'+num(core.w*.46)+'" ry="'+num(core.h*.42)+'"/>'+
  (window.InnsiktContextArt?.decoration(core)||'');
 return {atmosphere,spatial};
});
})();
