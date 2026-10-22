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
 if(key==='handoff'||key==='context'||key==='organizationTemplates')return promptData?.outputSettings?.[key];
 if(key==='clientTemplate')return item.cvOutput?.template;
 if(key===item.cvOutput?.lengthGroup)return promptData?.choiceGroups?.[key];
 if(!(item.choiceGroups||[]).includes(key))return null;
 return promptData?.choiceGroups?.[key];
}
function options(item,key){
 const group=setting(item,key);
 if(!Array.isArray(group?.options))return [];
 if(key==='format'){
  const allowed=item.cvOutput?(isCvDraft(item)?item.cvOutput.draftFormats:item.cvOutput.reviewFormats):item.formats||[];
  return group.options.filter(o=>allowed.includes(o.id));
 }
 return group.options;
}
function getChoice(item,key){
 if(key==='handoff'||key==='context'||key==='organizationTemplates'||key==='clientTemplate')return choices.has(item.id+':'+key)?choices.get(item.id+':'+key):key!=='clientTemplate';
 const opts=options(item,key);
 const current=choices.get(item.id+':'+key);
 return opts.some(o=>o.id===current)?current:(key==='depth'?'useful':(opts[0]?.id||''));
}
function setChoice(item,key,value){
 if(key==='handoff'||key==='context'||key==='organizationTemplates'||key==='clientTemplate'){choices.set(item.id+':'+key,value===true);return}
 if(options(item,key).some(o=>o.id===value))choices.set(item.id+':'+key,value);
}
function isCvDraft(item){
 return !!item.cvOutput&&getChoice(item,item.cvOutput.modeGroup)===item.cvOutput.draftValue;
}
function supportsOrganizationTemplates(item,prompts=promptData){
 return !!prompts?.outputSettings?.organizationTemplates?.formats?.includes(getChoice(item,'format'))&&!(isCvDraft(item)&&getChoice(item,'clientTemplate'));
}
function renderTaskInput(item){
 // Editorially controlled optional spans are fully removed when a field is empty.
 // This also removes their labels; the copied prompt never contains an empty placeholder.
 const conditional=/\{\{\?([A-ZÆØÅ][A-ZÆØÅ0-9_]*)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
 const expanded=String(item.prompt||'').replace(conditional,(_,id,block)=>get(id).trim()?block:'');
 return compose(expanded,item.placeholders).replace(/\n[ \t]*\n[ \t]*\n+/g,'\n\n').replace(/[ \t]+\n/g,'\n').trim();
}
function selectedBlocks(item,prompts=promptData){
 if(!prompts?.outputSettings)return [];
 const blocks=[];
 const selected=key=>options(item,key).find(o=>o.id===getChoice(item,key));
 for(const key of item.choiceGroups||[]){
  const o=selected(key),g=prompts.choiceGroups[key];
  if(o&&g)blocks.push({key,label:g.label,option:o.label,instruction:o.instruction,prefix:prompts.outputSettings.groupPrefix+' – '+g.label});
 }
 if(isCvDraft(item)){
  const key=item.cvOutput.lengthGroup,o=selected(key),g=prompts.choiceGroups[key];
  if(o&&g)blocks.push({key,label:g.label,option:o.label,instruction:o.instruction,prefix:prompts.outputSettings.groupPrefix+' – '+g.label});
 }
 for(const key of ['depth','format']){
  const o=selected(key),g=prompts.outputSettings[key];
  if(o&&g)blocks.push({key,label:g.label,option:o.label,instruction:o.instruction,prefix:prompts.outputSettings[key+'Prefix']});
 }
 if(isCvDraft(item)&&getChoice(item,'clientTemplate')){
  const t=item.cvOutput.template;
  blocks.push({key:'clientTemplate',label:t.label,option:t.label,instruction:t.instruction,prefix:t.label});
 }
 const design=prompts.outputSettings.organizationTemplates;
 if(design&&supportsOrganizationTemplates(item,prompts)&&getChoice(item,'organizationTemplates')){
  blocks.push({key:'organizationTemplates',label:design.label,option:design.label,instruction:design.instruction,prefix:design.label});
 }
 return blocks;
}
function composeTask(item,prompts=promptData){
 const base=renderTaskInput(item);
 if(!prompts||!prompts.outputSettings)return base;
 const parts=[base];
 const absent=(item.essentialPlaceholders||[]).filter(id=>!get(id).trim());
 if(absent.length){
  const labels=absent.map(id=>byId.get(canonical(id))?.label||id);
  parts.push(prompts.outputSettings.missingEssentialInstruction.replace('{fields}',labels.join(', ')));
 }
 parts.push(...selectedBlocks(item,prompts).map(b=>b.prefix+': '+b.instruction));
 if(getChoice(item,'context')&&(item.contextVariables||[]).includes('KUNDEKONTEKST')){
  const v=get('KUNDEKONTEKST').trim();
  if(v){
   const c=prompts.outputSettings.context;
   parts.push(c.instruction+'\n'+c.startMarker+'\n'+v+'\n'+c.endMarker);
  }
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
window.InnsiktPromptContext={configure,get,set,clear,clearAll,compose,composeTask,selectedBlocks,isCvDraft,supportsOrganizationTemplates,renderTaskInput,options,getChoice,setChoice,usage,entries,orphanCount,storageKey:STORAGE_KEY};
})();