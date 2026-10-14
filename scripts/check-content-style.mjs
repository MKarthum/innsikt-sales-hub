import fs from 'node:fs';
const read=n=>fs.readFileSync(n,'utf8');
const js=read('docs/assets/site.js'),html=read('docs/index.html'),site=JSON.parse(read('docs/data/site.json'));
const errors=[];
if(js.includes('./data/content.json')||fs.existsSync('docs/data/content.json'))errors.push('Gammel content.json må fjernes');
if(/const slidesBase\s*=/.test(js))errors.push('Presentasjon er hardkodet i JS');
if(/\b(?:48 %|30 % i 2025 mot 48 %|29–90 %)\b/.test(js))errors.push('Markedsstatistikk er hardkodet i JS');
if(/hdr\('[A-ZÆØÅ][^']*','/.test(js))errors.push('Sidens overskrifter er hardkodet i JS');
for(const [kind,ref] of [['CSS','site.css'],['JS','site.js'],['Prompt JS','prompts.js'],['Learning JS','learning.js']]){
 const escaped=ref.replace('.','\\.');
 const m=html.match(new RegExp('assets/'+escaped+'\\?v=([0-9.]+)'));
 if(!m||m[1]!==site.version)errors.push(kind+'-versjon samsvarer ikke med '+site.version);
}
if(/content\.json/.test(read('README.md')+read('START_HERE.md')+read('AGENTS.md')))errors.push('Utdatert filreferanse i arbeidsinstruksjoner');
for(const file of ['docs/data/pages.json','docs/data/sales.json','docs/data/market.json']){
 const t=read(file);
 if(/(?:vi har lagt til|ny kandidat|fortsatt ikke lagt inn)/i.test(t))errors.push(file+' har historikkorientert sidetekst');
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('PASS – sidebudskap, tall, presentasjon og assetversjoner');
