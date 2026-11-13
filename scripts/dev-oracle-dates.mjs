// Expérience de développement : le bilan, si les dates RÉELLES étaient connues (triche délibérée, jamais une méthode).
import { generate } from '../src/bench/generator.js';
import { devClass } from '../src/bench/classes.js';
import { evaluate } from '../src/bench/evaluate.js';
import { bilan } from '../src/bilan/index.js';
const [a, b] = process.argv[2].split('-').map(Number);
const med = (x) => { const s = [...x].sort((p, q) => p - q); return s[s.length >> 1]; };
const out = { normal: [], dates: [] };
for (let s = a; s <= b; s++) {
  const c = devClass(s); if (c.level !== 'realiste') continue;
  const { observed, truth } = generate(s, c);
  out.normal.push(evaluate(truth, bilan(structuredClone(observed))));
  const o2 = structuredClone(observed); for (const r of o2.journal) r.jour = truth.records[r.id].realDay;
  out.dates.push(evaluate(truth, bilan(o2)));
}
for (const [k, v] of Object.entries(out)) console.log(k, 'S', med(v.map((m) => m.S)).toFixed(3), 'P', med(v.map((m) => m.P)).toFixed(3), 'G', (v.reduce((x, m) => x + m.G, 0) / v.length).toFixed(3), 'FD', (v.reduce((x, m) => x + m.FD, 0) / v.length).toFixed(2), 'R', v.reduce((x, m) => x + m.hiddenFound, 0) + '/' + v.reduce((x, m) => x + m.hiddenAbove, 0));
