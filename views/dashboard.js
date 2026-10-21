/* LAAS prototype · dashboard area. Rebuilt 1:1 from the Figma section "UX · Dashboard & assistant"
   (page "Build · LAAS v1.0"). Uses window.LAAS (see index.html).
   Views: dashboard (overview, first visit, ask first, viewer, edge states), assistant (chat app), calendar (+ empty).
   Overlays: palette, notifs, thememenu (1:1 overrides), bandmenu, dashshare. */
(function(){
"use strict";
const L=window.LAAS;const S=L.S;const {ic,esc,IMG}=L;

/* ---------- icons missing in core (lucide.dev paths) ---------- */
L.P.chevr??='<path d="m9 18 6-6-6-6"/>';
L.P.share??='<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>';
L.P.square??='<rect width="18" height="18" x="3" y="3" rx="2"/>';
L.P.printer??='<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>';
L.P.link??='<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>';
L.P.msgs??='<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>';
L.P.lock??='<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>';
L.P.repeat??='<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>';

/* ---------- state ---------- */
S.dashFirst??=false;          // empty account, first visit after onboarding
S.dashStart??='overview';     // Account → Dashboard starts with: 'overview' | 'ask'
S.role??='owner';             // band switcher → View as: 'owner' | 'viewer'
S.dashEdge??={rel:'default',needs:'default',next:'gig',money:'bank'};
S.dashMode??='Ask';           // composer mode
S.shareTip??=true;
S.calMonth??=0;               // offset from October 2026
S.calView??='month';
S.asstChat??='move';S.asstLog??={};S.asstWho??=null;S.asstCtxOff??={};S.asstHist??=false;S.asstPanel??=true;

/* ---------- small building blocks ---------- */
const tag=(k,l)=>`<span class="tag ${k}">${l}</span>`;
const sh=(t,meta,act)=>`<div class="d-sh"><h3 class="t-heading">${t}</h3>${meta?(act?`<button class="d-shm link-quiet" ${act}>${meta}</button>`:`<span class="d-shm">${meta}</span>`):''}</div>`;
const kpi=(label,val,delta,o={})=>`<${o.go?'button':'div'} class="d-kpi ${o.att?'att':''}" ${o.go||''}><span class="d-kl">${label}</span><span class="d-kv ${o.faint?'faint':''}">${val}</span><span class="d-kd ${o.att?'attc':o.ok?'okc':''}">${delta}</span></${o.go?'button':'div'}>`;
const card=(title,meta,t,go)=>`<button class="d-card" ${go}><span class="d-cb"><b>${title}</b><small>${meta}</small></span>${t||''}${ic('chevr','s')}</button>`;
const tile=(img,t,m,go,cls='')=>`<button class="d-tile ${cls}" ${go}><img src="${IMG(img)}" alt=""><b>${t}</b><small>${m}</small></button>`;
const roleViewer=()=>S.role==='viewer';
const curBand=()=>(S.bands&&(S.bands.find(b=>b.id===S.bandId)||S.bands[0]))||{id:'lt',name:'Low Tide',ini:'LT',meta:'Owner: 3 members'};
const bn=()=>esc(curBand().name);

/* ---------- aurora wash (bg/aurora · config and its theme variants) ---------- */
const aurora=()=>`<div class="d-aurora" aria-hidden="true"><i class="a1"></i><i class="a2"></i><i class="a3"></i><i class="a4"></i><i class="a5"></i><b class="grid"></b></div>`;

/* ---------- composer (Prompt hero) ---------- */
const composer=(ph,chip)=>`<div class="d-comp">${chip?`<span class="d-ctx">${esc(chip)}<button data-act="asstctxoff" aria-label="Remove context">${ic('x','s')}</button></span>`:''}<textarea id="ask" rows="2" placeholder="${esc(ph)}" aria-label="Ask the assistant"></textarea>
 <div class="d-compbar"><button class="btn ghost s" data-act="addctx">${ic('plus','s')}Add context</button><span style="flex:1"></span><button class="d-mode" data-act="askmode">${S.dashMode}${ic('down','s')}</button><button class="btn accent" data-act="ask">${ic('send','s')}Send</button></div></div>`;
const chips=list=>`<div class="d-chips">${list.map(([t,a,q])=>`<button class="d-chip" data-act="${a}" ${q?`data-q="${esc(q)}"`:''}>${ic('ai','s')}${t}</button>`).join('')}</div>`;

/* ---------- copy per genre for the first visit (UX · Themes & mode tests) ---------- */
const FIRST={
 label:{q:'What should we set up first, Vital?',sub:'{B} is empty so far. Ask me to add something, or pick a start below. Nothing is saved until you confirm.',ph:'Add a gig, find who owes us, move a rehearsal…',chips:['Add our next gig','Import my calendar','Who still owes us an invoice?','Show me a sample band'],body:'Create the first booking, import a calendar, or look around a sample band marked as test.',cards:[['stagedive','Create a booking','Date, venue, fee, people'],['notebook','Import calendar','Google, Microsoft 365 or .ics'],['rehearsal','Sample band','Marked as test, delete any time']]},
 metal:{q:'What are we unleashing first?',sub:'{B} has nothing on the calendar. Silence, for now. Ask, or pick a start below; nothing is written until you confirm.',ph:'Add a gig, find who owes us, move a rehearsal…',chips:['Add our next gig','Import my calendar','Who still owes us an invoice?','Show me a sample band'],body:'Create the first booking, import a calendar, or look around a sample band marked as test.',cards:[['stagedive','Create a booking','Date, venue, fee, people'],['notebook','Import calendar','Google, Microsoft 365 or .ics'],['rehearsal','Sample band','Marked as test, delete any time']]},
 electronic:{q:'Status, {B}: nothing loaded.',sub:'Input a booking, import a calendar, or load the sample set. 0 records written until you confirm.',ph:'Add a gig, find who owes us, move a rehearsal…',chips:['Add our next gig','Import my calendar','Who still owes us an invoice?','Show me a sample band'],body:'Create the first booking, import a calendar, or look around a sample band marked as test.',cards:[['electronic-warehouse','Add a set','Date, club, slot, fee'],['notebook','Import calendar','Google, Microsoft 365 or .ics'],['rehearsal','Load sample set','Test data, wipe any time']]},
 classical:{q:'What is on the programme today?',sub:'Add an engagement, import the diary, or look at a sample season.',ph:'Add a concert, find who owes us, move a rehearsal…',chips:['Add our next concert','Import my calendar','Who still owes us an invoice?','Show me a sample season'],body:'Add the first engagement, import a diary, or look around a sample ensemble marked as test.',cards:[['odense-live','Add an engagement','Date, hall, fee, players'],['notebook','Import calendar','Google, Microsoft 365 or .ics'],['classical-village-hall','Sample ensemble','Test season, delete any time']]},
};

function firstVisit(){const c0=FIRST[S.genre]||FIRST.label;const c={...c0,q:esc(c0.q.split('{B}').join(curBand().name)),sub:esc(c0.sub.split('{B}').join(curBand().name))};const acts=['newbooking','importcal','sampleband'];
 return `<div class="page d-page d-first">${aurora()}<div class="d-hero">
  <h1 class="t-display">${c.q}</h1><p class="d-sub">${c.sub}</p>
  ${composer(c.ph)}
  ${chips([[c.chips[0],'newbooking'],[c.chips[1],'importcal'],[c.chips[2],'askq','Who still owes us an invoice?'],[c.chips[3],'sampleband']])}
 </div>
 <section class="d-empty"><div class="d-eh"><h2 class="t-title">Or start by hand</h2><p class="muted">${c.body}</p></div>
  <div class="d-choices">${c.cards.map(([im,t,m],i)=>`<button class="d-choice" data-act="${acts[i]}"><img src="${IMG(im)}" alt=""><b>${t}</b><small>${m}</small></button>`).join('')}</div></section>
 </div>`;}

/* ---------- dashboard sections ---------- */
const DAY=[['14:00','Load-in','Back entrance, ask for Mette'],['16:30','Soundcheck','45 min, house engineer'],['19:00','Doors','Guest list 6, laminates at the desk'],['20:00','Set','75 min, encore allowed',1],['23:00','Curfew','Load-out by 23:45']];
function tonight(){const v=roleViewer();
 return `<div class="d-tonight" data-sec="tonight" role="button" tabindex="0" data-go="gigday"><img src="${IMG('stagedive')}" alt=""><div class="d-tt">${tag('confirmed','Confirmed')}<span class="d-k">Tonight, LT-0041</span></div><span style="flex:1"></span>
  <h2>Hotel gig, Hotel Skov, Aarhus</h2><div class="d-tm">${v?'Load-in 14:00, on stage 20:00':'<span>'+'Load-in 14:00, doors 19:00, set 20:00, 4.500 DKK, Mette +45 …'+'</span>'}${v?'':`<span class="btn secondary s" data-go="gigday">${ic('chevr','s')}Open day sheet</span>`}</div></div>`;}
function daysheet(){const v=roleViewer();
 return `<section class="d-sec" data-sec="coming">${sh('Day sheet','Fri 24 Oct, v2, updated 16:40, crew copy')}
 <div class="d-sheet"><div class="d-dh"><img class="thumb s" src="${IMG('hotel-skov')}" alt=""><span class="mono d-id">LT-0041</span><b>Saturday hotel gig</b><small>${v?'Hotel Skov, Aarhus':'Hotel Skov, 4.500 DKK'}</small>${tag('confirmed','Confirmed')}<button class="d-v" data-act="dashver">v2</button><button class="btn secondary s" data-act="dashshare">${ic('down','s')}Share</button></div>
  ${DAY.map(([t,a,b,ok])=>`<button class="d-row" data-go="gigday"><span class="mono d-time">${t}</span><span class="d-rt"><b>${a}</b><small>${b}</small></span>${ok?tag('confirmed','Confirmed'):''}</button>`).join('')}
  <button class="d-row d-next" data-go="booking" data-id="b2"><img class="thumb s" src="${IMG('studio-b')}" alt=""><span class="mono d-id muted">LT-0042</span><span class="d-rt"><span>Sat 25 Oct, 14:00, Rehearsal, Studio B</span></span>${tag('draft','Draft')}</button></div></section>`;}
function next7(){const e=S.dashEdge.next;
 if(e==='nogig')return `<section class="d-sec" data-sec="coming">${sh('Next 7 days','2 bookings')}<div class="d-sheet">
  <button class="d-row" data-go="booking" data-id="b2"><span class="mono d-when">Sat 25 Oct 14:00</span><span class="d-rt"><span>Rehearsal, Studio B</span></span>${tag('draft','Draft')}</button>
  <button class="d-row" data-go="bookings"><span class="mono d-when">Fri 31 Oct 21:00</span><span class="d-rt"><span>Halloween set, Club Mono</span></span>${tag('attention','Attention')}</button></div></section>`;
 return `<section class="d-sec" data-sec="coming">${sh('Next 7 days')}<div class="d-line"><span class="muted">No bookings in the next 7 days. Next: Fri 14 Nov, Support slot, Odense.</span><button class="btn ghost s" data-act="newbooking">New booking</button></div></section>`;}
const RELS=[['cover-late-shift','Late Shift EP','3 tracks, 3 Oct 2026','data-go="catalogue"'],['catalogue-low-tide','Low Tide, single','14 Mar 2026','data-go="pastrelease" data-id="lt"'],['catalogue-first-light','First Light, single','2 Nov 2025','data-go="pastrelease" data-id="fl"']];
function releases(){const e=S.dashEdge.rel;
 if(e==='none')return `<section class="d-sec" data-sec="releases">${sh('Latest releases')}<div class="d-box"><div class="d-eh"><h3 class="t-title">No releases yet</h3><p class="muted">Add a release and its tracks; LAAS tracks it from draft to delivered.</p></div><button class="btn primary" data-act="newrelease">${ic('plus','s')}New release</button></div></section>`;
 if(e==='one')return `<section class="d-sec" data-sec="releases">${sh('Latest releases','1 in the catalogue')}<div class="d-one">${tile(...RELS[0])}<div class="d-nextfor"><b class="strong">Next for this release</b>${['Deliver to Spotify and YouTube','Add the cover art','Register the ISRC codes'].map(t=>`<div class="d-do"><span class="muted">${t}</span><button class="btn ghost s" data-go="release">Do it</button></div>`).join('')}</div></div></section>`;
 if(e==='few')return `<section class="d-sec" data-sec="releases">${sh('Latest releases','3 in the catalogue')}<div class="d-shelf s">${RELS.map(r=>tile(...r)).join('')}</div></section>`;
 if(e==='many')return `<section class="d-sec" data-sec="releases">${sh('Latest releases','Show all 12','data-go="catalogue"')}<div class="d-shelf s">${RELS.map((r,i)=>tile(r[0],r[1],i?r[2]:'3 Oct 2026',r[3])).join('')}<button class="d-more" data-go="catalogue"><b>+9</b><small>more</small></button></div></section>`;
 return `<section class="d-sec" data-sec="releases">${sh('Latest releases','Show all 4','data-go="catalogue"')}<div class="d-shelf">${RELS.map(r=>tile(...r)).join('')}</div></section>`;}
function money(){const e=S.dashEdge.money;
 if(roleViewer())return `<div class="d-money" data-sec="cash">${kpi('Cash at bank','Hidden','money is for owners and admins',{mono:false})}${kpi('Invoiced, not paid','Hidden','money is for owners and admins',{att:1,mono:false})}</div>`;
 const cash=e==='nobank'?`<div class="d-kpi ghost"><span class="d-kl faint">Cash at bank</span><span class="muted">Connect a bank to see it</span><button class="btn secondary s" data-go="integrations">Connect bank</button></div>`:kpi('Cash at bank','112.300',e==='clear'?'DKK':'DKK, outstanding 13.500',{go:'data-go="money" data-mt="payouts"'});
 const inv=e==='clear'?kpi('Invoiced, not paid','None','All 12 invoices paid',{mono:false,faint:1,go:'data-go="money" data-mt="invoices"'}):kpi('Invoiced, not paid','13.500',e==='nobank'?'from your invoices, not the bank':'3 invoices, oldest 24 days',{att:1,go:'data-go="money" data-mt="invoices"'});
 return `<div class="d-money" data-sec="cash">${cash}${inv}</div>`;}
const NEEDS=[['3 invoices not paid','LT-INV-0117, Oldest 24 days, 13.500 DKK',['attention','Attention'],'data-go="money" data-mt="invoices"'],['Shure SM58 needs a new grille','LT-GEAR-014, Gear, logged 2 Oct',['attention','Attention'],'data-go="gear"'],['1 upload in flight','LT-DEL-002, YouTube, "Live at Tape", processing',['draft','Draft'],'data-go="deliveries"'],['2 posts scheduled','LT-POST-031, Instagram, Fri and Sun',['confirmed','Confirmed'],'data-go="social"'],['Hotel Skov, Parking for the van','LT-MAIL-0409, Mette, yesterday 16:40',null,'data-go="mail"']];
function needs(){const e=S.dashEdge.needs;const v=roleViewer();
 const rows=NEEDS.map(([t,m,g,go],i)=>[t,v&&i===0?'LT-INV-0117, Oldest 24 days':m,g,go]);
 if(e==='none')return `<section class="d-sec" data-sec="needs">${sh('Needs you')}<div class="d-line"><span class="muted">Nothing needs you today. Last: invoice LT-INV-0116 paid, Tuesday.</span></div></section>`;
 if(e==='some')return `<section class="d-sec" data-sec="needs">${sh('Needs you','2 things')}<div class="d-list">${[[rows[0][0],v?'LT-INV-0117, oldest 24 days':'LT-INV-0117, oldest 24 days, 13.500 DKK',rows[0][2],rows[0][3]],rows[4]].map(([t,m,g,go],i)=>card(t,m,tag(...(g||['draft','Draft'])),go)).join('')}</div></section>`;
 if(e==='many')return `<section class="d-sec" data-sec="needs">${sh('Needs you','9 things')}<div class="d-list">${rows.map(([t,m,g,go],i)=>card(t,[v?'oldest 24 days':'oldest 24 days, 13.500 DKK','Gear, logged 2 Oct','YouTube, processing','Instagram, Fri and Sun','Mette, yesterday'][i],tag(...(g||['draft','Draft'])),go)).join('')}<button class="btn ghost s d-andmore" data-go="bookings" data-tab="need">${ic('chevr','s')}and 4 more</button></div></section>`;
 return `<section class="d-sec" data-sec="needs">${sh('Needs you','5 things, nothing else is waiting')}<div class="d-list">${rows.map(([t,m,g,go])=>card(t,m,g?tag(...g):'',go)).join('')}</div></section>`;}

function overview(){const v=roleViewer();const gig=S.dashEdge.next==='gig';
 const hide=Object.entries(S.dash).filter(([k,x])=>!x).map(([k])=>`.d-page [data-sec="${k}"]{display:none!important}`).join('');
 return `<div class="page d-page"><style>${hide}</style>
 ${v?`<div class="banner info d-banner">${ic('ai','s')}<div class="tx"><span>You are a Viewer, so this is read-only</span><span class="t-label muted">You see the calendar, day sheets and who is playing. Fees, invoices and settings are hidden. Ask an owner if you need more.</span></div></div>`:''}
 <div class="ph"><div class="grow"><h1 class="t-display">Good morning, ${v?'Anna':'Vital'}</h1><p>${gig?'Show day, Hotel Skov tonight, 3 loose ends':'A quiet day, nothing on stage today'}</p></div><button class="btn secondary" data-act="customise">Customise</button>${v?'':`<button class="btn accent" data-act="newbooking">${ic('plus','s')}New booking</button>`}</div>
 <div class="d-grid"><div class="d-left">${gig?tonight()+daysheet():next7()}${releases()}</div>
  <aside class="d-right">${money()}${needs()}</aside></div></div>
 ${L.abar(null,v?'Ask about the band’s plans: when is the next gig, what time is load-in. Money questions are for owners':`Ask about ${bn()}: gigs, contacts, gear, money`)}`;}

function askFirst(){
 return `<div class="page d-page d-askfirst">${aurora()}<div class="d-hero">
  <h1 class="t-display">What is happening today for ${bn()}?</h1>
  ${composer('Add a gig, find who owes us, move a rehearsal…')}
  ${chips([['What is coming up this week?','askq','What is coming up this week?'],['Who still owes us an invoice?','askq','Who still owes us an invoice?'],['Move the hotel gig to Saturday','asksugg','plan'],['Draft a reply to Hotel Skov','askq','Draft a reply to Hotel Skov']])}</div>
 <section class="d-sec">${sh('Coming up','Next 7 days')}<div class="table-wrap d-table"><table><colgroup><col style="width:164px"><col><col style="width:124px"><col style="width:164px"><col style="width:144px"><col style="width:174px"><col style="width:124px"></colgroup><thead><tr><th>When</th><th>Title</th><th>Type</th><th>Where</th><th>Status</th><th>Payment</th><th class="num">Fee</th></tr></thead><tbody>
  <tr data-go="booking" data-id="b1"><td class="d-tw">Fri 24 Oct 20:00</td><td><span class="title-cell"><img class="thumb s r8" src="${IMG('hotel-skov')}" alt="">Saturday hotel gig</span></td><td class="muted">Concert</td><td class="muted">Aarhus</td><td>${tag('confirmed','Confirmed')}</td><td class="muted">Invoiced</td><td class="num mono">4.500</td></tr>
  <tr data-go="booking" data-id="b2"><td class="d-tw">Sat 25 Oct 14:00</td><td><span class="title-cell"><img class="thumb s" src="${IMG('studio-b')}" alt="">Rehearsal</span></td><td class="muted">Rehearsal</td><td class="muted">Studio B</td><td>${tag('draft','Draft')}</td><td class="muted">—</td><td class="num mono">—</td></tr></tbody></table></div></section>
 <div class="d-cols"><section class="d-sec">${sh('Waiting for you','3 things')}<div class="d-list">${card('Confirm the new date with Hotel Skov','Proposal from the assistant, 2 changes',tag('accent','Changed'),'data-act="asksugg" data-q="plan"')}${card('3 invoices not paid','Oldest 24 days, 13.500 DKK',tag('attention','Attention'),'data-go="money" data-mt="invoices"')}${card('Reply to Mette about parking','Mail, yesterday 16:40',tag('draft','Draft'),'data-go="mail"')}</div></section>
 <section class="d-sec">${sh('Audience','Last 28 days, Spotify, YouTube')}<div class="d-tiles">${kpi('Listeners','2.140','+6% vs previous 28 days',{ok:1,go:'data-go="audience" data-at="overview"'})}${kpi('Followers','812','Spotify 640, YouTube 172',{go:'data-go="audience" data-at="streaming"'})}${kpi('Streams','9.300','−3% vs previous 28 days',{go:'data-go="audience" data-at="streaming"'})}${kpi('Top city','Aarhus','31% of listeners',{mono:false,go:'data-go="audience" data-at="overview"'})}</div></section></div>
 <button class="btn ghost s d-switch" data-act="dashstart" data-v="overview">${ic('dashboard','s')}Show the overview instead</button></div>`;}

L.VIEWS.dashboard=()=>S.dashFirst?firstVisit():(S.dashStart==='ask'&&!roleViewer())?askFirst():overview();

/* ---------- customise drawer: sections plus the prototype edge states ---------- */
const EDGE=[['next','Next 7 days',[['gig','Gig today'],['nogig','No gig today'],['nothing','Nothing in 7 days']]],['needs','Needs you',[['none','None'],['some','1 to 5'],['default','5'],['many','More than five']]],['rel','Latest releases',[['none','None'],['one','One'],['few','2 to 4'],['default','4, large'],['many','5 or more']]],['money','Money',[['bank','Bank connected'],['clear','Nothing outstanding'],['nobank','Bank not connected']]]];
L.DR.customise=()=>({type:'drawer',title:'Customise dashboard',sub:'Pick what shows on your start page',body:`<div class="sec">${[['tonight','Tonight, next gig photo'],['coming','Day sheet, next 7 days'],['releases','Latest releases'],['cash','Money'],['needs','Needs you']].map(([k,l])=>`<label class="row" style="gap:12px;cursor:pointer"><input type="checkbox" data-dash="${k}" ${S.dash[k]?'checked':''} style="width:18px;height:18px;accent-color:var(--accent-strong)">${l}</label>`).join('')}<p class="t-meta muted" style="margin:0">Only for you. Bandmates keep their own layout.</p></div>
 <div class="sec"><h3 class="t-heading">Start with</h3><div class="d-seg">${[['overview','Overview'],['ask','A question']].map(([k,l])=>`<button class="${S.dashStart===k?'on':''}" data-act="dashstart" data-v="${k}">${l}</button>`).join('')}</div></div>
 <div class="sec"><h3 class="t-heading">Edge states</h3><p class="t-meta muted" style="margin:0">Prototype only: see each section at every count. Never a zero, never a lone tile in a wide space.</p>${EDGE.map(([k,l,opts])=>`<div class="field"><label>${l}</label><div class="d-seg">${opts.map(([v,t])=>`<button class="${S.dashEdge[k]===v?'on':''}" data-act="dashedge" data-k="${k}" data-v="${v}">${t}</button>`).join('')}</div></div>`).join('')}</div>`,
 foot:`<button class="btn ghost" data-act="resetdash">${ic('undo','s')}Reset</button><span style="flex:1"></span><button class="btn accent" data-act="close">Done</button>`});

/* ---------- calendar ---------- */
const CAL_EVENTS={'2026-10-2':{img:'studio-b',ev:[['draft','Rehearsal','data-go="booking" data-id="b2"']]},'2026-10-10':{img:'club-mono',ev:[['confirmed','Club night, Odense','data-go="booking" data-id="p2"']]},'2026-10-24':{img:'hotel-skov',ev:[['confirmed','Saturday hotel gig','data-go="booking" data-id="b1"'],['draft','Load-in 14:00','data-go="gigday"']]},'2026-10-25':{img:'studio-b',ev:[['draft','Rehearsal','data-go="booking" data-id="b2"']]},'2026-10-31':{img:'loppen',ev:[['attention','Halloween set','data-go="bookings"']]}};
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],WDL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],MON3=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const dayLong=dt=>`${WD[dt.getDay()]} ${dt.getDate()} ${MON3[dt.getMonth()]} ${dt.getFullYear()}`;
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
/* Vit 21 Oct: the Calendar opens on the month with the band's gigs; the empty state is its own flag (no longer tied to the first-visit dashboard) */
L.VIEWS.calendar=()=>{const empty=!!S.calEmpty;const d0=new Date(2026,9+S.calMonth,1);const y=d0.getFullYear(),m=d0.getMonth();
 const start=new Date(y,m,1-((d0.getDay()+6)%7));const weeks=[];let d=new Date(start);
 do{const w=[];for(let i=0;i<7;i++){w.push(new Date(d));d.setDate(d.getDate()+1);}weeks.push(w);}while(d.getMonth()===m);
 const head=`<div class="ph"><div class="grow"><h1 class="t-display">${MONTHS[m]} ${y}</h1><p>${empty?'Nothing yet, holds hatched, confirmed solid, cancelled outlined':S.calMonth===0?'3 bookings, 1 rehearsal, 1 draft':'Nothing booked yet this month'}</p></div>
  <div class="d-monthnav"><button class="btn secondary s icon" data-act="calmonth" data-v="-1" aria-label="Previous month">${ic('chevl','s')}</button><button class="btn secondary s" data-act="calmonth" data-v="0">Today</button><button class="btn secondary s icon" data-act="calmonth" data-v="1" aria-label="Next month">${ic('chevr','s')}</button></div>
  <button class="btn secondary" data-act="calsub">Subscribe</button><button class="btn ghost" data-act="calsync">Sync settings</button><button class="btn accent" data-act="newbooking">${ic('plus','s')}New booking</button></div>`;
 if(empty)return `<div class="page d-page">${head}<section class="d-box wide"><div class="d-eh"><h2 class="t-title">Nothing on the calendar yet</h2><p class="muted">Bring your dates over, connect a calendar for two-way sync, or add the next gig. Holds and enquiries will show hatched; confirmed gigs solid.</p></div>
  <div class="d-choices three">${[['stagedive','Add a gig','Date and venue are enough to start','newbooking'],['notebook','Connect a calendar','Google or Microsoft 365, two-way, holds stay tentative','calsync'],['catalogue-distributor','Import a file','.ics or CSV from your old tool, one-off','importcal']].map(([im,t,s,a])=>`<button class="d-choice sunk" data-act="${a}"><img src="${IMG(im)}" alt=""><b>${t}</b><small>${s}</small></button>`).join('')}</div></section></div>${L.abar(null,'Ask: “we play Loppen on 14 Nov, doors 20:00”, the assistant adds it behind Confirm')}`;
 const cell=dt=>{const k=`${dt.getFullYear()}-${dt.getMonth()+1}-${dt.getDate()}`;const e=CAL_EVENTS[k];const out=dt.getMonth()!==m;const today=k==='2026-10-19';
  return `<div class="d-day ${out?'out':''} ${today?'today':''} ${e?'photo':''}" ${e?`style="background-image:linear-gradient(color-mix(in srgb,var(--canvas) 20%,transparent),color-mix(in srgb,var(--canvas) 85%,transparent)),url('${IMG(e.img)}')"`:''}><span class="d-dn">${dt.getDate()}</span>${roleViewer()?'':`<button class="d-add" data-act="caladd" data-d="${dt.getFullYear()}-${dt.getMonth()+1}-${dt.getDate()}" aria-label="New booking on ${dayLong(dt)}" title="New booking on ${dayLong(dt)}">${ic('plus','s')}</button>`}${e?e.ev.map(([k2,t,go])=>`<button class="d-ev ${k2}" ${go}>${t}</button>`).join(''):''}</div>`;};
 const rows=S.calView==='week'?weeks.filter(w=>w.some(x=>x.getDate()===24&&x.getMonth()===m)).slice(0,1).concat(S.calMonth?[weeks[0]]:[]).slice(0,1):weeks;
 return `<div class="page d-page">${head}
 <div class="d-legend"><button class="d-pill ${S.calView==='month'?'on':''}" data-act="calview" data-v="month">Month</button><button class="d-pill ${S.calView==='week'?'on':''}" data-act="calview" data-v="week">Week</button><button class="d-pill" data-go="gigday">Day sheet</button><span style="flex:1"></span>${tag('confirmed','Confirmed')}${tag('draft','Draft')}${tag('attention','Attention')}${tag('paid','Paid')}</div>
 <div class="d-month ${S.calView==='week'?'week':''}"><div class="d-wd">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=>`<span>${x}</span>`).join('')}</div>${rows.map(w=>`<div class="d-wk">${w.map(cell).join('')}</div>`).join('')}</div></div>
 ${L.abar(null,`Ask about ${bn()}: gigs, contacts, gear, money`)}`;};

