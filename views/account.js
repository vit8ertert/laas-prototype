/* LAAS prototype · account area. Rebuilt 1:1 from the Figma sections "UX · Settings" and "UX · Account & onboarding"
   (page "Build · LAAS v1.0"), with Vit's 21 Oct width rules (settings column max 720 px, fields sized by input) and
   the quiet save status. Uses window.LAAS (see index.html). */
(function(){
"use strict";
const L=window.LAAS,S=L.S,ic=L.ic,esc=L.esc,IMG=L.IMG;

/* Lucide icons this area needs that the core set lacks (lucide.dev paths) */
Object.assign(L.P,{
 square:'<rect width="18" height="18" x="3" y="3" rx="2"/>',
 lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
 upright:'<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
 alertc:'<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
 rotate:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
 logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
 download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>'
});

/* ---------- state ---------- */
S.acc??={
 q:'',savedUntil:0,hide:{},size:'3–4',obRows:3,
 members:[
  {id:'vs',ini:'VS',name:'Vital Sinkevich',role:'Owner',meta:'you, joined 14 Sep 2026'},
  {id:'mr',ini:'MR',name:'Mette Ravn',role:'Admin',meta:'vocals, guitar, joined 14 Sep, sees fees'},
  {id:'sl',ini:'SL',name:'Sofie Lund',role:'Member',meta:'synth, joined 15 Sep, fees hidden'},
  {id:'jh',ini:'JH',name:'Jonas Holm',role:'Member',meta:'drums, joined 16 Sep, owed 1.787 DKK from Odense Live',owed:true}],
 invites:[{email:'anna.b@gmail.com',meta:'Viewer, bookkeeper, sent 18 Oct by you, expires 25 Oct, not opened'}],
 tg:{fees:false,confirm:false,interest:false,b2b:true,fholds:true,fday:true,pub:true,ipub:true,iholds:true,iday:true,motion:false,n1:false,n2:false,n3:false,n4:false},
 conn:{spotify:false,bandcamp:false,mobilepay:false,dinero:false}
};
const A=S.acc;
/* personal assistant prompt (LaaS 0.5 /account/profile/), private to the user, used in every band */
const PROMPT_EX='I sing and play guitar, and I do most of the booking. Answer me in English, short and plain, numbers first.\nWrite mails to Danish venues in Danish, informal (du), signed with my first name and the band.\nAlways ask before you change a fee or a confirmed date. If something is unclear, ask me one question instead of guessing.';
A.prompt??=PROMPT_EX;
/* bands this account runs; the core sidebar and band menu still say Low Tide, see patchBand() below */
S.bands??=[{id:'lt',name:'Low Tide',ini:'LT',meta:'Owner: 3 members',city:'Odense',country:'Denmark',currency:'DKK',tz:'Europe/Copenhagen',lang:'English'}];
S.bandId??='lt';
const curBand=()=>S.bands.find(b=>b.id===S.bandId)||S.bands[0];
const iniOf=n=>(n.trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2)||'B').toUpperCase();
const GENRE_THEME={'Metal and hardcore':'metal','Electronic':'electronic','Classical':'classical'};
const TNAME={label:'Default',metal:'Metal',electronic:'Electronic',classical:'Classical'};
const SLOTNAME={label:'Label',metal:'Metal',electronic:'Electronic',classical:'Classical'};

/* ---------- small parts (Figma components) ---------- */
const tg=(k,label)=>`<button class="acc-tg ${A.tg[k]?'on':''}" role="switch" aria-checked="${!!A.tg[k]}" aria-label="${esc(label)}" data-act="acctg" data-k="${k}"><i></i></button>`;
const sel=(label,opts,cls='')=>`<select class="input acc-sel ${cls}" aria-label="${esc(label)}" data-accsave>${opts.map(o=>`<option>${esc(o)}</option>`).join('')}</select>`;
const txt=(label,val,w,cls='')=>`<input class="input acc-in ${cls}" style="width:${w}px" aria-label="${esc(label)}" value="${esc(val)}" data-accsave>`;
const tag=(kind,t)=>`<span class="tag ${kind}">${t}</span>`;
const act=(icon,label,a,extra='')=>`<button class="btn ghost s" data-act="${a}" ${extra}>${ic(icon,'s')}${label}</button>`;
const sbtn=(label,a,extra='')=>`<button class="btn secondary s" data-act="${a}" ${extra}>${label}</button>`;
const row=(label,desc,ctl,cls='')=>`<div class="acc-row ${cls}"><div class="tx">${desc?`<span>${label}</span><small>${desc}</small>`:label}</div><div class="ctl">${ctl}</div></div>`;
const sec=(title,inner,action='',cls='')=>`<section class="acc-sec ${cls}"><div class="acc-sh"><h2 class="t-title">${title}</h2>${action}</div>${inner}</section>`;
const rows=(...r)=>`<div class="acc-rows">${r.join('')}</div>`;
const foot=(t,icon)=>`<p class="acc-foot">${icon?ic(icon,'s'):''}<span>${t}</span></p>`;
const li=(lead,title,meta,end,attrs='')=>`<${attrs?'button':'div'} class="acc-li" ${attrs}>${lead||''}<span class="tx"><span>${title}</span><small>${meta}</small></span>${end||''}</${attrs?'button':'div'}>`;
const av=ini=>`<span class="acc-av">${ini}</span>`;
const xbtn=(a,extra='')=>`<button class="acc-x" aria-label="Dismiss" data-act="${a}" ${extra}>${ic('x','s')}</button>`;
const banner=(key,icon,title,body,end)=>A.hide[key]?'':`<div class="acc-banner">${ic(icon)}<div class="tx"><b>${title}</b><span>${body}</span></div>${end||xbtn('acchide',`data-k="${key}"`)}</div>`;
/* ghost button whose right padding is 0 (Figma: Revoke, Reset link, New band, Change card, Move to Free) */
const gflush=(label,a,extra='',icon='')=>`<button class="btn ghost s acc-gr" data-act="${a}" ${extra}>${icon?ic(icon,'s'):''}${label}</button>`;

/* ---------- save status: hidden until something changes ---------- */
function saveHtml(){const on=Date.now()<A.savedUntil;return `<span class="acc-save ${on?'on':''}" id="acc-save" role="status" aria-live="polite">${on?ic('check','s')+'Saved':''}</span>`;}
function saved(){
 const el=document.getElementById('acc-save');if(!el)return;
 clearTimeout(A._t1);clearTimeout(A._t2);
 if(navigator.onLine===false){el.className='acc-save on err';el.innerHTML=`${ic('alertc','s')}Couldn’t save<button class="btn ghost s" data-act="accretry">Retry</button>`;return;}
 el.className='acc-save on';el.textContent='Saving…';
 A._t1=setTimeout(()=>{A.savedUntil=Date.now()+3000;const e=document.getElementById('acc-save');if(!e)return;e.innerHTML=ic('check','s')+'Saved';
  A._t2=setTimeout(()=>{const e2=document.getElementById('acc-save');if(e2)e2.classList.remove('on');},3000);},600);
}

/* ---------- settings shell (sub-nav as in Figma) ---------- */
const NAV=[['You',[['account','Account'],['notifications','Notifications']]],['Low Tide',[['settings','Band'],['members','Members'],['settings-money','Money'],['calendar-feed','Calendar feed'],['integrations','Integrations'],['theme','Theme'],['plan','Plan and billing']]]];
const ABAR='Ask about settings — change the deposit to 40 %, invite our new drummer, which rules apply to reminders';
function navHtml(){const q=A.q.trim().toLowerCase();
 const bn=curBand().name;
 return `<nav class="acc-nav" aria-label="Settings"><label class="acc-search">${ic('search','s')}<input id="acc-q" placeholder="Search settings" aria-label="Search settings" value="${esc(A.q)}"></label>
 ${NAV.map(([g,items])=>{const vis=items.filter(([,l])=>!q||l.toLowerCase().includes(q));return vis.length?`<span class="acc-gl">${g==='Low Tide'?esc(bn):g}</span>${vis.map(([id,l])=>`<button class="nav ${S.view===id?'active':''}" data-go="${id}"><span>${l}</span></button>`).join('')}`:''}).join('')}
 ${q&&!NAV.some(([,i])=>i.some(([,l])=>l.toLowerCase().includes(q)))?`<span class="acc-gl">No page called “${esc(A.q)}”</span>`:''}</nav>`;}
function shell(title,sub,body){
 queueMicrotask(markSidebar);
 return `<div class="page acc-set"><div class="acc-ph"><div class="grow"><h1 class="t-display">${title}</h1><p>${sub}</p></div>${saveHtml()}</div>
 <div class="acc-grid">${navHtml()}<div class="acc-body">${body}</div></div></div>${L.abar(null,ABAR)}`;}
/* every settings page lights "Band settings" in the app sidebar, as in Figma */
function markSidebar(){document.querySelectorAll('.sidebar .nav[data-go="settings"]').forEach(b=>b.classList.add('active'));}

/* ---------- Settings · Band (315:9963) ---------- */
L.VIEWS.settings=()=>{const th=SLOTNAME[S.genre],b=curBand(),lt=b.id==='lt';
 return shell('Band',lt?'Low Tide, Owner: you, 3 members, created 14 Sep 2026':`${esc(b.name)}, Owner: you, just you so far, created ${b.created||'21 Oct 2026'}`,
 sec('Profile',rows(
  row('Band name','Shown on offers, invoices and the pay page',txt('Band name',b.name,320)),
  row('Home city','Travel is counted from here',txt('Home city',b.city||'',240)),
  row('Country','Currency, VAT and time zone follow it',`<select class="input acc-sel" aria-label="Country" data-accsave>${COUNTRIES.map(c=>`<option ${c===(lt?'Denmark':b.country)?'selected':''}>${esc(c)}</option>`).join('')}</select>`),
  ...(lt?[]:[row('Time zone','Gig times and reminders follow it',tag('draft',b.tz))]),
  row('Genres','Pick all that fit. They drive the theme suggestion and the sample copy.',`<div class="acc-genres acc-bgen">${GENRES.map(g=>{const on=(A.genres||(A.genres=['Indie and rock','Shoegaze and dream pop'])).includes(g);return `<button class="acc-gc ${on?'on':''}" data-act="accbgenre" data-g="${g}" aria-pressed="${on}">${g}</button>`;}).join('')}</div>`,'acc-rgen'),
  row('Logo and cover','Used on the pay page and offers, 2 files',`<label class="btn secondary s" style="cursor:pointer">Change<input type="file" accept="image/*" hidden data-photo="band"></label>`)))
 +sec('House terms',rows(
  row('Deposit','Default on every new offer, full payment inside 28 days of the gig',sel('Deposit',['30 % on signing','50 % on signing','No deposit'])),
  row('Balance due','',sel('Balance due',['On the gig date','7 days after the gig','14 days after the gig'])),
  row('Other invoices due','Net 7 is the Danish norm for small businesses',sel('Other invoices due',['7 days','8 days','14 days','30 days'])),
  row('Cancellation','Written into every offer, deposit kept inside this window',sel('Cancellation',['14 days','30 days','7 days'])),
  row('Travel','Added as a line when the venue is further than this',sel('Travel',['Included up to 100 km','Included up to 50 km','Always charged'])),
  foot('Changing a term changes new offers only. Signed offers keep their terms.')),
  act('upright','Preview an offer','accgo','data-to="paypage"'))
 +sec('Look',rows(
  row('Theme','Colours, backdrop, wordmark and tone of voice, suggested from your genres',`<button class="acc-tagbtn" data-go="theme" aria-label="Change theme">${tag('accent',th+(S.genre==='label'?', default':''))}</button>`),
  row('Light or dark','Follows your computer unless you pick one',`<select class="input acc-sel" aria-label="Light or dark" id="acc-appear">${[['system','System'],['dark','Dark'],['light','Light']].map(([k,l])=>`<option value="${k}" ${S.appearance===k?'selected':''}>${l}</option>`).join('')}</select>`),
  row('Density','Bookings and money lists go compact on desktop',sel('Density',['Comfortable','Compact']))))
 +sec('Danger zone',rows(
  row('Transfer ownership','Give another member the Owner role, you become Admin',sbtn('Transfer','acctransfer')),
  row('Delete band','Removes bookings, contacts, invoices and money records for everyone, 30-day undo by email',sbtn('Delete band','accdelband'))),'','danger'));};

/* ---------- Settings · Members (315:10665) ---------- */
L.VIEWS.members=()=>{const n=A.invites.length;
 return shell('Members',`${A.members.length-1} members, ${n} invite${n===1?'':'s'} pending, roles: Owner, Admin, Member, Viewer`,
 banner('roles','ai','What each role sees','Owner and Admin: everything, including money and settings. Member: bookings, day sheets, their own payouts; fees hidden unless you turn them on. Viewer: read-only calendar and day sheets, for a bookkeeper or a stand-in.')
 +sec('Members',`<div class="acc-list">${A.members.map(m=>li(av(m.ini),m.name,`${m.role}${m.role==='Owner'?':':','} ${m.meta}`,`${tag(m.role==='Member'||m.role==='Viewer'?'draft':'accent',m.role)}${ic('right','s')}`,`data-act="accmember" data-id="${m.id}"`)).join('')}</div>`,act('plus','Invite','accinvite'))
 +sec('Invites',n?`<div class="acc-list">${A.invites.map((v,i)=>`<div class="acc-inv">${li('',esc(v.email),v.meta,tag('attention','Pending'))}<div class="acc-invact">${sbtn('Resend','accresend',`data-i="${i}"`)}<button class="btn ghost s" data-act="copytext" data-text="https://laas.app/join/low-tide-7Hq2">${ic('copy','s')}Copy link</button>${gflush('Revoke','accrevoke',`data-i="${i}"`).replace('acc-gr','acc-gr acc-danger')}</div></div>`).join('')}</div>`:foot('No invites waiting. Invite someone and they show here until they join.'),'','pad')
 +sec('Rules',rows(
  row('Members see fees','Off hides fee, deposit and invoices from Members; their own payout stays visible',tg('fees','Members see fees')),
  row('Members can confirm bookings','On lets any Member answer an offer; Off keeps it with Owner and Admin',tg('confirm','Members can confirm bookings')),
  row('Leaving with a balance','A member cannot leave while they are owed or hold band money. Jonas is owed 1.787 DKK.',tag('attention','1 blocked')))));};

/* ---------- Settings · Money (316:10498) ---------- */
L.VIEWS['settings-money']=()=>shell('Money','Where payments land, how invoices are numbered, how reminders behave, LAAS never holds money',
 (A.hide.bank?'':`<div class="acc-banner att">${ic('alertc','s')}<div class="tx"><b>Bank details were changed 2 hours ago by Mette Ravn</b><span>New invoices will show the new account. If you did not expect this, call Mette before anything is sent: changed bank details are the classic invoice scam.</span></div><button class="btn secondary s" data-act="acchide" data-k="bank" data-msg="Bank details confirmed">Looks right</button></div>`.replace(ic('alertc','s'),ic('alertc')))
 +sec('Where money lands',rows(
  row('Band account','Shown on invoices and the pay page, Danske Bank',sel('Band account',['Reg 1234, 0012345678'])),
  row('MobilePay','Business number, a private number breaks MobilePay\'s terms',sel('MobilePay',['Business 12345'])),
  row('Held by members','Payments that landed in someone\'s private account, recorded, not moved',tag('attention','Mads, 5.000 DKK')),
  foot('A member\'s private MobilePay is allowed as a last resort; LAAS records it and nudges towards the business account.')))
 +sec('Invoices',rows(
  row('Company','Name and CVR printed on every invoice',sel('Company',['Low Tide I/S, CVR 44 55 66 77'],'wide')),
  row('Moms default','Per line, changeable before you approve, never guessed',sel('Moms default',['25 %, ask when unsure','25 %','No moms'])),
  row('Numbering','Sequential, locked on approve, gaps are not allowed by law',sel('Numbering',['2026-###, next 2026-033'],'wide')),
  row('Prices shown','Toggle on every invoice; totals always show excl., moms, incl.',sel('Prices shown',['Excl. moms','Incl. moms'])),
  row('E-invoice (EAN)','Public clients must get e-invoices through a provider',tag('draft','Not set up'))))
 +sec('Reminders',rows(
  row('Policy','Calm: 7 days before, due date, 3 days after, then by hand. Recommended adds a free påmindelse at +7. Tight adds rykker 1 at +10 automatically (still behind Confirm).',sel('Policy',['Calm','Recommended','Tight'])),
  row('Fee per rykker','Danish cap is 100 DKK, at most 3 letters, 10 days apart',sel('Fee per rykker',['100 DKK','50 DKK','No fee'])),
  row('Late interest','Reference rate + 8 percentage points, computed only if on',tg('interest','Late interest')),
  row('Business compensation','310 DKK on B2B claims, hidden for private clients',tg('b2b','Business compensation')),
  row('Who approves reminders','Nothing is sent without a tick',sel('Who approves reminders',['Owner and Admins','Owner only']))),
  act('upright','See the ladder','accgo','data-to="money" data-mt="invoices"'))
 +sec('Export',rows(
  row('Export everything','Invoices, payments, expenses and payouts as CSV and PDF, always available',sbtn('Export','acctoast','data-msg="Export ready: low-tide-2026.zip"')),
  row('Bookkeeper access','A Viewer who sees money only, for Dinero, Billy or an accountant',sbtn('Invite','accinvite','data-role="Viewer"')))));

/* ---------- Settings · Calendar feed (320:11090), new view ---------- */
const feedUrl=(u,reset)=>`<div class="acc-url"><code>${u}</code><button class="btn ghost s" data-act="copytext" data-text="${u}">${ic('copy','s')}Copy</button>${gflush('Reset link','acctoast',`data-msg="${reset}"`)}</div>`;
L.VIEWS['calendar-feed']=()=>shell('Calendar feed','Two feeds: one for the band, one for anyone with the link, fees never leave',
 (A.hide.cal?'':`<div class="acc-explainer"><div class="tx"><b>Your gigs in any calendar</b><span>Subscribe once in Google, Apple or Outlook; new and moved gigs appear by themselves. Fees never leave LAAS.</span></div><img src="${IMG('notebook')}" alt="">${xbtn('acchide','data-k="cal"')}</div>`)
 +sec('Band feed',rows(feedUrl('webcal://laas.dk/feed/lowtide/band/7f3a…','New band feed link made. Members re-subscribe once'),
  row('Who has it','Members only, 3 subscribed, Jonas last synced 2 min ago',tag('confirmed','3 of 3')),
  row('Fees and deposits','Off hides money from members\' calendars',tag('draft','Fees hidden')),
  row('Holds and enquiries','Shown as tentative',tg('fholds','Holds and enquiries in the band feed')),
  row('Day sheet in the event','Load-in, soundcheck, address, parking in the description',tg('fday','Day sheet in the event')),
  row('Private notes','Never, in any feed',tag('draft','Always off'))),
  `<button class="btn ghost s" data-act="copytext" data-text="webcal://laas.dk/feed/lowtide/band/7f3a">${ic('copy','s')}Copy link</button>`,'inset')
 +sec('Public feed',rows(feedUrl('https://laas.dk/lowtide/gigs.ics','New public link made. The old one stops working'),
  row('Public feed on','Anyone with the link, or your website, sees confirmed gigs',tg('pub','Public feed on')),
  row('What is in it','Date, doors time, venue name and city, nothing else',sel('What is in it',['Date, doors, venue, city','Date and city only'])),
  row('Holds and enquiries','Never in the public feed',tag('draft','Always off')),
  row('Lead time','Gigs appear this long before the date',sel('Lead time',['As soon as confirmed','2 weeks before','1 month before'])),
  foot('What leaves the band: dates, venues, set times. What never leaves: fees, notes, contacts, riders, holds.','lock')),
  `<button class="btn ghost s" data-act="copytext" data-text="https://laas.dk/lowtide/gigs.ics">${ic('copy','s')}Copy link</button>`,'inset')
 +sec('Imports',`<div class="acc-list">${[
  ['Google Calendar, Vital','Two-way, 14 events matched to bookings, last sync 2 min ago',tag('confirmed','Connected')],
  ['Band rehearsal calendar (.ics)','Read-only, 6 rehearsals shown as busy, refreshed hourly',tag('confirmed','Connected')],
  ['Jonas\' day job (.ics)','Read-only, busy blocks only, used for availability asks',tag('attention','Not refreshed 3 days')]].map(([t,m,tg2],i)=>li('',t,m,tg2+ic('right','s'),`data-act="acccal" data-i="${i}"`)).join('')}${foot('Imported calendars only ever create "busy" and hold suggestions. Nothing is written back to them.')}</div>`,act('plus','Add calendar','accaddcal')));

/* ---------- Settings · Integrations (316:11090) ---------- */
L.VIEWS.integrations=()=>{const c=A.conn;
 const avail=(k,name,desc,missing)=>row(name,desc,c[k]?tag('confirmed','Connected'):missing?`<button class="acc-tagbtn" data-act="accconnect" data-k="${k}" data-n="${name}" aria-label="Add credentials for ${name}">${tag('attention','Credentials missing')}</button>`:sbtn('Connect','accconnect',`data-k="${k}" data-n="${name}"`));
 return shell('Integrations','Every row shows its state, nothing leaves the band without saying so',
 sec('Connected',rows(
  row('Google Calendar','Two-way, Low Tide gigs, last sync 2 min ago',tag('confirmed','Connected')),
  row('Gmail','Reads threads you pick, never sends without Confirm',tag('confirmed','Connected')),
  row('Danske Bank','Reads payments in, matches to invoices, high confidence only',tag('confirmed','Connected'))))
 +sec('Available',rows(
  avail('mobilepay','MobilePay Business','Shows payments in, needs your business number and a login',1),
  avail('dinero','Dinero','Pushes approved invoices and payments to your books',1),
  avail('spotify','Spotify for Artists','Pulls release dates and listener numbers, read-only'),
  avail('bandcamp','Bandcamp','Pulls releases and sales, read-only'),
  foot('Streaming and social posting are not planned for v1. Everything here is import; LAAS writes back only to the calendar and your books.')))
 +sec('Calendar feed',rows(
  row('Public feed','Anyone with the link sees gig dates and venues, fees are never in it',tg('ipub','Public feed')),
  row('Fees in the band feed','Members\' own calendars, off hides fee and deposit',tag('draft','Fees hidden')),
  row('Holds and enquiries','Shown as tentative in the band feed, never in the public one',tg('iholds','Holds and enquiries')),
  row('Day sheet link','Members get the day sheet in the event description',tg('iday','Day sheet link')),
  foot('What leaves the band: dates, venues, set times. What never leaves: fees, notes, contacts, riders.','lock')),
  `<button class="btn ghost s" data-act="copytext" data-text="https://laas.dk/lowtide/gigs.ics">${ic('copy','s')}Copy link</button>`));};

/* ---------- Settings · Theme (320:11638) ---------- */
const THEMES8=[
 ['label','Label','default, plain and warm',['#121212','#cdbdff','#ffffff']],
 ['minimal','Minimal','pure black and white, hairlines, terse',['#000000','#ffffff','#0d0d0d']],
 ['metal','Metal','bone on black, blackletter, dry',['#0a0a0a','#e8e2d6','#141414']],
 ['electronic','Electronic','acid lime on electric navy, mono, clipped',['#0a1020','#d9f25a','#111a2e']],
 ['classical','Classical','burgundy on ivory, gold light, programme-note',['#f6f1e7','#6e1f2b','#c9a04a']],
 ['folk','Folk','brown ink on paper, wood type, folksy',['#f1e8d8','#b5533c','#3b2a1a']],
 ['hiphop','Hip-hop & soul','orange on black, heavy display, loose',['#141414','#ff7a1a','#f5efe6']],
 ['pop','Pop & lofi','pink on dusk, rounded, soft',['#1e1a2e','#ff9ac4','#f4eeff']]];
const PALETTE={label:'Lilac, #CDBDFF',metal:'Bone, #E8E2D6',electronic:'Acid lime, #D9F25A',classical:'Burgundy, #6E1F2B'};
const appearSeg=()=>`<div class="seg acc-seg3">${[['dark','Dark','eye'],['light','Light','square'],['system','Match system','settings']].map(([k,l,i])=>`<button class="${S.appearance===k?'on':''}" data-appearance="${k}">${ic(i,'acc-i14')}${l}</button>`).join('')}</div>`;
L.VIEWS.theme=()=>{const cur=S.genre,name=SLOTNAME[cur];
 return shell('Theme','A theme is five slots: palette, backdrop, wordmark, one signature motion, tone of voice, money and status colours never change',
 sec('Pick a theme',`<div class="acc-fl"><span class="acc-lbl">Appearance</span>${appearSeg()}<span class="acc-help">Every theme has a light and a dark version. Match system follows your phone or computer.</span></div>
  <div class="acc-in12 acc-stack"><div class="acc-themes">${THEMES8.map(([id,n,d,c])=>{const on=cur===id,live=!!TNAME[id];return `<button class="acc-th ${on?'on':''}" ${live?`data-genre="${id}"`:`data-act="accproposal" data-n="${n}"`} aria-pressed="${on}"><span class="sw">${c.map(x=>`<i style="background:${x}"></i>`).join('')}</span><span class="nm"><span>${n}</span>${on?tag('accent','Current'):id==='metal'?tag('confirmed','Suggested for you'):''}</span><span class="d">${d}</span></button>`}).join('')}</div>
  <p class="acc-note">Suggested from your genres and cover art. Switching changes the room, not the facts: money tiles, tables, confirm cards and the assistant bar keep the Label look in every theme. Switch back any time.</p></div>`,
  cur!=='label'?`<button class="btn ghost s" data-genre="label">${ic('rotate','s')}Back to Label</button>`:'','inset')
 +sec(`What each slot does in ${name}`,rows(
  row('Palette','Token mode, lilac on near-black, light or dark follows the system',sel('Palette',[PALETTE[cur]])),
  row('Backdrop','The aurora behind the first-screen question',sel('Backdrop',['Config aurora','Plain canvas'])),
  row('Wordmark','The LAAS mark re-drawn in the theme\'s hand, yours stays in offers and invoices',sel('Wordmark',['Alien Block, eyes','Plain LAAS'])),
  row('Signature motion','One move on load and on big moments, nothing else',sel('Signature motion',['Soft aurora drift','None'])),
  row('Tone of voice','Greetings, empty states, chips, the hero question and success lines only, never labels, money, errors or legal copy',sel('Tone of voice',['Plain, warm, a colleague','Short and dry'])),
  row('Reduce motion','Follows your system setting, turns the signature motion into a fade',tg('motion','Reduce motion'))),
  act('upright','Preview on the dashboard','accgo','data-to="dashboard"')));};

/* ---------- Account (435:21287) ---------- */
const badge=`<button class="acc-store" data-act="acctoast" data-msg="Opens LAAS in the App Store" aria-label="Download on the App Store"><svg viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg><span><small>Download on the</small>App Store</span></button>`;
const NOTIF=[['n1','Email me when a venue opens or signs an offer'],['n2','A short summary every morning at 08:00'],['n3','Push on gig day: leave times and changes'],['n4','Product news, a few times a year']];
const card=(title,inner,action='')=>`<section class="acc-card"><div class="acc-ch"><h2 class="t-heading">${title}</h2>${action}</div>${inner}</section>`;
L.VIEWS.account=()=>shell('Account',`vital@lowtide.dk, signed in with Google, member of ${S.bands.length} band${S.bands.length===1?'':'s'}`,
 card('Profile',`<div class="acc-prof"><img src="${S.photos.you||IMG('booker')}" alt=""><div><b class="t-heading">Vital Sinkevich</b><span>Vocals, guitar. Shown to bandmates and on day sheets.</span><label class="btn secondary s" style="cursor:pointer;align-self:flex-start">${ic('upload','s')}Change photo<input type="file" accept="image/*" hidden data-photo="you"></label></div></div>
  <div class="acc-fields"><div class="field"><label for="acc-an">Name</label><input class="input" id="acc-an" style="width:360px" value="Vital Sinkevich" data-accsave></div><div class="field"><label for="acc-ap">Phone</label><input class="input" id="acc-ap" style="width:240px" value="+45 20 11 22 33" data-accsave><span class="help">Only bandmates see it</span></div></div>`)
 +card('Sign-in',`<div class="acc-signin">${[['mail','vital@lowtide.dk','Email, where sign-in links go',''],['check','Google','Connected 14 Sep 2026',''],['plus','Add a passkey','Sign in with Face ID or a fingerprint, no codes','data-act="accpasskey"']].map(([i,t,m,a])=>`<${a?'button':'div'} class="acc-si" ${a}>${ic(i,'acc-i32')}<span class="tx"><span>${t}</span><small>${m}</small></span></${a?'button':'div'}>`).join('')}</div>`)
 +card('Notifications',`<div class="acc-nl">${NOTIF.map(([k,l])=>`<div class="acc-nr">${tg(k,l)}<span>${l}</span></div>`).join('')}</div>`)
 +card('Language and region',`<div class="acc-fields"><div class="field"><label>App language</label>${sel('App language',['English','Dansk'])}</div><div class="field"><label>Mails to venues</label>${sel('Mails to venues',['Dansk','English'])}<span class="help">Drafts are written in this language</span></div></div>
  <div class="field"><label>Dashboard starts with</label><div class="seg acc-seg2"><button class="${S.dashStart==='ask'?'':'on'}" data-accseg>Overview</button><button class="${S.dashStart==='ask'?'on':''}" data-accseg>A question (Ask first)</button></div><span class="help">Ask first opens the dashboard on the assistant’s question box, with today below it.</span></div>`)
 +card('Personal assistant prompt',`<p class="acc-small">What the assistant should know about you and how to answer: tone, language, what to always ask first. It is added to every question you ask.</p>
  <div class="field acc-pp"><label for="acc-pp">About you and how to answer</label><textarea class="input" id="acc-pp" rows="6" maxlength="2000" data-accsave>${esc(A.prompt)}</textarea><span class="acc-pph"><span class="help">${ic('lock','s')}Private to you. Used in every band you are in, bandmates never see it.</span><span class="help mono" id="acc-ppn">${A.prompt.length} / 2000</span></span></div>
  <div class="row acc-ppact"><button class="btn ghost s" data-act="accppreset" ${A.prompt===PROMPT_EX?'disabled':''}>${ic('rotate','s')}Use the example</button><button class="btn ghost s" data-act="asstcan">What the assistant can do</button></div>`)
 +card('Your bands',`<div class="acc-bands">${S.bands.map(b=>`<div class="acc-bandrow"><button class="acc-band" data-act="switchband" data-band="${b.id}" data-to="settings">${b.id==='lt'?`<img src="${S.photos.band||IMG('band-collage')}" alt="">`:b.logo?`<img src="${b.logo}" alt="">`:`<span class="acc-bsq">${esc(b.ini)}</span>`}<span class="tx"><span>${esc(b.name)}</span><small>${b.id==='lt'?`Owner, 3 members, ${({free:'Free',band:'Band',pro:'Pro'})[S.plan]} plan`:`Owner, just you, ${esc(b.country)}, ${b.currency}`}</small></span></button>${S.bands.length<2?'':b.id===S.bandId?tag('accent','Current'):`<button class="btn ghost s" data-act="switchband" data-band="${b.id}">Switch</button>`}</div>`).join('')}</div>`,gflush('New band','newband','','plus'))
 +`<section class="acc-card acc-app"><span class="acc-appicon"><svg viewBox="0 0 90 24">${L.LOGO.replace(/<svg[^>]*>|<\/svg>/g,'')}</svg></span><div><h2 class="t-heading">LAAS on your iPhone</h2><p>Day sheets that work offline, a push when times change on gig day, receipts by camera. Same account, nothing to set up.</p>${badge}</div></section>`
 +card('Leave LAAS',`<p class="acc-small">Deleting your account removes your profile. Low Tide stays with its other owners; you’ll be asked to hand over ownership first.</p><div class="row"><button class="btn secondary" data-act="accsignout">Sign out everywhere</button><button class="btn ghost" data-act="accdelme">Delete my account</button></div>`));

/* Notifications (nav item; not drawn separately in Figma, same rows as Account → Notifications) */
L.VIEWS.notifications=()=>shell('Notifications','In-app always; email and push per person',
 card('How we reach you',`<div class="acc-nl">${NOTIF.map(([k,l])=>`<div class="acc-nr">${tg(k,l)}<span>${l}</span></div>`).join('')}</div><p class="acc-small">Gig-day changes push by default, money news emails by default, everything else stays in the app. Kept 90 days.</p>`));

/* ---------- Settings · Plan (435:21838) ---------- */
const pcard=(title,inner,action='')=>`<section class="acc-card"><div class="acc-ch"><h2 class="t-heading">${title}</h2>${action}</div>${inner}</section>`;
const pli=(icon,t,m,attrs='')=>`<${attrs?'button':'div'} class="acc-si" ${attrs}>${ic(icon,'acc-i32')}<span class="tx"><span>${t}</span><small>${m}</small></span></${attrs?'button':'div'}>`;
L.VIEWS.plan=()=>{const cur=S.plan,name={free:'Free',band:'Band',pro:'Pro'}[cur];
 const head={free:['0 DKK, free for one band. Up to 10 active bookings and 1 member.','Unlimited bookings and the whole band are on Band; invoices, reminders and settling are on Pro.'],
  band:['39 DKK a month, billed monthly. Next payment 14 Nov.','Unlimited bookings, contacts and day sheets for the whole band. Invoices, reminders and settling are on Pro.'],
  pro:['Pro trial, 14 days left. Then 199 DKK a month; cancel any time and you go back to Band.','Invoices with a pay link, reminders, settling and the bookkeeping export are on.']}[cur];
 const plans=[['free','Free','0 DKK','Trying it out',['10 active bookings','Contacts and venues','Day sheets','1 member']],['band','Band','39 DKK / month','Gigging bands',['Unlimited bookings','Whole band, any size','Calendar feed and import','Assistant']],['pro','Pro','199 DKK / month','Bands that invoice',['Everything in Band','Invoices with a pay link','Reminders and settling','Bookkeeping export']]];
 return shell('Plan and billing',`Low Tide is on ${name}. Billing goes to the owner, Vital`,
 `<section class="acc-cur"><h2 class="t-title">${name}</h2><p>${head[0]}</p><p class="acc-small">${head[1]}</p><div class="row acc-act">${cur!=='pro'?`<button class="btn accent" data-act="trypro">Try Pro free for 14 days</button>`:`<button class="btn secondary" data-act="endtrial">End trial</button>`}<button class="btn ghost" data-act="compare">Compare plans</button></div></section>`
 +`<div class="acc-plans" id="plancards">${plans.map(([id,n,p,w,f])=>{const on=id===cur;const a=on?null:id==='free'?gflush('Move to Free','movefree').replace('acc-gr','acc-gfl'):id==='band'?gflush('Move to Band','moveband').replace('acc-gr','acc-gfl'):`<button class="btn secondary s" data-act="trypro">Try Pro free</button>`;
  return `<div class="acc-plan ${on?'on':''}"><div class="nm"><span class="t-heading">${n}</span>${on?tag('accent','Current'):''}</div><span class="pr">${p}</span><span class="acc-small">${w}</span>${f.map(x=>`<span class="f">${ic('check','s')}${x}</span>`).join('')}<span class="sp"></span>${a||`<span class="acc-since">Your plan since 14 Sep</span>`}</div>`}).join('')}</div>`
 +pcard('Payment',`<div class="acc-signin">${pli('money','Card ending 4821','Expires 08/28, owner Vital Sinkevich')}${pli('mail','Receipts to vital@lowtide.dk','CVR and address on every receipt')}</div>`,gflush('Change card','acctoast','data-msg="Opens the secure card page"','pencil'))
 +pcard('Billing history',`<div class="acc-signin">${[['14 Oct 2026','October'],['14 Sep 2026','September']].map(([d,m])=>pli('file',d,'Band, 39 DKK, paid',`data-act="acctoast" data-msg="Receipt for ${m} downloaded"`)).join('')}</div>`));};

/* ---------- Upgrade · invoices are on Pro (435:22438) ---------- */
L.OVERLAYS.accupgrade=()=>`<div class="scrim acc-scrim" data-act="close"></div><div class="modal acc-upg" role="dialog" aria-modal="true" aria-label="Invoices are on Pro"><h2 class="t-title">Invoices are on Pro</h2><p class="muted">Send this invoice with a pay link, and LAAS chases it for you. Your bookings and data stay the same on any plan.</p>
 ${['Invoices with a card and bank pay link','Automatic påmindelser before and after due','Settle a gig and split the payouts','Export for your bookkeeper'].map(f=>`<span class="acc-f">${ic('check','s')}${f}</span>`).join('')}
 <p class="acc-small">199 DKK a month for the whole band after 14 free days. Cancel any time, you go back to Band.</p>
 <div class="row"><button class="btn ghost" data-act="close">Not now</button><button class="btn accent" data-act="accstartpro">Try Pro free for 14 days</button></div></div>`;
/* call from any "Send invoice": L.needsPro(() => open the invoice) shows the upgrade when the band is not on Pro */
L.needsPro=next=>{if(S.plan==='pro'){next&&next();return false;}A.afterPro=next||null;S.overlay={type:'accupgrade'};L.render();return true;};
L.FLOWS.push(['Upgrade at the moment of need','Band plan presses Send invoice',()=>{S.plan='band';L.go('booking');setTimeout(()=>{S.overlay={type:'accupgrade'};L.render();},160);}]);
L.FLOWS.push(['A member joins','Invite link, join the band',()=>{S.onboarding.step=6;L.go('onboarding');}]);

/* ---------- drawers ---------- */
L.DR.invite=(role='Member')=>({type:'drawer',title:'Invite to Low Tide',sub:'They get an email and join with one click',
 body:`<div class="acc-dr">${A.hide.invx?'':`<div class="acc-explainer sm"><div class="tx"><b>Nobody pays per member</b><span>Invites expire in 7 days. Roles can change any time in Members.</span></div><img src="${IMG('rehearsal')}" alt="">${xbtn('acchide','data-k="invx" data-keep="1"')}</div>`}
 <div class="field"><label for="acc-ie">Emails</label><input class="input" id="acc-ie" value="${role==='Viewer'?'books@dinero-hjaelp.dk':'jonas@lowtide.dk, mia.bass@gmail.com'}"><span class="help">Separate with commas, or paste a list</span></div>
 <div class="field"><label>Role</label><div class="acc-radios">${[['Admin','Everything except deleting the band. Sees money, can send offers and invoices.'],['Member','Gigs, day sheets, files and their own payouts. Can’t send to venues.'],['Viewer','Dates and day sheets only. For a manager, a driver or family.']].map(([t,s])=>`<button class="radio ${t===role?'on':''}" data-role="${t}"><i></i><span><b class="strong">${t}</b><br><span class="t-meta muted">${s}</span></span></button>`).join('')}</div></div>
 <div class="field"><label for="acc-ip">Plays</label><select class="input" id="acc-ip" style="width:240px"><option>Optional, they can add it</option><option>Bass</option><option>Drums</option><option>Keys</option><option>Vocals</option></select><span class="help">Shown in line-ups</span></div>
 <div class="field"><label for="acc-im">Message</label><input class="input" id="acc-im" value="Join us on LAAS, the gigs are all in here now"><span class="help">Optional, added to the email</span></div></div>`,
 foot:`<button class="btn ghost s" data-act="copytext" data-text="https://laas.app/join/low-tide-7Hq2">${ic('copy','s')}Copy invite link</button><span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="accsendinv" id="acc-sendinv">${ic('send','s')}${invLabel(role==='Viewer'?1:2)}</button>`});
function invLabel(n){return n===1?'Send invite':`Send ${n} invites`;}
const emails=v=>v.split(/[,;\s]+/).map(x=>x.trim()).filter(x=>x.includes('@'));
L.DR.accmember=m=>({type:'drawer',title:m.name,sub:`${m.role}, ${m.meta}`,
 body:`<div class="field"><label>Role</label><div class="acc-radios">${(m.role==='Owner'?['Owner']:['Admin','Member','Viewer']).map(r=>`<button class="radio ${r===m.role?'on':''}" data-role="${r}"><i></i><span><b class="strong">${r}</b></span></button>`).join('')}</div>${m.role==='Owner'?'<span class="help">To hand over Owner, use Transfer ownership in Band.</span>':''}</div>
 ${m.owed?`<div class="acc-banner att">${ic('alertc','s')}<div class="tx"><b>Jonas is owed 1.787 DKK</b><span>Settle Odense Live before he can leave the band.</span></div></div>`:''}`,
 foot:`${m.role!=='Owner'?`<button class="btn ghost acc-danger" data-act="accremove" data-id="${m.id}">Remove from band</button>`:''}<span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="accrole" data-id="${m.id}">Save role</button>`});
L.DR.accaddcal=()=>({type:'drawer',title:'Add a calendar',sub:'Read-only, shown as busy',body:`<div class="field"><label for="acc-cu">Calendar link (.ics)</label><input class="input" id="acc-cu" value="https://calendar.google.com/…/basic.ics"><span class="help">Busy blocks only; nothing is written back</span></div><div class="field"><label for="acc-cn">Name</label><input class="input" id="acc-cn" style="width:360px" value="Sofie’s teaching schedule"></div>`,foot:`<span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="close" data-msg="Calendar added, refreshes hourly">Add calendar</button>`});

/* ---------- actions ---------- */
const AC=L.ACTIONS;
AC.acctg=el=>{const k=el.dataset.k;A.tg[k]=!A.tg[k];el.classList.toggle('on',A.tg[k]);el.setAttribute('aria-checked',A.tg[k]);saved();};
AC.acchide=el=>{A.hide[el.dataset.k]=true;if(el.dataset.keep&&S.overlay){S.overlay=L.DR.invite(currentRole());}L.render();if(el.dataset.msg)L.toast(el.dataset.msg);};
AC.accretry=()=>saved();
AC.acctoast=el=>{if(S.overlay)L.close();L.toast(el.dataset.msg);};
AC.accgo=el=>{if(el.dataset.mt)S.mtab=el.dataset.mt;L.go(el.dataset.to);};
AC.accinvite=el=>{S.overlay=L.DR.invite(el.dataset.role||'Member');L.render();};
function currentRole(){return document.querySelector('.drawer .radio.on')?.dataset.role||'Member';}
AC.accsendinv=()=>{const list=emails(document.getElementById('acc-ie')?.value||'');if(!list.length){L.toast('Add at least one email');return;}
 const role=currentRole();const before=A.invites.slice();
 list.forEach(e=>A.invites.unshift({email:e,meta:`${role}, sent 21 Oct by you, expires 28 Oct, not opened`}));
 S.overlay=null;if(S.view!=='members')L.go('members');else L.render();
 L.toast(list.length===1?'Invite sent':`${list.length} invites sent`,()=>{A.invites=before;});};
AC.accresend=el=>{const v=A.invites[+el.dataset.i];v.meta=v.meta.replace(/sent [^,]+/,'sent 21 Oct');L.render();L.toast('Invite sent again to '+v.email);};
AC.accrevoke=el=>{const i=+el.dataset.i,v=A.invites[i];A.invites.splice(i,1);L.render();L.toast('Invite revoked, the link stops working',()=>{A.invites.splice(i,0,v);});};
AC.accmember=el=>{const m=A.members.find(x=>x.id===el.dataset.id);S.overlay=L.DR.accmember(m);L.render();};
AC.accrole=el=>{const m=A.members.find(x=>x.id===el.dataset.id);const r=currentRole(),was=m.role;m.role=r;S.overlay=null;L.render();if(r!==was)L.toast(`${m.name} is now ${r}`,()=>{m.role=was;});else saved();};
AC.accremove=el=>{const m=A.members.find(x=>x.id===el.dataset.id);if(m.owed){L.toast('Jonas is owed 1.787 DKK. Settle Odense Live first');return;}const i=A.members.indexOf(m);A.members.splice(i,1);S.overlay=null;L.render();L.toast(`${m.name} removed from Low Tide`,()=>{A.members.splice(i,0,m);});};
AC.acctransfer=()=>L.open('modal',{html:L.confirmM('Transfer ownership?','Mette Ravn becomes Owner, you become Admin. She gets an email and must accept within 7 days.','Cancel','acctransferok','Send transfer request')});
AC.acctransferok=()=>{L.close();L.toast('Transfer request sent to Mette Ravn');};
AC.accdelband=()=>L.open('modal',{html:L.confirmM('Delete Low Tide?','Bookings, contacts, invoices and money records go for everyone. You can undo it for 30 days from the email we send.','Keep the band','accdelbandok','Delete band',1)});
AC.accdelbandok=()=>{L.close();L.toast('Not deleted in the prototype. In LAAS an undo link would go to vital@lowtide.dk');};
AC.accconnect=el=>{const k=el.dataset.k,n=el.dataset.n;A.conn[k]=true;if(k==='spotify')S.audConnected=true;L.render();saved();L.toast(`${n} connected${['spotify','bandcamp'].includes(k)?', read-only':''}`,()=>{A.conn[k]=false;});};
AC.accproposal=el=>L.toast(`${el.dataset.n} is a proposal for later; the four live themes are Label, Metal, Electronic and Classical`);
AC.acccal=el=>{const i=+el.dataset.i;L.toast(i===2?'Jonas’ day job refreshed just now':i===0?'Google Calendar synced just now':'Rehearsal calendar refreshed just now');};
AC.accaddcal=()=>{S.overlay=L.DR.accaddcal();L.render();};
AC.accpasskey=()=>L.toast('Passkey added for this device');
AC.accnewband=()=>AC.newband();
AC.accppreset=()=>{const was=A.prompt;A.prompt=PROMPT_EX;L.render();saved();L.toast('Prompt set back to the example',()=>{A.prompt=was;});};

/* ---------- New band (LaaS 0.5 /account/bands/new/): drawer, creates a band and switches to it ----------
   Open from anywhere with data-act="newband" (the band menu in dashboard.js should call it). */
const COUNTRY={Denmark:['DKK','Europe/Copenhagen','Dansk'],Norway:['NOK','Europe/Oslo','Norsk'],Sweden:['SEK','Europe/Stockholm','Svenska'],Germany:['EUR','Europe/Berlin','Deutsch'],Finland:['EUR','Europe/Helsinki','Suomi'],'United Kingdom':['GBP','Europe/London','English']};
const CURR=['DKK','NOK','SEK','EUR','GBP'];
const TZS=['Europe/Copenhagen','Europe/Oslo','Europe/Stockholm','Europe/Berlin','Europe/Helsinki','Europe/London'];
const LANGS=['Dansk','English','Norsk','Svenska','Deutsch','Suomi'];
const opt=(list,v)=>list.map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('');
A.nb??=null;
function nbDraft(){return A.nb??={name:S.bands.some(b=>b.name==='Nordlys Kvartet')?'':'Nordlys Kvartet',city:'Tromsø',country:'Norway',currency:'NOK',tz:'Europe/Oslo',lang:'Norsk',logo:null};}
L.DR.newband=()=>{const d=nbDraft();
 return {type:'drawer',title:'New band',sub:'You become Owner. Nothing from '+esc(curBand().name)+' is copied',
 body:`<div class="acc-obphoto acc-nblogo"><span class="acc-nbprev" id="acc-nbprev">${d.logo?`<img src="${d.logo}" alt="">`:esc(iniOf(d.name))}</span><div><b class="strong">Logo</b><label class="btn secondary s" style="cursor:pointer">${ic('upload','s')}${d.logo?'Replace':'Upload logo'}<input type="file" accept="image/*" hidden data-nblogo></label><span class="help">Square, at least 400 px. Used on offers and the pay page.</span></div></div>
 <div class="field"><label for="acc-nbn">Band name</label><input class="input" id="acc-nbn" style="width:360px;max-width:100%" value="${esc(d.name)}" placeholder="The band’s name"><span class="help">Shown on offers, invoices and the pay page</span></div>
 <div class="field"><label for="acc-nbcity">Home city</label><input class="input" id="acc-nbcity" style="width:240px;max-width:100%" value="${esc(d.city)}"><span class="help">Travel distances start here</span></div>
 <div class="acc-two"><div class="field"><label for="acc-nbc">Country</label><select class="input" id="acc-nbc" style="width:212px">${opt(Object.keys(COUNTRY),d.country)}</select><span class="help">Sets currency, time zone and language</span></div>
 <div class="field"><label for="acc-nbcur">Currency</label><select class="input" id="acc-nbcur" style="width:120px">${opt(CURR,d.currency)}</select><span class="help">Fees and invoices</span></div></div>
 <div class="acc-two"><div class="field"><label for="acc-nbtz">Time zone</label><select class="input" id="acc-nbtz" style="width:212px">${opt(TZS,d.tz)}</select><span class="help">Gig times and reminders</span></div>
 <div class="field"><label for="acc-nbl">Language</label><select class="input" id="acc-nbl" style="width:160px">${opt(LANGS,d.lang)}</select><span class="help">Mails to venues are drafted in it</span></div></div>
 <p class="acc-small">Each band has its own gigs, contacts, money and members. Your profile and your assistant prompt come with you. Invite the band after it is created.</p>`,
 foot:`<span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="nbcreate">Create band</button>`};};
AC.newband=()=>{A.nb=null;S.overlay=L.DR.newband();L.render();setTimeout(()=>document.getElementById('acc-nbn')?.focus(),60);};
function nbRead(){const d=nbDraft(),v=id=>document.getElementById(id)?.value;
 d.name=(v('acc-nbn')??d.name);d.city=(v('acc-nbcity')??d.city);d.country=v('acc-nbc')||d.country;d.currency=v('acc-nbcur')||d.currency;d.tz=v('acc-nbtz')||d.tz;d.lang=v('acc-nbl')||d.lang;return d;}
AC.nbcreate=()=>{const d=nbRead(),name=d.name.trim();
 if(!name){L.toast('Give the band a name');document.getElementById('acc-nbn')?.focus();return;}
 if(S.bands.some(b=>b.name.toLowerCase()===name.toLowerCase())){L.toast(`You already have a band called ${name}`);return;}
 const prev={id:S.bandId,dashFirst:S.dashFirst,view:S.view};
 const b={id:'b'+Date.now().toString(36),name,ini:iniOf(name),meta:'Owner: just you',city:d.city.trim(),country:d.country,currency:d.currency,tz:d.tz,lang:d.lang,logo:d.logo,created:'21 Oct 2026'};
 S.bands.push(b);S.bandId=b.id;A.nb=null;S.overlay=null;S.dashFirst=true;L.go('dashboard');
 L.toast(`${name} created. You are in it now`,()=>{S.bands=S.bands.filter(x=>x.id!==b.id);S.bandId=prev.id;S.dashFirst=prev.dashFirst;L.go(prev.view);});};
/* switch band (Account → Your bands; the band menu can call data-act="switchband" data-band="<id>") */
AC.switchband=el=>{const id=el.dataset.band,b=S.bands.find(x=>x.id===id);if(S.overlay)S.overlay=null;
 if(!b||id===S.bandId){if(el.dataset.to)L.go(el.dataset.to);else L.render();return;}
 const prev={id:S.bandId,dashFirst:S.dashFirst,view:S.view};S.bandId=id;S.dashFirst=id!=='lt';L.go(el.dataset.to||'dashboard');
 L.toast(`Switched to ${b.name}`,()=>{S.bandId=prev.id;S.dashFirst=prev.dashFirst;L.go(prev.view);});};
L.CHANGE.push(t=>{
 if(t.id==='acc-nbc'){const d=nbRead(),c=COUNTRY[t.value];if(c){[d.currency,d.tz,d.lang]=c;}S.overlay=L.DR.newband();L.render();return true;}
 if(t.dataset&&t.dataset.nblogo!==undefined&&t.files&&t.files[0]){const d=nbRead();const r=new FileReader();r.onload=()=>{d.logo=r.result;S.overlay=L.DR.newband();L.render();L.toast('Logo added');};r.readAsDataURL(t.files[0]);return true;}
 if(t.closest&&t.closest('.drawer')&&/^acc-nb/.test(t.id)){nbRead();return true;}
});
L.INPUT.push(t=>{if(t.id==='acc-nbn'){const d=nbRead();const p=document.getElementById('acc-nbprev');if(p&&!d.logo)p.textContent=iniOf(t.value);return true;}});
L.FLOWS.push(['New band','Create a second band and switch to it',()=>{S.bandId='lt';L.go('account');setTimeout(()=>AC.newband(),160);}]);

/* the core sidebar says Low Tide; show the current band there until the core reads S.bands */
let patching=false;
function patchBand(){if(patching)return;patching=true;try{const b=curBand();if(b.id==='lt')return;
 const bt=document.querySelector('.sidebar .band');if(!bt)return;
 const sq=bt.querySelector('.sq'),nm=bt.querySelector('b'),sm=bt.querySelector('small');
 if(sq){if(b.logo&&!sq.querySelector('img'))sq.innerHTML=`<img src="${b.logo}" alt="" class="acc-sqimg">`;else if(!b.logo&&sq.textContent!==b.ini)sq.textContent=b.ini;}
 if(nm&&nm.textContent!==b.name)nm.textContent=b.name;if(sm&&sm.textContent!==b.meta)sm.textContent=b.meta;
 /* empty dashboard copy for the new band (dashboard.js says Low Tide) */
 const mn=S.view==='dashboard'&&S.dashFirst&&document.querySelector('.main');
 if(mn){const w=document.createTreeWalker(mn,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))if(n.nodeValue.includes('Low Tide'))n.nodeValue=n.nodeValue.replaceAll('Low Tide',b.name);
  mn.querySelectorAll('[placeholder*="Low Tide"]').forEach(x=>x.placeholder=x.placeholder.replaceAll('Low Tide',b.name));}
}finally{patching=false;}}
new MutationObserver(patchBand).observe(document.getElementById('app'),{childList:true});
AC.accsignout=()=>L.open('modal',{html:L.confirmM('Sign out everywhere?','Your phone, this computer and any other browser need a new sign-in link.','Cancel','accsignoutok','Sign out everywhere')});
AC.accsignoutok=()=>{L.close();S.onboarding.step=0;L.go('onboarding');L.toast('Signed out on 3 devices');};
AC.accdelme=()=>L.open('modal',{html:L.confirmM('Delete your account?','You are Owner of Low Tide. Hand over ownership first; then your profile is removed and Low Tide stays with the band.','Keep my account','accdelmeok','Hand over and delete',1)});
AC.accdelmeok=()=>{L.close();L.go('settings');L.toast('Pick a new Owner under Danger zone first');};
AC.trypro=()=>{A.afterPro=null;S.overlay={type:'accupgrade'};L.render();};
AC.accstartpro=()=>{S.plan='pro';S.overlay=null;const n=A.afterPro;A.afterPro=null;L.render();L.toast('Pro trial started, 14 days',()=>{S.plan='band';});if(n)setTimeout(n,60);};

