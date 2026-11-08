import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const sandbox={window:{InnsiktAssets:{src:(_,id)=>'./assets/library/original/'+id+'.svg'}}};
vm.runInNewContext(fs.readFileSync('docs/assets/visual-composition.js','utf8'),sandbox);
const api=sandbox.window.InnsiktVisualComposition;
const slide=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items.find(x=>x.id==='portal-three-ways');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
assert.equal(slide.visual.composition.engine,'modular-v1');
const modes=['standard','rich','rich-image'], plans=modes.map(x=>api.compile(slide,x));
assert.deepEqual(Array.from(plans,p=>p.composition),['columns','stagger','orbit']);
assert.equal(new Set(plans.map(x=>JSON.stringify(Array.from(x.geometry.values())))).size,3,'Stilvariantene må ha reelt ulik komposisjon');
const contents=modes.map(x=>api.renderSlide(slide,{},esc,x));
for(const html of contents){
 assert.equal((html.match(/data-node-id="/g)||[]).length,3);
 for(const name of slide.visual.items)assert.ok(html.includes(esc(name)),'Kanonisk innhold må nå alle varianter');
 assert.ok(html.includes('data-brand-overlay="true"'),'Logo er et eget eksportlag');
 assert.ok(html.includes('class="mc-svg"'),'Én SVG som eksportkilde');
}
const altered=structuredClone(slide);
altered.visual.items[0]='Ny kanonisk tittel';
for(const mode of modes)assert.ok(api.renderSlide(altered,{},esc,mode).includes('Ny kanonisk tittel'));
const diagram={version:1,id:'technical-scene',title:'Teknisk testscene',cue:'TEST',subtitle:'Kun tekniske fiktive data',
 nodes:[{id:'a',type:'card',content:{title:'A'}},{id:'b',type:'card',content:{title:'B'}},{id:'c',type:'focus',content:{title:'C'}}],
 edges:[{id:'a-to-b',from:'a',to:'b',relation:'informs'},{id:'b-to-c',from:'b',to:'c',relation:'supports'}],
 variants:{standard:'flow',rich:'hierarchy','rich-image':'network'},
 layers:[{id:'halo',type:'glow'},{id:'structure',type:'grid'},
  {id:'image-layer',type:'image',themeAssets:{light:'context-rich-background',strong:'context-forest'}}]};
const p=api.compile(diagram,'standard'),html=api.renderScene(diagram,{},esc,'rich-image');
assert.equal(p.edges.length,2);assert.ok(html.includes('data-edge-id="a-to-b"'));
assert.ok(html.includes('data-layer-tone="strong"'));
assert.ok(html.includes('data-layer-tone="light"'));
const moved=structuredClone(diagram);
moved.overrides={standard:{positions:{b:{x:950,y:610}}}};
assert.notEqual(api.compile(moved,'standard').edges[0].path,p.edges[0].path,
 'Flyttede objekter må flytte forankringer uten å endre relasjonen');
const swap=structuredClone(diagram);swap.layers[2].themeAssets.strong='context-summit';
assert.ok(api.renderScene(swap,{},esc,'rich-image').includes('context-summit.svg'));
assert.ok(!api.renderScene(swap,{},esc,'rich-image').includes('context-forest.svg'));
api.registerObject('test-signal',{version:1,render:({node,box,esc})=>'<g data-node-id="'+esc(node.id)+'"><circle cx="'+box.x+'" cy="'+box.y+'" r="5"/></g>'});
const custom=structuredClone(diagram);custom.nodes[2].type='test-signal';
assert.ok(api.renderScene(custom,{},esc).includes('data-node-id="c"'));
assert.throws(()=>api.registerObject('card',{render:()=>''}),/eksisterende/);
const invalid=structuredClone(diagram);invalid.edges[1].to='missing';
assert.throws(()=>api.compile(invalid),/relasjon/);
const broken=structuredClone(diagram);broken.nodes.push({...broken.nodes[0]});
assert.throws(()=>api.compile(broken),/sceneobjekt/);
const css=fs.readFileSync('docs/assets/visual-composition.css','utf8');
assert.ok(css.includes('var(--pres-accent)')&&css.includes('data-composition-level="rich-image"'));
assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(css),'Hardkodede merkefarger er ikke tillatt');
const exporter=fs.readFileSync('docs/assets/presenter-export.js','utf8');
assert.ok(exporter.includes('visual-composition.css')&&exporter.includes('unified-slide-scene.css'));
assert.ok(!exporter.includes('context-native-svg.css'),'Fjernet stilark må ikke brukes');
console.log('PASS – modulær motor, tre komposisjoner, relasjonsankere, objektregister, tekst, temalag, bytte og eksportstil');
