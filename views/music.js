/* LAAS demo music (Vit 13 Nov: "make some music play in the EP track, maybe generate some idm or lofi").
   Original music made in the browser with Web Audio, no files and no samples. Each track's name seeds its own piece:
   tempo, key, chords, drum pattern and style, lo-fi (dusty chords, crackle, a lazy beat) or IDM (glitchy hats, FM
   bleeps, broken beats). The same track always sounds the same. LAAS.music.play(key, at) / pause() / seek(at). */
(function(){
let ctx=null,out=null,timer=null,cur=null;
const seedOf=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
const rng=seed=>()=>{seed=(seed+0x6D2B79F5)>>>0;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
const mtof=m=>440*Math.pow(2,(m-69)/12);
// minor-ish progressions as scale degrees (root of each chord, in semitones from the key)
const PROGS=[[0,8,3,10],[0,5,10,3],[0,3,8,7],[9,5,0,7],[0,10,8,7]];
const CHORD={lofi:[0,3,7,10,14],idm:[0,7,10,15]};

function piece(key){const r=rng(seedOf(key)),style=seedOf(key)%2?'idm':'lofi';
  const bpm=style==='lofi'?70+Math.floor(r()*16):118+Math.floor(r()*32);
  const root=45+Math.floor(r()*7);const prog=PROGS[Math.floor(r()*PROGS.length)];
  const kick=[],snare=[],hat=[];for(let i=0;i<16;i++){kick.push(i%8===0||(r()<(style==='idm'?.22:.12)&&i%2===0)?1:0);
    snare.push(i%8===4?1:(style==='idm'&&r()<.12?.4:0));hat.push(style==='lofi'?(i%2===0?.6:(r()<.35?.3:0)):(r()<.6?.2+r()*.5:0));}
  const mel=[];for(let i=0;i<16;i++)mel.push(r()<(style==='idm'?.45:.28)?[0,3,5,7,10,12,15][Math.floor(r()*7)]:null);
  const stut=[];for(let i=0;i<16;i++)stut.push(style==='idm'&&r()<.18?2+Math.floor(r()*3):1);
  return {style,bpm,root,prog,kick,snare,hat,mel,stut,step:60/bpm/4};}

function init(){if(ctx)return;ctx=new (window.AudioContext||window.webkitAudioContext)();
  const comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;
  out=ctx.createGain();out.gain.value=.55;out.connect(comp);comp.connect(ctx.destination);}
let noiseBuf=null;const noise=()=>{if(noiseBuf)return noiseBuf;const n=ctx.sampleRate;noiseBuf=ctx.createBuffer(1,n,n);const d=noiseBuf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return noiseBuf;};
function env(g,t,a,d,v){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d);}
function kickAt(t,p){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(p.style==='lofi'?110:140,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);env(g,t,.003,.35,p.style==='lofi'?.8:.9);o.connect(g).connect(cur.bus);o.start(t);o.stop(t+.4);}
function noiseHit(t,dur,freq,q,v,type='bandpass'){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise();f.type=type;f.frequency.value=freq;f.Q.value=q;env(g,t,.002,dur,v);s.connect(f).connect(g).connect(cur.bus);s.start(t,Math.random()*.5);s.stop(t+dur+.05);}
function chordAt(t,p,deg,len){const notes=CHORD[p.style].map(x=>p.root+12+deg+x);for(const m of notes){const o=ctx.createOscillator(),o2=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  o.type=p.style==='lofi'?'triangle':'sawtooth';o2.type='sine';o.frequency.value=mtof(m);o2.frequency.value=mtof(m)*1.003;f.type='lowpass';f.frequency.value=p.style==='lofi'?900:1600;f.Q.value=p.style==='lofi'?.7:6;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(p.style==='lofi'?.05:.025,t+(p.style==='lofi'?.08:.01));g.gain.exponentialRampToValueAtTime(0.0001,t+len);
  o.connect(f);o2.connect(f);f.connect(g).connect(cur.bus);o.start(t);o2.start(t);o.stop(t+len+.05);o2.stop(t+len+.05);}}
function bassAt(t,p,deg,len){const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type=p.style==='lofi'?'sine':'square';o.frequency.value=mtof(p.root-12+deg);f.type='lowpass';f.frequency.value=p.style==='lofi'?300:500;env(g,t,.01,len,p.style==='lofi'?.35:.18);o.connect(f).connect(g).connect(cur.bus);o.start(t);o.stop(t+len+.05);}
function bleepAt(t,p,deg,n){const m=p.root+24+deg;for(let k=0;k<n;k++){const tt=t+k*p.step/n,c=ctx.createOscillator(),mo=ctx.createOscillator(),mg=ctx.createGain(),g=ctx.createGain();
  c.type='sine';c.frequency.value=mtof(m);mo.frequency.value=mtof(m)*(p.style==='idm'?3.01:2);mg.gain.value=p.style==='idm'?mtof(m)*1.6:mtof(m)*.3;mo.connect(mg).connect(c.frequency);
  env(g,tt,.002,p.style==='idm'?.09:.3,p.style==='idm'?.08:.06);c.connect(g).connect(cur.bus);c.start(tt);mo.start(tt);c.stop(tt+.4);mo.stop(tt+.4);}}

function schedule(){const p=cur.p;while(cur.next<ctx.currentTime+.15){const i=cur.i%16,bar=Math.floor(cur.i/16),deg=p.prog[bar%p.prog.length],t=cur.next;
    if(p.kick[i])kickAt(t,p);
    if(p.snare[i])noiseHit(t,p.style==='lofi'?.18:.08,p.style==='lofi'?1800:3200,.8,.35*p.snare[i]);
    if(p.hat[i]){const n=p.stut[i];for(let k=0;k<n;k++)noiseHit(t+k*p.step/n,.03,p.style==='lofi'?7000:9000,1.5,.12*p.hat[i]+(k?-.02:0),'highpass');}
    if(i===0)chordAt(t,p,deg,p.step*16*.95);
    if(i%4===0)bassAt(t,p,deg,p.step*(p.style==='lofi'?3.5:1.5));
    if(p.mel[i]!=null&&bar%2===1)bleepAt(t,p,deg+p.mel[i],p.stut[i]);
    // lo-fi swing: every second sixteenth comes a little late
    cur.next+=p.style==='lofi'?p.step*(i%2?.88:1.12):p.step;cur.i++;}}
function crackle(){if(cur.p.style!=='lofi')return;const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise();s.loop=true;f.type='highpass';f.frequency.value=2500;g.gain.value=.012;s.connect(f).connect(g).connect(cur.bus);s.start();cur.crackle=s;}

function stop(){clearInterval(timer);timer=null;if(cur){const b=cur.bus,c=cur.crackle;b.gain.setTargetAtTime(0,ctx.currentTime,.05);setTimeout(()=>{try{c&&c.stop();b.disconnect();}catch(e){}},400);}cur=null;}
function play(key,at=0){init();if(ctx.state==='suspended')ctx.resume();stop();const p=piece(key);const bus=ctx.createGain();bus.gain.value=1;bus.connect(out);
  const steps=Math.floor(at/p.step);cur={key,p,bus,i:steps,next:ctx.currentTime+.05};crackle();schedule();timer=setInterval(schedule,25);}
window.LAAS=window.LAAS||{};window.LAAS.music={play,pause:stop,seek:(key,at)=>{if(cur&&cur.key===key)play(key,at);},style:key=>piece(key).style,playing:()=>!!cur};
})();
