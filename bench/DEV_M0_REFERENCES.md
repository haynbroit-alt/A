# Références de développement M0 (graines 1 à 100)

Généré avant le changement des retards (PROTOCOLE_M0.md, § 9, point 6) par `node src/bench/run.js --seeds 1-100 --methods naive,parfait`. Références à jour : `bench/DEV_M0_BILAN.md`. « parfait » est la vérité mise au format de la prédiction : il vérifie l'évaluateur, ce n'est pas une méthode.

### naive

| | n | F | F équilibré (sans seuil) | L | G | S médian | P médian | R (trouvés / au-dessus du seuil) | FD1 placebos touchés | FD2 / entreprise à flux cachés | ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| tout | 100 | 0.973 ± 0.004 | 0.690 ± 0.019 | 0.322 ± 0.075 | 0.090 ± 0.011 | 32.1 % | 84.5 % | 0/95 | 0/34 | 0.00 | 75 |
| abonnement | 34 | 0.980 ± 0.002 | 0.657 ± 0.034 | 0.836 ± 0.043 | 0.079 ± 0.019 | 25.7 % | 111.2 % | 0/29 | 0/12 | 0.00 | 182 |
| service | 33 | 0.982 ± 0.003 | 0.705 ± 0.034 | 0.012 ± 0.004 | 0.117 ± 0.018 | 31.9 % | 85.4 % | 0/33 | 0/11 | 0.00 | 10 |
| negoce | 33 | 0.956 ± 0.008 | 0.710 ± 0.026 | 0.103 ± 0.038 | 0.074 ± 0.017 | 36.1 % | 51.6 % | 0/33 | 0/11 | 0.00 | 30 |
| désordre realiste | 50 | 0.973 ± 0.005 | 0.694 ± 0.027 | 0.275 ± 0.091 | 0.089 ± 0.013 | 32.5 % | 82.2 % | 0/46 | 0/17 | 0.00 | 86 |
| désordre propre | 50 | 0.973 ± 0.005 | 0.687 ± 0.026 | 0.369 ± 0.120 | 0.092 ± 0.018 | 31.9 % | 86.6 % | 0/49 | 0/17 | 0.00 | 65 |

### parfait

| | n | F | F équilibré (sans seuil) | L | G | S médian | P médian | R (trouvés / au-dessus du seuil) | FD1 placebos touchés | FD2 / entreprise à flux cachés | ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| tout | 100 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 0.0 % | 0.0 % | 95/95 | 0/34 | 0.00 | 0 |
| abonnement | 34 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 0.0 % | 0.0 % | 29/29 | 0/12 | 0.00 | 0 |
| service | 33 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 0.0 % | 0.0 % | 33/33 | 0/11 | 0.00 | 0 |
| negoce | 33 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 0.0 % | 0.0 % | 33/33 | 0/11 | 0.00 | 0 |
| désordre realiste | 50 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 0.0 % | 0.0 % | 46/46 | 0/17 | 0.00 | 0 |
| désordre propre | 50 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 1.000 ± 0.000 | 0.0 % | 0.0 % | 49/49 | 0/17 | 0.00 | 0 |