/* ---------- assistant (chat app: history, centred column, pinned composer) ---------- */
const CHATS=[['move','Today','Move the hotel gig to Saturday','Saturday hotel gig'],['owed','Today','Who still owes us money?','Money'],['parking','Yesterday','Parking code for Hotel Skov','Hotel Skov'],['setlist','Yesterday','Set list for Saturday','Saturday hotel gig'],['loppen','Earlier','Spring dates at Loppen','Loppen'],['release','Earlier','Release plan for Late Shift EP','Late Shift EP']];
const CHAT_BODY={
 owed:['Who still owes us money?','Three invoices are open, 13.500 DKK in all. Hotel Skov’s deposit is the oldest, 8 days late; a påmindelse is drafted.',[['See what is owed','data-go="money" data-mt="owed"'],['Open Hotel Skov booking','data-go="booking" data-id="b1"']]],
 parking:['Did Kasper send the parking code for Hotel Skov?','Not yet. I asked him on 18 Oct by SMS and email. Load-in is 14:00, so I can ask again now.',[['Ask Kasper again','data-act="parking"'],['Open the venue','data-go="venue" data-id="royal"']]],
 setlist:['What is on the set list for Saturday?','Set list v3 from Sofie: 12 songs, about 72 minutes, encore allowed. The day sheet has it.',[['Open day sheet','data-go="gigday"']]],
 loppen:['Can we play Loppen again in spring?','You played Loppen on 18 Oct, rated 5. I can draft a mail to the booker for a Saturday in March or April.',[['Open Loppen','data-go="venue" data-id="loppen"'],['Draft the mail','data-act="toast" data-msg="Draft saved in Mail, nothing sent"']]],
 release:['What is left before Late Shift EP comes out?','Delivery to the distributor on 24 Oct needs tracks and a cover. Koda and the pitches follow.',[['Open the release','data-go="release"']]],
};
const CHANGES=[['calendar','Move booking','Saturday hotel gig → 25 Oct 20:00'],['mail','Send mail to venue','Hotel Skov, “New date for the gig”'],['users','Notify the band','3 members get the new day sheet']];
const changes=edit=>`<div class="d-changes">${CHANGES.map(([i,t,m],n)=>`<div class="d-change">${ic(i)}<span class="d-rt">${edit?`<input class="input" value="${esc(t+': '+m)}" aria-label="Change ${n+1}">`:`<b>${t}</b><small>${m}</small>`}</span></div>`).join('')}</div>`;
function moveChat(){const a=['plan','done','cancelled'].includes(S.asst)?S.asst:(S.asstMove||'plan');S.asstMove=a;
 const plan=a==='plan'?`<div class="d-confirm live"><div class="d-ch">${ic('ai','ai')}<h3 class="t-heading">I will make 3 changes</h3></div>${changes(S.asstEdit)}
   ${S.asstWho?`<div class="d-amb ok">${ic('check','s')}<span>The mail goes to ${S.asstWho==='Mette'?'Mette Krogh (booking)':'Jonas Beck (bar)'}.</span><button class="btn ghost s" data-act="asstwho" data-v="">Change</button></div>`:`<div class="d-amb">${ic('alert','s')}<span>Two contacts at Hotel Skov. Which one gets the mail?</span><button class="btn secondary s" data-act="asstwho" data-v="Mette">Mette</button><button class="btn secondary s" data-act="asstwho" data-v="Jonas">Jonas</button></div>`}
   <div class="d-acts"><button class="btn ghost" data-act="asstcancel">Cancel</button><button class="btn secondary" data-act="asstedit">${S.asstEdit?'Done editing':'Edit'}</button><button class="btn accent" data-act="asstconfirm">${ic('check')}Confirm</button></div></div>
   <div class="d-chips left">${[['Also move the rehearsal','also'],['Show the mail first','mail'],['What does Mette usually reply?','mette',1]].map(([t,k,i])=>`<button class="d-chip" data-act="asstreply" data-k="${k}">${i?ic('ai','s'):''}${t}</button>`).join('')}</div>`
  :a==='done'?`<div class="d-confirm"><div class="d-ch">${ic('check')}<h3 class="t-heading">Done, 3 changes made</h3></div>${changes()}<div class="d-acts"><button class="btn secondary" data-go="booking" data-id="b1">${ic('chevr')}Open booking</button><button class="btn secondary" data-act="asstundo">${ic('undo')}Undo</button></div></div>`
  :`<p class="muted d-note">Cancelled. Nothing was changed.</p><div class="d-chips left"><button class="d-chip" data-act="asksugg" data-q="plan">${ic('repeat','s')}Make the plan again</button></div>`;
 return `<div class="d-confirm past"><div class="d-ch">${ic('check')}<h3 class="t-heading">Yesterday, 2 changes made</h3></div>${changes()}<div class="d-acts"><button class="btn secondary" data-act="toast" data-msg="Yesterday’s 2 changes undone" data-undo="1">${ic('undo')}Undo</button></div></div>
 <div class="d-user">Move the hotel gig to Saturday 25 Oct and tell the venue</div>
 <div class="d-turn"><div class="d-ah">${ic('ai','s')}<b>Saturday 25 Oct is free. I can move it and draft the mail.</b></div>
 <div class="d-checked"><span class="faint">I checked</span>${['Calendar, 25 Oct has no booking, rehearsal at 14:00 ends 16:00','Booking LT-0041, confirmed, fee 4.500 DKK, deposit not yet invoiced','Contacts, Hotel Skov has two contacts: Mette (booking) and Jonas (bar)'].map(t=>`<span>${ic('check','s')}${t}</span>`).join('')}</div>${plan}</div>`;}
