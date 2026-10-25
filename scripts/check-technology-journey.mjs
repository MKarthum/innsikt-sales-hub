import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=name=>JSON.parse(fs.readFileSync('docs/data/'+name+'.json','utf8'));
const ui=read('pages').technologyJourneyUi,sales=read('sales'),tech=read('technologies');
assert.ok(ui&&Array.isArray(ui.paths));
assert.deepEqual(ui.paths.map(p=>p.playId),['rapportering','datakvalitet','modernisering']);
const plays=new Set(sales.plays.map(p=>p.id)),kinds=new Set(tech.tech.map(t=>t.kind));
for(const path of ui.paths){
 assert.ok(plays.has(path.playId),'Ukjent salgsinngang '+path.playId);
 assert.equal(path.kinds.length,2,'To områder '+path.playId);
 assert.equal(new Set(path.kinds).size,2,'Unike områder '+path.playId);
 for(const kind of path.kinds)assert.ok(kinds.has(kind),'Ukjent teknologiområde '+kind);
}
for(const key of ['eyebrow','title','intro','selectLabel','stepSignal','stepAreas','stepQuestions','signalNotice','areasNotice','notLabel','cta','resetLabel','statusPrefix','catalogSingle','catalogPlural'])assert.ok(typeof ui[key]==='string'&&ui[key].trim(),'Mangler etikett '+key);
for(const play of sales.plays)for(const fact of [play.hook,...play.questions,play.not])assert.ok(!JSON.stringify(ui).includes(fact),'Ikke kopier salgsfakta til pages.json');
console.log('PASS – tre kanoniske kundebehov, seks gyldige områdereferanser og dataeierskap');
