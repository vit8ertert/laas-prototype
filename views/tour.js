/* LAAS prototype · tours and page guides (Vit 21 Oct: "a guide the first time, like Slack: little cards you follow,
   next, next or skip"; "guides also need to be on different pages"; "a tour link in the menu at the bottom").
   - First-run tour on the dashboard when sign-up ends.
   - A short guide on each main page the first time it opens (after the first-run tour is done or skipped).
   - "Guide" at the bottom of the menu, and Flows, replay the guide for the page you are on.
   Cards point at the real parts of the page with a spotlight; Esc skips, arrow keys move. The tour lives outside the
   app root, so re-renders keep it. Never runs in headless Chrome (the Figma audit and compare tools). */
(function(){
const L=window.LAAS,S=L.S;
L.P.help='<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>';
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const HEADLESS=/HeadlessChrome/.test(navigator.userAgent);
const $=(...sels)=>{for(const s of sels){const e=[...document.querySelectorAll(s)].find(x=>x.getClientRects().length&&x.getBoundingClientRect().width>0);if(e)return e;}return null;};
const grp=n=>()=>[...document.querySelectorAll('.sidebar .nav.group')].find(e=>new RegExp(n).test(e.textContent));

const TOURS={
 first:[
  {t:'Welcome to LAAS',b:'A quick look around: five stops, about a minute. You can leave any time.',start:true},
  {sel:grp('Gigs'),side:'right',t:'Gigs: everything for a show',b:'Bookings, the calendar, venues and mail sit together here, so a gig never lives in five places.'},
  {sel:()=>$('.main [data-act=newbooking]'),t:'Start a booking',b:'Type it the way you would text it. LAAS fills in the date, fee and venue; you check it and save.'},
  {sel:()=>$('.abar'),t:'Ask the assistant',b:'Ask about gigs, contacts or money. It drafts and suggests; nothing is sent without your OK.'},
  {sel:()=>$('.search-pill'),t:'Find anything',b:'Venues, people, invoices and releases in one search. The shortcut is ⌘K.'},
  {sel:()=>$('.sidebar [data-act=guide]'),side:'right',t:'Guides on every page',b:'Each page shows a short guide the first time. Open it again any time from here.',last:true},
 ],
 bookings:[
  {sel:()=>$('.main [data-act=newbooking]'),t:'New booking',b:'Start from a sentence or the full form. Drafts save as you go.'},
  {sel:()=>$('.bk-tabs','.main [class*=tabs]'),t:'Upcoming, needs you, drafts, past',b:'Needs you collects gigs waiting on a reply, a signature or a payment.'},
  {sel:()=>$('.bk-search','.main .search'),t:'Search and filter',b:'Search by title, venue or contact, then narrow by status, kind or payment.'},
  {sel:()=>$('.bk-table .bk-tr:not(.bk-th)','.bk-table','.main table'),t:'Open a gig',b:'Each row opens the booking: agreement, money, people and the day sheet.',last:true},
 ],
 booking:[
  {sel:()=>$('.main [data-act=statusmenu2]'),t:'Status follows documents',b:'Sending the offer, a signature or a payment moves the status. You can still move it by hand.'},
  {sel:()=>$('.bd-sec','.main section'),t:'Agreement and money',b:'Details, fee, deposit and costs in one place. Edit any section where it sits.'},
  {sel:()=>$('.bd-panel','.main aside'),side:'left',t:'Next up',b:'What is left before the gig, in order. Tick things off or let the documents do it.'},
  {sel:()=>$('.abar'),t:'Ask about this gig',b:'The assistant already knows this booking: ask it to nudge the venue or draft the invoice.',last:true},
 ],
 gigday:[
  {sel:()=>$('.bd-strip','.main .strip'),t:'The day at a glance',b:'Travel, load-in, soundcheck and the set on one strip. Unconfirmed times are outlined.'},
  {sel:()=>$('.bd-tl','.main section'),t:'Timeline',b:'Every step with who and where. Change a time and the band sees it.'},
  {sel:()=>$('.main [data-act=bdsendday]'),t:'Send to the band',b:'One message with the day sheet, the address and the parking code.',last:true},
 ],
 calendar:[
  {sel:()=>$('.d-month','.main [class*=month]'),t:'Your month',b:'Gigs, holds and travel days together. Open a day to see what is booked.'},
  {sel:()=>$('.main [data-act=calmonth]'),t:'Move through months',b:'Step back and forward, or jump to today.'},
  {sel:()=>$('.main [data-act=calsub]'),t:'Subscribe',b:'Add LAAS to Google, Apple or Outlook. It updates on its own.',last:true},
 ],
 contacts:[
  {sel:()=>$('.main [data-act=newcontact]'),t:'New contact',b:'Bookers, venues, crew and press. Type a company name to fill it from CVR.'},
  {sel:()=>$('.main [data-act=import]'),t:'Import',b:'Bring contacts from your mail or a spreadsheet. Duplicates are merged, nothing is sent.'},
  {sel:()=>$('.cv-search','.main .search'),t:'Search and filter',b:'Find people by name, company or city, and switch between people and venues.',last:true},
 ],
 venues:[
  {sel:()=>$('.main [data-act=newvenue]'),t:'New venue',b:'Stage, PA, load-in and the people there. Filled from CVR when you type the name.'},
  {sel:()=>$('.cv-vlist','.main [class*=list]'),t:'Every room you played',b:'Open a venue for its history, fees, notes and the next gig there.',last:true},
 ],
 mail:[
  {sel:()=>$('.ml-tabs','.main [class*=tabs]'),t:'Folders',b:'Inbox, starred, sent and the rest, from the band mail you connected.'},
  {sel:()=>$('.ml-list','.main [class*=list]'),t:'Mail next to the gig',b:'Messages link to their booking and contact, so the thread is never far.'},
  {sel:()=>$('.main [data-act=mailnew]'),t:'New mail',b:'Write from the band address. The assistant can draft it for you.',last:true},
 ],
 money:[
  {sel:()=>$('.m-tabsw','.main [class*=tabs]'),t:'Money in one place',b:'Owed to you, invoices, expenses, payouts, reports and the books.'},
  {sel:()=>$('.main [data-act=newinvoice]'),t:'New invoice',b:'From a booking or from scratch. Moms is worked out for you.'},
  {sel:()=>$('.main [data-act=addexpense]'),t:'Add expense',b:'Snap a receipt and pick the gig. It lands in the settlement.'},
  {sel:()=>$('.m-sec','.main section'),t:'Who owes what',b:'Overdue first, with a friendly reminder one click away.',last:true},
 ],
 ledger:[
  {sel:()=>$('.m-tabsw','.main [class*=tabs]'),t:'The books',b:'Overview, journal, chart of accounts and reports for your accountant.'},
  {sel:()=>$('.m-chart','.main section'),t:'In and out',b:'Income and costs month by month. Show the data table for exact numbers.',last:true},
 ],
 catalogue:[
  {sel:()=>$('.main [data-act=newrelease]'),t:'New release',b:'Title, tracks, cover and credits. LAAS checks it before it goes to the distributor.'},
  {sel:()=>$('.main [data-act=importcat]'),t:'Import your catalogue',b:'Bring releases from your distributor so earnings can be checked.',last:true},
 ],
 gear:[
  {sel:()=>$('.main [data-act=addgear]'),t:'Add gear',b:'Instruments, PA and cases with serial numbers, for insurance and the backline list.'},
  {sel:()=>$('.cat-table','.main [class*=table]'),t:'Service and value',b:'See what needs a service and what it is worth.'},
  {sel:()=>$('.main [data-act=logmaint]'),t:'Log maintenance',b:'Note a repair or a restring; the next date is set for you.',last:true},
 ],
 audience:[
  {sel:()=>$('.aud-tabs','.main [class*=tabs]'),t:'Your listeners',b:'Streaming, figures you add by hand, releases and social in one view.'},
  {sel:()=>$('.main .acc-sec','.main section'),t:'What is moving',b:'Changes since last month, from the services you connected. Nothing is posted from here.',last:true},
 ],
 social:[
  {sel:()=>$('.main [data-act=sonewpost]'),t:'New post',b:'Write once, pick the accounts, schedule it. Nothing goes out without your OK.'},
  {sel:()=>$('.bk-tabs','.main [class*=tabs]'),t:'Scheduled, drafts, posted',b:'Every post with its status and where it went.'},
  {sel:()=>$('.bk-table','.main table'),t:'Open a post',b:'See the preview per account, the results and the comments.',last:true},
 ],
 settings:[
  {sel:()=>$('.acc-nav'),side:'right',t:'Band settings',b:'Members, money, calendar feed, integrations, theme and plan.'},
  {sel:()=>$('.acc-search','.main .search'),t:'Find a setting',b:'Type what you are looking for; it jumps to the row.'},
  {sel:()=>$('.main .acc-sec'),t:'Saved as you go',b:'Changes save on their own; you see "Saved" after each edit.',last:true},
 ],
};
const PAGE={contact:'contacts',venue:'venues',thread:'mail',invoice:'money',journal:'ledger',accounts:'ledger',ledgerreport:'ledger',release:'catalogue',post:'social',comments:'social',keywords:'social',deliveries:'social'};
const guideFor=v=>TOURS[v]?v:(PAGE[v]&&TOURS[PAGE[v]]?PAGE[v]:null);

let tour=null,i=-1,root=null;
function el(){
  if(root)return root;
  root=document.createElement('div');root.className='tour';root.setAttribute('role','dialog');root.setAttribute('aria-modal','false');
  document.body.appendChild(root);
  root.addEventListener('click',e=>{e.stopPropagation();const a=e.target.closest('[data-tour]');if(!a)return;const k=a.dataset.tour;
    if(k==='next')step(i+1);else if(k==='back')step(i-1);else if(k==='skip')end(false);else if(k==='done')end(true);else if(k==='off')end(false,true);});
  return root;
}
const steps=()=>TOURS[tour]||[];
const firstReal=()=>steps()[0]&&steps()[0].start?1:0;
/* Vit 21 Oct: "add ability to skip the whole tour altogether": one link ends this tour and turns off every page guide */
const offLink=()=>`<button class="tour-off" data-tour="off">Skip the tour and all page guides</button>`;
function card(s){
  const n=steps().length-firstReal(),k=i-firstReal()+1;
  if(s.start)return `<div class="tour-card tour-center"><div class="tour-mark">${L.ic('ai')}</div><h3 class="t-heading">${s.t}</h3><p class="t-body muted">${s.b}</p>
    <div class="tour-foot"><button class="btn ghost s" data-tour="skip">Skip</button><span class="tour-grow"></span><button class="btn primary s" data-tour="next">Show me</button></div>${offLink()}</div>`;
  return `<div class="tour-card"><span class="tour-arrow"></span><span class="t-meta faint">${n>1?`${k} of ${n}`:'Guide'}</span><h3 class="t-heading">${s.t}</h3><p class="t-body muted">${s.b}</p>
    <div class="tour-foot">${s.last?'':`<button class="btn ghost s" data-tour="skip">${tour==='first'?'Skip tour':'Skip'}</button>`}<span class="tour-grow"></span>${i>firstReal()?'<button class="btn ghost s" data-tour="back">Back</button>':''}<button class="btn primary s" data-tour="${s.last?'done':'next'}">${s.last?'Done':'Next'}</button></div>${s.last?'':offLink()}</div>`;
}
function place(){
  if(i<0||!root)return;
  const s=steps()[i],t=s&&s.sel&&s.sel(),c=root.querySelector('.tour-card'),spot=root.querySelector('.tour-spot');
  if(!c)return;
  if(!t||!t.getClientRects().length){spot.style.display='none';root.classList.add('tour-dim');c.classList.add('tour-center');c.style.left=c.style.top='';return;}
  root.classList.remove('tour-dim');c.classList.remove('tour-center');
  const r=t.getBoundingClientRect(),pad=6,W=document.documentElement.clientWidth,H=document.documentElement.clientHeight,cw=c.offsetWidth,ch=c.offsetHeight,gap=14;
  // big targets (a whole table or section) get a spotlight on their visible part only
  const top0=Math.max(r.top,0),bot0=Math.min(r.bottom,H);
  Object.assign(spot.style,{display:'block',left:r.left-pad+'px',top:top0-pad+'px',width:r.width+pad*2+'px',height:Math.max(bot0-top0,0)+pad*2+'px'});
  let side='below',top=bot0+pad+gap,left=r.left+r.width/2-cw/2;
  if(s.side==='left'){side='left';top=top0+16;left=r.left-pad-gap-cw;}
  else if(s.side==='right'){side='right';top=top0+(bot0-top0)/2-ch/2;left=r.right+pad+gap;}
  else{if(top+ch>H-16){side='above';top=top0-pad-gap-ch;}
    if(top<16){side='inside';top=top0+24;left=r.left+r.width/2-cw/2;}}
  left=Math.max(16,Math.min(left,W-cw-16));top=Math.max(16,Math.min(top,H-ch-16));
  c.style.left=left+'px';c.style.top=top+'px';c.dataset.side=side;
  // final guard: keep the whole card inside the visible window (zoom, scrollbars, late font metrics)
  const vw=document.documentElement.clientWidth,vh=document.documentElement.clientHeight,b=c.getBoundingClientRect();
  if(b.right>vw-16){left-=b.right-(vw-16);c.style.left=Math.max(16,left)+'px';}
  if(b.bottom>vh-16){top-=b.bottom-(vh-16);c.style.top=Math.max(16,top)+'px';}
  const ax=Math.max(16,Math.min(r.left+r.width/2-left,cw-16)),ay=Math.max(16,Math.min(top0+(bot0-top0)/2-top,ch-16));
  c.style.setProperty('--ax',ax+'px');c.style.setProperty('--ay',ay+'px');
}
function step(k){
  if(k<0||k>=steps().length)return;
  i=k;const s=steps()[i];
  // bring an off-screen target into view inside the scrolling main panel first
  const t=s.sel&&s.sel();if(t&&!s.start){const r=t.getBoundingClientRect(),m=t.closest('.main');
    if(r.top<80||r.top>innerHeight-220){if(m)m.scrollTop+=r.top-140;else t.scrollIntoView({block:'start'});}}
  el().innerHTML=`<div class="tour-spot"></div>${card(s)}`;
  root.classList.toggle('tour-dim',!!s.start);
  requestAnimationFrame(()=>{place();root.querySelector('.tour-card [data-tour=next],.tour-card [data-tour=done]')?.focus({preventScroll:true});});
  setTimeout(place,120);setTimeout(place,420);
}
function end(done,off){
  const was=tour;i=-1;tour=null;
  if(off){set('laas-guides','off');set('laas-tour','skipped');}
  if(was==='first')set('laas-tour',done?'done':'skipped');else if(was)set('laas-guide-'+was,'seen');
  if(root){root.remove();root=null;}
  if(off)L.toast('Tour and page guides are off. Guide in the menu brings them back');
  else if(was==='first')L.toast(done?'You are set. Guides open on each page the first time':'Tour skipped. Open it again from Guide in the menu');
}
function start(name){
  if(!TOURS[name])return;
  /* phones (< 600): no spotlight tour and no page guides; one welcome sheet instead (research 31 §10: NN/g mobile
     onboarding, Apple HIG onboarding). Its targets (sidebar, assistant bar, search pill) do not exist on a phone */
  if(L.isCompact&&L.isCompact()){if(name==='first'){set('laas-tour','done');if(root){root.remove();root=null;}L.open('cxwelcome');}return;}
  if(root){root.remove();root=null;}
  tour=name;
  if(name==='first'&&S.view!=='dashboard')L.go('dashboard');
  setTimeout(()=>step(0),name==='first'?180:60);
}
/* opening a guide by hand turns guides back on */
L.tour={start:n=>{set('laas-guides','on');start(n);},end:()=>end(false)};

// page guides: the first time a page with a guide opens (after the first-run tour), unless something else is open
let lastView=null;
function maybeGuide(){
  if(HEADLESS||tour||S.view===lastView)return;
  lastView=S.view;
  const g=guideFor(S.view);
  if(!g||S.view==='onboarding'||S.overlay)return;
  const ft=get('laas-tour');if(ft!=='done'&&ft!=='skipped')return;
  if(get('laas-guides')==='off'||get('laas-guide-'+g))return;
  setTimeout(()=>{if(!tour&&guideFor(S.view)===g&&!S.overlay)start(g);},500);
}

// reposition on resize, scroll and every re-render; look for a page guide after each render
addEventListener('resize',place);addEventListener('scroll',place,true);
new MutationObserver(()=>{if(i>=0)requestAnimationFrame(place);maybeGuide();}).observe(document.body,{childList:true,subtree:true});
addEventListener('keydown',e=>{if(i<0)return;
  const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'');
  if(e.key==='Escape'){e.preventDefault();end(false);}
  else if(e.key==='ArrowRight'&&!typing)step(Math.min(i+1,steps().length-1));
  else if(e.key==='ArrowLeft'&&!typing)step(Math.max(i-1,firstReal()));},true);

// "Guide" in the menu and in Flows: the guide for this page, the full tour on the dashboard
L.ACTIONS.guide=()=>{const g=S.view==='dashboard'?'first':guideFor(S.view);if(g)start(g);else{L.toast('No guide for this page yet. Here is the tour');start('first');}};

// first run: when sign-up ends on the dashboard (skip invites or send them)
for(const a of ['accobskip','accobsend']){const f=L.ACTIONS[a];if(!f)continue;
  L.ACTIONS[a]=function(){const r=f.apply(this,arguments);const ft=get('laas-tour');if(ft!=='done'&&ft!=='skipped')start('first');return r;};}
// localhost only: ?tour=<name>&step=<n> opens a tour at a step (for Figma captures of tour states); names are fixed above
if(location.hostname==='localhost'){const q=new URLSearchParams(location.search),tn=q.get('tour'),sn=parseInt(q.get('step')||'0',10)||0;
  if(tn&&TOURS[tn])setTimeout(()=>{start(tn);setTimeout(()=>step(Math.min(sn,TOURS[tn].length-1)),400);},900);}
L.FLOWS.push(['First-run tour','Welcome, then Gigs, new booking, assistant, search and guides',()=>start('first')]);
L.FLOWS.push(['Guide for this page','The short guide every main page shows the first time',()=>L.ACTIONS.guide()]);
})();