const extra=id=>(S.asstLog[id]||[]).map(([q,r])=>`<div class="d-user">${esc(q)}</div><div class="d-turn"><div class="d-ah">${ic('ai','s')}<span>${r}</span></div></div>`).join('');
function chatBody(id){if(id==='move')return moveChat();if(id==='q')return `<div class="d-user">${esc(S.asstQ||'')}</div><div class="d-turn"><div class="d-ah">${ic('ai','s')}<span>Here is where ${bn()} stands: 3 loose ends today, 8.500 DKK owed to you, and the next gig is tonight at Hotel Skov.</span></div><div class="d-chips left"><button class="d-chip" data-go="gigday">Open day sheet</button><button class="d-chip" data-go="money">See what is owed</button></div></div>`;
 const c=CHAT_BODY[id];return `<div class="d-user">${c[0]}</div><div class="d-turn"><div class="d-ah">${ic('ai','s')}<span>${c[1]}</span></div><div class="d-chips left">${c[2].map(([t,a])=>`<button class="d-chip" ${a}>${t}</button>`).join('')}</div></div>`;}
function record(id){
 if(id==='move'||id==='setlist'||id==='q')return `<aside class="d-record"><div class="d-rh"><span class="mono d-id">LT-0041</span><b class="t-heading">Saturday hotel gig</b>${tag('confirmed','Confirmed')}</div>${[['When','Fri 24 Oct 2026, 20:00, 75 min'],['Where','Hotel Skov, Aarhus, cap. 300'],['Contact','Mette Krogh, booking, +45 …'],['Fee','4.500 DKK, deposit 1.500 not invoiced'],['People','Full band, 4, driver: Jonas'],['Files','Rider v3, Stage plot, Contract (signed)']].map(([k,v])=>`<div class="d-kvr"><small>${k}</small><span>${v}</span></div>`).join('')}<span style="flex:1"></span><button class="btn secondary" data-go="booking" data-id="b1">Open booking</button></aside>`;
 if(id==='parking'||id==='loppen'){const v=L.V(id==='parking'?'royal':'loppen');return `<aside class="d-record"><div class="d-rh"><img class="thumb s" src="${IMG(v.img)}" alt=""><b class="t-heading">${v.name}</b></div>${[['City',v.city],['Kind',v.kind+', '+v.cap],['Played',v.played+' gigs, rated '+v.rating],['Contact',id==='parking'?'Mette Krogh, booking':'Booker, by email']].map(([k,x])=>`<div class="d-kvr"><small>${k}</small><span>${x}</span></div>`).join('')}<span style="flex:1"></span><button class="btn secondary" data-go="venue" data-id="${v.id}">Open venue</button></aside>`;}
 return '';}
