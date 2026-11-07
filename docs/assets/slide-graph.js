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
const edge=(graph,from,to)=>{
 const result=graph.edges.filter(e=>e.from===from&&e.to===to);
 if(result.length!==1)throw Error('Mangler entydig faglig relasjon: '+from+' > '+to);
 return result[0];
};
const arrow=(x,y,side)=>{
 if(side==='up')return 'M'+(x-8)+' '+(y+10)+'L'+x+' '+y+'L'+(x+8)+' '+(y+10);
 if(side==='left')return 'M'+(x+10)+' '+(y-8)+'L'+x+' '+y+'L'+(x+10)+' '+(y+8);
 return 'M'+(x-10)+' '+(y-8)+'L'+x+' '+y+'L'+(x-10)+' '+(y+8);
};
function renderCanvas(input,slide,esc){
 const graph=validate(input,slide);
 const paths=[];
 const add=(record,points,side,curve)=>{
  // Geometry and arrowhead have a single source of truth: the final route point.
  const d=curve||points.map(([x,y],i)=>(i?'L':'M')+x+' '+y).join('');
  const [headX,headY]=points.at(-1);
  paths.push('<g data-edge-id="'+esc(record.id)+'" data-from="'+esc(record.from)+'" data-to="'+esc(record.to)+'" data-relation="'+esc(record.relation)+'">'
   +'<path class="cp-graph-track" d="'+d+'"/><path class="cp-graph-arrowhead" d="'+arrow(headX,headY,side)+'"/></g>');
 };
 for(let i=0;i<slide.consumers.length;i++){
  const x=coord(i);add(edge(graph,'context','consumers:'+i),[[x,210],[x,170]],'up');
 }
 for(let i=0;i<slide.sources.length;i++){
  const x=coord(i);add(edge(graph,'sources:'+i,'context'),[[x,560],[x,520]],'up');
 }
 // The left lane starts at the context boundary and ends at the decision rail.
 // It must not terminate on top of the first decision icon.
 add(edge(graph,'context','cycle:0'),[[0,350],[0,843]],'right','M0 350 C-23 350 -28 382 -28 420 L-28 758 C-28 808 -21 843 0 843');
 // The right lane starts at the updated-context rail and closes at the context edge.
 add(edge(graph,'cycle:2','context'),[[1000,843],[1000,350]],'left','M1000 843 C1026 843 1032 812 1032 762 L1032 417 C1032 374 1024 350 1000 350');
 return '<svg class="cp-graph-overlay cp-feedback-return" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
  +paths.join('')+'</svg>';
}
function processArrow(input,from,to,esc){
 const e=edge(parse(input),'cycle:'+from,'cycle:'+to);
 return '<svg class="cp-cycle-arrow" data-edge-id="'+esc(e.id)+'" data-from="'+esc(e.from)+'" data-to="'+esc(e.to)+'" data-relation="'+esc(e.relation)+'" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M4 16H27M18 7L27 16L18 25"/></svg>';
}
window.InnsiktSlideGraph={parse,validate,renderCanvas,processArrow};
})();
