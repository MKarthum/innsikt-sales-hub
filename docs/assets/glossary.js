/* Kontekstuelle begrepsforklaringer. Fagtekst eies av learning.json.glossary. */
(()=>{
'use strict';
const excluded='a,button,input,textarea,select,option,[contenteditable],.glossary,.horizon-concept,.horizon-lenses,.prompt-detail-layout,[data-no-glossary],.glossary-popover';
const blocks='p,li,.lesson-chapter h3,.horizon-chapter h3,.detail-banner h1,.diagram-step strong';
let entries=[],definitions=new Map(),popup=null,anchor=null,ready=false;
const escapeRegExp=s=>s.replace(/[.*+?^\x24{}()|[\]\\]/g,'\\$&');
function init(glossary){
 definitions=new Map(glossary.filter(g=>g.inline?.enabled===true).map(g=>[g.id,g]));
 entries=glossary.filter(g=>g.inline?.enabled===true).flatMap(g=>
  (g.inline.aliases||[g.term]).map(word=>({
   id:g.id,word,
   pattern:new RegExp('(^|[^\\p{L}\\p{N}])('+escapeRegExp(word)+')(?=$|[^\\p{L}\\p{N}])',g.inline.caseSensitive?'u':'iu')
  }))
 ).sort((a,b)=>b.word.length-a.word.length);
 if(ready)return;ready=true;
 document.addEventListener('click',event=>{
  const trigger=event.target.closest?.('[data-glossary-id]');
  if(trigger){event.preventDefault();trigger===anchor?close(true):open(trigger);return;}
  if(popup&&!popup.contains(event.target))close(false);
 });
 document.addEventListener('keydown',event=>{
  if(popup&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close(true);}
 },true);
 document.addEventListener('focusin',event=>{
  if(popup&&event.target!==anchor&&!popup.contains(event.target))close(false);
 });
 window.addEventListener('resize',place);
 window.addEventListener('scroll',place,true);
}
function enhance(root){
 if(!root||!entries.length)return;close(false);
 for(const block of root.querySelectorAll(blocks)){
  if(block.closest(excluded))continue;
  const walker=document.createTreeWalker(block,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  const used=new Set();let count=0;
  for(const node of nodes){
   if(count>=2)break;
   if(!node.nodeValue.trim()||node.parentElement.closest(excluded))continue;
   const source=node.nodeValue,fragment=document.createDocumentFragment();let start=0,changed=false;
   while(start<source.length&&count<2){
    let best=null;
    for(const entry of entries){
     if(used.has(entry.id))continue;
     const match=entry.pattern.exec(source.slice(start));
     if(!match)continue;
     const at=start+match.index+match[1].length,len=match[2].length;
     if(!best||at<best.at||(at===best.at&&len>best.len))best={at,len,id:entry.id};
    }
    if(!best)break;
    fragment.appendChild(document.createTextNode(source.slice(start,best.at)));
    const button=document.createElement('button');
    button.type='button';button.className='glossary-trigger';button.dataset.glossaryId=best.id;
    button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','innsikt-glossary-popover');
    button.setAttribute('aria-expanded','false');
    const original=source.slice(best.at,best.at+best.len);
    button.setAttribute('aria-label',original+', vis forklaring');button.textContent=original;
    fragment.appendChild(button);
    start=best.at+best.len;used.add(best.id);count++;changed=true;
   }
   if(changed){fragment.appendChild(document.createTextNode(source.slice(start)));node.replaceWith(fragment);}
  }
 }
}
function close(restore=false){
 if(!popup)return;
 const old=anchor;popup.remove();popup=null;anchor=null;
 old?.setAttribute('aria-expanded','false');
 if(restore&&old?.isConnected)old.focus({preventScroll:true});
}
function place(){
 if(!popup||!anchor?.isConnected)return;
 const r=anchor.getBoundingClientRect(),gap=9,margin=12,w=popup.offsetWidth,h=popup.offsetHeight;
 const x=Math.max(margin,Math.min(r.left,innerWidth-w-margin));
 let y=r.bottom+gap;if(y+h>innerHeight-margin)y=r.top-h-gap;
 y=Math.max(margin,Math.min(y,innerHeight-h-margin));
 popup.style.left=x+'px';popup.style.top=y+'px';
}
function open(button){
 const record=definitions.get(button.dataset.glossaryId);if(!record)return;
 close(false);
 const box=document.createElement('section');box.id='innsikt-glossary-popover';box.className='glossary-popover';
 box.setAttribute('role','dialog');box.setAttribute('aria-modal','false');
 box.setAttribute('aria-label',record.term);box.tabIndex=-1;
 const head=document.createElement('div');head.className='glossary-popover-head';
 const name=document.createElement('strong');name.textContent=record.term;
 const x=document.createElement('button');x.type='button';x.className='glossary-popover-close';
 x.textContent='×';x.setAttribute('aria-label','Lukk forklaring');x.addEventListener('click',()=>close(true));
 head.append(name,x);box.append(head);
 const p=document.createElement('p');p.textContent=record.inline.short||record.meaning;box.append(p);
 if(record.example){
  const example=document.createElement('p');example.className='glossary-popover-example';
  const label=document.createElement('strong');label.textContent='Eksempel: ';
  example.append(label,document.createTextNode(record.example));box.append(example);
 }
 document.body.append(box);popup=box;anchor=button;button.setAttribute('aria-expanded','true');
 place();box.focus({preventScroll:true});
}
window.InnsiktGlossary={init,enhance,close};
})();
