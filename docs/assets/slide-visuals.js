/* Datastyrte SVG-scener. Ingen fagtekst eller merkefarger i visningskoden. */
(()=>{
'use strict';
/* Exactly one thousand marks, organized as an expanding analytical field.
   Pure geometry: no external imagery and no brand-specific colors. */
function capacityField(){
 let marks='';
 const total=1000,angle=2.399963229728653;
 for(let i=0;i<total;i++){
  const radius=Math.sqrt((i+.5)/total);
  const theta=i*angle;
  const wobble=Math.sin(i*.063)*.025;
  const x=259+208*radius*Math.cos(theta)*(1+wobble);
  const y=214+169*radius*Math.sin(theta)*(1+wobble);
  const depth=(1-radius);
  const size=(.55+1.35*depth).toFixed(2);
  const opacity=(.30+.68*depth).toFixed(2);
  const highlight=i%43===0?' capacity-dot--signal':'';
  marks+='<circle class="capacity-dot'+highlight+'" cx="'+x.toFixed(2)+'" cy="'+y.toFixed(2)+'" r="'+size+'" opacity="'+opacity+'"/>';
 }
 return '<svg class="capacity-field" viewBox="0 0 520 430" aria-hidden="true" focusable="false">'
  +'<defs><radialGradient id="capacity-core"><stop offset="0%" stop-color="var(--pres-accent)" stop-opacity=".32"/><stop offset="65%" stop-color="var(--pres-accent)" stop-opacity=".08"/><stop offset="100%" stop-color="var(--pres-accent)" stop-opacity="0"/></radialGradient></defs>'
  +'<circle class="capacity-glow" cx="259" cy="214" r="197" fill="url(#capacity-core)"/>'
  +'<ellipse class="capacity-orbit" cx="259" cy="214" rx="220" ry="178"/>'
  +'<ellipse class="capacity-orbit capacity-orbit--tilt" cx="259" cy="214" rx="205" ry="86" transform="rotate(-24 259 214)"/>'
  +'<ellipse class="capacity-orbit capacity-orbit--tilt" cx="259" cy="214" rx="205" ry="86" transform="rotate(24 259 214)"/>'
  +'<path class="capacity-route" d="M 0 322 C 87 293 112 262 167 226 S 221 191 260 214 S 399 248 520 110"/>'
  +'<g class="capacity-marks">'+marks+'</g>'
  +'<circle class="capacity-center-ring" cx="259" cy="214" r="27"/>'
  +'<circle class="capacity-center" cx="259" cy="214" r="7"/>'
  +'</svg>';
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
  +'<div class="scene-analysts-figure">'+capacityField()+'</div></div>'
  +'<div class="scene-bottomline"><span class="scene-kicker-mark"></span>'+esc(v.tag)+'</div></div>';
 if(kind==='two-directions'&&v.variant==='editorial-split')return '<div class="story-scene scene-duality-editorial">'
  +'<div class="scene-topline">'+label+counter+'</div>'
  +'<header class="scene-editorial-intro"><h2>'+esc(slide.title)+'</h2><p>'+esc(v.lead)+'</p></header>'
  +'<div class="scene-editorial-capacity"><span>'+esc(v.center)+'</span></div>'
  +'<div class="scene-editorial-outcomes">'
  +'<section class="scene-editorial-good"><span class="scene-editorial-glyph" aria-hidden="true">+</span><h3>'+esc(v.positive)+'</h3><p>'+esc(v.positiveDetail)+'</p></section>'
  +'<section class="scene-editorial-risk"><span class="scene-editorial-glyph" aria-hidden="true">−</span><h3>'+esc(v.negative)+'</h3><p>'+esc(v.negativeDetail)+'</p></section></div></div>';
 if(kind==='two-directions')return '<div class="story-scene scene-duality">'
  +'<div class="scene-topline">'+label+counter+'</div>'
  +'<header class="scene-duality-intro"><h2>'+esc(slide.title)+'</h2><p>'+esc(v.lead)+'</p></header>'
  +'<div class="scene-duality-stage"><div class="scene-duality-origin">'+esc(v.center)+'</div>'
  +'<div class="scene-duality-fork" aria-hidden="true"><span>↙</span><span>↘</span></div>'
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
 if(kind==='insight-ecosystem')return block('ecosystem',top
  +'<div class="eco-head">'+title+'<p>'+escs(v.subtitle)+'</p></div>'
  +'<div class="eco-context"><div><small>'+escs(v.inputLabel)+'</small><strong>'+escs(v.input)+'</strong></div><span aria-hidden="true">→</span><div><small>'+escs(v.outputLabel)+'</small><strong>'+escs(v.output)+'</strong></div></div>'
  +'<div class="eco-flow">'+v.stages.map((x,i)=>'<section class="eco-stage"><div class="eco-stage-top"><span>'+String(i+1).padStart(2,'0')+'</span>'+assetImage(x.assetId,'eco-stage-icon')+'</div><h3>'+escs(x.title)+'</h3><p>'+escs(x.detail)+'</p></section>').join('<span class="eco-link" aria-hidden="true">→</span>')+'</div>'
  +'<div class="eco-foundation"><small>'+escs(v.foundationLabel)+'</small><div>'+v.guardrails.map(x=>'<span>'+escs(x)+'</span>').join('')+'</div></div>'
  +'<p class="eco-conclusion">'+escs(v.conclusion)+'</p>');
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
