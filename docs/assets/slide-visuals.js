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
 if(kind==='two-directions'&&v.variant==='amplifier-flow'){
  const side=(which,input,detail,outcome,description)=>'<div class="scene-amplifier-input scene-amplifier-'+which+'-input"><small>'+esc(v.inputLabel)+'</small>'
   +'<strong>'+esc(input)+'</strong><span>'+esc(detail)+'</span></div>'
   +'<section class="scene-amplifier-result scene-amplifier-'+which+'-result"><small>'+esc(v.resultLabel)+'</small>'
   +'<h3>'+esc(outcome)+'</h3><p>'+esc(description)+'</p></section>';
  return '<div class="story-scene scene-amplifier">'
   +'<div class="scene-topline">'+label+counter+'</div>'
   +'<header class="scene-amplifier-intro"><h2>'+esc(slide.title)+'</h2><p>'+esc(v.lead)+'</p></header>'
   +'<div class="scene-amplifier-diagram" role="group" aria-label="'+esc(v.positiveInput)+' og '+esc(v.negativeInput)+' forsterkes av '+esc(v.center)+' til henholdsvis '+esc(v.positive)+' og '+esc(v.negative)+'">'
   +'<svg class="scene-amplifier-paths" viewBox="0 0 900 380" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
   +'<path class="scene-amplifier-track scene-amplifier-track-good" d="M166 140 C312 140 332 172 450 164 S586 140 745 140"/>'
   +'<path class="scene-amplifier-track scene-amplifier-track-risk" d="M166 245 C312 245 332 213 450 218 S586 245 745 245"/>'
   +'<path class="scene-amplifier-route-core" d="M450 164 V218"/>'
   +'<circle class="scene-amplifier-point-good" cx="166" cy="140" r="6"/><circle class="scene-amplifier-point-good" cx="745" cy="140" r="6"/>'
   +'<circle class="scene-amplifier-point-risk" cx="166" cy="245" r="6"/><circle class="scene-amplifier-point-risk" cx="745" cy="245" r="6"/>'
   +'</svg><div class="scene-amplifier-halo" aria-hidden="true"></div>'
   +side('good',v.positiveInput,v.positiveInputDetail,v.positive,v.positiveDetail)
   +side('risk',v.negativeInput,v.negativeInputDetail,v.negative,v.negativeDetail)
   +'<div class="scene-amplifier-engine"><span class="scene-amplifier-engine-symbol" aria-hidden="true">×</span><strong>'+esc(String(v.center).replace(/^×\s*/,''))+'</strong></div>'
   +'</div><p class="scene-amplifier-takeaway">'+esc(v.takeaway)+'</p></div>';
 }
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
 // Illustrations are structural SVG/icons, labels and questions are exclusively data-driven.
 if(kind==='value-system'&&v.variant==='editorial-triad'){
  const nodes=v.nodes||[];
  if(nodes.length!==3||nodes.map(n=>n.key).join(',')!=='need,data,control')throw Error('Three value nodes required: '+slide.id);
  const glyph=type=>{
   const paths={
    target:'<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="6"/><circle cx="16" cy="16" r="1.4"/><path d="M20 12l9-9M24 3h5v5"/>',
    database:'<ellipse cx="16" cy="7" rx="10" ry="4"/><path d="M6 7v17c0 2.5 4.5 4.5 10 4.5s10-2 10-4.5V7M6 15c0 2.5 4.5 4.5 10 4.5s10-2 10-4.5M6 22c0 2.5 4.5 4.5 10 4.5s10-2 10-4.5"/>',
    shield:'<path d="M16 3l11 4v8c0 7-4 11-11 14C9 26 5 22 5 15V7z"/><path d="M11 16l3.5 3.5L22 12"/>'
   };
   if(!paths[type])throw Error('Unknown value icon '+type);
   return '<svg viewBox="0 0 32 32" class="scene-value-icon-svg" aria-hidden="true" focusable="false">'+paths[type]+'</svg>';
  };
  const titleText=String(slide.title),highlight=String(v.highlight||'');
  const emphasis=highlight&&titleText.includes(highlight)
   ?esc(titleText.slice(0,titleText.indexOf(highlight)))+'<em>'+esc(highlight)+'</em>'+esc(titleText.slice(titleText.indexOf(highlight)+highlight.length))
   :esc(titleText);
  const node=n=>'<div class="scene-value-node scene-value-node--'+n.key+'">'
   +'<span class="scene-value-icon" aria-hidden="true">'+glyph(n.icon)+'</span>'
   +'<h3>'+esc(n.label)+'</h3><p>'+esc(n.question)+'</p></div>';
  return '<div class="story-scene scene-system-editorial">'
   +'<div class="scene-topline">'+label+counter+'</div>'
   +'<div class="scene-value-layout"><div class="scene-value-story"><h2>'+emphasis+'</h2>'
   +'<p class="scene-value-lead">'+esc(v.lead)+'</p>'
   +'<p class="scene-value-takeaway">'+esc(v.footer)+'</p></div>'
   +'<div class="scene-value-stage" role="group" aria-label="'+esc(v.core)+': '+nodes.map(n=>n.label+' – '+n.question).map(esc).join('; ')+'">'
   +'<div class="scene-value-halo" aria-hidden="true"></div>'
   +'<svg class="scene-value-geometry" viewBox="0 0 500 445" aria-hidden="true" focusable="false">'
   +'<circle class="scene-value-orbit" cx="250" cy="224" r="193"/>'
   +'<circle class="scene-value-orbit-inner" cx="250" cy="224" r="155"/>'
   +'<path class="scene-value-link" d="M250 80 V156 M182 278 L116 324 M318 278 L384 324"/>'
   +'</svg>'
   +'<div class="scene-value-core"><span>'+esc(v.core)+'</span></div>'
   +nodes.map(node).join('')+'</div></div></div>';
 }
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

 // Original, portable data+AI scenes. All meaningful text comes from slides.json.

 // Reusable context ecosystem: all visible words are owned by slides.json.
 if(kind==='context-platforms'){
  const tiles=(list,cls)=>list.map((item,i)=>'<div class="cp-tile '+cls+'">'+(item.assetId?'<span class="cp-icon">'+assetImage(item.assetId,'cp-icon-image')+'</span>':'')+'<div class="cp-tile-copy"><strong>'+escs(item.label)+'</strong><small>'+escs(item.detail)+'</small></div></div>').join('');
  const links=()=>'<div class="cp-links" aria-hidden="true"><i></i><i></i><i></i></div>';
  const actionLink='<div class="cp-action-link" aria-hidden="true"><svg viewBox="0 0 36 36" focusable="false"><path d="M18 2V29M10 21L18 29L26 21"/></svg></div>';
  const outcomes=(v.outcomes||[]).map(item=>'<div class="cp-outcome">'+(item.assetId?assetImage(item.assetId,'cp-outcome-icon'):'')+'<span><strong>'+escs(item.label)+'</strong><small>'+escs(item.detail)+'</small></span></div>').join('');

  const stepArrow='<svg class="cp-cycle-arrow" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M4 16H27M18 7L27 16L18 25"/></svg>';
  const cycle=v.cycle.map((item,i)=>'<div class="cp-cycle-step">'+(item.assetId?assetImage(item.assetId,'cp-cycle-icon'):'')+'<span class="cp-cycle-copy"><strong>'+escs(item.label)+'</strong><small>'+escs(item.detail)+'</small></span></div>'+(i===v.cycle.length-1?'':stepArrow)).join('');
  const feedback='<svg class="cp-feedback-return" viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="cp-feedback-track" d="M945 7V29Q945 49 922 49H78Q55 49 55 29V7"/><path class="cp-feedback-head" d="M38 23L55 5L72 23"/></svg>';
  const scenery=window.InnsiktSceneArt.render(v.artwork,position.assets,escs);
  return '<div class="story-scene scene-context-platforms">'
   +'<div class="cp-landscape" aria-hidden="true">'+scenery+'</div>'
   +'<header class="cp-heading"><div class="scene-topline">'+label+counter+'</div><div class="cp-title"><h2>'+escs(slide.title)+'</h2><span>'+escs(v.period)+'</span></div></header>'
   +'<div class="cp-diagram" role="group" aria-label="'+escs(v.contextLabel)+'">'
   +'<section class="cp-consumers" aria-label="Konsumenter">'+tiles(v.consumers,'cp-consumer')+'</section>'
   +links()
   +'<section class="cp-context"><div class="cp-core-head"><h3>'+escs(v.contextLabel)+'</h3><p>'+escs(v.contextLead)+'</p></div>'
   +'<div class="cp-facets">'+tiles(v.facets,'cp-facet')+'</div></section>'
   +links()
   +'<section class="cp-sources" aria-label="Kilder og systemer">'+tiles(v.sources,'cp-source')+'</section>'
   +actionLink
   +'<section class="cp-cycle" aria-label="Beslutning, kontrollert handling og oppdatert kontekst">'+cycle+feedback+'</section>'
   +'<footer class="cp-governance"><strong>'+escs(v.governanceLabel)+'</strong><span>'+v.governance.map(escs).join(' · ')+'</span></footer>'
   +'</div>'
   +(outcomes?'<aside class="cp-outcomes" aria-label="'+escs(v.outcomesTitle||'Mulig verdi')+'"><small class="cp-outcomes-title">'+escs(v.outcomesTitle||'Mulig verdi')+'</small>'+outcomes+'</aside>':'')
   +'</div>';
 }

 if(kind==='context-bridge'){
  const data=v.dataRows.map(x=>'<span>'+escs(x)+'</span>').join('');
  const factors=v.factors.map(x=>'<div class="ai-context-factor"><strong>'+escs(x.name)+'</strong><span>'+escs(x.detail)+'</span></div>').join('');
  return '<div class="story-scene ai-context-scene"><div class="scene-topline">'+label+counter+'</div><h2>'+escs(slide.title)+'</h2>'
   +'<div class="ai-context-layout"><section class="ai-context-data"><small>'+escs(v.dataLabel)+'</small>'+data+'</section>'
   +'<span class="ai-context-arrow" aria-hidden="true">→</span><section class="ai-context-center"><b>'+escs(v.contextLabel)+'</b><div class="ai-context-factors">'+factors+'</div></section>'
   +'<span class="ai-context-arrow" aria-hidden="true">→</span><section class="ai-context-agent"><small>'+escs(v.agentLabel)+'</small><strong>'+escs(v.question)+'</strong><p>'+escs(v.answer)+'</p></section></div>'
   +'<footer class="ai-context-footer">'+v.methods.map(x=>'<span>'+escs(x)+'</span>').join('')+'</footer></div>';
 }
 if(kind==='ai-dev-workbench'){
  const code=v.beforeCode.map(x=>'<code>'+escs(x)+'</code>').join(''),diff=v.diff.map(x=>'<code>'+escs(x)+'</code>').join('');
  const tools=v.tools.map(x=>'<span>'+assetImage(x.assetId,'ai-reuse-icon')+'<b>'+escs(x.name)+'</b></span>').join('');
  return '<div class="story-scene ai-work-scene"><div class="scene-topline">'+label+counter+'</div><h2>'+escs(slide.title)+'</h2>'
   +'<div class="ai-work-layout"><section class="ai-work-editor"><div class="ai-work-bar"><small>'+escs(v.before)+'</small><b>'+escs(v.file)+'</b></div><div class="ai-work-code">'+code+'</div></section>'
   +'<span class="ai-work-arrow" aria-hidden="true">→</span><section class="ai-work-agent"><div class="ai-work-bar"><small>'+escs(v.after)+'</small><b>'+escs(v.exampleLabel)+'</b></div>'
   +'<p class="ai-work-prompt">'+escs(v.prompt)+'</p><div class="ai-work-diff">'+diff+'</div><strong class="ai-work-review">'+escs(v.review)+'</strong></section></div>'
   +'<footer class="ai-work-tools">'+tools+'</footer></div>';
 }
 if(kind==='ai-insight-interfaces'){
  const max=Math.max(...v.bars.map(x=>x.value));
  const bars=v.bars.map((x,i)=>'<span class="ai-usage-bar-col"><i class="'+(i===v.bars.length-1?'ai-usage-last':'')+'" style="height:'+Math.round(x.value/max*85)+'%"></i><b>'+escs(x.label)+'</b></span>').join('');
  const icons=items=>items.map(x=>'<span>'+assetImage(x.assetId,'ai-reuse-icon')+'<b>'+escs(x.name)+'</b></span>').join('');
  return '<div class="story-scene ai-usage-scene"><div class="scene-topline">'+label+counter+'</div><h2>'+escs(slide.title)+'</h2>'
   +'<div class="ai-usage-layout"><section class="ai-usage-panel"><header>'+escs(v.askLabel)+'</header><div class="ai-usage-question">'+escs(v.question)+'</div><div class="ai-usage-answer">'+escs(v.answer)+'</div></section>'
   +'<section class="ai-usage-panel"><header>'+escs(v.buildLabel)+'</header><div class="ai-usage-report"><small>'+escs(v.reportTitle)+' · '+escs(v.exampleLabel)+'</small><div class="ai-usage-metric"><div><span>'+escs(v.metricLabel)+'</span><strong>'+escs(v.metric)+'</strong><em>'+escs(v.change)+'</em></div><div class="ai-usage-bars">'+bars+'</div></div><p>'+escs(v.caption)+'</p></div></section></div>'
   +'<footer class="ai-usage-tools"><div>'+icons(v.askTools)+'</div><div>'+icons(v.buildTools)+'</div></footer></div>';
 }

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
  if(v.variant==='editorial-choices'){
   const items=v.items||[];
   if(items.length!==3)throw Error('Three task entry points required: '+slide.id);
   return block('list v15-choices',top
    +'<div class="v15-choices-layout"><div class="v15-choices-intro">'+title
    +'</div>'
    +'<ol class="v15-choices-options">'+items.map((t,i)=>'<li><span class="v15-choices-number">'+String(i+1).padStart(2,'0')+'</span>'
     +assetImage((v.itemAssetIds||[])[i],'v15-choices-icon')
     +'<div><h3>'+escs(t)+'</h3><p>'+escs((v.detail||[])[i])+'</p></div></li>').join('')+'</ol></div>'
    +'<p class="v15-choices-takeaway">'+escs(v.takeaway)+'</p>');
  }
  if(v.variant==='editorial-journey'){
   const steps=v.items||[];
   if(steps.length!==3)throw Error('Three customer discovery stages required: '+slide.id);
   return block('list v15-journey',top
    +'<header class="v15-journey-intro">'+title+'</header>'
    +'<div class="v15-journey-track">'
    +'<svg class="v15-journey-connector" viewBox="0 0 850 180" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
    +'<path d="M100 92 C245 92 250 92 425 92 S680 92 750 92"/><path d="M740 85 L750 92 L740 99"/>'
    +'</svg>'
    +steps.map((t,i)=>'<section class="v15-journey-step"><div class="v15-journey-node">'
    +'<span>'+String(i+1).padStart(2,'0')+'</span>'+assetImage((v.itemAssetIds||[])[i],'v15-journey-icon')
    +'</div><h3>'+escs(t)+'</h3><p>'+escs((v.detail||[])[i])+'</p></section>').join('')
    +'</div><p class="v15-journey-footer">'+escs(slide.body||v.takeaway||'')+'</p>');
  }

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
 if(kind==='contrast'&&v.variant==='editorial-equation'){
  return block('contrast v15-equation',top
   +'<header class="v15-contrast-header">'+title+'</header>'
   +'<div class="v15-equation-layout"><div class="v15-equation-side v15-equation-appearance">'
   +'<span class="v15-contrast-overline">'+escs(v.leftTitle)+'</span><h3>'+escs(v.leftText)+'</h3></div>'
   +'<div class="v15-equation-sign" aria-hidden="true">'+escs(v.contrastSymbol)+'</div>'
   +'<div class="v15-equation-side v15-equation-substance"><span class="v15-contrast-overline">'+escs(v.rightTitle)+'</span>'
   +'<h3>'+escs(v.rightText)+'</h3></div></div>'
   +'<div class="v15-equation-bottom"><span class="v15-bottom-line" aria-hidden="true"></span><p>'+escs(v.bridge)+'</p></div>');
 }
 if(kind==='contrast'&&v.variant==='editorial-balance'){
  return block('contrast v15-balance',top
   +'<header class="v15-contrast-header">'+title+'</header>'
   +'<div class="v15-balance-layout">'
   +'<div class="v15-balance-extreme v15-balance-left"><span class="v15-balance-sign" aria-hidden="true">−</span>'
   +'<h3>'+escs(v.leftTitle)+'</h3><p>'+escs(v.leftText)+'</p></div>'
   +'<div class="v15-balance-middle"><div class="v15-balance-point"><span class="v15-balance-check" aria-hidden="true">✓</span>'
   +'<strong>'+escs(v.balanceLabel)+'</strong></div><span class="v15-balance-line" aria-hidden="true"></span></div>'
   +'<div class="v15-balance-extreme v15-balance-right"><span class="v15-balance-sign" aria-hidden="true">−</span>'
   +'<h3>'+escs(v.rightTitle)+'</h3><p>'+escs(v.rightText)+'</p></div></div>'
   +'<p class="v15-balance-bottom">'+escs(v.bridge)+'</p>');
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
