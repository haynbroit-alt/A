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

## 10. Exécution du test

À compléter au moment du gel : commit du bilan gelé, commit des archétypes de test, commande exacte, puis
`RESULTATS_M0.md` produit par l'évaluateur, suivi d'une lecture honnête rédigée après l'exécution.
