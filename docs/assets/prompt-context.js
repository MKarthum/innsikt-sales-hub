/* Promptvariabler – felles tilstand. Bare offentlig/generisk informasjon i sessionStorage. */
(()=>{
'use strict';
const STORAGE_KEY='innsikt-prompt-context-v1';
let definitions=[], byId=new Map(), aliases=new Map(), values=Object.create(null), uses=new Map(), storage=null;
const valid=s=>typeof s==='string'&&s.trim().length>0;
function persist(){
 if(!storage)return;
 const next=Object.create(null);
 for(const [id,value] of Object.entries(values)){
  const d=byId.get(id);
  if((!d||d.retention==='session')&&valid(value))next[id]=value;
 }
 try{if(Object.keys(next).length)storage.setItem(STORAGE_KEY,JSON.stringify(next));else storage.removeItem(STORAGE_KEY)}
 catch{/* sessionStorage kan være blokkert; minnet fungerer fortsatt. */}
}
function configure(prompts){
 definitions=prompts.variables||[];
 byId=new Map(definitions.map(x=>[x.id,x]));
 aliases=new Map();
 definitions.forEach(x=>[x.id,...(x.aliases||[])].forEach(n=>aliases.set(n,x.id)));
 uses=new Map(definitions.map(x=>[x.id,[]]));
 for(const item of prompts.items||[])for(const name of item.placeholders||[]){
  const id=aliases.get(name);
  if(id&&uses.has(id)&&!uses.get(id).includes(item))uses.get(id).push(item);
 }
 values=Object.create(null);storage=null;
 try{if(typeof sessionStorage!=='undefined'){storage=sessionStorage;const raw=JSON.parse(storage.getItem(STORAGE_KEY)||'{}');
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))for(const [id,value] of Object.entries(raw))if(typeof value==='string'&&value.length<=4000){
   if(!byId.has(id)||byId.get(id).retention==='session')values[id]=value;
  }
 }}catch{/* Ved blokkert lagring brukes bare minnet. */}
}
function canonical(id){return aliases.get(id)||id}
function get(id){return values[canonical(id)]||''}
function set(id,value){
 id=canonical(id);
 if(!byId.has(id))return;
 const max=byId.get(id).maxLength||2000;
 const v=String(value??'').slice(0,max);
 if(v.trim())values[id]=v;else delete values[id];
 persist();
}
function clear(id){id=canonical(id);delete values[id];persist()}
function clearAll(){values=Object.create(null);try{storage?.removeItem(STORAGE_KEY)}catch{}}
function compose(prompt,placeholders){
 const allowed=new Set(placeholders||[]);
 return String(prompt||'').replace(/\[([A-ZÆØÅ_]+)\]/g,(match,name)=>{
  if(!allowed.has(name))return match;
  const value=get(name);
  return value.trim()?value:match;
 });
}
function usage(id){return uses.get(canonical(id))||[]}
function entries(){
 const all=definitions.map(x=>({...x,usedBy:usage(x.id),value:get(x.id),orphan:false}));
 for(const id of Object.keys(values))if(!byId.has(id))all.push({id,label:id,group:'orphan',retention:'session',usedBy:[],value:values[id],orphan:true});
 return all;
}
function orphanCount(){return entries().filter(x=>!x.usedBy.length).length}
window.InnsiktPromptContext={configure,get,set,clear,clearAll,compose,usage,entries,orphanCount,storageKey:STORAGE_KEY};
})();
