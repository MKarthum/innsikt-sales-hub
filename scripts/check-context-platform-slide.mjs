import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const slides=read('docs/data/slides.json').items;
const context=slides.find(s=>s.id==='ai-context-platforms-2027');
const chain=slides.find(s=>s.id==='insight-value-chain');
const assets=read('docs/data/visual-assets.json');
const box={window:{InnsiktStoryScenes:{render:()=>null}}};
for(const file of [
 'docs/assets/visual-assets.js',
 'docs/assets/slide-graph.js',
 'docs/assets/unified-slide-scene.js',
 'docs/assets/visual-composition.js',
 'docs/assets/context-atlas.js',
 'docs/assets/slide-visuals.js'
])vm.runInNewContext(fs.readFileSync(file,'utf8'),box,{filename:file});
const api=box.window.InnsiktDiagramScene;
assert.ok(api?.render&&api?.create,'En autoritativ scenemotor må være lastet');
const escape=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;')
 .replaceAll('"','&quot;').replaceAll('>','&gt;');
assert.deepEqual(Array.from(context.visual.artDirections),['rich','rich-image']);
assert.deepEqual(Array.from(chain.visual.artDirections),['rich','rich-image']);
const scenes=[context,chain];
for(const slide of scenes){
 const plan=api.create(slide);
 assert.equal(plan.scene,slide.visual.scene);
 assert.ok(plan.nodes.length>=4,'Nodes must be data driven');
 assert.ok(plan.edges.length>=5,'Connections must be defined once in the model');
 const rendered=api.render(slide,assets,escape);
 const fallback=box.window.InnsiktSlideVisuals.render(slide,escape,{assets});
 if(slide.id===context.id){
  assert.match(fallback,/data-scene-family="context-atlas"/,'The context slide must now use the modular composer');
  assert.equal((fallback.match(/data-edge-id="/g)||[]).length,10);
  assert.equal((fallback.match(/data-node-id="/g)||[]).length,22);
 }else assert.equal(fallback,rendered,'Legacy chain scene remains unchanged until migrated');
 assert.equal((rendered.match(/data-unified-scene="/g)||[]).length,1,'One SVG scene only');
 assert.equal((rendered.match(/data-layout-contract="/g)||[]).length,1);
 assert.equal((rendered.match(/data-edge-id="/g)||[]).length,plan.edges.length,
  'Exactly one visual path per semantic connection');
 assert.equal((rendered.match(/data-node-id="/g)||[]).length,plan.nodes.length+(plan.kind==='context'?1:0));
 assert.ok(rendered.includes(slide.title));
 for(const item of plan.nodes){
  for(const part of api.textLines(item.item.title||item.item.label,
    item.kind==='stage'?23:item.kind==='cycle'?24:26,2))
   assert.ok(rendered.includes(escape(part)),
    'Missing canonical node label segment '+part+' in '+item.id);
  for(const part of api.textLines(item.item.detail,item.kind==='source'?30:26,2))
   assert.ok(rendered.includes(escape(part)),'Missing canonical detail segment '+part+' in '+item.id);
  assert.ok(rendered.includes('data-icon-id="'+item.item.assetId+'"'),
   'Icons must be selected by canonical asset ID');
 }
 assert.ok(rendered.includes('class="cp-brand-overlay"'),'Brand must remain separate');
 // The style selector must never create a second layout, copy a string, or
 // insert a bitmap with its own positions and arrows.
 assert.ok(!rendered.includes('cp-approved-image'));
 assert.ok(!rendered.includes('cp-native-svg'));
 assert.ok(!rendered.includes('cp-graph-overlay'));
 const change=JSON.parse(JSON.stringify(slide));
 if(plan.kind==='context')change.visual.facets[1].detail='Helt ny faglig detalj';
 else change.visual.stages[1].detail='Helt ny faglig detalj';
 const revised=api.render(change,assets,escape);
 assert.ok(revised.includes('Helt ny faglig detalj'));
 assert.equal((revised.match(/data-edge-id="/g)||[]).length,plan.edges.length);
 for(const edge of plan.edges){
  assert.ok(rendered.includes('data-edge-id="'+edge.id+'" data-from="'+edge.from+'" data-to="'+edge.to+'"'),
   'Edge identity and direction must be stable: '+edge.id);
 }
}
const ctx=api.create(context);
assert.equal(ctx.edges.length,10,'All ten canonical context relationships must survive');
assert.equal(ctx.nodes.length,15,'Three consumers, facets, sources, steps and outcomes');
const required=box.window.InnsiktSlideGraph.validate(context.visual.graph,context.visual);
assert.deepEqual(Array.from(ctx.edges,x=>x.id),Array.from(required.edges,x=>x.id),
 'The SVG must use the same graph order as the canonical data');
const core=ctx.context;
for(const facet of ctx.nodes.filter(n=>n.kind==='facet')){
 for(const x of [facet.x,facet.x+facet.w])for(const y of [facet.y,facet.y+facet.h]){
  const q=Math.abs((x-core.cx)/(core.rx-10))**core.power+
   Math.abs((y-core.cy)/(core.ry-10))**core.power;
  assert.ok(q<=1,'Every facet corner requires 10 px clearance from the context rim');
 }
}
const sourceEdges=ctx.edges.filter(e=>e.from.startsWith('sources:'));
assert.equal(sourceEdges.length,3);
assert.equal(sourceEdges.filter(e=>e.head).length,1,
 'Three sources must share exactly one arrowhead, not imply a one-to-one facet mapping');
const alteredGraph=JSON.parse(JSON.stringify(context));
alteredGraph.visual.graph.source=alteredGraph.visual.graph.source.replace(
 'sources:1 --> context : informs [systems-context]',
 'context --> sources:1 : informs [systems-context]');
assert.throws(()=>api.create(alteredGraph),'Reversed canonical edge must be rejected');
const val=api.create(chain);
assert.equal(val.nodes.length,4,'Four independently editable stages');
assert.equal(val.edges.length,5,'Input and output plus ordered intermediate steps');
assert.ok(val.edges.every((e,i)=>i===0?e.from==='input':i===4?e.to==='output':true));
const styles=fs.readFileSync('docs/assets/unified-slide-scene.css','utf8');
for(const style of ['rich','rich-image'])
 assert.ok(styles.includes('[data-art-direction="'+style+'"]'),
  'All alternate styles must be CSS treatments of one geometry: '+style);
assert.ok(styles.includes('.scene-unified-diagram .di-svg'),'One shared style root');
const source=fs.readFileSync('docs/assets/site.js','utf8');
assert.ok(source.includes("const sharedScene=['context-platforms','insight-ecosystem']"),
 'Site must bypass approved bitmap capture for shared scenes');
assert.ok(source.includes("if(!sharedScene&&artDirection(s)==='rich-image'"),
 'No approved bitmap may shadow the same semantic SVG');
assert.ok(!fs.readFileSync('docs/assets/slide-visuals.js','utf8').includes(
 "if(kind==='context-platforms'){"),'Obsolete context renderer must not be maintained');
console.log('PASS – two scenes, one geometry, three styles, 10 edges, facets, icons, semantics and graph invariants');
