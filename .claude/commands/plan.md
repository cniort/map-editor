---
description: Produit un plan validable pour un projet (niveau 1, sans exécuter)
argument-hint: "<projet>"
---
Pour le projet **$ARGUMENTS**, produis un **plan validable** — sans rien
exécuter (comportement niveau 1, copilote encadré).

Étapes :
1. Charge l'entrée du projet dans `pilote/registre/projets.yaml` (vision, stratégie, prochaine action) et la config d'autonomie.
2. Décompose la `prochaine_action` en sous-tâches concrètes et ordonnées.
3. Pour chaque sous-tâche : effort estimé, fichiers probablement concernés, et si elle franchit un garde-fou `valider`.
4. Termine par les **points qui requièrent ta décision** avant exécution.

Ne modifie aucun fichier. Attends mon feu vert avant de passer à `/avance`.
