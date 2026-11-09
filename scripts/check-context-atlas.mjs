import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const slides=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const slide=slides.find(x=>x.id==='ai-context-platforms-2027');
const assets=JSON.parse(fs.readFileSync('docs/data/visual-assets.json','utf8'));
const ctx={window:{}};
for(const file of ['visual-assets','slide-graph','visual-composition','context-illustrations','context-atlas'])
 vm.runInNewContext(fs.readFileSync('docs/assets/'+file+'.js','utf8'),ctx,{filename:file+'.js'});
const api=ctx.window.InnsiktVisualComposition,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const graph=ctx.window.InnsiktSlideGraph.validate(slide.visual.graph,slide.visual);
assert.equal(ctx.window.InnsiktContextArt.motifs.length,15,'Fifteen distinct semantic motifs');
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
 assert.equal((html.match(/data-illustration-motif="/g)||[]).length,15,'One volumetric illustration per semantic card');
 assert.equal((html.match(/class="acp-art-raster"/g)||[]).length,15,'Fifteen independently backed imagery layers');
 assert.ok(html.includes('data-asset-id="context-motif-context"'),'Core image is separately addressable');
 assert.ok(html.includes('class="acp-hero-illustration"'),'Knowledge network must be inside the context object');
 assert.ok(html.includes('class="acp-board-art"'),'Ambient board grid must follow the context object');
 assert.equal((html.match(/data-node-light="/g)||[]).length,16,'Object light is tied to the 16 semantic objects');
 assert.equal((html.match(/class="mc-edge-lumen"/g)||[]).length,10,'Edge accents reuse the canonical paths');
 assert.ok(html.includes('class="mc-spatial"'),'Object effects live behind content, in their own scene layer');
 assert.ok(html.includes('class="acp-scene-stage" data-stage-owner="context"'),'Advanced stage derives from the core object');
 assert.ok(html.includes('class="acp-value-region"'),'Possible-value space is independent from factual cards');
 assert.ok(html.includes('class="acp-organic-atmosphere" data-atmosphere="organic"'),'The advanced backdrop uses an organic visual layer');
 assert.ok(html.includes('class="acp-organic-mist"')&&html.includes('class="acp-organic-streams"'),'Mist and light currents are separate decorative layers');
 assert.ok(!html.includes('class="acp-cinematic-rays"')&&!html.includes('class="acp-cinematic-landscape"'),'Large sharp background polygons must not return');
 assert.ok(html.includes('class="acp-editorial-motif acp-editorial-people"'),'People are not represented by the old uncanny portrait alone');
 assert.ok(html.includes('class="acp-editorial-motif acp-editorial-agent"'),'AI is represented by abstract intentional geometry');
 assert.equal((html.match(/class="mc-edge-ambient"/g)||[]).length,10,'Ambient edges must reuse exactly the ten canonical paths');
}
const nodeTracks=html=>[...html.matchAll(/class="mc-edge-track" d="([^"]+)"/g)].map(x=>x[1]);
assert.deepEqual(nodeTracks(rendered[0].html),nodeTracks(rendered[1].html));
assert.deepEqual(nodeTracks(rendered[1].html),nodeTracks(rendered[2].html),
 'All directions must keep the same ten canonical edge routes');
const headings=html=>[...html.matchAll(/class="acp-card-title" x="([^"]+)"/g)].map(x=>Number(x[1]));
const plainTitles=headings(rendered[0].html),advancedTitles=headings(rendered[2].html);
assert.equal(plainTitles.length,15);
assert.equal(advancedTitles.length,15);
assert.ok(advancedTitles.every((x,i)=>Math.abs(x-plainTitles[i]-40)<.01),
 'Advanced illustration must reserve forty native SVG units for image before copy');
const changed=structuredClone(slide);changed.visual.facets[1].detail='Ny dokumentert situasjon';
for(const mode of ['standard','rich','rich-image'])assert.ok(api.renderSlide(changed,assets,esc,mode).includes('Ny dokumentert situasjon'));
const reversed=structuredClone(slide);reversed.visual.graph.source=reversed.visual.graph.source.replace('sources:1 --> context','context --> sources:1');
assert.throws(()=>api.compile(reversed),/Ukjent|retning|relasjon|endepunkt/);
const core=api.compile(slide,'rich-image').geometry.get('context');
const moved=structuredClone(slide);moved.visual.composition.overrides={'rich-image':{positions:{context:{y:core.y+15}}}};
assert.notEqual(api.compile(moved,'rich-image').edges[0].path,api.compile(slide,'rich-image').edges[0].path);
const light=(html)=>html.match(/data-node-light="context" cx="[^"]+" cy="([^"]+)"/)?.[1];
assert.notEqual(light(api.renderSlide(moved,assets,esc,'rich-image')),light(rendered[2].html),
 'Main light must follow core geometry rather than use absolute positions');
const css=fs.readFileSync('docs/assets/context-atlas.css','utf8');
const conceptCss=fs.readFileSync('docs/assets/context-illustrations.css','utf8');
assert.ok(conceptCss.includes('data-composition-level="rich-image"'));
assert.ok(!/#[0-9a-f]{3,8}\\b/i.test(conceptCss),'Concept palette must use theme tokens');
assert.ok(css.includes('var(--pres-accent)')&&css.includes('data-composition-level="rich-image"'));
assert.ok(!/#[0-9a-f]{3,8}\\b/i.test(css));
console.log('PASS – AI Context Platforms: 22 objekter, 10 kanoniske relasjoner, én stabil komposisjon, objektillustrasjoner, dataendring, ankerflytting, temastøtte');
