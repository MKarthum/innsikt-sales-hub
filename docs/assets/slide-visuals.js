/* Datastyrte SVG-scener. Ingen fagtekst eller merkefarger i visningskoden. */
(()=>{
'use strict';
function gridPeople(){
 let nodes='';
 for(let r=0;r<14;r++)for(let c=0;c<12;c++){
  const dx=c-5.5,dy=r-6.5,d=Math.hypot(dx/5.5,dy/6.5);
  const x=36+c*27+(r%2)*6,y=25+r*24;
  const o=Math.max(.12,Math.min(1,1.2-d*.65));
  nodes+='<g transform="translate('+x+' '+y+')" opacity="'+o.toFixed(2)+'"><circle r="4.8" cy="-5.2"/><rect x="-3.1" y="2" width="6.2" height="10.5" rx="3"/></g>';
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
 const counter=String((position.index??0)+1).padStart(2,'0')+' / '+String(position.total??1).padStart(2,'0');
 const label='<div class="scene-eyebrow">'+esc(slide.cue||'')+'</div>';
 if(kind==='analyst-grid')return '<div class="story-scene scene-analysts">'
  +'<div class="scene-topline">'+label+'<span class="scene-id">'+counter+'</span></div>'
  +'<div class="scene-analysts-layout"><div class="scene-analysts-copy">'
  +'<h2 class="scene-analysts-lead">'+esc(v.lead)+'</h2>'
  +'<div class="scene-analysts-number">'+esc(v.number)+'</div>'
  +'<p class="scene-analysts-tail">'+esc(v.tail)+'</p></div>'
  +'<div class="scene-analysts-figure">'+gridPeople()+'</div></div>'
  +'<div class="scene-bottomline"><span class="scene-kicker-mark"></span>'+esc(v.tag)+'</div></div>';
 if(kind==='two-directions')return '<div class="story-scene scene-duality">'
  +'<div class="scene-topline">'+label+'<span class="scene-id">'+counter+'</span></div>'
  +'<header class="scene-duality-intro"><h2>'+esc(slide.title)+'</h2><p>'+esc(v.lead)+'</p></header>'
  +'<div class="scene-duality-graph"><div class="scene-duality-origin">'+esc(v.center)+'</div>'+branch()+'</div>'
  +'<div class="scene-duality-outcomes"><div class="scene-duality-good"><span class="scene-duality-symbol">+</span><h3>'+esc(v.positive)+'</h3><p>'+esc(v.positiveDetail)+'</p></div>'
  +'<div class="scene-duality-risk"><span class="scene-duality-symbol">−</span><h3>'+esc(v.negative)+'</h3><p>'+esc(v.negativeDetail)+'</p></div></div></div>';
 if(kind==='value-system')return '<div class="story-scene scene-system">'
  +'<div class="scene-topline">'+label+'<span class="scene-id">'+counter+'</span></div>'
  +'<div class="scene-system-layout"><div class="scene-system-story"><h2>'+esc(slide.title)+'</h2><p>'+esc(v.lead)+'</p><div class="scene-system-foot">'+esc(v.footer)+'</div></div>'
  +'<div class="scene-system-figure">'+orbits()+'<div class="scene-system-core">'+esc(v.core)+'</div>'
  +'<div class="scene-system-label scene-system-label--top">'+esc(v.business)+'</div>'
  +'<div class="scene-system-label scene-system-label--left">'+esc(v.data)+'</div>'
  +'<div class="scene-system-label scene-system-label--right">'+esc(v.ai)+'</div>'
  +'</div></div></div>';
 throw Error('Ukjent visuell scene: '+kind);
}
window.InnsiktSlideVisuals={render};
})();
