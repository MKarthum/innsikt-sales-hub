/* Faglig modell → bilderevisjon → manuell godkjenning → publisering.
   Usage:
     node scripts/presentation-illustrations.mjs check|status
     node scripts/presentation-illustrations.mjs import SLIDE_ID STYLE_ID IMAGE_FILE
     node scripts/presentation-illustrations.mjs approve SLIDE_ID STYLE_ID REVIEWER --faglig-ok --visuelt-ok
     node scripts/presentation-illustrations.mjs revoke SLIDE_ID STYLE_ID
   Import NEVER approves an image. An unapproved image stays outside docs/. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const root='docs/data/presentation-illustrations.json';
const slides=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const manifest=JSON.parse(fs.readFileSync(root,'utf8'));
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync('docs/assets/presentation-illustrations.js','utf8'),sandbox);
const canonicalText=sandbox.window.InnsiktPresentationIllustrations.canonicalText;
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const fileDigest=p=>digest(fs.readFileSync(p));
const recipeVersions={'rich-image':'5'};
const maxBytes=250000;
const currentHash=s=>digest(canonicalText(s));
const byId=new Map(slides.map(s=>[s.id,s]));
const publicPath=item=>'docs/assets/illustrations/'+item.sourceSlideId+'-'+item.styleId+'.webp';
const draftPath=item=>'media/illustrations/drafts/'+item.sourceSlideId+'-'+item.styleId+'.webp';
const get=(id,style)=>{
 const entry=manifest.variants.find(v=>v.sourceSlideId===id&&v.styleId===style);
 if(!entry)throw Error('Ukjent illustrasjonsvariant: '+id+' / '+style);
 return entry;
};
function persist(){
 fs.writeFileSync(root,JSON.stringify(manifest,null,2)+'\n');
}
function validate(){
 assert.equal(manifest.schemaVersion,1);
 const seen=new Set(),published=new Set();
 for(const item of manifest.variants){
  assert.match(item.sourceSlideId,/^[a-z][a-z0-9-]+$/);
  assert.ok(byId.has(item.sourceSlideId),'Ukjent kilde: '+item.sourceSlideId);
  assert.ok(Object.hasOwn(recipeVersions,item.styleId),'Ukjent stil: '+item.styleId);
  assert.equal(String(item.renderRecipeVersion),recipeVersions[item.styleId],'Endret bilderegnskap, regenerer: '+item.styleId);
  assert.ok(['awaiting-asset','in-review','approved','rejected'].includes(item.approvalStatus));
  const key=item.sourceSlideId+':'+item.styleId;
  assert.ok(!seen.has(key),'Duplisert stil: '+key);seen.add(key);
  assert.equal(item.assetId,'presentation-'+key.replace(':','-'));
  if(item.approvalStatus==='approved'){
   assert.equal(item.contentHash,currentHash(byId.get(item.sourceSlideId)),'Utdatert godkjent illustrasjon: '+key);
   assert.equal(item.publicPath,'./assets/illustrations/'+path.basename(publicPath(item)));
   assert.match(item.approvedAt||'',/^\d{4}-\d\d-\d\dT/);
   assert.ok(item.reviewedBy,'Mangler manuell godkjenner: '+key);
   assert.ok(fs.existsSync(publicPath(item)),'Godkjent bildefil mangler: '+key);
   assert.equal(item.fileSha256,fileDigest(publicPath(item)),'Uventet bildeendring: '+key);
   assert.ok(fs.statSync(publicPath(item)).size<=maxBytes,'Illustrasjon for stor: '+key);
   published.add(publicPath(item));
  }else{
   assert.equal(item.publicPath,null,'Ikke-godkjent variant må ikke publiseres: '+key);
   assert.ok(!fs.existsSync(publicPath(item)),'Ugodkjent bildefil ligger i docs/: '+key);
   assert.equal(item.approvedAt,null,'Ugodkjent variant har approvedAt: '+key);
  }
 }
 const dir='docs/assets/illustrations';
 if(fs.existsSync(dir)){
  for(const name of fs.readdirSync(dir)){
   const file=path.posix.join(dir,name);
   assert.ok(published.has(file),'Ikke registrert/godkjent offentlig illustrasjon: '+file);
  }
 }
 return {published:published.size,registered:seen.size};
}
function status(){
 const counts=validate();
 for(const item of manifest.variants){
  const slide=byId.get(item.sourceSlideId);
  const stale=item.contentHash&&item.contentHash!==currentHash(slide);
  console.log(item.sourceSlideId+' / '+item.styleId+': '+item.approvalStatus+(stale?' (faglig endret, regenerering nødvendig)':''));
 }
 console.log('PASS – '+counts.published+' godkjente av '+counts.registered+' registrerte bildevarianter');
}
function copyMaster(item,source){
 const ext=path.extname(source).toLowerCase();
 if(!['.png','.webp','.jpeg','.jpg'].includes(ext))throw Error('Kildebildet må være PNG, JPEG eller WebP');
 const dest='media/illustrations/masters/'+item.sourceSlideId+'-'+item.styleId+ext;
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.copyFileSync(source,dest);
 return dest;
}
function prepare(id,style,source){
 const item=get(id,style);
 if(!source||!fs.existsSync(source))throw Error('Kildebildefil mangler');
 if(item.approvalStatus==='approved')throw Error('Trekk først tilbake godkjenningen med revoke');
 const master=copyMaster(item,source);
 const draft=draftPath(item);
 const process=spawnSync('python3',['scripts/optimize-presentation-image.py',master,draft,String(maxBytes)],{encoding:'utf8'});
 if(process.status!==0)throw Error('Optimalisering feilet: '+process.stderr);
 item.masterPath=master;
 item.masterSha256=fileDigest(master);
 item.draftPath=draft;
 item.fileSha256=fileDigest(draft);
 item.contentHash=currentHash(byId.get(id));
 item.approvalStatus='in-review';
 item.publicPath=null;item.approvedAt=null;item.reviewedBy=null;
 persist();status();
 console.log('Bilde sendt til faglig og visuell kontroll: '+process.stdout.trim());
}
function approve(id,style,reviewer,flags){
 if(!reviewer||!flags.includes('--faglig-ok')||!flags.includes('--visuelt-ok'))
  throw Error('Krever navngitt godkjenner og eksplisitt --faglig-ok --visuelt-ok');
 const item=get(id,style);
 if(item.approvalStatus!=='in-review')throw Error('Bare ferdige gjennomgåtte utkast kan godkjennes');
 if(item.contentHash!==currentHash(byId.get(id)))throw Error('Faglig innhold er endret, regenerer bildet');
 if(!item.draftPath||!fs.existsSync(item.draftPath)||item.fileSha256!==fileDigest(item.draftPath))
  throw Error('Bildefil stemmer ikke med kontrollert utkast');
 fs.mkdirSync('docs/assets/illustrations',{recursive:true});
 fs.copyFileSync(item.draftPath,publicPath(item));
 item.publicPath='./assets/illustrations/'+path.basename(publicPath(item));
 item.approvedAt=new Date().toISOString();
 item.reviewedBy=reviewer;
 item.approvalStatus='approved';
 persist();status();
}
function revoke(id,style){
 const item=get(id,style);
 if(item.approvalStatus!=='approved')throw Error('Ikke en godkjent variant');
 if(!fs.existsSync(item.draftPath||'')){
  fs.mkdirSync(path.dirname(draftPath(item)),{recursive:true});
  fs.copyFileSync(publicPath(item),draftPath(item));
  item.draftPath=draftPath(item);
 }
 fs.unlinkSync(publicPath(item));
 item.publicPath=null;item.approvedAt=null;item.reviewedBy=null;
 item.approvalStatus='in-review';
 persist();status();
}
const [, ,command='check',id,style,...args]=process.argv;
if(command==='check'||command==='status')status();
else if(command==='import')prepare(id,style,args[0]);
else if(command==='approve')approve(id,style,args[0],args.slice(1));
else if(command==='revoke')revoke(id,style);
else throw Error('Ukjent kommando: '+command);
