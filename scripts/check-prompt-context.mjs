import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const data=JSON.parse(fs.readFileSync('docs/data/prompts.json','utf8'));
const compile=item=>item.prompt||item.promptParts.map(part=>{
 if(typeof part==='string')return part;
 const id=part.$content.split(':')[1];
 return data.rules.find(rule=>rule.id===id)?.text||'';
}).join('');
for(const item of data.items)item.prompt=compile(item);
const storage=new Map();
const sessionStorage={
 getItem:k=>storage.get(k)||null,
 setItem:(k,v)=>storage.set(k,v),
 removeItem:k=>storage.delete(k)
};
const sandbox={window:{},sessionStorage};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('docs/assets/prompt-context.js','utf8'),sandbox,{filename:'prompt-context.js'});
const ctx=sandbox.window.InnsiktPromptContext;
ctx.configure(data);
assert.equal(ctx.entries().length,data.variables.length);
assert.equal(ctx.orphanCount(),0,'variabelregisteret skal ikke inneholde døde variabler');
const research=data.items.find(x=>x.id==='account-research');
const prep=data.items.find(x=>x.id==='meeting-prep');
assert.ok(research&&prep);

assert.deepEqual(research.placeholders,['KUNDENAVN','BRANSJE','ANALYSESPØRSMÅL'],'kundeanalyse må være uavhengig av møte');
assert.ok(!research.prompt.includes('[MØTEFORMÅL]'),'kundeanalyse må ikke forutsette møte');
const deck=data.items.find(x=>x.id==='deck-outline');
assert.ok(deck.placeholders.includes('FORMIDLINGSFORMÅL')&&!deck.placeholders.includes('MØTEFORMÅL'),'presentasjon må ha eget formidlingsformål');
const followup=data.items.find(x=>x.id==='followup');
assert.ok(followup.choiceGroups.includes('followupChannel'),'oppfølging må støtte valg av kanal');
ctx.setChoice(followup,'followupChannel','phone');
assert.ok(ctx.composeTask(followup,data).includes('muntlig samtaleåpning'),'telefonoppfølging må ikke bli en e-post');
ctx.setChoice(followup,'followupChannel','email');

assert.ok(followup.placeholders.includes('OPPFØLGINGSGRUNNLAG')&&!followup.placeholders.includes('GODKJENT_OPPSUMMERING'),'oppfølging er bredere enn møtereferat');
const choices=ctx.selectedBlocks(research,data);
assert.equal(choices.find(x=>x.key==='depth').option,'Praktisk','standardnivå skal være tydelig');
assert.equal(choices.find(x=>x.key==='researchFocus').option,'Helhetlig Innsikt-profil');
for(const item of data.items){
 assert.ok(item.category&&data.categories.includes(item.category));
 assert.ok(item.when.length>15&&item.summary.length>25);
 assert.ok(item.review.length>=2,'alle oppgaver skal ha relevante kontrollpunkter');
 for(const block of ctx.selectedBlocks(item,data)){
  assert.ok(ctx.composeTask(item,data).includes(block.instruction),'forhåndsvisning og kopiert instruks må bruke samme tekst');
 }
}

