---
description: Propose la prochaine action la plus utile, tous projets confondus
argument-hint: "[projet optionnel]"
---
Détermine la **prochaine action la plus utile** à mener.

Si un projet est précisé (`$ARGUMENTS`), concentre-toi dessus. Sinon, arbitre
entre tous les projets de `pilote/registre/projets.yaml`.

Critères de priorisation, dans l'ordre :
1. Priorité déclarée (P0 > P1 > P2 > P3) et deadlines proches.
2. Effort / impact (privilégie un fort impact à faible effort).
3. Projets dormants à relancer.
4. Cohérence avec la `strategie_actuelle` du projet.

Rends : **l'action recommandée**, **pourquoi elle prime**, et **l'effort estimé**.
La priorisation inter-projets est un garde-fou `valider` : propose, ne lance rien
sans accord (voir `pilote/config/autonomie.yaml`).
