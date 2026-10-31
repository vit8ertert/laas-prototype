/* LAAS prototype · money area. Rebuilt 1:1 from the Figma section "UX · Money" (page Build · LAAS v1.0).
   Views: money (tabs owed, invoices, expenses, payouts, reports, books; empty state), invoice, ledger, settle.
   Drawers: newinvoice (Invoice · new · drawer), addexpense. Uses window.LAAS (see index.html).
   Ledger depth (21 Oct, from LaaS 0.5, no Figma yet): journal, accounts, ledgerreport; drawers jnew, jentry, jacct, jnewacct. */
(function(){
"use strict";
const L=window.LAAS;const S=L.S,ic=L.ic,esc=L.esc,IMG=L.IMG,V=L.V;

/* icons missing from the core set (lucide.dev) */
L.P.ext=L.P.ext||'<path d="M7 7h10v10"/><path d="M7 17 17 7"/>';
L.P.msg=L.P.msg||'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>';
L.P.filetext=L.P.filetext||'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8M16 13H8M16 17H8"/>';

/* state */
S.money??={empty:false,done:{},seen:false,reminded:false,askedMette:false,showTable:false,
 /* expenses, October 2026 (Vit 21 Oct: a real table, rows that open, what an artist does here) */
 ex:[{id:'e1',d:26,what:'Travel, 2 cars Odense–Aarhus',shop:'Mileage, 284 km',for:'Saturday hotel gig',by:'Jonas',how:'personal card',cat:'Travel',rc:1,rf:'to',amt:640},
     {id:'e2',d:22,what:'Rehearsal room, 4 h',shop:'Studio B',for:'Band, general',by:'Band',how:'band card',cat:'Rehearsal',rc:1,rf:'',amt:800},
     {id:'e3',d:18,what:'Merch, 50 tote bags',shop:'Print House',for:'Release show',by:'Mette',how:'personal card',cat:'Merch',rc:1,rf:'to',amt:1000},
     {id:'e4',d:9,what:'Strings, 2 sets',shop:'4Sound Odense',for:'Club night',by:'Mette',how:'cash',cat:'Gear',rc:0,rf:'done',amt:240},
     {id:'e5',d:3,what:'Pre-save link, October',shop:'Feature.fm',for:'Band, general',by:'Band',how:'band card, monthly',cat:'Promotion',rc:1,rf:'',amt:89},
     {id:'e6',d:1,what:'LAAS, October',shop:'LAAS',for:'Band, general',by:'Band',how:'band card, monthly',cat:'Software',rc:1,rf:'',amt:149}],
 exf:'all',exq:'',exfor:'',exby:'',exsel:[],
 added:0,inv:{lines:2,m2:'',incl:false,remind:true,interest:false}};
const M=S.money;
const num=s=>+String(s).replace(/\./g,'').replace(/[^\d-]/g,'')||0;

/* ---------- shared pieces ---------- */
const btn=(cls,label,attrs='',icon='')=>`<button class="btn ${cls}" ${attrs}>${icon?ic(icon,'s'):''}${label}</button>`;
const more=act=>`<button class="btn secondary icon m-more" data-act="${act}" aria-label="More">${ic('more','s')}</button>`;
const head=(title,sub,actions)=>`<div class="m-ph"><div class="m-tb"><h1 class="t-display">${title}</h1><p>${sub}</p></div><div class="m-acts">${actions}</div></div>`;
/* sparkline in the tile, after Ramp's home tiles (Vit 21 Oct): no axes, bleeds to the tile's right and bottom edge,
   2 px line over a fill that fades from 32 % to nothing; the number in the tile is the label */
let SPK=0;
const spark=(vals,cls='',tip)=>{const n=vals.length,mx=Math.max(...vals),mn=Math.min(...vals),W=200,H=60,y=v=>H-4-(v-mn)/((mx-mn)||1)*(H-12),x=i=>i/(n-1)*W;
 const pts=vals.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`),id='spk'+(SPK++);
 return `<svg class="m-spark ${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" ${tip?`data-pts="${vals.map((v,i)=>x(i).toFixed(1)+','+y(v).toFixed(1)).join(';')}" data-tip="${esc(tip.join('|'))}"`:''}><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".32"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path d="M${pts.join('L')}L${W},${H}L0,${H}Z" fill="url(#${id})"/><path d="M${pts.join('L')}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;};
const kpi=(label,value,delta,tone='',stroke='',sp,tip)=>`<div class="m-kpi ${stroke} ${sp?'has-spark':''}"><span class="m-kl">${label}</span><span class="m-kv">${value}</span><span class="m-kd ${tone}">${delta}</span>${sp?spark(sp,'',tip):''}</div>`;
const kpis=list=>`<div class="m-kpis">${list.join('')}</div>`;
const banner=(title,body,action)=>`<div class="banner attention m-banner">${ic('alert','s')}<div class="tx"><span>${title}</span><small>${body}</small></div>${action}</div>`;
const tag=(cls,label)=>cls?`<span class="tag ${cls}">${label}</span>`:'';
const secHead=(title,action='')=>`<div class="m-sh"><h2 class="t-title">${title}</h2>${action}</div>`;
const ghostBtn=(label,attrs,icon)=>`<button class="btn ghost s m-gb" ${attrs}>${icon?ic(icon,'s'):''}${label}</button>`;
const thumb=v=>v?`<img class="m-th" src="${IMG(V(v).img)}" alt="">`:`<span class="m-th m-thp">${ic('pin','s')}</span>`;
const line=({img,label,note,tg,amt,attrs='',cls=''})=>`<${attrs?'button':'div'} class="m-line ${cls}" ${attrs}>${img!==undefined?thumb(img):''}<span class="m-tx">${note?`<span>${label}</span><small>${note}</small>`:label}</span>${tg!==undefined?`<span class="m-end">${tg}</span>`:''}<span class="m-amt mono">${amt}</span></${attrs?'button':'div'}>`;
const kvRow=(k,v)=>`<div class="m-kvr"><span>${k}</span><span>${v}</span></div>`;
const ev=(icon,well,t,s)=>`<div class="m-ev"><span class="m-well ${well}">${ic(icon,'s')}</span><span class="m-tx"><span>${t}</span><small>${s}</small></span></div>`;
const foot=t=>`<p class="m-foot">${t}</p>`;
/* Figma "Tabs": tab row + 1 px rule; each Tab is inner (label, count) over a 2 px indicator */
const tabsRow=items=>`<div class="m-tabsw"><div class="m-tabs" role="tablist">${items.map(([on,attrs,l,c,cl=''])=>`<button role="tab" aria-selected="${on}" class="${on?'on':''}" ${attrs}><span class="in"><span>${l}</span>${c!=null?`<span class="c"${cl}>${c}</span>`:''}</span><i class="ind"></i></button>`).join('')}</div></div>`;
L.mTabsRow=tabsRow;
const tabsBar=t=>{const counts={owed:3,invoices:S.invoices.length,expenses:t==='expenses'?M.ex.length:null,payouts:S.booking.settled?null:1};
 return tabsRow([['owed','Owed to you'],['invoices','Invoices'],['expenses','Expenses'],['payouts','Payouts'],['reports','Reports'],['books','Books']].map(([k,l])=>[t===k,`data-mtab="${k}"`,l,counts[k]]));};

/* ---------- Owed to you ---------- */
const late=()=>!S.booking.depositPaid;
function owed(){
 const tasks=[
  ['send','Send a reminder to Hotel Royal','Invoice 2026-031, 1.500 DKK, 6 days late, friendly, no fee. The headline is the action; the tick does exactly that.','Send','mnyremind'],
  ['approve','Approve 1.470 DKK from HOTEL ROYAL A/S','The bank shows it on 16 Oct, matches 2026-031, 30 DKK short, ask what the difference is','Approve','mnyapprove'],
  ['move','Move 5.000 DKK from Mads to the band','Two MobilePay payments landed in Mads\' private account. Record where it is, then nudge: business MobilePay or bank.','Record','mnymove']].filter(x=>!M.done[x[0]]&&!(x[0]!=='move'&&!late()));
 return `${late()?banner('One deposit is 6 days late, 1.500 DKK from Hotel Royal','Three reminders went out. Send a free one by hand now; a fee is allowed from 22 Oct.',btn('secondary s','Open the booking','data-go="booking"')):''}
 ${kpis([kpi('Owed to you',late()?'8.500 DKK':'7.000 DKK',late()?'3 invoices, 1 late':'2 invoices, none late','muted','',[4,6.5,5,9,7.5,6,8,10,7,8.5,9.5,8.5],[4,6.5,5,9,7.5,6,8,10,7,8.5,9.5,8.5].map((v,i)=>`${CH[i][0]}: ${L.kr(v*1000)} DKK owed`)),
  late()?kpi('Waiting','1.500 DKK','6 days late, Hotel Royal','att','att'):kpi('Waiting','—','nothing late','muted'),
  kpi('In this month',late()?'9.000 DKK':'10.470 DKK',late()?'2 paid, 9 days average':'3 paid, 9 days average','ok','',CH.map(r=>r[1]),paidTips()),
  M.done.move?kpi('Held by members','0 DKK','all band money in the band account','muted'):kpi('Held by members','5.000 DKK','Mads holds band money, move it','att')])}
 <div class="m-cols">
  <div class="m-left">
   <section class="m-sec">${secHead('Owed to you',ghostBtn('All invoices','data-mtab="invoices"','ext'))}
    <div class="m-body">
     ${line({img:'royal',label:'Hotel Royal, deposit',note:'2026-031, due 12 Oct',tg:late()?tag('attention','Attention'):tag('paid','Paid'),amt:late()?'1.500':'1.470',attrs:'data-go="invoice" data-id="2026-031"'})}
     ${line({img:'mono',label:'Club Mono, balance',note:'2026-030, due 28 Oct',tg:tag('draft','Draft'),amt:'4.000',attrs:'data-go="invoice" data-id="2026-030"'})}
     ${line({img:'studiob',label:'Studio B, rehearsals',note:'2026-029, due 31 Oct',tg:tag('confirmed','Confirmed'),amt:'3.000',attrs:'data-go="invoice" data-id="2026-029"'})}
     ${foot('Draft = sent, not opened, Confirmed = opened, Attention = past due. Paid invoices move to "In this month".')}
    </div></section>
   <section class="m-sec">${secHead('In this month',ghostBtn('Report','data-mtab="reports"','ext'))}
    <div class="m-body m-g12">
     ${line({img:'odense',label:'Odense Live, fee',note:'2026-028, paid 14 Oct',tg:tag('paid','Paid'),amt:'6.000',attrs:'data-go="invoice" data-id="2026-028"',cls:'m-flush'})}
     ${line({img:null,label:'Private party, balance',note:'2026-027, paid 3 Oct',tg:tag('paid','Paid'),amt:'3.000',attrs:'data-go="invoice" data-id="2026-027"',cls:'m-flush'})}
     <div class="m-strip">${spark(CH.map(r=>r[1]),'wide',paidTips())}</div>
     <p class="m-foot m-nopad">Paid in, last 12 months, November to October. The full chart by type is in <button class="link" data-mtab="reports">Reports</button>.</p>
    </div></section>
  </div>
  <aside class="m-right">
   <section class="m-sec">${secHead('Needs you')}
    <div class="m-body m-g12">${tasks.length?tasks.map(([k,t,s,b,a])=>`<div class="m-task"><div class="m-task-h">${ic('ai','s')}<span>${t}</span></div><p>${s}</p><div class="m-tacts">${btn('secondary s',b,`data-act="${a}"`,'check')}</div></div>`).join(''):`<p class="m-foot m-nopad">Nothing needs you. New items show up here when money moves.</p>`}</div></section>
   <section class="m-sec">${secHead('Payouts',ghostBtn('Settle a gig','data-go="settle"','plus'))}
    <div class="m-body">
     ${line({label:'Odense Live',tg:tag('attention','Attention'),amt:'5.360',attrs:'data-go="settle"'})}
     ${foot('Payouts are recorded, not moved. Jonas is still owed 1.787 DKK.')}
    </div></section>
  </aside>
 </div>`;
}
function owedEmpty(){
 const ch=[['Invoice a booking','Pick a confirmed booking, lines, VAT and due date are filled','filetext','Invoice 2026-001, 4.500 DKK','work','newinvoice'],
  ['Bring old invoices','CSV from Dinero, Billy or e-conomic, numbers stay unique','upload','invoices.csv, 24 rows','travel','mnyimport'],
  ['See a sample','A paid and an overdue one, tinted, delete any time','eye','Sample: 1 paid, 1 overdue','break','mnysample']];
 return `<div class="m-empty"><div class="m-empty-h"><h2 class="t-title">No unpaid invoices. Nice.</h2><p>Invoices come from bookings: when a fee is agreed, the deposit and balance invoices are drafted for you. You approve, then send.</p></div>
 <div class="m-choices">${ch.map(([t,b,i,h,c,a])=>`<button class="m-choice" data-act="${a}"><span class="m-prev" style="--c:var(--${c})">${ic(i)}<span class="m-hint">${h}</span></span><span class="m-ct">${t}</span><span class="m-cb">${b}</span></button>`).join('')}</div></div>
 <div class="m-ghosttiles">${kpis([kpi('Owed to you','—','no invoices yet','muted'),kpi('Waiting','—','nothing late','muted'),kpi('In this month','—','first payment shows here','muted'),kpi('Held by members','—','nobody holds band money','muted')])}
 <p class="m-foot m-nopad">Ghost tiles, not zeros: the numbers appear with the first invoice.</p></div>`;
}

/* ---------- Invoices tab ---------- */
/* Invoices list (Vit 21 Oct: "no action on this? and invoices"): Table rows that open the invoice, the next action in the
   row (Approve a draft, Remind a late one), filters with counts, search, select for PDFs and export, totals. */
const ivRow=r=>{const st=r[0]==='2026-031'?(late()?'late':'paid'):r[5]==='Draft'?'draft':r[5]==='Paid'?'paid':'open';
 const amt=num(r[6]);return {r,st,amt,label:{draft:'Draft',open:'Sent',late:'Overdue, 6 days',paid:'Paid'}[st],cls:{draft:'draft',open:'confirmed',late:'attention',paid:'paid'}[st],
  when:st==='paid'?(r[0]==='2026-031'?'paid 16 Oct':r[3]):st==='late'?'due 12 Oct':r[3]};};
M.ivf??='all';M.ivq??='';M.ivsel??=[];
const invoices=()=>{const all=S.invoices.map(ivRow),q=M.ivq.trim().toLowerCase();
 const rows=all.filter(x=>(M.ivf==='all'||x.st===M.ivf||(M.ivf==='open'&&x.st==='late'))&&(!q||[x.r[0],x.r[1],x.r[2]].join(' ').toLowerCase().includes(q)));
 const sum=f=>all.filter(f).reduce((a,x)=>a+x.amt,0),cnt=f=>all.filter(f).length,sel=M.ivsel.filter(id=>rows.some(x=>x.r[0]===id));
 const tiles=kpis([kpi('Open',L.kr(sum(x=>x.st==='open'||x.st==='late'))+' DKK',`${cnt(x=>x.st==='open'||x.st==='late')} invoices sent, not paid`,'muted'),kpi('Overdue',L.kr(sum(x=>x.st==='late'))+' DKK',cnt(x=>x.st==='late')?`${cnt(x=>x.st==='late')} invoice, Hotel Royal`:'nothing late',cnt(x=>x.st==='late')?'att':'ok'),kpi('Paid, October',L.kr(sum(x=>x.st==='paid'))+' DKK',`${cnt(x=>x.st==='paid')} invoices`,'ok'),kpi('Drafts',String(cnt(x=>x.st==='draft')),cnt(x=>x.st==='draft')?'waiting for your approval':'none','muted')]);
 const bar=sel.length?`<div class="ex-bar ex-selbar" role="toolbar" aria-label="Selected invoices"><b>${sel.length} selected</b>${ghostBtn('Download PDFs','data-act="ivbulkpdf"','download')}${rows.some(x=>sel.includes(x.r[0])&&x.st==='late')?ghostBtn('Send reminder','data-act="mnyremind"','mail'):''}${ghostBtn('Export for the bookkeeper','data-act="mnyexport"','upload')}<span class="grow"></span>${ghostBtn('Clear','data-act="ivclear"','x')}</div>`
  :`<div class="ex-bar"><div class="ex-fs">${[['all','All',all.length],['draft','Drafts',cnt(x=>x.st==='draft')],['open','Open',cnt(x=>x.st==='open'||x.st==='late')],['late','Overdue',cnt(x=>x.st==='late')],['paid','Paid',cnt(x=>x.st==='paid')]].map(([k,l,n])=>`<button class="chip ${M.ivf===k?'on':''}" data-act="ivfilter" data-f="${k}" aria-pressed="${M.ivf===k}">${l}<span class="c">${n}</span></button>`).join('')}</div><label class="search ex-search">${ic('search','s')}<input class="input" id="ivq" placeholder="Number, venue, gig" value="${esc(M.ivq)}" aria-label="Search invoices"></label></div>`;
 const act=x=>x.st==='draft'?`<button class="btn secondary s" data-act="mnyinvsend" data-id="${x.r[0]}">Approve</button>`:x.st==='late'?`<button class="btn secondary s" data-act="mnyremind">Remind</button>`:x.st==='open'?`<button class="btn ghost s" data-act="mnycopylink">${ic('copy','s')}Link</button>`:`<button class="btn ghost s" data-act="mnypdf" data-id="${x.r[0]}">${ic('filetext','s')}PDF</button>`;
 const head=`<div class="bk-tr bk-th iv-r" role="row">${exBox(sel.length&&sel.length===rows.length,'data-act="ivselall"','Select all')}<span>No.</span><span>Venue and gig</span><span>Due</span><span>Status</span><span class="n">Amount, DKK</span><span></span></div>`;
 const row=(x,i)=>`<div class="bk-tr iv-r ${sel.includes(x.r[0])?'sel':''}" role="row" tabindex="0" data-go="invoice" data-id="${x.r[0]}" style="--i:${i}">${exBox(sel.includes(x.r[0]),`data-act="ivsel" data-id="${x.r[0]}"`,'Select '+x.r[0])}
  <span class="mono m">${x.r[0]}</span><span class="ex-tt po-gt"><img class="bk-thumb" src="${IMG(V(x.r[7]).img)}" alt=""><span class="ex-tt"><b>${esc(x.r[1])}</b><small>${esc(x.r[2])}</small></span></span>
  <span class="m ${x.st==='late'?'c-bad':''}">${x.when}</span><span>${tag(x.cls,x.label)}</span><span class="n mono">${x.r[6]}</span><span class="n">${act(x)}</span></div>`;
 const tot=rows.reduce((a,x)=>a+x.amt,0);
 return `${tiles}${bar}<div class="bk-table iv-table" role="table" aria-label="Invoices">${head}${rows.length?rows.map(row).join('')+`<div class="bk-tr iv-r ex-tot" role="row"><span></span><span></span><span>${rows.length===all.length?`${all.length} invoices`:`${rows.length} of ${all.length}`}</span><span></span><span class="m">Total</span><span class="n mono">${L.kr(tot)}</span><span></span></div>`:`<div class="ex-empty"><b>No invoices match</b>${btn('secondary s','Show all','data-act="ivfilter" data-f="all"')}</div>`}</div>
 <p class="m-foot m-nopad">Open an invoice to see it as the venue gets it, its pay page, reminders and history. Drafts keep their number reserved until you approve them.</p>`;};

/* ---------- Expenses tab ---------- */
/* What a band does here: see what went out and for which gig, get every receipt in, pay back whoever paid
   from their own pocket, fix a category, hand it all to the bookkeeper. Page list = Table row (DS "Which row where"). */
const EXCATS=['Travel','Rehearsal','Merch','Gear','Promotion','Software','Food','Other'];
const EXFOR=['Saturday hotel gig','Release show','Club night','Band, general'];
const EXWHO={Mette:'Mette Ravn',Sofie:'Sofie Lund',Jonas:'Jonas Holm',Band:'Band account'};
const exDate=d=>`${d} Oct`;
const exList=()=>M.ex.slice().sort((a,b)=>b.d-a.d);
const exShown=()=>{const q=M.exq.trim().toLowerCase();return exList().filter(e=>(M.exf==='all'||(M.exf==='rcpt'&&!e.rc)||(M.exf==='back'&&e.rf==='to'))&&(!M.exfor||e.for===M.exfor)&&(!M.exby||e.by===M.exby)&&(!q||[e.what,e.shop,e.for,e.cat,EXWHO[e.by]].join(' ').toLowerCase().includes(q)));};
const exOwed=()=>{const o={};for(const e of M.ex)if(e.rf==='to')o[e.by]=(o[e.by]||0)+e.amt;return o;};
const exWho=e=>`<span class="ex-who"><span class="ex-av ${e.by==='Band'?'band':''}">${e.by==='Band'?ic('money','s'):e.by[0]}</span><span class="ex-wt"><span>${e.by==='Band'?'Band account':e.by}</span><small>${esc(e.how)}</small></span></span>`;
const exBox=(on,attrs,label)=>`<button class="ex-cb ${on?'on':''}" role="checkbox" aria-checked="${on}" aria-label="${label}" ${attrs}>${on?ic('check','s'):''}</button>`;
function expenses(){
 const all=exList(),rows=exShown(),miss=all.filter(e=>!e.rc),owed=exOwed(),owedT=Object.values(owed).reduce((a,b)=>a+b,0);
 const tot=all.reduce((a,e)=>a+e.amt,0),shownT=rows.reduce((a,e)=>a+e.amt,0),sel=M.exsel.filter(id=>rows.some(e=>e.id===id));
 const m0=miss[0];
 const bar=sel.length?`<div class="ex-bar ex-selbar" role="toolbar" aria-label="Selected expenses"><b>${sel.length} selected</b>${ghostBtn('Change category','data-act="exbulkcat"','pencil')}${ghostBtn('Link to a gig','data-act="exbulkfor"','calendar')}${rows.some(e=>sel.includes(e.id)&&e.rf==='to')?ghostBtn('Mark paid back','data-act="exbulkpaid"','check'):''}${ghostBtn('Export','data-act="exbulkexp"','upload')}<span class="grow"></span>${ghostBtn('Clear','data-act="exclear"','x')}</div>`
  :`<div class="ex-bar"><div class="ex-fs">${[['all','All',all.length],['rcpt','Missing receipt',miss.length],['back','To pay back',all.filter(e=>e.rf==='to').length]].map(([k,l,n])=>`<button class="chip ${M.exf===k?'on':''}" data-act="exfilter" data-f="${k}" aria-pressed="${M.exf===k}">${l}<span class="c">${n}</span></button>`).join('')}<span class="ex-sep"></span><button class="chip" data-act="exformenu">${M.exfor?esc(M.exfor):'For: all'}${ic('down','s')}</button><button class="chip" data-act="exbymenu">${M.exby?'Paid by: '+(M.exby==='Band'?'band account':M.exby):'Paid by: anyone'}${ic('down','s')}</button></div><label class="search ex-search">${ic('search','s')}<input class="input" id="exq" placeholder="What, shop, gig" value="${esc(M.exq)}" aria-label="Search expenses"></label></div>`;
 const head=`<div class="bk-tr bk-th ex-r" role="row">${exBox(sel.length&&sel.length===rows.length,'data-act="exselall"','Select all')}<span>Date</span><span>Expense</span><span>Paid by</span><span>Category</span><span>Receipt</span><span>Pay back</span><span class="n">Amount, DKK</span></div>`;
 const row=(e,i)=>`<div class="bk-tr ex-r ${sel.includes(e.id)?'sel':''}" role="row" tabindex="0" data-act="exopen" data-id="${e.id}" style="--i:${i}">
  ${exBox(sel.includes(e.id),`data-act="exsel" data-id="${e.id}"`,'Select '+esc(e.what))}
  <span class="m">${exDate(e.d)}</span>
  <span class="ex-tt"><b>${esc(e.what)}</b><small>${esc(e.shop)}, for ${esc(e.for)}</small></span>
  ${exWho(e)}
  <span><button class="ex-cat" data-act="excatmenu" data-id="${e.id}" aria-label="Category ${e.cat}, change">${esc(e.cat)}${ic('down','s')}</button></span>
  <span>${e.rc?`<span class="ex-rc">${ic('clip','s')}Receipt</span>`:`<button class="tag attention ex-add" data-act="exrcpt" data-id="${e.id}">${ic('plus','s')}Add receipt</button>`}</span>
  <span>${e.rf==='to'?tag('attention','To pay back'):e.rf==='done'?tag('paid','Paid back'):'<span class="faint">Band paid</span>'}</span>
  <span class="n mono">${L.kr(e.amt)}</span></div>`;
 const foot=`<div class="bk-tr ex-r ex-tot" role="row"><span></span><span></span><span>${rows.length===all.length?`${all.length} expenses, October`:`${rows.length} of ${all.length} expenses`}</span><span></span><span></span><span></span><span class="m">Total</span><span class="n mono">${L.kr(shownT)}</span></div>`;
 const empty=`<div class="ex-empty"><b>${M.exf==='rcpt'?'Every receipt is in':M.exf==='back'?'Nobody is waiting to be paid back':'Nothing matches'}</b><span class="muted">${M.exf==='all'?'Try another search or clear the filters.':'Good, the books are clean for October.'}</span>${btn('secondary s','Show all','data-act="exreset"')}</div>`;
 return `${miss.length&&M.exf!=='rcpt'?banner(miss.length===1?`${m0.what.split(',')[0]}, ${L.kr(m0.amt)} DKK, has no receipt`:`${miss.length} expenses have no receipt`,`${EXWHO[m0.by]} paid ${exDate(m0.d)}. The books accept it, but a bookkeeper will ask. Add a photo, or ask ${m0.by==='Band'?'the band':m0.by}.`,M.askedMette?btn('secondary s','Asked','disabled'):btn('secondary s',`Ask ${m0.by==='Band'?'the band':m0.by}`,`data-act="mnyaskmette" data-who="${m0.by}"`)):''}
 ${kpis([kpi('October',L.kr(tot)+' DKK',`${all.length} expenses`,'muted'),kpi('To pay back',L.kr(owedT)+' DKK',Object.entries(owed).map(([k,v])=>`${k} ${L.kr(v)}`).join(', ')||'nobody',owedT?'att':'ok'),kpi('Receipts',`${all.length-miss.length} of ${all.length}`,miss.length?`${miss.length} missing`:'all in',miss.length?'att':'ok')])}
 ${owedT&&M.exf==='back'?`<div class="ex-owe">${ic('users','s')}<span><b>${Object.entries(owed).map(([k,v])=>`${EXWHO[k]} ${L.kr(v)} DKK`).join(', ')}</b> paid from their own pocket. It goes on their next payout, or mark it paid back if you already sent it.</span>${btn('secondary s','Settle up','data-act="expayout"')}</div>`:''}
 ${bar}
 <div class="bk-table ex-table" role="table" aria-label="Expenses, October 2026">${head}${rows.length?rows.map(row).join('')+foot:empty}</div>
 <p class="m-foot m-nopad">Categories are the assistant's suggestion in plain words, change one from its row; the chart of accounts sits behind them in Books. Open an expense to see its receipt, the gig it belongs to and its history.</p>`;
}

/* ---------- Payouts tab ---------- */
/* What a band does here (Vit 21 Oct: "looks very raw"): see what each member is owed (their share of settled gigs plus
   expenses they paid), pay it in the bank app and record it, settle the gigs that are still open, look back at payouts. */
const PO_GIGS=[['royal','Saturday hotel gig','25 Oct','Hotel Royal',4360],['loppen','Release show','18 Oct','Loppen',6200],['mono','Club night','10 Oct','Club Mono',5100]];
const PO_MEM=[['Mette','Mette Ravn','****2210'],['Sofie','Sofie Lund','****8841'],['Jonas','Jonas Holm','****0937']];
M.po??=[{id:'p6',d:19,who:'Mette',items:[['Release show, share',2067],['Strings, 2 sets, paid back',240]]},{id:'p5',d:19,who:'Sofie',items:[['Release show, share',2067]]},{id:'p4',d:19,who:'Jonas',items:[['Release show, share',2066]]},
 {id:'p3',d:12,who:'Mette',items:[['Club night, share',1700]]},{id:'p2',d:12,who:'Sofie',items:[['Club night, share',1700]]},{id:'p1',d:12,who:'Jonas',items:[['Club night, share',1700]]}];
const poSum=p=>p.items.reduce((a,x)=>a+x[1],0);
const poShare=k=>S.booking.settled&&!M.po.some(p=>p.who===k&&p.items.some(x=>x[0].startsWith('Saturday hotel gig')))?Math.round(4360/3)+(k==='Mette'?1:0):0;
const poOwed=k=>{const ex=M.ex.filter(e=>e.by===k&&e.rf==='to');const sh=poShare(k);return {ex,sh,t:ex.reduce((a,e)=>a+e.amt,0)+sh};};
const poPaid=k=>M.po.filter(p=>p.who===k).reduce((a,p)=>a+poSum(p),0);
const payouts=()=>{const owed=PO_MEM.map(([k])=>poOwed(k)),now=owed.reduce((a,o)=>a+o.t,0),who=owed.filter(o=>o.t).length,paid=M.po.reduce((a,p)=>a+poSum(p),0);
 const open=PO_GIGS.filter(g=>g[0]==='royal'&&!S.booking.settled);
 const mem=PO_MEM.map(([k,name,acct],i)=>{const o=owed[i];return `<div class="bk-tr po-m" role="row" tabindex="0" data-act="popay" data-who="${k}" style="--i:${i}"><span class="ex-who"><span class="ex-av">${k[0]}</span><span class="ex-wt"><b class="po-n">${name}</b><small>bank ${acct}</small></span></span>
  <span class="n mono">${o.sh?L.kr(o.sh):'<span class="faint">0</span>'}</span><span class="n mono">${o.ex.length?L.kr(o.ex.reduce((a,e)=>a+e.amt,0)):'<span class="faint">0</span>'}</span><span class="n mono po-due">${L.kr(o.t)}</span><span class="n mono muted">${L.kr(poPaid(k))}</span>
  <span class="n">${o.t?`<button class="btn secondary s" data-act="popay" data-who="${k}">Record payout</button>`:tag('paid','Paid up')}</span></div>`;}).join('');
 const gigs=PO_GIGS.map((g,i)=>{const done=g[0]!=='royal'||S.booking.settled;return `<div class="bk-tr po-g" role="row" tabindex="0" data-go="settle" style="--i:${i}"><span class="ex-tt po-gt"><img class="bk-thumb" src="${IMG(V(g[0]).img)}" alt=""><span class="ex-tt"><b>${g[1]}</b><small>${g[2]}, ${g[3]}</small></span></span><span class="n mono">${L.kr(g[4])}</span><span class="m">3 ways, equal</span><span>${done?tag('paid','Settled'):tag('attention','To settle')}</span><span class="n mono">${L.kr(Math.round(g[4]/3))}</span></div>`;}).join('');
 const hist=M.po.slice().sort((a,b)=>b.d-a.d).map((p,i)=>`<div class="bk-tr po-h" role="row" tabindex="0" data-act="poview" data-id="${p.id}" style="--i:${i}"><span class="m">${p.d} Oct</span><span class="ex-tt"><b>${EXWHO[p.who]}</b><small>${p.items.map(x=>x[0]).join(', ')}</small></span><span class="m">Bank transfer</span><span class="n mono">${L.kr(poSum(p))}</span></div>`).join('');
 return `${kpis([kpi('To pay out now',L.kr(now)+' DKK',who?`${who} ${who===1?'member':'members'}, shares and expenses`:'everyone is paid up',now?'att':'ok'),kpi('Paid out, October',L.kr(paid)+' DKK',`${M.po.length} payouts to 3 members`,'muted'),kpi('Gigs to settle',open.length?`${open.length} ${open.length===1?'gig':'gigs'}`:'None',open.length?`${open[0][1]}, ${L.kr(open[0][4])} DKK net`:'all gigs are settled',open.length?'att':'ok')])}
 ${open.length?banner(`${open[0][1]} is not settled yet`,`Net ${L.kr(open[0][4])} DKK after costs. Settle it to give each member their share, then pay it out here.`,btn('secondary s','Settle the gig','data-go="settle"')):''}
 <section class="po-sec">${secHead('Members',ghostBtn('Export for the bookkeeper','data-act="mnyexport"','upload'))}
 <div class="bk-table po-t" role="table" aria-label="What each member is owed"><div class="bk-tr bk-th po-m" role="row"><span>Member</span><span class="n">Gig shares</span><span class="n">Expenses paid</span><span class="n">To pay out</span><span class="n">Paid, October</span><span></span></div>${mem}
 <div class="bk-tr po-m ex-tot" role="row"><span class="m">3 members</span><span></span><span></span><span class="n mono">${L.kr(now)}</span><span class="n mono">${L.kr(paid)}</span><span></span></div></div></section>
 <section class="po-sec">${secHead('Gigs',ghostBtn('Settle a gig','data-go="settle"','plus'))}
 <div class="bk-table po-t" role="table" aria-label="Gigs and their split"><div class="bk-tr bk-th po-g" role="row"><span>Gig</span><span class="n">Net, DKK</span><span>Split</span><span>Status</span><span class="n">Each, DKK</span></div>${gigs}</div></section>
 <section class="po-sec">${secHead('Payout history')}
 <div class="bk-table po-t" role="table" aria-label="Payouts"><div class="bk-tr bk-th po-h" role="row"><span>Date</span><span>Paid to</span><span>How</span><span class="n">Amount, DKK</span></div>${hist}</div></section>
 <p class="m-foot m-nopad">LAAS records payouts; the money moves in your bank app. A payout clears the member's shares and the expenses they paid, and books it from the band account.</p>`;};
L.DR.popay=k=>{const o=poOwed(k);const m=PO_MEM.find(x=>x[0]===k);const items=[...(o.sh?[['Saturday hotel gig, share',o.sh]]:[]),...o.ex.map(e=>[`${e.what}, paid back`,e.amt])];
 return {type:'mnydrawer',title:`Pay out to ${m[1]}`,sub:`${L.kr(o.t)} DKK, to bank ${m[2]}`,
 body:items.length?`<div class="ml-lt po-lines" role="table" aria-label="What the payout covers"><div class="ml-ltr ml-lth" role="row"><span>For</span><span></span><span class="n">DKK</span></div>${items.map(x=>`<div class="ml-ltr" role="row"><span>${esc(x[0])}</span><span></span><span class="n mono">${L.kr(x[1])}</span></div>`).join('')}<div class="ml-ltr ml-ltt" role="row"><span>Total</span><span></span><span class="n mono">${L.kr(o.t)}</span></div></div>
  <div class="ml-facts"><div class="ml-fact"><span>From</span><span>Band account, Danske Bank</span></div><div class="ml-fact"><span>To</span><span>${m[1]}, bank ${m[2]}</span></div><div class="ml-fact"><span>Date</span><span>21 Oct 2026</span></div><div class="ml-fact"><span>Booked as</span><span>Owed to members, from Bank account</span></div></div>
  <p class="m-foot m-nopad">Make the transfer in your bank app first, then record it here. Recording marks the expenses paid back and writes the entry to the journal.</p>`
  :`<p class="muted">${m[1]} is paid up. Nothing to pay out.</p>`,
 foot:`<span style="flex:1"></span>${btn('secondary','Cancel','data-act="close"')}${items.length?btn('accent',`Record ${L.kr(o.t)} DKK`,`data-act="porecord" data-who="${k}"`,'check'):''}`};};
L.DR.poview=id=>{const p=M.po.find(x=>x.id===id);return {type:'mnydrawer',title:`Payout to ${EXWHO[p.who]}`,sub:`${p.d} Oct 2026, bank transfer, ${L.kr(poSum(p))} DKK`,
 body:`<div class="ml-lt po-lines" role="table"><div class="ml-ltr ml-lth" role="row"><span>For</span><span></span><span class="n">DKK</span></div>${p.items.map(x=>`<div class="ml-ltr" role="row"><span>${esc(x[0])}</span><span></span><span class="n mono">${L.kr(x[1])}</span></div>`).join('')}<div class="ml-ltr ml-ltt" role="row"><span>Total</span><span></span><span class="n mono">${L.kr(poSum(p))}</span></div></div>
 <div class="ml-facts"><div class="ml-fact"><span>From</span><span>Band account, Danske Bank</span></div><div class="ml-fact"><span>Recorded by</span><span>Vital, ${p.d} Oct</span></div></div>`,
 foot:`${ghostBtn('Payslip as PDF','data-act="popdf"','download')}<span style="flex:1"></span>${btn('secondary','Close','data-act="close"')}`};};

/* ---------- Ledger content (Ledger view, Books and Reports tabs) ---------- */
const CH=[['Nov',41,32],['Dec',99,41],['Jan',27,36],['Feb',50,45],['Mar',81,54],['Apr',63,41],['May',90,68],['Jun',117,63],['Jul',140,81],['Aug',126,59],['Sep',77,50],['Oct',108,54]];
/* income by type, stacked, with expenses as a line on the same DKK axis (Vit 21 Oct: "more creative graphs") */
const SER=[['gig','Gig fees'],['merch','Merch'],['stream','Streaming'],['grant','Grants and other']];
function chartData(){const ytd=CH.slice(2);const fit=(i,total)=>{const s=ytd.reduce((a,r)=>a+r[i],0);const v=CH.map(r=>Math.round(r[i]*total/s/100)*100);const sum=v.slice(2).reduce((a,b)=>a+b,0);v[11]+=total-sum;return v;};
 const inc=fit(1,186400),out=fit(2,121950),STR=[2400,2900,2600,2700,2800,2900,3100,3300,3200,3000,3100,3200],GR={4:12000,10:8000};
 return CH.map((r,i)=>{const grant=GR[i]||0,stream=STR[i],merch=Math.round((inc[i]-grant-stream)*.18/100)*100,gig=inc[i]-grant-stream-merch;
  return {m:r[0],y:i<2?2025:2026,gig,merch,stream,grant,inc:inc[i],out:out[i]};});}
function chartTable(){const D=chartData();
 return `<div class="table-wrap"><table class="m-dt"><thead><tr><th>Month</th>${SER.map(s=>`<th class="num">${s[1]}</th>`).join('')}<th class="num">Income</th><th class="num">Expenses</th><th class="num">Result</th></tr></thead><tbody>${D.map(d=>`<tr><td>${d.m} ${d.y}</td>${SER.map(s=>`<td class="num mono">${L.kr(d[s[0]])}</td>`).join('')}<td class="num mono">${L.kr(d.inc)}</td><td class="num mono">${L.kr(d.out)}</td><td class="num mono">${L.kr(d.inc-d.out)}</td></tr>`).join('')}</tbody></table></div>`;}
const CHMAX=40000;
/* stacked monthly bars (Vit 21 Oct: the area version "change this"): months are separate amounts, so bars, not a flowing line.
   Income types stack bottom up in the chart colours with a 2 px gap, 4 px rounded top; expenses are an ink tick across each month. */
function chartPlot(){const D=chartData(),n=D.length,pc=v=>(v/CHMAX*100).toFixed(2);
 /* each segment after the first gives up 2 px for the gap above it, so the stack's top lands exactly on its total */
 const cols=D.map((d,i)=>{let k=0;return `<div class="m-mcol" data-i="${i}"><div class="m-stack">${SER.map(s=>d[s[0]]?`<i class="${s[0]}" style="height:${k++?`calc(${pc(d[s[0]])}% - 2px)`:pc(d[s[0]])+'%'}"></i>`:'').join('')}</div><b class="m-tick" style="bottom:${pc(d.out)}%"></b></div>`;}).join('');
 /* direct labels beside the last month's segments, nudged 18 px apart */
 const last=D[n-1];let acc=0;const lab=SER.map(s=>{const v=last[s[0]],mid=acc+v/2;acc+=v;return {s,y:220-mid/CHMAX*220};});
 for(let k=1;k<lab.length;k++)if(lab[k-1].y-lab[k].y<18)lab[k].y=lab[k-1].y-18;
 const grid=[0,10000,20000,30000,40000];
 return `<div class="m-plotwrap"><div class="m-yax">${grid.map(g=>`<span style="top:${(100-g/CHMAX*100).toFixed(2)}%">${g?L.kr(g/1000)+'k':'0'}</span>`).join('')}</div>
  <div class="m-plot" data-chart>${grid.map(g=>`<i class="m-grid" style="top:${(100-g/CHMAX*100).toFixed(2)}%"></i>`).join('')}
   <div class="m-bars12">${cols}</div><div class="m-tip" hidden></div></div>
  <div></div><div class="m-xax">${D.map(d=>`<small>${d.m}</small>`).join('')}</div></div>`;}
function chartTip(i){const d=chartData()[i];
 return `<b>${d.m} ${d.y}</b>${SER.slice().reverse().map(s=>`<span><i class="${s[0]}"></i>${s[1]}<em class="mono">${L.kr(d[s[0]])}</em></span>`).join('')}
  <span class="m-tt"><i class="inc"></i>Income<em class="mono">${L.kr(d.inc)}</em></span><span><i class="exp"></i>Expenses<em class="mono">${L.kr(d.out)}</em></span><span class="m-tt">Result<em class="mono">${L.kr(d.inc-d.out)}</em></span>`;}
document.addEventListener('pointermove',e=>{const p=e.target.closest&&e.target.closest('[data-chart]');document.querySelectorAll('[data-chart]').forEach(q=>{if(q!==p){q.querySelector('.m-tip').hidden=true;q.querySelectorAll('.m-mcol.on').forEach(c=>c.classList.remove('on'));}});if(!p)return;
 const r=p.getBoundingClientRect(),i=Math.max(0,Math.min(CH.length-1,Math.floor((e.clientX-r.left)/r.width*CH.length))),x=(i+.5)/CH.length*100;
 p.querySelectorAll('.m-mcol').forEach(c=>c.classList.toggle('on',+c.dataset.i===i));const tp=p.querySelector('.m-tip');
 if(tp.dataset.i!==String(i)){tp.innerHTML=chartTip(i);tp.dataset.i=i;}tp.hidden=false;tp.classList.toggle('left',x>55);tp.style.left=x+'%';});
const chart=()=>`<section class="m-chart"><div class="m-chh"><h3 class="t-heading">Income and expenses, last 12 months</h3>${ghostBtn(M.showTable?'Show chart':'Show data table','data-act="mnytable"')}</div>
 <div class="m-leg">${SER.map(s=>`<span><i class="${s[0]}"></i>${s[1]}</span>`).join('')}<span><i class="exp"></i>Expenses</span></div>
 ${M.showTable?chartTable():chartPlot()}</section>`;
/* where money came from / went: a donut with the total in the middle, rows as its legend (Vit 21 Oct: "pie charts? donut charts?").
   Income slices wear the chart colours (same series as the Reports chart); spending is one neutral ramp, so the two never read as the same thing.
   Slices are separated by a 2 px gap; hovering a row lifts its slice. */
const donut=(vals,keys)=>{const R=52,C=2*Math.PI*R,tot=vals.reduce((a,b)=>a+b,0);let off=0;
 return `<svg class="m-donut" viewBox="0 0 140 140" aria-hidden="true"><g transform="rotate(-90 70 70)">${vals.map((v,i)=>{const len=v/tot*C,seg=`<circle class="m-seg ${keys[i]}" data-i="${i}" cx="70" cy="70" r="${R}" stroke-dasharray="${Math.max(0,len-2).toFixed(2)} ${C}" stroke-dashoffset="${(-off).toFixed(2)}"/>`;off+=len;return seg;}).join('')}</g></svg>`;};
const breakdown=(title,total,rows,cls='')=>{const vals=rows.map(r=>+r[3].replace(/\./g,'')),tot=vals.reduce((a,b)=>a+b,0),keys=cls==='out'?rows.map((r,i)=>'n'+i):['gig','stream','merch','grant'];
 return `<div class="m-bd ${cls}"><div class="m-bdh"><h3 class="t-heading">${title}</h3></div><div class="m-bdl"><div class="m-dn">${donut(vals,keys)}<span class="m-dnc"><b class="mono">${total.replace(' DKK','')}</b><small>DKK ${cls==='out'?'out':'in'}</small></span></div>
 <div class="m-bdrs">${rows.map(([n,sub],i)=>`<div class="m-bdr" data-i="${i}"><i class="m-sw ${keys[i]}"></i><span class="m-tx"><span>${n}</span><small>${sub}</small></span><span class="m-pc">${Math.round(vals[i]/tot*100)} %</span><span class="mono">${rows[i][3]}</span></div>`).join('')}</div></div></div>`;};
const reportsRow=()=>`<div class="m-reports"><span>Reports</span>${['Profit and loss','Balance sheet','Trial balance','VAT period'].map(r=>`<button class="chip m-chip" data-act="mnyreport" data-r="${r}">${r}</button>`).join('')}</div>`;
const ledgerBody=()=>`<div class="m-ledger">${kpis([kpi('Income','186.400','+9% vs 2025 to date','ok','rule'),kpi('Expenses','121.950','−4% vs 2025 to date','muted','rule'),kpi('Result','64.450','before tax','muted','rule'),kpi('Cash at bank','112.300','13.500 invoiced, not paid','att','att')])}
 ${chart()}
 <div class="m-bdcols">${breakdown('Where money came from','186.400 DKK',[['Live fees','31 gigs',91,'142.000'],['Streaming payouts','Spotify, YouTube',12,'18.900'],['Merch','shows and web',10,'14.300'],['Grants','KODA, 1 application',7,'11.200']])}
 ${breakdown('Where it went','121.950 DKK',[['Travel and van','fuel, hire, ferries',41,'41.200'],['Rehearsal space','Studio B, monthly',29,'28.800'],['Gear and repairs','9 purchases',22,'22.450'],['Recording','Late Shift EP',18,'18.000'],['Fees and VAT','distribution, accountant',11,'11.500']],'out')}</div>
 ${reportsRow()}</div>`;

/* ---------- views ---------- */
L.VIEWS.money=()=>{const t=S.mtab||'owed';
 const h=t==='expenses'?head('Expenses',`October 2026, what the band spent, who paid and which receipts are in`,btn('secondary','Snap a receipt','data-act="addexpense"','upload')+btn('accent','Add expense','data-act="addexpense"','plus')+more('mnymore'))
  :head('Money',M.empty?'Nothing owed, nothing late, the first booking with a fee starts the books':'October 2026, books up to date yesterday',btn('secondary','Add expense','data-act="addexpense"','upload')+btn('accent','New invoice','data-act="newinvoice"','plus')+more('mnymore'));
 const body={owed:M.empty?owedEmpty:owed,invoices,expenses,payouts,reports:()=>`<div class="m-ledger">${chart()}${reportsRow()}</div>`,books:()=>`${ledgerBody()}<div class="ml-links">${btn('secondary s','Open the ledger','data-go="ledger"','ext')}${btn('secondary s','Journal','data-go="journal"','filetext')}${btn('secondary s','Chart of accounts','data-go="accounts"','list')}${btn('secondary s','Reports','data-go="ledgerreport"','chart')}</div>`}[t]||owed;
 const ph=t==='expenses'?'Ask — add 320 DKK petrol paid by Sofie yesterday, what did merch cost this year, who is owed money':'Ask about money — who owes us, what did we net in October, draft the balance invoice for Club Mono';
 return `<div class="page m-page">${h}${tabsBar(t)}${body()}</div>${L.abar('',ph)}`;};

L.VIEWS.ledger=()=>`<div class="page m-page"><div class="m-ph m-ph-c"><div class="m-tb m-g4"><h1 class="t-display">Ledger</h1><p>Jan–Oct 2026, 142 entries, 2 drafts</p></div><div class="m-acts"><button class="chip m-chip" data-act="mnyyear">This year (2026)</button>${btn('secondary','Export','data-act="mnyexport"')}${btn('accent','New entry','data-act="jnew"','plus')}</div></div>${L.ledgerTabs?L.ledgerTabs('ledger'):''}${ledgerBody()}</div>${L.abar('','Ask about Low Tide — gigs, contacts, gear, money')}`;

/* invoice detail */
function invoiceData(id){
 const r=S.invoices.find(x=>x[0]===id)||S.invoices.find(x=>x[0]==='2026-031');
 if(r[0]==='2026-031'){const paid=!late();return {r,paid,rich:true,title:'Invoice 2026-031',tg:paid?tag('paid','Paid'):tag('attention','Overdue, 6 days'),
  sub:'Deposit for Saturday hotel gig, Hotel Royal A/S, issued 7 Oct, due 12 Oct (Net 5, with the offer), 1.500 DKK incl. moms',
  steps:[['Draft','7 Oct',1],['Approved, number locked','7 Oct, 11:00',1],['Sent','7 Oct, 11:02, with the offer',1],['Viewed','13 Oct, 15 Oct',1],['Paid',paid?'16 Oct, 1.470 DKK, 30 short':'waiting, 1.500 DKK open',paid?1:'att']],
  lines:[['Deposit, 30 % of the fee for 25 Oct','25 % moms','1.200']],excl:1200,company:'Hotel Royal A/S, CVR 12 34 56 78',addr:'Store Torv 4, 8000 Aarhus',to:'booking@hotelroyal.dk, cc faktura@hotelroyal.dk',slug:'hr-2026-031'};}
 const a=num(r[6]),excl=Math.round(a/1.25),label=r[5],v=V(r[7]);
 const n={Draft:1,Sent:3,Paid:5,Approved:2}[label]||(r[4]==='attention'?4:3);
 return {r,rich:false,paid:label==='Paid',title:`Invoice ${r[0]}`,tg:tag(r[4],label),sub:`${esc(r[2])}, ${esc(r[1])}, ${r[3]}, ${r[6]} DKK incl. moms`,
  steps:[['Draft','',1],['Approved, number locked','',n>=2],['Sent','',n>=3],['Viewed','',n>=4],['Paid',label==='Paid'?r[3]:'waiting',n>=5]].map(s=>[s[0],s[1]||(s[2]?'done':'not yet'),s[2]?1:0]),
  lines:[[esc(r[2]),'25 % moms',L.kr(excl)]],excl,company:esc(r[1]),addr:`${v.city}`,to:'invoice address on the venue',slug:`${r[7]}-${r[0]}`};
}
/* Invoice page (Vit 21 Oct: "when I am on the invoice page I expect to see a kind of invoice"; research 30-invoice-detail):
   the invoice itself is the page, drawn as paper; a slim lifecycle line; one primary action per state;
   a right panel that only shows what helps now: what is due, the pay page, reminders, activity. */
const BAND={name:'Low Tide I/S',addr:'Nørregade 12, 5000 Odense C',cvr:'CVR 41 22 90 17',reg:'Danske Bank, reg. 3409, konto 0012 345 678',mp:'MobilePay box 2214 88'};
const invMore=d=>{const k=d.r[5];return k==='Draft'?[['Duplicate','mnydup'],['Delete draft','mnydeldraft']]:[['Duplicate','mnydup'],['Credit note','mnycredit'],...(d.paid?[]:[['Stop reminders','mnystoprem']]),['Open the booking','mnybooking']];};
const invState=d=>{const t=d.excl+Math.round(d.excl*.25);const paidAmt=d.rich?(d.paid?1470:0):(d.paid?t:0);return {t,paidAmt,due:Math.max(0,d.paid&&!d.rich?0:t-paidAmt),short:d.rich&&d.paid?t-paidAmt:0};};
L.VIEWS.invoice=()=>{const d=invoiceData(S.params.id||'2026-031');const moms=Math.round(d.excl*.25);const st=invState(d);const draft=d.r[5]==='Draft';const over=d.rich&&!d.paid;
 const dueTxt=d.rich?'12 Oct 2026':d.r[0]==='2026-032'?'25 Oct 2026':(d.r[3].replace(/^(due|paid|sends) /,'')+' 2026');const issued=d.rich?'7 Oct 2026':draft?'not issued yet':'14 days before due';
 const primary=draft?btn('accent','Approve and send',`data-act="mnyinvsend" data-id="${d.r[0]}"`,'send'):d.paid?btn('secondary','Receipt','data-act="mnypdf" data-id="'+d.r[0]+'"','filetext'):btn('accent','Record payment',`data-act="invpay" data-id="${d.r[0]}"`,'check');
 const second=over?btn('secondary','Send reminder','data-act="mnyremind"','mail'):draft?btn('secondary','Edit','data-act="mnyedit"','pencil'):'';
 /* lifecycle: done steps carry their date, the current one says what happens next */
 const cur=d.steps.findIndex(x=>x[2]!==1);
 /* lifecycle as a segmented progress line (Vit 21 Oct: "make it nicer"): one bar per step, done = filled, current = half,
    late = red; under it only what is known (a date, or the plan), never "not yet"; a line on top says what happens next */
 const plan={Approved:draft?'when you approve':'',Sent:draft?(d.r[3].startsWith('sends')?d.r[3].replace('sends ','planned ')+'':''):'',Viewed:'',Paid:draft||!d.paid?`due ${dueTxt.replace(' 2026','')}`:''};
 const nextTxt=draft?`Approve to lock number ${d.r[0]}, then it sends ${d.r[3].replace('sends ','on ')}`:over?'6 days late. Send a reminder, or record the payment if it came in':d.paid?(st.short?'Paid, 30 DKK short':'Paid in full, nothing left to do'):'Sent, waiting for the venue to pay';
 const doneN=d.steps.filter(x=>x[2]===1).length;
 const steps=`<section class="iv-prog" aria-label="Invoice status"><div class="iv-ph1"><b>${nextTxt}</b><span class="muted">${doneN} of ${d.steps.length} done</span></div><ol>${d.steps.map(([t,sub,ok],i)=>{const k=ok===1?'done':ok==='att'?'att':i===cur?'now':'todo';const name=t.replace(', number locked','');const sb=ok==='att'?'6 days late':ok===1?(sub==='done'?'':sub):(plan[name]||'');return `<li class="${k}" ${k==='now'?'aria-current="step"':''}><i aria-hidden="true"></i><b>${name}</b><small>${sb||'&nbsp;'}</small></li>`;}).join('')}</ol></section>`;
 const paper=`<article class="iv-paper" aria-label="Invoice ${d.r[0]} as sent">
  <header class="iv-ph"><div><span class="iv-logo" aria-hidden="true">LT</span><b>${BAND.name}</b><small>${BAND.addr}<br>${BAND.cvr}</small></div><div class="iv-pt"><span class="iv-kind">Faktura</span><b class="mono">${d.r[0]}</b></div></header>
  <div class="iv-meta"><div><span class="iv-lab iv-labrow">Bill to${draft?`<button class="link iv-edit" data-go="venue" data-id="${d.r[7]}">Change</button>`:''}</span><b>${d.company}</b><small>${d.addr}<br>${d.to}</small></div>
   <dl><div><dt>Issued</dt><dd>${issued}</dd></div><div><dt>Due</dt><dd class="${over?'bad':''}">${dueTxt}${d.rich?', Net 5':''}</dd></div><div><dt>Reference</dt><dd class="mono">${d.rich?'LT-0041':d.r[0]}</dd></div><div><dt>For</dt><dd>${esc(d.r[2])}</dd></div></dl></div>
  <table class="iv-lines"><thead><tr><th>Description</th><th>Moms</th><th class="num">Amount, DKK</th></tr></thead><tbody>${d.lines.map(([a,b,c])=>`<tr><td>${a}</td><td class="muted">${b.replace(' moms','')}</td><td class="num mono">${c}</td></tr>`).join('')}</tbody></table>
  <div class="iv-tot"><div><span>Excl. moms</span><span class="mono">${L.kr(d.excl)}</span></div><div><span>Moms 25 %</span><span class="mono">${L.kr(moms)}</span></div><div class="iv-big"><span>Total, DKK</span><span class="mono">${L.kr(st.t)}</span></div>
   ${st.paidAmt&&d.rich?`<div class="iv-paid"><span>Paid 16 Oct</span><span class="mono">−${L.kr(st.paidAmt)}</span></div><div class="iv-bal"><span>Still open</span><span class="mono">${L.kr(st.short)}</span></div>`:''}</div>
  <footer class="iv-pf"><div><span class="iv-lab">Pay to</span><span>${BAND.reg}</span><span>${BAND.mp}</span></div><div><span class="iv-lab">Pay online</span><span class="mono">laas.dk/pay/${d.slug}</span><span class="muted">Use ${d.r[0]} as the reference.</span></div></footer>
  ${d.paid?`<span class="iv-stamp" aria-hidden="true">Paid</span>`:''}</article>`;
 const ladder=[['Heads-up, 7 days before due','5 Oct, opened',1],['"Due today"','12 Oct',1],['"A small reminder", 3 days after','15 Oct, opened',1],['Reminder by hand, free',M.reminded?'21 Oct, sent by you':'waiting for you',M.reminded?1:0],['Rykker 1, 100 DKK fee','possible from 22 Oct',0],['Rykker 2, 100 DKK','possible from 1 Nov',0],['Rykker 3, with inkasso warning','possible from 11 Nov',0]];
 const hist=d.rich?[...(M.reminded?[['msg','Reminder sent by you','21 Oct, just now']]:[]),...(d.paid?[['check','Payment of 1.470 DKK matched by the bank, 30 short','16 Oct']]:[]),['eye','Pay page opened by Mette Kjær','15 Oct, 10:02'],['ai','Reminder "3 days after" sent','15 Oct, 09:00'],['eye','Pay page opened by Mette Kjær','13 Oct, 08:41'],['ai','Reminder "due today" sent','12 Oct, 09:00'],['send','Sent to booking@hotelroyal.dk with the offer','7 Oct, 11:02, by Vital'],['check','Approved, number 2026-031 locked','7 Oct, 11:00, by Vital']]
  :[['filetext',`Created from the booking, number ${d.r[0]} reserved`,'by Vital'],...(draft?[]:[['send','Sent','by Vital']]),...(d.paid?[['check','Paid in full',d.r[3]]]:[])];
 const side=`<aside class="iv-side">
  <section class="iv-card iv-sum"><span class="iv-lab">${d.paid?(st.short?'Still open, paid 30 short':'Paid in full'):draft?'Will ask for':'Amount due'}</span><b class="iv-due">${L.kr(d.paid?(st.short||st.t):st.t)}<small>DKK</small></b>
   <div class="iv-kvs">${(st.paidAmt||d.paid)?`<div class="iv-kv"><span>Total incl. moms</span><span class="mono">${L.kr(st.t)}</span></div>`:''}${st.paidAmt?`<div class="iv-kv"><span>Paid 16 Oct</span><span class="mono">${L.kr(st.paidAmt)}</span></div>`:''}<div class="iv-kv"><span>${d.paid?'Was due':'Due'}</span><span class="${over?'bad':''}">${dueTxt}${over?', 6 days late':''}</span></div>${draft?`<div class="iv-kv"><span>Moms included</span><span class="mono">${L.kr(moms)}</span></div>`:''}</div>
   ${st.short?`<p class="iv-note">Hotel Royal paid 1.470. Ask about the 30 DKK, or write it off.</p><div class="iv-btns">${btn('secondary s','Ask about it','data-act="mnyremind"','mail')}${btn('ghost s','Write it off','data-act="invwriteoff"')}</div>`:''}</section>
  ${draft?'':`<section class="iv-card"><div class="iv-ch"><h3 class="t-heading">Pay page</h3>${ghostBtn('Preview','data-act="mnypaypage"','ext')}</div>
   <div class="iv-link"><span class="mono">laas.dk/pay/${d.slug}</span><button class="btn secondary s" data-act="mnycopylink">${ic('copy','s')}Copy</button></div>
   <p class="iv-note">${d.rich?'Opened 13 and 15 Oct. Nobody pressed "I have paid" yet.':'Bank details, MobilePay and copy buttons for the venue.'} The money goes straight to the band account.</p></section>`}
  ${over?`<section class="iv-card"><div class="iv-ch"><h3 class="t-heading">Reminders</h3>${ghostBtn(S.ivLadder?'Hide steps':'All steps','data-act="ivladder"')}</div>
   <p class="iv-note"><b>3 sent automatically</b>, the last on 15 Oct. Next is yours: a free reminder, then rykker letters from 22 Oct.</p>
   ${S.ivLadder?`<ol class="iv-ladder">${ladder.map(([t,w,ok])=>`<li class="${ok?'done':''}"><i></i><span>${t}<small>${w}</small></span></li>`).join('')}</ol><p class="iv-note faint">Danish rules: at most 100 DKK a letter, 3 fee letters, 10 days apart, none before the due date.</p>`:''}
   <div class="iv-btns">${btn('ghost s','Pause reminders','data-act="mnystoprem"')}</div></section>`:''}
  <section class="iv-card"><h3 class="t-heading">Activity</h3><ol class="iv-act">${hist.map(([i,t,w])=>`<li><span class="iv-ai">${ic(i,'s')}</span><span>${t}<small>${w}</small></span></li>`).join('')}</ol>
   <label class="iv-cmt"><input class="input" id="ivnote" placeholder="Add a note for the band"><button class="btn ghost s" data-act="ivnote">Add</button></label></section>
 </aside>`;
 return `<div class="m-tint" aria-hidden="true"></div><div class="page m-page m-detail m-inv iv">
 <button class="btn ghost s m-up" data-go="money" data-mt="invoices">${ic('left','s')}Invoices</button>
 <div class="m-ph iv-ph0"><div class="m-tb"><div class="m-tr"><h1 class="t-display">${d.title}</h1>${d.tg}</div><p>${d.company.split(',')[0]}, ${L.kr(st.t)} DKK incl. moms, ${draft?'not sent yet':d.paid?`paid ${d.rich?'16 Oct':d.r[3].replace('paid ','')}`:`due ${dueTxt}`}</p></div>
 <div class="m-acts">${draft?'':ghostBtn('Copy pay link','data-act="mnycopylink"','copy')}${btn('secondary','PDF','data-act="mnypdf" data-id="'+d.r[0]+'"','filetext')}${second}${primary}${more('mnyinvmore')}</div></div>
 ${steps}
 <div class="iv-grid">${paper}${side}</div></div>${L.abar(d.title,'Ask about this invoice — send it to accounts instead, split it, write it off')}`;};
L.DR.invpay=id=>{const d=invoiceData(id);const st=invState(d);return {type:'mnydrawer',title:`Record payment, ${d.r[0]}`,sub:`${d.company.split(',')[0]}, ${L.kr(st.due)} DKK open`,
 body:`${field('ipa','Amount, DKK',`<input class="input mono" id="ipa" inputmode="decimal" value="${L.kr(st.due)}">`,'Less than the total keeps the rest open.','m-w160')}${field('ipd','Paid on',`<input class="input" id="ipd" value="21 Oct 2026">`,'','m-w160')}${field('ipw','Into',`<select class="input m-w320" id="ipw"><option>Band account, Danske Bank</option><option>MobilePay box 2214 88</option><option>Cash</option></select>`)}
 <p class="m-foot m-nopad">Most payments are matched by the bank on their own. Record one here when it came another way, or before the bank shows it.</p>`,
 foot:`<span style="flex:1"></span>${btn('secondary','Cancel','data-act="close"')}${btn('accent','Record payment',`data-act="invpayok" data-id="${id}"`,'check')}`};};

/* settle */
const SPLIT={Equal:[[1453,'equal share'],[1453,'equal share'],[2094,'equal share + 640 travel back']],
 Shares:[[1090,'1 share'],[1090,'1 share'],[2820,'2 shares + 640 travel back']],
 Percent:[[1526,'35 %'],[1526,'35 %'],[1948,'30 % + 640 travel back']],
 Adjustment:[[1353,'equal share'],[1353,'equal share'],[2294,'equal share + 300 extra + 640 travel back']]};
L.VIEWS.settle=()=>{const mode=SPLIT[S.split]?S.split:'Equal';const sp=SPLIT[mode];const mx=Math.max(...sp.map(x=>x[0]));const mem=[['MR','Mette Ravn'],['SL','Sofie Lund'],['JH','Jonas Holm']];
 const checks=[['All invoices paid',1],['All receipts in, 1 of 1',1],['Split adds up to 100 %',1],['Everyone has seen the split, 2 of 3',M.seen?1:0,'mnyseen']];
 return `<div class="m-tint" aria-hidden="true"></div><div class="page m-page m-detail">
 <button class="btn ghost s m-up" data-go="money" data-mt="payouts">${ic('left','s')}Payouts</button>
 ${head('Settle the Saturday hotel gig','Sat 25 Oct, Hotel Royal, all money in',btn('secondary','Export PDF','data-act="mnysettlepdf"')+(S.booking.settled?btn('accent','Settled','disabled','check'):btn('accent','Settle 4.360 DKK','data-act="dosettle"','check'))+more('mnysettlemore'))}
 ${kpis([kpi('In','5.000 DKK','fee, deposit 16 Oct, balance 27 Oct','ok'),kpi('Out','640 DKK','travel, 1 receipt, paid by Jonas','muted'),kpi('Commission','0 DKK','no agent on this gig','muted'),kpi('Net to split','4.360 DKK',`3 members, ${mode==='Equal'?'equal after travel':mode.toLowerCase()+' after travel'}`,'muted')])}
 <div class="m-cols m-cols-d"><div class="m-left">
  <section class="m-sec">${secHead('Settlement')}<div class="m-body">
   ${line({label:'Fee agreed in the offer',note:'both invoices paid',tg:tag('paid','Paid'),amt:'5.000',cls:'m-fl'})}
   ${line({label:'Travel, 2 cars from Odense',note:'paid by Jonas, receipt',tg:tag('confirmed','Confirmed'),amt:'-640',cls:'m-fl'})}
   ${line({label:'Hotel, 2 rooms',note:'venue paid',tg:'',amt:'0',cls:'m-fl'})}
   ${line({label:'Commission',note:'no agent',tg:'',amt:'0',cls:'m-fl'})}<hr class="m-hr">
   ${line({label:'Net to split',tg:'',amt:'4.360',cls:'m-fl'})}
   <p class="m-foot m-nopad">Gross → costs → commission → net, in one stack, like a promoter's settlement. Each line links to its invoice or receipt.</p></div></section>
  <section class="m-sec">${secHead('Split',ghostBtn('Change mode','data-act="mnymode"','pencil'))}<div class="m-body m-g8">
   <div class="m-modes">${Object.keys(SPLIT).map(k=>`<button class="chip m-chip ${mode===k?'on':''}" data-split="${k}">${k}</button>`).join('')}</div>
   <p class="m-foot m-nopad">Equal after travel is refunded first. "Adjustment": one person gets a fixed extra, the rest split equally. Shares: "Jonas 2, others 1".</p>
   ${mem.map(([i,n],k)=>`<div class="m-mem"><span class="m-av">${i}</span><span class="m-tx"><span>${n}</span><small>${sp[k][1]}</small></span><span class="m-sbar"><i style="width:${(sp[k][0]/mx*300/308*100).toFixed(2)}%"></i></span><span class="mono m-amt">${L.kr(sp[k][0])} DKK</span></div>`).join('')}
   <p class="m-foot m-nopad">Totals 5.000 DKK = 4.360 net + 640 travel. Green bars grow with what each person is owed; red would grow left for someone who owes the kitty.</p></div></section>
 </div>
 <aside class="m-right">
  <section class="m-sec">${secHead('Cash from show')}<div class="m-body m-g12">${kvRow('What arrived','5.000 DKK, all by bank and MobilePay, nothing in cash')}${kvRow('Where it is',M.done.move?'Band account 5.000':'Band account 3.500, Mads\' private MobilePay 1.500')}${kvRow('To move first',M.done.move?'Nothing, all money is in the band account':'1.500 DKK from Mads to the band account, then pay out')}${kvRow('Then pay out',`Mette ${L.kr(sp[0][0])}, Sofie ${L.kr(sp[1][0])}, Jonas ${L.kr(sp[2][0])}, from the band account`)}
   ${foot('Payouts are recorded here and made in your bank app. Mark each one paid; undo records a correction, it does not take the money back.')}</div></section>
  <section class="m-sec">${secHead('Before you settle')}<div class="m-body m-g8">${checks.map(([t,on,a])=>`<button class="m-check ${on?'on':''}" ${a?`data-act="${a}"`:'disabled'} role="checkbox" aria-checked="${!!on}"><span class="m-box">${on?ic('check','s'):''}</span>${t}</button>`).join('')}
   <p class="m-foot m-nopad">Settle locks this gig's money and writes the ledger entries. Reopening later asks for a reason and is logged.</p></div></section>
 </aside></div></div>${L.abar('Settle, Hotel gig','Ask — give Jonas 300 more for driving, what did each of us net this year, remind Mads to move the money')}`;};

/* ---------- drawers ---------- */
L.OVERLAYS.mnydrawer=o=>`<div class="scrim" data-act="close"></div><aside class="drawer m-dr ${o.cls||''}" role="dialog" aria-modal="true" aria-label="${esc(o.title)}"><div class="dh"><div class="grow"><h2 class="t-title">${o.title}</h2><span class="t-meta muted">${o.sub||''}</span></div><button class="btn ghost s m-close" data-act="close">${ic('x','s')}Close</button></div><div class="db">${o.body}</div><div class="df">${o.foot}</div></aside>`;
L.OVERLAYS.mnymenu=o=>`<div class="scrim" style="background:transparent" data-act="close"></div><div class="pop m-menu" style="top:${o.y}px;right:${o.r}px">${o.items.map(([l,a,x])=>`<button class="it" data-act="${a}" ${x||''}>${l}</button>`).join('')}</div>`;
L.OVERLAYS.mnyrem=()=>`<div class="scrim" data-act="close"></div><div class="modal" role="dialog" aria-modal="true">${L.sendPreview('reminder').replace(/data-act="sendreminder"/g,'data-act="mnysendrem"')}</div>`;

const field=(id,label,ctl,help,cls='')=>`<div class="field ${cls}"><label for="${id}">${label}</label>${ctl}${help?`<span class="help" ${help.id?`id="${help.id}"`:''}>${help.t||help}</span>`:''}</div>`;
/* Figma: one row per line, Description fills (2 lines, 60 px), Excl. moms and Moms 110 px each, gap 8 */
const invLine=(i,desc,amt,m)=>`<div class="m-iline" data-line="${i}">${field('mi-d'+i,'Description',`<span class="m-ifld"><textarea class="m-fin" id="mi-d${i}" rows="1">${esc(desc)}</textarea></span>`,'','m-fd')}
 ${field('mi-a'+i,'Excl. moms',`<input class="input m-amtin" id="mi-a${i}" inputmode="decimal" value="${amt}">`,'','m-w110')}
 ${field('mi-m'+i,'Moms',`<select class="input m-moms ${m===''?'m-err':''}" id="mi-m${i}"><option value="" ${m===''?'selected':''}>—</option><option value="25" ${m==='25'?'selected':''}>25 %</option><option value="0" ${m==='0'?'selected':''}>Momsfri</option></select>`,m===''?{t:'Pick 25 % or Momsfri',id:'mi-e'+i}:'','m-w110')}</div>`;
const toggle=(k,label)=>`<button class="m-tg" data-act="mnytg" data-k="${k}" role="switch" aria-checked="${!!M.inv[k]}"><span class="m-track2"><i></i></span><span>${label}</span></button>`;
L.DR.newinvoice=()=>{M.inv={lines:2,m2:'',incl:false,remind:true,interest:false};return {type:'mnydrawer',cls:'m-wide',title:'New balance invoice',sub:'From Saturday hotel gig, 2026-032 is reserved, locked when you approve',
 body:`${field('mi-b','For booking',`<select class="input" id="mi-b"><option>Saturday hotel gig, 25 Oct, Hotel Royal</option><option>Club night, 15 Nov, Club Mono</option><option>Support slot, 28 Nov, Odense Live</option></select>`,'Lines, bill-to and due date come from the booking and your house terms')}
 ${field('mi-to','Bill to',`<select class="input" id="mi-to"><option>Hotel Royal A/S, CVR 12 34 56 78</option><option>Mette Kjær, private</option></select>`,'Sent to faktura@hotelroyal.dk (invoice address), cc Mette')}
 <div class="m-lines"><span class="m-ll">Lines</span><div class="m-lines" id="mi-lines">${invLine(1,'Balance, fee for 25 Oct, 70 %','2.800','25')}${invLine(2,'Travel, 2 cars from Odense','512','')}</div>
 <div class="m-add">${ghostBtn('Add line','data-act="mnyaddline"','plus')}${ghostBtn('Add from receipts','data-act="mnyaddrcpt"')}</div></div>
 <div class="m-tot"><div class="m-line m-tl"><span class="m-tx">Excl. moms</span><span class="m-amt mono" id="mi-tx">3.312</span></div>
  <div class="m-line m-tl"><span class="m-tx"><span>Moms</span><small id="mi-tn">travel line has no code yet</small></span><span class="m-amt mono" id="mi-tm">700</span></div>
  <div class="m-line m-tl"><span class="m-tx">To pay, incl. moms</span><span class="m-amt mono" id="mi-ti">4.012</span></div>
  <button class="m-inclsw" data-act="mnyincl" id="mi-sw">Prices shown excl. moms, switch</button></div>
 <div class="m-dates">${field('mi-due','Due',`<span class="m-ifld">${ic('calendar')}<textarea class="m-fin" id="mi-due" rows="1">25 Oct 2026, on the gig date</textarea></span>`,'House default, Net 7 for other invoices')}
 ${field('mi-send','Send on',`<span class="m-ifld">${ic('calendar')}<input class="m-fin" id="mi-send" value="18 Oct 2026"></span>`,'7 days before due')}</div>
 ${toggle('remind','Reminders, 7 days before, on the day, 3 days after, then by hand')}${toggle('interest','Late interest, reference rate + 8 %')}
 <p class="m-foot m-nopad">Approve books the invoice and locks number 2026-032. Send is a separate step, so you can approve now and send on 18 Oct.</p>`,
 foot:`${btn('ghost s','Cancel','data-act="close"')}<span style="flex:1"></span>${btn('secondary','Save draft','data-act="mnydraft"')}${btn('accent','Approve','data-act="mnyinvapprove"','check').replace("class=\"i s\"","class=\"i\"")}`};};
function recalc(){const d=document.querySelector('.m-dr');if(!d)return;let ex=0,mo=0,miss=0;
 d.querySelectorAll('.m-iline').forEach(l=>{const a=num(l.querySelector('.m-amtin').value);const m=l.querySelector('.m-moms').value;ex+=a;if(m==='25')mo+=Math.round(a*.25);if(m==='')miss++;});
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
 set('mi-tx',L.kr(ex));set('mi-tm',L.kr(mo));set('mi-ti',L.kr(ex+mo));set('mi-tn',miss?(miss===1?'one line has no code yet':`${miss} lines have no code yet`):'all lines have a code');}
L.CHANGE.push(t=>{if(t.classList&&t.classList.contains('m-moms')){t.classList.toggle('m-err',t.value==='');const h=t.closest('.field').querySelector('.help');if(t.value==='')h?h.textContent='Pick 25 % or Momsfri':t.insertAdjacentHTML('afterend','<span class="help">Pick 25 % or Momsfri</span>');else if(h)h.remove();recalc();return true;}return false;});
L.INPUT.push(t=>{if(t.classList&&t.classList.contains('m-amtin')){recalc();return true;}return false;});

L.DR.addexpense=()=>({type:'mnydrawer',title:'Add expense',sub:'A photo of the receipt is enough',
 body:`<label class="drop" style="cursor:pointer">${ic('upload')}<b class="strong" id="rcpt">${S.rcpt?esc(S.rcpt):'Add a photo or PDF of the receipt'}</b><span class="t-meta muted">We read the amount and the date from it.</span><input type="file" accept="image/*,.pdf" hidden data-receipt></label>
 ${field('exw','What',`<input class="input" id="exw" value="Parking, Aarhus">`)}
 ${field('exa','Amount, DKK',`<input class="input mono" id="exa" inputmode="decimal" value="480">`,'','m-w160')}
 ${field('exf','For',`<select class="input m-w320" id="exf"><option>Saturday hotel gig</option><option>Club night</option><option>Gear</option><option>Band, general</option></select>`)}
 ${field('exb','Paid by',`<select class="input m-w320" id="exb"><option>Mette</option><option>Sofie</option><option>Jonas</option><option>Band account</option></select>`,'If a member paid, it goes on their next payout.')}`,
 foot:`<span style="flex:1"></span>${btn('secondary','Cancel','data-act="close"')}${btn('accent','Save expense','data-act="saveexpense"')}`});

/* ---------- actions ---------- */
const A=L.ACTIONS;
const menu=(el,items)=>{const r=el.getBoundingClientRect();S.overlay={type:'mnymenu',y:Math.round(r.bottom+6),r:Math.max(16,Math.round(innerWidth-r.right)),items};L.render();};
A.mnymore=el=>menu(el,[[M.empty?'Show the books with data':'Show the empty state','mnyempty'],['Open the ledger','mnyledger'],['Export for the bookkeeper','mnyexport']]);
A.mnyinvmore=el=>{const d=invoiceData(S.params.id||'2026-031');menu(el,invMore(d));};
A.mnysettlemore=el=>menu(el,[['Open the booking','mnybooking'],['Open the ledger','mnyledger']]);
A.mnyempty=()=>{M.empty=!M.empty;S.mtab='owed';S.overlay=null;L.go('money');};
A.mnyfromzero=()=>{M.empty=true;S.mtab='owed';S.overlay=null;L.go('money');}; /* Flows: Money from zero */
A.mnyledger=()=>L.go('ledger');A.mnybooking=()=>L.go('booking');
A.mnyexport=()=>{S.overlay=null;L.toast('Export for the bookkeeper is ready: Jan–Oct 2026, CSV and receipts');};
A.mnycopylink=()=>{S.overlay=null;L.toast('Pay link copied');};
A.mnycredit=()=>{S.overlay=null;L.toast('Credit note drafted, nothing is sent yet',()=>{});};
A.mnysample=()=>{M.empty=false;L.render();L.toast('Sample loaded: 1 paid, 1 overdue',()=>{M.empty=true;});};
A.mnyimport=()=>L.toast('Import started: invoices.csv, 24 rows, numbers kept');
A.mnyremind=()=>{S.fullmsg=false;S.overlay={type:'mnyrem'};L.render();};
A.mnysendrem=()=>{S.overlay=null;M.reminded=true;M.done.send=true;S.sentReminder=true;L.render();L.toast('Reminder sent to Hotel Royal',()=>{M.reminded=false;M.done.send=false;S.sentReminder=false;});};
A.mnyapprove=()=>{S.booking.depositPaid=true;M.done.approve=true;if(S.checklist)S.checklist['Deposit received']=true;L.render();L.toast('1.470 DKK matched to invoice 2026-031',()=>{S.booking.depositPaid=false;M.done.approve=false;if(S.checklist)S.checklist['Deposit received']=false;});};
A.mnymove=()=>{M.done.move=true;L.render();L.toast('Recorded: 5.000 DKK moved from Mads to the band account',()=>{M.done.move=false;});};
A.mnyaskmette=el=>{const who=el.dataset.who||el.textContent.replace('Ask ','');M.askedMette=true;L.render();L.toast(`Asked ${who} for the receipt`,()=>{M.askedMette=false;});};
A.mnytable=()=>{M.showTable=!M.showTable;L.render();};
A.mnyreport=el=>L.toast(`${el.dataset.r}, Jan–Oct 2026, ready as PDF`);
A.mnyyear=()=>L.toast('Showing this year, Jan–Oct 2026');
A.mnypdf=el=>L.toast(`Invoice ${el.dataset.id}.pdf ready`);
A.mnysettlepdf=()=>L.toast('Settlement for Saturday hotel gig ready as PDF');
A.mnypaypage=()=>L.VIEWS.paypage?L.go('paypage'):L.toast('laas.dk/pay/hr-2026-031 opened in a new tab');
A.mnyinvsend=el=>{const r=S.invoices.find(x=>x[0]===el.dataset.id);if(!r)return;const old=r.slice();r[4]='confirmed';r[5]='Sent';L.render();L.toast(`Invoice ${r[0]} approved and sent`,()=>{r.splice(0,r.length,...old);});};
A.mnyseen=()=>{M.seen=!M.seen;L.render();};
A.mnymode=()=>{const k=Object.keys(SPLIT);S.split=k[(k.indexOf(SPLIT[S.split]?S.split:'Equal')+1)%k.length];L.render();};
/* drawer: in-place updates so the drawer does not re-animate */
A.mnytg=el=>{const k=el.dataset.k;M.inv[k]=!M.inv[k];el.setAttribute('aria-checked',M.inv[k]);};
A.mnyincl=el=>{M.inv.incl=!M.inv.incl;el.textContent=M.inv.incl?'Prices shown incl. moms, switch':'Prices shown excl. moms, switch';};
A.mnyaddline=()=>{const w=document.getElementById('mi-lines');if(!w)return;M.inv.lines++;w.insertAdjacentHTML('beforeend',invLine(M.inv.lines,'','0','25'));document.getElementById('mi-d'+M.inv.lines)?.focus();recalc();};
A.mnyaddrcpt=()=>{const w=document.getElementById('mi-lines');if(!w)return;M.inv.lines++;w.insertAdjacentHTML('beforeend',invLine(M.inv.lines,'Parking, Aarhus, receipt 16 Oct','384','25'));recalc();};
A.mnydraft=()=>{S.overlay=null;L.render();L.toast('Draft saved, 2026-032 stays reserved');};
A.mnyinvapprove=()=>{const missing=[...document.querySelectorAll('.m-dr .m-moms')].filter(s=>s.value==='');
 if(missing.length){missing[0].focus();missing[0].classList.add('m-err');return;}
 const r=S.invoices.find(x=>x[0]==='2026-032');const old=r?r.slice():null;if(r){r[3]='sends 18 Oct';r[4]='confirmed';r[5]='Approved';r[6]=document.getElementById('mi-ti')?.textContent||r[6];}
 S.overlay=null;S.mtab='invoices';L.go('money');L.toast('Invoice 2026-032 approved, it sends on 18 Oct',()=>{if(r&&old)r.splice(0,r.length,...old);});};
A.saveexpense=()=>{const v=id=>(document.getElementById(id)||{}).value||'';const what=v('exw'),amt=num(v('exa')),by=v('exb');
 const cat=/park|diesel|petrol|train|ferry|car/i.test(what)?'Travel':/string|stick|cable|gear/i.test(what)?'Gear':/rehears/i.test(what)?'Rehearsal':/merch|tote|shirt/i.test(what)?'Merch':'Other';
 const e={id:'n'+Date.now(),d:21,what,shop:/park/i.test(what)?'Q-Park':'Added by hand',for:v('exf'),by:by==='Band account'?'Band':by,how:by==='Band account'?'band card':'personal card',cat,rc:S.rcpt?1:0,rf:by==='Band account'?'':'to',amt,log:[['21 Oct','Added by Vital'+(S.rcpt?', from a photo':'')],['21 Oct',`Category ${cat}, suggested by the assistant`]]};
 M.ex.push(e);S.expenses?.unshift(['21 Oct',what,v('exf'),by,String(amt)]);S.overlay=null;S.mtab='expenses';M.exf='all';L.go('money');
 L.toast('Expense saved',()=>{M.ex=M.ex.filter(x=>x!==e);S.expenses?.shift();L.render();});};

/* ================= Ledger depth: journal, chart of accounts, ledger reports (LaaS 0.5 /ledger/…) ================= */
L.P.list=L.P.list||'<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>';
L.P.chart=L.P.chart||'<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>';
L.P.clip=L.P.clip||'<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>';
L.P.link=L.P.link||'<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>';

/* chart of accounts, default for bands: 1xxx assets … 5xxx expenses */
const ACC0=[[1000,'Bank account, Danske Bank','—'],[1010,'Cash','—'],[1100,'Invoices not paid yet','—'],[1200,'Band money held by members','—'],[1500,'Equipment','—'],
 [2000,'Bills to pay','—'],[2100,'Owed to members','—'],[2500,'Band card','—'],[2700,'Moms to pay','—'],
 [3000,'Band equity, opening balance','—'],
 [4000,'Live fees','25 %'],[4100,'Streaming payouts','Momsfri'],[4200,'Merch','25 %'],[4300,'Grants','Momsfri'],
 [5000,'Travel and van','25 %'],[5100,'Rehearsal space','25 %'],[5200,'Gear and repairs','25 %'],[5300,'Recording','25 %'],[5400,'Fees, software and promotion','25 %']];
const CLS={1:'Assets',2:'Liabilities',3:'Equity',4:'Income',5:'Expenses'};
const TYPE={1:'Asset',2:'Liability',3:'Equity',4:'Income',5:'Expense'};
const cls=n=>Math.floor(n/1000);
const debitSide=n=>cls(n)===1||cls(n)===5;
const ENT={1000:96,1010:4,1100:38,1200:6,1500:9,2000:11,2100:14,2500:22,2700:31,3000:1,4000:31,4100:10,4200:12,4300:1,5000:27,5100:10,5200:9,5300:3,5400:18};
/* posted figures, Jan–Oct 2026; the Ledger overview tiles and breakdowns add up to these */
const PL0={4000:142000,4100:18900,4200:14300,4300:11200,5000:41200,5100:28800,5200:22450,5300:18000,5400:11500};
const BAL={26:{1000:112300,1010:1200,1100:13500,1200:5000,1500:38400,2000:4250,2100:1640,2500:360,2700:8920},
 25:{1000:84600,1010:800,1100:9000,1200:0,1500:30200,2000:2100,2100:900,2500:0,2700:6400}};
const PER={ytd:{label:'This year, Jan–Oct 2026',fi:1,fe:1,end:26,asAt:'31 Oct 2026',cmp:'Jan–Oct 2025'},
 oct:{label:'October 2026',fi:108/879,fe:54/551,end:26,asAt:'31 Oct 2026',cmp:'October 2025'},
 y25:{label:'Last year, 2025',fi:1.1,fe:1.12,end:25,asAt:'31 Dec 2025',cmp:'2024'}};
const r50=v=>Math.round(v/50)*50;
const plFor=(fi,fe)=>{const o={};for(const k in PL0)o[k]=r50(PL0[k]*(cls(+k)===4?fi:fe));return o;};
const sumBy=(o,f)=>Object.keys(o).filter(k=>f(+k)).reduce((a,k)=>a+o[k],0);
function books(end){const b=BAL[end];const p=end===26?plFor(1,1):plFor(PER.y25.fi,PER.y25.fe);
 const inc=sumBy(p,k=>cls(k)===4),exp=sumBy(p,k=>cls(k)===5),result=inc-exp;
 const assets=sumBy(b,k=>cls(k)===1),liab=sumBy(b,k=>cls(k)===2);
 return {b,p,inc,exp,result,assets,liab,eq:assets-liab-result};}
const balOf=(n,end=26)=>{const d=books(end);return n===3000?d.eq:(d.b[n]??d.p[n]??0);};

M.coa??=true;M.acc??=ACC0.map(a=>a.slice());M.jq??='';M.jf??='all';M.per??='ytd';M.rep??='pl';M.aq??='';M.jd??=null;
M.je??=[
 {no:142,date:'21 Oct',desc:'Shure SM58, microphone',ref:'GEAR-0019',cp:'Thomann',att:'',st:'draft',src:'Proposed from Gear, paired with the purchase, same date',lines:[[1500,'Shure SM58',1099,0],[2500,'Paid with the band card',0,1099]]},
 {no:141,date:'20 Oct',desc:'Parking, Aarhus',ref:'R-0412',cp:'Sofie Lund',att:'parking-aarhus.jpg',st:'draft',src:'From Expenses',lines:[[5000,'Parking, Saturday hotel gig',384,0],[2100,'Paid by Sofie, owed back',0,384]]},
 {no:140,date:'16 Oct',desc:'Payment, invoice 2026-031',ref:'2026-031',cp:'Hotel Royal A/S',att:'bank-16-oct.pdf',st:'posted',src:'Matched by the bank',lines:[[1000,'Hotel Royal A/S',1470,0],[1100,'Invoice 2026-031, 30 short',0,1470]]},
 {no:139,date:'14 Oct',desc:'Payment, invoice 2026-028',ref:'2026-028',cp:'Odense Live',att:'bank-14-oct.pdf',st:'posted',src:'Matched by the bank',lines:[[1000,'Odense Live',6000,0],[1100,'Invoice 2026-028',0,6000]]},
 {no:138,date:'9 Oct',desc:'Strings, 2 sets',ref:'R-0398',cp:'Mette Ravn',att:'',st:'posted',src:'From Expenses, no receipt yet',lines:[[5200,'Strings, 2 sets',240,0],[2100,'Paid by Mette, cash',0,240]]},
 {no:137,date:'7 Oct',desc:'Invoice 2026-031, deposit',ref:'2026-031',cp:'Hotel Royal A/S',att:'2026-031.pdf',st:'posted',src:'From Invoices, booked when approved',lines:[[1100,'Hotel Royal A/S',1500,0],[4000,'Deposit, 30 % of the fee',0,1200],[2700,'Moms 25 %',0,300]]},
 {no:136,date:'3 Oct',desc:'Pre-save link, Feature.fm',ref:'R-0391',cp:'Feature.fm',att:'featurefm-oct.pdf',st:'posted',src:'From Expenses, recurring',lines:[[5400,'October',89,0],[2500,'Band card',0,89]]},
 {no:135,date:'1 Oct',desc:'Rehearsal room, Studio B, October',ref:'SB-2210',cp:'Studio B',att:'studiob-oct.pdf',st:'posted',src:'Bank transfer',lines:[[5100,'October, 8 sessions',2400,0],[1000,'Danske Bank',0,2400]]}];
const OLDER=134;/* entries 1–134 sit behind "Show older" */
const accName=n=>(M.acc.find(a=>a[0]===+n)||[0,'No account'])[1];
const jTotal=e=>e.lines.reduce((a,l)=>a+l[2],0);
const jDiff=e=>e.lines.reduce((a,l)=>a+l[2]-l[3],0);
const drafts=()=>M.je.filter(e=>e.st==='draft').length;
const kr0=v=>v?L.kr(v):'';

/* shared: ledger section tabs, header */
L.ledgerTabs=cur=>{const nd=drafts();return tabsRow([['ledger','Overview'],['journal','Journal'],['accounts','Chart of accounts'],['ledgerreport','Reports']].map(([k,l])=>[cur===k,`data-go="${k}"`,l,k==='journal'&&nd?nd:null,` aria-label="${nd} drafts"`]));};
const lhead=(title,sub,actions)=>`<div class="m-ph m-ph-c"><div class="m-tb m-g4"><h1 class="t-display">${title}</h1><p>${sub}</p></div><div class="m-acts">${actions}</div></div>`;
const search=(id,ph,val,label)=>`<label class="ml-search">${ic('search','s')}<input id="${id}" placeholder="${ph}" value="${esc(val)}" aria-label="${label}" autocomplete="off"></label>`;
const ledAbar=()=>L.abar('','Ask about the books — post the drafts, what is in 5000 Travel, why is the bank 30 short');

/* ---------- Journal ---------- */
function jRows(){const q=M.jq.trim().toLowerCase();
 return M.je.filter(e=>M.jf==='all'||e.st===M.jf).filter(e=>!q||[e.desc,e.ref,e.cp,String(e.no),...e.lines.map(l=>l[0]+' '+accName(l[0])+' '+l[1])].join(' ').toLowerCase().includes(q));}
/* plain words instead of "debit 1500, credit 2500" (Vit 21 Oct: think more about the journal): where it went, from where */
const jSummary=e=>{const d=e.lines.filter(l=>l[2]&&l[0]).map(l=>accName(l[0])),c=e.lines.filter(l=>l[3]&&l[0]).map(l=>accName(l[0]));return `${d.join(' and ')||'no account'}, from ${c.join(' and ')||'no account'}`;};
const jNeedsFile=e=>!e.att&&/Expenses|Gear/.test(e.src);
L.VIEWS.journal=()=>{const list=jRows();const q=M.jq.trim();const nd=drafts();const total=OLDER+M.je.length;
 const counts={all:total,posted:total-nd,draft:nd};
 const chips=`<div class="ml-tools"><div class="m-modes">${[['all','All'],['posted','Posted'],['draft','Drafts']].map(([k,l])=>`<button class="chip m-chip ${M.jf===k?'on':''}" data-act="jfilt" data-f="${k}" aria-pressed="${M.jf===k}">${l}<span class="ml-cc">${counts[k]}</span></button>`).join('')}</div><span class="sp"></span>${M.jf==='draft'&&nd?btn('accent s',`Post ${nd===1?'the draft':'all '+nd+' drafts'}`,'data-act="jpostall"','check'):''}${search('jsearch','Text, reference, account, contact',M.jq,'Search the journal')}</div>`;
 const rows=list.map((e,i)=>`<div class="ml-tr ml-j" role="row" tabindex="0" data-act="jopen" data-no="${e.no}" style="--i:${i}"><span class="ml-d">${e.date}</span><span class="mono ml-no">${e.no}</span><span class="ml-tt"><b>${L.hl(e.desc,q)}</b><small>${e.cp?L.hl(e.cp,q)+', ':''}${jSummary(e)}${e.src.startsWith('Proposed')?`, <span class="ml-pair">${ic('link','s')}paired with Gear</span>`:''}</small></span><span class="mono ml-m">${L.hl(e.ref,q)}</span><span class="ml-att" ${e.att?`title="${esc(e.att)}"`:''}>${e.att?`${ic('clip','s')}<span class="sr">Attached</span>`:jNeedsFile(e)?'<span class="tag attention ml-miss">Missing</span>':'<span class="faint">None</span>'}</span><span>${e.st==='draft'?tag('draft','Draft'):tag('confirmed','Posted')}</span><span class="n mono">${L.kr(jTotal(e))}</span></div>`).join('');
 const table=`<div class="ml-table" role="table" aria-label="Journal entries"><div class="ml-tr ml-th ml-j" role="row"><span>Date</span><span>No.</span><span>Description</span><span>Reference</span><span>File</span><span>Status</span><span class="n">DKK</span></div>${rows}</div>`;
 const filtered=q||M.jf!=='all';
 const footer=`<div class="ml-foot"><span>${q?`${list.length} of ${total} match “${esc(q)}” in text, reference, account or contact`:filtered?`${list.length} ${M.jf==='draft'?'drafts':'posted entries shown, newest first'}`:`Showing ${list.length} of ${total}, newest first. Drafts stay out of the reports until posted.`}</span>${filtered?ghostBtn('Show all','data-act="jall"'):ghostBtn('Show older','data-act="jolder"')}</div>`;
 const none=`<div class="ml-empty"><h2 class="t-title">${q?`No entry matches “${esc(q)}”`:'No drafts'}</h2><p>${q?'Nothing in text, reference, account or contact. Check the spelling, or start an entry with this text.':'Everything is posted. New drafts come from Expenses, Gear and the bank, or from New entry.'}</p><div class="ml-acts">${q?btn('secondary','New entry “'+esc(q)+'”','data-act="jnew" data-desc="'+esc(q)+'"','plus')+btn('ghost','Clear search','data-act="jall"'):btn('ghost','Show all','data-act="jall"')}</div></div>`;
 return `<div class="page m-page">${lhead('Journal',`Jan–Oct 2026, ${total} entries, ${nd?nd+(nd===1?' draft':' drafts')+' to post':'all posted'}`,btn('secondary','Export','data-act="lexport" data-what="journal"','download')+btn('accent','New entry','data-act="jnew"','plus')+more('jmore'))}
 ${L.ledgerTabs('journal')}
 ${nd&&M.jf!=='draft'&&!q?banner(`${nd} ${nd===1?'draft waits':'drafts wait'} to be posted`,'Drafts are not in the reports yet. Post them when the lines are right; posted entries are locked and can only be reversed.',btn('secondary s','Show drafts','data-act="jfilt" data-f="draft"')):''}
 <div class="ml-content">${chips}${list.length?table+footer:none}</div></div>${ledAbar()}`;};

/* entry detail drawer */
L.OVERLAYS.mldrawer=o=>`<div class="scrim" data-act="close"></div><aside class="drawer m-dr ${o.cls||''}" role="dialog" aria-modal="true" aria-label="${esc(o.title)}"><div class="dh"><div class="grow"><h2 class="t-title">${o.title}</h2><span class="t-meta muted">${o.sub||''}</span></div><button class="btn ghost s" data-act="close">${ic('x','s')}Close</button></div><div class="db">${o.body}</div><div class="df">${o.foot}</div></aside>`;
const linesTable=e=>{const d=e.lines.reduce((a,l)=>a+l[2],0),c=e.lines.reduce((a,l)=>a+l[3],0);
 return `<div class="ml-lt" role="table" aria-label="Lines"><div class="ml-ltr ml-lth" role="row"><span>Account</span><span class="n">Debit</span><span class="n">Credit</span></div>
 ${e.lines.map(l=>`<button class="ml-ltr" role="row" data-act="jacct" data-n="${l[0]}"><span class="ml-tt"><b>${l[0]?`<span class="mono">${l[0]}</span> ${esc(accName(l[0]))}`:'No account yet'}</b><small>${esc(l[1])}</small></span><span class="n mono">${kr0(l[2])}</span><span class="n mono">${kr0(l[3])}</span></button>`).join('')}
 <div class="ml-ltr ml-ltt" role="row"><span>Total</span><span class="n mono">${L.kr(d)}</span><span class="n mono">${L.kr(c)}</span></div></div>
 <p class="ml-bal ${d===c?'ok':'bad'}">${ic(d===c?'check':'alert','s')}${d===c?'Balanced, debit equals credit':`Off by ${L.kr(Math.abs(d-c))} DKK, it cannot be posted until debit equals credit`}</p>`;};
const JSRC=e=>/Expenses/.test(e.src)?['Expenses','data-act="jsrc" data-to="expenses"']:/Invoices/.test(e.src)?['Invoices','data-act="jsrc" data-to="invoices"']:/Gear/.test(e.src)?['Gear','data-go="gear"']:null;
L.DR.jentry=no=>{const e=M.je.find(x=>x.no===+no);if(!e)return null;const dr=e.st==='draft';const src=JSRC(e);
 const fact=(k,v)=>`<div class="ml-fact"><span>${k}</span><span>${v}</span></div>`;
 return {type:'mldrawer',title:`Entry ${e.no}, ${esc(e.desc)}`,sub:`${e.date} 2026`,
 body:`<div class="ml-ehd"><span class="ml-eamt mono">${L.kr(jTotal(e))} <small>DKK</small></span>${dr?tag('draft','Draft'):tag('confirmed','Posted')}<span class="ml-est muted">${dr?'Not in the reports yet':'In the books, locked'}</span></div>
 <div class="ml-facts">${fact('Reference',`<span class="mono">${esc(e.ref)||'None'}</span>`)}${fact('Counterparty',esc(e.cp)||'None')}${fact('Came from',src?`<button class="ml-link" ${src[1]}>${esc(e.src.replace(/^From /,''))}${ic('right','s')}</button>`:esc(e.src))}${fact('Booked',`${e.date} 2026`)}</div>
 <div class="ml-filebox">${e.att?`<button class="ml-fcard" data-act="jfile" data-f="${esc(e.att)}"><span class="ml-fic">${ic(/\.pdf$/.test(e.att)?'filetext':'clip','s')}</span><span class="ml-ft"><b>${esc(e.att)}</b><small>${/\.pdf$/.test(e.att)?'PDF':'Photo'}, attached ${e.date}</small></span><span class="ml-fo">Open</span></button>`
  :`<div class="ml-fcard none"><span class="ml-fic">${ic('upload','s')}</span><span class="ml-ft"><b>No receipt attached</b><small>${jNeedsFile(e)?'The bookkeeper will ask for it.':'Not needed for this kind of entry.'}</small></span>${jNeedsFile(e)?btn('secondary s','Add','data-act="jattach" data-no="'+e.no+'"'):''}</div>`}</div>
 <div class="m-lines"><span class="m-ll">Lines</span>${linesTable(e)}</div>
 <p class="m-foot m-nopad">${dr?'Drafts can be edited or deleted. Post writes the entry to the books and locks it.':'Posted entries are never edited. Reverse writes a new entry dated today with debit and credit swapped, so the history stays readable.'}</p>`,
 foot:dr?`${btn('ghost s','Delete draft',`data-act="jdel" data-no="${e.no}"`)}<span style="flex:1"></span>${btn('secondary','Edit',`data-act="jedit" data-no="${e.no}"`,'pencil')}${btn('accent','Post',`data-act="jpost" data-no="${e.no}"`,'check')}`
  :`${btn('ghost s','Copy as new',`data-act="jcopy" data-no="${e.no}"`,'copy')}<span style="flex:1"></span>${btn('secondary','Reverse',`data-act="jrev" data-no="${e.no}"`,'undo')}`};};

/* new entry drawer: lines must balance; paired entries start from a template */
const PAID=[[1000,'Bank'],[1010,'Cash'],[2500,'Band card'],[2000,'Not paid yet']];
const TPL={blank:['Blank',''],gear:['Gear bought','Gear bought'],member:['Paid by a member','Expense paid by a member'],payment:['Payment received','Payment, invoice'],payout:['Payout to a member','Payout to a member']};
const tplLines=(t,paid)=>({blank:[[0,'',0,0],[0,'',0,0]],gear:[[1500,'Equipment',0,0],[paid,PAID.find(p=>p[0]===paid)[1],0,0]],member:[[5000,'',0,0],[2100,'Owed back to the member',0,0]],payment:[[1000,'Danske Bank',0,0],[1100,'Invoice',0,0]],payout:[[2100,'',0,0],[1000,'Danske Bank',0,0]]})[t];
const CP=['None','Hotel Royal A/S','Club Mono','Odense Live','Studio B','Thomann','Feature.fm','Mette Ravn','Sofie Lund','Jonas Holm'];
const accOpts=v=>`<option value="0" ${!v?'selected':''}>Pick an account</option>${[1,2,3,4,5].map(c=>`<optgroup label="${c}xxx ${CLS[c]}">${M.acc.filter(a=>cls(a[0])===c).map(a=>`<option value="${a[0]}" ${a[0]===+v?'selected':''}>${a[0]} ${esc(a[1])}</option>`).join('')}</optgroup>`).join('')}`;
let jl=0;
const jLine=l=>{const i=++jl;return `<div class="ml-jl" data-l="${i}"><div class="ml-jl1">${field('jd-a'+i,'Account',`<select class="input ml-acc" id="jd-a${i}">${accOpts(l[0])}</select>`,'','ml-grow')}<button class="btn ghost s icon ml-rm" data-act="jrmline" aria-label="Remove line">${ic('x','s')}</button></div>
 <div class="ml-jl2">${field('jd-t'+i,'Text',`<input class="input" id="jd-t${i}" value="${esc(l[1])}">`,'','ml-grow')}${field('jd-d'+i,'Debit',`<input class="input mono ml-dr" id="jd-d${i}" inputmode="decimal" value="${kr0(l[2])}" placeholder="0">`,'','ml-w120')}${field('jd-c'+i,'Credit',`<input class="input mono ml-cr" id="jd-c${i}" inputmode="decimal" value="${kr0(l[3])}" placeholder="0">`,'','ml-w120')}</div></div>`;};
const paidSeg=()=>M.jd.tpl==='gear'?`<div class="field"><label>Paid with</label><div class="m-modes">${PAID.map(([n,l])=>`<button class="chip m-chip ${M.jd.paid===n?'on':''}" data-act="jpaid" data-n="${n}" aria-pressed="${M.jd.paid===n}">${l}</button>`).join('')}</div><span class="help">Debit 1500 Equipment, credit ${M.jd.paid} ${esc(accName(M.jd.paid))}. Adding the item to Gear proposes this entry for you, same date.</span></div>`:'';
L.DR.jnew=(pre={})=>{M.jd={tpl:pre.tpl||'blank',paid:1000,editNo:pre.editNo||null,att:pre.att||''};const e=pre.entry;
 const lines=e?e.lines:tplLines(M.jd.tpl,M.jd.paid);
 return {type:'mldrawer',cls:'ml-wide',title:e&&pre.editNo?`Edit draft ${e.no}`:'New journal entry',sub:e&&pre.editNo?'Still a draft, nothing is booked until you post':`Gets number ${Math.max(...M.je.map(x=>x.no))+1} when saved, every entry must balance`,
 body:`${pre.editNo?'':`<div class="field"><label>Start from</label><div class="m-modes">${Object.entries(TPL).map(([k,[l]])=>`<button class="chip m-chip ${M.jd.tpl===k?'on':''}" data-act="jtpl" data-t="${k}" aria-pressed="${M.jd.tpl===k}">${l}</button>`).join('')}</div><span class="help">Paired entries: the usual two sides are filled, you add the amount</span></div>`}
 <div id="jd-paid">${paidSeg()}</div>
 <div class="m-dates">${field('jd-date','Date',`<span class="m-ifld">${ic('calendar')}<input class="m-fin" id="jd-date" value="${esc(e?e.date+' 2026':'21 Oct 2026')}"></span>`)}${field('jd-ref','Reference',`<input class="input mono" id="jd-ref" value="${esc(e?e.ref:'')}" placeholder="Receipt or invoice no.">`)}</div>
 ${field('jd-desc','Description',`<input class="input" id="jd-desc" value="${esc(e?e.desc:pre.desc||TPL[M.jd.tpl][1])}" placeholder="What happened, in plain words">`)}
 ${field('jd-cp','Counterparty',`<select class="input m-w320" id="jd-cp">${CP.map(c=>`<option ${e&&e.cp===c?'selected':''}>${c}</option>`).join('')}</select>`,'A contact or venue, optional')}
 <label class="drop ml-drop">${ic('clip','s')}<span class="ml-tt"><b id="jd-att">${M.jd.att?esc(M.jd.att):'Attach a receipt or invoice'}</b><small>Image or PDF, kept with the entry for the bookkeeper</small></span><input type="file" accept="image/*,.pdf" hidden data-jfile></label>
 <div class="m-lines"><span class="m-ll">Lines</span><div id="jd-lines" class="ml-jls">${lines.map(jLine).join('')}</div></div>
 <div class="m-add">${ghostBtn('Add line','data-act="jaddline"','plus')}</div>
 <div class="m-tot"><div class="m-line m-tl"><span class="m-tx">Debit</span><span class="m-amt mono" id="jd-td">0</span></div>
  <div class="m-line m-tl"><span class="m-tx">Credit</span><span class="m-amt mono" id="jd-tc">0</span></div>
  <p class="ml-bal" id="jd-st" aria-live="polite"></p></div>
 <p class="m-foot m-nopad">Post books the entry and locks it. Save draft keeps it out of the reports, it may be off while you work on it. If you do not know the amount or how it was paid, leave it as a draft rather than guessing.</p>`,
 foot:`${btn('ghost s','Cancel','data-act="close"')}<span style="flex:1"></span>${btn('secondary','Save draft','data-act="jsave"')}${btn('accent','Post','data-act="jpostnew"','check')}`};};
function readLines(){return [...document.querySelectorAll('#jd-lines .ml-jl')].map(r=>[+r.querySelector('.ml-acc').value,r.querySelector('[id^="jd-t"]').value.trim(),num(r.querySelector('.ml-dr').value),num(r.querySelector('.ml-cr').value)]);}
function recalcJ(){const ls=readLines();const d=ls.reduce((a,l)=>a+l[2],0),c=ls.reduce((a,l)=>a+l[3],0);
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.innerHTML=v;};set('jd-td',L.kr(d));set('jd-tc',L.kr(c));
 const st=document.getElementById('jd-st');if(!st)return;const ok=d===c&&d>0;st.className='ml-bal '+(ok?'ok':d||c?'bad':'');
 st.innerHTML=ok?`${ic('check','s')}Balanced, ${L.kr(d)} DKK on each side`:d||c?`${ic('alert','s')}Off by ${L.kr(Math.abs(d-c))} DKK, debit and credit must match to post`:'Enter the amounts, debit and credit must match';}
L.INPUT.push(t=>{if(t.closest&&t.closest('#jd-lines')){
  const rows=[...document.querySelectorAll('#jd-lines .ml-jl')];
  if(M.jd&&M.jd.tpl!=='blank'&&rows.length===2&&t.classList.contains('ml-dr')&&t.closest('.ml-jl')===rows[0]){rows[1].querySelector('.ml-cr').value=t.value;}
  recalcJ();return true;}
 if(t.id==='jsearch'){M.jq=t.value;L.render();return true;}
 if(t.id==='asearch'){M.aq=t.value;L.render();return true;}
 if(t.id==='na-no'){const h=document.getElementById('na-h');const n=+t.value;if(h)h.textContent=n>=1000&&n<6000?`${TYPE[cls(n)]}, in ${cls(n)}xxx ${CLS[cls(n)]}`:'1xxx assets, 2xxx liabilities, 3xxx equity, 4xxx income, 5xxx expenses';return true;}
 return false;});
L.CHANGE.push(t=>{if(t.dataset&&t.dataset.jfile!==undefined){const f=t.files&&t.files[0];if(f&&M.jd){M.jd.att=f.name;const b=document.getElementById('jd-att');if(b)b.textContent=f.name;}return true;}
 if(t.classList&&t.classList.contains('ml-acc')){recalcJ();return true;}return false;});

/* ---------- Chart of accounts ---------- */
function accEmpty(){
 return `<div class="ml-empty"><h2 class="t-title">No chart of accounts yet</h2><p>The journal needs accounts to post to. The default chart is made for bands: ${ACC0.length} accounts from 1000 Bank to 5400 Fees, with the moms codes set. Rename, add or hide accounts afterwards.</p>
 <div class="ml-preview" aria-hidden="true">${[1,2,3,4,5].map(c=>`<div><span class="mono">${c}xxx</span><b>${CLS[c]}</b><small>${ACC0.filter(a=>cls(a[0])===c).slice(0,3).map(a=>a[1].split(',')[0]).join(', ')}</small></div>`).join('')}</div>
 <div class="ml-acts">${btn('accent','Install the default chart','data-act="jinstall"','check')}${btn('secondary','Import from Dinero or e-conomic','data-act="jimportcoa"','upload')}</div></div>`;}
L.VIEWS.accounts=()=>{
 if(!M.coa)return `<div class="page m-page">${lhead('Chart of accounts','No accounts yet, install the default chart to start the books',btn('secondary','New account','data-act="jnewacct"','plus')+more('accmore'))}${L.ledgerTabs('accounts')}${accEmpty()}</div>${ledAbar()}`;
 const q=M.aq.trim().toLowerCase();const match=a=>!q||(a[0]+' '+a[1]).toLowerCase().includes(q);
 const groups=[1,2,3,4,5].map(c=>{const list=M.acc.filter(a=>cls(a[0])===c&&match(a));if(!list.length)return '';
  const sub=list.reduce((s,a)=>s+balOf(a[0]),0);
  return `<div class="ml-tr ml-gh ml-a" role="row"><span class="mono">${c}xxx</span><span>${CLS[c]}</span><span></span><span></span><span></span><span class="n mono">${L.kr(sub)}</span></div>
  ${list.map(a=>`<div class="ml-tr ml-a" role="row" tabindex="0" data-act="jacct" data-n="${a[0]}"><span class="mono ml-no">${L.hl(String(a[0]),q)}</span><span class="ml-tt"><b>${L.hl(a[1],q)}</b></span><span class="ml-m">${TYPE[c]}</span><span class="ml-m">${a[2]}</span><span class="n ml-m">${ENT[a[0]]||0}</span><span class="n mono">${L.kr(balOf(a[0]))}</span></div>`).join('')}`;}).join('');
 return `<div class="page m-page">${lhead('Chart of accounts',`${M.acc.length} accounts, balances at 31 Oct 2026`,btn('secondary','Export','data-act="lexport" data-what="accounts"','download')+btn('accent','New account','data-act="jnewacct"','plus')+more('accmore'))}
 ${L.ledgerTabs('accounts')}
 <div class="ml-content ml-narrow"><div class="ml-tools"><span class="ml-note">Expenses show these in plain words: Travel is 5000, Rehearsal is 5100.</span><span class="sp"></span>${search('asearch','Number or name',M.aq,'Search accounts')}</div>
 ${groups?`<div class="ml-table" role="table" aria-label="Chart of accounts"><div class="ml-tr ml-th ml-a" role="row"><span>No.</span><span>Name</span><span>Type</span><span>Moms</span><span class="n">Entries</span><span class="n">Balance</span></div>${groups}</div>
 <div class="ml-foot"><span>Balances include posted entries only. Debit-side accounts (assets, expenses) and credit-side accounts (liabilities, equity, income) both show as positive.</span></div>`
 :`<div class="ml-empty"><h2 class="t-title">No account matches “${esc(M.aq.trim())}”</h2><p>Search by number or name. Add it as a new account if it is missing.</p><div class="ml-acts">${btn('secondary','New account','data-act="jnewacct"','plus')}${btn('ghost','Clear search','data-act="aclear"')}</div></div>`}</div></div>${ledAbar()}`;};

L.DR.jacct=n=>{n=+n;const a=M.acc.find(x=>x[0]===n);if(!a)return null;const c=cls(n);
 const ents=M.je.filter(e=>e.lines.some(l=>l[0]===n));
 return {type:'mldrawer',title:`${n} ${esc(a[1])}`,sub:`${TYPE[c]}, ${c}xxx ${CLS[c]}, moms ${a[2]==='—'?'not used':a[2]}`,
 body:`${kpis([kpi('Balance, 31 Oct 2026',L.kr(balOf(n))+' DKK',`${debitSide(n)?'debit':'credit'} side, ${ENT[n]||0} entries this year`,'muted','rule')])}
 <div class="m-lines"><span class="m-ll">Recent entries</span><div class="m-body">${ents.length?ents.map(e=>{const l=e.lines.find(x=>x[0]===n);return line({label:`${e.no}, ${esc(e.desc)}`,note:`${e.date}${e.st==='draft'?', draft':''}, ${l[2]?'debit':'credit'}`,amt:L.kr(l[2]||l[3]),attrs:`data-act="jopen" data-no="${e.no}"`,cls:'m-flush'});}).join(''):`<p class="m-foot m-nopad">No entries in October yet.</p>`}</div></div>
 <p class="m-foot m-nopad">${n===1500?'Gear bought pairs with this account: adding an item in Gear proposes a debit here and a credit to how it was paid.':n===2100?'Expenses paid by a member land here and are paid back with their next payout.':'Accounts in use are never deleted, only hidden from pickers.'}</p>`,
 foot:`${btn('ghost s','Hide account','data-act="jhideacct" data-n="'+n+'"')}<span style="flex:1"></span>${btn('secondary','Show in the journal',`data-act="jshowin" data-n="${n}"`,'filetext')}`};};
L.DR.jnewacct=()=>({type:'mldrawer',title:'New account',sub:'Numbers follow the chart: the first digit says the group',
 body:`${field('na-no','Number',`<input class="input mono" id="na-no" inputmode="numeric" maxlength="4" placeholder="5500">`,{t:'1xxx assets, 2xxx liabilities, 3xxx equity, 4xxx income, 5xxx expenses',id:'na-h'},'m-w160')}
 ${field('na-name','Name',`<input class="input m-w320" id="na-name" placeholder="Promotion">`,'Plain words, shown on Expenses chips and in reports')}
 ${field('na-vat','Moms',`<select class="input" id="na-vat"><option>25 %</option><option>Momsfri</option><option>—</option></select>`,'Never guessed: pick it for this account','m-w160')}`,
 foot:`${btn('ghost s','Cancel','data-act="close"')}<span style="flex:1"></span>${btn('accent','Add account','data-act="jaddacct"','plus')}`});

/* ---------- Ledger reports: P&L, balance sheet, trial balance ---------- */
const REP={pl:'Profit and loss',bs:'Balance sheet',tb:'Trial balance'};
const rrow=(n,name,cells,cls2='')=>`<tr class="${cls2}" ${n?`data-act="jacct" data-n="${n}" tabindex="0"`:''}><td class="mono ml-no">${n||''}</td>${cls2?`<td class="tt"><b>${name}</b></td>`:`<td>${name}</td>`}${cells.map(c=>`<td class="num mono">${c}</td>`).join('')}</tr>`;
function repPL(p){const P=PER[p];const v=plFor(P.fi,P.fe);const cmp=k=>r50(v[k]/(cls(+k)===4?1.09:.96));
 const part=c=>{const ks=Object.keys(v).filter(k=>cls(+k)===c);return {rows:ks.map(k=>rrow(k,esc(accName(k)),[L.kr(v[k]),L.kr(cmp(k))])).join(''),t:ks.reduce((a,k)=>a+v[k],0),tc:ks.reduce((a,k)=>a+cmp(k),0)};};
 const i=part(4),e=part(5);
 return `<table class="ml-rep"><thead><tr><th>No.</th><th>Account</th><th class="num">${P.label.replace(/^This year, |^Last year, /,'')}</th><th class="num">${P.cmp}</th></tr></thead><tbody>
 <tr class="ml-grp"><td colspan="4">Income</td></tr>${i.rows}${rrow('','Total income',[L.kr(i.t),L.kr(i.tc)],'ml-sub')}
 <tr class="ml-grp"><td colspan="4">Expenses</td></tr>${e.rows}${rrow('','Total expenses',[L.kr(e.t),L.kr(e.tc)],'ml-sub')}
 ${rrow('','Result before tax',[L.kr(i.t-e.t),L.kr(i.tc-e.tc)],'ml-res')}</tbody></table>`;}
function repBS(p){const d=books(PER[p].end);const acc=c=>M.acc.filter(a=>cls(a[0])===c&&a[0]!==3000);
 const rows=c=>acc(c).map(a=>rrow(a[0],esc(a[1]),[L.kr(d.b[a[0]]??0)])).join('');const tl=d.liab+d.eq+d.result;
 return `<table class="ml-rep"><thead><tr><th>No.</th><th>Account</th><th class="num">As at ${PER[p].asAt}</th></tr></thead><tbody>
 <tr class="ml-grp"><td colspan="3">Assets</td></tr>${rows(1)}${rrow('','Total assets',[L.kr(d.assets)],'ml-sub')}
 <tr class="ml-grp"><td colspan="3">Liabilities</td></tr>${rows(2)}${rrow('','Total liabilities',[L.kr(d.liab)],'ml-sub')}
 <tr class="ml-grp"><td colspan="3">Equity</td></tr>${rrow(3000,esc(accName(3000)),[L.kr(d.eq)])}${rrow('',`Result ${PER[p].end===25?'2025':'this year so far'}`,[L.kr(d.result)])}${rrow('','Total equity',[L.kr(d.eq+d.result)],'ml-sub')}
 ${rrow('','Liabilities and equity',[L.kr(tl)],'ml-res')}</tbody></table>
 <p class="ml-bal ${tl===d.assets?'ok':'bad'}">${ic('check','s')}Balanced, assets ${L.kr(d.assets)} DKK equal liabilities and equity</p>`;}
function repTB(p){const d=books(PER[p].end);let td=0,tc=0;
 const grp=c=>{let gd=0,gc=0;const rows=M.acc.filter(a=>cls(a[0])===c).map(a=>{const v=balOf(a[0],PER[p].end);if(!v)return '';const dr=debitSide(a[0]);if(dr){td+=v;gd+=v;}else{tc+=v;gc+=v;}return rrow(a[0],esc(a[1]),[dr?L.kr(v):'',dr?'':L.kr(v)]);}).join('');
  return rows?`<tr class="ml-grp"><td colspan="4">${CLS[c][0].toUpperCase()+CLS[c].slice(1)}</td></tr>${rows}`:'';};
 const body=[1,2,3,4,5].map(grp).join('');
 return `<table class="ml-rep"><thead><tr><th>No.</th><th>Account</th><th class="num">Debit</th><th class="num">Credit</th></tr></thead><tbody>${body}${rrow('','Total',[L.kr(td),L.kr(tc)],'ml-res')}</tbody></table>
 <p class="ml-bal ${td===tc?'ok':'bad'}">${ic('check','s')}Balanced, debit ${L.kr(td)} DKK equals credit, as at ${PER[p].asAt}</p>`;}
/* the three numbers each report answers, above it */
const repKpis=(r,p)=>{const P=PER[p];if(r==='pl'){const v=plFor(P.fi,P.fe);const t=c=>Object.keys(v).filter(k=>cls(+k)===c).reduce((a,k)=>a+v[k],0);const i=t(4),e=t(5);return kpis([kpi('Income',L.kr(i)+' DKK',P.label,'muted','rule'),kpi('Expenses',L.kr(e)+' DKK',P.label,'muted','rule'),kpi('Result',L.kr(i-e)+' DKK','before tax',i-e>=0?'ok':'att','rule')]);}
 const d=books(P.end);if(r==='bs')return kpis([kpi('The band owns',L.kr(d.assets)+' DKK','assets, as at '+P.asAt,'muted','rule'),kpi('The band owes',L.kr(d.liab)+' DKK','bills, moms, members','muted','rule'),kpi('Equity',L.kr(d.eq+d.result)+' DKK','incl. the result so far','ok','rule')]);
 let td=0,tc=0;M.acc.forEach(a=>{const v=balOf(a[0],P.end);if(!v)return;if(debitSide(a[0]))td+=v;else tc+=v;});return kpis([kpi('Debit',L.kr(td)+' DKK','all accounts','muted','rule'),kpi('Credit',L.kr(tc)+' DKK','all accounts','muted','rule'),kpi('Difference',L.kr(Math.abs(td-tc))+' DKK',td===tc?'balanced':'an entry is wrong',td===tc?'ok':'att','rule')]);};
L.VIEWS.ledgerreport=()=>{const p=PER[M.per]?M.per:'ytd',r=REP[M.rep]?M.rep:'pl';const nd=drafts();
 const note={pl:`Income and expenses for ${PER[p].label.toLowerCase().replace(/^this year, |^last year, /,'')}, compared with ${PER[p].cmp}. Open an account to see its entries.`,
  bs:`What the band owns and owes at the end of the period. The result so far is part of equity until the year is closed.`,
  tb:`Every account with a balance at the end of the period. If debit and credit ever differ, an entry is wrong; posting blocks that.`}[r];
 return `<div class="page m-page">${lhead('Reports',`${PER[p].label}${nd&&p!=='y25'?`, ${nd} ${nd===1?'draft':'drafts'} left out`:''}`,btn('secondary','Export','data-act="lexport" data-what="report"','download')+btn('accent','Send to the bookkeeper','data-act="lexport" data-what="bookkeeper"','send'))}
 ${L.ledgerTabs('ledgerreport')}
 <div class="ml-content ml-narrow"><div class="ml-tools"><div class="m-modes" role="tablist">${Object.entries(REP).map(([k,l])=>`<button class="chip m-chip ${r===k?'on':''}" role="tab" aria-selected="${r===k}" data-act="lrep" data-r="${k}">${l}</button>`).join('')}</div><button class="chip m-chip ml-per" data-act="lperiod" aria-haspopup="menu">${ic('calendar','s')}${PER[p].label}${ic('down','s')}</button><span class="sp"></span>${ghostBtn('VAT period','data-act="mnyreport" data-r="VAT period"','ext')}</div>
 ${repKpis(r,p)}
 <div class="table-wrap ml-repw">${{pl:repPL,bs:repBS,tb:repTB}[r](p)}</div>
 ${foot(note)}</div></div>${ledAbar()}`;};

/* ---------- ledger actions ---------- */
const openDr=d=>{if(!d)return;S.overlay=d;L.render();};
const findE=no=>M.je.find(e=>e.no===+no);
Object.assign(A,{
 jopen:el=>openDr(L.DR.jentry(el.dataset.no)),
 jacct:el=>openDr(L.DR.jacct(el.dataset.n)),
 jfilt:el=>{M.jf=el.dataset.f;S.overlay=null;L.render();},
 jall:()=>{M.jf='all';M.jq='';L.render();},
 jolder:()=>L.toast(`Entries 1 to ${OLDER} load as you scroll, newest first`),
 jfile:el=>L.toast(`${el.dataset.f} opened in a new tab`),
 jnew:el=>{const d=el&&el.dataset&&el.dataset.desc;openDr(L.DR.jnew(d?{desc:d}:{}));setTimeout(recalcJ,0);},
 jedit:el=>{const e=findE(el.dataset.no);if(!e)return;openDr(L.DR.jnew({entry:e,editNo:e.no,att:e.att}));setTimeout(recalcJ,0);},
 jcopy:el=>{const e=findE(el.dataset.no);if(!e)return;openDr(L.DR.jnew({entry:{...e,ref:'',date:'21 Oct'},att:''}));setTimeout(recalcJ,0);},
 jtpl:el=>{if(!M.jd)return;M.jd.tpl=el.dataset.t;document.querySelectorAll('[data-act="jtpl"]').forEach(b=>{const on=b.dataset.t===M.jd.tpl;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});
  const w=document.getElementById('jd-lines');if(w)w.innerHTML=tplLines(M.jd.tpl,M.jd.paid).map(jLine).join('');
  const p=document.getElementById('jd-paid');if(p)p.innerHTML=paidSeg();const d=document.getElementById('jd-desc');if(d)d.value=TPL[M.jd.tpl][1];recalcJ();},
 jpaid:el=>{if(!M.jd)return;M.jd.paid=+el.dataset.n;const p=document.getElementById('jd-paid');if(p)p.innerHTML=paidSeg();
  const rows=document.querySelectorAll('#jd-lines .ml-jl');const last=rows[1];if(last){last.querySelector('.ml-acc').value=String(M.jd.paid);last.querySelector('[id^="jd-t"]').value=PAID.find(x=>x[0]===M.jd.paid)[1];}recalcJ();},
 jaddline:()=>{const w=document.getElementById('jd-lines');if(!w)return;w.insertAdjacentHTML('beforeend',jLine([0,'',0,0]));w.lastElementChild.querySelector('select')?.focus();recalcJ();},
 jrmline:el=>{const rows=document.querySelectorAll('#jd-lines .ml-jl');if(rows.length<=2){L.toast('An entry needs at least two lines, one debit and one credit');return;}el.closest('.ml-jl').remove();recalcJ();},
 jsave:()=>saveEntry('draft'),
 jpostnew:()=>saveEntry('posted'),
 jpostall:()=>{const l=M.je.filter(e=>e.st==='draft'&&jDiff(e)===0);const old=l.map(e=>e.no);l.forEach(e=>{e.st='posted';});M.jf='all';L.render();L.toast(`${l.length} ${l.length===1?'entry':'entries'} posted and locked`,()=>{M.je.forEach(e=>{if(old.includes(e.no))e.st='draft';});L.render();});},
 jsrc:el=>{S.overlay=null;S.mtab=el.dataset.to;L.go('money');},
 jattach:el=>{const e=findE(el.dataset.no);if(!e)return;e.att=e.desc.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'')+'.jpg';openDr(L.DR.jentry(e.no));L.toast('Receipt attached to entry '+e.no,()=>{e.att='';L.render();});},
 jpost:el=>{const e=findE(el.dataset.no);if(!e)return;if(jDiff(e)!==0){openDr(L.DR.jnew({entry:e,editNo:e.no,att:e.att}));setTimeout(recalcJ,0);L.toast(`Draft ${e.no} is off by ${L.kr(Math.abs(jDiff(e)))} DKK, fix the lines to post it`);return;}e.st='posted';S.overlay=null;L.render();L.toast(`Entry ${e.no} posted, it is in the reports now`,()=>{e.st='draft';});},
 jdel:el=>{const no=+el.dataset.no;L.open('modal',{html:L.confirmM(`Delete draft ${no}?`,'It was never posted, so the books do not change. The receipt stays in Expenses.','Keep draft','jdelok" data-no="'+no,'Delete draft',1)});},
 jdelok:el=>{const i=M.je.findIndex(e=>e.no===+el.dataset.no);if(i<0)return;const [e]=M.je.splice(i,1);S.overlay=null;L.render();L.toast(`Draft ${e.no} deleted`,()=>{M.je.splice(i,0,e);});},
 jrev:el=>{const e=findE(el.dataset.no);if(!e)return;const no=Math.max(...M.je.map(x=>x.no))+1;
  const r={no,date:'21 Oct',desc:`Reversal of entry ${e.no}, ${e.desc}`,ref:e.ref,cp:e.cp,att:'',st:'posted',src:`Reverses entry ${e.no}`,lines:e.lines.map(l=>[l[0],l[1],l[3],l[2]])};
  M.je.unshift(r);S.overlay=null;M.jf='all';M.jq='';L.go('journal');L.toast(`Entry ${no} reverses ${e.no}, both stay in the journal`,()=>{M.je.shift();});},
 jmore:el=>menu(el,[[M.jf==='draft'?'Show all entries':'Show only drafts','jfilt',`data-f="${M.jf==='draft'?'all':'draft'}"`],['Import entries from a CSV','jimport'],['Chart of accounts','jgoacc']]),
 jimport:()=>{S.overlay=null;L.render();L.toast('Import started: entries.csv, 24 rows, saved as drafts');},
 jgoacc:()=>L.go('accounts'),
 jshowin:el=>{M.jq=el.dataset.n;M.jf='all';S.overlay=null;L.go('journal');},
 jhideacct:el=>{const n=+el.dataset.n;const i=M.acc.findIndex(a=>a[0]===n);if(i<0)return;const [a]=M.acc.splice(i,1);S.overlay=null;L.render();L.toast(`${n} ${a[1]} hidden from pickers`,()=>{M.acc.splice(i,0,a);});},
 jinstall:()=>{M.coa=true;M.acc=ACC0.map(a=>a.slice());L.render();L.toast(`Default chart installed, ${ACC0.length} accounts`,()=>{M.coa=false;});},
 jimportcoa:()=>L.toast('Choose the chart export from Dinero or e-conomic, numbers are kept'),
 accmore:el=>menu(el,[[M.coa?'Show the empty state':'Show the chart','jcoa'],['Import from Dinero or e-conomic','jimportcoa'],['Open the journal','jgojour']]),
 jcoa:()=>{M.coa=!M.coa;S.overlay=null;L.render();},
 jgojour:()=>L.go('journal'),
 aclear:()=>{M.aq='';L.render();},
 jnewacct:()=>openDr(L.DR.jnewacct()),
 jaddacct:()=>{const no=document.getElementById('na-no'),nm=document.getElementById('na-name'),h=document.getElementById('na-h');const n=+(no?.value||0),name=(nm?.value||'').trim();
  const err=n<1000||n>5999?'Use four digits from 1000 to 5999':M.acc.some(a=>a[0]===n)?`${n} is taken by ${accName(n)}`:!name?'':null;
  if(err!==null){if(err){h.textContent=err;h.classList.add('ml-err');no.focus();}else nm.focus();return;}
  const a=[n,name,document.getElementById('na-vat').value];M.acc.push(a);M.acc.sort((x,y)=>x[0]-y[0]);M.coa=true;M.aq='';S.overlay=null;L.go('accounts');
  L.toast(`${n} ${name} added to ${CLS[cls(n)]}`,()=>{M.acc.splice(M.acc.indexOf(a),1);});},
 lrep:el=>{M.rep=el.dataset.r;L.render();},
 lperiod:el=>menu(el,Object.entries(PER).map(([k,P])=>[`<span class="ml-mi">${M.per===k?ic('check','s'):''}</span>${P.label}`,'lper',`data-p="${k}" aria-checked="${M.per===k}" role="menuitemradio"`])),
 lper:el=>{M.per=el.dataset.p;S.overlay=null;L.render();},
 lexport:el=>{const w=el.dataset.what;if(w==='bookkeeper'){L.toast(`Sent to the bookkeeper: ${REP[M.rep].toLowerCase()}, ${PER[M.per].label}, as PDF and CSV`,()=>{});return;}const what=w==='journal'?'the journal, Jan–Oct 2026':w==='accounts'?'the chart of accounts':`${REP[M.rep].toLowerCase()}, ${PER[M.per].label}`;
  L.open('modal',{html:`<div class="ml-modal"><h2 class="t-title">Export ${what}</h2><div class="field"><label>Format</label><div class="seg"><button class="on">PDF</button><button>CSV</button><button>Excel</button></div></div><label class="row" style="gap:10px"><input type="checkbox" checked style="width:16px;height:16px;accent-color:var(--ink)">Include account numbers</label><p class="m-foot m-nopad">Drafts are never exported. Nothing is sent, the file downloads here.</p><div class="row" style="justify-content:flex-end">${btn('secondary','Cancel','data-act="close"')}${btn('accent','Export','data-act="close" data-msg="Export ready: '+esc(what)+'"','download')}</div></div>`});},
});
function saveEntry(st){const ls=readLines().filter(l=>l[0]||l[1]||l[2]||l[3]);const d=ls.reduce((a,l)=>a+l[2],0),c=ls.reduce((a,l)=>a+l[3],0);const stEl=document.getElementById('jd-st');
 const fail=(msg,el)=>{if(stEl){stEl.className='ml-bal bad';stEl.innerHTML=ic('alert','s')+msg;}el?.focus();};
 if(st==='posted'){
  const rows=[...document.querySelectorAll('#jd-lines .ml-jl')];
  const noAcc=rows.find(r=>(num(r.querySelector('.ml-dr').value)||num(r.querySelector('.ml-cr').value))&&!+r.querySelector('.ml-acc').value);
  if(noAcc)return fail('Every line with an amount needs an account',noAcc.querySelector('.ml-acc'));
  const both=rows.find(r=>num(r.querySelector('.ml-dr').value)&&num(r.querySelector('.ml-cr').value));
  if(both)return fail('A line is either debit or credit, not both',both.querySelector('.ml-cr'));
  if(!d)return fail('Enter the amounts first',rows[0]?.querySelector('.ml-dr'));
  if(d!==c)return fail(`Off by ${L.kr(Math.abs(d-c))} DKK, debit and credit must match to post. Save it as a draft if you are not sure yet.`,rows[rows.length-1]?.querySelector(d>c?'.ml-cr':'.ml-dr'));}
 const v=id=>(document.getElementById(id)||{}).value||'';const cp=v('jd-cp');
 const data={date:v('jd-date').replace(/\s*\d{4}$/,'')||'21 Oct',desc:v('jd-desc').trim()||'Journal entry',ref:v('jd-ref').trim(),cp:cp==='None'?'':cp,att:M.jd?.att||'',st,lines:ls.length?ls:[[0,'',0,0]]};
 const editNo=M.jd?.editNo;let undo;
 if(editNo){const e=findE(editNo);const old={...e};Object.assign(e,data);undo=()=>Object.assign(e,old);}
 else{const no=Math.max(...M.je.map(x=>x.no))+1;M.je.unshift({no,src:M.jd?.tpl==='gear'?'Gear bought, paired entry, the item is added to Gear':'Entered by you',...data});undo=()=>M.je.shift();}
 const no=editNo||M.je[0].no;M.jd=null;S.overlay=null;M.jf='all';M.jq='';L.go('journal');
 L.toast(st==='posted'?`Entry ${no} posted, ${L.kr(d)} DKK on each side`:`Draft ${no} saved, not in the reports yet`,undo);}

/* reports chips on Ledger and Reports: open the report page for the three ledger reports */
A.mnyreport=el=>{const k={'Profit and loss':'pl','Balance sheet':'bs','Trial balance':'tb'}[el.dataset.r];if(k){M.rep=k;L.go('ledgerreport');}else L.toast(`${el.dataset.r}, Jan–Oct 2026, ready as PDF`);};
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.ml-tr[data-act],.ml-rep tr[data-act]')){e.preventDefault();e.target.click();}});

/* ================= Expenses: filters, selection, row menus, detail drawer ================= */
const exById=id=>M.ex.find(e=>e.id===id);
const exUndo=(msg,snap)=>L.toast(msg,()=>{M.ex=snap;L.render();});
const exSnap=()=>M.ex.map(e=>({...e,log:e.log?e.log.slice():undefined}));
const exLog=(e,t)=>{(e.log??=[]).push(['21 Oct',t]);};
A.exfilter=el=>{M.exf=el.dataset.f;M.exsel=[];L.render();};
A.exreset=()=>{M.exf='all';M.exq='';M.exfor='';M.exby='';L.render();};
A.exsel=el=>{const id=el.dataset.id;M.exsel=M.exsel.includes(id)?M.exsel.filter(x=>x!==id):[...M.exsel,id];L.render();};
A.exselall=()=>{const ids=exShown().map(e=>e.id);M.exsel=M.exsel.length===ids.length?[]:ids;L.render();};
A.exclear=()=>{M.exsel=[];L.render();};
A.exformenu=el=>menu(el,[['All gigs','exsetfor','data-v=""'],...EXFOR.map(g=>[esc(g),'exsetfor',`data-v="${esc(g)}"`])]);
A.exsetfor=el=>{M.exfor=el.dataset.v;S.overlay=null;L.render();};
A.exbymenu=el=>menu(el,[['Anyone','exsetby','data-v=""'],...Object.entries(EXWHO).map(([k,v])=>[v,'exsetby',`data-v="${k}"`])]);
A.exsetby=el=>{M.exby=el.dataset.v;S.overlay=null;L.render();};
A.excatmenu=el=>{const e=exById(el.dataset.id);menu(el,EXCATS.map(c=>[`${c}${c===e.cat?' (now)':''}`,'exsetcat',`data-id="${e.id}" data-v="${c}"`]));};
A.exsetcat=el=>{const snap=exSnap();const ids=el.dataset.id?[el.dataset.id]:M.exsel;for(const id of ids){const e=exById(id);if(e&&e.cat!==el.dataset.v){e.cat=el.dataset.v;exLog(e,`Category changed to ${e.cat} by Vital`);}}S.overlay=null;M.exsel=el.dataset.id?M.exsel:[];L.render();exUndo(ids.length>1?`${ids.length} expenses moved to ${el.dataset.v}`:`Category: ${el.dataset.v}`,snap);};
A.exbulkcat=el=>menu(el,EXCATS.map(c=>[c,'exsetcat',`data-v="${c}"`]));
A.exbulkfor=el=>menu(el,EXFOR.map(g=>[esc(g),'exsetforsel',`data-v="${esc(g)}"`]));
A.exsetforsel=el=>{const snap=exSnap();for(const id of M.exsel){const e=exById(id);e.for=el.dataset.v;exLog(e,`Linked to ${e.for} by Vital`);}const n=M.exsel.length;M.exsel=[];S.overlay=null;L.render();exUndo(`${n} linked to ${el.dataset.v}`,snap);};
const paidBack=list=>{for(const e of list){e.rf='done';exLog(e,`Marked paid back to ${EXWHO[e.by]} by Vital`);}};
A.exbulkpaid=()=>{const snap=exSnap();const l=M.exsel.map(exById).filter(e=>e.rf==='to');paidBack(l);M.exsel=[];L.render();exUndo(`${l.length} marked paid back`,snap);};
A.exbulkexp=()=>{const n=M.exsel.length;M.exsel=[];L.render();L.toast(`${n} expenses exported, CSV with receipts`);};
A.expayout=()=>{const snap=exSnap();const o=exOwed();paidBack(M.ex.filter(e=>e.rf==='to'));L.render();exUndo(`Added to the next payout: ${Object.entries(o).map(([k,v])=>`${k} ${L.kr(v)}`).join(', ')} DKK`,snap);};
A.exrcpt=el=>{const e=exById(el.dataset.id);const snap=exSnap();e.rc=1;e.none='';exLog(e,'Receipt added by Vital, photo');if(S.overlay&&S.overlay.exid)S.overlay=L.DR.expense(e.id);L.render();exUndo('Receipt added to '+e.what.split(',')[0],snap);};
A.exnorc=()=>{const id=S.overlay&&S.overlay.exid;const e=exById(id);const r=(document.getElementById('exnr')||{}).value||'';if(!r.trim()){document.getElementById('exnr')?.focus();return;}const snap=exSnap();e.rc=1;e.none=r.trim();exLog(e,`No receipt, reason: ${e.none}`);S.overlay=L.DR.expense(id);L.render();exUndo('Marked as no receipt, the reason is kept for the bookkeeper',snap);};
A.exnoform=()=>{const w=document.getElementById('exnrw');if(w){w.hidden=false;document.getElementById('exnr')?.focus();}};
A.exopen=el=>{S.overlay=L.DR.expense(el.dataset.id);L.render();};
A.exdpaid=()=>{const e=exById(S.overlay.exid);const snap=exSnap();paidBack([e]);S.overlay=L.DR.expense(e.id);L.render();exUndo(`Marked paid back to ${EXWHO[e.by]}`,snap);};
A.exsplit=()=>L.toast('Split: pick the gigs and the share for each, the receipt stays on both');
A.exdel=()=>{const id=S.overlay.exid;const snap=exSnap();M.ex=M.ex.filter(e=>e.id!==id);S.overlay=null;L.render();exUndo('Expense deleted',snap);};
A.exsave=()=>{const e=exById(S.overlay.exid);const v=id=>(document.getElementById(id)||{}).value;const snap=exSnap();
 const what=v('exdw'),amt=num(v('exda')),f=v('exdf'),c=v('exdc'),n=v('exdn');
 if(what&&what!==e.what){e.what=what;}if(e.rf!=='done'&&amt&&amt!==e.amt){exLog(e,`Amount changed from ${L.kr(e.amt)} to ${L.kr(amt)}`);e.amt=amt;}
 if(f&&f!==e.for){e.for=f;exLog(e,`Linked to ${f}`);}if(c&&c!==e.cat){e.cat=c;exLog(e,`Category changed to ${c}`);}e.note=n||'';
 S.overlay=null;L.render();exUndo('Expense saved',snap);};
const exReceipt=e=>e.rc&&!e.none?`<div class="ex-paper" aria-label="Receipt from ${esc(e.shop)}"><b>${esc(e.shop.split(',')[0])}</b><span>${exDate(e.d)} 2026, ${e.d%2?'14:12':'09:40'}</span><hr><div><span>${esc(e.what)}</span><span>${L.kr(e.amt)}</span></div><div class="faint"><span>Moms 25 %</span><span>${L.kr(Math.round(e.amt*0.2))}</span></div><hr><div><b>Total DKK</b><b>${L.kr(e.amt)}</b></div><span class="faint">${e.how.includes('cash')?'Cash':'Card ****'+(e.by==='Band'?'4410':'7731')}</span></div>`
 :e.none?`<div class="ex-nor">${ic('filetext','s')}<span><b>No receipt</b><br><span class="muted">${esc(e.none)}</span></span></div>`
 :`<div class="ex-drop"><label class="drop" style="cursor:pointer">${ic('upload')}<b class="strong">Add a photo or PDF of the receipt</b><span class="t-meta muted">Drop it here, or take a photo with your phone. We read the date and amount.</span><input type="file" accept="image/*,.pdf" hidden data-exrcpt="${e.id}"></label>
  <div class="ex-dropacts">${btn('secondary s','Use a sample photo',`data-act="exrcpt" data-id="${e.id}"`,'upload')}${e.by!=='Band'?btn('secondary s',`Ask ${e.by}`,`data-act="mnyaskmette" data-who="${e.by}"`):''}${ghostBtn('No receipt','data-act="exnoform"')}</div>
  <div class="field" id="exnrw" hidden><label for="exnr">Why is there no receipt?</label><input class="input" id="exnr" placeholder="Parking meter, no receipt printed"><span class="help">The reason goes to the bookkeeper with the expense.</span>${btn('secondary s','Save reason','data-act="exnorc"')}</div></div>`;
L.DR.expense=id=>{const e=exById(id);const locked=e.rf==='done';
 const log=[[exDate(e.d),e.by==='Band'?'Paid with the band card':`Paid by ${EXWHO[e.by]}, ${e.how}`],[exDate(e.d),`Category ${e.cat}, suggested by the assistant, accepted`],...(e.log||[])];
 return {type:'mnydrawer',exid:id,title:esc(e.what),sub:`${exDate(e.d)} 2026, ${esc(e.shop)}, ${L.kr(e.amt)} DKK`,
 body:`<section class="ex-dsec">${exReceipt(e)}</section>
 ${e.by!=='Band'?`<div class="ex-dpay ${e.rf}">${ic(e.rf==='done'?'check':'users','s')}<span>${e.rf==='done'?`Paid back to ${EXWHO[e.by]}. Amount and payer are locked.`:`${EXWHO[e.by]} paid ${L.kr(e.amt)} DKK from their own pocket. It goes on their next payout.`}</span>${e.rf==='to'?btn('secondary s','Mark paid back','data-act="exdpaid"'):''}</div>`:''}
 ${field('exdw','What',`<input class="input" id="exdw" value="${esc(e.what)}">`)}
 <div class="ex-d2">${field('exda','Amount, DKK',`<input class="input mono" id="exda" inputmode="decimal" value="${L.kr(e.amt)}" ${locked?'disabled':''}>`)}${field('exdd','Date',`<input class="input" id="exdd" value="${exDate(e.d)} 2026">`)}</div>
 <div class="ex-d2">${field('exdf','For',`<select class="input" id="exdf">${EXFOR.map(g=>`<option ${g===e.for?'selected':''}>${esc(g)}</option>`).join('')}</select>`,'Counts in the gig\'s result on settle.')}${field('exdc','Category',`<select class="input" id="exdc">${EXCATS.map(c=>`<option ${c===e.cat?'selected':''}>${c}</option>`).join('')}</select>`,'Books it to the matching account.')}</div>
 ${field('exdb','Paid by',`<input class="input" id="exdb" value="${e.by==='Band'?'Band account':EXWHO[e.by]}, ${esc(e.how)}" disabled>`)}
 ${ghostBtn('Split across gigs','data-act="exsplit"','plus')}
 ${field('exdn','Note',`<textarea class="input" id="exdn" rows="2" placeholder="For the band or the bookkeeper">${esc(e.note||'')}</textarea>`)}
 <section class="ex-hist"><h3 class="t-label muted">History</h3>${log.map(([d,t])=>`<div><span class="faint">${d}</span><span>${esc(t)}</span></div>`).join('')}</section>`,
 foot:`${ghostBtn('Delete','data-act="exdel"','x')}<span style="flex:1"></span>${btn('secondary','Cancel','data-act="close"')}${btn('accent','Save','data-act="exsave"')}`};};
L.INPUT.push(t=>{if(t.id==='exq'){M.exq=t.value;const p=t.selectionStart;L.render();const n=document.getElementById('exq');if(n){n.focus();n.setSelectionRange(p,p);}return true;}return false;});
L.CHANGE.push(t=>{if(t.dataset&&t.dataset.exrcpt){A.exrcpt({dataset:{id:t.dataset.exrcpt}});return true;}return false;});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.ex-r[data-act="exopen"]')){e.preventDefault();A.exopen(e.target);}});
A.popay=el=>{S.overlay=L.DR.popay(el.dataset.who);L.render();};
A.poview=el=>{S.overlay=L.DR.poview(el.dataset.id);L.render();};
A.popdf=()=>L.toast('Payslip ready as PDF');
A.porecord=el=>{const k=el.dataset.who;const o=poOwed(k);const snapE=M.ex.map(e=>({...e}));const items=[...(o.sh?[['Saturday hotel gig, share',o.sh]]:[]),...o.ex.map(e=>[`${e.what}, paid back`,e.amt])];
 o.ex.forEach(e=>{e.rf='done';(e.log??=[]).push(['21 Oct',`Paid back with the payout to ${EXWHO[k]}`]);});const p={id:'p'+Date.now(),d:21,who:k,items};M.po.push(p);S.overlay=null;L.render();
 L.toast(`Payout recorded: ${L.kr(poSum(p))} DKK to ${EXWHO[k]}`,()=>{M.ex=snapE;M.po=M.po.filter(x=>x!==p);L.render();});};
const paidTips=()=>chartData().map(d=>`${d.m} ${d.y}: ${L.kr(d.inc)} DKK paid in`);
document.addEventListener('pointermove',e=>{const host=e.target.closest&&e.target.closest('.has-spark,.m-strip');
 document.querySelectorAll('.m-sdot:not([hidden])').forEach(d=>{if(!host||!host.contains(d)){d.hidden=true;d.nextElementSibling.hidden=true;}});
 const sv=host&&host.querySelector('svg.m-spark[data-pts]');if(!sv)return;
 const pts=sv.dataset.pts.split(';').map(p=>p.split(',').map(Number)),tips=sv.dataset.tip.split('|');
 const r=sv.getBoundingClientRect(),hr=host.getBoundingClientRect(),i=Math.max(0,Math.min(pts.length-1,Math.round((e.clientX-r.left)/r.width*(pts.length-1))));
 let dot=host.querySelector('.m-sdot');if(!dot){host.insertAdjacentHTML('beforeend','<i class="m-sdot" hidden></i><span class="m-stip" role="status" hidden></span>');dot=host.querySelector('.m-sdot');}
 const tp=dot.nextElementSibling,px=r.left-hr.left+pts[i][0]/200*r.width,py=r.top-hr.top+pts[i][1]/60*r.height;
 dot.style.background=getComputedStyle(sv).color;dot.style.left=px+'px';dot.style.top=py+'px';dot.hidden=false;tp.textContent=tips[i];tp.hidden=false;
 tp.style.left=Math.max(8,Math.min(hr.width-tp.offsetWidth-8,px-tp.offsetWidth/2))+'px';const clip=getComputedStyle(host).overflow!=='visible';tp.style.top=(py-34<(clip?4:-36)?py+12:py-34)+'px';});
A.invpay=el=>{S.overlay=L.DR.invpay(el.dataset.id);L.render();};
A.invpayok=el=>{const id=el.dataset.id;const r=S.invoices.find(x=>x[0]===id);const old=r?r.slice():null;const wasDP=S.booking.depositPaid;
 if(id==='2026-031'){S.booking.depositPaid=true;}else if(r){r[3]='paid 21 Oct';r[4]='paid';r[5]='Paid';}
 S.overlay=null;L.render();L.toast(`Payment recorded on ${id}`,()=>{S.booking.depositPaid=wasDP;if(r&&old)r.splice(0,r.length,...old);L.render();});};
A.ivladder=()=>{S.ivLadder=!S.ivLadder;L.render();};
A.invwriteoff=()=>L.toast('30 DKK written off to 5900 Small differences, the invoice is closed',()=>{});
A.mnystoprem=()=>{S.overlay=null;L.render();L.toast('Reminders paused for this invoice',()=>{});};
A.mnydup=()=>{S.overlay=null;L.render();L.toast('Copied as a new draft, 2026-033',()=>{});};
A.mnyedit=()=>{S.overlay=L.DR.newinvoice?L.DR.newinvoice():null;L.render();};
A.mnydeldraft=()=>{S.overlay=null;L.go('money');L.toast('Draft deleted, the number is free again',()=>{});};
A.ivnote=()=>{const i=document.getElementById('ivnote');if(!i||!i.value.trim()){i?.focus();return;}L.toast('Note added for the band');i.value='';};
A.ivfilter=el=>{M.ivf=el.dataset.f;M.ivsel=[];L.render();};
A.ivsel=el=>{const id=el.dataset.id;M.ivsel=M.ivsel.includes(id)?M.ivsel.filter(x=>x!==id):[...M.ivsel,id];L.render();};
A.ivselall=()=>{const ids=S.invoices.map(r=>r[0]);M.ivsel=M.ivsel.length===ids.length?[]:ids;L.render();};
A.ivclear=()=>{M.ivsel=[];L.render();};
A.ivbulkpdf=()=>{const n=M.ivsel.length;M.ivsel=[];L.render();L.toast(`${n} invoices ready as one PDF`);};
L.INPUT.push(t=>{if(t.id==='ivq'){M.ivq=t.value;const p=t.selectionStart;L.render();const n=document.getElementById('ivq');if(n){n.focus();n.setSelectionRange(p,p);}return true;}return false;});
})();
