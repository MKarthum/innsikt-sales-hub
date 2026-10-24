import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=n=>JSON.parse(fs.readFileSync('docs/data/'+n+'.json','utf8'));
const context={window:{}};vm.runInNewContext(fs.readFileSync('docs/assets/slide-model.js','utf8'),context);
vm.runInNewContext(fs.readFileSync('docs/assets/presentation-content.js','utf8'),context);
const model=context.window.InnsiktSlides,packageApi=context.window.InnsiktPresentationContent;
const pages=read('pages'),library=read('slides'),sources=read('sources');
const base={pages,slides:library,sources};
const deployment=read('deployment');
assert.equal(packageApi.checkDeployment(deployment),null,'Public deployment has no private endpoint');
let requests=0;
assert.equal(await packageApi.load(deployment,async()=>{requests++;throw Error('Unexpected private fetch')}),null);
assert.equal(requests,0,'Public website never fetches private content');
const permitted='/internal/innsikt-content.json',internalConfig={mode:'internal',protectedPresentationContent:permitted};
assert.equal(packageApi.checkDeployment(internalConfig),permitted);
assert.throws(()=>packageApi.checkDeployment({mode:'public',protectedPresentationContent:permitted}));
assert.throws(()=>packageApi.checkDeployment({mode:'internal',protectedPresentationContent:'https://remote.example.net/content.json'}));
assert.throws(()=>packageApi.checkDeployment({mode:'internal',protectedPresentationContent:'/internal/../data/secrets.json'}));
await assert.rejects(packageApi.load(internalConfig,async()=>({ok:false,status:403})),/403/);
const sampleSlide={id:'internal-case-example',classification:'internal',scope:'story',storyId:'internal-deck-example',tone:'strong',
 type:'visual',cue:'INTERNT EKSEMPEL',title:'Eksempel uten virkelige kundedata',topic:'Kundedialog',keywords:[],speakerBase:'Kun testtekst',sourceIds:['internal-source-example'],
 visual:{scene:'impact',kicker:'EKSEMPEL',support:'Innhold tilføres kun fra beskyttet distribusjon'}};
const sampleDeck={...pages.presentationDecks['innsikt-kort'],classification:'internal',slides:[
 {slideId:'ai-thousand-analysts',beat:'possibility',delivery:'tell',note:'En delt, offentlig slide'},
 {slideId:'internal-case-example',beat:'tension',delivery:'tell',note:'Intern slide og egen kontekst'}
 ]};
const packageData={schemaVersion:1,classification:'internal',
 slides:[sampleSlide],presentationDecks:{'internal-deck-example':sampleDeck},
 sources:{'internal-source-example':{url:'https://example.org/internal-reference',publisher:'Fiktiv kilde'}},
 customerStories:[{id:'internal-story-example',title:'Ikke en ekte kundehistorie',classification:'internal',sourceIds:['internal-source-example']}],
 solutions:[{id:'internal-solution-example',title:'Ikke en ekte intern løsning',classification:'internal'}]};
const content=await packageApi.load(internalConfig,async (url,options)=>{
 requests++;assert.equal(url,permitted);assert.equal(options.credentials,'same-origin');assert.equal(options.cache,'no-store');
 return {ok:true,json:async()=>packageData};
});
const combined=packageApi.combine(base,content);
assert.equal(combined.pages.presentationDecks['internal-deck-example'].classification,'internal');
assert.equal(combined.slides.items.length,library.items.length+1);
assert.equal(combined.internalCollections.customerStories.length,1);
assert.equal(combined.internalCollections.solutions.length,1);
assert.equal(base.slides.items.length,library.items.length,'Public original unchanged');
const materialized=model.resolve(combined.slides,combined.pages.presentationDecks['internal-deck-example'],'internal-deck-example');
assert.equal(materialized[1].id,'internal-case-example');
assert.equal(model.tone(materialized[0],combined.pages.presentationDecks['internal-deck-example'],'light'),'light');
assert.throws(()=>packageApi.combine(base,{...packageData,slides:[{...sampleSlide,id:library.items[0].id}]}),/Duplisert/);
assert.throws(()=>packageApi.combine(base,{...packageData,slides:[{...sampleSlide,sourceIds:['no-such-source']}]}),/Ukjent kilde/);
assert.throws(()=>packageApi.combine(base,{...packageData,presentationDecks:{'internal-deck-example':{...sampleDeck,slides:[{slideId:'portal-opening'}]}}}),/Eierkonflikt/);
assert.throws(()=>packageApi.combine(base,{...packageData,sources:{'internal-source-example':{url:'javascript:alert(1)'}}}),/HTTPS/);
for(const [id,deck] of Object.entries(pages.presentationDecks)){
 const entries=model.resolve(library,deck,id);
 for(const mode of ['story','light','strong']){
  const values=entries.map(s=>model.tone(s,deck,mode));
  assert.ok(values.every(x=>x==='light'||x==='strong'),id+'/'+mode);
  if(mode==='light'||mode==='strong')assert.ok(values.every(x=>x===mode),id+'/'+mode);
 }
 const beats=entries.map((s,i)=>s.beat);
 for(let i=1;i<entries.length;i++)if(beats[i]===beats[i-1])assert.equal(model.tone(entries[i],deck,'story'),model.tone(entries[i-1],deck,'story'),
  'No random tone change inside one narrative beat: '+id+'/'+i);
}
assert.equal(model.tone(model.resolve(library,pages.presentationDecks.innsikt,'innsikt')[0],pages.presentationDecks.innsikt,'story'),'strong');
assert.equal(model.tone(model.resolve(library,pages.presentationDecks.innsikt,'innsikt')[2],pages.presentationDecks.innsikt,'story'),'light');
assert.equal(model.tone(model.resolve(library,pages.presentationDecks.innsikt,'innsikt')[7],pages.presentationDecks.innsikt,'story'),'strong');
console.log('PASS – offentlig miljø laster ikke privat innhold; internt API er låst til same-origin /internal; gjenbruk, eierregler og kapittelstyrt palett');