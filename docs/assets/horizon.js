/* Fordypning: all fagtekst eies av horizon.json, glossary i learning.json og kilder i sources.json. */
(()=>{
'use strict';
function render(D,{esc:e,ico,sourceLinks,headerCopy}){
 const h=D.horizon;
 const glossary=new Map(D.learning.glossary.filter(x=>x.id).map(x=>[x.id,x]));
 const concepts=(ids)=>ids.map(id=>glossary.get(id)).filter(Boolean);
 const ref=(entry)=>sourceLinks(entry.sourceIds,D);
 const linked=(arr)=>arr?.length?'<div class="horizon-relations">'+arr.map(x=>'<a href="#'+e(x.route)+'">'+e(x.label)+' '+ico('arrow-right')+'</a>').join('')+'</div>':'';
 const definition=(x)=>'<article class="horizon-concept"><div class="horizon-term">'+e(x.term)+'</div><p>'+e(x.meaning)+'</p><div class="horizon-example"><strong>'+e(h.ui.exampleLabel)+'</strong> '+e(x.example)+'</div></article>';
 const sections=h.chapters.map(ch=>'<article class="horizon-chapter"><div class="horizon-chapter-top"><span class="horizon-level">'+e(h.evidenceLabels[ch.evidence])+'</span><span class="horizon-status">'+e(ch.status)+'</span></div>'
 +'<h3>'+e(ch.title)+'</h3>'
 +'<p>'+e(ch.summary)+'</p>'
 +'<div class="horizon-interpretation"><strong>'+e(h.ui.interpretationLabel)+'</strong><p>'+e(ch.interpretation)+'</p></div>'
 +'<div class="horizon-question"><strong>'+e(h.ui.customerQuestionLabel)+'</strong><p>'+e(ch.customerQuestion)+'</p></div>'
 +'<div class="horizon-meta"><div class="horizon-related"><span>'+e(h.ui.relatedLabel)+'</span> '+concepts(ch.conceptIds).map(x=>e(x.term)).join(' · ')+'</div>'+linked(ch.relatedLinks)+ref(ch)+'</div></article>').join('');
 return headerCopy('I GRENSLANDET')
 +'<section class="horizon-intro"><div class="horizon-tagline">'+ico('compass')+' '+e(h.ui.tagline)+'</div><h2>'+e(h.intro.title)+'</h2><p>'+e(h.intro.lead)+'</p><div class="horizon-small-note">'+e(h.intro.readHint)+'</div></section>'
 +'<section class="subsection"><div class="section-heading"><div><h2>'+e(h.comparison.title)+'</h2><p>'+e(h.comparison.intro)+'</p></div></div><div class="horizon-concept-grid">'+concepts(h.comparison.conceptIds).map(definition).join('')+'</div><div class="horizon-outcome"><p>'+e(h.comparison.outcome)+'</p><a href="#arkitektur/'+e(h.comparison.diagramId)+'">'+e(h.ui.diagramLinkLabel)+' '+ico('arrow-right')+'</a>'+ref(h.comparison)+'</div></section>'
 +'<section class="subsection"><div class="section-heading"><div><h2>'+e(h.ui.sectionsTitle)+'</h2><p>'+e(h.ui.sectionsIntro)+'</p></div></div><div class="horizon-chapter-list">'+sections+'</div></section>'
 +'<section class="subsection"><div class="section-heading"><div><h2>'+e(h.lenses.title)+'</h2><p>'+e(h.ui.lensesIntro)+'</p></div></div><div class="horizon-lenses">'+h.lenses.items.map(x=>{const t=glossary.get(x.conceptId);return '<article><h3>'+e(x.title)+'</h3>'+(t?'<p>'+e(t.meaning)+'</p>':'')+'<div class="horizon-question"><strong>'+e(h.ui.lensQuestionLabel)+'</strong><p>'+e(x.question)+'</p></div><a href="#'+e(x.route)+'">'+e(h.ui.lensLinkLabel)+' '+ico('arrow-right')+'</a></article>'}).join('')+'</div></section>'
 +'<section class="subsection"><div class="horizon-summary"><div class="small-label">'+e(h.ui.generalLabel)+'</div><h2>'+e(h.questions.title)+'</h2><ol>'+h.questions.items.map(x=>'<li>'+e(x)+'</li>').join('')+'</ol></div></section>';
}
window.InnsiktHorizon={render};
})();
