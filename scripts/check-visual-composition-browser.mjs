import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync('artifacts/visual-pilot',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 await page.goto(process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/',{waitUntil:'networkidle'});
 await page.evaluate(()=>{location.hash='#lysbilder/portal-three-ways'});
 await page.locator('.slide-library-detail-stage .scene-modular-v1').waitFor();
 const layouts=[],positions=[];
 for(const mode of ['standard','rich','rich-image']){
  await page.locator('#library-art-mode').selectOption(mode);
  const scene=page.locator('.slide-library-detail-stage .scene-modular-v1');
  layouts.push(await scene.getAttribute('data-composition'));
  await scene.screenshot({path:'artifacts/visual-pilot/modular-v1-'+mode+'.png'});
  positions.push(await scene.locator('.mc-nodes [data-node-id]').evaluateAll(nodes=>nodes.map(n=>n.querySelector('rect.mc-card-surface')?.getAttribute('x')+':'+n.querySelector('rect.mc-card-surface')?.getAttribute('y'))));
  for(const name of ['Jeg skal i kundemøte','Jeg har fanget opp et behov','Jeg vil forstå et fagtema'])assert.ok((await scene.textContent()).includes(name));
 }
 assert.deepEqual(layouts,['columns','stagger','orbit']);
 assert.notDeepEqual(positions[0],positions[1]);
 assert.notDeepEqual(positions[1],positions[2]);
 console.log('PASS – modulær slide i bibliotek med tre faktisk ulike komposisjoner');
}finally{await browser.close()}
