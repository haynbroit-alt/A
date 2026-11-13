import { generate } from '../src/bench/generator.js';
import { devClass } from '../src/bench/classes.js';
import { bcubed } from '../src/bench/evaluate.js';
import { inferTypes } from '../src/bilan/types.js';
const [a,b]=(process.argv[2]??'1-30').split('-').map(Number);
let s1=0,s2=0,n=0;
for (let s=a;s<=b;s++){ const c=devClass(s); const {observed,truth}=generate(s,c); const t=inferTypes(observed.journal); const ids=Object.keys(truth.records);
const r=bcubed(ids,id=>truth.records[id].type,id=>t.get(id)); s1+=r.f1; s2+=r.macro; n++;
if (r.macro<0.85) { // worst types
 const per=new Map(); for (const id of ids){const tt=truth.records[id].type; if(!per.has(tt)) per.set(tt,new Map()); const m=per.get(tt); m.set(t.get(id),(m.get(t.get(id))??0)+1);}
 console.log(s,c.archetype,c.level,r.macro.toFixed(3), [...per].map(([tt,m])=>tt+':'+[...m.values()].sort((x,y)=>y-x).slice(0,3).join('/')).join(' '));
}}
console.log('F',(s1/n).toFixed(3),'Féq',(s2/n).toFixed(3));
