import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {TextEncoder} from 'node:util';

// The production contract, not a single benchmark: one slide owns the text,
// one recipe selects a design, one manifest owns its published image snapshot.
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const library=read('docs/data/slides.json').items;
const config=read('docs/data/illustration-recipes.json');
const manifest=read('docs/data/presentation-illustrations.json');
assert.equal(config.schemaVersion,1);
assert.equal(manifest.schemaVersion,1);
const byId=new Map(library.map(s=>[s.id,s]));
const keys=new Set();
for(const recipe of config.recipes){
 const key=recipe.sourceSlideId+':'+recipe.styleId;
 assert.ok(!keys.has(key),'Duplisert oppskrift: '+key);
 keys.add(key);
 const slide=byId.get(recipe.sourceSlideId);
 assert.ok(slide,'Mangler lysbilde for illustrasjonsoppskrift: '+key);
 assert.ok(slide.visual?.artDirections?.includes(recipe.styleId),
  'Slides.json må eksplisitt tillate illustrasjonsretningen: '+key);
 assert.match(recipe.generator,/^scripts\/render-[a-z0-9-]+\.py$/);
 assert.ok(fs.existsSync(recipe.generator),'Mangler generator: '+key);
 assert.ok(fs.readFileSync(recipe.generator,'utf8').includes('from illustration_kit import'),
  'Generatoren må bruke samme primitive bibliotek: '+key);
 const variant=manifest.variants.find(x=>x.sourceSlideId===recipe.sourceSlideId&&x.styleId===recipe.styleId);
 assert.ok(variant,'Mangler publiseringsmanifest for '+key);
 assert.equal(variant.renderRecipeVersion,recipe.version,'Bildeoppskriften er utdatert: '+key);
}
assert.equal(keys.size,manifest.variants.length,'Hver illustrasjonsvariant må ha sin egen oppskrift');
const kit=fs.readFileSync('scripts/illustration_kit.py','utf8');
for(const k of ['def panel(', 'def stroke(', 'def superellipse_panel(', 'def contains_superellipse(',
                'def wrap(', 'QUALITY_SCALE = 4']){
 assert.ok(kit.includes(k),'Felles figurprimitiv mangler: '+k);
}
const box={window:{},crypto:crypto.webcrypto,TextEncoder};
vm.runInNewContext(fs.readFileSync('docs/assets/presentation-illustrations.js','utf8'),box);
const api=box.window.InnsiktPresentationIllustrations;
const context=byId.get('ai-context-platforms-2027');
const bridge=byId.get('insight-value-chain');
assert.ok(context&&bridge,'To uavhengige prototyper må finnes');
assert.notEqual(context.visual.scene,bridge.visual.scene,'En prototype må teste en ny topologi');
const old=manifest.variants.find(x=>x.sourceSlideId===context.id);
const hash=s=>crypto.createHash('sha256').update(api.canonicalText(s)).digest('hex');
assert.equal(hash(context),old.contentHash,'Den eksisterende publiserte illustrasjonen skal ikke miste sitt hash-grunnlag');
const bridgeText=api.canonicalText(bridge);
assert.ok(bridgeText.includes('Datateknikk og modellering'),'Nytt bilde må bruke faktiske kanoniske prosesstrinn');
const altered=JSON.parse(JSON.stringify(bridge));
altered.visual.stages[0].detail='Ny generell testtekst';
assert.notEqual(hash(bridge),hash(altered),'Faglig endring må kreve en ny bilderevisjon');
const ready={variants:[{sourceSlideId:bridge.id,styleId:'rich-image',
 runtimeStatus:'ready',fileSha256:'test-sha',
 publicPath:'./assets/illustrations/insight-value-chain-rich-image.webp'}]};
const html=api.render(bridge,'rich-image',ready,x=>String(x).replaceAll('&','&amp;').replaceAll('"','&quot;'));
assert.ok(html.includes('scene-insight-ecosystem')&&html.includes('class="cp-approved-image"'));
assert.ok(html.includes(bridge.title),'Opphavstittel må være tilgjengelig også for rasterbilde');
const imageCss=fs.readFileSync('docs/assets/presentation-illustrations.css','utf8');
assert.ok(imageCss.includes('.story-scene.scene-context-image .cp-brand-overlay')&&
 imageCss.includes('background-image:var(--slide-brand-logo,none)'),
 'Alle bilder må ha separat logooverlegg som kan styles av et annet designsystem');
const site=fs.readFileSync('docs/assets/site.js','utf8');
assert.ok(site.includes('slide?.visual?.artDirections||[]'),'Ingen enkeltslide skal være kodet som eneste gyldige illustrasjon');
assert.ok(!site.includes("if(slide?.visual?.scene!=='context-platforms')return 'standard'"),
 'Stilvalg skal ikke være bundet til én benchmark');
assert.ok(site.includes("if(artDirection(s)==='rich-image'&&s.visual?.artDirections?.includes('rich-image'))"),
 'Flere bilder må følge samme publiseringsvei');
const driver=fs.readFileSync('scripts/build-illustration.mjs','utf8');
assert.ok(driver.includes("arg==='all'?cfg.recipes")&&driver.includes('--preview')&&driver.includes('--publish'),
 'En ny figur skal genereres med samme kommando, uten spesialkode i appen');
console.log('PASS – felles figurprimitiver, to sceneoppskrifter, endringshash, appvisning og livssyklus');
