// VENDORED from terrysc107-cloud/spd-twin@7ce67ee src/engine.js by scripts/sync-twin.mjs. Do not edit.
// @ts-nocheck
/* ---------- Simulation engine (pure, no DOM) ---------- */
const SIM_LEN = 1440;          // 07:00 day 1 to 07:00 day 2
const DAY0 = 420;              // 07:00 in clock minutes
const FIRST_DEADLINE = 1410;   // 06:30 next day: sterile and cool for 07:30 starts
const CURVE = [0.4,0.3,0.3,0.3,0.3,0.3,0.2,0,0.5,4,8,12,13,13,12,10,8,6,4.5,3,2,1.5,1,0.6]; // OR returns by clock hour
const DEFAULTS = {
  seed: 7,
  cases: 45, traysPerCase: 3.5, statPct: 15, statTarget: 240, firstPct: 25, eveLoad: 0, carryover: 8,
  loaners: 0, loanerTime: '14:00',
  // Shift ids are fixed (staff counts key off them). Start time and length are editable.
  shifts: [
    {id:'day',  label:'Day',     start:'07:00', hours:8.5},
    {id:'mid',  label:'Mid',     start:'10:00', hours:8.5},
    {id:'eve',  label:'Evening', start:'15:00', hours:8.5},
    {id:'night',label:'Night',   start:'23:00', hours:8},
  ],
  staff: { decon:{day:1,mid:1,eve:2,night:1}, prep:{day:2,mid:1,eve:2,night:2} },
  washers: 3, washCap: 4, washCycle: 50,
  sterilizers: 2, sterCap: 8, sterCycle: 60, coolMin: 30,
  lowTemp: 1, ltCap: 2, ltCycle: 47, ltPct: 6,
  deconMin: 8, prepMin: 12, complexPct: 20, productive: 85,
  down: { equip:'none', unit:1, start:'10:00', hours:4 }
};
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function clockStr(m){ const c=((DAY0+Math.floor(m))%1440+1440)%1440; return String(Math.floor(c/60)).padStart(2,'0')+':'+String(c%60).padStart(2,'0'); }
function clockToM(hhmm){ const [h,mi]=hhmm.split(':').map(Number); let m=h*60+mi-DAY0; if(m<0) m+=1440; return m; }
// Shift windows in sim minutes. A shift that would run past 07:00 next day is clipped there (no wrap).
function shiftWindows(p){
  return p.shifts.map(sh=>{ const s=clockToM(sh.start), e=Math.min(SIM_LEN, s+Math.round(sh.hours*60)); return {...sh, s, e, range:`${sh.start} to ${clockStr(e)}`}; });
}
function staffAt(p, role, m, sh=shiftWindows(p)){ let n=0; for(const s of sh) if(m>=s.s && m<s.e) n+=p.staff[role][s.id]||0; return n; }

