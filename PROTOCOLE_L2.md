# Protocole L2 — entreprise pilotable

Écrit et poussé **avant** le code. Référence : programme commun (`haynbroit-alt/Tr`, `programme/PROGRAMME.md`, projet L2).

## 1. Question

Peut-on agir sur une entreprise opaque sans connaître sa vérité ? Aujourd'hui non : le générateur produit une année
entière d'un bloc, les prix y bougent seuls, et l'espace commun a consigné six expériences de prix « impossibles ».
L2 ajoute un seul levier, le prix d'un objet, fixé par celui qui pilote. Rien d'autre ne change.

Ce travail touche le **simulateur** (`src/bench/`), pas le bilan de matière (`src/bilan/`) : les mesures de M0 ne
doivent pas bouger d'un octet.

## 2. Dispositif

`generate(graine, classe, pilotage)` accepte un troisième argument facultatif : une liste d'interventions
`{ jour, objet, prix }`.

- `objet` : le jeton opaque de l'objet, tel qu'il se lit dans le journal (champ `objet`). Celui qui pilote ne
  connaît rien d'autre.
- `jour` : entier de 0 à 364. Le prix s'applique à partir de ce jour, avant les ventes du jour.
- `prix` : nombre strictement positif, en euros par unité.
- Une intervention laisse une trace dans le journal, du même type que les changements de tarif spontanés.
- À partir de sa première intervention, un objet est **piloté** : ses changements de tarif spontanés ne sont plus
  appliqués ni enregistrés. Leur tirage aléatoire est conservé, pour décaler le moins possible la suite.
- Un jeton inconnu, un jeton qui ne porte pas de prix, un jour ou un prix invalide lèvent une erreur. Pas d'échec
  silencieux.
- Les flux cachés sont calibrés sur la première passe **sans** pilotage : l'entreprise pilotée a les mêmes fuites
  que l'entreprise laissée seule.
- La vérité rendue porte la liste des interventions appliquées (`truth.pilotage`) quand il y en a, et seulement
  dans ce cas.
- Les prix pilotables sont ceux des objets stockés et ceux des offres d'abonnement (les deux seuls prix du
  simulateur).

Pour décider en cours d'année, celui qui pilote relance la simulation avec le plan complété : comme rien ne change
avant le jour d'une intervention (critère A2), la réalité des jours passés est la même d'une relance à l'autre.

## 3. Critères

- **A1 — identité sans intervention.** Sans troisième argument, avec `undefined` ou avec une liste vide, la sortie
  de `generate` est identique à l'octet à celle du générateur actuel sur les 100 graines de développement.
  Mesure : `node scripts/l2-reference.mjs --verifier`, contre les empreintes de `bench/L2_REFERENCE.json` relevées
  au commit `32e02c2`, avant tout code.
- **A2 — rien ne change avant l'intervention.** Pour une intervention au jour d, la **réalité** est identique à
  celle de l'entreprise laissée seule sur les jours 0 à d − 1 : série de chaque stock, et événements réels de ces
  jours (type, jour réel, mouvements). Vérifié pour d ∈ {1, 90, 183, 300} sur des graines de négoce et d'abonnement.
- **A3 — l'intervention agit.** À partir du jour d, le prix unitaire des ventes de l'objet (montant ÷ quantité) est
  le prix demandé, jusqu'à l'intervention suivante sur cet objet ; aucun changement de tarif spontané de cet objet
  n'apparaît après d.
- **A4 — mêmes fuites.** Le plan des flux cachés (nature, stock, début, débit prévu) est identique avec et sans
  pilotage.
- **A5 — M0 intact.** `npm test` passe ; `bench/dev-m0.json` n'est pas régénéré (A1 garantit qu'il serait
  identique).

**Abandon** : si A1 n'est pas obtenu, le code est retiré.

## 4. Limite connue, écrite d'avance

A2 porte sur la réalité, pas sur le journal **observé**. Le désordre des enregistrements (retards de saisie,
doublons, références perdues, libellés) est tiré en fin de simulation, dans un flux aléatoire dont l'état dépend de
tout ce qui a été tiré avant : deux relances qui ne diffèrent qu'après le jour d rendent la même réalité avant d,
mais pas le même désordre sur ces jours. Corriger cela demanderait de changer l'ordre des tirages, donc de casser
A1. Conséquence pour celui qui pilote : chaque observation en cours d'année est un journal cohérent en lui-même,
mais les identifiants et les retards ne se comparent pas d'une relance à l'autre.

Autre limite : après une intervention, tous les tirages aléatoires se décalent (ventes des autres objets, charges).
La différence de profit total entre l'entreprise pilotée et l'entreprise laissée seule contient donc du bruit sans
rapport avec le prix. Une mesure d'effet doit porter sur l'objet piloté, ou sur beaucoup d'entreprises.

## 5. Graines

Graines de développement (1 à 100) seulement. Les graines de test 5001 à 5300 ne sont ni générées ni exécutées.

## 6. Résultat (15 novembre 2026)

Code : `src/bench/generator.js`, `src/bench/archetypes.js` ; tests : `test/pilotage.test.js`. Le bilan de matière
n'est pas touché.

| Critère | Résultat |
|---|---|
| A1 identité sans intervention | **tenu** : 100 graines identiques à l'octet à la référence `32e02c2` |
| A2 rien ne change avant d | **tenu** : stocks et événements réels identiques avant d, pour d ∈ {1, 90, 183, 300}, négoce et abonnement |
| A3 l'intervention agit | **tenu** : toutes les ventes de l'objet au prix demandé après d ; seul changement de tarif : l'intervention |
| A4 mêmes fuites | **tenu** sur 4 graines à flux cachés |
| A5 M0 intact | **tenu** : `npm test` 44 réussis (23 existants, 21 nouveaux), `bench/dev-m0.json` non régénéré |

Contrôle supplémentaire en désordre réaliste (négoce, un flux caché, graines 201 et 202, intervention au jour 183) :
A2 et A4 tenus ; 5 744 ventes sur 5 768 et 3 906 sur 3 931 portent exactement le prix demandé, le reste étant les
erreurs de quantité du désordre réaliste (0,5 % des lignes), sans rapport avec le pilotage.

Choix à connaître : deux interventions le même jour sur le même objet, la dernière de la liste l'emporte ; un jeton
sans prix n'est refusé qu'à la passe finale ; une entreprise de service n'a aucun prix pilotable.
