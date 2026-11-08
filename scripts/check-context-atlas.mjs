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
const compositions=['context-architecture','context-architecture','context-architecture'];
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
   for(const part of item.detail.split(/\s+/).filter(Boolean))assert.ok(html.includes(esc(part).replace('&amp;','&amp;'))||html.includes(esc(item.detail)),style+' missing detail '+part);
  }
 return {html,geometry:Array.from(plan.geometry.values())};
});
assert.deepEqual(rendered[0].geometry,rendered[1].geometry);
assert.deepEqual(rendered[1].geometry,rendered[2].geometry);
for(const {html} of rendered){
 assert.equal((html.match(/data-concept-role="/g)||[]).length,15,'One concept illustration is anchored to each factual card');
 assert.ok(html.includes('class="acp-core-art"'),'Core graph artwork must be owned by the context object');
 assert.equal((html.match(/class="mc-edge-ambient"/g)||[]).length,10,'Ambient edges must reuse exactly the ten canonical paths');
}
const sceneSvg=html=>html.slice(html.indexOf('<svg class="mc-svg"'),html.indexOf('</svg>')+6);
assert.equal(sceneSvg(rendered[0].html),sceneSvg(rendered[1].html));
assert.equal(sceneSvg(rendered[1].html),sceneSvg(rendered[2].html),
 'All styles share the same SVG scene and geometry; visual differences are CSS layers only');
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
console.log('PASS – AI Context Platforms: 22 objekter, 10 kanoniske relasjoner, én stabil komposisjon, objektillustrasjoner, dataendring, ankerflytting, temastøtte');
