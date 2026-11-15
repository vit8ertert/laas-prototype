/* Ask bar: fold when idle, then a quiet twinkle (Vit 14 Nov 2026: "A plus B, build it"; previews at
   https://claude.ai/artifact/Pc96Hgx7wNCDJkyszoDQR2; Figma Assistant bar 141:493, State Idle -> Collapsed).
   A: after 20 s with no typing, clicking, scrolling, pointer near the bar or focus in it (and an empty field), the bar
      shrinks into the lime Ask pill at its right edge with a spring; focus or a click opens it again the same way (hover
      only lightens the pill and winks the sparkle, every fold ends with the wink, 15 Nov),
      and leaving it empty folds it back after a moment.
   B: folded for 45 s, the sparkle winks once (15 Nov, Vit: "use classic wink": each star goes out and flashes back in with a
      turn, the small one 0.38 s later, no glow); at most once a
      minute, never while the page scrolls, at most three times per page visit.
   Wide screens only (phones have the Ask button in the tab bar). With reduced motion the bar folds without the spring
   and never twinkles. One standalone script for the prototype and Django: it finds .abar in the page each time, so a
   prototype re-render keeps the folded state. */
(function(){
"use strict";
const NEAR=80;
/* timings; the Ask bar lab (lab/askbar.html) shortens them through window.ABAR_TIMING */
const TM=()=>Object.assign({idle:20000,first:45000,every:60000,max:3},window.ABAR_TIMING||{});
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const wide=matchMedia('(min-width: 600px)');
let last=Date.now(),lastScroll=0,folded=false,foldedAt=0,lastTw=0,twinkles=0,leaveT=null;
const bar=()=>document.querySelector('.main .abar.assistant-bar, .abar.assistant-bar');
const busy=b=>{const i=b&&b.querySelector('input');return !!(b&&(b.contains(document.activeElement)||(i&&i.value.trim())));};
const touch=()=>{last=Date.now();};
['keydown','pointerdown','wheel'].forEach(t=>addEventListener(t,touch,{passive:true,capture:true}));
addEventListener('scroll',()=>{touch();lastScroll=Date.now();},{passive:true,capture:true});
addEventListener('pointermove',e=>{const b=bar();if(!b||folded)return;const r=b.getBoundingClientRect();
 if(e.clientX>r.left-NEAR&&e.clientX<r.right+NEAR&&e.clientY>r.top-NEAR&&e.clientY<r.bottom+NEAR)touch();},{passive:true});

/* the fold: the bar keeps its right edge and shrinks to the pill; margins and width animate (CSS on .abar-anim) */
function geometry(b){const p=b.parentElement.getBoundingClientRect(),r=b.getBoundingClientRect();return {left:r.left-p.left,width:r.width,parent:p.width};}
function pillSize(b){/* the folded size from the CSS (Figma Collapsed: 40 high, padding 16, sparkle, 8, Ask), measured on a hidden copy */
 const c=b.cloneNode(true);c.classList.remove('abar-anim');c.classList.add('abar-folded');c.removeAttribute('id');c.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
 c.style.cssText='position:absolute;visibility:hidden;pointer-events:none;width:max-content;margin:0;bottom:0';b.parentElement.appendChild(c);
 const r=c.getBoundingClientRect();c.remove();return {w:Math.ceil(r.width),h:Math.round(r.height)};}
function fold(b,animate){if(!b||b.classList.contains('abar-folded'))return;
 b.classList.remove('abar-anim');  /* measure without a running transition (an open still in flight) */
 const g=geometry(b),h0=b.getBoundingClientRect().height,p=pillSize(b);
 b.style.width=g.width+'px';b.style.height=h0+'px';b.style.marginLeft=g.left+'px';b.style.marginRight='0px';
 if(animate&&!reduce.matches){b.classList.add('abar-anim');void b.offsetWidth;}
 b.classList.add('abar-folded');b.style.width=p.w+'px';b.style.height=p.h+'px';b.style.marginLeft=(g.left+g.width-p.w)+'px';
 b.setAttribute('aria-label','Ask the assistant (folded, click or focus to open)');
 if(!folded||animate)foldedAt=Date.now();folded=true;  /* carrying the fold to a new page keeps its time */
 try{sessionStorage.setItem('laas-abar','folded');}catch(e){}  /* Django pages are full loads: the next page starts folded */
 if(animate)setTimeout(()=>{b.classList.remove('abar-anim');if(b.classList.contains('abar-folded'))twinkle(b,false);},620);}  /* every fold ends with the wink */
function open(b,animate){if(!b||!b.classList.contains('abar-folded'))return;
 b.classList.remove('abar-anim');  /* measure without a running transition (a fold still in flight) */
 /* measure the open bar, then go back to the pill (no paint in between) and animate to it, so the parts grow back in */
 const prevW=b.style.width,prevL=b.style.marginLeft,prevH=b.style.height;
 b.classList.add('abar-measure');  /* no transitions while measuring, or the sparkle's own transition cancels its growth */
 b.classList.remove('abar-folded');b.style.width='';b.style.marginLeft='';b.style.marginRight='';b.style.height='';
 const g=geometry(b),h=b.getBoundingClientRect().height;
 b.classList.add('abar-folded');b.style.width=prevW;b.style.marginLeft=prevL;b.style.marginRight='0px';b.style.height=prevH;void b.offsetWidth;
 b.classList.remove('abar-measure');void b.offsetWidth;
 if(animate&&!reduce.matches){b.classList.add('abar-anim');void b.offsetWidth;}
 b.classList.remove('abar-folded');b.style.width=g.width+'px';b.style.marginLeft=g.left+'px';b.style.height=h+'px';
 folded=false;touch();b.removeAttribute('aria-label');
 try{sessionStorage.removeItem('laas-abar');}catch(e){}
 setTimeout(()=>{if(!b.classList.contains('abar-folded')){b.classList.remove('abar-anim');b.style.width='';b.style.marginLeft='';b.style.marginRight='';b.style.height='';}},animate&&!reduce.matches?700:0);}
/* the classic wink; auto (the idle twinkle) counts toward the once-a-minute, three-a-visit limit, a wink at the end of a
   fold or on hover does not, and a wink already playing is not restarted */
function twinkle(b,auto=true){if(!b||reduce.matches)return;const ic=b.querySelector(':scope > svg.i');if(!ic||ic.classList.contains('abar-tw'))return;
 void ic.getBoundingClientRect();ic.classList.add('abar-tw');
 setTimeout(()=>ic.classList.remove('abar-tw'),1300);if(auto){lastTw=Date.now();twinkles++;}}

/* a click or focus opens it (hover only lightens the pill and turns the sparkle, 15 Nov, Vit); leaving it empty folds it back */
document.addEventListener('pointerover',e=>{const b=e.target.closest&&e.target.closest('.abar.assistant-bar');if(!b)return;clearTimeout(leaveT);
 if(b.classList.contains('abar-folded')&&!b.contains(e.relatedTarget))twinkle(b,false);});  /* hover on the pill: the wink */
document.addEventListener('pointerout',e=>{const b=e.target.closest&&e.target.closest('.abar.assistant-bar');if(!b||b.contains(e.relatedTarget))return;
 clearTimeout(leaveT);leaveT=setTimeout(()=>{if(foldedAt&&!busy(b)&&Date.now()-last>1200)fold(b,true);},1600);});
document.addEventListener('focusin',e=>{const b=e.target.closest&&e.target.closest('.abar.assistant-bar');if(b&&folded)open(b,true);});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.abar.assistant-bar.abar-folded');if(b){e.preventDefault();e.stopPropagation();open(b,true);setTimeout(()=>b.querySelector('input')?.focus(),360);}},true);

/* the X and ⌘J fold it the same way, with the spring (15 Nov, Vit: "the elastic animation only when auto collapse, do it
   when I manually do that too"); caught first on wide screens, so the old swap to the mini Ask pill stays for narrow ones */
addEventListener('click',e=>{const x=e.target.closest&&e.target.closest('.abar.assistant-bar [data-act=abarhide]');if(!x||!wide.matches)return;
 e.preventDefault();e.stopImmediatePropagation();const b=x.closest('.abar');x.blur();b.querySelector('input')?.blur();clearTimeout(leaveT);fold(b,true);},true);
addEventListener('keydown',e=>{if(!((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='j'))return;const b=bar();if(!b||!wide.matches)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(b.classList.contains('abar-folded')){open(b,true);setTimeout(()=>b.querySelector('input')?.focus(),360);}
 else{document.activeElement&&b.contains(document.activeElement)&&document.activeElement.blur();clearTimeout(leaveT);fold(b,true);}},true);

setInterval(()=>{const b=bar();
 /* hidden by the X or ⌘J (the mini Ask pill shows): forget the fold, so Show brings the bar back open (15 Nov, found in the lab) */
 if(!b&&document.querySelector('.abar-mini')&&folded){folded=false;foldedAt=0;clearTimeout(leaveT);touch();return;}
 if(!b||!wide.matches){return;}
 if(folded&&!b.classList.contains('abar-folded')){fold(b,false);return;}   /* a re-render brought the bar back open */
 const now=Date.now();
 const t=TM();
 if(!folded&&now-last>t.idle&&!busy(b))fold(b,true);
 else if(folded&&twinkles<t.max&&now-foldedAt>t.first&&now-lastTw>t.every&&now-lastScroll>2000)twinkle(b);},500);
/* page to page (15 Nov, Vit: "when the bar is compact and I switch the page it jumps to full, then goes compact itself"): a
   re-render or a new page brings a new, open bar; it takes the folded state at once, before it is painted, with no
   transition (the 500 ms check below did it a moment later, so the bar flashed open) */
let lastBar=null;
try{if(sessionStorage.getItem('laas-abar')==='folded'&&wide.matches){folded=true;foldedAt=Date.now();}}catch(e){}  /* folded on the last page */
const carry=()=>{const b=bar();if(!b||b===lastBar)return;lastBar=b;
 if(folded&&wide.matches&&!b.classList.contains('abar-folded')){b.classList.add('abar-measure');fold(b,false);void b.offsetWidth;b.classList.remove('abar-measure');}};
new MutationObserver(carry).observe(document.documentElement,{childList:true,subtree:true});carry();

/* the Ask assistant page (.d-asst): when it opens (from another page or on load, not on a re-render, which swaps it in the
   same task) its greeting sparkle winks once (15 Nov, Vit; the sidebar icon does not). The wink waits for
   the page's entry animation, or it played while the mark was still fading in */
const winkIt=m=>{if(!m||reduce.matches)return;m.classList.remove('ai-wink');void m.getBoundingClientRect();m.classList.add('ai-wink');setTimeout(()=>m.classList.remove('ai-wink'),1300);};
let asstWas=false;
const asstLook=()=>{const pg=document.querySelector('.d-asst');const now=!!pg;
 if(now&&!asstWas){const anims=(document.querySelector('.main')||document.body).getAnimations({subtree:true}).filter(a=>a.effect&&a.effect.target&&a.effect.target.contains&&a.effect.target.contains(pg.querySelector('.d-mark')||pg));
  Promise.race([Promise.all(anims.map(a=>a.finished.catch(()=>{}))),new Promise(r=>setTimeout(r,900))]).then(()=>{
   winkIt(document.querySelector('.d-asst .d-greet .d-mark svg.i'));});}  /* not the sidebar icon (15 Nov, Vit: "no animation needed in the sidebar") */
 asstWas=now;};
new MutationObserver(asstLook).observe(document.documentElement,{childList:true,subtree:true});asstLook();  /* also when the page loads on it */
/* the storybook and tests can fold it straight away */
window.LAAS=window.LAAS||{};window.LAAS.abarFold={fold:()=>fold(bar(),true),open:()=>open(bar(),true),twinkle:()=>twinkle(bar()),wink:()=>twinkle(bar(),false),state:()=>({folded,twinkles,idle:Date.now()-last,foldedFor:folded?Date.now()-foldedAt:0,sinceWink:lastTw?Date.now()-lastTw:null}),reset:()=>{twinkles=0;lastTw=0;touch();}};
})();
