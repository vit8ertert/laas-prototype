/* LAAS prototype · first-run tour (Vit 21 Oct: "a guide the first time, like Slack: little cards you follow, next,
   next, next or skip"). Starts when sign-up ends on the dashboard; replay from Flows. Cards point at the real parts of
   the page with a spotlight; Esc skips, arrow keys move. The tour lives outside the app root, so re-renders keep it. */
(function(){
const L=window.LAAS,S=L.S;
const KEY='laas-tour';
const get=()=>{try{return localStorage.getItem(KEY)}catch(e){return null}};
const set=v=>{try{localStorage.setItem(KEY,v)}catch(e){}};
const STEPS=[
  {t:'Welcome to LAAS',b:'A quick look around: five stops, about a minute. You can leave any time.',start:true},
  {sel:()=>[...document.querySelectorAll('.sidebar .nav.group')].find(e=>/Gigs/.test(e.textContent)),side:'right',t:'Gigs: everything for a show',b:'Bookings, the calendar, venues and mail sit together here, so a gig never lives in five places.'},
  {sel:()=>document.querySelector('.main [data-act=newbooking]'),t:'Start a booking',b:'Type it the way you would text it. LAAS fills in the date, fee and venue; you check it and save.'},
  {sel:()=>document.querySelector('.abar'),t:'Ask the assistant',b:'Ask about gigs, contacts or money. It drafts and suggests; nothing is sent without your OK.'},
  {sel:()=>document.querySelector('.search-pill'),t:'Find anything',b:'Venues, people, invoices and releases in one search. The shortcut is ⌘K.'},
  {sel:()=>document.querySelector('.bell'),t:'Stay on top',b:'Payments due, replies and changes land here, so you do not have to go looking.',last:true},
];
let i=-1,root=null;
const n=STEPS.length-1;
function el(){
  if(root)return root;
  root=document.createElement('div');root.className='tour';root.setAttribute('role','dialog');root.setAttribute('aria-modal','false');
  document.body.appendChild(root);
  root.addEventListener('click',e=>{const a=e.target.closest('[data-tour]');if(!a)return;const k=a.dataset.tour;
    if(k==='next')step(i+1);else if(k==='back')step(i-1);else if(k==='skip')end(false);else if(k==='done')end(true);});
  return root;
}
function card(s){
  const ic=L.ic;
  if(s.start)return `<div class="tour-card tour-center"><div class="tour-mark">${ic('ai')}</div><h3 class="t-heading">${s.t}</h3><p class="t-body muted">${s.b}</p>
    <div class="tour-foot"><button class="btn ghost s" data-tour="skip">Skip</button><span class="tour-grow"></span><button class="btn primary s" data-tour="next">Show me</button></div></div>`;
  return `<div class="tour-card"><span class="tour-arrow"></span><span class="t-meta faint">${i} of ${n}</span><h3 class="t-heading">${s.t}</h3><p class="t-body muted">${s.b}</p>
    <div class="tour-foot">${s.last?'':'<button class="btn ghost s" data-tour="skip">Skip tour</button>'}<span class="tour-grow"></span>${i>1?'<button class="btn ghost s" data-tour="back">Back</button>':''}<button class="btn primary s" data-tour="${s.last?'done':'next'}">${s.last?'Done':'Next'}</button></div></div>`;
}
function place(){
  if(i<0||!root)return;
  const s=STEPS[i],t=s.sel&&s.sel(),c=root.querySelector('.tour-card'),spot=root.querySelector('.tour-spot');
  if(!c)return;
  if(!t||!t.getClientRects().length){spot.style.display='none';root.classList.add('tour-dim');c.classList.add('tour-center');c.style.left=c.style.top='';return;}
  root.classList.remove('tour-dim');c.classList.remove('tour-center');
  const r=t.getBoundingClientRect(),pad=6,W=innerWidth,H=innerHeight,cw=c.offsetWidth,ch=c.offsetHeight,gap=14;
  Object.assign(spot.style,{display:'block',left:r.left-pad+'px',top:r.top-pad+'px',width:r.width+pad*2+'px',height:r.height+pad*2+'px'});
  // prefer below, then above, then right of the target; keep 16 px inside the window
  let side='below',top=r.bottom+pad+gap,left=r.left+r.width/2-cw/2;
  if(top+ch>H-16){side='above';top=r.top-pad-gap-ch;}
  if(top<16||s.side==='right'){side='right';top=r.top+r.height/2-ch/2;left=r.right+pad+gap;}
  left=Math.max(16,Math.min(left,W-cw-16));top=Math.max(16,Math.min(top,H-ch-16));
  c.style.left=left+'px';c.style.top=top+'px';c.dataset.side=side;
  const ax=side==='right'?0:Math.max(16,Math.min(r.left+r.width/2-left,cw-16)),ay=side==='right'?Math.max(16,Math.min(r.top+r.height/2-top,ch-16)):0;
  c.style.setProperty('--ax',ax+'px');c.style.setProperty('--ay',ay+'px');
}
function step(k){
  if(k<0||k>n)return;
  i=k;const s=STEPS[i];
  if(s.sel&&!s.sel()&&S.view!=='dashboard'){L.go('dashboard');}
  el().innerHTML=`<div class="tour-spot"></div>${card(s)}`;
  root.classList.toggle('tour-dim',!!s.start);
  requestAnimationFrame(()=>{place();root.querySelector('.tour-card [data-tour=next],.tour-card [data-tour=done]')?.focus({preventScroll:true});});
  setTimeout(place,120);
}
function end(done){
  i=-1;set(done?'done':'skipped');
  if(root){root.remove();root=null;}
  L.toast(done?'You are set. Replay the tour any time from Flows':'Tour skipped. Replay it any time from Flows');
}
function start(){if(S.view!=='dashboard')L.go('dashboard');setTimeout(()=>step(0),180);}
L.tour={start,end:()=>end(false)};

// reposition on resize, scroll and every re-render of the app
addEventListener('resize',place);addEventListener('scroll',place,true);
new MutationObserver(()=>{if(i>=0)requestAnimationFrame(place);}).observe(document.body,{childList:true,subtree:true});
addEventListener('keydown',e=>{if(i<0)return;
  if(e.key==='Escape'){e.preventDefault();end(false);}
  else if(e.key==='ArrowRight'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))step(Math.min(i+1,n));
  else if(e.key==='ArrowLeft'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))step(Math.max(i-1,i>1?1:0));},true);

// first run: when sign-up ends on the dashboard (skip invites or send them)
for(const a of ['accobskip','accobsend']){const f=L.ACTIONS[a];if(!f)continue;
  L.ACTIONS[a]=function(){const r=f.apply(this,arguments);if(get()!=='done'&&get()!=='skipped')start();return r;};}
L.FLOWS.push(['First-run tour','Five cards: Gigs, new booking, assistant, search, alerts',()=>start()]);
})();
