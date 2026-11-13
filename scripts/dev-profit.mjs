import { generate } from '../src/bench/generator.js';
import { devClass } from '../src/bench/classes.js';
import { matchStocks } from '../src/bench/evaluate.js';
import { inferTypes } from '../src/bilan/types.js';
import { inferLinks } from '../src/bilan/links.js';
import { inferStocks } from '../src/bilan/stocks.js';
const s = +process.argv[2];
const { observed, truth } = generate(s, devClass(s));
const ty = inferTypes(observed.journal); const { links, dup, rules } = inferLinks(observed.journal, ty); const S = inferStocks(observed, ty, links, dup, rules);
const { map } = matchStocks(truth.stocks, S.stocks.map((x) => ({ id: x.id, unit: x.unit, series: x.series })));
const ends = [30, 60, 91, 121, 151, 182, 212, 242, 273, 303, 333, 364];
for (const st of S.stocks) { const t = truth.stocks.find((x) => x.id === map.get(st.id)); console.log(st.id.padEnd(28), (t?.id ?? '—').padEnd(5), 'na', +st.na.toFixed(2), '/', t ? +t.na.toFixed(2) : '', ' Δ(fin−début) prédit', Math.round(st.series[364] - (st.series[0] - st.daily[0])), ' vrai', t ? Math.round(t.series[364] - t.init) : ''); }
for (const t of truth.stocks) if (![...map.values()].includes(t.id)) console.log('vrai non associé', t.id, 'na', t.na, 'Δ', Math.round(t.series[364] - t.init));
