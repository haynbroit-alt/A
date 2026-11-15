# Protocole M0 — le bilan de matière retrouve-t-il le corps d'une entreprise à partir de ses seuls journaux ?

**Statut** : protocole écrit **avant** le code, comme ceux de CORTEX et de GALILÉE. Ses hypothèses, ses seuils et son
critère d'abandon sont fixés ici. Le développement se fait sur les graines 1 à 100. Le bilan de matière est ensuite
gelé (commit identifié), deux archétypes d'entreprise sont écrits **après** le gel, puis l'évaluation est exécutée
**une seule fois** sur les graines 5001 à 5300. Tout ce qui change pendant le développement est consigné au § 9, sans
toucher aux hypothèses ni aux seuils.

Références : `CONCEPTION.md`, § 4 (organe 1), § 13 (jalons) et § 14 (limites).

---

## 1. La question

CORTEX pilote une activité si on lui **déclare** son corps : leviers, mesures, comptabilité. M0 teste la première
brique de LAVOISIER : retrouver ce corps **sans déclaration**, à partir des seuls enregistrements bruts d'une
entreprise, en s'appuyant sur une seule loi supposée connue : la conservation (de l'argent, des quantités, des clients).

Trois sous-questions, dans l'ordre :

1. **Structure** : les enregistrements sont-ils correctement regroupés en types de flux, et appariés entre eux
   (facture ↔ paiement, réception ↔ consommation) ?
2. **Conservation** : les stocks reconstruits par intégration des flux correspondent-ils aux stocks réels, et le profit
   reconstruit au profit réel ?
3. **Écarts** : quand un flux n'est enregistré nulle part (démarque, remise non saisie, frais oubliés), le système le
   détecte-t-il dans les résidus de conservation, sans en inventer quand il n'y en a pas ?

