---
description: Alerte sur les projets dormants ou sans prochaine action
---
Lis `pilote/registre/projets.yaml` et identifie les projets qui ont besoin
d'attention :

1. **Dormants** — statut `dormant`, ou `derniere_activite` vieille de plus de
   ~21 jours par rapport à aujourd'hui.
2. **Sans cap** — `prochaine_action` vide, vague, ou déjà faite.
3. **Échéance proche** — `deadline` dans moins de 14 jours.

Pour chacun, propose **une prochaine action concrète** alignée sur sa
`strategie_actuelle`. Termine par une recommandation : sur quel projet
Corentin gagnerait le plus à (te faire) avancer maintenant.
