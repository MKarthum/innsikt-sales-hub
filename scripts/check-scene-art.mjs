/* The optional, legacy scene-art renderer remains independently testable, but
   must not require a deleted experimental bitmap recipe on a live SVG slide. */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const catalog=read('docs/data/visual-assets.json');
const slide=read('docs/data/slides.json').items.find(s=>s.id==='ai-context-platforms-2027');
assert.ok(slide&&!slide.visual.artwork,
 'An outdated raster recipe must not be resurrected in the active scene');
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync('docs/assets/visual-assets.js','utf8'),ctx);
vm.runInNewContext(fs.readFileSync('docs/assets/scene-art.js','utf8'),ctx);
const renderer=ctx.window.InnsiktSceneArt,esc=x=>String(x).replace(/[&<>"']/g,s=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[s]));
const art={version:1,objects:[
 {id:'test-background',type:'asset',assetId:'context-rich-background',
  role:'atmosphere',x:0,y:0,w:100,h:100,opacity:.7,mode:'rich',fit:'fill',style:'natural'},
 {id:'test-ridges',type:'asset',assetId:'context-ridges',
  role:'landscape',x:0,y:15,w:100,h:70,opacity:.4,mode:'illustrated',fit:'cover'},
 {id:'test-glow',type:'glow',role:'haze',x:30,y:20,w:40,h:30,opacity:.5,mode:'cinematic'},
 {id:'test-beam',type:'beam',role:'haze',x:55,y:8,w:17,h:55,opacity:.3,mode:'cinematic'},
 {id:'test-orbit',type:'shape',shape:'orbit',role:'accent',x:10,y:20,w:70,h:32,opacity:.6}
]};
assert.equal(renderer.validate(art,catalog),true);
const html=renderer.render(art,catalog,esc);
assert.equal((html.match(/scene-art-object--asset/g)||[]).length,2);
assert.equal((html.match(/scene-art-object--glow/g)||[]).length,1);
assert.equal((html.match(/scene-art-object--beam/g)||[]).length,1);
assert.ok(html.includes('data-scene-shape="orbit"'));
assert.ok(html.includes('context-rich-background.webp'));
assert.ok(!html.includes(slide.visual.contextLead),
 'No canonical semantic text may be inserted into decorative media');
for(const asset of art.objects.filter(x=>x.assetId)){
 const item=catalog.items.find(x=>x.id===asset.assetId);
 assert.ok(item&&html.includes(item.path));
}
const copy=()=>structuredClone(art);
let clone=copy();clone.objects[0].assetId='context-forest';
assert.notEqual(renderer.render(clone,catalog,esc),html,
 'The asset can change without editing the renderer');
const invalid=v=>assert.throws(()=>renderer.validate(v,catalog));
clone=copy();clone.objects.push({...clone.objects[0]});invalid(clone);
clone=copy();clone.objects[0].assetId='https://unsafe.example/asset.svg';invalid(clone);
clone=copy();clone.objects[0].x='0;position:fixed';invalid(clone);
clone=copy();clone.objects[0].type='html';invalid(clone);
clone=copy();clone.objects[0].mode='javascript';invalid(clone);
clone=copy();clone.objects[0].opacity=2;invalid(clone);
clone=copy();clone.objects[0].fit='javascript:alert(1)';invalid(clone);
const css=fs.readFileSync('docs/assets/scene-art.css','utf8');
assert.ok(css.includes('--scene-art-saturation')&&css.includes('--scene-art-brightness'));
assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(css));
assert.ok(!/url\(\s*['"]?https?:/.test(css));
const index=fs.readFileSync('docs/index.html','utf8');
const exporter=fs.readFileSync('docs/assets/presenter-export.js','utf8');
assert.ok(index.includes('scene-art.js?v=')&&index.includes('scene-art.css?v='));
assert.ok(exporter.includes('scene-art.css?v=')&&exporter.includes('(await art.text())'));
console.log('PASS – optional legacy art renderer uses a neutral fixture, not stale slide-specific decoration');
