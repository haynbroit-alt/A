# LAVOISIER — conception d'une intelligence économique autonome

> « Rien ne se perd, rien ne se crée, tout se transforme. »
> Lavoisier était chimiste. Il était aussi fermier général, c'est-à-dire comptable de l'impôt. Il a fondé la chimie
> moderne sur une loi de conservation, en pesant tout ce qui entrait dans une réaction et tout ce qui en sortait.

**Statut** : document de conception, écrit **avant** tout code. Il s'appuie sur les résultats mesurés de deux objets
existants :
- **GALILÉE** (`haynbroit-alt/All`) : un agent qui découvre des lois symboliques en choisissant lui-même ses expériences ;
- **CORTEX** (`haynbroit-alt/1`, v1 à v6) : un cerveau bayésien qui découvre des dynamiques cachées et pilote une
  activité qu'on ne lui a pas décrite.

Les affirmations sur ces deux systèmes renvoient à leurs bancs d'essai pré-enregistrés, y compris aux échecs.

---

## 1. La thèse : l'entreprise est un système physique, et son argent obéit à une loi de conservation

Les outils d'« IA pour l'entreprise » partent d'un récit sur le métier : entonnoir de vente, stratégie de prix,
segmentation. LAVOISIER part d'un fait qui ne dépend d'aucun métier : **la comptabilité en partie double est une loi de
conservation**. Chaque euro qui entre vient de quelque part. Chaque euro qui sort va quelque part. Il en va de même
pour une unité de stock, un client ou une heure de travail.

Cette loi coupe la connaissance d'une entreprise en deux parties, de nature différente :

| | **Identités** (conservation) | **Lois** (comportement) |
|---|---|---|
| Exemples | marge = prix − coût unitaire ; stock(t+1) = stock(t) + entrées − sorties ; base clients = acquis − perdus | élasticité de la demande au prix ; saturation de la publicité ; usure d'une machine ; bouche-à-oreille |
| Nature | exactes, vérifiables par simple addition | incertaines, à découvrir |
| Organe | LAVOISIER (le bilan de matière) | GALILÉE (formes) et CORTEX (dynamiques) |
| Erreur typique des outils actuels | traitées comme des corrélations à apprendre | supposées connues ou tirées d'un modèle de métier |

**Principe fondateur** : *ce qui est comptable est certain ; ce qui est comportemental est une hypothèse ; ce qui est
recommandé doit avoir gagné un pari.*

L'objet qui en découle n'est ni un conseiller ni un tableau de bord. C'est **un laboratoire qui traite l'entreprise comme
un système physique inconnu**. Il reconstruit d'abord sa structure de conservation. Il découvre ensuite les lois qui
gouvernent les débits. Enfin, il ne croit à une opportunité qu'après l'avoir démontrée par une expérience réelle,
avec une garantie statistique.

### Ce que LAVOISIER produit (et rien d'autre)

Il ne converse pas et n'affiche pas d'indicateurs. Il ne produit que trois sortes d'actes :

1. **Des certificats** : « augmenter le prix de la catégorie B de 4 % le mardi rapporte +1 230 €/mois
   [IC à 90 % : +410 ; +2 050], démontré par une expérience randomisée de 6 semaines ; probabilité de fausse découverte
   contrôlée à 5 % sur l'ensemble des certificats ».
2. **Des demandes d'autorisation** : « l'expérience la plus informative sort du domaine déjà observé (prix > 18 €), ou
   met en jeu plus que le budget de risque ; décision humaine requise ».
3. **Des aveux d'ignorance** : « les abandons de commande contiennent une structure prévisible que mon langage
   n'exprime pas (famille : temps) ; je ne recommande rien qui en dépende ».

C'est la boucle de GALILÉE (expérimenter, puis s'arrêter quand une loi s'impose) appliquée à une entreprise : la
« mesure » y est une transaction, et la « loi » un mécanisme de création de valeur.

