/* LAAS prototype · bookings area. Rebuilt 1:1 from the Figma section "UX · Bookings" (Build · LAAS v1.0).
   Screens: Bookings 156:1386, empty 156:1711, search 415:15981, no results 415:16318, filter open 448:21479,
   Past 456:22758, New booking 195:2986, New booking · drawer 203:3658, New booking · venue picked 433:20546.
   Uses window.LAAS (see index.html). */
(function(){
"use strict";
const L=window.LAAS;
const {S,ic,esc,IMG,VIEWS,ACTIONS,OVERLAYS,DR}=L;

/* ---------- data, as in the Figma rows ---------- */
const ROWS=[
 {id:'b1',when:'Fri 24 Oct 20:00',title:'Saturday hotel gig',type:'Concert',where:'Aarhus',venue:'Hotel Skov',img:'hotel-skov',contact:'Mette Krogh',st:'Confirmed',tag:'confirmed',pay:'Invoiced',pc:'Invoiced, not paid',fee:'4.500',tab:'up',need:true},
 {id:'b2',when:'Sat 25 Oct 14:00',title:'Rehearsal',type:'Rehearsal',where:'Studio B',venue:'Studio B',img:'studio-b',contact:'Kasper Holm',st:'Draft',tag:'draft',pay:'—',pc:'No fee yet',fee:'—',tab:'draft'},
 {id:'b3',when:'Sat 1 Nov 18:00',title:'Private party',type:'Private',where:'No venue',venue:'',img:'',contact:'',st:'Draft',tag:'draft',pay:'No contact',pc:'No fee yet',fee:'6.000',tab:'draft',need:true},
 {id:'b4',when:'Sat 15 Nov 21:00',title:'Club night',type:'Concert',where:'Copenhagen',venue:'Club Mono',img:'club-mono',contact:'Anders Bech',st:'Attention',tag:'attention',pay:'Invoiced, not paid',pc:'Invoiced, not paid',fee:'6.000',tab:'up',need:true},
 {id:'b5',when:'Fri 28 Nov 19:30',title:'Support slot',type:'Concert',where:'Odense',venue:'Odense Live',img:'odense-live',contact:'Line Dahl',st:'Confirmed',tag:'confirmed',pay:'Deposit paid',pc:'Deposit paid',fee:'2.500',tab:'up'},
 {id:'b6',when:'Tue 2 Dec 19:00',title:'Christmas party',type:'Corporate',where:'Odense',venue:'Posten',img:'posten',contact:'',st:'Paid',tag:'paid',pay:'Paid',pc:'Paid',fee:'8.000',tab:'up'},
 {id:'p1',when:'Sat 18 Oct 21:00',title:'Release show',type:'Concert',where:'Copenhagen',venue:'Loppen',img:'loppen',contact:'',st:'Completed',tag:'paid',pay:'Settled, rated 5',pc:'Paid',fee:'7.000',tab:'past'},
 {id:'p2',when:'Fri 10 Oct 20:00',title:'Club night',type:'Concert',where:'Copenhagen',venue:'Club Mono',img:'club-mono',contact:'Anders Bech',st:'Completed',tag:'paid',pay:'Settled, rated 4',pc:'Paid',fee:'6.000',tab:'past'},
 {id:'p4',when:'Sat 27 Sep 19:30',title:'Autumn party',type:'Private',where:'Aarhus',venue:'Hotel Royal',img:'hotel-royal',contact:'Mette Kjær',st:'Completed',tag:'paid',pay:'Settled, rated 4',pc:'Paid',fee:'5.500',tab:'past'},
 {id:'p3',when:'Thu 18 Sep 21:00',title:'Support slot',type:'Concert',where:'Odense',venue:'Odense Live',img:'odense-live',contact:'Line Dahl',st:'Completed',tag:'paid',pay:'Settled, not rated',pc:'Paid',fee:'2.500',tab:'past',go:'rate'},
 {id:'p5',when:'Sat 6 Sep 20:00',title:'Town festival',type:'Festival',where:'Odense',venue:'Posten',img:'posten',contact:'',st:'Completed',tag:'paid',pay:'Paid, settle now',pc:'Paid',fee:'9.000',tab:'past',go:'settle'},
 {id:'p6',when:'Fri 22 Aug 20:00',title:'Hotel gig',type:'Concert',where:'Aarhus',venue:'Hotel Skov',img:'hotel-skov',contact:'Mette Krogh',st:'Cancelled',tag:'danger',pay:'Deposit kept',pc:'Deposit paid',fee:'1.500',tab:'past'},
];
const COUNTS={up:9,need:3,draft:2,past:31};
const FILTERS={
 status:{label:'Status',opts:[['Enquiry',1],['Hold',1],['Offer out',1],['Confirmed',4],['Completed',31],['Paid',2],['Cancelled',2]]},
 kind:{label:'Kind',opts:['Concert','Rehearsal','Private','Corporate','Festival'].map(o=>[o,ROWS.filter(r=>r.type===o).length])},
 pay:{label:'Payment',opts:['Paid','Deposit paid','Invoiced, not paid','No fee yet'].map(o=>[o,ROWS.filter(r=>r.pc===o).length])},
};
/* venues the new-booking venue search knows; Hotel Skov first (the venue in Mette's mail) */
const NBV=[{id:'skov',name:'Hotel Skov',city:'Aarhus',kind:'hotel bar',cap:'120',img:'hotel-skov',tint:'#1c3326'},
 ...L.VENUES.map(v=>({id:v.id,name:v.name,city:v.city,kind:v.kind.toLowerCase(),cap:String(v.cap).replace(/\D.*$/,''),img:v.img,tint:v.tint}))];

S.bk??={empty:false};
S.nb??={venue:null,pick:false,vq:'',sec:'deal',people:{Vital:true,Jonas:true,Mia:true,Dep:false},saved:'Draft saved 2 min ago',title:''};
S.statusFilter??=[];S.filters.kind??=[];S.filters.pay??=[];S.search??='';S.bookTab??='up';
const F=k=>k==='status'?S.statusFilter:S.filters[k];

function rows(){
 const t=S.bookTab;
 let list=ROWS.filter(r=>t==='past'?r.tab==='past':t==='draft'?r.tab==='draft':t==='need'?r.need:r.tab!=='past');
 if(S.statusFilter.length)list=list.filter(r=>S.statusFilter.includes(r.st));
 if(S.filters.kind.length)list=list.filter(r=>S.filters.kind.includes(r.type));
 if(S.filters.pay.length)list=list.filter(r=>S.filters.pay.includes(r.pc));
 const q=S.search.trim().toLowerCase();
 if(q)list=list.filter(r=>[r.title,r.venue,r.where,r.contact].join(' ').toLowerCase().includes(q));
 return list;
}
L.filteredBookings=rows;

/* ---------- list page ---------- */
const hl=(t,q)=>L.hl(t,q||'');
const thumb=r=>r.img?`<img class="bk-thumb" src="${IMG(r.img)}" alt="">`:`<span class="bk-thumb none">${ic('pin')}</span>`;
const activeF=()=>Object.keys(FILTERS).filter(k=>F(k).length).map(k=>`${FILTERS[k].label}: ${F(k).join(', ')}`).join(', ');
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

function header(){
 const past=S.bookTab==='past';
 const sub=S.bk.empty?'No bookings yet':past?'31 gigs in 2026, 112.400 DKK settled':'12 bookings, 13.500 DKK not paid';
 return `<div class="bk-ph"><div class="bk-tb"><h1 class="t-display">Bookings &amp; agreements</h1><p>${sub}</p></div>
 <button class="btn secondary" data-act="export">Export</button><button class="btn accent" data-act="newbooking">${ic('plus')}New booking</button></div>`;
}
function tabs(){
 return `<div class="bk-tabs" role="tablist">${[['up','Upcoming'],['need','Needs you'],['draft','Drafts'],['past','Past']].map(([k,l])=>`<button role="tab" aria-selected="${S.bookTab===k}" class="${S.bookTab===k?'on':''}" data-tab="${k}"><span class="in"><span class="l">${l}</span><span class="c">${COUNTS[k]}</span></span></button>`).join('')}</div>`;
}
function filters(){
 const chip=k=>{const v=F(k);return `<button class="bk-chip ${v.length?'on':''}" data-act="bkfilter" data-key="${k}" aria-haspopup="dialog">${FILTERS[k].label}: ${v.length?esc(v.join(', ')):'all'}</button>`;};
 return `<div class="bk-filters">${chip('status')}${chip('kind')}${chip('pay')}<span class="sp"></span>
 <label class="bk-search">${ic('search')}<input id="bsearch" placeholder="Title, venue, contact" value="${esc(S.search)}" aria-label="Search bookings" autocomplete="off"></label></div>`;
}
function table(list,q){
 return `<div class="bk-table" role="table" aria-label="Bookings"><div class="bk-tr bk-th" role="row"><span>When</span><span>Title</span><span>Type</span><span>Where</span><span>Status</span><span>Payment</span><span class="n">Fee</span></div>
 ${list.map((r,i)=>`<div class="bk-tr" role="row" tabindex="0" data-act="bkrow" data-id="${r.id}" style="--i:${i}"><span class="w">${r.when}</span><span class="tt">${thumb(r)}<b>${hl(r.title,q)}</b></span><span class="m">${r.type}</span><span class="m">${hl(r.where,q)}</span><span><span class="tag ${r.tag}">${r.st}</span></span><span class="m">${r.pay}</span><span class="n mono">${r.fee}</span></div>`).join('')}</div>`;
}
function footer(list,q){
 const past=S.bookTab==='past';const total=past?31:12;const af=activeF();
 let txt,btn;
 if(q){txt=`${list.length} of ${total} match “${esc(q)}” in title, venue or contact`;btn=`<button class="btn ghost s bk-fb" data-act="clearsearch">Clear search</button>`;}
 else if(af){txt=`${list.length} of ${total} match ${esc(af)}`;btn=`<button class="btn ghost s bk-fb" data-act="bkshowall">Show all 12</button>`;}
 else{txt=past?`Showing ${list.length} of 31, newest first. 1 gig to settle, 1 to rate.`:`Showing ${list.length} of 12, sorted by date`;btn=`<button class="btn ghost s bk-fb" data-act="bkshowall">Show all 12</button>`;}
 return `<div class="bk-foot"><span>${txt}</span>${btn}</div>`;
}
function noResults(q){
 if(q)return `<div class="bk-empty"><div class="hd"><h2 class="t-title">No match for “${esc(q)}”</h2><p>Nothing in title, venue or contact. Check the spelling, clear the filters, or start a booking called ${esc(cap(q))}.</p></div>
 <div class="acts"><button class="btn secondary" data-act="newbooking">${ic('plus')}New booking “${esc(cap(q))}”</button><button class="btn ghost" data-act="clearsearch">Clear search</button></div></div>`;
 return `<div class="bk-empty"><div class="hd"><h2 class="t-title">Nothing matches these filters</h2><p>${esc(activeF())}. Try fewer filters, or clear them.</p></div>
 <div class="acts"><button class="btn ghost" data-act="clearfilters">Clear filters</button></div></div>`;
}
function pastTiles(){
 return `<div class="bk-tiles">${[['loppen','Loppen','Best rated, 5 of 5','venue','loppen'],['hotel-royal','3 times','Hotel Royal, most played','venue','royal'],['posten','9.000 DKK','Biggest fee, Town festival','settle',''],['odense-live','1 to rate','Support slot, 18 Sep','rate','']].map(([im,b,s,g,id])=>`<button class="bk-tile" data-go="${g}" ${id?`data-id="${id}"`:''}><img src="${IMG(im)}" alt=""><span class="tx"><b>${b}</b><small>${s}</small></span></button>`).join('')}</div>`;
}
function emptyChoice(){
 return `<div class="bk-start"><div class="bk-empty choice"><div class="hd"><h2 class="t-title">How do you want to start?</h2><p>No bookings yet. Create one, import a calendar, or look at a sample first.</p></div>
 <div class="bk-choices">${[['stagedive','New booking','Date, venue, fee, people','newbooking'],['notebook','Import calendar','Google, Microsoft 365 or .ics','bkimport'],['rehearsal','Sample booking','Marked as test, delete any time','bksample']].map(([im,t,b,a])=>`<button class="bk-choice" data-act="${a}"><img src="${IMG(im)}" alt=""><b>${t}</b><small>${b}</small></button>`).join('')}</div></div></div>`;
}

VIEWS.bookings=()=>{
 if(S.bk.empty)return `<div class="page bk">${header()}${emptyChoice()}</div>${L.abar()}`;
 const q=S.search.trim();const list=rows();
 return `<div class="page bk">${header()}${tabs()}
 <div class="bk-content">${S.bookTab==='past'?pastTiles():''}${filters()}
 ${list.length?table(list,q)+footer(list,q):noResults(q)}</div></div>${L.abar()}`;
};

/* ---------- filter menu (status, kind, payment) ---------- */
OVERLAYS.bkfilter=o=>{const f=FILTERS[o.key];const v=F(o.key);
 return `<div class="scrim" style="background:transparent" data-act="close"></div><div class="pop bk-menu" style="left:${o.x}px;top:${o.y}px" role="dialog" aria-label="Filter by ${f.label.toLowerCase()}">
 <div class="hd">${f.label}</div>${f.opts.map(([x,n])=>`<button class="opt" role="menuitemcheckbox" aria-checked="${v.includes(x)}" data-act="bkftoggle" data-key="${o.key}" data-v="${esc(x)}"><span class="box ${v.includes(x)?'on':''}">${v.includes(x)?ic('check'):''}</span><span class="l">${x}</span><span class="n">${n}</span></button>`).join('')}
 <div class="ft"><button class="btn ghost s" data-act="bkfclear" data-key="${o.key}">Clear</button></div></div>`;};

const goRow=id=>{const r=ROWS.find(x=>x.id===id);if(!r)return;
 if(r.go)return L.go(r.go);
 S.booking.cancelled=r.st==='Cancelled';
 if(r.st==='Completed'||r.st==='Cancelled'){S.booking.state='completed';S.booking.settled=true;}
 L.go('booking',{id});};

Object.assign(ACTIONS,{
 bkfilter:(t,r)=>L.open('bkfilter',{key:t.dataset.key,x:Math.max(8,Math.min(r.left,innerWidth-268)),y:r.bottom+6}),
 statusmenu:(t,r)=>{if(S.view!=='bookings')return L.open('statusmenu',{x:Math.min(r.left,innerWidth-276),y:r.bottom+6});L.open('bkfilter',{key:'status',x:Math.max(8,Math.min(r.left,innerWidth-268)),y:r.bottom+6});},
 bkftoggle:t=>{const k=t.dataset.key,x=t.dataset.v,arr=F(k);const next=arr.includes(x)?arr.filter(y=>y!==x):[...arr,x];if(k==='status')S.statusFilter=next;else S.filters[k]=next;L.render();},
 bkfclear:t=>{const k=t.dataset.key;if(k==='status')S.statusFilter=[];else S.filters[k]=[];L.close();},
 bkshowall:()=>{const had=S.search||activeF();S.search='';S.statusFilter=[];S.filters.kind=[];S.filters.pay=[];S.bookTab=S.bookTab==='past'?'past':'up';L.render();L.toast(had?'Filters cleared, all bookings shown':'All 12 bookings, sorted by date');},
 clearfilters:()=>{S.search='';S.statusFilter=[];S.filters.kind=[];S.filters.pay=[];L.render();},
 bkrow:t=>goRow(t.dataset.id),
 bkimport:()=>{L.go('integrations');L.toast('Connect Google, Microsoft 365 or add an .ics link to import');},
 bksample:()=>{S.bk.empty=false;L.render();L.toast('Sample bookings added, marked as test',()=>{S.bk.empty=true;L.render();});},
 export:()=>{const n=rows().length;L.open('modal',{html:`<div class="bk-modal"><h2 class="t-title">Export bookings</h2><div class="field"><label>Format</label><div class="seg"><button class="on">CSV</button><button>Excel</button><button>PDF</button></div></div><label class="row" style="gap:10px"><input type="checkbox" checked style="width:16px;height:16px;accent-color:var(--ink)">Only the ${n} shown now</label><div class="row" style="justify-content:flex-end"><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="close" data-msg="Export ready: ${n} bookings">Export</button></div></div>`});},
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.bk-tr[data-act="bkrow"]')){e.preventDefault();goRow(e.target.dataset.id);}});

/* ---------- new booking drawer ---------- */
const sel=(id,val,opts)=>`<span class="bk-sel"><select class="input" id="${id}">${opts.map(o=>`<option ${o===val?'selected':''}>${esc(o)}</option>`).join('')}</select>${ic('down')}</span>`;
const lead=(icon,id,val)=>`<span class="bk-lead">${ic(icon)}<input class="input" id="${id}" value="${esc(val)}"></span>`;
DR.newbooking=(name='')=>{const what=name?cap(name):'Hotel gig';return {type:'drawer',title:'New booking',sub:'Five things to start, the rest later',
 body:`<div class="bk-nbd"><div class="bk-describe"><div class="r">${ic('ai','s')}<span>Hotel Skov, Friday 24 Oct, 20:00, 4.500 kr, Mette books</span></div><div class="m">${ic('check','s')}<span>Filled 5 of 5 from your words, venue and contact matched</span></div></div>
 <div class="field"><label for="nbw">What</label><input class="input" id="nbw" value="${esc(what)}"><span class="help">From your words, edit if wrong</span></div>
 <div class="field w-280"><label for="nbt">When</label>${lead('calendar','nbt','Fri 24 Oct 2026, 20:00')}</div>
 <div class="field w-240"><label for="nbk">Kind</label>${sel('nbk','Concert',['Concert','Rehearsal','Private','Corporate','Festival'])}</div>
 <div class="field"><label for="nbv">Where</label>${lead('pin','nbv','Hotel Skov, Aarhus')}<span class="help">Matched, capacity 300</span></div>
 <div class="field w-400"><label for="nbc">Who booked</label>${sel('nbc','Mette Krogh',['Mette Krogh','Jens Skov'])}<span class="help">Matched, 2 contacts at venue</span></div>
 <div class="field w-200"><label for="nbf">Fee</label><input class="input" id="nbf" value="4.500" inputmode="numeric"><span class="help">DKK before VAT, payment terms later</span></div>
 <div class="bk-later"><span>Add later</span><div>${[['Day times','day'],['People','people'],['Files','files'],['Deposit','deal']].map(([l,s])=>`<button class="bk-chip" data-act="bklater" data-sec="${s}">${l}</button>`).join('')}</div></div>
 <div class="bk-what">${ic('ai','s')}<span>Creates LT-0043 as a draft on the calendar. Nothing is sent to Mette until you confirm it from the booking.</span></div></div>`,
 foot:`<button class="btn ghost s" data-act="fulleditor">Full editor</button><span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="createbooking">${ic('check')}Create booking</button>`};};

/* ---------- new booking full editor ---------- */
const SECS=[['deal','Deal','money'],['day','Day','calendar'],['people','People','users'],['files','Files','file']];
const field=(label,ctrl,help,cls='',err)=>`<div class="field ${cls}"><label>${label}</label>${ctrl}${help?`<span class="help ${err?'err':''}">${help}</span>`:''}</div>`;
function venueField(){
 const v=S.nb.venue;const q=S.nb.vq.trim().toLowerCase();
 const list=NBV.filter(x=>!q||(x.name+' '+x.city).toLowerCase().includes(q));
 return `<div class="field bk-vf"><label for="nbvenue">Venue</label><span class="bk-lead ${v?'':'err'}">${ic('search')}<input class="input" id="nbvenue" placeholder="Search venues" value="${esc(v?v.name+', '+v.city:S.nb.vq)}" autocomplete="off" aria-expanded="${S.nb.pick}"></span>
 ${S.nb.pick?`<div class="bk-vlist" role="listbox">${list.length?list.map(x=>`<button role="option" data-act="nbpick" data-v="${x.id}"><img src="${IMG(x.img)}" alt=""><span><b>${esc(x.name)}</b><small>${esc(x.city)}, ${esc(x.kind)}, capacity ${x.cap}</small></span></button>`).join(''):`<div class="none">No venue called “${esc(S.nb.vq)}”</div>`}<button data-act="nbaddvenue" class="add">${ic('plus','s')}Add ${esc(S.nb.vq?cap(S.nb.vq):'Hotel Skov')} as a new venue</button></div>`:''}
 <span class="help ${v?'':'err'}">${v?`Matched, ${esc(v.kind)}, capacity ${v.cap}`:'No venue — pick one or add Hotel Skov'}</span></div>`;
}
function gigCard(){
 const v=S.nb.venue;const title=esc(S.nb.title||'Saturday hotel gig');
 const txt=`<div class="tx"><span class="when">Fri 24 Oct, 20:00, 75 min set</span><span class="ti">${title}</span><span class="wh ${v?'':'err'}">${ic('pin','s')}${v?esc(v.name+', '+v.city):'No venue yet'}</span><hr><div class="facts"><span><b class="mono">4.500 DKK</b><small>fee, invoice 14 days</small></span><span><b>3 of 4</b><small>people confirmed</small></span></div><span class="who"><i></i>Mette Krogh, booker</span></div>`;
 return v?`<div class="bk-gig picked" style="--tint:${v.tint}"><div class="cv"><img src="${IMG(v.img)}" alt=""><span class="tag">Draft</span></div>${txt}</div>`
  :`<div class="bk-gig"><div class="cv none">${ic('pin')}<span>Pick a venue and its photo shows here</span></div>${txt}<span class="tag draft">Draft</span></div>`;
}
VIEWS.newbooking=()=>{const n=S.nb;
 return `<div class="bk-nbe" id="nbe">
 <header class="bk-ebar"><button class="btn ghost s" data-act="nbback">${ic('left','s')}Bookings</button>
  <div class="ti"><span class="mono id">LT-0043</span><b>New booking</b><span class="tag draft">Draft</span><span class="saved">${ic('check','s')}<span id="nbsaved">${n.saved}</span></span></div>
  <button class="btn ghost" data-act="nbcancel">Cancel</button><button class="btn secondary" data-act="nbsavedraft">Save draft</button><button class="btn accent" data-act="nbconfirm">${ic('check')}Save &amp; confirm</button></header>
 <div class="bk-ebody"><div class="bk-editor" id="nbscroll">
  <nav class="bk-idx" aria-label="Sections"><span class="k">Sections</span>${SECS.map(([k,l,i])=>`<button class="${n.sec===k?'on':''}" data-act="nbsec" data-sec="${k}">${ic(i)}<span>${l}</span></button>`).join('')}<p>The index follows the scroll. Required gaps are named, never a dash.</p></nav>
  <div class="bk-form">
   <section id="nb-deal"><div class="sh"><h2 class="t-heading">Deal</h2><span>what, where, for how much</span></div>
    <div class="g2">${field('Title',`<input class="input" id="nbtitle" value="${esc(n.title||'Saturday hotel gig')}">`,'Shown on the day sheet and the offer','w-400')}
    ${field('Kind',sel('nbkind','Concert',['Concert','Rehearsal','Private','Corporate','Festival']),'15 kinds','w-240')}
    ${venueField()}
    ${field('Contact',sel('nbcontact','Mette Krogh, Hotel Skov',['Mette Krogh, Hotel Skov','Jens Skov, Hotel Skov']),'Two contacts at this venue','w-400')}
    ${field('Fee',`<input class="input" id="nbfee" value="4.500" inputmode="numeric">`,'DKK, before VAT','w-200')}
    ${field('Payment',sel('nbpay','Invoice, 14 days',['Invoice, 14 days','Invoice, 30 days','Cash on the night','Deposit and balance']),'Deposit optional','w-240')}</div></section>
   <section id="nb-day"><div class="sh"><h2 class="t-heading">Day</h2><span>times go straight to the day sheet</span></div>
    <div class="bk-times">${field('Date',lead('calendar','nbdate','Fri 24 Oct 2026'),'','date')}${[['Load-in','14:00'],['Soundcheck','16:30'],['Doors','19:00'],['Set','20:00','75 min'],['Curfew','23:00']].map(([l,v,h])=>field(l,`<input class="input" value="${v}" inputmode="numeric" aria-label="${l}">`,h||'')).join('')}</div></section>
   <section id="nb-people"><div class="sh"><h2 class="t-heading">People</h2><span>who plays, who drives</span></div>
    <div class="bk-people">${[['Vital','Vital, vocals'],['Jonas','Jonas, drums, driver'],['Mia','Mia, bass'],['Dep','Dep guitarist needed']].map(([k,l])=>`<button class="bk-cb" role="checkbox" aria-checked="${!!n.people[k]}" data-act="nbperson" data-k="${k}"><span class="box ${n.people[k]?'on':''}">${n.people[k]?ic('check'):''}</span>${l}</button>`).join('')}</div></section>
   <section id="nb-files"><div class="sh"><h2 class="t-heading">Files</h2><span>attach or pull from the venue</span></div>
    <div class="bk-files">${[['Rider v3','PDF, 240 KB, from Gear','confirmed','Confirmed','gear'],['Stage plot','PNG, updated 2 Oct','confirmed','Confirmed','plot'],['Contract','Not sent yet','draft','Draft','contract']].map(([t,m,c,s,k])=>`<button class="bk-file" data-act="nbfile" data-k="${k}"><span><b>${t}</b><small>${m}</small></span><span class="tag ${c}">${s}</span></button>`).join('')}</div></section>
  </div>
  <aside class="bk-live"><span class="k">As it will appear</span>${gigCard()}<p>Save &amp; confirm will show every field that changed before anything is sent.</p></aside>
 </div></div>
 <div class="bk-ebar2"><div class="bk-abar">${ic('ai')}<span class="rec">LT-0043, New booking<button data-act="nbrec" aria-label="Remove record">${ic('x','s')}</button></span><input id="nbask" placeholder="Fill this from the mail Mette sent…" aria-label="Ask the assistant"><button class="btn ghost s" data-go="assistant">New</button><button class="btn ghost s" data-go="assistant">Open</button><button class="btn accent" data-act="nbask">Ask</button></div></div>
 </div>`;};
L.AREAS.gigs.includes('newbooking')||L.AREAS.gigs.push('newbooking');

const resetNb=()=>{S.nb.venue=null;S.nb.pick=false;S.nb.vq='';S.nb.sec='deal';S.nb.title='';S.nb.saved='Draft saved 2 min ago';};
const markSaved=()=>{S.nb.saved='Draft saved just now';const el=document.getElementById('nbsaved');if(el)el.textContent=S.nb.saved;};
Object.assign(ACTIONS,{
 newbooking:()=>{S.overlay=DR.newbooking(S.view==='bookings'?S.search.trim():'');L.render();},
 fulleditor:()=>{const t=document.getElementById('nbw')?.value;resetNb();if(t&&t!=='Hotel gig')S.nb.title=t;S.overlay=null;L.go('newbooking');},
 bklater:t=>{resetNb();S.nb.sec=t.dataset.sec;S.overlay=null;L.go('newbooking');setTimeout(()=>document.getElementById('nb-'+t.dataset.sec)?.scrollIntoView({block:'start'}),120);},
 createbooking:()=>{S.overlay=null;S.bk.empty=false;S.booking.state='enquiry';S.booking.cancelled=false;L.go('booking');L.toast('LT-0043 created as a draft, nothing sent',()=>{});},
 nbback:()=>{L.go('bookings');L.toast('Draft LT-0043 kept in Drafts');},
 nbcancel:()=>{L.go('bookings');L.toast('New booking discarded',()=>L.go('newbooking'));},
 nbsavedraft:()=>{S.bookTab='draft';L.go('bookings');L.toast('Saved as a draft, LT-0043');},
 nbconfirm:()=>{const v=S.nb.venue;L.open('modal',{html:`<div class="bk-modal"><h2 class="t-title">Save and confirm LT-0043?</h2><p class="muted" style="margin:0">These fields are new. Nothing goes to Mette until you send the offer from the booking.</p>
  <dl class="bk-chg">${[['Title',S.nb.title||'Saturday hotel gig'],['Venue',v?v.name+', '+v.city:'No venue yet'],['Date','Fri 24 Oct 2026, set 20:00'],['Fee','4.500 DKK, invoice 14 days'],['People','3 of 4 confirmed']].map(([k,x])=>`<dt>${k}</dt><dd>${esc(x)}</dd>`).join('')}</dl>
  <div class="row" style="justify-content:flex-end"><button class="btn secondary" data-act="close">Keep editing</button><button class="btn accent" data-act="createbooking">${ic('check')}Confirm booking</button></div></div>`});},
 nbsec:t=>{S.nb.sec=t.dataset.sec;document.querySelectorAll('.bk-idx button').forEach(b=>b.classList.toggle('on',b===t));document.getElementById('nb-'+t.dataset.sec)?.scrollIntoView({behavior:'smooth',block:'start'});},
 nbpick:t=>{S.nb.venue=NBV.find(x=>x.id===t.dataset.v);S.nb.pick=false;S.nb.vq='';markSaved();L.render();},
 nbaddvenue:()=>{const name=S.nb.vq?cap(S.nb.vq.trim()):'Hotel Skov';S.nb.venue=S.nb.vq?{id:'new',name,city:'Aarhus',kind:'new venue',cap:'unknown',img:'hotel-skov',tint:'#1c3326'}:NBV[0];S.nb.pick=false;S.nb.vq='';markSaved();L.render();L.toast(`Venue added: ${name}`);},
 nbperson:t=>{const k=t.dataset.k;S.nb.people[k]=!S.nb.people[k];markSaved();L.render();},
 nbfile:t=>({gear:()=>L.toast('Rider v3 attached from Gear, PDF, 240 KB'),plot:()=>L.toast('Stage plot opened, PNG, updated 2 Oct'),contract:()=>L.toast('The contract goes out with the offer, after you confirm')})[t.dataset.k](),
 nbrec:()=>L.toast('Record removed from the question'),
 nbask:()=>{const q=(document.getElementById('nbask')?.value||'').trim();if(q){S.asst='q';S.asstQ=q;}L.go('assistant');},
});
/* venue search: open on focus, filter on input, close on outside click */
document.addEventListener('focusin',e=>{if(e.target.id==='nbvenue'&&!S.nb.pick){S.nb.pick=true;if(S.nb.venue){S.nb.vq='';S.nb.venue=null;}L.render();}});
document.addEventListener('mousedown',e=>{if(S.view==='newbooking'&&S.nb.pick&&!e.target.closest('.bk-vf')){S.nb.pick=false;L.render();}});
L.INPUT.push(t=>{
 if(t.id==='nbvenue'){S.nb.vq=t.value;S.nb.pick=true;L.render();return true;}
 if(t.id==='nbtitle'){S.nb.title=t.value;markSaved();const g=document.querySelector('.bk-gig .ti');if(g)g.textContent=t.value;return true;}
 if(t.closest&&t.closest('.bk-nbe')){markSaved();return true;}
 return false;
});
/* section index follows the scroll */
document.addEventListener('scroll',e=>{if(S.view!=='newbooking'||!e.target.closest||!e.target.closest('.bk-nbe'))return;
 const top=e.target.getBoundingClientRect?e.target.getBoundingClientRect().top:0;let cur='deal';
 for(const [k] of SECS){const s=document.getElementById('nb-'+k);if(s&&s.getBoundingClientRect().top-top<160)cur=k;}
 if(cur!==S.nb.sec){S.nb.sec=cur;document.querySelectorAll('.bk-idx button').forEach(b=>b.classList.toggle('on',b.dataset.sec===cur));}},true);

/* flows menu: reach the empty state */
if(!L.FLOWS.some(f=>f[0]==='First booking'))L.FLOWS.splice(2,0,['First booking','Empty bookings, choose how to start',()=>{S.bk.empty=true;S.bookTab='up';S.search='';L.go('bookings');}]);
})();
