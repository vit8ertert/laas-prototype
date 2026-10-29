/* LAAS prototype · mail area. Views `mail` (inbox, filters, search, empty state) and `thread` (conversation, linked
   booking panel, reply via the minimal send preview). Uses window.LAAS (see index.html).
   Open a thread from anywhere with data-go="thread" data-id="skov" or data-act="openthread" data-id="skov".
   21 Oct additions (from LaaS 0.5): folders Inbox, Starred, Sent, Drafts, Archive, Spam, Trash (tabs on `mail`),
   a full `compose` page (To, Cc, Bcc, subject, body, linked contact and booking, attachments) and the
   `mailaccounts` page (Gmail, Microsoft 365, SMTP and IMAP, connected and sign-in failed states). */
(function(){
"use strict";
const L=window.LAAS,S=L.S,ic=L.ic,IMG=L.IMG,esc=L.esc;

/* Lucide icons not in the core set (lucide.dev paths) */
L.P.archive='<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>';
L.P.mailopen='<path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/>';
L.P.upright='<path d="M7 7h10v10"/><path d="M7 17 17 7"/>';
L.P.inbox='<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>';
Object.assign(L.P,{
 trash:'<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
 paperclip:'<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
 lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
 shieldalert:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
 server:'<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
 refresh:'<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
 alertc:'<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
 rotate:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'
});
const MSFT='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#F25022" d="M1 1h10.5v10.5H1z"/><path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z"/><path fill="#00A4EF" d="M1 12.5h10.5V23H1z"/><path fill="#FFB900" d="M12.5 12.5H23V23H12.5z"/></svg>';
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

/* threads that live in Spam and Trash (21 Oct), plus the contact and booking each thread is linked to */
const EXTRA=[
 {id:'promo',from:'PlaylistPush Pro',org:'',email:'growth@playlistpush-pro.net',ini:'PP',subject:'10.000 real streams for 199 DKK',excerpt:'Guaranteed playlist placement for Low Tide. Pay today and see the streams in 48 hours.',time:'19 Oct',unread:false,needs:false,link:null,panel:null,
  spamWhy:'Paid streams break Spotify’s rules and can get a release taken down.',
  msgs:[{time:'19 Oct, 03:12',body:'Hi Low Tide! We love your sound. Get 10.000 real streams and guaranteed playlist placement for only 199 DKK. Pay today with the link below and see results in 48 hours.'}]},
 {id:'fest',from:'Festival applications',org:'Nordlys Festival',email:'apply@nordlys-festival-entry.com',ini:'NF',subject:'Shortlisted: pay the application fee',excerpt:'Your band is shortlisted for 2027. Pay the 450 DKK application fee by Friday to keep your slot.',time:'17 Oct',unread:false,needs:false,link:null,panel:null,
  spamWhy:'The sender is not the festival’s own address, and festivals do not charge to apply.',
  msgs:[{time:'17 Oct, 23:40',body:'Congratulations! Low Tide is shortlisted for Nordlys Festival 2027. To keep your slot, pay the 450 DKK application fee by Friday using the secure link.'}]},
 {id:'news',from:'Posten',org:'Newsletter',email:'news@posten.dk',ini:'P',subject:'Autumn programme at Posten',excerpt:'Our autumn programme is out. Members get tickets one day early.',time:'15 Oct',unread:false,needs:false,
  link:{label:'Posten',img:'posten',booking:false},
  msgs:[{time:'15 Oct, 10:00',body:'Our autumn programme is out, with 24 concerts from October to December. Members get tickets one day early.'}],
  panel:{img:'posten',tag:['draft','No booking yet'],kicker:'Venue, Odense',title:'Posten',facts:'600 capacity, never played',act:['Open venue','venue',{id:'posten'}],links:[]}},
];
/* thread id: [contact id, booking id], used when a reply opens in the full editor */
const TLINK={royal:['c1','b1'],skov:[null,null],odense:['c5','b5'],mono:['c4','b4'],studiob:['c3','b2'],posten:[null,null]};
const DRAFTS=[
 {id:'d1',thread:null,from:'gmail',to:[{name:'Sara Lind',email:'sara@odenselive.dk'}],cc:[],bcc:[],showCc:false,showBcc:false,subj:'Rider and stage plot for 28 Nov',body:'Hi Sara, here are our rider and stage plot for the support slot on 28 Nov. We bring our own snare and cymbals, as agreed. Best, Vital, Low Tide',contact:'c5',booking:'b5',att:[{name:'Low Tide rider 2026.pdf',size:'182 KB'},{name:'Stage plot.pdf',size:'96 KB'}],time:'Yesterday 22:14'},
 {id:'d2',thread:null,from:'gmail',to:[{name:'Programme team, Posten',email:'program@posten.dk'}],cc:[],bcc:[],showCc:false,showBcc:false,subj:'Christmas party on 2 Dec, load-in',body:'Hi, a quick question about the Christmas party on 2 Dec: when can we load in, and is there',contact:null,booking:'b6',att:[],time:'Sun 19 Oct'},
];
const ACCOUNTS=[
 {id:'gmail',kind:'gmail',email:'vital@lowtide.dk',state:'ok',meta:'Reads and sends, synced 2 min ago, 214 threads'},
 {id:'onecom',kind:'smtp',email:'booking@lowtide.dk',state:'error',meta:'IMAP imap.one.com, SMTP send.one.com',err:'Stopped syncing 19 Oct, 14:02. one.com refused the password.'},
];
const KIND={gmail:'Gmail',m365:'Microsoft 365',smtp:'SMTP and IMAP'};
/* people you can write to: thread senders plus contacts with an email */
const RECIPS=[...THREADS.map(t=>({name:t.from,org:t.org,email:t.email,contact:(TLINK[t.id]||[])[0]||null})),
 {name:'Jonas Beck',org:'Hotel Royal',email:'jonas@hotelroyal.dk',contact:'c2'},{name:'Kasper Holm',org:'Sound engineer',email:'kasper@holmlyd.dk',contact:'c6'},
 {name:'Accounts',org:'Hotel Royal',email:'faktura@hotelroyal.dk',contact:'c1'}];
const BOOKFILES={b1:['Invoice 2026-031.pdf','Offer LT-2026-029.pdf'],b4:['Offer LT-2026-034.pdf'],b5:['Low Tide rider 2026.pdf','Stage plot.pdf'],b6:['Offer LT-2026-036.pdf'],b2:[]};

S.mail??={connected:true,filter:'all',q:'',showArchived:false,threads:THREADS.map(t=>({...t})),archived:[],full:false,edit:false,toEdit:false,sent:{},msgVal:{},toVal:{}};
const M=S.mail;
EXTRA.forEach(t=>{if(!M.threads.some(x=>x.id===t.id))M.threads.push({...t})});
M.folder??='inbox';M.starred??=['royal','odense'];M.spam??=['promo','fest'];M.trash??=['news'];
M.drafts??=DRAFTS.map(d=>({...d,to:[...d.to],att:[...d.att]}));M.accounts??=ACCOUNTS.map(a=>({...a}));
M.cmp??=null;M.cmpQ??={};M.cmpErr??=null;M.oauth??={kind:'gmail',wait:false};M.smtp??={id:null,test:'idle'};M.smtpF??={};M.tg??={link:true};M.savedUntil??=0;
const T=id=>M.threads.find(t=>t.id===id)||M.threads[0];

/* ---------- folders ---------- */
L.P.flag=L.P.flag||'<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>';
const FOLDERS=[['inbox','Inbox'],['starred','Flagged'],['sent','Sent'],['drafts','Drafts'],['archive','Archive'],['spam','Spam'],['trash','Trash']];
const inF=(t,f)=>{const tr=M.trash.includes(t.id),sp=!tr&&M.spam.includes(t.id);
 if(f==='trash')return tr;if(f==='spam')return sp;if(tr||sp)return false;
 const ar=M.archived.includes(t.id);
 if(f==='archive')return ar;if(f==='inbox')return !ar&&t.msgs.some(m=>!m.me);
 if(f==='sent')return t.msgs.some(m=>m.me);if(f==='starred')return M.starred.includes(t.id);return false;};
const folderOf=t=>M.trash.includes(t.id)?'trash':M.spam.includes(t.id)?'spam':M.archived.includes(t.id)?'archive':'inbox';
const list=f=>M.threads.filter(t=>inF(t,f));
const unreadN=()=>list('inbox').filter(t=>t.unread).length;
const fcount=f=>f==='drafts'?M.drafts.length:f==='inbox'?unreadN():list(f).length;

const draftHay=d=>(d.to.map(r=>r.name+' '+r.email).join(' ')+' '+d.subj+' '+d.body).toLowerCase();
const filtered=()=>{const f=M.folder,q=M.q.trim().toLowerCase();
 if(f==='drafts')return q?M.drafts.filter(d=>draftHay(d).includes(q)):M.drafts;
 let l=list(f);
 if(f==='inbox'){if(M.filter==='needs')l=l.filter(t=>t.needs);if(M.filter==='booking')l=l.filter(t=>t.link&&t.link.booking);}
 if(q)l=l.filter(t=>(t.from+' '+t.org+' '+t.subject+' '+t.excerpt+' '+(t.link?t.link.label:'')).toLowerCase().includes(q));return l;};
const counts=()=>{const l=list('inbox');return {all:l.length,needs:l.filter(t=>t.needs).length,booking:l.filter(t=>t.link&&t.link.booking).length};};

/* ---------- pieces ---------- */
const initials=s=>String(s||'?').replace(/[^\p{L}\s]/gu,' ').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase()||'?';
const avatar=(t)=>`<span class="ml-av" aria-hidden="true">${esc(t.ini)}</span>`;
const linkChip=(t,tag='span')=>t.link?`<${tag} class="ml-link" ${tag==='button'?`data-act="maillink" data-id="${t.id}"`:''}><img src="${IMG(t.link.img)}" alt="">${esc(t.link.label)}</${tag}>`:'';
const bookingChip=id=>{const b=L.BOOKINGS.find(x=>x.id===id);if(!b)return '';const v=b.venue&&L.V(b.venue);
 return `<span class="ml-link">${v?`<img src="${IMG(v.img)}" alt="">`:`<span class="ml-linkic">${ic('calendar','s')}</span>`}${esc(b.title)}</span>`;};
const iconBtn=(icon,label,act,id,extra='')=>`<button class="btn ghost icon s" data-act="${act}" data-id="${id}" aria-label="${label}" title="${label}" ${extra}>${ic(icon,'s')}</button>`;
const rowActs=(t,f)=>{const st=M.starred.includes(t.id);
 if(f==='spam')return iconBtn('inbox','Not spam','mailnotspam',t.id)+iconBtn('trash','Delete for good','maildelete',t.id);
 if(f==='trash')return iconBtn('undo','Restore','mailrestore',t.id)+iconBtn('trash','Delete for good','maildelete',t.id);
 const ar=M.archived.includes(t.id);
 /* Vit 21 Oct: stars were not intuitive; a flag at the end of the row instead: shown by the time when set,
    toggled from the row's hover actions */
 return iconBtn('flag',st?'Remove flag':'Flag','mailstar',t.id)+(f==='sent'?'':iconBtn(t.unread?'check':'mail',t.unread?'Mark read':'Mark unread','mailread',t.id))
  +(f==='sent'?'':iconBtn(ar?'inbox':'archive',ar?'Move to inbox':'Archive','mailarchive',t.id))
  +iconBtn('trash','Move to Trash','mailtrash',t.id);};
const row=(t,q)=>{const f=M.folder,sent=f==='sent',lastMe=sent?[...t.msgs].reverse().find(m=>m.me):null,unread=!sent&&t.unread,st=M.starred.includes(t.id);
 const lastIn=t.msgs[t.msgs.length-1];const waiting=sent&&lastIn.me;
 return `<div class="ml-row ${unread?'unread':''}" role="button" tabindex="0" data-act="openthread" data-id="${t.id}">
 <span class="ml-dot" aria-label="${unread?'Unread':''}"></span>${avatar(t)}
 <span class="ml-from">${sent?'To: ':''}${L.hl(t.from,q)}${t.org?`<small>${L.hl(t.org,q)}</small>`:''}</span>
 <span class="ml-text"><b>${L.hl(t.subject,q)}</b><span>${L.hl(sent?lastMe.body:t.excerpt,q)}</span></span>
 <span class="ml-linkcol">${linkChip(t,'button')}</span>
 <span class="ml-status">${f==='spam'?'<span class="tag danger">Looks like a scam</span>':waiting?'<span class="tag draft">No reply yet</span>':(!sent&&t.needs&&f!=='trash')?'<span class="tag attention">Needs reply</span>':''}</span>
 <span class="ml-time">${st?`<span class="ml-flag" title="Flagged" aria-label="Flagged">${ic('flag','s')}</span>`:''}${sent?lastMe.time.replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) /,''):t.time}</span>
 <span class="ml-acts">${rowActs(t,f)}</span>
</div>`;};
const draftRow=(d,q)=>{const names=d.to.map(r=>r.name||r.email).join(', ');
 return `<div class="ml-row" role="button" tabindex="0" data-act="maildraft" data-id="${d.id}">
 <span class="ml-dot"></span><span class="ml-av" aria-hidden="true">${esc(initials(d.to[0]?(d.to[0].name||d.to[0].email):'?'))}</span>
 <span class="ml-from">${names?L.hl('To: '+names,q):'<span class="muted">No recipient yet</span>'}<small class="ml-drl">Draft</small></span>
 <span class="ml-text"><b>${d.subj?L.hl(d.subj,q):'<span class="muted">No subject</span>'}</b><span>${L.hl(d.body||'Empty',q)}</span></span>
 <span class="ml-linkcol">${bookingChip(d.booking)}</span>
 <span class="ml-status">${d.att.length?`<span class="ml-clip" title="${d.att.length} attachment${d.att.length>1?'s':''}">${ic('paperclip','s')}${d.att.length}</span>`:''}</span>
 <span class="ml-time">${d.time}</span>
 <span class="ml-acts">${iconBtn('trash','Discard draft','maildraftdel',d.id)}</span>
</div>`;};

/* ---------- views ---------- */
const header=(meta,actions)=>`<div class="ph"><div class="grow"><h1 class="t-display">Mail</h1><p>${meta}</p></div>${actions}</div>`;
const navMark='<style>.sidebar .nav.sub[data-go="mail"]{background:var(--well);font-weight:500}</style>';
const okAccs=()=>M.accounts.filter(a=>a.state==='ok');
const errAcc=()=>M.accounts.find(a=>a.state==='error');
const syncConnected=()=>{M.connected=M.accounts.some(a=>a.state!=='off');};
const errBanner=(fix=true)=>{const a=errAcc();return a?`<div class="banner danger ml-banner">${ic('alertc')}<div class="tx"><b>${esc(a.email)} stopped syncing</b><span class="t-label">${esc(a.err)} New mail is not reaching LAAS.</span></div>${fix?`<button class="btn secondary s" data-go="mailaccounts">Fix in Mail accounts</button>`:`<button class="btn secondary s" data-act="mlfix" data-id="${a.id}">Fix</button>`}</div>`:'';};
const tabs=()=>`<div class="ml-tabs" role="tablist" aria-label="Mail folders">${FOLDERS.map(([k,l])=>{const n=fcount(k);return `<button role="tab" aria-selected="${M.folder===k}" class="${M.folder===k?'on':''}" data-act="mailfolder" data-f="${k}"><span>${l}</span>${n?`<span class="c">${n}</span>`:''}</button>`}).join('')}</div>`;
const FNOTE={starred:'Flags are only for you.',sent:'Sent from LAAS or from Gmail, linked to their booking.',drafts:'Drafts save as you type. Saving never sends anything.',archive:'Archived threads stay linked to their booking.',spam:'Spam is never linked to a booking and is deleted after 30 days.',trash:'Threads in Trash are deleted for good after 30 days.'};
const EMPTY={
 inbox:['No threads here','You are all caught up.'],
 starred:['Nothing flagged','Flag a thread to keep it here until it is done.'],
 sent:['Nothing sent yet','Mail you send lands here, linked to its booking.'],
 drafts:['No drafts','Start a mail and it saves here as you type. Saving never sends anything.'],
 archive:['Nothing archived','Archived threads stay linked to their booking.'],
 spam:['No spam','Mail that looks like spam or a scam lands here, away from your bookings.'],
 trash:['Trash is empty','Deleted threads stay here for 30 days, then they are gone.']};

L.VIEWS.mail=()=>{
 if(!M.connected)return `<div class="page ml-page">${header('Not connected yet','')}
  <div class="ml-empty"><span class="ml-emptyic">${ic('mail')}</span><h2 class="t-title">Connect your mail</h2>
  <p class="muted">LAAS reads the threads with your venues and contacts and links each one to its booking, venue and people. It only reads: nothing is sent unless you press Send.</p>
  <div class="row" style="justify-content:center"><button class="btn accent" data-act="mailconnect" data-svc="Gmail">${GOOGLE}Connect Gmail</button><button class="btn secondary" data-act="mloauth" data-kind="m365">${MSFT}Connect Microsoft 365</button></div>
  <button class="link" data-act="mlsmtp">Other mail, with SMTP and IMAP</button>
  <ul class="ml-points"><li>${ic('users','s')}Only threads with people in Contacts</li><li>${ic('send','s')}Never sends on its own</li><li>${ic('plug','s')}Disconnect any time in Mail accounts</li></ul></div></div>${L.abar()}`;
 const f=M.folder,c=counts(),q=M.q,l=filtered(),u=unreadN(),n=list('inbox').filter(t=>t.needs).length;
 const chips=[['all','All',c.all],['needs','Needs reply',c.needs],['booking','Linked to a booking',c.booking]];
 const acc=okAccs()[0]||M.accounts.find(a=>a.state!=='off');const more=M.accounts.filter(a=>a.state!=='off').length-1;
 const fname=FOLDERS.find(x=>x[0]===f)[1];
 const folderBar=f==='inbox'?chips.map(([k,lb,n])=>`<button class="chip ${M.filter===k?'on':''}" data-act="mailfilter" data-f="${k}">${lb} ${n}</button>`).join('')
  :`<span class="t-meta muted ml-fnote">${FNOTE[f]}</span>${f==='spam'&&l.length?`<button class="btn ghost s" data-act="mailemptyf" data-f="spam">${ic('trash','s')}Delete all spam</button>`:''}${f==='trash'&&l.length?`<button class="btn ghost s" data-act="mailemptyf" data-f="trash">${ic('trash','s')}Empty Trash</button>`:''}`;
 const [eh,et]=EMPTY[f];
 return `<div class="page ml-page">
 ${header(`${u?`${u} unread`:'All read'}${n?`, ${n} need${n===1?'s':''} a reply`:''}`,`<button class="btn secondary" data-act="mailreadall" ${u?'':'disabled'}>${ic('check','s')}Mark all read</button><button class="btn secondary icon" data-act="mailmenu" aria-label="Mail account">${ic('more')}</button><button class="btn accent" data-act="mailnew">${ic('plus','s')}New mail</button>`)}
 ${errBanner()}
 ${tabs()}
 <div class="row ml-filters">${folderBar}<span style="flex:1"></span><label class="search">${ic('search','s')}<input class="input" id="mlsearch" placeholder="Search ${fname.toLowerCase()}" value="${esc(q)}" aria-label="Search ${fname}"></label></div>
 ${l.length?`<div class="ml-list" role="list">${l.map(t=>f==='drafts'?draftRow(t,q):row(t,q)).join('')}</div>
 <div class="row t-meta muted"><span style="flex:1">${q?`${l.length} match “${esc(q)}” in ${fname}`:f==='inbox'?`Showing ${l.length} threads, synced 2 min ago`:`${l.length} in ${fname}`}</span>${q?'<button class="btn ghost s" data-act="mailclear">Clear search</button>':''}</div>`
 :`<div class="empty"><h3 class="t-heading">${q?`No match for “${esc(q)}”`:f==='inbox'&&M.filter==='needs'?'Nothing needs a reply':eh}</h3><p class="muted ml-measure" style="margin:0">${q?`Nothing in ${fname} matches. Check the spelling or clear the search.`:et}</p><div class="row">${q?'<button class="btn ghost" data-act="mailclear">Clear search</button>':f==='inbox'?`<button class="btn ghost" data-act="mailfilter" data-f="all">Show all</button>`:f==='drafts'||f==='sent'?`<button class="btn ghost" data-act="mailnew">${ic('pencil','s')}Write a mail</button>`:`<button class="btn ghost" data-act="mailfolder" data-f="inbox">${ic('left','s')}Back to Inbox</button>`}</div></div>`}
 </div>${L.abar()}`;
};

const replyBox=t=>{const d=t.draft,k=t.id;
 if(!d)return `<p class="t-meta muted ml-quiet">${ic('check','s')}Sent ${esc(t.time)}. Replies land in Inbox and stay linked to the booking.</p>`;
 if(M.sent[k])return `<div class="ml-sent">${ic('check','s')}<span style="flex:1">Reply sent ${M.sent[k]}</span><button class="btn ghost s" data-act="mailunsend" data-id="${k}">${ic('undo','s')}Undo</button></div>`;
 return `<div class="send ml-send"><div><h3 class="t-heading">${d.t}</h3><p class="muted" style="margin:2px 0 0">${d.s}</p></div>
 <div class="row t-label"><span class="muted">To</span>${M.toEdit?`<input class="input" style="flex:1;min-width:200px;height:32px" id="mltoedit" value="${esc(M.toVal[k]||d.to)}" aria-label="To"><button class="link" data-act="mailto">Done</button>`:`<span style="font-size:15px">${esc(M.toVal[k]||d.to)}</span><button class="link" data-act="mailto">Change</button>`}<button class="link" data-act="mailreplyfull" data-id="${k}">Add Cc or attachments</button></div>
 <div class="msg ${M.full?'full':''}"><b class="strong">${esc(d.subj)}</b>${M.edit?`<textarea class="input" id="mlmsgedit" rows="5" aria-label="Message">${esc(M.msgVal[k]||d.body)}</textarea>`:`<p>${esc(M.msgVal[k]||d.body)}</p>`}<button class="link" style="align-self:flex-start" data-act="mailfull">${M.full?'Show less':'Show full message'}</button></div>
 <div class="row"><button class="btn ghost flush" data-act="mailnotnow">Not now</button><span style="flex:1"></span><button class="btn secondary" data-act="mailedit">${ic(M.edit?'check':'pencil','s')}${M.edit?'Done editing':'Edit text'}</button><button class="btn accent" data-act="mailsend" data-id="${k}">${ic('send','s')}Send</button></div></div>`;};

L.VIEWS.thread=()=>{const t=T(L.S.params.id),p=t.panel,fo=folderOf(t),st=M.starred.includes(t.id);
 if(t.unread){t.unread=false;}
 const arch=fo==='archive';
 const acts=fo==='spam'?`<button class="btn secondary" data-act="mailnotspam" data-id="${t.id}" data-back="1">${ic('inbox','s')}Not spam</button><button class="btn ghost" data-act="maildelete" data-id="${t.id}">${ic('trash','s')}Delete for good</button>`
  :fo==='trash'?`<button class="btn secondary" data-act="mailrestore" data-id="${t.id}" data-back="1">${ic('undo','s')}Restore</button><button class="btn ghost" data-act="maildelete" data-id="${t.id}">${ic('trash','s')}Delete for good</button>`
  :`<button class="btn ghost icon" data-act="mailstar" data-id="${t.id}" aria-pressed="${st}" aria-label="${st?'Remove flag':'Flag'}" title="${st?'Remove flag':'Flag'}">${ic('flag')}</button><button class="btn ghost icon" data-act="mailtrash" data-id="${t.id}" data-back="1" aria-label="Move to Trash" title="Move to Trash">${ic('trash')}</button><button class="btn ghost" data-act="mailunread" data-id="${t.id}">${ic('mail','s')}Mark unread</button><button class="btn secondary" data-act="mailarchive" data-id="${t.id}" data-back="1">${ic(arch?'inbox':'archive','s')}${arch?'Move to inbox':'Archive'}</button>`;
 const banner=fo==='spam'?`<div class="banner danger">${ic('shieldalert')}<div class="tx"><b>This looks like a scam</b><span class="t-label">${esc(t.spamWhy||'')} Links and images are off in Spam.</span></div></div>`
  :fo==='trash'?`<div class="banner info">${ic('trash')}<div class="tx"><b>In Trash</b><span class="t-label muted">Deleted for good 30 days after it was moved here. Restore it to keep it.</span></div></div>`:'';
 const panel=p?`<aside class="panel ml-panel ${fo==='spam'?'ml-off':''}"><div class="ml-photo"><img src="${IMG(p.img)}" alt=""><span class="tag ${p.tag[0]}">${p.tag[1]}</span></div>
  <div class="sec" style="gap:2px"><span class="t-label muted">${p.kicker}</span><h3 class="t-heading">${p.title}</h3><span class="t-label muted">${p.facts}</span></div>
  <button class="btn secondary" style="justify-content:center" data-go="${p.act[1]}" ${p.act[2].id?`data-id="${p.act[2].id}"`:''}>${ic('upright','s')}${p.act[0]}</button>
  ${p.links.length?`<div class="sec" style="gap:0"><span class="t-label muted" style="padding-bottom:4px">Linked to this thread</span>${p.links.map(([go,ti,me,im,pa])=>`<button class="list-row" data-go="${go}" ${pa.id?`data-id="${pa.id}"`:''} ${go==='money'?'data-mt="invoices"':''}>${im?`<img class="thumb s" src="${IMG(im)}" alt="">`:`<span class="ml-av">${esc(ti.split(' ').map(w=>w[0]).slice(0,2).join(''))}</span>`}<span class="tx"><b>${esc(ti)}</b><small>${esc(me)}</small></span>${ic('right','s')}</button>`).join('')}</div>`:''}
  <p class="t-meta muted" style="margin:0">Linked by the assistant from the sender and the date. <button class="link" style="font-size:12px" data-act="maillinkchange">Change</button></p>
 </aside>`
 :`<aside class="panel ml-panel"><div class="sec" style="gap:6px"><span class="t-label muted">Linked to this thread</span><p class="muted" style="margin:0">${fo==='spam'?'Nothing. Spam is never linked to a booking, venue or contact.':'Nothing yet. Link it so the thread shows on the booking.'}</p></div>${fo==='spam'?'':`<button class="btn secondary" style="justify-content:center" data-act="maillinkchange">${ic('plus','s')}Link to a booking</button>`}</aside>`;
 return `${navMark}<div class="page ml-page">
 <button class="btn ghost s flush" data-go="mail" style="align-self:flex-start">${ic('left','s')}${FOLDERS.find(x=>x[0]===M.folder)[1]}</button>
 <div class="ml-thread"><div class="ml-conv">
  <div class="ph"><div class="grow"><h1 class="t-display">${esc(t.subject)}</h1><p>${esc(t.from)}${t.org?`, ${esc(t.org)}`:''}, ${t.msgs.length} message${t.msgs.length>1?'s':''}${t.code?`, <span class="mono t-label">${t.code}</span>`:''}</p></div>
   <div class="row ml-tacts">${acts}</div></div>
  ${banner}
  <div class="ml-msgs">${t.msgs.map(m=>`<article class="ml-msg"><div class="row" style="gap:12px;flex-wrap:nowrap">${m.me?`<span class="avatar-you" aria-hidden="true">${ME.ini}</span>`:avatar(t)}<span style="flex:1;min-width:0"><b class="strong">${m.me?'You':esc(t.from)}</b> <span class="t-meta faint">${m.me?esc(m.fromEmail||ME.email):esc(t.email)}</span>${m.att&&m.att.length?`<span class="ml-clip t-meta muted">${ic('paperclip','s')}${m.att.map(a=>esc(a.name)).join(', ')}</span>`:''}</span><span class="t-meta faint">${m.time}</span></div><p>${esc(m.body)}</p></article>`).join('')}</div>
  ${fo==='spam'||fo==='trash'?'':replyBox(t)}
 </div>
 ${panel}</div></div>${L.abar(t.subject,'Ask about this thread, or say “reply”')}`;};

/* ---------- compose ---------- */
const blank=()=>({id:'n'+Date.now(),thread:null,from:(okAccs()[0]||{}).id||'gmail',to:[],cc:[],bcc:[],showCc:false,showBcc:false,subj:'',body:'',contact:null,booking:null,att:[],time:'Just now',fresh:true,auto:false});
const cmpSave=()=>{const on=Date.now()<M.savedUntil;return `<span class="acc-save ${on?'on':''}" id="ml-save" role="status" aria-live="polite">${on?ic('check','s')+'Draft saved':''}</span>`;};
function flashSaved(id,word){const el=document.getElementById(id);if(!el)return;clearTimeout(M._t1);clearTimeout(M._t2);
 el.className='acc-save on';el.textContent='Saving…';
 M._t1=setTimeout(()=>{M.savedUntil=Date.now()+3000;const e=document.getElementById(id);if(!e)return;e.innerHTML=ic('check','s')+word;
  M._t2=setTimeout(()=>{const e2=document.getElementById(id);if(e2)e2.classList.remove('on');},3000);},600);}
const touched=()=>{const c=M.cmp;if(!c)return;if(c.fresh){c.fresh=false;M.drafts.unshift(c);}c.time='Just now';flashSaved('ml-save','Draft saved');};
const recipField=(k,label)=>{const c=M.cmp,q=M.cmpQ[k]||'',qq=q.trim().toLowerCase();
 const sug=qq?RECIPS.filter(r=>(r.name+' '+r.org+' '+r.email).toLowerCase().includes(qq)&&!c[k].some(x=>x.email===r.email)).slice(0,5):[];
 const err=k==='to'&&M.cmpErr==='to';
 return `<div class="ml-cf ${err?'err':''}"><label class="ml-cl" for="ml-${k}">${label}</label><div class="ml-chips">${c[k].map((r,i)=>`<span class="ml-rc" title="${esc(r.email)}">${esc(r.name||r.email)}<button data-act="mlrm" data-k="${k}" data-i="${i}" aria-label="Remove ${esc(r.name||r.email)}">${ic('x','s')}</button></span>`).join('')}<input id="ml-${k}" class="ml-ci" value="${esc(q)}" placeholder="${c[k].length?'':'Name or email'}" autocomplete="off" aria-label="${label}" ${err?'aria-invalid="true" aria-describedby="ml-toerr"':''}>
 ${sug.length?`<div class="ml-sug" role="listbox">${sug.map(r=>`<button role="option" data-act="mladd" data-k="${k}" data-e="${esc(r.email)}"><span class="ml-av">${esc(initials(r.name))}</span><span class="tx"><b>${L.hl(r.name,q)}</b><small>${r.org?L.hl(r.org,q)+', ':''}${L.hl(r.email,q)}</small></span></button>`).join('')}</div>`:qq&&qq.includes('@')?`<div class="ml-sug"><button data-act="mladdq" data-k="${k}"><span class="ml-av">${ic('mail','s')}</span><span class="tx"><b>${esc(q.trim())}</b><small>Not in Contacts yet</small></span></button></div>`:''}</div>
 ${k==='to'?`<span class="ml-ccb">${c.showCc?'':'<button class="link" data-act="mlshow" data-k="cc">Cc</button>'}${c.showBcc?'':'<button class="link" data-act="mlshow" data-k="bcc">Bcc</button>'}</span>`:''}</div>
 ${err?`<p class="ml-errmsg" id="ml-toerr">${ic('alertc','s')}Add at least one recipient before you send.</p>`:''}`;};
const suggestedFiles=c=>{if(!c.booking)return [];const have=c.att.map(a=>a.name);
 return [...(BOOKFILES[c.booking]||[]),'Low Tide rider 2026.pdf','Stage plot.pdf','Press photo.jpg'].filter((n,i,a)=>a.indexOf(n)===i&&!have.includes(n)).slice(0,4);};

L.VIEWS.compose=()=>{if(!M.cmp)M.cmp=blank();const c=M.cmp;const accs=M.accounts.filter(a=>a.state!=='off');
 const ctc=L.CONTACTS.find(x=>x.id===c.contact),bk=L.BOOKINGS.find(x=>x.id===c.booking);const sf=suggestedFiles(c);
 const th=c.thread?T(c.thread):null;
 return `${navMark}<div class="page ml-page ml-cmpage">
 <button class="btn ghost s flush" data-act="mlback" style="align-self:flex-start">${ic('left','s')}${th?'Thread':'Mail'}</button>
 <div class="acc-ph ml-cmph"><div class="grow"><h1 class="t-display">${th?'Reply':c.fresh?'New mail':'Draft'}</h1><p>${th?`Re: ${esc(th.subject)}, to ${esc(th.from)}`:c.fresh?'Starts saving as soon as you type':`Saved in Drafts, ${esc(c.time.toLowerCase())}`}</p></div>${cmpSave()}</div>
 <div class="ml-cmpw">
 <div class="ml-ed">
  <div class="ml-cf"><label class="ml-cl" for="ml-from">From</label><select class="input ml-fromsel" id="ml-from">${accs.map(a=>`<option value="${a.id}" ${a.id===c.from?'selected':''} ${a.state==='error'?'disabled':''}>${esc(a.email)}, ${KIND[a.kind]}${a.state==='error'?', sign-in failed':''}</option>`).join('')}</select></div>
  ${recipField('to','To')}
  ${c.showCc?recipField('cc','Cc'):''}
  ${c.showBcc?recipField('bcc','Bcc'):''}
  <div class="ml-cf"><label class="ml-cl" for="ml-subj">Subject</label><input id="ml-subj" class="ml-ci" value="${esc(c.subj)}" placeholder="What it is about" autocomplete="off"></div>
  <textarea id="ml-body" class="ml-body" aria-label="Message" placeholder="Write your mail, or ask the assistant to draft it">${esc(c.body)}</textarea>
  <div class="ml-attrow">${c.att.map((a,i)=>`<span class="ml-file">${ic('paperclip','s')}<span class="nm">${esc(a.name)}</span><small>${a.size}</small><button data-act="mlattrm" data-i="${i}" aria-label="Remove ${esc(a.name)}">${ic('x','s')}</button></span>`).join('')}
   <label class="btn ghost s" style="cursor:pointer">${ic('paperclip','s')}Attach files<input type="file" hidden multiple data-mlatt></label>
   <button class="btn ghost s" data-act="mlwrite">${ic('ai','s')}${c.body.trim()?'Rewrite with the assistant':'Draft with the assistant'}</button></div>
  ${sf.length?`<div class="ml-attsug"><span class="t-meta muted">From ${esc(bk.title)}</span>${sf.map(n=>`<button class="chip" data-act="mlattadd" data-n="${esc(n)}">${ic('plus','s')}${esc(n)}</button>`).join('')}</div>`:''}
 </div>
 <section class="ml-lk"><div><h2 class="t-heading">Linked to</h2><p class="t-meta muted" style="margin:2px 0 0">${c.auto&&(ctc||bk)?'Picked by the assistant from the recipient. Change it if it is wrong.':'The mail and every reply show on the contact and the booking.'}</p></div>
  <div class="ml-lkr"><div class="field"><label for="ml-contact">Contact</label><select class="input" id="ml-contact"><option value="">None</option>${L.CONTACTS.map(x=>`<option value="${x.id}" ${x.id===c.contact?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div>
  <div class="field"><label for="ml-booking">Booking</label><select class="input" id="ml-booking"><option value="">None</option>${L.BOOKINGS.filter(b=>b.tab!=='past'||b.id===c.booking).map(b=>`<option value="${b.id}" ${b.id===c.booking?'selected':''}>${esc(b.title)}, ${esc(b.when)}</option>`).join('')}</select></div></div>
  ${ctc||bk?`<div class="row" style="gap:8px">${bk?`<button class="btn ghost s" data-go="booking" data-id="${bk.id}">${ic('upright','s')}Open booking</button>`:''}${ctc?`<button class="btn ghost s" data-go="contacts">${ic('upright','s')}Open contact</button>`:''}</div>`:''}
 </section>
 <div class="ml-cfoot"><span class="ml-lock">${ic('lock','s')}Nothing leaves here until you press Send.</span><span style="flex:1"></span><button class="btn ghost" data-act="mldiscard">Discard</button><button class="btn secondary" data-act="mlsavedraft">Save draft</button><button class="btn accent" data-act="mlsend">${ic('send','s')}Send</button></div>
 </div></div>${L.abar(c.subj||'New mail','Ask the assistant to write it, for example “ask Posten for a spring date”')}`;};

/* ---------- mail accounts ---------- */
const logo=k=>L.brand(k==='gmail'?'Google':k==='m365'?'Microsoft':'Mail server',24);  // = Figma Platform icon (List row Leading), Vit 29 Oct
const mtg=(k,label)=>`<button class="acc-tg ${M.tg[k]?'on':''}" role="switch" aria-checked="${!!M.tg[k]}" aria-label="${esc(label)}" data-act="mltg" data-k="${k}"><i></i></button>`;
const aRow=(label,desc,ctl,lead='')=>`<div class="acc-row ${lead?'ml-lead':''}">${lead}<div class="tx"><span>${label}</span>${desc?`<small>${desc}</small>`:''}</div><div class="ctl">${ctl}</div></div>`;
const aSec=(title,inner,action='',cls='')=>`<section class="acc-sec ${cls}"><div class="acc-sh"><h2 class="t-title">${title}</h2>${action}</div>${inner}</section>`;
const accSave=()=>{const on=Date.now()<M.savedUntil;return `<span class="acc-save ${on?'on':''}" id="ml-asave" role="status" aria-live="polite">${on?ic('check','s')+'Saved':''}</span>`;};
// one List row per account (Vit 29 Oct, fewer designs): trailing is one thing, Fix on a broken account, else the Connected tag
// and the row itself opens the account menu (chevron), instead of tag + Fix + more button
const accRow=a=>a.state==='error'?`<div class="acc-li ml-accrow">${logo(a.kind)}<span class="tx"><span>${esc(a.email)}</span><small class="ml-errtx">${esc(KIND[a.kind])}. ${esc(a.err)}</small></span><button class="btn secondary s" data-act="mlfix" data-id="${a.id}">Fix</button></div>`
 :`<button class="acc-li ml-accrow" data-act="mlaccmenu" data-id="${a.id}" aria-label="More for ${esc(a.email)}">${logo(a.kind)}<span class="tx"><span>${esc(a.email)}</span><small>${esc(KIND[a.kind])}. ${esc(a.meta)}</small></span><span class="tag confirmed">Connected</span>${ic('chevr','s')}</button>`;
L.VIEWS.mailaccounts=()=>{const acc=M.accounts.filter(a=>a.state!=='off'),ok=okAccs(),err=acc.filter(a=>a.state==='error').length,hasG=acc.some(a=>a.kind==='gmail'),hasM=acc.some(a=>a.kind==='m365');
 return `${navMark}<div class="page acc-set ml-page ml-accs"><button class="btn ghost s flush" data-go="mail" style="align-self:flex-start">${ic('left','s')}Mail</button>
 <div class="acc-ph"><div class="grow"><h1 class="t-display">Mail accounts</h1><p>${acc.length?`${acc.length} connected${err?`, ${err} needs attention`:''}`:'Nothing connected yet. Add Gmail, Microsoft 365 or any mail with SMTP and IMAP'}</p></div>${accSave()}</div>
 <div class="ml-col">
 ${aSec('Connected',acc.length?`<div class="acc-list">${acc.map(accRow).join('')}</div>`:`<p class="acc-foot">No mail connected. Add an account below and LAAS links your threads to bookings.</p>`,'','pad')}
 ${aSec('Add an account',`<div class="acc-rows">
  ${aRow('Gmail','Sign in with Google. Includes Google Workspace addresses',`<button class="btn secondary s" data-act="mloauth" data-kind="gmail">${hasG?'Add another':'Connect'}</button>`,logo('gmail'))}
  ${aRow('Microsoft 365','Outlook, Hotmail and work accounts on Exchange',`<button class="btn secondary s" data-act="mloauth" data-kind="m365">${hasM?'Add another':'Connect'}</button>`,logo('m365'))}
  ${aRow('Other mail','Any provider with SMTP and IMAP, such as one.com, Simply or your web host',`<button class="btn secondary s" data-act="mlsmtp">Set up</button>`,logo('smtp'))}</div>
  <p class="acc-foot">${ic('lock','s')}<span>Google and Microsoft sign you in on their own page; LAAS never sees that password.</span></p>`)}
 ${aSec('How LAAS uses mail',`<div class="acc-rows">
  ${aRow('Threads LAAS reads','Only people in Contacts keeps private mail out of LAAS',`<select class="input acc-sel" aria-label="Threads LAAS reads" data-mlsave><option>Only people in Contacts</option><option>Everything in the inbox</option></select>`)}
  ${aRow('Link threads to bookings','The assistant links by sender and date, you can change any link',mtg('link','Link threads to bookings'))}
  ${aRow('Send new mail from','Replies always go from the address the mail came to',ok.length?`<select class="input acc-sel" aria-label="Send new mail from" data-mlsave>${ok.map(a=>`<option>${esc(a.email)}</option>`).join('')}</select>`:'<span class="tag draft">No account</span>')}
  ${aRow('Signature','Added under new mail and replies',`<input class="input acc-in" id="ml-sig" style="width:320px" aria-label="Signature" value="${esc(M.sig||'Venlig hilsen, Vital, Low Tide')}" data-mlsave>`)}
  ${aRow('Sending','The assistant drafts, only you send','<span class="tag draft">Only when you press Send</span>')}</div>
  <p class="acc-foot">${ic('lock','s')}<span>Saving never sends anything. Disconnecting stops new mail; threads already linked stay on their bookings.</span></p>`)}
 </div></div>${L.abar('Mail accounts','Ask about mail, for example “why did booking@lowtide.dk stop syncing?”')}`;};

/* connect drawers: Google or Microsoft sign-in, and SMTP and IMAP by hand */
const WIDE='<span class="ml-wide" hidden></span>';
L.DR.mailoauth=(kind)=>{const n=KIND[kind],co=kind==='gmail'?'Google':'Microsoft',w=M.oauth.wait;
 const def=kind==='gmail'?(M.accounts.some(a=>a.kind==='gmail'&&a.state!=='off')?'lowtide.band@gmail.com':'vital@lowtide.dk'):'tour@lowtide.dk';
 return {type:'drawer',title:`Connect ${n}`,sub:`You sign in on ${co}’s page, LAAS never sees your password`,
 body:`<div class="field"><label for="ml-oe">Email address</label><input class="input" id="ml-oe" style="max-width:400px" value="${esc(M.oauth.email||def)}" ${w?'disabled':''}><span class="help">The account LAAS reads and sends from</span></div>
 <div class="ml-perm"><b class="strong">LAAS can</b>${[['users','Read threads with people in your Contacts'],['flow','Link each thread to its booking, venue and people'],['send','Send a mail when you press Send, never on its own']].map(([i,t])=>`<span class="row" style="gap:10px;flex-wrap:nowrap">${ic(i,'s')}${t}</span>`).join('')}</div>
 <div class="ml-perm"><b class="strong">LAAS cannot</b>${['Delete or move mail in your mailbox','Read mail from people who are not in Contacts, unless you change it','Send anything by itself, the assistant only drafts'].map(t=>`<span class="row" style="gap:10px;flex-wrap:nowrap">${ic('x','s')}${t}</span>`).join('')}</div>
 ${w?`<div class="banner info">${ic('refresh')}<div class="tx"><b>Waiting for ${co}</b><span class="t-label muted">Finish signing in on the ${co} page. This closes by itself.</span></div></div>`:''}`,
 foot:`<span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="mloauthgo" data-kind="${kind}" ${w?'disabled':''}>${kind==='gmail'?GOOGLE:MSFT}Continue to ${co}</button>`};};
const SF={email:'booking@lowtide.dk',name:'Low Tide',imap:'imap.one.com',iport:'993',isec:'SSL/TLS',smtp:'send.one.com',sport:'587',ssec:'STARTTLS',user:'booking@lowtide.dk',pw:''};
L.DR.mailsmtp=()=>{const id=M.smtp.id,a=id&&M.accounts.find(x=>x.id===id),F={...SF,...(a?{}:{email:'',user:'',imap:'',smtp:''}),...M.smtpF},t=M.smtp.test;
 const fld=(k,label,w,help='',type='text',ph='')=>`<div class="field"><label for="ml-s-${k}">${label}</label><input class="input ${['iport','sport'].includes(k)?'mono':''}" id="ml-s-${k}" type="${type}" style="max-width:${w}px" value="${esc(F[k]||'')}" placeholder="${ph}" ${type==='password'?'autocomplete="new-password"':'autocomplete="off"'}>${help?`<span class="help">${help}</span>`:''}</div>`;
 const secSel=(k,label)=>`<div class="field"><label for="ml-s-${k}">${label}</label><select class="input" id="ml-s-${k}" style="width:160px">${['SSL/TLS','STARTTLS','None'].map(o=>`<option ${F[k]===o?'selected':''}>${o}</option>`).join('')}</select></div>`;
 return {type:'drawer',title:a?`Fix ${a.email}`:'Other mail',sub:'SMTP and IMAP, the settings come from your mail provider',
 body:`${WIDE}${a&&a.state==='error'&&t!=='ok'?`<div class="banner danger">${ic('alertc')}<div class="tx"><b>one.com refused the password on 19 Oct</b><span class="t-label">If you changed the password, enter the new one. With two-step sign-in on, use an app password from one.com.</span></div></div>`:''}
 ${fld('email','Email address',400,'','email','you@yourband.dk')}${fld('name','Name people see',320)}
 <div class="ml-srv"><b class="strong">Incoming, IMAP</b><div class="row" style="align-items:flex-start;gap:12px">${fld('imap','Server',280,'','text','imap.example.com')}${fld('iport','Port',96)}${secSel('isec','Security')}</div></div>
 <div class="ml-srv"><b class="strong">Outgoing, SMTP</b><div class="row" style="align-items:flex-start;gap:12px">${fld('smtp','Server',280,'','text','smtp.example.com')}${fld('sport','Port',96)}${secSel('ssec','Security')}</div></div>
 ${fld('user','Username',400,'Usually the full email address')}${fld('pw','Password',320,'Stored encrypted, used only to read and send','password','Password or app password')}
 <div class="row" style="gap:12px"><button class="btn secondary" data-act="mlsmtptest" ${t==='wait'?'disabled':''}>${ic('refresh','s')}${t==='wait'?'Testing…':'Test connection'}</button>
 ${t==='ok'?`<span class="ml-okmsg">${ic('check','s')}Signed in. IMAP found 1.204 messages, SMTP accepted the login and sent nothing.</span>`:t==='err'?`<span class="ml-errmsg inl">${ic('alertc','s')}${esc(M.smtp.msg)}</span>`:''}</div>
 <p class="t-meta muted" style="margin:0">Saving never sends anything.</p>`,
 foot:`<span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="mlsmtpsave">${a?'Save and reconnect':'Save account'}</button>`};};

/* ---------- actions ---------- */
const A=L.ACTIONS,R=()=>L.render();
const goMail=f=>{if(f)M.folder=f;M.q='';L.go('mail');};
A.openthread=el=>{const id=el.dataset.id||'skov';const t=T(id);M.full=false;M.edit=false;M.toEdit=false;L.go('thread',{id:t.id});};
A.mailfolder=el=>{M.folder=el.dataset.f;M.q='';if(M.folder!=='inbox')M.filter='all';if(L.S.view!=='mail')L.go('mail');else R();};
A.mailfilter=el=>{M.filter=el.dataset.f;M.folder='inbox';R();};
A.mailclear=()=>{M.q='';R();};
A.mailarchived=()=>{M.folder=M.folder==='archive'?'inbox':'archive';M.q='';R();};
A.mailread=(el,r,e)=>{e.stopPropagation();const t=T(el.dataset.id);const was=t.unread;t.unread=!was;R();L.toast(was?'Marked read':'Marked unread',()=>{t.unread=was});};
A.mailunread=el=>{const t=T(el.dataset.id);t.unread=true;L.go('mail');L.toast('Marked unread',()=>{t.unread=false});};
A.mailreadall=()=>{const was=M.threads.filter(t=>t.unread).map(t=>t.id);M.threads.forEach(t=>t.unread=false);R();L.toast(`${was.length} threads marked read`,()=>{M.threads.forEach(t=>{if(was.includes(t.id))t.unread=true})});};
A.mailarchive=(el,r,e)=>{e.stopPropagation();const id=el.dataset.id;const t=T(id);const was=M.archived.includes(id);
 M.archived=was?M.archived.filter(x=>x!==id):[...M.archived,id];
 const undo=()=>{M.archived=was?[...M.archived,id]:M.archived.filter(x=>x!==id)};
 if(el.dataset.back)L.go('mail');else R();L.toast(was?`Moved to inbox: ${t.subject}`:`Archived: ${t.subject}`,undo);};
A.mailstar=(el,r,e)=>{e.stopPropagation();const id=el.dataset.id,was=M.starred.includes(id);
 M.starred=was?M.starred.filter(x=>x!==id):[id,...M.starred];R();L.toast(was?'Flag removed':'Flagged',()=>{M.starred=was?[id,...M.starred]:M.starred.filter(x=>x!==id)});};
A.mailtrash=(el,r,e)=>{e.stopPropagation();const id=el.dataset.id,t=T(id);M.trash=[id,...M.trash];
 if(el.dataset.back)L.go('mail');else R();L.toast(`Moved to Trash: ${t.subject}`,()=>{M.trash=M.trash.filter(x=>x!==id)});};
A.mailrestore=(el,r,e)=>{e.stopPropagation();const id=el.dataset.id,t=T(id);M.trash=M.trash.filter(x=>x!==id);const to=folderOf(t);
 if(el.dataset.back)L.go('mail');else R();L.toast(`Restored to ${to==='archive'?'Archive':to==='spam'?'Spam':'Inbox'}: ${t.subject}`,()=>{M.trash=[id,...M.trash]});};
A.mailnotspam=(el,r,e)=>{e.stopPropagation();const id=el.dataset.id,t=T(id);M.spam=M.spam.filter(x=>x!==id);
 if(el.dataset.back)L.go('mail');else R();L.toast(`Moved to Inbox: ${t.subject}. Mail from ${t.email} won’t go to Spam again`,()=>{M.spam=[id,...M.spam]});};
const hardDelete=ids=>{M.threads=M.threads.filter(t=>!ids.includes(t.id));M.trash=M.trash.filter(x=>!ids.includes(x));M.spam=M.spam.filter(x=>!ids.includes(x));M.starred=M.starred.filter(x=>!ids.includes(x));M.archived=M.archived.filter(x=>!ids.includes(x));};
A.maildelete=(el,r,e)=>{e.stopPropagation();const id=el.dataset.id,t=T(id);M.pendingDel=[id];
 L.S.overlay={type:'modal',html:L.confirmM('Delete this thread for good?',`“${esc(t.subject)}” is removed from LAAS and from your mailbox. This can’t be undone.`,'Keep it','maildeleteok','Delete for good',1)};R();};
A.mailemptyf=el=>{const f=el.dataset.f,ids=list(f).map(t=>t.id);M.pendingDel=ids;
 L.S.overlay={type:'modal',html:L.confirmM(f==='trash'?'Empty Trash?':'Delete all spam?',`${ids.length} thread${ids.length===1?' is':'s are'} removed from LAAS and from your mailbox. This can’t be undone.`,'Keep them','maildeleteok',f==='trash'?'Empty Trash':'Delete all spam',1)};R();};
A.maildeleteok=()=>{const ids=M.pendingDel||[];const back=L.S.view==='thread';hardDelete(ids);M.pendingDel=null;L.S.overlay=null;if(back)L.go('mail');else R();L.toast(`${ids.length} thread${ids.length===1?'':'s'} deleted for good`);};
A.maillink=(el,r,e)=>{e.stopPropagation();const t=T(el.dataset.id);if(!t.panel)return;const a=t.panel.act;L.go(a[1],a[2]);};
A.mailfull=()=>{M.full=!M.full;R();};
A.mailedit=()=>{M.edit=!M.edit;R();if(!M.edit)L.toast('Text saved for this reply');};
A.mailto=()=>{M.toEdit=!M.toEdit;R();};
const replyDraft=t=>{const did='r'+t.id;let d=M.drafts.find(x=>x.id===did);if(d)return d;const [ct,bk]=TLINK[t.id]||[null,null];
 const cc=t.id==='royal'?[{name:'Accounts',email:'faktura@hotelroyal.dk'}]:[];
 return {id:did,thread:t.id,from:'gmail',to:[{name:t.from,email:t.email}],cc,bcc:[],showCc:!!cc.length,showBcc:false,subj:t.draft.subj,body:M.msgVal[t.id]||t.draft.body,contact:ct,booking:bk,att:[],time:'Just now',fresh:true,auto:true};};
A.mailnotnow=()=>{const t=T(L.S.params.id);const d=replyDraft(t);if(d.fresh){d.fresh=false;M.drafts.unshift(d);}
 L.go('mail');L.toast('Reply saved in Drafts',()=>{M.drafts=M.drafts.filter(x=>x!==d)});};
A.mailreplyfull=el=>{const t=T(el.dataset.id);M.cmp=replyDraft(t);M.cmpQ={};M.cmpErr=null;L.go('compose');};
A.mailsend=el=>{const id=el.dataset.id,t=T(id);const nt=t.needs;M.sent[id]='just now';t.needs=false;M.edit=false;M.toEdit=false;
 t.msgs.push({me:true,time:'Just now',body:M.msgVal[id]||t.draft.body,sentNow:true});R();
 L.toast(`Reply sent to ${t.from}`,()=>{delete M.sent[id];t.needs=nt;t.msgs=t.msgs.filter(m=>!m.sentNow)});};
A.mailunsend=el=>{const id=el.dataset.id,t=T(id);delete M.sent[id];t.needs=(THREADS.find(x=>x.id===id)||{}).needs||false;t.msgs=t.msgs.filter(m=>!m.sentNow);R();L.toast('Reply taken back, it was not delivered');};
A.maillinkchange=()=>L.open('menu',{x:Math.max(8,innerWidth-300),y:200,items:[['Link to another booking','maillinkpick'],['Link to a venue only','maillinkpick'],['Unlink this thread','maillinkpick',1]]});
A.maillinkpick=()=>{L.close();L.toast('Link changed. The assistant learns from it',()=>{});};
A.mailmenu=(el,r)=>L.open('menu',{x:Math.max(8,Math.min(r.right-260,innerWidth-276)),y:r.bottom+6,items:[['Sync now','mailsync'],['Mail accounts','mailsettings'],['Disconnect Gmail','maildisconnect',1]]});
A.mailsync=()=>{L.close();L.toast('Synced. No new threads');};
A.mailsettings=()=>{L.close();L.go('mailaccounts');};
A.maildisconnect=()=>{L.S.overlay={type:'modal',html:L.confirmM('Disconnect Gmail?','LAAS stops reading new mail. Threads already linked stay on their bookings. Nothing in Gmail changes.','Keep connected','maildisconnectok','Disconnect',1)};R();};
A.maildisconnectok=()=>{const g=M.accounts.find(a=>a.id==='gmail');const prev=g&&g.state;if(g)g.state='off';syncConnected();L.S.overlay=null;R();L.toast('Gmail disconnected',()=>{if(g)g.state=prev;syncConnected();});};
A.mailconnect=el=>{const g=M.accounts.find(a=>a.id==='gmail');if(g)g.state='ok';else M.accounts.unshift({...ACCOUNTS[0]});M.connected=true;R();L.toast(`${el.dataset.svc} connected. 6 threads linked`);};

/* compose */
A.mailnew=()=>{M.cmp=blank();M.cmpQ={};M.cmpErr=null;L.go('compose');};
A.maildraft=el=>{const d=M.drafts.find(x=>x.id===el.dataset.id);if(!d)return;M.cmp=d;M.cmpQ={};M.cmpErr=null;L.go('compose');};
A.maildraftdel=(el,r,e)=>{e.stopPropagation();const i=M.drafts.findIndex(x=>x.id===el.dataset.id);if(i<0)return;const d=M.drafts[i];M.drafts.splice(i,1);R();L.toast('Draft discarded',()=>{M.drafts.splice(i,0,d)});};
A.mlback=()=>{const c=M.cmp;if(c&&c.thread)L.go('thread',{id:c.thread});else goMail(c&&!c.fresh?'drafts':null);};
const autoLink=(c,r)=>{if(c.contact||!r.contact)return;c.contact=r.contact;c.auto=true;const ct=L.CONTACTS.find(x=>x.id===r.contact);
 if(!c.booking&&ct&&ct.venue){const b=L.BOOKINGS.find(b=>b.venue===ct.venue&&b.tab!=='past');if(b)c.booking=b.id;}};
const addRecip=(k,r)=>{const c=M.cmp;if(c[k].some(x=>x.email===r.email))return;c[k].push({name:r.name,email:r.email});if(k==='to')autoLink(c,r);M.cmpQ[k]='';if(M.cmpErr==='to'&&k==='to')M.cmpErr=null;R();touched();const inp=document.getElementById('ml-'+k);if(inp)inp.focus();};
A.mladd=el=>{const r=RECIPS.find(x=>x.email===el.dataset.e);if(r)addRecip(el.dataset.k,r);};
A.mladdq=el=>{const k=el.dataset.k,q=(M.cmpQ[k]||'').trim().replace(/,$/,'');if(q.includes('@'))addRecip(k,{name:'',email:q});};
A.mlrm=el=>{const k=el.dataset.k,i=+el.dataset.i,c=M.cmp,r=c[k][i];c[k].splice(i,1);R();touched();L.toast(`Removed ${r.name||r.email}`,()=>{c[k].splice(i,0,r)});};
A.mlshow=el=>{const c=M.cmp;c[el.dataset.k==='cc'?'showCc':'showBcc']=true;R();const i=document.getElementById('ml-'+el.dataset.k);if(i)i.focus();};
A.mlattrm=el=>{const c=M.cmp,i=+el.dataset.i,a=c.att[i];c.att.splice(i,1);R();touched();L.toast(`Removed ${a.name}`,()=>{c.att.splice(i,0,a)});};
A.mlattadd=el=>{const c=M.cmp,n=el.dataset.n;c.att.push({name:n,size:n.endsWith('.jpg')?'2,4 MB':['148 KB','182 KB','96 KB','64 KB'][c.att.length%4]});R();touched();};
A.mlwrite=()=>{const c=M.cmp,prev={b:c.body,s:c.subj};const r=c.to[0],first=r&&r.name&&!/team|accounts/i.test(r.name)?r.name.split(/[ ,]/)[0]:'';const b=L.BOOKINGS.find(x=>x.id===c.booking);
 const hi=first?`Hej ${first}`:'Hej';
 if(c.body.trim())c.body=c.body.replace(/\s+/g,' ').trim().split('. ').slice(0,2).join('. ').replace(/\.?$/,'.')+' Venlig hilsen, Vital, Low Tide';
 else c.body=b?`${hi}, about ${b.title.toLowerCase()} on ${b.when}: can you confirm the load-in time and where we can park? Venlig hilsen, Vital, Low Tide`
  :`${hi}, we are planning the spring and would love to play for you again. Do you have a Saturday in March or April? Venlig hilsen, Vital, Low Tide`;
 if(!c.subj)c.subj=b?`${b.title}, ${b.when.split(' ').slice(0,3).join(' ')}`:'Low Tide, spring dates';
 R();touched();L.toast('Drafted by the assistant. Read it before you send',()=>{c.body=prev.b;c.subj=prev.s});};
A.mlsavedraft=()=>{const c=M.cmp;if(c.fresh&&!c.to.length&&!c.subj&&!c.body){goMail();L.toast('Nothing to save, the mail was empty');return;}
 if(c.fresh){c.fresh=false;M.drafts.unshift(c);}c.time='Just now';const back=c.thread;M.cmp=null;
 if(back)L.go('thread',{id:back});else goMail('drafts');L.toast('Saved in Drafts. Saving never sends anything');};
A.mldiscard=()=>{const c=M.cmp,i=M.drafts.indexOf(c);if(i>=0)M.drafts.splice(i,1);M.cmp=null;
 if(c.thread)L.go('thread',{id:c.thread});else goMail();L.toast('Draft discarded',i>=0?()=>{M.drafts.splice(i,0,c)}:null);};
const doSend=()=>{const c=M.cmp;L.S.overlay=null;const i=M.drafts.indexOf(c);if(i>=0)M.drafts.splice(i,1);M.cmp=null;
 const acc=M.accounts.find(a=>a.id===c.from)||okAccs()[0];const names=c.to.map(r=>r.name||r.email);
 const msg={me:true,time:'Just now',body:c.body||'',att:[...c.att],fromEmail:acc&&acc.email,sentNow:true};
 let undo;
 if(c.thread){const t=T(c.thread),nt=t.needs;t.msgs.push(msg);t.needs=false;M.sent[t.id]='just now';
  undo=()=>{t.msgs=t.msgs.filter(m=>m!==msg);t.needs=nt;delete M.sent[t.id];if(i>=0)M.drafts.splice(i,0,c);};
  L.go('thread',{id:t.id});}
 else{const b=L.BOOKINGS.find(x=>x.id===c.booking),v=b&&b.venue&&L.V(b.venue),r=c.to[0];
  const t={id:'s'+Date.now(),from:r.name||r.email,org:'',email:r.email,ini:initials(r.name||r.email),subject:c.subj||'No subject',excerpt:c.body,time:'Just now',unread:false,needs:false,
   link:b?{label:b.title,img:v?v.img:'posten',booking:true}:null,msgs:[msg],
   panel:b?{img:v?v.img:'posten',tag:L.STATUS[b.status]||['draft','Draft'],kicker:b.when,title:b.title,facts:v?`${v.name}, ${v.city}`:'No venue yet',act:['Open booking','booking',{id:b.id}],links:[]}:null};
  M.threads.unshift(t);undo=()=>{M.threads=M.threads.filter(x=>x!==t);if(i>=0)M.drafts.splice(i,0,c);};
  goMail('sent');}
 L.toast(`Sent to ${names.join(', ')}`,undo);};
A.mlsend=()=>{const c=M.cmp;['to','cc','bcc'].forEach(k=>{const q=(M.cmpQ[k]||'').trim();if(q.includes('@')){c[k].push({name:'',email:q});M.cmpQ[k]='';}});
 if(!c.to.length){M.cmpErr='to';R();const i=document.getElementById('ml-to');if(i)i.focus();return;}
 if(!c.subj.trim()){L.S.overlay={type:'modal',html:L.confirmM('Send without a subject?','Venues sort mail by subject. A subject like “Rider for 28 Nov” helps it get read.','Add a subject','mlsendok','Send anyway')};R();return;}
 doSend();};
A.mlsendok=()=>doSend();

/* mail accounts */
const accSaved=()=>flashSaved('ml-asave','Saved');
A.mltg=el=>{const k=el.dataset.k;M.tg[k]=!M.tg[k];el.classList.toggle('on',M.tg[k]);el.setAttribute('aria-checked',M.tg[k]);accSaved();};
A.mloauth=el=>{M.oauth={kind:el.dataset.kind,wait:false};L.S.overlay=L.DR.mailoauth(el.dataset.kind);R();};
A.mloauthgo=el=>{const kind=el.dataset.kind,inp=document.getElementById('ml-oe'),email=(inp&&inp.value.trim())||'tour@lowtide.dk';
 M.oauth={kind,wait:true,email};L.S.overlay=L.DR.mailoauth(kind);R();
 setTimeout(()=>{const ex=M.accounts.find(a=>a.email===email);let added=null;
  if(ex){ex.state='ok';ex.kind=kind;}else{added={id:'a'+Date.now(),kind,email,state:'ok',meta:'Reads and sends, synced just now, 38 threads'};M.accounts.push(added);}
  M.oauth={kind,wait:false};syncConnected();L.S.overlay=null;R();
  L.toast(`${KIND[kind]} connected, ${email}. 3 threads linked`,()=>{if(added)M.accounts=M.accounts.filter(a=>a!==added);else ex.state='off';syncConnected();});},1200);};
A.mlsmtp=()=>{M.smtp={id:null,test:'idle'};M.smtpF={};L.S.overlay=L.DR.mailsmtp();R();};
A.mlfix=el=>{const id=el.dataset.id||M.menuAcc;M.smtp={id,test:'idle'};M.smtpF={};L.S.overlay=L.DR.mailsmtp();R();};
const smtpVal=k=>{const id=M.smtp.id,a=id&&M.accounts.find(x=>x.id===id);return M.smtpF[k]!==undefined?M.smtpF[k]:a||['name','iport','isec','sport','ssec'].includes(k)?SF[k]:'';};
const smtpCheck=()=>{if(!smtpVal('email').includes('@'))return 'Enter the email address first.';if(!smtpVal('imap')||!smtpVal('smtp'))return 'Enter both servers. Your provider lists them under mail settings.';
 if(!smtpVal('pw'))return 'Enter the password. With two-step sign-in on, use an app password.';return '';};
A.mlsmtptest=()=>{const e=smtpCheck();if(e){M.smtp={...M.smtp,test:'err',msg:e};L.S.overlay=L.DR.mailsmtp();R();return;}
 M.smtp={...M.smtp,test:'wait'};L.S.overlay=L.DR.mailsmtp();R();
 setTimeout(()=>{if(!L.S.overlay||L.S.overlay.title===undefined)return;M.smtp={...M.smtp,test:'ok'};L.S.overlay=L.DR.mailsmtp();R();},900);};
A.mlsmtpsave=()=>{const e=smtpCheck();if(e){M.smtp={...M.smtp,test:'err',msg:e};L.S.overlay=L.DR.mailsmtp();R();return;}
 const id=M.smtp.id,a=id&&M.accounts.find(x=>x.id===id),email=smtpVal('email');let undo;
 if(a){const prev={...a};Object.assign(a,{email,state:'ok',meta:`IMAP ${smtpVal('imap')}, SMTP ${smtpVal('smtp')}, synced just now`});undo=()=>Object.assign(a,prev);}
 else{const n={id:'a'+Date.now(),kind:'smtp',email,state:'ok',meta:`IMAP ${smtpVal('imap')}, SMTP ${smtpVal('smtp')}, synced just now`};M.accounts.push(n);undo=()=>{M.accounts=M.accounts.filter(x=>x!==n);syncConnected();};}
 M.smtpF={};syncConnected();L.S.overlay=null;R();L.toast(`${email} ${a?'reconnected':'connected'}. Saving never sends anything`,undo);};
A.mlaccmenu=(el,r)=>{const a=M.accounts.find(x=>x.id===el.dataset.id);M.menuAcc=a.id;
 L.open('menu',{x:Math.max(8,Math.min(r.right-260,innerWidth-276)),y:r.bottom+6,items:[['Sync now','mlaccsync'],...(a.kind==='smtp'?[['Edit server settings','mlfix']]:[]),['Use for new mail','mlaccdef'],[`Disconnect ${a.email}`,'mlaccdisc',1]]});};
A.mlaccsync=()=>{L.close();const a=M.accounts.find(x=>x.id===M.menuAcc);L.toast(a.state==='error'?`Couldn’t sync ${a.email}: sign-in failed. Fix the password first`:`Synced ${a.email}. No new threads`);};
A.mlaccdef=()=>{L.close();const a=M.accounts.find(x=>x.id===M.menuAcc);if(a.state==='error'){L.toast(`${a.email} can’t send until the sign-in is fixed`);return;}
 const i=M.accounts.indexOf(a);M.accounts.splice(i,1);M.accounts.unshift(a);R();L.toast(`New mail now goes from ${a.email}`,()=>{M.accounts.splice(0,1);M.accounts.splice(i,0,a);});};
A.mlaccdisc=()=>{const a=M.accounts.find(x=>x.id===M.menuAcc);L.S.overlay={type:'modal',html:L.confirmM(`Disconnect ${esc(a.email)}?`,'LAAS stops reading and sending from this address. Threads already linked stay on their bookings. Nothing in the mailbox changes.','Keep connected','mlaccdiscok','Disconnect',1)};R();};
A.mlaccdiscok=()=>{const a=M.accounts.find(x=>x.id===M.menuAcc),prev=a.state;a.state='off';syncConnected();L.S.overlay=null;R();L.toast(`${a.email} disconnected`,()=>{a.state=prev;syncConnected();});};

L.INPUT.push(t=>{if(t.id==='mlsearch'){M.q=t.value;R();return true;}if(t.id==='mltoedit'){M.toVal[L.S.params.id||'skov']=t.value;return true;}if(t.id==='mlmsgedit'){M.msgVal[L.S.params.id||'skov']=t.value;return true;}
 if(t.id==='ml-to'||t.id==='ml-cc'||t.id==='ml-bcc'){const k=t.id.slice(3);M.cmpQ[k]=t.value;R();return true;}
 if(t.id==='ml-subj'&&M.cmp){M.cmp.subj=t.value;touched();return true;}
 if(t.id==='ml-body'&&M.cmp){M.cmp.body=t.value;touched();return true;}
 if(t.id&&t.id.startsWith('ml-s-')){M.smtpF[t.id.slice(5)]=t.value;if(M.smtp.test!=='idle'&&M.smtp.test!=='wait'){M.smtp.test='idle';}return true;}
 if(t.id==='ml-sig'){M.sig=t.value;accSaved();return true;}
 if(t.dataset&&t.dataset.mlsave!==undefined)return true;});
L.CHANGE.push(t=>{const c=M.cmp;
 if(t.id==='ml-from'&&c){c.from=t.value;touched();return true;}
 if(t.id==='ml-contact'&&c){c.contact=t.value||null;c.auto=false;R();touched();return true;}
 if(t.id==='ml-booking'&&c){c.booking=t.value||null;c.auto=false;R();touched();return true;}
 if(t.id&&t.id.startsWith('ml-s-')){M.smtpF[t.id.slice(5)]=t.value;return true;}
 if(t.dataset&&t.dataset.mlatt!==undefined&&t.files&&c){[...t.files].forEach(f=>c.att.push({name:f.name,size:f.size>1048576?(f.size/1048576).toFixed(1).replace('.',',')+' MB':Math.max(1,Math.round(f.size/1024))+' KB'}));R();touched();return true;}
 if(t.dataset&&t.dataset.mlsave!==undefined){accSaved();return true;}});
document.addEventListener('keydown',e=>{const t=e.target;
 if(e.key==='Enter'&&t.classList&&t.classList.contains('ml-row'))t.click();
 if(t.id==='ml-to'||t.id==='ml-cc'||t.id==='ml-bcc'){const k=t.id.slice(3),q=t.value.trim().replace(/,$/,'');
  if((e.key==='Enter'||e.key===',')&&q){e.preventDefault();const qq=q.toLowerCase();const m=RECIPS.find(r=>(r.name+' '+r.org+' '+r.email).toLowerCase().includes(qq)&&!M.cmp[k].some(x=>x.email===r.email));
   if(m)addRecip(k,m);else if(q.includes('@'))addRecip(k,{name:'',email:q});}
  else if(e.key==='Backspace'&&!t.value&&M.cmp[k].length){M.cmp[k].pop();R();touched();}}});
})();
