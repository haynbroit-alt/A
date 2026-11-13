// Méthode de référence « plan naïf » (protocole M0, § 4) : lire les données sans loi de conservation.
// type de flux = (source, signe du montant, présence d'une quantité) ; liens = le seul champ « reference » ;
// stocks = un par source en euros, et un par source et par objet en quantité ; profit = somme des montants ;
// aucun écart déclaré.
export function naive(observed) {
  const D = observed.jours;
  const records = {}, stocks = new Map(), profit = new Array(12).fill(0);
  const stock = (id, unit) => { if (!stocks.has(id)) stocks.set(id, { id, unit, daily: new Float64Array(D) }); return stocks.get(id); };
  for (const r of observed.journal) {
    const deltas = [];
    if (r.montant != null) { const s = stock(`${r.source}:€`, '€'); s.daily[r.jour] += r.montant; deltas.push([s.id, r.montant]); profit[Math.min(11, Math.floor((r.jour * 12) / D))] += r.montant; }
    if (r.quantite != null && r.objet) { const s = stock(`${r.source}:${r.objet}`, 'qte'); s.daily[r.jour] += r.quantite; deltas.push([s.id, r.quantite]); }
    records[r.id] = { type: `${r.source}|${Math.sign(r.montant ?? 0)}|${r.quantite != null}`, links: r.reference ? [r.reference] : [], deltas };
  }
  const out = [...stocks.values()].map((s) => { let c = 0; return { id: s.id, unit: s.unit, series: Array.from(s.daily, (x) => (c += x)) }; });
  return { records, stocks: out, profitMensuel: profit, ecarts: [] };
}
