/* Context Platforms: semantic data -> native 16:9 SVG.
   Mermaid-inspired graph drives native connectors. No presentation text lives
   in the decorative image; all labels are sourced from slide.visual. */
(()=>{
'use strict';
const H=s=>String(s??'');
const safe=(s,e)=>e(H(s));
const lines=(s,max=31)=>{
 const words=H(s).split(/\s+/),out=[''];
 for(const word of words){
  const at=out.length-1;
  if(out[at]&&out[at].length+word.length+1>max)out.push(word);
  else out[at]+=(out[at]?' ':'')+word;
 }
 return out.slice(0,2);
};
const txt=(x,y,label,cls,esc,attrs='')=>
 '<text x="'+x+'" y="'+y+'" class="'+cls+'" '+attrs+'>'+safe(label,esc)+'</text>';
const detail=(x,y,label,cls,esc,max=34)=>{
 return lines(label,max).map((s,i)=>txt(x,y+i*22,s,cls,esc)).join('');
};
const rect=(x,y,w,h,cls,r=18)=>
 '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" class="'+cls+'"/>';
const icon=(kind,x,y)=>{
 const iconPaths=[
  '<path d="M4 7H28V25H12L5 31V25H4Z"/><path d="M10 13H22M10 19H18"/>',
  '<rect x="5" y="6" width="23" height="22" rx="3"/><path d="M5 12H28M11 17H22M11 22H18"/>',
  '<rect x="5" y="9" width="24" height="21" rx="6"/><path d="M17 3V9M12 18h1m7 0h1M11 23q6 4 12 0"/>',
  '<path d="M6 29V7h20v22zM12 15h8M12 21h8M11 3h10"/>',
  '<rect x="4" y="5" width="24" height="23" rx="3"/><path d="M4 12H28M11 17h12M11 22h7"/>',
  '<path d="M4 15h8l5-7 5 14 4-7h4M5 25h22"/>',
  '<circle cx="16" cy="16" r="12"/><path d="M16 7v9l7 4M8 26l-5 3"/>',
  '<path d="M7 5h19v20H7zM3 10v19h19M12 16l4 4 6-8"/>',
  '<path d="M7 16h18M18 9l7 7-7 7M7 4v24"/>',
  '<path d="M17 2l10 5v10c0 8-7 12-10 14C14 29 7 25 7 17V7zM12 16l4 4 7-9"/>',
  // Semantic system, source and cycle icons. These must match their labels.
  '<ellipse cx="16" cy="8" rx="11" ry="4"/><path d="M5 8v18c0 2 5 4 11 4s11-2 11-4V8M5 17c0 2 5 4 11 4s11-2 11-4"/>',
  '<circle cx="16" cy="16" r="8"/><circle cx="16" cy="16" r="2"/><path d="M16 2v5M16 25v5M2 16h5M25 16h5M6 6l4 4M22 22l4 4M6 26l4-4M22 10l4-4"/>',
  '<path d="M7 24a7 7 0 0 1-1-13 10 10 0 0 1 19 2 6 6 0 0 1 0 11Z"/>',
  '<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="5"/><path d="M16 16L30 2M24 2h6v6"/>',
  '<rect x="4" y="5" width="24" height="22" rx="4"/><path d="M13 10l9 6-9 6z"/>',
  '<path d="M26 12a10 10 0 0 0-18-4L5 11M5 5v6h6M6 20a10 10 0 0 0 18 4l3-3M21 21h6v6"/>',
  // Explicit semantic pictograms, matching original 24px SVG assets.
  '<circle cx="16" cy="9" r="4"/><circle cx="7" cy="12" r="2.8"/><circle cx="25" cy="12" r="2.8"/><path d="M8 29v-3a8 8 0 0 1 16 0v3M1 27v-3a7 7 0 0 1 7-7M31 27v-3a7 7 0 0 0-7-7"/>',
  '<path d="M3 16h26M8 16V9M16 16v8M24 16V9"/><circle cx="8" cy="6" r="3"/><circle cx="16" cy="27" r="3"/><circle cx="24" cy="6" r="3"/>',
  '<path d="M16 3v5M16 8L7 16M16 8l9 8M7 16v6M25 16v2"/><rect x="4" y="22" width="8" height="7" rx="2"/><path d="m21 25 3 3 6-9"/>',
  '<rect x="12" y="3" width="17" height="26" rx="4"/><path d="M3 16h15m-5-5 5 5-5 5m6 2 3 3 5-7"/>',
  '<ellipse cx="12" cy="7" rx="9" ry="4"/><path d="M3 7v17c0 2.5 4 4 9 4 3 0 6-.6 8-1.8V7M3 16c0 2.5 4 4 9 4 3 0 6-.6 8-1.8M26 16v12M20 22h12"/>',
  '<rect x="5" y="3" width="22" height="26" rx="3"/><path d="M9 11h9M9 22l4-4 4 2 5-8M10 26h12"/>',
  '<circle cx="13" cy="16" r="11"/><path d="M2 16h22M13 5c-4 6-4 16 0 22M13 5c4 6 4 16 0 22M23 9l5-5m0 0 3 3m-3-3v5"/>',
  '<circle cx="5" cy="16" r="3"/><circle cx="16" cy="5" r="3"/><circle cx="27" cy="16" r="3"/><circle cx="16" cy="27" r="3"/><path d="M7 14L14 7M18 7l7 7M25 18l-7 7M14 25l-7-7"/>'
 ];
 const role=['dialogue','application','agent','document','window','signal','clock','check','forward','shield',
  'database','system','cloud','decision','action','refresh',
  'people','timeline','choice','guarded-action','state-update','evidence','external','meaning'][kind];
 if(!role)throw Error('Missing semantic icon kind '+kind);
 return '<g class="cpn-icon" data-icon-role="'+role+'" transform="translate('+x+' '+y+')"><g fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round">'+iconPaths[kind]+'</g></g>';
};
// Icon identity follows the canonical assetId, never its position in a row.
const semanticIconKinds=Object.freeze({
 'context-people':16,'consume-app':1,'ai-agent':2,
 'data-semantic':23,'context-timeline':17,'governance-shield':9,
 'tabler-database':10,'source-erp':11,'context-external':22,
 'context-choice':18,'context-guarded-action':19,'context-state-update':20,
 'verified-analysis':13,'context-evidence':21
});
const iconForAsset=(assetId,x,y)=>{
 const n=semanticIconKinds[assetId];
 if(!Number.isInteger(n))throw Error('Icon mapping missing for '+assetId);
 return icon(n,x,y);
};
const panel=(x,y,w,h,cls='cpn-panel',radius=20)=>
 '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+radius+'" class="'+cls+'"/>';
// An oval superellipse, with an explicit 10px safety margin around all facets.
const CORE={cx:609,cy:467,rx:565,ry:119,p:4};
const coreContains=(x,y,pad=0)=>
 Math.pow(Math.abs((x-CORE.cx)/(CORE.rx-pad)),CORE.p)+
 Math.pow(Math.abs((y-CORE.cy)/(CORE.ry-pad)),CORE.p)<=1;
const corePath=(inset=0,steps=360)=>{
 const pts=[];
 for(let i=0;i<steps;i++){
  const a=2*Math.PI*i/steps,c=Math.cos(a),sn=Math.sin(a);
  const x=CORE.cx+(CORE.rx-inset)*Math.sign(c)*Math.pow(Math.abs(c),2/CORE.p);
  const y=CORE.cy+(CORE.ry-inset)*Math.sign(sn)*Math.pow(Math.abs(sn),2/CORE.p);
  pts.push((i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2));
 }
 return pts.join('')+'Z';
};
const coreRimY=(x,upper)=>{
 const ratio=Math.abs((x-CORE.cx)/CORE.rx);
 const span=CORE.ry*Math.pow(1-Math.pow(ratio,CORE.p),1/CORE.p);
 return Math.round(CORE.cy+(upper?-span:span));
};
const facetRects=[149,460,771].map(x=>[x,468,x+299,551]);
if(!facetRects.every(([x0,y0,x1,y1])=>
 [x0,x1].every(x=>[y0,y1].every(y=>coreContains(x,y,10)))))
 throw Error('Context platform facet cards exceed the enclosing glass shape');
// Arrowheads are derived from the geometry of the final segment. This avoids
// SVG marker scaling/foreignObject inconsistencies on-screen and in downloads.
const arrowTip=(point,prior)=>{
 const [x,y]=point,[px,py]=prior,dx=x-px,dy=y-py;
 const len=Math.hypot(dx,dy);
 if(len<1)throw Error('Undefined diagram arrow direction');
 const ux=dx/len,uy=dy/len,back=[x-ux*10,y-uy*10];
 const a=[back[0]-uy*4,back[1]+ux*4],b=[back[0]+uy*4,back[1]-ux*4];
 const fmt=n=>Number(n.toFixed(2));
 return 'M'+fmt(x)+' '+fmt(y)+'L'+fmt(a[0])+' '+fmt(a[1])+'L'+fmt(b[0])+' '+fmt(b[1])+'Z';
};
const path=(id,from,to,relation,d,point,prior,esc,cls='cpn-arrow')=>
 '<g data-edge-id="'+safe(id,esc)+'" data-from="'+safe(from,esc)+'" data-to="'+safe(to,esc)+'" data-relation="'+safe(relation,esc)+'">'
 +'<path d="'+d+'" class="'+cls+'"/>'
 +(point?'<path d="'+arrowTip(point,prior)+'" class="cpn-arrow-tip"/>':'')+'</g>';
function graphEdges(v,esc){
 const graph=window.InnsiktSlideGraph.validate(v.graph,v);
 // All connectors use the actual superellipse boundary.
 const edges=new Map(graph.edges.map(e=>[e.from+'>'+e.to,e]));
 const pathFor=(from,to,d,tip,tangent,cls)=>{
  const e=edges.get(from+'>'+to);
  if(!e)throw Error('Missing diagram connection '+from+' -> '+to);
  return path(e.id,e.from,e.to,e.relation,d,tip,tangent,esc,cls);
 };
 let a='';
 // Anchor lines are intentionally behind panels. Rounded turns are outside nodes.
 for(let i=0;i<v.consumers.length;i++){
  const x=[270,607,944][i];
  const top=coreRimY(x,true);
  a+=pathFor('context','consumers:'+i,'M'+x+' '+top+'V311',[x,311],[x,top],'cpn-arrow cpn-arrow--supply');
 }
 // Three semantic source relations converge in one shared inlet.
 const sourceRoutes=[
  ['M270 631V620Q270 615 277 615H607',null,null],
  ['M607 631V586',[607,586],[607,631]],
  ['M944 631V620Q944 615 937 615H607',null,null]
 ];
 for(let i=0;i<v.sources.length;i++){
  const [d,point,tangent]=sourceRoutes[i];
  a+=pathFor('sources:'+i,'context',d,point,tangent,'cpn-arrow cpn-arrow--supply');
 }
 a+=pathFor('context','cycle:0','M47 510C15 550 18 709 96 766Q142 800 204 800',[204,800],[142,800],'cpn-arrow cpn-arrow--loop');
 // The return path stays in the narrow corridor LEFT of the outcomes panel
 // and terminates on the right-hand context rim, not in empty background.
 a+=pathFor('cycle:2','context','M1118 800C1181 792 1193 717 1193 657C1193 586 1180 538 1171 510',[1171,510],[1180,538],'cpn-arrow cpn-arrow--loop');
 a+=pathFor('cycle:0','cycle:1','M430 800H495',[495,800],[470,800],'cpn-arrow cpn-arrow--cycle');
 a+=pathFor('cycle:1','cycle:2','M767 800H833',[833,800],[808,800],'cpn-arrow cpn-arrow--cycle');
 return a;
}
function nativeSvg(slide,v,assets,esc){
 if(v.consumers?.length!==3||v.facets?.length!==3||v.sources?.length!==3||v.cycle?.length!==3||v.outcomes?.length!==3)
  throw Error('Context scene composition requires three items per semantic zone');
 const photo=window.InnsiktAssets.src(assets,'context-rich-background');
 const background='<image class="cpn-photo" x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice" href="'+safe(photo,esc)+'" data-photo-role="landscape" aria-hidden="true"/>';
 const header='<g class="cpn-header"><path d="M68 58H103" class="cpn-dash"/>'
  +txt(124,65,'DATAARKITEKTUR · FREMTIDSBILDE','cpn-kicker',esc)
  +txt(67,143,slide.title,'cpn-main-title',esc)
  +txt(920,143,v.period,'cpn-period',esc)
  +txt(67,177,slide.body,'cpn-subtitle',esc)
  +'</g>';
 const cards=(list,y,group)=>{
  const xs=[105,443,781],w=324,cardHeight=group==='sources'?100:88;
  // One shared glass rail for consumers; sources remain separate systems.
  // Semantics are individual nodes regardless of the outer illustration.
  const rail=group==='consumers'
   ?'<g class="cpn-consumer-rail" aria-hidden="true">'
      +panel(105,y-8,1000,104,'cpn-consumer-rail-panel',36)
      +'<path d="M436 '+(y+8)+'V'+(y+85)+'M774 '+(y+8)+'V'+(y+85)+'" class="cpn-rail-divider"/>'
      +'</g>'
   :'';
  return rail+list.map((n,i)=>{
   const x=xs[i];
   return '<g class="cpn-card cpn-card--'+group+'" data-node-id="'+group+':'+i+'">'
     +(group==='consumers'?'':panel(x,y,w,cardHeight,'cpn-panel'))
     +iconForAsset(n.assetId,x+24,y+27)
     +txt(x+73,y+37,n.label,'cpn-card-title',esc)
     +detail(x+73,y+61,n.detail,'cpn-card-detail',esc,25)
     +'</g>';
  }).join('');
 };
 const people=cards(v.consumers,215,'consumers');
 const context=
 '<g class="cpn-core" data-node-id="context">'
 +'<path d="'+corePath(-8)+'" class="cpn-core-halo"/>'
 +'<path d="'+corePath(4)+'" class="cpn-core-glass"/>'
 +'<path d="'+corePath()+'" class="cpn-core-edge" data-core-shape="superellipse"/>'
 +txt(606,420,v.contextLabel,'cpn-core-title',esc,'text-anchor="middle"')
 +txt(606,451,v.contextLead,'cpn-core-lead',esc,'text-anchor="middle"')
 +v.facets.map((n,i)=>{
   const xs=[149,460,771],x=xs[i];
   return '<g class="cpn-facet" data-node-id="facets:'+i+'">'
     +panel(x,468,299,83,'cpn-facet-panel',16)
     +iconForAsset(n.assetId,x+18,488)
     +txt(x+65,498,n.label,'cpn-facet-title',esc)
     +detail(x+65,520,n.detail,'cpn-facet-detail',esc,26)
     +'</g>';
 }).join('')+'</g>';
 const sources=cards(v.sources,631,'sources');
 const cycleX=[228,518,808];
 const cycle='<g class="cpn-cycle-container">'
  +panel(204,759,914,82,'cpn-cycle-panel',28)
  +v.cycle.map((n,i)=>{
    const x=cycleX[i];
    return '<g class="cpn-cycle-node" data-node-id="cycle:'+i+'">'
      +iconForAsset(n.assetId,x,783)
      +txt(x+47,790,n.label,'cpn-cycle-title',esc)
      +detail(x+47,811,n.detail,'cpn-cycle-detail',esc,28)
      +'</g>';
  }).join('')+'</g>';
 const outcomes='<g class="cpn-outcomes">'
  +panel(1218,329,326,474,'cpn-outcomes-panel',28)
  +txt(1250,376,v.outcomesTitle||'Mulig verdi','cpn-outcomes-header',esc)
  +'<path d="M1250 399H1510" class="cpn-separator"/>'
  +v.outcomes.map((n,i)=>{
    const y=432+i*120;
    return '<g class="cpn-outcome" data-node-id="outcomes:'+i+'">'
      +iconForAsset(n.assetId,1248,y+13)
      +txt(1300,y+26,n.label,'cpn-outcome-title',esc)
      +detail(1300,y+50,n.detail,'cpn-outcome-detail',esc,28)
      +(i<2?'<path d="M1248 '+(y+93)+'H1510" class="cpn-separator"/>':'')
      +'</g>';
  }).join('')+'</g>';
 const governance='<g class="cpn-governance">'
  +'<path d="M96 865H1144" class="cpn-governance-rule"/>'
  +txt(280,886,v.governanceLabel,'cpn-governance-heading',esc)
  +txt(437,886,v.governance.join(' · '),'cpn-governance-values',esc)
  +'</g>';
 return '<svg class="cp-native-svg" data-native-slide-scene="context-platforms" xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" role="img" aria-label="'+safe(slide.title+' – '+v.contextLabel,esc)+'">'
  +'<defs>'
  +'<linearGradient id="cpn-sky" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="var(--pres-bg)"/><stop offset=".55" stop-color="var(--pres-bg)"/><stop offset="1" stop-color="var(--pres-accent)" stop-opacity=".22"/></linearGradient>'
  +'<linearGradient id="cpn-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--pres-accent)" stop-opacity=".30"/><stop offset=".48" stop-color="var(--pres-bg)" stop-opacity=".82"/><stop offset="1" stop-color="var(--pres-accent)" stop-opacity=".26"/></linearGradient>'
  +'<radialGradient id="cpn-aura"><stop offset=".25" stop-color="var(--pres-accent)" stop-opacity=".32"/><stop offset="1" stop-color="var(--pres-accent)" stop-opacity="0"/></radialGradient>'
  +'<linearGradient id="cpn-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--pres-fg)" stop-opacity=".20"/><stop offset=".7" stop-color="var(--pres-bg)" stop-opacity=".30"/><stop offset="1" stop-color="var(--pres-accent)" stop-opacity=".20"/></linearGradient>'
  +'<linearGradient id="cpn-vignette" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--pres-bg)" stop-opacity=".20"/><stop offset=".65" stop-color="var(--pres-bg)" stop-opacity=".30"/><stop offset="1" stop-color="var(--pres-bg)" stop-opacity=".10"/></linearGradient>'
  +'<filter id="cpn-halo" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="19"/></filter>'
  +'<filter id="cpn-soft-shadow" x="-20%" y="-35%" width="140%" height="180%"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#071e32" flood-opacity=".49"/></filter>'
  +'</defs>'
  +background
  +'<rect width="1600" height="900" fill="url(#cpn-vignette)"/>'
  +'<path d="M0 590Q170 544 310 623Q458 540 659 620Q846 518 1120 625Q1300 562 1600 619V900H0Z" class="cpn-ridge cpn-ridge--far"/>'
  +'<path d="M0 750Q154 687 327 746Q500 662 680 763Q854 687 1025 766Q1243 700 1600 753V900H0Z" class="cpn-ridge cpn-ridge--near"/>'
  +'<path d="M0 900H1600V842Q1322 805 1136 856Q973 800 788 866Q500 802 309 865Q142 834 0 865Z" class="cpn-foreground"/>'
  +header
  +'<g class="cpn-graph" aria-hidden="true">'+graphEdges(v,esc)+'</g>'
  +people+context+sources+cycle+outcomes+governance
  +'<g class="cpn-brand-overlay" data-brand-overlay="true" aria-hidden="true"/>'
  +'</svg>';
}
window.InnsiktContextNative={render:nativeSvg,geometry:{core:CORE,facets:facetRects}};
})();