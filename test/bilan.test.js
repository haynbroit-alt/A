import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { generate } from '../src/bench/generator.js';
import { evaluate } from '../src/bench/evaluate.js';
import { bilan } from '../src/bilan/index.js';

// Le bilan de matière ne doit contenir aucun mot de métier (protocole M0, § 7, point 1). Seul le fichier des
// libellés d'unité imposés par le format de sortie en est exempté.
test('audit : aucun mot de métier dans le code du bilan', () => {
  const words = /vente|achat|client|fournisseur|banque|caisse|paie|salaire|factur|tarif|abonn|contrat|heure|charge|emprunt|pr[êe]t|demarque|démarque|remise|frais|encaiss|d[ée]p[ôo]t|commande|r[ée]ception|cotisation|service|n[ée]goce|salari|inventaire|livraison|ticket|magasin|boutique/i;
  for (const f of readdirSync('src/bilan')) {
    if (f === 'unites.js') continue;
    const txt = readFileSync(`src/bilan/${f}`, 'utf8');
    const m = txt.match(words);
    assert.equal(m, null, `mot de métier « ${m?.[0]} » dans src/bilan/${f}`);
  }
});

test('le bilan produit une déclaration de corps évaluable, meilleure que le hasard', () => {
  const { observed, truth } = generate(6, { archetype: 'negoce', nHidden: 0, level: 'propre' });
  const m = evaluate(truth, bilan(observed));
  assert.ok(m.Fmacro > 0.8 && m.L > 0.8 && m.G > 0.8, JSON.stringify(m));
  assert.ok(m.S < 0.05 && m.P < 0.1);
});

test('le bilan retrouve des frais non enregistrés sur un compte relevé chaque jour', () => {
  const { observed, truth } = generate(43, { archetype: 'abonnement', nHidden: 2, level: 'realiste' });
  const m = evaluate(truth, bilan(observed));
  assert.ok(m.hiddenFound >= 1);
});
