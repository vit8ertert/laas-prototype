/* LAAS prototype · File preview (Vit 12 Nov: "File and PDF previews"; path audit 8 Nov: files and PDFs "opened" as
   toasts, a path with nothing behind it). One pattern for every document the app makes or holds: a Drawer with the
   file name, what it is, the document as a page, and Download / Print. Day sheet, invoice, settlement, report,
   payslip, agreement and the files on a gig day all open it. Tokens only; the page is a surface in the app's theme.
   L.filePreview({name, meta, title, sub, rows:[[label, value]], lines:[[text, amount]], total:[label, value], note, img}) */
(function(){
const L=window.LAAS,S=L.S,A=L.ACTIONS,ic=L.ic,esc=L.esc,kr=L.kr;
const page=d=>d.img?`<figure class="doc-img"><img src="${L.IMG(d.img)}" alt="${esc(d.name)}"></figure>`
 :`<article class="doc-page" aria-label="${esc(d.name)}"><header class="doc-h"><span class="logo">${L.LOGO}</span><span class="doc-hr"><b>${esc(d.title)}</b>${d.sub?`<small>${esc(d.sub)}</small>`:''}</span></header>
  ${d.rows&&d.rows.length?`<dl class="doc-kv">${d.rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`:''}
  ${d.lines&&d.lines.length?`<div class="doc-lines">${d.lines.map(([t,a])=>`<div class="doc-line"><span>${esc(t)}</span><span class="mono">${esc(a)}</span></div>`).join('')}${d.total?`<div class="doc-line doc-tot"><b>${esc(d.total[0])}</b><b class="mono">${esc(d.total[1])}</b></div>`:''}</div>`:''}
  ${d.note?`<p class="doc-note">${esc(d.note)}</p>`:''}</article>`;
L.filePreview=d=>{S.overlay={type:'drawer',title:d.name,sub:d.meta||'',body:`<div class="doc-well">${page(d)}</div>`,
 foot:`<span style="flex:1"></span><button class="btn secondary" data-act="fileprint">${ic('file','s')}Print</button><button class="btn accent" data-act="filedown" data-n="${esc(d.name)}">${ic('download','s')}Download</button>`};L.render();};
A.filedown=t=>{L.close();L.toast(`${t.dataset.n} saved to Downloads`);};
A.fileprint=()=>L.toast('Sent to the print dialog');

const DAY=[['14:00','Load-in, back entrance, ask for Mette'],['16:30','Soundcheck, 45 min, house engineer'],['19:00','Doors, guest list 6'],['20:00','Set, 75 min, encore allowed'],['23:00','Curfew, load-out by 23:45']];
const DOCS={
 daysheet:()=>({name:'Day sheet, Hotel Skov, v2.pdf',meta:'PDF, 1 page, crew copy, fees hidden',title:'Day sheet',sub:'Saturday hotel gig, Fri 24 Oct 2026',rows:[['Venue','Hotel Skov, Aarhus'],['Contact','Mette Krogh, booking'],['Parking','Yard behind the hotel from 13:00']],lines:DAY.map(([t,x])=>[x,t]),note:'Version 2, updated 16:40. The link in the band chat always shows the latest times.'}),
 invoice:id=>{const r=(S.invoices||[]).find(x=>x[0]===id)||[id,'Hotel Royal','Saturday hotel gig, deposit','due 12 Oct','', '', '1.500'];const amt=parseInt(String(r[6]).replace(/\./g,''),10)||0,ex=Math.round(amt/1.25);
  return {name:`Invoice ${r[0]}.pdf`,meta:'PDF, 1 page, as the venue gets it',title:`Invoice ${r[0]}`,sub:r[1],rows:[['From','Low Tide, CVR 41 23 87 65'],['To',r[1]],['For',r[2]],['Due',String(r[3]).replace(/^due /,'')]],lines:[[r[2],kr(ex)],['Moms 25 %',kr(amt-ex)]],total:['To pay, DKK',kr(amt)],note:'Pay by bank transfer or on the pay page linked in the mail.'};},
 settlement:()=>({name:'Settlement, Saturday hotel gig.pdf',meta:'PDF, 1 page',title:'Settlement',sub:'Saturday hotel gig, Hotel Skov, 24 Oct 2026',rows:[['Split','Equal, 4 people'],['Settled by','Vital, 26 Oct']],lines:[['Fee','4.500'],['Travel and van','−640'],['Net','3.860'],['Each of 4','965']],total:['Paid out, DKK','3.860'],note:'Payouts are recorded here, not moved: pay each member from the band account.'}),
 report:n=>({name:`${n}, Jan–Oct 2026.pdf`,meta:'PDF, 2 pages, for the bookkeeper',title:n,sub:'Low Tide, 1 Jan to 31 Oct 2026',rows:[['Basis','Paid invoices and booked expenses'],['Made','From the journal, 142 entries']],lines:[['Income','168.400'],['Expenses','−71.250']],total:['Result, DKK','97.150'],note:'Figures are the same as in Reports; drafts are not included.'}),
 payslip:()=>({name:'Payslip, Mia Holm, October 2026.pdf',meta:'PDF, 1 page',title:'Payslip',sub:'Mia Holm, October 2026',rows:[['Paid to','Reg. 1551, account ending 4821'],['Paid','31 Oct 2026']],lines:[['Hotel Skov, 24 Oct, share','965'],['Parking, paid back','120']],total:['Paid out, DKK','1.085']}),
 agreement:()=>({name:'Agreement, Saturday hotel gig, signed.pdf',meta:'PDF, 2 pages, signed 12 Oct',title:'Agreement',sub:'Low Tide and Hotel Royal A/S',rows:[['Date','Sat 25 Oct 2026, set 20:00, 75 min'],['Fee','4.500 DKK, deposit 1.500'],['Cancellation','Free until 14 days before'],['Signed','Mette Kjær, 12 Oct 2026']],note:'Both signatures are on page 2.'}),
 file:n=>/\.(jpe?g|png)$/i.test(n)?{name:n,meta:'Image',img:'hotel-skov'}:{name:n,meta:/\.pdf$/i.test(n)?'PDF, 1 page':'Text file',title:n.replace(/\.[a-z0-9]+$/i,''),sub:'Low Tide',rows:[['Kept on','Saturday hotel gig'],['Added by','Vital']],note:'The file opens here; Download saves your own copy.'},
};
L.DOCS=DOCS;
A.sharepdf=()=>L.filePreview(DOCS.daysheet());
A.mnypdf=el=>L.filePreview(DOCS.invoice(el.dataset.id));
A.mnysettlepdf=()=>L.filePreview(DOCS.settlement());
A.mnyreport=el=>L.filePreview(DOCS.report(el.dataset.r));
A.popdf=()=>L.filePreview(DOCS.payslip());
A.toast2=()=>L.filePreview(DOCS.agreement());
A.bdfile=t=>L.filePreview(DOCS.file(t.dataset.n));
L.FLOWS.push(['File preview','A document opens as a page with Download and Print: the day sheet',()=>{L.go('dashboard');setTimeout(()=>L.filePreview(DOCS.daysheet()),200);}]);
})();
