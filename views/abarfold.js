/* Ask bar: fold when idle, then a quiet twinkle (Vit 14 Nov 2026: "A plus B, build it"; previews at
   https://claude.ai/artifact/Pc96Hgx7wNCDJkyszoDQR2; Figma Assistant bar 141:493, State Idle -> Collapsed).
   A: after 20 s with no typing, clicking, scrolling, pointer near the bar or focus in it (and an empty field), the bar
      shrinks into the lime Ask pill at its right edge with a spring; hover, focus or a click opens it again the same way,
      and leaving it empty folds it back after a moment.
   B: folded for 45 s, the sparkle twinkles once (the big star turns a quarter, the small one pops); at most once a
      minute, never while the page scrolls, at most three times per page visit.
   Wide screens only (phones have the Ask button in the tab bar). With reduced motion the bar folds without the spring
   and never twinkles. One standalone script for the prototype and Django: it finds .abar in the page each time, so a
   prototype re-render keeps the folded state. */
(function(){
"use strict";
const IDLE=20000,FIRST=45000,EVERY=60000,MAX=3,NEAR=80;
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
function fold(b,animate){if(!b||b.classList.contains('abar-folded'))return;
 const g=geometry(b),pill=104;
 b.style.width=g.width+'px';b.style.marginLeft=g.left+'px';b.style.marginRight='0px';
 if(animate&&!reduce.matches){b.classList.add('abar-anim');void b.offsetWidth;}
 b.classList.add('abar-folded');b.style.width=pill+'px';b.style.marginLeft=(g.left+g.width-pill)+'px';
 b.setAttribute('aria-label','Ask the assistant (folded, hover or focus to open)');
 folded=true;foldedAt=Date.now();
 if(animate)setTimeout(()=>b.classList.remove('abar-anim'),700);}
function open(b,animate){if(!b||!b.classList.contains('abar-folded'))return;
 const p=b.parentElement.getBoundingClientRect(),cs=getComputedStyle(b);
 b.classList.remove('abar-folded');
 const prevW=b.style.width,prevL=b.style.marginLeft;b.style.width='';b.style.marginLeft='';b.style.marginRight='';
 const g=geometry(b);b.style.width=prevW;b.style.marginLeft=prevL;b.style.marginRight='0px';
 if(animate&&!reduce.matches){b.classList.add('abar-anim');void b.offsetWidth;}
 b.style.width=g.width+'px';b.style.marginLeft=g.left+'px';
 folded=false;touch();b.removeAttribute('aria-label');
 setTimeout(()=>{if(!b.classList.contains('abar-folded')){b.classList.remove('abar-anim');b.style.width='';b.style.marginLeft='';b.style.marginRight='';}},animate&&!reduce.matches?700:0);}
function twinkle(b){if(reduce.matches)return;const ic=b.querySelector(':scope > svg.i');if(!ic)return;
 ic.classList.remove('abar-tw');void ic.getBoundingClientRect();ic.classList.add('abar-tw');
 setTimeout(()=>ic.classList.remove('abar-tw'),1500);lastTw=Date.now();twinkles++;}

/* hover, focus or a click opens it; leaving it empty folds it back */
document.addEventListener('pointerover',e=>{const b=e.target.closest&&e.target.closest('.abar.assistant-bar');if(b&&folded){clearTimeout(leaveT);open(b,true);}});
document.addEventListener('pointerout',e=>{const b=e.target.closest&&e.target.closest('.abar.assistant-bar');if(!b||b.contains(e.relatedTarget))return;
 clearTimeout(leaveT);leaveT=setTimeout(()=>{if(foldedAt&&!busy(b)&&Date.now()-last>1200)fold(b,true);},1600);});
document.addEventListener('focusin',e=>{const b=e.target.closest&&e.target.closest('.abar.assistant-bar');if(b&&folded)open(b,true);});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.abar.assistant-bar.abar-folded');if(b){e.preventDefault();e.stopPropagation();open(b,true);setTimeout(()=>b.querySelector('input')?.focus(),360);}},true);

setInterval(()=>{const b=bar();if(!b||!wide.matches){return;}
 if(folded&&!b.classList.contains('abar-folded')){fold(b,false);return;}   /* a re-render brought the bar back open */
 const now=Date.now();
 if(!folded&&now-last>IDLE&&!busy(b))fold(b,true);
 else if(folded&&twinkles<MAX&&now-foldedAt>FIRST&&now-lastTw>EVERY&&now-lastScroll>2000)twinkle(b);},500);
/* the storybook and tests can fold it straight away */
window.LAAS=window.LAAS||{};window.LAAS.abarFold={fold:()=>fold(bar(),true),open:()=>open(bar(),true),twinkle:()=>twinkle(bar()),state:()=>({folded,twinkles})};
})();