---

## 2. Ce que les mesures passées imposent à la conception

LAVOISIER n'est pas une idée de départ : chaque organe répond à un résultat mesuré.

| Constat mesuré | Source | Conséquence pour LAVOISIER |
|---|---|---|
| Un même cerveau pilote des activités différentes **si on lui déclare le corps** (leviers, mesures, comptabilité) | CORTEX v3 (restaurant 86,7 %, abonnement 95,8 % de l'oracle) | Le corps doit être **découvert** à partir des données brutes, pas déclaré : c'est l'organe nouveau (§ 4) |
| CORTEX invente des variables cachées absentes des données : réputation (50 % des années), file d'attente (67 %) | v5, E2b | Conservé : c'est le moteur de dynamique (§ 6) |
| Le τ continu retrouve 56 % des modes lents, contre 25 % pour la grille | v6 P1, A2 | Conservé |
| Accepter une découverte sur un facteur de Bayes naïf donne 50 % de mondes placebo pollués ; le **pari invariant** n'en donne que 4 % | v6 P1, B1 | Toute croyance passe par un pari (§ 10) |
| Monde mal spécifié : une rupture est **toujours** expliquée par un faux mode lent (50/50) | v6 P1, B3 | Le modèle nul contient la grammaire de CORTEX ; la sonde « hors de portée » est obligatoire |
| La sonde « hors de portée » : 0 fausse alarme sur 60, AUC 0,885 | v6 P2 | Conservée : elle produit les aveux d'ignorance |
| GALILÉE propose souvent la bonne forme (`u1·u0/4`), mais 1 formule sur 25 seulement gagne son pari | v6 P2, G1 | Cause probable : trop peu de variété des leviers. **L'expérimentation doit être conçue**, pas subie (§ 10) |
| Piège de l'exploration : la serre arrosée 5 jours par an, l'interaction jamais apprise | v4 | L'exploration est budgétée en euros et dirigée par la valeur de l'information (§ 8, § 9) |
| Vélos : moins de la moitié de l'oracle, contre 90 % pour l'habitude ; bouche-à-oreille (λ = 0,97) trouvé 3 % du temps | v5 | Les effets très lents exigent des **témoins perpétuels** et une planification longue (§ 10.4) |
| La garantie du pari ne couvre pas les leviers choisis en boucle fermée | v6 P1, journal, point 2 | **La randomisation rend la garantie vraie** (§ 10.2) |
| GALILÉE sait demander l'autorisation de sortir du domaine sûr | GALILÉE, revue humaine | Même mécanisme pour le risque économique (§ 9) |

---

## 3. Vue d'ensemble

```
 Données brutes (banque, factures, caisse, stocks, CRM, paie, journaux web…)
        │
        ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ 1. BILAN DE MATIÈRE (Lavoisier)                                         │
 │    flux appariés → graphe stocks/flux → résidus de conservation          │
 │    → candidats leviers, mesures, comptabilité (le « corps » découvert)   │
 └───────────────┬─────────────────────────────────────────────────────────┘
                 │ identités exactes            │ débits à expliquer
                 ▼                              ▼
 ┌──────────────────────────┐      ┌──────────────────────────────────────┐
 │ 2. ATLAS DES UNITÉS      │      │ 3. GALILÉE : formes des débits        │
 │ marge par client, par    │      │ débit = f(leviers, contexte)          │
 │ commande, par heure…     │      │ demande, saturation, échelle…         │
 │ (décomposition exacte)   │      ├──────────────────────────────────────┤
 └───────────┬──────────────┘      │ 4. CORTEX : dynamiques                │
             │                     │ modes cachés, ruptures, régimes,      │
             │                     │ sonde « hors de portée »              │
             │                     └──────────────────┬───────────────────┘
             ▼                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ 5. JUMEAU ÉPISTÉMIQUE : ensemble de simulateurs tirés de la postérieure │
 │    chaque arête porte un statut : identité / établie / empirique /       │
 │    hypothèse / hors de portée                                           │
 └───────────────┬─────────────────────────────────────────────────────────┘
                 ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ 6. GÉNÉRATEUR D'OPPORTUNITÉS : grammaire d'actions, divergence des      │
 │    mondes, fuites de conservation, rejeu contrefactuel du passé          │
 └───────────────┬─────────────────────────────────────────────────────────┘
                 ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ 7. GOUVERNEUR : budget de risque en €, CVaR sur les mondes, domaine sûr, │
 │    réversibilité → exécuter | revue humaine                              │
 └───────────────┬─────────────────────────────────────────────────────────┘
                 ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ 8. REGISTRE DES PARIS : expérience randomisée pré-enregistrée,          │
 │    e-processus, budget α global, certificat ou rejet, témoin perpétuel   │
 └───────────────┬─────────────────────────────────────────────────────────┘
                 ▼
          Mesurer → Apprendre → Réviser → Dreaming ↺
```

---

## 4. Organe 1 — le bilan de matière : découvrir le corps

C'est la partie radicalement nouvelle. CORTEX a démontré qu'un cerveau générique peut piloter une activité **dont
on lui déclare le corps**. LAVOISIER doit trouver ce corps seul.

### 4.1 Représentation

L'entreprise est un graphe **stocks–flux** :

- **stocks** S : trésorerie, stock de chaque article, base de clients actifs, carnet de commandes, dettes et créances,
  heures disponibles ;
- **flux** Φ : chaque flux relie deux stocks (ou un stock et l'extérieur) et porte une **quantité** et un **montant** ;
- **conservation** : S(t+1) = S(t) + B·Φ(t), où B est la matrice d'incidence du graphe. Une fois B découvert, cette
  équation est **exacte**.

Le profit est une identité sur ce graphe : π(t) = Σ prix(e)·Φₑ(t). LAVOISIER n'a donc pas besoin qu'on lui donne la
« comptabilité » d'un corps déclaré (le `reward` de CORTEX) : il la **lit** dans la conservation.

### 4.2 Algorithme de découverte du corps

1. **Normalisation.** Chaque enregistrement devient un événement (date, montant, quantité, contrepartie, objet, auteur,
   source). Aucun schéma de métier n'est supposé.
2. **Appariement par conservation.** Les événements qui représentent le même mouvement vu de deux côtés sont appariés :
   facture et paiement, bon de commande, réception puis consommation, inscription puis résiliation. C'est un problème
   d'appariement sous contraintes (les montants et les quantités doivent se compenser, à des délais plausibles). Les
   types de flux émergent comme des classes de paires qui se compensent de la même façon.
3. **Intégration et contrôle.** Les stocks sont reconstruits en intégrant les flux, puis comparés aux soldes observés :
   relevé bancaire, inventaires, comptes clients.
4. **Résidus de conservation, ou méthode Neptune.** Le Verrier a découvert Neptune dans les écarts de l'orbite d'Uranus.
   Un écart systématique entre le stock intégré et le stock observé révèle un **flux caché** : démarque, gaspillage,
   remises non saisies, fraude, coûts oubliés. Ces flux cachés sont la première source d'opportunités, et elle est
   certaine, puisque comptable.
5. **Typage des variables.** Chaque série reçoit un statut candidat :
   - **levier** : fixée par un acteur interne (auteur interne, valeurs constantes par morceaux, changements datés et
     discrets, non prévisible à partir du passé des mesures) ;
   - **mesure** : produite par l'extérieur (ventes, appels, plaintes) ;
   - **contexte** : connue d'avance et non contrôlée (calendrier, météo, jours fériés).

   Le typage reste une **hypothèse**. Le **mandat** (§ 9) fixe ensuite quels leviers LAVOISIER a le droit de toucher.
6. **Clients comme stock.** Les identifiants clients donnent les cohortes : acquisition, rétention, perte. La valeur
   d'un client devient une identité sur le graphe, et non un modèle de « valeur vie client » plaqué de l'extérieur.

**Sortie** : une déclaration de corps au format de CORTEX v3 (leviers, contexte, mesures, comptabilité), produite par
la machine, avec un degré de confiance par élément et la liste des résidus de conservation.

### 4.3 Ce qui reste difficile

- L'appariement est combinatoire ; les données réelles sont lacunaires et datées de façon incohérente.
- Distinguer un levier d'une mesure n'est pas toujours possible sur données passives, car les décisions de l'entreprise
  réagissent elles-mêmes aux mesures. Le typage est donc vérifié par l'expérience (§ 10) quand le mandat le permet.
- Rien de cet organe n'a encore été validé (voir le jalon M0, § 13).

---

## 5. Organe 2 — l'atlas des unités

Le graphe permet de décomposer le profit **exactement** selon n'importe quelle unité : par client, commande, article,
heure de travail, créneau, canal. Pour chaque unité, l'atlas donne trois choses :

- sa contribution, c'est-à-dire ce qu'elle rapporte moins ce qu'elle consomme, d'après la conservation ;
- sa variance dans le temps et entre unités ;
- la liste des débits qui la gouvernent, avec leur statut épistémique.

L'atlas ne contient aucune hypothèse. Il dit **où** l'argent se crée et se perd, sans dire **pourquoi**. Il sert à
orienter la recherche de lois vers les débits qui pèsent le plus dans la variance du profit (§ 8).

---

## 6. Organes 3 et 4 — GALILÉE et CORTEX : le pourquoi des débits

Chaque débit du graphe s'écrit :

```
Φₑ(t) = gₑ( leviers(t), contexte(t), stocks(t), z(t) ; θ ) · bruit
z(t+1) = Λ·z(t) + W·s(t)          (modes cachés : CORTEX v6 P1)
```

Deux organes se partagent le travail :

| | **GALILÉE** : la forme | **CORTEX** : le temps |
|---|---|---|
| Question | quelle fonction relie un débit à ses causes ? | quel état caché, quelle rupture, quel régime ? |
| Exemples économiques | demande au prix (puissance, seuil) ; saturation de la publicité (`x/(1+x/K)`, que GALILÉE retrouve à 1 % de bruit) ; économies d'échelle (`a + b·Q^0,8`) ; courbe d'apprentissage | réputation (mémoire lente des plaintes) ; file d'attente cachée ; usure ; lassitude d'une promotion ; arrivée d'un concurrent |
| Méthode | programmation génétique et choix actif de l'expérience au plus fort désaccord entre hypothèses | grammaire déclencheur × mécanisme ; modes à τ continu ; pari invariant |
| Garde-fou | contre-expertise : second avis, validation sur points neufs, résidus | sonde « hors de portée », AUC 0,885 |

**Couplage** (repris de CORTEX v6 P2, puis corrigé) :

1. CORTEX ajuste le modèle dynamique.
2. Sa sonde cherche, dans les écarts, une structure prévisible que son langage n'exprime pas, et dit de quelle famille
   elle relève : forme, temps ou mémoire.
3. Si la famille est **forme**, GALILÉE reçoit les écarts et propose une formule.
4. La formule est figée et **mise en pari**. Correction par rapport à P2 : le pari n'attend plus passivement des jours
   neufs. Il **demande** au registre (§ 10) une expérience qui fait varier les leviers là où la formule et le modèle
   actuel divergent le plus. C'est exactement le principe d'expérimentation de GALILÉE, appliqué à la confirmation.
   P2 a échoué (1 formule sur 25) faute de cette variété.

Les mécanismes déclarés hors de portée restent dans le jumeau comme **zones d'ignorance**. Aucune décision ne peut
dépendre d'une arête dont le statut est « hors de portée ».

---

## 7. Organe 5 — le jumeau épistémique

Le jumeau n'est pas un simulateur unique : c'est un **ensemble de simulateurs tirés de la postérieure**. Chaque
membre partage les identités, qui sont exactes, et diffère sur les lois, qui sont incertaines. Chaque arête porte un
statut :

| Statut | Signification | Peut fonder une décision ? |
|---|---|---|
| **identité** | conservation vérifiée | oui |
| **établie** | loi qui a gagné son pari et passé la contre-expertise (second avis, hors domaine) | oui |
| **empirique** | pari gagné dans le domaine observé, sans garantie au-delà | oui, dans le domaine |
| **hypothèse** | crédible sur données passives, pas encore pariée | seulement pour **choisir une expérience** |
| **hors de portée** | structure détectée, non exprimable | non |

Cette distinction est la clé du raisonnement économique de LAVOISIER. Il peut **imaginer** à partir d'hypothèses, mais
il ne peut **engager l'entreprise** que sur des identités et des lois pariées. Les vocabulaires « établie / empirique /
incertaine » de GALILÉE et « compris / mal estimé / hors de portée » de CORTEX fusionnent ici.

---

## 8. Organe 6 — le générateur d'opportunités

LAVOISIER ne contient aucune stratégie commerciale. Une opportunité est **une action dont le jumeau prédit un gain,
ou dont le résultat réduirait le plus l'incertitude sur le gain**. Elle naît de cinq sources, aucune propre à un métier.

1. **Fuites de conservation.** Ce sont les résidus du § 4.2. Le gain est comptable : seule la cause reste à identifier.
2. **Gradient sous incertitude.** Pour chaque levier, la dérivée du profit selon le jumeau, moyennée sur les mondes et
   pénalisée par leur désaccord.
3. **Divergence des mondes.** Là où les simulateurs de la postérieure prédisent des profits très différents, une
   expérience vaut de l'argent : c'est la **valeur de l'information**, en euros. GALILÉE choisit ses expériences au
   point de plus fort désaccord ; LAVOISIER fait de même, mais pondère par l'enjeu financier.
4. **Grammaire d'actions.** C'est le pendant de la grammaire d'hypothèses de CORTEX :

   ```
   action = levier × cible × forme × durée
     cible : tout, un segment de l'atlas, un article, un créneau, un canal
     forme : niveau · calendrier périodique (tous les k jours, phase φ) · règle sur un état caché
             (« quand la réputation estimée baisse ») · seuil sur un stock · combinaison de deux leviers
   ```

   CORTEX v4 a ainsi **inventé** une maintenance tous les 11 jours environ, pour un optimum proche de 12, sans qu'on la
   lui suggère. Les opportunités « inconnues » sont les points de cet espace combinatoire que le jumeau classe haut et
   qu'aucun humain n'avait formulés : une règle conditionnelle sur une variable cachée inventée en est l'exemple type.
5. **Rejeu contrefactuel.** Le passé est rejoué dans chaque monde du jumeau avec d'autres politiques. Le résultat dit
   combien l'entreprise **aurait** gagné. C'est une hypothèse : elle sert à prioriser, jamais à certifier.

Le classement final utilise un indice qui additionne le **gain espéré** (sur les seules arêtes décidables) et la
**valeur de l'information**, moins le **coût de l'expérience** et une pénalité de risque. C'est la réponse au piège de
l'exploration de la v4 : une option incertaine mais prometteuse garde une valeur tant que son incertitude n'est pas
levée.

---

## 9. Organe 7 — le gouverneur : risque, mandat, revue humaine

Le gouverneur décide **si** une action peut être exécutée, et **comment**.

- **Mandat** : la liste des leviers que LAVOISIER peut toucher, avec leurs bornes. Elle est fixée par un humain,
  une fois, puis révisable.
- **Budget de risque** : une perte maximale tolérée, en euros, sur une période. C'est le « capital d'expérimentation ».
  Chaque expérience en consomme selon sa perte possible ; un certificat gagné en restitue.
- **Mesure du risque** : CVaR de la perte sur les mondes du jumeau, et non sur un seul modèle. Si les mondes divergent,
  le risque est élevé, même si la moyenne est favorable.
- **Domaine sûr** : les valeurs de leviers déjà observées. En sortir exige une autorisation, comme pour GALILÉE.
- **Réversibilité** : un changement de prix se défait ; une rupture de contrat ou un licenciement, non. Toute action
  irréversible passe en revue humaine, quel que soit son gain.

Ces règles donnent l'aiguillage de la boucle :

```
risque faible, réversible, dans le domaine, dans le budget  →  EXÉCUTER (sous forme d'expérience)
sinon                                                        →  REVUE HUMAINE (demande d'autorisation chiffrée)
```

---

## 10. Organe 8 — le registre des paris : démontrer la rentabilité

C'est ce qui sépare LAVOISIER d'un conseiller. **Aucune opportunité n'est recommandée ; elle est démontrée.**

### 10.1 Le pari pré-enregistré

Pour chaque opportunité retenue, le registre écrit **avant** d'agir :
- l'hypothèse ;
- la métrique : la variation de marge calculée par la conservation, et non un indicateur intermédiaire ;
- le plan d'expérience, choisi par l'agent : randomisation par jour (« switchback »), par article, par zone ou par
  client, selon les interférences prévues par le graphe ;
- la règle d'arrêt ;
- la part du budget α qu'il engage.

### 10.2 Pourquoi la randomisation est indispensable

Le pari invariant de CORTEX v6 n'est valide que si les leviers sont **exogènes** (journal de P1, point 2). Or, en
boucle fermée, l'agent choisit ses leviers d'après ce qu'il observe, ce qui détruit cette hypothèse. La solution est
d'ajouter une perturbation tirée au hasard par-dessus la politique : sa composante aléatoire est exogène par
construction. CORTEX contient déjà un tel tremblement (`DITHER = 0,08`). Ici, il devient la condition de validité de la
garantie. **La randomisation n'est pas une précaution statistique : c'est ce qui rend la garantie vraie.**

### 10.3 Acceptation et garantie globale

- Chaque pari est un **e-processus** sur l'effet incrémental. Il peut être consulté chaque jour et arrêté à tout moment
  sans fausser la garantie (inégalité de Ville, comme dans CORTEX v6).
- Les paris s'enchaînent sans fin. Le budget α est donc géré **en ligne** sur l'ensemble des certificats, par une
  procédure de contrôle du taux de fausses découvertes adaptée aux e-valeurs (de type e-LOND, Xu et Ramdas, 2024).
- L'effet est rapporté par une **suite de confiance** (Howard et al., 2021), valide à tout instant.

Un **certificat** contient : l'hypothèse, le plan, la trajectoire de l'e-valeur, l'effet et sa suite de confiance, le
coût de l'expérience, la part de α dépensée, et les menaces connues (interférences, effet de nouveauté).

### 10.4 Le témoin perpétuel

Un gain démontré sur 6 semaines peut s'éteindre, et un effet lent (bouche-à-oreille, λ = 0,97, l'échec des vélos)
n'apparaît qu'après des mois. Chaque certificat conserve donc un **petit groupe témoin permanent** (articles, zones ou
clients tirés au hasard qui ne reçoivent pas l'action). Le certificat a trois états :

- **certifié** : pari gagné ;
- **durable** : le témoin confirme l'effet après N mois ;
- **révoqué** : le témoin contredit le certificat ; l'action est retirée, et la loi qui la fondait repasse à l'état
  d'hypothèse.

Le témoin perpétuel est aussi l'**audit de LAVOISIER lui-même** : la somme des gains certifiés doit se retrouver dans le
résultat réel. Si ce n'est pas le cas, le système se trompe sur lui-même, et il doit le dire.

---

## 11. La boucle complète

| Étape | Ce que fait LAVOISIER | Organe |
|---|---|---|
| OBSERVER | ingère les événements bruts, les apparie | bilan de matière |
| COMPRENDRE | reconstruit le graphe stocks–flux, l'atlas, les lois et les dynamiques | 1, 2, 3, 4 |
| CONFRONTER | conservation vérifiée ? prévisions confirmées à moins de 3 σ ? | 1, 4 |
| HYPOTHÈSES | résidu de conservation → flux caché ; écart prévisible → sonde → GALILÉE | 1, 3, 4 |
| ANTICIPER | simule l'ensemble des mondes : gain, risque, valeur de l'information | 5 |
| PRIORISER | classe les actions de la grammaire par gain + information − coût − risque | 6 |
| DÉCIDER | le gouverneur applique mandat, budget, domaine et réversibilité | 7 |
| SIMULER | rédige le pari pré-enregistré et prédit sa trajectoire dans chaque monde | 5, 8 |
| EXÉCUTER \| REVUE | expérience randomisée, ou demande d'autorisation chiffrée | 7, 8 |
| MESURER | variation de marge par la conservation, e-valeur, suite de confiance | 1, 8 |
| APPRENDRE | certificat, ou rejet ; les lois gagnantes changent de statut | 8, 5 |
| RÉVISER | met à jour le jumeau ; révoque ce que les témoins contredisent | 5, 8 |
| DREAMING | rejeu contrefactuel, sonde « hors de portée » sur toute l'histoire, audit global des certificats, recherche de contre-exemples aux lois établies | 4, 6, 8 |

---

## 12. Ce que LAVOISIER apprend d'une entreprise à l'autre

Les **formes** de lois qui ont gagné leurs paris (saturation de la publicité, élasticité par segment, usure, file
d'attente) et les **motifs d'actions** certifiés (calendrier périodique, règle sur un état caché) forment une
bibliothèque. Dans une nouvelle entreprise, ils deviennent des **a priori hiérarchiques** : ils accélèrent la recherche
sans jamais dispenser du pari local. Une loi vraie ailleurs n'est qu'une hypothèse ici.

---

## 13. Plan de validation

Le projet garde la discipline de GALILÉE et de CORTEX : chaque jalon a un protocole écrit avant le code, des seuils
fixés d'avance, une exécution unique sur des graines jamais vues, et un critère d'abandon.

### 13.1 Le banc d'essai : des « entreprises opaques »

Il faut un nouveau générateur. Dans les bancs de CORTEX, l'agent recevait le corps déclaré. Ici, il ne reçoit que des
**journaux d'événements bruts** : factures, paiements, mouvements de stock, inscriptions, appels. Leur structure, les
leviers et la comptabilité sont cachés, ainsi que des mécanismes classés d'avance en représentables, approximables et
hors de portée, et des flux cachés (démarque, remises non saisies). Les activités de test sont écrites **après** le gel
du code, comme pour CORTEX v3 à v5.

### 13.2 Jalons

| Jalon | Question | Critère principal (indicatif, à fixer dans le protocole) | Abandon si |
|---|---|---|---|
| **M0** bilan de matière | le corps se retrouve-t-il à partir des journaux bruts ? | F1 des flux ≥ 0,9 ; flux cachés détectés ≥ 70 % ; fausses détections ≤ 0,1 par entreprise | F1 < 0,7 |
| **M1** typage des variables | leviers, mesures et contexte sont-ils bien séparés ? | exactitude ≥ 85 % sur données passives ; ≥ 95 % après expérience | < 70 % |
| **M2** GALILÉE confirmé par expérience | la variété conçue lève-t-elle l'échec G1 de P2 ? | formules acceptées ≥ 50 % parmi les formes vraies ; placebo ≤ 10 % | placebo > 10 % |
| **M3** registre des paris | la garantie tient-elle en boucle fermée avec randomisation ? | fausses certifications ≤ α dans les mondes sans effet (borne de Wilson) | fausse certification > α |
| **M4** boucle complète | LAVOISIER fait-il mieux que l'habitude dans des entreprises inconnues ? | profit > habitude (IC95 apparié) dans **chaque** activité ; gains certifiés réalisés à ± 20 % | profit < habitude en moyenne |
| **M5** ombre réelle | sur une vraie entreprise, sans agir : ses prévisions battent-elles une prévision naïve ? | prévisions scorées pendant 3 mois avant toute action | pas de gain de prévision |
| **M6** pilote réel | premier certificat sur une vraie entreprise, dans un mandat étroit | 1 certificat durable ; aucune perte au-delà du budget | perte hors budget |

M4 vise précisément les échecs passés : les vélos (effets lents) et la serre (piège de l'exploration) doivent figurer
parmi les activités de test.

---

## 14. Limites connues dès la conception

1. **Le bilan de matière n'a jamais été tenté.** C'est la plus grande inconnue, et c'est pour cela qu'il ouvre la feuille
   de route (M0).
2. **La garantie couvre l'existence d'un effet, pas sa description.** CORTEX v6 l'a mesuré : 0,89 mode « imprécis » par
   monde. Un certificat dit que l'action rapporte ; il ne prouve pas que l'explication donnée soit la bonne.
3. **Toutes les actions ne sont pas randomisables.** Une seule boutique, un seul prix national, un changement de
   fournisseur : il y a trop peu d'unités. Le registre doit alors refuser de certifier et le dire, plutôt que de se
   rabattre sur des données passives.
4. **Interférences.** Baisser le prix d'un article déplace les ventes des autres. Le graphe aide à prévoir ces
   déplacements, mais un plan d'expérience mal choisi donne un certificat faux.
5. **Effets très lents.** Le témoin perpétuel les détecte tard. Il ne les rend pas pilotables plus tôt.
6. **Mondes simulés.** Comme pour CORTEX, « inconnu » voudra d'abord dire « écrit après le gel », et non « réel ». M5 et
   M6 sont les seuls jalons qui touchent le réel.
7. **Données réelles.** Accès, qualité, confidentialité : le déploiement exige un mandat explicite de l'entreprise et un
   traitement local des données.

---

## 15. Ce qui est réutilisé tel quel

| Composant | Origine | Usage dans LAVOISIER |
|---|---|---|
| expressions, ajustement, recherche, agent expérimental | GALILÉE `src/` (copie gelée, comme `research/v6/vendor/galilee`) | formes des débits (organe 3) |
| modèle par mesure, grammaire d'explications, décision par simulation | CORTEX `src/core/` | dynamiques (organe 4), simulation du jumeau |
| modes à τ continu et pari invariant | CORTEX `research/v6/engine.js` (P1) | modes cachés, e-processus du registre |
| sonde « hors de portée » | CORTEX `research/v6/p2.js` (P2) | aveux d'ignorance |
| format de déclaration du corps | CORTEX `src/bodies/` | sortie du bilan de matière |
| discipline de pré-enregistrement | les deux projets | tous les jalons |

**Ce qui est nouveau** : le bilan de matière (découverte du corps par conservation), l'atlas des unités, le jumeau
épistémique à statuts, la grammaire d'actions, le gouverneur à budget de risque en euros, le registre des paris avec
contrôle α en ligne et témoins perpétuels.

---

## 16. Première étape proposée

Rédiger `PROTOCOLE_M0.md` : le générateur d'entreprises opaques (journaux bruts uniquement), les métriques de
reconstruction du corps, les seuils, les graines de développement et de test, et le critère d'abandon. Ensuite
seulement, coder le bilan de matière.
