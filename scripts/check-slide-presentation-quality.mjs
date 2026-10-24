import fs from 'node:fs';
import assert from 'node:assert/strict';
const slides=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const profiles=JSON.parse(fs.readFileSync('docs/data/architecture-profiles.json','utf8')).profiles;
const expected=new Set(slides.map(s=>s.id));
assert.ok(slides.length>0,'Slide library must not be empty');
const layouts={bridge:'impact',cards:'list',voices:'list',questions:'list',path:'list',steps:'road','product-preview':'impact','case-quote':'impact','two-truths':'impact','capacity-gate':'impact',handoff:'impact',convergence:'domains','customer-voices':'list','cause-map':'list','prompt-example':'road','risk-ladder':'domains','priority-pathways':'domains','meeting-brief':'road','conversation-takeaway':'road','capability-journey':'domains','bounded-discovery':'road','controlled-comparison':'road'};
const accepted=new Set(Object.keys(layouts));
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
 if(v.layout==='product-preview'){
  assert.ok(v.preview?.brand&&v.preview?.context&&v.preview?.input&&v.preview?.outputs?.length===3,'Product preview needs clear data: '+s.id);
  assert.equal(v.preview.assets.length,3,'Three asset IDs on product preview');
 }
 if(v.layout==='case-quote')assert.equal(v.questions?.length,3,'Case quote needs three diagnostic questions');
 if(v.layout==='two-truths')assert.ok(v.truths?.length===2&&v.truths.every(x=>x.label&&x.title&&x.text&&x.assetId),'Change/continuity needs two clear propositions');
 if(v.layout==='capacity-gate')assert.ok(v.capabilities?.length===3&&v.gateCue&&v.gateTitle&&v.gateText,'Capacity needs a verification gate');
 if(v.layout==='handoff')assert.ok(v.roles?.length===2&&v.handoff&&v.roles.every(x=>x.name&&x.title&&x.detail&&x.assetId),'Handoff needs roles and deliverable');
 if(v.layout==='convergence')assert.ok(v.focus?.title&&v.focus?.detail&&v.items?.length===3&&v.itemAssetIds?.length===3,'Convergence requires three supported forces');
 if(v.layout==='customer-voices')assert.ok(v.signalLabel&&v.responseLabel&&v.items?.length===3&&v.detail?.length===3,'Customer needs voices and questions');
 if(v.layout==='cause-map')assert.ok(v.symptom&&v.symptomLabel&&v.causesLabel&&v.items?.length===3&&v.detail?.length===3,'Hypothesis slide must distinguish symptom from cause');
 if(v.layout==='prompt-example')assert.ok(v.exampleLabel&&v.example&&v.context&&v.transfer&&v.outputLabel&&v.review&&v.questions?.length===3,'Prompt example must distinguish fictional input from reviewed questions');
 if(v.layout==='risk-ladder')assert.ok(v.levels?.length===3&&v.levels.every(x=>x.label&&x.example&&x.impact&&x.control)&&v.scaleStart&&v.scaleEnd,'Risk requires consequence and matching control at three levels');
 if(v.layout==='priority-pathways')assert.ok(v.pathways?.length===3&&v.pathways.every(x=>x.signal&&x.priority&&x.action)&&v.signalLabel&&v.responseLabel,'Priorities must explain concrete needs and responses');
 if(v.layout==='meeting-brief')assert.ok(v.fields?.length===3&&v.fields.every(x=>x.name&&x.value)&&v.questions?.length===2&&v.transferLabel&&v.agenda&&v.review&&v.briefLabel&&v.conclusion,'Meeting brief needs editable context, illustrative output and review');
 if(v.layout==='conversation-takeaway')assert.ok(v.signal&&v.question&&v.nextAction&&v.signalLabel&&v.questionLabel&&v.nextLabel&&v.conclusion,'Conversation takeaway must show specific result, not only steps');
 if(v.layout==='capability-journey')assert.ok(v.stages?.length===3&&v.stages.every(x=>x.label&&x.title&&x.detail&&x.assetId)&&v.case&&v.assist&&v.conclusion,'Capability journey needs a decision, optional KI and context');
 if(v.layout==='controlled-comparison')assert.ok(v.exampleLabel&&v.problem&&v.hypothesis&&v.baseline?.label&&v.baseline?.title&&v.baseline?.detail&&v.trial?.label&&v.trial?.title&&v.trial?.detail&&v.baseline?.flow?.length===3&&v.trial?.flow?.length===4&&v.baseline.flow.every(Boolean)&&v.trial.flow.every(Boolean)&&v.measureLabel&&v.measures?.length===2&&v.measures.every(x=>typeof x==='string'&&x.length>3)&&v.guardrail&&v.decisionLabel&&v.decision&&v.conclusion,'Controlled comparison needs two comparable methods, two measures, explicit controls and a decision gate');
 if(v.layout==='bounded-discovery')assert.ok(v.sources?.length===2&&v.sourceTitle&&v.checkTitle&&v.result&&v.inScope&&v.later&&v.conclusion,'Discovery needs a bounded investigation and an explicit exclusion');
 if(v.scene==='analyst-grid')assert.equal(v.number,'1 000','Preserve metaphor');
}
const file=fs.readFileSync('SLIDE_VISUAL_REVIEW_2026-10-24.md','utf8');
for(const id of expected)assert.ok(file.includes('| '+id+' |'),'Missing individual review '+id);
console.log('PASS – '+slides.length+' clear slide statements, semantically selected scene compositions and full visual audit');