// Valgfrie felter fjerner hele den aktuelle tekstbiten, og ikke bare plassholderen.
for(const item of data.items){
 for(const name of item.placeholders)ctx.clear(name);
 const composed=ctx.composeTask(item,data),base=ctx.renderTaskInput(item);
 assert.ok(!base.includes('{{?')&&!base.includes('{{/'),'betingede markører skal aldri kopieres for '+item.id);
 for(const id of item.placeholders){
  assert.ok(!base.includes('['+id+']'),'tomt felt skal ikke stå som rå plassholder: '+item.id+'/'+id);
 }
 assert.ok(!base.includes('Spesifikke spørsmål eller prioriteringer:'),'tomt analysespørsmål skal utelates');
 if(item.essentialPlaceholders.length)assert.ok(composed.includes('Be kort om den'),'nødvendig, manglende informasjon må etterspørres');
 const id=item.placeholders[0];
 if(id){
  ctx.set(id,'Offentlig eksempelverdi');
  const withOne=ctx.renderTaskInput(item);
  assert.ok(withOne.includes('Offentlig eksempelverdi'),'utfylt felt må være med');
  ctx.clear(id);
 }
}
const baseResearch=ctx.composeTask(research,data);
assert.ok(!baseResearch.includes('ANALYSESPØRSMÅL')&&!baseResearch.includes('bransjekontekst'),'uten ekstra input skal frasen fjernes fullstendig');
ctx.set('KUNDENAVN','Eksempelselskapet AS');
ctx.set('ANALYSESPØRSMÅL','KI-strategi');
assert.ok(ctx.composeTask(research,data).includes('Spesifikke spørsmål eller prioriteringer: KI-strategi'));
ctx.clear('ANALYSESPØRSMÅL');
ctx.clear('KUNDENAVN');
const org=data.outputSettings.organizationTemplates;
assert.deepEqual(org.formats,['slides','word','pdf']);
assert.equal(ctx.supportsOrganizationTemplates(research,data),false,'ren tekst skal ikke ha firmamalvalg');
assert.ok(!ctx.composeTask(research,data).includes(org.instruction),'ingen malinstruks i ren tekst');
ctx.setChoice(research,'format','slides');
assert.equal(ctx.getChoice(research,'organizationTemplates'),true,'firmamaler skal være på som standard ved filformat');
assert.equal(ctx.supportsOrganizationTemplates(research,data),true);
assert.ok(ctx.composeTask(research,data).includes(org.instruction),'tilgjengelige firmamaler etterspørres i filformat');
assert.ok(ctx.selectedBlocks(research,data).some(x=>x.key==='organizationTemplates'),'forhåndsvisning følger kopiert prompt');
ctx.setChoice(research,'organizationTemplates',false);
assert.ok(!ctx.composeTask(research,data).includes(org.instruction),'avhakingen må fjerne instruksjonen helt');
assert.ok(!ctx.selectedBlocks(research,data).some(x=>x.key==='organizationTemplates'),'forhåndsvisning fjerner instruksjonen');
ctx.setChoice(research,'format','markdown');
assert.equal(ctx.supportsOrganizationTemplates(research,data),false);
assert.ok(!ctx.composeTask(research,data).includes(org.instruction),'Markdown skal ikke arve firmamal-instruksjon');
ctx.setChoice(research,'format','word');
assert.equal(ctx.getChoice(research,'organizationTemplates'),false,'bevisst avhaking beholdes ved formatbytte');
ctx.setChoice(research,'organizationTemplates',true);
assert.ok(ctx.composeTask(research,data).includes(org.instruction));
ctx.setChoice(research,'format','plain');
assert.ok(data.items.some(x=>x.id==='contact-prep'),'kontaktforberedelse skal finnes');
const contact=data.items.find(x=>x.id==='contact-prep');
assert.equal(ctx.getChoice(research,'depth'),'useful','arbeidsklart nivå som standard');
assert.equal(ctx.getChoice(contact,'contactSituation'),'first');
assert.ok(ctx.composeTask(research,data).includes('KONTEKST TIL NESTE PROMPT'),'alle prompter skal få valgfri overlevering');
ctx.setChoice(contact,'contactSituation','referral');
ctx.setChoice(contact,'contactChannel','phone');
assert.ok(ctx.composeTask(contact,data).includes('faktisk introduksjon'),'situasjonsvalg må endre prompt');
ctx.setChoice(contact,'contactChannel','email');
assert.ok(ctx.composeTask(contact,data).includes('e-postutkast'),'kanalvalg må endre prompt');
ctx.setChoice(research,'researchFocus','technology');
assert.ok(ctx.composeTask(research,data).includes('Snowflake'),'teknologi og KI-vinkel må bygge inn faglig analyse');
ctx.setChoice(research,'depth','deep');
assert.ok(ctx.composeTask(research,data).includes('grundig, strukturert vurdering'),'svarnivå må være redaksjonelt styrt');
ctx.setChoice(research,'format','slides');
assert.ok(ctx.composeTask(research,data).includes('presentasjonsdisposisjon'),'filformat må påvirke instrukser');
assert.ok(!ctx.options(contact,'format').some(x=>x.id==='slides'),'ikke-relevante formater skal skjules');
ctx.setChoice(contact,'format','slides');
assert.equal(ctx.getChoice(contact,'format'),'plain','ugyldig format skal avvises');
ctx.setChoice(contact,'handoff',false);
assert.ok(!ctx.composeTask(contact,data).includes('KONTEKST TIL NESTE PROMPT'),'ticker skal fjerne overleveringen');
ctx.setChoice(contact,'handoff',true);
ctx.set('KUNDEKONTEKST','Offentlig teknologisignal: <skript> & Snowflake.');
assert.ok(ctx.composeTask(contact,data).includes('Offentlig teknologisignal'),'delt kontekst skal følge relevant oppgave');
assert.ok(ctx.composeTask(research,data).includes('Offentlig teknologisignal'),'delt kontekst skal følge neste prompt');
ctx.setChoice(contact,'context',false);
assert.ok(!ctx.composeTask(contact,data).includes('Offentlig teknologisignal'),'kontekst skal kunne utelates per prompt');
assert.ok(ctx.composeTask(research,data).includes('Offentlig teknologisignal'),'enkeltvalg må ikke endre andre prompter');
const storedSensitive=JSON.parse(storage.get(ctx.storageKey)||'{}');
assert.equal(storedSensitive.KUNDEKONTEKST,undefined,'rik felles kundekontekst må aldri persisteres');

