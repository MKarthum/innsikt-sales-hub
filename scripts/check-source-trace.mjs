import assert from 'node:assert/strict';
import fs from 'node:fs';
const market=JSON.parse(fs.readFileSync('docs/data/market.json','utf8'));
const sources=JSON.parse(fs.readFileSync('docs/data/sources.json','utf8'));
const pages=JSON.parse(fs.readFileSync('docs/data/pages.json','utf8'));
const ui=pages.sourceTraceUi;
for(const key of ['eyebrow','title','intro','selectLabel','claimLabel','contextLabel','listenLabel','questionLabel','sourcesLabel','contextNotice','registerTitle','registerIntro','openSource','methodTitle'])assert.ok(typeof ui[key]==='string'&&ui[key].trim(),'sourceTraceUi.'+key);
assert.equal(ui.methodLevels.length,4,'fire metodekategorier');
const ids=new Set();
for(const [kind,items,fields] of [['event',market.marketEvents,['fact','why','ask']],['signal',market.marketSignals,['angle','listen','ask']]]){
 for(const item of items){
  const id=kind+':'+item.id;
  assert.ok(!ids.has(id),'unik ID '+id);ids.add(id);
  for(const field of fields)assert.ok(typeof item[field]==='string'&&item[field].trim(),id+' mangler '+field);
  assert.ok(['documented','assessment','vendor','hypothesis'].includes(item.evidence),id+' ukjent evidens');
  assert.ok(Array.isArray(item.sources)&&item.sources.length,id+' mangler kilder');
  for(const sourceId of item.sources)assert.ok(sources[sourceId]?.url,id+' ukjent kilde '+sourceId);
 }
}
assert.ok(ids.size>=2,'kildespor trenger markedsobjekter');
console.log('PASS – kildespor: '+ids.size+' kanoniske objekter, kilder og evidensstatus');
