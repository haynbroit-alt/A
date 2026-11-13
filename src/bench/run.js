// node src/bench/run.js --seeds 1-100 --methods naive,parfait [--out fichier.json]
// Les graines de test (5001 à 5300) sont refusées tant que le protocole n'autorise pas l'exécution (§ 10).
import { writeFileSync } from 'node:fs';
import { runOne } from './harness.js';
import { METHODS } from '../methods/index.js';
import { report } from './report.js';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1]]] : a), []));
const [a, b] = (args.seeds ?? '1-20').split('-').map(Number);
if ((b ?? a) > 100 && process.env.LAVOISIER_TEST !== 'M0-exécution-unique') {
  console.error('Graines de test refusées : exécution unique après le gel (PROTOCOLE_M0.md, § 10).');
  process.exit(1);
}
const methods = (args.methods ?? 'naive,parfait').split(',');
const rows = [];
for (let s = a; s <= (b ?? a); s++) {
  for (const name of methods) {
    const fn = name === 'parfait' ? 'parfait' : METHODS[name];
    if (!fn) throw new Error(`méthode inconnue : ${name}`);
    rows.push({ method: name, ...runOne(s, fn) });
  }
  process.stderr.write(`graine ${s}\r`);
}
if (args.out) writeFileSync(args.out, JSON.stringify(rows, null, 1));
console.log(report(rows));
