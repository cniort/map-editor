---
description: Traiter en un lot toutes les décisions en attente, puis débloquer l'agent
---
Ouvre la file de validation `pilote/validations.md` et traite **en une session
groupée** toutes les décisions `⏳ en attente`.

Déroulé :
1. Charge les entrées en attente, triées par priorité de projet puis ancienneté.
2. Présente-les de façon **digeste** : pour chaque décision, le strict nécessaire
   pour trancher (contexte court + options + ce que ça bloque). Ne me fais pas
   fouiller le code.
3. Recueille mes arbitrages efficacement — utilise l'outil de questions pour
   batcher plusieurs décisions d'un coup quand c'est possible.
4. Pour chaque décision : inscris `✅ <mon choix> (date)` ou `❌ rejeté` dans
   `pilote/validations.md`, et répercute l'impact dans `pilote/registre/projets.yaml`
   (`prochaine_action`, `strategie_actuelle` si besoin).
5. Termine par une **synthèse de ce qui est maintenant débloqué** et propose de
   relancer le chef-de-projet (`/avance`) sur les projets concernés pour qu'il
   reprenne la main.

Objectif : que je valide tout le backlog de décisions rapidement, et que l'agent
puisse repartir en autonomie sur la base de mes choix.
