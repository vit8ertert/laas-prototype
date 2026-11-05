/* LAAS lab, T491: the stepped strip (a fader), role=slider. Test only, not in the design system.
   LAAS_STRIP.fader(host, {name, label, levels, short, value, h, text, onChange}) -> {get, set}
   Used by lab/hardware-controls.html and, behind ?lab=strip, by the intro (views/account.js). */
(function(){
"use strict";
const tick=()=>{try{navigator.vibrate&&navigator.vibrate(4)}catch(e){}};
/* Fader, levels 0..n-1: vertical (mixer, mouse) or horizontal (o.h: phones and touch, one row per topic) */
function Fader(host,o){
  const n=o.levels.length,h=!!o.h,f=document.createElement('div');f.className='fader'+(h?' h':'');f.tabIndex=0;
  f.setAttribute('role','slider');f.setAttribute('aria-orientation',h?'horizontal':'vertical');f.setAttribute('aria-label',o.label||o.name);
  f.setAttribute('aria-valuemin',0);f.setAttribute('aria-valuemax',n-1);
  const pc=i=>i/(n-1)*100,dets=o.levels.map((_,i)=>`<i class="f-det" style="${h?'left':'bottom'}:${pc(i)}%"></i>`).join('');
  f.innerHTML=h
   ?`<div class="fh-top"><span class="f-name">${o.name}</span><span class="f-val"></span></div><div class="f-track"><div class="f-in">${dets}<i class="f-fill"></i><i class="f-cap"></i></div></div><div class="fh-labs" aria-hidden="true">${o.short.map((l,i)=>`<span style="left:${pc(i)}%">${l}</span>`).join('')}</div>`
   :`<div class="f-track">${dets}<i class="f-fill"></i><i class="f-cap"></i></div><span class="f-name">${o.name}</span><span class="f-val"></span>`;
  host.appendChild(f);
  const tr=f.querySelector(h?'.f-in':'.f-track'),cap=f.querySelector('.f-cap'),fill=f.querySelector('.f-fill'),out=f.querySelector('.f-val'),labs=[...f.querySelectorAll('.fh-labs span')],detEls=[...f.querySelectorAll('.f-det')];let v=null;
  function set(nv,user){nv=Math.max(0,Math.min(n-1,nv));if(nv===v)return;const first=v===null;v=nv;const p=pc(v)+'%';
    if(h){cap.style.left=p;fill.style.width=p;labs.forEach((l,i)=>l.classList.toggle('on',i===v));}else{cap.style.bottom=p;fill.style.height=p;}
    detEls.forEach((d,i)=>d.classList.toggle('on',i<=v));/* lit up to the level, like a meter (used by the TX skin) */
    out.textContent=o.levels[v];f.setAttribute('aria-valuenow',v);f.setAttribute('aria-valuetext',o.text?o.text(v):o.levels[v]);o.onChange&&o.onChange(v);if(user&&!first)tick();}
  set(o.value);
  f.addEventListener('keydown',e=>{const m={ArrowUp:1,ArrowRight:1,PageUp:1,ArrowDown:-1,ArrowLeft:-1,PageDown:-1}[e.key];
    if(m!==undefined){set(v+m,true);e.preventDefault();}else if(e.key==='Home'){set(0,true);e.preventDefault();}else if(e.key==='End'){set(n-1,true);e.preventDefault();}});
  /* press anywhere on the strip jumps to the nearest level (single pointer, WCAG 2.5.7), then drag along it */
  const at=e=>{const r=tr.getBoundingClientRect();return Math.round((h?(e.clientX-r.left)/r.width:1-(e.clientY-r.top)/r.height)*(n-1));};
  f.addEventListener('pointerdown',e=>{if(h&&!e.target.closest('.f-track,.fh-labs'))return;e.preventDefault();f.focus({preventScroll:true});f.classList.add('drag');f.setPointerCapture(e.pointerId);set(at(e),true);
    const mv=ev=>set(at(ev),true);
    const up=()=>{f.classList.remove('drag');f.removeEventListener('pointermove',mv);f.removeEventListener('pointerup',up);f.removeEventListener('pointercancel',up);};
    f.addEventListener('pointermove',mv);f.addEventListener('pointerup',up);f.addEventListener('pointercancel',up);});
  return {get:()=>v,set};
}
window.LAAS_STRIP={fader:Fader};
})();
