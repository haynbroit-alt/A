import { generate } from '../src/bench/generator.js';
import { devClass } from '../src/bench/classes.js';
import { matchStocks } from '../src/bench/evaluate.js';
import { bilan } from '../src/bilan/index.js';
const [a, b] = process.argv[2].split('-').map(Number);
for (let s = a; s <= b; s++) {
  const c = devClass(s); const { observed, truth } = generate(s, c); const p = bilan(observed);
  const { map } = matchStocks(truth.stocks, p.stocks);
  const lines = [];
  for (const h of truth.hidden) {
    const e = p.ecarts.find((x) => map.get(x.stock) === h.stock);
    lines.push(`  caché ${h.kind} ${h.stock} τ=${h.debut} débit=${h.debit.toFixed(2)} ${h.above ? '' : '(sous le seuil)'} → ${e ? `déclaré τ=${e.debut} débit=${e.debit.toFixed(2)}` : 'MANQUÉ'}`);
  }
  for (const e of p.ecarts) if (!truth.hidden.some((h) => h.stock === map.get(e.stock))) lines.push(`  FAUX ${e.stock}→${map.get(e.stock)} τ=${e.debut} débit=${e.debit.toFixed(2)} (${e.preuve})`);
  if (lines.some((l) => /MANQUÉ|FAUX/.test(l)) || process.env.ALL) console.log(`== ${s} ${c.archetype} ${c.level}\n${lines.join('\n')}`);
}
