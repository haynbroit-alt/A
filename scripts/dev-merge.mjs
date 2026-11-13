import { generate } from '../src/bench/generator.js';
import { devClass } from '../src/bench/classes.js';
import { inferTypes } from '../src/bilan/types.js';
for (const s of process.argv.slice(2).map(Number)){ const {observed,truth}=generate(s,devClass(s)); const t=inferTypes(observed.journal);
const per=new Map(); for (const [id,r] of Object.entries(truth.records)){const p=t.get(id); if(!per.has(p)) per.set(p,new Map()); const m=per.get(p); m.set(r.type,(m.get(r.type)??0)+1);}
console.log(s, [...per.values()].filter(m=>m.size>1).map(m=>[...m].map(([a,b])=>a+':'+b).join('+')).join(' | '));}
