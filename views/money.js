/* LAAS prototype · money area. Rebuilt 1:1 from the Figma section "UX · Money" (page Build · LAAS v1.0).
   Views: money (tabs owed, invoices, expenses, payouts, reports, books; empty state), invoice, ledger, settle.
   Drawers: newinvoice (Invoice · new · drawer), addexpense. Uses window.LAAS (see index.html). */
(function(){
"use strict";
const L=window.LAAS;const S=L.S,ic=L.ic,esc=L.esc,IMG=L.IMG,V=L.V;

/* icons missing from the core set (lucide.dev) */
L.P.ext=L.P.ext||'<path d="M7 7h10v10"/><path d="M7 17 17 7"/>';
L.P.msg=L.P.msg||'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>';
L.P.filetext=L.P.filetext||'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8M16 13H8M16 17H8"/>';

/* state */
S.money??={empty:false,done:{},seen:false,reminded:false,askedMette:false,showTable:false,
 exp:[['26 Oct','Travel, 2 cars Odense–Aarhus, Hotel gig','paid by Jonas, personal card','Travel',1,'640'],
      ['22 Oct','Rehearsal room, Studio B, 4 h','paid from the band account','Rehearsal',1,'800'],
      ['18 Oct','Merch, 50 tote bags, Print House','paid by Mette, to be refunded','Merch',1,'1.000'],
      ['9 Oct','Strings, 2 sets','paid by Mette, cash','Gear',0,'240'],
      ['3 Oct','Pre-save link, Feature.fm, October','band card, recurring','Promotion',1,'89'],
      ['1 Oct','LAAS, October','band card, recurring','Software',1,'149']],
 added:0,inv:{lines:2,m2:'',incl:false,remind:true,interest:false}};
const M=S.money;
const num=s=>+String(s).replace(/\./g,'').replace(/[^\d-]/g,'')||0;

/* ---------- shared pieces ---------- */
const btn=(cls,label,attrs='',icon='')=>`<button class="btn ${cls}" ${attrs}>${icon?ic(icon,'s'):''}${label}</button>`;
const more=act=>`<button class="btn secondary icon m-more" data-act="${act}" aria-label="More">${ic('more','s')}</button>`;
const head=(title,sub,actions)=>`<div class="m-ph"><div class="m-tb"><h1 class="t-display">${title}</h1><p>${sub}</p></div><div class="m-acts">${actions}</div></div>`;
const kpi=(label,value,delta,tone='',stroke='')=>`<div class="m-kpi ${stroke}"><span class="m-kl">${label}</span><span class="m-kv">${value}</span><span class="m-kd ${tone}">${delta}</span></div>`;
const kpis=list=>`<div class="m-kpis">${list.join('')}</div>`;
const banner=(title,body,action)=>`<div class="m-banner">${ic('alert','s')}<div class="tx"><span>${title}</span><small>${body}</small></div>${action}</div>`;
const tag=(cls,label)=>cls?`<span class="tag ${cls}">${label}</span>`:'';
const secHead=(title,action='')=>`<div class="m-sh"><h2 class="t-title">${title}</h2>${action}</div>`;
const ghostBtn=(label,attrs,icon)=>`<button class="btn ghost s m-gb" ${attrs}>${icon?ic(icon,'s'):''}${label}</button>`;
const thumb=v=>v?`<img class="m-th" src="${IMG(V(v).img)}" alt="">`:`<span class="m-th m-thp">${ic('pin','s')}</span>`;
const line=({img,label,note,tg,amt,attrs='',cls=''})=>`<${attrs?'button':'div'} class="m-line ${cls}" ${attrs}>${img!==undefined?thumb(img):''}<span class="m-tx"><span>${label}</span>${note?`<small>${note}</small>`:''}</span>${tg!==undefined?`<span class="m-end">${tg}</span>`:''}<span class="m-amt mono">${amt}</span></${attrs?'button':'div'}>`;
const kvRow=(k,v)=>`<div class="m-kvr"><span>${k}</span><span>${v}</span></div>`;
const ev=(icon,well,t,s)=>`<div class="m-ev"><span class="m-well ${well}">${ic(icon,'s')}</span><span class="m-tx"><span>${t}</span><small>${s}</small></span></div>`;
const foot=t=>`<p class="m-foot">${t}</p>`;
const tabsBar=t=>{const counts={owed:3,invoices:12,expenses:t==='expenses'?M.exp.length:null,payouts:S.booking.settled?null:1};
 return `<div class="m-tabs" role="tablist">${[['owed','Owed to you'],['invoices','Invoices'],['expenses','Expenses'],['payouts','Payouts'],['reports','Reports'],['books','Books']].map(([k,l])=>`<button role="tab" aria-selected="${t===k}" class="${t===k?'on':''}" data-mtab="${k}"><span>${l}</span>${counts[k]!=null?`<span class="c">${counts[k]}</span>`:''}</button>`).join('')}</div>`;};

/* ---------- Owed to you ---------- */
const late=()=>!S.booking.depositPaid;
function owed(){
 const tasks=[
  ['send','Send a påmindelse to Hotel Royal','Invoice 2026-031, 1.500 DKK, 6 days late, friendly, no fee. The headline is the action; the tick does exactly that.','Send','mnyremind'],
  ['approve','Approve 1.470 DKK from HOTEL ROYAL A/S','The bank shows it on 16 Oct, matches 2026-031, 30 DKK short, ask what the difference is','Approve','mnyapprove'],
  ['move','Move 5.000 DKK from Mads to the band','Two MobilePay payments landed in Mads\' private account. Record where it is, then nudge: business MobilePay or bank.','Record','mnymove']].filter(x=>!M.done[x[0]]&&!(x[0]!=='move'&&!late()));
 return `${late()?banner('One deposit is 6 days late, 1.500 DKK from Hotel Royal','Three automatic reminders went out. The next step is a påmindelse by hand; a rykker with fee is allowed from 22 Oct.',btn('secondary s','Open the booking','data-go="booking"')):''}
 ${kpis([kpi('Owed to you',late()?'8.500 DKK':'7.000 DKK',late()?'3 invoices, 1 late':'2 invoices, none late','muted'),
  late()?kpi('Waiting','1.500 DKK','6 days late, Hotel Royal','att','att'):kpi('Waiting','—','nothing late','muted'),
  kpi('In this month',late()?'9.000 DKK':'10.470 DKK',late()?'2 paid, 9 days average':'3 paid, 9 days average','ok'),
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
     <div class="m-ghost" aria-hidden="true">${[18,26,12,40,30,56,22,34,48,20,38,44].map((h,i)=>`<i style="height:${h}px" class="${i===5?'on':''}"></i>`).join('')}</div>
     <p class="m-foot m-nopad">Last 12 months, October is the best so far, tabular figures, DKK after the amount, never shortened</p>
    </div></section>
  </div>
  <aside class="m-right">
   <section class="m-sec">${secHead('Needs you')}
    <div class="m-body m-g12">${tasks.length?tasks.map(([k,t,s,b,a])=>`<div class="m-task"><div class="m-task-h">${ic('ai','s')}<span>${t}</span></div><p>${s}</p><div>${btn('secondary s',b,`data-act="${a}"`,'check')}</div></div>`).join(''):`<p class="m-foot m-nopad">Nothing needs you. New items show up here when money moves.</p>`}</div></section>
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
const invoices=()=>`<div class="table-wrap m-table"><table><thead><tr><th>No.</th><th>To</th><th>For</th><th>Due</th><th>Status</th><th class="num">DKK</th></tr></thead><tbody>${S.invoices.map(r=>`<tr data-go="invoice" data-id="${r[0]}" tabindex="0"><td class="mono t-label">${r[0]}</td><td><span class="title-cell"><img class="thumb s" src="${IMG(V(r[7]).img)}" alt="">${esc(r[1])}</span></td><td class="muted">${esc(r[2])}</td><td class="muted">${r[3]}</td><td>${tag(r[4],r[5])}</td><td class="num mono">${r[6]}</td></tr>`).join('')}</tbody></table></div>
 <p class="m-foot m-nopad">Showing ${S.invoices.length} of ${Math.max(12,S.invoices.length)}, newest first. Open one to see its lines, reminders and history.</p>`;

/* ---------- Expenses tab ---------- */
function expenses(){
 const miss=M.exp.filter(e=>!e[4]);const n=M.exp.length;
 return `${miss.length?banner(`One expense has no receipt, ${miss[0][1].split(',')[0].toLowerCase()}, ${miss[0][5]} DKK, ${(miss[0][2].match(/paid by \w+/)||['paid by the band'])[0]} ${miss[0][0]}`,'The books accept it, but a bookkeeper will ask. Snap it or mark "no receipt" with a reason.',M.askedMette?btn('secondary s','Asked','disabled'):btn('secondary s',`Ask ${(miss[0][2].match(/paid by (\w+)/)||[0,'the band'])[1]}`,'data-act="mnyaskmette"')):''}
 ${kpis([kpi('This month',L.kr(2140+M.added)+' DKK',`${n} expenses`,'muted'),kpi('Paid privately','1.640 DKK','Jonas 640, Mette 1.000, owed back','att'),
  kpi('Receipts',`${n-miss.length} of ${n}`,miss.length?`${miss.length} missing`:'all in',miss.length?'att':'ok'),kpi('Suggested accounts',`${n} of ${n}`,'all accepted by you','ok')])}
 <div class="m-exp">${M.exp.map((e,i)=>`<div class="m-erow"><span class="m-ed">${e[0]}</span><span class="m-tx"><span>${esc(e[1])}</span><small>${esc(e[2])}</small></span><button class="m-chip" data-act="mnyacct" data-i="${i}">${esc(e[3])}</button><span class="m-eend">${e[4]?tag('confirmed','Receipt'):`<button class="tag attention" data-act="mnyrcpt" data-i="${i}" title="Mark the receipt as in">No receipt</button>`}</span><span class="m-eamt mono">${e[5]}</span></div>`).join('')}</div>
 ${foot('The account chip is the assistant\'s suggestion in plain words (Travel, Rehearsal, Merch…), accepted with one tap; the chart of accounts sits behind it in Books. "Paid by" a member creates what the band owes them.')}`;
}

/* ---------- Payouts tab ---------- */
const payouts=()=>`<div class="m-cols"><div class="m-left"><section class="m-sec">${secHead('Gigs to settle',ghostBtn('Settle a gig','data-go="settle"','plus'))}<div class="m-body">
 ${[['royal','Saturday hotel gig','25 Oct, net 4.360 DKK, split 3 ways',S.booking.settled?['paid','Settled']:['attention','To settle'],'4.360'],['loppen','Release show','18 Oct, split 3 ways',['paid','Settled'],'6.200'],['mono','Club night','10 Oct, split 3 ways',['paid','Settled'],'5.100']].map(r=>line({img:r[0],label:r[1],note:r[2],tg:tag(r[3][0],r[3][1]),amt:r[4],attrs:'data-go="settle"'})).join('')}
 ${foot('Settle splits a gig\'s net between members. Payouts are recorded here and made in your bank app.')}</div></section></div>
 <aside class="m-right"><section class="m-sec">${secHead('Paid to members, October')}<div class="m-body m-g12">${kvRow('Mette Ravn','<span class="mono">3.520</span>')}${kvRow('Sofie Lund','<span class="mono">3.080</span>')}${kvRow('Jonas Holm','<span class="mono">3.110</span>')}</div></section></aside></div>`;

/* ---------- Ledger content (Ledger view, Books and Reports tabs) ---------- */
const CH=[['Nov',41,32],['Dec',99,41],['Jan',27,36],['Feb',50,45],['Mar',81,54],['Apr',63,41],['May',90,68],['Jun',117,63],['Jul',140,81],['Aug',126,59],['Sep',77,50],['Oct',108,54]];
function chartTable(){const ytd=CH.slice(2);const fit=(i,total)=>{const s=ytd.reduce((a,r)=>a+r[i],0);const v=CH.map(r=>Math.round(r[i]*total/s/100)*100);const sum=v.slice(2).reduce((a,b)=>a+b,0);v[11]+=total-sum;return v;};
 const inc=fit(1,186400),out=fit(2,121950);
 return `<div class="table-wrap"><table class="m-dt"><thead><tr><th>Month</th><th class="num">Income</th><th class="num">Expenses</th><th class="num">Result</th></tr></thead><tbody>${CH.map((r,i)=>`<tr><td>${r[0]} ${i<2?2025:2026}</td><td class="num mono">${L.kr(inc[i])}</td><td class="num mono">${L.kr(out[i])}</td><td class="num mono">${L.kr(inc[i]-out[i])}</td></tr>`).join('')}</tbody></table></div>`;}
const chart=()=>`<section class="m-chart"><div class="m-chh"><h3 class="t-heading">Income and expenses, last 12 months</h3><span class="m-leg"><i class="inc"></i>Income<i class="exp"></i>Expenses</span>${ghostBtn(M.showTable?'Show chart':'Show data table','data-act="mnytable"')}</div>
 ${M.showTable?chartTable():`<div class="m-bars">${CH.map(([m,a,b])=>`<div><span class="m-bp"><i class="inc" style="height:${a}px"></i><i class="exp" style="height:${b}px"></i></span><small>${m}</small></div>`).join('')}</div>`}</section>`;
const breakdown=(title,total,rows)=>`<div class="m-bd"><div class="m-bdh"><h3 class="t-heading">${title}</h3><span>${total}</span></div><div class="m-bdl">${rows.map(([n,s,w,a])=>`<div class="m-bdr"><span class="m-tx"><span>${n}</span><small>${s}</small></span><span class="m-track"><i style="width:${w}px"></i></span><span class="mono">${a}</span></div>`).join('')}</div></div>`;
const reportsRow=()=>`<div class="m-reports"><span>Reports</span>${['Profit and loss','Balance sheet','Trial balance','VAT period'].map(r=>`<button class="m-chip" data-act="mnyreport" data-r="${r}">${r}</button>`).join('')}</div>`;
const ledgerBody=()=>`<div class="m-ledger">${kpis([kpi('Income','186.400','+9% vs 2025 to date','ok','rule'),kpi('Expenses','121.950','−4% vs 2025 to date','muted','rule'),kpi('Result','64.450','before tax','muted','rule'),kpi('Cash at bank','112.300','13.500 invoiced, not paid','att','att')])}
 ${chart()}
 <div class="m-bdcols">${breakdown('Where money came from','186.400 DKK',[['Live fees','31 gigs',91,'142.000'],['Streaming payouts','Spotify, YouTube',12,'18.900'],['Merch','shows and web',10,'14.300'],['Grants','KODA, 1 application',7,'11.200']])}
 ${breakdown('Where it went','121.950 DKK',[['Travel and van','fuel, hire, ferries',41,'41.200'],['Rehearsal space','Studio B, monthly',29,'28.800'],['Gear and repairs','9 purchases',22,'22.450'],['Recording','Late Shift EP',18,'18.000'],['Fees and VAT','distribution, accountant',11,'11.500']])}</div>
 ${reportsRow()}</div>`;

/* ---------- views ---------- */
L.VIEWS.money=()=>{const t=S.mtab||'owed';
 const h=t==='expenses'?head('Expenses',`October 2026, ${L.kr(2140+M.added)} DKK, ${M.exp.length} receipts, ${M.exp.filter(e=>!e[4]).length} missing, paid by 3 people`,btn('secondary','Snap a receipt','data-act="addexpense"','upload')+btn('accent','Add expense','data-act="addexpense"','plus')+more('mnymore'))
  :head('Money',M.empty?'Nothing owed, nothing late, the first booking with a fee starts the books':'October 2026, 8.500 DKK owed to you, 9.000 DKK in this month, books up to date as of yesterday',btn('secondary','Add expense','data-act="addexpense"','upload')+btn('accent','New invoice','data-act="newinvoice"','plus')+more('mnymore'));
 const body={owed:M.empty?owedEmpty:owed,invoices,expenses,payouts,reports:()=>`<div class="m-ledger">${chart()}${reportsRow()}</div>`,books:()=>`${ledgerBody()}<div>${btn('secondary s','Open the ledger','data-go="ledger"','ext')}</div>`}[t]||owed;
 const ph=t==='expenses'?'Ask — add 320 DKK petrol paid by Sofie yesterday, what did merch cost this year, who is owed money':'Ask about money — who owes us, what did we net in October, draft the balance invoice for Club Mono';
 return `<div class="page m-page">${h}${tabsBar(t)}${body()}</div>${L.abar('',ph)}`;};

L.VIEWS.ledger=()=>`<div class="page m-page"><div class="m-ph m-ph-c"><div class="m-tb m-g4"><h1 class="t-display">Ledger</h1><p>Jan–Oct 2026, DKK, 142 entries, 2 drafts</p></div><div class="m-acts"><button class="m-chip" data-act="mnyyear">This year (2026)</button>${btn('secondary','Export','data-act="mnyexport"')}${btn('accent','New entry','data-act="addexpense"','plus')}</div></div>${ledgerBody()}</div>${L.abar('','Ask about Low Tide — gigs, contacts, gear, money')}`;

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
L.VIEWS.invoice=()=>{const d=invoiceData(S.params.id||'2026-031');const moms=Math.round(d.excl*.25);
 const primary=d.rich?(d.paid?'':btn('accent','Send påmindelse','data-act="mnyremind"','mail')):d.r[5]==='Draft'?btn('accent','Approve and send','data-act="mnyinvsend" data-id="'+d.r[0]+'"','send'):'';
 const ladder=[['ai','acc','7 days before due, friendly heads-up','5 Oct, sent, opened'],['ai','acc','On the due date, "due today"','12 Oct, sent'],['ai','acc','3 days after, "a small reminder"','15 Oct, sent, opened'],
  ['msg',M.reminded?'acc':'','Påmindelse by hand, free, any time',M.reminded?'21 Oct, sent by you':'proposed, waiting for you'],['money','','Rykker 1, 100 DKK fee, inkasso not mentioned','possible from 22 Oct, 10 days after due'],['money','','Rykker 2, 100 DKK, 10 days later','possible from 1 Nov'],['money','','Rykker 3, 100 DKK, with inkasso warning','possible from 11 Nov, last one allowed']];
 const hist=d.rich?[...(M.reminded?[['msg','acc','Påmindelse sent by you','21 Oct, just now']]:[]),...(d.paid?[['check','','Payment of 1.470 DKK approved','16 Oct, matched by the bank']]:[]),['filetext','','Opened by Mette Kjær','15 Oct, 10:02'],['ai','acc','Reminder 3 days after due sent','15 Oct, 09:00'],['filetext','','Opened by Mette Kjær','13 Oct, 08:41'],['ai','acc','Reminder on the due date sent','12 Oct, 09:00'],['money','','Sent with the offer, number 2026-031 locked','7 Oct, 11:02, by you']]
  :[['money','',`Created from the booking, number ${d.r[0]} reserved`,'by you']];
 return `<div class="m-tint" aria-hidden="true"></div><div class="page m-page m-detail">
 <button class="btn ghost s m-back" data-go="money" data-mt="invoices">${ic('left','s')}Invoices</button>
 <div class="m-ph"><div class="m-tb"><div class="m-tr"><i class="m-dot"></i><h1 class="t-display">${d.title}</h1>${d.tg}</div><p>${d.sub}</p></div><div class="m-acts">${btn('secondary','PDF','data-act="mnypdf" data-id="'+d.r[0]+'"','filetext')}${primary}${more('mnyinvmore')}</div></div>
 <div class="m-strip">${d.steps.map(([t,s,ok])=>`<div class="m-step ${ok==='att'?'att':ok?'ok':'todo'}"><span><i></i>${t}</span><small>${s}</small></div>`).join('')}</div>
 <div class="m-cols m-cols-d"><div class="m-left">
  <section class="m-sec">${secHead('Lines')}<div class="m-body m-g12">
   ${d.lines.map(([a,b,c])=>line({label:a,note:b,amt:c,cls:'m-flush'})).join('')}<hr class="m-hr">
   ${line({label:'Excl. moms',amt:L.kr(d.excl),cls:'m-flush'})}${line({label:'Moms 25 %',amt:L.kr(moms),cls:'m-flush'})}${line({label:'To pay, incl. moms',amt:L.kr(d.excl+moms),cls:'m-flush'})}
   <p class="m-foot m-nopad">Totals always show excl., moms, incl. The VAT code is per line and never guessed: "25 %" or "Momsfri" is your call when you approve.</p></div></section>
  ${d.rich?`<section class="m-sec">${secHead('Reminder ladder',ghostBtn('Settings','data-go="settings-money"','settings'))}<div class="m-body m-g12">${ladder.map(([i,w,t,s])=>ev(i,w,t,s)).join('')}
   ${foot('Danish rules built in: at most 100 DKK per letter, at most 3 fee letters, at least 10 days apart, none before the due date. Steps that are not allowed yet are simply not offered.')}</div></section>`:''}
 </div>
 <aside class="m-right">
  <section class="m-sec">${secHead('Pay page',ghostBtn('Open','data-act="mnypaypage"','ext'))}<div class="m-body m-g12">${kvRow('Link',`laas.dk/pay/${d.slug}`)}${kvRow('Shows','Amount, bank, reference, MobilePay, copy buttons')}${d.rich?kvRow('States',d.paid?'sent 7 Oct, opened 13 and 15 Oct, paid 16 Oct':'sent 7 Oct, opened 13 and 15 Oct, not paid')+kvRow('"I have paid"','Nobody pressed it yet'):''}${kvRow('Money goes to','Band account, Danske Bank, LAAS never holds it')}</div></section>
  <section class="m-sec">${secHead('Bill to',ghostBtn('Edit',`data-go="venue" data-id="${d.r[7]}"`,'pencil'))}<div class="m-body m-g12">${kvRow('Company',d.company)}${kvRow('Address',d.addr)}${kvRow('Sent to',d.to)}${kvRow('E-invoice','Not needed, private company')}</div></section>
  <section class="m-sec">${secHead('History')}<div class="m-body m-g12">${hist.map(([i,w,t,s])=>ev(i,w,t,s)).join('')}</div></section>
 </aside></div></div>${L.abar(d.title,'Ask about this invoice — send it to accounts instead, split it, write it off')}`;};

/* settle */
const SPLIT={Equal:[[1453,'equal share'],[1453,'equal share'],[2094,'equal share + 640 travel back']],
 Shares:[[1090,'1 share'],[1090,'1 share'],[2820,'2 shares + 640 travel back']],
 Percent:[[1526,'35 %'],[1526,'35 %'],[1948,'30 % + 640 travel back']],
 Adjustment:[[1353,'equal share'],[1353,'equal share'],[2294,'equal share + 300 extra + 640 travel back']]};
L.VIEWS.settle=()=>{const mode=SPLIT[S.split]?S.split:'Equal';const sp=SPLIT[mode];const mx=Math.max(...sp.map(x=>x[0]));const mem=[['MR','Mette Ravn'],['SL','Sofie Lund'],['JH','Jonas Holm']];
 const checks=[['All invoices paid',1],['All receipts in, 1 of 1',1],['Split adds up to 100 %',1],['Everyone has seen the split, 2 of 3',M.seen?1:0,'mnyseen']];
 return `<div class="m-tint" aria-hidden="true"></div><div class="page m-page m-detail">
 <button class="btn ghost s m-back" data-go="money" data-mt="payouts">${ic('left','s')}Payouts</button>
 ${head('Settle the Saturday hotel gig','Sat 25 Oct, Hotel Royal, all money in 27 Oct, Settle locks this gig\'s money',btn('secondary','Export PDF','data-act="mnysettlepdf"')+(S.booking.settled?btn('accent','Settled','disabled','check'):btn('accent','Settle 4.360 DKK','data-act="dosettle"','check'))+more('mnysettlemore'))}
 ${kpis([kpi('In','5.000 DKK','fee, deposit 16 Oct, balance 27 Oct','ok'),kpi('Out','640 DKK','travel, 1 receipt, paid by Jonas','muted'),kpi('Commission','0 DKK','no agent on this gig','muted'),kpi('Net to split','4.360 DKK',`3 members, ${mode==='Equal'?'equal after travel':mode.toLowerCase()+' after travel'}`,'muted')])}
 <div class="m-cols m-cols-d"><div class="m-left">
  <section class="m-sec">${secHead('Settlement')}<div class="m-body">
   ${line({label:'Fee agreed in the offer',note:'both invoices paid',tg:tag('paid','Paid'),amt:'5.000',cls:'m-flush'})}
   ${line({label:'Travel, 2 cars from Odense',note:'paid by Jonas, receipt',tg:tag('confirmed','Confirmed'),amt:'-640',cls:'m-flush'})}
   ${line({label:'Hotel, 2 rooms',note:'venue paid',tg:'',amt:'0',cls:'m-flush'})}
   ${line({label:'Commission',note:'no agent',tg:'',amt:'0',cls:'m-flush'})}<hr class="m-hr">
   ${line({label:'Net to split',tg:'',amt:'4.360',cls:'m-flush'})}
   <p class="m-foot m-nopad">Gross → costs → commission → net, in one stack, like a promoter's settlement. Each line links to its invoice or receipt.</p></div></section>
  <section class="m-sec">${secHead('Split',ghostBtn('Change mode','data-act="mnymode"','pencil'))}<div class="m-body m-g8">
   <div class="m-modes">${Object.keys(SPLIT).map(k=>`<button class="m-chip ${mode===k?'on':''}" data-split="${k}">${k}</button>`).join('')}</div>
   <p class="m-foot m-nopad">Equal after travel is refunded first. "Adjustment": one person gets a fixed extra, the rest split equally. Shares: "Jonas 2, others 1".</p>
   ${mem.map(([i,n],k)=>`<div class="m-mem"><span class="m-av">${i}</span><span class="m-tx"><span>${n}</span><small>${sp[k][1]}</small></span><span class="m-sbar"><i style="width:${Math.round(sp[k][0]/mx*97)}%"></i></span><span class="mono m-amt">${L.kr(sp[k][0])} DKK</span></div>`).join('')}
   <p class="m-foot m-nopad">Totals 5.000 DKK = 4.360 net + 640 travel. Green bars grow with what each person is owed; red would grow left for someone who owes the kitty.</p></div></section>
 </div>
 <aside class="m-right">
  <section class="m-sec">${secHead('Cash from show')}<div class="m-body m-g12">${kvRow('What arrived','5.000 DKK, all by bank and MobilePay, nothing in cash')}${kvRow('Where it is',M.done.move?'Band account 5.000':'Band account 3.500, Mads\' private MobilePay 1.500')}${kvRow('To move first',M.done.move?'Nothing, all money is in the band account':'1.500 DKK from Mads to the band account, then pay out')}${kvRow('Then pay out',`Mette ${L.kr(sp[0][0])}, Sofie ${L.kr(sp[1][0])}, Jonas ${L.kr(sp[2][0])}, from the band account`)}
   ${foot('Payouts are recorded here and made in your bank app. Mark each one paid; undo records a correction, it does not take the money back.')}</div></section>
  <section class="m-sec">${secHead('Before you settle')}<div class="m-body m-g8">${checks.map(([t,on,a])=>`<button class="m-check ${on?'on':''}" ${a?`data-act="${a}"`:'disabled'} role="checkbox" aria-checked="${!!on}"><span class="m-box">${on?ic('check','s'):''}</span>${t}</button>`).join('')}
   <p class="m-foot m-nopad">Settle locks this gig's money and writes the ledger entries. Reopening later asks for a reason and is logged.</p></div></section>
 </aside></div></div>${L.abar('Settle, Hotel gig','Ask — give Jonas 300 more for driving, what did each of us net this year, remind Mads to move the money')}`;};

/* ---------- drawers ---------- */
L.OVERLAYS.mnydrawer=o=>`<div class="scrim" data-act="close"></div><aside class="drawer m-dr" role="dialog" aria-modal="true" aria-label="${esc(o.title)}"><div class="dh"><div class="grow"><h2 class="t-title">${o.title}</h2><span class="t-meta muted">${o.sub||''}</span></div><button class="btn ghost s" data-act="close">${ic('x','s')}Close</button></div><div class="db">${o.body}</div><div class="df">${o.foot}</div></aside>`;
L.OVERLAYS.mnymenu=o=>`<div class="scrim" style="background:transparent" data-act="close"></div><div class="pop m-menu" style="top:${o.y}px;right:${o.r}px">${o.items.map(([l,a,x])=>`<button class="it" data-act="${a}" ${x||''}>${l}</button>`).join('')}</div>`;
L.OVERLAYS.mnyrem=()=>`<div class="scrim" data-act="close"></div><div class="modal" role="dialog" aria-modal="true">${L.sendPreview('reminder').replace(/data-act="sendreminder"/g,'data-act="mnysendrem"')}</div>`;

const field=(id,label,ctl,help,cls='')=>`<div class="field ${cls}"><label for="${id}">${label}</label>${ctl}${help?`<span class="help" ${help.id?`id="${help.id}"`:''}>${help.t||help}</span>`:''}</div>`;
const invLine=(i,desc,amt,m)=>`<div class="m-iline" data-line="${i}">${field('mi-d'+i,'Description',`<input class="input" id="mi-d${i}" value="${esc(desc)}">`)}
 <div class="m-irow">${field('mi-a'+i,'Excl. moms',`<input class="input mono m-amtin" id="mi-a${i}" inputmode="decimal" value="${amt}">`,'','m-w160')}
 ${field('mi-m'+i,'Moms',`<select class="input m-moms ${m===''?'m-err':''}" id="mi-m${i}"><option value="" ${m===''?'selected':''}>—</option><option value="25" ${m==='25'?'selected':''}>25 %</option><option value="0" ${m==='0'?'selected':''}>Momsfri</option></select>`,m===''?{t:'Pick 25 % or Momsfri',id:'mi-e'+i}:'','m-w160')}</div></div>`;
const toggle=(k,label)=>`<button class="m-tg" data-act="mnytg" data-k="${k}" role="switch" aria-checked="${!!M.inv[k]}"><span class="m-track2"><i></i></span><span>${label}</span></button>`;
L.DR.newinvoice=()=>{M.inv={lines:2,m2:'',incl:false,remind:true,interest:false};return {type:'mnydrawer',title:'New balance invoice',sub:'From Saturday hotel gig, 2026-032 is reserved, locked when you approve',
 body:`${field('mi-b','For booking',`<select class="input" id="mi-b"><option>Saturday hotel gig, 25 Oct, Hotel Royal</option><option>Club night, 15 Nov, Club Mono</option><option>Support slot, 28 Nov, Odense Live</option></select>`,'Lines, bill-to and due date come from the booking and your house terms')}
 ${field('mi-to','Bill to',`<select class="input" id="mi-to"><option>Hotel Royal A/S, CVR 12 34 56 78</option><option>Mette Kjær, private</option></select>`,'Sent to faktura@hotelroyal.dk (invoice address), cc Mette')}
 <div class="m-lines" id="mi-lines"><span class="m-ll">Lines</span>${invLine(1,'Balance, fee for 25 Oct, 70 %','2.800','25')}${invLine(2,'Travel, 2 cars from Odense','512','')}</div>
 <div class="m-add">${ghostBtn('Add line','data-act="mnyaddline"','plus')}${ghostBtn('Add from receipts','data-act="mnyaddrcpt"')}</div>
 <div class="m-tot"><div class="m-line m-tl"><span class="m-tx"><span>Excl. moms</span></span><span class="m-amt mono" id="mi-tx">3.312</span></div>
  <div class="m-line m-tl"><span class="m-tx"><span>Moms</span><small id="mi-tn">travel line has no code yet</small></span><span class="m-amt mono" id="mi-tm">700</span></div>
  <div class="m-line m-tl"><span class="m-tx"><span>To pay, incl. moms</span></span><span class="m-amt mono" id="mi-ti">4.012</span></div>
  <button class="m-sw" data-act="mnyincl" id="mi-sw">Prices shown excl. moms, switch</button></div>
 <div class="m-dates">${field('mi-due','Due',`<span class="m-ifld">${ic('calendar','s')}<input class="input" id="mi-due" value="25 Oct 2026, on the gig date"></span>`,'House default, Net 7 for other invoices')}
 ${field('mi-send','Send on',`<span class="m-ifld">${ic('calendar','s')}<input class="input" id="mi-send" value="18 Oct 2026"></span>`,'7 days before due')}</div>
 ${toggle('remind','Reminders, 7 days before, on the day, 3 days after, then by hand')}${toggle('interest','Late interest, reference rate + 8 %')}
 <p class="m-foot m-nopad">Approve books the invoice and locks number 2026-032. Send is a separate step, so you can approve now and send on 18 Oct.</p>`,
 foot:`${btn('ghost s','Cancel','data-act="close"')}<span style="flex:1"></span>${btn('secondary','Save draft','data-act="mnydraft"')}${btn('accent','Approve','data-act="mnyinvapprove"','check')}`};};
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
A.mnyinvmore=el=>menu(el,[['Copy pay link','mnycopylink'],['Credit note','mnycredit'],['Open the booking','mnybooking']]);
A.mnysettlemore=el=>menu(el,[['Open the booking','mnybooking'],['Open the ledger','mnyledger']]);
A.mnyempty=()=>{M.empty=!M.empty;S.mtab='owed';S.overlay=null;L.go('money');};
A.mnyledger=()=>L.go('ledger');A.mnybooking=()=>L.go('booking');
A.mnyexport=()=>{S.overlay=null;L.toast('Export for the bookkeeper is ready: Jan–Oct 2026, CSV and receipts');};
A.mnycopylink=()=>{S.overlay=null;L.toast('Pay link copied');};
A.mnycredit=()=>{S.overlay=null;L.toast('Credit note drafted, nothing is sent yet',()=>{});};
A.mnysample=()=>{M.empty=false;L.render();L.toast('Sample loaded: 1 paid, 1 overdue',()=>{M.empty=true;});};
A.mnyimport=()=>L.toast('Import started: invoices.csv, 24 rows, numbers kept');
A.mnyremind=()=>{S.fullmsg=false;S.overlay={type:'mnyrem'};L.render();};
A.mnysendrem=()=>{S.overlay=null;M.reminded=true;M.done.send=true;S.sentReminder=true;L.render();L.toast('Påmindelse sent to Hotel Royal',()=>{M.reminded=false;M.done.send=false;S.sentReminder=false;});};
A.mnyapprove=()=>{S.booking.depositPaid=true;M.done.approve=true;if(S.checklist)S.checklist['Deposit received']=true;L.render();L.toast('1.470 DKK matched to invoice 2026-031',()=>{S.booking.depositPaid=false;M.done.approve=false;if(S.checklist)S.checklist['Deposit received']=false;});};
A.mnymove=()=>{M.done.move=true;L.render();L.toast('Recorded: 5.000 DKK moved from Mads to the band account',()=>{M.done.move=false;});};
A.mnyaskmette=el=>{const who=el.textContent.replace('Ask ','');M.askedMette=true;L.render();L.toast(`Asked ${who} for the receipt`,()=>{M.askedMette=false;});};
A.mnyrcpt=el=>{const i=+el.dataset.i;M.exp[i][4]=1;L.render();L.toast('Receipt added to '+M.exp[i][1].split(',')[0],()=>{M.exp[i][4]=0;});};
A.mnyacct=el=>{const i=+el.dataset.i;L.toast(`${M.exp[i][3]} accepted for "${M.exp[i][1].split(',')[0]}"`);};
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
A.saveexpense=()=>{const v=id=>(document.getElementById(id)||{}).value||'';const what=v('exw'),amt=v('exa'),by=v('exb');
 const acct=/park|diesel|petrol|train|ferry|car/i.test(what)?'Travel':/string|stick|cable|gear/i.test(what)?'Gear':/rehears/i.test(what)?'Rehearsal':/merch|tote|shirt/i.test(what)?'Merch':'Other';
 M.exp.unshift(['21 Oct',what,by==='Band account'?'paid from the band account':`paid by ${by}`,acct,S.rcpt?1:0,amt]);M.added+=num(amt);
 S.expenses?.unshift(['21 Oct',what,v('exf'),by,amt]);S.overlay=null;S.mtab='expenses';L.go('money');
 L.toast('Expense saved',()=>{M.exp.shift();M.added-=num(amt);S.expenses?.shift();});};
})();
