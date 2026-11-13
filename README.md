# LAVOISIER

Une intelligence économique autonome qui traite l’entreprise comme un système physique inconnu : elle reconstruit sa structure de conservation (stocks et flux d’argent, de marchandises, de clients), découvre les lois de ses débits avec GALILÉE et ses dynamiques cachées avec CORTEX, puis ne croit à une opportunité qu’après l’avoir démontrée par une expérience randomisée, avec une garantie statistique.

Conception : [CONCEPTION.md](CONCEPTION.md). Premier jalon : [PROTOCOLE_M0.md](PROTOCOLE_M0.md).

## État

Le banc d'essai de M0 est écrit : générateur d'entreprises opaques, évaluateur, méthode de référence naïve. Une première version du bilan de matière (`src/bilan/`) est en développement ; elle n'est pas gelée. Résultats de développement : [bench/DEV_M0_BILAN.md](bench/DEV_M0_BILAN.md).

```bash
npm test                                                   # 17 tests (banc et bilan)
node src/bench/run.js --seeds 1-100 --methods naive,bilan,parfait  # graines de développement
```

Les graines de test (5001 à 5300) sont refusées par le script : elles ne seront exécutées qu'une fois, après le gel.
