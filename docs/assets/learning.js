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
 +'<div class="welcome-top"><div><div class="small-label">'+e(b.readingTime.toUpperCase())+'</div><h2>Du trenger ikke forstå alle verktøyene</h2><p>Dette er grunnlaget for å forstå samtalene om data og KI. Vil du bare ha hjelp til et kundemøte, kan du gå rett til salgsinngangene.</p></div><a class="btn dark" href="#forretning">Finn kundesignaler '+ico('arrow-right')+'</a></div>'
 +'<section class="panel lesson-story"><div class="small-label">ET GJENKJENNELIG EKSEMPEL</div><h3>'+e(b.storyTitle)+'</h3><p>'+e(b.story)+'</p></section>'
 +'<div class="learning-sections">'+b.chapters.map(x=>'<section class="lesson-chapter"><h3>'+e(x.title)+'</h3><p>'+e(x.text)+'</p></section>').join('')+'</div>'
 +'<div class="section-heading"><div><h2>En dataflyt i ett bilde</h2><p>Hva skjer mellom systemene og rapporten?</p></div></div>'+diagram(D.learning.diagrams.find(x=>x.id==='bi'),h)
 +'<section class="subsection"><div class="section-heading"><div><h2>'+e(D.learning.ui.glossaryTitle)+'</h2><p>'+e(D.learning.ui.glossaryIntro)+'</p></div></div><div class="glossary">'+D.learning.glossary.map(g=>'<details class="glossary-item"><summary>'+e(g.term)+'</summary>'+(g.fullName?'<p class="fineprint"><strong>Fullt navn:</strong> '+e(g.fullName)+'</p>':'')+'<p>'+e(g.meaning)+'</p><p class="fineprint"><strong>Eksempel:</strong> '+e(g.example)+'</p></details>').join('')+'</div></section>'
 +'<section class="subsection"><div class="insight-strip"><div><h3>Du kan allerede føre en relevant samtale</h3><p>'+e(b.questions.join(' · '))+'</p></div><a class="btn dark" href="#verktoy/first">Åpne møtemal '+ico('arrow-right')+'</a></div></section>';
}
function architecture(D,h,id){
 const {esc:e,headerCopy,ico,sourceLinks}=h,diagrams=D.learning.diagrams,d=diagrams.find(x=>x.id===id);
 if(d)return '<a class="back-link" href="#arkitektur">'+ico('arrow-left')+' Alle skisser</a>'
 +headerCopy('ARKITEKTUR')+diagram(d,h)
 +'<div class="arch-detail-grid"><section class="panel"><h3>Spørsmål du kan stille kunden</h3><ul class="lesson-questions">'+d.questions.map(q=>'<li>'+e(q)+'</li>').join('')+'</ul><a class="btn subtle" href="#verktoy/ai">Se kartleggingsmal '+ico('arrow-right')+'</a></section>'
 +'<section class="panel"><h3>Dette er forenklet</h3><p>'+e(d.caution)+'</p>'+sourceLinks(d.sources,D)+'</section></div>'
 +'<section class="subsection"><div class="section-heading"><div><h2>Se et annet oppsett</h2></div></div><div class="learning-grid">'+diagrams.filter(x=>x.id!==id).map(x=>card(x,e)).join('')+'</div></section>';
 return headerCopy('ARKITEKTUR')
 +'<div class="section-heading"><div><h2>Hva er forskjellen på analyse og KI?</h2><p>Velg et oppsett og se dataveien steg for steg. Du trenger ikke velge en bestemt plattform.</p></div></div>'
 +'<div class="learning-grid">'+diagrams.map(x=>card(x,e)).join('')+'</div>'
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
window.InnsiktLearning={start,architecture,toolkit,diagram,templateText};
})();
