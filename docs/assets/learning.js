/* Innsikt v0.5 – visningsfunksjoner. All faglig tekst og alle diagrammer eies av learning.json. */
(() => {
'use strict';
function card(d,e){
 return '<a class="learning-card" href="#arkitektur/'+e(d.id)+'"><span class="lesson-badge">'+e(d.steps.length)+' steg</span><h3>'+e(d.title)+'</h3><p>'+e(d.description)+'</p><span class="lesson-link">Se arkitekturskissen →</span></a>';
}
function diagram(d,{esc:e,ico}){
 return '<figure class="diagram" aria-label="'+e(d.title)+'">'
 +'<figcaption><h3>'+e(d.title)+'</h3><p>'+e(d.description)+'</p></figcaption>'
 +'<div class="diagram-flow'+(d.direction==='up'?' diagram-flow-up':'')+'">'+d.steps.map((s,i)=>'<div class="diagram-step"><div class="diagram-step-number">'+(i+1)+'</div><strong>'+e(s.title)+'</strong><span>'+e(s.detail)+'</span></div>'+(i<d.steps.length-1?'<span class="diagram-arrow" aria-hidden="true">'+ico(d.direction==='up'?'arrow-up':'arrow-right')+'</span>':'')).join('')+'</div>'
 +'<div class="diagram-outcome"><strong>Hva gir dette?</strong><p>'+e(d.outcome)+'</p></div>'
 +'</figure>';
}
function start(D,h){
 const {esc:e,headerCopy,ico}=h,b=D.learning.beginner;
 return headerCopy('GRUNNKUNNSKAP')
 +'<section class="panel lesson-story"><div class="small-label">'+e(b.readingTime.toUpperCase())+' · ETT GJENNOMGÅENDE EKSEMPEL</div><h2>'+e(b.storyTitle)+'</h2><p>'+e(b.story)+'</p></section>'
 +'<div class="learning-sections">'+b.chapters.map(x=>'<section class="lesson-chapter"><h3>'+e(x.title)+'</h3><p>'+e(x.text)+'</p></section>').join('')+'</div>'
 +'<section class="subsection"><div class="section-heading"><h2>'+e(b.diagramTitle)+'</h2></div>'+diagram(D.learning.diagrams.find(x=>x.id==='bi'),h)+'</section>'
 +'<section class="subsection"><div class="insight-strip"><div><h3>'+e(b.nextTitle)+'</h3><p>'+e(b.nextIntro)+'</p></div><div class="promo-actions">'+b.relatedLinks.map(x=>'<a class="btn subtle" href="'+e(x.route)+'">'+e(x.label)+' '+ico('arrow-right')+'</a>').join('')+'</div></div></section>';
}
function glossary(D,h,selectedId){
 const {esc:e,headerCopy}=h;
 return headerCopy('ORDLISTE')
 +'<div class="glossary">'+D.learning.glossary.map(g=>'<details class="glossary-item" data-glossary-id="'+e(g.id)+'"'+(g.id===selectedId?' open':'')+'><summary>'+e(g.term)+'</summary>'+(g.fullName?'<p class="fineprint"><strong>Fullt navn:</strong> '+e(g.fullName)+'</p>':'')+'<p>'+e(g.meaning)+'</p><p class="fineprint"><strong>Eksempel:</strong> '+e(g.example)+'</p></details>').join('')+'</div>';
}
function architecture(D,h,id){
 const {esc:e,headerCopy,ico,sourceLinks}=h,diagrams=D.learning.diagrams,d=diagrams.find(x=>x.id===id);
 if(d)return '<a class="back-link" href="#arkitektur">'+ico('arrow-left')+' Alle skisser</a>'
 +headerCopy('ARKITEKTUR')+diagram(d,h)
 +'<div class="arch-detail-grid"><section class="panel"><h3>Spørsmål du kan stille kunden</h3><ul class="lesson-questions">'+d.questions.map(q=>'<li>'+e(q)+'</li>').join('')+'</ul><a class="btn subtle" href="#verktoy/ai">Se kartleggingsmal '+ico('arrow-right')+'</a></section>'
 +'<section class="panel"><h3>Dette er forenklet</h3><p>'+e(d.caution)+'</p>'+sourceLinks(d.sources,D)+'</section></div>'
 +'<section class="subsection"><div class="section-heading"><div><h2>Se et annet oppsett</h2></div></div><div class="learning-grid">'+diagrams.filter(x=>x.id!==id).map(x=>card(x,e)).join('')+'</div></section>';
 const u=D.pages.architectureExplorerUi,featured=u.applicationDiagramIds||[],applications=featured.map(diagramId=>diagrams.find(x=>x.id===diagramId)).filter(Boolean);
 return headerCopy('ARKITEKTUR')
 +window.InnsiktArchitectureExplorer.render(D,h)
 +'<section class="arch-principles" data-arch-principles>'
 +'<div class="arch-principles-eyebrow">'+e(D.horizon.ui.generalLabel)+'</div>'
 +'<h2>'+e(D.horizon.questions.title)+'</h2><p>'+e(u.independentIntro)+'</p>'
 +'<div class="arch-principles-grid">'+D.horizon.questions.items.map((q,i)=>'<div class="arch-principle"><span class="arch-principle-num">'+String(i+1).padStart(2,'0')+'</span><p>'+e(q)+'</p></div>').join('')+'</div></section>'
 +'<section class="arch-applications"><div class="section-heading"><div><h2>'+e(u.applicationsTitle)+'</h2><p>'+e(u.applicationsIntro)+'</p></div></div>'
 +'<div class="learning-grid">'+applications.map(x=>card(x,e)).join('')+'</div></section>'
 +'<details class="arch-explorer-more"><summary>'+e(u.moreDiagrams)+'</summary>'
 +'<div class="section-heading"><div><h2>'+e(u.otherDiagramsTitle)+'</h2><p>'+e(u.otherDiagramsIntro)+'</p></div></div>'
 +'<div class="learning-grid">'+diagrams.filter(x=>!featured.includes(x.id)).map(x=>card(x,e)).join('')+'</div></details>'
 +'<section class="subsection"><div class="section-heading"><div><h2>Risiko når KI får et svakt datagrunnlag</h2><p>KI kan gjøre det enklere å stille spørsmål, men ikke automatisk gjøre tallene riktige.</p></div></div><div class="risk-grid">'+D.learning.risks.map(x=>'<article class="risk-card"><h3>'+e(x.title)+'</h3><p>'+e(x.example)+'</p><div class="risk-action"><strong>Hva hjelper?</strong> '+e(x.action)+'</div></article>').join('')+'</div></section>'
 +'<section class="subsection"><div class="note-card"><b>Viktig nyanse</b>Strukturerte data er spesielt viktig når KI skal svare på tall, KPI-er og hendelser. Dokumentbasert KI kan også bruke tekst og ustrukturerte kilder, men krever tilsvarende arbeid med kvalitet, tilgang og etterprøving.</div></section>'
 +'<section class="subsection"><a class="text-link" href="#horisont">'+e(D.pages.navigation.horisont)+' '+ico('arrow-right')+'</a></section>';
}
function templateText(t){return t.title+'\nFormål: '+t.purpose+'\n\n'+t.sections.map(s=>s.title+'\n'+s.questions.map(q=>'- '+q).join('\n')).join('\n\n')+'\n\nViktig: '+t.caution;}
function toolkit(D,h,id){
 const {esc:e,headerCopy,ico}=h,t=D.learning.templates.find(x=>x.id===id);
 if(t)return '<a class="back-link" href="#verktoy">'+ico('arrow-left')+' Alle maler</a>'
 +headerCopy('VERKTØYKASSE')
 +'<div class="tool-detail"><div class="small-label">'+e(t.audience)+'</div><h2>'+e(t.title)+'</h2><p>'+e(t.purpose)+'</p><button class="btn dark" type="button" data-copy-template="'+e(t.id)+'">'+ico('copy')+' Kopier malen</button></div>'
 +'<div class="tool-section-grid">'+t.sections.map(s=>'<article class="panel"><h3>'+e(s.title)+'</h3><ol class="question-list">'+s.questions.map(q=>'<li>'+e(q)+'</li>').join('')+'</ol></article>').join('')+'</div>'
 +'<div class="note-card" style="margin-top:22px"><b>Før den brukes med en reell kunde</b>'+e(t.caution)+'</div>';
 return headerCopy('VERKTØYKASSE')
 +'<div class="welcome-top"><div><h2>Bruk som startpunkt – tilpass til kunden</h2><p>Du kan kopiere spørsmålene til dine egne interne arbeidsdokumenter. Denne nettsiden lagrer ikke utfylte kundedata.</p></div><a class="btn subtle" href="#kundedialog">Øv på samtalen '+ico('arrow-right')+'</a></div>'
 +'<div class="learning-grid">'+D.learning.templates.map(t=>'<a class="learning-card" href="#verktoy/'+e(t.id)+'"><span class="lesson-badge">'+e(t.audience)+'</span><h3>'+e(t.title)+'</h3><p>'+e(t.purpose)+'</p><span class="lesson-link">Åpne malen →</span></a>').join('')+'</div>';
}
window.InnsiktLearning={start,glossary,architecture,toolkit,diagram,templateText};
})();
