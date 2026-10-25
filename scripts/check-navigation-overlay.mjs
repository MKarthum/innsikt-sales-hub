import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const load=n=>JSON.parse(fs.readFileSync('docs/data/'+n+'.json','utf8'));
const base={pages:load('pages'),slides:load('slides'),sources:load('sources')};
const context={window:{}};
vm.runInNewContext(fs.readFileSync('docs/assets/presentation-content.js','utf8'),context);
const api=context.window.InnsiktPresentationContent;
const entry={id:'org-case-001',title:'Demohistorie, ikke ekte kunde',summary:'Kun et syntetisk eksempel',body:'Dette er privat testinnhold.',classification:'internal'};
const tool={id:'org-tool-001',title:'Internt simuleringsverktøy',summary:'Følg godkjent intern lenke',href:'/internal/tools/example',classification:'internal'};
const navigation={
 groups:[{id:'organization',label:'ORGANISASJON',collapsible:true}],
 views:[{id:'customer-reference',label:'Kundehistorier',collection:'customerStories',groupId:'organization'},
        {id:'internal-tools',label:'Interne verktøy',collection:'tools',groupId:'organization'}]
};
const sample={schemaVersion:2,classification:'internal',
 customerStories:[entry],solutions:[],tools:[tool],collections:{'internal-methods':[
  {id:'org-method-001',title:'Arbeidsmetode',classification:'internal',body:'Egen lokal arbeidsmetode'}
 ]},
 navigation
};
const merged=api.combine(base,sample);
assert.equal(merged.internalNavigation.items.length,2);
assert.equal(merged.internalCollections.tools[0].id,'org-tool-001');
assert.equal(merged.internalCollections['internal-methods'][0].id,'org-method-001');
assert.ok(merged.pages!==base.pages);
assert.deepEqual(merged.pages.navigationSections,base.pages.navigationSections);
assert.equal(merged.pages.navigationSections.length,base.pages.navigationSections.length);
assert.equal(merged.pages.navigationSections[1].items[0].route,'forretning');
assert.equal(merged.pages.navigationSections[1].items.at(-1).route,'prompter');
assert.ok(!JSON.stringify(base).includes('Dette er privat testinnhold.'));
assert.equal(merged.internalCollections.customerStories[0].body,'Dette er privat testinnhold.');
assert.equal(merged.slides.items.length,base.slides.items.length);
const invalid=(patch,match)=>assert.throws(()=>api.combine(base,{...sample,...patch}),match);
invalid({tools:[{...tool,href:'javascript:alert(1)'}]},/Utrygg lenke/);
invalid({tools:[{...tool,classification:'public'}]},/Ugyldig/);
invalid({tools:[{...tool,id:entry.id}]},/duplisert/);
invalid({collections:{tools:[entry]}},/reservert/);
invalid({navigation:{groups:navigation.groups,views:[{...navigation.views[0],collection:'pages'}]}},/Ugyldig intern menyside/);
invalid({navigation:{groups:navigation.groups,views:[{...navigation.views[0],groupId:'not-defined'}]}},/Ugyldig intern menyside/);
invalid({navigation:{groups:navigation.groups,views:[...navigation.views,navigation.views[0]]}},/Ugyldig intern menyside/);
invalid({sources:{...base.sources}},/Duplisert/);
invalid({schemaVersion:1,navigation},/schemaVersion 2/);
// Test the actual shared renderer rather than a separate test-only nav model.
const all=load('site');
const contentSandbox={window:{}};
vm.runInNewContext(fs.readFileSync('docs/assets/content.js','utf8'),contentSandbox);
const materialized=contentSandbox.window.InnsiktContent.materialize({
 meta:all,pages:base.pages,sources:base.sources,
 ...load('market'),...load('sales'),...load('technologies'),
 backlog:load('backlog'),learning:load('learning'),prompts:load('prompts'),
 horizon:load('horizon'),slides:base.slides,'visual-assets':load('visual-assets'),
 visualAssets:load('visual-assets'),architectureProfiles:load('architecture-profiles')
});
const runtime=api.combine(materialized,sample);
const src=fs.readFileSync('docs/assets/site.js','utf8');
const end=/\binit\(\);\s*\}\)\(\);\s*$/;
assert.ok(end.test(src));
const injected=src.replace(end, [
 'D=globalThis.__fixture;names=D.pages.navigation;',
 'globalThis.__navProbe=()=>({sections:navSections(),page:internalPage("customer-reference"),detail:internalPage("customer-reference~org-case-001"),tool:internalPage("internal-tools~org-tool-001")});',
 '})();'
].join('\n'));
const sandbox={console,window:{},localStorage:{getItem:()=>null},__fixture:runtime,location:{hash:''}};
vm.createContext(sandbox);
vm.runInContext(injected,sandbox,{timeout:3000});
const probe=vm.runInContext('__navProbe()',sandbox,{timeout:3000});
assert.ok(probe.sections.some(g=>g.id==='org-organization'));
assert.ok(probe.sections.find(g=>g.id==='org-organization').items.some(i=>i.route==='intern/customer-reference'));
assert.ok(probe.page.includes(entry.title));
assert.ok(probe.detail.includes(entry.body));
assert.ok(probe.tool.includes('/internal/tools/example'));
assert.ok(!probe.detail.includes('<script>'));
console.log('PASS – v2 interne samlinger, egne menypunkter, felles renderer, streng datagrense og uforandret offentlig kjerne');

