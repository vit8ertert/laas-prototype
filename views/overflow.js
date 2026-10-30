/* Overflow cues (Vit 22 Oct: "tables on mobile scroll sideways, show that it is possible"; "banner info should be
   limited on mobile, show more"). Research: Nathan Long and Simon Willison scroll shadows, Discourse wide tables (fade
   on the side that has more; scrollbars are hidden on touch), Carbon overflow content and Basis text truncate ("Show
   more" only for secondary text, and keep banner copy short first).
   1. Every sideways scroller fades on the side that has more. Tables and charts also get a round arrow button on that
      side: it says "more this way" and scrolls 80 % of the width when tapped. Desktop and phone.
      Phones (Vit 26 Oct: "instead of this icon chevron use just the horizontal scroll bar under the table, everywhere"):
      no arrow buttons; a thin scroll bar under the table shows where you are and how much is left, and can be dragged.
   2. Phones: a banner longer than three lines (its action line counted, 30 Oct) shows two, then its action and "Show more" on the next line. */
(function(){
const L=window.LAAS,{S,ic}=L;
const TABLES='.ml-table,.table-wrap,.cat-table,.so-bars';
const ROWS='.ml-tools,.d-shelf,.cv-chips,.m-tabs,.m-kpis,.m-g12,.cat-tabrow,.cat-kpis,.acc-nav,.aud-tabs,.aud-kpis,.ml-tabs,.cx-chiprow,.cat-filters,.bk-tabs,.tabs';
const BANNERS=':is(.banner,.bd-banner,.acc-banner,.cv-banner)';
const compact=matchMedia('(max-width:599.98px)');

function edges(el){const max=el.scrollWidth-el.clientWidth;el.classList.toggle('sx-l',el.scrollLeft>2);el.classList.toggle('sx-r',el.scrollLeft<max-2);
 if(el._sxbar)bar(el);
 const b=el._sx;if(b){b.l.hidden=!el.classList.contains('sx-l');b.r.hidden=!el.classList.contains('sx-r');place(el);}}
function place(el){const b=el._sx,top=el.offsetTop+Math.max(0,Math.min(el.clientHeight/2,17)-16)+1;
 b.l.style.top=b.r.style.top=top+'px';b.l.style.left=(el.offsetLeft+8)+'px';b.r.style.left=(el.offsetLeft+el.clientWidth-40)+'px';}
function bar(el){const t=el._sxbar,k=t.firstChild,w=el.clientWidth/el.scrollWidth,max=el.scrollWidth-el.clientWidth;
 k.style.width=(w*100)+'%';k.style.left=(max>0?el.scrollLeft/max*(1-w)*100:0)+'%';}
function mkBar(el){const t=document.createElement('div');t.className='sx-bar';t.setAttribute('aria-hidden','true');t.innerHTML='<i></i>';
 el.after(t);const ps=getComputedStyle(el.parentElement),g=/flex|grid/.test(ps.display)?parseFloat(ps.rowGap)||0:0;
 if(g){t.style.marginTop=`calc(var(--space-2) - ${g}px)`;t.style.marginBottom="0";}let x0=null,s0=0;
 t.addEventListener('pointerdown',e=>{x0=e.clientX;s0=el.scrollLeft;t.setPointerCapture(e.pointerId);
  if(e.target===t){const r=t.getBoundingClientRect();el.scrollLeft=(e.clientX-r.left)/r.width*el.scrollWidth-el.clientWidth/2;s0=el.scrollLeft;}});
 t.addEventListener('pointermove',e=>{if(x0===null)return;el.scrollLeft=s0+(e.clientX-x0)*el.scrollWidth/t.clientWidth;});
 const up=()=>{x0=null;};t.addEventListener('pointerup',up);t.addEventListener('pointercancel',up);return t;}
function dropBar(el){if(el._sxbar){el._sxbar.remove();el._sxbar=null;}}
function dropBtns(el){if(el._sx){el._sx.l.remove();el._sx.r.remove();el._sx=null;}}
function scrollCues(){document.querySelectorAll(`.main :is(${TABLES},${ROWS})`).forEach(el=>{
 /* only real sideways scrollers: a box that is wider only because its rows bleed is not one */
 const ox=getComputedStyle(el).overflowX,over=/auto|scroll/.test(ox)&&el.scrollWidth>el.clientWidth+2;el.classList.toggle('sx',over);
 if(!over){el.classList.remove('sx-l','sx-r');dropBtns(el);dropBar(el);return;}
 if(el.matches(TABLES)&&compact.matches){dropBtns(el);if(!el._sxbar)el._sxbar=mkBar(el);}
 else dropBar(el);
 if(el.matches(TABLES)&&!compact.matches&&!el._sx){const p=el.offsetParent||el.parentElement;
  const mk=(dir)=>{const b=document.createElement('button');b.type='button';b.className='sx-btn sx-'+dir;b.setAttribute('aria-label',dir==='r'?'Scroll the table right':'Scroll the table left');b.innerHTML=ic(dir==='r'?'right':'left','s');
   b.addEventListener('click',()=>el.scrollBy({left:(dir==='r'?1:-1)*el.clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));p.appendChild(b);return b;};
  el._sx={l:mk('l'),r:mk('r')};}
 if(!el._sxBound){el.addEventListener('scroll',()=>edges(el),{passive:true});el._sxBound=true;}
 edges(el);});}

function bannerClamp(){document.querySelectorAll(`.main ${BANNERS}`).forEach(b=>{
 b.classList.remove('cx-clamp');b.querySelector(':scope>.cx-more')?.remove();if(!compact.matches)return;
 const key=(b.querySelector('.tx')?.textContent||'').trim().slice(0,60);if((S.cxBannerOpen||{})[key])return;
 const lines=Math.round((b.getBoundingClientRect().height-16)/18);if(lines<=3)return;
 b.classList.add('cx-clamp');const m=document.createElement('button');m.type='button';m.className='cx-more';m.textContent='Show more';
 m.addEventListener('click',e=>{e.stopPropagation();(S.cxBannerOpen??={})[key]=true;b.classList.remove('cx-clamp');m.remove();});b.appendChild(m);});}

const prev=L.afterRender;
L.afterRender=()=>{prev&&prev();scrollCues();bannerClamp();};
addEventListener('resize',()=>{scrollCues();bannerClamp();});
})();
