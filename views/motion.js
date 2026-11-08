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

/* Rows build in one by one (Vit 8 Nov: "the table very nicely built one row by one … is it everywhere"). One list of
   repeated rows and tiles; each gets .rw and its place among its siblings as --i (capped at 10), and shell.css rises
   them 30 ms apart when the page or a tab enters. The prototype calls it from render(), Django's app.js on load. */
(function(){
const ROWS=':is(.table-row:not(.bk-th,.ml-th,.ml-gh,.head),tbody tr,.list-row,.mail-row,.cv-row,.cv-vrow,.settings-row,.acc-li,.bd-prow,.bd-frow,.money-line,.share-row,.comment,.day-step,.d-card,.sheet-row,.release-tile,.theme-tile,.aud-city,.aud-rel,.so-acc)';
const L=window.LAAS=window.LAAS||{};
L.stagger=m=>{const n=new Map();m.querySelectorAll(ROWS).forEach(r=>{if(r.closest('.drawer,.pop,.modal,.sheet'))return;
  const p=r.parentElement,i=n.get(p)||0;n.set(p,i+1);r.classList.add('rw');r.style.setProperty('--i',Math.min(i,10));});};
})();
