/* One scene; six independently editable architecture profiles; all imagery is asset IDs. */
(()=>{
'use strict';
function render(slide,esc,profile,catalog,position){
 if(!profile)throw Error('Ukjent arkitekturprofil: '+slide.profileId);
 const assets=window.InnsiktAssets;
 const E=x=>esc(String(x??''));
 function icon(id,size='regular'){
  if(!id)return '';
  const asset=assets.get(catalog,id);
  const cls=asset.category==='vendor-logo'?'da-logo':'da-icon';
  return '<img class="'+cls+' '+cls+'--'+size+'" src="'+E(assets.src(catalog,id))+'" alt="'+E(asset.label)+'" loading="eager" decoding="async">';
 }
 function source(item){return '<div class="da-source">'+icon(item.assetId)+'<strong>'+E(item.label)+'</strong></div>'}
 function output(item){return '<div class="da-output">'+icon(item.assetId)+'<strong>'+E(item.label)+'</strong></div>'}
 function list(items){return '<ul class="da-lines">'+items.map(t=>'<li>'+E(t)+'</li>').join('')+'</ul>'}
 const left='<section class="da-col da-source-col"><div class="da-col-title">KILDER</div><div class="da-sources">'+profile.sources.map(source).join('')+'</div></section>';
 const ingest='<section class="da-col"><div class="da-col-title">INNHENTING</div><div class="da-stage">'
   +'<div class="da-stage-brand">'+icon(profile.ingest.assetId,'small')+'</div><h3>'+E(profile.ingest.title)+'</h3>'+list(profile.ingest.items)+'</div></section>';
 const platform='<section class="da-col da-platform-col"><div class="da-col-title">PLATTFORM & BEARBEIDING</div>'
   +'<div class="da-stage da-platform">'
   +'<div class="da-platform-brand">'+icon(profile.platform.assetId,'hero')+'<h3>'+E(profile.platform.title)+'</h3></div>'
   +'<div class="da-data-tiers"><span>'+E(profile.platform.top)+'</span><span>'+E(profile.platform.bottom)+'</span></div>'
   +(profile.platform.partnerId?'<div class="da-partner"><span>Med modellering fra</span>'+icon(profile.platform.partnerId,'small')+'</div>':'')
   +'</div></section>';
 const serving='<section class="da-col"><div class="da-col-title">TILGJENGELIGGJØR</div><div class="da-stage">'
   +'<h3>'+E(profile.serve.title)+'</h3>'+list(profile.serve.items)+'</div></section>';
 const consumption='<section class="da-col da-consumers-col"><div class="da-col-title">ANVENDELSE</div>'
   +'<div class="da-consumers">'+profile.consumers.map(output).join('')+'</div></section>';
 const supports='<div class="da-foundation"><span class="da-foundation-title">PÅ TVERS AV HELE LØSNINGEN</span>'
   +'<div class="da-support">'+profile.support.map(s=>'<div>'+icon(s.assetId,'small')+'<strong>'+E(s.label)+'</strong></div>').join('')+'</div></div>';
 const counter=String((position?.index??0)+1).padStart(2,'0')+' / '+String(position?.total??1).padStart(2,'0');
 return '<div class="story-scene da-scene">'
   +'<div class="scene-topline"><div class="scene-eyebrow">'+E(profile.eyebrow)+'</div><span class="scene-id">'+counter+'</span></div>'
   +'<header class="da-intro"><h2>'+E(profile.label)+'</h2><p>'+E(profile.intro)+'</p></header>'
   +'<div class="da-architecture"><div class="da-flow">'+[left,ingest,platform,serving,consumption].join('')+'</div>'
   +'<svg class="da-arrows" viewBox="0 0 900 20" preserveAspectRatio="none" aria-hidden="true">'
   +'<path d="M136 10 H164 M160 6 L164 10 L160 14 M306 10 H334 M330 6 L334 10 L330 14 M566 10 H594 M590 6 L594 10 L590 14 M736 10 H764 M760 6 L764 10 L760 14"/></svg>'
   +'</div>'+supports+'<p class="da-footer">'+E(profile.footer)+'</p>'
   +(profile.kind==='vendor'?'<p class="da-nonaffiliation">'+E(profile.brandNotice||'Illustrativ arkitektur · ingen leverandørgodkjenning implisert.')+'</p>':'')
   +'</div>';
}
window.InnsiktArchitectureScenes={render};
})();