import fs from 'node:fs';
import assert from 'node:assert/strict';
const slides=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const profiles=JSON.parse(fs.readFileSync('docs/data/architecture-profiles.json','utf8')).profiles;
const expected=new Set(slides.map(s=>s.id));
assert.equal(slides.length,39,'Every original library slide retained');
const layouts={bridge:'impact',cards:'list',voices:'list',questions:'list',path:'list',steps:'road'};
const accepted=new Set(['bridge','cards','voices','questions','path','steps']);
const seen=new Set();
for(const s of slides){
 assert.ok(s.title&&s.title.length<=98,'Headline must be direct and readable: '+s.id);
 assert.ok(!seen.has(s.id),'Duplicate stable ID: '+s.id);seen.add(s.id);
 if(s.type==='architecture'){
  const profile=profiles.find(p=>p.id===s.profileId);
  assert.ok(profile,'Unknown profile '+s.id);
  assert.equal(profile.label,s.title,'Diagram and library headers must convey same point: '+s.id);
  continue;
 }
 const v=s.visual||{};
 assert.ok(v.scene,'Visual missing: '+s.id);
 if(v.layout){
  assert.ok(accepted.has(v.layout),'Unknown layout '+s.id);
  assert.equal(layouts[v.layout],v.scene,'Wrong layout family '+s.id);
 }
 if(v.layout==='bridge'){
  for(const key of ['beforeLabel','afterLabel','evidenceLine'])assert.ok(v[key]&&v[key].length>8,'Empty bridge content '+s.id+'/'+key);
 }
 if(['cards','voices','questions','path'].includes(v.layout)){
  assert.equal(v.items.length,3,'Three alternatives or questions only: '+s.id);
  assert.equal(v.detail.length,3,'Each option needs a specific clarifying detail: '+s.id);
  assert.ok(v.takeaway?.length>=25,'Self-contained takeaway '+s.id);
 }
 if(v.layout==='steps'){
  assert.equal(v.steps.length,3,'Exactly three steps for the 3-card format: '+s.id);
  assert.equal(v.stepDetails?.length,v.steps.length,'Each step needs a description: '+s.id);
  for(const detail of v.stepDetails)assert.ok(detail.length>=15&&detail.length<100,'Step explanation too short or long: '+s.id);
 }
 if(v.scene==='analyst-grid')assert.equal(v.number,'1 000','Preserve metaphor');
}
const file=fs.readFileSync('SLIDE_VISUAL_REVIEW_2026-10-24.md','utf8');
for(const id of expected)assert.ok(file.includes('| '+id+' |'),'Missing individual review '+id);
console.log('PASS – '+slides.length+' clear slide statements, semantically selected scene compositions and full visual audit');