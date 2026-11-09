/* Compact row accordion (Figma Compact row 2029:38225, State=Closed / Open; Vit 9 Nov). On phones, a Money row that has
   more than its two lines (details, actions) opens in place when tapped and closes on a second tap; its buttons and
   links still work. The row's own destination (data-href, data-go) moves to an Open button inside the open row.
   Shared by the prototype (index.html) and Django (base.html). */
(function(){
const phone=matchMedia('(max-width:599.98px)');
const ROW=':is(.iv-r,.po-m):not(.bk-th):not(.ex-tot)';
document.addEventListener('click',e=>{
  if(!phone.matches)return;
  const r=e.target.closest(ROW);if(!r||r.classList.contains('cx-pass'))return;
  if(e.target.closest('button,a,input,select,form,label'))return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const open=!r.classList.contains('cx-open');
  r.classList.toggle('cx-open',open);r.setAttribute('aria-expanded',open);
  const acts=r.querySelector(':scope>:last-child');
  if(open&&acts&&(r.dataset.href||r.dataset.go)&&!acts.querySelector('.cx-go')){
    const b=document.createElement('button');b.type='button';b.className='btn secondary s cx-go';b.textContent='Open';
    b.addEventListener('click',ev=>{ev.stopPropagation();r.classList.add('cx-pass');r.click();r.classList.remove('cx-pass');});
    acts.appendChild(b);}
},true);
})();
