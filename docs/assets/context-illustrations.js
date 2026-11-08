/* Semantic motif library: volumetric illustrations rendered inside each object's own box.
   Geometry is relative to that box. No factual copy or canonical connection is duplicated.
   Every motif is replaceable by motif ID, and no image is an absolute slide backdrop. */
(()=>{
'use strict';
const n=x=>Math.round(x*100)/100;
const line=(d,cls='acp-art-wire')=>`<path class="${cls}" d="${d}"/>`;
const circ=(x,y,r,cls='acp-art-orb')=>`<circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>`;
const ellipse=(x,y,rx,ry,cls='acp-art-ring')=>`<ellipse class="${cls}" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
const poly=(points,cls='acp-art-solid')=>`<polygon class="${cls}" points="${points}"/>`;
const box=(x,y,w,h,rx,cls='acp-art-glass')=>`<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const prism=(x,y,w=28,h=22)=>`
  ${poly(`${x},${y} ${x+w},${y-9} ${x+w+17},${y} ${x+17},${y+9}`,'acp-art-top')}
  ${poly(`${x},${y} ${x+17},${y+9} ${x+17},${y+h+9} ${x},${y+h}`,'acp-art-side')}
  ${poly(`${x+17},${y+9} ${x+w+17},${y} ${x+w+17},${y+h} ${x+17},${y+h+9}`,'acp-art-face')}`;
const globes=(points,links)=>links.map(([a,b])=>line(`M${points[a]}L${points[b]}`,'acp-art-wire')).join('')+points.map(([x,y],i)=>circ(x,y,i%3===0?5:3,'acp-art-orb')).join('');
const picture={
 collaboration:()=>`${ellipse(60,82,43,12)}${ellipse(60,82,28,6,'acp-art-floor-glow')}
  ${circ(28,35,13,'acp-art-portrait-back')}${circ(91,34,12,'acp-art-portrait-back')}
  ${line('M7 77Q9 51 28 51Q48 51 50 75M72 74Q72 52 92 51Q111 52 114 78','acp-art-portrait-shadow')}
  ${circ(60,25,17,'acp-art-portrait-face')}${line('M37 79Q37 49 59 48Q85 49 87 79Z','acp-art-portrait-body')}
  ${circ(60,25,17,'acp-art-portrait-outline')}${line('M43 20Q48 0 69 7Q81 12 77 32M51 44L49 50L62 69L72 50','acp-art-wire')}`,
 applications:()=>`${ellipse(57,84,43,11)}${prism(20,53,51,11)}${prism(26,40,51,11)}${prism(33,27,51,11)}
  ${box(49,21,39,22,4,'acp-art-screen')}${box(54,26,8,6,1,'acp-art-tile')}${box(65,26,8,6,1,'acp-art-tile')}${box(76,26,8,6,1,'acp-art-tile')}
  ${line('M54 37H84M44 48H81M36 61H76','acp-art-gleam')}`,
 agents:()=>`${ellipse(60,85,39,10)}${line('M43 72Q46 62 51 57H72Q82 66 83 76L99 86H24Z','acp-art-robot-neck')}
  ${line('M35 27Q32 7 56 6Q89 5 90 31V52Q88 68 64 69Q39 67 35 54Z','acp-art-robot-head')}
  ${box(40,31,44,23,11,'acp-art-robot-visor')}${ellipse(60,43,18,6,'acp-art-robot-glow')}
  ${circ(51,42,3,'acp-art-robot-eye')}${circ(69,42,3,'acp-art-robot-eye')}
  ${circ(87,36,12,'acp-art-robot-ear')}${circ(87,36,6,'acp-art-robot-glow')}
  ${line('M59 6V0M18 35L31 35M95 64L107 72','acp-art-gleam')}`,
 meaning:()=>`${ellipse(61,81,45,11)}${ellipse(61,81,30,6,'acp-art-floor-glow')}
  ${globes([[60,13],[23,42],[89,35],[40,72],[83,71],[59,44]],[[0,1],[0,2],[1,3],[2,4],[3,5],[4,5],[0,5],[1,5],[2,5]])}`,
 timeline:()=>`${ellipse(60,81,43,11)}${box(25,17,69,58,9)}${line('M35 62H85M39 45H82M39 30H82','acp-art-wire')}
  ${circ(35,62,5)}${circ(60,45,7)}${circ(85,30,5)}${line('M35 62L60 45L85 30','acp-art-gleam')}`,
 boundaries:()=>`${ellipse(58,83,41,10)}${line('M59 7L89 20V47Q88 70 59 79Q31 70 29 47V20Z','acp-art-shield')}
  ${line('M59 16L79 25V46Q77 62 59 68Q42 62 39 46V25Z','acp-art-shield-inner')}
  ${line('M45 45L55 55L75 33','acp-art-check')}${circ(94,21,4)}`,
 storage:()=>`${ellipse(60,82,46,11)}${ellipse(60,82,28,7,'acp-art-floor-glow')}
  ${line('M29 31V64Q30 76 60 76Q89 76 90 64V31','acp-art-storage')}
  ${ellipse(60,31,31,11,'acp-art-top')}${ellipse(60,46,31,10,'acp-art-wire-ring')}
  ${ellipse(60,62,31,10,'acp-art-wire-ring')}${ellipse(60,76,31,9,'acp-art-orb-ring')}`,
 operations:()=>`${ellipse(60,84,42,10)}${prism(14,45,32,24)}${prism(47,28,35,25)}
  ${prism(61,57,26,14)}${line('M47 51L63 43M68 64L81 53','acp-art-gleam')}${circ(64,42,5)}`,
 external:()=>`${ellipse(60,82,43,10)}${circ(60,42,34,'acp-art-world')}
  ${ellipse(60,42,17,34,'acp-art-meridian')}${ellipse(60,42,34,13,'acp-art-meridian')}
  ${line('M26 42H94M39 19Q60 27 82 19M38 65Q60 57 82 65','acp-art-wire')}
  ${box(83,51,28,15,4,'acp-art-chip')}${line('M90 59H103','acp-art-gleam')}`,
 decision:()=>`${ellipse(60,83,45,11)}${ellipse(60,83,29,6,'acp-art-floor-glow')}
  ${poly('59,9 94,42 59,73 24,42','acp-art-diamond')}${poly('59,9 59,73 24,42','acp-art-diamond-left')}
  ${line('M59 9L94 42L59 73L24 42Z','acp-art-gleam')}`,
 action:()=>`${ellipse(60,83,45,10)}${box(19,22,82,53,9,'acp-art-terminal')}
  ${line('M32 34H88M36 48L46 56L36 64M55 64H81','acp-art-check')}${circ(87,30,3)}`,
 feedback:()=>`${ellipse(60,84,43,10)}${line('M32 56A31 31 0 1 1 85 66','acp-art-cycle')}
  ${line('M81 59L85 69L97 65M40 27L30 27L34 17','acp-art-check')}${circ(61,50,12,'acp-art-orb')}`,
 value:()=>`${ellipse(60,84,42,10)}${box(29,51,15,27,3,'acp-art-bar')}${box(50,35,15,43,3,'acp-art-bar')}${box(71,19,15,59,3,'acp-art-bar')}
  ${line('M35 56V75M56 40V75M77 24V75','acp-art-gleam')}`,
 delivery:()=>`${ellipse(60,84,43,11)}${line('M21 72L45 51L63 61L95 21','acp-art-trajectory')}
  ${poly('79,20 102,13 95,36','acp-art-top')}${circ(45,51,5)}${circ(63,61,4)}`,
 learning:()=>`${ellipse(60,83,43,9)}${line('M27 54A35 35 0 0 1 88 31','acp-art-cycle')}
  ${poly('87,16 100,37 77,36','acp-art-top')}${line('M93 52A35 35 0 0 1 33 73','acp-art-cycle')}
  ${poly('34,85 20,65 44,64','acp-art-top')}${circ(60,52,12,'acp-art-orb')}`
};
function render(node,b,esc,assets){
 const motif=node.visual?.motif||'meaning';
 const safeMotif=Object.prototype.hasOwnProperty.call(picture,motif)?motif:'meaning';
 const motifMarkup=picture[safeMotif]();
 const src=window.InnsiktAssets.src(assets,'context-motif-'+safeMotif);
 const id='acp-vol-'+String(node.id).replace(/[^a-z0-9-]/gi,'-');
 // All dimensions derive from this node's box, so moving/resizing it also moves/resizes the artwork.
 const s=n(Math.min((b.h-4)/100,1.04)),x=n(b.x+7),y=n(b.y+(b.h-100*s)/2);
 return `<g class="acp-illustration" data-illustration-owner="${esc(node.id)}" data-illustration-motif="${esc(motif)}" aria-hidden="true" transform="translate(${x} ${y}) scale(${s})">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" class="acp-metal-light"/><stop offset=".48" class="acp-metal-mid"/><stop offset="1" class="acp-metal-dark"/></linearGradient></defs>
  <g class="acp-art-ambient">${ellipse(60,55,55,40,'acp-art-halo')}${ellipse(60,84,43,10,'acp-art-base')}</g>
  <g class="acp-art-objects" style="--acp-art-metal:url(#${id})">${motifMarkup}</g>
  <image class="acp-art-raster" data-asset-id="context-motif-${esc(safeMotif)}" href="${esc(src)}" x="-8" y="-4" width="136" height="110" preserveAspectRatio="xMidYMid meet" aria-hidden="true"/>
 </g>`;
}
function hub(b,assets,esc){
 const src=window.InnsiktAssets.src(assets,'context-motif-context');
 const cx=n(b.x+b.w-337),cy=n(b.y+19),w=317,h=105;
 const points=[[28,64],[73,28],[107,80],[144,36],[195,63],[236,19],[276,70],[151,85],[211,96]];
 const edges=[[0,1],[0,2],[1,3],[1,4],[2,3],[2,7],[3,4],[3,5],[3,7],[4,5],[4,6],[4,7],[5,6],[6,8],[7,8]];
 return `<g class="acp-hero-illustration" data-illustration-owner="context" aria-hidden="true" transform="translate(${cx} ${cy})">
  ${ellipse(151,56,151,50,'acp-hero-aura')}${ellipse(151,81,137,20,'acp-hero-disk')}
  <g class="acp-hero-mesh">${edges.map(([a,b])=>line(`M${points[a][0]} ${points[a][1]}L${points[b][0]} ${points[b][1]}`,'acp-hero-link')).join('')}</g>
  <g class="acp-hero-points">${points.map(([x,y],i)=>circ(x,y,i===3?9:i%2===0?5:7,'acp-hero-point')).join('')}</g>
  ${ellipse(151,77,130,15,'acp-hero-ring')}${ellipse(151,77,105,9,'acp-hero-ring acp-hero-ring-inner')}
  <image class="acp-hero-raster" data-asset-id="context-motif-context" href="${esc(src)}" x="0" y="-6" width="310" height="112" preserveAspectRatio="xMidYMid meet" aria-hidden="true"/>
 </g>`;
}
function decoration(b){
 const x=n(b.x+17),y=n(b.y+13),w=n(b.w-35),h=n(b.h-23);
 // A local board pattern is attached to the context container, never the global scene.
 return `<g class="acp-board-art" data-illustration-owner="context" aria-hidden="true">
  <path class="acp-board-grid" d="M${x} ${y+h*.68}Q${n(x+w*.5)} ${n(y+h*.1)} ${n(x+w)} ${n(y+h*.68)}M${x} ${n(y+h*.91)}Q${n(x+w*.5)} ${n(y+h*.25)} ${n(x+w)} ${n(y+h*.91)}"/>
  <path class="acp-board-led" d="M${x} ${n(y+h*.99)}H${n(x+w)}"/>
 </g>`;
}
window.InnsiktContextArt={version:1,render,hub,decoration,motifs:Object.freeze(Object.keys(picture))};
})();

