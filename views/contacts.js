/* LAAS prototype · contacts area. Rebuilt 1:1 from the Figma section "UX · Contacts & venues" (page Build · LAAS v1.0).
   Views: contacts (People / Venues chips switch the list in place), venues, contact, venue.
   Drawers: newcontact, newvenue, import (3 steps). Uses window.LAAS (see index.html). */
(function(){
"use strict";
const L=window.LAAS;
const {S,ic,esc,hl,IMG,V,VENUES,STATUS}=L;

/* ---------- icons missing from the core set (lucide.dev) ---------- */
L.P.user??='<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>';
L.P.loader??='<path d="M21 12a9 9 0 1 1-6.219-8.56"/>';
L.P.lock??='<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>';

/* ---------- state ---------- */
S.cv??={tab:'people',sort:'last',vsort:'played',all:false,empty:false,edit:null,save:'',vq:'',
 banner:true,vbanner:true,org:'Hotel Roy',orgOpen:true,rating:4,dupAll:false};
for(const k of ['ccity','vplayed','vcity','vpa'])S.filters[k]??=[];

/* ---------- data, copy from Figma ---------- */
const PEOPLE=[
 {id:'c1',name:'Mette Krogh, Hotel Skov',kind:'Booker',where:'Aarhus',last:'2 days ago',d:10,status:['confirmed','Confirmed'],n:4,added:1},
 {id:'c2',name:'Jonas Beck, Hotel Skov',kind:'Bar manager',where:'Aarhus',last:'3 weeks ago',d:20,status:null,n:1,added:4},
 {id:'c3',name:'Studio B',kind:'Rehearsal space',where:'Copenhagen',last:'yesterday',d:30,status:['paid','Paid'],n:12,added:6},
 {id:'c4',name:'Club Mono',kind:'Venue',where:'Copenhagen',last:'1 week ago',d:40,status:['attention','Attention'],n:2,added:3},
 {id:'c5',name:'Sara Lind',kind:'Promoter',where:'Odense',last:'5 weeks ago',d:50,status:['draft','Draft'],n:0,added:2},
 {id:'c6',name:'Kasper Holm',kind:'Sound engineer',where:'Aarhus',last:'2 months ago',d:60,status:null,n:6,added:5},
];
/* the other 18 of "People 24", shown after Show all 24 */
const MORE=['Anna Holt','Peter Dahl','Line Bach','Morten Friis','Camilla Juhl','Rasmus Lund','Ida Kragh','Thomas Brix','Sofie Wind','Mikkel Ravn','Nanna Skov','Jakob Mørk','Freja Lange','Emil Kjeldsen','Laura Vinther','Oliver Bang','Maja Holm','Anders Due']
 .map((n,i)=>({id:'c1',name:n,kind:['Promoter','Agent','Festival','Private client','Press','Sound engineer'][i%6],where:['Aarhus','Copenhagen','Odense'][i%3],last:`${3+i%9} months ago`,d:90+i*11,status:null,n:i%3,added:7+i}));
const KINDS=['Booker','Bar manager','Rehearsal space','Venue','Promoter','Sound engineer','Agent','Festival','Private client','Press'];
const CITIES=['Aarhus','Copenhagen','Odense'];
const VROWS={
 royal:{sub:'Aarhus, hotel bar, 120, PA and drums in house, played 3×, typical 4.500, next Sat 25 Oct',tag:['confirmed','Booked'],pa:true,last:1,people:'Mette Kjær Kasper Holm'},
 mono:{sub:'Copenhagen, club, 300, PA, played 2×, typical 6.000, balance 4.000 due 28 Oct',tag:['attention','Owes you'],pa:true,last:2,people:''},
 studiob:{sub:'Copenhagen, rehearsal space, 40, hourly, 12 bookings',tag:['confirmed','Regular'],pa:false,last:3,people:''},
 odense:{sub:'Odense, venue, 450, full PA and engineer, played 1×, paid early',tag:['confirmed','Played'],pa:true,last:4,people:'Sara Lind'},
 loppen:{sub:'Copenhagen, club, 400, PA, enquiry for 14 Nov, never played',tag:['draft','Enquiry'],pa:true,last:5,people:''},
 posten:{sub:'Odense, venue, 600, PA, never played, added from an email',tag:['draft','New'],pa:true,last:6,people:''},
};
const CONTACT_DETAIL={
 c1:{first:'Mette',name:'Mette Kjær',ini:'MK',kind:'Venue booker',org:'Hotel Royal',where:'Aarhus',n:4,last:'2 days ago',img:'hotel-royal',
  details:[['Kind','Venue booker, books acts for a venue they work at','l'],['Organisation','Hotel Royal A/S, CVR 12 34 56 78, Store Torv 4, 8000 Aarhus','l'],['Role','Events and bar manager','m'],['Email','booking@hotelroyal.dk, invoices to faktura@hotelroyal.dk','l'],['Phone','+45 86 12 00 00, prefers email','s'],['Language','Danish','s'],['Tags','Aarhus, hotel, repeat','m']],
  notes:'Likes a quiet first set while guests eat. Pays from the hotel’s accounts department, so send invoices to faktura@ as well. Asked about a Christmas date in 2027.',
  ask:'Ask about Mette — what did we charge last time, draft a Christmas offer, when did she last pay'},
};
const BOOK_ROWS=[['Saturday hotel gig','Sat 25 Oct 2026, 5.000 DKK, deposit waiting','confirmed','Confirmed','b1'],['Spring hotel gig','Sat 12 Apr 2025, 4.000 DKK, paid 12 days after','paid','Paid','p1'],['New Year’s bar set','Tue 31 Dec 2024, 5.000 DKK, paid on time','paid','Paid','p2']];
const VENUE_BOOK_ROWS=[...BOOK_ROWS,['Summer party enquiry','Jun 2024, no reply from us','draft','Draft','b3']];
const ON_STAGE=[['Stage','6 × 4 m, 40 cm riser, corner of the bar','m'],['PA','In house, 2 tops, 2 subs, 16-channel desk','m'],['Backline','Drums (Yamaha stage) and bass amp, bring guitar amps','l'],['Sound engineer','On request, 800 DKK, ask when confirming','m']];
const GETTING=[['Load-in','Back entrance on Kannikegade, 2 steps, trolley there','l'],['Parking','2 spaces in the yard, ask for the code','m'],['Stay','2 rooms included when you play, breakfast 07–10','m'],['Curfew','23:30 on weekdays, 00:30 Fri and Sat','m']];
const PEOPLE_HERE=[['MK','Mette Kjær','Venue booker, books and signs','c1'],['HR','Hotel Royal accounts','faktura@hotelroyal.dk, pays invoices','c1'],['KH','Kasper Holm','Sound engineer, freelance, on request','c6']];
const SORTS={last:'last contact',name:'name, A to Z',most:'most bookings',added:'recently added'};
const SORT_OPTS=[['last','Last contact'],['name','Name, A to Z'],['most','Most bookings'],['added','Recently added']];
const VSORTS={played:'last played',name:'name, A to Z',most:'most played',added:'recently added'};
const VSORT_OPTS=[['played','Last played'],['name','Name, A to Z'],['most','Most played'],['added','Recently added']];

/* filter menus run through the core chipmenu overlay */
Object.assign(L.CHIPS,{
 ckind:{label:'Kind',opts:KINDS.slice(0,6),n:o=>PEOPLE.filter(c=>c.kind===o).length},
 ccity:{label:'City',opts:CITIES,n:o=>PEOPLE.filter(c=>c.where===o).length},
 vplayed:{label:'Played',opts:['Played','Never played'],n:o=>VENUES.filter(v=>(v.played>0)===(o==='Played')).length},
 vcity:{label:'City',opts:CITIES,n:o=>VENUES.filter(v=>v.city===o).length},
 vpa:{label:'PA',opts:['PA in house','No PA'],n:o=>VENUES.filter(v=>VROWS[v.id].pa===(o==='PA in house')).length},
});
const fchip=(k,anyWord='all')=>`<button class="chip cv-chip ${S.filters[k].length?'on':''}" data-act="chipmenu" data-key="${k}">${L.CHIPS[k].label}: ${esc(S.filters[k].join(', ')||anyWord)}</button>`;

/* ---------- small parts ---------- */
const chev=ic('right','s');
const lock=t=>`<span class="cv-lock">${ic('lock','s')}${t}</span>`;
const secHead=(title,btn)=>`<div class="cv-sh"><h2 class="t-title">${title}</h2>${btn||''}</div>`;
const actBtn=(icon,label,act,extra='')=>`<button class="btn ghost s cv-act" data-act="${act}" ${extra}>${icon?ic(icon,'s'):''}${label}</button>`;
const editBtn=key=>S.cv.edit===key?actBtn('','Done','cvedit',`data-k="${key}"`):actBtn('pencil','Edit','cvedit',`data-k="${key}"`);
const saveState=()=>S.cv.save?`<span class="cv-save ${S.cv.save==='Saved'?'done':''}" id="cvsave">${S.cv.save==='Saved'?ic('check','s'):ic('loader','s')}${S.cv.save}</span>`:'';
const scopeKey=key=>S.view+':'+(S.params.id||'')+':'+key;
const kvBlock=(key,rows)=>{S.cv.vals??={};const sv=S.cv.vals[scopeKey(key)]||{};rows=rows.map(([l,v,w],i)=>[l,sv[i]??v,w]);
 return S.cv.edit===key
 ?`<div class="cv-form">${rows.map(([l,v,w],i)=>`<div class="field cv-w-${w||'l'}"><label for="cv${key}${i}">${l}</label><input class="input" id="cv${key}${i}" value="${esc(v)}" data-cvsave data-k="${key}" data-i="${i}"></div>`).join('')}</div>`
 :`<dl class="cv-kv">${rows.map(([l,v])=>`<dt>${l}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;};
const bookRow=([t,s,tc,tl,id],ini)=>`<button class="cv-row" data-act="cvgo" data-v="booking" data-id="${id}">${ini?`<span class="cv-sq">${ini}</span>`:''}<span class="tx"><b>${esc(t)}</b><small>${esc(s)}</small></span><span class="tag ${tc}">${tl}</span>${chev}</button>`;
const stars=(n,cls='')=>[1,2,3,4,5].map(i=>`<svg class="i s cv-star ${cls} ${i<=n?'on':''}" viewBox="0 0 24 24" aria-hidden="true">${L.P.star}</svg>`).join('');

/* ---------- people table ---------- */
function peopleList(q){
 const ql=q.toLowerCase().trim();
 let all=S.cv.all?[...PEOPLE,...MORE]:PEOPLE;
 let rows=all.filter(c=>(c.name+' '+c.where+' '+c.kind).toLowerCase().includes(ql)&&(!S.filters.ckind.length||S.filters.ckind.includes(c.kind))&&(!S.filters.ccity.length||S.filters.ccity.includes(c.where)));
 const s=S.cv.sort;
 rows=[...rows].sort(s==='name'?(a,b)=>a.name.localeCompare(b.name):s==='most'?(a,b)=>b.n-a.n:s==='added'?(a,b)=>a.added-b.added:(a,b)=>a.d-b.d);
 return rows;
}
function peopleBody(q){
 const rows=peopleList(q);const total=S.imported?222:24;
 if(!rows.length)return noMatch(q,false);
 const table=`<div class="table-wrap cv-table"><table><thead><tr><th>Name</th><th>Kind</th><th>Where</th><th>Last contact</th><th>Status</th><th class="num">Bookings</th></tr></thead><tbody>${rows.map(c=>`<tr data-go="contact" data-id="${c.id}" tabindex="0"><td class="strong">${hl(c.name,q)}</td><td class="muted">${hl(c.kind,q)}</td><td class="muted">${hl(c.where,q)}</td><td>${c.last}</td><td>${c.status?`<span class="tag ${c.status[0]}">${c.status[1]}</span>`:''}</td><td class="num mono">${c.n}</td></tr>`).join('')}</tbody></table></div>`;
 const foot=q.trim()
  ?`<div class="cv-foot"><span>${rows.length} of ${total} match “${esc(q.trim())}” in name, venue or city</span><button class="btn ghost s cv-link" data-act="clearcsearch">Clear search</button></div>`
  :`<div class="cv-foot"><span>Showing ${rows.length} of ${total}, sorted by ${SORTS[S.cv.sort]}</span><button class="btn ghost s cv-link" data-act="cvall">${S.cv.all?'Show fewer':`Show all ${total}`}</button></div>`;
 return table+foot;
}
function noMatch(q,isV){
 const t=q.trim();const T=t?t[0].toUpperCase()+t.slice(1):'';
 if(!t)return `<div class="cv-none"><h3 class="t-title">Nothing matches these filters</h3><p>Try another kind or city, or clear the filters.</p><div class="row"><button class="btn ghost" data-act="cvclear">Clear filters</button></div></div>`;
 return `<div class="cv-none"><h3 class="t-title">No match for “${esc(t)}”</h3><p>Nothing in name, ${isV?'city or contact':'venue or city'}. Check the spelling, clear the filters, or add ${esc(T)} now.</p><div class="row"><button class="btn secondary" data-act="${isV?'newvenue':'newcontact'}">${ic('plus','s')}Add “${esc(T)}” as a ${isV?'venue':'contact'}</button><button class="btn ghost" data-act="cvclear">Clear search</button></div></div>`;
}

/* ---------- venue list (Venues page and the Venues chip on Contacts) ---------- */
function venueList(q){
 const ql=q.toLowerCase().trim();const f=S.filters;
 let rows=VENUES.filter(v=>(v.name+' '+v.city+' '+VROWS[v.id].people).toLowerCase().includes(ql)
  &&(!f.vplayed.length||f.vplayed.includes(v.played>0?'Played':'Never played'))
  &&(!f.vcity.length||f.vcity.includes(v.city))
  &&(!f.vpa.length||f.vpa.includes(VROWS[v.id].pa?'PA in house':'No PA')));
 const s=S.cv.vsort;
 rows=[...rows].sort(s==='name'?(a,b)=>a.name.localeCompare(b.name):s==='most'?(a,b)=>b.played-a.played:s==='added'?(a,b)=>VENUES.indexOf(b)-VENUES.indexOf(a):(a,b)=>VROWS[a.id].last-VROWS[b.id].last);
 return rows;
}
function venueBody(q){
 const rows=venueList(q);
 if(!rows.length)return noMatch(q,true);
 const list=`<div class="cv-vlist">${rows.map(v=>`<button class="cv-vrow" data-act="cvgo" data-v="venue" data-id="${v.id}"><img class="thumb s" src="${IMG(v.img)}" alt=""><span class="tx"><b>${hl(v.name,q)}</b><small>${hl(VROWS[v.id].sub,q)}</small></span><span class="tag ${VROWS[v.id].tag[0]}">${VROWS[v.id].tag[1]}</span>${chev}</button>`).join('')}</div>`;
 const foot=q.trim()
  ?`<div class="cv-foot"><span>${rows.length} of ${VENUES.length} match “${esc(q.trim())}” in name, city or contact</span><button class="btn ghost s cv-link" data-act="cvclear">Clear search</button></div>`
  :`<div class="cv-foot"><span>Showing ${rows.length} of ${VENUES.length}, a venue is created from a booking or an email; duplicates are caught by name and street</span><button class="btn ghost s cv-link" data-act="cvmap">${ic('pin','s')}Map view</button></div>`;
 return list+foot;
}
const vChips=()=>`${fchip('vplayed')}${fchip('vcity')}${fchip('vpa','any')}<button class="chip cv-chip ${S.overlay&&S.overlay.type==='cvsort'?'open':''}" data-act="cvsort" data-k="vsort">Sort: ${VSORTS[S.cv.vsort]}</button>`;

/* ---------- Contacts ---------- */
L.VIEWS.contacts=()=>{
 if(S.cv.empty)return emptyPage();
 const isV=S.cv.tab==='venues';const q=isV?S.cv.vq:S.contactSearch;
 const sub=S.imported?'222 people, 6 venues, 198 imported today':'24 people, 6 venues, 3 without a booking yet';
 return `<div class="page cv cv-list"><div class="ph cv-ph"><div class="grow"><h1 class="t-display">Contacts</h1><p>${sub}</p></div><div class="cv-btns"><button class="btn secondary" data-act="import">Import</button><button class="btn accent" data-act="${isV?'newvenue':'newcontact'}">${ic('plus','s')}${isV?'New venue':'New contact'}</button></div></div>
 <div class="cv-bar"><div class="cv-chips"><button class="chip cv-chip ${isV?'':'cur'}" data-act="cvtab" data-tab-k="people" aria-pressed="${!isV}">People ${S.imported?222:24}</button><button class="chip cv-chip ${isV?'cur':''}" data-act="cvtab" data-tab-k="venues" aria-pressed="${isV}">Venues ${VENUES.length}</button><i class="cv-div"></i>${isV?vChips():`${fchip('ckind')}${fchip('ccity')}<button class="chip cv-chip ${S.overlay&&S.overlay.type==='cvsort'?'open':''}" data-act="cvsort" data-k="sort">Sort: ${SORTS[S.cv.sort]}</button>`}</div>
 <label class="search cv-search">${ic('search','s')}<input class="input" id="${isV?'cvvsearch':'csearch'}" placeholder="${isV?'Name or city':'Name, venue, city'}" value="${esc(q)}" aria-label="Search ${isV?'venues':'contacts'}"></label></div>
 <div class="cv-body">${isV?venueBody(q):peopleBody(q)}</div></div>${L.abar('','Ask about Low Tide — gigs, contacts, gear, money')}`;
};
function emptyPage(){
 const cards=[['booker','Add one','Name, kind and email are enough','newcontact'],['notebook','Import','CSV or vCard from your phone, Google or Outlook','import'],['contacts-from-email','From email','The assistant finds bookers in threads you pick','cvfrommail']];
 return `<div class="page cv cv-list"><div class="ph cv-ph"><div class="grow"><h1 class="t-display">Contacts</h1><p>Nobody yet, the first booking will add its contact here</p></div><div class="cv-btns"><button class="btn secondary" data-act="import">Import</button><button class="btn accent" data-act="newcontact">${ic('plus','s')}New contact</button></div></div>
 <div class="cv-empty"><h3 class="t-title">No contacts yet</h3><p>Bring the people you already work with, or let the first booking add its contact by itself. Nothing is sent to anyone.</p>
 <div class="cv-cards">${cards.map(([img,t,s,a])=>`<button class="cv-card" data-act="${a}"><img src="${IMG(img)}" alt=""><b>${t}</b><small>${s}</small></button>`).join('')}</div></div>
 <div class="cv-foot"><span>Or start with three sample contacts (tinted, easy to delete) to see how the list reads.</span><button class="btn ghost s cv-link" data-act="cvsamples">Add samples</button></div></div>${L.abar('','Ask: "add Mette Kjær from Hotel Royal, booking@hotelroyal.dk"')}`;
}

/* ---------- Venues ---------- */
L.VIEWS.venues=()=>{const q=S.cv.vq;const played=VENUES.filter(v=>v.played>0).length;
 return `<div class="page cv cv-list"><div class="ph cv-ph cv-vph"><div class="grow"><h1 class="t-display">Venues</h1><p>${VENUES.length} venues, ${played>3?3:played} played, typical fees and stage notes are band only, reached from Contacts and from every booking</p></div><div class="cv-btns"><button class="btn accent" data-act="newvenue">${ic('plus','s')}New venue</button><button class="btn secondary icon" data-act="cvmore" data-m="venues" aria-label="More">${ic('more','s')}</button></div></div>
 <div class="cv-bar cv-vbar"><div class="cv-chips">${vChips()}</div><label class="search cv-search cv-vsearch">${ic('search','s')}<input class="input" id="cvvsearch" placeholder="Name or city" value="${esc(q)}" aria-label="Search venues"></label></div>
 <div class="cv-body">${venueBody(q)}</div></div>${L.abar('','Ask about venues — which ones in Aarhus have a PA, who owes us, add Loppen’s stage notes')}`;};

/* ---------- Contact detail ---------- */
const editScope=()=>{if(S.cv.edit&&S.cv.editFor!==S.view+':'+(S.params.id||'')){S.cv.edit=null;S.cv.save='';}};
L.VIEWS.contact=()=>{editScope();
 const id=S.params.id||'c1';const base=PEOPLE.find(c=>c.id===id)||L.CONTACTS.find(c=>c.id===id)||PEOPLE[0];
 const v=V((L.CONTACTS.find(c=>c.id===id)||{}).venue||'royal')||V('royal');
 const d=CONTACT_DETAIL[id]||(()=>{const nm=base.name.split(',')[0];const ini=nm.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  return {first:nm.split(' ')[0],name:nm,ini,kind:base.kind,org:v.name,where:base.where,n:base.n,last:base.last,img:v.img,
   details:[['Kind',base.kind,'m'],['Organisation',v.name+', '+v.city,'l'],['Email',(L.CONTACTS.find(c=>c.id===id)||{}).email||'Not added yet','l'],['Phone','Not added yet','s'],['Language','Danish','s'],['Tags',base.where.toLowerCase(),'m']],
   notes:'No notes yet. What you write here stays with the band.',ask:`Ask about ${nm.split(' ')[0]} — what did we charge last time, when did we last talk`};})();
 S.cv.notes??={};const notes=S.cv.notes[id]??d.notes;
 const rows=id==='c1'?BOOK_ROWS:L.BOOKINGS.filter(b=>b.venue===v.id).slice(0,3).map(b=>[b.title,b.when+(b.fee?`, ${L.kr(b.fee)} DKK`:''),STATUS[b.status][0],STATUS[b.status][1],b.id]);
 return `<div class="page cv cv-detail"><div class="cv-tint" style="--tint:var(--doors)"></div>
 <button class="btn ghost s cv-back" data-act="cvgo" data-v="contacts">${ic('left','s')}Contacts</button>
 <div class="hero cv-hero"><img src="${IMG(d.img)}" alt=""><div class="tx"><span class="k">${esc(d.kind)} at ${esc(d.org)}</span><h1>${esc(d.name)}</h1><div class="facts"><span>${esc(d.where)}</span><span>${d.n} bookings together</span><span>Last contact ${esc(d.last)}</span></div></div></div>
 <div class="cv-actions"><span class="cv-av">${d.ini}</span><span class="tag accent">${esc(d.kind)}</span><span class="cv-sp"></span>${saveState()}<button class="btn secondary" data-act="cvedit" data-k="details">Edit</button><button class="btn accent" data-act="emailcontact">${ic('mail','s')}Email</button><button class="btn ghost icon" data-act="cvmore" data-m="contact" aria-label="More">${ic('more','s')}</button></div>
 <div class="cv-grid"><div class="cv-main">
  <section class="cv-sec">${secHead('Bookings together',actBtn('plus','New booking','newbooking'))}<div class="cv-rows">${rows.map(r=>bookRow(r,'HR')).join('')||'<p class="muted cv-in">None yet</p>'}</div></section>
  <section class="cv-sec">${secHead('Details',editBtn('details'))}${kvBlock('details',d.details)}</section>
 </div>
 <aside class="cv-panel"><section class="cv-sec">${secHead('Notes',editBtn('notes'))}${S.cv.edit==='notes'?`<textarea class="input cv-notes-in" id="cvnotes" data-cvsave data-nid="${id}" rows="5">${esc(notes)}</textarea>`:`<p class="cv-note">${esc(notes)}</p>`}${lock('Band only, never in offers, invoices or the calendar feed')}</section>
  <section class="cv-sec">${secHead('Activity, 4 events')}</section></aside></div></div>${L.abar(d.name,d.ask)}`;
};

/* ---------- Venue detail ---------- */
L.VIEWS.venue=()=>{editScope();
 const v=V(S.params.id||'royal')||V('royal');const royal=v.id==='royal';
 const next=L.BOOKINGS.find(b=>b.venue===v.id&&b.tab!=='past');
 const facts=[v.kind,v.cap.includes('standing')?v.cap:v.cap+' standing',`Played ${v.played} time${v.played===1?'':'s'}`,next?`Next gig ${next.when.split(' ').slice(0,3).join(' ')}`:''].filter(Boolean);
 const brows=royal?VENUE_BOOK_ROWS:L.BOOKINGS.filter(b=>b.venue===v.id).map(b=>[b.title,b.when+(b.fee?`, ${L.kr(b.fee)} DKK`:''),STATUS[b.status][0],STATUS[b.status][1],b.id]);
 const people=royal?PEOPLE_HERE:[];
 S.cv.notes??={};const nid='v-'+v.id;const notes=S.cv.notes[nid]??(royal?'Good room when the bar is full, dead on a quiet Tuesday. Keep the first set low. The desk’s channel 7 hums; bring a DI.':'No notes yet. Write what the next gig here should know.');
 return `<div class="page cv cv-detail"><div class="cv-tint" style="--tint:${v.tint}"></div>
 <button class="btn ghost s cv-back" data-act="cvgo" data-v="venues">${ic('left','s')}Venues</button>
 <div class="hero cv-hero"><img src="${IMG(v.img)}" alt=""><div class="tx"><span class="k">Venue in ${v.city}</span><h1>${esc(v.name)}</h1><div class="facts">${facts.map(f=>`<span>${esc(f)}</span>`).join('')}</div></div></div>
 <div class="cv-actions cv-vact">${saveState()}<button class="btn secondary" data-act="cvedit" data-k="stage">Edit</button><button class="btn accent" data-act="newbooking">New booking here</button><button class="btn ghost icon" data-act="cvmore" data-m="venue" aria-label="More">${ic('more','s')}</button></div>
 <div class="cv-grid"><div class="cv-main">
  <section class="cv-sec">${secHead('On stage',editBtn('stage'))}${kvBlock('stage',ON_STAGE)}</section>
  <section class="cv-sec">${secHead('Getting there',editBtn('getting'))}${kvBlock('getting',GETTING)}<p class="cv-fn">Written once, reused in every day sheet for this venue. Members see it; venues and the calendar feed do not.</p></section>
  <section class="cv-sec">${secHead('Bookings here',actBtn('plus','New booking','newbooking'))}<div class="cv-rows">${brows.map(r=>bookRow(r)).join('')||'<p class="muted cv-in">No bookings here yet</p>'}</div></section>
 </div>
 <aside class="cv-panel"><section class="cv-sec">${secHead('People here',actBtn('plus','Add person','newcontact'))}<div class="cv-rows">${people.map(([ini,n,s,id])=>`<button class="cv-row" data-act="cvgo" data-v="contact" data-id="${id}"><span class="cv-av s">${ini}</span><span class="tx"><b>${n}</b><small>${s}</small></span>${chev}</button>`).join('')||'<p class="muted cv-in">Nobody linked yet</p>'}</div></section>
  <section class="cv-sec">${secHead('Notes',editBtn('vnotes'))}${S.cv.edit==='vnotes'?`<textarea class="input cv-notes-in" id="cvnotes" data-cvsave data-nid="${nid}" rows="5">${esc(notes)}</textarea>`:`<p class="cv-note">${esc(notes)}</p>`}${lock('Band only')}
  ${S.cv.edit?`<div class="cv-rate"><span class="muted">Your rating</span><span class="cv-stars">${[1,2,3,4,5].map(i=>`<button data-act="cvrate" data-n="${i}" aria-label="${i} stars"><svg class="i s cv-star ink ${i<=S.cv.rating?'on':''}" viewBox="0 0 24 24">${L.P.star}</svg></button>`).join('')}</span><span class="muted">${S.cv.rating>=4?'would play again':S.cv.rating>=3?'maybe again':'would not play again'}</span></div>`
   :`<div class="cv-rate"><span class="muted">${v.rating||'No rating'}</span>${v.rating?`<span class="cv-stars">${stars(Math.round(v.rating))}</span>`:''}<span class="muted">${v.played} gig${v.played===1?'':'s'}</span></div>`}</section></aside></div></div>${L.abar(v.name,`Ask about ${v.name} — what did we net last time, make a day sheet, who do we invoice`)}`;
};

/* ---------- drawers ---------- */
const CVR=[['HR','Hotel Royal A/S','CVR 12 34 56 78, Store Torv 4, 8000 Aarhus, active'],['HC','Hotel Royal Copenhagen ApS','CVR 87 65 43 21, Vesterbrogade 1, 1620 København, active'],['RH','Royal Hotel Holding A/S','CVR 11 22 33 44, holding, no employees']];
L.DR.newcontact=()=>{const nm=S.contactSearch?S.contactSearch.trim().replace(/^./,c=>c.toUpperCase()):'Mette Kjær';const dup=S.cv.banner&&/mette/i.test(nm);
 const org=S.cv.org;const res=CVR.filter(r=>!org.trim()||r[1].toLowerCase().includes(org.trim().toLowerCase().slice(0,5)));
 return {type:'cvdrawer',w:480,title:'New contact',sub:'From the booking form, the name you typed is carried over',
 body:`<div class="banner attention cv-banner" id="cvdup" ${dup?'':'hidden'}>${ic('alert','s')}<div class="tx"><b>Looks like this person exists: Mette Kjær, Hotel Royal, added 6 Oct</b><span class="t-label">Same email. Use the existing contact, or keep going to make a second one.</span></div><button class="btn secondary s" data-act="cvuseexisting">Use existing</button><button class="cv-x" data-act="cvnobanner" aria-label="Dismiss">${ic('x','s')}</button></div>
 <div class="field"><label>This contact is a</label><div class="seg"><button class="on">Person</button><button>Organisation</button></div></div>
 <div class="field cv-w-m"><label for="cvname">Name</label><input class="input" id="cvname" value="${esc(nm)}"></div>
 <div class="field cv-w-m"><label for="cvkind">Kind</label><select class="input" id="cvkind">${['Venue booker','Promoter','Agent','Festival','Private client','Press','Sound engineer'].map(k=>`<option>${k}</option>`).join('')}</select><span class="help">Books acts for a venue they work at. Other kinds: Promoter, Agent, Festival, Private client, Press, Sound engineer…</span></div>
 <div class="field"><label for="cvorg">Organisation</label><label class="search cv-orgf">${ic('search','s')}<input class="input" id="cvorg" value="${esc(org)}" autocomplete="off"></label>
 ${S.cv.orgOpen&&org.trim()?`<div class="cv-cvr"><span class="t-label muted">From the CVR register, fills address and VAT number</span>${res.map(([i,n,s],k)=>`<button class="cv-cvrrow ${k===0?'on':''}" data-act="cvorgpick" data-n="${esc(n)}"><span class="cv-sq">${i}</span><span class="tx"><b>${n}</b><small>${s}</small></span></button>`).join('')}<span class="t-label muted">Not a company? Keep typing and press Enter to use the text as is.</span></div>`:''}</div>`,
 foot:`<span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="createcontact">${ic('check','s')}Create contact</button>`};};
L.DR.newvenue=()=>({type:'cvdrawer',w:480,title:'New venue',sub:'From the booking form, “Hotel Royal” carried over',
 body:`${S.cv.vbanner?`<div class="banner cv-match">${ic('pin','s')}<div class="tx"><b>Matches a venue you have: Hotel Royal, Aarhus, played 3 times</b><span class="t-label">Same name and street. Use it and the stage notes, people and history come with it.</span></div><button class="btn accent s" data-act="cvusevenue">${ic('check','s')}Use Hotel Royal</button></div>`:''}
 <div class="field cv-w-m"><label for="cvvn">Name</label><input class="input" id="cvvn" value="Hotel Royal"></div>
 <div class="field"><label for="cvva">Address</label><label class="search cv-orgf">${ic('search','s')}<input class="input" id="cvva" value="Store Torv 4, 8000 Aarhus"></label><span class="help">Found by the address lookup, fixes the map pin and travel distance (118 km from Odense)</span></div>
 <div class="field"><div class="cv-lrow"><label>Photo</label><span class="help">Found on Google Maps for Store Torv 4</span></div><div class="cv-photos">${['hotel-royal','posten','odense-live'].map((p,i)=>`<button class="cv-ph-t ${i===0?'on':''}" data-act="cvphoto" aria-label="Use this photo"><img src="${IMG(p)}" alt="">${ic('check','s')}</button>`).join('')}<label class="cv-ph-t cv-own">${ic('upload','s')}<span>Your own</span><input type="file" accept="image/*" hidden data-cvown></label></div>
 <div class="cv-swrow"><i class="cv-sw" style="background:${V('royal').tint}"></i><span class="help">Card colour taken from the photo. Photos © their Google Maps contributors, credited on the venue page.</span></div></div>
 <div class="cv-two"><div class="field"><label for="cvvk">Kind</label><select class="input" id="cvvk">${['Hotel bar','Club','Bar','Festival','Private home','Church','Rehearsal space','Venue'].map(k=>`<option>${k}</option>`).join('')}</select><span class="help">Club, bar, festival, private home, church, rehearsal space…</span></div><div class="field"><label for="cvvc">Capacity</label><input class="input" id="cvvc" value="120" inputmode="numeric"><span class="help">standing</span></div></div>
 <div class="field"><label>In house</label>${[['PA system',1],['Drums and bass amp',1],['Sound engineer',0]].map(([t,on])=>`<button class="cv-tgrow" data-act="cvtoggle" role="switch" aria-checked="${!!on}"><i class="cv-tg ${on?'on':''}"></i>${t}</button>`).join('')}</div>
 <div class="field cv-w-s"><label for="cvvf">Typical fee</label><input class="input mono" id="cvvf" value="4.500 DKK"></div>`,
 foot:`<span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="cvcreatevenue">${ic('check','s')}Create venue</button>`});
const IMPORT_MAP=[['Navn','Name','e.g. Mette Krogh'],['Firma','Organisation','e.g. Hotel Skov'],['E-mail','Email','e.g. mette@hotelskov.dk'],['Telefon','Phone','e.g. 21 43 65 87'],['By','City','e.g. Aarhus'],['Rolle','Kind','e.g. Booker. 3 unknown values become Other'],['Fødselsdag','Don’t import','LAAS has no birthday field']];
const FIELDS=['Name','Organisation','Email','Phone','City','Kind','Notes','Don’t import'];
const DUPS=[['Mette Krogh','Same email as Mette Krogh, Hotel Skov. Merging adds her mobile number.'],['Jonas Beck','Same phone as Jonas Beck, Hotel Skov. Merging adds the role.']];
const DUPS_MORE=['Sara Lind','Kasper Holm','Anna Holt','Peter Dahl','Line Bach','Morten Friis','Camilla Juhl'].map(n=>[n,'Same email as the contact you have. Merging adds the phone number.']);
L.DR.import=()=>{const st=S.import.step;return {type:'cvdrawer',w:560,title:'Import contacts',sub:`Step ${st} of 3, ${['','where your contacts are now','match the columns','check before saving'][st]}`,
 body:st===1?`<div class="drop cv-drop">${ic('upload')}<b class="strong">Drop a CSV, Excel or vCard file here</b><span class="t-label muted">Exports from Google, Outlook, iPhone or a spreadsheet all work.</span><label class="btn secondary s" style="align-self:flex-start;cursor:pointer">Choose file<input type="file" accept=".csv,.xlsx,.xls,.vcf" hidden data-importfile></label></div><div class="cv-src"><span class="t-label muted">Or connect an account</span>${['Google Contacts','Outlook or Microsoft 365','From my mail'].map(t=>`<button class="cv-row" data-act="importnext" data-file="${t}">${ic('plug')}<span class="tx"><b>${t}</b><small>Reads once, writes nothing back</small></span>${chev}</button>`).join('')}</div>`
 :st===2?`<div class="cv-file">${ic('file')}<span class="tx"><b>${esc(S.import.file||'contacts-2026.csv')}</b><small>212 rows, 8 columns, Danish headers</small></span></div><p class="cv-p">Each column goes to one LAAS field. We guessed from the headers and the first rows; change any guess that is wrong.</p><span class="t-meta muted">Column in your file → LAAS field</span>${IMPORT_MAP.map(([a,b,c],i)=>`<div class="field"><label for="cvim${i}">${a}</label><select class="input" id="cvim${i}">${[b,...FIELDS.filter(f=>f!==b)].map(o=>`<option>${o}</option>`).join('')}</select><span class="help">${c}</span></div>`).join('')}`
 :`<div class="cv-sum"><span class="t-label muted">Summary</span>${[['New contacts','198'],['Already in LAAS, will be merged','9'],['Skipped, no name and no email','5']].map(([l,n])=>`<div class="cv-sumrow"><span>${l}</span><b class="mono">${n}</b></div>`).join('')}</div>
 <div class="cv-dups"><span class="t-label muted">9 look like people you already have</span>${[...DUPS,...(S.cv.dupAll?DUPS_MORE:[])].map(([n,s])=>`<div class="cv-dup">${ic('user')}<span class="tx"><b>${n}</b><small>${s}</small></span></div>`).join('')}<button class="btn ghost s cv-link" data-act="cvdups">${S.cv.dupAll?'Show fewer':'Show all 9 to merge or keep apart'}</button></div>
 <label class="cv-check"><input type="checkbox" checked>Merge the 9 duplicates (recommended)</label>
 <div class="banner info">${ic('ai','s')}<div class="tx"><b>Nothing is sent to anyone</b><span class="t-label muted">Imported contacts get an Imported tag. You can undo the whole import for 7 days.</span></div></div>`,
 foot:`${st>1?'<button class="btn ghost" data-act="importback">Back</button>':''}<span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="${st<3?'importnext':'importdone'}">${st<3?'Continue':'Import 198 contacts'}</button>`};};
L.OVERLAYS.cvdrawer=o=>{const still=!!document.querySelector('.cv-drawer');return `<div class="scrim" data-act="close" ${still?'style="animation:none"':''}></div><aside class="drawer cv-drawer" style="width:min(${o.w||480}px,100%);${still?'animation:none':''}" role="dialog" aria-modal="true" aria-label="${esc(o.title)}"><div class="dh"><div class="grow"><h2 class="t-title">${o.title}</h2><span class="t-meta muted">${o.sub||''}</span></div><button class="btn ghost s" data-act="close">${ic('x','s')}Close</button></div><div class="db">${o.body}</div><div class="df">${o.foot}</div></aside>`;};
L.OVERLAYS.cvsort=o=>{const opts=o.k==='vsort'?VSORT_OPTS:SORT_OPTS;const cur=S.cv[o.k];
 return `<div class="scrim" style="background:transparent" data-act="close"></div><div class="pop cv-sortpop" style="left:${o.x}px;top:${o.y}px" role="dialog" aria-label="Sort"><div class="t-meta faint cv-poph">Sort by</div>${opts.map(([k,l])=>`<button class="cv-opt ${cur===k?'on':''}" data-act="cvsortpick" data-k="${o.k}" data-v="${k}" role="menuitemradio" aria-checked="${cur===k}"><i></i>${l}</button>`).join('')}</div>`;};

/* ---------- actions ---------- */
const saveFlash=()=>{S.cv.save='Saving…';const el=document.getElementById('cvsave');
 const put=()=>{const e=document.getElementById('cvsave');const html=saveState();if(e)e.outerHTML=html;else{const a=document.querySelector('.cv-actions .btn.secondary');if(a&&html)a.insertAdjacentHTML('beforebegin',html);}};
 put();clearTimeout(saveFlash.t1);clearTimeout(saveFlash.t2);
 saveFlash.t1=setTimeout(()=>{S.cv.save='Saved';put();saveFlash.t2=setTimeout(()=>{S.cv.save='';const e=document.getElementById('cvsave');if(e)e.remove();},3000);},700);};
Object.assign(L.ACTIONS,{
 cvgo:t=>{S.cv.edit=null;S.cv.save='';L.go(t.dataset.v,t.dataset.id?{id:t.dataset.id}:{});},
 cvtab:t=>{const k=t.dataset.tabK;if(S.cv.tab===k)return;S.cv.tab=k;S.enter='tabenter';S.enterUntil=Date.now()+500;L.render();},
 cvsort:(t,r)=>{L.open('cvsort',{k:t.dataset.k,x:Math.max(8,Math.min(r.left,innerWidth-268)),y:r.bottom+6});},
 cvsortpick:t=>{S.cv[t.dataset.k]=t.dataset.v;L.close();},
 cvall:()=>{S.cv.all=!S.cv.all;L.render();},
 cvclear:()=>{if(S.view==='venues'||(S.view==='contacts'&&S.cv.tab==='venues')){S.cv.vq='';S.filters.vplayed=[];S.filters.vcity=[];S.filters.vpa=[];}else{S.contactSearch='';S.filters.ckind=[];S.filters.ccity=[];}L.render();},
 clearcsearch:()=>{S.contactSearch='';S.filters.ckind=[];S.filters.ccity=[];L.render();},
 cvmap:()=>L.toast('Map view: 3 in Copenhagen, 2 in Odense, 1 in Aarhus'),
 cvfrommail:()=>{L.go('mail');L.toast('Pick the threads, the assistant finds the bookers');},
 cvsamples:()=>{S.cv.empty=false;L.render();L.toast('3 sample contacts added',()=>{S.cv.empty=true;});},
 cvedit:t=>{const k=t.dataset.k;S.cv.edit=S.cv.edit===k?null:k;S.cv.editFor=S.view+':'+(S.params.id||'');if(!S.cv.edit&&S.cv.save){S.cv.save='';}L.render();if(S.cv.edit){const f=document.querySelector('.cv-form input,.cv-notes-in');if(f)f.focus();}},
 cvrate:t=>{S.cv.rating=+t.dataset.n;L.render();saveFlash();},
 cvmore:(t,r)=>{const m=t.dataset.m;const items=m==='venues'?[['Export venues as CSV','cvexport'],['Merge duplicates','cvmerge']]:m==='venue'?[['Copy address','cvcopy'],['Merge with another venue','cvmerge'],['Delete venue','cvdelete',true]]:[['Copy email','cvcopy'],['Merge with another contact','cvmerge'],['Delete contact','cvdelete',true]];
  L.open('menu',{items,x:Math.max(8,Math.min(r.right-260,innerWidth-268)),y:r.bottom+6});},
 cvcopy:()=>{L.close();L.toast(S.view==='venue'?'Address copied':'Email copied');},
 cvexport:()=>{L.close();L.toast('venues.csv is ready in Downloads');},
 cvmerge:()=>{L.close();L.toast('No duplicates found');},
 cvdelete:()=>{const isV=S.view==='venue';S.overlay={type:'modal',html:L.confirmM(isV?'Delete this venue?':'Delete this contact?',isV?'Bookings here keep their venue name. You can undo for 10 seconds.':'Bookings keep the name. You can undo for 10 seconds.','Keep it','cvdeleteok',isV?'Delete venue':'Delete contact',true)};L.render();},
 cvdeleteok:()=>{const isV=S.view==='venue';const p={...S.params};L.go(isV?'venues':'contacts');L.toast(isV?'Venue deleted':'Contact deleted',()=>{L.go(isV?'venue':'contact',p);});},
 cvuseexisting:()=>{S.overlay=null;L.go('contact',{id:'c1'});L.toast('Opened Mette Kjær');},
 cvnobanner:()=>{S.cv.banner=false;const b=document.getElementById('cvdup');if(b)b.hidden=true;},
 cvorgpick:t=>{S.cv.org=t.dataset.n;S.cv.orgOpen=false;S.overlay=L.DR.newcontact();L.render();},
 createcontact:()=>{S.overlay=null;S.cv.empty=false;S.contactSearch='';S.cv.banner=true;S.cv.org='Hotel Roy';S.cv.orgOpen=true;L.go('contact',{id:'c1'});L.toast('Contact created',()=>{L.go('contacts');});},
 cvusevenue:()=>{S.overlay=null;L.go('venue',{id:'royal'});L.toast('Using Hotel Royal');},
 cvphoto:t=>{t.parentElement.querySelectorAll('.cv-ph-t').forEach(b=>b.classList.toggle('on',b===t));},
 cvtoggle:t=>{const on=t.getAttribute('aria-checked')!=='true';t.setAttribute('aria-checked',on);t.querySelector('.cv-tg').classList.toggle('on',on);},
 cvcreatevenue:()=>{S.overlay=null;S.cv.vq='';L.go('venue',{id:'royal'});L.toast('Hotel Royal added',()=>{L.go('venues');});},
 cvdups:()=>{S.cv.dupAll=!S.cv.dupAll;S.overlay=L.DR.import();L.render();},
 import:()=>{S.import.step=1;S.cv.dupAll=false;S.overlay=L.DR.import();L.render();},
 importdone:()=>{S.overlay=null;S.imported=true;S.cv.empty=false;S.cv.tab='people';L.render();L.toast('198 contacts imported, 9 merged',()=>{S.imported=false;});},
});
/* ---------- inputs ---------- */
L.INPUT.push(t=>{
 if(t.id==='cvvsearch'){S.cv.vq=t.value;L.render();return true;}
 if(t.id==='cvorg'){S.cv.org=t.value;S.cv.orgOpen=true;S.overlay=L.DR.newcontact();L.render();return true;}
 if(t.id==='cvname'){const b=document.getElementById('cvdup');if(b)b.hidden=!(S.cv.banner&&/mette/i.test(t.value));return true;}
 if(t.dataset.cvsave!==undefined){if(t.dataset.nid){S.cv.notes??={};S.cv.notes[t.dataset.nid]=t.value;}if(t.dataset.k){S.cv.vals??={};(S.cv.vals[scopeKey(t.dataset.k)]??={})[t.dataset.i]=t.value;}saveFlash();return true;}
 return false;});
L.CHANGE.push(t=>{
 if(t.dataset.cvown!==undefined&&t.files&&t.files[0]){const lab=t.closest('.cv-own');const url=URL.createObjectURL(t.files[0]);lab.parentElement.querySelectorAll('.cv-ph-t').forEach(b=>b.classList.remove('on'));lab.insertAdjacentHTML('beforebegin',`<button class="cv-ph-t on" data-act="cvphoto" aria-label="Use this photo"><img src="${url}" alt="">${ic('check','s')}</button>`);L.toast('Photo added');return true;}
 return false;});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='cvorg'){e.preventDefault();S.cv.orgOpen=false;S.overlay=L.DR.newcontact();L.render();}});

/* flow entry for the empty state; the import flow starts from a filled list */
{const imp=L.FLOWS.find(f=>f[0]==='Contacts import');if(imp&&!imp.cv){const fn=imp[2];imp[2]=()=>{S.cv.empty=false;S.cv.tab='people';fn();};imp.cv=1;}}
if(!L.FLOWS.some(f=>f[0]==='Contacts, empty'))L.FLOWS.splice(L.FLOWS.findIndex(f=>f[0]==='Contacts import')+1,0,['Contacts, empty','No contacts yet, add, import or from email',()=>{S.cv.empty=true;S.cv.tab='people';L.go('contacts');}]);
})();
