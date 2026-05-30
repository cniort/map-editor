---
description: Fait avancer un projet via le chef-de-projet, selon son mode d'autonomie
argument-hint: "<projet>"
---
Lance l'agent **chef-de-projet** sur le projet **$ARGUMENTS**.

Il doit :
1. Charger le registre + la config d'autonomie, et déterminer le `mode_autonomie` du projet.
2. Appliquer la boucle : Prioriser → Décomposer → Exécuter → (Critiquer si mode 2) → Reporter → Journaliser.
3. Respecter strictement les garde-fous (`auto` / `valider` / `interdit`).
4. Travailler sur une branche de feature, ouvrir une PR si pertinent, **jamais merger**.
5. Mettre à jour `derniere_activite` et `prochaine_action` dans le registre, et écrire une entrée de journal.

Si le projet est en **mode 1**, commence par présenter un plan et attends ma validation avant d'exécuter quoi que ce soit d'engageant.
