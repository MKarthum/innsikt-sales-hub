/* Datastyrte SVG-scener. Ingen fagtekst eller merkefarger i visningskoden. */
(()=>{
'use strict';
function gridPeople(){
 let nodes='';
 for(let r=0;r<13;r++)for(let c=0;c<12;c++){
  const dx=c-5.5,dy=r-6,d=Math.hypot(dx/5.5,dy/6);
  // Allow a visible gap between one row's feet and the next row's heads.
  const x=36+c*27+(r%2)*6,y=20+r*29;
  const opacity=Math.max(.18,Math.min(1,1.2-d*.65));
  // Distinct head, shoulders, two arms and legs: not a circle with a rounded tail.
  nodes+='<g transform="translate('+x+' '+y+')" opacity="'+opacity.toFixed(2)+'">'
   +'<circle cx="0" cy="-7.5" r="4.2"/>'
   +'<path d="M-5 -1.5 H5 L4.2 9 H-4.2 Z M-5 -1 L-8 8 H-5.4 L-2.5 2 M5 -1 L8 8 H5.4 L2.5 2 M-3.5 8 L-4.8 13 H-1.8 L0 9 M3.5 8 L4.8 13 H1.8 L0 9 Z"/>'
   +'</g>';
 }
 return '<svg viewBox="0 0 405 390" class="visual-people" aria-hidden="true" focusable="false"><circle class="visual-halo" cx="204" cy="193" r="176"/><circle class="visual-orbit" cx="204" cy="193" r="159"/><circle class="visual-orbit visual-orbit--inner" cx="204" cy="193" r="100"/><g class="visual-people-marks">'+nodes+'</g></svg>';
}
function branch(){
 return '<svg class="visual-branch" viewBox="0 0 850 190" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
 +'<path class="visual-branch-track" d="M425 4 V43 C425 83 218 83 218 140 V186"/>'
 +'<path class="visual-branch-track visual-branch-track--risk" d="M425 43 C425 83 632 83 632 140 V186"/>'
 +'<circle class="visual-branch-origin" cx="425" cy="14" r="8"/><circle class="visual-branch-end" cx="218" cy="183" r="7"/><circle class="visual-branch-end visual-branch-end--risk" cx="632" cy="183" r="7"/>'
 +'</svg>';
}
function orbits(){
 return '<svg viewBox="0 0 460 360" class="visual-orbits" aria-hidden="true" focusable="false">'
 +'<circle cx="230" cy="180" r="136" class="visual-orbits-outer"/>'
 +'<circle cx="230" cy="180" r="98" class="visual-orbits-middle"/>'
 +'<path class="visual-orbits-link" d="M230 180 L230 46 M230 180 L106 255 M230 180 L354 255"/>'
 +'<circle class="visual-orbits-point" cx="230" cy="46" r="8"/>'
 +'<circle class="visual-orbits-point" cx="106" cy="255" r="8"/>'
 +'<circle class="visual-orbits-point" cx="354" cy="255" r="8"/>'
 +'<circle class="visual-orbits-core-halo" cx="230" cy="180" r="67"/>'
 +'</svg>';
}
function render(slide,esc,position={}){
 const v=slide.visual||{},kind=v.scene;
 const counter=position.showNumbers?'<span class="scene-id">'+String((position.index??0)+1).padStart(2,'0')+' / '+String(position.total??1).padStart(2,'0')+'</span>':'';
 const assetImage=(id,cls)=>{
  if(!id)return '';
  const asset=window.InnsiktAssets.get(position.assets,id);
  return '<img class="'+cls+'" src="'+esc(window.InnsiktAssets.src(position.assets,id))+'" alt="" aria-hidden="true" decoding="async" loading="eager">';
 };

 const label='<div class="scene-eyebrow">'+esc(slide.cue||'')+'</div>';
 if(kind==='analyst-grid')return '<div class="story-scene scene-analysts">'
  +'<div class="scene-topline">'+label+counter+'</div>'
  +'<div class="scene-analysts-layout"><div class="scene-analysts-copy">'
  +'<h2 class="scene-analysts-lead">'+esc(v.lead)+'</h2>'
  +'<div class="scene-analysts-number">'+esc(v.number)+'</div>'
  +'<p class="scene-analysts-tail">'+esc(v.tail)+'</p></div>'
  +'<div class="scene-analysts-figure">'+gridPeople()+'</div></div>'
  +'<div class="scene-bottomline"><span class="scene-kicker-mark"></span>'+esc(v.tag)+'</div></div>';
 if(kind==='two-directions')return '<div class="story-scene scene-duality">'
  +'<div class="scene-topline">'+label+counter+'</div>'
  +'<header class="scene-duality-intro"><h2>'+esc(slide.title)+'</h2><p>'+esc(v.lead)+'</p></header>'
  +'<div class="scene-duality-stage"><div class="scene-duality-origin">'+esc(v.center)+'</div>'
  +'<div class="scene-duality-outcomes"><div class="scene-duality-good"><span class="scene-duality-symbol">+</span><h3>'+esc(v.positive)+'</h3><p>'+esc(v.positiveDetail)+'</p></div>'
  +'<div class="scene-duality-risk"><span class="scene-duality-symbol">−</span><h3>'+esc(v.negative)+'</h3><p>'+esc(v.negativeDetail)+'</p></div></div></div></div>';
 if(kind==='value-system')return '<div class="story-scene scene-system">'
  +'<div class="scene-topline">'+label+counter+'</div>'
  +'<div class="scene-system-layout"><div class="scene-system-story"><h2>'+esc(slide.title)+'</h2><p>'+esc(v.lead)+'</p><div class="scene-system-foot">'+esc(v.footer)+'</div></div>'
  +'<div class="scene-system-figure">'+orbits()+'<div class="scene-system-core">'+esc(v.core)+'</div>'
  +'<div class="scene-system-label scene-system-label--top">'+esc(v.business)+'</div>'
  +'<div class="scene-system-label scene-system-label--left">'+esc(v.data)+'</div>'
  +'<div class="scene-system-label scene-system-label--right">'+esc(v.ai)+'</div>'
  +'</div></div></div>';

 const top='<div class="scene-topline">'+label+counter+'</div>';
 const escs=x=>esc(String(x??''));
 const block=(name,inside)=>'<div class="story-scene scene-v2 scene-v2-'+name+'">'+inside+'</div>';
 const title='<h2 class="v2-headline">'+escs(slide.title)+'</h2>';
 const special=window.InnsiktStoryScenes.render(slide,{v,top,title,escs,assetImage,block,diagram:position.diagrams?.find(d=>d.id===v.diagramId)});
 if(special)return special;
 if(kind==='impact'){
  if(v.layout==='bridge')return block('impact v4-bridge',top
    +'<div class="v4-bridge-main"><div class="v4-bridge-copy">'+(v.kicker&&v.kicker!==slide.cue?'<span class="v2-impact-kicker">'+escs(v.kicker)+'</span>':'')
    +title+'<p class="v4-bridge-intro">'+escs(v.support||'')+'</p></div>'
    +'<div class="v4-bridge-visual">'
    +'<div class="v4-bridge-card v4-bridge-before"><small>'+escs(v.beforeCue||'UTGANGSPUNKT')+'</small><strong>'+escs(v.beforeLabel)+'</strong></div>'
    +'<div class="v4-bridge-arrow" aria-hidden="true">↓</div>'
    +'<div class="v4-bridge-card v4-bridge-after"><small>'+escs(v.afterCue||'NESTE STEG')+'</small>'
    +assetImage(v.figureAssetId,'v4-bridge-icon')+'<strong>'+escs(v.afterLabel)+'</strong></div></div></div>'
    +'<p class="v4-bridge-bottom">'+escs(v.evidenceLine||'')+'</p>');
  return block('impact',top+'<div class="v2-impact-layout"><div class="v2-impact-main">'
    +'<span class="v2-impact-kicker">'+escs(v.kicker||'')+'</span>'+title
    +'<p class="v2-impact-sub">'+escs(v.support||slide.body||'')+'</p></div>'
    +'<div class="v2-impact-art" aria-hidden="true"><div class="v2-impact-rings"><i></i><i></i><i></i><i></i></div>'+assetImage(v.figureAssetId,'v3-impact-figure')+'<span></span><span></span><span></span></div></div>'
    +'<div class="v2-footline"><b></b><span>INNSIKT</span></div>');
 }
 if(kind==='list'){
  if(['cards','voices','questions','path'].includes(v.layout)){
   const items=(v.items||[]).map((item,i)=>'<li class="v4-list-card">'
    +'<div class="v4-list-card-top"><span class="v4-list-index">0'+(i+1)+'</span>'
    +assetImage((v.itemAssetIds||[])[i],'v4-list-icon')+'</div>'
    +'<h3>'+escs(item)+'</h3><p>'+escs((v.detail||[])[i]||'')+'</p></li>').join('');
   return block('list v4-list v4-list--'+v.layout,top
    +'<div class="v4-list-heading">'+title+'</div>'
    +'<ol class="v4-list-grid">'+items+'</ol>'
    +'<p class="v4-list-takeaway"><span aria-hidden="true">↳</span> '+escs(slide.body||v.takeaway||'')+'</p>');
  }
  const items=(v.items||[]).map((item,i)=>'<li class="v2-list-row"><span class="v2-list-no">0'+(i+1)+'</span>'
   +'<div class="v2-list-copy">'+assetImage((v.itemAssetIds||[])[i],'v3-list-icon')+'<div class="v3-list-text"><strong>'+escs(item)+'</strong><small>'+escs((v.detail||[])[i]||'')+'</small></div></div>'
   +'<span class="v2-list-arrow" aria-hidden="true">↗</span></li>').join('');
  return block('list',top+'<div class="v2-list-layout"><div class="v2-list-intro">'+title
   +(slide.body?'<p class="v2-list-summary">'+escs(slide.body)+'</p>':'')
   +'</div><ol class="v2-list-items">'+items+'</ol></div>');
 }
 if(kind==='road'){
  const steps=v.steps||[];
  if(v.layout==='steps')return block('road v4-road',top
   +'<div class="v4-road-head">'+title+'</div>'
   +'<ol class="v4-road-grid">'+steps.map((name,i)=>'<li class="v4-road-card">'
    +'<div class="v4-road-card-top"><span class="v4-road-no">0'+(i+1)+'</span>'
    +assetImage((v.stepAssetIds||[])[i],'v4-road-icon')+'</div>'
    +'<strong>'+escs(name)+'</strong>'
    +'<p>'+escs((v.stepDetails||[])[i]||'')+'</p></li>').join('')+'</ol>'
   +'<p class="v4-road-footer">'+escs(v.hint||'')+'</p>');
  return block('road',top+'<div class="v2-road-head">'+title+'</div>'
   +'<div class="v2-road-line" aria-hidden="true"></div>'
   +'<div class="v2-road-stages">'+steps.map((name,i)=>
     '<div class="v2-road-stage"><div class="v3-road-top"><div class="v2-road-step"><span>0'+(i+1)+'</span></div>'+assetImage((v.stepAssetIds||[])[i],'v3-road-icon')+'</div><strong>'+escs(name)+'</strong></div>').join('')+'</div>'
   +'<p class="v2-road-footer">'+escs(v.hint||'')+'</p>');
 }
 if(kind==='business-case'){
  const b=position.businessSignals?.find(b=>b.id===slide.business);
  return block('business',top+'<div class="v2-business-layout"><div class="v2-business-quote"><span class="v2-quote-mark" aria-hidden="true">“</span><h2>'+escs(b?.says||slide.title)+'</h2><p>'+escs(v.hint||'')+'</p></div>'
   +'<div class="v2-business-context"><span>'+escs(b?.role||'')+'</span><div class="v2-business-rule"></div>'
   +'<strong>'+escs(b?.headline||'')+'</strong></div></div>');
 }
 if(kind==='definition'){
  return block('definition',top+'<h2 class="v2-def-title">'+escs(slide.title)+'</h2>'
   +'<div class="v2-def-main"><div class="v2-def-word">'+String(v.term||'').trim().split(/\s+/).map(word=>'<span>'+escs(word)+'</span>').join('')+'</div>'
   +'<div class="v2-def-lenses">'+(v.roles||[]).map((role,i)=>'<div class="v2-def-lens"><small>'+escs(role)+'</small><strong>'+escs((v.meanings||[])[i])+'</strong></div>').join('')+'</div></div>'
   +'<p class="v2-def-footer">'+escs(v.takeaway||'')+'</p>');
 }
 if(kind==='contrast'){
  return block('contrast',top+'<div class="v2-contrast-head">'+title+'</div>'
   +'<div class="v2-contrast-grid"><section class="v2-contrast-side"><span class="v2-contrast-dot"></span><h3>'+escs(v.leftTitle)+'</h3><p>'+escs(v.leftText)+'</p></section>'
   +'<section class="v2-contrast-side v2-contrast-other"><span class="v2-contrast-dot"></span><h3>'+escs(v.rightTitle)+'</h3><p>'+escs(v.rightText)+'</p></section></div>'
   +'<div class="v2-contrast-foot"><span>↔</span>'+escs(v.bridge||'')+'</div>');
 }
 if(kind==='loop'){
  return block('loop',top+'<div class="v2-loop-head">'+title+'</div>'
   +'<div class="v2-loop-canvas"><div class="v2-loop-point v2-loop-left">'+escs(v.left)+'</div>'
   +'<svg class="v2-loop-path" viewBox="0 0 580 220" aria-hidden="true"><path d="M162 86 C270 -6 415 25 430 84"/><path d="M423 72 L430 84 L414 87"/><path d="M417 143 C315 235 168 195 145 135"/><path d="M143 151 L145 135 L161 144"/></svg>'
   +'<div class="v2-loop-point v2-loop-right">'+escs(v.right)+'</div>'
   +'<div class="v2-loop-core">'+escs(v.center)+'</div></div><div class="v2-loop-foot">'+escs(v.foot||'')+'</div>');
 }
 if(kind==='domains'){
  return block('domains',top+'<div class="v2-domains-head">'+title+'</div><div class="v2-domains-grid">'
   +(v.items||[]).map((x,i)=>'<div class="v2-domain"><span>0'+(i+1)+'</span>'+(v.itemAssetIds?.[i]?assetImage(v.itemAssetIds[i],'v3-domain-icon'):'<div class="v2-domain-mark" aria-hidden="true"><i></i><i></i><i></i></div>')
    +'<h3>'+escs(x)+'</h3><p>'+escs((v.detail||[])[i]||'')+'</p></div>').join('')+'</div>'
   +'<p class="v2-domains-foot">'+escs(v.footer||'')+'</p>');
 }
 if(kind==='portal'){
  return block('portal',top+'<div class="v2-portal-title">'+title+'</div>'
   +'<div class="v2-portal-window"><div class="v2-portal-browser"><i></i><i></i><i></i><span>INNSIKT / NESTE STEG</span></div>'
   +'<div class="v2-portal-path">'+(v.steps||[]).map((x,i)=>'<div class="v2-portal-node"><span>0'+(i+1)+'</span>'+assetImage((v.stepAssetIds||[])[i],'v3-portal-icon')+'<strong>'+escs(x)+'</strong></div>').join('')+'</div></div>'
   +'<p class="v2-portal-footer">'+escs(v.footer||'')+'</p>');
 }

 throw Error('Ukjent visuell scene: '+kind);
}
window.InnsiktSlideVisuals={render};
})();
