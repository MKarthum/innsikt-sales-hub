import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const url=process.env.INNSIKT_BASE_URL||'http://127.0.0.1:8769/docs/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 let privateFetch=0;
 await page.route('**/internal/**',route=>{privateFetch++;return route.abort()});
 await page.goto(url,{waitUntil:'networkidle'});
 await page.locator('#present-button').click();
 await page.locator('#present-tone-mode').waitFor();
 assert.equal(await page.locator('#present-tone-mode').inputValue(),'light','Unified default is light');
 assert.equal(await page.locator('#slide-body').getAttribute('data-tone'),'light','First slide is light');
 await page.locator('#present-tone-mode').selectOption('story');
 assert.equal(await page.locator('#present-tone-mode').inputValue(),'story','Story mode is explicit opt-in');
 assert.equal(await page.locator('#slide-body').getAttribute('data-tone'),'strong');
 for(let i=0;i<2;i++)await page.locator('#slide-next').click();
 assert.equal(await page.locator('#slide-body').getAttribute('data-tone'),'light','First narrative beat change');
 for(let i=0;i<5;i++)await page.locator('#slide-next').click();
 assert.equal(await page.locator('#slide-body').getAttribute('data-tone'),'strong','Return to conclusion');
 await page.locator('#present-tone-mode').selectOption('light');
 assert.equal(await page.locator('#slide-body').getAttribute('data-tone'),'light','Light everywhere');
 await page.locator('[data-deck="portal"]').click();
 assert.equal(await page.locator('#present-tone-mode').inputValue(),'light','Palette preserved across stories');
 assert.equal(await page.locator('#slide-body').getAttribute('data-tone'),'light');
 await page.locator('#present-tone-mode').selectOption('strong');
 assert.equal(await page.locator('#slide-body').getAttribute('data-tone'),'strong','Dark everywhere');
 await page.evaluate(()=>{window.__themeExport=null;window.InnsiktPresenterExport.exportDeck=async (args,mode)=>{window.__themeExport={args,mode}};});
 await page.locator('#deck-download').click();
 await page.waitForFunction(()=>window.__themeExport!==null);
 const out=await page.evaluate(()=>window.__themeExport);
 assert.ok(out.args.tones.every(x=>x==='strong'),'Download uses same palette as presentation');
 assert.equal(out.args.classification,'public');
 await page.locator('#present-tone-mode').selectOption('story');
 await page.locator('[data-deck="innsikt"]').click();
 assert.equal(await page.locator('#slide-body').getAttribute('data-tone'),'strong');
 assert.equal(privateFetch,0,'Public mode never requests private content');
 await page.keyboard.press('Escape');
 // Simulate an authorized internal deployment; no private content is committed to this repository.
 const privatePage=await browser.newPage({viewport:{width:1280,height:800}});
 const fakeSlide={id:'test-private-slide',classification:'internal',scope:'story',storyId:'test-private-story',
  tone:'light',type:'visual',cue:'BARE I BESKYTTET TEST',title:'Fiktiv intern demonstrasjon',
  topic:'Kundedialog',visual:{scene:'impact',kicker:'PRØVE',support:'Ingen ekte kundeinformasjon'},
  speakerBase:'Dette er oppdiktet testinnhold.',sourceIds:[]};
 const fakeStory={classification:'internal',label:'Internt testløp',intro:'Fiktivt eksempel for verifikasjon',
  visualStyle:{defaultTone:'light',beats:{possibility:'light'}},slides:[{slideId:fakeSlide.id,beat:'possibility',delivery:'tell',note:'Kontekst i testen'}],
  narrative:{beats:[{id:'possibility',function:'Test'}],story:'Simulert internt testløp'}};
 let internalRequests=0;
 await privatePage.route('**/data/deployment.json',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mode:'internal',protectedPresentationContent:'/internal/innsikt-content.json'})}));
 await privatePage.route('**/internal/innsikt-content.json',route=>{internalRequests++;return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  schemaVersion:1,classification:'internal',slides:[fakeSlide],presentationDecks:{'test-private-story':fakeStory},customerStories:[],solutions:[]
 })})});
 await privatePage.goto(url,{waitUntil:'networkidle'});
 assert.equal(internalRequests,1,'Only the protected endpoint is requested once');
 await privatePage.evaluate(()=>location.hash='#lysbilder');
 await privatePage.locator('.slide-library-card[href="#lysbilder/test-private-slide"]').waitFor();
 await privatePage.locator('#present-button').click();
 await privatePage.locator('[data-deck="test-private-story"]').click();
 assert.equal(await privatePage.locator('#slide-body').getAttribute('data-tone'),'light');
 assert.ok((await privatePage.locator('#deck-context').innerText()).includes('INTERNT'));
 await privatePage.evaluate(()=>{window.__exported=false;window.confirm=()=>false;window.InnsiktPresenterExport.exportDeck=async()=>{window.__exported=true}});
 await privatePage.locator('#deck-download').click();
 assert.equal(await privatePage.evaluate(()=>window.__exported),false,'Private export requires confirmation');
 await privatePage.evaluate(()=>window.confirm=()=>true);
 await privatePage.locator('#deck-download').click();
 assert.equal(await privatePage.evaluate(()=>window.__exported),true,'Confirmed export allowed');
 await privatePage.close();
 // A protected deployment with denied content must not silently show the public portal as an internal site.
 const deniedPage=await browser.newPage();
 await deniedPage.route('**/data/deployment.json',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mode:'internal',protectedPresentationContent:'/internal/innsikt-content.json'})}));
 await deniedPage.route('**/internal/innsikt-content.json',route=>route.fulfill({status:403,body:'Forbidden'}));
 await deniedPage.goto(url,{waitUntil:'networkidle'});
 await deniedPage.locator('#main h1').waitFor();
 assert.ok((await deniedPage.locator('#main h1').innerText()).includes('Kunne ikke laste'));
 console.log('PASS – theme/story palette, export parity, protected content loading, private export confirmation and fail-closed denial');
}finally{await browser.close()}