L.VIEWS.assistant=()=>{
 /* the menu keeps whatever state the user left it in (Vit, 21 Oct: no auto-collapse on the Assistant) */
 const isNew=S.asst==='new';const id=S.asst==='q'?'q':S.asstChat;
 const list=(S.asstQ&&S.asst!=='new'?[['q','Today',S.asstQ,'']]:[]).concat(CHATS);
 const groups=['Today','Yesterday','Earlier'].map(g=>[g,list.filter(c=>c[1]===g)]);
 const hist=`<nav class="d-hist ${S.asstHist?'open':''}" aria-label="Chats"><button class="btn secondary d-newchat" data-act="asstnew">${ic('plus')}New conversation</button>${groups.map(([g,cs])=>`<div class="d-hg"><span class="faint">${g}</span>${cs.map(([cid,,t,link])=>`<button class="d-hi ${!isNew&&cid===id?'on':''}" data-act="asstchat" data-id="${cid}"><span>${esc(t)}</span>${link?`<small>${link}</small>`:''}</button>`).join('')}</div>`).join('')}<span class="d-hsp"></span><button class="d-hfoot" data-go="tools">${ic('help','s')}<span><b>What it can do</b><small>17 look-ups, 11 changes it proposes</small></span></button></nav>`;
 const ctx=id==='move'&&!isNew&&!S.asstCtxOff.move?'LT-0041, Hotel gig':id==='parking'&&!S.asstCtxOff.parking?'Hotel Skov':null;
 const sugg=[['Move the hotel gig to Saturday 25 Oct and tell the venue','plan'],['Who still owes us money?','money'],['What is left before Saturday?','gigday'],['Nudge Mette about the offer','nudge']];
 const conv=isNew?`<div class="d-newc"><h2 class="t-title">What do you need?</h2><p class="muted">Ask about gigs, contacts or money. Nothing is sent without your OK.</p><div class="d-chips">${sugg.map(([q,k])=>`<button class="d-chip" data-act="asksugg" data-q="${k}">${ic('ai','s')}${q}</button>`).join('')}</div></div>`:chatBody(id)+extra(id);
 const rec=isNew?'':record(id);
 return `<div class="page d-page d-asst ${rec&&S.asstPanel?'withrec':''}">${hist}
 <div class="d-center"><div class="d-ahd"><button class="btn secondary s d-histbtn" data-act="assthist">${ic('msgs','s')}Chats</button><div class="grow"><h1 class="t-display">Assistant</h1><p class="muted t-body">Conversation, ${bn()}, remembered for you</p></div><button class="btn secondary" data-act="asstcan">What it can do</button>${rec?`<button class="btn ghost s icon" data-act="asstpanel" aria-label="${S.asstPanel?'Hide':'Show'} the record">${ic('panel','s')}</button>`:''}</div>
  <div class="d-conv">${conv}</div>
  <div class="d-dock">${composer(id==='move'&&!isNew?'Reply, or ask about this booking…':`Ask about ${bn()}: gigs, contacts, gear, money`,isNew?null:ctx)}</div></div>
 ${rec&&S.asstPanel?rec:''}</div>`;};

