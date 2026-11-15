// Protocole L2b : demande sensible au prix (option de classe). Critères B1 (graines rapides), B2 et B4.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate } from '../src/bench/generator.js';
import { devClass } from '../src/bench/classes.js';

const SENS = { archetype: 'negoce', nHidden: 1, level: 'realiste', demande: 'sensible' };
const median = (xs) => { const s = [...xs].sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
// objet le plus vendu : jeton le plus fréquent des lignes observées portant montant et quantité
const plusVendu = (observed) => {
  const c = new Map();
  for (const r of observed.journal) if (r.montant != null && r.quantite != null && r.objet) c.set(r.objet, (c.get(r.objet) ?? 0) + 1);
  return [...c].sort((a, b) => b[1] - a[1])[0][0];
};
// quantité facturée de l'objet, jours réels 183 à 364, doublons exclus
const facture = ({ observed, truth }, tok) => observed.journal.reduce((s, r) => {
  const t = truth.records[r.id];
  return r.objet === tok && t && t.type === 'vente.facture' && !t.dup && t.realDay >= 183 && t.realDay <= 364 ? s + Math.abs(r.quantite) : s;
}, 0);

test('B1 sans l’option : sortie identique, aucune clé demande', () => {
  for (const seed of [3, 6, 7]) {
    const cls = devClass(seed), a = JSON.stringify(generate(seed, cls));
    assert.equal(JSON.stringify(generate(seed, { ...cls, demande: undefined })), a);
    assert.ok(!('demande' in generate(seed, cls).truth));
  }
});

test('demande inconnue : erreur', () => {
  assert.throws(() => generate(6, { ...devClass(6), demande: 'autre' }), /demande inconnue/);
});

test('B2 les factures suivent le prix (graines 221 à 230)', () => {
  let factur = 0, baisse = 0;
  for (let seed = 221; seed <= 230; seed++) {
    const libre = generate(seed, SENS), tok = plusVendu(libre.observed);
    assert.equal(libre.truth.demande, 'sensible');
    const pu = libre.observed.journal.filter((r) => r.objet === tok && r.montant != null && r.quantite && r.jour >= 169 && r.jour <= 182).map((r) => Math.abs(r.montant / r.quantite));
    assert.ok(pu.length > 0, `graine ${seed} : aucune vente saisie des jours 169 à 182`);
    const p = median(pu);
    const haut = facture(generate(seed, SENS, [{ jour: 183, objet: tok, prix: p * 1.25 }]), tok);
    const bas = facture(generate(seed, SENS, [{ jour: 183, objet: tok, prix: p * 0.8 }]), tok);
    if (haut > 0 || bas > 0) { factur++; if (haut < bas) baisse++; }
  }
  console.log(`B2 : ${factur} entreprises facturent l’objet ; ${baisse} facturent moins à +25 % qu’à −20 %`);
  assert.ok(baisse >= 8, `${baisse} sur ${factur}`);
});

test('B4 avec l’option : A2 et A4 de L2 tiennent (graine 221, jour 183)', () => {
  const libre = generate(221, SENS), tok = plusVendu(libre.observed);
  const pil = generate(221, SENS, [{ jour: 183, objet: tok, prix: 7.31 }]);
  const series = (t) => Object.fromEntries(t.stocks.map((s) => [s.id, s.series.slice(0, 183)]));
  const plan = (t) => t.hidden.map(({ kind, stock, debut, threshold }) => ({ kind, stock, debut, threshold }));
  assert.deepEqual(series(pil.truth), series(libre.truth));
  assert.ok(libre.truth.hidden.length > 0);
  assert.deepEqual(plan(pil.truth), plan(libre.truth));
});