function simulate(p){
  const rnd = mulberry32(((p.seed|0)*2654435761)>>>0);
  const trays=[]; let nid=0;
  const mk=(arrive,kind,complex,carry)=>{
    const t={id:nid++,arrive,kind,complex,carry:!!carry, fd:0.6+0.8*rnd(), fp:0.6+0.8*rnd(), ltRoll:rnd()*100};
    t.lt = p.lowTemp>0 && t.ltRoll < p.ltPct;
    t.needBy = kind==='stat' ? arrive+p.statTarget : (kind==='first'||kind==='loaner') ? FIRST_DEADLINE : null;
    t.key = t.needBy!=null ? t.needBy : 3000+arrive;
    trays.push(t); return t;
  };
  // case returns sampled from the OR curve
  const w=[]; for(let h=0;h<24;h++){ const ch=(7+h)%24; let v=CURVE[ch]; if(ch>=17&&ch<=23) v*=1+p.eveLoad/100; w.push(v); }
  const ws=w.reduce((a,b)=>a+b,0);
  const sample=()=>{ let r=rnd()*ws; for(let h=0;h<24;h++){ if(r<w[h]) return h*60+Math.floor(rnd()*60); r-=w[h]; } return SIM_LEN-1; };
  for(let c=0;c<p.cases;c++){
    const ct=sample(), n=Math.max(1,Math.round(p.traysPerCase*(0.5+rnd()))), stat=rnd()*100<p.statPct;
    for(let i=0;i<n;i++){ const kind=stat?'stat':(rnd()*100<p.firstPct?'first':'std'); mk(Math.min(SIM_LEN-1,ct+Math.floor(rnd()*15)),kind,rnd()*100<p.complexPct); }
  }
  for(let i=0;i<p.carryover;i++){ const t=mk(0,'std',rnd()*100<p.complexPct,true); t.deconS=t.deconE=t.washS=t.washE=0; }
  const lm=clockToM(p.loanerTime);
  for(let i=0;i<p.loaners;i++) mk(Math.min(SIM_LEN-1,lm+Math.floor(rnd()*30)),'loaner',true);

  const arr=trays.filter(t=>!t.carry).sort((a,b)=>a.arrive-b.arrive||a.id-b.id);
  const Q={decon:[],wash:[],prep:trays.filter(t=>t.carry),ster:[],lt:[]};
  const slots={decon:Array.from({length:16},()=>({until:-1,tray:null})), prep:Array.from({length:16},()=>({until:-1,tray:null}))};
  const mkU=n=>Array.from({length:n},(_,i)=>({i,until:-1,load:null,cycles:[]}));
  const units={wash:mkU(p.washers), ster:mkU(p.sterilizers), lt:mkU(p.lowTemp)};
  const ser={decon:{staff:new Int16Array(SIM_LEN),busy:new Int16Array(SIM_LEN)}, prep:{staff:new Int16Array(SIM_LEN),busy:new Int16Array(SIM_LEN)}};
  const dS=clockToM(p.down.start), dE=dS+p.down.hours*60;
  const isDown=(eq,i,m)=>p.down.equip===eq && i===p.down.unit-1 && m>=dS && m<dE;
  const pick=(q,n)=>{ q.sort((a,b)=>a.key-b.key||a.id-b.id); return q.splice(0,n); };
  const prod=p.productive/100, SH=shiftWindows(p);

  function work(role,q,m){
    const N=staffAt(p,role,m,SH), sl=slots[role];
    let busy=0; for(const s of sl) if(s.tray) busy++;
    while(busy<N && q.length){
      const i=sl.findIndex(s=>!s.tray); if(i<0) break;
      const t=pick(q,1)[0];
      const base= role==='decon' ? p.deconMin*(t.complex?1.6:1)*t.fd : p.prepMin*(t.complex?2.2:1)*t.fp;
      const dur=Math.max(1,Math.round(base/prod));
      if(role==='decon'){ t.deconS=m; t.deconE=m+dur; t.deconW=i; } else { t.prepS=m; t.prepE=m+dur; t.prepW=i; }
      sl[i].tray=t; sl[i].until=m+dur; busy++;
    }
    ser[role].staff[m]=N; ser[role].busy[m]=busy;
  }
  function batch(list,eq,q,cap,cyc,waitFill,m,ready){
    for(const u of list){
      if(!q.length) return;
      if(u.load || isDown(eq,u.i,m)) continue;
      let oldest=Infinity; for(const t of q) if(t[ready]<oldest) oldest=t[ready];
      const hot=q.some(t=>t.kind==='stat');
      if(q.length<cap && m-oldest<waitFill && !hot) continue;
      const load=pick(q,cap);
      for(const t of load){
        if(eq==='wash'){ t.washS=m; t.washE=m+cyc; t.washU=u.i; }
        else { t.sterS=m; t.sterE=m+cyc; t.sterU=u.i; t.sterEq=eq; t.done = eq==='ster' ? m+cyc+p.coolMin : m+cyc; }
      }
      u.load=load; u.until=m+cyc; u.cycles.push({s:m,e:m+cyc,n:load.length});
    }
  }
  let ai=0;
  for(let m=0;m<SIM_LEN;m++){
    while(ai<arr.length && arr[ai].arrive<=m) Q.decon.push(arr[ai++]);
    for(const u of units.wash) if(u.load && u.until<=m){ for(const t of u.load) Q.prep.push(t); u.load=null; }
    for(const u of units.ster) if(u.load && u.until<=m) u.load=null;
    for(const u of units.lt)   if(u.load && u.until<=m) u.load=null;
    for(const s of slots.decon) if(s.tray && s.until<=m){ Q.wash.push(s.tray); s.tray=null; }
    for(const s of slots.prep)  if(s.tray && s.until<=m){ (s.tray.lt?Q.lt:Q.ster).push(s.tray); s.tray=null; }
    work('decon',Q.decon,m);
    work('prep',Q.prep,m);
    batch(units.wash,'wash',Q.wash,p.washCap,p.washCycle,15,m,'deconE');
    batch(units.ster,'ster',Q.ster,p.sterCap,p.sterCycle,20,m,'prepE');
    batch(units.lt,'lt',Q.lt,p.ltCap,p.ltCycle,15,m,'prepE');
  }

  // ---- metrics ----
  const END=SIM_LEN, ST=['deconQ','decon','washQ','wash','prepQ','prep','sterQ','ster','cool','stored'];
  const diff={}; for(const s of ST) diff[s]=new Float64Array(END+2);
  const add=(s,a,b)=>{ if(a===undefined||a>END) return; if(b===undefined||b>END+1) b=END+1; if(b<=a) return; diff[s][a]++; diff[s][b]--; };
  const enter={deconQ:0,washQ:0,prepQ:0,sterQ:0};
  for(const t of trays){
    if(!t.carry){ add('deconQ',t.arrive,t.deconS); enter.deconQ++; }
    add('decon',t.deconS,t.deconE);
    if(!t.carry && t.deconE!==undefined){ add('washQ',t.deconE,t.washS); enter.washQ++; }
    add('wash',t.washS,t.washE);
    if(t.washE!==undefined){ add('prepQ',t.washE,t.prepS); enter.prepQ++; }
    add('prep',t.prepS,t.prepE);
    if(t.prepE!==undefined){ add('sterQ',t.prepE,t.sterS); enter.sterQ++; }
    add('ster',t.sterS,t.sterE);
    add('cool',t.sterE,t.done);
    add('stored',t.done,undefined);
  }
  const S={}; for(const s of ST){ const a=new Float32Array(END+1); let c=0; for(let m=0;m<=END;m++){ c+=diff[s][m]; a[m]=c; } S[s]=a; }
  const QS=[{id:'deconQ',name:'Decon',zone:'decon'},{id:'washQ',name:'Washer loading',zone:'wash'},{id:'prepQ',name:'Prep & pack',zone:'prep'},{id:'sterQ',name:'Sterilizer loading',zone:'ster'}];
  const waits={}, peaks={};
  for(const q of QS){ let sum=0,pk=0,pm=0; const a=S[q.id]; for(let m=0;m<END;m++){ sum+=a[m]; if(a[m]>pk){pk=a[m];pm=m;} } waits[q.id]={sum,avg:enter[q.id]?sum/enter[q.id]:0}; peaks[q.id]={n:pk,m:pm}; }

  let statN=0,statOK=0,firstN=0,firstOK=0,backlog=0,tatSum=0,tatN=0,doneN=0; const late=[];
  for(const t of trays){
    const done=t.done!==undefined && t.done<=END;
    if(done) doneN++; else backlog++;
    if(done && !t.carry){ tatSum+=t.done-t.arrive; tatN++; }
    if(t.kind==='stat' && t.needBy<=END){ statN++; if(done && t.done<=t.needBy) statOK++; else late.push(t); }
    if(t.kind==='first'||t.kind==='loaner'){ firstN++; if(done && t.done<=FIRST_DEADLINE) firstOK++; }
  }
  const util={};
  for(const eq of ['wash','ster','lt']){
    const n=units[eq].length; if(!n){ util[eq]=0; continue; }
    let busy=0; for(const u of units[eq]) for(const c of u.cycles) busy+=Math.min(c.e,END)-c.s;
    let avail=n*END; if(p.down.equip===eq && p.down.unit<=n) avail-=Math.max(0,Math.min(dE,END)-Math.min(dS,END));
    util[eq]=avail>0?busy/avail:0;
  }
  const shiftUtil={};
  for(const role of ['decon','prep']){
    shiftUtil[role]={};
    for(const s of SH){ let b=0,n=0; for(let m=s.s;m<Math.min(s.e,END);m++){ b+=ser[role].busy[m]; n+=ser[role].staff[m]; } shiftUtil[role][s.id]=n?b/n:null; }
    let b=0,n=0; for(let m=0;m<END;m++){ b+=ser[role].busy[m]; n+=ser[role].staff[m]; } util[role]=n?b/n:0;
  }
  return { p, trays, units, ser, S, waits, peaks, util, shiftUtil, late, QS,
    down:{equip:p.down.equip,unit:p.down.unit,s:dS,e:dE},
    k:{ total:trays.length, doneN, backlog, statN, statOK, statLate:statN-statOK, firstN, firstOK, firstMiss:firstN-firstOK, avgTat: tatN?tatSum/tatN:0 } };
}
function riskOf(r){ return r.k.statLate*3 + r.k.firstMiss*5 + r.k.backlog; }
// The queue stage holding the most tray-minutes of waiting, with its share of all queue time.
function constraintOf(r){
  let tot=0; for(const q of r.QS) tot+=r.waits[q.id].sum;
  let best=null; for(const q of r.QS){ const w=r.waits[q.id]; if(!best||w.sum>best.w.sum) best={q,w,peak:r.peaks[q.id]}; }
  if(best){ best.share=tot?best.w.sum/tot:0; best.tot=tot; }
  return best;
}
function stageAt(t,tm){
  if(t.arrive>tm) return null;
  if(t.deconS===undefined||t.deconS>tm) return 'deconQ';
  if(t.deconE>tm) return 'decon';
  if(t.washS===undefined||t.washS>tm) return 'washQ';
  if(t.washE>tm) return 'wash';
  if(t.prepS===undefined||t.prepS>tm) return 'prepQ';
  if(t.prepE>tm) return 'prep';
  if(t.sterS===undefined||t.sterS>tm) return 'sterQ';
  if(t.sterE>tm) return 'ster';
  if(t.done>tm) return 'cool';
  return 'stored';
}
const ROLE={decon:'decon',prep:'prep'};
function leverCandidates(p){
  const L=[], SH=shiftWindows(p);
  for(const role of ['decon','prep']) for(const s of SH){
    if(p.staff[role][s.id]<5) L.push({label:`+1 ${ROLE[role]} tech, ${s.label}`, cost:'+1 FTE', kind:'add', f:q=>{q.staff[role][s.id]++;}});
    if(p.staff[role][s.id]>0) L.push({label:`−1 ${ROLE[role]} tech, ${s.label}`, cost:'saves 1 FTE', kind:'cut', f:q=>{q.staff[role][s.id]--;}});
  }
  const moves=[['day','mid'],['day','eve'],['night','eve'],['eve','night'],['mid','eve']];
  for(const role of ['decon','prep']) for(const [a,b] of moves){
    if(p.staff[role][a]>0 && p.staff[role][b]<5){
      const la=SH.find(s=>s.id===a).label, lb=SH.find(s=>s.id===b).label;
      L.push({label:`Move 1 ${ROLE[role]} tech, ${la} to ${lb}`, cost:'no added FTE', kind:'move', f:q=>{q.staff[role][a]--;q.staff[role][b]++;}});
    }
  }
  if(p.washers<6) L.push({label:'+1 washer-disinfector', cost:'capital', kind:'add', f:q=>{q.washers++;}});
  if(p.washers>1) L.push({label:'−1 washer-disinfector', cost:'frees a unit', kind:'cut', f:q=>{q.washers--; if(q.down.equip==='wash'&&q.down.unit>q.washers) q.down.unit=q.washers;}});
  if(p.sterilizers<6) L.push({label:'+1 steam sterilizer', cost:'capital', kind:'add', f:q=>{q.sterilizers++;}});
  if(p.sterilizers>1) L.push({label:'−1 steam sterilizer', cost:'frees a unit', kind:'cut', f:q=>{q.sterilizers--; if(q.down.equip==='ster'&&q.down.unit>q.sterilizers) q.down.unit=q.sterilizers;}});
  if(p.ltPct>0 && p.lowTemp<3) L.push({label:'+1 low-temp unit', cost:'capital', kind:'add', f:q=>{q.lowTemp++;}});
  if(p.prepMin>5) L.push({label:'Cut assembly time 10%', cost:'process', kind:'move', f:q=>{q.prepMin=Math.round(q.prepMin*0.9*10)/10;}});
  if(p.productive<95) L.push({label:'Productive time +5 pts', cost:'process', kind:'move', f:q=>{q.productive+=5;}});
  return L;
}
export { SIM_LEN, DAY0, FIRST_DEADLINE, CURVE, DEFAULTS, clone, mulberry32, clockStr, clockToM, shiftWindows, staffAt, simulate, riskOf, constraintOf, stageAt, leverCandidates };
