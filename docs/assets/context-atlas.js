/* Context-platform pilot: one source graph, independent compositions, registered objects.
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
  v[group].forEach((item,index)=>nodes.push({id:group+':'+index,type,content:contentFrom(item),index}));
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
   outcomeX:1191,outcomeY:408,outcomeGap:118},
 'context-glass':{core:[83,356,1034,201],consumers:[223,214,223],sources:600,cycle:744,facets:463,
   outcomeX:1191,outcomeY:404,outcomeGap:122},
 'context-atmosphere':{core:[76,350,1051,220],consumers:[223,211,223],sources:616,cycle:750,facets:472,
   outcomeX:1191,outcomeY:398,outcomeGap:122}
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
  const index=Number(edge.to.split(':')[1]);
  const sx=core.x+core.w*[.17,.5,.83][index],sy=core.y-3,tx=mid(to),ty=to.y+to.h+4;
  return {path:`M${N(sx)} ${N(sy)} C${N(sx)} ${N(sy-27)} ${N(tx)} ${N(ty+24)} ${N(tx)} ${N(ty)}`};
 }
 if(edge.from.startsWith('sources:')&&edge.to==='context'){
  const sx=mid(from),sy=from.y-4,ty=core.y+core.h+2;
  const tx=core.x+core.w*[.17,.5,.83][Number(edge.from.split(':')[1])];
  return {path:`M${N(sx)} ${N(sy)} C${N(sx)} ${N(sy-17)} ${N(tx)} ${N(ty+16)} ${N(tx)} ${N(ty)}`};
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
function coreNode({node,box:b,esc}){
 const c=node.content;
 return nodeRoot(node,'acp-core',
  rect({x:b.x+16,y:b.y+18,w:b.w-8,h:b.h},'acp-core-depth',33)
  +rect({x:b.x+8,y:b.y+8,w:b.w-5,h:b.h},'acp-core-stack',32)
  +rect(b,'acp-core-glass',32)
  +`<path class="acp-core-lightline" d="M${N(b.x+34)} ${N(b.y+3)} H${N(b.x+b.w-34)}"/>`
  +`<rect class="acp-core-marker" x="${N(b.x+23)}" y="${N(b.y+29)}" width="5" height="35" rx="2.5"/>`
  +txt(c.title,b.x+47,b.y+50,'acp-core-title',esc)
  +txt(c.detail,b.x+47,b.y+75,'acp-core-lead',esc)
  +`<circle class="acp-core-pulse" cx="${N(b.x+b.w-45)}" cy="${N(b.y+46)}" r="6"/>`,esc);
}
api.registerObject('context-hub',{version:1,render:coreNode});
function contextCard({node,box:b,esc,assets}){
 const c=node.content,t=node.type;
 const visual=t==='context-facet'?'acp-facet':t==='context-person'?'acp-person':t==='context-source'?'acp-source':t==='context-step'?'acp-step':'acp-outcome';
 const ix=t==='context-outcome'?b.x+22:b.x+17,iy=b.y+(b.h-42)/2;
 const tx=t==='context-outcome'?b.x+84:b.x+78;
 const titleY=b.y+(t==='context-facet'?30:b.h>96?43:35),detailY=titleY+(t==='context-facet'?24:b.h>96?29:27);
 const pill=t==='context-step'?`<circle class="acp-step-index-ring" cx="${N(b.x+b.w-20)}" cy="${N(b.y+20)}" r="11"/>`:'';
 return nodeRoot(node,visual,
  rect({x:b.x+4,y:b.y+8,w:b.w,h:b.h},'acp-card-depth',20)
  +rect(b,'acp-card-panel',20)
  +rect({x:b.x+12,y:b.y+12,w:49,h:b.h-24},'acp-icon-plate',14)
  +pictogram(c.assetId,{x:ix+6,y:iy+4},assets,esc,35)
  +txt(c.title,tx,titleY,'acp-card-title',esc)
  +subtext(c.detail,tx,detailY,'acp-card-detail',esc,t==='context-source'?29:t==='context-facet'?24:33,17)
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
 const xs=[b.x+280,b.x+545,b.x+830,b.x+1135];
 return nodeRoot(node,'acp-governance',rect(b,'acp-governance-panel',16)
  +txt(node.content.title,b.x+22,b.y+27,'acp-governance-title',esc)
  +labels.map((label,i)=>`<circle class="acp-guard-dot" cx="${N(xs[i])}" cy="${N(b.y+22)}" r="4"/>`+txt(label,xs[i]+13,b.y+27,'acp-governance-item',esc)).join(''),esc);
}});
api.registerDecoration('context-atlas',({scene,geometry,direction,esc})=>{
 const b=geometry.get('context'),cx=b.x+b.w/2,cy=b.y+b.h/2;
 const seed=scene.id.replace(/[^a-z0-9-]/g,'');
 let specks='';for(let i=0;i<32;i++){
  const x=80+(i*157)%1440,y=198+(i*97)%590,r=i%7===0?2.2:1.05;
  specks+=`<circle class="acp-particle" cx="${x}" cy="${y}" r="${r}"/>`;
 }
 return `<defs>
  <radialGradient id="${seed}-aura"><stop offset="0" class="acp-aura-center"/><stop offset=".62" class="acp-aura-middle"/><stop offset="1" class="acp-aura-end"/></radialGradient>
  <linearGradient id="${seed}-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="acp-floor-start"/><stop offset="1" class="acp-floor-end"/></linearGradient>
 </defs>
 <ellipse class="acp-aura" cx="${N(cx)}" cy="${N(cy+38)}" rx="720" ry="370" fill="url(#${seed}-aura)"/>
 <path class="acp-floor" d="M0 665 Q800 475 1600 665 V900H0Z" fill="url(#${seed}-floor)"/>
 <g class="acp-world-grid"><path d="M0 860L800 534L1600 860M0 780L800 515L1600 780M0 700L800 490L1600 700M0 620L800 460L1600 620M300 900L675 510M540 900L737 510M800 900V510M1060 900L860 510M1320 900L920 510"/></g>
 <ellipse class="acp-orbit-ring" cx="${N(cx)}" cy="${N(cy+18)}" rx="545" ry="167"/>
 <ellipse class="acp-orbit-ring acp-orbit-ring--outer" cx="${N(cx)}" cy="${N(cy+18)}" rx="630" ry="224"/>
 <path class="acp-ribbon" d="M${N(cx-580)} ${N(cy+26)} C${N(cx-280)} ${N(cy-240)} ${N(cx+250)} ${N(cy+285)} ${N(cx+610)} ${N(cy-32)}"/>
 ${specks}`;
});
})();
