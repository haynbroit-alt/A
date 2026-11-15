# Protocole L2c — un hasard commun entre deux relances

Écrit et poussé **avant** le code. Suite de `PROTOCOLE_L2.md` et `PROTOCOLE_L2B.md`.

## 1. Pourquoi

Dans L2 (§ 4) j'ai écrit comme une limite définitive : « après une intervention, tous les tirages aléatoires se
décalent ». Conséquence mesurée dans l'espace commun : deux relances de la même entreprise diffèrent par bien plus
que l'effet du prix, la meilleure règle aveugle se déplace de six points d'un lot d'entreprises à l'autre, et un
test sur 80 entreprises n'a pas pu trancher. Cette limite n'a rien de définitif : sa seule fonction était de
garder le générateur identique à l'octet. Une option la lève sans y toucher.

## 2. Dispositif

Une **option** de la classe d'entreprise : `alea: 'commun'`. Sans elle, rien ne change.

Avec elle, dans les objets stockés (`products`), tout tirage dont le nombre ou l'usage dépend du prix sort d'un
flux propre à l'objet et au jour, au lieu du flux partagé :

1. le nombre de tickets du jour pour un objet et la quantité de chaque ticket ;
2. le délai entre une réception et sa facture d'achat.

Le flux d'un objet un jour donné ne dépend que de la graine, du rang de l'objet et du jour. Le nombre de tickets
est tiré par inversion de la loi de Poisson à partir d'un seul tirage uniforme, de sorte que deux prix différents,
le même jour, donnent des ventes corrélées. Les autres tirages restent dans le flux partagé, où leur nombre ne
dépend plus du prix.

La vérité rendue porte `truth.alea` quand l'option est donnée, et seulement dans ce cas. Une valeur inconnue lève
une erreur. L'option se combine avec `demande: 'sensible'` et avec le pilotage.

## 3. Critères

- **C1 — identité sans l'option.** `node scripts/l2-reference.mjs --verifier` : 100 graines de développement
  identiques à l'octet à la référence `32e02c2`.
- **C2 — les autres objets ne bougent plus.** Avec l'option, sur les graines 241 à 250 (négoce, un flux caché,
  désordre réaliste, demande sensible), en fixant au jour 183 le prix de l'objet le plus vendu à +25 % : la série
  de stock de **chaque autre objet** est identique, sur toute l'année, à celle de l'entreprise laissée seule.
  Sans l'option, le même contrôle doit échouer (c'est la limite que l'option lève).
- **C3 — deux prix, des ventes corrélées.** Avec l'option, sur ces mêmes graines : la corrélation, jour par jour
  (jours 183 à 364), entre les ventes en caisse de l'objet à +11,8 % et à −10,6 % est supérieure à 0,5 dans au
  moins 8 entreprises sur 10. Sans l'option elle est attendue proche de 0.
- **C4 — le reste est intact.** `npm test` passe ; `src/bilan/` n'est pas touché ; avec l'option, rien ne change
  avant le jour d'une intervention et les fuites sont les mêmes (A2 et A4 de L2).

**Abandon** : si C1 n'est pas obtenu, le code est retiré.

## 4. Limites écrites d'avance

- Le désordre du journal observé (retards, doublons) reste tiré en fin de simulation et diffère encore d'une
  relance à l'autre : l'option aligne la réalité, pas la saisie.
- L'entreprise laissée seule change toujours ses prix au hasard : c'est une différence réelle, pas du bruit.
- Le monde avec l'option n'est pas le même que sans : une graine donnée n'y produit pas la même entreprise.
  Les mesures de M0 portent sur le monde sans l'option.

## 5. Graines

Développement 1 à 100 pour C1 ; 241 à 250 pour C2 et C3. Les graines de test 5001 à 5300 et les plages réservées
de l'espace commun (6001 à 6220 déjà servies, 6221 et suivantes) ne sont ni générées ni exécutées.

## 6. Résultat (15 novembre 2026)

Code : `src/bench/generator.js`, `src/bench/archetypes.js` (fonction `products`) ; tests : `test/alea.test.js`.

| Critère | Résultat |
|---|---|
| C1 identité sans l'option | **tenu** : 100 graines identiques à l'octet à la référence `32e02c2` |
| C2 les autres objets ne bougent plus | **tenu** : 10 entreprises sur 10 avec l'option ; 0 sur 10 sans |
| C3 deux prix, des ventes corrélées | **tenu** : corrélation supérieure à 0,5 dans 9 entreprises sur 10 (de 0,48 à 0,87) ; sans l'option, de −0,04 à 0,34 |
| C4 le reste est intact | **tenu** : `npm test` 52 réussis ; `src/bilan/` non touché ; rien ne change avant l'intervention, mêmes fuites |

Écart à ce que j'avais écrit : sans l'option, la corrélation n'est pas « proche de 0 » mais faible et positive
(0,1 à 0,3). Les deux relances partagent le jour de la semaine et l'effet de la publicité ; cela n'a pas été
mesuré séparément.

Aucun autre tirage du flux partagé n'a eu à être déplacé : avec l'option, le nombre de tirages faits dans ce flux
ne dépend plus du prix.
