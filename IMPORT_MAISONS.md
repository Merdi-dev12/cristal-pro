# Import MAISONS

Cet import prépare les 8 groupes de l’archive `MAISONS.zip` : `M1` à `M4`, `I1`, `P1`, `P2` et `V1`.

## Correspondance

| Préfixe | Catégorie RHEODYCE                              |
| ------- | ----------------------------------------------- |
| `V`     | Résidence / villa                               |
| `I`     | Immeuble                                        |
| `M`     | Maison                                          |
| `P`     | Terrain / parcelle, même si un bâti existe déjà |

## État des données

- Les 39 images ont été réorientées si nécessaire, légèrement corrigées, accentuées, converties en WebP et débarrassées de leurs métadonnées. Aucune retouche générative n’a été appliquée.
- Les prix sont des estimations de mise en marché en USD, calibrées à partir d’annonces publiques observées en juillet 2026. Ils doivent être validés par le propriétaire ou un agent avant publication.
- Les coordonnées sont des points indicatifs au niveau du quartier, pas les coordonnées cadastrales des biens. Elles doivent être remplacées par un relevé GPS ou une position confirmée sur carte.
- Les surfaces et nombres de pièces sont des estimations de catalogage fondées sur les photos. Ils ne constituent pas un descriptif technique.
- Les 8 annonces sont publiées avec `status = 'published'` afin d’être visibles par les utilisateurs, tout en conservant `verified = false` tant que les informations ne sont pas confirmées.

## Contrôles avant publication

1. Confirmer l’identité du propriétaire et son mandat de publication.
2. Vérifier le certificat d’enregistrement, le numéro cadastral et l’absence de litige.
3. Confirmer le prix, la transaction, la surface, les chambres et salles d’eau.
4. Remplacer chaque point indicatif par les coordonnées GPS exactes.
5. Confirmer les droits d’utilisation des photos et conserver la source de chaque série.
6. Basculer `verified` à `true` depuis l’espace administrateur après validation.
