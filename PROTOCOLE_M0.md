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
| **M0-F** | regroupement des flux | F moyen ≥ 0,90, **et** supérieur au plan naïf (IC95 > 0) |
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

**Critère d'abandon** : si F moyen < 0,70, ou si FD1 dépasse 25 %, le bilan de matière est rejeté sous cette forme, et
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

*Vide à ce jour.*

---

## 10. Exécution du test

À compléter au moment du gel : commit du bilan gelé, commit des archétypes de test, commande exacte, puis
`RESULTATS_M0.md` produit par l'évaluateur, suivi d'une lecture honnête rédigée après l'exécution.
