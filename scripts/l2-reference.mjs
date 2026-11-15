// Protocole L2 (PROTOCOLE_L2.md) — empreintes de référence du générateur, relevées AVANT tout changement de code.
// Usage : node scripts/l2-reference.mjs            → écrit bench/L2_REFERENCE.json (à ne lancer qu'au commit de référence)
//         node scripts/l2-reference.mjs --verifier → compare le générateur courant à bench/L2_REFERENCE.json (critère A1)
// Seules les graines de développement (1 à 100) sont générées ; les graines de test (5001 à 5300) restent intactes.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { generate } from '../src/bench/generator.js';
import { devClass } from '../src/bench/classes.js';

const FICHIER = new URL('../bench/L2_REFERENCE.json', import.meta.url);
const empreinte = (s) => createHash('sha256').update(JSON.stringify(generate(s, devClass(s)))).digest('hex');
const graines = {};
for (let s = 1; s <= 100; s++) graines[s] = empreinte(s);

if (process.argv.includes('--verifier')) {
  const ref = JSON.parse(readFileSync(FICHIER, 'utf8'));
  const ecarts = Object.keys(ref.graines).filter((s) => ref.graines[s] !== graines[s]);
  console.log(ecarts.length ? `A1 MANQUÉ : ${ecarts.length} graine(s) diffèrent de la référence ${ref.commit} (${ecarts.slice(0, 10).join(', ')})` : `A1 tenu : 100 graines identiques à l'octet à la référence ${ref.commit}`);
  process.exit(ecarts.length ? 1 : 0);
}
const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
writeFileSync(FICHIER, JSON.stringify({ note: 'sha256 de JSON.stringify(generate(graine, devClass(graine))), relevé avant le code de L2', commit, graines }, null, 1) + '\n');
console.log(`référence écrite : 100 graines au commit ${commit}`);
