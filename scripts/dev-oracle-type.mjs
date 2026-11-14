// Expérience de développement : vraies dates données à UN seul type vrai (triche délibérée, pour mesurer son poids).
import { generate } from '../src/bench/generator.js';
import { devClass } from '../src/bench/classes.js';
import { evaluate } from '../src/bench/evaluate.js';
import { bilan } from '../src/bilan/index.js';
const types = process.argv.slice(3);
const med = (x) => { const s = [...x].sort((p, q) => p - q); return s[s.length >> 1]; };
const [a, b] = process.argv[2].split('-').map(Number);
for (const ty of ['aucun', ...types]) {
  const S = [], P = [];
  for (let s = a; s <= b; s++) {
    const c = devClass(s); if (c.level !== 'realiste' || c.archetype !== 'negoce') continue;
    const { observed, truth } = generate(s, c);
    const o = structuredClone(observed);
    for (const r of o.journal) if (truth.records[r.id].type === ty) r.jour = truth.records[r.id].realDay;
    const m = evaluate(truth, bilan(o)); S.push(m.S); P.push(m.P);
  }
  console.log(ty, 'S', med(S).toFixed(3), 'P', med(P).toFixed(3));
}
