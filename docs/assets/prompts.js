/* Innsikt promptbibliotek – visning, uten nettverkskall eller lokal lagring. Data eies av prompts.json. */
(()=>{
'use strict';
const renderText=(s,e)=>e(s);
const card=(x,e)=>'<a class="prompt-card" href="#prompter/'+e(x.id)+'"><div class="prompt-top"><span class="prompt-chip">'+e(x.category)+'</span><span class="prompt-rank">'+(x.priority===1?'Populær start':'')+'</span></div><h3>'+e(x.title)+'</h3><p>'+e(x.summary)+'</p><div class="prompt-card-foot"><span>'+e(x.audience)+'</span><strong>Se prompten →</strong></div></a>';
function library(d,h,category){
const {esc:e,ico,sourceLinks}=h,p=d.prompts;
const featured=p.page.featuredIds.map(id=>p.items.find(x=>x.id===id)).filter(Boolean);
const rows=category==='Alle'?p.items.filter(x=>!p.page.featuredIds.includes(x.id)):p.items.filter(x=>x.category===category);
return '<header class="page-header"><div class="eyebrow">'+e(p.page.eyebrow)+'</div><h1 class="page-title">'+e(p.page.title)+'</h1><p class="page-desc">'+e(p.page.intro)+'</p></header>'
+'<div class="prompt-safety"><span class="prompt-safety-icon">'+ico('shield')+'</span><p>'+e(p.page.publicWarning)+'</p></div>'
+(category==='Alle'?'<section class="subsection prompt-featured"><div class="section-heading"><div><h2>'+e(p.page.featuredTitle)+'</h2><p>'+e(p.page.featuredIntro)+'</p></div></div><div class="prompt-grid">'+featured.map(x=>card(x,e)).join('')+'</div></section>':'')
+'<section class="subsection"><div class="section-heading"><div><h2>'+(category==='Alle'?e(p.page.moreTitle):e(category))+'</h2><p>'+e(p.page.useHint)+'</p></div></div><div class="filters" role="group" aria-label="Filtrer prompter">'+[p.page.allLabel,...p.categories].map(x=>'<button type="button" class="filter '+(x===category?'active':'')+'" aria-pressed="'+(x===category)+'" data-prompt-filter="'+e(x)+'">'+e(x)+'</button>').join('')+'</div><div class="prompt-grid">'+rows.map(x=>card(x,e)).join('')+'</div></section>'
+'<details class="prompt-howto"><summary>'+e(p.page.usageTitle)+' '+ico('chevron-down')+'</summary><ol>'+p.page.usageSteps.map(x=>'<li>'+e(x)+'</li>').join('')+'</ol></details>'
+'<section class="subsection"><div class="prompt-next-stage"><div><h3>'+e(p.page.internalTitle)+'</h3><p>'+e(p.page.internalBody)+'</p></div><span class="prompt-private-icon">'+ico('lock')+'</span></div>'+sourceLinks(p.sourceIds,d)+'</section>';
}
function detail(d,h,id){
 const {esc:e,ico,sourceLinks}=h,x=d.prompts.items.find(t=>t.id===id);
 if(!x)return library(d,h,'Alle');
 const p=d.prompts.page;
 return '<a href="#prompter" class="back-link">'+ico('arrow-left')+' Alle prompter</a>'
 +'<header class="page-header prompt-detail-head"><div class="eyebrow">'+e(x.category)+' · '+e(x.audience)+'</div><h1 class="page-title">'+e(x.title)+'</h1><p class="page-desc">'+e(x.summary)+'</p></header>'
 +'<div class="prompt-detail-layout"><section class="prompt-main-panel"><div class="prompt-edit-head"><div><h2>Prompten</h2><p>'+e(p.editorHelp)+'</p></div><span class="prompt-chip">Kopier og tilpass</span></div>'
 +'<label class="input-label" for="prompt-editor">Tekst du kan redigere</label><textarea id="prompt-editor" class="prompt-editor" spellcheck="true">'+e(x.prompt)+'</textarea>'
 +'<div class="prompt-actions"><button type="button" class="btn dark" data-prompt-copy="'+e(x.id)+'">'+ico('copy')+' '+e(p.copyLabel)+'</button><button type="button" class="btn subtle" data-prompt-reset="'+e(x.id)+'">'+ico('refresh')+' '+e(p.resetLabel)+'</button></div>'
 +'<div class="prompt-safety-inline">'+ico('shield')+' '+e(p.publicWarning)+'</div></section>'
 +'<aside class="prompt-side-panel"><div class="panel"><h3>Når passer den?</h3><p>'+e(x.when)+'</p><h3>Ha dette klart</h3><ul>'+x.before.map(y=>'<li>'+e(y)+'</li>').join('')+'</ul><h3>Felter å erstatte</h3><div class="prompt-placeholder-list">'+x.placeholders.map(y=>'<code>['+e(y)+']</code>').join('')+'</div>'
 +'<p class="fineprint">'+(x.sourceMode==='approved-internal'?'Bruk bare anonymiserte eller offentlig godkjente opplysninger inntil løsningen er flyttet og tilgangsstyrt.':'Kan brukes med offentlig tilgjengelige eller generiske opplysninger.')+'</p></div>'
 +'<div class="panel"><h3>'+e(p.reviewTitle)+'</h3><ul>'+x.review.map(y=>'<li>'+e(y)+'</li>').join('')+'</ul></div>'
 +'</aside></div>'
 +'<section class="subsection"><div class="insight-strip"><div><h3>Vil du videre etter svaret?</h3><p>'+e(p.nextStepHint)+'</p></div><a href="#forretning" class="btn dark">Se forretningsbehov '+ico('arrow-right')+'</a></div></section>';
}
window.InnsiktPrompts={library,detail,card};
})();
