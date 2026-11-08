import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const slides=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const slide=slides.find(x=>x.id==='ai-context-platforms-2027');
const assets=JSON.parse(fs.readFileSync('docs/data/visual-assets.json','utf8'));
const ctx={window:{}};
for(const file of ['visual-assets','slide-graph','visual-composition','context-atlas'])
 vm.runInNewContext(fs.readFileSync('docs/assets/'+file+'.js','utf8'),ctx,{filename:file+'.js'});
const api=ctx.window.InnsiktVisualComposition,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const graph=ctx.window.InnsiktSlideGraph.validate(slide.visual.graph,slide.visual);
const compositions=['context-architecture','context-glass','context-atmosphere'];
const rendered=['standard','rich','rich-image'].map((style,i)=>{
 const plan=api.compile(slide,style);
 assert.equal(plan.composition,compositions[i]);
 assert.equal(plan.geometry.size,22);
 assert.equal(plan.edges.length,graph.edges.length);
 assert.deepEqual(Array.from(plan.edges,e=>e.id),Array.from(graph.edges,e=>e.id));
 for(const edge of plan.edges)assert.ok(edge.path.startsWith('M')&&edge.path.includes('C'),edge.id);
 const html=api.renderSlide(slide,assets,esc,style);
 assert.equal((html.match(/data-edge-id="/g)||[]).length,10);
 assert.equal((html.match(/data-node-id="/g)||[]).length,22);
 assert.ok(html.includes('data-scene-family="context-atlas"'));
 for(const [group] of [['consumers'],['facets'],['sources'],['cycle'],['outcomes']])
  for(const item of slide.visual[group]){
   assert.ok(html.includes(esc(item.label)),style+' missed '+item.label);
   for(const part of item.detail.split(/\\s+/).filter(Boolean))assert.ok(html.includes(esc(part).replace('&amp;','&amp;'))||html.includes(esc(item.detail)),style+' missing detail '+part);
  }
 return {html,geometry:Array.from(plan.geometry.values())};
});
assert.notDeepEqual(rendered[0].geometry,rendered[1].geometry);
assert.notDeepEqual(rendered[1].geometry,rendered[2].geometry);
const changed=structuredClone(slide);changed.visual.facets[1].detail='Ny dokumentert situasjon';
for(const mode of ['standard','rich','rich-image'])assert.ok(api.renderSlide(changed,assets,esc,mode).includes('Ny dokumentert situasjon'));
const reversed=structuredClone(slide);reversed.visual.graph.source=reversed.visual.graph.source.replace('sources:1 --> context','context --> sources:1');
assert.throws(()=>api.compile(reversed),/Ukjent|retning|relasjon|endepunkt/);
const core=api.compile(slide,'rich-image').geometry.get('context');
const moved=structuredClone(slide);moved.visual.composition.overrides={'rich-image':{positions:{context:{y:core.y+15}}}};
assert.notEqual(api.compile(moved,'rich-image').edges[0].path,api.compile(slide,'rich-image').edges[0].path);
const css=fs.readFileSync('docs/assets/context-atlas.css','utf8');
assert.ok(css.includes('var(--pres-accent)')&&css.includes('data-composition-level="rich-image"'));
assert.ok(!/#[0-9a-f]{3,8}\\b/i.test(css));
console.log('PASS – AI Context Platforms: 22 objekter, 10 kanoniske relasjoner, 3 komposisjoner, dataendring, ankerflytting, temastøtte');
