/* LAAS prototype · booking area. Rebuilt 1:1 from the Figma section "UX · Bookings" (page "Build · LAAS v1.0").
   Views: booking (every lifecycle state), paypage (what the venue sees), gigday (timeline). Uses window.LAAS (see index.html). */
(function(){
"use strict";
const L=window.LAAS;const {S,ic,IMG,esc}=L;

/* ---------- icons (lucide.dev) ---------- */
Object.assign(L.P,{
 sparkles:'<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4M22 5h-4M4 17v2M5 18H3"/>',
 arrowUpRight:'<path d="M7 7h10v10M7 17 17 7"/>',
 loader:'<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
 lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
 fileText:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/>',
 messageSquare:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
 circleCheck:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
 circleDashed:'<path d="M10.1 2.182a10 10 0 0 1 3.8 0M13.9 21.818a10 10 0 0 1-3.8 0M17.609 3.721a10 10 0 0 1 2.69 2.7M2.182 13.9a10 10 0 0 1 0-3.8M20.279 17.609a10 10 0 0 1-2.7 2.69M21.818 10.1a10 10 0 0 1 0 3.8M3.721 6.391a10 10 0 0 1 2.7-2.69M6.391 20.279a10 10 0 0 1-2.69-2.7"/>',
});

/* ---------- state ---------- */
S.bdd??={bannerOff:{},invoiceSent:false,refunded:false,actOpen:{},venuePaid:false,mealOk:false,gigBanner:true,dayChecked:{},
 check:{
  enquiry:{},hold:{},
  offer:{'Offer sent':true,'Venue opened it':true,'Signed':false,'Deposit paid':false,'Members confirmed':true},
  paid:{'Agreement signed':true,'Deposit received':true,'Rider sent to venue':false,'Invoice for balance sent':false,'Set list shared with band':false},
  completed:{'Settle and record payouts':false,'Thank the venue, ask for a photo':false,'Add to the live history':true},
  cancelled:{'Refund the deposit':false,'Send the credit note':false,'Offer a new date':false,'Tell the band':true}}};
S.bdd.check.overdue??={'Agreement signed':true,'Deposit received':false,'Rider sent to venue':false,'Balance invoice sent, 18 Oct':false,'Day sheet to the band':false};
S.rating.tags=S.rating.tags||[];

const VEN=L.V('royal');
/* key of the Figma screen this booking state shows */
const keyOf=()=>{const b=S.booking;if(b.cancelled)return 'cancelled';if(b.state==='confirmed')return b.depositPaid?'paid':'overdue';return b.state;};

/* ---------- small parts (Figma components: Section 298:5025, Banner 299:5129, Status chip 301:5098, rows 299:5064 / 299:5019) ---------- */
const act=(icon,label,a,extra='')=>`<button class="btn ghost s bd-act" data-act="${a}" ${extra}>${ic(icon,'s')}${label}</button>`;
const goAct=(icon,label,view,extra='')=>`<button class="btn ghost s bd-act" data-go="${view}" ${extra}>${ic(icon,'s')}${label}</button>`;
/* section: head (title + action), body (kind sets the gap: kv 12, money 4, list 0, flat 12 without side padding) */
const sec=(title,action,body,foot,kind='kv')=>`<section class="bd-sec"><div class="bd-sh"><h2 class="t-title">${title}</h2>${action||''}</div><div class="bd-body ${kind}">${body}${foot?`<p class="bd-foot">${foot}</p>`:''}</div></section>`;
/* key-value: one row per pair (Figma "Row": label 140, gap 16, pad 0 12), the list stacks rows 12 apart */
const kv=rows=>`<dl class="bd-kv">${rows.map(([l,v])=>`<div><dt>${l}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
const money=rows=>rows.map(([l,n,tag,amt])=>`<div class="bd-mrow"><span class="tx">${n?`<span>${l}</span><small>${n}</small>`:l}</span><span class="st">${tag?`<span class="tag ${tag[0]}">${tag[1]}</span>`:''}</span><span class="amt mono">${amt}</span></div>`).join('');
const av=(ini,cls='')=>`<span class="bd-av ${cls}">${ini}</span>`;
const people=rows=>`<div class="bd-rows">${rows.map(([ini,n,note,right,cls])=>`<div class="bd-prow">${ini?av(ini,cls):''}<span class="tx"><span>${n}</span><small>${note}</small></span>${right||''}</div>`).join('')}</div>`;
const BICON={info:'ai',attention:'alert',success:'check'};
const banner=(kind,icon,title,body,btn,id)=>id&&S.bdd.bannerOff[id]?'':`<div class="bd-banner ${kind}">${ic(BICON[kind]||icon)}<div class="tx"><b>${title}</b><span>${body}</span></div>${btn||''}${id?`<button class="bd-x" data-act="bdbannerx" data-id="${id}" aria-label="Dismiss">${ic('x','s')}</button>`:''}</div>`;
/* status chip: dot, label, chevron opens the status menu; plain = the Tag the Confirmed detail screens use */
const pill=(cls,label,menu=true,dot=menu)=>menu?`<button class="bd-pill ${cls}" data-act="statusmenu2" title="Change status">${dot?'<i></i>':''}${label}${ic('down','s')}</button>`:`<span class="tag ${cls} bd-pill plain ${dot?'dot':''}">${dot?'<i></i>':''}${label}</span>`;
const checklist=(k,list)=>`<div class="bd-check">${Object.entries(list).map(([t,on])=>`<label><input type="checkbox" ${on?'checked':''} data-bdcheck="${esc(k)}|${esc(t)}"><span class="bx">${ic('check','s')}</span><span>${t}</span></label>`).join('')}</div>`;
const ACTS={
 enquiry:[['6 Oct','Mail from Mette Kjær read by the assistant'],['6 Oct','Booking created as Enquiry'],['6 Oct','Reply drafted for you to check']],
 hold:[['8 Oct','Jonas reminded in the band app'],['6 Oct','Date held until Fri 10 Oct'],['6 Oct','Band asked who can play'],['6 Oct','Enquiry from Mette by email']],
 offer:[['8 Oct','Offer opened by Mette Kjær, 09:14'],['7 Oct','Offer sent by Vital'],['6 Oct','Date held, 2 of 3 said yes'],['6 Oct','Enquiry from Mette by email']],
 overdue:[['16 Oct','Invoice 2026-031 opened again by the venue'],['15 Oct','Reminder 3 days after the due date sent'],['12 Oct','Reminder on the due date sent'],['9 Oct','Agreement signed by Mette Kjær'],['5 Oct','Deposit invoice 2026-031 sent']],
 paid:[['3 Oct','Deposit 1.500 DKK received'],['28 Sep','Deposit invoice 2026-031 sent'],['21 Sep','Booking confirmed by venue'],['14 Sep','Created from an email thread by the assistant']],
 completed:[['27 Oct','Balance 3.500 DKK received'],['26 Oct','Travel receipt added by Jonas'],['25 Oct','Gig played'],['16 Oct','Deposit 1.500 DKK received']],
 cancelled:[['14 Oct','Cancelled by Mette Kjær by email'],['14 Oct','Band told, 3 of 3 seen'],['14 Oct','Date freed in the calendar']],
};
const activity=k=>{const ev=ACTS[k];const open=S.bdd.actOpen[k]??(k==='paid');
 return `<div class="bd-pgroup bd-actg ${open?'open':''}"><button class="bd-acth bd-sh" data-act="bdact" data-k="${k}" aria-expanded="${open}"><h2 class="t-title">Activity, ${ev.length} events</h2><span class="bd-chev" aria-hidden="true">${ic(open?'down':'right','s')}</span></button>${open?`<div class="bd-acts">${ev.map(([d,t])=>`<div><span class="d">${d}</span><span>${t}</span></div>`).join('')}</div>`:''}</div>`;};
const panel=(k,top)=>`<aside class="bd-panel">${top||`<div class="bd-pgroup"><div class="bd-sh"><h2 class="t-title">Next up</h2></div>${checklist(k,S.bdd.check[k])}</div>`}${activity(k)}</aside>`;

function bdAbar(ph){
 return L.abar('Saturday hotel gig',ph)
  
  ;
}
/* each kind of page opens differently (Vit 21 Oct: venue and booking had the same photo hero and mental model):
   a venue is a place (photo hero), a booking is an event in time (date tile, venue chip, progress), the gig day is today */
const evHead=({tile,kicker,title,facts,today})=>`<header class="ev-head">
 <div class="ev-date ${today?'today':''}" aria-hidden="true">${tile}</div>
 <div class="ev-tx"><span class="ev-k">${kicker}</span><h1 class="t-display">${title}</h1>
  <div class="ev-meta"><button class="ev-venue" data-go="venue" data-id="royal"><img src="${IMG(VEN.img)}" alt="">Hotel Royal, Aarhus</button>${facts.map(f=>`<span class="tag">${f}</span>`).join('')}</div></div></header>`;
const BK_STEPS=['Enquiry','Hold','Offer','Confirmed','Played','Settled'];
const bkProg=k=>{if(k==='cancelled')return `<ol class="bk-prog cancelled" aria-label="Booking progress">${BK_STEPS.map((t,i)=>`<li class="${i<4?'done':'off'}"><i></i><span>${i===3?'Cancelled 14 Oct':t}</span></li>`).join('')}</ol>`;
 const cur={enquiry:0,hold:1,offer:2,overdue:3,paid:4,completed:S.booking.settled?6:5}[k]??0;
 return `<ol class="bk-prog" aria-label="Booking progress">${BK_STEPS.map((t,i)=>`<li class="${i<cur?'done':i===cur?(k==='overdue'?'att':'now'):'todo'}" ${i===cur?'aria-current="step"':''}><i></i><span>${t}${i===cur&&k==='overdue'?', deposit late':''}${i===cur&&k==='paid'?', 25 Oct':''}</span></li>`).join('')}</ol>`;};

/* ---------- booking states ---------- */
const hb=(cls,icon,label,a)=>`<button class="btn ${cls}" data-act="${a}">${icon?ic(icon):''}${label}</button>`;
const tones=()=>`<div class="bd-tones">${['Friendlier','Shorter','In Danish'].map(t=>`<button class="btn secondary s" data-act="bdtone" data-t="${t}">${t}</button>`).join('')}</div>`;
const STATES={
 enquiry:()=>({
  pill:pill('enquiry','Enquiry'),
  btns:hb('secondary','','Hold a date','hold')+hb('accent','mail','Reply','reply'),
  banner:banner('info','ai','The assistant read the email and filled this in. Check it.','From Mette Kjær’s mail of 6 Oct. The fee and set length are guesses, marked “check this”.','<button class="btn secondary s" data-go="mail">Open the email</button>','enq'),
  main:sec('What they asked for',act('pencil','Edit','bdedit'),kv([['From','Mette Kjær, booking@hotelroyal.dk'],['Where','Hotel Royal, hotel bar, Aarhus'],['When','Fri 24 or Sat 25 Oct, 2 × 45 min, from 21:00'],['Budget','"around 5.000", check this'],['Audience','Hotel guests and walk-ins, about 80']]))
   +sec('Draft reply',act('pencil','Edit','bdedit'),`<p class="bd-prose">${S.bdd.replyTone||'Hi Mette, thanks for asking. Sat 25 Oct works for us; Fri 24 we are already booked. For 2 × 45 min in the bar our fee is 5.000 DKK plus travel from Odense. If that suits, I will hold the date for you until Friday and send an offer you can sign online.'}</p>${tones()}`,'Nothing is sent until you press Reply.','flat'),
  panel:panel('enquiry',`<div class="bd-pgroup"><div class="bd-sh"><h2 class="t-title">History with Hotel Royal</h2>${goAct('arrowUpRight','Open venue','venue','data-id="royal"')}</div>${people([['HR','Spring hotel gig','Apr 2025, 4.000 DKK, paid 12 days after','<span class="tag paid">Paid</span>','obj'],['HR','Summer party enquiry','Jun 2024, no reply from us','<span class="tag draft">Draft</span>','obj']])}</div>`),
  ph:'Ask about this enquiry — reply, hold 25 Oct, what did we charge them last time'}),
 hold:()=>({
  pill:pill('attention','Hold'),
  btns:hb('secondary','','Release hold','release')+hb('accent','send','Send offer','sendoffer'),
  banner:banner('attention','alert',S.bdd.extended?'Held until Fri 17 Oct, 18:00, 11 days left':'Held until Fri 10 Oct, 18:00, 4 days left','2 of 3 members said yes, Jonas has not answered. The date frees itself unless an offer goes out.',`<button class="btn secondary s" data-act="bdextend">${S.bdd.extended?'Undo extend':'Extend hold'}</button>`),
  main:sec('Who can play on 25 Oct?',act('send','Ask again','bdaskband'),people([['MR','Mette Ravn','vocals, guitar, answered 6 Oct','<span class="tag confirmed">Confirmed</span>'],['SL','Sofie Lund','synth, answered 6 Oct','<span class="tag confirmed">Confirmed</span>'],['JH','Jonas Holm',S.bdd.askedBand?'drums, asked 6 Oct, reminded today':'drums, asked 6 Oct, reminded 8 Oct','<span class="tag attention">Attention</span>']]),'','list')
   +sec('Draft offer',act('pencil','Edit','bdedit'),kv([['Fee','Not set, venue mentioned "around 5.000"'],['Deposit','30 % on signing, balance on the gig date'],['Travel','Included up to 100 km, from Odense'],['Expiry','Same as the hold, Fri 10 Oct, 18:00'],['Cancellation','House terms, deposit kept inside 14 days']]),'Signing moves this booking to Confirmed.'),
  panel:panel('hold',`<div class="bd-pgroup"><div class="bd-sh"><h2 class="t-title">Details</h2>${act('pencil','Edit','bdedit')}</div><dl class="bd-stack rows"><div><dt>Venue</dt><dd>Hotel Royal, Aarhus</dd></div><div><dt>Contact</dt><dd>Mette Kjær</dd></div><div><dt>Asked for</dt><dd>Fri 24 or Sat 25 Oct, hotel bar, 2 × 45 min</dd></div></dl></div>`),
  ph:'Ask about this hold — extend it, chase Jonas, draft the offer at 5.000'}),
 offer:()=>({
  pill:pill('offer','Offer out'),
  btns:hb('secondary','copy','Copy link','copy')+hb('accent','send','Resend','bdresend'),
  banner:banner('info','ai','Opened by Mette Kjær 8 Oct, not signed yet','Expires with the hold on Fri 10 Oct, 18:00. Signing moves this booking to Confirmed.','<button class="btn secondary s" data-act="nudge">Send a nudge</button>'),
  main:sec('Offer sent 7 Oct',goAct('arrowUpRight','View as venue','paypage'),kv([['Set','2 × 45 min, from 21:00, hotel bar'],['Fee','5.000 DKK, plus travel 640 DKK'],['Deposit','1.500 DKK on signing, MobilePay or bank'],['Balance','3.500 DKK on 25 Oct, invoice sent 7 days before'],['Cancellation','Free until 11 Oct, deposit kept after'],['Signed by','Nobody yet']]),'Changing anything sends a new link; the old one stops working.'),
  panel:panel('offer'),
  ph:'Ask about this offer — nudge Mette, extend the expiry, change the deposit'}),
 overdue:()=>({
  pill:pill('confirmed','Confirmed'),
  btns:hb('secondary','money','Record a payment','record'),
  /* one banner that moves with the state (Vit 21 Oct: "so much cognitive noise"): late, then late and reminded */
  banner:S.sentReminder?banner('attention','alert','Deposit 1.500 DKK is 6 days late, reminder sent today','Accounts and Mette got it. If nothing comes in, a reminder with a 100 DKK fee is allowed from 22 Oct.','<button class="btn ghost s" data-act="bdrules">Why these rules?</button>')
   :banner('attention','alert','Deposit 1.500 DKK is 6 days late','The venue opened the invoice twice. A free reminder is ready below; nothing is sent until you confirm.','<button class="btn ghost s" data-act="bdrules">Why these rules?</button>'),
  before:S.sentReminder?'':L.sendPreview('reminder'),
  main:sec('Money',goAct('arrowUpRight','Open in Ledger','money'),money([['Fee agreed in the offer','signed 9 Oct',['confirmed','Confirmed'],'5.000'],['Deposit, invoice 2026-031','due 12 Oct, opened 2×',['attention','Attention'],'1.500'],['Balance, invoice 2026-032','draft, sends 18 Oct',['draft','Draft'],'3.500'],['Travel, 2 cars from Odense','estimate','','-640']]),'Paid by the pay page, bank transfer or MobilePay, straight into the band account. <button class="link" data-go="paypage">Open the pay page</button>'),
  panel:panel('overdue'),
  ph:'Ask about this booking — who else can I send the invoice to, split the deposit, what happens if they never pay'}),
 paid:()=>{const ed=!!S.params.edit;const sent=S.bdd.invoiceSent;
  const det=[['Venue','Hotel Royal, Store Torv 4, 8000 Aarhus'],['Contact','Mette Kjær, booking@hotelroyal.dk, +45 86 12 00 00'],['Schedule','Load-in 17:00, soundcheck 18:30, doors 20:00, on stage 21:30, curfew 23:30'],['Line-up','Low Tide (headline), 75 min set'],['Backline','Venue provides drums and bass amp. We bring guitar amps and pedals.'],['Notes','Hotel bar guests, keep the first three songs mellow. Two rooms booked for the band.']];
  const sizes=['l','m','l','m','l','l'];
  return {
  pill:pill('confirmed','Confirmed',false),
  btns:`<span class="bd-save" id="bdsave" aria-live="polite"></span>${hb('secondary','','Edit','edit')}${sent?hb('accent','fileText','Open day sheet','day'):hb('accent','send','Send invoice','bdinvoice')}`,
  main:`<section class="bd-sec bd-details"><div class="bd-sh"><h2 class="t-title">Details</h2>${ed?`<button class="btn ghost s bd-act" data-act="edit">Done</button>`:act('pencil','Edit','edit')}</div>${ed?det.map(([l,v],i)=>`<div class="field bd-f-${sizes[i]}"><label for="bded${i}">${l}</label><input class="input" id="bded${i}" value="${esc(v)}" data-bdautosave></div>`).join(''):kv(det)}</section>`
   +sec('Money',goAct('arrowUpRight','Open in Ledger','money'),money([['Fee','',['confirmed','Confirmed'],'4.500'],['Deposit, invoice 2026-031','',['paid','Paid'],'1.500'],[sent?'Balance, invoice 2026-032':'Balance, invoice not sent',sent?'sent today, due 25 Oct':'',sent?['draft','Sent']:['draft','Draft'],'3.000'],['Travel, 2 cars from Odense','estimated','','-640'],['Hotel, 2 rooms','venue pays','','0']]),'','money'),
  panel:panel('paid'),
  ph:'Ask about this booking — send the balance invoice, move the date, draft a reply'};},
 completed:()=>{const st=S.booking.settled;return {
  pill:pill('completed','Completed'),
  btns:st?hb('secondary','','See the split','settle')+hb('accent','plus','Book again','newbooking'):hb('secondary','','Book again','newbooking')+hb('accent','','Settle 4.360 DKK','settle'),
  banner:st?banner('success','check','Settled, 4.360 DKK split three ways','Payouts are recorded. Mette and Sofie are paid, Jonas tomorrow.'):banner('success','check','Everything is paid, 5.000 DKK in, 640 DKK out','Settle to lock the money and split 4.360 DKK between the 3 of you.','<button class="btn secondary s" data-act="settle">See the split</button>'),
  before:S.booking.rated?'':rateCard(),
  main:sec('Money',goAct('arrowUpRight','Open in Ledger','money'),money([['Fee','agreed 9 Oct',['confirmed','Confirmed'],'5.000'],['Deposit, 2026-031','paid 16 Oct, 4 days late',['paid','Paid'],'1.500'],['Balance, 2026-032','paid 27 Oct, bank',['paid','Paid'],'3.500'],['Travel, 2 cars','receipt, Jonas','','-640'],['Net to split','after travel','','4.360']]),'','money')
   +sec(st?'Split':'Proposed split',act('pencil','Edit split','settle'),`<div class="bd-split">${[['MR','Mette Ravn','equal share','1.453 DKK'],['SL','Sofie Lund','equal share','1.453 DKK'],['JH','Jonas Holm','equal share + 640 travel','2.094 DKK']].map(([i,n,d,a])=>`<div class="bd-srow"><div class="bd-prow">${av(i)}<span class="tx"><span>${n}</span><small>${d}</small></span></div><span class="amt mono">${a}</span></div>`).join('')}</div>`,'Payouts are recorded here and made in your bank app.','flat'),
  panel:panel('completed'),
  ph:'Ask about this gig — settle it, what did we net, send a thank-you to Mette'};},
 cancelled:()=>{const rf=S.bdd.refunded;return {
  pill:pill('cancelled','Cancelled'),
  btns:hb('secondary','','Reopen','uncancel')+(rf?hb('accent','plus','Offer a new date','newbooking'):hb('accent','','Refund 1.500 DKK','bdrefund')),
  banner:banner('info','ai','Cancelled 14 Oct by the venue: bar closed for renovation','The date is free again and the band has been told.','<button class="btn secondary s" data-act="bdterms">Change terms</button>'),
  main:sec('Money',goAct('arrowUpRight','Open in Ledger','money'),money([['Agreed fee','voided 14 Oct',['draft','Draft'],'0'],['Deposit, 2026-031',rf?'paid 16 Oct, refunded today':'paid 16 Oct, refund',rf?['paid','Refunded']:['attention','Attention'],'1.500'],['Credit note, 2026-031-K',rf?'sent with the refund':'draft, with refund',rf?['confirmed','Sent']:['draft','Draft'],'-1.500']]),'Your terms keep the deposit inside 14 days; you chose to refund it. Refund and credit note wait for Confirm.','money'),
  panel:panel('cancelled'),
  ph:'Ask about this cancellation — refund, offer a new date, keep the deposit'};},
};

function rateCard(){const r=S.rating;const words=['','Never again','Only if needed','Fine','Good, would play again','Dream venue'];
 return `<section class="bd-rate"><div class="bd-rh"><img src="${IMG('hotel-royal')}" alt=""><div><h3 class="t-heading">How was Hotel Royal?</h3><span class="t-meta muted">Saturday hotel gig, 25 Oct. Takes 20 seconds, helps the next booking.</span></div></div>
 <div class="bd-stars"><div class="stars" role="radiogroup" aria-label="Rating">${[1,2,3,4,5].map(n=>`<button data-star="${n}" aria-label="${n} stars" class="${n<=r.stars?'on':''}"><svg class="i" viewBox="0 0 24 24">${L.P.star}</svg></button>`).join('')}</div><b class="strong">${words[r.stars]||''}</b></div>
 <span class="t-meta faint">1 never again, 2 only if needed, 3 fine, 4 good, 5 dream venue</span>
 <div class="bd-tones">${['Good sound','Great crowd','Paid on time','Easy load-in','Hard load-in','Late payment','Would bring friends'].map(t=>`<button class="qtag ${r.tags.includes(t)?'on':''}" data-qtag="${t}">${t}</button>`).join('')}</div>
 <div class="field"><label for="rnote">Note for next time</label><input class="input" id="rnote" value="Desk channel 7 hums, bring a DI. Bar staff turn the music up between sets."><span class="help bd-lock">${ic('lock','s')}Band only. Shows on Hotel Royal and in the next offer draft for this venue.</span></div>
 <div class="bd-rf"><button class="btn ghost" data-act="skiprate">Skip</button><button class="btn secondary" data-act="saverate">Save rating</button></div></section>`;}

L.VIEWS.booking=()=>{const k=keyOf();const s=STATES[k]();
 return `<div class="page bd-page bd-bk"><div class="bd-tint" data-obj="royal"></div>
 <button class="btn ghost s flush bd-back" data-go="bookings">${ic('left','s')}Bookings</button>
 ${evHead({tile:'<span>Sat</span><b>25</b><span>Oct</span>',kicker:'Concert',title:'Saturday hotel gig',facts:['Doors 20:00','On stage 21:30','Fee 4.500 DKK']})}
 <div class="bd-bar hd"><div class="bd-tb">${s.pill}</div><div class="bd-hacts">${s.btns}<button class="btn secondary icon bd-more" aria-label="More" data-act="bookingmore">${ic('more')}</button></div></div>
 ${bkProg(k)}${s.banner||''}${s.before||''}
 <div class="bd-grid"><div class="bd-main">${s.main}</div>${s.panel}</div>
 </div>${bdAbar(S.booking.sheet?'Ask a follow-up, or say “send it”':s.ph)}`;};
L.VIEWS.rate=()=>{S.booking.state='completed';S.booking.cancelled=false;return L.VIEWS.booking();};

/* ---------- send previews (modal, 720) ---------- */
const SENDS={
 offer:{t:'Send the offer to Mette Kjær',s:'Saturday hotel gig, 25 Oct, fee 5.000 DKK excl. moms, deposit 30 % on signing',to:'Mette Kjær, booking@hotelroyal.dk',subj:'Tilbud: Low Tide, Hotel Royal, 25. oktober',body:'Hej Mette, her er vores tilbud på koncerten 25. oktober. I linket kan du se vilkårene, underskrive og betale depositum på 1.500 DKK: laas.app/o/LT-2026-031. Vi holder datoen til fredag den 10. Venlig hilsen, Low Tide',send:'Send offer',act:'offersent'},
 invoice:{t:'Send invoice 2026-032 to Hotel Royal',s:'Balance 3.000 DKK + moms = 3.750 DKK, due 25 Oct, the gig date',to:'Accounts, faktura@hotelroyal.dk, cc Mette Kjær',subj:'Faktura 2026-032, Low Tide, 25. oktober',body:'Hej, vedhæftet faktura 2026-032 på 3.750 DKK inkl. moms, restbeløbet for koncerten 25. oktober, forfald samme dag. Betal med kort eller overførsel her: laas.app/pay/LT-2026-032. Venlig hilsen, Low Tide',send:'Send invoice',act:'bdinvoicesent'},
};
function bdSend(kind){const d=SENDS[kind];const to=S.toVal[kind]||d.to,body=S.msgVal[kind]||d.body;
 return `<div class="bd-send"><div><h2 class="t-heading">${d.t}</h2><p class="muted">${d.s}</p></div>
 <div class="bd-to"><span class="muted">To</span>${S.toEdit?`<input class="input" id="toedit" data-kind="${kind}" value="${esc(to)}" aria-label="To"><button class="link" data-act="toedit">Done</button>`:`<span>${esc(to)}</span><button class="link" data-act="toedit">Change</button>`}</div>
 <div class="msg ${S.fullmsg?'full':''}"><b class="strong">${d.subj}</b>${S.editMsg?`<textarea class="input" id="msgedit" data-kind="${kind}" rows="5" aria-label="Message">${esc(body)}</textarea>`:`<p>${esc(body)}</p>`}<button class="link" style="align-self:flex-start" data-act="fullmsg">${S.fullmsg?'Show less':'Show full message'}</button></div>
 <div class="bd-sf"><button class="btn ghost flush" data-act="close">Not now</button><span class="grow"></span><button class="btn secondary" data-act="editmsg">${ic(S.editMsg?'check':'pencil','s')}${S.editMsg?'Done editing':'Edit text'}</button><button class="btn accent" data-act="${d.act}">${ic('send','s')}${d.send}</button></div></div>`;}
const openSend=kind=>{S.fullmsg=false;S.editMsg=false;S.toEdit=false;S.overlay={type:'bdsend',kind};L.render();};
L.OVERLAYS.bdsend=o=>`<div class="scrim bd-scrim" data-act="close"></div><div class="modal bd-modal w720" role="dialog" aria-modal="true" aria-label="${esc(SENDS[o.kind].t)}">${bdSend(o.kind)}</div>`;

/* ---------- record a payment (dialog, 560) ---------- */
S.bdd.gap??=1;
L.OVERLAYS.bdrecord=()=>{const opts=[['Leave 30 DKK open','The invoice stays partly paid; the reminder ladder keeps running for the rest.'],['Bank fee','Books 30 DKK as a bank cost. The invoice is settled in full.'],['Rounding, settle anyway','Writes off 30 DKK. The invoice is settled in full.'],['Bad debt','Writes off 30 DKK as a loss and closes the claim.']];
 return `<div class="scrim bd-scrim55" data-act="close"></div><div class="modal bd-modal w560 bd-rec" role="dialog" aria-modal="true" aria-label="Record a payment">
 <div class="bd-mh"><div><h2 class="t-title">Record a payment</h2><span class="t-label muted">Invoice 2026-031, deposit, 1.500 DKK due 12 Oct, Hotel Royal</span></div><button class="btn ghost s bd-mx" data-act="close" aria-label="Close">${ic('x','s')}</button></div>
 <div class="bd-banner info">${ic('ai')}<div class="tx"><b>The bank shows 1.470 DKK from HOTEL ROYAL A/S on 16 Oct</b><span>Matched by the assistant to this invoice (high confidence: same reference). The amount is 30 DKK short.</span></div></div>
 <div class="bd-2col"><div class="field"><label for="ra">Amount received</label><input class="input" id="ra" value="1.470" inputmode="decimal"><span class="help">DKK, invoice says 1.500</span></div>
 <div class="field"><label for="rd">Received on</label><div class="bd-ic-in">${ic('calendar')}<input class="input" id="rd" value="16 Oct 2026"></div></div>
 <div class="field"><label for="rh">How</label><select class="input" id="rh"><option>Bank transfer, business account</option><option>MobilePay</option><option>Cash</option></select></div>
 <div class="field"><label for="ri">Into</label><select class="input" id="ri"><option>Band account, Danske Bank</option><option>Mette Ravn, private MobilePay</option></select><span class="help">or a member’s private MobilePay</span></div></div>
 <div class="bd-gapq" role="radiogroup" aria-label="30 DKK is missing. What is it?"><p>30 DKK is missing. What is it?</p>${opts.map(([t,d],i)=>`<button class="bd-opt ${S.bdd.gap===i?'on':''}" role="radio" aria-checked="${S.bdd.gap===i}" data-act="bdgap" data-i="${i}"><i></i><span><span>${t}</span><small>${d}</small></span></button>`).join('')}</div>
 <div class="bd-mf"><span>Undo later records a correction; it does not take back the money.</span><button class="btn ghost" data-act="close">Cancel</button><button class="btn accent" data-act="recorded">${ic('check')}Record 1.470 DKK</button></div></div>`;};

/* ---------- pay page (what Mette sees) ---------- */
L.VIEWS.paypage=()=>{const paid=S.bdd.venuePaid;
 return `<div class="page bd-paywrap">
 <div class="bd-prev"><button class="btn ghost s flush" data-go="booking">${ic('left','s')}Saturday hotel gig</button><span class="t-label muted">Preview of what Mette Kjær sees from the pay link</span></div>
 <article class="bd-pay">
  <div class="bd-payhead"><span class="bd-logo">${L.LOGO}</span><span class="t-label muted">Low Tide, band</span></div>
  <div class="bd-payhero"><h1 class="t-display">Deposit for the Saturday hotel gig, 25 Oct</h1><p class="muted">Invoice 2026-031 from Low Tide, due 12 Oct 2026, you are 4 days late, no fee has been added</p></div>
  <section class="bd-amount"><div class="bd-amt"><span class="n">1.500</span><span class="c">DKK</span><span class="grow"></span><button class="btn secondary s" data-act="bdcopy" data-text="1500">${ic('copy','s')}Copy amount</button></div>
   ${[['Bank','Reg 1234, 0012345678','1234 0012345678'],['Reference','2026-031','2026-031'],['MobilePay','12345. Low Tide','12345']].map(([l,v,c])=>`<div class="bd-payrow"><span class="l">${l}</span><span class="v mono">${v}</span><button class="btn ghost s bd-act" data-act="bdcopy" data-text="${c}">${ic('copy','s')}Copy</button></div>`).join('')}</section>
  <section class="bd-told">${paid?`<h2 class="t-title">Thanks, Low Tide has been told</h2><p class="muted">They see “paid on 16 Oct by bank transfer” and approve it on their side. You can close this page.</p><div class="bd-btns"><button class="btn secondary" data-act="bdunpaid">${ic('undo')}I made a mistake</button></div>`
  :`<h2 class="t-title">Already paid? Tell the band.</h2><p class="muted">Pick a date and how you paid. Low Tide approves it on their side; nothing is charged here and no card is needed.</p>
   <div class="bd-2col"><div class="field"><label for="pp-d">Paid on</label><div class="bd-ic-in">${ic('calendar')}<input class="input" id="pp-d" value="16 Oct 2026"></div></div><div class="field"><label for="pp-h">How</label><select class="input" id="pp-h"><option>Bank transfer</option><option>MobilePay</option></select></div></div>
   <div class="bd-btns"><label class="btn secondary">${ic('upload')}<span id="bdrcpt">Attach receipt</span><input type="file" data-bdreceipt hidden></label><button class="btn accent" data-act="bdvenuepaid">${ic('check')}I have paid</button></div>
   <p class="bd-plan">Or plan it: "I will pay on 20 Oct" — the band sees the date and stops reminding you until then.</p>`}</section>
  <footer><p>This page is made by LAAS for Low Tide. LAAS never holds money: the amount goes straight to the band’s own account. Questions: hello@lowtide.dk</p><p><button class="link bd-acc" data-act="toast2">Download PDF invoice</button>, <button class="link bd-acc" data-act="bdoffer">See the offer you signed</button></p></footer>
 </article></div>`;};

/* ---------- gig day: timeline ---------- */
L.VIEWS.gigday=()=>{const H0=14,HN=11,X=t=>((t-H0)/HN*100);
 const blocks=[[14.5,16.25,'Drive, 118 km','travel'],[17,17.75,'Load-in','work'],[17.75,18.75,'Soundcheck','work'],[19,19.75,'Meal ~','break',1],[20,21.5,'Doors','doors'],[21.5,22.25,'Set 1','stage'],[22.5,23.25,'Set 2','stage'],[23.25,24.5,'Load-out, TBD','work',1]];
 const col={travel:'var(--travel)',work:'var(--work)',break:'var(--break)',doors:'var(--doors)',stage:'var(--accent)'};
 const pk=S.parkingDone,ml=S.bdd.mealOk,open=(pk?0:1)+(ml?0:1);
 const T=(c,l)=>`<span class="tag ${c}">${l}</span>`;
 const lact=(icon,label,a)=>`<button class="btn ghost s bd-act lead" data-act="${a}">${ic(icon,'s')}${label}</button>`;
 const steps=[
  ['14:30','Leave Odense','Two cars. Mette drives Sofie, Jonas drives the gear. 118 km, about 1 h 40.','travel',[T('accent','In 10 min')],'next','<a class="btn secondary s" href="https://www.google.com/maps/dir/Odense/Hotel+Royal,+Store+Torv+4,+8000+Aarhus" target="_blank" rel="noopener">'+ic('pin','s')+'Open route</a>'],
  ['17:00','Load-in','Back entrance on Kannikegade, 2 steps, trolley there. 2 parking spaces in the yard.','work',[T('confirmed','Confirmed')],'',pk?'':`<div class="bd-open">${ic('alert','s')}<span>Parking code missing, needed at load-in 17:00 today. Asked 18 Oct.</span><button class="btn ghost s bd-act" data-act="bdcall">${ic('messageSquare','s')}Call Kasper</button></div>`],
  ['17:45','Soundcheck','Kasper Holm on sound, +45 30 99 86 77. Stage 6 × 4 m, 40 cm riser. PA and drums in house; bring 2 guitar amps and a DI.','work',[T('draft','Moved from 18:30'),T('confirmed','Confirmed')]],
  [ml?'19:00':'~19:00','Band meal',ml?'Hotel restaurant, 19:00, confirmed with the venue.':'Hotel restaurant. The venue said “around seven”.','break',[ml?T('confirmed','Confirmed'):T('attention','Approximate')],ml?'':'approx'],
  ['20:00','Doors','Guest list of 6 names, send by 20:00: Mette’s partner, Sofie’s parents, 2 friends of Jonas.','doors',[T('confirmed','Confirmed')],'',lact('send',S.bdd.guestSent?'Guest list sent':'Send guest list','bdguest')],
  ['21:30','Set 1, 45 min','Set list v3, 12 songs, edited by Sofie yesterday.','stage',[T('confirmed','Confirmed')],'',lact('fileText','Open set list','bdsetlist')],
  ['22:30','Set 2, 45 min','Encore only if the room asks for it; curfew is hard.','stage',[T('confirmed','Confirmed')]],
  ['00:30','Curfew, PA off','Load-out after curfew, the time is still to be decided. Asked 18 Oct.','work',[T('attention','Load-out TBD')],'approx'],
  ['After','Sleep at Hotel Royal','2 rooms, check-in from 15:00, breakfast 07–10. Bags can go in at load-in.','travel',[T('confirmed','Confirmed')]]];
 const stepHtml=([t,h,d,c,tags,kind,extra],i)=>`<div class="bd-step ${kind||''}">${S.editTimes?`<input class="input mono bd-tin" value="${t}" aria-label="Time for ${esc(h)}">`:`<span class="time">${t}</span>`}<span class="spine"><i style="--c:${col[c]}"></i>${i<steps.length-1?'<b></b>':''}</span><div class="content"><div class="bd-sth"><h4>${h}</h4>${tags.join('')}</div><p>${d}</p>${extra?`<div class="bd-sx">${extra}</div>`:''}</div></div>`;
 return `<div class="page bd-page bd-bk bd-gd"><div class="bd-tint" data-obj="royal"></div>
 <button class="btn ghost s flush bd-back" data-go="booking">${ic('left','s')}Saturday hotel gig</button>
 ${evHead({tile:'<span>Today</span><b>25</b><span>Oct</span>',kicker:'Day sheet',title:'Saturday hotel gig',facts:['Load-in 17:00','On stage 21:30','Curfew 00:30','118 km from Odense'],today:true})}
 <div class="bd-bar hd"><div class="bd-tb">${pill('confirmed','Confirmed',false,true)}</div><div class="bd-hacts">${hb('secondary','fileText','PDF','bdpdf')}${hb('accent','send','Send to band','bdsendday')}<button class="btn secondary icon bd-more" aria-label="More" data-act="bddaymore">${ic('more')}</button></div></div>
 ${S.bdd.gigBanner?banner('info','ai','Soundcheck moved 18:30 → 17:45, venue confirmed this morning','Jonas and Sofie were told at 09:12 with just this change. Mette has not opened it yet.',`<button class="btn secondary s" data-act="bdnudgemette">Nudge Mette</button>`,'gig'):''}
 <section class="strip bd-strip"><div class="bd-nowr"><span class="bd-now">Now 14:20</span><b>Leave Odense in 10 min, then load-in 17:00</b><span class="t-meta muted">Curfew 00:30</span></div>
  <div class="track">${Array.from({length:HN+1},(_,h)=>`<span class="h ${h===HN?'last':''}" style="left:${X(H0+h)}%">${String((H0+h)%24).padStart(2,'0')}</span><span class="tick ${h===HN?'last':''}" style="left:${X(H0+h)}%"></span>`).join('')}
  ${blocks.map(([a,b,l,c,ap])=>`<span class="blk ${c==='stage'?'stage':''} ${ap?'ap':''}" style="--c:${col[c]};left:${X(a)}%;width:calc(${X(b)-X(a)}% - 2px)"><span>${l}</span></span>`).join('')}
  <span class="curfew" style="left:${X(24.5)}%"></span><span class="now" style="left:${X(14+20/60)}%"></span></div>
  <div class="legend"><span><i style="background:var(--travel)"></i>Travel</span><span><i style="background:var(--work)"></i>Band work</span><span><i style="background:var(--break)"></i>Break</span><span><i style="background:var(--doors)"></i>Audience in</span><span><i style="background:var(--accent)"></i>On stage</span><span><i class="nc"></i>Not confirmed</span></div></section>
 <div class="bd-gdgrid"><section class="bd-card bd-tl"><div class="bd-sh"><h3 class="t-heading">Timeline</h3>${act(S.editTimes?'check':'pencil',S.editTimes?'Done':'Edit times','edittimes')}</div>
  <div class="bd-steps"><div class="bd-step nowrow"><span class="time">14:20</span><span class="spine"><i class="nowdot"></i></span><span class="tag bd-nowtag">Now</span><span class="muted">Leave in 10 min. Everything before this line is done.</span></div>${steps.map(stepHtml).join('')}</div>
  <p class="bd-foot">Times are exact unless marked ~ or TBD. Dashed means the venue has not confirmed. A change is sent to the band as the change itself, not the whole sheet.</p></section>
 <aside class="bd-panel bd-rail">
  <div class="bd-openbox ${open?'':'done'}"><div class="bd-sh"><h3 class="t-heading">${open?`${open===2?'2 things':'1 thing'} still open`:'Nothing still open'}</h3>${goAct('arrowUpRight','See advance','booking')}</div>
   ${pk?'':`<div class="bd-oi"><div class="bd-sth"><span>Parking code</span>${T('danger','Needed by 17:00')}</div><span class="t-meta muted">Asked Kasper 18 Oct, no reply. Needed by load-in 17:00.</span>${lact('send','Ask again','parking')}</div>`}
   ${ml?'':`<div class="bd-oi"><div class="bd-sth"><span>Meal time</span>${T('paid','Answered')}</div><span class="t-meta muted">Venue answered "around seven". Confirm or ask for a time.</span>${lact('check','Confirm ~19:00','bdmeal')}</div>`}
   <p class="t-meta muted">${6+(pk?1:0)+(ml?1:0)} of 8 confirmed: set times, load-in, backline, sound engineer, rooms, guest list${pk?', parking':''}${ml?', meal':''}.</p></div>
  <div class="bd-pgroup"><div class="bd-sh"><h2 class="t-title">People</h2></div>${people([['MR','Mette Ravn','vocals, guitar, drives car 1, +45 20 11 22 33'],['SL','Sofie Lund','synth, with Mette'],['JH','Jonas Holm','drums, drives car 2 with gear, +45 20 44 55 66'],['MK','Mette Kjær','venue, booker, +45 86 12 00 00'],['KH','Kasper Holm','venue, sound, +45 30 99 88 77']])}</div>
  <div class="bd-pgroup"><div class="bd-sh"><h2 class="t-title">Files</h2>${act('plus','Add','bdaddfile')}</div><div class="bd-body list"><div class="bd-rows">${[['Stage plot, Low Tide 2026.pdf','sent to Kasper 14 Oct'],['Set list, 25 Oct.txt','edited by Sofie yesterday'],['Agreement, Hotel Royal.pdf',`${ic('lock','s')}owner and admins only`]].map(([n,m])=>`<button class="bd-frow" data-act="bdfile" data-n="${esc(n)}"><span class="tx"><span>${n}</span><small>${m}</small></span>${ic('right','s')}</button>`).join('')}</div>
   <p class="bd-foot">Fee, deposit and invoices are never on the day sheet, not even for admins. Money lives on the booking.</p></div></div>
 </aside></div>
 </div>${L.abar('Sat 25 Oct, Hotel Royal','Ask about the day — when do we leave, what is still open with the venue, send the guest list')}`;};

/* ---------- actions ---------- */
const A=L.ACTIONS,T=L.toast;
const rerenderSend=()=>{if(S.overlay&&S.overlay.type==='bdsend')L.render();else{if(S.overlay&&S.overlay.kind)S.overlay.html=L.sendPreview(S.overlay.kind);L.render();}};
Object.assign(A,{
 sendoffer:()=>openSend('offer'),
 bdinvoice:()=>openSend('invoice'),
 bdinvoicesent:()=>{S.overlay=null;S.editMsg=false;S.toEdit=false;S.bdd.invoiceSent=true;S.bdd.check.paid['Invoice for balance sent']=true;T('Invoice 2026-032 sent to faktura@hotelroyal.dk',()=>{S.bdd.invoiceSent=false;S.bdd.check.paid['Invoice for balance sent']=false;});},
 fullmsg:()=>{S.fullmsg=!S.fullmsg;rerenderSend();},
 toedit:()=>{S.toEdit=!S.toEdit;rerenderSend();},
 editmsg:()=>{S.editMsg=!S.editMsg;rerenderSend();if(!S.editMsg)T('Text saved for this message');},
 record:()=>{S.overlay={type:'bdrecord'};L.render();},
 bdgap:t=>{S.bdd.gap=+t.dataset.i;L.render();},
 recorded:()=>{const g=S.bdd.gap;S.overlay=null;S.booking.depositPaid=g!==0;S.checklist['Deposit received']=g!==0;S.bdd.check.paid['Deposit received']=true;S.bdd.check.overdue['Deposit received']=g!==0;L.render();T(g===0?'1.470 DKK recorded, 30 DKK left open on 2026-031':'1.470 DKK recorded on invoice 2026-031',()=>{S.booking.depositPaid=false;S.checklist['Deposit received']=false;});},
 sendreminder:()=>{S.editMsg=false;S.toEdit=false;S.sentReminder=true;L.render();T('Reminder sent to Hotel Royal',()=>{S.sentReminder=false;});},
 bdresend:()=>T('Offer sent again to Mette Kjær',()=>{}),
 bdextend:()=>{S.bdd.extended=!S.bdd.extended;L.render();if(S.bdd.extended)T('Hold extended to Fri 17 Oct, Mette is told',()=>{S.bdd.extended=false;});},
 bdaskband:()=>{S.bdd.askedBand=true;L.render();T('Jonas asked again in the band app');},
 bdrules:()=>{S.overlay={type:'modal',html:`<div class="bd-rules"><h2 class="t-title">Why these rules?</h2><p class="muted">Danish law lets a business send a reminder with a fee of up to 100 DKK once a payment is 10 days late, at most three times, at least 10 days apart. A reminder before that is free and friendly. LAAS follows that ladder and never sends anything without your Confirm.</p><div class="row" style="justify-content:flex-end"><button class="btn secondary" data-act="close">Got it</button></div></div>`};L.render();},
 bdbannerx:t=>{S.bdd.bannerOff[t.dataset.id]=true;if(t.dataset.id==='gig')S.bdd.gigBanner=false;L.render();},
 bdact:t=>{const k=t.dataset.k;S.bdd.actOpen[k]=!(S.bdd.actOpen[k]??(k==='paid'));L.render();},
 bdtone:t=>{const x=t.dataset.t;S.bdd.replyTone={Friendlier:'Hi Mette, how lovely that you thought of us! Sat 25 Oct works really well; Fri 24 we are sadly already booked. For 2 × 45 min in the bar our fee is 5.000 DKK plus travel from Odense. If that sounds good, I will hold the date for you until Friday and send an offer you can sign online.',Shorter:'Hi Mette, Sat 25 Oct works, Fri 24 does not. 2 × 45 min: 5.000 DKK plus travel from Odense. I can hold the date until Friday and send an offer to sign online.','In Danish':'Hej Mette, tak for henvendelsen. Lørdag 25. oktober passer os; fredag 24. er vi allerede booket. For 2 × 45 min i baren er vores honorar 5.000 kr. plus transport fra Odense. Hvis det passer, holder jeg datoen til fredag og sender et tilbud, du kan underskrive online.'}[x];L.render();T(`Reply rewritten: ${x.toLowerCase()}`,()=>{S.bdd.replyTone=null;});},
 bdedit:()=>T('Editing opens in the booking editor',null),
 bdrefund:()=>{S.overlay={type:'modal',html:L.confirmM('Refund 1.500 DKK to Hotel Royal?','The refund is recorded as a payout from your business account and credit note 2026-031-K goes to Mette. You do the transfer in your bank app.','Not now','bdrefunded','Refund 1.500 DKK')};L.render();},
 bdrefunded:()=>{S.overlay=null;S.bdd.refunded=true;S.bdd.check.cancelled['Refund the deposit']=true;S.bdd.check.cancelled['Send the credit note']=true;L.render();T('Refund recorded, credit note sent to Mette',()=>{S.bdd.refunded=false;S.bdd.check.cancelled['Refund the deposit']=false;S.bdd.check.cancelled['Send the credit note']=false;});},
 bdterms:()=>{S.overlay={type:'modal',html:L.confirmM('Keep the deposit instead?','Your house terms keep the 1.500 DKK deposit inside 14 days. Mette gets a short mail saying the deposit is kept.','Keep refunding','close','Keep the deposit')};L.render();},
 bookingmore:(t,r)=>{const st=S.booking.state;const items=[];
  if(st==='offer')items.push(['Mark as signed','signed']);
  items.push(['Preview what Mette sees','bdpreview'],['Open day sheet','day'],['Duplicate booking','dupbooking'],['Download agreement PDF','toast2'],['Copy offer link','copytext',0,'https://laas.app/o/LT-2026-031'],[S.booking.cancelled?'Restore booking':'Cancel booking',S.booking.cancelled?'uncancel':'cancelbooking',!S.booking.cancelled]);
  L.open('menu',{x:Math.max(8,Math.min(r.right-260,innerWidth-276)),y:r.bottom+6,items});},
 bdpreview:()=>L.go('paypage'),
 bdnew:()=>{const i=document.getElementById('ask');if(i){i.value='';i.focus();}S.booking.sheet=false;L.render();T('New conversation about this booking');},
 bdrecx:()=>T('Context removed. The next question is about Low Tide',()=>{}),
 /* pay page */
 bdcopy:t=>{try{navigator.clipboard.writeText(t.dataset.text)}catch(e){}T('Copied');},
 bdvenuepaid:()=>{S.bdd.venuePaid=true;L.render();T('Marked as paid. Low Tide gets a card to approve it',()=>{S.bdd.venuePaid=false;});},
 bdunpaid:()=>{S.bdd.venuePaid=false;L.render();},
 bdoffer:()=>T('The signed offer opens as a PDF'),
 /* gig day */
 bdpdf:()=>T('Day sheet PDF is ready, without money'),
 bdsendday:()=>T('Day sheet sent to 3 members and Kasper',()=>{}),
 bddaymore:(t,r)=>L.open('menu',{x:Math.max(8,Math.min(r.right-260,innerWidth-276)),y:r.bottom+6,items:[['Open the booking','bdgobooking'],[S.collapsed?'Expand the menu':'Collapse the menu','bdcollapse'],['Copy day sheet link','copytext',0,'https://laas.app/d/LT-2026-031']]}),
 bdgobooking:()=>L.go('booking'),
 bdcollapse:()=>{S.overlay=null;S.collapsed=!S.collapsed;L.render();},
 edit:()=>{S.params.edit=!S.params.edit;L.render();if(!S.params.edit&&S.view!=='booking')T('Saved');},
 bdnudgemette:()=>T('Mette nudged to open the change',()=>{}),
 bdcall:()=>T('Calling Kasper Holm, +45 30 99 88 77'),
 bdmeal:()=>{S.bdd.mealOk=true;L.render();T('Meal confirmed for 19:00',()=>{S.bdd.mealOk=false;});},
 bdguest:()=>{S.bdd.guestSent=!S.bdd.guestSent;L.render();if(S.bdd.guestSent)T('Guest list sent to Kasper, 6 names',()=>{S.bdd.guestSent=false;});},
 bdsetlist:()=>T('Set list v3 opens, 12 songs'),
 bdaddfile:()=>T('Pick a file to add to the day sheet'),
 bdfile:t=>T(`${t.dataset.n} opens`),
});
/* checklists */
L.CHANGE.push(t=>{if(t.dataset.bdcheck){const [k,x]=t.dataset.bdcheck.split('|');S.bdd.check[k][x]=t.checked;L.render();return true;}
 if(t.dataset.bdreceipt!==undefined&&t.files&&t.files[0]){const el=document.getElementById('bdrcpt');if(el)el.textContent=t.files[0].name;return true;}});
/* autosave status: hidden until a change, Saving…, Saved for 3 s, then it fades */
let svT;L.INPUT.push(t=>{if(t.dataset.bdautosave===undefined)return;const s=document.getElementById('bdsave');if(!s)return true;
 s.innerHTML=`${ic('loader','s')}Saving…`;s.className='bd-save on saving';clearTimeout(svT);svT=setTimeout(()=>{s.innerHTML=`${ic('check','s')}Saved`;s.className='bd-save on';svT=setTimeout(()=>{s.className='bd-save';},3000);},600);return true;});
})();
