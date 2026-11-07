import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const root=process.cwd();
const manifest=JSON.parse(fs.readFileSync('media/images.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('docs/data/visual-assets.json','utf8'));
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
assert.equal(manifest.schemaVersion,1);
const masters=new Set(),published=new Set();
for(const asset of manifest.images){
 assert.match(asset.id,/^[a-z][a-z0-9-]+$/);
 assert.match(asset.master,/^media\/masters\/[a-z0-9-]+\.(png|webp|jpg|jpeg)$/);
 assert.match(asset.public,/^docs\/assets\/library\/(?:vendor|external|original)\/[a-z0-9-]+\.webp$/);
 assert.ok(!masters.has(asset.master)&&!published.has(asset.public),'Duplicate master or output');
 masters.add(asset.master);published.add(asset.public);
 assert.ok(fs.existsSync(asset.master)&&fs.existsSync(asset.public),'Missing source or published image: '+asset.id);
 assert.equal(sha(asset.master),asset.masterSha256,'Outdated master: rebuild '+asset.id);
 assert.equal(sha(asset.public),asset.publicSha256,'Outdated derivative: rebuild '+asset.id);
 assert.ok(Number.isInteger(asset.maxWidth)&&asset.maxWidth<=2560);
 assert.ok(asset.maxBytes<=manifest.policy.webMaxBytesPerImage&&asset.maxBytes>0);
 assert.ok(fs.statSync(asset.public).size<=asset.maxBytes,'Public image is too large: '+asset.id);
 const registered=catalog.items.find(x=>x.id===asset.id);
 assert.ok(registered);
 assert.equal('docs/'+registered.path,asset.public,'Registry must point to the derivative, never the master');
 assert.equal(registered.sha256,asset.publicSha256);
}
function walk(dir){
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item=>{
  const full=path.posix.join(dir,item.name);
  return item.isDirectory()?walk(full):[full];
 });
}
const slides=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const byId=new Map(catalog.items.map(a=>[a.id,a]));
function assetIds(value,out=new Set()){
 if(Array.isArray(value)){value.forEach(x=>assetIds(x,out));return out;}
 if(value&&typeof value==='object'){
  if(typeof value.assetId==='string')out.add(value.assetId);
  Object.values(value).forEach(x=>assetIds(x,out));
 }
 return out;
}
for(const slide of slides){
 const ids=assetIds(slide.visual);
 const budget=[...ids].reduce((sum,id)=>sum+(byId.has(id)?fs.statSync('docs/'+byId.get(id).path).size:0),0);
 assert.ok(budget<=manifest.policy.webMaxBytesPerSlide,'Slide image object total too large: '+slide.id+' / '+budget+' bytes');
}
const web=walk('docs');
const illustrations=JSON.parse(fs.readFileSync('docs/data/presentation-illustrations.json','utf8'));
const publishedRaster=new Set([...catalog.items.filter(a=>/\.(?:png|webp|jpe?g)$/i.test(a.path)).map(a=>'docs/'+a.path),...illustrations.variants.filter(a=>a.approvalStatus==='approved').map(a=>'docs/'+a.publicPath.replace(/^\.\//,''))]);
for(const file of web.filter(p=>/\.(?:png|webp|jpe?g)$/i.test(p))){
 assert.ok(publishedRaster.has(file),'Unregistered raster image in published website: '+file);
 assert.ok(fs.statSync(file).size<=manifest.policy.webMaxBytesPerImage,'Image exceeds cap: '+file);
}
const storedMasters=walk('media/masters').filter(f=>/\.(?:png|webp|jpe?g)$/.test(f));
for(const file of storedMasters)assert.ok(masters.has(file),'Untracked master file: '+file);
assert.ok(web.every(f=>!f.startsWith('media/')&&!f.includes('/masters/')),'Master files cannot be published');
const webBytes=web.reduce((sum,file)=>sum+fs.statSync(file).size,0);
assert.ok(webBytes<=manifest.policy.artifactUncompressedLimitBytes,'Web payload exceeds configured artifact budget');
console.log('PASS – '+manifest.images.length+' mastered images, only optimized derivatives (slide budget guarded), '+(webBytes/1024/1024).toFixed(2)+' MiB web payload');
