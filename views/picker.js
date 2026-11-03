/* Date and time picker (T473): any input with data-picker="date" | "time" | "datetime" opens a picker under it.
   Date = month grid (Monday first, today ringed, selected filled), Today, arrows and Enter. Time = 15-minute list.
   Datetime = both side by side (stacked on a phone, where the picker is a bottom sheet). The field keeps its own text format: "Fri 14 Nov 2026",
   "21 Oct 2026", "Fri 24 Oct 2026, 20:00", "18:00". Esc or a click outside closes it. */
(function(){const L=window.LAAS,ic=L.ic;
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TODAY=new Date(2026,9,24);  // the prototype's today (dashboard, calendar)
let P=null;  // {input, kind, d (Date or null), view (first of month), t ("HH:MM" or null), weekday (format), el}
const parse=v=>{const m=(v||'').match(/(\d{1,2})\s+([A-Z][a-z]{2})[a-z]*\s+(\d{4})/),t=(v||'').match(/(\d{1,2}):(\d{2})/);
  return {d:m?new Date(+m[3],MON.indexOf(m[2]),+m[1]):null,t:t?t[1].padStart(2,'0')+':'+t[2]:null,weekday:/^[A-Z][a-z]{2}\s+\d/.test(v||'')};};
const same=(a,b)=>a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
const fmt=()=>{const {d,t,kind,weekday}=P;const ds=d?`${weekday||kind==='datetime'?DOW[d.getDay()]+' ':''}${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`:'';
  return kind==='time'?t||'':kind==='datetime'?[ds,t].filter(Boolean).join(', '):ds;};
const grid=()=>{const v=P.view,first=(v.getDay()+6)%7,start=new Date(v.getFullYear(),v.getMonth(),1-first);let h='';
  for(let i=0;i<42;i++){const d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i),out=d.getMonth()!==v.getMonth();
    h+=`<button type="button" class="pk-day${out?' out':''}${same(d,TODAY)?' today':''}${same(d,P.d)?' on':''}" data-pkd="${d.getFullYear()}-${d.getMonth()}-${d.getDate()}" aria-label="${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}"${same(d,P.d)?' aria-pressed="true"':''} tabindex="${same(d,P.d||TODAY)?0:-1}">${d.getDate()}</button>`;}
  return `<div class="pk-cal"><div class="pk-head"><b>${['January','February','March','April','May','June','July','August','September','October','November','December'][v.getMonth()]} ${v.getFullYear()}</b><span class="grow"></span><button type="button" class="btn ghost icon s" data-pkm="-1" aria-label="Previous month">${ic('chevl','s')}</button><button type="button" class="btn ghost icon s" data-pkm="1" aria-label="Next month">${ic('right','s')}</button></div>
  <div class="pk-dow">${['M','T','W','T','F','S','S'].map(x=>`<span>${x}</span>`).join('')}</div><div class="pk-grid" role="grid">${h}</div>
  <div class="pk-foot"><button type="button" class="btn ghost s" data-pktoday>Today</button></div></div>`;};
const times=()=>{let h='';for(let m=0;m<24*60;m+=15){const t=String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');h+=`<button type="button" class="pk-time${t===P.t?' on':''}" data-pkt="${t}"${t===P.t?' aria-pressed="true"':''}>${t}</button>`;}
  return `<div class="pk-times" role="listbox" aria-label="Time">${h}</div>`;};
const draw=()=>{P.el.innerHTML=(P.kind!=='time'?grid():'')+(P.kind!=='date'?times():'');P.el.className='picker '+P.kind;place();
  const on=P.el.querySelector('.pk-time.on');if(on)on.parentElement.scrollTop=on.offsetTop-on.parentElement.clientHeight/2+on.offsetHeight/2;};
const place=()=>{if(innerWidth<600){P.el.classList.add('pk-sheet');P.el.style.left=P.el.style.top='';return;}  // phones: a bottom sheet, like every phone dialog
  const r=P.input.getBoundingClientRect(),w=P.el.offsetWidth,h=P.el.offsetHeight;
  let x=Math.min(r.left,innerWidth-w-16),y=r.bottom+4;if(y+h>innerHeight-8&&r.top-h-4>8)y=r.top-h-4;
  P.el.style.left=Math.max(16,x)+'px';P.el.style.top=y+'px';};
const set=()=>{P.input.value=fmt();P.input.dispatchEvent(new Event('input',{bubbles:true}));P.input.dispatchEvent(new Event('change',{bubbles:true}));};
const close=()=>{if(!P)return;P.el.remove();P.input.setAttribute('aria-expanded','false');P=null;};
const open=inp=>{close();const p=parse(inp.value),kind=inp.dataset.picker;
  P={input:inp,kind,d:p.d,t:p.t,weekday:p.weekday,view:new Date((p.d||TODAY).getFullYear(),(p.d||TODAY).getMonth(),1),el:document.createElement('div')};
  P.el.setAttribute('role','dialog');P.el.setAttribute('aria-label',kind==='time'?'Choose a time':'Choose a date');document.body.appendChild(P.el);
  inp.setAttribute('aria-expanded','true');draw();};
L.picker={open,close};
document.addEventListener('click',e=>{const inp=e.target.closest('input[data-picker]');
  if(inp){if(!P||P.input!==inp)open(inp);return;}
  if(!P)return;if(!P.el.contains(e.target)){close();return;}
  const m=e.target.closest('[data-pkm]'),d=e.target.closest('[data-pkd]'),t=e.target.closest('[data-pkt]');
  if(m){P.view=new Date(P.view.getFullYear(),P.view.getMonth()+ +m.dataset.pkm,1);draw();return;}
  if(e.target.closest('[data-pktoday]')){P.d=new Date(TODAY);P.view=new Date(TODAY.getFullYear(),TODAY.getMonth(),1);set();if(P.kind==='date')close();else draw();return;}
  if(d){const [y,mo,dd]=d.dataset.pkd.split('-').map(Number);P.d=new Date(y,mo,dd);set();if(P.kind==='date')close();else{P.view=new Date(y,mo,1);draw();}return;}
  if(t){P.t=t.dataset.pkt;set();close();}
},true);
document.addEventListener('keydown',e=>{const fi=e.target.closest&&e.target.closest('input[data-picker]');
  if(fi&&(e.key==='ArrowDown'||(e.key==='Enter'&&!P))){e.preventDefault();open(fi);const f=P.el.querySelector('.pk-day[tabindex="0"],.pk-time.on,.pk-time');if(f)f.focus();return;}
  if(!P)return;
  if(e.key==='Escape'){e.stopPropagation();const i=P.input;close();i.focus();return;}
  const day=e.target.closest&&e.target.closest('.pk-day');if(!day)return;
  const step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key];
  if(step){e.preventDefault();const [y,mo,dd]=day.dataset.pkd.split('-').map(Number),n=new Date(y,mo,dd+step);
    if(n.getMonth()!==P.view.getMonth()){P.view=new Date(n.getFullYear(),n.getMonth(),1);draw();}
    const b=P.el.querySelector(`[data-pkd="${n.getFullYear()}-${n.getMonth()}-${n.getDate()}"]`);if(b){P.el.querySelectorAll('.pk-day').forEach(x=>x.tabIndex=-1);b.tabIndex=0;b.focus();}}
},true);
new MutationObserver(()=>{if(P&&!P.input.isConnected)close();}).observe(document.body,{childList:true,subtree:true});  // a re-render took the field away
addEventListener('resize',()=>{if(P)place();});addEventListener('scroll',()=>{if(P)place();},true);
})();
