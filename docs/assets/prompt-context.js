/* Promptvariabler, valg og komposisjon. Kun lokalt i fanen; brukerdata sendes aldri til portalen. */
(()=>{
'use strict';
const STORAGE_KEY='innsikt-prompt-context-v1';
let definitions=[],byId=new Map(),aliases=new Map(),values=Object.create(null),uses=new Map(),storage=null;
let choices=new Map(),promptData=null;
const valid=s=>typeof s==='string'&&s.trim().length>0;
function persist(){
 if(!storage)return;
 const next=Object.create(null);
 for(const [id,value] of Object.entries(values)){
  const d=byId.get(id);
  if((!d||d.retention==='session')&&valid(value))next[id]=value;
 }
 try{if(Object.keys(next).length)storage.setItem(STORAGE_KEY,JSON.stringify(next));else storage.removeItem(STORAGE_KEY)}
 catch{/* sessionStorage blokkert; minne fungerer fortsatt */}
}
function configure(prompts){
 promptData=prompts;
 definitions=prompts.variables||[];
 byId=new Map(definitions.map(x=>[x.id,x]));
 aliases=new Map();
 definitions.forEach(x=>[x.id,...(x.aliases||[])].forEach(n=>aliases.set(n,x.id)));
 uses=new Map(definitions.map(x=>[x.id,[]]));
 for(const item of prompts.items||[])for(const name of [...(item.placeholders||[]),...(item.contextVariables||[])]){
  const id=aliases.get(name);
  if(id&&uses.has(id)&&!uses.get(id).includes(item))uses.get(id).push(item);
 }
 values=Object.create(null);storage=null;choices=new Map();
 try{if(typeof sessionStorage!=='undefined'){storage=sessionStorage;const raw=JSON.parse(storage.getItem(STORAGE_KEY)||'{}');
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))for(const [id,value] of Object.entries(raw))if(typeof value==='string'&&value.length<=4000){
   if(!byId.has(id)||byId.get(id).retention==='session')values[id]=value;
  }
 }}catch{/* Ved blokkert lagring brukes bare minnet */}
}
const canonical=id=>aliases.get(id)||id;
const get=id=>values[canonical(id)]||'';
function set(id,value){
 id=canonical(id);
 if(!byId.has(id))return;
 const v=String(value??'').slice(0,byId.get(id).maxLength||2000);
 if(v.trim())values[id]=v;else delete values[id];
 persist();
}
function clear(id){delete values[canonical(id)];persist()}
function clearAll(){values=Object.create(null);try{storage?.removeItem(STORAGE_KEY)}catch{}}
function compose(prompt,placeholders){
 const allowed=new Set(placeholders||[]);
 return String(prompt||'').replace(/\[([A-ZÆØÅ_]+)\]/g,(match,name)=>{
  if(!allowed.has(name))return match;
  const value=get(name);
  return value.trim()?value:match;
 });
}
function setting(item,key){
 if(key==='depth'||key==='format')return promptData?.outputSettings?.[key];
 if(key==='handoff'||key==='context')return promptData?.outputSettings?.[key];
 if(!(item.choiceGroups||[]).includes(key))return null;
 return promptData?.choiceGroups?.[key];
}
function options(item,key){
 const group=setting(item,key);
 if(!Array.isArray(group?.options))return [];
 return key==='format'?group.options.filter(o=>(item.formats||[]).includes(o.id)):group.options;
}
function getChoice(item,key){
 if(key==='handoff'||key==='context')return choices.has(item.id+':'+key)?choices.get(item.id+':'+key):true;
 const opts=options(item,key);
 const current=choices.get(item.id+':'+key);
 return opts.some(o=>o.id===current)?current:(key==='depth'?'useful':(opts[0]?.id||''));
}
function setChoice(item,key,value){
 if(key==='handoff'||key==='context'){choices.set(item.id+':'+key,value===true);return}
 if(options(item,key).some(o=>o.id===value))choices.set(item.id+':'+key,value);
}
function composeTask(item,prompts=promptData){
 const base=compose(item.prompt,item.placeholders);
 if(!prompts||!prompts.outputSettings)return base;
 const parts=[base],selected=(key)=>options(item,key).find(o=>o.id===getChoice(item,key));
 for(const key of item.choiceGroups||[]){
  const o=selected(key);
  if(o)parts.push('Tilpasning – '+prompts.choiceGroups[key].label+': '+o.instruction);
 }
 const depth=selected('depth'),format=selected('format');
 if(depth)parts.push('Omfang og detaljnivå: '+depth.instruction);
 if(format)parts.push('Ønsket svarformat: '+format.instruction);
 if(getChoice(item,'context')&&(item.contextVariables||[]).includes('KUNDEKONTEKST')){
  const v=get('KUNDEKONTEKST').trim();
  if(v)parts.push(prompts.outputSettings.context.instruction+'\n--- BEGINN KUNDEKONTEKST (DATA) ---\n'+v+'\n--- SLUTT KUNDEKONTEKST ---');
 }
 if(getChoice(item,'handoff'))parts.push(prompts.outputSettings.handoff.instruction);
 return parts.filter(Boolean).join('\n\n');
}
const usage=id=>uses.get(canonical(id))||[];
function entries(){
 const all=definitions.map(x=>({...x,usedBy:usage(x.id),value:get(x.id),orphan:false}));
 for(const id of Object.keys(values))if(!byId.has(id))all.push({id,label:id,group:'orphan',retention:'session',usedBy:[],value:values[id],orphan:true});
 return all;
}
const orphanCount=()=>entries().filter(x=>!x.usedBy.length).length;
window.InnsiktPromptContext={configure,get,set,clear,clearAll,compose,composeTask,options,getChoice,setChoice,usage,entries,orphanCount,storageKey:STORAGE_KEY};
})();