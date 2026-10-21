/* LAAS prototype · mail area. Views `mail` (inbox, filters, search, empty state) and `thread` (conversation, linked
   booking panel, reply via the minimal send preview). Uses window.LAAS (see index.html).
   Open a thread from anywhere with data-go="thread" data-id="skov" or data-act="openthread" data-id="skov". */
(function(){
"use strict";
const L=window.LAAS,S=L.S,ic=L.ic,IMG=L.IMG,esc=L.esc;

/* Lucide icons not in the core set (lucide.dev paths) */
L.P.archive='<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>';
L.P.mailopen='<path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/>';
L.P.upright='<path d="M7 7h10v10"/><path d="M7 17 17 7"/>';
L.P.inbox='<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>';
const GOOGLE='<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

/* ---------- data: threads the assistant linked to bookings, venues and people ---------- */
const ME={name:'Vital',email:'vital@lowtide.dk',ini:'V'};
const THREADS=[
 {id:'royal',from:'Mette Kjær',org:'Hotel Royal',email:'booking@hotelroyal.dk',ini:'MK',subject:'Deposit for 25 Oct',excerpt:'Sorry for the delay. Our accounts team pays on Thursdays, so the 1.500 DKK goes out on 23 Oct. Can you resend the invoice to faktura@hotelroyal.dk?',time:'Today 09:05',unread:true,needs:true,
  link:{label:'Saturday hotel gig',img:'hotel-royal',booking:true},
  msgs:[{me:true,time:'10 Oct, 14:22',body:'Hej Mette, here is the deposit invoice 2026-031 for Saturday 25 Oct: 1.500 DKK, due 12 Oct. You can pay with the link in the invoice. Venlig hilsen, Vital, Low Tide'},
   {time:'Today 09:05',body:'Hej Vital, sorry for the delay. Our accounts team pays on Thursdays, so the 1.500 DKK goes out on 23 Oct. Can you resend the invoice to faktura@hotelroyal.dk? Then it lands with the right people. Mvh Mette'}],
  draft:{t:'Reply to Mette',s:'Drafted by the assistant from invoice 2026-031',to:'Mette Kjær, booking@hotelroyal.dk, cc faktura@hotelroyal.dk',subj:'Re: Deposit for 25 Oct',body:'Hej Mette, no problem. I have sent invoice 2026-031 to faktura@hotelroyal.dk, and Thursday 23 Oct works for us. See you on Saturday. Venlig hilsen, Vital, Low Tide'},
  panel:{img:'hotel-royal',tag:['confirmed','Confirmed'],kicker:'Sat 25 Oct, 20:00',title:'Saturday hotel gig',facts:'Hotel Royal, Aarhus, fee 4.500 DKK',act:['Open booking','booking',{}],
   links:[['venue','Hotel Royal','Venue, Aarhus','hotel-royal',{id:'royal'}],['contact','Mette Kjær','Venue booker',null,{id:'c1'}],['money','Invoice 2026-031','Deposit, 8 days late',null,{}]]}},
 {id:'skov',code:'LT-MAIL-0409',from:'Mette Krogh',org:'Hotel Skov',email:'mette@hotelskov.dk',ini:'MK',subject:'Parking for the van',excerpt:'The yard behind the hotel is yours from 13:00. Parking there is booked by plate number, so can you send me the van’s plate?',time:'Yesterday 16:40',unread:true,needs:true,
  link:{label:'Hotel gig, tonight',img:'hotel-skov',booking:true},
  msgs:[{me:true,time:'Mon 20 Oct, 10:12',body:'Hej Mette, we arrive Friday around 13:30 with a van and one car. Where can we park while we load in? Venlig hilsen, Vital, Low Tide'},
   {time:'Yesterday 16:40',body:'Hej Vital, the yard behind the hotel is yours from 13:00. Parking there is booked by plate number, so can you send me the van’s plate? The car can use the guest car park on Kannikegade. Mvh Mette'}],
  draft:{t:'Reply to Mette',s:'Drafted by the assistant from the day sheet',to:'Mette Krogh, mette@hotelskov.dk',subj:'Re: Parking for the van',body:'Hej Mette, tak! The van is a white Ford Transit, plate CV 48 213. We arrive about 13:30 and load in at 14:00 through the back entrance. Venlig hilsen, Vital, Low Tide'},
  panel:{img:'hotel-skov',tag:['confirmed','Confirmed'],kicker:'Tonight, LT-0041',title:'Hotel gig, Hotel Skov',facts:'Fri 24 Oct, load-in 14:00, Aarhus',act:['Open day sheet','gigday',{}],
   links:[['venues','Hotel Skov','Venue, Aarhus','hotel-skov',{}],['contacts','Mette Krogh','Venue booker',null,{}]]}},
 {id:'odense',from:'Sara Lind',org:'Odense Live',email:'sara@odenselive.dk',ini:'SL',subject:'Set times for 28 Nov',excerpt:'Doors 19:00, you play 19:30 to 20:15. The backline is shared with the headliner, so bring your own snare and cymbals.',time:'Mon 11:20',unread:true,needs:false,
  link:{label:'Support slot',img:'odense-live',booking:true},
  msgs:[{time:'Mon 11:20',body:'Hi Low Tide, set times for Friday 28 Nov: doors 19:00, you play 19:30 to 20:15. The backline is shared with the headliner, so bring your own snare and cymbals. Load-in from 16:00. Best, Sara'}],
  draft:{t:'Reply to Sara',s:'Drafted by the assistant from the booking',to:'Sara Lind, sara@odenselive.dk',subj:'Re: Set times for 28 Nov',body:'Hi Sara, thanks, that works. We will bring snare and cymbals and be there at 16:00. Best, Vital, Low Tide'},
  panel:{img:'odense-live',tag:['confirmed','Confirmed'],kicker:'Fri 28 Nov, 19:30',title:'Support slot',facts:'Odense Live, Odense, fee 2.500 DKK',act:['Open booking','booking',{id:'b5'}],
   links:[['venue','Odense Live','Venue, Odense','odense-live',{id:'odense'}],['contact','Sara Lind','Promoter',null,{id:'c5'}]]}},
 {id:'mono',from:'Anders Bro',org:'Club Mono',email:'anders@clubmono.dk',ini:'AB',subject:'Offer for 15 Nov',excerpt:'We opened it and will go through it with the owner on Monday. The date is still yours until then.',time:'Mon 09:30',unread:true,needs:false,
  link:{label:'Club night',img:'club-mono',booking:true},
  msgs:[{me:true,time:'14 Oct, 16:05',body:'Hej Anders, here is our offer for the club night on 15 Nov: laas.app/o/LT-2026-034. Venlig hilsen, Vital, Low Tide'},{time:'Mon 09:30',body:'Hej Vital, we opened it and will go through it with the owner on Monday. The date is still yours until then. /Anders'}],
  draft:{t:'Reply to Anders',s:'Drafted by the assistant from the offer',to:'Anders Bro, anders@clubmono.dk',subj:'Re: Offer for 15 Nov',body:'Hej Anders, sounds good, thanks for holding the date. Let us know if anything in the offer needs a change. Venlig hilsen, Vital, Low Tide'},
  panel:{img:'club-mono',tag:['attention','Offer out'],kicker:'Sat 15 Nov, 21:00',title:'Club night',facts:'Club Mono, Copenhagen, fee 6.000 DKK',act:['Open booking','booking',{id:'b4'}],
   links:[['venue','Club Mono','Club, Copenhagen','club-mono',{id:'mono'}],['contact','Club Mono','Venue',null,{id:'c4'}]]}},
 {id:'studiob',from:'Studio B',org:'',email:'hello@studiob.dk',ini:'SB',subject:'Room 2 on Sat 1 Nov',excerpt:'Room 2 is yours from 14:00 to 18:00. The door code is the same as last time.',time:'18 Oct',unread:false,needs:false,
  link:{label:'Rehearsal',img:'studio-b',booking:true},
  msgs:[{time:'18 Oct, 12:40',body:'Hi Low Tide, room 2 is yours on Saturday 1 Nov from 14:00 to 18:00. The door code is the same as last time. Studio B'}],
  draft:{t:'Reply to Studio B',s:'Drafted by the assistant',to:'Studio B, hello@studiob.dk',subj:'Re: Room 2 on Sat 1 Nov',body:'Hi, thanks, see you on the 1st. Vital, Low Tide'},
  panel:{img:'studio-b',tag:['draft','Draft'],kicker:'Sat 1 Nov, 14:00',title:'Rehearsal',facts:'Studio B, Copenhagen, 4 hours',act:['Open booking','booking',{id:'b2'}],
   links:[['venue','Studio B','Rehearsal space','studio-b',{id:'studiob'}],['contact','Studio B','Rehearsal space',null,{id:'c3'}]]}},
 {id:'posten',from:'Programme team',org:'Posten',email:'program@posten.dk',ini:'P',subject:'Spring 2027 open call',excerpt:'We are booking local bands for the spring. Send us a link to your music and two dates that suit you.',time:'16 Oct',unread:false,needs:false,
  link:{label:'Posten',img:'posten',booking:false},
  msgs:[{time:'16 Oct, 08:15',body:'Hi, we are booking local bands for spring 2027. Send us a link to your music and two dates that suit you. Programme team, Posten'}],
  draft:{t:'Reply to Posten',s:'Drafted by the assistant from your free dates',to:'Programme team, program@posten.dk',subj:'Re: Spring 2027 open call',body:'Hi, here is our music: laas.app/lowtide. Saturday 13 March and Saturday 10 April 2027 suit us. Best, Vital, Low Tide'},
  panel:{img:'posten',tag:['draft','No booking yet'],kicker:'Venue, Odense',title:'Posten',facts:'600 capacity, never played',act:['Open venue','venue',{id:'posten'}],
   links:[['contact','Programme team','Posten',null,{}]]}},
];

S.mail??={connected:true,filter:'all',q:'',showArchived:false,threads:THREADS.map(t=>({...t})),archived:[],full:false,edit:false,toEdit:false,sent:{},msgVal:{},toVal:{}};
const M=S.mail;
const T=id=>M.threads.find(t=>t.id===id)||M.threads[0];
const unreadN=()=>M.threads.filter(t=>t.unread&&!M.archived.includes(t.id)).length;

const filtered=()=>{let l=M.threads.filter(t=>M.showArchived?M.archived.includes(t.id):!M.archived.includes(t.id));
 if(M.filter==='needs')l=l.filter(t=>t.needs);if(M.filter==='booking')l=l.filter(t=>t.link.booking);
 const q=M.q.trim().toLowerCase();if(q)l=l.filter(t=>(t.from+' '+t.org+' '+t.subject+' '+t.excerpt+' '+t.link.label).toLowerCase().includes(q));return l;};
const counts=()=>{const l=M.threads.filter(t=>!M.archived.includes(t.id));return {all:l.length,needs:l.filter(t=>t.needs).length,booking:l.filter(t=>t.link.booking).length};};

/* ---------- pieces ---------- */
const avatar=(t)=>`<span class="ml-av" aria-hidden="true">${esc(t.ini)}</span>`;
const linkChip=(t,tag='span')=>`<${tag} class="ml-link" ${tag==='button'?`data-act="maillink" data-id="${t.id}"`:''}><img src="${IMG(t.link.img)}" alt="">${esc(t.link.label)}</${tag}>`;
const row=(t,q)=>`<div class="ml-row ${t.unread?'unread':''}" role="button" tabindex="0" data-act="openthread" data-id="${t.id}">
 <span class="ml-dot" aria-label="${t.unread?'Unread':''}"></span>${avatar(t)}
 <span class="ml-from">${L.hl(t.from,q)}${t.org?`<small>${L.hl(t.org,q)}</small>`:''}</span>
 <span class="ml-text"><b>${L.hl(t.subject,q)}</b><span>${L.hl(t.excerpt,q)}</span></span>
 <span class="ml-linkcol">${linkChip(t,'button')}</span>
 <span class="ml-status">${t.needs?'<span class="tag attention">Needs reply</span>':''}</span>
 <span class="ml-time">${t.time}</span>
 <span class="ml-acts"><button class="btn ghost icon s" data-act="mailread" data-id="${t.id}" aria-label="${t.unread?'Mark read':'Mark unread'}" title="${t.unread?'Mark read':'Mark unread'}">${ic(t.unread?'check':'mail','s')}</button><button class="btn ghost icon s" data-act="mailarchive" data-id="${t.id}" aria-label="${M.showArchived?'Move to inbox':'Archive'}" title="${M.showArchived?'Move to inbox':'Archive'}">${ic(M.showArchived?'inbox':'archive','s')}</button></span>
</div>`;

/* ---------- views ---------- */
const header=(meta,actions)=>`<div class="ph"><div class="grow"><h1 class="t-display">Mail</h1><p>${meta}</p></div>${actions}</div>`;

L.VIEWS.mail=()=>{
 if(!M.connected)return `<div class="page ml-page">${header('Not connected yet','')}
  <div class="ml-empty"><span class="ml-emptyic">${ic('mail')}</span><h2 class="t-title">Connect your mail</h2>
  <p class="muted">LAAS reads the threads with your venues and contacts and links each one to its booking, venue and people. It only reads: nothing is sent unless you press Send.</p>
  <div class="row" style="justify-content:center"><button class="btn accent" data-act="mailconnect" data-svc="Gmail">${GOOGLE}Connect Gmail</button><button class="btn secondary" data-act="mailconnect" data-svc="Outlook">${ic('mail','s')}Connect Outlook</button></div>
  <ul class="ml-points"><li>${ic('users','s')}Only threads with people in Contacts</li><li>${ic('send','s')}Never sends on its own</li><li>${ic('plug','s')}Disconnect any time in Integrations</li></ul></div></div>${L.abar()}`;
 const c=counts(),q=M.q,l=filtered(),u=unreadN(),n=M.threads.filter(t=>t.needs&&!M.archived.includes(t.id)).length;
 const chips=[['all','All',c.all],['needs','Needs reply',c.needs],['booking','Linked to a booking',c.booking]];
 return `<div class="page ml-page">
 ${header(`Gmail, vital@lowtide.dk. ${u?`${u} unread`:'All read'}${n?`, ${n} need${n===1?'s':''} a reply`:''}`,`<button class="btn secondary" data-act="mailreadall" ${u?'':'disabled'}>${ic('check','s')}Mark all read</button><button class="btn secondary icon" data-act="mailmenu" aria-label="Mail account">${ic('more')}</button><button class="btn accent" data-act="mailnew">${ic('plus','s')}New mail</button>`)}
 <div class="row ml-filters">${M.showArchived?`<button class="btn ghost s flush" data-act="mailarchived">${ic('left','s')}Back to inbox</button><span class="t-label muted">Archived ${M.archived.length}</span>`:chips.map(([k,lb,n])=>`<button class="chip ${M.filter===k?'on':''}" data-act="mailfilter" data-f="${k}">${lb} ${n}</button>`).join('')}<span style="flex:1"></span><label class="search">${ic('search','s')}<input class="input" id="mlsearch" placeholder="Sender, subject, booking" value="${esc(q)}" aria-label="Search mail"></label></div>
 ${l.length?`<div class="ml-list" role="list">${l.map(t=>row(t,q)).join('')}</div>
 <div class="row t-meta muted"><span style="flex:1">${q?`${l.length} match “${esc(q)}” in sender, subject or booking`:M.showArchived?`${l.length} archived`:`Showing ${l.length} threads, synced 2 min ago`}</span>${q?'<button class="btn ghost s" data-act="mailclear">Clear search</button>':M.showArchived?'':`<button class="btn ghost s" data-act="mailarchived">${ic('archive','s')}Archived ${M.archived.length}</button>`}</div>`
 :`<div class="empty"><h3 class="t-heading">${q?`No match for “${esc(q)}”`:M.showArchived?'Nothing archived':M.filter==='needs'?'Nothing needs a reply':'No threads here'}</h3><p class="muted ml-measure" style="margin:0">${q?'Nothing in sender, subject or booking. Check the spelling or clear the search.':M.showArchived?'Archived threads stay linked to their booking.':'You are all caught up.'}</p><div class="row">${q?'<button class="btn ghost" data-act="mailclear">Clear search</button>':M.showArchived?`<button class="btn ghost" data-act="mailarchived">${ic('left','s')}Back to inbox</button>`:`<button class="btn ghost" data-act="mailfilter" data-f="all">Show all</button>`}</div></div>`}
 </div>${L.abar()}`;
};

const replyBox=t=>{const d=t.draft,k=t.id;
 if(M.sent[k])return `<div class="ml-sent">${ic('check','s')}<span style="flex:1">Reply sent ${M.sent[k]}</span><button class="btn ghost s" data-act="mailunsend" data-id="${k}">${ic('undo','s')}Undo</button></div>`;
 return `<div class="send ml-send"><div><h3 class="t-heading">${d.t}</h3><p class="muted" style="margin:2px 0 0">${d.s}</p></div>
 <div class="row t-label"><span class="muted">To</span>${M.toEdit?`<input class="input" style="flex:1;min-width:200px;height:32px" id="mltoedit" value="${esc(M.toVal[k]||d.to)}" aria-label="To"><button class="link" data-act="mailto">Done</button>`:`<span style="font-size:15px">${esc(M.toVal[k]||d.to)}</span><button class="link" data-act="mailto">Change</button>`}</div>
 <div class="msg ${M.full?'full':''}"><b class="strong">${esc(d.subj)}</b>${M.edit?`<textarea class="input" id="mlmsgedit" rows="5" aria-label="Message">${esc(M.msgVal[k]||d.body)}</textarea>`:`<p>${esc(M.msgVal[k]||d.body)}</p>`}<button class="link" style="align-self:flex-start" data-act="mailfull">${M.full?'Show less':'Show full message'}</button></div>
 <div class="row"><button class="btn ghost flush" data-act="mailnotnow">Not now</button><span style="flex:1"></span><button class="btn secondary" data-act="mailedit">${ic(M.edit?'check':'pencil','s')}${M.edit?'Done editing':'Edit text'}</button><button class="btn accent" data-act="mailsend" data-id="${k}">${ic('send','s')}Send</button></div></div>`;};

L.VIEWS.thread=()=>{const t=T(L.S.params.id),p=t.panel;
 if(t.unread){t.unread=false;}
 const arch=M.archived.includes(t.id);
 return `<style>.sidebar .nav.sub[data-go="mail"]{background:var(--well);font-weight:500}</style><div class="page ml-page">
 <button class="btn ghost s flush" data-go="mail" style="align-self:flex-start">${ic('left','s')}Mail</button>
 <div class="ml-thread"><div class="ml-conv">
  <div class="ph"><div class="grow"><h1 class="t-display">${esc(t.subject)}</h1><p>${esc(t.from)}${t.org?`, ${esc(t.org)}`:''}, ${t.msgs.length} message${t.msgs.length>1?'s':''}${t.code?`, <span class="mono t-label">${t.code}</span>`:''}</p></div>
   <button class="btn ghost" data-act="mailunread" data-id="${t.id}">${ic('mail','s')}Mark unread</button><button class="btn secondary" data-act="mailarchive" data-id="${t.id}" data-back="1">${ic(arch?'inbox':'archive','s')}${arch?'Move to inbox':'Archive'}</button></div>
  <div class="ml-msgs">${t.msgs.map(m=>`<article class="ml-msg"><div class="row" style="gap:12px;flex-wrap:nowrap">${m.me?`<span class="avatar-you" aria-hidden="true">${ME.ini}</span>`:avatar(t)}<span style="flex:1;min-width:0"><b class="strong">${m.me?'You':esc(t.from)}</b> <span class="t-meta faint">${m.me?ME.email:esc(t.email)}</span></span><span class="t-meta faint">${m.time}</span></div><p>${esc(m.body)}</p></article>`).join('')}</div>
  ${replyBox(t)}
 </div>
 <aside class="panel ml-panel"><div class="ml-photo"><img src="${IMG(p.img)}" alt=""><span class="tag ${p.tag[0]}">${p.tag[1]}</span></div>
  <div class="sec" style="gap:2px"><span class="t-label muted">${p.kicker}</span><h3 class="t-heading">${p.title}</h3><span class="t-label muted">${p.facts}</span></div>
  <button class="btn secondary" style="justify-content:center" data-go="${p.act[1]}" ${p.act[2].id?`data-id="${p.act[2].id}"`:''}>${ic('upright','s')}${p.act[0]}</button>
  <div class="sec" style="gap:0"><span class="t-label muted" style="padding-bottom:4px">Linked to this thread</span>${p.links.map(([go,ti,me,im,pa])=>`<button class="list-row" data-go="${go}" ${pa.id?`data-id="${pa.id}"`:''} ${go==='money'?'data-mt="invoices"':''}>${im?`<img class="thumb s" src="${IMG(im)}" alt="">`:`<span class="ml-av">${esc(ti.split(' ').map(w=>w[0]).slice(0,2).join(''))}</span>`}<span class="tx"><b>${esc(ti)}</b><small>${esc(me)}</small></span>${ic('right','s')}</button>`).join('')}</div>
  <p class="t-meta muted" style="margin:0">Linked by the assistant from the sender and the date. <button class="link" style="font-size:12px" data-act="maillinkchange">Change</button></p>
 </aside></div></div>${L.abar(t.subject,'Ask about this thread, or say “reply”')}`;};

/* ---------- actions ---------- */
const A=L.ACTIONS,R=()=>L.render();
A.openthread=el=>{const id=el.dataset.id||'skov';const t=T(id);M.full=false;M.edit=false;M.toEdit=false;L.go('thread',{id:t.id});};
A.mailfilter=el=>{M.filter=el.dataset.f;M.showArchived=false;R();};
A.mailclear=()=>{M.q='';R();};
A.mailarchived=()=>{M.showArchived=!M.showArchived;M.q='';R();};
A.mailread=(el,r,e)=>{e.stopPropagation();const t=T(el.dataset.id);const was=t.unread;t.unread=!was;R();L.toast(was?'Marked read':'Marked unread',()=>{t.unread=was});};
A.mailunread=el=>{const t=T(el.dataset.id);t.unread=true;L.go('mail');L.toast('Marked unread',()=>{t.unread=false});};
A.mailreadall=()=>{const was=M.threads.filter(t=>t.unread).map(t=>t.id);M.threads.forEach(t=>t.unread=false);R();L.toast(`${was.length} threads marked read`,()=>{M.threads.forEach(t=>{if(was.includes(t.id))t.unread=true})});};
A.mailarchive=(el,r,e)=>{e.stopPropagation();const id=el.dataset.id;const t=T(id);const was=M.archived.includes(id);
 M.archived=was?M.archived.filter(x=>x!==id):[...M.archived,id];
 const undo=()=>{M.archived=was?[...M.archived,id]:M.archived.filter(x=>x!==id)};
 if(el.dataset.back)L.go('mail');else R();L.toast(was?`Moved to inbox: ${t.subject}`:`Archived: ${t.subject}`,undo);};
A.maillink=(el,r,e)=>{e.stopPropagation();const t=T(el.dataset.id);const a=t.panel.act;L.go(a[1],a[2]);};
A.mailfull=()=>{M.full=!M.full;R();};
A.mailedit=()=>{M.edit=!M.edit;R();if(!M.edit)L.toast('Text saved for this reply');};
A.mailto=()=>{M.toEdit=!M.toEdit;R();};
A.mailnotnow=()=>{L.go('mail');L.toast('Reply kept as a draft for 24 hours');};
A.mailsend=el=>{const id=el.dataset.id,t=T(id);const nt=t.needs;M.sent[id]='just now';t.needs=false;M.edit=false;M.toEdit=false;
 t.msgs.push({me:true,time:'Just now',body:M.msgVal[id]||t.draft.body,sentNow:true});R();
 L.toast(`Reply sent to ${t.from}`,()=>{delete M.sent[id];t.needs=nt;t.msgs=t.msgs.filter(m=>!m.sentNow)});};
A.mailunsend=el=>{const id=el.dataset.id,t=T(id);delete M.sent[id];t.needs=THREADS.find(x=>x.id===id).needs;t.msgs=t.msgs.filter(m=>!m.sentNow);R();L.toast('Reply taken back, it was not delivered');};
A.maillinkchange=()=>L.open('menu',{x:Math.max(8,innerWidth-300),y:200,items:[['Link to another booking','maillinkpick'],['Link to a venue only','maillinkpick'],['Unlink this thread','maillinkpick',1]]});
A.maillinkpick=()=>{L.close();L.toast('Link changed. The assistant learns from it',()=>{});};
A.mailmenu=(el,r)=>L.open('menu',{x:Math.max(8,Math.min(r.right-260,innerWidth-276)),y:r.bottom+6,items:[['Sync now','mailsync'],['Mail settings','mailsettings'],['Disconnect Gmail','maildisconnect',1]]});
A.mailsync=()=>{L.close();L.toast('Synced. No new threads');};
A.mailsettings=()=>{L.close();L.go('integrations');};
A.maildisconnect=()=>{L.S.overlay={type:'modal',html:L.confirmM('Disconnect Gmail?','LAAS stops reading new mail. Threads already linked stay on their bookings. Nothing in Gmail changes.','Keep connected','maildisconnectok','Disconnect',1)};R();};
A.maildisconnectok=()=>{M.connected=false;L.S.overlay=null;R();L.toast('Gmail disconnected',()=>{M.connected=true});};
A.mailconnect=el=>{M.connected=true;R();L.toast(`${el.dataset.svc} connected, read-only. 6 threads linked`);};
A.mailnew=()=>L.open('modal',{html:`<h2 class="t-title">New mail</h2><div class="field"><label for="mn-to">To</label><select class="input" id="mn-to" style="max-width:400px">${L.CONTACTS.filter(c=>c.email).map(c=>`<option>${esc(c.name)}, ${c.email}</option>`).join('')}<option>Mette Krogh, Hotel Skov, mette@hotelskov.dk</option></select></div><div class="field"><label for="mn-s">Subject</label><input class="input" id="mn-s" value="Low Tide, spring dates"></div><div class="field"><label for="mn-b">Message</label><textarea class="input" id="mn-b" rows="5">Hej, vi planlægger foråret og vil gerne spille hos jer igen. Har I en lørdag i marts eller april? Venlig hilsen, Low Tide</textarea></div><div class="row" style="justify-content:flex-end"><button class="btn secondary" data-act="close">Not now</button><button class="btn accent" data-act="close" data-msg="Mail sent" data-undo="1">${ic('send','s')}Send</button></div>`});

L.INPUT.push(t=>{if(t.id==='mlsearch'){M.q=t.value;R();return true;}if(t.id==='mltoedit'){M.toVal[L.S.params.id||'skov']=t.value;return true;}if(t.id==='mlmsgedit'){M.msgVal[L.S.params.id||'skov']=t.value;return true;}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.classList&&e.target.classList.contains('ml-row'))e.target.click();});
})();
