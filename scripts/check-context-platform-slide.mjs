import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const slide=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items.find(x=>x.id==='ai-context-platforms-2027');
assert.ok(slide,'Missing context platform slide');
assert.equal(slide.scope,'shared');
assert.equal(slide.type,'visual');
assert.equal(slide.visual.scene,'context-platforms');
assert.deepEqual(slide.visual.artDirections,['rich','rich-image'],'Only two additional representations');
assert.equal(slide.visual.preferredArtDirection,'rich-image');
assert.equal(slide.visual.artwork.objects.some(x=>x.id==='rich-valley-ranges'),false,'No flat vectors in rich view');
const modelBox={window:{}};
vm.runInNewContext(fs.readFileSync('docs/assets/slide-model.js','utf8'),modelBox);
assert.equal(modelBox.window.InnsiktSlides.tone(slide,{},'illustrated'),'strong');
assert.equal(modelBox.window.InnsiktSlides.tone(slide,{},'illustrated-rich'),'strong');
assert.equal(modelBox.window.InnsiktSlides.tone(slide,{},'auto'),'strong');
assert.ok(slide.visual.artwork.objects.some(x=>x.type==='beam'&&x.mode==='cinematic'));
assert.equal(slide.visual.artwork.objects.filter(x=>x.assetId==='context-rich-background').length,1,'Photo must not be duplicated');
assert.equal(slide.design.archetype,'blueprint');
assert.ok(slide.sourceIds.includes('gartner27'));
for(const key of ['consumers','facets','sources','cycle']) {
 assert.equal(slide.visual[key].length,3,key+' requires three meaningful parts');
 assert.ok(slide.visual[key].every(x=>x.label&&x.detail),key+' labels must be data-owned');
}
assert.ok(slide.visual.governance.length>=4);
assert.equal(slide.visual.outcomes.length,3,'Three independent value callouts');
assert.ok(slide.visual.outcomes.every(x=>x.label&&x.detail&&x.assetId));

