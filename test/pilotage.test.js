// Protocole L2 : pilotage du prix d'un objet (critères A2, A3, A4 et validation).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate } from '../src/bench/generator.js';
import { devClass } from '../src/bench/classes.js';

// négoce (graine ≡ 0 mod 3) et abonnement (≡ 1 mod 3), désordre propre : quantités saisies exactes
const NEGOCE = 6, ABONNEMENT = 4;
const gen = (s, pil) => generate(s, devClass(s), pil);
const round2 = (x) => Math.round(x * 100) / 100;
const VENTES = ['vente.ticket', 'vente.facture', 'abo.facture'];
const auPrix = (r, p) => Math.abs(Math.abs(r.montant) - Math.abs(r.quantite ?? 1) * p) <= 0.005 + 1e-9; // tolérance d'arrondi au centime

// ce que lit celui qui pilote : un jeton d'objet vendu (ligne avec montant et quantité)
const objetVendu = (observed) => observed.journal.find((r) => r.montant != null && r.quantite != null && r.objet).objet;
// offre d'abonnement : jeton lu dans le journal, nature confirmée par la vérité
const offre = ({ observed, truth }) => observed.journal.find((r) => r.objet && truth.parties[r.objet] === 'offre').objet;

const reel = (truth, d) => {
  const m = new Map();
  for (const r of Object.values(truth.records)) if (!r.dup && r.realDay < d) { const k = `${r.type}|${r.realDay}|${JSON.stringify(r.deltas)}`; m.set(k, (m.get(k) ?? 0) + 1); }
  return m;
};
const series = (truth, d) => Object.fromEntries(truth.stocks.map((s) => [s.id, s.series.slice(0, d)]));
const lignes = ({ observed, truth }, tok) => observed.journal.filter((r) => r.objet === tok).map((r) => ({ ...r, ...truth.records[r.id] }));

for (const [nom, seed, jeton] of [['négoce', NEGOCE, (g) => objetVendu(g.observed)], ['abonnement', ABONNEMENT, offre]]) {
  const libre = gen(seed), tok = jeton(libre);
  for (const d of [1, 90, 183, 300]) {
    const prix = 7.31, pil = gen(seed, [{ jour: d, objet: tok, prix }]);
    test(`A2 rien ne change avant le jour ${d} (${nom})`, () => {
      assert.deepEqual(series(pil.truth, d), series(libre.truth, d));
      assert.deepEqual(reel(pil.truth, d), reel(libre.truth, d));
    });
    test(`A3 l'intervention du jour ${d} agit (${nom})`, () => {
      const L = lignes(pil, tok).filter((r) => r.realDay >= d && !r.dup);
      const ventes = L.filter((r) => VENTES.includes(r.type));
      assert.ok(ventes.length > 0, 'aucune vente après l’intervention');
      for (const r of ventes) assert.ok(auPrix(r, prix), `${r.type} jour ${r.realDay}`);
      const tarifs = L.filter((r) => r.type === 'tarif.changement');
      assert.deepEqual(tarifs.map((r) => [r.realDay, Math.abs(r.montant)]), [[d, prix]]);
      assert.deepEqual(pil.truth.pilotage, [{ jour: d, objet: tok, prix }]);
    });
  }
  test(`A3 jusqu'à l'intervention suivante (${nom})`, () => {
    const g = gen(seed, [{ jour: 250, objet: tok, prix: 12.5 }, { jour: 100, objet: tok, prix: 3.2 }]);
    assert.deepEqual(g.truth.pilotage.map((x) => x.jour), [100, 250]);
    const ventes = lignes(g, tok).filter((x) => x.realDay >= 100 && !x.dup && VENTES.includes(x.type));
    assert.ok(ventes.some((r) => r.realDay < 250) && ventes.some((r) => r.realDay >= 250));
    for (const r of ventes) assert.ok(auPrix(r, r.realDay < 250 ? 3.2 : 12.5), `${r.type} jour ${r.realDay}`);
    assert.deepEqual(lignes(g, tok).filter((r) => r.type === 'tarif.changement' && r.realDay >= 100).map((r) => [r.realDay, round2(Math.abs(r.montant))]), [[100, 3.2], [250, 12.5]]);
  });
}

test('A4 mêmes flux cachés avec et sans pilotage', () => {
  for (const seed of [NEGOCE, ABONNEMENT, 3, 7]) {
    const libre = gen(seed), tok = objetVendu(libre.observed);
    const pil = gen(seed, [{ jour: 30, objet: tok, prix: 1.5 }]);
    const plan = (t) => t.hidden.map(({ kind, stock, debut, threshold }) => ({ kind, stock, debut, threshold }));
    assert.ok(libre.truth.hidden.length > 0);
    assert.deepEqual(plan(pil.truth), plan(libre.truth));
  }
});

test('sans intervention : aucune clé nouvelle', () => {
  const a = JSON.stringify(gen(NEGOCE));
  assert.equal(JSON.stringify(gen(NEGOCE, [])), a);
  assert.equal(JSON.stringify(gen(NEGOCE, undefined)), a);
  assert.ok(!('pilotage' in gen(NEGOCE).truth));
});

test('pilotage invalide : erreur explicite', () => {
  const libre = gen(NEGOCE), tok = objetVendu(libre.observed);
  const client = libre.observed.journal.find((r) => r.contrepartie).contrepartie;
  const ko = (pil, re) => assert.throws(() => gen(NEGOCE, pil), re);
  for (const jour of [-1, 365, 1.5, '3', null]) ko([{ jour, objet: tok, prix: 5 }], /jour invalide/);
  for (const prix of [0, -2, NaN, Infinity, '5', null]) ko([{ jour: 10, objet: tok, prix }], /prix invalide/);
  ko([{ jour: 10, objet: 'inconnu0', prix: 5 }], /jeton sans prix/);
  ko([{ jour: 10, objet: client, prix: 5 }], /jeton sans prix/);
  ko([{ jour: 10, objet: 42, prix: 5 }], /jeton d’objet invalide/);
  ko({ jour: 10, objet: tok, prix: 5 }, /liste/);
  // un jeton d'une autre entreprise ne porte pas de prix ici ; une entreprise de service n'a aucun prix
  assert.throws(() => gen(5, [{ jour: 10, objet: tok, prix: 5 }]), /jeton sans prix/);
});
