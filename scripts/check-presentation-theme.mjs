/* Standardprofilen skal ikke produsere lys tekst på lys flate. */
import fs from 'node:fs';
const css=fs.readFileSync('docs/assets/site.css','utf8');
const root=css.match(/:root\s*\{([^}]*)\}/)?.[1]||'';
const tokens=new Map([...root.matchAll(/(--[a-z0-9-]+):([^;}]*)/g)].map(([,k,v])=>[k,v.trim()]));
function resolve(name,seen=new Set()){
 if(seen.has(name))throw Error('Sirkel i temavariabel '+name);
 const s=tokens.get(name);if(!s)throw Error('Mangler temavariabel '+name);
 const ref=s.match(/^var\((--[a-z0-9-]+)\)$/);
 return ref?resolve(ref[1],new Set([...seen,name])):s;
}
function rgb(hex){
 if(!/^#[0-9a-f]{6}$/i.test(hex))throw Error('Forventet statisk standardfarge, fikk '+hex);
 return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
}
function luminance(color){
 const comps=rgb(color).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);
 return comps[0]*0.2126+comps[1]*0.7152+comps[2]*0.0722;
}
function contrast(a,b){const [l1,l2]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (l1+0.05)/(l2+0.05)}
for(const tone of ['strong','light']){
 const bg=resolve('--slide-'+tone+'-bg');
 for(const role of ['fg','muted','accent','warning']){
  const fg=resolve('--slide-'+tone+'-'+role),ratio=contrast(bg,fg);
  if(ratio<4.5)throw Error('Uleselig '+tone+'/'+role+' mot '+bg+': '+ratio.toFixed(2)+':1');
 }
}
console.log('PASS – lysbildenes åtte kontrastpar oppfyller minst 4,5:1 i standardtema');
