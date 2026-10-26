import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=n=>JSON.parse(fs.readFileSync('docs/data/'+n+'.json','utf8'));
const sales=read('sales'),pages=read('pages');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync('docs/assets/dialogue.js','utf8'),sandbox,{filename:'dialogue.js'});
const view=sandbox.window.InnsiktDialogue;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const h={esc,ico:()=>'',headerCopy:()=>''};
const D={scenarios:sales.scenarios,plays:sales.plays,pages};
assert.equal(sales.scenarios.length,8);
assert.equal(pages.qualification.items.length,pages.qualification.followUps.length);
assert.ok(view.render(D,h,'').includes('#kundedialog/trening'));
assert.ok(view.render(D,h,'stotte').includes(pages.qualification.followUps[0]));
assert.ok(view.render(D,h,'trening').includes('scenario-08'));
assert.ok(view.render(D,h,'stotte').includes('data-dialogue-support-select'),'Situasjonsvelger');
assert.equal((view.render(D,h,'stotte').match(/<option value=/g)||[]).length,sales.plays.length,'Alle signaler');
for(const p of sales.plays){
 const html=view.supportBody(D,h,p.id);
 assert.ok(html.includes('data-dialogue-support-play="'+esc(p.id)+'"'),p.id+': ID');
 assert.ok(html.includes(esc(p.hook))&&html.includes(esc(p.not))&&html.includes(esc(p.next)),p.id+': dataeier');
 assert.equal((html.match(/<li>/g)||[]).length,3,p.id+': tre spørsmål');
 for(const question of p.questions.slice(0,3))assert.ok(html.includes(esc(question)),p.id+': spørsmål');
 const scenario=sales.scenarios.find(s=>s.play===p.id);
 if(scenario)assert.ok(html.includes('#kundedialog/tren-'+scenario.id),p.id+': parøvelse');
}
const oldQuestion=sales.plays[0].questions[0];sales.plays[0].questions[0]='QA_DIALOGUE_KANONISK';
assert.ok(view.supportBody(D,h,sales.plays[0].id).includes('QA_DIALOGUE_KANONISK'),'Metamorfisk spørsmål');
sales.plays[0].questions[0]=oldQuestion;

for(const s of sales.scenarios){
 const t=s.training;
 assert.ok(['start','videre','avansert'].includes(t.level),s.id+': nivå');
 for(const v of [t.objective,t.sellerBrief,t.customer.situation,t.customer.opening,t.customer.behavior,t.customer.ambiguity,t.review.retry])
   assert.ok(typeof v==='string'&&v.length>25,s.id+': ufullstendig tekst');
 assert.equal(t.customer.reveal.length,3,s.id+': kundekort');
 assert.equal(t.review.lookFor.length,3,s.id+': refleksjon');
 const seller=view.render(D,h,'tren-'+s.id),customer=view.render(D,h,'kunde-'+s.id),review=view.render(D,h,'evaluer-'+s.id);
 assert.ok(seller.includes(esc(t.sellerBrief))&&seller.includes('data-dialogue-copy'),s.id+': selgerkort');
 assert.ok(customer.includes(esc(t.customer.reveal[0]))&&customer.includes(esc(t.customer.opening)),s.id+': kundekort');
 assert.ok(!seller.includes(esc(t.customer.reveal[0]))&&!seller.includes(esc(s.good[0])),s.id+': fasit synlig for selger');
 assert.ok(!customer.includes(esc(s.good[0])),s.id+': spørsmål synlige for kunde');
 assert.ok(review.includes(esc(s.good[0]))&&review.includes('<details'),s.id+': evaluering');
 assert.ok(view.entity(D,'kunde-'+s.id)?.title.includes(s.title),s.id+': navigasjonstittel');
}
assert.ok(view.render(D,h,'tren-finnes-ikke').includes(pages.dialogueUi.notFound));
console.log('PASS – kundedialogens 8 scenarioer, rolleskille, refleksjon og direkte ruter');