for(const key of ['consumers','facets','sources','cycle'])assert.ok(slide.visual[key].every(x=>x.assetId),'Every semantic role has a swappable icon');
const sandbox={window:{InnsiktStoryScenes:{render:()=>null}}};
vm.runInNewContext(fs.readFileSync('docs/assets/visual-assets.js','utf8'),sandbox);
vm.runInNewContext(fs.readFileSync('docs/assets/scene-art.js','utf8'),sandbox);
const assets=JSON.parse(fs.readFileSync('docs/data/visual-assets.json','utf8'));
sandbox.window.InnsiktSceneArt.validate(slide.visual.artwork,assets);
vm.runInNewContext(fs.readFileSync('docs/assets/slide-graph.js','utf8'),sandbox);
vm.runInNewContext(fs.readFileSync('docs/assets/context-native-svg.js','utf8'),sandbox);
vm.runInNewContext(fs.readFileSync('docs/assets/slide-visuals.js','utf8'),sandbox);
const escape=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const html=sandbox.window.InnsiktSlideVisuals.render(slide,escape,{index:0,total:1,showNumbers:false,assets});
assert.ok(html.startsWith('<div class="story-scene scene-context-platforms">'));
for(const token of [slide.title,slide.visual.contextLabel,...slide.visual.consumers.map(x=>x.label),...slide.visual.facets.map(x=>x.label),...slide.visual.sources.map(x=>x.label),...slide.visual.cycle.map(x=>x.label)]) {
 assert.ok(html.includes(token),'Missing visible data '+token);
}
assert.equal((html.match(/class="scene-art-object scene-art-object--asset"/g)||[]).length,7);
assert.equal((html.match(/class="cp-cycle-arrow"/g)||[]).length,2,'Both bottom process arrows are native SVG');
assert.ok(html.includes('class="cp-graph-overlay cp-feedback-return"'),'Native return connection exists');
assert.ok(html.includes('class="cp-action-link"'),'Grid spacer is retained');
assert.equal((html.match(/data-edge-id="/g)||[]).length,20,'Two synchronized renderers each expose ten semantic relations');
assert.ok(html.includes('data-from="sources:1" data-to="context"'),'Operational sources feed the context');
assert.ok(html.includes('data-from="context" data-to="consumers:2"'),'Agents consume shared context');
assert.ok(html.includes('data-from="cycle:2" data-to="context"'),'Feedback must return into context');
assert.ok(!html.includes('cp-feedback-track'),'The old hard-coded reverse-loop must not survive');
const endRule=html.match(/data-edge-id="updated-context"[^>]*><path class="cp-graph-track" d="([^"]+)"\/><path class="cp-graph-arrowhead" d="([^"]+)"/);
assert.ok(endRule,'Feedback connector has a path and an arrowhead');
assert.ok(endRule[1].startsWith('M1000 843')&&endRule[1].endsWith('1000 350')&&endRule[1].includes(' C'),'The return curve must attach from the final cycle rail to the context boundary');
assert.ok(endRule[2].includes('L1000 350L'),'Arrowhead tip must coincide with the right context boundary');
const supportRule=html.match(/data-edge-id="context-decision"[^>]*><path class="cp-graph-track" d="([^"]+)"\/><path class="cp-graph-arrowhead" d="([^"]+)"/);
assert.ok(supportRule&&supportRule[1].startsWith('M0 350')&&supportRule[1].endsWith('0 843'),'The decision route must attach to the left cycle boundary, not overlap its icon');
assert.ok(html.includes('M1118 800C1170 787')&&html.includes('1161 541 1114 519'),'The native return route must end on the ellipse and remain left of the outcomes');
const recipe=fs.readFileSync('scripts/render-context-platform-image.py','utf8');
assert.ok(recipe.includes('arrow([(cx,rim),(cx,301)]')&&recipe.includes('route=[(cx,601),(cx,588),(610,588),(610,567)]'),'Bitmap consumers use the context rim and sources converge into one shared inlet');
assert.ok(html.includes('M167 560V544')&&html.includes('M833 560V544'),'Standard diagram must NOT imply a source-to-facet one-to-one mapping');
assert.ok(html.includes('M270 621V613')&&html.includes('M944 621V613'),'Native illustration must share the same source convergence');
assert.ok(recipe.includes('bezier((96,483)')&&recipe.includes('bezier((1120,779)'),'Bitmap feedback must attach at its source/target boundaries');
assert.ok(html.includes('class="cp-brand-overlay"'),'Organization branding must be a separate overlay');
assert.ok(html.includes('data-native-slide-scene="context-platforms"'),'Composite view needs one native SVG stage');
assert.ok(html.includes('class="cpn-consumer-rail-panel"'),'Consumer group shares one visual glass panel');
assert.equal((html.match(/class="cpn-rail-divider"/g)||[]).length,1,'Consumers are separated without duplicate boxes');
assert.ok(html.includes('data-photo-role="landscape"'),'The mountain background must be a first-class SVG image');
assert.equal((html.match(/class="cpn-arrow cpn-arrow--/g)||[]).length,10,'The native SVG stage uses exactly the same ten canonical relations');
assert.ok(html.includes('data-from="cycle:2" data-to="context"'),'The return arrow comes from the same semantic graph');
const wrongDirection=JSON.parse(JSON.stringify(slide.visual.graph));
wrongDirection.source=wrongDirection.source.replace('sources:1 --> context : informs [systems-context]',
 'context --> sources:1 : informs [systems-context]');
assert.throws(()=>sandbox.window.InnsiktSlideGraph.validate(wrongDirection,slide.visual),
 'A reversed arrow must fail every rendering style');
const hiddenExtra=JSON.parse(JSON.stringify(slide.visual.graph));
hiddenExtra.source+='\ncontext --> sources:0 : provides [hidden-edge]';
assert.throws(()=>sandbox.window.InnsiktSlideGraph.validate(hiddenExtra,slide.visual),
 'An edge that the renderer cannot draw must fail validation');
assert.equal((html.match(/class="cp-outcome"/g)||[]).length,3);

assert.ok(html.includes('data-scene-object="flag"'),'Focal object is independently addressable');
assert.ok(!html.includes('cp-landscape-svg'),'Legacy monolithic artwork must be removed');
assert.ok(!html.includes('#fff')&&!html.includes('#000'),'Renderer must not hardcode palette');
const css=fs.readFileSync('docs/assets/slide-visual-narratives.css','utf8');
assert.ok(css.includes('.scene-context-platforms')&&css.includes('var(--pres-accent)'),'Scene should follow theme roles');
assert.ok(css.includes('[data-art-direction="illustrated"]'),'Illustrated art direction should follow semantic roles');
assert.ok(!/url\(\s*['"]?https?:/.test(css),'No external image/network dependencies');
console.log('PASS – context-platforms native scene, source-owned content and theme roles');
