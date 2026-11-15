// Protocole L2c : hasard commun entre deux relances (option de classe alea: 'commun'). Critères C1 (graines rapides), C2, C3, C4.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate } from '../src/bench/generator.js';
import { devClass } from '../src/bench/classes.js';

const SANS = { archetype: 'negoce', nHidden: 1, level: 'realiste', demande: 'sensible' };
const COM = { ...SANS, alea: 'commun' };
const median = (xs) => { const s = [...xs].sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const plusVendu = (observed) => {
  const c = new Map();
  for (const r of observed.journal) if (r.montant != null && r.quantite != null && r.objet) c.set(r.objet, (c.get(r.objet) ?? 0) + 1);
  return [...c].sort((a, b) => b[1] - a[1])[0][0];
};
// objet le plus vendu et son prix médian saisi des jours 169 à 182 (génération non pilotée)
const cible = (libre) => {
  const tok = plusVendu(libre.observed);
  const pu = libre.observed.journal.filter((r) => r.objet === tok && r.montant != null && r.quantite && r.jour >= 169 && r.jour <= 182).map((r) => Math.abs(r.montant / r.quantite));
  assert.ok(pu.length > 0, 'aucune vente saisie des jours 169 à 182');
  return { tok, p: median(pu) };
};
// séries des autres stocks d'objets (unité 'qte', hors objet piloté)
const autres = (truth, tok) => {
  const pil = truth.releves.find((r) => r.cle === tok).stock;
  return Object.fromEntries(truth.stocks.filter((s) => s.unit === 'qte' && s.id !== pil).map((s) => [s.id, s.series]));
};
// ventes en caisse de l'objet par jour réel 183 à 364, doublons exclus
const caisse = ({ observed, truth }, tok) => {
  const v = new Array(182).fill(0);
  for (const r of observed.journal) {
    const t = truth.records[r.id];
    if (r.objet === tok && t && t.type === 'vente.ticket' && !t.dup && t.realDay >= 183 && t.realDay <= 364) v[t.realDay - 183] += Math.abs(r.quantite);
  }
  return v;
};
const pearson = (a, b) => {
  const n = a.length, ma = a.reduce((s, x) => s + x, 0) / n, mb = b.reduce((s, x) => s + x, 0) / n;
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < n; i++) { const x = a[i] - ma, y = b[i] - mb; sab += x * y; saa += x * x; sbb += y * y; }
  return saa && sbb ? sab / Math.sqrt(saa * sbb) : 0;
};

test('C1 sans l’option : sortie identique, aucune clé alea ; valeur inconnue : erreur', () => {
  for (const seed of [3, 6, 7]) {
    const cls = devClass(seed), a = JSON.stringify(generate(seed, cls));
    assert.equal(JSON.stringify(generate(seed, { ...cls, alea: undefined })), a);
    assert.ok(!('alea' in generate(seed, cls).truth));
  }
  assert.throws(() => generate(6, { ...devClass(6), alea: 'autre' }), /alea inconnu/);
});

const C2 = (cls) => {
  let ok = 0;
  for (let seed = 241; seed <= 250; seed++) {
    const libre = generate(seed, cls), { tok, p } = cible(libre);
    const pil = generate(seed, cls, [{ jour: 183, objet: tok, prix: p * 1.25 }]);
    if (JSON.stringify(autres(pil.truth, tok)) === JSON.stringify(autres(libre.truth, tok))) ok++;
  }
  return ok;
};

test('C2 les autres objets ne bougent plus (graines 241 à 250)', () => {
  const avec = C2(COM), sans = C2(SANS);
  console.log(`C2 : autres stocks identiques dans ${avec}/10 entreprises avec l’option, ${sans}/10 sans`);
  assert.equal(avec, 10);
});

const C3 = (cls) => {
  let ok = 0;
  const rs = [];
  for (let seed = 241; seed <= 250; seed++) {
    const { tok, p } = cible(generate(seed, cls));
    const haut = caisse(generate(seed, cls, [{ jour: 183, objet: tok, prix: p * 1.25 ** 0.5 }]), tok);
    const bas = caisse(generate(seed, cls, [{ jour: 183, objet: tok, prix: p * 1.25 ** -0.5 }]), tok);
    const c = pearson(haut, bas);
    rs.push(Math.round(c * 100) / 100);
    if (c > 0.5) ok++;
  }
  return { ok, rs };
};

test('C3 deux prix, des ventes corrélées (graines 241 à 250)', () => {
  const avec = C3(COM), sans = C3(SANS);
  console.log(`C3 : corrélation > 0,5 dans ${avec.ok}/10 avec l’option [${avec.rs.join(' ')}], ${sans.ok}/10 sans [${sans.rs.join(' ')}]`);
  assert.ok(avec.ok >= 8, `${avec.ok} sur 10`);
});

test('C4 avec l’option : rien ne change avant l’intervention (graine 241, jour 183)', () => {
  const libre = generate(241, COM), { tok, p } = cible(libre);
  const pil = generate(241, COM, [{ jour: 183, objet: tok, prix: p * 1.25 }]);
  const series = (t) => Object.fromEntries(t.stocks.map((s) => [s.id, s.series.slice(0, 183)]));
  const plan = (t) => t.hidden.map(({ kind, stock, debut, threshold }) => ({ kind, stock, debut, threshold }));
  assert.equal(pil.truth.alea, 'commun');
  assert.deepEqual(series(pil.truth), series(libre.truth));
  assert.ok(libre.truth.hidden.length > 0);
  assert.deepEqual(plan(pil.truth), plan(libre.truth));
});
