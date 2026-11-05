import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const slide=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items.find(x=>x.id==='ai-context-platforms-2027');
assert.ok(slide,'Missing context platform slide');
assert.equal(slide.scope,'shared');
assert.equal(slide.type,'visual');
assert.equal(slide.visual.scene,'context-platforms');
assert.equal(slide.visual.artDirections?.[0],'illustrated');
assert.equal(slide.design.archetype,'blueprint');
assert.ok(slide.sourceIds.includes('gartner27'));
for(const key of ['consumers','facets','sources','cycle']) {
 assert.equal(slide.visual[key].length,3,key+' requires three meaningful parts');
 assert.ok(slide.visual[key].every(x=>x.label&&x.detail),key+' labels must be data-owned');
}
assert.ok(slide.visual.governance.length>=4);
const sandbox={window:{InnsiktStoryScenes:{render:()=>null}}};
vm.runInNewContext(fs.readFileSync('docs/assets/slide-visuals.js','utf8'),sandbox);
const escape=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const html=sandbox.window.InnsiktSlideVisuals.render(slide,escape,{index:0,total:1,showNumbers:false});
assert.ok(html.startsWith('<div class="story-scene scene-context-platforms">'));
for(const token of [slide.title,slide.visual.contextLabel,...slide.visual.consumers.map(x=>x.label),...slide.visual.facets.map(x=>x.label),...slide.visual.sources.map(x=>x.label),...slide.visual.cycle.map(x=>x.label)]) {
 assert.ok(html.includes(token),'Missing visible data '+token);
}
assert.ok(html.includes('cp-landscape-svg'),'Scene should include local, decorative vector landscape');
assert.ok(!html.includes('#fff')&&!html.includes('#000'),'Renderer must not hardcode palette');
const css=fs.readFileSync('docs/assets/slide-visual-narratives.css','utf8');
assert.ok(css.includes('.scene-context-platforms')&&css.includes('var(--pres-accent)'),'Scene should follow theme roles');
assert.ok(css.includes('[data-art-direction="illustrated"]'),'Illustrated art direction should follow semantic roles');
assert.ok(!/url\(\s*['"]?https?:/.test(css),'No external image/network dependencies');
console.log('PASS – context-platforms native scene, source-owned content and theme roles');
