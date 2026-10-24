import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const load=n=>JSON.parse(fs.readFileSync('docs/data/'+n+'.json','utf8'));
const assets=load('visual-assets'),profiles=load('architecture-profiles'),slides=load('slides'),decks=load('pages').presentationDecks;
assert.equal(assets.schemaVersion,1);
assert.equal(profiles.schemaVersion,1);
const ids=new Set();
for(const a of assets.items){
 assert.ok(!ids.has(a.id),'Duplicated asset '+a.id);ids.add(a.id);
 assert.ok(['vendor-logo','original-figure','licensed-external'].includes(a.category));
 assert.match(a.path,/^assets\/library\/(vendor|external|original)\/[a-z0-9-]+\.(svg|png|jpg|jpeg|webp)$/);
 assert.equal(a.path.split('/')[2],a.category==='vendor-logo'?'vendor':a.category==='original-figure'?'original':'external');
 const abs=path.join('docs',a.path);assert.ok(fs.existsSync(abs),'Missing '+abs);
 const contents=fs.readFileSync(abs);assert.equal(crypto.createHash('sha256').update(contents).digest('hex'),a.sha256,'Checksum '+a.id);
 assert.ok(a.rights);
 if(a.category==='vendor-logo')assert.ok(a.origin.startsWith('https://')&&a.termsUrl.startsWith('https://'),'Vendor origin and terms '+a.id);
 if(a.category==='licensed-external')assert.ok(a.license&&a.termsUrl,'Explicit reuse license '+a.id);
 if(abs.endsWith('.svg')){const raw=contents.toString('utf8');assert.match(raw,/<svg\b/);assert.doesNotMatch(raw,/<script\b|<foreignObject\b|onload=|onerror=|javascript:/i,'No active content '+a.id);}
}
const pids=new Set();
for(const p of profiles.profiles){
 assert.ok(!pids.has(p.id));pids.add(p.id);
 assert.ok(['conceptual','vendor'].includes(p.kind));
 if(p.kind==='vendor'){
  assert.ok(['snowflake-hub','fabric-experiences','databricks-medallion'].includes(p.variant),'Distinct vendor scene '+p.id);
  assert.ok(p.diagram&&Array.isArray(p.diagram.sources)&&p.diagram.outputs.length>=3&&p.diagram.support.length===4);
  function walkImages(value){
   if(Array.isArray(value))return value.forEach(walkImages);
   if(value&&typeof value==='object'){
    for(const [k,v] of Object.entries(value)){
     if(['assetId','lakeAsset','brand'].includes(k))assert.ok(ids.has(v),'Unknown nested icon '+v);
     else walkImages(v);
    }
   }
  }
  walkImages(p.diagram);
 }
 assert.ok(p.sources.length>=3&&p.consumers.length>=2&&p.support.length>=3);
 for(const a of [...p.sources,...p.consumers,...p.support])assert.ok(ids.has(a.assetId),'Unknown '+a.assetId);
 for(const id of [p.ingest.assetId,p.platform.assetId,p.platform.partnerId,p.vendorId].filter(Boolean))assert.ok(ids.has(id),'Unknown brand or icon '+id);
 if(p.kind==='vendor'){assert.equal(assets.items.find(x=>x.id===p.vendorId).category,'vendor-logo');assert.ok(p.id===p.vendorId);}
}
const archslides=slides.items.filter(s=>s.type==='architecture');
assert.equal(archslides.length,6);
assert.equal(new Set(archslides.map(s=>s.profileId)).size,6);
for(const s of archslides){assert.ok(pids.has(s.profileId));assert.ok(s.scope==='shared');assert.ok(s.sourceIds.length>0);}
const deck=decks.dataarkitektur;assert.equal(deck.slides.length,6);assert.ok(deck.slides.every(p=>archslides.some(s=>s.id===p.slideId)));
const context={window:{}};vm.runInNewContext(fs.readFileSync('docs/assets/visual-assets.js','utf8'),context);
for(const a of assets.items)assert.ok(context.window.InnsiktAssets.get(assets,a.id));
const used=context.window.InnsiktAssets.usedBy('snowflake',profiles,slides);assert.deepEqual([...used.map(x=>x.id)],['architecture-snowflake']);
assert.ok(context.window.InnsiktAssets.usedBy('support-catalog',profiles,slides).length>=6);
console.log('PASS – '+assets.items.length+' sentrale ressurser med opphav, integritet og rettigheter; 6 profiler og 6 gjenbrukbare diagrammer');
