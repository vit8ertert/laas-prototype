/* LAAS prototype · catalogue area. Rebuilt 1:1 from the Figma section "UX · Catalogue & gear" (page Build · LAAS v1.0).
   Views: catalogue (Releases list, empty state), release (just created, uploading, blocked, ready, delivered), pastrelease, gear.
   Uses window.LAAS (see index.html). */
(function(){
"use strict";
const L=window.LAAS;const S=L.S;const ic=L.ic;const esc=L.esc;const IMG=L.IMG;const kr=L.kr;

L.P.arrowleft='<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>';
L.P.circlecheck='<path d="M20 6 9 17l-5-5"/>';

/* ---------- data ---------- */
const PASTC=[
 {id:'lt',title:'Low Tide',kind:'Single',year:'2026',date:'2 May 2026',img:'catalogue-low-tide',meta:'Single, 1 track, 2 May 2026, live on 9 stores',tag:['confirmed','Live'],
  tracks:[['Low Tide','3:41']],streams:'48.200',earn:'1.930',koda:'Registered',distributor:'DistroKid'},
 {id:'fl',title:'First Light',kind:'Single',year:'2026',date:'13 Feb 2026',img:'catalogue-first-light',meta:'Single, 1 track, 13 Feb 2026, live',tag:['confirmed','Live'],
  tracks:[['First Light','4:05','Registered at Koda, not at Gramex']],streams:'31.900',earn:'1.270',koda:'Registered, Gramex missing',distributor:'DistroKid'},
 {id:'lp',title:'Untitled LP',kind:'Album',year:'2025',date:'2025',img:'catalogue-untitled-lp',meta:'Album, 5 tracks, 2025, live, 1 song not registered at Koda',tag:['attention','Check'],
  tracks:[['Harbour','3:02'],['Salt','2:41'],['Ferry','2:36'],['Night Bus','2:50','Not registered at Koda'],['Untitled','2:23']],streams:'22.400',earn:'860',koda:'4 of 5 registered',distributor:'CD Baby'}];
const LS_TRACKS=[['Late Shift','4:12'],['Harbour Lights','3:58','Explicit flag not set'],['Low Tide (Original Mix)','4:40','Title flagged by Beatport rules'],['Closing Time','3:52']];
L.PASTC=PASTC;
const PEOPLE=[['MR','Mette Ravn','Writer, vocals','40 %'],['SL','Sofie Lund','Writer, synth','30 %'],['JH','Jonas Holm','Writer, drums','30 %']];

/* gear: [id, item, serial, category, insured, last service, owner, status, value] */
const G=(id,item,serial,cat,ins,last,owner,status,value)=>({id,item,serial,cat,ins,last,owner,status,value});
const GEAR=[
 G('g14','Shure SM58','LT-GEAR-014','Microphones',1,'2 Oct 2026','Band','attention',1100),
 G('g03','Fender Jazz Bass','LT-GEAR-003','Instruments',1,'14 May 2026','Mia','',12400),
 G('g04','Ampeg SVT-CL','LT-GEAR-004','Amps',1,'14 May 2026','Band','',18900),
 G('g09','Nord Stage 3','LT-GEAR-009','Keys',1,'3 Jan 2026','Band','',28500),
 G('g11','Pearl Export kit','LT-GEAR-011','Drums',0,'','Jonas','draft',9800),
 G('g21','Shure PSM300','LT-GEAR-021','Monitoring',1,'20 Aug 2026','Band','',7200),
 G('g30','Flight case 120×60','LT-GEAR-030','Cases',0,'','Band','',2400),
 G('g01','Van, Ford Transit','LT-GEAR-001','Transport',1,'28 Sep 2026','Band','confirmed',86000),
 G('g02','Fender Telecaster','LT-GEAR-002','Instruments',1,'14 May 2026','Mette','',9600),
 G('g05','Fender Hot Rod Deluxe','LT-GEAR-005','Amps',1,'14 May 2026','Mette','',6400),
 G('g06','Sennheiser e906','LT-GEAR-006','Microphones',1,'2 Oct 2026','Band','',1000),
 G('g07','AKG D112','LT-GEAR-007','Microphones',1,'2 Oct 2026','Band','',1500),
 G('g08','Sennheiser e835, pair','LT-GEAR-008','Microphones',1,'2 Oct 2026','Band','',1600),
 G('g10','Korg Minilogue','LT-GEAR-010','Keys',1,'3 Jan 2026','Sofie','',3900),
 G('g12','Zildjian A cymbal set','LT-GEAR-012','Drums',1,'','Jonas','',4200),
 G('g13','Snare, Ludwig Supraphonic','LT-GEAR-013','Drums',1,'','Jonas','',3800),
 G('g15','Behringer X32 Rack','LT-GEAR-015','Monitoring',1,'20 Aug 2026','Band','',8900),
 G('g16','DI boxes, 4','LT-GEAR-016','Cables and DI',0,'','Band','',1200),
 G('g17','XLR cables, 20','LT-GEAR-017','Cables and DI',0,'','Band','',1400),
 G('g18','Jack cables, 12','LT-GEAR-018','Cables and DI',0,'','Band','',700),
 G('g19','Pedalboard, Mette','LT-GEAR-019','Effects',1,'','Mette','',5200),
 G('g20','Pedalboard, Mia','LT-GEAR-020','Effects',1,'','Mia','',3100),
 G('g22','In-ear packs, 3','LT-GEAR-022','Monitoring',1,'20 Aug 2026','Band','',4500),
 G('g23','Mic stands, 6','LT-GEAR-023','Stands',0,'','Band','',1300),
 G('g24','Keyboard stand','LT-GEAR-024','Stands',0,'','Sofie','',500),
 G('g25','Guitar stands, 3','LT-GEAR-025','Stands',0,'','Band','',450),
 G('g26','Merch table and banner','LT-GEAR-026','Merch',0,'','Band','',1800),
 G('g27','Card reader, SumUp','LT-GEAR-027','Merch',1,'','Band','',400),
 G('g28','LED bars, 4','LT-GEAR-028','Lights',1,'20 Aug 2026','Band','',3600),
 G('g29','Smoke machine','LT-GEAR-029','Lights',1,'20 Aug 2026','Band','',1900),
 G('g31','Flight case, keys','LT-GEAR-031','Cases',1,'','Band','',2100),
 G('g32','Bass cab, Ampeg 4×10','LT-GEAR-032','Amps',1,'14 May 2026','Band','',7400),
 G('g33','Audio interface, RME','LT-GEAR-033','Recording',1,'','Band','',6800),
 G('g34','Laptop, MacBook Air','LT-GEAR-034','Recording',1,'','Sofie','',9200),
 G('g35','Studio monitors, pair','LT-GEAR-035','Recording',1,'','Band','',4300),
 G('g36','Headphones, 4','LT-GEAR-036','Recording',1,'','Band','',2200),
 G('g37','Power strips, 6','LT-GEAR-037','Cables and DI',1,'','Band','',600),
 G('g38','Toolbox and spares','LT-GEAR-038','Cases',1,'','Band','',900)];

S.cat??={tab:'releases',more:false};
S.rel??={check:false,passed:false,activity:false};
S.gear??={q:'',filter:'all',cat:'all',owner:'band',all:false,added:0};
const BASE_GEAR=GEAR.length,BASE_VALUE=184600;

/* ---------- small parts ---------- */
const tag=(k,l)=>`<span class="tag ${k}">${l}</span>`;
const back=(label,go)=>`<button class="btn ghost s cat-back" data-go="${go}">${ic('arrowleft','s')}${label}</button>`;
const kpi=(label,value,delta,tone='')=>`<div class="cat-kpi ${tone==='attention'?'att':''}"><span class="t-meta muted">${label}</span><span class="v">${value}</span><span class="t-meta ${tone==='attention'?'c-att':tone==='ok'?'c-ok':'muted'}">${delta}</span></div>`;
/* Figma "Tabs" 1116×49: tab row (gap 20) + 1 px rule; Tab 298:5092 = column of inner (pad 12 4, gap 8) and a 2 px indicator */
const tabs=(items,cur,attr)=>`<div class="tabs cat-tabs"><div class="cat-tabrow" role="tablist">${items.map(([k,l,c])=>`<button role="tab" class="${cur===k?'on':''}" ${attr}="${k}"><span class="in">${l}${c!=null&&c!==''?`<span class="c">${c}</span>`:''}</span><i class="ind"></i></button>`).join('')}</div><i class="cat-tabrule"></i></div>`;
const R=()=>S.release;
const hasRel=()=>R().stage!=='none';
const coverHtml=(cls)=>R().stage==='created'&&!R().cover?`<div class="${cls} cat-cover-ph">${ic('disc')}</div>`:`<img class="${cls}" src="${IMG('cover-late-shift')}" alt="">`;

/* ---------- Releases list ---------- */
function relTile(){const st=R().stage;
 const meta={created:'EP, no tracks yet, 14 Nov 2026, draft',uploading:'EP, 4 tracks, 14 Nov 2026, checking',blocked:'EP, 4 tracks, 14 Nov 2026, in pre-flight',ready:'EP, 4 tracks, 14 Nov 2026, ready to deliver',delivered:'EP, 4 tracks, 14 Nov 2026, delivered'}[st];
 const t=st==='delivered'?['confirmed','Delivered']:st==='created'||st==='uploading'?['draft','Draft']:['attention','Scheduled'];
 return `<div class="cat-tilewrap"><button class="cat-tile" data-go="release">${R().stage==='created'&&!R().cover?`<div class="art cat-cover-ph">${ic('disc')}</div>`:`<img class="art" src="${IMG('cover-late-shift')}" alt="">`}<b>${esc(R().title)}</b><small>${meta}</small></button><div class="st">${tag(t[0],t[1])}</div></div>`;}
const pastTile=r=>`<div class="cat-tilewrap"><button class="cat-tile" data-go="pastrelease" data-id="${r.id}"><img class="art" src="${IMG(r.img)}" alt=""><b>${r.title}</b><small>${r.meta}</small></button><div class="st">${tag(r.tag[0],r.tag[1])}</div></div>`;

function banner(){const st=R().stage,t=esc(R().title);
 const b={blocked:['attention','alert',`${t}, 25 days to release, pitch window opens in 4 days`,'Pre-flight: 1 thing blocks delivery (cover art text does not match the title), 3 worth a look. Spotify pitch needs 7 days, Apple 10, the distributor 21.'],
  created:['attention','alert',`${t}, 25 days to release, tracks and a cover still to come`,'Pre-flight runs when they are in. Spotify pitch needs 7 days, Apple 10, the distributor 21.'],
  uploading:['info','ai',`${t} is uploading, checks run as tracks finish`,'About a minute. Nothing is sent anywhere until you press Deliver.'],
  ready:['info','ai',`${t} is ready to deliver`,'Nothing blocks delivery. 4 things are worth a look first; delivery is due 24 Oct.']}[st];
 if(!b)return '';
 return `<div class="banner ${b[0]} cat-banner">${ic(b[1])}<div class="tx"><b>${b[2]}</b><span class="t-label">${b[3]}</span></div><button class="btn secondary s" data-go="release">Open the plan</button></div>`;}

function listCounts(){const past=S.catalog||[];const n=(hasRel()?1:0)+past.length;
 const tracks=(hasRel()?R().tracks:0)+past.reduce((a,r)=>a+r.tracks.length,0);
 const secs=[...(hasRel()?LS_TRACKS.slice(0,R().tracks):[]),...past.flatMap(r=>r.tracks)].reduce((a,t)=>{const [m,s]=t[1].split(':');return a+ +m*60+ +s},0);
 return {n,tracks,min:Math.round(secs/60),past};}

function tabBody(){const c=listCounts();const t=S.cat.tab;
 if(t==='tracks'){const rows=[...(hasRel()?LS_TRACKS.slice(0,R().tracks).map(x=>[...x,R().title]):[]),...c.past.flatMap(r=>r.tracks.map(x=>[x[0],x[1],x[2],r.title]))];
  if(!rows.length)return `<div class="empty cat-empty"><h3 class="t-title">No tracks yet</h3><p class="muted">Tracks come with a release. Add them on the release page.</p></div>`;
  return `<section class="cat-rows">${rows.map((x,i)=>`<div class="cat-row"><span class="mono faint n">${i+1}</span><span class="tx"><b>${esc(x[0])}</b><small>${esc(x[3])}</small></span><span class="mono muted">${x[1]}</span></div>`).join('')}</section>`;}
 if(t==='credits')return `<section class="cat-rows">${PEOPLE.map(p=>`<div class="cat-row"><span class="cat-av">${p[0]}</span><span class="tx"><b>${p[1]}</b><small>${p[2]}, on every song</small></span>${tag('confirmed','Signed')}<span class="mono">${p[3]}</span></div>`).join('')}</section><p class="t-label muted cat-note">Splits are the same on all songs. Change them on a release before delivery; after delivery they lock.</p>`;
 if(t==='earning'){const rows=c.past.flatMap(r=>r.tracks.map(x=>[x[0],r.title,x[2]]));
  if(!rows.length)return `<div class="empty cat-empty"><h3 class="t-title">Nothing to check yet</h3><p class="muted">The earning check runs on songs that are out. Import your catalogue to start it.</p><div class="row" style="justify-content:center"><button class="btn secondary" data-act="importcat" data-src="Spotify">${ic('upload','s')}Import catalogue</button></div></div>`;
  return `<section class="cat-rows">${rows.map(x=>`<div class="cat-row"><span class="tx"><b>${esc(x[0])}</b><small>${esc(x[1])}</small></span>${x[2]?`<span class="t-label c-att">${x[2]}</span>${tag('attention','Check')}`:tag('confirmed','Earning')}</div>`).join('')}</section>`;}
 /* releases */
 return `<div class="cat-relgrid"><div class="cat-grid">${hasRel()?relTile():''}${c.past.map(pastTile).join('')}</div>
 <p class="t-label muted cat-note">Statuses mirror the tools that own them: Draft, Scheduled, Delivered per store, Live, Check (something not earning). Nothing here is delivered by LAAS; it tells you what to do and when.</p></div>`;}

L.VIEWS.catalogue=()=>{
 const head=(sub,more)=>`<div class="ph cat-ph"><div class="grow"><h1 class="t-display">Releases</h1><p>${sub}</p></div><div class="cat-actions"><button class="btn secondary" data-act="importcat" data-src="Spotify">${ic('upload','s')}Import catalogue</button><button class="btn accent" data-act="newrelease">${ic('plus','s')}New release</button>${more?`<button class="btn secondary icon cat-more" aria-label="More" data-act="catmore">${ic('more')}</button>`:''}</div></div>`;
 if(!hasRel()&&!S.catalog)return `<div class="page cat-page">${head('Nothing here yet, the catalogue is where "is every song earning?" starts',false)}
  <div class="cat-emptystate"><div class="hd"><h2 class="t-title">No releases yet</h2><p class="muted">Bring what is already out so the earning check can run, or plan the next one and get a date-by-date plan counted back from release day.</p></div>
  <div class="cat-choices">${[['catalogue-plan','Plan a release','A title and a date give you the plan','newrelease',''],['catalogue-import','Import from Spotify','Read-only, pulls releases, tracks and ISRCs','importcat','Spotify'],['catalogue-distributor','Import from a distributor','CSV from DistroKid, TuneCore or CD Baby','importcat','a distributor']].map(c=>`<button class="cat-choice" data-act="${c[3]}" data-src="${c[4]}"><img src="${IMG(c[0])}" alt=""><b>${c[1]}</b><small>${c[2]}</small></button>`).join('')}</div></div></div>${L.abar('','Ask: "we release an EP on 14 Nov" — the plan appears behind Confirm')}`;
 const c=listCounts();const st=R().stage;
 const sub=[`${c.n} release${c.n===1?'':'s'}`,`${c.tracks} track${c.tracks===1?'':'s'}`,hasRel()&&st!=='delivered'?`1 on the way (${esc(R().title)}, 14 Nov)`:'',c.past.length?'2 songs not fully registered':''].filter(Boolean).join(', ');
 const earnN=c.past.length?2:0;
 return `<div class="page cat-page">${head(sub,true)}
 ${tabs([['releases','Releases',c.n],['tracks','Tracks',c.tracks],['credits','Credits & splits'],['earning','Is every song earning?',earnN||''],['gear','Gear',14]],S.cat.tab,'data-ctab')}
 ${S.cat.tab==='releases'?banner():''}
 ${S.cat.tab==='releases'?`<div class="cat-kpis">${kpi('Catalogue',`${c.n} release${c.n===1?'':'s'}`,`${c.tracks} tracks, ${c.min} min`)}${kpi('Next out',hasRel()?'14 Nov':'None',hasRel()?`${esc(R().title)}, 25 days`:'Plan the next one from New release')}${c.past.length?kpi('Earning check',`${c.tracks-earnN} of ${c.tracks}`,'2 songs partially registered','attention'):kpi('Earning check','Waiting','Runs on songs that are out')}${kpi('Splits','All signed','last: "Low Tide", 3 writers','ok')}</div>`:''}
 ${tabBody()}</div>${L.abar('','Ask about the catalogue — what blocks Late Shift, which songs are not registered at Koda, add a track')}`;};

/* ---------- Release detail ---------- */
function checks(){const r=R(),st=r.stage;
 const row=(icon,cls,title,sub,extra='',act='')=>`<${act?`button data-act="${act}"`:'div'} class="cat-chk">${`<span class="ico ${cls}">${ic(icon)}</span>`}<span class="tx"><span>${title}</span><small>${sub}</small></span>${extra}</${act?'button':'div'}>`;
 const meter=parts=>`<span class="meter">${parts.map(([w,c])=>`<i style="width:${w}px;background:var(${c})"></i>`).join('')}</span>`;
 const run='<button class="btn ghost s cat-run" data-act="runchecks">Run again</button>';
 const toCheck=row(S.rel.check?'down':'right','muted','4 to check: track 3 title, a writer name, ISRCs, explicit flag on track 2','Not blocking. Open to see each one.','','reltoggle-check')+(S.rel.check?`<ul class="cat-sub">${['Track 3 has “(Original Mix)”, Beatport rejects it','Writer “Jonas H.” is not a legal name','No ISRCs yet, the distributor assigns them','Explicit flag empty on track 2'].map(x=>`<li>${x}</li>`).join('')}</ul>`:'');
 if(st==='created')return `<section class="cat-checks"><div class="sum"><h3 class="t-heading cat-h">Before delivery</h3><span class="muted grow">Checks run when tracks and a cover are in</span></div></section>`;
 if(st==='uploading'){const n=Math.max(1,Math.round(r.progress/10));return `<section class="cat-checks"><div class="sum"><h3 class="t-heading cat-h">Before delivery</h3><span class="muted grow">Checking… ${n} of 14 rules, about a minute</span>${meter([[n*8,'--ok']])}${run}</div>${row('check','ok',`${n} passed so far`,'Results appear here as they finish. Nothing is sent anywhere.')}</section>`;}
 if(st==='blocked')return `<section class="cat-checks"><div class="sum"><h3 class="t-heading cat-h">Before delivery</h3><span class="muted grow">1 blocker, 4 to check, 9 passed</span>${meter([[72,'--ok'],[32,'--att'],[8,'--bad']])}${run}</div>
  ${row('alert','bad',`Cover says “LATE SHIFT”, the title is “${esc(r.title)}”`,'Stores reject a release when the cover text and the title differ.','<button class="btn secondary s" data-act="fixblocker">Fix</button>')}
  ${toCheck}${row(S.rel.passed?'down':'check','ok','9 passed','Artwork size, no URLs or prices, ℗ and © lines, no “feat.” in titles, and 5 more','','reltoggle-passed')}${S.rel.passed?passedList(9):''}</section>`;
 return `<section class="cat-checks"><div class="sum"><h3 class="t-heading cat-h">Before delivery</h3><span class="muted grow">${st==='delivered'?'Delivered. 4 to check (optional), 10 passed':'Ready. 4 to check (optional), 10 passed'}</span>${meter([[80,'--ok'],[32,'--att']])}${run}</div>
  ${toCheck}${row(S.rel.passed?'down':'check','ok','10 passed','Cover and title match now, plus artwork size, ℗ and © lines and 7 more','','reltoggle-passed')}${S.rel.passed?passedList(10):''}</section>`;}
const passedList=n=>`<ul class="cat-sub">${['Artwork 3000 × 3000, RGB','No URLs or prices in the artwork','℗ and © lines filled','No “feat.” in titles','Release date at least 21 days away','Every track has a writer','Splits add up to 100 %','Audio is 16-bit 44.1 kHz WAV or better','No silence over 10 s at the start','Cover text matches the title'].slice(0,n).map(x=>`<li>${x}</li>`).join('')}</ul>`;

function trackRows(){const r=R(),up=r.stage==='uploading',ready=r.stage==='ready'||r.stage==='delivered';
 return LS_TRACKS.slice(0,r.tracks).map((t,i)=>{const last=up&&i===r.tracks-1&&r.progress<100;
  const sub=up?(i===0||last?'':'<small>Checking…</small>'):t[2]&&r.stage!=='delivered'?`<small class="c-att">${t[2]}</small>`:'';
  return `<div class="cat-row"><span class="mono faint n">${i+1}</span><span class="tx">${sub||last?`<b>${t[0]}</b>`:t[0]}${sub}${last?`<span class="cat-prog"><i style="width:${r.progress}%"></i></span>`:''}</span><span class="mono muted">${last?r.progress+' %':t[1]}</span></div>`;}).join('');}

function relTabBody(){const r=R(),t=S.rtab,st=r.stage;
 if(t==='tracks')return r.tracks?`<section class="cat-rows">${trackRows()}</section>`:`<div class="empty cat-empty"><h3 class="t-title">No tracks yet</h3><p class="muted">Drop WAV files on the Overview tab, or add them one by one.</p><div class="row" style="justify-content:center"><button class="btn secondary" data-act="addtracks">${ic('upload','s')}Add tracks</button></div></div>`;
 if(t==='credits')return `<section class="cat-rows">${PEOPLE.map(p=>`<div class="cat-row"><span class="cat-av">${p[0]}</span><span class="tx"><b>${p[1]}</b><small>${p[2]}</small></span>${r.tracks?tag('confirmed','Signed 3 Oct'):tag('draft','Not signed')}<span class="mono">${p[3]}</span></div>`).join('')}</section>`;
 if(t==='earnings')return `<div class="empty cat-empty"><h3 class="t-title">No earnings yet</h3><p class="muted">The first statement comes about 6 weeks after release day, around late December.</p></div>`;
 const live=st==='delivered';
 return `<section class="cat-rows">${[['Bandcamp','Pre-order live',1],['Spotify','Goes out on delivery',live],['Apple Music','Goes out on delivery',live],['YouTube Music','Goes out on delivery',live],['TikTok','Goes out on delivery',live]].map(x=>`<div class="cat-row"><span class="tx"><b>${x[0]}</b><small>${x[2]&&x[0]!=='Bandcamp'?'Delivered, live on 14 Nov':x[1]}</small></span>${x[2]?tag('confirmed','Live'):tag('draft','Waiting')}</div>`).join('')}</section>`;}

L.VIEWS.release=()=>{const r=R();
 if(r.stage==='none'){return L.VIEWS.catalogue();}
 const st=r.stage,created=st==='created',up=st==='uploading',blk=st==='blocked';
 const meta=created?'EP, no tracks yet':up?'EP, 4 tracks, uploading':'EP, 4 tracks, 16:42';
 const tg=created||up?tag('draft','Draft'):st==='delivered'?tag('confirmed','Delivered'):tag('paid cat-acc','Scheduled');
 const primary=created||up?`<button class="btn accent" data-act="addtracks">${ic('upload','s')}Add tracks</button>`:blk?`<button class="btn accent" data-act="fixblocker">${ic('wrench','s')}Fix 1 blocker</button>`:st==='ready'?`<button class="btn accent" data-act="deliver">${ic('send','s')}Deliver to DistroKid</button>`:`<button class="btn secondary" data-act="delivstatus">${ic('check','s')}Delivered</button>`;
 const second=created&&!r.cover?`<button class="btn secondary" data-act="addcover">Add cover</button>`:`<button class="btn secondary" data-act="previewlinks">Preview links</button>`;
 const steps=[['24 Oct','Deliver to the distributor',st==='ready'?'In 4 days. Ready, press Deliver.':st==='delivered'?'Done today. DistroKid confirmed.':created?'In 4 days. Needs tracks and a cover.':'In 4 days. Needs the blocker fixed first.'],['24 Oct','Register the 4 works at Koda','Not started'],['4 Nov','Apple Music for Artists pitch',st==='delivered'?'Ready to write':'Waits for delivery'],...(S.allSteps?[['31 Oct','Pre-save link goes live','Ready to share'],['7 Nov','Spotify editorial pitch','Needs delivery first'],['14 Nov','Release day','Out everywhere at 00:00'],['21 Nov','First-week check','Streams, saves and playlist adds']]:[])];
 const acts=created?[['just now','Vital created the release']]:[['yesterday','Sofie added track notes'],['3 Oct','Mette, Sofie and Jonas signed the splits'],['1 Oct','Jonas uploaded the cover'],['28 Sep','Vital created the release']];
 return `<div class="page cat-page cat-detail">${back('Releases','catalogue')}
 <div class="cat-rhead">${coverHtml('cat-cover')}<div class="id"><span class="t-label muted">${meta}</span><h1 class="t-display">${esc(r.title)}</h1><div class="sl">${tg}<span class="muted">Out Fri 14 Nov, in 25 days</span></div>
  <div class="acts">${primary}${second}<button class="btn ghost icon" aria-label="More" data-act="releasemore">${ic('more')}</button></div></div></div>
 ${checks()}
 ${tabs([['overview','Overview'],['tracks','Tracks',r.tracks||''],['credits','Credits and splits'],['earnings','Earnings'],['stores','Stores']],S.rtab,'data-rtab')}
 ${S.rtab==='overview'?`<div class="grid2 cat-ov"><div class="cat-col">
  <section class="cat-sec"><div class="hd"><h3 class="t-heading cat-h">Next steps</h3><button class="btn ghost s flush" data-act="allsteps">${S.allSteps?'Show fewer':'Show all 7'}</button></div>
   ${steps.map((s,i)=>`<div class="cat-row step ${i?'':'first'}"><span class="mono d">${s[0]}</span><span class="tx"><b>${s[1]}</b><small>${s[2]}</small></span></div>`).join('')}</section>
  <section class="cat-sec"><div class="hd"><h3 class="t-heading cat-h">Tracks</h3><button class="btn ghost s flush" data-act="addtracks">Add track</button></div>
   ${r.tracks?trackRows():`<label class="cat-drop">${ic('upload')}<span class="tx"><span>Drop WAV files here, or add tracks one by one</span><small>Titles come from the file names; you can fix them after.</small></span><input type="file" accept=".wav,audio/*" multiple hidden data-wav></label>`}</section></div>
 <aside class="cat-panel"><div class="grp"><h3 class="t-heading cat-h">Facts</h3>${[['Release date','Fri 14 Nov 2026'],['Distributor','DistroKid'],['UPC',created?'After delivery':st==='delivered'?'<span class="mono">0196922731452</span>':'Pending, from DistroKid'],['Catalogue no.','LT-004'],['Rights','℗ 2026 Low Tide']].map(([a,b])=>`<div class="fact"><span class="t-label muted">${a}</span><span>${b}</span></div>`).join('')}</div>
  <div class="grp"><h3 class="t-heading cat-h">Credits and splits</h3>${created?'':`<span class="cat-avs">${PEOPLE.map(p=>`<span title="${p[1]}">${p[0]}</span>`).join('')}</span>`}<span class="t-label muted">${created?'Added per song when tracks are in. Everyone signs before delivery.':'40 / 30 / 30 on all 4 songs. Signed by all three on 3 Oct; locks on delivery.'}</span></div>
  <div class="grp tight"><h3 class="t-heading cat-h">Stores</h3><span class="t-label muted">${created?'Chosen at delivery. Most bands pick all.':st==='delivered'?'Delivered to Spotify, Apple Music, YouTube Music, TikTok and Bandcamp.':'Bandcamp pre-order is live. Spotify, Apple Music, YouTube Music and TikTok go out on delivery.'}</span></div></aside></div>`:relTabBody()}
 <button class="cat-activity" data-act="relactivity">${ic(S.rel.activity?'down':'right','s')}<span>Activity, ${created?'1 event. Vital created the release, just now':'12 events. Last: Sofie added track notes, yesterday'}</span></button>
 ${S.rel.activity?`<div class="cat-acts">${acts.map(a=>`<div><span class="t-label muted">${a[0]}</span><span class="t-label">${a[1]}</span></div>`).join('')}</div>`:''}
 </div>${L.abar(r.title,'Ask about this release — what blocks delivery, move the date to 21 Nov, draft the Spotify pitch')}`;};

/* ---------- past (imported) release ---------- */
L.VIEWS.pastrelease=()=>{const r=PASTC.find(x=>x.id===S.params.id)||PASTC[0];const secs=r.tracks.reduce((a,t)=>{const [m,s]=t[1].split(':');return a+ +m*60+ +s},0);
 return `<div class="page cat-page cat-detail">${back('Releases','catalogue')}
 <div class="cat-rhead"><img class="cat-cover" src="${IMG(r.img)}" alt=""><div class="id"><span class="t-label muted">${r.kind}, ${r.tracks.length} track${r.tracks.length>1?'s':''}, ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}</span><h1 class="t-display">${r.title}</h1><div class="sl">${tag(r.tag[0],r.tag[1])}<span class="muted">Out ${r.date}, imported today</span></div>
  <div class="acts"><button class="btn secondary" data-act="copytext" data-text="https://laas.app/r/${r.id}">${ic('copy','s')}Copy link</button></div></div></div>
 <div class="grid2 cat-ov"><div class="cat-col"><section class="cat-sec"><div class="hd"><h3 class="t-heading cat-h">Tracks</h3></div>
  ${r.tracks.map((t,i)=>`<div class="cat-row"><span class="mono faint n">${i+1}</span><span class="tx"><b>${t[0]}</b>${t[2]?`<small class="c-att">${t[2]}</small>`:''}</span><span class="mono muted">${t[1]}</span></div>`).join('')}</section></div>
 <aside class="cat-panel"><div class="grp"><h3 class="t-heading cat-h">Earning</h3>${[['Streams',`<span class="mono">${r.streams}</span>`],['Paid out',`<span class="mono">${r.earn}</span> DKK`],['Koda',r.koda],['Distributor',r.distributor]].map(([a,b])=>`<div class="fact"><span class="t-label muted">${a}</span><span>${b}</span></div>`).join('')}</div>
  <div class="grp tight"><h3 class="t-heading cat-h">Credits and splits</h3><span class="cat-avs">${PEOPLE.map(p=>`<span title="${p[1]}">${p[0]}</span>`).join('')}</span><span class="t-label muted">40 / 30 / 30, imported from the distributor.</span></div></aside></div></div>${L.abar(r.title)}`;};

/* ---------- Gear ---------- */
const gearList=()=>{const g=S.gear,q=g.q.trim().toLowerCase();
 return GEAR.filter(x=>(g.filter==='all'||(g.filter==='attention'&&x.status==='attention')||(g.filter==='uninsured'&&!x.ins))&&(g.cat==='all'||x.cat===g.cat)&&(g.owner==='band'||x.owner===g.owner)&&(!q||(x.item+' '+x.serial+' '+x.cat).toLowerCase().includes(q)));};
const gearRow=x=>`<button class="cat-gr ${x.status==='attention'?'att':''}" data-act="gearitem" data-id="${x.id}"><span class="it">${esc(x.item)}, ${x.serial}</span><span class="muted">${esc(x.cat)}</span><span>${x.ins?`<span class="ok">${ic('check','s')}</span>`:'<span class="no">—</span>'}</span><span class="ls">${x.last||'<span class="mono">—</span>'}</span><span class="muted">${x.owner}</span><span>${x.status==='attention'?tag('attention','Attention'):x.status==='draft'?tag('draft','Draft'):x.status==='confirmed'?tag('confirmed','Confirmed'):''}</span><span class="mono num">${kr(x.value)}</span></button>`;

L.VIEWS.gear=()=>{const g=S.gear;const att=GEAR.filter(x=>x.status==='attention');const unins=GEAR.filter(x=>!x.ins).length;
 const total=BASE_VALUE+g.added;const list=gearList();const q=g.q.trim();
 const shown=q||g.filter!=='all'||g.cat!=='all'||g.owner!=='band'||g.all?list:list.slice(0,8);
 const chip=(on,label,act,extra='')=>`<button class="cat-chip ${on?'on':''}" data-act="${act}" ${extra}>${label}</button>`;
 const filtered=g.filter!=='all'||g.cat!=='all'||g.owner!=='band';
 const foot=q?`${list.length} of ${GEAR.length} match “${esc(q)}” in item, serial or category`:filtered?`Showing ${list.length} of ${GEAR.length}, filtered`:`Showing ${shown.length} of ${GEAR.length}, sorted by status, then value`;
 return `<div class="page cat-page">
 <div class="ph cat-ph cat-gph"><div class="grow"><h1 class="t-display">Gear</h1><p>${GEAR.length} items, ${kr(total)} DKK, ${att.length} need${att.length===1?'s':''} attention</p></div><div class="cat-actions"><button class="btn secondary" data-act="logmaint">Log maintenance</button><button class="btn accent" data-act="addgear">${ic('plus','s')}Add gear</button></div></div>
 <div class="cat-gear">
 <div class="cat-kpis g3">${kpi('Total value',kr(total),`DKK, ${GEAR.length} items`)}${kpi('Insured','151.200',`${GEAR.length-unins} of ${GEAR.length} items, policy to 2027`)}${att.length?kpi('Needs attention',att.length,`${att[0].item}, grille, logged 2 Oct`,'attention'):kpi('Needs attention','0','Nothing waiting','ok')}</div>
 <div class="cat-filters">${chip(g.filter==='all','All '+GEAR.length,'gearf','data-f="all"')}${chip(g.filter==='attention','Needs attention '+att.length,'gearf','data-f="attention"')}${chip(g.filter==='uninsured','Not insured '+unins,'gearf','data-f="uninsured"')}${chip(g.cat!=='all','Category: '+(g.cat==='all'?'all':g.cat.toLowerCase()),'gearcatmenu')}${chip(g.owner!=='band','Owner: '+(g.owner==='band'?'band':g.owner),'gearownmenu')}
  <span class="sp"></span><label class="cat-search ${q?'on':''}">${ic('search','s')}<input id="gearq" placeholder="Item, serial, category" value="${esc(g.q)}" aria-label="Search gear" autocomplete="off"></label></div>
 ${list.length?`<div class="cat-table" role="table"><div class="cat-gr head" role="row"><span>Item</span><span>Category</span><span>Insured</span><span>Last service</span><span>Owner</span><span>Status</span><span class="num">Value</span></div>${shown.map(gearRow).join('')}</div>
 <div class="cat-gfoot"><span class="t-meta muted">${foot}</span>${q?'<button class="btn ghost s flush" data-act="gearclear">Clear search</button>':filtered?'<button class="btn ghost s flush" data-act="gearreset">Clear filters</button>':`<button class="btn ghost s flush" data-act="gearall">${g.all?'Show fewer':'Show all '+GEAR.length}</button>`}</div>`
 :`<div class="cat-emptystate small"><div class="hd"><h2 class="t-title">${q?`No match for “${esc(q)}”`:'Nothing matches these filters'}</h2><p class="muted">${q?'Nothing in item, serial or category. Check the spelling, clear the filters, or add a '+esc(q)+' to gear.':'Clear a filter to see more gear.'}</p></div>
  <div class="row cat-erow">${q?`<button class="btn secondary" data-act="addgear" data-name="${esc(q)}">${ic('plus','s')}Add “${esc(q.charAt(0).toUpperCase()+q.slice(1))}” to gear</button><button class="btn ghost" data-act="gearclear">Clear search</button>`:'<button class="btn ghost" data-act="gearreset">Clear filters</button>'}</div></div>`}
 </div></div>${L.abar('','Ask about Low Tide — gigs, contacts, gear, money')}`;};

/* ---------- drawers ---------- */
const foot=(act,label,cancel='Cancel')=>`<span style="flex:1"></span><button class="btn secondary" data-act="close">${cancel}</button><button class="btn accent" data-act="${act}">${label}</button>`;
L.DR.newrelease=()=>({type:'drawer',title:'New release',sub:'The plan counts back from the release date',body:`<div class="field cat-f"><label for="rt">Title</label><input class="input cat-w400" id="rt" value="${esc(S.newRelTitle||'Late Shift EP')}"><span class="help">As on the cover</span></div>
 <div class="field cat-f"><label>Type</label><div class="seg cat-seg"><button>Single</button><button class="on">EP</button></div></div>
 <div class="field cat-f"><label for="rdate">Release date</label><input class="input cat-w240" id="rdate" value="Fri 14 Nov 2026"><span class="help">25 days away. 28 recommended; Spotify needs 7 for a pitch, Apple 10.</span></div>
 <div class="field cat-f"><label for="rdist">Distributor</label><select class="input cat-w320" id="rdist"><option>DistroKid</option><option>CD Baby</option><option>TuneCore</option></select><span class="help">Connected in Integrations</span></div>
 <label class="cat-coverdrop"><span class="ph">${S.newCover?`<img src="${IMG('cover-late-shift')}" alt="">`:ic('disc')}</span><span class="tx"><b>${S.newCover?esc(S.newCover):'Cover, optional now'}</b><span class="t-label muted">${S.newCover?'Cover added. Delivery checks read the text on it.':'3000 × 3000 JPG or PNG. You can add it later; delivery checks wait for it.'}</span></span><input type="file" accept="image/png,image/jpeg" hidden data-relcover></label>
 <p class="muted cat-dnote">Tracks come next, on the release page: drop WAV files there.</p>`,foot:foot('createrelease','Create release')});
L.DR.fixblocker=()=>({type:'drawer',title:'Fix: cover and title',sub:'The one thing blocking delivery',body:`<div class="cat-problem"><img src="${IMG('cover-late-shift')}" alt=""><div><span class="muted">Cover says</span><b>LATE SHIFT</b><span class="muted">Release title</span><b class="c-bad">${esc(S.release.title)}</b></div></div>
 <p class="muted cat-ptext">Spotify, Apple Music and DistroKid reject a release when the cover text and the title differ. Pick one way to make them match.</p>
 <div class="cat-opts">${[['Rename the release to “Late Shift”','Recommended. Matches the cover; “EP” is shown by the stores from the track count.'],['Upload a new cover',`Cover must say “${esc(S.release.title)}”, 3000 × 3000, RGB.`],['Keep both and explain to the distributor','Manual review, usually 3 to 5 days. The plan moves.']].map(([t,s],i)=>`<button class="radio ${S.fixChoice===i?'on':''}" data-fix="${i}"><i></i><span><b>${t}</b><small>${s}</small></span></button>`).join('')}</div>`,
 foot:`<span style="flex:1"></span><button class="btn secondary" data-act="close">Cancel</button><button class="btn accent" data-act="renamed" id="fixgo">${['Rename to Late Shift','Use the new cover','Send for manual review'][S.fixChoice||0]}</button>`});
L.DR.importcat=(src)=>({type:'drawer',title:'Import releases',sub:`From ${src&&src!=='a distributor'?src:'Spotify'}, read-only, reads once`,body:`<p class="muted" style="margin:0">We found 3 releases for Low Tide. Untick any that are not yours.</p><div class="cat-imp">${PASTC.map(r=>`<label class="cat-row"><input type="checkbox" checked data-impcat="${r.id}"><img src="${IMG(r.img)}" alt=""><span class="tx"><b>${r.title}</b><small>${r.kind}, ${r.year}, ${r.tracks.length} track${r.tracks.length>1?'s':''}</small></span></label>`).join('')}</div><p class="t-label muted" style="margin:0">Tracks, ISRCs and credits come along. Nothing is changed at the store.</p>`,foot:foot('importcatdone','Import 3 releases')});
const gearOpts=(list,cur)=>list.map(o=>`<option ${o===cur?'selected':''}>${o}</option>`).join('');
const CATS=[...new Set(GEAR.map(x=>x.cat))];
L.DR.addgear=(name='')=>({type:'drawer',title:'Add gear',sub:'Serial and value help the insurance claim',body:`<div class="field cat-f"><label for="ga-i">Item</label><input class="input cat-w400" id="ga-i" value="${esc(name?name.charAt(0).toUpperCase()+name.slice(1):'Theremin, Moog Etherwave')}"></div>
 <div class="field cat-f"><label for="ga-s">Serial</label><input class="input cat-w240 mono" id="ga-s" value="LT-GEAR-${String(GEAR.length+1).padStart(3,'0')}"><span class="help">We number it for you; change it to the maker’s serial if you have it</span></div>
 <div class="field cat-f"><label for="ga-c">Category</label><select class="input cat-w240" id="ga-c">${gearOpts([...CATS,'Other'],name?'Instruments':'Instruments')}</select></div>
 <div class="field cat-f"><label for="ga-o">Owner</label><select class="input cat-w240" id="ga-o">${gearOpts(['Band','Mette','Sofie','Jonas','Mia'],'Band')}</select><span class="help">A member’s own gear stays theirs if they leave</span></div>
 <div class="field cat-f"><label for="ga-v">Value, DKK</label><input class="input cat-w160 mono" id="ga-v" value="4.500"></div>
 <label class="row" style="gap:10px;cursor:pointer"><input type="checkbox" id="ga-ins" checked style="width:16px;height:16px;accent-color:var(--ink)">On the band insurance, policy to 2027</label>`,foot:foot('savegear','Add gear')});
L.DR.logmaint=(id)=>({type:'drawer',title:'Log maintenance',sub:'Repairs and checks, so the insurer sees the history',body:`<div class="field cat-f"><label for="lm-i">Item</label><select class="input cat-w400" id="lm-i">${GEAR.map(x=>`<option value="${x.id}" ${x.id===(id||'g14')?'selected':''}>${esc(x.item)}, ${x.serial}</option>`).join('')}</select></div>
 <div class="field cat-f"><label for="lm-w">What was done</label><input class="input" id="lm-w" value="New grille, tested at rehearsal"></div>
 <div class="field cat-f"><label for="lm-d">Date</label><input class="input cat-w240" id="lm-d" value="21 Oct 2026"></div>
 <div class="field cat-f"><label for="lm-c">Cost, DKK</label><input class="input cat-w160 mono" id="lm-c" value="180"><span class="help">Goes to Expenses as Gear</span></div>`,foot:foot('savemaint','Save')});
L.DR.gearitem=(id)=>{const x=GEAR.find(g=>g.id===id)||GEAR[0];return {type:'drawer',title:x.item,sub:`${x.serial}, ${x.cat}`,body:`${x.status==='attention'?`<div class="banner attention">${ic('alert')}<div class="tx"><b>Grille dented, logged 2 Oct by Mette</b><span class="t-label">Still works. Replace before the next recording.</span></div></div>`:''}<dl class="kv"><dt>Category</dt><dd>${x.cat}</dd><dt>Owner</dt><dd>${x.owner}</dd><dt>Insured</dt><dd>${x.ins?'Yes, band policy to 2027':'No'}</dd><dt>Last service</dt><dd>${x.last||'None logged'}</dd><dt>Value</dt><dd><span class="mono">${kr(x.value)}</span> DKK</dd></dl>`,foot:`<span style="flex:1"></span><button class="btn secondary" data-act="close">Close</button><button class="btn accent" data-act="logmaint" data-id="${x.id}">Log maintenance</button>`};};

/* ---------- actions ---------- */
const A=L.ACTIONS;const open=o=>{S.overlay=o;L.render();};
const menu=(r,items)=>{L.open('menu',{x:Math.max(8,Math.min(r.left,innerWidth-276)),y:r.bottom+6,items});};
A.newrelease=()=>{S.newCover=null;open(L.DR.newrelease());};
A.createrelease=()=>{const v=(document.getElementById('rt')||{}).value;const r=S.release;r.title=(v||'Late Shift EP').trim();r.stage='created';r.tracks=0;r.progress=0;r.cover=!!S.newCover;S.rtab='overview';S.allSteps=false;S.rel={check:false,passed:false,activity:false};
 S.overlay=null;L.go('release');L.toast('Release created. The plan counts back from 14 Nov');};
A.addcover=()=>{S.release.cover=true;L.render();L.toast('Cover added: late-shift-cover.jpg',()=>{S.release.cover=false});};
let ticking=false;
A.addtracks=()=>{const r=S.release;if(r.stage==='uploading'){L.toast('Tracks are still uploading');return;}
 if(r.stage!=='created'&&r.tracks){L.toast('4 tracks are in. Drop a WAV here to add another');return;}
 r.stage='uploading';r.tracks=4;r.progress=0;r.cover=true;S.rtab='overview';if(S.view!=='release')L.go('release');else L.render();
 if(ticking)return;ticking=true;
 const tick=()=>{if(r.stage!=='uploading'){ticking=false;return;}r.progress=Math.min(100,r.progress+8);
  if(r.progress>=100){ticking=false;if(r.title.trim().toLowerCase()==='late shift'){r.stage='ready';L.toast('Checks done: nothing blocks delivery, 4 to check');}else{r.stage='blocked';L.toast('Checks done: 1 blocker, 4 to check');}return;}
  if(S.view==='release'||S.view==='catalogue')L.render();setTimeout(tick,400);};setTimeout(tick,400);};
A.fixblocker=()=>{S.fixChoice=0;open(L.DR.fixblocker());};
A.runchecks=()=>{const st=S.release.stage;L.toast(st==='uploading'?'Checks are already running':st==='blocked'?'Checked again: 1 blocker, 4 to check, 9 passed':'Checked again: nothing blocks delivery');};
A['reltoggle-check']=()=>{S.rel.check=!S.rel.check;L.render();};
A['reltoggle-passed']=()=>{S.rel.passed=!S.rel.passed;L.render();};
A.relactivity=()=>{S.rel.activity=!S.rel.activity;L.render();};
A.delivstatus=()=>L.toast('Delivered to DistroKid today. Stores go live on 14 Nov at 00:00');
A.catmore=(t,r)=>menu(r,[['Export catalogue as CSV','catexport'],['Who can see this','catwho'],['Start over with an empty catalogue','catreset',1]]);
A.catexport=()=>{L.close();L.toast('Exported: low-tide-catalogue.csv');};
A.catwho=()=>{L.close();L.toast('Everyone in Low Tide. Venues never see the catalogue');};
A.catreset=()=>{const was={rel:{...S.release},cat:S.catalog};S.release={stage:'none',title:'Late Shift EP',tracks:0,progress:0};S.catalog=null;S.cat.tab='releases';S.overlay=null;L.render();L.toast('Catalogue emptied',()=>{S.release=was.rel;S.catalog=was.cat});};
A.importcat=(t)=>open(L.DR.importcat(t.dataset.src));
A.importcatdone=()=>{const ids=[...document.querySelectorAll('[data-impcat]')].filter(x=>x.checked).map(x=>x.dataset.impcat);const list=PASTC.filter(r=>ids.includes(r.id));
 S.catalog=list.length?list:null;S.cat.tab='releases';S.overlay=null;L.go('catalogue');L.toast(`${list.length} release${list.length===1?'':'s'} imported`,()=>{S.catalog=null});};
/* gear */
A.gearf=t=>{S.gear.filter=t.dataset.f;L.render();};
A.gearcatmenu=(t,r)=>menu(r,[['All categories','gearcat',0,'all'],...CATS.map(c=>[c,'gearcat',0,c])]);
A.gearownmenu=(t,r)=>menu(r,[['Band, everything','gearown',0,'band'],...['Mette','Sofie','Jonas','Mia'].map(c=>[c,'gearown',0,c])]);
A.gearcat=t=>{S.gear.cat=t.dataset.text;L.close();};
A.gearown=t=>{S.gear.owner=t.dataset.text;L.close();};
A.gearclear=()=>{S.gear.q='';L.render();const i=document.getElementById('gearq');if(i)i.focus();};
A.gearreset=()=>{Object.assign(S.gear,{filter:'all',cat:'all',owner:'band'});L.render();};
A.gearall=()=>{S.gear.all=!S.gear.all;L.render();};
A.gearitem=t=>open(L.DR.gearitem(t.dataset.id));
A.addgear=t=>open(L.DR.addgear(t&&t.dataset.name||''));
A.savegear=()=>{const v=id=>(document.getElementById(id)||{}).value||'';const val=parseInt(v('ga-v').replace(/\D/g,''),10)||0;
 const x=G('n'+Date.now(),v('ga-i')||'New item',v('ga-s'),v('ga-c'),document.getElementById('ga-ins')?.checked?1:0,'',v('ga-o'),'draft',val);
 GEAR.unshift(x);S.gear.added+=val;S.gear.q='';S.overlay=null;L.render();L.toast(`${x.item} added to gear`,()=>{GEAR.splice(GEAR.indexOf(x),1);S.gear.added-=val;});};
A.logmaint=t=>open(L.DR.logmaint(t&&t.dataset.id));
A.savemaint=()=>{const v=id=>(document.getElementById(id)||{}).value||'';const x=GEAR.find(g=>g.id===v('lm-i'));if(!x){S.overlay=null;return L.render();}
 const was={last:x.last,status:x.status};x.last=v('lm-d')||'21 Oct 2026';if(x.status==='attention')x.status='';S.overlay=null;if(S.view!=='gear')L.go('gear');else L.render();
 L.toast(`Maintenance logged for ${x.item}`,()=>{x.last=was.last;x.status=was.status;});};

/* list tabs (data-ctab is not a core attribute, so it is read here) */
document.addEventListener('click',e=>{const t=e.target.closest('[data-ctab]');if(!t)return;e.stopPropagation();const k=t.dataset.ctab;
 if(k==='gear'){L.go('gear');return;}S.cat.tab=k;S.enter='tabenter';S.enterUntil=Date.now()+500;L.render();},true);

L.INPUT.push(t=>{if(t.id==='gearq'){S.gear.q=t.value;L.render();return true;}});
L.CHANGE.push(t=>{
 if(t.dataset.relcover!==undefined&&t.files&&t.files[0]){S.newCover=t.files[0].name;const keep=(document.getElementById('rt')||{}).value;S.newRelTitle=keep;S.overlay=L.DR.newrelease();L.render();S.newRelTitle=null;return true;}
 if(t.dataset.wav!==undefined&&t.files&&t.files.length){A.addtracks();return true;}
 if(t.dataset.impcat!==undefined){const n=document.querySelectorAll('[data-impcat]:checked').length;const b=document.querySelector('.drawer [data-act="importcatdone"]');if(b){b.textContent=n?`Import ${n} release${n===1?'':'s'}`:'Import nothing';}return true;}
});
})();
