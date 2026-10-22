/* LAAS prototype · social area: Social posts, post detail, Comments, Keyword watch, Deliveries.
   New screens (21 Oct 2026) from LaaS 0.5 (notes/prototype-sitemap.md: /social/, /social/accounts/, /social/comments/,
   /social/keywords/, /streaming/uploads/). Built on the existing patterns: list pages from bookings.js (bk-* classes),
   detail page from booking.js (bd-* classes), drawers via L.DR, confirms via L.confirmM. Uses window.LAAS. */
(function(){
"use strict";
const L=window.LAAS;
const {S,ic,esc,IMG,VIEWS,ACTIONS,OVERLAYS,DR}=L;

/* ---------- icons (lucide.dev) ---------- */
const ICONS={
 image:'<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 refreshCw:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
 eyeOff:'<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
 flag:'<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>',
 reply:'<path d="M20 18v-2a4 4 0 0 0-4-4H4"/><path d="m9 17-5-5 5-5"/>',
 music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 pause:'<rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/>',
 play:'<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>',
 trash:'<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
 sparkles:'<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4M22 5h-4M4 17v2M5 18H3"/>',
 arrowUpRight:'<path d="M7 7h10v10M7 17 17 7"/>',
 loader:'<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
 lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
 copy2:'<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
};
for(const [k,v] of Object.entries(ICONS))L.P[k]??=v;

/* ---------- networks and accounts ---------- */
const NET={
 ig:{n:'Instagram',a:'IG',h:'@lowtideband',what:'Posts, reels and comments'},
 fb:{n:'Facebook',a:'FB',h:'Low Tide, page',what:'Page posts and comments'},
 tt:{n:'TikTok',a:'TT',h:'@lowtide.band',what:'Videos and comments'},
 yt:{n:'YouTube',a:'YT',h:'Low Tide, channel',what:'Audio with the cover as a still video'},
 sc:{n:'SoundCloud',a:'SC',h:'soundcloud.com/lowtide',what:'Audio track with the cover as artwork'},
};
const SOCIAL=['ig','fb','tt'],DELIV=['yt','sc'];
const nets=list=>{const n=list.map(k=>NET[k].n);return n.length<3?n.join(' and '):n.slice(0,-1).join(', ')+' and '+n[n.length-1];};
/* service logos instead of letters (Vit 21 Oct: "use logos of SoMe"), views/brands.js */
const av=k=>L.brand(NET[k].n,28);

/* ---------- data ---------- */
const POSTS=[
 {id:'p31',code:'LT-POST-031',name:'Hotel Skov tonight',img:'hotel-skov',nets:['ig','fb'],st:'scheduled',when:'Fri 24 Oct, 18:00',by:'assistant',from:['Hotel Skov gig, LT-0043','bookings'],
  text:'Tonight we play Hotel Skov in Aarhus. Doors 19:00, first set 20:00. Come early, the bar is small and the beer is cold.',tags:'#lowtide #aarhus #livemusic',reach:'—',com:0},
 {id:'p32',code:'LT-POST-032',name:'Thank you, Aarhus',img:'stagedive',nets:['ig'],st:'scheduled',when:'Sun 26 Oct, 11:00',by:'Vital',
  text:'Thank you Hotel Skov and everyone who stayed for the second set. Next stop Club Mono, 15 Nov.',tags:'#lowtide #clubmono',reach:'—',com:0},
 {id:'p33',code:'LT-POST-033',name:'Late Shift EP in 3 weeks',img:'cover-late-shift',nets:['ig','fb'],st:'draft',when:'Not scheduled',by:'assistant',from:['Late Shift EP release plan','release'],
  text:'Three weeks until Late Shift. Four songs we wrote on night buses between gigs. Out Fri 14 Nov everywhere you listen.',tags:'#lateshift #newmusic #lowtide',reach:'—',com:0},
 {id:'p34',code:'LT-POST-034',name:'Rehearsal clip',img:'rehearsal',nets:['ig'],st:'draft',when:'Not scheduled',by:'Mia',
  text:'Working on the new bridge for Harbour Lights. Sound on.',tags:'#rehearsal #lowtide',reach:'—',com:0},
 {id:'p27',code:'LT-POST-027',name:'Release show at Loppen',img:'loppen',nets:['ig','fb'],st:'published',when:'Sat 18 Oct, 22:40',by:'Vital',
  text:'Sold out Loppen. Thank you Copenhagen, you sang every word of Low Tide back to us.',tags:'#loppen #lowtide',reach:'3.120',com:14,
  stats:[['ig','2.240','312','11','18'],['fb','880','96','3','4']]},
 {id:'p26',code:'LT-POST-026',name:'Club Mono this Friday',img:'club-mono',nets:['ig','fb'],st:'published',when:'Wed 8 Oct, 12:00',by:'assistant',
  text:'Club Mono, this Friday from 21:00. Tickets at the door, 120 DKK.',tags:'#clubmono #copenhagen',reach:'1.480',com:5,
  stats:[['ig','1.010','144','4','6'],['fb','470','38','1','2']]},
 {id:'p25',code:'LT-POST-025',name:'Studio day',img:'studio-b',nets:['ig'],st:'published',when:'Thu 2 Oct, 16:15',by:'Jonas',
  text:'Last vocal takes for Late Shift today at Studio B.',tags:'#studio #lateshift',reach:'960',com:3,stats:[['ig','960','121','3','2']]},
 {id:'p24',code:'LT-POST-024',name:'Support slot in Odense',img:'odense-live',nets:['fb'],st:'published',when:'Fri 19 Sep, 10:00',by:'Vital',
  text:'Tonight we open for the big one at Odense Live. On at 19:30 sharp.',tags:'#odense',reach:'2.050',com:8,stats:[['fb','2.050','188','8','12']]},
];
const STAT={draft:['draft','Draft'],scheduled:['paid','Scheduled'],published:['confirmed','Published']};
const COMMENTS=[
 {id:'c1',who:'Sara Holm',ini:'SH',net:'ig',post:'p27',when:'2 h ago',st:'open',text:'Best show this year. When are you back in Copenhagen?',
  sug:'Thank you, Sara! Club Mono on Sat 15 Nov, doors 21:00. See you there.'},
 {id:'c2',who:'Mette Krogh',ini:'MK',net:'fb',post:'p25',when:'5 h ago',st:'open',flag:['attention','Booking request'],booking:true,text:'Could we book you for a private party in December? About 60 guests in Aarhus.',
  sug:'Hi Mette, thank you! Send the date to booking@lowtide.dk and we will check it with the band this week.'},
 {id:'c3',who:'growbeats.dk',ini:'GB',net:'ig',post:'p27',when:'6 h ago',st:'open',flag:['danger','Looks like spam'],text:'Grow your streams fast. DM us for promo deals, 10k listeners guaranteed.',
  sug:''},
 {id:'c4',who:'Jonas Kjeldsen',ini:'JK',net:'fb',post:'p26',when:'Yesterday',st:'open',flag:['attention','Unhappy'],text:'Sound was way too loud at the back. Could not hear the vocals at all.',
  sug:'Sorry to hear that, Jonas. We will tell the sound engineer at Club Mono and stand closer to the front of house next time.'},
 {id:'c5',who:'Line Dahl',ini:'LD',net:'ig',post:'p26',when:'Yesterday',st:'open',text:'See you Friday! Bringing the whole office.',
  sug:'Bring them all! We start 21:00 sharp.'},
 {id:'c6',who:'Peter Nørgaard',ini:'PN',net:'fb',post:'p27',when:'2 days ago',st:'open',text:'Is the EP coming out on vinyl?',
  sug:'Not yet. Late Shift comes out digitally on 14 Nov. Vinyl later if enough of you ask.'},
 {id:'c7',who:'Anna Vestergaard',ini:'AV',net:'ig',post:'p27',when:'3 days ago',st:'replied',text:'That encore! Which song was the last one?',
  reply:'Thank you Anna! It was Closing Time, out on Late Shift in November.',replied:'2 days ago'},
 {id:'c8',who:'cheapfollows',ini:'CF',net:'ig',post:'p26',when:'4 days ago',st:'hidden',flag:['danger','Looks like spam'],text:'Buy followers now, link in bio.'},
];
const WEEKS=['4 Aug','11 Aug','18 Aug','25 Aug','1 Sep','8 Sep','15 Sep','22 Sep','29 Sep','6 Oct','13 Oct','20 Oct'];
const KEYWORDS=[
 {id:'k1',kw:'Low Tide',nets:['ig','fb'],last:'Today, 09:12',on:true,w:[2,1,3,2,4,3,2,5,3,4,6,8]},
 {id:'k2',kw:'Late Shift',nets:['ig','fb'],last:'Yesterday, 21:40',on:true,w:[0,0,0,0,0,1,0,1,2,2,3,2]},
 {id:'k3',kw:'Hotel Skov',nets:['ig','fb'],last:'Today, 07:55',on:true,w:[0,0,0,0,0,0,0,0,0,1,1,3]},
 {id:'k4',kw:'#lowtideband',nets:['ig'],last:'Mon 13 Oct',on:true,w:[1,0,1,0,1,0,0,1,0,1,0,1]},
];
const HITS={
 k1:[['ig','@aarhusnights','Low Tide at Hotel Skov on Friday, who is going?','Today, 09:12'],['fb','Odense Live','Thanks to Low Tide for a great support set last month.','Yesterday, 18:03'],['ig','@lydogleg','Low Tide live at Loppen, the last song gave me chills','Mon 20 Oct'],['ig','@mettekro','Booked Low Tide for the hotel bar, cannot wait','Sun 19 Oct']],
 k2:[['ig','@vinylhunter','Anyone know if Late Shift gets a vinyl press?','Yesterday, 21:40'],['fb','Musikbloggen','Preview: Late Shift by Low Tide, out 14 Nov','Fri 17 Oct']],
 k3:[['ig','@hotelskov','Live music Friday: Low Tide in the bar from 20:00','Today, 07:55'],['fb','Hotel Skov','Friday we have Low Tide in the bar. Free entry.','Tue 21 Oct']],
 k4:[['ig','@lowtidefan','#lowtideband rehearsal sneak peek','Mon 13 Oct']],
};
const DELIVERIES=[
 {id:'d2',code:'LT-DEL-002',track:'Live at Tape',img:'stagedive',dest:'yt',vis:'Public',when:'Today, 08:40',st:'processing',pct:64,plays:'—',file:'WAV, 24-bit, 48 kHz, 5:31',title:'Low Tide, Live at Tape (full set audio)'},
 {id:'d5',code:'LT-DEL-005',track:'Late Shift',img:'cover-late-shift',dest:'yt',vis:'Public',when:'Fri 14 Nov, 00:00',st:'queued',plays:'—',file:'WAV, 24-bit, 44.1 kHz, 4:12',title:'Low Tide, Late Shift (Official Audio)'},
 {id:'d4',code:'LT-DEL-004',track:'Harbour Lights',img:'cover-late-shift',dest:'sc',vis:'Private',when:'Mon 20 Oct, 14:02',st:'failed',plays:'—',file:'WAV, 24-bit, 96 kHz, 3:58',title:'Harbour Lights (demo)',why:'SoundCloud rejected the file: 96 kHz is above its limit. A 44.1 kHz copy can be made from the master.'},
 {id:'d3',code:'LT-DEL-003',track:'First Light',img:'catalogue-first-light',dest:'sc',vis:'Public',when:'Fri 12 Sep, 10:00',st:'live',plays:'2.310',file:'WAV, 24-bit, 44.1 kHz, 4:05',title:'First Light'},
 {id:'d1',code:'LT-DEL-001',track:'Low Tide',img:'catalogue-low-tide',dest:'yt',vis:'Public',when:'Wed 3 Sep, 12:00',st:'live',plays:'12.480',file:'WAV, 24-bit, 44.1 kHz, 3:41',title:'Low Tide (Official Audio)'},
];
const DSTAT={processing:['paid','Processing'],queued:['draft','On release day'],failed:['danger','Failed'],live:['confirmed','Live']};
const TRACKS=[['Late Shift','WAV, 24-bit, 44.1 kHz, 4:12','cover-late-shift'],['Harbour Lights','WAV, 24-bit, 96 kHz, 3:58','cover-late-shift'],['Closing Time','WAV, 24-bit, 44.1 kHz, 3:52','cover-late-shift'],['Live at Tape','WAV, 24-bit, 48 kHz, 5:31','stagedive'],['First Light','WAV, 24-bit, 44.1 kHz, 4:05','catalogue-first-light']];

/* ---------- state ---------- */
const clone=a=>a.map(x=>({...x}));
S.so??={acc:{ig:true,fb:true,tt:false,yt:true,sc:true},posts:clone(POSTS),comments:clone(COMMENTS),kws:clone(KEYWORDS),dels:clone(DELIVERIES),
 tab:'scheduled',q:'',net:[],ctab:'open',cq:'',cnet:[],reply:null,rtext:{},kw:'k1',kwTable:false,scanning:false,lastScan:'Today, 06:00',
 bannerOff:false,dbannerOff:false,dnet:[],np:null,actOpen:false};
const P=id=>S.so.posts.find(p=>p.id===id);
const socialOn=()=>SOCIAL.some(k=>S.so.acc[k]);
const delivOn=()=>DELIV.some(k=>S.so.acc[k]);
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const hl=(t,q)=>L.hl(t,q||'');
const pop=(r,w=268)=>({x:Math.max(8,Math.min(r.left,innerWidth-w)),y:r.bottom+6});
const stopEnter=()=>{S.enter='tabenter';S.enterUntil=Date.now()+500;};

/* ---------- shared parts ---------- */
const header=(title,sub,btns)=>`<div class="bk-ph"><div class="bk-tb"><h1 class="t-display">${title}</h1><p>${sub}</p></div>${btns}</div>`;
const tabs=(list,cur,attr)=>`<div class="bk-tabs" role="tablist">${list.map(([k,l,n])=>`<button role="tab" aria-selected="${cur===k}" class="${cur===k?'on':''}" data-act="${attr}" data-k="${k}"><span class="l">${l}</span><span class="c">${n}</span></button>`).join('')}</div>`;
const chip=(key,label,val)=>`<button class="bk-chip ${val.length?'on':''}" data-act="sofilter" data-key="${key}" aria-haspopup="dialog">${label}: ${val.length?esc(val.join(', ')):'all'}</button>`;
const search=(id,ph,val,label)=>`<label class="bk-search">${ic('search')}<input id="${id}" placeholder="${ph}" value="${esc(val)}" aria-label="${label}" autocomplete="off"></label>`;
const banner=(kind,icon,title,body,btn,x)=>`<div class="bd-banner ${kind}">${ic(icon,'s')}<div class="tx"><b>${title}</b><span>${body}</span></div>${btn||''}${x?`<button class="btn ghost icon s bd-x" data-act="${x}" aria-label="Dismiss">${ic('x','s')}</button>`:''}</div>`;
const PH={social:'Ask for a draft post. Nothing posts until you press Publish',comments:'Ask: answer Mette, hide all spam, who is unhappy',keywords:'Ask: who mentioned Late Shift this week',deliveries:'Ask: put Late Shift on YouTube on release day'};
const page=(cls,inner)=>`<div class="page bk so ${cls}">${inner}</div>${L.abar(null,PH[S.view]||PH.social)}`;

/* empty state when nothing is connected (Social posts, Comments, Keyword watch, Deliveries) */
function connectChoice(kind){
 const soc=kind!=='deliveries';
 const head={social:'Connect where you post',comments:'Comments come in once an account is connected',keywords:'Keyword watch needs a connected account',deliveries:'Connect where your audio goes'}[kind];
 const p=soc?'Posts, comments and keyword hits come in from Instagram, Facebook and TikTok. LAAS posts only what you publish or schedule.'
  :'Push a track’s audio from Catalogue to YouTube or SoundCloud. Nothing uploads until you press Deliver.';
 const list=soc?[['ig','band-collage'],['fb','loppen'],['tt','rehearsal']]:[['yt','stagedive'],['sc','studio-b']];
 return `<div class="bk-start"><div class="bk-empty choice so-choice"><div class="hd"><h2 class="t-title">${head}</h2><p>${p}</p></div>
 <div class="bk-choices ${soc?'':'two'}">${list.map(([k,im])=>`<button class="bk-choice" data-act="soconnect" data-n="${k}"><img src="${IMG(im)}" alt=""><b>Connect ${NET[k].n}</b><small>${NET[k].what}</small></button>`).join('')}</div></div></div>`;
}

/* =====================================================================
   Social posts (list)
   ===================================================================== */
function postRows(){
 const t=S.so.tab;let list=S.so.posts.filter(p=>p.st===t);
 if(S.so.net.length)list=list.filter(p=>p.nets.some(k=>S.so.net.includes(NET[k].n)));
 const q=S.so.q.trim().toLowerCase();
 if(q)list=list.filter(p=>(p.name+' '+p.text+' '+p.tags).toLowerCase().includes(q));
 return list;
}
const PUBTOTAL=()=>20+S.so.posts.filter(p=>p.st==='published').length;
function accountsStrip(){
 return `<div class="so-accs">${SOCIAL.map(k=>{const on=S.so.acc[k];return `<div class="so-acc">${av(k)}<span class="tx"><b>${NET[k].n}</b><small>${on?esc(NET[k].h):'Not connected'}</small></span>${on?'<span class="tag confirmed">Connected</span>':`<button class="btn ghost s bd-act" data-act="soconnect" data-n="${k}">${ic('plus','s')}Connect</button>`}</div>`;}).join('')}</div>`;
}
function postTable(list,q){
 return `<div class="bk-table" role="table" aria-label="Posts"><div class="bk-tr so-p bk-th" role="row"><span>When</span><span>Post</span><span>Accounts</span><span>Status</span><span class="n">Reach</span><span class="n">Comments</span></div>
 ${list.map((p,i)=>`<div class="bk-tr so-p" role="row" tabindex="0" data-act="sopostrow" data-id="${p.id}" style="--i:${i}"><span class="w">${p.when}</span><span class="tt"><img class="bk-thumb" src="${IMG(p.img)}" alt=""><span class="so-pt"><b>${hl(p.name,q)}</b><small>${hl(p.text,q)}</small></span></span><span class="m">${p.nets.map(k=>NET[k].n).join(', ')}</span><span><span class="tag ${STAT[p.st][0]}">${STAT[p.st][1]}</span></span><span class="n mono">${p.reach}</span><span class="n mono">${p.st==='published'?p.com:'—'}</span></div>`).join('')}</div>`;
}
VIEWS.social=()=>{
 const so=S.so;
 const btns=`<button class="btn secondary" data-act="soaccounts">Accounts</button><button class="btn accent" data-act="sonewpost">${ic('plus')}New post</button>`;
 if(!socialOn())return page('',header('Social posts','No accounts connected yet',btns)+connectChoice('social'));
 const n=k=>k==='published'?PUBTOTAL():so.posts.filter(p=>p.st===k).length;
 const conn=SOCIAL.filter(k=>so.acc[k]).length;
 const sub=`${conn} of 3 accounts connected, ${n('scheduled')} scheduled, ${n('draft')} drafts`;
 const aiDrafts=so.posts.filter(p=>p.st==='draft'&&p.by==='assistant').length;
 const q=so.q.trim();const list=postRows();
 const total=so.tab==='published'?PUBTOTAL():list.length;
 let foot;
 if(q)foot=`<div class="bk-foot"><span>${list.length} of ${n(so.tab)} match “${esc(q)}” in name or caption</span><button class="btn ghost s bk-fb" data-act="soclear">Clear search</button></div>`;
 else if(so.net.length)foot=`<div class="bk-foot"><span>${list.length} match Accounts: ${esc(so.net.join(', '))}</span><button class="btn ghost s bk-fb" data-act="soclear">Show all</button></div>`;
 else foot=`<div class="bk-foot"><span>${so.tab==='published'?`Showing ${list.length} of ${total}, newest first`:so.tab==='draft'?`Showing ${list.length}. Drafts never post.`:`Showing ${list.length}, they go out at the time shown`}</span></div>`;
 const none=q?`<div class="bk-empty"><div class="hd"><h2 class="t-title">No match for “${esc(q)}”</h2><p>Nothing in post names or captions. Check the spelling, or start a post about ${esc(cap(q))}.</p></div><div class="acts"><button class="btn secondary" data-act="sonewpost">${ic('plus')}New post “${esc(cap(q))}”</button><button class="btn ghost" data-act="soclear">Clear search</button></div></div>`
  :so.net.length?`<div class="bk-empty"><div class="hd"><h2 class="t-title">Nothing matches this filter</h2><p>Accounts: ${esc(so.net.join(', '))}. Try another account, or clear the filter.</p></div><div class="acts"><button class="btn ghost" data-act="soclear">Clear filter</button></div></div>`
  :`<div class="bk-empty"><div class="hd"><h2 class="t-title">${so.tab==='draft'?'No drafts':'Nothing scheduled'}</h2><p>${so.tab==='draft'?'Ask the assistant for a draft, or start one yourself.':'Schedule a post and it shows here until it goes out.'}</p></div><div class="acts"><button class="btn secondary" data-act="sonewpost">${ic('plus')}New post</button></div></div>`;
 return page('',`${header('Social posts',sub,btns)}
 ${aiDrafts&&!so.bannerOff&&so.tab!=='draft'?banner('info','ai',`The assistant drafted ${aiDrafts} post${aiDrafts>1?'s':''} for you to check`,'From the Hotel Skov booking and the Late Shift release plan. Nothing posts until you press Publish.','<button class="btn secondary s" data-act="sotab" data-k="draft">Review drafts</button>','sobannerx'):''}
 ${tabs([['scheduled','Scheduled',n('scheduled')],['draft','Drafts',n('draft')],['published','Published',n('published')]],so.tab,'sotab')}
 <div class="bk-content">${accountsStrip()}
 <div class="bk-filters">${chip('net','Accounts',so.net)}<span class="sp"></span>${search('sosearch','Name or caption',so.q,'Search posts')}</div>
 ${list.length?postTable(list,q)+foot:none}</div>`);
};

/* =====================================================================
   Post detail
   ===================================================================== */
const sec=(title,action,body,foot)=>`<section class="bd-sec"><div class="bd-sh"><h2 class="t-title">${title}</h2>${action||''}</div>${body}${foot?`<p class="bd-foot">${foot}</p>`:''}</section>`;
const act=(icon,label,a,extra='')=>`<button class="btn ghost s bd-act" data-act="${a}" ${extra}>${ic(icon,'s')}${label}</button>`;
const POSTACT={
 draft:p=>[[p.by==='assistant'?'Today, 07:30':'Mon 20 Oct',p.by==='assistant'?'Drafted by the assistant from '+(p.from?p.from[0]:'your notes'):'Draft started by '+p.by]],
 scheduled:p=>[['Today, 07:32',`Scheduled for ${p.when} by Vital`],...(p.by==='assistant'?[['Today, 07:30','Drafted by the assistant from '+p.from[0]]]:[['Mon 20 Oct','Draft started by '+p.by]])],
 published:p=>[[p.when,`Published to ${nets(p.nets)}`],[p.when,'Comments are collected every hour'],['Earlier','Draft started by '+p.by]],
};
VIEWS.post=()=>{
 const p=P(S.params.id)||P('p31')||S.so.posts[0];const st=p.st;
 queueMicrotask(()=>document.querySelector('.sidebar .nav[data-go="social"]')?.classList.add('active'));
 const btns={draft:`<button class="btn secondary" data-act="soedit" data-id="${p.id}">${ic('clock','s')}Schedule</button><button class="btn accent" data-act="sopublish" data-id="${p.id}">${ic('send','s')}Publish</button>`,
  scheduled:`<button class="btn secondary" data-act="soedit" data-id="${p.id}">${ic('pencil','s')}Edit</button><button class="btn accent" data-act="sopublish" data-id="${p.id}">${ic('send','s')}Publish now</button>`,
  published:`<button class="btn accent" data-act="socomments" data-id="${p.id}">${ic('arrowUpRight','s')}Comments ${p.com}</button>`}[st];
 const ai=p.by==='assistant'&&st!=='published'&&!S.so['ai_'+p.id];
 const where=p.nets.concat(SOCIAL.filter(k=>!p.nets.includes(k)));
 const rows=where.map(k=>{const inPost=p.nets.includes(k),on=S.so.acc[k];
  const note=!on?'Not connected':inPost?(st==='published'?`Published ${p.when}`:st==='scheduled'?`Goes out ${p.when}`:'In this draft'):'Not in this post';
  const right=!on?act('plus','Connect','soconnect',`data-n="${k}"`):inPost?`<span class="tag ${STAT[st][0]}">${STAT[st][1]}</span>`:(st==='published'?'':act('plus','Add','soaddnet',`data-id="${p.id}" data-n="${k}"`));
  return `<div class="bd-prow">${av(k)}<span class="tx"><span>${NET[k].n}${on?`, ${esc(NET[k].h)}`:''}</span><small>${note}</small></span>${right}</div>`;}).join('');
 const comments=S.so.comments.filter(c=>c.post===p.id&&c.st!=='hidden').slice(0,3);
 const main=sec('Caption',st==='published'?'':act('pencil','Edit','soedit',`data-id="${p.id}"`),`<p class="bd-prose">${esc(p.text)}</p><p class="bd-prose so-tags">${esc(p.tags)}</p>${st==='published'?'':`<div class="bd-tones">${['Shorter','Friendlier','In Danish'].map(t=>`<button class="qtag" data-act="sotone" data-id="${p.id}" data-t="${t}">${t}</button>`).join('')}</div>`}`,
   `${p.text.length+p.tags.length+1} characters. Instagram allows 2.200 and shows the first 125 before More.`)
  +sec('Where it goes',st==='published'?'':act('plus','Accounts','soaccounts'),`<div class="bd-rows">${rows}</div>`,st==='scheduled'?'Each account posts at the time shown. If one fails, the others still go out and you get a notification.':'')
  +(st==='published'?sec('How it did',act('arrowUpRight','Audience','soaudience'),`<div class="table-wrap so-stats"><table><thead><tr><th>Account</th><th class="num">Reach</th><th class="num">Likes</th><th class="num">Comments</th><th class="num">Shares</th></tr></thead><tbody>${p.stats.map(([k,...v])=>`<tr><td>${NET[k].n}</td>${v.map(x=>`<td class="num mono">${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,'Figures from Instagram and Facebook, refreshed every morning at 06:00.')
   +sec('Latest comments',act('arrowUpRight','All comments','socomments',`data-id="${p.id}"`),comments.length?`<div class="bd-rows">${comments.map(c=>`<button class="bd-prow so-crow" data-act="socomments" data-id="${p.id}"><span class="bd-av">${c.ini}</span><span class="tx"><span>${esc(c.who)}</span><small>${esc(c.text)}</small></span>${c.st==='replied'?'<span class="tag confirmed">Replied</span>':c.flag?`<span class="tag ${c.flag[0]}">${c.flag[1]}</span>`:''}</button>`).join('')}</div>`:'<p class="bd-foot">No comments yet.</p>'):'');
 const ev=POSTACT[st](p);
 const panel=`<aside class="bd-panel"><div class="bd-pgroup"><h2 class="t-title">Preview</h2><div class="so-phone"><div class="so-ph-h">${av(p.nets[0])}<b>${esc(NET[p.nets[0]].h)}</b></div><img src="${IMG(p.img)}" alt=""><p><b>${esc(NET[p.nets[0]].h)}</b> ${esc(p.text)} <span class="so-tags">${esc(p.tags)}</span></p></div><span class="t-meta muted">How it looks on ${NET[p.nets[0]].n}. Other accounts crop the photo their own way.</span></div>
  <div class="bd-pgroup"><h2 class="t-title">Details</h2><dl class="bd-stack"><dt>Code</dt><dd class="mono">${p.code}</dd><dt>${p.by==='assistant'?'Drafted by':'Started by'}</dt><dd>${p.by==='assistant'?'The assistant, checked by you':esc(p.by)}</dd>${p.from?`<dt>Made from</dt><dd><button class="link" data-act="sofrom" data-v="${p.from[1]}">${esc(p.from[0])}</button></dd>`:''}</dl></div>
  <div class="bd-pgroup"><button class="bd-acth" data-act="soact" aria-expanded="${S.so.actOpen}"><h2 class="t-title">Activity, ${ev.length} events</h2><span class="bd-chev" aria-hidden="true">${ic(S.so.actOpen?'down':'right','s')}</span></button>${S.so.actOpen?`<div class="bd-acts">${ev.map(([d,t])=>`<div><span class="d">${d}</span><span>${esc(t)}</span></div>`).join('')}</div>`:''}</div></aside>`;
 return `<div class="page bd-page so-post">
 <button class="btn ghost s flush bd-back" data-act="soback">${ic('left','s')}Social posts</button>
 <header class="ev-head"><div class="ev-date ev-post" aria-hidden="true">${L.brand?L.brand(NET[p.nets[0]].n,28):ic("send")}</div><div class="ev-tx"><span class="ev-k">${nets(p.nets)} post, ${p.code}</span><h1 class="t-display">${esc(p.name)}</h1><div class="ev-meta"><span class="tag">${p.when}</span>${st==='published'?`<span class="tag">Reach ${p.reach}</span><span class="tag">${p.com} comments</span>`:`<span class="tag">${p.nets.length} account${p.nets.length>1?'s':''}</span>`}</div></div></header>
 <div class="bd-bar"><span class="tag ${STAT[st][0]}">${STAT[st][1]}</span><span class="grow"></span>${btns}<button class="btn secondary icon" aria-label="More" data-act="somore" data-id="${p.id}">${ic('more')}</button></div>
 ${ai?banner('info','ai',`Drafted by the assistant from ${esc(p.from[0])}. Check it.`,`From ${p.from[1]==='bookings'?'the booking':'the release plan'}. Nothing posts until you ${st==='scheduled'?'publish or the time comes':'press Publish'}.`,`<button class="btn secondary s" data-act="sofrom" data-v="${p.from[1]}">Open the source</button>`,`soaix" data-id="${p.id}`):''}
 <div class="bd-grid"><div class="bd-main">${main}</div>${panel}</div>
 </div>${L.abar(p.name,'Make it shorter, move it to Saturday')}`;
};

/* =====================================================================
   Comments
   ===================================================================== */
const cTabOf=c=>c.st==='open'?(c.flag?['open','flagged']:['open']):[c.st];
function commentRows(){
 const so=S.so;let list=so.comments.filter(c=>cTabOf(c).includes(so.ctab));
 if(so.cnet.length)list=list.filter(c=>so.cnet.includes(NET[c.net].n));
 if(so.cpost)list=list.filter(c=>c.post===so.cpost);
 const q=so.cq.trim().toLowerCase();if(q)list=list.filter(c=>(c.who+' '+c.text).toLowerCase().includes(q));
 return list;
}
function commentRow(c,q){
 const p=P(c.post);const open=S.so.reply===c.id;
 const acts=c.st==='open'?`${c.booking?act('plus','New booking','sobookfrom',`data-id="${c.id}"`):''}${c.sug!==''||!c.flag?act('reply','Reply','soreply',`data-id="${c.id}" aria-expanded="${open}"`):''}${act('eyeOff','Hide','sohide',`data-id="${c.id}"`)}${act('flag',c.flag?'Unflag':'Flag','soflag',`data-id="${c.id}"`)}`
  :c.st==='hidden'?act('eye','Show again','sounhide',`data-id="${c.id}"`):'';
 return `<div class="so-c ${open?'open':''}" data-id="${c.id}"><span class="bd-av">${c.ini}</span><div class="so-cb">
 <div class="so-ch"><b>${hl(c.who,q)}</b><small>${NET[c.net].n}, on <button class="link" data-act="sopostrow" data-id="${c.post}">${esc(p?p.name:'a post')}</button>, ${c.when}</small>${c.flag?`<span class="tag ${c.flag[0]}">${c.flag[1]}</span>`:''}</div>
 <p>${hl(c.text,q)}</p>
 ${c.st==='replied'?`<div class="so-yours">${ic('reply','s')}<span><b>You replied, ${c.replied}</b>${esc(c.reply)}</span></div>`:''}
 ${open?replyBox(c):''}
 ${acts&&!open?`<div class="so-cacts">${acts}</div>`:''}</div></div>`;
}
function replyBox(c){
 const txt=S.so.rtext[c.id]??c.sug;
 return `<div class="so-reply"><label class="so-rl" for="sor-${c.id}">Reply as ${esc(NET[c.net].h)}</label><textarea class="input" id="sor-${c.id}" rows="3">${esc(txt)}</textarea>
 ${c.sug?`<span class="so-rn">${ic('ai','s')}Drafted by the assistant from the post and your earlier replies. Nothing posts until you press Reply.</span>`:''}
 <div class="so-rf"><button class="btn ghost" data-act="soreplyx">Cancel</button><span class="grow"></span><button class="btn accent" data-act="soreplysend" data-id="${c.id}">${ic('send','s')}Reply</button></div></div>`;
}
VIEWS.comments=()=>{
 const so=S.so;
 const btns=`<button class="btn secondary" data-act="socollect">${ic('refreshCw','s')}Collect now</button>`;
 if(!socialOn())return page('',header('Comments','No accounts connected yet',btns)+connectChoice('comments'));
 const cnt=k=>so.comments.filter(c=>cTabOf(c).includes(k)).length;
 const q=so.cq.trim();const list=commentRows();
 const cp=so.cpost?P(so.cpost):null;
 const emptyTxt={open:['Nothing open','You answered or hid every comment. New ones are collected every hour.'],flagged:['Nothing flagged','Spam, booking requests and unhappy comments are flagged here.'],replied:['No replies yet','Comments you answer from LAAS show here with your reply.'],hidden:['Nothing hidden','Hidden comments stay on the post for the writer only.']}[so.ctab];
 const none=q?`<div class="bk-empty"><div class="hd"><h2 class="t-title">No match for “${esc(q)}”</h2><p>Nothing in names or comment text. Check the spelling, or clear the search.</p></div><div class="acts"><button class="btn ghost" data-act="soclear">Clear search</button></div></div>`
  :`<div class="bk-empty"><div class="hd"><h2 class="t-title">${emptyTxt[0]}</h2><p>${emptyTxt[1]}</p></div>${so.cnet.length||cp?`<div class="acts"><button class="btn ghost" data-act="soclear">Clear filters</button></div>`:''}</div>`;
 return page('',`${header('Comments',`${cnt('open')} open, ${cnt('flagged')} flagged`,btns)}
 ${tabs([['open','Open',cnt('open')],['flagged','Flagged',cnt('flagged')],['replied','Replied',cnt('replied')],['hidden','Hidden',cnt('hidden')]],so.ctab,'soctab')}
 <div class="bk-content"><div class="bk-filters">${chip('cnet','Accounts',so.cnet)}<button class="bk-chip ${cp?'on':''}" data-act="sofilter" data-key="cpost" aria-haspopup="dialog">Post: ${cp?esc(cp.name):'all'}</button><span class="sp"></span>${search('socsearch','Name or words',so.cq,'Search comments')}</div>
 ${list.length?`<div class="so-clist">${list.map(c=>commentRow(c,q)).join('')}</div><div class="bk-foot"><span>${q||so.cnet.length||cp?`${list.length} of ${cnt(so.ctab)} shown`:so.ctab==='hidden'?'Hidden comments are still on the post, only the writer sees them.':`Showing ${list.length}, newest first. Replies post as the band’s account.`}</span>${q||so.cnet.length||cp?'<button class="btn ghost s bk-fb" data-act="soclear">Show all</button>':''}</div>`:none}</div>`);
};

/* =====================================================================
   Keyword watch
   ===================================================================== */
const sum=a=>a.reduce((x,y)=>x+y,0);
const last4=k=>sum(k.w.slice(-4));
VIEWS.keywords=()=>{
 const so=S.so;
 const btns=`<button class="btn secondary" data-act="sorescan" ${so.scanning?'disabled aria-busy="true"':''}>${ic(so.scanning?'loader':'refreshCw',so.scanning?'s so-spin':'s')}${so.scanning?'Scanning…':'Rescan now'}</button><button class="btn accent" data-act="soaddkw">${ic('plus')}Add keyword</button>`;
 if(!socialOn())return page('',header('Keyword watch','No accounts connected yet',btns)+connectChoice('keywords'));
 const kws=so.kws;const total=sum(kws.map(last4));
 const sel=kws.find(k=>k.id===so.kw)||null;
 const series=sel?sel.w:WEEKS.map((_,i)=>sum(kws.filter(k=>k.on).map(k=>k.w[i])));
 const max=Math.max(4,...series);
 const chart=`<section class="so-chart"><div class="m-chh"><h3 class="t-heading">Hits per week${sel?`, “${esc(sel.kw)}”`:', all keywords'}</h3>${sel?act('undo','All keywords','sokwall'):''}${act(so.kwTable?'eye':'file',so.kwTable?'Show chart':'Show data table','sokwtable')}</div>
 ${so.kwTable?`<div class="table-wrap"><table><thead><tr><th>Week of</th><th class="num">Hits</th></tr></thead><tbody>${WEEKS.map((w,i)=>`<tr><td>${w}</td><td class="num mono">${series[i]}</td></tr>`).join('')}</tbody></table></div>`
  :`<div class="so-bars" role="img" aria-label="Hits per week, last 12 weeks">${WEEKS.map((w,i)=>`<div><span class="v">${series[i]||''}</span><i style="height:${Math.max(2,Math.round(series[i]/max*140))}px"></i><small>${w}</small></div>`).join('')}</div>`}</section>`;
 const table=kws.length?`<div class="bk-table" role="table" aria-label="Keywords"><div class="bk-tr so-k bk-th" role="row"><span>Keyword</span><span>Watching</span><span>Last hit</span><span>Status</span><span class="n">Hits, 30 days</span></div>
 ${kws.map((k,i)=>`<div class="bk-tr so-k ${so.kw===k.id?'sel':''}" role="row" tabindex="0" data-act="sokw" data-id="${k.id}" aria-selected="${so.kw===k.id}" style="--i:${i}"><span class="tt"><b>${esc(k.kw)}</b></span><span class="m">${k.nets.map(n=>NET[n].n).join(', ')}</span><span class="m">${k.last}</span><span><span class="tag ${k.on?'confirmed':'draft'}">${k.on?'Watching':'Paused'}</span></span><span class="n mono">${last4(k)}</span></div>`).join('')}</div>`
  :`<div class="bk-empty"><div class="hd"><h2 class="t-title">No keywords yet</h2><p>Add your band name, a release or a venue. Hits come in every morning and when you rescan.</p></div><div class="acts"><button class="btn secondary" data-act="soaddkw">${ic('plus')}Add keyword</button></div></div>`;
 const hits=sel?(HITS[sel.id]||[]):[];
 const hitSec=sel?`<section class="bd-sec"><div class="bd-sh"><h2 class="t-title">Latest hits for “${esc(sel.kw)}”</h2>${act(sel.on?'pause':'play',sel.on?'Pause':'Resume','sokwpause',`data-id="${sel.id}"`)}${act('trash','Remove','sokwdel',`data-id="${sel.id}"`)}</div>
  ${hits.length?`<div class="bd-rows so-hits">${hits.map(([n,who,txt,when])=>`<div class="bd-prow">${av(n)}<span class="tx"><span>${L.hl(txt,sel.kw.replace('#',''))}</span><small>${NET[n].n}, ${esc(who)}, ${when}</small></span><button class="btn ghost s bd-act" data-act="sohitopen" data-n="${n}">${ic('arrowUpRight','s')}Open</button></div>`).join('')}</div>`:'<p class="bd-foot">No hits yet. The next scan runs tomorrow at 06:00.</p>'}
  <p class="bd-foot">Keyword watch only reads public posts. Nothing is liked, followed or answered from here.</p></section>`:'';
 return page('so-kwp',`${header('Keyword watch',`${kws.length} keyword${kws.length===1?'':'s'}, ${total} hits in 30 days`,btns)}
 <div class="bk-content">${chart}${table}${hitSec}</div>`);
};

/* =====================================================================
   Deliveries
   ===================================================================== */
VIEWS.deliveries=()=>{
 const so=S.so;
 const btns=`<button class="btn secondary" data-act="soaccounts" data-d="1">Accounts</button><button class="btn accent" data-act="sodeliver">${ic('upload')}New delivery</button>`;
 if(!delivOn())return page('',header('Deliveries','No YouTube or SoundCloud account connected',btns)+connectChoice('deliveries'));
 let list=so.dels;if(so.dnet.length)list=list.filter(d=>so.dnet.includes(NET[d.dest].n));
 const c=k=>so.dels.filter(d=>d.st===k).length;
 const failed=so.dels.find(d=>d.st==='failed');
 const sub=[c('processing')&&`${c('processing')} processing`,c('queued')&&`${c('queued')} waiting`,`${c('live')} live`,c('failed')&&`${c('failed')} failed`].filter(Boolean).join(', ');
 return page('',`${header('Deliveries',cap(sub),btns)}
 ${failed&&!so.dbannerOff?banner('attention','alert',`${esc(failed.track)} was rejected by ${NET[failed.dest].n}`,esc(failed.why),`<button class="btn secondary s" data-act="soretry" data-id="${failed.id}">${ic('refreshCw','s')}Retry with 44.1 kHz</button>`,'sodbannerx'):''}
 <div class="bk-content"><div class="bk-filters">${chip('dnet','Destination',so.dnet)}</div>
 ${list.length?`<div class="bk-table" role="table" aria-label="Deliveries"><div class="bk-tr so-d bk-th" role="row"><span>Track</span><span>Destination</span><span>Format</span><span>Visibility</span><span>When</span><span>Status</span><span class="n">Plays</span></div>
 ${list.map((d,i)=>`<div class="bk-tr so-d" role="row" tabindex="0" data-act="sodel" data-id="${d.id}" style="--i:${i}"><span class="tt"><img class="bk-thumb" src="${IMG(d.img)}" alt=""><b>${esc(d.track)}</b></span><span class="m so-dest">${L.brand(NET[d.dest].n,24)}${NET[d.dest].n}</span><span><span class="trk-fmt t-meta" title="${esc(d.file)}">${L.fmtShort(d.file)}</span></span><span class="m">${d.vis}</span><span class="w">${d.when}</span><span>${d.st==='processing'?`<span class="so-st"><span class="tag paid">Processing</span><span class="so-prog" aria-label="${d.pct} percent"><i style="width:${d.pct}%"></i></span></span>`:`<span class="tag ${DSTAT[d.st][0]}">${DSTAT[d.st][1]}</span>`}</span><span class="n mono">${d.plays}</span></div>`).join('')}</div>
 <div class="bk-foot"><span>Showing ${list.length}. The audio file stays in Catalogue; taking a video down never deletes it.</span>${so.dnet.length?'<button class="btn ghost s bk-fb" data-act="soclear">Show all</button>':''}</div>`
 :`<div class="bk-empty"><div class="hd"><h2 class="t-title">Nothing delivered to ${esc(so.dnet.join(', '))} yet</h2><p>Push a track from Catalogue and it shows here with its status.</p></div><div class="acts"><button class="btn ghost" data-act="soclear">Clear filter</button></div></div>`}</div>`);
};

/* =====================================================================
   Drawers
   ===================================================================== */
/* accounts */
DR.soaccounts=(d)=>{const row=k=>{const on=S.so.acc[k];return `<div class="bd-prow">${av(k)}<span class="tx"><span>${NET[k].n}</span><small>${on?esc(NET[k].h):NET[k].what}</small></span>${on?`<span class="tag confirmed">Connected</span><button class="btn ghost s" data-act="sodisconnect" data-n="${k}">${ic('x','s')}Disconnect</button>`:`<button class="btn secondary s" data-act="soconnect" data-n="${k}" data-keep="1">${ic('plus','s')}Connect</button>`}</div>`;};
 const groups=[['Posts, comments and keyword watch',SOCIAL],['Deliveries',DELIV]];if(d)groups.reverse();
 return {type:'drawer',title:'Accounts',sub:'Where Low Tide posts and delivers audio',
 body:`<div class="so-dr">${groups.map(([t,l])=>`<div class="so-grp"><span class="so-k">${t}</span><div class="bd-rows">${l.map(row).join('')}</div></div>`).join('')}
 <div class="bk-what">${ic('lock','s')}<span>LAAS posts only what you publish or schedule. Disconnecting keeps your drafts; scheduled posts on that account wait until you connect again.</span></div></div>`,
 foot:`<span style="flex:1"></span><button class="btn accent" data-act="close">Done</button>`};};

/* new or edited post */
const npDefaults=(p)=>p?{id:p.id,nets:Object.fromEntries(SOCIAL.map(k=>[k,p.nets.includes(k)])),mode:p.st==='draft'?'schedule':'schedule',img:p.img,text:p.text+(p.tags?'\n\n'+p.tags:''),date:p.st==='scheduled'?p.when.split(',')[0]+' 2026':'Fri 24 Oct 2026',time:p.st==='scheduled'?p.when.split(', ')[1]:'18:00',drafted:false}
 :{id:null,nets:{ig:S.so.acc.ig,fb:S.so.acc.fb,tt:false},mode:'schedule',img:'hotel-skov',text:'',date:'Fri 24 Oct 2026',time:'18:00',drafted:false};
const DRAFT='Friday we play Hotel Skov in Aarhus. Doors 19:00, first set 20:00. Come early, the bar is small and the beer is cold.\n\n#lowtide #aarhus #livemusic';
const countTxt=t=>`${L.kr?L.kr(t.length):t.length} of 2.200. Instagram shows the first 125 before More.`;
DR.sopost=()=>{const n=S.so.np;const edit=!!n.id;const sel=SOCIAL.filter(k=>n.nets[k]);
 const label={schedule:`${ic('clock')}Schedule post`,now:`${ic('send')}Publish now`,draft:'Save draft'}[n.mode];
 return {type:'drawer',title:edit?'Edit post':'New post',sub:'Saving never posts anything',
 body:`<div class="so-dr so-np">
 <div class="bk-describe"><div class="r">${n.drafted?ic('ai','s'):''}<span>${n.drafted?'Drafted from Hotel Skov gig, LT-0043':'Start from Hotel Skov gig, Fri 24 Oct'}</span>${n.drafted?'':`<span class="grow"></span><button class="btn ghost s" data-act="sodraft">${ic('ai','s')}Draft it for me</button>`}</div>
  <div class="m">${ic(n.drafted?'check':'info','s')}<span>${n.drafted?'Time, venue and hashtags from the booking. Edit freely; nothing posts until you press Publish.':'The assistant drafts from the booking. You check it before anything goes out.'}</span></div></div>
 <div class="field"><label>Post to</label><div class="bk-people">${SOCIAL.map(k=>S.so.acc[k]?`<button class="bk-cb" role="checkbox" aria-checked="${!!n.nets[k]}" data-act="sonpnet" data-n="${k}"><span class="box ${n.nets[k]?'on':''}">${n.nets[k]?ic('check'):''}</span>${NET[k].n}</button>`:`<span class="so-off">${NET[k].n}, <button class="link" data-act="soconnect" data-n="${k}" data-np="1">connect</button></span>`).join('')}</div>${sel.length?'':'<span class="help err">Pick at least one account</span>'}</div>
 <div class="field"><label for="sonptext">Caption</label><textarea class="input" id="sonptext" rows="6" placeholder="What do you want to say?">${esc(n.text)}</textarea><span class="help" id="sonpcount">${countTxt(n.text)}</span></div>
 <div class="field"><label>Photo or video</label><div class="so-picks">${['hotel-skov','stagedive','band-collage','rehearsal'].map(im=>`<button class="${n.img===im?'on':''}" data-act="sonpimg" data-img="${im}" aria-pressed="${n.img===im}" aria-label="Use this photo"><img src="${IMG(im)}" alt=""></button>`).join('')}<label class="so-up" aria-label="Upload a photo or video">${ic('upload')}<input type="file" accept="image/*,video/*" hidden data-soupload></label></div><span class="help">From the Hotel Skov booking and your photos</span></div>
 <div class="field"><label>When</label><div class="so-seg" role="radiogroup">${[['schedule','Schedule'],['now','Publish now'],['draft','Keep as draft']].map(([k,l])=>`<button role="radio" aria-checked="${n.mode===k}" class="${n.mode===k?'on':''}" data-act="sonpmode" data-k="${k}">${l}</button>`).join('')}</div></div>
 ${n.mode==='schedule'?`<div class="so-when"><div class="field so-w240"><label for="sonpdate">Date</label><span class="bk-lead">${ic('calendar')}<input class="input" id="sonpdate" value="${esc(n.date)}"></span></div><div class="field so-w160"><label for="sonptime">Time</label><input class="input mono" id="sonptime" value="${esc(n.time)}" inputmode="numeric"></div></div><span class="help so-best">${ic('clock','s')}Your followers are most active Fridays around 18:00</span>`:''}
 <div class="bk-what">${ic('ai','s')}<span>${n.mode==='now'?'Publishing asks once more and shows exactly what goes out.':n.mode==='draft'?'Drafts never post. Find it under Drafts.':'Scheduled posts go out at the time you set. You can change or stop them until then.'}</span></div></div>`,
 foot:`<span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button>${n.mode==='draft'?'':`<button class="btn secondary" data-act="sonpsave" data-k="draft">Save draft</button>`}<button class="btn accent" data-act="sonpsave" data-k="${n.mode}" ${sel.length?'':'disabled'}>${label}</button>`};};

/* add keyword */
DR.sokw=()=>({type:'drawer',title:'Add keyword',sub:'Hits come in every morning at 06:00',
 body:`<div class="so-dr"><div class="field so-w320"><label for="sokwin">Keyword</label><input class="input" id="sokwin" value="Club Mono" autocomplete="off"><span class="help">A name, a release, a venue or a hashtag</span></div>
 <div class="field"><label>Watch on</label><div class="bk-people">${SOCIAL.map(k=>S.so.acc[k]?`<button class="bk-cb" role="checkbox" aria-checked="true" data-act="sokwnet" data-n="${k}"><span class="box on">${ic('check')}</span>${NET[k].n}</button>`:`<span class="so-off">${NET[k].n}, not connected</span>`).join('')}</div></div>
 <div class="field"><label>Match</label><div class="seg so-fit"><button class="on">Exact words</button><button>Any form</button></div><span class="help">Any form also finds “Club Mono’s” and “#clubmono”</span></div>
 <div class="bk-what">${ic('lock','s')}<span>Keyword watch only reads public posts. Nothing is liked, followed or answered from here.</span></div></div>`,
 foot:`<span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="sokwadd">${ic('plus')}Add keyword</button>`});

/* new delivery */
DR.sodeliver=(t=0)=>{const tr=TRACKS[t];return {type:'drawer',title:'New delivery',sub:'Push a track’s audio to YouTube or SoundCloud',
 body:`<div class="so-dr"><div class="field so-w320"><label for="sodtrack">Track</label><span class="bk-sel"><select class="input" id="sodtrack">${TRACKS.map(([n],i)=>`<option value="${i}" ${i===t?'selected':''}>${esc(n)}</option>`).join('')}</select>${ic('down')}</span><span class="help" id="sodfile">${tr[1]}, from Catalogue</span></div>
 <div class="field so-dest"><label>Destination</label>${DELIV.map((k,i)=>S.so.acc[k]?`<button class="radio ${i===0?'on':''}" data-n="${k}"><i></i><span><b class="strong">${NET[k].n}, ${esc(NET[k].h)}</b><br><span class="t-label muted">${NET[k].what}</span></span></button>`:`<span class="so-off">${NET[k].n}, <button class="link" data-act="soconnect" data-n="${k}">connect</button></span>`).join('')}</div>
 <div class="field so-w400"><label for="sodtitle">Title</label><input class="input" id="sodtitle" value="Low Tide, ${esc(tr[0])} (Official Audio)"></div>
 <div class="field"><label>Visibility</label><div class="seg so-fit so-vis"><button class="on">Public</button><button>Unlisted</button><button>Private</button></div></div>
 <div class="field"><label>When</label><div class="seg so-fit so-dwhen"><button class="on">Now</button><button>On release day, Fri 14 Nov</button></div></div>
 <div class="bk-what">${ic('lock','s')}<span>Nothing uploads until you press Deliver. You can take it down again from here; the file stays in Catalogue.</span></div></div>`,
 foot:`<span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="sodeliverdo">${ic('upload')}Deliver</button>`};};

/* delivery detail */
DR.sodel=(id)=>{const d=S.so.dels.find(x=>x.id===id);const s=DSTAT[d.st];
 const foot={processing:`<span style="flex:1"></span><button class="btn secondary" data-act="sodelcancel" data-id="${d.id}">Stop upload</button><button class="btn accent" data-act="sodelcheck" data-id="${d.id}">${ic('refreshCw')}Check now</button>`,
  queued:`<span style="flex:1"></span><button class="btn secondary" data-act="sodelcancel" data-id="${d.id}">Cancel delivery</button><button class="btn accent" data-act="close">Done</button>`,
  failed:`<button class="btn ghost" data-act="sodelcancel" data-id="${d.id}">Remove</button><span style="flex:1"></span><button class="btn accent" data-act="soretry" data-id="${d.id}">${ic('refreshCw')}Retry with 44.1 kHz</button>`,
  live:`<button class="btn ghost so-danger" data-act="sotakedown" data-id="${d.id}">Take down</button><span style="flex:1"></span><button class="btn secondary" data-act="sodelopen" data-id="${d.id}">${ic('arrowUpRight')}Open on ${NET[d.dest].n}</button><button class="btn accent" data-act="close">Done</button>`}[d.st];
 return {type:'drawer',title:d.track,sub:`${NET[d.dest].n}, ${d.code}`,
 body:`<div class="so-dr"><div class="so-dst"><span class="tag ${s[0]}">${s[1]}${d.st==='processing'?` ${d.pct} %`:''}</span>${d.st==='processing'?`<span class="so-prog wide"><i style="width:${d.pct}%"></i></span>`:''}</div>
 ${d.st==='failed'?`<div class="bd-banner attention">${ic('alert','s')}<div class="tx"><b>Rejected on ${d.when}</b><span>${esc(d.why)}</span></div></div>`:''}
 <dl class="bd-stack"><dt>Title</dt><dd>${esc(d.title)}</dd><dt>File</dt><dd>${d.file}</dd><dt>Account</dt><dd>${NET[d.dest].n}, ${esc(NET[d.dest].h)}</dd><dt>Visibility</dt><dd>${d.vis}</dd><dt>${d.st==='queued'?'Goes up':'Started'}</dt><dd>${d.when}</dd>${d.st==='live'?`<dt>Plays</dt><dd class="mono">${d.plays}</dd>`:''}</dl>
 <h4 class="facts-h">File</h4>${L.factsDl(L.fileFacts(d.file))}
 <h4 class="facts-h">Royalties</h4>${L.factsDl(L.rights(d.track))}
 <div class="bk-what">${ic('lock','s')}<span>${d.st==='live'?'Taking it down removes it from '+NET[d.dest].n+'. The file stays in Catalogue.':'The audio file stays in Catalogue whatever happens here.'}</span></div></div>`,foot};};

/* =====================================================================
   Overlays: filter menu, more menu
   ===================================================================== */
const FOPTS={net:()=>SOCIAL.map(k=>[NET[k].n,S.so.posts.filter(p=>p.nets.includes(k)&&p.st===S.so.tab).length]),
 cnet:()=>SOCIAL.map(k=>[NET[k].n,S.so.comments.filter(c=>c.net===k).length]),
 dnet:()=>DELIV.map(k=>[NET[k].n,S.so.dels.filter(d=>d.dest===k).length])};
OVERLAYS.sofilter=o=>{
 if(o.key==='cpost'){const ids=[...new Set(S.so.comments.map(c=>c.post))];
  return `<div class="scrim" style="background:transparent" data-act="close"></div><div class="pop bk-menu" style="left:${o.x}px;top:${o.y}px" role="dialog" aria-label="Filter by post"><div class="hd">Post</div>
  ${ids.map(id=>{const p=P(id);const on=S.so.cpost===id;return `<button class="opt" role="menuitemradio" aria-checked="${on}" data-act="socpost" data-id="${id}"><span class="box ${on?'on':''}">${on?ic('check'):''}</span><span class="l">${esc(p.name)}</span><span class="n">${S.so.comments.filter(c=>c.post===id).length}</span></button>`;}).join('')}
  <div class="ft"><button class="btn ghost s" data-act="socpost" data-id="">Clear</button></div></div>`;}
 const v=S.so[o.key];const label=o.key==='dnet'?'Destination':'Accounts';
 return `<div class="scrim" style="background:transparent" data-act="close"></div><div class="pop bk-menu" style="left:${o.x}px;top:${o.y}px" role="dialog" aria-label="Filter by ${label.toLowerCase()}"><div class="hd">${label}</div>
 ${FOPTS[o.key]().map(([x,n])=>`<button class="opt" role="menuitemcheckbox" aria-checked="${v.includes(x)}" data-act="softoggle" data-key="${o.key}" data-v="${esc(x)}"><span class="box ${v.includes(x)?'on':''}">${v.includes(x)?ic('check'):''}</span><span class="l">${x}</span><span class="n">${n}</span></button>`).join('')}
 <div class="ft"><button class="btn ghost s" data-act="sofclear" data-key="${o.key}">Clear</button></div></div>`;};
OVERLAYS.somore=o=>{const p=P(o.id);const items=p.st==='published'
  ?[['copy2','Copy link','socopylink'],['plus','Duplicate as draft','sodup'],['trash','Delete from '+nets(p.nets),'sodelete']]
  :[['plus','Duplicate','sodup'],['trash','Delete '+(p.st==='draft'?'draft':'post'),'sodelete']];
 return `<div class="scrim" style="background:transparent" data-act="close"></div><div class="pop bk-menu so-more" style="left:${o.x}px;top:${o.y}px" role="menu">${items.map(([i,l,a])=>`<button class="opt ${a==='sodelete'?'so-danger':''}" role="menuitem" data-act="${a}" data-id="${p.id}">${ic(i,'s')}<span class="l">${esc(l)}</span></button>`).join('')}</div>`;};

/* =====================================================================
   Actions
   ===================================================================== */
const modal=html=>L.open('modal',{html:`<div class="so-modal">${html}</div>`});
const drawer=d=>{S.overlay=d;L.render();};
const openNp=p=>{S.so.np=npDefaults(p);drawer(DR.sopost());};
const syncNp=()=>{const n=S.so.np;if(!n)return;const g=id=>document.getElementById(id);if(g('sonptext'))n.text=g('sonptext').value;if(g('sonpdate'))n.date=g('sonpdate').value;if(g('sonptime'))n.time=g('sonptime').value;};
const shortDate=n=>`${n.date.replace(/ 20\d\d$/,'')}, ${n.time}`;
function savePost(mode){
 const n=S.so.np;const sel=SOCIAL.filter(k=>n.nets[k]);
 const raw=(n.text||'').trim();const parts=raw.split(/\n\s*\n/);const tags=parts.length>1&&/^#/.test(parts[parts.length-1])?parts.pop():'';
 const text=parts.join(' ')||'Untitled post';
 const st=mode==='draft'?'draft':mode==='now'?'published':'scheduled';
 const when=st==='draft'?'Not scheduled':st==='published'?'Today, just now':shortDate(n);
 if(n.id){const p=P(n.id);const was={...p};Object.assign(p,{nets:sel,img:n.img,text,tags,st,when});S.overlay=null;
  if(st==='published'){p.reach='—';p.com=0;p.stats=sel.map(k=>[k,'0','0','0','0']);}
  L.render();L.toast(st==='draft'?'Saved as a draft':st==='published'?`Published to ${nets(sel)}`:`Scheduled for ${when}`,()=>{Object.assign(p,was);});return;}
 const id='p'+(40+S.so.posts.length);const code='LT-POST-0'+(40+S.so.posts.length);
 const name=text.split(/[.!?]/)[0].slice(0,40)||'New post';
 const p={id,code,name,img:n.img,nets:sel,st,when,by:'Vital',text,tags,reach:'—',com:0,stats:sel.map(k=>[k,'0','0','0','0'])};
 S.so.posts.unshift(p);S.so.tab=st;S.overlay=null;
 if(S.view!=='social')L.go('social');else L.render();
 L.toast(st==='draft'?`Draft saved, ${code}`:st==='published'?`Published to ${nets(sel)}`:`Scheduled for ${when} on ${sel.length} account${sel.length>1?'s':''}`,()=>{S.so.posts=S.so.posts.filter(x=>x.id!==id);});
}
function confirmPublish(id){
 const p=id?P(id):null;const n=S.so.np;
 const sel=p?p.nets:SOCIAL.filter(k=>n.nets[k]);const text=p?p.text:(n.text||'').split(/\n\s*\n/)[0];
 modal(`<h2 class="t-title">Publish to ${nets(sel)} now?</h2><p class="muted" style="margin:0">It goes out as ${sel.map(k=>esc(NET[k].h)).join(' and ')} straight away. People see it before you can take it back.</p>
 <div class="so-quote"><img src="${IMG(p?p.img:n.img)}" alt=""><p>${esc(text)}</p></div>
 <div class="row" style="justify-content:flex-end"><button class="btn secondary" data-act="close">Not now</button><button class="btn accent" data-act="${p?'sopublishdo':'sonppublishdo'}" data-id="${p?p.id:''}">${ic('send','s')}Publish</button></div>`);
}
const dataTab=(key,k)=>{S.so[key]=k;stopEnter();L.render();};

Object.assign(ACTIONS,{
 /* list: tabs, filters, search */
 sotab:t=>dataTab('tab',t.dataset.k),
 soctab:t=>{S.so.reply=null;dataTab('ctab',t.dataset.k);},
 sofilter:(t,r)=>L.open('sofilter',{key:t.dataset.key,...pop(r)}),
 softoggle:t=>{const k=t.dataset.key,x=t.dataset.v,a=S.so[k];S.so[k]=a.includes(x)?a.filter(y=>y!==x):[...a,x];L.render();},
 sofclear:t=>{S.so[t.dataset.key]=[];L.close();},
 socpost:t=>{S.so.cpost=t.dataset.id||null;L.close();},
 soclear:()=>{const v=S.view;if(v==='social'){S.so.q='';S.so.net=[];}else if(v==='comments'){S.so.cq='';S.so.cnet=[];S.so.cpost=null;}else if(v==='deliveries')S.so.dnet=[];L.render();},
 sobannerx:()=>{S.so.bannerOff=true;L.render();},
 sodbannerx:()=>{S.so.dbannerOff=true;L.render();},
 sopostrow:t=>L.go('post',{id:t.dataset.id}),
 soback:()=>L.go('social'),

 /* accounts */
 soaccounts:t=>{drawer(DR.soaccounts(t.dataset.d||S.view==='deliveries'));},
 soconnect:t=>{const k=t.dataset.n;S.so.acc[k]=true;
  if(t.dataset.np&&S.so.np){syncNp();S.so.np.nets[k]=true;S.overlay=DR.sopost();}
  else if(S.overlay&&S.overlay.type==='drawer'&&S.overlay.title==='Accounts')S.overlay=DR.soaccounts(DELIV.includes(k));
  else if(S.overlay&&S.overlay.title==='New delivery')S.overlay=DR.sodeliver(+(document.getElementById('sodtrack')?.value||0));
  L.render();L.toast(`${NET[k].n} connected as ${NET[k].h}`,()=>{S.so.acc[k]=false;if(S.overlay&&S.overlay.title==='Accounts')S.overlay=DR.soaccounts(DELIV.includes(k));});},
 sodisconnect:t=>{const k=t.dataset.n;S.so.acc[k]=false;S.overlay=DR.soaccounts(DELIV.includes(k));L.render();
  L.toast(`${NET[k].n} disconnected, drafts kept`,()=>{S.so.acc[k]=true;if(S.overlay&&S.overlay.title==='Accounts')S.overlay=DR.soaccounts(DELIV.includes(k));});},

 /* new post drawer */
 sonewpost:()=>{openNp(null);const q=S.view==='social'?S.so.q.trim():'';if(q){S.so.np.text=cap(q)+' ';S.overlay=DR.sopost();L.render();}},
 soedit:t=>openNp(P(t.dataset.id)),
 sodraft:()=>{syncNp();const n=S.so.np;n.text=DRAFT;n.drafted=true;n.img='hotel-skov';S.overlay=DR.sopost();L.render();},
 sonpnet:t=>{syncNp();const k=t.dataset.n;S.so.np.nets[k]=!S.so.np.nets[k];S.overlay=DR.sopost();L.render();},
 sonpimg:t=>{syncNp();S.so.np.img=t.dataset.img;S.overlay=DR.sopost();L.render();},
 sonpmode:t=>{syncNp();S.so.np.mode=t.dataset.k;S.overlay=DR.sopost();L.render();},
 sonpsave:t=>{syncNp();const m=t.dataset.k;if(m==='now')return confirmPublish(null);savePost(m);},
 sonppublishdo:()=>{savePost('now');},

 /* post detail */
 sopublish:t=>confirmPublish(t.dataset.id),
 sopublishdo:t=>{const p=P(t.dataset.id);const was={...p};Object.assign(p,{st:'published',when:'Today, just now',reach:'—',com:0,stats:p.nets.map(k=>[k,'0','0','0','0'])});S.overlay=null;L.render();
  L.toast(`Published to ${nets(p.nets)}`,()=>{Object.assign(p,was);});},
 sotone:t=>{const p=P(t.dataset.id);const was=p.text;const tone=t.dataset.t;
  p.text=({Shorter:p.text.split('. ').slice(0,2).join('. ').replace(/\.?$/,'.'),Friendlier:'Hi everyone! '+p.text.replace(/\.$/,'')+'. We would love to see you there.',
   'In Danish':({p31:'I aften spiller vi på Hotel Skov i Aarhus. Dørene åbner 19:00, første sæt 20:00. Kom tidligt, baren er lille og øllen er kold.',p33:'Tre uger til Late Shift. Fire sange skrevet i natbusser mellem koncerter. Ude fredag 14. november overalt.'})[p.id]||'Tak for i aften. Vi ses snart igen.'})[tone];
  L.render();L.toast(`Caption rewritten: ${tone.toLowerCase()}`,()=>{p.text=was;});},
 soaddnet:t=>{const p=P(t.dataset.id),k=t.dataset.n;p.nets.push(k);L.render();L.toast(`${NET[k].n} added to this post`,()=>{p.nets=p.nets.filter(x=>x!==k);});},
 soaix:t=>{S.so['ai_'+t.dataset.id]=true;L.render();},
 sofrom:t=>L.go(t.dataset.v==='bookings'?'booking':'release'),
 soact:()=>{S.so.actOpen=!S.so.actOpen;L.render();},
 somore:(t,r)=>L.open('somore',{id:t.dataset.id,x:Math.max(8,Math.min(r.right-240,innerWidth-248)),y:r.bottom+6}),
 socopylink:()=>{try{navigator.clipboard.writeText('https://instagram.com/p/lowtide-loppen')}catch(e){}L.close();L.toast('Link copied');},
 sodup:t=>{const p=P(t.dataset.id);const id='p'+(40+S.so.posts.length);const code='LT-POST-0'+(40+S.so.posts.length);
  S.so.posts.unshift({...p,id,code,name:p.name+', copy',st:'draft',when:'Not scheduled',by:'Vital',reach:'—',com:0,from:null});S.overlay=null;L.go('post',{id});
  L.toast(`Duplicated as draft ${code}`,()=>{S.so.posts=S.so.posts.filter(x=>x.id!==id);L.go('post',{id:p.id});});},
 sodelete:t=>{const p=P(t.dataset.id);
  modal(L.confirmM(p.st==='published'?`Delete from ${nets(p.nets)}?`:`Delete “${esc(p.name)}”?`,p.st==='published'?'The post and its comments disappear from the accounts. Figures already collected stay in LAAS.':p.st==='scheduled'?`It will not go out on ${p.when}.`:'The draft is removed. You can undo for 10 seconds.','Keep it','sodeletedo" data-id="'+p.id,'Delete',true));},
 sodeletedo:t=>{const p=P(t.dataset.id);const i=S.so.posts.indexOf(p);S.so.posts.splice(i,1);S.so.tab=p.st;S.overlay=null;L.go('social');
  L.toast(`Deleted ${p.name}`,()=>{S.so.posts.splice(i,0,p);});},
 socomments:t=>{S.so.cpost=t.dataset.id||null;S.so.ctab='open';S.so.cq='';L.go('comments');},
 soaudience:()=>L.go('audience'),

 /* comments */
 soreply:t=>{S.so.reply=t.dataset.id;L.render();setTimeout(()=>{const el=document.getElementById('sor-'+t.dataset.id);if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}},30);},
 soreplyx:()=>{S.so.reply=null;L.render();},
 soreplysend:t=>{const c=S.so.comments.find(x=>x.id===t.dataset.id);const txt=(document.getElementById('sor-'+c.id)?.value||'').trim();
  if(!txt){L.toast('Write a reply first');return;}
  const was={...c};Object.assign(c,{st:'replied',reply:txt,replied:'just now',flag:null});S.so.reply=null;L.render();
  L.toast(`Replied to ${c.who} on ${NET[c.net].n}`,()=>{Object.assign(c,was);});},
 sohide:t=>{const c=S.so.comments.find(x=>x.id===t.dataset.id);const was=c.st;c.st='hidden';L.render();L.toast(`Comment from ${c.who} hidden`,()=>{c.st=was;});},
 sounhide:t=>{const c=S.so.comments.find(x=>x.id===t.dataset.id);c.st='open';L.render();L.toast(`Comment from ${c.who} shown again`,()=>{c.st='hidden';});},
 soflag:t=>{const c=S.so.comments.find(x=>x.id===t.dataset.id);const was=c.flag;c.flag=was?null:['attention','Flagged by you'];L.render();L.toast(was?'Flag removed':'Flagged',()=>{c.flag=was;});},
 sobookfrom:()=>{S.overlay=DR.newbooking('Private party');L.render();},
 socollect:()=>L.toast('Collected just now, no new comments'),

 /* keywords */
 sokw:t=>{S.so.kw=S.so.kw===t.dataset.id?null:t.dataset.id;L.render();},
 sokwall:()=>{S.so.kw=null;L.render();},
 sokwtable:()=>{S.so.kwTable=!S.so.kwTable;L.render();},
 sorescan:()=>{if(S.so.scanning)return;S.so.scanning=true;L.render();setTimeout(()=>{S.so.scanning=false;S.so.lastScan='just now';const k=S.so.kws.find(x=>x.id==='k3');if(k&&!S.so.scanned){k.last='Just now';k.w[11]++;HITS.k3.unshift(['ig','@aarhusstiften','Hotel Skov has live music again on Friday with Low Tide','Just now']);}
  const n=SOCIAL.filter(x=>S.so.acc[x]).length;L.render();L.toast(S.so.scanned||!k?`Rescanned ${n} accounts, no new hits`:`Rescanned ${n} accounts, 1 new hit for Hotel Skov`);S.so.scanned=true;},1400);},
 soaddkw:()=>drawer(DR.sokw()),
 sokwnet:t=>{const on=t.getAttribute('aria-checked')==='true';t.setAttribute('aria-checked',String(!on));const b=t.querySelector('.box');b.classList.toggle('on',!on);b.innerHTML=on?'':ic('check');},
 sokwadd:()=>{const v=(document.getElementById('sokwin')?.value||'').trim();if(!v){L.toast('Type a keyword first');return;}
  const nets=[...document.querySelectorAll('[data-act="sokwnet"][aria-checked="true"]')].map(b=>b.dataset.n);
  const id='k'+Date.now();S.so.kws.push({id,kw:v,nets:nets.length?nets:['ig'],last:'No hits yet',on:true,w:WEEKS.map(()=>0)});S.so.kw=id;S.overlay=null;
  if(S.view!=='keywords')L.go('keywords');else L.render();
  L.toast(`Watching “${v}”, first scan tomorrow at 06:00`,()=>{S.so.kws=S.so.kws.filter(k=>k.id!==id);S.so.kw='k1';});},
 sokwpause:t=>{const k=S.so.kws.find(x=>x.id===t.dataset.id);k.on=!k.on;L.render();L.toast(k.on?`Watching “${k.kw}” again`:`Paused “${k.kw}”`,()=>{k.on=!k.on;});},
 sokwdel:t=>{const i=S.so.kws.findIndex(x=>x.id===t.dataset.id);const k=S.so.kws[i];S.so.kws.splice(i,1);S.so.kw=S.so.kws[0]?.id||null;L.render();
  L.toast(`Stopped watching “${k.kw}”`,()=>{S.so.kws.splice(i,0,k);S.so.kw=k.id;});},
 sohitopen:t=>L.toast(`Opens the post on ${NET[t.dataset.n].n} in a new tab`),

 /* deliveries */
 sodeliver:()=>drawer(DR.sodeliver(0)),
 sodeliverdo:()=>{const ti=+(document.getElementById('sodtrack')?.value||0);const tr=TRACKS[ti];
  const dest=document.querySelector('.so-dest .radio.on')?.dataset.n||DELIV.find(k=>S.so.acc[k]);if(!dest){L.toast('Connect YouTube or SoundCloud first');return;}
  const vis=document.querySelector('.so-vis button.on')?.textContent||'Public';const later=document.querySelector('.so-dwhen button.on')!==document.querySelector('.so-dwhen button');
  const id='d'+Date.now();const code='LT-DEL-0'+(10+S.so.dels.length);
  S.so.dels.unshift({id,code,track:tr[0],img:tr[2],dest,vis,when:later?'Fri 14 Nov, 00:00':'Today, just now',st:later?'queued':'processing',pct:4,plays:'—',file:tr[1],title:document.getElementById('sodtitle')?.value||tr[0]});
  S.overlay=null;if(S.view!=='deliveries')L.go('deliveries');else L.render();
  L.toast(later?`${tr[0]} goes up on ${NET[dest].n} on Fri 14 Nov`:`${tr[0]} is uploading to ${NET[dest].n}`,()=>{S.so.dels=S.so.dels.filter(d=>d.id!==id);});},
 sodel:t=>drawer(DR.sodel(t.dataset.id)),
 sodelcheck:t=>{const d=S.so.dels.find(x=>x.id===t.dataset.id);const was={...d};
  if(d.pct<90){d.pct=Math.min(100,d.pct+30);S.overlay=DR.sodel(d.id);L.render();return;}
  Object.assign(d,{st:'live',plays:'0'});S.overlay=DR.sodel(d.id);L.render();L.toast(`${d.track} is live on ${NET[d.dest].n}`,()=>{Object.assign(d,was);S.overlay=null;});},
 sodelcancel:t=>{const i=S.so.dels.findIndex(x=>x.id===t.dataset.id);const d=S.so.dels[i];S.so.dels.splice(i,1);S.overlay=null;L.render();
  L.toast(`${d.track} removed from deliveries`,()=>{S.so.dels.splice(i,0,d);});},
 soretry:t=>{const d=S.so.dels.find(x=>x.id===t.dataset.id);const was={...d};Object.assign(d,{st:'processing',pct:8,when:'Today, just now',file:d.file.replace(/\d+ kHz/,'44.1 kHz'),why:''});S.overlay=null;S.so.dbannerOff=false;L.render();
  L.toast(`${d.track} uploading again as 44.1 kHz`,()=>{Object.assign(d,was);});},
 sodelopen:t=>{const d=S.so.dels.find(x=>x.id===t.dataset.id);L.toast(`Opens ${d.track} on ${NET[d.dest].n} in a new tab`);},
 sotakedown:t=>{const d=S.so.dels.find(x=>x.id===t.dataset.id);
  modal(L.confirmM(`Take ${esc(d.track)} down from ${NET[d.dest].n}?`,`It disappears for listeners, with its ${d.plays} plays. The file stays in Catalogue and you can deliver it again.`,'Keep it live','sotakedowndo" data-id="'+d.id,'Take down',true));},
 sotakedowndo:t=>{const i=S.so.dels.findIndex(x=>x.id===t.dataset.id);const d=S.so.dels[i];S.so.dels.splice(i,1);S.overlay=null;L.render();
  L.toast(`${d.track} taken down from ${NET[d.dest].n}`,()=>{S.so.dels.splice(i,0,d);});},
});

/* track select updates the file line and the title */
L.CHANGE.push(t=>{if(t.id==='sodtrack'){const tr=TRACKS[+t.value];const f=document.getElementById('sodfile');if(f)f.textContent=tr[1]+', from Catalogue';const ti=document.getElementById('sodtitle');if(ti)ti.value=`Low Tide, ${tr[0]} (Official Audio)`;return true;}
 if(t.dataset&&t.dataset.soupload!==undefined&&t.files&&t.files[0]){L.toast(`${t.files[0].name} added`);return true;}return false;});
L.INPUT.push(t=>{
 if(t.id==='sosearch'){S.so.q=t.value;L.render();return true;}
 if(t.id==='socsearch'){S.so.cq=t.value;L.render();return true;}
 if(t.id==='sonptext'){if(S.so.np)S.so.np.text=t.value;const c=document.getElementById('sonpcount');if(c)c.textContent=countTxt(t.value);return true;}
 if(t.id==='sonpdate'||t.id==='sonptime'){syncNp();return true;}
 if(t.id&&t.id.startsWith('sor-')){S.so.rtext[t.id.slice(4)]=t.value;return true;}
 if(t.id==='sokwin'||t.id==='sodtitle')return true;
 return false;
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.bk-tr[data-act^="so"]')){e.preventDefault();e.target.click();}});

/* flows menu: the social area with and without accounts */
if(!L.FLOWS.some(f=>f[0]==='Social posts'))L.FLOWS.push(['Social posts','Draft, schedule, publish, comments, keywords, deliveries',()=>{Object.assign(S.so.acc,{ig:true,fb:true,tt:false,yt:true,sc:true});S.so.tab='scheduled';L.go('social');}],
 ['First social account','Nothing connected yet, connect where you post',()=>{Object.assign(S.so.acc,{ig:false,fb:false,tt:false,yt:false,sc:false});L.go('social');}]);
})();
