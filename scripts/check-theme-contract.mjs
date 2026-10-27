import fs from 'node:fs';
import assert from 'node:assert/strict';

const files=['site.css','slide-visuals.css','slide-story-scenes.css','architecture-visuals.css','architecture-explorer.css','vendor-architectures.css'];
const roles=['ink','muted','faint','paper','surface','surface-alt','border','navy','navy2','accent','accent-soft','blue','ok','warn','on-dark','on-accent','focus'];
const slides=['strong','light'].flatMap(t=>['bg','fg','muted','accent','warning'].map(r=>'slide-'+t+'-'+r));
const all=[...roles,...slides];
const rootOf=s=>{const m=s.match(/:root\s*\{([^}]*)\}/);assert.ok(m,'missing :root');return m};
const declarations=s=>new Map([...s.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([,n,v])=>[n,v.trim()]));
const original=fs.readFileSync('docs/assets/site.css','utf8');
const root=rootOf(original);
const defaults=declarations(root[1]);
for(const n of [...all,'teal','lime','surface-secondary','arch-muted'])assert.ok(defaults.has('--'+n),'Missing token --'+n);
assert.equal(defaults.get('--teal'),'var(--accent)');
assert.equal(defaults.get('--lime'),'var(--accent-soft)');
const rx=/(#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(\s*(?!from\b)[^)]*\)|(?<![\w-])(?:white|black)(?![\w-]))/gi;
const scan=css=>[...css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(rx)].map(x=>x[0]);
for(const f of files){
 const css=fs.readFileSync('docs/assets/'+f,'utf8');
 const body=f==='site.css'?css.replace(root[0],''):css;
 assert.deepEqual(scan(body),[],f+' literal colors outside :root');
}
const exportJS=fs.readFileSync('docs/assets/presenter-export.js','utf8');
const extra=exportJS.split('const extraCss=[')[1]?.split('].join(')[0];
assert.ok(extra,'Missing export styles');
assert.deepEqual(scan(extra),[],'Export styles contain literal colors');
assert.deepEqual(scan('.x{color:#aabbcc;background:rgb(1,2,3)}'),['#aabbcc','rgb(1,2,3)']);
assert.deepEqual(scan('.x{color:hsl(from var(--ink) h s l)}'),[]);
const fixture=fs.readFileSync('scripts/fixtures/theme-synthetic.css','utf8');
const overrides=declarations(rootOf(fixture)[1]);
for(const n of all)assert.ok(overrides.has('--'+n),'Synthetic palette misses --'+n);
const custom=new Map([...defaults,...overrides]);
function resolve(map,name,depth=0){
 assert.ok(depth<10,'Cycle '+name);
 const raw=map.get('--'+name);assert.ok(raw,'Missing '+name);
 const nested=raw.match(/^var\(--([\w-]+)\)$/);
 return nested?resolve(map,nested[1],depth+1):raw;
}
function lum(hex){
 assert.match(hex,/^#[0-9a-f]{6}$/i,'Nonstatic palette '+hex);
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
 .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return .2126*r+.7152*g+.0722*b;
}
function contrast(a,b){const [hi,lo]=[lum(a),lum(b)].sort((x,y)=>y-x);return (hi+.05)/(lo+.05)}
const pairs=[['ink','surface'],['ink','paper'],['accent','surface'],['on-dark','navy'],['on-dark','navy2'],['on-accent','accent'],['ok','surface'],['warn','surface'],
 ...['strong','light'].flatMap(t=>['fg','muted','accent','warning'].map(r=>['slide-'+t+'-'+r,'slide-'+t+'-bg']))];
let count=0;
for(const [a,b] of pairs){
 const before=contrast(resolve(defaults,a),resolve(defaults,b));
 if(before<4.5)continue;
 const after=contrast(resolve(custom,a),resolve(custom,b));
 assert.ok(after>=4.5,'WCAG AA regression '+a+'/'+b+' '+before.toFixed(2)+' => '+after.toFixed(2));
 count++;
}
assert.ok(count>=10,'Not enough WCAG pairs');
console.log('PASS – '+files.length+' stylesheets, '+all.length+' public tokens, '+count+' WCAG AA pairs, export and literal guard');

