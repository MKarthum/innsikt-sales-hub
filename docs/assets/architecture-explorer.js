/* Responsive architecture explorer. Content and media are never owned here:
   profiles -> architecture-profiles.json, slides -> slides.json, sources -> sources.json. */
(()=>{
'use strict';
const e=(escape,value)=>escape(String(value??''));
function mobileModel(profile,ui,escape){
 const phases=[
  {heading:ui.sources,items:profile.sources.map(x=>x.label)},
  {heading:profile.ingest.title,items:profile.ingest.items},
  {heading:profile.platform.title,items:[profile.platform.top,profile.platform.bottom]},
  {heading:profile.serve.title,items:profile.serve.items},
  {heading:ui.uses,items:profile.consumers.map(x=>x.label)}
 ];
 return '<div class="arch-explorer-mobile"><ol class="arch-explorer-steps">'+phases.map((step,i)=>
  '<li><span class="arch-explorer-stepno" aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span>'
  +'<div><h3>'+e(escape,step.heading)+'</h3><p>'+step.items.map(x=>e(escape,x)).join(' · ')+'</p></div></li>'
 ).join('')+'</ol>'
 +'<div class="arch-explorer-foundation"><strong>'+e(escape,ui.crosscutting)+'</strong><p>'+profile.support.map(x=>e(escape,x.label)).join(' · ')+'</p></div></div>';
}
function panel(D,h,profile,active){
 const {esc,sourceLinks}=h,slide=D.slides.items.find(s=>s.profileId===profile.id);
 if(!slide)return '';
 const scene=window.InnsiktArchitectureScenes.render(slide,esc,profile,D.visualAssets,{showNumbers:false});
 const ui=D.pages.architectureExplorerUi;
 return '<section class="arch-explorer-panel" data-arch-panel="'+e(esc,profile.id)+'" role="region" aria-label="'+e(esc,profile.label)+'"'
  +(active?'':' hidden')+'>'
  +'<div class="arch-explorer-claim"><div><h3>'+e(esc,profile.label)+'</h3><p>'+e(esc,profile.intro)+'</p></div></div>'
  +'<div class="arch-explorer-stage" aria-label="'+e(esc,profile.label)+'">'
  +'<div class="present-frame present-rich" data-tone="light">'+scene+'</div></div>'
  +mobileModel(profile,ui,esc)
  +'<div class="arch-explorer-foot"><p>'+e(esc,profile.footer)+'</p>'
  +'<div class="arch-explorer-actions"><a class="btn subtle" href="#lysbilder/'+e(esc,slide.id)+'">'
  +e(esc,ui.openSlide)+'</a></div></div>'
  +'<details class="arch-explorer-sources"><summary>'+e(esc,ui.sourcesLabel)+'</summary>'+sourceLinks(slide.sourceIds||[],D)+'</details>'
  +'</section>';
}
function render(D,h){
 const {esc}=h,ui=D.pages.architectureExplorerUi;
 if(!ui||!window.InnsiktArchitectureScenes||!D.architectureProfiles?.profiles)return '';
 const profiles=D.architectureProfiles.profiles.filter(p=>D.slides.items.some(s=>s.profileId===p.id));
 const initial=profiles[0]?.id;if(!initial)return '';
 const options=groups=>groups.map(p=>
  '<button type="button" data-arch-option="'+e(esc,p.id)+'" aria-pressed="'+(p.id===initial?'true':'false')+'"'
  +' class="arch-explorer-option'+(p.id===initial?' is-active':'')+'">'+e(esc,ui.optionLabels[p.id]||p.label)+'</button>'
 ).join('');
 const generic=profiles.filter(p=>p.kind!=='vendor'),vendors=profiles.filter(p=>p.kind==='vendor');
 return '<section class="arch-explorer" data-architecture-explorer aria-label="'+e(esc,ui.title)+'">'
  +'<div class="arch-explorer-head"><div class="small-label">'+e(esc,ui.eyebrow)+'</div>'
  +'<h2>'+e(esc,ui.title)+'</h2><p>'+e(esc,ui.intro)+'</p></div>'
  +'<div class="arch-explorer-toolbar">'
  +'<div class="arch-explorer-choicegroup" role="group" aria-label="'+e(esc,ui.genericGroup)+'">'
  +'<span class="arch-explorer-choice-label">'+e(esc,ui.genericGroup)+'</span>'+options(generic)+'</div>'
  +'<div class="arch-explorer-choicegroup" role="group" aria-label="'+e(esc,ui.vendorGroup)+'">'
  +'<span class="arch-explorer-choice-label">'+e(esc,ui.vendorGroup)+'</span>'+options(vendors)+'</div></div>'
  +'<div class="arch-explorer-panels">'+profiles.map(p=>panel(D,h,p,p.id===initial)).join('')+'</div>'
  +'</section>';
}
if(typeof document!=='undefined'&&typeof document.addEventListener==='function')document.addEventListener('click',event=>{
 const target=event.target instanceof Element?event.target.closest('[data-arch-option]'):null;
 if(!target)return;
 const explorer=target.closest('[data-architecture-explorer]');
 if(!explorer)return;
 const chosen=target.getAttribute('data-arch-option');
 if(![...explorer.querySelectorAll('[data-arch-panel]')].some(p=>p.getAttribute('data-arch-panel')===chosen))return;
 for(const button of explorer.querySelectorAll('[data-arch-option]')){
  const selected=button.getAttribute('data-arch-option')===chosen;
  button.setAttribute('aria-pressed',selected?'true':'false');
  button.classList.toggle('is-active',selected);
 }
 for(const region of explorer.querySelectorAll('[data-arch-panel]')){
  region.hidden=region.getAttribute('data-arch-panel')!==chosen;
 }
});
window.InnsiktArchitectureExplorer={render};
})();