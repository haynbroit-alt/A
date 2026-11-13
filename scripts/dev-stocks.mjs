import { generate } from '../src/bench/generator.js';
import { devClass } from '../src/bench/classes.js';
import { matchStocks, seriesError, evaluate } from '../src/bench/evaluate.js';
import { bilan } from '../src/bilan/index.js';
for (const s of process.argv.slice(2).map(Number)) {
  const c = devClass(s); const { observed, truth } = generate(s, c); const p = bilan(observed);
  const { map } = matchStocks(truth.stocks, p.stocks); const inv = new Map([...map].map(([a, b]) => [b, a]));
  console.log(`== ${s} ${c.archetype} ${c.level}`, JSON.stringify(Object.fromEntries(Object.entries(evaluate(truth, p)).filter(([k]) => 'FLGSP'.includes(k[0]) && k.length<=6).map(([k,v])=>[k, v==null?v:+v.toFixed(3)]))));
  for (const t of truth.stocks) { const pid = inv.get(t.id); const ps = p.stocks.find((x) => x.id === pid); console.log('  ', t.id, t.unit, pid ?? '—', ps ? seriesError(ps.series, t.series).toFixed(3) : ''); }
  const un = p.stocks.filter((x) => !map.has(x.id)).map((x) => x.id); if (un.length) console.log('   non associés :', un.join(' '));
  console.log('   profit vrai ', truth.profitMensuel.map((x) => Math.round(x)).join(' '));
  console.log('   profit prédit', p.profitMensuel.map((x) => Math.round(x)).join(' '));
}
