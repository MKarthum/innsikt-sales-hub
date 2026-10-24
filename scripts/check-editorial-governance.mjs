import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=name=>JSON.parse(fs.readFileSync('docs/data/'+name+'.json','utf8'));
const slides=read('slides').items, decks=read('pages').presentationDecks,catalog=read('visual-assets').items,sources=read('sources');
const assetIds=new Set(catalog.map(a=>a.id));
const ids=new Set(slides.map(s=>s.id));
const required=['innsikt','marked-retning','portal','sales','dataarkitektur'];
assert.deepEqual(Object.keys(decks),required,'Five deliberately curated stories in stable order');
const questions=new Set(),usage=new Map();
for(const [id,deck] of Object.entries(decks)){
 const q=deck.narrative?.centralQuestion;
 assert.ok(q&&q.length>=20,'Meaningful editorial question: '+id);
 assert.ok(!questions.has(q),'Reused question without distinct story job: '+id);questions.add(q);
 assert.ok(deck.narrative?.turn?.length>=25&&deck.narrative?.resolution?.length>=25,'Story arc: '+id);
 assert.ok(deck.slides.length>=5,'Presentation should be a deliberate substantive story: '+id);
 for(const p of deck.slides){
  usage.set(p.slideId,(usage.get(p.slideId)||0)+1);
  assert.ok(ids.has(p.slideId),'Missing canonical slide '+p.slideId);
 }
}
for(const [id,a] of Object.entries(decks))for(const [other,b] of Object.entries(decks)){
 if(id>=other)continue;
 const aa=new Set(a.slides.map(p=>p.slideId)),bb=new Set(b.slides.map(p=>p.slideId));
 const similarity=[...aa].filter(x=>bb.has(x)).length/new Set([...aa,...bb]).size;
 assert.ok(similarity<.6,'Decks are mostly the same story: '+id+'/'+other);
}
let figureBacked=0;
for(const s of slides){
 const v=s.visual||{};
 const figures=[v.figureAssetId,...v.itemAssetIds||[],...v.stepAssetIds||[]].filter(Boolean);
 for(const asset of figures)assert.ok(assetIds.has(asset),'Broken figure reference '+s.id+'/'+asset);
 if(figures.length)figureBacked++;
 if(s.sourceIds)for(const id of s.sourceIds)assert.ok(sources[id],'Broken source '+s.id+'/'+id);
 const items=v.items||v.steps||[];
 if(v.itemAssetIds)assert.equal(v.itemAssetIds.length,(v.items||[]).length,'Illustrations must match list: '+s.id);
 if(v.stepAssetIds)assert.equal(v.stepAssetIds.length,(v.steps||[]).length,'Illustrations must match steps: '+s.id);
 if(v.figureAssetId)assert.ok(['impact','list','road','domains','contrast','definition','portal','loop'].includes(v.scene),'Primary figure must belong to supported scene '+s.id);
 if(s.type==='visual'){
  assert.ok(s.visual&&s.visual.scene,'Slide without visual scene: '+s.id);
  if(['impact','list','road','domains'].includes(v.scene))assert.ok(figures.length>0,'Visual with no semantic reusable assets: '+s.id);
 }
}
for(const id of ['market-why-now','market-three-forces','market-customer-pressure','market-priorities']) {
 const slide=slides.find(s=>s.id===id);
 assert.ok(slide&&slide.sourceIds.length,'2026 market claim lacks source: '+id);
}
const notes=fs.readFileSync('SLIDE_EDITORIAL_AUDIT_2026-10-24.md','utf8');
for(const s of slides)assert.ok(notes.includes('| '+s.id+' |'),'Audit omits '+s.id);
for(const needle of ['## Vedlikeholdsporter for navigasjon','Navigasjonskontrakt','Fortelling før deck','Lysbilde før dekor']){
 assert.ok(fs.readFileSync('AGENTS.md','utf8').includes(needle),'AGENTS contract missing '+needle);
}
for(const f of ['NAVIGATION_CONTRACT.md','STORY_EDITORIAL_CONTRACT.md'])assert.ok(fs.existsSync(f));
console.log('PASS – five distinctive narratives, '+slides.length+' audited slides, '+figureBacked+' semantically asset-backed scenes, per-slide sources and lifecycle rules');
