(function dialogueModule(){
'use strict';
const roleRoute=(role,id)=>"#kundedialog/"+role+"-"+id;
function stepBar(ui,esc){return '<ol class="dialogue-steps">'+ui.steps.map(s=>'<li><strong>'+esc(s.time)+'</strong><span><b>'+esc(s.title)+'</b><small>'+esc(s.description)+'</small></span></li>').join('')+'</ol>';}
function back(route,label,esc,ico){return '<a class="back-link" href="'+route+'">'+ico('arrow-left')+' '+esc(label)+'</a>';}
function intro(kicker,title,desc,esc){return '<header class="page-header"><div class="eyebrow">'+esc(kicker)+'</div><h1 class="page-title">'+esc(title)+'</h1><p class="page-desc">'+esc(desc)+'</p></header>';}
function renderHub(D,h){
 const {esc,ico,headerCopy}=h,u=D.pages.dialogueUi.hub;
 function task(title,desc,cta,path,icon){return '<a class="dialogue-choice panel" href="'+path+'"><span class="dialogue-choice-icon">'+ico(icon)+'</span><h2>'+esc(title)+'</h2><p>'+esc(desc)+'</p><strong>'+esc(cta)+' '+ico('arrow-right')+'</strong></a>';}
 return headerCopy('KUNDEDIALOG')+'<div class="dialogue-choice-grid">'+task(u.trainingTitle,u.trainingDesc,u.trainingAction,'#kundedialog/trening','users')+task(u.supportTitle,u.supportDesc,u.supportAction,'#kundedialog/stotte','messages')+'</div><p class="fineprint dialogue-public-note">'+esc(u.publicNote)+'</p>';
}
function renderTraining(D,h){
 const {esc,ico}=h,u=D.pages.dialogueUi,t=u.training;
 return back('#kundedialog',u.backHub,esc,ico)+intro("15 MINUTTER · 2 PERSONER",t.title,t.intro,esc)+stepBar(t,esc)
 +'<section class="dialogue-scenario-grid" aria-label="'+esc(t.title)+'">'+D.scenarios.map(s=>{
 const tr=s.training;
 return '<a class="dialogue-scenario panel" href="'+roleRoute('tren',s.id)+'"><span class="badge">'+esc(t.levels[tr.level])+'</span><h2>'+esc(s.title)+'</h2><p>'+esc(s.role)+'</p><div class="dialogue-focus"><b>'+esc(t.objectiveLabel)+'</b><span>'+esc(tr.objective)+'</span></div><strong>'+esc(t.choose)+' '+ico('arrow-right')+'</strong></a>';
 }).join('')+'</section><p class="fineprint">'+esc(t.fiction)+'</p>';
}
function scenarioLayout(D,h,s,role){
 const {esc,ico}=h,u=D.pages.dialogueUi,ui=u[role],t=s.training;
 return back('#kundedialog/trening',u.backTraining,esc,ico)+
 intro(ui.eyebrow,s.title,role==='seller'?t.objective:ui.instruction,esc)+
 '<nav class="dialogue-role-nav" aria-label="'+esc(u.training.title)+'">'+
 '<a href="'+roleRoute('tren',s.id)+'"'+(role==='seller'?' aria-current="page"':'')+'>'+esc(u.seller.eyebrow.replace('ROLLEKORT · ',''))+'</a>'+
 '<a href="'+roleRoute('kunde',s.id)+'"'+(role==='customer'?' aria-current="page"':'')+'>'+esc(u.customer.eyebrow.replace('ROLLEKORT · ',''))+'</a>'+
 '<a href="'+roleRoute('evaluer',s.id)+'">'+esc(u.review.eyebrow.replace('FELLES REFLEKSJON · ',''))+'</a></nav>';
}
function renderSeller(D,h,s){
 const {esc,ico}=h,u=D.pages.dialogueUi,ui=u.seller,t=s.training;
 return scenarioLayout(D,h,s,'seller')
 +'<div class="dialogue-role-sheet"><span class="small-label">'+esc(ui.heading)+'</span><h2>'+esc(t.sellerBrief)+'</h2><h3>'+esc(ui.situationLabel)+'</h3><p>'+esc(s.context)+'</p><h3>'+esc(ui.goalLabel)+'</h3><p>'+esc(t.objective)+'</p><div class="hint">'+esc(ui.instruction)+'</div></div>'
 +'<div class="dialogue-handoff panel"><h3>'+esc(ui.customerLink)+'</h3><p>'+esc(ui.oneScreen)+'</p><div class="dialogue-actions"><a class="btn subtle" href="'+roleRoute('kunde',s.id)+'">'+esc(ui.customerLink)+' '+ico('arrow-right')+'</a><button type="button" class="btn subtle" data-dialogue-copy="'+esc(s.id)+'">'+ico('copy')+' '+esc(ui.share)+'</button></div></div>'
 +'<div class="dialogue-next panel"><h3>'+esc(ui.start)+'</h3><p>'+esc(ui.startHint)+'</p><a href="'+roleRoute('evaluer',s.id)+'" class="btn">'+esc(ui.review)+' '+ico('arrow-right')+'</a></div>';
}
function renderCustomer(D,h,s){
 const {esc,ico}=h,u=D.pages.dialogueUi,ui=u.customer,t=s.training.customer;
 return scenarioLayout(D,h,s,'customer')+
 '<div class="dialogue-role-sheet dialogue-customer"><span class="small-label">'+esc(ui.heading)+' · '+esc(s.role)+'</span><h2>'+esc(t.opening)+'</h2><h3>'+esc(ui.situationLabel)+'</h3><p>'+esc(t.situation)+'</p><h3>'+esc(ui.revealLabel)+'</h3><ul class="dialogue-reveals">'+t.reveal.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><h3>'+esc(ui.behaviorLabel)+'</h3><p>'+esc(t.behavior)+'</p><h3>'+esc(ui.uncertaintyLabel)+'</h3><p>'+esc(t.ambiguity)+'</p></div>'+
 '<div class="dialogue-actions"><a class="btn subtle" href="'+roleRoute('tren',s.id)+'">'+ico('arrow-left')+' '+esc(ui.back)+'</a><a class="btn" href="'+roleRoute('evaluer',s.id)+'">'+esc(ui.review)+' '+ico('arrow-right')+'</a></div>';
}
function renderReview(D,h,s){
 const {esc,ico}=h,u=D.pages.dialogueUi,ui=u.review,t=s.training;
 return back(roleRoute('tren',s.id),u.seller.eyebrow,esc,ico)+intro(ui.eyebrow,ui.heading,ui.intro,esc)
 +'<section class="dialogue-role-sheet"><ol class="dialogue-reflection">'+ui.questions.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><h2>'+esc(ui.lookFor)+'</h2><ul class="dialogue-reveals">'+t.review.lookFor.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section>'
 +'<details class="dialogue-debrief panel"><summary>'+esc(ui.reveal)+' '+ico('arrow-right')+'</summary><div class="dialogue-debrief-body"><h3>'+esc(ui.hidden)+'</h3><ul>'+t.customer.reveal.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><h3>'+esc(ui.examples)+'</h3><ul>'+s.good.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><h3>'+esc(ui.shortcut)+'</h3><p>'+esc(s.avoid)+'</p><h3>'+esc(ui.next)+'</h3><p>'+esc(s.next)+'</p><h3>'+esc(ui.retry)+'</h3><p>'+esc(t.review.retry)+'</p><a href="#muligheter/'+esc(s.play)+'">'+esc(ui.playLink)+' '+ico('arrow-right')+'</a></div></details>'
 +'<p class="fineprint">'+esc(ui.customerReminder)+'</p><div class="dialogue-actions"><a class="btn subtle" href="'+roleRoute('tren',s.id)+'">'+ico('refresh')+' '+esc(ui.repeat)+'</a><a class="btn" href="#kundedialog/trening">'+esc(ui.another)+' '+ico('arrow-right')+'</a></div>';
}
function supportBody(D,h,id){
 const {esc,ico}=h,ui=D.pages.dialogueUi.support,p=D.plays.find(x=>x.id===id);
 if(!p)return '';
 const scenario=D.scenarios.find(x=>x.play===p.id);
 return '<div class="dialogue-signal-body" data-dialogue-support-play="'+esc(p.id)+'">'+
 '<blockquote>'+esc(p.hook)+'</blockquote><div class="dialogue-signal-steps">'+
 '<div class="dialogue-signal-step" data-dialogue-support-step="questions"><h3>'+esc(ui.signalQuestions)+'</h3><ol>'+p.questions.slice(0,3).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></div>'+
 '<div class="dialogue-signal-step" data-dialogue-support-step="caution"><h3>'+esc(ui.signalCaution)+'</h3><p>'+esc(p.not)+'</p></div></div>'+
 '<div class="dialogue-signal-next" data-dialogue-support-step="next"><strong>'+esc(ui.signalNext)+'</strong><p>'+esc(p.next)+'</p></div>'+
 '<div class="dialogue-actions"><a class="btn subtle" href="#muligheter/'+esc(p.id)+'">'+esc(ui.signalPlayAction)+' '+ico('arrow-right')+'</a>'+
 (scenario?'<a class="btn subtle" href="'+roleRoute('tren',scenario.id)+'">'+esc(ui.signalTrainingAction)+' '+ico('arrow-right')+'</a>':'')+'</div></div>';
}
function renderSupport(D,h){
 const {esc,ico}=h,u=D.pages.dialogueUi,ui=u.support,q=D.pages.qualification,first=D.plays[0];
 const situational=first?'<section class="dialogue-signal panel" aria-labelledby="dialogue-signal-title">'+
 '<span class="small-label">'+esc(ui.signalEyebrow)+'</span><h2 id="dialogue-signal-title">'+esc(ui.signalTitle)+'</h2><p>'+esc(ui.signalIntro)+'</p>'+
 '<label class="dialogue-signal-label" for="dialogue-signal-select">'+esc(ui.signalChoose)+'</label>'+
 '<select id="dialogue-signal-select" data-dialogue-support-select>'+D.plays.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.hook)+'</option>').join('')+'</select>'+
 '<div data-dialogue-support-body aria-live="polite">'+supportBody(D,h,first.id)+'</div></section>':'';
 return back('#kundedialog',u.backHub,esc,ico)+intro(ui.eyebrow,ui.heading,ui.intro,esc)+situational+
 '<h2 class="dialogue-general-heading">'+esc(ui.generalTitle)+'</h2>'+
 '<section class="dialogue-support-grid">'+q.items.map((x,i)=>'<article class="dialogue-support-item panel"><span class="small-label">'+String(i+1).padStart(2,'0')+'</span><h2>'+esc(x)+'</h2><p><b>'+esc(ui.question)+'</b> '+esc(q.followUps[i])+'</p></article>').join('')+'</section>'+
 '<div class="hint dialogue-support-caution">'+esc(ui.caution)+'</div>'+
 '<section class="dialogue-support-links"><a class="dialogue-support-link panel" href="#prompter/meeting-prep"><h3>'+esc(ui.brief)+'</h3><p>'+esc(ui.briefDesc)+'</p>'+ico('arrow-right')+'</a><a class="dialogue-support-link panel" href="#muligheter"><h3>'+esc(ui.plays)+'</h3><p>'+esc(ui.playsDesc)+'</p>'+ico('arrow-right')+'</a><a class="dialogue-support-link panel" href="#forretning"><h3>'+esc(ui.needs)+'</h3><p>'+esc(ui.needsDesc)+'</p>'+ico('arrow-right')+'</a></section>'+
 '<div class="dialogue-next panel"><h3>'+esc(ui.startTraining)+'</h3><p>'+esc(ui.startTrainingDesc)+'</p><a href="#kundedialog/trening" class="btn subtle">'+esc(ui.startTrainingAction)+' '+ico('arrow-right')+'</a></div>';
}
function parsedScenario(D,sub){for(const prefix of ['tren-','kunde-','evaluer-'])if(sub.startsWith(prefix)){const s=D.scenarios.find(x=>x.id===sub.slice(prefix.length));return {prefix,s};}return null;}
function entity(D,sub){const u=D.pages.dialogueUi;if(sub==='trening')return {title:u.training.title};if(sub==='stotte')return {title:u.support.heading};const hit=parsedScenario(D,sub);if(!hit?.s)return null;return {title:(hit.prefix==='tren-'?u.seller.eyebrow:hit.prefix==='kunde-'?u.customer.eyebrow:u.review.eyebrow)+' · '+hit.s.title};}
function render(D,h,sub){if(!sub)return renderHub(D,h);if(sub==='trening')return renderTraining(D,h);if(sub==='stotte')return renderSupport(D,h);const hit=parsedScenario(D,sub);if(hit?.s){if(hit.prefix==='tren-')return renderSeller(D,h,hit.s);if(hit.prefix==='kunde-')return renderCustomer(D,h,hit.s);return renderReview(D,h,hit.s);}const {esc,ico}=h,u=D.pages.dialogueUi;return back('#kundedialog/trening',u.backTraining,esc,ico)+intro('',u.notFound,u.notFoundDesc,esc);}
window.InnsiktDialogue={render,entity,supportBody};
})();
