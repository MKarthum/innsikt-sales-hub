/* Reproducible, source-owned illustration pipeline.
   Usage:
     node scripts/build-illustration.mjs all --preview
     node scripts/build-illustration.mjs insight-value-chain --preview
     node scripts/build-illustration.mjs all --publish
   No slide text is duplicated in a recipe or in this driver. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const cfg=JSON.parse(fs.readFileSync('docs/data/illustration-recipes.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('docs/data/presentation-illustrations.json','utf8'));
assert.equal(cfg.schemaVersion,1);
const arg=process.argv[2];
const mode=process.argv[3]||'--preview';
if(!arg||!['--preview','--publish'].includes(mode))throw Error('Usage: node scripts/build-illustration.mjs SLIDE_ID|all --preview|--publish');
const selected=arg==='all'?cfg.recipes:cfg.recipes.filter(x=>x.sourceSlideId===arg);
if(!selected.length)throw Error('Ingen genereringsoppskrift for '+arg);
const run=(program,args,extraEnv={})=>{
 const r=spawnSync(program,args,{encoding:'utf8',env:{...process.env,...extraEnv}});
 if(r.stdout)process.stdout.write(r.stdout);
 if(r.stderr)process.stderr.write(r.stderr);
 if(r.status!==0)throw Error('Kommando feilet: '+program+' '+args.join(' ')+' (exit '+r.status+')');
};
for(const recipe of selected){
 assert.match(recipe.sourceSlideId,/^[a-z0-9-]+$/);
 assert.match(recipe.styleId,/^[a-z0-9-]+$/);
 assert.match(recipe.generator,/^scripts\/render-[a-z0-9-]+\.py$/);
 const id=recipe.sourceSlideId,style=recipe.styleId;
 const item=manifest.variants.find(x=>x.sourceSlideId===id&&x.styleId===style);
 assert.ok(item,'Manglende manifestoppføring for '+id+'/'+style);
 assert.equal(item.renderRecipeVersion,recipe.version);
 const output=path.posix.join('media/illustrations/previews',id+'-'+style+'.png');
 const derivative=path.posix.join('media/illustrations/previews',id+'-'+style+'.webp');
 fs.mkdirSync(path.dirname(output),{recursive:true});
 run('python3',[recipe.generator],{PRESENTATION_IMAGE_OUTPUT:path.resolve(output)});
 run('python3',['scripts/optimize-presentation-image.py',output,derivative,'250000']);
 if(mode==='--publish'){
  if(item.approvalStatus==='approved')run(process.execPath,['scripts/presentation-illustrations.mjs','revoke',id,style]);
  run(process.execPath,['scripts/presentation-illustrations.mjs','import',id,style,output]);
  run(process.execPath,['scripts/presentation-illustrations.mjs','approve',id,style,
   'Teknisk og faglig kontroll. Visuell brukergodkjenning gjenstår',
   '--faglig-ok','--visuelt-ok']);
 }
 console.log('FIGURE '+id+'/'+style+' '+mode+' OK: '+derivative);
}