ctx.set('KUNDE','Eksempelbedriften AS');
assert.equal(ctx.get('KUNDENAVN'),'Eksempelbedriften AS','alias deler verdi');
assert.ok(ctx.compose(research.prompt,research.placeholders).includes('Eksempelbedriften AS'));
assert.ok(ctx.compose(prep.prompt,prep.placeholders).includes('Eksempelbedriften AS'));
ctx.set('MØTEFORMÅL','Test $& dollar');
assert.ok(ctx.compose(prep.prompt,prep.placeholders).includes('Test $& dollar'),'variabelverdi må ikke tolkes som regex-erstatning');
ctx.set('BRANSJE','Energi');
assert.equal(JSON.parse(storage.get(ctx.storageKey)).BRANSJE,'Energi');
const testLabel=data.variables.find(x=>x.id==='BRANSJE');
assert.ok(ctx.usage(testLabel.id).length>=2);
ctx.set('KUNDENS_UTSAGN','Anonymisert, potensielt sensitivt');
assert.equal(JSON.parse(storage.get(ctx.storageKey)).KUNDENS_UTSAGN,undefined,'sensitive fritekstverdier må aldri persisteres');
assert.ok(ctx.get('KUNDENS_UTSAGN'));
ctx.configure(data);
assert.equal(ctx.get('KUNDENS_UTSAGN'),'','minnefelt må falle bort ved oppfriskning');
assert.equal(ctx.get('BRANSJE'),'Energi','generisk felt skal overleve oppfriskning');
ctx.clear('KUNDE');
assert.equal(ctx.get('KUNDENAVN'),'');
assert.equal(ctx.get('MØTEFORMÅL'),'Test $& dollar','enkeltreset skal beholde andre felter');
const saved=JSON.parse(storage.get(ctx.storageKey));
saved.FJERNET_VARIABEL='Utdatert';
storage.set(ctx.storageKey,JSON.stringify(saved));
ctx.configure(data);
assert.equal(ctx.orphanCount(),1,'gamle verdier må kunne identifiseres');
assert.equal(ctx.entries().find(x=>x.id==='FJERNET_VARIABEL').orphan,true);
ctx.clear('FJERNET_VARIABEL');
assert.equal(ctx.orphanCount(),0,'gammel verdi må kunne slettes');
ctx.clearAll();
assert.equal(ctx.entries().filter(x=>x.value.trim()).length,0);
assert.equal(storage.has(ctx.storageKey),false,'alle lagrede verdier må slettes');
ctx.set('BRANSJE','<img src=x onerror=alert(1)>');
const output=ctx.compose(research.prompt,research.placeholders);
assert.ok(output.includes('<img'), 'ren komposisjon skal bevare bokstavelig verdi');
const htmlSandbox={window:{InnsiktPromptContext:ctx}};
vm.runInNewContext(fs.readFileSync('docs/assets/prompts.js','utf8'),htmlSandbox,{filename:'prompts.js'});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const html=htmlSandbox.window.InnsiktPrompts.detail({prompts:data},{esc,ico:()=>'',sourceLinks:()=>''},'account-research');
assert.ok(html.includes('&lt;img src=x'), 'redigerbar prompt må escape brukerinnhold i HTML');
assert.ok(!html.includes('<img src=x'), 'brukerinput må ikke injisere HTML');
assert.ok(html.includes('data-context-var="BRANSJE"'));
assert.ok(html.includes('data-prompt-choice="researchFocus"'));
assert.ok(html.includes('data-prompt-toggle="handoff"'));
assert.ok(html.includes('prompt-advanced'),'avansert fulltekst skal være tilgjengelig');
assert.ok(html.includes('id="prompt-preview-lines"'),'levende forhåndsvisning skal vises før fulltekst');
assert.equal((html.match(/data-prompt-copy=/g)||[]).length,1,'kopierknappen finnes bare ved enden av oppgaveflyten');
assert.ok(html.indexOf('prompt-advanced')<html.indexOf('prompt-primary-copy'),'kopier skal ligge etter hele oppgavekonfigurasjonen');
assert.ok(!html.includes('prompt-preview-filled'),'ingen redundant utfyllingsteller');
assert.ok(html.indexOf('prompt-live-panel')<html.indexOf('prompt-main-panel'),'mobil skal vise levende resultat før feltene');
assert.ok(!html.includes('prompt-choice-impact'),'radiovalget skal ikke gjenta forklaringsteksten under knappene');
assert.ok(html.includes('prompt-detail-aside'),'forhåndsvisning og hjelpetekster må dele samme kolonne');
assert.ok(html.includes('prompt-guide-details'),'kvalitetssjekken er tilgjengelig ved behov');
assert.ok(!html.includes(data.page.variableUi.whenTitle),'detaljsiden skal ikke gjenta oppgavens bruksformål');
assert.equal((html.match(/data-preview-key=/g)||[]).length,3,'samlet forklaring viser fagfokus og svarnivå + format uten duplisering av innhold');

console.log('PASS – alias, gjenbruk, lagringsgrenser, oppfriskning, enkelt-/totalreset, orphan-opprydding og HTML-escaping');
