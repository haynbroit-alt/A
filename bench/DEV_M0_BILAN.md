# Développement M0 : bilan de matière (graines 1 à 100)

Généré par `npm run bench:dev` (`node src/bench/run.js --seeds 1-100 --methods naive,bilan,parfait --out bench/dev-m0.json`). Résultats de **développement** : le bilan est mis au point sur ces graines, ils ne valent pas évaluation. Version : estimation des dates réelles (PROTOCOLE_M0.md, § 9, point 8).

### naive

| | n | F | F équilibré (sans seuil) | L | G | S médian | P médian | R (trouvés / au-dessus du seuil) | FD1 placebos touchés | FD2 / entreprise à flux cachés | ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| tout | 100 | 0.973 ± 0.004 | 0.690 ± 0.019 | 0.322 ± 0.075 | 0.091 ± 0.011 | 31.9 % | 84.7 % | 0/95 | 0/34 | 0.00 | 76 |
| abonnement | 34 | 0.980 ± 0.002 | 0.657 ± 0.034 | 0.836 ± 0.042 | 0.082 ± 0.020 | 26.4 % | 111.5 % | 0/29 | 0/12 | 0.00 | 184 |
| service | 33 | 0.982 ± 0.003 | 0.705 ± 0.034 | 0.012 ± 0.004 | 0.117 ± 0.018 | 31.9 % | 85.4 % | 0/33 | 0/11 | 0.00 | 11 |
| negoce | 33 | 0.956 ± 0.008 | 0.710 ± 0.026 | 0.102 ± 0.038 | 0.074 ± 0.017 | 37.2 % | 53.5 % | 0/33 | 0/11 | 0.00 | 31 |
| désordre realiste | 50 | 0.973 ± 0.005 | 0.694 ± 0.027 | 0.276 ± 0.091 | 0.090 ± 0.014 | 32.3 % | 83.4 % | 0/46 | 0/17 | 0.00 | 86 |
| désordre propre | 50 | 0.973 ± 0.005 | 0.687 ± 0.026 | 0.368 ± 0.120 | 0.092 ± 0.018 | 31.9 % | 87.6 % | 0/49 | 0/17 | 0.00 | 67 |

### bilan

| | n | F | F équilibré (sans seuil) | L | G | S médian | P médian | R (trouvés / au-dessus du seuil) | FD1 placebos touchés | FD2 / entreprise à flux cachés | ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| tout | 100 | 0.995 ± 0.002 | 0.934 ± 0.010 | 0.856 ± 0.053 | 0.918 ± 0.030 | 1.6 % | 3.8 % | 70/95 | 1/34 | 0.20 | 881 |
| abonnement | 34 | 0.999 ± 0.000 | 0.916 ± 0.019 | 0.770 ± 0.118 | 0.911 ± 0.045 | 0.0 % | 4.4 % | 22/29 | 1/12 | 0.18 | 2063 |
| service | 33 | 0.994 ± 0.002 | 0.920 ± 0.019 | 0.868 ± 0.058 | 0.957 ± 0.025 | 1.7 % | 1.8 % | 29/33 | 0/11 | 0.14 | 47 |
| negoce | 33 | 0.993 ± 0.005 | 0.967 ± 0.009 | 0.933 ± 0.082 | 0.887 ± 0.073 | 7.6 % | 6.5 % | 19/33 | 0/11 | 0.27 | 496 |
| désordre realiste | 50 | 0.995 ± 0.002 | 0.923 ± 0.016 | 0.824 ± 0.078 | 0.854 ± 0.054 | 6.1 % | 6.1 % | 29/46 | 1/17 | 0.30 | 1014 |
| désordre propre | 50 | 0.995 ± 0.003 | 0.945 ± 0.012 | 0.888 ± 0.072 | 0.983 ± 0.009 | 0.9 % | 2.6 % | 41/49 | 0/17 | 0.09 | 748 |

Comparaison appariée bilan − naïf (100 graines) : F équilibré 0.244 ± 0.017 · L 0.534 ± 0.100 · G 0.828 ± 0.032

