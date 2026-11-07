/* Minimal portable website/artifact package. The archive is NOT a copy of Git.
   Only docs/ goes into the generated ZIP; media/masters is never distributed. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/presentation-illustrations.mjs','check'],{stdio:'inherit'});
import JSZip from 'jszip';

const manifest=JSON.parse(fs.readFileSync('media/images.json','utf8'));
const assets=JSON.parse(fs.readFileSync('docs/data/visual-assets.json','utf8'));
const illustrations=JSON.parse(fs.readFileSync('docs/data/presentation-illustrations.json','utf8'));
const raster=new Set([...assets.items.filter(x=>/\.(?:png|jpe?g|webp)$/i.test(x.path)).map(x=>x.path),...illustrations.variants.filter(x=>x.approvalStatus==='approved').map(x=>x.publicPath.replace(/^\.\//,''))]);
const zip=new JSZip();
let bytes=0,count=0;
function add(dir){
 for(const file of fs.readdirSync(dir,{withFileTypes:true})){
  const absolute=path.join(dir,file.name);
  if(file.isDirectory()){add(absolute);continue;}
  assert.ok(file.isFile(),'No symbolic links in public package: '+absolute);
  const relative=path.relative('docs',absolute).replaceAll(path.sep,'/');
  assert.ok(relative&&!relative.startsWith('..')&&!relative.includes('/masters/'));
  const data=fs.readFileSync(absolute);bytes+=data.length;count++;
  if(/\.(png|jpe?g|webp)$/i.test(relative)){
   assert.ok(raster.has(relative),'Unknown raster file: '+relative);
   assert.ok(data.length<=manifest.policy.webMaxBytesPerImage,'Oversized public image: '+relative);
  }
  zip.file(relative,data,{date:new Date('2026-01-01T00:00:00Z')});
 }
}
add('docs');
assert.ok(bytes<=manifest.policy.artifactUncompressedLimitBytes,'Portable site exceeds size policy');
const content=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:8}});
const contents=await JSZip.loadAsync(content);
assert.ok(!Object.keys(contents.files).some(f=>f.startsWith('media/')||f.includes('masters/')));
assert.ok(contents.file('index.html')&&contents.file('assets/slide-graph.js'));
fs.mkdirSync('dist',{recursive:true});
const name='dist/innsikt-artifact.zip';
fs.writeFileSync(name,content);
console.log('PASS – portable artifact '+name+': '+count+' files, '+(content.length/1024/1024).toFixed(2)+' MiB compressed / '+(bytes/1024/1024).toFixed(2)+' MiB uncompressed, no masters');
