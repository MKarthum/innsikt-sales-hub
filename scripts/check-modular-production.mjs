/* Production-line contract: a new scene must use shared code and export without
   adding a second factual model, a slide-specific renderer or orphan decoration. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const slides=JSON.parse(read('docs/data/slides.json')).items;
const example=slides.find(s=>s.id==='delivery-time-context-flow');
const atlas=slides.find(s=>s.id==='ai-context-platforms-2027');
assert.ok(example&&atlas,'Both production-line demonstrations must exist');
assert.equal(example.visual.composition.engine,'modular-v1');
assert.equal(example.visual.composition.family,'story-flow');
assert.equal(example.visual.items.length,4);
assert.equal(example.visual.conclusion.title,'Et riktig tiltak krever riktig kontekst');
assert.deepEqual(example.visual.artDirections,['rich','rich-image']);
assert.ok(example.speakerBase.includes('fiktivt'),'No simulated case should appear as a customer reference');
const ctx={window:{}};
for(const name of ['visual-assets','slide-graph','visual-composition','context-illustrations','context-atlas'])
 vm.runInNewContext(read('docs/assets/'+name+'.js'),ctx,{filename:name+'.js'});
const api=ctx.window.InnsiktVisualComposition;
const assets=JSON.parse(read('docs/data/visual-assets.json'));
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const images=[];
for(const style of ['standard','rich','rich-image']){
 const plan=api.compile(example,style);
 assert.equal(plan.composition,'flow-with-outcome');
 assert.equal(plan.scene.family,'story-flow');
 assert.equal(plan.scene.nodes.length,5);
 assert.equal(plan.edges.length,3);
 assert.deepEqual(Array.from(plan.edges,e=>e.from+'>'+e.to),
  ['item:0>item:1','item:1>item:2','item:2>item:3']);
 const svg=api.renderSlide(example,assets,esc,style);
 assert.ok(svg.includes('data-scene-family="story-flow"'));
 assert.equal((svg.match(/data-node-id="/g)||[]).length,5);
 assert.equal((svg.match(/data-edge-id="/g)||[]).length,3);
 assert.equal((svg.match(/class="mc-edge-direction"/g)||[]).length,3);
 assert.equal((svg.match(/<animateMotion /g)||[]).length,3);
 for(const item of example.visual.items)assert.ok(svg.includes(item));
 for(const detail of example.visual.detail)for(const word of detail.split(/\s+/).filter(Boolean))assert.ok(svg.includes(esc(word)), 'Missing rendered word: '+word);
 assert.ok(svg.includes(example.visual.conclusion.title));
 assert.ok(svg.includes(example.visual.conclusion.detail));
 images.push({style,svg,paths:plan.edges.map(e=>e.path),boxes:Array.from(plan.geometry.values())});
}
assert.deepEqual(images[0].paths,images[1].paths);
assert.deepEqual(images[1].paths,images[2].paths);
assert.deepEqual(images[0].boxes,images[2].boxes);
const modified=structuredClone(example);
modified.visual.items[1]='Ny faglig betydning';
assert.ok(api.renderSlide(modified,assets,esc,'rich-image').includes('Ny faglig betydning'),
 'Editing JSON must update the scene without changing renderer code');
const invalid=structuredClone(example);
invalid.visual.items.push('Unødvendig ekstra objekt');
assert.throws(()=>api.compile(invalid,'standard'),/fire steg|fire|fem|flow|steg|konklusjon/i,
 'Composition should reject an extra unexplained card');
const contextMarkup=api.renderSlide(atlas,assets,esc,'rich-image');
assert.ok(!contextMarkup.includes('acp-core-pulse'));
assert.ok(!contextMarkup.includes('acp-hero-illustration'));
assert.ok(!atlas.visual.artwork,'Outdated unused bitmap composition must not return');
assert.ok(!read('docs/assets/context-illustrations.css').includes('.acp-core-pulse'));
assert.ok(!read('docs/assets/context-atlas.css').includes('.acp-core-art'));
assert.ok(!read('docs/assets/context-illustrations.js').includes('function hub('));
const site=read('docs/assets/site.js');
assert.ok(site.includes("['gif',ui.singleAnimatedGifLabel]"));
assert.ok(site.includes("['video',ui.singleAnimatedVideoLabel]"));
assert.ok(site.includes("import('./animated-slide-export.js?v='"));
const exporter=read('docs/assets/animated-slide-export.js');
assert.ok(exporter.includes('image/gif')&&exporter.includes('MediaRecorder.isTypeSupported'));
assert.ok(exporter.includes('getPointAtLength'),'Animation must follow the real SVG geometry');
assert.ok(exporter.includes('frameCount:MOTION_SECONDS*GIF_FPS'));
const sandbox={Blob,Uint8Array,window:{}};
vm.runInNewContext(exporter.replace(/^export /gm,'')+'\nwindow.test={makeGif,indexedFrame};',sandbox);
const tiny=Uint8Array.from({length:8*8},(_,i)=>i%256);
const gif=sandbox.window.test.makeGif([tiny,tiny],8,8,10);
const bytes=new Uint8Array(await gif.arrayBuffer());
assert.equal(Buffer.from(bytes.slice(0,6)).toString('ascii'),'GIF89a');
assert.equal(bytes.at(-1),0x3B);
let offset=13+768+19,count=0;
while(offset<bytes.length-1){
 assert.equal(bytes[offset++],0x21);assert.equal(bytes[offset++],0xF9);
 assert.equal(bytes[offset++],4);offset+=5;
 assert.equal(bytes[offset++],0x2C);offset+=9;
 assert.equal(bytes[offset++],8);
 for(;;){const size=bytes[offset++];if(!size)break;offset+=size;}
 count++;
}
assert.equal(count,2,'A GIF must contain more than a static first frame');
const ui=JSON.parse(read('docs/data/pages.json')).slideLibraryUi;
assert.equal(ui.singleAnimatedGifLabel,'Animert GIF');
assert.equal(ui.singleAnimatedVideoLabel,'Video (MP4/WebM)');
console.log('PASS – new modular production scene, 3 skins, 5 native nodes, 3 motion paths, clean context and valid animated GIF bytes');
