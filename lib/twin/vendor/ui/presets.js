// VENDORED from terrysc107-cloud/spd-twin@7ce67ee src/ui/presets.js by scripts/sync-twin.mjs. Do not edit.
// @ts-nocheck
/* ---------- Pure data: scenario presets, guided experiments, control sections ---------- */
export const PRESETS={
  baseline:{label:'Typical weekday', f:p=>{}},
  sterDown:{label:'Steam sterilizer 2 down, 10:00 for 4 hrs', f:p=>{p.down={equip:'ster',unit:2,start:'10:00',hours:4};}},
  washDown:{label:'Washer 1 down, 11:00 for 6 hrs', f:p=>{p.down={equip:'wash',unit:1,start:'11:00',hours:6};}},
  loaner:{label:'Loaner surge, 40 trays at 14:00', f:p=>{p.loaners=40;p.loanerTime='14:00';}},
  shortEve:{label:'Evening short 1 prep tech', f:p=>{p.staff.prep.eve=Math.max(0,p.staff.prep.eve-1);}},
  ortho:{label:'Heavy ortho day', f:p=>{p.cases=52;p.traysPerCase=4.5;p.complexPct=45;}},
  addons:{label:'Late add-on night', f:p=>{p.eveLoad=150;p.statPct=25;}},
  moveMid:{label:'Move a prep tech from Day to Mid', f:p=>{p.staff.prep.day--;p.staff.prep.mid++;}},
};

export const EXPS=[
  {id:'sterDown',q:'A steam sterilizer breaks at 10:00',d:'Sterilizer 2 is out for 4 hours as the OR ramps up.'},
  {id:'washDown',q:'A washer goes down at 11:00',d:'Washer 1 is out for 6 hours through the peak.'},
  {id:'loaner',q:'40 loaner trays show up at 14:00',d:'A vendor drops sets for tomorrow\'s first cases.'},
  {id:'shortEve',q:'Evening shift calls out a prep tech',d:'One fewer assembler from 15:00 to 23:30.'},
  {id:'moveMid',q:'Move a prep tech from Day to Mid',d:'Same headcount, starts at 10:00 instead of 07:00.'},
  {id:'ortho',q:'Heavy ortho day',d:'52 cases, more trays per case, almost half complex.'},
  {id:'addons',q:'Late add-on night',d:'Evening returns more than double. A quarter are rush turnovers.'},
];

export const SECTIONS=[
  {title:'OR volume', open:true, items:[
    {k:'cases',label:'OR cases',min:0,max:120,step:1},
    {k:'traysPerCase',label:'Trays per case',min:1,max:10,step:0.5},
    {k:'statPct',label:'Same-day turnover trays',unit:'%',min:0,max:60,step:5},
    {k:'statTarget',label:'Turnover target',unit:'min',min:60,max:360,step:15},
    {k:'firstPct',label:'Needed for first cases',unit:'%',min:0,max:80,step:5},
    {k:'eveLoad',label:'Evening add-on load',unit:'%',min:0,max:200,step:25,prefix:'+'},
    {k:'carryover',label:'Carryover at 07:00',min:0,max:80,step:1},
    {k:'loaners',label:'Loaner trays',min:0,max:80,step:5},
    {k:'loanerTime',label:'Loaners arrive',type:'time'},
  ]},
  {title:'Staffing', open:true, custom:'staff'},
  {title:'Equipment', open:false, items:[
    {k:'washers',label:'Washer-disinfectors',min:1,max:6,step:1},
    {k:'washCap',label:'Trays per wash load',min:1,max:10,step:1},
    {k:'washCycle',label:'Wash cycle',unit:'min',min:20,max:90,step:5},
    {k:'sterilizers',label:'Steam sterilizers',min:1,max:6,step:1},
    {k:'sterCap',label:'Trays per steam load',min:2,max:16,step:1},
    {k:'sterCycle',label:'Steam cycle with dry',unit:'min',min:30,max:120,step:5},
    {k:'coolMin',label:'Cool down',unit:'min',min:0,max:120,step:5},
    {k:'lowTemp',label:'Low-temp units',min:0,max:3,step:1},
    {k:'ltCap',label:'Trays per low-temp load',min:1,max:6,step:1},
    {k:'ltCycle',label:'Low-temp cycle',unit:'min',min:20,max:80,step:1},
    {k:'ltPct',label:'Trays needing low-temp',unit:'%',min:0,max:30,step:1},
  ]},
  {title:'Downtime event', open:false, custom:'down'},
  {title:'Work standards', open:false, items:[
    {k:'deconMin',label:'Decon per tray',unit:'min',min:2,max:30,step:1},
    {k:'prepMin',label:'Assembly per tray',unit:'min',min:4,max:45,step:1},
    {k:'complexPct',label:'Complex trays',unit:'%',min:0,max:80,step:5},
    {k:'productive',label:'Productive time',unit:'%',min:50,max:100,step:5},
  ]},
];
