/* Three independent vendor compositions, sharing only small visual atoms and the asset registry. */
(()=>{
'use strict';
function render(profile,slide,catalog,escape,position){
 const e=x=>escape(String(x??'')),assets=window.InnsiktAssets,d=profile.diagram;
 function logo(id,extra=''){
  if(!id)return '';
  const asset=assets.get(catalog,id);
  return '<img class="vp-logo '+extra+'" src="'+e(assets.src(catalog,id))+'" alt="'+e(asset.label)+'" loading="eager" decoding="async">';
 }
 function atom(x,klass=''){
  return '<div class="vp-atom '+klass+'">'+logo(x.assetId)+'<div class="vp-atom-label"><strong>'+e(x.label)+'</strong>'
   +(x.sub?'<span>'+e(x.sub)+'</span>':'')+'</div></div>';
 }
 const source=(klass)=>'<div class="vp-source-stack '+klass+'"><div class="vp-section-label">'+e(d.sourceTitle)+'</div>'
  +d.sources.map(x=>atom(x,'vp-source')).join('')+'</div>';
 const outputs=(klass)=>'<div class="vp-output-stack '+klass+'"><div class="vp-section-label">'+e(d.outputTitle)+'</div>'
   +d.outputs.map(x=>atom(x,'vp-output')).join('')+'</div>';
 const help=()=>'<div class="vp-support"><div class="vp-support-heading">'+e(d.supportTitle)+'</div><div class="vp-support-grid">'
  +d.support.map(x=>'<div class="vp-support-item">'+logo(x.assetId)+'<strong>'+e(x.label)+'</strong></div>').join('')+'</div></div>';
 function section(title,children,klass=''){return '<section class="vp-section '+klass+'"><div class="vp-section-label">'+e(title)+'</div>'+children+'</section>'}
 let composition='';
 if(profile.variant==='snowflake-hub'){
  composition='<div class="vp-flow vp-snowflake">'
   +source('vp-snow-sources')
   +'<div class="vp-snow-shell">'
    +'<div class="vp-shell-title">'+logo(d.brand,'vp-brand')+'<strong>'+e(d.workspaceTitle)+'</strong></div>'
    +section(d.ingestTitle,'<div class="vp-trio">'+d.ingest.map(x=>atom(x)).join('')+'</div>','vp-snow-intake')
    +'<div class="vp-snow-core"><span class="vp-core-icon">'+logo(d.brand)+'</span><strong>'+e(d.coreTitle)+'</strong><span>'+e(d.coreText)+'</span></div>'
    +section(d.transformTitle,'<div class="vp-trio">'+d.transform.map(x=>atom(x)).join('')+'</div>','vp-snow-model')
   +'</div>'
   +outputs('vp-snow-outputs')
   +'</div>';
 }else if(profile.variant==='fabric-experiences'){
  composition='<div class="vp-flow vp-fabric">'
  +source('vp-fabric-sources')
  +'<div class="vp-fabric-shell"><div class="vp-shell-title">'+logo(d.brand,'vp-brand')+'<strong>'+e(d.platformTitle)+'</strong></div>'
   +section(d.topTitle,'<div class="vp-fabric-two">'+d.ingest.map(x=>atom(x)).join('')+'</div>','vp-fabric-ingest')
   +section(d.workloadTitle,'<div class="vp-fabric-two">'+d.workloads.map(x=>atom(x)).join('')+'</div>','vp-fabric-workload')
   +'<div class="vp-fabric-lake">'+logo(d.lakeAsset,'vp-lake-icon')+'<strong>'+e(d.lakeTitle)+'</strong><span>'+e(d.lakeDescription)+'</span></div>'
  +'</div>'
  +outputs('vp-fabric-outputs')+'</div>';
 }else if(profile.variant==='databricks-medallion'){
  composition='<div class="vp-flow vp-databricks">'
  +source('vp-db-sources')
  +section(d.ingestTitle,'<div class="vp-db-ingest-items">'+d.ingest.map(x=>atom(x)).join('')+'</div>','vp-db-ingest')
  +'<div class="vp-db-lake"><div class="vp-db-lake-head">'+logo(d.lakeAsset,'vp-lake-icon')+'<strong>'+e(d.lakeTitle)+'</strong></div>'
   +'<div class="vp-medallion">'+d.tiers.map((x,i)=>'<div class="vp-tier vp-tier-'+i+'"><span>'+e(x.label)+'</span><small>'+e(x.sub)+'</small></div>').join('')+'</div></div>'
  +section(d.workloadTitle,'<div class="vp-db-engine-items">'+d.workloads.map(x=>atom(x)).join('')+'</div>','vp-db-workloads')
  +outputs('vp-db-outputs')+'</div>';
 }else throw Error('Ukjent leverandørkomposisjon: '+profile.variant);
 const n=String((position?.index??0)+1).padStart(2,'0')+' / '+String(position?.total??1).padStart(2,'0');
 return '<div class="story-scene vp-scene vp-scene-'+e(profile.id)+'">'
  +'<div class="scene-topline"><div class="scene-eyebrow">'+e(profile.eyebrow)+'</div><span class="scene-id">'+n+'</span></div>'
  +'<div class="vp-heading"><h2>'+e(profile.label)+'</h2><p>'+e(profile.intro)+'</p></div>'
  +composition+help()+'<div class="vp-bottom"><p>'+e(d.foot)+'</p><small>'+e(profile.brandNotice||'Illustrativ arkitektur · ingen leverandørgodkjenning implisert.')+'</small></div></div>';
}
window.InnsiktVendorArchitecture={render};
})();
