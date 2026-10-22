/* Innsikt promptbibliotek – visning. All brukerrettet tekst og variabelskjema eies av prompts.json. */
(()=>{
'use strict';
const context=()=>window.InnsiktPromptContext;
const card=(x,e,page)=>'<a class="prompt-card" href="#prompter/'+e(x.id)+'"><div class="prompt-top"><span class="prompt-chip">'+e(x.category)+'</span></div><h3>'+e(x.title)+'</h3><p>'+e(x.summary)+'</p><div class="prompt-card-foot"><span>'+e(x.audience)+'</span><strong>'+e(page.cardLinkLabel)+' →</strong></div></a>';
const toolbar=(p,e,ico)=>'<div class="prompt-context-toolbar"><div><strong>'+e(p.variableUi.toolbarTitle)+'</strong><p>'+e(p.variableUi.toolbarDescription)+'</p></div><a href="#prompter/variabler" class="btn subtle">'+ico('layers')+' '+e(p.variableUi.openOverview)+'</a></div>';
function variableField(x,p,e,ico,linked=false){
 const ui=p.variableUi;
 const field=x.multiline?'<textarea class="prompt-var-input" data-context-var="'+e(x.id)+'" id="context-'+e(x.id)+'" rows="3" maxlength="'+e(x.maxLength||2000)+'" placeholder="'+e(x.hint||ui.emptyHint)+'">'+e(x.value)+'</textarea>'
  :'<input type="text" class="prompt-var-input" data-context-var="'+e(x.id)+'" id="context-'+e(x.id)+'" maxlength="'+e(x.maxLength||2000)+'" value="'+e(x.value)+'" placeholder="'+e(x.hint||ui.emptyHint)+'" autocomplete="off"/>';
 return '<div class="prompt-var-field"><div class="prompt-var-head"><label for="context-'+e(x.id)+'">'+e(x.label)+'</label><span class="prompt-var-retention">'+e(x.retention==='session'?ui.sessionHint:ui.memoryHint)+'</span></div>'
 +'<div class="prompt-var-controls">'+field+'<button type="button" class="btn subtle prompt-var-clear" data-context-clear="'+e(x.id)+'" aria-label="'+e(ui.clearOne)+' '+e(x.label)+'">'+ico('close')+' <span>'+e(ui.clearOne)+'</span></button></div>'
 +(linked&&x.usedBy.length?'<div class="prompt-var-links">'+e(ui.usedBy)+' '+x.usedBy.map(y=>'<a href="#prompter/'+e(y.id)+'">'+e(y.title)+'</a>').join(' · ')+'</div>':'')
 +'</div>';
}
function choiceField(item,p,key,e){
 const ctx=context(),g=key==='depth'||key==='format'?p.outputSettings[key]:p.choiceGroups[key];
 if(!g)return '';
 const choices=ctx.options(item,key);
 return '<fieldset class="prompt-choice-field"><legend>'+e(g.label)+'</legend>'
  +(g.hint?'<p class="prompt-choice-hint">'+e(g.hint)+'</p>':'')
  +'<div class="prompt-choice-options">'+choices.map(o=>{
   const checked=ctx.getChoice(item,key)===o.id;
   return '<label class="prompt-choice-option"><input type="radio" name="prompt-choice-'+e(key)+'" data-prompt-choice="'+e(key)+'" data-prompt-item="'+e(item.id)+'" value="'+e(o.id)+'" '+(checked?'checked':'')+'><span>'+e(o.label)+'</span></label>';
  }).join('')+'</div></fieldset>';
}
function library(d,h,category){
 const {esc:e,ico,sourceLinks}=h,p=d.prompts,ui=p.page.variableUi;
 const primary=p.page.primaryIds.map(id=>p.items.find(x=>x.id===id)).filter(Boolean);
 const others=p.items.filter(x=>!p.page.primaryIds.includes(x.id));
 const filtered=p.items.filter(x=>x.category===category);
 const section=(title,intro,items)=>!items.length?'':'<section class="subsection"><div class="section-heading"><div><h2>'+e(title)+'</h2><p>'+e(intro)+'</p></div></div><div class="prompt-grid">'+items.map(x=>card(x,e,p.page)).join('')+'</div></section>';
 return '<header class="page-header"><div class="eyebrow">'+e(p.page.eyebrow)+'</div><h1 class="page-title">'+e(p.page.title)+'</h1><p class="page-desc">'+e(p.page.intro)+'</p></header>'
 +'<div class="prompt-safety"><span class="prompt-safety-icon">'+ico('shield')+'</span><p>'+e(p.page.publicWarning)+'</p></div>'
 +toolbar(p.page,e,ico)
 +'<div class="filters" role="group" aria-label="'+e(p.page.filterAriaLabel)+'">'+[p.page.allLabel,...p.categories].map(x=>'<button type="button" class="filter '+(x===category?'active':'')+'" aria-pressed="'+(x===category)+'" data-prompt-filter="'+e(x)+'">'+e(x)+'</button>').join('')+'</div>'
 +(category==='Alle'?'<div class="prompt-primary">'+section(p.page.primaryTitle,p.page.primaryIntro,primary)+'</div>'
  +'<details class="prompt-more-tasks"><summary>'+e(ui.moreTasksLabel)+' ('+others.length+') '+ico('chevron-down')+'</summary><p>'+e(ui.moreTasksDescription)+'</p><div class="prompt-grid">'+others.map(x=>card(x,e,p.page)).join('')+'</div></details>'
  :section(category,p.page.useHint,filtered))
 +'<details class="prompt-howto"><summary>'+e(p.page.usageTitle)+' '+ico('chevron-down')+'</summary><ol>'+p.page.usageSteps.map(x=>'<li>'+e(x)+'</li>').join('')+'</ol></details>'
 +'<section class="subsection"><div class="prompt-next-stage"><div><h3>'+e(p.page.internalTitle)+'</h3><p>'+e(p.page.internalBody)+'</p></div><span class="prompt-private-icon">'+ico('lock')+'</span></div>'+sourceLinks(p.sourceIds,d)+'</section>';
}
function detail(d,h,id){
 const {esc:e,ico}=h,x=d.prompts.items.find(t=>t.id===id);
 if(!x)return library(d,h,'Alle');
 const p=d.prompts.page,ui=p.variableUi,ctx=context();
 const used=ctx.entries().filter(v=>x.placeholders.some(n=>n===v.id||(v.aliases||[]).includes(n))&&v.id!=='KUNDEKONTEKST');
 const shared=ctx.entries().find(v=>v.id==='KUNDEKONTEKST');
 const hasContext=(x.contextVariables||[]).includes('KUNDEKONTEKST')&&shared;
 const prompt=ctx.composeTask(x,d.prompts),blocks=ctx.selectedBlocks(x,d.prompts);
 const previewRow=b=>b.key==='organizationTemplates'?'':'<div class="prompt-preview-line" data-preview-key="'+e(b.key)+'"><strong>'+e(b.option)+'</strong><p>'+e(b.instruction)+'</p></div>';
 const preview='<section class="prompt-live-panel" aria-label="'+e(ui.previewTitle)+'"><h2>'+e(ui.previewTitle)+'</h2><p class="prompt-preview-intro">'+e(ui.previewIntro)+'</p>'
  +'<div class="prompt-preview-lines" id="prompt-preview-lines" aria-live="polite">'+blocks.map(previewRow).join('')+'</div>'
  +'<p class="prompt-preview-dirty" id="prompt-preview-dirty" hidden>'+e(ui.previewDirty)+'</p>'
  +'</section>';
 const checkbox=(key,label,description)=>'<label class="prompt-checkbox"><input type="checkbox" data-prompt-toggle="'+e(key)+'" data-prompt-item="'+e(x.id)+'" '+(ctx.getChoice(x,key)?'checked':'')+'><span><strong>'+e(label)+'</strong><small>'+e(description)+'</small></span></label>';
 const firmalayout=d.prompts.outputSettings.organizationTemplates;
 const formatSubChoice='<div class="prompt-format-subchoice" data-prompt-format-subchoice'+(ctx.supportsOrganizationTemplates(x,d.prompts)?'':' hidden')+'>'
  +checkbox('organizationTemplates',firmalayout.label,firmalayout.hint)+'</div>';
 const cv=x.cvOutput,cvExtra=cv?'<div class="prompt-cv-options" data-prompt-cv-options'+(ctx.isCvDraft(x)?'':' hidden')+'>'
  +choiceField({...x,choiceGroups:[...x.choiceGroups,cv.lengthGroup]},d.prompts,cv.lengthGroup,e)
  +checkbox('clientTemplate',cv.template.label,cv.template.hint)+'</div>':'';


 return '<a href="#prompter" class="back-link">'+ico('arrow-left')+' '+e(ui.allPrompts)+'</a>'
 +'<header class="page-header prompt-detail-head"><div class="eyebrow">'+e(x.category)+' · '+e(x.audience)+'</div><h1 class="page-title">'+e(x.title)+'</h1><p class="page-desc">'+e(x.summary)+'</p></header>'
 +'<div class="prompt-detail-layout"><aside class="prompt-detail-aside">'+preview
 +'<details class="prompt-guide-details"><summary>'+e(ui.guideToggle)+'</summary>'
 +'<div class="prompt-side-panel"><h3>'+e(ui.beforeTitle)+'</h3><ul>'+x.before.map(y=>'<li>'+e(y)+'</li>').join('')+'</ul>'
 +'<h3>'+e(p.reviewTitle)+'</h3><ul>'+x.review.map(y=>'<li>'+e(y)+'</li>').join('')+'</ul>'
 +(x.sourceMode==='approved-internal'?'<p class="prompt-guide-caution">'+e(ui.internalCaution)+'</p>':'')
 +'</div></details></aside><section class="prompt-main-panel"><div class="prompt-edit-head"><div><h2>'+e(ui.fieldsTitle)+'</h2><p>'+e(ui.fieldsIntro)+'</p></div><a class="prompt-overview-link" href="#prompter/variabler">'+e(ui.openOverview)+' →</a></div>'
 +'<div class="prompt-var-grid">'+used.map(v=>variableField(v,p,e,ico)).join('')+'</div>'
 +'<div class="prompt-options"><h2>'+e(ui.choicesTitle)+'</h2>'
 +(x.choiceGroups||[]).map(k=>choiceField(x,d.prompts,k,e)).join('')+cvExtra
 +choiceField(x,d.prompts,'depth',e)+choiceField(x,d.prompts,'format',e)+formatSubChoice
 +'<p class="prompt-format-notice">'+e(ui.formatNotice)+'</p>'
 +checkbox('handoff',ui.handoffLabel,ui.handoffDescription)
 +(hasContext?checkbox('context',ui.contextInclude,ui.contextNote):'')
 +'</div>'
 +(hasContext?'<details class="prompt-context-more"><summary>'+e(ui.contextTitle)+' '+ico('chevron-down')+'</summary><p class="fineprint">'+e(ui.contextNote)+'</p>'+variableField(shared,p,e,ico)+'</details>':'')
 +'<details class="prompt-advanced" id="prompt-advanced"><summary>'+e(ui.advancedTitle)+' '+ico('chevron-down')+'</summary><p class="fineprint">'+e(ui.advancedIntro)+'</p><label class="input-label" for="prompt-editor">'+e(ui.editorLabel)+'</label>'
 +'<textarea id="prompt-editor" class="prompt-editor" spellcheck="true">'+e(prompt)+'</textarea>'
 +'<div id="prompt-editor-status" class="prompt-editor-status" role="status" aria-live="polite"></div>'
 +'<div class="prompt-actions"><button type="button" class="btn subtle" data-prompt-reset="'+e(x.id)+'">'+ico('refresh')+' '+e(p.resetLabel)+'</button></div></details>'
 +'<div class="prompt-primary-copy"><button type="button" class="btn dark" data-prompt-copy="'+e(x.id)+'">'+ico('copy')+' '+e(p.copyLabel)+'</button><span>'+e(ui.copyReady)+'</span></div>'
 +'<div class="prompt-safety-inline">'+ico('shield')+' '+e(p.publicWarning)+'</div></section>'
 +'</div>'
 +'<section class="subsection"><div class="insight-strip"><div><h3>'+e(ui.nextTitle)+'</h3><p>'+e(p.nextStepHint)+'</p></div><a href="#forretning" class="btn dark">'+e(ui.nextAction)+' '+ico('arrow-right')+'</a></div></section>';
}
function overview(d,h){
 const {esc:e,ico}=h,p=d.prompts.page,ui=p.variableUi,entries=context().entries(),unused=entries.filter(x=>!x.usedBy.length);
 const groups=d.prompts.variableGroups||[];
 const form=groups.map(g=>{
  const vars=entries.filter(x=>x.group===g.id);
  return !vars.length?'':'<section class="prompt-var-group"><div class="section-heading"><div><h2>'+e(g.label)+'</h2><p>'+e(g.description)+'</p></div></div><div class="prompt-overview-grid">'+vars.map(v=>variableField(v,p,e,ico,true)).join('')+'</div></section>';
 }).join('');
 return '<a href="#prompter" class="back-link">'+ico('arrow-left')+' '+e(ui.allPrompts)+'</a>'
 +'<header class="page-header"><div class="eyebrow">'+e(ui.overviewEyebrow)+'</div><h1 class="page-title">'+e(ui.overviewTitle)+'</h1><p class="page-desc">'+e(ui.overviewIntro)+'</p></header>'
 +'<div class="prompt-safety"><span class="prompt-safety-icon">'+ico('shield')+'</span><p>'+e(ui.privacyNotice)+'</p></div>'
 +'<div class="prompt-overview-status"><strong>'+e(ui.variableCount)+': '+entries.length+'</strong><span>'+e(ui.filledCount)+': <span data-context-count>'+entries.filter(x=>x.value.trim()).length+'</span></span><span>'+e(ui.unusedCount)+': '+unused.length+'</span></div>'
 +'<div class="prompt-overview-actions"><button class="btn subtle" type="button" data-context-clear-all>'+ico('refresh')+' '+e(ui.clearAll)+'</button></div>'
 +form
 +(unused.length?'<section class="prompt-var-group prompt-orphans"><h2>'+e(ui.unusedTitle)+'</h2><p>'+e(ui.unusedIntro)+'</p><div class="prompt-overview-grid">'+unused.map(v=>v.orphan?'<div class="prompt-var-field"><strong>'+e(v.id)+'</strong><p>'+e(ui.orphanDescription)+'</p><button type="button" class="btn subtle" data-context-clear="'+e(v.id)+'">'+e(ui.clearOne)+'</button></div>':'<div class="prompt-var-field"><strong>'+e(v.label)+'</strong><p>'+e(ui.unusedDefined)+'</p></div>').join('')+'</div></section>':'<p class="prompt-no-orphans">'+e(ui.noUnused)+'</p>');
}
window.InnsiktPrompts={library,detail,overview,card};
})();
