import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const slides=JSON.parse(read('docs/data/slides.json')).items;
const archetypes=new Set(['hero','workbench','choice','journey','dialogue','evidence','system','decision','contrast','blueprint']);
const focuses=new Set(['artifact','choice','flow','question','comparison','quote','hypothesis','metric','diagram','capability','definition','proof','risk','signal','handoff','platform']);
const map=new Map();
for(const slide of slides){
 const d=slide.design;
 assert.ok(d&&typeof d==='object','Missing design contract: '+slide.id);
 assert.deepEqual(Object.keys(d).sort(),['archetype','focus','version'],'Unexpected design schema: '+slide.id);
 assert.ok(archetypes.has(d.archetype),'Unknown editorial archetype: '+slide.id);
 assert.ok(focuses.has(d.focus),'Unknown design focus: '+slide.id);
 assert.equal(d.version,2,'Outdated design contract: '+slide.id);
 assert.ok(slide.title&&slide.speakerBase&&Array.isArray(slide.sourceIds),'Self-contained editorial slide: '+slide.id);
 assert.ok(slide.type==='visual'||slide.type==='architecture','All active slides need specialized scenes: '+slide.id);
 map.set(d.archetype,(map.get(d.archetype)||0)+1);
 if(slide.type==='architecture')assert.equal(d.archetype,'blueprint','Technical diagram should have a blueprint role: '+slide.id);
 if(d.focus==='metric')assert.ok(slide.id==='market-three-forces'||slide.id==='market-customer-pressure'||slide.id==='ai-thousand-analysts','Metrics must be intentional: '+slide.id);
}
assert.equal(map.size,archetypes.size,'Every visual archetype must have at least one intentional slide');
const css=read('docs/assets/slide-editorial-system.css');
for(const archetype of archetypes)assert.ok(css.includes('data-editorial="'+archetype+'"'),'CSS variant missing: '+archetype);
assert.ok(css.includes('prefers-reduced-motion:reduce'),'Movement reduction policy missing');
assert.ok(css.includes('print'),'Print/static output missing');
assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgb[a]?\s*\(|hsl\s*\(/.test(css),'Editorial CSS cannot contain a fixed brand palette');
assert.ok(!/url\(\s*['"]?https?:/.test(css),'Design must be self-contained and offline-friendly');
assert.ok(!/\[data-editorial\][^{]*background:\s*url/.test(css),'Information cannot depend on image backgrounds');
const app=read('docs/assets/site.js');
assert.ok(app.includes('data-editorial=')&&app.includes('data-design-focus'),'Renderer needs data-driven CSS roles');
assert.ok(app.includes('window.InnsiktSlideVisuals.render(s,esc')&&app.includes('return slideWithDesign(s,html);'),'Visual slides must use shared design bridge');
assert.ok(app.includes('window.InnsiktPresentationIllustrations?.render')&&app.includes('return slideWithDesign(s,image);'),'Approved image slides must use the same design bridge');
assert.ok(app.includes('slideWithDesign(s,window.InnsiktArchitectureScenes.render('),'Architecture slides need same design bridge');
const index=read('docs/index.html');
assert.ok(index.includes('slide-editorial-system.css?v='),'Browser CSS missing');
assert.ok(index.indexOf('vendor-architectures.css')<index.indexOf('slide-editorial-system.css'),'Editorial CSS must follow core styles');
const exporter=read('docs/assets/presenter-export.js');
assert.ok(exporter.includes('slide-editorial-system.css?v='),'Portable HTML export must include new design system');
assert.ok(exporter.includes('(await editorial.text())'),'Offline export is missing editorial CSS');
assert.ok(index.includes('site.js?v='),'Site versioning contract missing');
const rules=read('SLIDE_DESIGN_SYSTEM.md');
assert.ok(rules.includes('CSS-skin')&&rules.includes('Ett hovedpoeng'),'Rules must describe content and skin portability');
const structuralVariants={
 'ai-two-directions':'amplifier-flow',
 'ai-good-vs-fast':'editorial-equation',
 'ai-two-extremes':'editorial-balance',
 'portal-market':'editorial-relation',
 'market-why-now':'editorial-relation',
 'portal-three-ways':'editorial-choices',
 'portal-customer-signal':'editorial-journey',
};
for(const [id,variant] of Object.entries(structuralVariants)){
 const s=slides.find(x=>x.id===id);
 assert.equal(s?.visual?.variant,variant,'Required structural scene: '+id);
}
const narratives=read('docs/assets/slide-visual-narratives.css');
assert.ok(read('docs/index.html').includes('slide-visual-narratives.css?v='),'Real scenes must load in browser');
assert.ok(exporter.includes('slide-visual-narratives.css?v='),'Real scenes must be available in offline export');
for(const selector of ['scene-amplifier','v15-equation','v15-balance','v15-relation','v15-choices','v15-journey'])assert.ok(narratives.includes(selector),'Real scene CSS missing '+selector);
assert.ok(read('SLIDE_REDESIGN_AUDIT_2026-11-03.md').includes('0.18.52'),'Must preserve acknowledgement of metadata-only redesign');
console.log('PASS – '+slides.length+' individually typed design scenes, '+map.size+' archetypes, skin-only styles, motion and portable HTML');
