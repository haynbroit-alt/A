// LAVOISIER — organe 1 : le bilan de matière (protocole M0).
// Entrée : les seules données observées. Sortie : la déclaration de corps (format de src/bench/evaluate.js).
import { inferTypes } from './types.js';
import { inferLinks } from './links.js';
import { inferStocks } from './stocks.js';
import { inferEcarts } from './ecarts.js';

export function bilan(observed) {
  const { journal } = observed;
  const typeOf = inferTypes(journal);
  const { links, dup, rules } = inferLinks(journal, typeOf);
  const S = inferStocks(observed, typeOf, links, dup, rules);
  const ecarts = inferEcarts(observed, S, typeOf, links, dup);
  const records = {};
  for (const r of journal) records[r.id] = { type: typeOf.get(r.id), links: [...links.get(r.id)], deltas: S.deltas.get(r.id) };
  return {
    records,
    stocks: S.stocks.map((s) => ({ id: s.id, unit: s.unit, series: s.series })),
    profitMensuel: S.profit,
    ecarts,
  };
}