/* ---------- overlays: palette, notifications, theme menu, band menu, share ---------- */
const MAIL=[['Re: Saturday, rider and load-in','From Mette Krogh, 2 days ago'],['Parking code for Saturday','To Kasper Holm, 18 Oct'],['Offer: Club night, 15 Nov','To Club Mono, 8 Oct']];
/* search content from the Figma palette (416:17352); core data fills the rest */
const PAL_C=[['Mette Krogh, Hotel Skov','Booker, Aarhus',{go:'contact',p:{id:'c1'}},'av']];
const PAL_B=[['Saturday hotel gig','Fri 24 Oct, Hotel Skov, booked by Mette Krogh',{go:'booking',p:{id:'b1'}},'big:calendar'],['Christmas party','Tue 2 Dec, Hotel Royal, booked by Mette Kjær',{go:'bookings',p:{}},'big:calendar']];
const initials=n=>n.split(/[ ,]+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
L.OVERLAYS.palette=o=>{const q=(o.q||'').trim().toLowerCase();const res=[];const ask=q.startsWith('>');
 if(ask){res.push(['Assistant',[[`Ask the assistant: “${esc(o.q.slice(1).trim()||'…')}”`,'',{act:'palask',q:o.q.slice(1).trim()},'ai']]]);}
 else if(!q){res.push(['Recent',[['Saturday hotel gig','Booking, Fri 24 Oct, Hotel Skov',{go:'booking',p:{id:'b1'}},'img:hotel-skov'],['Mette Krogh, Hotel Skov','Contact, venue booker',{go:'contact',p:{id:'c1'}},'av'],['Late Shift EP','Release, out 14 Nov',{go:'release',p:{}},'img:cover-late-shift']]]);res.push(['Jump to',[['Bookings','',{go:'bookings',p:{}},'right'],['Calendar','',{go:'calendar',p:{}},'calendar'],['Money','',{go:'money',p:{}},'money'],['Gig day','',{go:'gigday',p:{}},'right']]]);}
 else{const hit=r=>(r[0]+' '+r[1]+' '+(r[4]||'')).toLowerCase().includes(q);
  const c=PAL_C.concat(L.CONTACTS.filter(x=>!PAL_C.some(y=>y[0]===x.name)).map(x=>[x.name,x.kind+', '+x.where,{go:'contact',p:{id:x.id}},'av'])).filter(hit).slice(0,3);
  const b=PAL_B.concat(L.BOOKINGS.filter(x=>x.id!=='b1'&&!PAL_B.some(y=>y[0]===x.title)).map(x=>[x.title,x.when.replace(/ \d\d:\d\d$/,'')+', '+(x.venue?L.V(x.venue).name:'No venue'),{go:'booking',p:{id:x.id}},'big:calendar'])).filter(hit).slice(0,3);
  const v=L.VENUES.filter(x=>x.name.toLowerCase().includes(q)).slice(0,3).map(x=>[x.name,'Venue, '+x.city,{go:'venue',p:{id:x.id}},'img:'+x.img]);
  const m=MAIL.filter(x=>(x[0]+' '+x[1]).toLowerCase().includes(q)).slice(0,1).map(x=>[x[0],x[1],{go:'mail',p:{}},'big:mail']);
  if(c.length)res.push(['Contacts',c]);if(b.length)res.push(['Bookings',b]);if(v.length)res.push(['Venues',v]);if(m.length)res.push(['Mail',m]);
  const who=c[0]?c[0][0].split(',')[0]:o.q;res.push(['Actions',[[`New booking with ${esc(who)}`,'',{act:'palnew'},'big:plus'],[`Ask the assistant about “${esc(o.q)}”`,'',{act:'palask',q:o.q},'big:ai']]]);}
 let k=0;const sel=o.sel||0;
 const lead=(l,t)=>l==='av'?`<span class="d-av">${initials(t)}</span>`:l.startsWith('img:')?`<img class="thumb s" src="${IMG(l.slice(4))}" alt="">`:l.startsWith('big:')?ic(l.slice(4),'d-big'):`<span class="d-lic">${ic(l,'s')}</span>`;
 return `<div class="scrim d-scrim" data-act="close"></div><div class="pop pal d-pal" role="dialog" aria-label="Search"><div class="f">${ic('search')}<input id="palq" value="${esc(o.q||'')}" placeholder="Search bookings, people, venues, invoices, mail" aria-label="Search"><kbd class="k">Esc</kbd></div><i class="d-pdiv"></i>
 <div class="d-res">${q&&!ask&&res.length===1?`<div class="d-nomatch"><b class="t-heading">No match for “${esc(o.q)}”</b><p class="muted">Nothing in bookings, contacts, venues or mail. Check the spelling, or start from here.</p></div>`:''}
 ${res.map(([g,items])=>`<div class="g"><div class="gl">${g}</div>${items.map(([t,m,tgt,l])=>{const i=k++;const attr=tgt.act?`data-act="${tgt.act}" ${tgt.q!=null?`data-q="${esc(tgt.q)}"`:''}`:`data-pgo="${tgt.go}" data-pp='${JSON.stringify(tgt.p)}'`;return `<button class="it ${i===sel?'on':''}" ${attr}>${lead(l,t)}<span class="d-it"><span>${tgt.act?t:L.hl(t,o.q||'')}</span>${m?`<small>${m}</small>`:''}</span></button>`}).join('')}</div>`).join('')}</div><i class="d-pdiv"></i>
 <div class="ft"><span><kbd class="k">↑↓</kbd> move</span><span><kbd class="k">↵</kbd> open</span><span><kbd class="k">⌘↵</kbd> new tab</span><span style="margin-left:auto" class="faint">Type &gt; to ask the assistant</span></div></div>`;};

const OLDER=[{t:'Studio B confirmed the rehearsal',m:'Sat 1 Nov, 14:00 to 17:00.',time:'Sun',v:'studiob',go:['booking',{id:'b2'}]},{t:'Loppen rated the release show',m:'5 of 5, “come back in spring”.',time:'Sat',v:'loppen',go:['venue',{id:'loppen'}]}];
/* thumbnails as in the Figma popover (438:21857), by position */
const NIMG=['hotel-royal','hotel-skov','club-mono','studio-b','odense-live'];
L.OVERLAYS.notifs=o=>{const N=S.notifs;const unread=N.filter(n=>n.unread).length;const need=2;
 const item=(n,i,act)=>`<div class="ni d-ni ${n.unread?'unread':''}" data-ni="${i}" role="button" tabindex="0"><span class="dot"></span><img class="thumb" src="${IMG(NIMG[i]||L.V(n.v).img)}" alt=""><span class="d-nt"><b>${n.t}</b><small class="muted">${i===4&&!/Confirmed/.test(n.m)?n.m+' Booking is Confirmed.':n.m}</small><small class="faint">${n.time}</small>${act||''}</span></div>`;
 const acts=[`<button class="btn secondary s" data-act="notifremind">Review påmindelse</button>`,`<button class="btn secondary s" data-act="notifask">Ask again</button>`];
 const list=N.map((n,i)=>[n,i]).filter(([n,i])=>o.f!=='need'||i<need);
 const today=list.filter(([n])=>/^\d\d:\d\d$/.test(n.time)),earlier=list.filter(([n])=>!/^\d\d:\d\d$/.test(n.time));
 return `<div class="scrim d-scrim0" data-act="close"></div><div class="pop notif d-notif" style="right:${o.right??16}px" role="dialog" aria-label="Notifications">
 <div class="d-nh"><b class="t-heading">Notifications</b><button class="btn ghost s d-nset" data-act="readall" ${unread?'':'disabled'}>${ic('check','s')}Mark all read</button></div>
 <div class="d-nf"><button class="${o.f!=='need'?'on':''}" data-nf="all">All</button><button class="${o.f==='need'?'on':''}" data-nf="need">Needs you<span class="c">${need}</span></button></div>
 <div class="d-nl">${today.length?`<div class="d-ng">Today</div>${today.map(([n,i])=>item(n,i,i<2?acts[i]:'')).join('')}`:''}${earlier.length?`<div class="d-ng">Earlier</div>${earlier.map(([n,i])=>item(n,i)).join('')}`:''}
 ${o.more&&o.f!=='need'?OLDER.map((n,j)=>`<div class="ni d-ni" data-act="notifold" data-i="${j}" role="button" tabindex="0"><span class="dot"></span><img class="thumb" src="${IMG(L.V(n.v).img)}" alt=""><span class="d-nt"><b>${n.t}</b><small class="muted">${n.m}</small><small class="faint">${n.time}</small></span></div>`).join(''):''}</div>
 <div class="d-nft"><button class="btn ghost s d-nsee" data-act="notifmore">${o.more?'Show less':'See all'}</button><span style="flex:1"></span><button class="btn ghost s d-nset" data-go="notifications">${ic('settings','s')}Settings</button></div></div>`;};

const THEME_SUB={label:'The LAAS look',metal:'Black and bone',electronic:'Electric navy and lime',classical:'Ivory, gold, burgundy'};
L.OVERLAYS.thememenu=o=>`<div class="scrim d-scrim0" data-act="close"></div><div class="pop d-theme" style="left:${o.x??16}px;bottom:${o.b??120}px" role="dialog" aria-label="Theme">
 <div class="d-mh">Theme for ${bn()}</div>
 ${L.THEMES.map(([id,n,d,c0])=>{const c=L.themeSw([id,n,d,c0]);return `<button class="d-opt ${S.genre===id?'on':''}" data-genre="${id}"><span class="d-prev">${c.map(x=>`<i style="background:${x}"></i>`).join('')}</span><span class="d-ot"><b>${n}</b><small>${THEME_SUB[id]||d}</small></span>${S.genre===id?ic('check','s'):''}</button>`;}).join('')}
 <div class="d-app"><span class="faint">Appearance</span><div class="seg">${[['dark','Dark','eye'],['light','Light','square'],['system','Match system','settings']].map(([k,l,i])=>`<button class="${S.appearance===k?'on':''}" data-appearance="${k}">${ic(i,'s')}${l}</button>`).join('')}</div></div>
 <div class="d-div"></div><div class="d-sug">${ic('ai','s')}<span>Your genre is indie rock: Default fits. Metal fits hardcore.</span></div>
 <button class="d-act" data-genre="label">${ic('undo','s')}Reset to default</button><button class="d-act" data-go="theme">${ic('settings','s')}Theme settings</button></div>`;

L.OVERLAYS.bandmenu=o=>`<div class="scrim d-scrim0" data-act="close"></div><div class="pop d-theme d-band" style="left:${o.x??16}px;top:${o.y??120}px" role="menu" aria-label="Band">
 <div class="d-mh">Your bands</div>
 ${(S.bands||[curBand()]).map(b=>{const on=b.id===curBand().id;return `<button class="d-opt ${on?'on':''}" role="menuitemradio" aria-checked="${on}" ${on?'data-act="close"':`data-act="switchband" data-band="${esc(b.id)}"`}>${b.logo?`<img class="d-sq" src="${esc(b.logo)}" alt="">`:`<span class="sq d-sq">${esc(b.ini||b.name.slice(0,2).toUpperCase())}</span>`}<span class="d-ot"><b>${esc(b.name)}</b><small>${on&&roleViewer()?'Viewer, manager':esc(b.meta||'')}</small></span>${on?ic('check','s'):''}</button>`;}).join('')}
 <button class="d-act" data-act="newband">${ic('plus','s')}Add a band</button>
 <div class="d-div"></div><div class="d-mh">View as</div>
 ${[['owner','Owner','Everything, money and settings'],['viewer','Viewer','Dates and day sheets, read-only']].map(([k,l,d])=>`<button class="d-opt ${S.role===k?'on':''}" data-act="setrole" data-v="${k}"><span class="d-lic">${ic(k==='owner'?'users':'eye','s')}</span><span class="d-ot"><b>${l}</b><small>${d}</small></span>${S.role===k?ic('check','s'):''}</button>`).join('')}
 <div class="d-div"></div><button class="d-act" data-go="members">${ic('settings','s')}Members and roles</button></div>`;

L.OVERLAYS.dashshare=o=>`<div class="scrim d-scrim0" data-act="close"></div><div class="pop d-share" style="left:${o.x}px;top:${o.y}px" role="menu" aria-label="Share the day sheet">
 ${S.shareTip?`<div class="d-expl"><span class="d-et"><b>Share the day sheet</b><small class="muted">Everyone gets a link that always shows the latest times. Fees stay hidden.</small></span><img src="${IMG('hotel-skov')}" alt=""><button data-act="sharetip" aria-label="Dismiss">${ic('x','s')}</button></div>`:''}
 <div class="d-menu">${[['file','Download PDF','sharepdf'],['calendar','Add to calendar','sharecal'],['send','Send to band','shareband'],null,['share','Copy link','sharelink'],['file','Print','shareprint']].map(x=>x?`<button class="d-mi" data-act="${x[2]}">${ic(x[0],'s')}${x[1]}</button>`:'<i class="d-div"></i>').join('')}</div></div>`;

/* ---------- actions ---------- */
const A=L.ACTIONS;
A.ask=(t)=>{const el=document.getElementById('ask');const q=(el?.value||'').trim();
 if(S.view==='booking'){S.booking.sheet=true;L.render();return;}
 if(S.view==='assistant'&&S.asst!=='new'){if(!q){el?.focus();return;}const id=S.asst==='q'?'q':S.asstChat;(S.asstLog[id]??=[]).push([q,id==='move'?'Noted. I added it to the plan above; nothing changes until you press Confirm.':'I looked at it. Nothing is changed without your OK; say “do it” and I will make a plan.']);L.render();setTimeout(()=>{const c=document.querySelector('.main');if(c)c.scrollTop=c.scrollHeight;document.getElementById('ask')?.focus();},30);return;}
 if(q){S.asst='q';S.asstQ=q;}else if(S.view==='assistant'){el?.focus();return;}
 L.go('assistant');};
A.asksugg=t=>{const k=t.dataset.q;if(k==='plan'){S.asst='plan';S.asstMove='plan';S.asstChat='move';S.asstWho=null;if(S.view==='assistant')L.render();else L.go('assistant');}else if(k==='nudge'){S.booking.state='offer';S.booking.cancelled=false;L.go('booking');S.booking.sheet=true;L.render();}else L.go(k);};
A.askq=t=>{S.asst='q';S.asstQ=t.dataset.q;L.go('assistant');};
A.palask=t=>{S.asst='q';S.asstQ=t.dataset.q||'Ask about '+curBand().name;L.go('assistant');};
A.palnew=()=>{S.overlay=L.DR.newbooking(S.overlay?.q||'');L.render();};
A.addctx=(t,r)=>L.open('menu',{x:Math.max(8,Math.min(r.left,innerWidth-276)),y:r.bottom+6,items:[['A booking','ctxpick'],['A contact or venue','ctxpick'],['A file or photo','ctxpick'],['An email thread','ctxpick']]});
A.ctxpick=t=>{L.close();L.toast('Added as context: '+t.textContent.trim());};
A.askmode=(t,r)=>L.open('menu',{x:Math.max(8,Math.min(r.left,innerWidth-276)),y:r.bottom+6,items:[['Ask: answers, changes nothing','modeask'],['Plan: drafts changes behind Confirm','modeplan']]});
A.modeask=()=>{S.dashMode='Ask';L.close();};A.modeplan=()=>{S.dashMode='Plan';L.close();};
A.importcal=()=>L.open('modal',{html:`<h2 class="t-title">Import a calendar</h2><p class="muted" style="margin:0">Dates come in as holds you confirm one by one. Nothing is sent to anyone.</p>${[['Google Calendar','Two-way, holds stay tentative'],['Microsoft 365','Two-way, holds stay tentative']].map(([a,b])=>`<div class="list-row" style="cursor:default">${ic('calendar')}<span class="tx"><b>${a}</b><small>${b}</small></span><button class="btn secondary s" data-act="close" data-msg="${a} connected. 14 dates found, waiting for you to confirm">Connect</button></div>`).join('')}<label class="drop" style="cursor:pointer">${ic('upload')}<b class="strong">Or drop an .ics or CSV file</b><span class="t-meta muted">From your old tool, one-off.</span><input type="file" accept=".ics,.csv" hidden data-dcal></label><div class="row" style="justify-content:flex-end"><button class="btn secondary" data-act="close">Cancel</button></div>`});
A.sampleband=()=>{S.dashFirst=false;S.dashStart='overview';L.go('dashboard');L.toast('Sample band loaded, marked as test',()=>{S.dashFirst=true;});};
A.dashstart=t=>{S.dashStart=t.dataset.v;if(S.overlay&&S.overlay.type==='drawer'){S.overlay=L.DR.customise();}L.render();};
A.dashedge=t=>{S.dashEdge[t.dataset.k]=t.dataset.v;S.overlay=L.DR.customise();L.render();};
A.resetdash=()=>{Object.keys(S.dash).forEach(k=>S.dash[k]=true);S.dashEdge={rel:'default',needs:'default',next:'gig',money:'bank'};S.dashStart='overview';S.overlay=L.DR.customise();L.render();};
A.dashver=(t,r)=>L.open('menu',{x:Math.max(8,Math.min(r.left,innerWidth-276)),y:r.bottom+6,items:[['v2, today 16:40, current','close'],['v1, 18 Oct, sent to the band','dashv1']]});
A.dashv1=()=>{L.close();L.toast('v1 opened read-only; v2 stays current');};
A.dashshare=(t,r)=>L.open('dashshare',{x:Math.max(8,Math.min(r.right-318,innerWidth-326)),y:r.bottom+6});
A.sharetip=()=>{S.shareTip=false;L.render();};
A.sharepdf=()=>{L.close();L.toast('Day sheet PDF is ready, v2');};A.sharecal=()=>{L.close();L.toast('Added to your calendar: Fri 24 Oct, 14:00 to 23:45');};
A.shareband=()=>{L.close();L.toast('Day sheet sent to 3 members',()=>{});};A.sharelink=()=>{try{navigator.clipboard.writeText('https://laas.app/d/LT-0041')}catch(e){}L.close();L.toast('Link copied, fees stay hidden');};
A.shareprint=()=>{L.close();L.toast('Print view opened');};
A.calmonth=t=>{const v=+t.dataset.v;S.calMonth=v===0?0:S.calMonth+v;L.render();};
A.calview=t=>{S.calView=t.dataset.v;L.render();};
A.calsub=()=>L.open('modal',{html:`<h2 class="t-title">Subscribe to ${bn()}’s calendar</h2><p class="muted" style="margin:0">Paste this link in Google Calendar, Outlook or Apple Calendar. It updates by itself; fees and notes stay out.</p><div class="row" style="flex-wrap:nowrap"><input class="input mono" value="webcal://laas.app/c/lowtide-7f3a.ics" readonly aria-label="Feed link"><button class="btn secondary" data-act="copytext" data-text="webcal://laas.app/c/lowtide-7f3a.ics">${ic('copy','s')}Copy</button></div><div class="row" style="justify-content:flex-end"><button class="btn secondary" data-act="close">Close</button></div>`});
A.calsync=()=>L.go('calsync');
A.asstchat=t=>{const id=t.dataset.id;S.asstHist=false;S.asstEdit=false;if(id==='q'){S.asst='q';}else{S.asstChat=id;S.asst=id==='move'?(S.asstMove||'plan'):'chat';}L.render();};
A.asstwho=t=>{S.asstWho=t.dataset.v||null;L.render();};
A.asstconfirm=()=>{if(!S.asstWho)S.asstWho='Mette';S.asst='done';S.asstMove='done';S.asstEdit=false;L.render();L.toast('3 changes made',()=>{S.asst='plan';S.asstMove='plan';});};
A.asstcancel=()=>{S.asst='cancelled';S.asstMove='cancelled';S.asstEdit=false;L.render();};
A.asstundo=()=>{S.asst='plan';S.asstMove='plan';L.render();L.toast('Undone. The booking, the mail and the day sheet are back');};
A.asstreply=t=>{const k=t.dataset.k;if(k==='mail'){L.open('modal',{html:`<h2 class="t-title">Mail to Hotel Skov</h2><div class="msg full"><b class="strong">New date for the gig</b><p>Hej ${S.asstWho==='Jonas'?'Jonas':'Mette'}, kan vi flytte koncerten til lørdag den 25. oktober kl. 20:00? Alt andet er som aftalt. Venlig hilsen, Low Tide</p></div><div class="row" style="justify-content:flex-end"><button class="btn secondary" data-act="close">Close</button></div>`});return;}
 (S.asstLog.move??=[]).push(k==='also'?['Also move the rehearsal','The rehearsal on 25 Oct at 14:00 would clash with load-in. I can move it to Sunday 26 Oct, 14:00. It is in the plan as a 4th change when you confirm.']:['What does Mette usually reply?','Mette replies within a day, usually before noon. She said yes to the last two date changes.']);L.render();};
A.asstctxoff=()=>{S.asstCtxOff[S.asstChat]=true;L.render();};
A.assthist=()=>{S.asstHist=!S.asstHist;L.render();};
A.asstpanel=()=>{S.asstPanel=!S.asstPanel;L.render();};
A.asstcan=()=>L.go('tools');
A.notifs=(t,r)=>L.open('notifs',{f:'all',right:Math.max(8,Math.round(innerWidth-r.right))});
A.notifremind=()=>{S.notifs[0].unread=false;L.go('booking',{id:'b1'});setTimeout(()=>document.querySelector('[data-act="reminder"]')?.click(),120);};
A.notifask=()=>{S.notifs[1].unread=false;S.overlay=null;S.parkingDone=true;L.render();L.toast('Asked Kasper again by SMS and email',()=>{S.parkingDone=false});};
A.notifmore=()=>{S.overlay.more=!S.overlay.more;L.render();};
A.notifold=t=>{const n=OLDER[+t.dataset.i];L.go(n.go[0],n.go[1]);};
A.thememenu=(t,r)=>L.open('thememenu',{x:Math.max(8,Math.round(r.left)),b:Math.max(8,Math.round(innerHeight-r.top+6))});
A.bandmenu=(t,r)=>L.open('bandmenu',{x:Math.max(8,Math.round(r.left)),y:Math.round(r.bottom+6)});
A.setrole=t=>{S.role=t.dataset.v;S.overlay=null;L.go('dashboard');L.toast(S.role==='viewer'?'Viewing as Viewer: read-only, money hidden':'Back to Owner');};
A.obdone=()=>{S.dashFirst=true;L.go('dashboard');L.toast('Welcome to LAAS. 2 invites sent');};
/* finishing onboarding (core obdone or the account area's own finish actions) lands on the first-visit dashboard */
document.addEventListener('click',e=>{if(e.target.closest('[data-act="accobskip"],[data-act="accobsend"],[data-act="obdone"]'))S.dashFirst=true;},true);

/* Account → Dashboard starts with (seg in the account view; data-dashstart or the button text) */
document.addEventListener('click',e=>{const b=e.target.closest('[data-dashstart], .seg button');if(!b)return;
 let v=b.dataset.dashstart;if(!v){const f=b.closest('.field');if(!f||!/Dashboard starts with/i.test(f.querySelector('label')?.textContent||''))return;v=/question/i.test(b.textContent)?'ask':'overview';}
 S.dashStart=v;L.toast(v==='ask'?'Dashboard starts with a question':'Dashboard starts with the overview');});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&e.target.id==='ask'&&e.target.tagName==='TEXTAREA')e.preventDefault();},true);
