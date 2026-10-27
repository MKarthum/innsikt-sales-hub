import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

const current=process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/';
const previous=process.env.INNSIKT_THEME_BASE_URL||'';
const synthetic=fs.readFileSync('scripts/fixtures/theme-synthetic.css','utf8');
const dir='artifacts/theme';
fs.mkdirSync(dir,{recursive:true});
const pages=['oversikt','om-innsikt','ordliste','guide','forretning','muligheter',
 'kundedialog','marked','kompetanse','arkitektur','teknologi','ai','bransje','verktoy',
 'lysbilder','kilder','utvikling','prompter','horisont','trendradar',
 'forretning/okonomi','muligheter/rapportering','arkitektur/bi','prompter/account-research'];
const viewports=[{name:'desktop',width:1440,height:900},{name:'mobil',width:390,height:844}];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const delay=()=>new Promise(resolve=>setTimeout(resolve,120));
const normalize=async page=>{
 await page.addStyleTag({content:'#version-label,.sidebar-version{visibility:hidden!important}'});
 await page.evaluate(()=>{
  const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walk.nextNode()){
   const n=walk.currentNode;
   if(/0\.18\.\d+/.test(n.textContent))n.textContent=n.textContent.replace(/0\.18\.\d+/g,'0.18.xx');
  }
 });
 await page.evaluate(()=>document.fonts.ready);
};
async function routeTo(page,route){
 await page.evaluate(r=>{location.hash='#'+r},route);
 await page.waitForFunction(r=>location.hash==='#'+r,route);
 await delay();
 await page.evaluate(()=>{document.documentElement.scrollTop=0;window.scrollTo(0,0)});
}
async function pixelDiff(reference,actual,page){
 const result=await page.evaluate(async ([a,b])=>{
  async function pixelData(src){
   const img=new Image();img.src='data:image/png;base64,'+src;await img.decode();
   const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
   const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
   return {width:img.width,height:img.height,data:ctx.getImageData(0,0,img.width,img.height).data};
  }
  const x=await pixelData(a),y=await pixelData(b);
  if(x.width!==y.width||x.height!==y.height)return {reason:'dimensions',x:[x.width,x.height],y:[y.width,y.height]};
  let changed=0,sum=0,total=x.width*x.height;
  for(let i=0;i<x.data.length;i+=4){
   const d=Math.max(Math.abs(x.data[i]-y.data[i]),Math.abs(x.data[i+1]-y.data[i+1]),Math.abs(x.data[i+2]-y.data[i+2]));
   sum+=d;if(d>4)changed++;
  }
  return {changed:changed/total,average:sum/total};
 },[reference.toString('base64'),actual.toString('base64')]);
 return result;
}
async function measureText(page){
 return page.evaluate(()=>{
  const ctx=document.createElement('canvas').getContext('2d',{willReadFrequently:true});
  const cache=new Map();
  function color(c){
   if(cache.has(c))return cache.get(c);
   ctx.clearRect(0,0,1,1);ctx.fillStyle='#000000';ctx.fillStyle=c;ctx.fillRect(0,0,1,1);
   const r=[...ctx.getImageData(0,0,1,1).data];cache.set(c,r);return r;
  }
  function luminance(col){
   const a=col.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
   return a[0]*.2126+a[1]*.7152+a[2]*.0722;
  }
  function contrast(a,b){const [hi,lo]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (hi+.05)/(lo+.05)}
  function bg(el){
   while(el){
    const cs=getComputedStyle(el);
    if(cs.backgroundImage!=='none')return null; // Gradient/image: cannot infer underlying pixel.
    const c=color(cs.backgroundColor);
    if(c[3]===255)return c;
    if(c[3]>0)return null; // Composite transparencies need per-pixel sampling.
    el=el.parentElement;
   }
   return color('#ffffff');
  }
  return [...document.querySelectorAll('body *')].filter(el=>{
   if(el.closest('script,style,svg,option'))return false;
   const cs=getComputedStyle(el);
   return cs.visibility==='visible'&&cs.display!=='none'&&el.getClientRects().length>0
    &&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
  }).map((el,i)=>{
   const cs=getComputedStyle(el),f=color(cs.color),b=bg(el);
   if(!b||f[3]!==255)return null;
   const weight=parseInt(cs.fontWeight)||400,size=parseFloat(cs.fontSize);
   const required=(size>=24||(size>=18.667&&weight>=700))?3:4.5;
   return {i,required,ratio:contrast(f,b),text:el.textContent.trim().slice(0,60),element:el.tagName.toLowerCase()+'.'+String(el.className).slice(0,80),fg:f,bg:b};
  }).filter(Boolean);
 });
}
// Neutralizing tinted shades derived from pure white necessarily changes a small number
// of standard-palette pixels; retain a tight average-channel limit as well as the footprint limit.
const pixelFootprintLimit=.008;
let peakChanged=0,peakAverage=0,pixelComparisons=0;
function trackDiff(diff){if(!diff.reason){peakChanged=Math.max(peakChanged,diff.changed);peakAverage=Math.max(peakAverage,diff.average);pixelComparisons++}}
let routeCount=0,aaCount=0,slides=0;
const violations=[];
try{
 for(const viewport of viewports){
  const ctx=await browser.newContext({viewport:{width:viewport.width,height:viewport.height}});
  const now=await ctx.newPage();
  const old=previous?await ctx.newPage():null;
  await now.goto(current,{waitUntil:'networkidle'});await normalize(now);
  if(old){await old.goto(previous,{waitUntil:'networkidle'});await normalize(old)}
  for(const route of pages){
   await routeTo(now,route);
   if(old)await routeTo(old,route);
   await normalize(now);
   if(old)await normalize(old);
   const name=viewport.name+'-'+route.replaceAll('/','-');
   const shot=await now.screenshot({animations:'disabled'});
   fs.writeFileSync(dir+'/'+name+'.png',shot);
   if(old){
    const reference=await old.screenshot({animations:'disabled'});
    const diff=await pixelDiff(reference,shot,now);
    trackDiff(diff);
    assert.ok(!diff.reason&&diff.changed<=pixelFootprintLimit&&diff.average<=.35,
     name+' visual regression '+JSON.stringify(diff));
   }
   const defaultContrast=await measureText(now);
   const style=await now.addStyleTag({content:synthetic});
   const changedContrast=await measureText(now);
   assert.equal(defaultContrast.length,changedContrast.length,name+' text sample count changed');
   for(let i=0;i<defaultContrast.length;i++){
    const before=defaultContrast[i],after=changedContrast[i];
    if(before.ratio>=before.required+.01){
     aaCount++;
     if(after.ratio<after.required-.005)violations.push({route:name,text:before.text,element:before.element,fg:before.fg,bg:before.bg,afterFg:after.fg,afterBg:after.bg,before:before.ratio.toFixed(2),after:after.ratio.toFixed(2)});
    }
   }
   if(route==='oversikt'||route==='arkitektur'||route==='lysbilder')
    await now.screenshot({path:dir+'/'+name+'-synthetic.png',animations:'disabled'});
   await style.evaluate(el=>el.remove());
   routeCount++;
  }
  for(const tone of ['light','strong']){
   await now.locator('#present-button').click();
   await now.locator('#present-tone-mode').selectOption(tone);
   if(old){
    await old.locator('#present-button').click();
    await old.locator('#present-tone-mode').selectOption(tone);
   }
   const shot=await now.locator('#slide-body').screenshot({animations:'disabled'});
   fs.writeFileSync(dir+'/'+viewport.name+'-presenter-'+tone+'.png',shot);
   if(old){
    const reference=await old.locator('#slide-body').screenshot({animations:'disabled'});
    const diff=await pixelDiff(reference,shot,now);
    trackDiff(diff);
    assert.ok(!diff.reason&&diff.changed<=pixelFootprintLimit&&diff.average<=.35,
     viewport.name+' presenter '+tone+' visual regression '+JSON.stringify(diff));
   }
   const style=await now.addStyleTag({content:synthetic});
   await now.locator('#slide-body').screenshot({path:dir+'/'+viewport.name+'-presenter-'+tone+'-synthetic.png'});
   await style.evaluate(el=>el.remove());
   await now.keyboard.press('Escape');
   if(old)await old.keyboard.press('Escape');
   slides++;
  }
  await ctx.close();
 }
 if(previous)assert.equal(pixelComparisons,viewports.length*(pages.length+2),'Missing prior-release pixel comparisons');
 assert.ok(aaCount>=200,'Too few WCAG text samples: '+aaCount);
 assert.deepEqual(violations.slice(0,50),[],violations.length+' WCAG AA regressions (first 50 shown)');
 console.log('PASS – '+routeCount+' mobile/desktop route screenshots; '+slides+' Presenter tone screenshots; '+aaCount+' WCAG AA text pairs; '+(previous?('pixel comparison '+pixelComparisons+' views, max changed '+(peakChanged*100).toFixed(3)+'%, max avg channel delta '+peakAverage.toFixed(4)+'/255'):'prior-version pixel comparison not configured'));
}finally{await browser.close()}