/* inputs: settings search, autosave status, appearance select */
L.INPUT.push(t=>{
 if(t.id==='acc-q'){A.q=t.value;const pos=t.selectionStart;const nav=document.querySelector('.acc-nav');if(nav){const tmp=document.createElement('div');tmp.innerHTML=navHtml();nav.replaceWith(tmp.firstElementChild);const q=document.getElementById('acc-q');q.focus();q.setSelectionRange(pos,pos);}return true;}
 if(t.id==='acc-pp'){A.prompt=t.value;const n=document.getElementById('acc-ppn');if(n)n.textContent=t.value.length+' / 2000';const r=document.querySelector('[data-act="accppreset"]');if(r)r.disabled=t.value===PROMPT_EX;saved();return true;}
 if(t.closest&&t.closest('.acc-set')&&t.matches('input,textarea')){saved();return true;}
 if(t.id==='acc-ie'){const b=document.getElementById('acc-sendinv');if(b)b.innerHTML=ic('send','s')+invLabel(Math.max(1,emails(t.value).length));return true;}
});
L.CHANGE.push(t=>{
 if(t.id==='acc-appear'){S.appearance=t.value;L.render();saved();return true;}
 if(t.closest&&t.closest('.acc-set')&&t.matches('select')){saved();return true;}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-accseg]');if(b)setTimeout(saved);const z=e.target.closest('[data-accsize]');if(z)A.size=z.dataset.accsize;},true);

/* ---------- Audience (330:12770 overview, 330:13413 empty): replaces the core view, same data and actions ---------- */
L.VIEWS.audience=()=>{const t=S.atab,AUD=L.AUD,kr=L.kr;
 const head=`<div class="aud-ph"><div class="grow"><h1 class="t-display">Audience</h1><p>${S.audConnected?'Read-only in v1, Spotify for Artists and figures you type in, nothing is posted from here':'Nothing connected yet, read-only in v1'}</p></div><div class="aud-acts"><button class="btn secondary" data-act="addfigures">${ic('plus')}Add figures</button><button class="btn accent" data-act="connectsvc">${ic('plug')}Connect a service</button><button class="btn secondary aud-more" aria-label="More" data-act="audmore">${ic('more')}</button></div></div>`;
 const kpi=(l,v,sub,ok)=>`<div class="aud-kpi"><span class="l">${l}</span><span class="v">${v}</span><span class="d ${ok?'ok':''}">${sub}</span></div>`;
 if(!S.audConnected)return `<div class="page aud">${head}<section class="aud-empty"><div class="hd"><h2 class="t-title">No audience numbers yet</h2><p>Connect Spotify for Artists or YouTube (read-only), or type in the figures you have. LAAS never posts for you and never shows these numbers to venues.</p></div>
  <div class="ch">${[['Connect Spotify for Artists','Read-only, listeners, followers, streams, cities','connectspotify','stagedive'],['Connect YouTube','Read-only, subscribers and views','connectyoutube','studio-b'],['Type a figure in','YouSee, Apple, Bandcamp, one number a month is enough','addfigures','notebook']].map(([a,b,act,im])=>`<button class="aud-choice" data-act="${act}"><img src="${IMG(im)}" alt=""><b>${a}</b><span>${b}</span></button>`).join('')}</div></section>
  <div class="aud-kpis ghost">${kpi('Monthly listeners','—','from Spotify')}${kpi('Followers','—','Spotify and YouTube')}${kpi('Streams, last 28 days','—','from Spotify')}${kpi('Figures by hand','—','anything without an API')}</div></div>${L.audAbar()}`;
 const tabs=`<div class="aud-tabs" role="tablist">${[['overview','Overview'],['streaming','Streaming'],['hand','Figures by hand',S.figures.length],['releases','Releases']].map(([k,l,c])=>`<button role="tab" aria-selected="${t===k}" class="${t===k?'on':''}" data-atab="${k}"><span class="in">${l}${c?`<span class="c">${c}</span>`:''}</span></button>`).join('')}</div>`;
 const max=Math.max(...AUD.listeners);
 const chart=`<section class="acc-sec"><div class="acc-sh"><h2 class="t-title">Listeners, last 12 months</h2><button class="btn ghost s" data-act="datatable">${ic(S.dataTable?'x':'upright','s')}${S.dataTable?'Hide data table':'Show data table'}</button></div>
  <div class="aud-body"><div class="aud-bars">${AUD.listeners.map((n,i)=>`<i title="${AUD.months[i]}: ${kr(n)}" style="height:${Math.round(n/max*60)}px" class="${i===11?'on':''}"></i>`).join('')}</div>
  <div class="aud-leg"><span>Nov 2025 → Oct 2026, Spotify monthly listeners</span><span class="rel">● release months: Feb, May</span></div>
  ${S.dataTable?`<div class="table-wrap" style="background:var(--raised)"><table style="min-width:0"><thead><tr><th>Month</th><th class="num">Listeners</th></tr></thead><tbody>${AUD.months.map((m,i)=>`<tr style="cursor:default"><td>${m}${AUD.releases.includes(m)?' <span class="tag accent" style="height:20px">release</span>':''}</td><td class="num mono">${kr(AUD.listeners[i])}</td></tr>`).join('')}</tbody></table></div>`:''}
  <p class="aud-note">One source per line. Hand-entered figures are drawn dashed and never mixed into a total with API figures.</p></div></section>`;
 const services=sec('By service',`<div class="acc-list">${AUD.services.map(([id,n,d,tg])=>li(L.brand(n,32),n,d,tag(tg[0],tg[1])+ic('right','s'),`data-act="svc" data-id="${id}"`)).join('')}</div>`,act('plus','Connect another','connectsvc'));
 const where=`<section class="acc-sec"><div class="acc-sh"><h2 class="t-title">Where they are</h2></div><div class="aud-body">${AUD.cities.map(([c,p])=>`<div class="aud-city"><span>${c}</span><span class="tr"><i style="width:${Math.round(p/31*200)}px"></i></span><span class="pc">${p} %</span></div>`).join('')}<p class="aud-note">Spotify, last 28 days. Use it to pick the next gig city; the assistant can suggest venues there.</p></div></section>`;
 const rel=`<section class="acc-sec"><div class="acc-sh"><h2 class="t-title">First 28 days per release</h2></div><div class="aud-body">${AUD.rel.map(([a,b,n])=>`<button class="aud-rel" data-go="catalogue"><span class="tx"><span>${a}</span><small>${b}</small></span><span class="n">${n}</span></button>`).join('')}<p class="aud-note">Streams in the first 28 days. Pitching on time is the one lever you control; the release plan reminds you.</p></div></section>`;
 let body;
 if(t==='overview')body=`${S.audBanner!==false?`<div class="acc-banner">${ic('ai')}<div class="tx"><b>Late Shift pre-save link is live, 112 saves so far</b><span>Saves show up here daily from Feature.fm. Release day lift is usually 3–5× your current daily listeners; that is the number to beat on 14 Nov.</span></div><button class="btn secondary s" data-go="release">Open the plan</button>${xbtn('audbanner')}</div>`:''}
 <div class="aud-kpis">${kpi('Monthly listeners','2.340','Spotify, +18 % vs September',1)}${kpi('Followers','1.102','Spotify 870, YouTube 232',1)}${kpi('Streams, last 28 days','14.800','Spotify, "Low Tide" is 61 %')}${kpi('Figures by hand',S.figures.length+' entries','YouSee and Bandcamp, last 1 Oct')}</div>
 <div class="aud-cols"><div class="col">${chart}${services}</div><div class="col">${where}${rel}</div></div>`;
 else if(t==='streaming')body=`<div class="aud-cols"><div class="col">${chart}${sec('Top songs, last 28 days',`<div class="acc-list">${AUD.songs.map(([n,p,c],i)=>li(`<span class="mono faint aud-i">${i+1}</span>`,n,p+' of streams',`<span class="mono">${c}</span>`)).join('')}</div>`)}</div><div class="col">${where}</div></div>`;
 else if(t==='hand')body=sec('Figures by hand',`<div class="acc-list">${S.figures.map(([d,sv,what,n])=>li(L.brand(sv,32),sv,`${what}, added ${d}`,`<span class="mono">${n}</span>`)).join('')}</div>`+`<p class="acc-foot">Typed-in figures are kept apart from API figures and drawn dashed on charts.</p>`,`<button class="btn secondary s" data-act="addfigures">${ic('plus','s')}Add figures</button>`);
 else body=`<div class="aud-cols">${rel}<aside class="panel"><div class="sec"><h3 class="t-heading">Next release</h3><span>Late Shift, out Fri 14 Nov</span><span class="t-meta muted">112 pre-saves so far. Pitch to Spotify by 7 Nov.</span><button class="btn secondary s" style="align-self:flex-start" data-go="release">Open the plan</button></div></aside></div>`;
 return `<div class="page aud">${head}${tabs}${body}</div>${L.audAbar()}`;};

/* ---------- onboarding (full screen): L.ONBOARDING ---------- */
const OB_PHOTO=['stagedive','notebook','rehearsal','account-folk',null,'account-dj','hotel-royal'];
const GOOGLE=`<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;
const APPLE=`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style="fill:currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>`;
const fld=(id,label,val,w,help,ph)=>`<div class="field"><label for="${id}">${label}</label><input class="input" id="${id}" ${w?`style="width:${w}px"`:''} ${val?`value="${esc(val)}"`:''} ${ph?`placeholder="${esc(ph)}"`:''}>${help?`<span class="help">${help}</span>`:''}</div>`;
const fsel=(id,label,opts,w,help)=>`<div class="field"><label for="${id}">${label}</label><select class="input" id="${id}" style="width:${w}px">${opts.map(o=>`<option>${o}</option>`).join('')}</select>${help?`<span class="help">${help}</span>`:''}</div>`;
const head=(t,p)=>`<div class="acc-obh"><h1 class="t-title">${t}</h1><p>${p}</p></div>`;
/* Vit 21 Oct: "we need country and more genres" (onboarding and Settings share these lists) */
const GENRES=L.GENRES=['Indie and rock','Shoegaze and dream pop','Punk','Metal and hardcore','Electronic','Hip-hop and soul','R&B','Pop','Folk','Singer-songwriter','Country and Americana','Blues','Jazz','Classical','Reggae and ska','Latin','World','Ambient and experimental'];
const COUNTRIES=L.COUNTRIES=['Denmark','Sweden','Norway','Finland','Iceland','Germany','Netherlands','United Kingdom','Ireland','France','Spain','Another country'];
const obGenres=()=>S.onboarding.genres||(S.onboarding.genres=[S.onboarding.genre]);

/* mini dashboard used for the live window and the theme card previews (tokens, so it follows the theme) */
function mini(g=S.genre){const h={metal:'What are we unleashing first?',classical:'What is on the programme first?'}[g]||'What should we set up first?';
 return `<div class="acc-mini" aria-hidden="true"><div class="mt"><span class="lg">${L.LOGO}</span><small>artist platform</small><span style="flex:1"></span><span class="sp">${ic('search','s')}Search for anything</span>${ic('bell','s')}<span class="you">V</span><span>Vital</span></div>
 <div class="mb"><div class="ms"><div class="bd"><span class="sq">LT</span><span><b>Low Tide</b><small>Owner: 3 members</small></span></div>${[['dashboard','Dashboard',1],['ai','Assistant'],['file','Gigs'],['','Bookings'],['','Calendar'],['','Contacts'],['','Venues'],['','Mail'],['money','Money'],['disc','Catalogue'],['radio','Audience']].map(([i,l,on])=>`<span class="ni ${on?'on':''} ${i?'':'sub'}">${i?ic(i,'s'):''}${l}</span>`).join('')}<span style="flex:1"></span><span class="ni"><i class="dot"></i>Theme: ${SLOTNAME[g]}</span><span class="ni">${ic('plug','s')}Integrations</span><span class="ni">${ic('settings','s')}Band settings</span></div>
 <div class="mm"><h3>${h}</h3><p>Low Tide has nothing on the calendar. Silence, for now. Ask, or pick a start below; nothing is written until you confirm.</p>
 <div class="ask"><span>Add a gig, find who owes us, move a rehearsal…</span><div class="ar"><span>${ic('plus','s')}Add context</span><span style="flex:1"></span><span>Ask ${ic('down','s')}</span><span class="send">${ic('send','s')}Send</span></div></div>
 <div class="chips">${['Add our next gig','Import my calendar','Who still owes us an invoice?','Show me a sample band'].map(c=>`<span>${ic('ai','s')}${c}</span>`).join('')}</div>
 <h4>Or start by hand</h4><p class="sm">Create the first booking, import a calendar, or look around a sample band marked as test.</p>
 <div class="cards">${[['odense-live','Create a booking','Date, venue, fee, people'],['notebook','Import calendar','Google, Microsoft 365 or .ics'],['studio-b','Sample band','Marked as test, delete any time']].map(([im,t,s])=>`<span><img src="${IMG(im)}" alt=""><b>${t}</b><small>${s}</small></span>`).join('')}</div></div></div></div>`;}
function fitWin(){document.querySelectorAll('.acc-win').forEach(w=>{const s=w.clientWidth/1456;w.style.setProperty('--k',s);w.style.height=(910*s)+'px';});}
addEventListener('resize',fitWin);

function obSteps(st){const ob=S.onboarding;
 switch(st){
 case 0:return head('Run your band like a label','Gigs, contacts, money and releases in one place. Free for one band, no card needed.')
  +`<div class="acc-obstack"><button class="btn secondary lg acc-wide" data-ob="1">${GOOGLE}Continue with Google</button><button class="btn secondary lg acc-wide" data-ob="1">${APPLE}Continue with Apple</button></div>
  <div class="acc-or"><i></i><span>or</span><i></i></div>
  <div class="acc-obstack">${fld('acc-obe','Email','',0,'','you@band.dk')}<button class="btn accent lg acc-wide" data-ob="1">Continue with email</button></div>
  <p class="acc-obfoot">Already have an account? <button class="link" data-act="obexit">Log in</button>. By continuing you accept the <button class="link" data-act="acctoast" data-msg="Terms open in a new tab">terms</button> and the <button class="link" data-act="acctoast" data-msg="Privacy policy opens in a new tab">privacy policy</button>.</p>`;
 case 1:return head('Check your inbox','We sent a 6-digit code and a sign-in link to vital@lowtide.dk. Both work for 15 minutes.')
  +`<div class="acc-code">${[4,1,7,'','',''].map((d,i)=>`<input aria-label="Digit ${i+1}" inputmode="numeric" maxlength="1" value="${d}" data-digit="${i}" ${i===3?'autofocus':''}>`).join('')}</div>
  <div class="row"><button class="btn secondary" data-act="accoblink">${ic('mail')}Open Gmail</button><button class="btn ghost" data-act="resend" ${S.resent?'disabled':''}>${S.resent?'Code sent again':'Resend in 30 s'}</button></div>
  <p class="acc-obfoot">Wrong address? <button class="link" data-ob="0">Use a different email</button>.</p>`;
 case 2:return head('About you','Takes a minute. You can change all of it in Account.')
  +`<div class="acc-obphoto"><img class="round" src="${S.photos.you||IMG('booker')}" alt=""><div><label class="btn secondary s" style="cursor:pointer">${ic('upload','s')}Change photo<input type="file" accept="image/*" hidden data-photo="you"></label><span class="help">Square, at least 400 px. Shown on the day sheet.</span></div></div>
  ${fld('acc-yn','Your name','Vital Sinkevich',360)}
  <div class="acc-two">${fsel('acc-yp','You play',['Vocals, guitar','Vocals','Guitar','Bass','Drums','Keys'],212,'Used for line-ups and day sheets')}${fsel('acc-yl','Language',['Dansk','English'],212,'Mails to venues use it')}</div>
  <div class="row"><button class="btn accent" data-ob="3">Continue</button></div>`;
 case 3:return head('Your band','One account can run several bands. Start with this one.')
  +`<div class="acc-obphoto"><img src="${S.photos.band||IMG('band-collage')}" alt=""><div><b class="strong">Low Tide, band photo</b><label class="btn ghost s" style="cursor:pointer;align-self:flex-start">${ic('upload','s')}Replace<input type="file" accept="image/*" hidden data-photo="band"></label></div></div>
  ${fld('acc-bn','Band name','Low Tide',360)}
  <div class="acc-two">${fsel('acc-bco','Country',COUNTRIES,212,'Sets currency, VAT and time zone')}${fld('acc-bc','Home city','Odense',212,'Travel distances start here')}</div>
  <div class="field"><span class="acc-lbl">What do you play?</span><div class="acc-genres">${GENRES.map(g=>{const on=obGenres().includes(g);return `<button class="acc-gc ${on?'on':''}" data-obgenre="${g}" aria-pressed="${on}">${g}</button>`;}).join('')}</div><span class="help">Pick all that fit. The first one picks the look on the next step.</span></div>
  <div class="field"><span class="acc-lbl">How many of you?</span><div class="seg acc-size">${['Just me','2','3–4','5+'].map(s=>`<button class="${A.size===s?'on':''}" data-accsize="${s}">${s}</button>`).join('')}</div></div>
  <div class="row"><button class="btn ghost" data-ob="2">Back</button><button class="btn accent" data-act="accobband">Continue</button></div>`;
 case 4:{const match=GENRE_THEME[ob.genre]||'label';const order=[match,...['label','metal','electronic','classical'].filter(x=>x!==match)];
  const desc={label:'The LAAS look, lilac on dark',metal:'Black and bone, hard type',electronic:'Electric navy and lime',classical:'Ivory, gold and burgundy'};
  /* Vit 21 Oct: genre and band size are asked on "Your band"; this step is the look only (Figma 443:19646 still has the older version) */
  return head('Pick your look',match==='label'?`The default look fits ${ob.genre.toLowerCase()}. Switch any time in Settings.`:`We picked ${TNAME[match]} for ${ob.genre.toLowerCase()}. Switch any time in Settings, or keep the default.`)
  +`<span class="acc-lbl">Look</span><div class="acc-obthemes">${order.map(id=>`<button class="acc-obth ${S.genre===id?'on':''}" data-genre="${id}" aria-pressed="${S.genre===id}"><span class="pv tok-${id}-${id==='classical'?'light':'dark'}">${mini(id)}${id===match&&match!=='label'?'<span class="fits">Fits your genre</span>':''}</span><span class="nm">${TNAME[id]}</span><span class="d">${desc[id]}</span></button>`).join('')}</div>
  <div class="field"><span class="acc-lbl">Appearance</span>${appearSeg()}<span class="help">Every theme has a light and a dark version. Match system follows your phone or computer.</span></div>
  <p class="acc-obfoot">Money, contracts and anything a venue sees always stay in the plain LAAS style.</p>
  <div class="row"><button class="btn ghost" data-ob="3">Back</button><button class="btn secondary" data-act="obdefault">Keep the default</button><button class="btn accent" data-ob="5">Use ${TNAME[S.genre]}</button></div>`;}
 case 5:{const rows=[['jonas@lowtide.dk','Admin'],['mia.bass@gmail.com','Member']];while(rows.length<A.obRows)rows.push(['','Member']);
  return head('Bring the band','They get an email to join Low Tide. Nobody pays per member.')
  +`<div class="acc-obinv">${rows.map(([m,r],i)=>`<div class="acc-two">${fld('acc-oe'+i,'Email',m,268,'',m?'':'Another bandmate')}<div class="field"><label for="acc-or${i}">Role</label><select class="input" id="acc-or${i}" style="width:160px">${['Admin','Member','Viewer'].map(o=>`<option ${o===r?'selected':''}>${o}</option>`).join('')}</select></div></div>`).join('')}</div>
  <button class="btn ghost s acc-add" data-act="accobrow">${ic('plus','s')}Add another</button>
  <p class="acc-obfoot">Owner and Admin see money and can send. Member sees gigs, the day sheet and their own payouts. Viewer sees dates only, good for a manager or family.</p>
  <div class="row"><button class="btn ghost" data-act="accobskip">Skip for now</button><button class="btn accent" data-act="accobsend" id="acc-obsend">${ic('send','s')}Send 2 invites</button></div>`;}
 case 6:return `<div class="acc-join"><img src="${S.photos.band||IMG('band-collage')}" alt=""><div><b class="t-heading">Low Tide</b><span>Indie rock, Odense, 3 members</span></div></div>`
  +head('Vital invited you as Member','You’ll see gigs, the day sheet and your own payouts. Money and sending stay with Owner and Admin.')
  +fld('acc-jn','Your name','Mia Holm',360)+fsel('acc-jp','You play',['Bass','Drums','Guitar','Keys','Vocals'],240)
  +`<div class="row"><button class="btn ghost" data-act="accnotme">Not me</button><button class="btn accent" data-act="accjoin">Join Low Tide</button></div>`;
 }}
L.ONBOARDING=function(){const st=S.onboarding.step|0;const photo=OB_PHOTO[st];const prog=st>=2&&st<=5;
 queueMicrotask(()=>{fitWin();if(st===1){const d=document.querySelector('[data-digit="3"]');if(d&&document.activeElement===document.body)d.focus();}});
 const right=st===4?`<div class="r acc-live"><div class="acc-win">${mini()}</div><span class="cap">Preview: Low Tide in ${TNAME[S.genre]}</span></div>`:`<div class="r"><img src="${IMG(photo)}" alt=""></div>`;
 return `<div class="acc-ob ${st===4?'snd':''}"><div class="l"><div class="acc-obtop"><span class="logo">${L.LOGO}</span><span style="flex:1"></span>${prog?`<span class="t-meta muted">Step ${st-1} of 4</span>`:''}${L.flowBtnInline()}</div>
 ${prog?`<div class="bar4">${[1,2,3,4].map(i=>`<i class="${i<=st-1?'on':''}"></i>`).join('')}</div>`:''}
 <div class="acc-obform">${obSteps(st)}</div></div>${right}</div>`;};

AC.accoblink=()=>{S.onboarding.step=2;L.render();L.toast('Signed in from the link in your inbox');};
AC.accobband=()=>{S.genre=GENRE_THEME[S.onboarding.genre]||'label';S.onboarding.step=4;L.render();};
AC.accobrow=()=>{A.obRows++;L.render();};
AC.accobskip=()=>{L.go('dashboard');L.toast('Welcome to LAAS. Invite the band any time from Members');};
AC.accobsend=()=>{const n=[...document.querySelectorAll('.acc-obinv input')].filter(i=>i.value.includes('@')).length;L.go('dashboard');L.toast(n?`Welcome to LAAS. ${n} invite${n===1?'':'s'} sent`:'Welcome to LAAS');};
AC.accnotme=()=>{S.onboarding.step=0;L.render();L.toast('Invite left as it was. Sign in with your own email');};
AC.accjoin=()=>{L.go('dashboard');L.toast('You joined Low Tide as Member');};
L.INPUT.push(t=>{
 if(t.dataset&&t.dataset.digit!==undefined){t.value=t.value.replace(/\D/g,'').slice(-1);const i=+t.dataset.digit;if(t.value&&i<5)document.querySelector(`[data-digit="${i+1}"]`)?.focus();
  const all=[...document.querySelectorAll('[data-digit]')].every(x=>x.value);if(all){S.onboarding.step=2;setTimeout(()=>{L.render();L.toast('Email confirmed');},150);}return true;}
 if(t.closest&&t.closest('.acc-obinv')){const n=[...document.querySelectorAll('.acc-obinv input')].filter(i=>i.value.includes('@')).length;const b=document.getElementById('acc-obsend');if(b)b.innerHTML=ic('send','s')+(n?`Send ${n} invite${n===1?'':'s'}`:'Send invites');return true;}
});
})();

AC.accbgenre=t=>{const g=t.dataset.g,l=A.genres;const i=l.indexOf(g);if(i>=0){if(l.length===1)return L.toast('Keep at least one genre');l.splice(i,1);}else l.push(g);L.render();L.toast('Genres saved');};
