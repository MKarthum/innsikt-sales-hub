/* Responsive architecture explorer. Content and media are never owned here:
   profiles -> architecture-profiles.json, slides -> slides.json, sources -> sources.json. */
(()=>{
'use strict';
const e=(escape,value)=>escape(String(value??''));
function mobileModel(profile,ui,escape){
 const d=profile.diagram;
 const values=items=>(items||[]).map(x=>typeof x==='string'?x:[x.label,x.sub].filter(Boolean).join(' – '));
 let phases;
 if(profile.variant==='snowflake-hub'){
  phases=[
   {heading:d.sourceTitle,items:values(d.sources)},
   {heading:d.ingestTitle,items:values(d.ingest)},
   {heading:d.coreTitle,items:[d.coreText]},
   {heading:d.transformTitle,items:values(d.transform)},
   {heading:d.outputTitle,items:values(d.outputs)}
  ];
 }else if(profile.variant==='fabric-experiences'){
  phases=[
   {heading:d.sourceTitle,items:values(d.sources)},
   {heading:d.topTitle,items:values(d.ingest)},
   {heading:d.workloadTitle,items:values(d.workloads)},
   {heading:d.lakeTitle,items:[d.lakeDescription]},
   {heading:d.outputTitle,items:values(d.outputs)}
  ];
 }else if(profile.variant==='databricks-medallion'){
  phases=[
   {heading:d.sourceTitle,items:values(d.sources)},
   {heading:d.ingestTitle,items:values(d.ingest)},
   {heading:d.lakeTitle,items:values(d.tiers)},
   {heading:d.workloadTitle,items:values(d.workloads)},
   {heading:d.outputTitle,items:values(d.outputs)}
  ];
 }else{
  phases=[
   {heading:ui.sources,items:values(profile.sources)},
   {heading:profile.ingest.title,items:values(profile.ingest.items)},
   {heading:profile.platform.title,items:[profile.platform.top,profile.platform.bottom]},
   {heading:profile.serve.title,items:values(profile.serve.items)},
   {heading:ui.uses,items:values(profile.consumers)}
  ];
 }
 const support=d?.support||profile.support;
 return '<div class="arch-explorer-mobile" data-arch-mobile="'+e(escape,profile.id)+'">'
 +'<ol class="arch-explorer-steps"'+(d?' data-arch-vendor-detail="'+e(escape,profile.id)+'"':'')+'>'+phases.map((step,i)=>
  '<li><span class="arch-explorer-stepno" aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span>'
  +'<div><h3>'+e(escape,step.heading)+'</h3><p>'+step.items.map(x=>e(escape,x)).join(' · ')+'</p></div></li>'
 ).join('')+'</ol>'
 +'<div class="arch-explorer-foundation"><strong>'+e(escape,ui.crosscutting)+'</strong><p>'+values(support).map(x=>e(escape,x)).join(' · ')+'</p></div>'
 +(d?.foot?'<p class="arch-explorer-scene-note" data-arch-scene-note>'+e(escape,d.foot)+'</p>':'')
 +(profile.kind==='vendor'?'<p class="arch-explorer-disclaimer" data-arch-vendor-notice>'+e(escape,profile.brandNotice||ui.vendorNotice)+'</p>':'')
 +'</div>';
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