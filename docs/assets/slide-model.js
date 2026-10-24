/* Ett lysbilde har én ID. Historier eier bare plassering og overgang. */
(()=>{
'use strict';
function lookup(library,id){
 const item=library?.items?.find(x=>x.id===id);
 if(!item)throw Error('Ukjent lysbilde: '+id);
 return item;
}
function usage(library,decks,id){
 return Object.entries(decks||{}).flatMap(([deckId,deck])=>
  (deck.slides||[]).flatMap((entry,index)=>entry.slideId===id?[{deckId,deckLabel:deck.label,index,note:entry.note||''}]:[])
 );
}
function composeNotes(base,placement){
 return [base||'',placement?.note||''].filter(Boolean).join('\n\n');
}
function resolve(library,deck,deckId){
 return (deck?.slides||[]).map(entry=>{
  const slide=lookup(library,entry.slideId);
  if(slide.scope==='story'&&slide.storyId!==deckId)throw Error('Historiespesifikt lysbilde brukt i annen historie: '+slide.id);
  return {...slide,...entry,note:composeNotes(slide.speakerBase,entry)};
 });
}
function tone(slide,deck,mode='story'){
 if(mode==='light'||mode==='strong')return mode;
 if(mode!=='story')throw Error('Ukjent presentasjonsvisning: '+mode);
 return deck?.visualStyle?.beats?.[slide.beat]||deck?.visualStyle?.defaultTone||slide.tone||'strong';
}
window.InnsiktSlides={lookup,usage,resolve,composeNotes,tone};
})();