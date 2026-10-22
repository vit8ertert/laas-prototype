/* Small screens (research 31, decisions M1-M5, Vit 22 Oct).
   Width classes: compact < 600, medium 600-839, expanded >= 840 (Material window size classes).
   Below 840 the sidebar gives way to a bottom tab bar (Today, Gigs, Money, Mail, More) with Ask as its own
   button that opens the assistant as a sheet; there is no permanent assistant bar.
   Below 600 page headers keep one primary action, the other actions move into ⋯, and menus and drawers
   open as bottom sheets (compact.css). */
(function(){
const L=window.LAAS,{S,ic,esc}=L;
L.BP={medium:600,wide:840};
/* Lucide circle-ellipsis: More in the tab bar, the same outline weight as the other tab icons (Figma icon/circle-ellipsis) */
L.P.circleellipsis='<circle cx="12" cy="12" r="10"/><path d="M17 12h.01"/><path d="M12 12h.01"/><path d="M7 12h.01"/>';
/* no hover on touch screens: a tapped row kept its hover background (Vit 22 Oct). Drop every :hover rule when the device cannot hover */
/* split a selector list on top-level commas only, never inside :is() or :not() */
const topSplit=t=>{const out=[];let d=0,cur='';for(const ch of t){if(ch==='(')d++;if(ch===')')d--;if(ch===','&&!d){out.push(cur);cur='';}else cur+=ch;}out.push(cur);return out};
if(matchMedia('(hover:none)').matches){for(const sh of document.styleSheets){let rules;try{rules=sh.cssRules}catch(e){continue}const strip=list=>{for(let i=list.length-1;i>=0;i--){const r=list[i];if(r.cssRules&&!r.selectorText){strip(r.cssRules);continue}if(r.selectorText&&r.selectorText.includes(':hover')){const sel=r.selectorText.replace(/:not\(:hover\)/g,'').replace(/:is\(\s*:hover\s*,\s*([^()]*)\)/g,':is($1)');if(!sel.includes(':hover')){r.selectorText=sel;continue}const keep=topSplit(sel).filter(s=>!s.includes(':hover'));if(keep.length)r.selectorText=keep.join(',');else list===rules?sh.deleteRule(i):r.parentRule.deleteRule(i)}}};strip(rules)}}
const narrow=matchMedia(`(max-width:${L.BP.wide-.02}px)`),compact=matchMedia(`(max-width:${L.BP.medium-.02}px)`);
L.isNarrow=()=>narrow.matches;L.isCompact=()=>compact.matches;
/* crossing a width class re-renders, so the shell and headers swap without a reload */
[narrow,compact].forEach(m=>m.addEventListener('change',()=>{S.overlay=null;L.render();}));

/* ---------- tab bar ---------- */
const MAILV=['mail','thread','compose','mailaccounts'];
const tabOf=v=>v==='dashboard'?'today':MAILV.includes(v)?'mail':L.areaOf(v)==='gigs'?'gigs':L.areaOf(v)==='money'?'money':'more';
const unread=()=>S.mail&&S.mail.threads?S.mail.threads.filter(t=>t.unread&&!(S.mail.archived||[]).includes(t.id)).length:4;
L.tabbar=()=>{const on=S.overlay&&S.overlay.type==='moresheet'?'more':tabOf(S.view),n=unread();
 const tab=(id,label,icon,attrs,badge='')=>`<button class="tb-tab ${on===id?'on':''}" ${attrs} ${on===id?'aria-current="page"':''}><span class="ti">${ic(icon)}${badge}</span><span class="tl">${label}</span></button>`;
 return `<nav class="tabbar" aria-label="Main">
  <div class="tb-tabs">${tab('today','Today','dashboard','data-go="dashboard"')}${tab('gigs','Gigs','file','data-go="bookings"')}${tab('money','Money','money','data-go="money" data-mt="owed"')}${tab('mail','Mail','mail','data-go="mail"',n?`<span class="tb-n">${n}</span>`:'')}${tab('more','More','circleellipsis','data-act="moresheet" aria-haspopup="dialog"')}</div>
  <button class="tb-ask" data-act="asksheet" aria-label="Ask the assistant" aria-haspopup="dialog">${ic('ai')}<span>Ask</span></button>
 </nav>`;};

/* ---------- More: what is not on the tab bar. Areas as tiles, the rest as a short list; sub-pages of Gigs and
   Money stay on their own pages' tabs, so they are not repeated here ---------- */
const TILES=[['Catalogue','catalogue','disc'],['Audience','audience','radio'],['Calendar','calendar','calendar'],['Contacts','contacts','users'],['Venues','venues','pin'],['Assistant','assistant','ai']];
const MORE=[['Audience',[['Social posts','social'],['Comments','comments'],['Keyword watch','keywords'],['Deliveries','deliveries']]],
 ['Band',[['Gear','gear'],['Integrations','integrations'],['Band settings','settings'],['Your account','account']]]];
L.OVERLAYS.moresheet=()=>{const b=(S.bands||[]).find(x=>x.id===S.bandId)||{ini:'LT',name:'Low Tide',meta:'Owner: 3 members'},v=S.view;
 const it=([l,go])=>`<button class="cx-it ${v===go?'on':''}" data-go="${go}"><span>${l}</span>${ic('right','s')}</button>`;
 return `<div class="scrim" data-act="close"></div><div class="pop cx-sheet cx-more-sheet" role="dialog" aria-label="More">
  <button class="cx-band" data-act="moreband"><span class="sq">${esc(b.ini||'LT')}</span><span class="tx"><b>${esc(b.name)}</b><small>${esc(b.meta||'Owner')}</small></span>${ic('down','s')}</button>
  <div class="cx-tiles">${TILES.map(([l,go,i])=>`<button class="cx-tile ${tabOf(v)==='more'&&(v===go||L.areaOf(v)===go)?'on':''}" data-go="${go}" ${go==='audience'?'data-at="overview"':''}>${ic(i)}<span>${l}</span></button>`).join('')}</div>
  ${MORE.map(([g,items])=>`<div class="cx-g"><div class="cx-gl">${g}</div>${items.map(it).join('')}</div>`).join('')}
  <div class="cx-g"><button class="cx-it" data-act="moreguide"><span>${ic('help')}Guide</span></button><button class="cx-it" data-act="moretheme"><span><i class="th-dot" aria-hidden="true"></i>Theme: ${({label:'Label',metal:'Metal',electronic:'Electronic',classical:'Classical'})[S.genre]}</span>${ic('right','s')}</button></div>
 </div>`;};

/* ---------- Ask: the assistant as a sheet, carrying the page's context ---------- */
L.OVERLAYS.asksheet=o=>`<div class="scrim" data-act="close"></div><div class="pop cx-sheet cx-ask" role="dialog" aria-label="Ask the assistant">
 <div class="cx-ask-h"><b class="t-heading">Ask</b><span class="grow"></span><button class="btn ghost s" data-go="assistant">Open Assistant</button><button class="btn ghost icon s" data-act="close" aria-label="Close">${ic('x','s')}</button></div>
 ${o.ctx?`<span class="rec">${esc(o.ctx)}</span>`:''}
 <div class="cx-ask-f"><input id="asksheetq" placeholder="${esc(o.ph||'Ask about Low Tide: gigs, contacts, money')}" aria-label="Ask the assistant" autocomplete="off"><button class="btn accent" data-act="asksheetgo">Ask</button></div>
 <div class="cx-ask-s">${(o.ctx?['What is still open?','Draft a reply','Summarise this']:['What needs me today?','Who owes us money?','Next gig details']).map(q=>`<button class="chip" data-act="asksheetq" data-q="${esc(q)}">${q}</button>`).join('')}</div>
</div>`;

/* ---------- page header on compact: one primary action, the rest behind ⋯ (Priority+) ---------- */
const GROUPS='.ph,.m-acts,.bk-ph,.aud-acts,.bd-hacts,.bd-bar,.cv-acts,.cv-actions,.cv-btns,.cat-actions';
const isMore=b=>b.getAttribute('aria-label')==='More';
const label=b=>(b.textContent.trim()||b.getAttribute('aria-label')||'').replace(/\s+/g,' ');
function groups(){return [...document.querySelectorAll('.main .page')].flatMap(p=>[...p.querySelectorAll(GROUPS)]).filter(g=>!g.closest('.pop,.drawer,.modal'));}
function collapseHeaders(){if(!compact.matches)return;
 groups().forEach((g,gi)=>{const btns=[...g.children].filter(c=>c.matches('.btn')&&c.offsetParent!==null||c.matches('.btn.cx-over'));
  const prim=btns.filter(b=>b.matches('.accent')).pop();if(!prim)return;
  const over=btns.filter(b=>b!==prim&&!isMore(b));if(!over.length)return;
  /* Priority+: one secondary and no page ⋯ fits next to the primary, so it stays visible (Vit 22 Oct: a sheet with one item looked odd) */
  if(over.length===1&&!btns.some(isMore))return;
  over.forEach(b=>b.classList.add('cx-over'));g.classList.add('cx-group');g.dataset.cxg=gi;
  if(!btns.some(isMore)){g.insertAdjacentHTML('beforeend',`<button class="btn secondary icon cx-more" aria-label="More" data-act="cxmore">${ic('more')}</button>`);}
  /* the primary sits last, ⋯ after it, as on desktop */
  const m=[...g.children].find(isMore);if(m)g.appendChild(m);});}
/* the actions moved out of the header lead the ⋯ menu, above that page's own More items */
function pendingItems(){const p=S.cxPending;if(!p)return '';return p.items.map((l,i)=>`<button class="it row cx-it" role="menuitem" data-act="cxrun" data-i="${i}"><span>${esc(l)}</span></button>`).join('')+(p.more?'<div class="cx-sep" role="separator"></div>':'');}
function injectPending(){const p=S.cxPending;if(!p)return;if(!S.overlay){S.cxPending=null;return;}
 const pop=[...document.querySelectorAll('.pop,.modal,.drawer')].pop();if(!pop||pop.querySelector('[data-act="cxrun"]'))return;
 if(pop.matches('.pop'))pop.insertAdjacentHTML('afterbegin',pendingItems());}
document.addEventListener('click',e=>{const b=e.target.closest('.cx-group [aria-label="More"]');if(!b||!compact.matches)return;
 const g=b.closest('.cx-group');S.cxPending={g:+g.dataset.cxg,items:[...g.querySelectorAll(':scope > .cx-over')].map(label),more:!b.matches('.cx-more')};},true);
L.OVERLAYS.cxsheet=()=>`<div class="scrim" data-act="close"></div><div class="pop cx-sheet" role="menu" aria-label="More actions"></div>`;


/* ---------- facts on compact: a ranked summary line, the rest in a Details sheet (research 31 §8:
   Salesforce compact layout shows the first fields in priority order, Fiori shows one summary line on a phone,
   GOV.UK summary list for the full set). The desktop order is the priority order. ---------- */
const FACTS_SHOWN=2;
function summariseFacts(){if(!compact.matches)return;
 document.querySelectorAll('.main .ev-meta').forEach((m,mi)=>{const items=[...m.children].filter(c=>!c.matches('.cx-facts'));if(items.length<=FACTS_SHOWN)return;
  m.classList.add('cx-sum');items.slice(FACTS_SHOWN).forEach(c=>c.classList.add('cx-over'));
  if(!m.querySelector('.cx-facts'))m.insertAdjacentHTML('beforeend',`<button class="cx-facts" data-act="cxfacts" data-m="${mi}" aria-label="All ${items.length} details">+${items.length-FACTS_SHOWN}</button>`);});}
L.OVERLAYS.cxfacts=o=>{const rows=o.rows.map(t=>{const m=t.match(/^(.*?)\s+(\d[\d:.,]*(?:\s?(?:DKK|km|min|h))?)$/);return m?`<dt>${esc(m[1])}</dt><dd>${esc(m[2])}</dd>`:`<dt>${esc(t)}</dt><dd></dd>`}).join('');
 return `<div class="scrim" data-act="close"></div><div class="pop cx-sheet cx-factsheet" role="dialog" aria-label="Details"><div class="cx-ask-h"><b class="t-heading">${esc(o.title||'Details')}</b><span class="grow"></span><button class="btn ghost icon s" data-act="close" aria-label="Close">${ic('x','s')}</button></div><dl class="cx-kv">${rows}</dl>${o.venue?`<button class="cx-it" data-go="venue" data-id="${esc(o.venue)}"><span>${ic('pin','s')}Open the venue</span>${ic('right','s')}</button>`:''}</div>`;};
/* a back link that repeats the page title says where it goes instead (Primer parent link, Apple back) */
const BACKTO={booking:'Booking',bookings:'Bookings',money:'Money',contacts:'Contacts',contact:'Contact',venues:'Venues',catalogue:'Catalogue',mail:'Mail',audience:'Audience',settings:'Settings'};
function backLabels(){if(!compact.matches)return;const h=document.querySelector('.main h1');if(!h)return;
 document.querySelectorAll('.main [class*="-back"][data-go]').forEach(b=>{const t=b.textContent.trim();if(t&&t===h.textContent.trim()&&BACKTO[b.dataset.go]){[...b.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());b.insertAdjacentText('beforeend',BACKTO[b.dataset.go]);b.setAttribute('aria-label','Back to '+t);}});}

/* ---------- Gig day on compact (M5 step 2): what still needs you first, then Now and the next steps, the rest
   of the day behind "Show all", People and Files folded to a one-line count (research 31 findings 8 and 13) ---------- */
const TL_SHOWN=5;
function gigdayCompact(){if(!compact.matches||S.view!=='gigday')return;const o=S.cxOpen||(S.cxOpen={});
 const steps=[...document.querySelectorAll('.main .bd-steps>.bd-step')];
 if(steps.length>TL_SHOWN&&!o.tl){steps.slice(TL_SHOWN).forEach(x=>x.classList.add('cx-later'));
  const st=document.querySelector('.main .bd-steps');if(st&&!st.nextElementSibling?.matches('.cx-showall'))st.insertAdjacentHTML('afterend',`<button class="btn secondary s cx-showall" data-act="cxfold" data-k="tl">Show the whole day, ${steps.length-TL_SHOWN} more steps</button>`);}
 else if(steps.length>TL_SHOWN){const st=document.querySelector('.main .bd-steps');if(st&&!st.nextElementSibling?.matches('.cx-showall'))st.insertAdjacentHTML('afterend',`<button class="btn ghost s cx-showall" data-act="cxfold" data-k="tl">Show fewer steps</button>`);}
 document.querySelectorAll('.main .bd-pgroup').forEach((g,i)=>{const k='pg'+i,h=g.querySelector(':scope>.bd-sh');if(!h||h.querySelector('.cx-fold-b'))return;
  const body=h.nextElementSibling,n=body?body.children.length:0,name=(h.firstElementChild?.textContent||h.textContent).trim().split(/\s/)[0];
  if(!o[k])g.classList.add('cx-folded');
  h.insertAdjacentHTML('beforeend',`<button class="cx-fold-b" data-act="cxfold" data-k="${k}" aria-expanded="${!!o[k]}" aria-label="${o[k]?'Fold':'Show'} ${esc(name)}"><span>${n}</span>${ic(o[k]?'down':'right','s')}</button>`);});}

/* the editor's assistant bar: collapsed to Ask on phones, the first tap opens it */
function editorAbar(){if(!narrow.matches)return;const a=document.querySelector('.bk-abar');if(a&&S.cxAbarOpen)a.classList.add('cx-open');}
document.addEventListener('click',e=>{const b=e.target.closest('.bk-abar:not(.cx-open) [data-act="nbask"]');if(!b||!narrow.matches)return;e.preventDefault();e.stopImmediatePropagation();S.cxAbarOpen=true;b.closest('.bk-abar').classList.add('cx-open');setTimeout(()=>document.getElementById('nbask')?.focus(),30);},true);

/* phone welcome sheet, in place of the spotlight tour */
L.OVERLAYS.cxwelcome=()=>`<div class="scrim" data-act="close"></div><div class="pop cx-sheet cx-welcome" role="dialog" aria-label="Welcome to LAAS">
 <div class="cx-ask-h"><b class="t-heading">Welcome to LAAS</b></div>
 ${[['file','Gigs, Money and Mail sit in the bar at the bottom.'],['ai','Ask drafts and answers. Nothing is sent without your OK.'],['circleellipsis','More holds everything else, and this guide.']].map(([i,t])=>`<div class="cx-wl">${ic(i)}<span>${t}</span></div>`).join('')}
 <button class="btn accent cx-full" data-act="close">Got it</button></div>`;

/* phones: the invoice paper is laid out at 680 px and scaled down to the column, so it keeps its desktop look */
function invoicePaper(){document.querySelectorAll('.main .iv-paper').forEach(p=>{if(!compact.matches){p.style.zoom='';return}const w=p.parentElement.clientWidth;p.style.zoom=Math.min(1,w/680).toFixed(4);});}
addEventListener('resize',invoicePaper);
/* phones: in a filter bar the chips scroll on one line inside their own row; search stays a full-width line */
function chipRows(){if(!compact.matches)return;document.querySelectorAll('.main :is(.bk-filters,.ml-filters)').forEach(f=>{if(f.querySelector(':scope>.cx-chiprow'))return;const chips=[...f.children].filter(c=>!c.matches('.bk-search,.search'));if(chips.length<2)return;const row=document.createElement('div');row.className='cx-chiprow';chips[0].before(row);chips.forEach(c=>row.appendChild(c));});}

/* tap a one-line help text to read all of it */
document.addEventListener('click',e=>{const h=e.target.closest('.field .help');if(!h||!compact.matches)return;h.classList.toggle('cx-full');},true);
Object.assign(L.ACTIONS,{
 moresheet:()=>{S.overlay&&S.overlay.type==='moresheet'?L.close():L.open('moresheet');},
 moreband:()=>{S.overlay=null;L.render();toast2('Switching bands opens from the band name on a wider screen.');},
 moreguide:()=>{S.overlay=null;L.render();L.tour&&L.tour.start('first');},
 moretheme:()=>{L.open('thememenu');},
 asksheet:()=>{const ctx=document.querySelector('.abar .rec')?.firstChild?.textContent?.trim()||'',ph=document.getElementById('ask')?.placeholder||'';
  L.open('asksheet',{ctx,ph});setTimeout(()=>document.getElementById('asksheetq')?.focus(),60);},
 asksheetq:t=>{const q=document.getElementById('asksheetq');if(q){q.value=t.dataset.q;q.focus();}},
 asksheetgo:()=>{const q=(document.getElementById('asksheetq')?.value||'').trim();S.overlay=null;
  if(S.view==='booking'){S.booking.sheet=true;L.render();}else{if(q){S.asst='q';S.asstQ=q;}L.go('assistant');}},
 cxmore:()=>L.open('cxsheet'),
 cxfold:t=>{const o=S.cxOpen||(S.cxOpen={});o[t.dataset.k]=!o[t.dataset.k];L.render();},
 cxfacts:t=>{const m=document.querySelectorAll('.main .ev-meta')[+t.dataset.m];const items=[...m.children].filter(c=>!c.matches('.cx-facts'));const v=items.find(c=>c.matches('.ev-venue'));L.open('cxfacts',{title:document.querySelector('.main h1')?.textContent,rows:items.map(c=>c.textContent.trim()),venue:v&&v.dataset.id});},
 cxrun:t=>{const p=S.cxPending,i=+t.dataset.i;S.cxPending=null;S.overlay=null;L.render();
  const g=groups()[p.g];const b=g&&[...g.querySelectorAll(':scope > .cx-over')][i];if(b)b.click();},
});
const toast2=m=>L.toast(m);
/* the current page tab stays in view when the tab row scrolls */
const tabsInView=()=>{if(!compact.matches)return;document.querySelectorAll('.main .tabs').forEach(t=>{const on=t.querySelector('.on');if(on&&t.scrollWidth>t.clientWidth)t.scrollLeft=Math.max(0,on.offsetLeft-t.offsetLeft-16);});};
L.afterRender=()=>{collapseHeaders();injectPending();tabsInView();summariseFacts();backLabels();gigdayCompact();editorAbar();invoicePaper();chipRows();};
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='asksheetq'){e.preventDefault();L.ACTIONS.asksheetgo();}});
})();
