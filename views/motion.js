/* LAAS prototype · drawers slide back out when they close (Vit 21 Oct: "closing should also slide back, not disappear").
   The app re-renders its overlays from state, so a closed drawer is simply gone; this keeps a copy of it for 200 ms and
   slides it out (the scrim fades) before removing it. Skipped with reduced motion. */
(function(){
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
new MutationObserver(muts=>{
  if(reduce())return;
  let gone=null,scrimGone=false;
  for(const m of muts)for(const n of m.removedNodes){if(n.nodeType!==1)continue;
    const d=n.matches('.drawer')?n:n.querySelector&&n.querySelector('.drawer');if(d&&!d.classList.contains('leaving'))gone=d;
    if(n.matches('.scrim')||(n.querySelector&&n.querySelector('.scrim')))scrimGone=true;}
  if(!gone)return;
  if(document.querySelector('.drawer:not(.leaving)'))return; // re-render with the drawer still open
  const ghost=gone.cloneNode(true);ghost.classList.add('leaving');ghost.setAttribute('aria-hidden','true');ghost.inert=true;
  document.body.appendChild(ghost);
  let s=null;if(scrimGone){s=document.createElement('div');s.className='scrim leaving';document.body.appendChild(s);}
  setTimeout(()=>{ghost.remove();s&&s.remove();},220);
}).observe(document.body,{childList:true,subtree:true});
})();
