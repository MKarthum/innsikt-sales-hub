/* Authoritative semantic connections for a slide, independent of art direction.
   Routed geometry belongs here; edges are defined once in slides.json. */
(()=>{
'use strict';
const valid=id=>/^[a-z][a-z0-9-]*(?::[0-9]+)?$/.test(id||'');
const coord=i=>Math.round((i+.5)*1000/3);
// Mermaid-like authoring syntax, intentionally not a Mermaid runtime/rendering dependency.
// Labels and directions are canonical here; scene geometry remains renderer-owned.
function parse(input){
 if(input?.version===1&&Array.isArray(input.edges))return input;
 if(input?.version!==2||typeof input.source!=='string')throw Error('Mangler relasjonsmodell v2');
 const edges=[];
 for(const line of input.source.split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&!x.startsWith('#'))){
  const parts=line.match(/^([a-z][a-z0-9:-]*)\s*-->\s*([a-z][a-z0-9:-]*)\s*:\s*([a-z-]+)\s*\[([a-z][a-z0-9-]*)\]$/);
  if(!parts)throw Error('Ugyldig relasjonslinje: '+line);
  edges.push({from:parts[1],to:parts[2],relation:parts[3],id:parts[4]});
 }
 return {version:1,edges};
}
function validate(input,slide){
 const graph=parse(input);
 if(!graph||!Array.isArray(graph.edges))throw Error('Mangler relasjonsmodell');
 const nodes=new Set(['context']);
 for(const collection of ['consumers','sources','cycle']){
  (slide[collection]||[]).forEach((_,i)=>nodes.add(collection+':'+i));
 }
 const ids=new Set(),pairs=new Set();
 for(const edge of graph.edges){
  if(!valid(edge.id)||ids.has(edge.id))throw Error('Ugyldig/duplisert relasjon '+edge.id);
  if(!nodes.has(edge.from)||!nodes.has(edge.to)||edge.from===edge.to)throw Error('Ukjent relasjonsendepunkt '+edge.id);
  const key=edge.from+'>'+edge.to;
  if(pairs.has(key))throw Error('Duplisert faglig relasjon '+key);
  if(!['provides','informs','supports','advances','updates'].includes(edge.relation))throw Error('Ugyldig relasjonstype '+edge.id);
  ids.add(edge.id);pairs.add(key);
 }
 if(!graph.edges.length)throw Error('Tom relasjonsmodell');
 // Reject unused, invisible connections; every declared edge must have a visible
 // route in this graph family. This also prevents a new style from hiding a fact.
 const required=new Map();
 for(let i=0;i<slide.consumers.length;i++)required.set('context>consumers:'+i,'provides');
 for(let i=0;i<slide.sources.length;i++)required.set('sources:'+i+'>context','informs');
 required.set('context>cycle:0','supports');
 for(let i=0;i<slide.cycle.length-1;i++)required.set('cycle:'+i+'>cycle:'+(i+1),'advances');
 required.set('cycle:'+(slide.cycle.length-1)+'>context','updates');
 if(graph.edges.length!==required.size)throw Error('Relasjonsgrafen inneholder skjulte eller manglende forbindelser');
 for(const e of graph.edges){
  const expected=required.get(e.from+'>'+e.to);
  if(expected!==e.relation)throw Error('Faglig retning eller relasjonstype stemmer ikke: '+e.id);
 }
 return graph;
}
// Only the canonical semantic graph is owned here. All coordinates, paths
// and arrowheads live in unified-slide-scene.js, once for every art direction.
window.InnsiktSlideGraph={parse,validate};
})();
