import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate } from '../src/bench/generator.js';
import { evaluate, perfectPrediction, hungarian } from '../src/bench/evaluate.js';
import { seal, runOne } from '../src/bench/harness.js';
import { naive } from '../src/methods/naive.js';
import { DEV_ARCHETYPES } from '../src/bench/archetypes.js';
import { testClass } from '../src/bench/classes.js';
import { DAYS } from '../src/bench/engine.js';

const cfg = (archetype, nHidden, level) => ({ archetype, nHidden, level });

test('génération déterministe', () => {
  const a = generate(11, cfg('negoce', 2, 'realiste')), b = generate(11, cfg('negoce', 2, 'realiste'));
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

// Intégrer les Δ enregistrés (à leur date réelle) redonne exactement les stocks réels, sauf aux endroits où la
// réalité s'écarte des enregistrements : flux cachés (et, en désordre réaliste, erreurs de saisie et doublons).
function integrate(truth) {
  const by = new Map(truth.stocks.map((s) => [s.id, new Float64Array(DAYS)]));
  for (const r of Object.values(truth.records)) if (!r.dup) for (const [s, x] of r.deltas) by.get(s)[r.realDay] += x;
  return Object.fromEntries(truth.stocks.map((s) => { let c = s.init; return [s.id, Array.from(by.get(s.id), (x) => (c += x))]; }));
}
for (const a of DEV_ARCHETYPES) {
  test(`conservation exacte sans flux caché (${a}, propre)`, () => {
    const { truth } = generate(21, cfg(a, 0, 'propre'));
    const I = integrate(truth);
    for (const s of truth.stocks) for (let d = 0; d < DAYS - 2; d++) assert.ok(Math.abs(I[s.id][d] - s.series[d]) < 1e-6, `${s.id} jour ${d}`);
  });
  test(`les flux cachés sont la seule différence (${a}, propre)`, () => {
    const { truth } = generate(22, cfg(a, 2, 'propre'));
    const I = integrate(truth), touched = new Set(truth.hidden.map((h) => h.stock));
    assert.ok(truth.hidden.length >= 1);
    for (const s of truth.stocks) {
      const gap = Math.abs(I[s.id][DAYS - 3] - s.series[DAYS - 3]);
      if (touched.has(s.id)) assert.ok(gap > 0, `${s.id} devrait porter un écart`); else assert.ok(gap < 1e-6, `${s.id} ne devrait pas porter d'écart`);
    }
  });
}

test('aucun mot de métier ni champ de vérité dans les données observées', () => {
  const words = /vente|achat|client|fournisseur|stock|banque|caisse|paie|salaire|facture|tarif|abonn|contrat|heure|charge|emprunt|demarque|remise|frais|encaiss|depot|commande|reception|cotisation|service|negoce/i;
  for (const a of DEV_ARCHETYPES) {
    const { observed } = generate(31, cfg(a, 1, 'realiste'));
    const txt = JSON.stringify(observed);
    assert.ok(!words.test(txt), `mot de métier trouvé (${a})`);
    assert.deepEqual(Object.keys(observed).sort(), ['journal', 'jours', 'releves']);
    for (const r of observed.journal.slice(0, 50)) assert.deepEqual(Object.keys(r).sort(), ['auteur', 'contrepartie', 'id', 'jour', 'libelle', 'montant', 'objet', 'quantite', 'reference', 'source']);
    for (const rl of observed.releves) assert.deepEqual(Object.keys(rl).sort(), ['cle', 'valeurs']);
  }
});

test('la vérité est scellée pendant l’exécution du système', () => {
  const { truth } = generate(41, cfg('service', 0, 'propre'));
  const { proxy, unlock } = seal(truth);
  assert.throws(() => proxy.records);
  unlock();
  assert.ok(proxy.records);
  assert.throws(() => runOne(42, (obs, { truth: t }) => t.hidden, { cls: cfg('service', 1, 'propre') }));
});

test('la prédiction parfaite obtient des métriques idéales', () => {
  for (const a of DEV_ARCHETYPES) {
    const { truth } = generate(51, cfg(a, 2, 'realiste'));
    const m = evaluate(truth, perfectPrediction(truth));
    assert.equal(m.F, 1); assert.equal(m.L, 1); assert.equal(m.G, 1); assert.equal(m.S, 0); assert.equal(m.P, 0); assert.equal(m.FD, 0);
    if (m.hiddenAbove) assert.equal(m.R, 1);
  }
});

test('le plan naïf est évaluable et ne détecte rien', () => {
  const { observed, truth } = generate(61, cfg('negoce', 1, 'realiste'));
  const m = evaluate(truth, naive(observed));
  for (const k of ['F', 'L', 'G']) assert.ok(m[k] >= 0 && m[k] <= 1);
  assert.equal(m.FD, 0);
  assert.ok(m.L < 1 && m.G < 1);
});

test('une fausse détection est comptée, une détection imprécise aussi', () => {
  const { truth } = generate(71, cfg('negoce', 0, 'propre'));
  const p = perfectPrediction(truth);
  p.ecarts = [{ stock: 'T0', debut: 100, debit: 10 }];
  assert.equal(evaluate(truth, p).FD, 1);
});

test('appariement hongrois', () => {
  assert.deepEqual(hungarian([[4, 1, 3], [2, 0, 5], [3, 2, 2]]).sort(), [[0, 1], [1, 0], [2, 2]]);
  assert.equal(hungarian([[0.1], [0.05]]).length, 1);
});

test('les archétypes de test ne sont pas encore écrits (ils le seront après le gel)', () => {
  assert.throws(() => generate(5002, testClass(5002)), /pas encore écrit/);
  assert.equal(testClass(5004).placebo, true);
});
