/* LAAS lab, T491: the Soundcheck moment. LAAS_SOUNDCHECK.play(bandName, done) shows it full-screen, then calls done
   (which opens the dashboard). About 3.9 s, so each line can be read (Vit 5 Nov: "not able to read the text under the knob,
   too fast"): the knob turns for 1.8 s under the first line, the second line holds 1.8 s; any key or click skips to the end. Loaded only with ?lab=knob.
   A knob brings a level up, it does not switch on (Vit 5 Nov), so the copy follows the turn. */
(function(){
"use strict";
const NS='http://www.w3.org/2000/svg';
const el=(t,a,p)=>{const n=document.createElementNS(NS,t);for(const k in a)n.setAttribute(k,a[k]);p&&p.appendChild(n);return n;};
const pol=(r,d)=>{const a=d*Math.PI/180;return [120+r*Math.sin(a),120-r*Math.cos(a)];};
const arcD=(r,a0,a1)=>{const [x0,y0]=pol(r,a0),[x1,y1]=pol(r,a1);return `M${x0} ${y0}A${r} ${r} 0 1 1 ${x1} ${y1}`;};
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function play(band,done){
  const name=esc(band||'your band');
  const o=document.createElement('div');o.className='sc';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Soundcheck');
  o.innerHTML=`<div class="sc-in"><div class="sc-k" aria-hidden="true"></div><p class="sc-t" role="status" aria-live="polite">Soundcheck… bringing up the levels</p><span class="sc-skip">Press any key to skip</span></div>`;
  const k=o.querySelector('.sc-k'),t=o.querySelector('.sc-t');
  const svg=el('svg',{viewBox:'0 0 240 240'},k);
  el('path',{class:'tr',d:arcD(80,-135,135)},svg);el('path',{class:'ar',d:arcD(80,-135,135),pathLength:'1'},svg);
  const ticks=[];for(let i=0;i<=10;i++){const a=-135+27*i,[x0,y0]=pol(86,a),[x1,y1]=pol(i%5?92:96,a);ticks.push(el('line',{class:'tk',x1:x0,y1:y0,x2:x1,y2:y1},svg));}
  const bd=document.createElement('div');bd.className='bd';bd.innerHTML='<div class="tn"><i class="nt"></i></div>';k.appendChild(bd);
  document.body.appendChild(o);
  o.tabIndex=-1;o.focus({preventScroll:true});
  let timers=[],ended=false;
  const lightTicks=()=>ticks.forEach((tk,i)=>timers.push(setTimeout(()=>tk.classList.add('on'),80+i*170)));
  const finish=()=>{if(ended)return;ended=true;timers.forEach(clearTimeout);o.classList.add('up');ticks.forEach(tk=>tk.classList.add('on'));
    t.innerHTML=`<b>Levels set. ${name} is ready.</b>`;removeEventListener('keydown',skip,true);
    /* the dashboard renders under the overlay first, then the overlay fades away over it (no flash of the intro) */
    done&&done();requestAnimationFrame(()=>o.classList.add('out'));
    setTimeout(()=>{o.remove();},reduce.matches?0:320);};
  const skip=e=>{e.preventDefault();finish();};
  addEventListener('keydown',skip,true);o.addEventListener('click',finish);
  requestAnimationFrame(()=>{o.classList.add('in');
    if(reduce.matches){o.classList.add('up');ticks.forEach(tk=>tk.classList.add('on'));t.innerHTML=`<b>Levels set. ${name} is ready.</b>`;timers.push(setTimeout(finish,2000));return;}
    timers.push(setTimeout(()=>{o.classList.add('up');lightTicks();},250));
    timers.push(setTimeout(()=>{t.innerHTML=`<b>Levels set. ${name} is ready.</b>`;},2100));
    timers.push(setTimeout(finish,3900));});
}
window.LAAS_SOUNDCHECK={play};
})();
