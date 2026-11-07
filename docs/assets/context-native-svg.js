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
  '<path d="M17 2l10 5v10c0 8-7 12-10 14C14 29 7 25 7 17V7zM12 16l4 4 7-9"/>'
 ];
 return '<g class="cpn-icon" transform="translate('+x+' '+y+')"><g fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round">'+iconPaths[kind%iconPaths.length]+'</g></g>';
};
const panel=(x,y,w,h,cls='cpn-panel',radius=20)=>
 '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+radius+'" class="'+cls+'"/>';
// Arrowheads are derived from the geometry of the final segment. This avoids
// SVG marker scaling/foreignObject inconsistencies on-screen and in downloads.
const arrowTip=(point,prior)=>{
 const [x,y]=point,[px,py]=prior,dx=x-px,dy=y-py;
 const len=Math.hypot(dx,dy);
 if(len<1)throw Error('Undefined diagram arrow direction');
 const ux=dx/len,uy=dy/len,back=[x-ux*13,y-uy*13];
 const a=[back[0]-uy*5.5,back[1]+ux*5.5],b=[back[0]+uy*5.5,back[1]-ux*5.5];
 const fmt=n=>Number(n.toFixed(2));
 return 'M'+fmt(x)+' '+fmt(y)+'L'+fmt(a[0])+' '+fmt(a[1])+'L'+fmt(b[0])+' '+fmt(b[1])+'Z';
};
const path=(id,from,to,relation,d,point,prior,esc,cls='cpn-arrow')=>
 '<g data-edge-id="'+safe(id,esc)+'" data-from="'+safe(from,esc)+'" data-to="'+safe(to,esc)+'" data-relation="'+safe(relation,esc)+'">'
 +'<path d="'+d+'" class="'+cls+'"/>'
 +'<path d="'+arrowTip(point,prior)+'" class="cpn-arrow-tip"/></g>';
function graphEdges(v,esc){
 const graph=window.InnsiktSlideGraph.validate(v.graph,v);
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
  a+=pathFor('context','consumers:'+i,'M'+x+' 360V316',[x,316],[x,337],'cpn-arrow cpn-arrow--supply');
 }
 for(let i=0;i<v.sources.length;i++){
  const x=[270,607,944][i];
  a+=pathFor('sources:'+i,'context','M'+x+' 621V586',[x,586],[x,608],'cpn-arrow cpn-arrow--supply');
 }
 a+=pathFor('context','cycle:0','M128 566C64 597 66 711 126 766Q153 797 204 800',[204,800],[153,797],'cpn-arrow cpn-arrow--loop');
 a+=pathFor('cycle:2','context','M1080 800C1209 779 1213 652 1150 563',[1150,563],[1213,652],'cpn-arrow cpn-arrow--loop');
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
  +'</g>';
 const cards=(list,y,baseIcon,group)=>{
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
     +icon(baseIcon+i,x+24,y+27)
     +txt(x+73,y+37,n.label,'cpn-card-title',esc)
     +detail(x+73,y+61,n.detail,'cpn-card-detail',esc,25)
     +'</g>';
  }).join('');
 };
 const people=cards(v.consumers,215,0,'consumers');
 const context=
 '<g class="cpn-core" data-node-id="context">'
 +'<ellipse cx="609" cy="474" rx="565" ry="119" class="cpn-core-halo"/>'
 +'<ellipse cx="609" cy="474" rx="555" ry="111" class="cpn-core-glass"/>'
 +'<ellipse cx="609" cy="474" rx="553" ry="109" class="cpn-core-edge"/>'
 +'<path d="M95 461Q609 311 1124 461" class="cpn-core-shine"/>'
 +'<path d="M96 532Q244 569 390 555T677 559T1106 530" class="cpn-core-wave"/>'
 +'<path d="M100 553Q262 584 438 566T775 567T1116 547" class="cpn-core-wave cpn-core-wave--soft"/>'
 +txt(606,432,v.contextLabel,'cpn-core-title',esc,'text-anchor="middle"')
 +txt(606,466,v.contextLead,'cpn-core-lead',esc,'text-anchor="middle"')
 +v.facets.map((n,i)=>{
   const xs=[129,455,781],x=xs[i];
   return '<g class="cpn-facet" data-node-id="facets:'+i+'">'
     +panel(x,477,310,88,'cpn-facet-panel',17)
     +icon([3,5,9][i],x+18,497)
     +txt(x+65,507,n.label,'cpn-facet-title',esc)
     +detail(x+65,529,n.detail,'cpn-facet-detail',esc,27)
     +'</g>';
 }).join('')+'</g>';
 const sources=cards(v.sources,621,3,'sources');
 const cycleX=[228,518,808];
 const cycle='<g class="cpn-cycle-container">'
  +panel(204,759,914,82,'cpn-cycle-panel',28)
  +v.cycle.map((n,i)=>{
    const x=cycleX[i];
    return '<g class="cpn-cycle-node" data-node-id="cycle:'+i+'">'
      +icon([7,8,6][i],x,783)
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
      +icon([7,6,9][i],1248,y+13)
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
window.InnsiktContextNative={render:nativeSvg};
})();