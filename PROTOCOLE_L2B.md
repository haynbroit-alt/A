# Protocole L2b — une demande sensible au prix sur tous les canaux

Écrit et poussé **avant** le code. Suite de `PROTOCOLE_L2.md` ; motif : `haynbroit-alt/Tr`,
`programme/t3/RESULTATS_T3.md`, § 5.

## 1. Pourquoi

L'essai de prix commun (T3) a montré que le simulateur n'a pas de bon prix : les ventes sur facture ne dépendent
pas du prix, donc la marge monte sans limite avec lui (19 entreprises sur 20 jusqu'à près de quatre fois le prix).
Une règle aveugle « monter » y a toujours raison, et aucune méthode ne peut la battre. Pour savoir si une méthode
vaut mieux qu'une règle aveugle, il faut un monde où la bonne direction varie d'une entreprise à l'autre.

## 2. Dispositif

Une **option** de la classe d'entreprise : `demande: 'sensible'`. Sans elle, rien ne change.

Avec elle, deux différences, et deux seulement, dans les objets stockés (`products`) :

1. l'élasticité de chaque objet est tirée entre 0,8 et 5 (au lieu de 0,8 à 2,5), par le même tirage ;
2. la quantité d'une vente sur facture suit le prix avec cette élasticité : quantité voulue = arrondi de
   k × (prix ÷ prix initial)^(−élasticité), k étant le tirage habituel de 2 à 20 ; une quantité nulle ne donne
   aucune vente. L'ordre et le nombre des tirages aléatoires ne changent pas.

La vérité rendue porte `truth.demande` quand l'option est donnée, et seulement dans ce cas. Une valeur inconnue de
l'option lève une erreur. Les abonnements et les services ne sont pas touchés.

La plage 0,8 à 5 est un choix a priori : avec un rapport prix ÷ coût de 1,3 à 2,5, monter est juste quand
l'élasticité est sous 1,7 à 4,3 selon l'entreprise ; j'attends donc des entreprises des deux sortes. Le critère
B3 le vérifie.

## 3. Critères

- **B1 — identité sans l'option.** `node scripts/l2-reference.mjs --verifier` : 100 graines de développement
  identiques à l'octet à la référence `32e02c2`.
- **B2 — les factures suivent le prix.** Avec l'option, sur les graines 221 à 230 (négoce, un flux caché, désordre
  réaliste), pour l'objet le plus vendu : la quantité facturée des jours 183 à 364 est plus basse quand le prix
  est fixé à +25 % au jour 183 que quand il est fixé à −20 %, dans au moins 8 des entreprises qui facturent cet
  objet.
- **B3 — la bonne direction varie.** Mesuré dans l'espace commun, sur les graines de mise au point de l'essai
  suivant (221 à 240) : le meilleur des cinq niveaux de prix tenus à l'aveugle n'est pas le même partout ; au
  moins 4 entreprises sur 20 ont leur meilleur niveau en baisse et au moins 4 en hausse. Si B3 manque, la plage
  d'élasticité est révisée une seule fois, par écrit ici, avant tout test.
- **B4 — le reste est intact.** `npm test` passe ; `src/bilan/` n'est pas touché ; avec l'option, les critères A2
  et A4 de L2 (rien ne change avant une intervention, mêmes fuites) tiennent toujours.

**Abandon** : si B1 n'est pas obtenu, le code est retiré.

## 4. Limites écrites d'avance

- C'est toujours une demande à élasticité constante, sans concurrent ni mémoire des prix.
- Le réapprovisionnement reste réglé sur la demande au prix initial : une forte baisse de prix crée des ruptures
  de stock, qui plafonnent les ventes. C'est voulu : un essai de prix réel les subit aussi.
- Les mesures de M0 (bilan de matière) portent sur le monde sans l'option. Rien n'est mesuré sur le bilan dans le
  monde sensible.

## 5. Graines

Graines de développement 1 à 100 pour B1 ; 221 à 240 pour B2 et B3. Les graines de test 5001 à 5300 ne sont ni
générées ni exécutées, et les graines 6041 à 6080 sont réservées au test de l'essai suivant.
