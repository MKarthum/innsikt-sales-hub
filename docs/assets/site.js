/* Innsikt – statisk, transportabel visning av dokumenterte data. Ingen backend eller innloggingsavhengigheter. */
(() => {
'use strict';
const paths={
 'layout-dashboard':'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
 'trending-up':'<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
 'target':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 'messages':'<path d="M20 11.5a6 6 0 0 1-6 6H6l-3 3v-11a6 6 0 0 1 6-6h6a6 6 0 0 1 5 8z"/><path d="M8 9h8M8 13h6"/>',
 'layers':'<path d="m12 2 9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
 'network':'<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v5H5v3m7-3h7v3"/>',
 'book-open':'<path d="M12 7C9 5 6 5 2 6v14c4-1 7-1 10 1m0-14c3-2 6-2 10-1v14c-4-1-7-1-10 1m0-14v14"/>',
 'git-pull-request':'<circle cx="6" cy="4" r="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/><path d="M6 6v12m12 0v-6a4 4 0 0 0-4-4h-2m0 0 3-3m-3 3 3 3"/>',
 'search':'<circle cx="10.6" cy="10.6" r="7"/><path d="m16 16 5 5"/>',
 'presentation':'<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M12 16v5m-5 0h10M8 9l3 3 5-5"/>',
 'message-circle':'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H5l-3 2v-9.5a9 9 0 1 1 19-1z"/>',
 'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>',
 'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 'arrow-left':'<path d="M20 12H4m6-6-6 6 6 6"/>',
 'arrow-up':'<path d="M12 20V4m-6 6 6-6 6 6"/>',
 'arrow-up-right':'<path d="M7 17 17 7M8 7h9v9"/>',
 'check':'<path d="m4 12 5 5L20 6"/>',
 'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 3"/>',
 'briefcase':'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
 'compass':'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3z"/>',
 'shield':'<path d="m12 2 8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6z"/><path d="m8 12 3 3 5-5"/>',
 'copy':'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
 'download':'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 'external':'<path d="M14 4h6v6m0-6-9 9"/><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/>',
 'lightbulb':'<path d="M9 18h6m-5 4h4M9 15c-3-2-4-4-4-7a7 7 0 0 1 14 0c0 3-1 5-4 7l-1 3h-4z"/>',
 'filter':'<path d="M4 6h16M7 12h10m-7 6h4"/>',
 'sparkles':'<path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2zM20 18l.7 1.3L22 20l-1.3.7L20 22l-.7-1.3L18 20l1.3-.7L20 18z"/>',
 'users':'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m3 9v-2a5 5 0 0 0-3-4.5"/>',
 'bar-chart':'<path d="M4 20V9h4v11M10 20V4h4v16M16 20v-8h4v8M3 20h18"/>',
 'refresh':'<path d="M20 7V3l-4 4h4a9 9 0 0 0-16 3M4 17v4l4-4H4a9 9 0 0 0 16-3"/>',
 'close':'<path d="M5 5 19 19M19 5 5 19"/>',
 'file-text':'<path d="M14 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9z"/><path d="M14 2v7h7M7 14h10M7 18h8"/>',
 'lock':'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>',
 'maximize':'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
 'minimize':'<path d="M3 8h5V3M21 8h-5V3M3 16h5v5m13 0v-5h5"/>'};
const ico=(name)=>`<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths['file-text']}</svg>`;
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=(a,cls='item-list')=>`<ul class="${cls}">${a.map(x=>`<li>${ico('check')}<span>${esc(x)}</span></li>`).join('')}</ul>`;
const sourceLinks=(ids,d)=>`<div class="text-source">Kilder: ${ids.map(id=>d.sources[id]?`<a target="_blank" rel="noopener noreferrer" href="${esc(d.sources[id].url)}">${esc(d.sources[id].publisher)} ↗</a>`:'').filter(Boolean).join(' · ')}</div>`;
const hdr=(ey,title,desc)=>`<header class="page-header"><div class="eyebrow">${esc(ey)}</div><h1 class="page-title">${esc(title)}</h1><p class="page-desc">${esc(desc)}</p></header>`;
const guidance=(id,variant='normal')=>{const record=D.sharedGuidance.find(x=>x.id===id);if(!record?.variants?.[variant])throw Error('Ukjent salgsbudskap '+id+' / '+variant);return record.variants[variant]};
const headerCopy=(key)=>{const c=D.pages.headers[key];return hdr(c.eyebrow,c.title,c.intro)};
const learningHelpers=()=>({esc,ico,headerCopy,sourceLinks});
const guide=()=>window.InnsiktLearning.start(D,learningHelpers());
const architecture=(id)=>window.InnsiktLearning.architecture(D,learningHelpers(),id);
const toolkit=(id)=>window.InnsiktLearning.toolkit(D,learningHelpers(),id);
const prompts=(id)=>id==='variabler'?window.InnsiktPrompts.overview(D,learningHelpers()):id?window.InnsiktPrompts.detail(D,learningHelpers(),id):window.InnsiktPrompts.library(D,learningHelpers(),promptFilter);
const horizon=()=>window.InnsiktHorizon.render(D,learningHelpers());
let D, current='oversikt',filter='Alle',techFilter='Alle',aiFilter='Alle',promptFilter='Alle',scenarioIndex=0,slide=0,selectedChecklist=new Set();
let notes=[];try{const raw=JSON.parse(localStorage.getItem('innsikt-feedback-v1')||'[]');if(Array.isArray(raw))notes=raw.filter(x=>x&&typeof x.text==='string').slice(-100)}catch{}
let names={};
function mainLink(text,page){return `<a class="text-link" href="#${page}">${esc(text)} ${ico('arrow-right')}</a>`}
function homePillars(){
 return D.pages.home.pillars.map(p=>`<article class="pillar-card">
 <div class="pillar-heading"><span class="pillar-number">${esc(p.number)}</span><span class="pillar-kicker">${esc(p.eyebrow)}</span></div>
 <h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p>
 <div class="pillar-example"><strong>Kunden kan si:</strong> ${esc(p.example)}</div>
 <div class="pillar-question"><strong>Spør videre</strong> ${esc(p.question)}</div>
 <div class="pillar-footer"><a href="${esc(p.link)}">${esc(p.linkText)} ${ico('arrow-right')}</a>${sourceLinks(p.sourceIds,D)}</div>
 </article>`).join('');
}
function quickTask(t){return `<a class="home-task" href="${esc(t.route)}"><span class="home-task-icon">${ico(t.icon)}</span><h3>${esc(t.title)}</h3><p>${esc(t.description)}</p><strong>${esc(t.action)} ${ico('arrow-right')}</strong></a>`}
function relatedPrompt(kind){const a=D.pages.promptActions?.[kind],item=a&&D.prompts.items.find(p=>p.id===a.promptId);return item?`<section class="related-prompt"><div><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p></div><a class="btn dark" href="#prompter/${esc(item.id)}">${esc(a.label)} ${ico('arrow-right')}</a></section>`:''}
function overview(){const h=D.pages.home,featured=D.prompts.page.featuredIds.map(id=>D.prompts.items.find(p=>p.id===id)).filter(Boolean);
return `<section class="hero"><div class="hero-text"><div class="eyebrow">${esc(h.eyebrow)}</div><h1>${esc(h.titleLine1)}<br/>${esc(h.titleLine2)}</h1><p>${esc(h.intro)}</p><div class="hero-actions">${h.heroActions.map(a=>`<a class="btn ${esc(a.style)}" href="${esc(a.route)}">${esc(a.title)} ${ico('arrow-right')}</a>`).join('')}</div></div></section>
<section class="subsection" aria-labelledby="home-tasks-title"><div class="section-heading"><div><h2 id="home-tasks-title">${esc(h.actionTitle)}</h2><p>${esc(h.actionIntro)}</p></div></div><div class="home-task-grid">${h.quickTasks.map(quickTask).join('')}</div></section>
<section class="start-promo"><div class="start-promo-icon">${ico('book-open')}</div><div><h2>${esc(h.startTitle)}</h2><p>${esc(h.startIntro)}</p><a href="#guide" class="lesson-link">${esc(h.startAction)} ${ico('arrow-right')}</a></div></section>
<section class="subsection" aria-labelledby="home-prompts-title"><div class="section-heading"><div><h2 id="home-prompts-title">${esc(h.promptTitle)}</h2><p>${esc(h.promptBody)}</p></div>${mainLink(h.promptCta,'prompter')}</div><div class="prompt-grid">${featured.map(p=>window.InnsiktPrompts.card(p,esc,D.prompts.page)).join('')}</div></section>
<section class="subsection"><div class="section-heading"><div><h2>${esc(h.statsTitle)}</h2><p>${esc(h.statsIntro)}</p></div></div><div class="pillar-grid">${homePillars()}</div><p class="stats-caveat">${esc(h.pillarIntro)}</p><div class="home-evidence"><b>${esc(h.kiEvidenceTitle)}</b><p>${esc(h.kiEvidenceBody)}</p>${sourceLinks(['ssb'],D)}</div></section>
<section class="subsection"><div class="insight-strip"><div><h3>${esc(h.advancedTitle)}</h3><p>${esc(h.advancedIntro)}</p></div><div class="promo-actions">${h.advancedLinks.map(a=>`<a href="${esc(a.route)}" class="btn subtle">${esc(a.label)} ${ico('arrow-right')}</a>`).join('')}</div></div></section><p class="home-public-note">${esc(D.pages.copy.publicRegister)}</p>`}

function actionTile(icon,title,desc,page){return `<a href="#${page}" class="tile"><span class="tile-icon">${ico(icon)}</span><div><h3>${esc(title)}</h3><p>${esc(desc)}</p></div><span class="arrow">${ico('arrow-right')}</span></a>`}


function industryTile(s){
 const ui=D.pages.industryUi,n=D.industryUseCases.filter(c=>c.sectorId===s.id).length;
 return `<a class="sector-card" href="#forretning/sektor-${esc(s.id)}"><span class="sector-card-type">${esc(s.coverage==='kjerne'?ui.core:ui.illustrative)}</span><h3>${esc(s.name)}</h3><p>${esc(s.scope)}</p><span class="sector-link">${esc(n)} ${esc(ui.sectorCasesCount)} ${ico('arrow-right')}</span></a>`;
}
function industryCaseTile(c){
 const ui=D.pages.industryUi;
 return `<a class="industry-case-card" href="#forretning/case-${esc(c.id)}"><span class="case-role">${esc(c.owner)}</span><h3>${esc(c.title)}</h3><p>${esc(c.symptom)}</p><span class="sector-link">${esc(ui.caseDetail)} ${ico('arrow-right')}</span></a>`;
}
function industryJourney(){
 const ui=D.pages.industryUi,j=D.industryJourney;
 return `<section class="subsection"><div class="section-heading"><h2>${esc(ui.journey)}</h2></div><div class="industry-journey">${j.steps.map(x=>`<article><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('')}</div><p class="fineprint">${esc(ui.qualification)}: ${esc(j.qualification)}</p></section>`;
}
function industrySectorPage(s){
 const ui=D.pages.industryUi,cs=D.industryUseCases.filter(c=>c.sectorId===s.id);
 return `<a class="back-link" href="#forretning">${ico('arrow-left')} ${esc(ui.back)}</a><section class="detail-banner"><div class="eyebrow">${esc(ui.example)}</div><h2>${esc(s.name)}</h2><p>${esc(s.scope)}</p></section><div class="sector-summary-grid"><article class="panel"><h3>${esc(ui.sectorPrompt)}</h3><p class="sector-lead-question">«${esc(s.openingQuestion)}»</p><h3 class="section-subtitle">${esc(ui.sectorRole)}</h3><p>${esc(s.functions)}</p></article><article class="panel"><h3>${esc(ui.sectorPractice)}</h3><p>${esc(s.practice)}</p><p class="fineprint">${esc(ui.basis)}</p>${sourceLinks(s.sourceIds,D)}</article></div><section class="subsection"><div class="section-heading"><div><h2>${esc(ui.sectorCases)}</h2><p>${esc(D.pages.copy.industryCasesSourceNote)}</p></div></div><div class="industry-case-grid">${cs.map(industryCaseTile).join('')}</div></section>${industryJourney()}`;
}
function industryCasePage(c){
 const ui=D.pages.industryUi,s=D.industrySectors.find(s=>s.id===c.sectorId),linked=c.playIds.map(id=>D.plays.find(p=>p.id===id)).filter(Boolean);
 return `<a class="back-link" href="#forretning/sektor-${esc(s.id)}">${ico('arrow-left')} ${esc(s.name)}</a><section class="detail-banner"><div class="eyebrow">${esc(s.name)} · ${esc(ui.example)}</div><h2>${esc(c.title)}</h2><p>${esc(ui.owner)}: ${esc(c.owner)}</p></section><div class="business-detail-grid"><div><section class="panel"><h3>${esc(ui.symptom)}</h3><p>${esc(c.symptom)}</p><h3 class="section-subtitle">${esc(ui.goal)}</h3><p>${esc(c.goal)}</p><h3 class="section-subtitle">${esc(ui.questions)}</h3><ol class="question-list">${c.questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ol><h3 class="section-subtitle">${esc(ui.metrics)}</h3>${list(c.metrics)}</section><section class="panel" style="margin-top:16px"><h3>${esc(ui.data)}</h3><p>${esc(c.dataHypothesis)}</p><h3 class="section-subtitle">${esc(ui.pilot)}</h3><p>${esc(c.pilot)}</p><h3 class="section-subtitle">${esc(ui.expand)}</h3><p>${esc(c.expand)}</p>${c.maturitySteps?.length?'<h3 class="section-subtitle">'+esc(ui.maturityStepsTitle)+'</h3><ol class="question-list">'+c.maturitySteps.map(x=>'<li><strong>'+esc(x.label)+'</strong>: '+esc(x.description)+' <span class="fineprint">'+esc(x.value)+'</span></li>').join('')+'</ol>':''}</section></div><aside><section class="panel"><h3>${esc(ui.caution)}</h3><p>${esc(c.caution)}</p><p class="fineprint">${esc(D.pages.copy.industryCasesSourceNote)}</p><h3 class="section-subtitle">${esc(ui.maturity)}</h3><p>${esc(D.industryJourney.maturityCaution)}</p></section><section class="panel" style="margin-top:16px"><h3>${esc(ui.linked)}</h3><div class="related-plays">${linked.map(p=>`<a href="#muligheter/${esc(p.id)}"><strong>${esc(p.name)}</strong>${ico('arrow-right')}</a>`).join('')}</div></section><section class="panel" style="margin-top:16px"><h3>${esc(ui.caseContext)}</h3><p>${esc(s.practice)}</p>${sourceLinks(s.sourceIds,D)}</section></aside></div>`;
}

function businessTile(b){return `<a class="business-card" href="#forretning/${esc(b.id)}"><div class="business-card-top"><span class="badge grey">${esc(b.area)}</span><span class="business-arrow">${ico('arrow-right')}</span></div><h3>${esc(b.headline)}</h3><p class="business-quote">${esc(b.says)}</p><p class="fineprint">Hvem: ${esc(b.role)}</p><span class="business-cta">Se mulige behov og spørsmål ${ico('arrow-right')}</span></a>`}

function business(){
 const ui=D.pages.industryUi,core=D.industrySectors.filter(s=>s.coverage==='kjerne'),other=D.industrySectors.filter(s=>s.coverage!=='kjerne');
 return `${headerCopy('FORRETNINGSBEHOV')}<section class="industry-intro"><h2>${esc(D.pages.copy.industryCasesTitle)}</h2><p>${esc(D.pages.copy.industryCasesIntro)}</p><p class="fineprint">${esc(D.pages.copy.industryCasesScopeNote)}</p></section><div class="section-heading"><h2>${esc(ui.core)}</h2></div><div class="sector-grid">${core.map(industryTile).join('')}</div><section class="subsection"><div class="section-heading"><h2>${esc(ui.illustrative)}</h2></div><div class="sector-grid">${other.map(industryTile).join('')}</div></section>${industryJourney()}<section class="subsection"><div class="section-heading"><div><h2>${esc(D.pages.copy.industryCasesExistingTitle)}</h2><p>${esc(D.pages.copy.industryCasesSourceNote)}</p></div></div><div class="business-grid">${D.businessSignals.map(businessTile).join('')}</div></section><section class="subsection"><div class="hint"><b>${esc(D.pages.copy.noEarlySolution.title)}</b> ${esc(D.pages.copy.noEarlySolution.body)}</div></section>`;
}
function businessDetail(b){const linked=b.plays.map(id=>D.plays.find(p=>p.id===id)).filter(Boolean);return `<a class="back-link" href="#forretning">${ico('arrow-left')} Tilbake til forretningsbehov</a><section class="detail-banner"><div class="eyebrow">${esc(b.area.toUpperCase())} · ${esc(b.role)}</div><h2>${esc(b.headline)}</h2><div class="quote">${esc(b.says)}</div></section><div class="business-detail-grid"><div><section class="panel"><h3>Hva bør du lytte etter?</h3>${list(b.listen)}<h3 class="section-subtitle">Hvilke spørsmål åpner samtalen?</h3><ol class="question-list">${b.ask.map(q=>`<li>${esc(q)}</li>`).join('')}</ol></section><section class="panel" style="margin-top:16px"><h3>Hva kan ligge bak – sett fra data og analyse?</h3><p>${esc(b.dataNeed)}</p><div class="note-card"><b>Viktig</b>Dette er en hypotese. Avklar behov og årsak før valg av løsning.</div></section></div><aside><section class="panel"><h3>Mulige Innsiktsleveranser</h3>${list(b.opportunities)}<hr class="divider"/><h3>Et relevant neste steg</h3><p>${esc(b.next)}</p></section><section class="panel" style="margin-top:16px"><h3>Relaterte salgsinnganger</h3><div class="related-plays">${linked.map(p=>`<a href="#muligheter/${esc(p.id)}"><strong>${esc(p.name)}</strong>${ico('arrow-right')}</a>`).join('')}</div></section><div class="panel" style="margin-top:16px"><h3>Grunnlag</h3><p class="fineprint">${esc(guidance('not-a-case'))}</p>${sourceLinks(b.sources,D)}</div></aside></div>${relatedPrompt("business")}`}

function market(){const mi=D.pages.marketIntro,mx=55;return `${headerCopy('MARKED OG DRIVERE')}
<section class="panel data-story-intro"><div class="small-label">DATA · ANALYSE · KI</div><h2>${esc(mi.dataTitle)}</h2><p>${esc(mi.dataLead)}</p>
<div class="data-story-grid">${mi.dataStory.map(x=>`<article><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p>${sourceLinks(x.sourceIds,D)}</article>`).join('')}</div></section>
<section class="subsection"><div class="section-heading"><div><h2>${esc(mi.aiTitle)}</h2><p>${esc(mi.aiDetail)}</p></div></div>
<div class="panel market-ai-panel"><div class="chart-bars">${D.stats.ki.map(z=>`<div class="barcol"><span class="barvalue">${esc(z.value)} %</span><span class="bar" style="height:${z.value/mx*100}%"></span><span class="barlabel">${esc(z.year)}</span></div>`).join('')}</div>${sourceLinks(['ssb'],D)}<details class="sector-details"><summary>${esc(mi.sectorsTitle)}</summary><p class="fineprint">${esc(mi.sectorIntro)}</p>${D.stats.segments.map(x=>`<div class="hbar"><div class="hlabel">${esc(x.label)}</div><div class="htrack"><div class="hfill" style="width:${x.value}%"></div></div><span class="hvalue">${esc(x.value)} %</span></div>`).join('')}</details></div></section>
<section class="subsection"><div class="section-heading"><div><h2>${esc(D.pages.copy.marketTrendsTitle)}</h2><p>${esc(D.pages.copy.marketTrendsExplainer)}</p></div></div>
<div class="trend-list">${D.trends.map((t,i)=>`<article class="trend-card"><div class="trend-index">${String(i+1).padStart(2,'0')}</div><div><span class="badge ${t.evidence==='leverandørdokumentasjon'?'blue':'grey'}">${esc(t.evidence)}</span>
<h3>${esc(t.title)}</h3><p><strong>Grunnlaget:</strong> ${esc(t.intro)}</p><p><strong>Mulig behov:</strong> ${esc(t.meaning)}</p>
<div class="hint"><strong>Et godt spørsmål:</strong> «${esc(t.question)}»</div>${sourceLinks(t.sources,D)}</div></article>`).join('')}</div></section>
<section class="subsection"><div class="note-card"><b>Statistikk er støtte, ikke salgsbudskapet.</b>${esc(D.metricGuidance.variants.long)}</div></section>`}

function card(p){return `<a class="play-card" href="#muligheter/${esc(p.id)}"><div class="bottom"><span class="number">${esc(p.number)} / ${String(D.plays.length).padStart(2,'0')}</span><span class="badge">${esc(p.category)}</span></div><h3>${esc(p.name)}</h3><p>${esc(p.short)}</p><div class="hook">${esc(p.hook)}</div><div class="bottom"><span class="fineprint">${p.questions.length} gode spørsmål</span><span>Åpne veiledning ${ico('arrow-right')}</span></div></a>`}
function plays(){const cats=['Alle',...new Set(D.plays.map(x=>x.category))];let shown=D.plays.filter(p=>filter==='Alle'||p.category===filter);return `${headerCopy('SALGSINNGANGER')}<div class="hint">${esc(guidance('customer-first'))}</div><div class="filters" role="group" aria-label="Filtrer salgsinnganger">${cats.map(c=>`<button class="filter ${filter===c?'active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="play-grid">${shown.map(card).join('')}</div><section class="subsection"><div class="stat-banner"><div><h3>Hvordan vet vi at dette er en mulighet?</h3><p>Se hvordan du kan avklare et behov før du kontakter fagmiljøet.</p></div><a class="btn dark" href="#kundedialog">Øv på kundedialog ${ico('arrow-right')}</a></div></section>`}
function playDetail(p){return `<a class="back-link" href="#muligheter">${ico('arrow-left')} Tilbake til salgsinngangene</a><section class="detail-banner"><div class="eyebrow">SALGSINNGANG ${esc(p.number)} · ${esc(p.category).toUpperCase()}</div><h2>${esc(p.name)}</h2><p>${esc(p.short)}</p><div class="quote">${esc(p.hook)}</div></section><div class="grid-2"><div><section class="panel"><h3>Hva kan dette bety?</h3><p>${esc(p.why)}</p><h3 style="margin-top:24px">Signaler å lytte etter</h3>${list(p.signals)}</section><section class="panel" style="margin-top:16px"><h3>Spørsmål som fører samtalen videre</h3><ol class="question-list">${p.questions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><div style="margin-top:17px"><button class="btn subtle" data-copy="${esc(p.id)}">${ico('copy')} Kopier samtaleguiden</button></div></section></div><aside><section class="panel"><h3>Hvem kan eie behovet?</h3><div class="tag-list">${p.roles.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div><hr class="divider"/><h3>Aktuell kompetanse</h3><div class="tag-list">${p.competence.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div><hr class="divider"/><h3>Kvalifisering</h3>${list(p.qualify)}</section><section class="panel" style="margin-top:16px;border-left:3px solid #3ba98f"><h3>Neste steg</h3><p>${esc(p.next)}</p></section><div class="note-card" style="margin-top:16px"><b>Unngå dette</b>${esc(p.not)}</div><div class="panel" style="margin-top:16px"><h3>Kildegrunnlag</h3><p class="fineprint">${esc(guidance('not-a-case'))}</p>${sourceLinks(p.sources,D)}</div></aside></div><div class="detail-actions"><a class="btn" href="#kundedialog">Øv på kundedialog ${ico('arrow-right')}</a><a class="btn subtle" href="#utvikling">Foreslå forbedring ${ico('message-circle')}</a></div>${relatedPrompt("play")}`}
const qualification=()=>D.pages.qualification.items;
function dialogue(){let s=D.scenarios[scenarioIndex];return `${headerCopy('KUNDEDIALOG')}
<section class="panel"><div class="section-heading" style="margin-bottom:13px"><div><h2>${esc(D.pages.copy.dialogueQualifyTitle)}</h2><p>En enkel samtalestøtte – ikke et CRM-system</p></div><span class="badge grey" id="progress-count">0 av 6 belyst</span></div><div class="qualify-grid">${qualification().map((q,i)=>`<label class="qualify-item"><input type="checkbox" data-qualify="${i}" ${selectedChecklist.has(i)?'checked':''}/><span>${esc(q)}</span></label>`).join('')}</div><div class="progress"><span id="qualify-progress" style="width:${selectedChecklist.size/qualification().length*100}%"></span></div><div class="detail-actions"><p id="qualify-message" class="fineprint">${qualificationMessage()}</p><button class="btn subtle" id="reset-qualify">Nullstill ${ico('refresh')}</button></div></section>
<section class="subsection"><div class="section-heading"><div><h2>${esc(D.pages.copy.dialogueCasesTitle)}</h2><p>Pedagogiske og oppdiktede scenarioer – ingen ekte kunder</p></div></div><div class="scenario-tab-wrap">${D.scenarios.map((x,i)=>`<button data-scenario="${i}" class="scenario-tab ${i===scenarioIndex?'active':''}">Scenario ${i+1}<small>${esc(x.role)}</small></button>`).join('')}</div><section class="scenario-content"><div class="scenario-quote">${esc(s.title)}</div><p>${esc(s.context)}</p><div class="grid-equal"><div><h3 style="font-size:16px">Gode oppfølgingsspørsmål</h3><ol class="question-list">${s.good.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div><div><div class="note-card"><b>En fristende, men dårlig snarvei</b>${esc(s.avoid)}</div><div class="hint" style="margin-top:15px"><b>Bedre neste steg:</b> ${esc(s.next)}</div><a class="btn" style="margin-top:16px" href="#muligheter/${esc(s.play)}">Åpne relevant salgsinngang ${ico('arrow-right')}</a></div></div></section></section>
<section class="subsection"><div class="stat-banner"><div><h3>En god førstelinjedialog trenger ikke gi et løsningsforslag</h3><p>${esc(D.pages.copy.goodQualification)}</p></div></div></section>`}
function qualificationMessage(){return selectedChecklist.size>=5?D.pages.qualification.good:selectedChecklist.size>=3?D.pages.qualification.partial:D.pages.qualification.start}
function competence(){return `${headerCopy('KOMPETANSE')}<div class="grid-equal">${D.competences.map((x,i)=>`<article class="tile" style="min-height:154px"><div class="tile-icon">${ico(['network','bar-chart','shield','sparkles'][i])}</div><div><h3>${esc(x.label)}</h3><p>${esc(x.description)}</p></div></article>`).join('')}</div><section class="subsection"><div class="section-heading"><div><h2>${esc(D.pages.copy.competenceAudiencesTitle)}</h2><p>Et behov kan oppstå hos flere enn IT-ledelsen</p></div></div><div class="grid-equal">${D.audiences.map(x=>`<div class="person-card"><h3>${esc(x.label)}</h3><p>${esc(x.interest)}</p><a href="#muligheter/${esc(x.entry)}">Relevant salgsinngang ${ico('arrow-right')}</a></div>`).join('')}</div></section><section class="subsection"><div class="note-card"><b>En viktig avgrensning</b>${esc(guidance('not-a-case','long'))}</div>${sourceLinks(['webstep1','webstep2'],D)}</section>`}

function brand(t){
  return '<span class="brand-icon">' + (t.logo?'<img alt="" loading="lazy" src="./assets/brands/'+esc(t.logo)+'.svg" />':'<span class="brand-initials">'+esc(t.name.split(' ').slice(0,2).map(x=>x[0]).join(''))+'</span>')+'</span>';
}
function tabNav(items,active,attr,label){
  return '<div class="filters" role="group" aria-label="'+esc(label)+'">'+items.map(x=>'<button class="filter '+(active===x?'active':'')+'" data-'+attr+'="'+esc(x)+'" aria-pressed="'+(active===x)+'">'+esc(x)+'</button>').join('')+'</div>';
}
function technology(){
 const types=['Alle',...new Set(D.tech.map(t=>t.kind))];
 const shown=D.tech.filter(t=>techFilter==='Alle'||t.kind===techFilter);
 const cards=shown.map(t=>'<article class="tech-item"><div class="brand-header">'+brand(t)+'<div><h3>'+esc(t.name)+'</h3><div class="kind">'+esc(t.kind)+'</div></div></div><div><p><strong>Lytt etter:</strong> '+esc(t.signal)+'</p><p><strong>Spør videre:</strong> '+esc(t.talk)+'</p><p class="fineprint"><strong>Vær oppmerksom:</strong> '+esc(t.caution)+'</p>'+sourceLinks([t.source],D)+'</div></article>').join('');
 return headerCopy('TEKNOLOGIKART')
 +'<section class="insight-strip"><div><h3>Markedet endrer seg</h3><p>'+esc(D.marketEvents.find(x=>x.id==="fivetran-dbt").title)+'. '+esc(D.marketSignals.find(x=>x.id==="embeddedai").title)+'.</p></div><a class="btn dark" href="#bransje">Se utviklingen '+ico('arrow-right')+'</a></section>'
 +'<section class="panel"><h3>Se hele datakjeden</h3><p>'+esc(D.learning.diagrams.find(x=>x.id==="bi").variants.long)+'</p></section>'
 +'<section class="subsection"><div class="section-heading"><div><h2>'+shown.length+' teknologier og områder</h2><p>Filtrer etter oppgave</p></div></div>'+tabNav(types,techFilter,'tech-filter','Teknologiområder')+'<div class="tech-list">'+cards+'</div></section>'
 +'<section class="subsection"><div class="insight-strip"><div><h3>KI er allerede inne i plattformene</h3><p>'+esc(D.aiOverview.variants.short)+'</p></div><a class="btn dark" href="#ai">Se KI-funksjoner '+ico('arrow-right')+'</a></div></section>'
 +'<section class="note-card"><b>Ikke lov partnerfordeler eller tilgjengelig kapasitet</b>'+esc(D.techUi.partnerCaution)+'</section>';
}
function aiProducts(){
 const groups=['Alle',...new Set(D.aiProducts.map(t=>t.group))];
 const items=D.aiProducts.filter(t=>aiFilter==='Alle'||t.group===aiFilter);
 const cards=items.map(t=>'<article class="ai-card"><header><div class="brand-header">'+brand({logo:t.logo,name:t.platform})+'<div><div class="small-label">'+esc(t.platform)+'</div><h3>'+esc(t.name)+'</h3></div></div><span class="badge grey">'+esc(t.group)+'</span></header><p>'+esc(t.description)+'</p><div class="ai-sales"><strong>Mulig kundesignal</strong><p>'+esc(t.signal)+'</p><strong>Spør videre</strong><p>'+esc(t.question)+'</p></div><p class="fineprint"><strong>Forbehold:</strong> '+esc(t.limits)+'</p><div class="ai-footer"><span class="badge grey">'+esc(t.status)+'</span>'+sourceLinks([t.source],D)+'</div></article>').join('');
 return headerCopy('INNEBYGD KI')
 +'<div class="ai-duo"><article class="panel"><div class="small-label">FOR DATATEAMET</div><h3>Raskere utvikling og forvaltning</h3><p>'+esc(D.techUi.developmentHelp)+'</p></article><article class="panel"><div class="small-label">FOR FORRETNINGEN</div><h3>Spørsmål mot egne data</h3><p>'+esc(D.techUi.businessDataHelp)+'</p></article></div>'
 +'<section class="subsection">'+tabNav(groups,aiFilter,'ai-filter','Typer KI')+'<div class="ai-grid">'+cards+'</div></section>'
 +'<section class="subsection"><div class="insight-strip"><div><h3>Selvbetjening krever godt datagrunnlag</h3><p>'+esc(D.techUi.selfServiceNeed)+'</p></div><a class="btn dark" href="#forretning">Koble mot forretningsbehov '+ico('arrow-right')+'</a></div></section>';
}
function industry(){
 const events=D.marketEvents.map(e=>'<article class="event-card"><div class="event-date">'+esc(e.date)+'</div><div><h3>'+esc(e.title)+'</h3><p><strong>Hendelse:</strong> '+esc(e.fact)+'</p><p><strong>Mulig konsekvens:</strong> '+esc(e.why)+'</p><div class="hint"><strong>Spør:</strong> '+esc(e.ask)+'</div>'+sourceLinks(e.sources,D)+'</div></article>').join('');
 const signals=D.marketSignals.map((s,i)=>'<article class="panel market-insight-card"><div class="market-no">'+String(i+1).padStart(2,'0')+'</div><h3>'+esc(s.title)+'</h3><p>'+esc(s.angle)+'</p><div class="market-listen"><strong>Lytt etter:</strong> '+esc(s.listen)+'</div><div class="hint"><strong>Spør:</strong> '+esc(s.ask)+'</div>'+sourceLinks(s.sources,D)+'</article>').join('');
 return headerCopy('MARKED OG OPPKJØP')
 +'<section class="subsection"><div class="section-heading"><div><h2>'+esc(D.pages.copy.marketDealsTitle)+'</h2><p>Hva som har skjedd – og spørsmål det kan utløse</p></div></div><div class="event-list">'+events+'</div></section>'
 +'<section class="subsection"><div class="section-heading"><div><h2>'+esc(D.pages.copy.marketSignalsTitle)+'</h2><p>Fra semantikk og styring til kostnad og plattformlåsing</p></div></div><div class="market-insight-grid">'+signals+'</div></section>'
 +'<section class="subsection"><div class="note-card"><b>Ikke overtolk oppkjøp</b>'+esc(D.marketUi.acquisitionCaution)+'</div></section>';
}

function sources(){return `${headerCopy('KILDER OG METODE')}<section class="panel" style="margin-bottom:20px"><h3>Fire nivåer av innhold</h3>${list(['Dokumenterte fakta: opplysning, kilde, publiserings- eller kontrolldato.','Leverandørbeskrivelser: hva en plattform sier den støtter, ikke bevis på kundeverdi.','Faglige hypoteser: vår vurdering av mulige salgsinnganger, markert som forslag.','Kundecaser: tas inn først når vi har dokumentasjon og nødvendig tillatelse.'])}</section><div class="grid-equal">${Object.entries(D.sources).map(([id,s])=>`<article class="source-card"><span class="source-icon">${ico('book-open')}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.publisher)} · ${(s.published?'Publisert '+esc(s.published)+' · ':'')+'Kontrollert '+esc(s.checked||'ukjent')} · ${esc(s.type)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Åpne originalkilde ${ico('external')}</a></div></article>`).join('')}</div><section class="subsection"><div class="hint">Siste gjennomgang av denne arbeidsversjonen: ${esc(D.meta.reviewed)}. ${esc(D.pages.copy.sourcesDateNote)}</div></section>`}
function trendradar(){
 const ui=D.pages.trendRadarUi;
 const cards=D.emergingSignals.map(x=>
 '<article class="horizon-chapter" id="radar-'+esc(x.id)+'">'
 +'<div class="horizon-chapter-top"><span class="horizon-level">'+esc(ui.stageLabel)+': '+esc(x.stage)+'</span><span class="horizon-status">'+esc(ui.reviewedLabel)+' '+esc(x.reviewed)+'</span></div>'
 +'<h3>'+esc(x.title)+'</h3><p>'+esc(x.summary)+'</p>'
 +'<div class="horizon-interpretation"><strong>'+esc(ui.relevanceLabel)+'</strong><p>'+esc(x.whyFollow)+'</p></div>'
 +'<div class="horizon-question"><strong>'+esc(ui.uncertaintyLabel)+'</strong><p>'+esc(x.uncertainty)+'</p></div>'
 +'<div class="horizon-question"><strong>'+esc(ui.watchLabel)+'</strong><p>'+esc(x.watch)+'</p></div>'
 +'<div class="horizon-meta"><a href="#'+esc(x.relatedRoute)+'">'+esc(ui.relatedLabel)+' '+ico('arrow-right')+'</a>'+sourceLinks(x.sources,D)+'</div>'
 +'</article>').join('');
 return headerCopy('TRENDRADAR')
 +'<section class="horizon-intro"><h2>'+esc(ui.introTitle)+'</h2><p>'+esc(ui.introText)+'</p></section>'
 +'<section class="subsection"><div class="horizon-chapter-list">'+cards+'</div></section>'
 +'<section class="subsection"><div class="note-card"><b>'+esc(ui.methodTitle)+'</b> '+esc(ui.methodText)+'</div></section>';
}
function dev(){let done=D.backlog.filter(x=>x.status==='lukket').length;return `${headerCopy('VIDEREUTVIKLING')}
<div class="grid-equal"><div class="panel"><div class="small-label">ÅPNE FORBEDRINGER</div><div class="metric num" style="border:0;padding:7px 0;font-size:32px">${D.backlog.length-done}</div><p>Felles backlog som versjonsstyres i <code>docs/data/backlog.json</code>.</p></div><div class="panel"><div class="small-label">LOKALE INNSPILL I DIN NETTLESER</div><div class="metric num" style="border:0;padding:7px 0;font-size:32px">${notes.length}</div><p>${esc(D.pages.copy.localFeedback)}</p><button class="btn subtle" data-feedback-open="1">${ico('message-circle')} Gi nytt innspill</button></div></div>
<section class="subsection"><div class="section-heading"><div><h2>${esc(D.pages.copy.devBacklogTitle)}</h2><p>Forslag og uavklarte punkter – ikke påstander om leverte funksjoner</p></div></div><div class="table-like">${D.backlog.map(b=>`<div class="table-row"><span class="id">${esc(b.id)}</span><div><strong>${esc(b.title)}</strong><p>${esc(b.why)} · ${esc(b.area)}</p></div><span class="badge ${b.priority==='høy'?'gold':'grey'}">${esc(b.priority)} prioritet</span></div>`).join('')}</div></section>
<section class="subsection"><div class="section-heading"><div><h2>Dine lokale innspill</h2><p>${esc(D.pages.copy.localFeedbackCaution)}</p></div><button class="btn subtle" id="export-notes" ${notes.length?'':'disabled'}>${ico('download')} Eksporter Markdown</button></div>${notes.length?`<div class="trend-list">${notes.slice().reverse().map((n,i)=>`<div class="panel"><div class="small-label">${esc(n.page)} · ${esc(n.date)}</div><p style="white-space:pre-wrap;color:#244351">${esc(n.text)}</p></div>`).join('')}</div>`:'<div class="empty">'+esc(D.pages.copy.feedbackEmpty)+'</div>'}</section>`}
function render(){const raw=location.hash.slice(1)||'oversikt';const [p,sub]=raw.split('/');current=names[p]?p:'oversikt';let crumb=names[current];if(sub){const entity=current==='arkitektur'?D.learning.diagrams.find(x=>x.id===sub):current==='verktoy'?D.learning.templates.find(x=>x.id===sub):current==='prompter'?(sub==='variabler'?{title:D.prompts.page.variableUi.overviewTitle}:D.prompts.items.find(x=>x.id===sub)):current==='muligheter'?D.plays.find(x=>x.id===sub):current==='forretning'?(D.businessSignals.find(x=>x.id===sub)||(sub.startsWith('sektor-')?D.industrySectors.find(x=>x.id===sub.slice(7)):null)||(sub.startsWith('case-')?D.industryUseCases.find(x=>x.id===sub.slice(5)):null)):null;if(entity)crumb+=' / '+(entity.title||entity.name||entity.area)}const trail=document.getElementById('crumb');trail.replaceChildren();if(sub&&crumb!==names[current]){const link=document.createElement('a');link.href='#'+current;link.textContent=names[current];const divider=document.createElement('span');divider.className='sep';divider.textContent='/';divider.setAttribute('aria-hidden','true');const leaf=document.createElement('span');leaf.textContent=crumb.slice(names[current].length+3);leaf.setAttribute('aria-current','page');trail.append(link,divider,leaf)}else{trail.textContent=names[current];trail.setAttribute('aria-current','page')}document.querySelectorAll('.nav a').forEach(a=>{const active=a.dataset.page===current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});if(document.querySelector('#reference-nav a.active'))document.getElementById('reference-nav').open=true;document.getElementById('sidebar').classList.remove('open');document.getElementById('menu-toggle').setAttribute('aria-expanded','false');let html='';if(current==='muligheter'&&sub){const pl=D.plays.find(x=>x.id===sub);html=pl?playDetail(pl):plays()}else if(current==='forretning'&&sub){const sector=sub.startsWith('sektor-')?D.industrySectors.find(x=>x.id===sub.slice(7)):null,caseItem=sub.startsWith('case-')?D.industryUseCases.find(x=>x.id===sub.slice(5)):null,b=D.businessSignals.find(x=>x.id===sub);html=sector?industrySectorPage(sector):caseItem?industryCasePage(caseItem):b?businessDetail(b):business()}else if(current==='arkitektur'){html=architecture(sub)}else if(current==='verktoy'){html=toolkit(sub)}else if(current==='prompter'){html=prompts(sub)}else{html=({oversikt:overview,guide,marked:market,muligheter:plays,kundedialog:dialogue,forretning:business,kompetanse:competence,teknologi:technology,ai:aiProducts,bransje:industry,horisont:horizon,trendradar:trendradar,kilder:sources,utvikling:dev}[current])()}document.getElementById('main').innerHTML=html;window.InnsiktGlossary?.enhance(document.getElementById('main'));window.scrollTo({top:0,behavior:'instant'});document.title=`${crumb} · Innsikt`;}
function toast(t){document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),2700)}
function closeModal(){
  presenterResizeObserver?.disconnect();presenterResizeObserver=null;
  if(document.fullscreenElement===document.getElementById('present-modal'))document.exitFullscreen().catch(()=>{});
  document.getElementById('overlay-root').innerHTML='';
  document.removeEventListener('keydown',modalEsc);
}
function modalEsc(e){
 if(e.key==='Escape'){
  if(isPresenterFullscreen()){
   e.preventDefault();
   exitPresenterFullscreen();
  }else closeModal();
  return;
 }
 if(document.querySelector('#present-modal')){
  if(e.key==='ArrowRight'){e.preventDefault();slide=Math.min(slide+1,presentationSlides().length-1);showSlide()}
  if(e.key==='ArrowLeft'){e.preventDefault();slide=Math.max(slide-1,0);showSlide()}
 }
}
function modal(title,body,wide=false,id=''){document.getElementById('overlay-root').innerHTML=`<div class="overlay" role="presentation" data-dismiss="1"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}" ${id?`id="${id}"`:''}><header class="modal-header"><h2>${esc(title)}</h2><button class="modal-close" type="button" data-dismiss="1" aria-label="Lukk">${ico('close')}</button></header>${body}</section></div>`;document.addEventListener('keydown',modalEsc);document.querySelector('.modal button,.modal input')?.focus()}
function search(){modal('Søk i Innsikt',`<input id="search-input" class="input" placeholder="Søk på problem, teknologi, rolle eller kundesignal …" aria-label="Søkeord" autocomplete="off"/><div id="search-results" style="max-height:55vh;overflow:auto"></div>`,true);const box=document.getElementById('search-input');box.focus();box.addEventListener('input',()=>searchResults(box.value));searchResults('')}
function searchResults(q){const needle=q.toLocaleLowerCase('no').trim();let a=[...D.industrySectors.map(x=>({name:x.name,description:x.scope+' '+x.practice+' '+x.openingQuestion,href:'#forretning/sektor-'+x.id,tag:'Bransje'})),...D.industryUseCases.map(x=>({name:x.title,description:x.symptom+' '+x.goal+' '+x.questions.join(' ')+' '+x.metrics.join(' ')+' '+x.dataHypothesis,href:'#forretning/case-'+x.id,tag:'Bransjecase'})),...D.plays.map(x=>({name:x.name,description:x.short+' '+x.hook+' '+x.signals.join(' '),href:'#muligheter/'+x.id,tag:'Salgsinngang'})),...D.businessSignals.map(x=>({name:x.area+' – '+x.headline,description:x.says+' '+x.listen.join(' ')+' '+x.dataNeed,href:'#forretning/'+x.id,tag:'Forretningsbehov'})),...D.trends.map(x=>({name:x.title,description:x.intro,href:'#marked',tag:'Markedsinnsikt'})),...D.tech.map(x=>({name:x.name,description:x.signal,href:'#teknologi',tag:'Teknologi'})),...D.aiProducts.map(x=>({name:x.name,description:x.description+' '+x.signal,href:'#ai',tag:'KI'})),...D.marketEvents.map(x=>({name:x.title,description:x.fact+' '+x.why,href:'#bransje',tag:'Oppkjøp'})),...D.marketSignals.map(x=>({name:x.title,description:x.angle+' '+x.ask,href:'#bransje',tag:'Trend'})),...D.learning.glossary.map(x=>({name:x.term,description:x.meaning+' '+x.example,href:'#guide',tag:'Begrep'})),...D.learning.diagrams.map(x=>({name:x.title,description:x.description,href:'#arkitektur/'+x.id,tag:'Arkitektur'})),...D.learning.templates.map(x=>({name:x.title,description:x.purpose,href:'#verktoy/'+x.id,tag:'Mal'})),...D.prompts.items.map(x=>({name:x.title,description:x.summary+' '+x.category,href:'#prompter/'+x.id,tag:'Prompt'})),...D.horizon.chapters.map(x=>({name:x.title,description:x.summary+' '+x.interpretation,href:'#horisont',tag:'Fordypning'})),...D.emergingSignals.map(x=>({name:x.title,description:x.summary+' '+x.whyFollow+' '+x.watch,href:'#trendradar',tag:D.pages.navigation.trendradar})),...(D.sources ? Object.entries(D.sources).map(([id,x])=>({name:x.title,description:x.publisher,href:'#kilder',tag:'Kilde'})) : [])];a=needle?a.filter(x=>(x.name+' '+x.description).toLocaleLowerCase('no').includes(needle)):a.slice(0,10);document.getElementById('search-results').innerHTML=a.length?a.slice(0,18).map(x=>`<a class="result-item" href="${x.href}" data-search-select="1"><span class="badge grey" style="float:right">${esc(x.tag)}</span><h4>${esc(x.name)}</h4><p>${esc(x.description).slice(0,180)}</p></a>`).join(''):'<div class="empty">Ingen treff. Prøv et annet begrep.</div>'}
function feedback(){modal('Gi innspill til neste versjon',`<p class="fineprint">${esc(D.pages.copy.feedbackModalNotice)}</p><label class="input-label" for="feedback-note">Hva bør endres eller undersøkes?</label><textarea class="input" id="feedback-note" placeholder="Eksempel: Spørsmål 3 i salgsinngang 2 er for teknisk. Foreslå et enklere alternativ."></textarea><div class="detail-actions"><span class="fineprint">Side: ${esc(names[current])}</span><button class="btn dark" id="save-feedback">Lagre lokalt ${ico('check')}</button></div>`);document.getElementById('feedback-note').focus()}
function saveFeedback(){const t=document.getElementById('feedback-note')?.value.trim();if(!t){toast('Skriv et innspill først.');return}notes.push({page:names[current],text:t,date:new Date().toISOString().slice(0,10)});try{localStorage.setItem('innsikt-feedback-v1',JSON.stringify(notes))}catch{toast('Lagring er blokkert i nettleseren. Kopier innspillet manuelt.');return}closeModal();toast('Innspillet er lagret lokalt. Eksporter før du bytter enhet.');if(current==='utvikling')render()}
function exportFeedback(){const txt='# Innspill – Innsikt\n\n'+notes.map((n,i)=>`## ${i+1}. ${n.page} (${n.date})\n\n${n.text}\n`).join('\n');const b=new Blob([txt],{type:'text/markdown;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='innsikt-innspill.md';a.click();setTimeout(()=>URL.revokeObjectURL(u),500);toast('Eksportert som Markdown.')}
let selectedDeck='sales',showSpeakerNotes=false,presenterResizeObserver=null;
function presentationSlides(){return D.pages.presentationDecks[selectedDeck]?.slides||[]}
function slideMarkup(s,index,deckId,notes=false){
 const deck=D.pages.presentationDecks[deckId],slides=deck.slides;
 let v='<div class="slide-eyebrow">'+esc(s.cue||deck.label.toUpperCase())+' · '+(index+1)+' / '+slides.length+'</div><h2>'+esc(s.title)+'</h2>';
 if(s.type==='metric'){
  const a=D.stats.ki.at(-1);
  v+='<div class="slide-metric"><b>'+esc(a.value)+' %</b><span>av norske foretak med minst ti sysselsatte bruker KI i '+esc(a.year)+'</span></div>';
 }
 if(s.type==='diagram'){
  const d=D.learning.diagrams.find(x=>x.id===s.diagram);
  if(d)v+='<div class="present-flow" role="group" aria-label="'+esc(d.title)+'">'+d.steps.map((step,i)=>
   '<div class="present-flow-step"><span class="present-step-number">'+(i+1)+'</span><strong>'+esc(step.title)+'</strong><p>'+esc(step.detail)+'</p></div>'
  ).join('')+'</div><p class="present-flow-outcome">'+esc(d.outcome)+'</p>';
 }
 if(s.type==='sector-case'){
  const c=D.industryUseCases.find(x=>x.id===s.industryCase);
  if(c)v+='<div class="slide-case"><strong>'+esc(c.title)+'</strong><p>'+esc(c.symptom)+'</p>'+(s.caseView==='situation'?'':'<ul>'+c.questions.slice(0,2).map(q=>'<li>'+esc(q)+'</li>').join('')+'</ul><p>'+esc(c.pilot)+'</p>')+'</div>';
 }
 if(s.type==='case'){
  const c=D.businessSignals.find(x=>x.id===s.business);
  if(c)v+='<div class="slide-case"><strong>'+esc(c.says)+'</strong><p>Spør for eksempel:</p><ul>'+c.ask.slice(0,2).map(q=>'<li>'+esc(q)+'</li>').join('')+'</ul></div>';
 }
 if(s.body)v+='<p class="slide-description">'+esc(s.body)+'</p>';
 if(s.bullets?.length)v+='<ul class="slide-bullets">'+s.bullets.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
 if(s.dynamic==='market-events')v+='<div class="slide-events">'+D.marketEvents.slice(0,4).map(x=>'<span>'+esc(x.title)+'</span>').join('')+'</div>';
 if(s.type==='prompt'&&s.promptId){
  const prompt=D.prompts.items.find(x=>x.id===s.promptId);
  if(prompt)v+='<div class="slide-prompt"><strong>'+esc(prompt.title)+'</strong><p>'+esc(prompt.summary)+'</p><button type="button" class="btn dark" data-deck-prompt="'+esc(prompt.id)+'">Kopier tilpasningsprompt '+ico('copy')+'</button></div>';
 }
 if(s.sources?.length)v+=sourceLinks(s.sources,D);
 if(notes&&s.note)v+='<aside class="slide-speaker"><strong>Presentatørnotat</strong><p>'+esc(s.note)+'</p></aside>';
 return v;
}
// Logisk 960×540-flate som skaleres proporsjonalt til ledig plass.
function fitPresentationSlide(){
 const stage=document.getElementById('present-stage'),frame=document.getElementById('slide-body');
 if(!stage||!frame||!stage.clientWidth||!stage.clientHeight)return;
 const available=Math.min(stage.clientWidth/960,stage.clientHeight/540);
  const scale=isPresenterFullscreen()?available:Math.min(available,1.5);
 frame.style.setProperty('--slide-fit',String(Math.max(0.05,scale)));
}
function isPresenterFullscreen(){
 return Boolean(document.getElementById('present-modal')?.classList.contains('presenter-fullscreen'));
}
function syncPresenterFullscreen(active){
 const modal=document.getElementById('present-modal');
 if(!modal)return;
 modal.classList.toggle('presenter-fullscreen',active);
 const button=document.getElementById('present-fullscreen-toggle');
 if(button){
  button.setAttribute('aria-pressed',String(active));
  button.setAttribute('aria-label',active?'Avslutt fullskjerm':'Vis i fullskjerm');
  button.title=active?'Avslutt fullskjerm (Esc)':'Vis i fullskjerm';
  button.innerHTML=ico(active?'minimize':'maximize')+' <span>'+(active?'Avslutt fullskjerm':'Fullskjerm')+'</span>';
 }
 fitPresentationSlide();
}
function exitPresenterFullscreen(){
 const modal=document.getElementById('present-modal');
 if(!modal)return;
 // CSS-basert fullskjerm fungerer også der Fullscreen API mangler (blant annet på enkelte iOS-nettlesere).
 syncPresenterFullscreen(false);
 if(document.fullscreenElement===modal)document.exitFullscreen().catch(()=>{});
}
async function togglePresenterFullscreen(){
 const modal=document.getElementById('present-modal');if(!modal)return;
 if(isPresenterFullscreen()){exitPresenterFullscreen();return}
 // Vis hele skjermen også om Fullscreen API er sperret eller ikke implementert.
 syncPresenterFullscreen(true);
 if(typeof modal.requestFullscreen==='function'){
  try{await modal.requestFullscreen()}catch{/* Behold CSS-helskjerm som fallback. */}
 }
 fitPresentationSlide();
}
function presenterFullscreenChanged(){
 const modal=document.getElementById('present-modal');
 if(!modal)return;
 // Hvis brukeren avslutter native fullskjerm med Esc, skal Presenter fortsatt være åpen.
 if(document.fullscreenElement!==modal&&modal.classList.contains('presenter-fullscreen')&&
    modal.dataset.nativeFullscreen==='true'){
  modal.dataset.nativeFullscreen='false';
  syncPresenterFullscreen(false);
 }else if(document.fullscreenElement===modal){
  modal.dataset.nativeFullscreen='true';
  syncPresenterFullscreen(true);
 }
}
function enablePresenterSwipe(){
 let origin=null;
 document.addEventListener('touchstart',e=>{
  if(!e.target.closest?.('#present-stage')||e.target.closest?.('a,button,input,textarea,select,[contenteditable],[data-glossary-id],.glossary-popover')||e.touches.length!==1){origin=null;return}
  origin={x:e.touches[0].clientX,y:e.touches[0].clientY};
 },{passive:true});
 document.addEventListener('touchend',e=>{
  if(!origin||!document.querySelector('#present-modal')||e.changedTouches.length!==1){origin=null;return}
  const dx=e.changedTouches[0].clientX-origin.x,dy=e.changedTouches[0].clientY-origin.y;origin=null;
  if(Math.abs(dx)<50||Math.abs(dx)<Math.abs(dy)*1.3)return;
  slide=Math.max(0,Math.min(presentationSlides().length-1,slide+(dx<0?1:-1)));showSlide();
 },{passive:true});
 document.addEventListener('touchcancel',()=>{origin=null},{passive:true});
}
function showSlide(){
 const slides=presentationSlides(),s=slides[slide];if(!s)return;
 document.getElementById('slide-body').innerHTML=slideMarkup(s,slide,selectedDeck);
 window.InnsiktGlossary?.enhance(document.getElementById('slide-body'));
 document.getElementById('slide-counter').textContent=(slide+1)+' av '+slides.length;
 document.getElementById('slide-prev').disabled=slide===0;
 document.getElementById('slide-next').disabled=slide===slides.length-1;
 const hint=document.getElementById('deck-context');
 if(hint)hint.textContent=D.pages.presentationDecks[selectedDeck].intro||'';
 const note=document.getElementById('slide-speaker-notes');
 if(note)note.innerHTML=showSpeakerNotes&&s.note?'<strong>Presentatørnotat</strong><p>'+esc(s.note)+'</p>':'';
 if(note)note.hidden=!showSpeakerNotes||!s.note;
 document.querySelectorAll('[data-deck]').forEach(b=>{
  b.classList.toggle('active',b.dataset.deck===selectedDeck);
  b.setAttribute('aria-pressed',String(b.dataset.deck===selectedDeck));
 });
 fitPresentationSlide();
}
function copyDeckPrompt(id){
 const item=D.prompts.items.find(x=>x.id===id);
 if(!item||!navigator.clipboard?.writeText){toast('Kopiering er ikke tilgjengelig.');return;}
 navigator.clipboard.writeText(window.InnsiktPromptContext.composeTask(item,D.prompts)).then(()=>toast(D.prompts.page.variableUi.deckCopySuccess)).catch(()=>toast(D.prompts.page.variableUi.deckCopyFailure));
}
function exportPresentation(mode){
 const deck=D.pages.presentationDecks[selectedDeck];
 return window.InnsiktPresenterExport.exportDeck({
  id:selectedDeck,label:deck.label,notice:deck.intro||'',version:D.meta.version,
  slides:deck.slides.map((s,i)=>slideMarkup(s,i,selectedDeck))
 },mode).then(()=>{if(mode==='html')toast('Presentasjonen er lastet ned som HTML.');})
 .catch(e=>toast('Kunne ikke eksportere: '+e.message));
}
function presentation(){
 slide=0;selectedDeck='portal';showSpeakerNotes=false;
 const choices=Object.entries(D.pages.presentationDecks).map(([id,d])=>
  '<button class="deck-option '+(id===selectedDeck?'active':'')+'" type="button" data-deck="'+esc(id)+'" aria-pressed="'+(id===selectedDeck)+'">'+esc(d.label)+'</button>'
 ).join('');
 const markup='<div class="deck-controls" role="group" aria-label="Velg presentasjonsløp">'+choices+'</div>'
  +'<p id="deck-context" class="deck-context"></p>'
  +'<div class="present-stage" id="present-stage"><div class="present-frame present-rich" id="slide-body" aria-live="polite"></div></div>'
  +'<div class="present-controls"><button class="btn subtle" type="button" id="slide-prev" aria-label="Forrige lysbilde">'+ico('arrow-left')+' <span>Forrige</span></button><span class="pager" id="slide-counter"></span><button class="btn dark" type="button" id="slide-next" aria-label="Neste lysbilde"><span>Neste</span> '+ico('arrow-right')+'</button><button class="btn subtle" type="button" id="present-fullscreen-toggle" aria-label="Vis i fullskjerm" aria-pressed="false" title="Vis i fullskjerm">'+ico('maximize')+' <span>Fullskjerm</span></button></div>'
  +'<div class="present-footer"><label><input type="checkbox" id="speaker-toggle" /> Vis presentatørnotater</label>'
  +'<span>Piltaster bytter lysbilde · Esc lukker</span></div>'
  +'<aside id="slide-speaker-notes" class="slide-speaker" hidden></aside>'
  +'<div class="present-export-controls"><button class="btn subtle" type="button" id="deck-download">'+ico('download')+' Last ned HTML</button>'
  +'<button class="btn subtle" type="button" id="deck-print">'+ico('file-text')+' Skriv ut / PDF</button>'
  +'<span>HTML-filen kan åpnes uten nettilgang. PDF lagres fra utskriftsvinduet.</span></div>';
 modal('Presenter Innsikt',markup,true,'present-modal');showSlide();
 presenterResizeObserver?.disconnect();
 presenterResizeObserver=new ResizeObserver(fitPresentationSlide);
 presenterResizeObserver.observe(document.getElementById('present-stage'));
 fitPresentationSlide();
}
function copyLearningTemplate(id){
 const t=D.learning.templates.find(x=>x.id===id);if(!t)return;
 if(!navigator.clipboard?.writeText){toast('Kopiering støttes ikke av nettleseren her.');return}
 navigator.clipboard.writeText(window.InnsiktLearning.templateText(t)).then(()=>toast('Malen er kopiert.')).catch(()=>toast('Kopiering er blokkert.'));
}
function copyGuide(id){let p=D.plays.find(x=>x.id===id);if(!p)return;let txt=`${p.name}\n\nKundesignal: ${p.hook}\n\nHva kan dette bety?\n${p.why}\n\nSpørsmål:\n${p.questions.map((q,i)=>`${i+1}. ${q}`).join('\n')}\n\nNeste steg: ${p.next}\n\nUnngå: ${p.not}\n`;navigator.clipboard?.writeText(txt).then(()=>toast('Samtaleguide kopiert.')).catch(()=>toast('Kunne ikke kopiere – nettleseren blokkerte funksjonen.'))}
function rebuildPromptEditor(item,ask){
 const editor=document.getElementById('prompt-editor');
 if(!editor||!item)return;
 const ui=D.prompts.page.variableUi;
 if(editor.dataset.dirty==='true'&&ask&&!window.confirm(ui.confirmRebuild))return;
 editor.value=window.InnsiktPromptContext.composeTask(item,D.prompts);
 editor.dataset.dirty='false';
 refreshPromptLive(item);
 const status=document.getElementById('prompt-editor-status');
 if(status)status.textContent=ui.resetMessage;
}
function refreshPromptLive(item){
 const host=document.getElementById('prompt-preview-lines');
 if(!host||!item)return;
 const ctx=window.InnsiktPromptContext;
 host.replaceChildren();
 for(const b of ctx.selectedBlocks(item,D.prompts)){
  if(b.key==='organizationTemplates')continue;
  const line=document.createElement('div');line.className='prompt-preview-line';line.dataset.previewKey=b.key;
  const title=document.createElement('strong');title.textContent=b.option;
  const description=document.createElement('p');description.textContent=b.instruction;
  line.append(title,description);host.append(line);
  const impact=document.querySelector('[data-prompt-impact="'+b.key+'"]');
  if(impact)impact.textContent=b.instruction;
 }
 const subChoice=document.querySelector('[data-prompt-format-subchoice]');
 if(subChoice)subChoice.hidden=!ctx.supportsOrganizationTemplates(item,D.prompts);
 const dirty=document.getElementById('prompt-preview-dirty'),editor=document.getElementById('prompt-editor');
 if(dirty)dirty.hidden=editor?.dataset.dirty!=='true';
}
function refreshPromptFromContext(){
 const editor=document.getElementById('prompt-editor');
 if(!editor)return;
 const id=location.hash.slice(1).split('/')[1];
 const item=D.prompts.items.find(x=>x.id===id);
 if(!item)return;
 const status=document.getElementById('prompt-editor-status'),ui=D.prompts.page.variableUi;
 refreshPromptLive(item);
 if(editor.dataset.dirty==='true'){if(status)status.textContent=ui.dirtyWarning;return}
 editor.value=window.InnsiktPromptContext.composeTask(item,D.prompts);
 if(status)status.textContent=ui.cleanMessage;
}
function initPromptContextEvents(){
 document.addEventListener('input',e=>{
  const field=e.target.closest('[data-context-var]');
  if(field){
   window.InnsiktPromptContext.set(field.dataset.contextVar,field.value);
   document.querySelectorAll('[data-context-count]').forEach(el=>el.textContent=window.InnsiktPromptContext.entries().filter(x=>x.value.trim()).length);
   refreshPromptFromContext();
   return;
  }
  if(e.target.id==='prompt-editor'){
   e.target.dataset.dirty='true';
   const status=document.getElementById('prompt-editor-status');
   if(status)status.textContent=D.prompts.page.variableUi.dirtyWarning;
   const id=location.hash.slice(1).split('/')[1],item=D.prompts.items.find(x=>x.id===id);
   if(item)refreshPromptLive(item);
  }
 });
 document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-context-clear]');
  if(btn){
   const id=btn.dataset.contextClear;
   window.InnsiktPromptContext.clear(id);
   if(location.hash==='#prompter/variabler')render();
   else {
    document.querySelectorAll('[data-context-var]').forEach(el=>{if(el.dataset.contextVar===id)el.value=''});
    refreshPromptFromContext();
    toast(D.prompts.page.variableUi.clearedMessage);
   }
   return;
  }
  if(e.target.closest('[data-context-clear-all]')){
   if(!window.confirm(D.prompts.page.variableUi.confirmClearAll))return;
   window.InnsiktPromptContext.clearAll();
   render();
   toast(D.prompts.page.variableUi.allClearedMessage);
  }
 });
}
function initEvents(){document.addEventListener('fullscreenchange',presenterFullscreenChanged);document.addEventListener('click',e=>{const pf=e.target.closest('[data-prompt-filter]');
if(pf){promptFilter=pf.dataset.promptFilter;render();return}
const pc=e.target.closest('[data-prompt-copy]');
if(pc){const editor=document.getElementById('prompt-editor');if(editor){if(!navigator.clipboard?.writeText){toast(D.prompts.page.variableUi.copyUnsupported);return}navigator.clipboard.writeText(editor.value).then(()=>toast(D.prompts.page.variableUi.copySuccess)).catch(()=>toast(D.prompts.page.variableUi.copyFailure));}return}
const pr=e.target.closest('[data-prompt-reset]');
if(pr){const item=D.prompts.items.find(x=>x.id===pr.dataset.promptReset),editor=document.getElementById('prompt-editor');if(item&&editor){rebuildPromptEditor(item,true)}return}
if(e.target.closest('#present-fullscreen-toggle')){togglePresenterFullscreen();return}if(e.target.closest('#deck-download')){exportPresentation('html');return}if(e.target.closest('#deck-print')){exportPresentation('print');return}const dp=e.target.closest('[data-deck-prompt]');if(dp){copyDeckPrompt(dp.dataset.deckPrompt);return}const deck=e.target.closest('[data-deck]');if(deck){selectedDeck=deck.dataset.deck;slide=0;showSlide();return}const template=e.target.closest('[data-copy-template]');if(template){copyLearningTemplate(template.dataset.copyTemplate);return}const tf=e.target.closest('[data-tech-filter]');if(tf){techFilter=tf.dataset.techFilter;render();return}const af=e.target.closest('[data-ai-filter]');if(af){aiFilter=af.dataset.aiFilter;render();return}const filterBtn=e.target.closest('[data-filter]');if(filterBtn){filter=filterBtn.dataset.filter;render();return}const cp=e.target.closest('[data-copy]');if(cp){copyGuide(cp.dataset.copy);return}if(e.target.closest('[data-feedback-open]')){feedback();return}if(e.target.closest('#export-notes')){exportFeedback();return}if(e.target.closest('#save-feedback')){saveFeedback();return}if(e.target.closest('#search-button')){search();return}if(e.target.closest('#feedback-button')){feedback();return}if(e.target.closest('#present-button')){presentation();return}if(e.target.closest('#slide-next')){slide=Math.min(slide+1,presentationSlides().length-1);showSlide();return}if(e.target.closest('#slide-prev')){slide=Math.max(slide-1,0);showSlide();return}if(e.target.closest('#reset-qualify')){selectedChecklist.clear();render();return}const scen=e.target.closest('[data-scenario]');if(scen){scenarioIndex=Number(scen.dataset.scenario);render();return}if(e.target.closest('[data-search-select]')){closeModal();return}if(e.target.closest('[data-dismiss]')&&(e.target.matches('.overlay')||e.target.closest('.modal-close'))){closeModal();return}if(e.target.closest('#menu-toggle')){let bar=document.getElementById('sidebar');const open=bar.classList.toggle('open');document.getElementById('menu-toggle').setAttribute('aria-expanded',String(open));return}});document.addEventListener('change',e=>{
const selected=e.target.closest('[data-prompt-choice]');
if(selected){
 const item=D.prompts.items.find(x=>x.id===selected.dataset.promptItem);
 if(item){window.InnsiktPromptContext.setChoice(item,selected.dataset.promptChoice,selected.value);refreshPromptFromContext()}
 return;
}
const toggled=e.target.closest('[data-prompt-toggle]');
if(toggled){
 const item=D.prompts.items.find(x=>x.id===toggled.dataset.promptItem);
 if(item){window.InnsiktPromptContext.setChoice(item,toggled.dataset.promptToggle,toggled.checked);refreshPromptFromContext()}
 return;
}
if(e.target.matches('#speaker-toggle')){showSpeakerNotes=e.target.checked;showSlide();return}if(e.target.matches('[data-qualify]')){let id=Number(e.target.dataset.qualify);if(e.target.checked)selectedChecklist.add(id);else selectedChecklist.delete(id);document.getElementById('qualify-progress').style.width=(selectedChecklist.size/qualification().length*100)+'%';document.getElementById('progress-count').textContent=selectedChecklist.size+' av 6 belyst';document.getElementById('qualify-message').textContent=qualificationMessage()}});document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!document.querySelector('.overlay'))search()}});window.addEventListener('hashchange',render)}
async function init(){document.querySelectorAll('[data-icon]').forEach(x=>x.innerHTML=ico(x.dataset.icon));try{const namesOfFiles=['site','pages','sources','market','sales','technologies','backlog','learning','prompts','horizon'];const files=await Promise.all(namesOfFiles.map(async name=>{const response=await fetch('./data/'+name+'.json',{cache:'no-store'});if(!response.ok)throw new Error(name+': HTTP '+response.status);return response.json()}));const [meta,pages,sources,market,sales,technologies,backlog,learning,prompts,horizon]=files;D=window.InnsiktContent.materialize({meta,pages,sources,...market,...sales,...technologies,backlog,learning,prompts,horizon});names=D.pages.navigation;document.querySelectorAll('[data-nav-label]').forEach(el=>{el.textContent=names[el.dataset.navLabel]||''});document.querySelectorAll('[data-nav-group]').forEach(el=>el.textContent=D.pages.navigationGroups[el.dataset.navGroup]||'');document.getElementById('sidebar-notice').textContent=D.pages.site.publicNotice;document.getElementById('version-label').textContent=D.meta.version;document.getElementById('footer-status').textContent='Oppdatert '+D.meta.released;document.getElementById('backlog-count').textContent=D.backlog.filter(x=>x.status!=='lukket').length;window.InnsiktPromptContext.configure(D.prompts);initEvents();initPromptContextEvents();enablePresenterSwipe();window.InnsiktGlossary?.init(D.learning.glossary);render()}catch(e){document.getElementById('main').innerHTML=`<section class="panel"><h1>Kunne ikke laste nettsidens data</h1><p>Start en lokal webserver i prosjektmappen, for eksempel <code>python3 -m http.server 8000</code>. Åpne deretter <code>http://localhost:8000/docs/</code>.</p><p class="fineprint">${esc(e.message)}</p></section>`;console.error(e)}}
init();
})();
