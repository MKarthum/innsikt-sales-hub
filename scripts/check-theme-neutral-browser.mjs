import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const base = process.env.INNSIKT_BASE_URL || 'http://127.0.0.1:8769/docs/';
const css = fs.readFileSync('scripts/fixtures/theme-neutral.css', 'utf8');
const publicRoles = ['ink','muted','faint','paper','surface','surface-alt','border','navy','navy2',
 'accent','accent-soft','blue','ok','warn','on-dark','on-accent','focus',
 ...['strong','light'].flatMap(t=>['bg','fg','muted','accent','warning'].map(p=>`slide-${t}-${p}`))];
const overrides = [...css.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)];
assert.deepEqual(overrides.map(m=>m[1]).sort(), publicRoles.map(n=>`--${n}`).sort(), 'Fixture must override exactly the 27 public roles');
for(const [,role,value] of overrides) assert.ok(value.slice(1,3).toLowerCase()===value.slice(3,5).toLowerCase()
 && value.slice(3,5).toLowerCase()===value.slice(5,7).toLowerCase(), `${role} must be neutral`);

const routes = ['oversikt','om-innsikt','ordliste','guide','forretning','muligheter','kundedialog',
 'marked','kompetanse','arkitektur','teknologi','ai','bransje','verktoy','lysbilder','kilder',
 'utvikling','prompter','horisont','trendradar','forretning/okonomi','muligheter/rapportering',
 'arkitektur/bi','prompter/account-research'];
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const limit = 16;
let samples = 0;
let checked = 0;
async function assertNeutral(page, label) {
 const scan = await page.evaluate(limit => {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d',{willReadFrequently:true});
  const memo = new Map(); const failures = [];
  const properties = ['color','backgroundColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor'];
  let samples = 0;
  function rgba(raw) {
   if(memo.has(raw)) return memo.get(raw);
   ctx.clearRect(0,0,1,1);ctx.fillStyle = '#000000';ctx.fillStyle = raw;ctx.fillRect(0,0,1,1);
   const v = [...ctx.getImageData(0,0,1,1).data]; memo.set(raw,v);return v;
  }
  for (const el of document.querySelectorAll('body *')) {
   if(el.closest('script,style,svg'))continue;
   const computed = getComputedStyle(el);
   if(computed.display==='none'||computed.visibility!=='visible'||!el.getClientRects().length)continue;
   for(const property of properties){
    const raw=computed[property]; if(!raw)continue;
    const v=rgba(raw); if(v[3]===0)continue;
    samples++;
    const chroma=Math.max(v[0],v[1],v[2])-Math.min(v[0],v[1],v[2]);
    if(chroma>limit&&failures.length<20)failures.push({selector:el.tagName.toLowerCase()+'.'+String(el.className).slice(0,70),property,color:raw,chroma});
   }
  }
  return {samples,failures};
 },limit);
 samples+=scan.samples;checked++;
 assert.deepEqual(scan.failures,[],`${label}: colors diverge from neutral by over ${limit}/255`);
}
try {
 for(const viewport of [{width:1440,height:900,name:'desktop'},{width:390,height:844,name:'mobil'}]) {
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height}});
  const page=await context.newPage();
  page.on('crash',()=>console.error('CHROMIUM PAGE CRASH',viewport.name));
  page.on('close',()=>{if(process.env.DEBUG_THEME)console.error('PAGE CLOSED',viewport.name)});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.addStyleTag({content:css});
  for(const route of routes){
   if(process.env.DEBUG_THEME) console.log('SCANNING',viewport.name,route);
   await page.evaluate(r=>{location.hash='#'+r},route);
   await page.waitForTimeout(140);
   await assertNeutral(page,viewport.name+'-'+route);
  }
  // Presenter controls are not necessarily visible on every detail route.
  await page.evaluate(()=>{location.hash='#oversikt'});
  await page.waitForTimeout(140);
  await page.locator('#present-button').click();
  for(const tone of ['light','strong']){
   await page.locator('#present-tone-mode').selectOption(tone);
   await assertNeutral(page,viewport.name+'-presenter-'+tone);
  }
  await context.close();
 }
 assert.ok(samples>10000,`Too few computed color samples: ${samples}`);
 console.log(`PASS – neutral palette: ${checked} route/Presenter views, ${samples} computed text/background/border colors, chroma <= ${limit}/255`);
} finally { await browser.close(); }
