/* Authoritative semantic connections for a slide, independent of art direction.
   Routed geometry belongs here; edges are defined once in slides.json. */
(()=>{
'use strict';
const valid=id=>/^[a-z][a-z0-9-]*(?::[0-9]+)?$/.test(id||'');
const coord=i=>Math.round((i+.5)*1000/3);
function validate(graph,slide){
 if(!graph||graph.version!==1||!Array.isArray(graph.edges))throw Error('Mangler relasjonsmodell v1');
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
 return true;
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
function renderCanvas(graph,slide,esc){
 validate(graph,slide);
 const paths=[];
 const add=(record,d,headX,headY,side)=>{
  paths.push('<g data-edge-id="'+esc(record.id)+'" data-from="'+esc(record.from)+'" data-to="'+esc(record.to)+'" data-relation="'+esc(record.relation)+'">'
   +'<path class="cp-graph-track" d="'+d+'"/><path class="cp-graph-arrowhead" d="'+arrow(headX,headY,side)+'"/></g>');
 };
 for(let i=0;i<slide.consumers.length;i++){
  const x=coord(i);add(edge(graph,'context','consumers:'+i),'M'+x+' 210V170',x,170,'up');
 }
 for(let i=0;i<slide.sources.length;i++){
  const x=coord(i);add(edge(graph,'sources:'+i,'context'),'M'+x+' 560V520',x,520,'up');
 }
 // The left outside corridor connects context to the decision, avoiding source tiles.
 add(edge(graph,'context','cycle:0'),'M 28 300H -13V 845H 96',96,845,'right');
 // The right outside corridor closes the learning loop into the shared context.
 add(edge(graph,'cycle:2','context'),'M 880 844H 988V 300H 970',970,402,'left');
 return '<svg class="cp-graph-overlay cp-feedback-return" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
  +paths.join('')+'</svg>';
}
function processArrow(graph,from,to,esc){
 const e=edge(graph,'cycle:'+from,'cycle:'+to);
 return '<svg class="cp-cycle-arrow" data-edge-id="'+esc(e.id)+'" data-from="'+esc(e.from)+'" data-to="'+esc(e.to)+'" data-relation="'+esc(e.relation)+'" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M4 16H27M18 7L27 16L18 25"/></svg>';
}
window.InnsiktSlideGraph={validate,renderCanvas,processArrow};
})();
