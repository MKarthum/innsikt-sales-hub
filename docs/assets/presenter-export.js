/* Nedlastbare, selvstendige presentasjoner: CSS/HTML hentes fra eksisterende visning. */
(()=>{
'use strict';
const extraCss=[
'*,*::before,*::after{box-sizing:border-box}',
'body.export-document{margin:0;background:#eaf1f2;color:#173849;font-family:Arial,sans-serif}',
'.export-toolbar{display:flex;justify-content:space-between;gap:15px;padding:12px 20px;background:white;position:sticky;top:0;z-index:2}',
'.export-toolbar button{font:inherit;padding:8px 12px;border:1px solid #b6cccb;border-radius:6px;background:white;cursor:pointer}',
'.export-list{padding:24px;margin:0 auto;max-width:1200px}',
'.export-slide{width:100%;height:auto;min-height:0;aspect-ratio:16/9;margin:0 auto 25px;display:flex;flex-direction:column;justify-content:center;padding:4.5% 6%;border-radius:12px;overflow:hidden}',
'.export-slide[hidden]{display:none}',
'.export-slide{touch-action:pan-y}',
'.export-slide .slide-case,.export-slide .slide-events span,.export-slide .present-flow-step,.export-slide .slide-prompt{color:#24444c}',
'.export-slide .slide-prompt button{display:none}',
'.export-meta{font-size:12px;color:#4b6268;margin:6px 0 18px}',
'@media print{',
'@page{size:16in 9in;margin:0}',
'html,body.export-document{background:white!important;margin:0!important;padding:0!important;print-color-adjust:exact;-webkit-print-color-adjust:exact}',
'.export-toolbar,.export-meta{display:none!important}',
'.export-list{margin:0;padding:0;max-width:none}',
'.export-slide,.export-slide[hidden]{display:flex!important;width:16in!important;height:9in!important;min-height:9in!important;max-height:9in!important;break-after:page;page-break-after:always;margin:0!important;border-radius:0!important;overflow:hidden}',
'.export-slide:last-child{break-after:auto;page-break-after:auto}',
'}'
].join('\n');
const script=[
'(function(){',
'const slides=[...document.querySelectorAll(".export-slide")],counter=document.getElementById("export-counter");',
'let current=0;',
'let swipeStart=null;',
'function show(n){current=Math.max(0,Math.min(slides.length-1,n));slides.forEach((s,i)=>s.hidden=i!==current);counter.textContent=(current+1)+" / "+slides.length;}',
'document.getElementById("export-prev").addEventListener("click",()=>show(current-1));',
'document.getElementById("export-next").addEventListener("click",()=>show(current+1));',
'document.getElementById("export-print").addEventListener("click",()=>window.print());',
'document.addEventListener("keydown",e=>{if(e.key==="ArrowRight")show(current+1);if(e.key==="ArrowLeft")show(current-1);});',
'document.querySelector(".export-list").addEventListener("touchstart",e=>{if(e.touches.length!==1||e.target.closest("a,button,input,[contenteditable]")){swipeStart=null;return;}swipeStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});',
'document.querySelector(".export-list").addEventListener("touchend",e=>{if(!swipeStart||e.changedTouches.length!==1){swipeStart=null;return;}const dx=e.changedTouches[0].clientX-swipeStart.x,dy=e.changedTouches[0].clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)<50||Math.abs(dx)<1.3*Math.abs(dy))return;show(current+(dx<0?1:-1));},{passive:true});',
'document.querySelector(".export-list").addEventListener("touchcancel",()=>{swipeStart=null;},{passive:true});',
'window.addEventListener("beforeprint",()=>slides.forEach(s=>s.hidden=false));',
'window.addEventListener("afterprint",()=>show(current));',
'show(0);',
'})();'
].join('\n');
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function build(data,stylesheet){
 const style=stylesheet.replaceAll('</style','<\\/style');
 return '<!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+safe(data.label)+' · Innsikt v'+safe(data.version)+'</title><style>'+style+'\n'+extraCss+'</style></head><body class="export-document">'
 +'<nav class="export-toolbar" aria-label="Presentasjonskontroller"><strong>'+safe(data.label)+' · v'+safe(data.version)+'</strong><div><button type="button" id="export-prev">Forrige</button> <span id="export-counter"></span> <button type="button" id="export-next">Neste</button> <button type="button" id="export-print">Skriv ut / PDF</button></div></nav>'
 +'<main class="export-list"><p class="export-meta">'+safe(data.notice)+'</p>'
 +data.slides.map((html,i)=>'<section class="present-frame present-rich export-slide" data-tone="'+safe(data.tones?.[i]||'strong')+'">'+html+'</section>').join('')
 +'</main><script>'+script.replaceAll('</script','<\\/script')+'</script></body></html>';
}
async function exportDeck(data,mode='html'){
 let win=null;
 if(mode==='print'){
  win=window.open('','_blank');
  if(!win)throw Error('Nettleseren blokkerte utskriftsvinduet');
 }
 try{
  const response=await fetch('./assets/site.css?v='+encodeURIComponent(data.version),{cache:'no-store'});
  if(!response.ok)throw Error('Kunne ikke hente presentasjonsstil');
  const html=build(data,await response.text());
  if(mode==='print'){win.document.open();win.document.write(html);win.document.close();win.focus();return;}
  const blob=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download='innsikt-'+data.id+'-v'+data.version+'.html';
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
 }catch(error){if(win&&!win.closed)win.close();throw error;}
}
window.InnsiktPresenterExport={exportDeck};
})();
