/* Specialized editorial compositions. Content lives on each slide object; no duplicated stories. */
(()=>{
'use strict';
function render(slide,{v,top,title,escs,assetImage,block}){
 const section=(cls,body)=>'<section class="'+cls+'">'+body+'</section>';
 const footer=(text,cls='v5-footer')=>'<p class="'+cls+'">'+escs(text||'')+'</p>';
 const heading='<div class="v5-heading">'+title+'</div>';
 const icon=(id,cls='v5-icon')=>assetImage(id,cls);
 switch(v.layout){
 case 'product-preview': {
  const x=v.preview;
  return block('special v5-special v5-product',top+heading
   +'<div class="v5-product-surface"><div class="v5-product-browser"><i></i><i></i><i></i><strong>INNSIKT</strong><small>'+escs(x.context)+'</small></div>'
   +'<div class="v5-product-journey"><div class="v5-product-input"><small>'+escs(x.inputLabel)+'</small><strong>'+escs(x.input)+'</strong></div>'
   +'<div class="v5-product-connector" aria-hidden="true">→</div>'
   +'<div class="v5-product-outputs"><small>'+escs(x.outputLabel)+'</small>'
   +x.outputs.map((t,i)=>'<div class="v5-product-output">'+icon(x.assets?.[i]||v.figureAssetId)+'<strong>'+escs(t)+'</strong></div>').join('')
   +'</div></div></div>'+footer(x.conclusion));
 }
 case 'case-quote':
  return block('special v5-special v5-case',top+heading
   +'<div class="v5-case-layout"><div class="v5-quote"><span>'+escs(v.subtitle)+'</span><blockquote>'+escs(v.quote)+'</blockquote></div>'
   +'<div class="v5-case-questions"><small>'+escs(v.questionLabel)+'</small>'
   +(v.questions||[]).map((q,i)=>'<div><em>'+String(i+1).padStart(2,'0')+'</em><strong>'+escs(q)+'</strong></div>').join('')+'</div></div>'
   +footer(v.conclusion));
 case 'two-truths':
  return block('special v5-special v5-truths',top+heading
   +'<div class="v5-truths-layout">'+v.truths.map((x,i)=>section('v5-truth v5-truth-'+i,
    '<small>'+escs(x.label)+'</small>'+icon(x.assetId||v.figureAssetId,'v5-truth-icon')+'<h3>'+escs(x.title)+'</h3><p>'+escs(x.text)+'</p>'
   )).join('')+'</div>'+footer(v.conclusion));
 case 'capacity-gate':
  return block('special v5-special v5-capacity',top+heading
   +'<div class="v5-capacity-layout"><div class="v5-capability-list">'
   +v.capabilities.map(x=>'<div class="v5-capability">'+icon(x.assetId)+'<div><strong>'+escs(x.label)+'</strong><small>'+escs(x.detail)+'</small></div><span aria-hidden="true">→</span></div>').join('')
   +'</div><div class="v5-gate">'+icon('verified-analysis','v5-gate-icon')+'<small>'+escs(v.gateCue)+'</small>'
   +'<h3>'+escs(v.gateTitle)+'</h3><p>'+escs(v.gateText)+'</p></div></div>'+footer(v.conclusion));
 case 'handoff':
  return block('special v5-special v5-handoff',top+heading
   +'<div class="v5-handoff-flow">'+v.roles.map((x,i)=>'<div class="v5-role">'+icon(x.assetId,'v5-role-icon')+'<small>'+escs(x.name)+'</small><h3>'+escs(x.title)+'</h3><p>'+escs(x.detail)+'</p></div>'
    +(i===0?'<div class="v5-handoff-arrow" aria-hidden="true">→</div>':'')).join('')+'</div>'
   +'<div class="v5-handoff-artifact">'+icon('business-decision','v5-artifact-icon')+'<span>'+escs(v.handoff)+'</span></div>'+footer(v.conclusion));
 case 'convergence':
  return block('special v5-special v5-convergence',top+heading
   +'<div class="v5-convergence-layout"><div class="v5-forces">'
   +v.items.map((t,i)=>'<div class="v5-force">'+icon(v.itemAssetIds[i])+'<div><strong>'+escs(t)+'</strong><span>'+escs(v.detail[i])+'</span></div><b aria-hidden="true">→</b></div>').join('')
   +'</div><div class="v5-force-focus"><small>'+escs(v.focus.label)+'</small><h3>'+escs(v.focus.title)+'</h3><p>'+escs(v.focus.detail)+'</p></div></div>'+footer(v.conclusion));
 case 'customer-voices':
  return block('special v5-special v5-voices',top+heading+'<div class="v5-voices-layout">'
   +v.items.map((t,i)=>'<div class="v5-voice-line"><div class="v5-voice-quote">'+icon(v.itemAssetIds[i])+'<div><small>'+escs(v.signalLabel)+'</small><strong>'+escs(t)+'</strong></div></div>'
     +'<span class="v5-voice-arrow" aria-hidden="true">→</span><div class="v5-voice-reply"><small>'+escs(v.responseLabel)+'</small><strong>'+escs(v.detail[i])+'</strong></div></div>').join('')
   +'</div>'+footer(v.conclusion));
 case 'cause-map':
  return block('special v5-special v5-causes',top+heading
   +'<div class="v5-symptom"><small>'+escs(v.symptomLabel)+'</small><strong>'+escs(v.symptom)+'</strong></div>'
   +'<div class="v5-cause-branch" aria-hidden="true"><span></span><span></span><span></span></div>'
   +'<div class="v5-causes-grid">'+v.items.map((t,i)=>'<div class="v5-cause">'+icon(v.itemAssetIds[i])+'<small>'+escs(v.causesLabel)+'</small><h3>'+escs(t)+'</h3><p>'+escs(v.detail[i])+'</p></div>').join('')+'</div>'
   +footer(v.conclusion));
 default:return null;
 }
}
window.InnsiktStoryScenes={render};
})();
