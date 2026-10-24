import fs from 'node:fs';
import vm from 'node:vm';
const read=n=>JSON.parse(fs.readFileSync('docs/data/'+n+'.json','utf8'));
const {presentationDecks}=read('pages'),library=read('slides'),sources=read('sources');
const box={window:{}};vm.runInNewContext(fs.readFileSync('docs/assets/slide-model.js','utf8'),box);
const model=box.window.InnsiktSlides,seen=new Set();
for(const s of library.items){
 if(seen.has(s.id))throw Error('Duplisert lysbilde-ID '+s.id);
 seen.add(s.id);
 if(s.sourceIds?.some(id=>!sources[id]))throw Error('Ukjent kilde på '+s.id);
 const used=model.usage(library,presentationDecks,s.id);
 if(s.scope==='story'&&used.some(x=>x.deckId!==s.storyId))throw Error('Historiespesifikt lysbilde delt utilsiktet '+s.id);
}
for(const [id,deck] of Object.entries(presentationDecks)){
 const resolved=model.resolve(library,deck,id);
 if(resolved.length!==deck.slides.length)throw Error('Ugyldig historielengde '+id);
 resolved.forEach((s,i)=>{if(!s.note?.includes(deck.slides[i].note))throw Error('Notat mistet ved oppløsning '+s.id)});
}
if(model.composeNotes('Faglig forklaring',{note:'Overgang'})!=='Faglig forklaring\\n\\nOvergang'.replaceAll('\\n','\n'))throw Error('Notatkomposisjon feiler');
console.log('PASS – lysbilder, eierskap, historiekoblinger og notater validert');
