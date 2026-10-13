import fs from 'node:fs';
import path from 'node:path';
const excluded=new Set(['.git','node_modules']),ext=new Set(['.md','.json','.html','.js','.css','.yml','.yaml']);
const skip=new Set(['scripts/check-public-content.mjs','OPEN_DATA_POLICY.md','AGENTS.md']);
const errors=[];
const patterns=[['e-postadresse',/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],['norsk telefonnummer',/\+47(?:[ .-]?\d){8}\b/g],['mulig hemmelig nøkkel',/\b(?:ghp_|github_pat_|sk_live_|AKIA)[A-Za-z0-9_-]{12,}\b/g],['kundedata/bookingkode',/\b(?:PNR|booking reference|personnummer|customer id)\s*[:=]\s*[A-Z0-9]{6,16}\b/gi]];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(excluded.has(e.name))continue;const full=path.join(dir,e.name);if(e.isDirectory())walk(full);else if(ext.has(path.extname(e.name))&&!skip.has(full)){const data=fs.readFileSync(full,'utf8');for(const [name,re] of patterns)if(re.test(data))errors.push(full+': mulig '+name);}}}
walk('.');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('PASS – ingen enkle mønstre for privat informasjon funnet (manuell kontroll kreves)');