L.CHANGE.push(t=>{if(t.dataset.dcal!==undefined&&t.files&&t.files[0]){S.overlay=null;L.render();L.toast(t.files[0].name+': 14 dates found, waiting for you to confirm');return true;}});

/* ---------- calendar: ＋ on a day opens New booking with that date ---------- */
A.caladd=t=>{const [y,m,d]=t.dataset.d.split('-').map(Number);const dt=new Date(y,m-1,d);
 const o=L.DR.newbooking('');const when=`${WD[dt.getDay()]} ${d} ${MON3[m-1]} ${y}, 20:00`;
 o.body=o.body.replace('value="Fri 24 Oct 2026, 20:00"',`value="${when}"`).replace('Friday 24 Oct',`${WDL[dt.getDay()]} ${d} ${MON3[m-1]}`)
  .replace(/(id="nbt" value="[^"]*"><\/span>)/,`$1<span class="help">From the calendar, set the time</span>`);
 o.sub=`${WDL[dt.getDay()]} ${d} ${MONTHS[m-1]}, the rest later`;S.overlay=o;L.render();
 setTimeout(()=>{const w=document.getElementById('nbw');if(w){w.focus();w.select();}},60);};

/* ---------- Calendar sync (calsync): Google and Microsoft 365, direction, calendars, last sync, conflicts, ICS feed ---------- */
L.P.refresh??='<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>';
L.P.arrowlr??='<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>';
L.P.help??='<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>';
L.P.shield??='<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>';
L.P.ban??='<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>';
L.P.compass??='<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>';
L.P.download??='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>';
L.P.lock??='<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>';
L.AREAS.gigs.includes('calsync')||L.AREAS.gigs.push('calsync');

S.csync??={g:true,ms:false,gdir:'two',mdir:'push',cals:{gigs:true,personal:true,rehearse:true,holidays:false,mcal:true},holds:true,day:true,syncing:false,last:'2 min ago',conf:['c1','c2'],feed:'7f3a',savedUntil:0};
const CS=S.csync;
const DIRS=[['push','Push','upload'],['pull','Pull','download'],['two','Two-way','arrowlr']];
const DIRTXT={push:'LAAS gigs go to the calendar. Nothing comes back.',pull:'Busy times come into LAAS as busy blocks. Nothing is written to the calendar.',two:'Both ways. Holds go out as tentative, busy times come back as busy blocks.'};
const CONF={c1:{d:'Sat 25 Oct',t:'Rehearsal, Studio B',k:'Overlap',a:'LAAS: rehearsal 14:00 to 16:00',b:'Google, Vital personal: Dentist 13:30 to 15:00',opts:[['Keep both','Both stay. The rehearsal shows Vital as busy until 15:00'],['Move the rehearsal','Proposed: rehearsal 15:30 to 17:30, the band is asked first']],go:'data-go="booking" data-id="b2"'},
 c2:{d:'Fri 31 Oct',t:'Halloween set, Club Mono',k:'Changed on both sides',a:'LAAS: set 21:00, changed by Sofie on 19 Oct',b:'Google, Low Tide gigs: set 22:00, changed by Vital on 20 Oct',opts:[['Use LAAS, 21:00','Google gets 21:00 back on the next sync'],['Use Google, 22:00','The booking and the day sheet move to 22:00']],go:'data-go="bookings"'}};
const csTg=(k,label,on)=>`<button class="acc-tg ${on?'on':''}" role="switch" aria-checked="${!!on}" aria-label="${esc(label)}" data-act="cstg" data-k="${k}"><i></i></button>`;
const csRow=(label,desc,ctl)=>`<div class="acc-row"><div class="tx"><span>${label}</span>${desc?`<small>${desc}</small>`:''}</div><div class="ctl">${ctl}</div></div>`;
const csSec=(title,inner,action='',cls='')=>`<section class="acc-sec cs-sec ${cls}"><div class="acc-sh"><h2 class="t-title">${title}</h2>${action}</div>${inner}</section>`;
const csFoot=(t,icon)=>`<p class="acc-foot">${icon?ic(icon,'s'):''}<span>${t}</span></p>`;
const csSave=()=>{const on=Date.now()<CS.savedUntil;return `<span class="acc-save ${on?'on':''}" id="cs-save" role="status" aria-live="polite">${on?ic('check','s')+'Saved':''}</span>`;};
function csSaved(){const el=document.getElementById('cs-save');if(!el)return;clearTimeout(CS._t1);clearTimeout(CS._t2);el.className='acc-save on';el.textContent='Saving…';
 CS._t1=setTimeout(()=>{CS.savedUntil=Date.now()+3000;const e=document.getElementById('cs-save');if(!e)return;e.innerHTML=ic('check','s')+'Saved';CS._t2=setTimeout(()=>{document.getElementById('cs-save')?.classList.remove('on');},3000);},600);}
const dirSeg=(acc,cur)=>`<div class="d-seg cs-dir" role="radiogroup" aria-label="Direction">${DIRS.map(([k,l,i])=>`<button class="${cur===k?'on':''}" role="radio" aria-checked="${cur===k}" data-act="csdir" data-a="${acc}" data-v="${k}">${ic(i,'s')}${l}</button>`).join('')}</div>`;
const calRow=(k,name,meta,role)=>`<div class="acc-li cs-cal"><span class="cs-dot ${k}"></span><span class="tx"><span>${name}</span><small>${meta}</small></span>${role?`<span class="t-meta muted cs-role">${role}</span>`:''}${csTg('cal-'+k,name,CS.cals[k])}</div>`;
function account(id){
 if(id==='g'){const dir=CS.gdir;
  return csSec('Google Calendar',`<div class="acc-li cs-acc"><span class="d-lic">${ic('calendar','s')}</span><span class="tx"><span>vital@lowtide.dk</span><small>Connected 14 Sep, last sync ${CS.last}</small></span>${tag('confirmed','Connected')}</div>
   <div class="acc-rows">${csRow('Direction',DIRTXT[dir],dirSeg('g',dir))}</div>
   <div class="cs-sub"><span class="t-label muted">Which calendars</span></div>
   <div class="acc-list">${calRow('gigs','Low Tide gigs',dir==='pull'?'Read for busy times':'LAAS writes gigs, holds and rehearsals here','Writes')}${calRow('personal','Vital, personal','Read for busy times only, titles stay private','Busy only')}${calRow('rehearse','Band rehearsals','Shared by Sofie, read as rehearsals','Reads')}${calRow('holidays','Holidays in Denmark','Off, public holidays show anyway in the month grid','')}</div>
   ${dir==='pull'?'':`<div class="acc-rows">${csRow('Holds and enquiries','Sent as tentative so the slot looks taken, never as confirmed',csTg('holds','Holds and enquiries',CS.holds))}${csRow('Day sheet in the event','Load-in, soundcheck and address in the description',csTg('day','Day sheet in the event',CS.day))}${csRow('Fees, notes, contacts','Never written to any calendar',tag('draft','Always off'))}</div>`}`,
   `<button class="btn ghost s icon" data-act="csmore" data-a="g" aria-label="More for Google Calendar">${ic('more','s')}</button>`);}
 if(!CS.ms)return csSec('Microsoft 365',`<div class="acc-li cs-acc"><span class="d-lic">${ic('calendar','s')}</span><span class="tx"><span>Not connected</span><small>Outlook and Teams calendars, work or school accounts. You pick the direction after signing in.</small></span><button class="btn secondary s" data-act="csms">Connect</button></div>`);
 const dir=CS.mdir;
 return csSec('Microsoft 365',`<div class="acc-li cs-acc"><span class="d-lic">${ic('calendar','s')}</span><span class="tx"><span>vital@lowtide.onmicrosoft.com</span><small>Connected just now, first sync done</small></span>${tag('confirmed','Connected')}</div>
  <div class="acc-rows">${csRow('Direction',DIRTXT[dir],dirSeg('m',dir))}</div>
  <div class="cs-sub"><span class="t-label muted">Which calendars</span></div>
  <div class="acc-list">${calRow('mcal','Calendar','The default Outlook calendar',dir==='pull'?'Busy only':'Writes')}</div>`,
  `<button class="btn ghost s icon" data-act="csmore" data-a="m" aria-label="More for Microsoft 365">${ic('more','s')}</button>`);}
function conflicts(){const n=CS.conf.length;
 const body=n?`<div class="cs-cfs">${CS.conf.map(id=>{const c=CONF[id];return `<div class="cs-cf"><div class="cs-cfh"><span class="mono">${c.d}</span><b>${c.t}</b>${tag('attention',c.k)}</div>
  <div class="cs-sides"><span>${ic('calendar','s')}${c.a}</span><span>${ic('calendar','s')}${c.b}</span></div>
  <div class="cs-cfa">${c.opts.map(([l,h],i)=>`<button class="btn secondary s" data-act="csresolve" data-id="${id}" data-i="${i}" title="${esc(h)}">${l}</button>`).join('')}<span style="flex:1"></span><button class="btn ghost s" ${c.go}>${ic('chevr','s')}Open booking</button></div></div>`;}).join('')}</div>`
  :`<p class="acc-note acc-in12">No conflicts. When the same event changes on both sides, or a gig lands on a busy time, it waits here for you. Sync never picks a side by itself.</p>`;
 return csSec(`Conflicts`,body+(n?csFoot('Sync never picks a side by itself. Until you choose, LAAS keeps its own version.'):''),n?tag('attention',n+' to decide'):'');}
L.VIEWS.calsync=()=>{const g=CS.g;
 return `<div class="page cs-page"><button class="btn ghost s flush cs-back" data-go="calendar">${ic('left','s')}Calendar</button>
 <div class="acc-ph"><div class="grow"><h1 class="t-display">Calendar sync</h1><p>Your gigs in Google or Microsoft 365, their busy times back in LAAS, and a read-only feed for everyone else</p></div>${csSave()}</div>
 <div class="cs-col">
 ${g?account('g'):csSec('Google Calendar',`<div class="acc-li cs-acc"><span class="d-lic">${ic('calendar','s')}</span><span class="tx"><span>Not connected</span><small>Gigs already in Google stay there. Connect again to pick up where you left off.</small></span><button class="btn secondary s" data-act="csgconnect">Connect</button></div>`)}
 ${account('m')}
 ${csSec('Last sync',`<div class="acc-rows">${csRow(CS.syncing?'Syncing…':`${CS.last[0].toUpperCase()+CS.last.slice(1)}`,CS.syncing?'Reading Google'+(CS.ms?' and Microsoft 365':'')+', nothing is changed yet':`${g||CS.ms?'14 events matched to bookings, 2 new busy blocks, '+CS.conf.length+(CS.conf.length===1?' conflict':' conflicts'):'Nothing connected, nothing to sync'}`,`<button class="btn secondary s" data-act="cssync" ${CS.syncing||!(g||CS.ms)?'disabled':''}>${ic('refresh','s')}Sync now</button>`)}</div>
  <div class="cs-log">${[['Today 09:12','Google, 14 matched, 1 conflict'],['Today 06:00','Google, 2 busy blocks from Vital, personal'],['Yesterday 21:40','Google, LT-0041 moved to Fri 24 Oct, sent']].map(([a,b])=>`<span><span class="mono faint">${a}</span>${b}</span>`).join('')}</div>`,'','')}
 ${conflicts()}
 ${csSec('Read-only feed',`<div class="acc-banner cs-pw">${ic('lock','s')}<div class="tx"><b>The link is a password in itself</b><span>Anyone who has it sees your confirmed gig dates, venues and cities. Share it only with people you trust, and reset it if it leaks.</span></div></div>
  <div class="acc-in12"><div class="acc-url"><code>webcal://laas.dk/feed/lowtide/${CS.feed}.ics</code><button class="btn ghost s" data-act="copytext" data-text="webcal://laas.dk/feed/lowtide/${CS.feed}.ics">${ic('copy','s')}Copy</button><button class="btn ghost s" data-act="csreset">Reset link</button></div></div>
  <div class="acc-rows">${csRow('What is in it','Confirmed gigs: date, doors, venue, city. Fees, notes, contacts and holds never','<button class="btn ghost s" data-go="calendar-feed">Feed rules</button>')}${csRow('Who uses it','Apple Calendar, a website, a friend who drives the van','')}</div>`)}
 ${csFoot('Saving never sends anything. Sync writes only to the calendars you tick, and only what is listed above.','shield')}
 </div></div>${L.abar(null,'Ask about sync: why is the Halloween set at 22:00 in Google?')}`;};

Object.assign(A,{
 cstg:t=>{const k=t.dataset.k;if(k.startsWith('cal-')){const c=k.slice(4);CS.cals[c]=!CS.cals[c];}else CS[k]=!CS[k];L.render();csSaved();},
 csdir:t=>{CS[t.dataset.a==='g'?'gdir':'mdir']=t.dataset.v;L.render();csSaved();},
 csms:()=>{CS.ms=true;CS.mdir='push';L.render();L.toast('Microsoft 365 connected, push only to start. Nothing was written yet',()=>{CS.ms=false;L.render();});},
 csgconnect:()=>{CS.g=true;L.render();L.toast('Google Calendar connected again, two-way');},
 csmore:(t,r)=>L.open('menu',{x:Math.max(8,Math.min(r.right-260,innerWidth-276)),y:r.bottom+6,items:[['Sync this calendar now','cssync'],['See what was sent','cslog'],[t.dataset.a==='g'?'Disconnect Google Calendar':'Disconnect Microsoft 365',t.dataset.a==='g'?'csdisc':'csdiscm']]}),
 cslog:()=>{L.close();document.querySelector('.cs-log')?.scrollIntoView({block:'center',behavior:'smooth'});},
 csdisc:()=>L.open('modal',{html:L.confirmM('Disconnect Google Calendar?','Gigs already in Google stay there but stop updating. Nothing in LAAS is deleted, and conflicts are cleared.','Keep connected','csdiscok','Disconnect',1)}),
 csdiscok:()=>{const prev=CS.conf.slice();CS.g=false;CS.conf=[];S.overlay=null;L.render();L.toast('Google Calendar disconnected',()=>{CS.g=true;CS.conf=prev;L.render();});},
 csdiscm:()=>{CS.ms=false;S.overlay=null;L.render();L.toast('Microsoft 365 disconnected',()=>{CS.ms=true;L.render();});},
 cssync:()=>{if(S.overlay)S.overlay=null;CS.syncing=true;L.render();setTimeout(()=>{CS.syncing=false;CS.last='just now';if(S.view==='calsync')L.render();L.toast('Synced. Nothing new, '+CS.conf.length+(CS.conf.length===1?' conflict':' conflicts')+' still waiting');},900);},
 csresolve:t=>{const id=t.dataset.id,i=+t.dataset.i;const c=CONF[id];const prev=CS.conf.slice();CS.conf=CS.conf.filter(x=>x!==id);L.render();L.toast(`${c.t}: ${c.opts[i][1]}`,()=>{CS.conf=prev;L.render();});},
 csreset:()=>L.open('modal',{html:L.confirmM('Reset the feed link?','The old link stops working at once. Everyone who subscribed needs the new one; LAAS does not send it for you.','Keep this link','csresetok','Reset link',1)}),
 csresetok:()=>{const prev=CS.feed;CS.feed=Math.random().toString(16).slice(2,6);S.overlay=null;L.render();L.toast('New feed link made, the old one stopped working',()=>{CS.feed=prev;L.render();});},
});

/* ---------- What it can do (tools): the assistant's 17 read and 11 write tools, grouped by area ---------- */
S.toolsF??='all';
const TOOLS=[
 ['Gigs and calendar','calendar',[
  ['r','list_events','See what is on','Lists bookings, rehearsals and holds for the dates you name.','What is on next week?'],
  ['r','event_detail','Open one booking','Reads times, fee, people, files and status of one booking.','What time is load-in at Hotel Skov?'],
  ['w','create_event','Add a booking','Drafts a new booking. Looks up the venue and contact first, so nothing is added twice.','We play Loppen on 14 Nov, doors 20:00'],
  ['w','update_event_status','Move a booking along','Proposes the next step: enquiry, hold, offer out, confirmed, completed or cancelled.','Mark the Hotel Skov gig as confirmed']]],
 ['Contacts and venues','users',[
  ['r','find_contacts','Find people and places','Searches the contact book by name, organisation or kind.','Who is the booker at Loppen?'],
  ['r','contact_detail','Open a contact','Reads phone, email, notes and past gigs of one person.','What is Mette’s phone number?'],
  ['r','venue_detail','Open a venue','Reads capacity, stage, load-in, parking and the typical fee.','Where do we park at Hotel Skov?'],
  ['w','create_contact','Add a contact','Drafts a new contact after checking the person is not there already.','Add Kasper Holm, sound engineer'],
  ['w','create_venue','Add a venue','Drafts a new venue with capacity and notes after checking it is new.','Add Train in Aarhus, capacity 900']]],
 ['Releases and tracks','disc',[
  ['r','list_releases','See releases','Lists releases and where each one stands, from idea to released.','Which releases are still in mixing?'],
  ['r','release_detail','Open a release','Reads tracks, cover, codes and delivery date of one release.','What is left before Late Shift EP comes out?'],
  ['r','list_tracks','See tracks','Lists tracks with stage, ISRC and length.','Which tracks have no ISRC yet?'],
  ['r','track_detail','Open a track','Reads writers, splits, BPM, key and the audio file details.','Who wrote Night Bus?'],
  ['w','create_release','Add a release','Drafts a release with its kind, date and label.','Add a single called Low Water, out 6 Feb'],
  ['w','create_track','Add a track','Drafts a track, on its own or on a release.','Add Night Bus to Late Shift EP'],
  ['w','add_track_contributor','Add a writer or split','Reads the track first. Shares must add up to 100 %.','Sofie wrote 50 % of Night Bus, Koda'],
  ['w','update_release_status','Move a release along','Proposes the next stage, from writing to delivered and released.','Late Shift EP is delivered to the distributor'],
  ['w','update_track_stage','Move a track along','Proposes the next stage: demo, tracking, rough mix, final mix, master.','Night Bus is mastered']]],
 ['Money and books','money',[
  ['r','income_statement','Show the result','Income, expenses and result for any period.','How did we do in September?'],
  ['r','balance_sheet','Show what the band owns and owes','Bank, gear value and what is owed, on any date.','What do we owe right now?'],
  ['r','list_accounts','See the chart of accounts','Lists the accounts, so an entry lands in the right one.','Which account is merch sales?'],
  ['r','list_journal_entries','See bookkeeping entries','Lists entries, drafts and posted, with their lines.','What did we spend on travel in October?'],
  ['w','create_journal_entry','Add a bookkeeping entry','Looks up the accounts first. If it does not know the amount or how it was paid, it asks rather than guessing.','We paid 1.200 for the van rental by card']]],
 ['Gear','wrench',[
  ['r','list_inventory','See the gear','Lists gear with value, who has it and what needs attention.','What gear needs a repair?'],
  ['r','item_detail','Open a piece of gear','Reads serial, value, insurance and the maintenance log.','When was the SM58 last serviced?'],
  ['w','create_inventory_item','Add gear','Drafts the item. If you bought it, it also proposes the bookkeeping entry, same date.','We bought a Fender Rhodes for 9.500']]],
 ['Band and pages','compass',[
  ['r','band_profile','Know the band','Reads name, members, currency, timezone and language. The band comes from where you are, never from the question.','Who is in the band?'],
  ['r','navigate','Show you the page','Offers a button to one of 22 LAAS pages. It moves nobody; you click.','Take me to the invoices']]]];
const nR=TOOLS.reduce((n,g)=>n+g[2].filter(t=>t[0]==='r').length,0),nW=TOOLS.reduce((n,g)=>n+g[2].filter(t=>t[0]==='w').length,0);
L.VIEWS.tools=()=>{const f=S.toolsF;
 const groups=TOOLS.map(([g,i,list])=>[g,i,list.filter(t=>f==='all'||t[0]===f)]).filter(x=>x[2].length);
 return `<div class="page tl-page"><button class="btn ghost s flush cs-back" data-go="assistant">${ic('left','s')}Assistant</button>
 <div class="ph"><div class="grow"><h1 class="t-display">What it can do</h1><p>${nR} ways to look things up, ${nW} changes it can propose. Anything not on this page is out of reach.</p></div><button class="btn accent" data-act="tlask">${ic('ai','s')}Ask the assistant</button></div>
 <div class="tl-grid"><div class="tl-main">
  <div class="d-seg tl-f" role="tablist" aria-label="Show">${[['all','All',nR+nW],['r','Looks up',nR],['w','Changes',nW]].map(([k,l,n])=>`<button role="tab" aria-selected="${f===k}" class="${f===k?'on':''}" data-act="tlf" data-v="${k}">${l} <span class="faint">${n}</span></button>`).join('')}</div>
  ${groups.map(([g,i,list])=>`<section class="acc-sec tl-sec"><div class="acc-sh"><span class="d-lic">${ic(i,'s')}</span><h2 class="t-title">${g}</h2><span class="t-meta muted">${list.length}</span></div><div class="acc-list">${list.map(([k,id,t,d,q])=>`<button class="acc-li tl-row" data-act="askq" data-q="${esc(q)}" title="Try: ${esc(q)}"><span class="tx"><span>${t}</span><small>${d}</small><code class="tl-id">${id}</code></span>${k==='w'?tag('accent','Asks first'):tag('draft','Reads')}${ic('chevr','s')}</button>`).join('')}</div></section>`).join('')}
  <p class="acc-note">Tap a row to try it with an example question. Nothing is changed by trying.</p>
 </div>
 <aside class="tl-side">
  <section class="tl-card"><div class="tl-ch">${ic('shield')}<h2 class="t-heading">It proposes, you confirm</h2></div>
   <p>The assistant cannot write anything by itself. Every change comes as a plan you check. Nothing reaches ${bn()} until you press Confirm, and it is checked again when you do.</p>
   <ol class="tl-steps"><li><b>It looks first</b><small>Contacts before a booking, accounts before an entry</small></li><li><b>It proposes</b><small>A list of changes, editable</small></li><li><b>You confirm</b><small>Checked again, with Undo after</small></li></ol>
   <button class="btn secondary s" data-act="asksugg" data-q="plan">${ic('ai','s')}See an example plan</button></section>
  <section class="tl-card"><div class="tl-ch">${ic('ban')}<h2 class="t-heading">Out of reach</h2></div>
   <ul class="tl-out">${[['Delete anything','It can propose a cancel, never a delete'],['Send mail','It drafts; you press Send'],['Another band’s books','The band comes from where you are, never from the question']].map(([a,b])=>`<li>${ic('x','s')}<span><b>${a}</b><small>${b}</small></span></li>`).join('')}</ul></section>
  <section class="tl-card"><div class="tl-ch">${ic('help')}<h2 class="t-heading">When it is not sure, it asks</h2></div>
   <p>If it does not know the amount or how something was paid, it asks rather than guessing. Two contacts at a venue? It asks which one.</p></section>
 </aside></div></div>${L.abar(null,'Ask: can you send the offer to Mette for me?')}`;};
A.tlf=t=>{S.toolsF=t.dataset.v;L.render();};
A.tlask=()=>{S.asst='new';L.go('assistant');};

/* ---------- flows ---------- */
L.FLOWS.push(['Calendar sync','Google, Microsoft 365, conflicts, feed link',()=>L.go('calsync')]);
L.FLOWS.push(['What it can do','Assistant tools and the contract',()=>{S.toolsF='all';L.go('tools');}]);
L.FLOWS.push(['First visit','Empty account start page',()=>{S.dashFirst=true;S.role='owner';L.go('dashboard');}]);
L.FLOWS.push(['Dashboard states','Ask first, Viewer, edge states',()=>{S.dashFirst=false;S.role='owner';L.go('dashboard');setTimeout(()=>{S.overlay=L.DR.customise();L.render();},150);}]);
L.FLOWS.push(['Assistant','Chats, plan, confirm',()=>{S.asst='plan';S.asstMove='plan';S.asstChat='move';S.asstWho=null;L.go('assistant');}]);

/* ---------- after each render: Viewer sidebar, Assistant collapses the menu ---------- */
let busy=false;
const after=()=>{if(busy)return;busy=true;try{
 const root=document.documentElement;
 if(S.role==='viewer')root.setAttribute('data-role','viewer');else root.removeAttribute('data-role');

 const sb=document.querySelector('.sidebar');
 if(sb&&S.view==='tools')sb.querySelector('.nav[data-go="assistant"]')?.classList.add('active');
 if(sb&&S.view==='calsync')sb.querySelectorAll('.nav[data-go="calendar"]').forEach(n=>n.classList.add('active'));
 if(sb&&S.role==='viewer'){const small=sb.querySelector('.band small');if(small)small.textContent='Viewer, manager';
  const g=sb.querySelector('.nav.group[data-go="bookings"] span:not(.chev)');if(g&&g.textContent!=='Dates')g.textContent='Dates';
  const gb=sb.querySelector('.nav.group[data-go="bookings"]');const ch=gb&&gb.querySelector('.chev');if(ch)ch.innerHTML=ic('down','s');if(gb&&!(gb.nextElementSibling&&gb.nextElementSibling.classList.contains('sb-sub'))){gb.insertAdjacentHTML('afterend',`<div class="sb-sub d-vsub"><button class="nav sub ${S.view==='bookings'?'active':''}" data-go="bookings"><span>Bookings</span><span class="count">12</span></button><button class="nav sub ${S.view==='calendar'?'active':''}" data-go="calendar"><span>Calendar</span><span class="count">3</span></button></div>`);}
 }
}finally{busy=false;}};
new MutationObserver(after).observe(document.getElementById('app'),{childList:true});
})();

/* Vit 21 Oct: opening the Assistant page always lands on the new-conversation screen ("What do you need?");
   asking from elsewhere (chips, palette, a question) still opens with that question */
(function(){const L=window.LAAS,S=L.S;
  if(!S.asst||S.view!=='assistant')S.asst='new';
  document.addEventListener('click',e=>{if(e.target.closest('[data-go="assistant"]')){S.asst='new';S.asstHist=false;S.asstEdit=false;}},true);
  addEventListener('hashchange',()=>{if(decodeURIComponent(location.hash.slice(1))==='assistant')S.asst='new';});
})();