**Hors du périmètre de M0** : distinguer leviers, mesures et contexte (c'est M1). Le typage produit par le système est
rapporté, sans critère.

---

## 2. Le banc d'essai : des « entreprises opaques »

### 2.1 Ce que voit le système

Pour chaque entreprise, sur 365 jours, et **rien d'autre** :

**Un journal d'événements**, une ligne par enregistrement :

| Champ | Contenu | Remarque |
|---|---|---|
| `id` | identifiant unique | |
| `jour` | entier, 0 à 364 | la date d'**enregistrement**, qui peut suivre la date réelle |
| `source` | jeton opaque | le système d'information d'origine (banque, caisse, achats…), renommé au hasard par entreprise |
| `libelle` | suite de jetons opaques | tirés d'un vocabulaire propre à chaque entreprise, sans aucun mot réel |
| `montant` | nombre signé ou vide | en euros |
| `quantite` | nombre signé ou vide | |
| `objet` | jeton opaque ou vide | article, contrat |
| `contrepartie` | jeton opaque ou vide | client, fournisseur, salarié |
| `auteur` | jeton opaque | qui a saisi l'enregistrement (interne ou automatique) |
| `reference` | `id` d'un autre enregistrement, ou vide | **lacunaire et parfois fausse** |

**Des relevés périodiques**, chacun désigné par un jeton opaque :
- un solde par compte de trésorerie, quotidien ;
- un inventaire physique par objet stocké, mensuel ;
- un décompte de contrats actifs, mensuel, s'il y a des contrats.

Le système ne sait pas quel jeton désigne quoi. Tous les jetons, noms de sources et vocabulaires de libellés sont
tirés au hasard par graine : aucune information de métier ne peut fuir par les noms.

### 2.2 Ce qui est caché (la vérité)

- le type de flux de chaque enregistrement et ses appariements ;
- le graphe stocks–flux : stocks, unités, matrice d'incidence ;
- les séries réelles de chaque stock et le profit quotidien ;
- les flux cachés : nature, stock touché, début, débit ;
- le statut de chaque série (levier, mesure, contexte), rapporté seulement.

Le système n'accède qu'aux fichiers du § 2.1. La vérité est écrite dans un fichier séparé, lu seulement par
l'évaluateur. Un test remplace la vérité par un mandataire qui lève une exception si le système y touche, comme pour
GALILÉE (`world.secret`).

### 2.3 Le générateur : des primitives, pas des métiers

Une entreprise est composée à partir de primitives génériques. Aucune n'est un métier ; un archétype est une
combinaison de primitives avec des distributions de paramètres.

**Stocks** : trésorerie (1 à 2 comptes) · objets stockés (2 à 30) · créances clients · dettes fournisseurs ·
contrats actifs · heures disponibles.

**Flux** :

| Primitive | Mouvements de conservation | Enregistrements produits |
|---|---|---|
| achat | fournisseur → objet (quantité) ; dette (montant), puis trésorerie → fournisseur à un délai tiré | commande, réception, facture, paiement (certains absents selon l'archétype) |
| vente | objet → client (quantité) ; créance, puis encaissement, ou paiement comptant | ticket ou facture, encaissement, éventuel avoir |
| transformation | objets A, B → objet C, selon une recette cachée | sortie de A et B, entrée de C |
| contrat | entrée et sortie de contrats ; prélèvement périodique | souscription, résiliation, prélèvements, échecs de prélèvement |
| temps de travail | heures → production ou service ; salaires | relevés d'heures, paie, charges sociales |
| charge fixe | trésorerie → extérieur, périodique | facture et paiement |
| financement | emprunt, remboursement, intérêts | virements |

**Leviers** (pour la vérité de M1 et le réalisme) : prix par objet, constants par morceaux ; quantités commandées
selon une règle de réapprovisionnement **qui réagit au stock** (donc endogène) ; effectif ; dépense de publicité.
**Mesures** : demande (poisson, sensible au prix, au jour de la semaine et à la publicité), souscriptions, résiliations.

**Flux cachés** (aucun enregistrement) :

| Nature | Effet sur la conservation |
|---|---|
| démarque | un objet stocké diminue à un débit constant, à partir d'un jour τ |
| remise non saisie | une part des encaissements d'une contrepartie est inférieure à la facture, sans avoir |
| frais non saisis | la trésorerie diminue de petits montants réguliers, sans écriture |
| perte de transformation | la recette réelle consomme plus que la recette observée sur les premiers mois, à partir de τ |

Chaque flux caché a une **force** tirée de sorte que son effet cumulé sur l'année représente entre 0,5 % et 5 % du
flux du stock touché. Un flux caché qui ne dépasse pas l'écart-type du bruit des relevés sur l'année est classé
« sous le seuil » et n'entre pas dans le critère de rappel (il est rapporté à part).

**Désordre des données**, à deux niveaux :

| | propre | réaliste |
|---|---|---|
| références manquantes | 5 % | 35 % |
| références fausses | 0 % | 3 % |
| retard d'enregistrement | 0 à 1 jour | 0 à 10 jours |
| doublons | 0 % | 1 % |
| paiements fractionnés ou groupés | non | oui |
| arrondis et erreurs de saisie de quantité | non | 0,5 % des lignes |
| erreur des relevés d'inventaire | 0 | 1 % de l'inventaire |

### 2.4 Archétypes

**Développement** (écrits avant le gel) :
- **négoce** : achat, vente, charges fixes ; 5 à 30 objets ;
- **abonnement** : contrats, charges fixes, temps de travail, quelques ventes ponctuelles ;
- **service** : temps de travail facturé, créances, charges fixes.

**Test** (écrits **après** le gel ; seule leur description est fixée ici) :
- **transformation** : recettes cachées, plusieurs étapes, avec stocks intermédiaires ;
- **acompte** : paiement partiel avant livraison différée, solde à la livraison, annulations.

La vérification `git diff <gel> <test> -- src/bilan` doit être vide.

### 2.5 Répartition des graines de test

300 entreprises, graines 5001 à 5300. Classe tirée par la graine :

| graine mod 6 | archétype | flux cachés |
|---|---|---|
| 0, 1 | développement, tiré au hasard | 0 (**placebo**) |
| 2, 3 | développement | 1 ou 2 |
| 4 | transformation | 0, 1 ou 2 |
| 5 | acompte | 0, 1 ou 2 |

Le niveau de désordre est « réaliste » pour toutes les graines de test. Les 100 placebos des classes 0 et 1 servent
au contrôle des fausses détections.

---

## 3. Ce que le système doit produire

Une **déclaration de corps** (fichier JSON), au format de `CORTEX/src/bodies` enrichi :

1. pour chaque enregistrement : un **type de flux** (étiquette libre) et ses **liens** vers d'autres enregistrements
   (même mouvement vu d'un autre côté) ;
2. une liste de **stocks**, chacun avec une unité (euros, quantité d'un objet, contrats, heures) et une série
   quotidienne reconstruite ;
3. la **matrice d'incidence** : pour chaque type de flux, le stock qu'il débite, le stock qu'il crédite, et le champ
   (montant ou quantité) qui porte le débit ;
4. le **profit quotidien** reconstruit, défini par la conservation : variation des actifs nets, hors financement ;
5. des **écarts de conservation** déclarés : stock touché, jour de début, débit estimé, et la preuve associée ;
6. un typage candidat des séries (levier, mesure, contexte), rapporté seulement.

---

## 4. Méthodes comparées

- **Bilan** : le système développé pour M0.
- **Plan naïf** : type de flux = (source, signe du montant, présence d'une quantité) ; liens = le seul champ
  `reference` ; stocks = un par source et par objet ; aucun écart déclaré. C'est ce qu'on obtient en lisant les
  données sans loi de conservation.
- **Oracle d'appariement** (plafond, rapporté sans critère) : le système reçoit les vrais liens et doit seulement
  reconstruire stocks, incidence et écarts. Il mesure la part de l'échec qui vient de l'appariement.

---

## 5. Métriques

Toutes sont calculées par l'évaluateur, après l'exécution, à partir de la vérité.

| Code | Métrique | Définition |
|---|---|---|
| **F** | regroupement des flux | F1 « B-cubé » entre types prédits et vrais types, sur les enregistrements (insensible aux noms des étiquettes) |
| **F équilibré** | regroupement des flux, chaque vrai type pesant autant | moyenne, sur les vrais types, du F1 « B-cubé » calculé sur les seuls enregistrements de ce type *(ajouté, voir § 9, points 3 et 5)* |
| **L** | appariement | F1 sur les paires d'enregistrements liés (clôture transitive des liens, de part et d'autre) |
| **G** | graphe | les stocks prédits sont associés aux vrais stocks par appariement hongrois (même unité, corrélation maximale des séries) ; F1 sur les arêtes de l'incidence ainsi traduites |
| **S** | stocks | médiane, sur les stocks associés, de l'erreur absolue moyenne de la série rapportée à l'amplitude de la vraie série |
| **P** | profit | erreur absolue moyenne du profit mensuel reconstruit, rapportée au chiffre d'affaires mensuel moyen |
| **R** | rappel des flux cachés | un flux caché est **détecté** si un écart déclaré porte sur le stock associé, avec un début à ± 21 jours et un débit à ± 50 % |
| **FD** | fausses détections | écarts déclarés qui ne correspondent à aucun flux caché (y compris ceux « sous le seuil »), par entreprise |

---

## 6. Hypothèses et critères (fixés d'avance)

Moyennes sur les 300 entreprises de test sauf mention contraire ; intervalles de confiance à 95 % appariés par graine.

| | Critère | Seuil |
|---|---|---|
| **M0-F** | regroupement des flux | **F équilibré** moyen ≥ 0,90, **et** supérieur au plan naïf (IC95 > 0) *(amendé, voir § 9, point 5)* |
| **M0-L** | appariement | L moyen ≥ 0,85, **et** supérieur au plan naïf (IC95 > 0) |
| **M0-G** | graphe | G moyen ≥ 0,85 |
| **M0-S** | stocks | S médian ≤ 2 % |
| **M0-P** | profit | P médian ≤ 2 % |
| **M0-R** | flux cachés au-dessus du seuil | rappel ≥ 70 % |
| **M0-FD1** | placebos : part des entreprises avec au moins une fausse détection | ≤ 10 %, et borne haute de Wilson ≤ 15 % |
| **M0-FD2** | entreprises à flux cachés : fausses détections | ≤ 0,10 par entreprise |
| **M0-T** | archétypes de test seuls (transformation, acompte) | F ≥ 0,80 et R ≥ 50 %, chacun |

**Rapporté sans seuil** : chaque métrique par archétype et par nature de flux caché ; l'oracle d'appariement ; les flux
« sous le seuil » détectés ; l'exactitude du typage des séries (préparation de M1) ; le temps de calcul par
entreprise.

**Critère d'abandon** : si le F équilibré moyen < 0,70 *(amendé, voir § 9, point 5)*, ou si FD1 dépasse 25 %, le bilan de matière est rejeté sous cette forme, et
je le publie. LAVOISIER devrait alors recevoir son corps déclaré par un humain (comme CORTEX), ce qui change sa nature
et devra être dit dans `CONCEPTION.md`.

---

## 7. Garanties contre l'auto-illusion

1. **Pas de fuite par les noms** : jetons et vocabulaires tirés au hasard ; un test d'audit vérifie que le code du
   bilan ne contient aucun mot de métier (sur le modèle de `CORTEX/test/audit.test.js`).
2. **Pas d'accès à la vérité** : mandataire qui lève une exception (§ 2.2).
3. **Archétypes de test écrits après le gel**, diff vide sur `src/bilan`.
4. **Exécution unique** sur les graines 5001 à 5300. Aucun réglage après l'exécution. Une erreur de l'évaluateur (et
   non du système) découverte après coup est corrigée, signalée, et les deux résultats sont publiés.
5. **Placebos** : un tiers des entreprises de test n'ont aucun flux caché.
6. **Les échecs sont publiés** avec le même niveau de détail que les succès, comme dans les bancs de GALILÉE et de
   CORTEX.

---

## 8. Choix de conception laissés au développement

Le protocole fixe ce qui est mesuré, pas comment le système y parvient. Pour mémoire, les pistes prévues par
`CONCEPTION.md` :

- appariement par optimisation sous contraintes de conservation (montants et quantités qui se compensent, délais
  plausibles), en se servant de `reference` comme indice et non comme vérité ;
- types de flux comme classes de paires qui se compensent de la même façon ;
- détection des écarts par un **pari** sur les résidus (stock relevé moins stock intégré), dans l'esprit du pari
  invariant de CORTEX v6 : modèle nul « aucun flux caché, bruit de relevé et retards seulement », alternative
  « débit constant à partir de τ », seuil fixé pour un risque de fausse détection α = 0,10 par entreprise.

---

## 9. Journal de développement

(Graines 1 à 100 seulement. Chaque changement de méthode y est daté et justifié. Les hypothèses, seuils et mondes du
§ 6 ne changent pas.)

**1. Banc d'essai écrit (avant le bilan de matière).** Générateur `src/bench/` (moteur, trois archétypes de
développement, flux cachés calibrés en deux passes), évaluateur `src/bench/evaluate.js`, plan naïf
`src/methods/naive.js`, 14 tests (`npm test`) :
- conservation exacte sans flux caché, et flux cachés seule source d'écart, sur données propres ;
- aucun mot de métier dans les données observées ;
- vérité scellée pendant l'exécution du système ;
- une prédiction parfaite construite à partir de la vérité obtient des métriques idéales.

**2. Format de l'incidence.** L'évaluateur lit la matrice d'incidence (§ 3, point 3) à partir des Δ portés par chaque
enregistrement, plutôt qu'à partir d'une matrice par type : un type touche un stock avec un signe si l'un de ses
enregistrements y porte un Δ de ce signe. C'est équivalent et cela permet les types qui touchent un stock par objet.
Les métriques et seuils sont inchangés.

**3. Constat sur le critère M0-F : le plan naïf l'atteint déjà.** Sur les 100 graines de développement, le plan naïf
obtient **F = 0,973 ± 0,004** (`bench/DEV_M0_REFERENCES.md`). Le F « B-cubé » est pondéré par le nombre
d'enregistrements, donc dominé par les types les plus volumineux (tickets de caisse, prélèvements, relevés
d'heures), que la seule source suffit à isoler. Le seuil absolu de 0,90 ne mesure donc presque rien ; la seconde
moitié du critère (« supérieur au plan naïf, IC95 > 0 ») reste exigeante. Le critère d'abandon F < 0,70 est, lui
aussi, peu informatif. **Les critères pré-enregistrés ne sont pas modifiés.** J'ajoute, rapportée **sans seuil**, une
variante équilibrée où chaque vrai type pèse autant (« F équilibré ») : le plan naïf y obtient 0,690 ± 0,019. Décision
ouverte, à prendre avant tout développement du bilan : amender M0-F et le critère d'abandon pour qu'ils portent sur
la variante équilibrée, en le signalant comme amendement daté, ou les garder tels quels.

**4. Références de développement** (plan naïf, 100 graines) : L = 0,322 (0,836 sur l'abonnement, où les références
suffisent souvent ; 0,012 sur le service, où une facture regroupe un mois d'heures), G = 0,090, S médian 32 %,
P médian 85 %, aucun flux caché détecté, aucune fausse détection.

---

**5. Amendement daté (13 novembre 2026), avant toute ligne du bilan de matière.** Suite au point 3, le critère M0-F
et le critère d'abandon portent désormais sur le **F équilibré**, et non plus sur le F pondéré par le volume. Seuils
inchangés (0,90 et 0,70). Le F pondéré reste rapporté. Motif : le F pondéré était atteint par le plan naïf (0,973) et
ne mesurait donc pas la capacité testée. Le changement a été décidé alors qu'aucun résultat du bilan n'existait ;
il ne peut donc pas avoir été choisi pour le favoriser. Il reste signalé ici comme une déviation au protocole initial.

**6. Générateur : retards réservés aux saisies humaines.** Les enregistrements produits par un système automatique
(caisse, prélèvements, souscriptions en ligne) sont horodatés au jour réel ; seuls ceux saisis par une personne
peuvent arriver jusqu'à 10 jours en retard. C'est plus réaliste qu'un retard appliqué à tout ce qui n'est pas
bancaire. Changement du banc, fait avant le bilan ; les références du plan naïf sont recalculées.

**7. Première version du bilan de matière** (`src/bilan/`, non gelée). Quatre étapes, sans mot de métier (audit
`test/bilan.test.js`) :
- **types** : forme de l'enregistrement, puis vocabulaire des libellés (mots communs écartés, mots regroupés par
  co-occurrence et par contrepartie) ;
- **liens** : règles apprises des références (paires de types, délais, égalité de montant, de quantité, de
  contrepartie, d'objet), puis recherche des liens manquants, regroupements, fractionnements, agrégations d'un jour
  et par objet ;
- **stocks** : comptes de trésorerie reconnus à leur relevé quotidien ; incidence des quantités sur les relevés
  mensuels par une régression commune à tous les objets (coefficients dans {−1, 0, 1}) ; stocks en cours révélés par
  les liens avec la trésorerie ; financement ; profit par variation de l'actif net ;
- **écarts** : résidu exact des comptes quotidiens ; perte régulière sur les relevés mensuels (rapport de
  vraisemblance ≥ 22 contre « pas de perte », meilleur qu'un saut et qu'une erreur de typage) ; soldes à taux
  constant inférieur à 1 pour une contrepartie.

Choix faits en développement, consignés :
- deux types liés portant la même quantité (une intention, puis son exécution) : le mouvement de stock est attribué
  au plus tardif tant que l'erreur reste du même ordre (×1,6), car les retards de saisie rendent les dates
  trompeuses ;
- les doublons ne sont jamais cherchés dans un relevé bancaire.

**Résultats de développement** (`bench/DEV_M0_BILAN.md`, 100 graines, propres et réalistes mêlées ; indicatifs, ce
ne sont pas des résultats de test) :

| | Seuil | Toutes graines | Désordre réaliste seul (comme au test) |
|---|---|---:|---:|
| F équilibré | ≥ 0,90 et > naïf | 0,935 (naïf 0,690 ; +0,245 ± 0,016) ✅ | 0,925 ✅ |
| L | ≥ 0,85 et > naïf | 0,857 (+0,535 ± 0,099) ✅ | 0,825 ❌ |
| G | ≥ 0,85 | 0,908 ✅ | 0,840 ❌ |
| S médian | ≤ 2 % | 2,4 % ❌ | 13,0 % ❌ |
| P médian | ≤ 2 % | 15,5 % ❌ | 13,6 % ❌ |
| R | ≥ 70 % | 72/95 = 76 % ✅ | 29/46 = 63 % ❌ |
| FD1 placebos | ≤ 10 % | 1/34 ✅ | 1/17 ✅ |
| FD2 | ≤ 0,10 | 0,21 ❌ | 0,30 ❌ |

Lecture : **sur des données réalistes, ce bilan échouerait aujourd'hui à la plupart des critères.** Causes
identifiées, à traiter avant tout gel :
1. **Profit (P)** : les pièces saisies en fin de mois arrivent le mois suivant (retards), et le profit est jugé mois
   par mois ; sur l'archétype service, presque tout le chiffre d'affaires est facturé le dernier jour.
2. **Stocks (S)** : les stocks d'objets sont reconstruits aux dates de saisie, en retard de 0 à 10 jours sur les
   mouvements réels ; les heures en cours souffrent du même défaut.
3. **Fausses détections (FD2)** : sur les décomptes exacts, quelques enregistrements mal typés (bruit de libellé)
   suffisent à créer une dérive que la détection prend pour une perte. L'explication « erreur de typage » ne la
   capte pas encore.
4. **Appariement réaliste (L)** : l'abonnement réaliste (0,77) perd des liens quand des types se confondent.

Rien n'est gelé. Les seuils ne sont pas modifiés.

**8. Dates réelles, doublons et lots censurés** (développement, non gelé). Une expérience de diagnostic
(`scripts/dev-oracle-dates.mjs`, qui donne délibérément au bilan les vraies dates, jamais utilisée comme méthode) a
montré que les retards de saisie expliquaient l'essentiel de l'erreur sur les stocks (S médian réaliste 12,4 % →
2,1 % avec les vraies dates) et la moitié de celle sur le profit (13,9 % → 7,2 %). Ajouts, tous fondés sur la
conservation ou le calendrier :
- `dates.js` : lots de fin de mois redatés à la fin de mois ; décalage moyen de saisie par type estimé sur les
  relevés mensuels ; une entrée saisie en retard est ramenée au jour où, sans elle, un stock relevé deviendrait
  négatif ; un lot de fin d'année saisi après la fin des données est estimé (moyenne des trois derniers), pour le seul
  calcul des stocks et du profit, sans apparaître dans la déclaration ;
- doublons révélés par un surplus d'agrégation journalière égal à une pièce qui a une jumelle ;
- erreurs de saisie de quantité arbitrées par le relevé, quand une pièce et sa pièce liée ne s'accordent pas ;
- règle d'appariement retenue aussi quand elle couvre une bonne part du type cible (les cotisations, minoritaires
  dans un type bancaire fusionné, perdaient leur stock en cours) ;
- coût unitaire des objets : un test de signe faux l'annulait, et l'actif net ignorait les stocks d'objets ;
- vocabulaire commun plus strict (un mot de bruit fréquent dans deux petits groupes passait pour commun) ;
- le mouvement d'un couple intention/exécution est porté par le plus tardif tant que l'erreur ne dépasse pas le
  triple (au lieu de ×1,6).

Résultats de développement après ces ajouts (`bench/DEV_M0_BILAN.md`) :

| | Seuil | Toutes graines | Réaliste seul (comme au test) |
|---|---|---:|---:|
| F équilibré | ≥ 0,90 et > naïf | 0,934 (+0,244 ± 0,017) ✅ | 0,923 ✅ |
| L | ≥ 0,85 et > naïf | 0,856 (+0,534 ± 0,100) ✅ | 0,824 ❌ |
| G | ≥ 0,85 | 0,918 ✅ | 0,854 ✅ (de justesse) |
| S médian | ≤ 2 % | 1,6 % ✅ | 6,1 % ❌ |
| P médian | ≤ 2 % | 3,8 % ❌ | 6,1 % ❌ |
| R | ≥ 70 % | 70/95 = 74 % ✅ | 29/46 = 63 % ❌ |
| FD1 placebos | ≤ 10 % | 1/34 ✅ | 1/17 ✅ |
| FD2 | ≤ 0,10 | 0,20 ❌ | 0,30 ❌ |

Le profit (P) passe de 15,5 % à 3,8 % et les stocks (S) de 2,4 % à 1,6 %. Sur données réalistes, quatre critères
échoueraient encore ; le négoce porte l'essentiel de l'erreur sur les stocks et le profit (7,6 % et 6,5 %), et
l'abonnement celle de l'appariement (0,77) et des fausses détections. Rien n'est gelé ; les seuils sont inchangés.

**9. Début des écarts sur un stock en cours** (développement, non gelé). Diagnostic sur les 100 graines : 9 des
14 fausses détections étaient de vrais flux cachés, trouvés avec un début beaucoup trop tardif (jusqu'à 200 jours),
donc comptés à la fois comme fausse détection et comme flux manqué. Cause : la suite finale de soldes au même taux
s'arrêtait au premier solde isolé à un autre taux (pièce mal appariée, erreur de saisie). Corrections dans
`ecarts.js`, sans connaissance de métier :
- le taux retenu est le plus fréquent parmi les soldes partiels, et il doit encore tenir dans les trois derniers ;
- en remontant le temps, un solde isolé à un autre taux est toléré ; deux de suite marquent le régime d'avant ;
- le début est placé au milieu entre le dernier solde de l'ancien régime et le premier du nouveau (pour un payeur
  mensuel, le premier solde réduit arrive jusqu'à un mois après le changement) ;
- le manque des soldes isolés est estimé au taux retenu.

| | Seuil | Avant | Après (toutes graines) | Après (réaliste seul) |
|---|---|---:|---:|---:|
| R | ≥ 70 % | 70/95 = 74 % | 80/95 = 84 % ✅ | 37/46 = 80 % ✅ |
| FD2 | ≤ 0,10 | 0,20 ❌ | 0,08 ✅ | 0,12 ❌ |
| FD1 placebos | ≤ 10 % | 1/34 | 1/34 ✅ | — |
| P médian | ≤ 2 % | 3,8 % ❌ | 3,8 % ❌ (inchangé) | — |

Les autres métriques sont inchangées. Restent hors seuil : le profit (P), et sur données réalistes S, L et encore FD2 (0,12). Les cinq
fausses détections restantes viennent des décomptes de l'abonnement (4) et d'un début estimé 23 jours trop tôt (1).
Réserve : ces règles sont mises au point sur les graines de développement ; seul le test dira si elles tiennent.
Test de non-régression ajouté (`test/bilan.test.js`, graine 21). Rien n'est gelé ; les seuils sont inchangés.

*Note de fusion.* Ce point a été mesuré sur une branche partie avant la fusion de la PR n° 6. Sur la branche
principale qui réunit les deux (`bench/DEV_M0_BILAN.md`) : FD2 0,09 sur toutes les graines et 0,15 sur données
réalistes seules ; R 80/95 et 37/46 ; G 0,939 ; P médian 3,8 %. Le tableau ci-dessus reste celui de la branche seule.

10. **Groupe lié mêlant deux sens (14 novembre 2026).** Sur la graine de développement 1, l'erreur de profit
atteignait 178 % : un seul stock en cours réunissait des pièces soldées par des entrées d'argent et des pièces
soldées par des sorties, et l'étiquette unique, au sens majoritaire, comptait les premières avec le mauvais signe
dans l'actif net. Règle ajoutée dans `src/bilan/stocks.js` : le sens d'un type de pièces se lit sur les seules
lignes du compte relevé réellement liées à ses pièces ; un groupe n'est scindé en deux stocks que si ses types
divergent, et chaque ligne du compte relevé suit alors les pièces auxquelles elle est liée. Un groupe homogène est
traité exactement comme avant.

Une première version, qui scindait tout groupe selon le signe de chaque ligne du compte relevé, a été mesurée puis
retirée : elle réparait la graine 1 mais détachait des lignes de sens contraire appartenant au même stock sur 30
autres graines (G moyen 0,939 → 0,898), sans rien gagner sur le profit.

| | Seuil | Avant | Après |
|---|---|---:|---:|
| Graine 1 : P | — | 178 % | 42 % |
| Graine 1 : G | — | 0,36 | 0,76 |
| G moyen (100 graines) | — | 0,939 | 0,943 |
| P médian (100 graines) | ≤ 2 % | 3,8 % ❌ | 3,8 % ❌ (inchangé) |

Quatorze graines sur cent changent ; hors la graine 1, les écarts sont inférieurs au millième. F, L, S, R, FD1 et
FD2 sont inchangés. Ce correctif retire un cas extrême, il ne rapproche pas le profit médian de son seuil : la cause
de l'erreur médiane reste à trouver. Test de non-régression ajouté (`test/bilan.test.js`, graine 1). Rien n'est gelé.

11. **Décomposition de l'erreur de profit et premier correctif (14 novembre 2026).** L'écart de profit a été
décomposé enregistrement par enregistrement sur les 100 graines de développement (recomposition exacte). Il n'a pas
une cause unique mais trois, dont la part dépend de la classe :

| Mécanisme | Classe où il domine | P médian si ce seul mécanisme était exact |
|---|---|---:|
| A. Enregistrements au libellé brouillé, ou isolés dans un type minuscule : reliés à aucun stock en cours, ils sortent de l'actif net | abonnement | 3,75 % → 2,27 % |
| B. Pièces comptées dans le mauvais mois (jour estimé ≠ jour réel) | négoce | 3,75 % → 1,97 % |
| C. Écarts cachés détectés mais non retirés du profit | service | mesuré hors code : 3,75 % → 2,90 % |

Ces parts se compensent en partie et ne s'additionnent pas.

Règle ajoutée pour A (`adoptCounterpartType`, `src/bilan/types.js`) : après l'apprentissage des liens, un tel
enregistrement prend le type que portent nettement (75 % et au moins 2) les autres enregistrements de sa
contrepartie dans le même groupe de forme. Les règles de liens restent apprises sur les types d'origine : une
première variante, appliquée avant, faisait apprendre des règles sur trop peu de références (graine 88 : L 0,999 →
0,198) et a été rejetée.

| | Seuil | Avant | Après |
|---|---|---:|---:|
| P médian | ≤ 2 % | 3,75 % ❌ | 2,89 % ❌ |
| S médian | ≤ 2 % | 1,58 % ✅ | 1,09 % ✅ |
| F équilibré | ≥ 0,90 | 0,934 ✅ | 0,944 ✅ |
| G | ≥ 0,85 | 0,943 ✅ | 0,941 ✅ |
| L | ≥ 0,85 | 0,856 ✅ | 0,856 ✅ |
| R | ≥ 70 % | 80/95 ✅ | 80/95 ✅ |

Par classe, P médian : abonnement 4,3 % → 4,1 % ; service 1,6 % → 0,9 % ; négoce 5,6 % → 5,5 %. 29 graines gagnent
plus de 0,005 de P ; 2 en perdent autant (66 et 91). G baisse de plus de 0,01 sur 10 graines : la règle confond
deux types de même forme et de même contrepartie (53 réaffectations fausses sur 234). Les seuils 3 et 75 % n'ont
été essayés qu'une fois. Mesures faites deux fois, par l'enquête sur copie privée puis sur ce dépôt : identiques.

Reste à faire, non écrit : retirer du profit les écarts déclarés (C) ; mieux dater les réceptions (B), dont une part
en données propres tient à un retard de saisie d'un jour sans régularité exploitable. Le seuil de profit n'est pas
atteint. Rien n'est gelé.

12. **Retirer de l'actif net le manque des écarts déclarés sur un stock en cours (14 novembre 2026, écrit avant le
    code).** Mesure préalable hors code, par un oracle qui retire du profit, au jour près, les pertes vraies d'un
    seul mécanisme, sur les 100 graines de développement : P médian 2,89 % → 2,27 % si le mécanisme C du point 11
    était exact. Le chiffre de 0,85 point donné au point 11 datait d'avant son correctif ; il vaut 0,62 point.
    Par classe : service 0,85 → 0,49 %, abonnement et négoce inchangés (4,08 et 5,53 %). Le même oracle sur les deux
    autres natures de flux caché ne gagne rien. Conclusion anticipée : C seul ne fait pas passer P sous 2 %.

    Changement prévu (`src/bilan/ecarts.js`, `src/bilan/stocks.js`, `src/bilan/index.js`) : quand l'étape 3 des
    écarts déclare qu'une contrepartie solde ses opérations à un taux constant ρ < 1 à partir d'une date, la part non
    soldée de chacune des opérations du régime soldées à ce taux est retirée du stock en cours au jour du solde, puis
    la série de ce stock et le profit mensuel sont recalculés. Les opérations isolées à un autre taux ne sont pas
    touchées. Justification : un écart déclaré dit que la part non soldée ne reviendra jamais ; la laisser dans le
    stock compte comme actif ce qui a disparu. Aucun seuil nouveau.

    Attendu : P médian entre 2,3 et 2,5 % (le gain ne peut dépasser l'oracle) ; service vers 0,5 % ; S médian
    inchangé ou meilleur ; F, L, G, R, FD1, FD2 inchangés, puisque ni la déclaration des écarts ni l'incidence ne
    bougent. Travail préparé sur une copie privée, graines 1 à 100 seulement ; résultat ci-dessous après
    vérification sur le dépôt.

    **Résultat, vérifié sur ce dépôt** (`npm run bench:dev`, `bench/DEV_M0_BILAN.md`) : P médian 2,89 % → **2,27 %**,
    égal à l'oracle ; service 0,85 → 0,49 % ; S médian 1,09 → 0,68 % ; F équilibré 0,944, L 0,856, G 0,941, R 80/95,
    FD1 1/34, FD2 0,09 : inchangés. Abonnement (4,08 %) et négoce (5,53 %) ne bougent pas, comme attendu.
    **Le seuil de 2 % n'est pas atteint.** Sur le seul désordre réaliste, P reste à 5,1 % : c'est la condition du
    test, et rien ici ne la touche. Test de non-régression ajouté (graine de développement 14).

13. **Trois essais sur le mécanisme B, non retenus (14 novembre 2026).** Mesurés sur la copie privée seulement,
    non refaits sur ce dépôt. Un oracle « vraies dates » ramène le négoce de 5,53 % à 1,03 % : le mécanisme B reste
    l'essentiel de l'erreur. Essais : (a) abaisser de 3 jours à 1 le seuil à partir duquel une pièce est redatée par
    le délai de son solde ; (b) de deux pièces identiques, tenir pour copie celle qu'aucune pièce d'une autre source
    ne cite ; (c) ramener au jour d'un relevé mensuel une pièce saisie juste après et dont la quantité explique
    l'écart. Ensemble : P médian 1,48 % sur les 100 graines, R 78/95, FD2 0,09. **Écartés, pour trois raisons** :
    le gain porte presque entièrement sur le désordre propre (1,9 → 0,5 %) et pas sur le réaliste (5,1 → 5,0 %),
    seule condition du test ; (a) seul franchit deux garde-fous (FD1 2/34, FD2 0,106) et ne tient qu'avec (b) et
    (c) ; (c) a été conçu en regardant une seule graine et masque de petites pertes réelles (trois détections justes
    perdues, une gagnée). Passer sous 2 % sur le lot de développement par ce chemin aurait été un seuil franchi sans
    que le moteur soit meilleur là où il sera jugé. Reste à faire : redater les pièces du désordre réaliste, dont
    le solde est regroupé ou fractionné, et celles qui n'ont aucun ancrage exact.

14. **Redater une à une les entrées d'un stock relevé chaque mois (15 novembre 2026, écrit avant le code).**
    Diagnostic sur les 17 graines de développement du troisième archétype en désordre réaliste (P médian 7,34 %,
    S médian 10,67 %), par un oracle qui donne leur vraie date à une seule famille de pièces : les entrées de stock
    saisies à la main → S 2,71 %, P 5,46 % ; les pièces soldées par une entrée de trésorerie → P 7,13 % ; celles
    soldées par une sortie → P 6,66 % ; toutes les dates → S 0,88 %, P 1,93 %. Sur la graine 21, 32 entrées de
    stock sur 279 sont dans le mauvais mois avant comme après la datation actuelle : l'étape 2 ne sait appliquer
    qu'un décalage commun à tout un type, et ne corrige donc aucune pièce en particulier.

    Changement prévu (`src/bilan/dates.js`, nouvelle étape 4, après les étapes 2 et 3) : sur chaque stock relevé
    chaque mois, pour chaque relevé encadré par deux autres, on compare la variation relevée à la variation
    enregistrée, avant et après ce relevé. Une pièce non ancrée par un lien exact, saisie dans les 10 jours qui
    suivent le relevé, est ramenée au jour du relevé **si ce déplacement réduit à la fois l'écart de la période qui
    précède et celui de la période qui suit**. Symétriquement, une pièce que l'étape 2 a avancée avant le relevé
    alors qu'elle a été saisie après est remise au lendemain du relevé, à la même condition. Aucun seuil, aucune
    tolérance réglable.

    Justification : une entrée produite avant un relevé et saisie après manque au relevé d'avant et se retrouve en
    trop dans la variation d'après, de la même quantité. Une perte réelle ne fait jamais cela : elle manque aux deux
    périodes et ne se rattrape pas ; elle ne peut donc pas satisfaire la condition, et la règle ne peut pas la
    masquer (c'était le défaut de l'essai (c) du point 13, qui n'exigeait qu'un seul écart expliqué).

    Attendu : sur le troisième archétype en désordre réaliste, S médian entre 2,7 % (l'oracle) et 6 %, P médian
    entre 5,5 % et 6,8 % ; sur le désordre réaliste entier, S médian sous 2 %, P médian entre 4,5 et 5,0 % ; sur les
    100 graines, P médian à peu près inchangé (2,2 à 2,3 %), car la médiane générale est portée par les deux autres
    archétypes. Garde-fous sur les 100 graines : R au moins 76/95, FD2 au plus 0,10, FD1 au plus 1/34, F équilibré,
    L et G sans baisse de plus de 0,005, S médian sans hausse. Limite connue : le dernier relevé de l'année n'a pas
    de période suivante, la règle ne s'y applique pas. Le seuil de 2 % sur P ne sera pas atteint par ce seul point.

    **Constat à la première mesure, et complément écrit avant de le coder.** L'étape 4 appliquée seule ne change
    presque rien (troisième archétype réaliste : S 10,67 → 9,45 %, P 7,34 → 7,33 %). Cause : sur certaines graines
    (15 et 21 parmi onze regardées), le premier passage ne trouve **aucune incidence** des types sur les stocks
    relevés — les retards de saisie font que « ne rien attribuer » explique mieux les variations mensuelles que la
    bonne attribution — et les étapes 2, 3 et 4, qui ont besoin de cette incidence, ne s'exécutent pas. Le second
    passage, lui, la trouve. Complément prévu (`src/bilan/index.js`) : **un second tour** — les dates sont
    réestimées avec l'incidence trouvée au second passage, puis les stocks recalculés. Justification : les dates ont
    besoin de l'incidence et l'incidence a besoin des dates ; un seul aller ne suffit pas quand le premier passage
    est aveugle. Mesure préalable hors du dépôt, sur les 17 mêmes graines : P médian 7,33 → 5,90 % (graine 21 :
    8,9 → 2,0 %), S médian 9,45 → 9,15 %. L'attente sur P (5,5 à 6,8 %) serait tenue ; **celle sur S (2,7 à 6 %) ne
    le sera pas** : l'étape 4 ne déplace que les pièces qui franchissent un relevé, alors que S se joue aussi au jour
    près à l'intérieur du mois. Mêmes garde-fous sur les 100 graines.

    **Résultat sur ce dépôt (banc complet, 100 graines) : non retenu.** Deux garde-fous sont franchis, dans les
    deux variantes :

    | | Avant (point 12) | Étape 4 seule | Étape 4 et second tour | Garde-fou |
    |---|---:|---:|---:|---|
    | P médian, tout | 2,27 % | **1,85 %** | **1,85 %** | — |
    | P médian, désordre réaliste | 5,08 % | 4,37 % | 3,81 % | — |
    | P médian, troisième archétype réaliste | 7,34 % | 7,33 % | 5,90 % | — |
    | S médian, tout | 0,68 % | 0,68 % | 0,68 % | sans hausse ✅ |
    | R | 80/95 | 84/95 | 82/95 | ≥ 76/95 ✅ |
    | F équilibré · L · G | 0,944 · 0,856 · 0,941 | inchangés | inchangés | ✅ |
    | FD1, placebos touchés | 1/34 | **2/34** | **2/34** | ≤ 1/34 ❌ |
    | FD2, par entreprise à flux cachés | 0,09 | **0,15** | **0,17** | ≤ 0,10 ❌ |

    La datation fait bien ce qu'on attendait d'elle : le profit passe sous 2 % sur les 100 graines et quatre flux
    cachés de plus sont retrouvés. Mais huit fausses détections apparaissent, toutes sur des stocks d'objets du
    troisième archétype (graines 24, 39, 57, 72, 75 deux fois, 84, 88 ; la graine 21 s'y ajoute avec le second
    tour). Le code est donc **retiré** de `src/bilan/` ; il est conservé, non appliqué, dans
    `bench/essais/point14-etape4.patch`. Le seuil de 2 % atteint ici ne compte pas : il est payé par des fausses
    alertes, et sur le désordre réaliste P reste à 3,8 % au mieux.

    Cause probable des fausses détections, **non vérifiée** : la détection d'un manque sur un stock d'objets se
    règle sur la dispersion de la série elle-même ; une série nettoyée de ses pièces mal datées devient assez lisse
    pour que de petits défauts restants passent pour des manques — en particulier dans la dernière période, où des
    sorties saisies après la fin des données manquent au journal (sur la graine 21 : un « manque » de 1,4 unité par
    jour à partir du jour 326). Prochain pas, avant de réappliquer ce point : rendre la détection insensible à la
    propreté de la série et à la censure de fin d'année, puis remesurer.

    Autre constat à garder : sur certaines graines réalistes, le premier passage ne trouve aucune incidence des
    types sur les stocks relevés, et aucune des étapes de datation par quantités ne s'exécute.

    **Diagnostic des fausses détections (15 novembre 2026), qui corrige l'hypothèse ci-dessus.** Règle réappliquée
    le temps d'une lecture, puis retirée ; graines 24, 39, 57, 72, 75, 84, 88. Les manques déclarés à tort sur des
    stocks d'objets ont des débits **minuscules** — 0,01 ; 0,02 ; 0,08 ; 0,19 ; 0,23 ; 0,37 ; 0,64 unité par jour —
    avec des rapports de vraisemblance de 29 à 60, et des débuts répartis sur toute l'année (jours 44, 152, 163,
    182, 183, 274, 332). Donc : (a) **la censure de fin d'année n'est pas la cause** — cette partie de l'hypothèse
    est réfutée ; (b) le reste tient : le critère de `ecarts.js` est un rapport de variances sur douze relevés,
    sans échelle absolue ; sur une série devenue presque exacte, une dérive de quelques unités dans l'année suffit
    à le franchir. Quatre de ces graines sont en désordre propre, où le relevé est exact. Ce qui manque est un
    critère de **matérialité** : un manque ne devrait être déclaré que s'il dépasse ce que les relevés permettent de
    mesurer. D'où vient la petite dérive résiduelle elle-même (déplacements erronés de l'étape 4, ou autre) n'est
    pas établi. La graine 39 est d'une autre nature : une fausse détection sur un stock en cours.

15. **Doublons : une répétition qui est la règle n'est pas une copie (15 novembre 2026).** Ordre réel des faits,
    pour ne pas le maquiller : la règle a d'abord été essayée dans l'arbre de travail, sur les graines de
    développement, puis décrite ici ; ce texte et le code sont poussés ensemble, après la mesure.

    *Cause première des fausses détections du point 14.* Sur la graine 72 (placebo, désordre propre), la série
    « relevé − reconstitué » d'un stock d'objets descend par marches de 16, 15 puis 9 unités : ce sont exactement
    des pièces légitimes, identiques à celle de la veille pour la même contrepartie, que l'étape des doublons
    retirait. Deux hypothèses avancées en route ont été réfutées par la mesure : la censure de fin d'année, puis un
    défaut de typage (aucune pièce qui bouge un stock n'a une incidence nulle sur ces graines).

    *Mesure de l'étape des doublons, 100 graines.* Sur les 50 graines propres, où il n'existe aucun doublon : 1 997
    pièces déclarées doublons, toutes à tort (1 941 sont des relevés d'heures identiques d'un jour sur l'autre).
    Sur les 50 réalistes : 9 629 déclarées, dont 3 930 ne sont pas la copie désignée par la vérité, pour 8 195
    copies présentes et 5 699 retrouvées. Réserve : une part de ces « fausses » est la bonne paire avec le mauvais
    membre désigné, ce qui revient au même pour les stocks.

    *Règle* (`src/bilan/links.js`). Une pièce identique à la précédente, à un jour près, n'est une copie que si
    elle arrive plus tôt que le rythme habituel de ce type pour cette contrepartie : le même jour, seulement s'il
    n'en vient d'ordinaire qu'une par jour ; le lendemain, seulement si ce type ne revient pas d'ordinaire d'un jour
    sur l'autre. « D'ordinaire » est une médiane sur les jours où la contrepartie a de telles pièces ; avec moins de
    quatre jours, le repère est la médiane des autres contreparties du même type. Second indice : une pièce citée
    en référence par une pièce d'une autre source n'est pas une copie ; deux pièces citées toutes deux sont deux
    pièces, et des deux la copie est celle qui n'est pas citée. Justification : un doublon est un accident de
    saisie, pas un rythme ; et seule l'originale est citée par la pièce qui la solde.

    *Résultat, vérifié sur ce dépôt* (`npm run bench:dev`, `bench/DEV_M0_BILAN.md`) :

    | | Avant | Après |
    |---|---:|---:|
    | Doublons déclarés à tort, graines propres | 1 997 | 744 |
    | Désordre réaliste : déclarés hors copie désignée / copies retrouvées sur 8 195 | 3 930 / 5 699 | 1 835 / 6 448 |
    | P médian, tout | 2,27 % | **2,14 %** |
    | P médian, désordre réaliste | 5,08 % | 4,97 % |
    | S médian · F équilibré · L · G | 0,68 % · 0,944 · 0,856 · 0,941 | inchangés |
    | R · FD1 · FD2 | 80/95 · 1/34 · 0,09 | inchangés |

    Aucun garde-fou n'est touché. Le seuil de 2 % sur P n'est pas atteint. Il reste 744 faux doublons en désordre
    propre (surtout des relevés d'heures au rythme irrégulier). Suite en cours : remesurer le point 14 par-dessus
    cette règle, pour savoir si les fausses détections venaient bien de là.

    **Point 14 remesuré par-dessus cette règle** (règle de datation réappliquée le temps de la mesure, puis
    retirée) : P médian 1,77 %, R 85/95, FD1 1/34, FD2 0,12. Trois des fausses détections du point 14 ont disparu
    (graines 24, 72 et 84) : elles venaient bien des faux doublons. Deux restent (graines 57 et 75, désordre
    réaliste), et FD2 dépasse encore le garde-fou de 0,10. Le point 14 reste donc non appliqué.

    *Erreur de manipulation, corrigée.* Le commit `84d5967` contenait par mégarde, dans `bench/dev-m0.json`, les
    résultats de cette mesure-ci (un banc lancé en arrière-plan avait réécrit le fichier juste avant le commit),
    alors que le code et `bench/DEV_M0_BILAN.md` étaient ceux de la règle seule. Le fichier a été régénéré sur le
    code validé ; il redonne P 2,14 %, R 80/95, FD1 1/34, FD2 0,09.

16. **Le dernier relevé ne compte pas pour déclarer un manque ; le point 14 est appliqué (15 novembre 2026).**
    Même ordre réel qu'au point 15 : essayé dans l'arbre de travail sur les graines de développement, puis décrit
    ici et poussé avec le code.

    *Ce qui restait après le point 15.* Avec la datation une à une du point 14 par-dessus la règle de doublons,
    FD2 valait 0,12. Les trois fausses détections en cause, lues une à une : deux dérives de 2 et 6 unités sur
    l'année, par marches d'une unité (graines 75 et 57) ; et une chute de 19 unités au seul dernier relevé
    (graine 75), sur une série plate jusque-là.

    *Règle* (`src/bilan/ecarts.js`). Un relevé pris dans les dix derniers jours des données est comparé à un
    journal dont la saisie n'est pas terminée : des pièces produites avant lui n'y sont pas encore. Il n'entre pas
    dans la recherche d'un manque sur un stock relevé chaque mois. Dix jours est le retard de saisie maximal déjà
    retenu par `dates.js` ; ce n'est pas un nouveau réglage. Justification : c'est la même censure que celle que
    `imputeCensored` traite déjà pour les lots de fin de mois.

    *Résultat, vérifié sur ce dépôt* (`npm run bench:dev`, `bench/DEV_M0_BILAN.md`), points 14 et 16 ensemble :

    | | Après le point 15 | Points 14 et 16 | Variante avec second tour (non retenue) | Garde-fou |
    |---|---:|---:|---:|---|
    | P médian, tout | 2,14 % | **1,77 %** | 1,77 % | — |
    | P médian, désordre réaliste | 4,97 % | 4,37 % | 3,81 % | — |
    | P médian, désordre propre | 0,99 % | 0,96 % | 0,96 % | — |
    | S médian · F équilibré · L · G | 0,68 % · 0,944 · 0,856 · 0,941 | inchangés | inchangés | ✅ |
    | R | 80/95 | **85/95** | 83/95 | ≥ 76/95 ✅ |
    | FD1, placebos touchés | 1/34 | 1/34 | 1/34 | ≤ 1/34 ✅ |
    | FD2 | 0,09 | **0,08** | 0,09 | ≤ 0,10 ✅ |
    | FD2, désordre réaliste seul | 0,15 | 0,15 | 0,18 | — |

    Tous les garde-fous tiennent. Le second tour du point 14 n'est pas retenu : il gagne sur P en désordre réaliste
    mais perd deux flux retrouvés et ajoute une fausse détection, là où le test jugera.

    **Lecture honnête du seuil.** P médian passe sous 2 % sur les 100 graines de développement, propres et
    réalistes mêlées. Le test, lui, ne porte que sur le désordre réaliste : P y vaut 4,4 % et FD2 0,15, tous deux
    hors seuil. Ce résultat ne dit donc pas que M0 passerait son test.

    *Ce qui reste.* Une fausse détection nouvelle (graine 57 : une dérive de 6 unités en un an, de l'ordre des
    erreurs de saisie de quantité), qu'un critère de matérialité écarterait ; il n'est pas écrit. Sur certaines
    graines réalistes, le premier passage ne trouve toujours aucune incidence des types sur les stocks. Tests de
    non-régression ajoutés (graines 72 et 3).

17. **Matérialité d'un manque sur un stock relevé chaque mois (15 novembre 2026, écrit avant le code).**
    *Mesure préalable, hors code, sur les 100 graines de développement.* La recherche d'un manque sur un stock
    relevé chaque mois déclare aujourd'hui 17 manques : 12 vrais, 5 faux (jugés un à un par l'évaluation). Rapporté
    au flux du stock après son début (somme des quantités de toutes ses pièces), le manque total vaut, pour les
    faux : 0,38 ; 1,05 ; 1,41 ; 1,77 ; 2,32 % ; pour les vrais : 2,00 ; 2,34 ; 2,46 ; 3,02 ; 3,07 ; 3,20 ; 3,35 ;
    3,94 ; 4,51 ; 4,51 ; 5,13 ; 8,79 %. Un premier critère essayé hors code est écarté : comparer le manque à la
    quantité des pièces retirées comme doublons *sur ce stock* ne sépare rien (deux faux passent, un vrai tombe).

    *Règle prévue* (`src/bilan/ecarts.js`). Un manque n'est déclaré sur un stock relevé chaque mois que si son
    taux — manque total rapporté au flux du stock depuis son début — dépasse le **taux de doublons du journal**
    (pièces écartées comme copies, rapportées au nombre de pièces). Aucune constante nouvelle. Justification : une
    copie mal jugée déplace le stock d'une pièce entière ; si toutes les décisions de doublons étaient fausses,
    l'erreur sur le flux atteindrait ce taux. En deçà, un manque ne se distingue pas de l'incertitude du moteur sur
    les pièces elles-mêmes. Sur des données sans doublons, la borne s'annule et rien ne change.

    *Attendu.* Le taux de doublons vaut environ 1,5 % en désordre réaliste et presque 0 en désordre propre. Les
    trois faux manques les plus faibles (graines 57, 75, 97) devraient tomber ; les deux autres (graines 55 et 49,
    à 1,77 et 2,32 %) sont au-dessus de la borne attendue et devraient rester ; aucun vrai manque ne devrait tomber
    (le plus faible en désordre réaliste est à 2,46 %). Donc : FD2 sur les 100 graines 0,08 → environ 0,03 ; FD2 en
    désordre réaliste 0,15 → environ 0,06 ; FD1 inchangé (1/34) ; R inchangé (85/95) ; P, S, F, L, G inchangés.
    Garde-fous habituels. Limite assumée : la séparation observée repose sur 17 cas ; un vrai manque dont le taux
    serait sous le taux de doublons ne serait plus déclaré.

    **Résultat, vérifié sur ce dépôt** (`npm run bench:dev`) : FD2 sur les 100 graines 0,08 → **0,06** ; FD2 en
    désordre réaliste 0,15 → **0,12** ; FD1 1/34, R 85/95, P 1,77 %, S, F, L et G inchangés. Garde-fous tenus,
    aucun vrai manque perdu. **L'attente n'est tenue qu'à moitié** : un seul des trois faux manques visés est
    tombé (graine 57) ; ceux des graines 75 et 97 restent, parce que le taux de doublons de ces journaux est plus
    bas que les 1,5 % que j'avais supposés (les pièces sans contrepartie, nombreuses, ne sont jamais jugées copies
    et diluent le taux). La règle est gardée : elle retire une fausse détection sans rien coûter. Rapporter le taux
    aux seules pièces qui peuvent être des copies serait une retouche après coup ; elle n'est pas faite. En désordre
    réaliste, FD2 reste hors seuil (0,12 pour 0,10).

18. **Second tour quand le premier passage est aveugle (15 novembre 2026, écrit avant le code).**
    *Mesure préalable, hors code.* Sur 7 des 100 graines de développement, toutes en désordre réaliste (15, 21, 61,
    69, 81, 93, 99 ; six du troisième archétype), le premier passage ne trouve **aucune** incidence des types sur
    les stocks relevés chaque mois : les étapes de datation qui en dépendent ne s'exécutent pas. Leur S va de 13 à
    26 % (sauf la 61 : 0,5 %) et leur P de 4,9 à 8,9 %. Au point 14, un second tour appliqué à *toutes* les graines
    avait été écarté : il coûtait deux flux retrouvés sur des graines qui n'en avaient pas besoin.

    *Règle prévue* (`src/bilan/index.js`). Si, et seulement si, le premier passage n'a attribué d'incidence à aucun
    type portant des quantités sur un stock relevé chaque mois, les dates sont réestimées une seconde fois avec
    l'incidence trouvée au second passage, puis les stocks recalculés. Les 93 autres graines suivent exactement le
    même chemin qu'aujourd'hui. Justification : inchangée depuis le point 14 — les dates ont besoin de l'incidence,
    et l'incidence des dates ; ici le premier aller est aveugle.

    *Attendu.* Rien ne change hors de ces 7 graines. Sur elles, d'après la mesure du point 14 : P baisse nettement
    sur la 21 (vers 2 %) et la 93 (vers 4,4 %), peu ou pas sur les autres ; S presque inchangé, parce que S se joue
    au jour près à l'intérieur du mois. P médian en désordre réaliste : 4,37 % → entre 4,1 et 4,3 %. Risque connu :
    une fausse détection sur la graine 21 (vue au point 14), que les points 16 et 17 devraient avoir écartée.
    Garde-fous habituels sur les 100 graines.

## 10. Exécution du test

À compléter au moment du gel : commit du bilan gelé, commit des archétypes de test, commande exacte, puis
`RESULTATS_M0.md` produit par l'évaluateur, suivi d'une lecture honnête rédigée après l'exécution.
