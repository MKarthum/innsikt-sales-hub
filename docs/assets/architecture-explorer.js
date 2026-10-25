/* Responsive architecture explorer. Content and media are never owned here:
   profiles -> architecture-profiles.json, slides -> slides.json, sources -> sources.json. */
(()=>{
'use strict';
const e=(escape,value)=>escape(String(value??''));
/* The page shares the exact vendor scene used in Presenter; never reduce a
   spatial architecture (especially OneLake) to an invented five-step pipeline. */
function panNavigation(profile,ui,escape){
 const E=x=>e(escape,x);
 return '<div class="arch-pan-guide" data-arch-pan-guide>'
 +'<p>'+E(ui.panGuide)+'</p>'
 +'<button type="button" class="arch-pan-toggle" data-arch-detail aria-pressed="false" data-label-open="'+E(ui.panDetailOpen)+'" data-label-close="'+E(ui.panDetailClose)+'">'+E(ui.panDetailOpen)+'</button>'
 +'<nav class="arch-pan-nav" aria-label="'+E(ui.panNavLabel)+'">'
 +[['sources',ui.panSources],['platform',ui.panPlatform],['uses',ui.panUses]].map(([id,label])=>
  '<button type="button" data-arch-pan="'+id+'">'+E(label)+'</button>').join('')
 +'</nav></div>';
}
function technicalDetails(D,h,profile){
 const ui=D.pages.architectureExplorerUi;
 if(profile.id!==ui.baseProfileId)return '';
 const technical=D.architectureProfiles.profiles.find(p=>p.id===ui.technicalProfileId);
 const slide=D.slides.items.find(s=>s.profileId===technical?.id);
 if(!technical||!slide)return '';
 const E=x=>e(h.esc,x);
 const stages=[
  {title:technical.ingest.title,items:technical.ingest.items},
  {title:technical.platform.title,items:[technical.platform.top,technical.platform.bottom]},
  {title:technical.serve.title,items:technical.serve.items}
 ];
 return '<details class="arch-explorer-technical" data-arch-technical><summary>'+E(ui.technicalTitle)+'</summary>'
 +'<p>'+E(ui.technicalIntro)+'</p>'
 +'<div class="arch-explorer-technical-grid">'+stages.map(stage=>
  '<section><h4>'+E(stage.title)+'</h4><ul>'+stage.items.map(item=>'<li>'+E(item)+'</li>').join('')+'</ul></section>'
 ).join('')+'</div><a class="text-link" href="#lysbilder/'+E(slide.id)+'">'+E(ui.technicalSlideLink)+'</a></details>';
}
function readingGuide(profile,ui,escape){
 const guide=profile.pageGuide;
 if(!guide)return '';
 const E=x=>e(escape,x),decision=guide.decision;
 return '<section class="arch-reading-guide" data-arch-reading-guide>'
 +'<div class="arch-reading-main"><h3>'+E(guide.title)+'</h3><p>'+E(guide.interpretation)+'</p>'
 +'<div class="arch-reading-question"><strong>'+E(ui.guideQuestionLabel)+'</strong><p>'+E(guide.question)+'</p></div></div>'
 +(decision?'<details class="arch-bi-decisions" data-arch-bi-alternatives><summary>'+E(decision.title)+'</summary><p>'+E(decision.intro)+'</p>'
 +'<div class="arch-bi-options">'+decision.alternatives.map(x=>
  '<div class="arch-bi-option"><strong>'+E(x.label)+'</strong><p>'+E(x.text)+'</p></div>').join('')+'</div>'
 +'<p class="arch-bi-caution">'+E(decision.caution)+'</p></details>':'')
 +'</section>';
}
function panel(D,h,profile,active){
 const {esc,sourceLinks}=h,slide=D.slides.items.find(s=>s.profileId===profile.id);
 if(!slide)return '';
 const scene=window.InnsiktArchitectureScenes.render(slide,esc,profile,D.visualAssets,{showNumbers:false});
 const ui=D.pages.architectureExplorerUi;
 return '<section class="arch-explorer-panel" data-arch-panel="'+e(esc,profile.id)+'" role="region" aria-label="'+e(esc,profile.label)+'"'
  +(profile.kind==='vendor'?' data-arch-vendor-panel':'')
  +(active?'':' hidden')+'>'
  +'<div class="arch-explorer-claim"><div><h3>'+e(esc,profile.label)+'</h3><p>'+e(esc,profile.intro)+'</p></div></div>'
  +'<div class="arch-explorer-stage" role="region" tabindex="0" aria-label="'+e(esc,ui.panRegionLabel)+' – '+e(esc,profile.label)+'">'
  +'<div class="present-frame present-rich" data-tone="light">'+scene+'</div>'
  +'<button type="button" class="arch-stage-open" data-arch-detail-open aria-label="'+e(esc,ui.panOpenAria)+'"><span>'+e(esc,ui.panOpenHint)+'</span></button></div>'
  +panNavigation(profile,ui,esc)
  +readingGuide(profile,ui,esc)
  +technicalDetails(D,h,profile)
  +'<div class="arch-explorer-foot"><p>'+e(esc,profile.footer)+'</p>'
  +'<div class="arch-explorer-actions"><a class="btn subtle" href="#lysbilder/'+e(esc,slide.id)+'">'
  +e(esc,ui.openSlide)+'</a></div></div>'
  +'<details class="arch-explorer-sources"><summary>'+e(esc,ui.sourcesLabel)+'</summary>'+sourceLinks(slide.sourceIds||[],D)+'</details>'
  +'</section>';
}
function principles(D,ui,esc){
 const E=x=>e(esc,x),questions=D.horizon.questions;
 return '<section class="arch-principles" data-arch-principles>'
 +'<div class="arch-principles-eyebrow">'+E(D.horizon.ui.generalLabel)+'</div>'
 +'<h2>'+E(questions.title)+'</h2><p>'+E(ui.independentIntro)+'</p>'
 +'<div class="arch-principles-grid">'+questions.items.map((q,i)=>
  '<div class="arch-principle"><span class="arch-principle-num">'+String(i+1).padStart(2,'0')+'</span><p>'+E(q)+'</p></div>').join('')+'</div></section>';
}
function render(D,h){
 const {esc}=h,ui=D.pages.architectureExplorerUi;
 if(!ui||!window.InnsiktArchitectureScenes||!D.architectureProfiles?.profiles)return '';
 const base=D.architectureProfiles.profiles.find(p=>p.id===ui.baseProfileId);
 const vendors=D.architectureProfiles.profiles.filter(p=>p.kind==='vendor');
 if(!base||!vendors.length)return '';
 const chosen=vendors[0].id;
 const choices=vendors.map(p=>
  '<button type="button" data-arch-option="'+e(esc,p.id)+'" aria-pressed="'+(p.id===chosen?'true':'false')+'"'
  +' class="arch-explorer-option'+(p.id===chosen?' is-active':'')+'">'+e(esc,ui.optionLabels[p.id]||p.label)+'</button>'
 ).join('');
 return '<section class="arch-explorer" data-architecture-explorer aria-label="'+e(esc,ui.title)+'">'
  +'<div class="arch-explorer-head"><div class="small-label">'+e(esc,ui.eyebrow)+'</div>'
  +'<h2>'+e(esc,ui.title)+'</h2><p>'+e(esc,ui.intro)+'</p></div>'
  +'<div class="arch-explorer-panels">'+panel(D,h,base,true)+'</div>'
  +principles(D,ui,esc)
  +'<section class="arch-explorer-vendors" data-arch-vendors>'
  +'<div class="arch-explorer-head arch-explorer-vendor-head"><div class="small-label">'+e(esc,ui.vendorEyebrow)+'</div>'
  +'<h2>'+e(esc,ui.vendorTitle)+'</h2><p>'+e(esc,ui.vendorIntro)+'</p></div>'
  +'<div class="arch-explorer-toolbar"><div class="arch-explorer-choicegroup" role="group" aria-label="'+e(esc,ui.vendorGroup)+'">'
  +'<span class="arch-explorer-choice-label">'+e(esc,ui.vendorGroup)+'</span>'+choices+'</div></div>'
  +'<div class="arch-explorer-panels">'+vendors.map(p=>panel(D,h,p,p.id===chosen)).join('')+'</div>'
  +'</section></section>';
}
if(typeof document!=='undefined'&&typeof document.addEventListener==='function')document.addEventListener('click',event=>{
 const detail=event.target instanceof Element?event.target.closest('[data-arch-detail],[data-arch-detail-open]'):null;
 if(detail){
  const region=detail.closest('[data-arch-panel]');
  if(!region)return;
  const active=detail.matches('[data-arch-detail-open]')||!region.classList.contains('is-detail');
  region.classList.toggle('is-detail',active);
  const back=region.querySelector('[data-arch-detail]');
  back.setAttribute('aria-pressed',active?'true':'false');
  back.textContent=active?back.dataset.labelClose:back.dataset.labelOpen;
  if(active)region.querySelector('.arch-explorer-stage').scrollLeft=0;
  else {
   region.querySelector('.arch-explorer-stage').scrollLeft=0;
   region.querySelector('[data-arch-detail-open]').focus();
  }
  return;
 }
 const pan=event.target instanceof Element?event.target.closest('[data-arch-pan]'):null;
 if(pan){
  const region=pan.closest('[data-arch-panel]'),canvas=region?.querySelector('.arch-explorer-stage');
  if(!canvas)return;
  const key=pan.getAttribute('data-arch-pan');
  const selectors={
   sources:'.vp-source-stack,.da-source-col',
   platform:'.vp-snow-shell,.vp-fabric-shell,.vp-db-lake,.da-platform-col',
   uses:'.vp-output-stack,.da-consumers-col'
  };
  const target=canvas.querySelector(selectors[key]||'');
  if(!target)return;
  const bounds=target.getBoundingClientRect(), viewport=canvas.getBoundingClientRect();
  // Centre the shared work area; sources and results stay aligned with their edge.
  const left=canvas.scrollLeft+bounds.left-viewport.left+(key==='platform'?(bounds.width-canvas.clientWidth)/2:0);
  canvas.scrollTo({left:Math.max(0,left),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  return;
 }
 const target=event.target instanceof Element?event.target.closest('[data-arch-option]'):null;
 if(!target)return;
 const explorer=target.closest('[data-architecture-explorer]');
 if(!explorer)return;
 const chosen=target.getAttribute('data-arch-option');
 if(![...explorer.querySelectorAll('[data-arch-vendor-panel]')].some(p=>p.getAttribute('data-arch-panel')===chosen))return;
 for(const button of explorer.querySelectorAll('[data-arch-option]')){
  const selected=button.getAttribute('data-arch-option')===chosen;
  button.setAttribute('aria-pressed',selected?'true':'false');
  button.classList.toggle('is-active',selected);
 }
 for(const region of explorer.querySelectorAll('[data-arch-vendor-panel]')){
  region.hidden=region.getAttribute('data-arch-panel')!==chosen;
 }
});
window.InnsiktArchitectureExplorer={render};
})();