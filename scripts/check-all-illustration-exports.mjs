/* Browser verification automatically discovers approved illustration recipes.
   An additional scene adds one recipe + manifest, never a hardcoded CI job.
   Its HTML fallback remains covered by the normal 44-slide library test. */
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const config=JSON.parse(fs.readFileSync('docs/data/illustration-recipes.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('docs/data/presentation-illustrations.json','utf8'));
const slides=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const byId=new Map(slides.map(s=>[s.id,s]));
let count=0;
for(const recipe of config.recipes){
 const entry=manifest.variants.find(v=>v.sourceSlideId===recipe.sourceSlideId&&v.styleId===recipe.styleId);
 if(!entry)throw Error('Mangler illustrasjonsmanifest: '+recipe.sourceSlideId+'/'+recipe.styleId);
 if(entry.approvalStatus!=='approved'){
  console.log('SKIP (not published): '+recipe.sourceSlideId+'/'+recipe.styleId);
  continue;
 }
 const slide=byId.get(recipe.sourceSlideId);
 if(!slide)throw Error('Lysbildet finnes ikke: '+recipe.sourceSlideId);
 // Every unified scene must expose the same three real presentation styles.
 const directions=['standard','rich','rich-image'].join(',');
 const args=['scripts/check-context-platform-exports-browser.mjs'];
 const env={...process.env,EXPORT_SLIDE_ID:recipe.sourceSlideId,EXPORT_DIRECTIONS:directions};
 const result=spawnSync(process.execPath,args,{env,stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
 count++;
}
console.log('PASS – '+count+' godkjente bildescener kontrollert i alle fire nedlastingsformater');
