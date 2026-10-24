import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const items=JSON.parse(fs.readFileSync('docs/data/slides.json','utf8')).items;
const stories=JSON.parse(fs.readFileSync('docs/data/pages.json','utf8')).presentationDecks;
const out='artifacts/library-v1';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const problems=[];
try{
 const p=await browser.newPage({viewport:{width:1536,height:1040},deviceScaleFactor:1});
 p.on('pageerror',e=>problems.push('JavaScript: '+e.message));
 await p.goto(process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/',{waitUntil:'networkidle'});
 await p.evaluate(()=>location.hash='#lysbilder');
 await p.locator('.slide-library-card').first().waitFor();
 assert.equal(await p.locator('.slide-library-card').count(),items.length,'Complete library');
 await p.screenshot({path:out+'/library.png',fullPage:false});
 const typeSeen=new Set();
 for(const s of items){
  await p.evaluate(id=>location.hash='#lysbilder/'+id,s.id);
  await p.locator('.slide-library-detail-stage .present-frame').waitFor();
  await p.waitForFunction(title=>document.querySelector('#main h1')?.textContent?.trim()===title,s.title);
  const stage=p.locator('.slide-library-detail-stage');
  const scene=stage.locator('.story-scene');
  assert.equal(await scene.count(),1,'Custom scene for '+s.id);
  const audit=await stage.evaluate(node=>{
   const root=node.querySelector('.story-scene'),r=root.getBoundingClientRect();
   const matches=[...root.querySelectorAll('h2,h3,p,small,strong')].filter(x=>x.textContent?.trim());
   const outside=[],clip=[];
   for(const el of matches){
    const b=el.getBoundingClientRect();
    if(b.width>0&&b.height>0&&(b.left<r.left-3||b.right>r.right+3||b.top<r.top-3||b.bottom>r.bottom+3))outside.push({text:el.textContent?.slice(0,36),x:b.x,y:b.y,w:b.width,h:b.height});
    if(el.scrollWidth>el.clientWidth+3||el.scrollHeight>el.clientHeight+4)clip.push({text:el.textContent?.slice(0,36),overflowX:el.scrollWidth-el.clientWidth,overflowY:el.scrollHeight-el.clientHeight});
   }
   return {outside,clip,scene:{width:r.width,height:r.height},title:matches[0]?.textContent};
  });
  if(audit.outside.length||audit.clip.length)problems.push(s.id+' layout '+JSON.stringify(audit));
  const token=(s.visual?.scene||'visual').replace(/[^a-z]/g,'-');
  const filename=out+'/'+s.id+'.png';
  await stage.screenshot({path:filename});
  typeSeen.add(token);
 }
 await p.setViewportSize({width:390,height:844});
 await p.evaluate(()=>location.hash='#lysbilder');
 await p.locator('.slide-library-card').first().waitFor();
 await p.waitForTimeout(400);
 await p.screenshot({path:out+'/library-mobile.png',fullPage:false});
 assert.ok(typeSeen.size>=10,'Sufficient variety of visual scene families');
 console.log('Rendered '+items.length+' slides across '+typeSeen.size+' layout families and '+Object.keys(stories).length+' decks.');
 if(problems.length)throw Error(problems.slice(0,18).join('\n'));
 console.log('PASS – independent slide previews, visible text bounds, responsive library and JS.');
}finally{await browser.close()}
