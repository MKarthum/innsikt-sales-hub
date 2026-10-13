import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const site=JSON.parse(fs.readFileSync('docs/data/site.json','utf8'));
function run(args){return execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim()}
const base=process.env.GITHUB_ACTIONS?(process.env.GITHUB_REF_NAME==='main'?'HEAD^':'origin/main'):'HEAD';
let files=[];try{files=run(['diff','--name-only',base,'--']).split('\n').filter(Boolean)}catch{}
if(!files.length){console.log('PASS – ingen endringer å versjonskontrollere');process.exit(0)}
let prev;try{prev=JSON.parse(run(['show',base+':docs/data/site.json']))}catch{try{const legacy=JSON.parse(run(['show',base+':docs/data/content.json']));prev={version:legacy.meta.version}}catch{console.error('Mangler tidligere site.json og content.json: '+base);process.exit(1)}}
const parse=v=>(String(v||'').match(/^(\d+)\.(\d+)\.(\d+)$/)||[]).slice(1).map(Number);
const a=parse(site.version),b=parse(prev.version);
if(a.length!==3||b.length!==3||!(a[0]>b[0]||(a[0]===b[0]&&(a[1]>b[1]||(a[1]===b[1]&&a[2]>b[2]))))){console.error('Versjon må økes: '+prev.version+' → '+site.version);process.exit(1)}
console.log('PASS – releaseversjon '+prev.version+' → '+site.version);
