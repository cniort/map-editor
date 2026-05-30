---
description: Tableau de bord de tous les projets du registre
---
Lis `pilote/registre/projets.yaml` et affiche un tableau de bord clair de tous
les projets :

| Projet | Statut | Priorité | Mode | Dernière activité | Prochaine action |

Puis, en dessous :
- Mets en évidence les projets **P0/P1** et ceux **en attente d'une décision**.
- Signale tout projet **dormant** (statut `dormant`, ou `derniere_activite`
  ancienne de plus de ~21 jours par rapport à la date du jour).

Sois synthétique : c'est un coup d'œil de manager, pas un rapport détaillé.
