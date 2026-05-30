# 03 — Remplir le registre (sur ton ordinateur)

> Le registre `registre/projets.yaml` est la mémoire du Pilote. Le remplir, c'est
> l'étape qui débloque tout le reste. Compte ~3-5 min par projet.

## Méthode

Ouvre `registre/projets.yaml` et **duplique le bloc gabarit** pour chaque projet.
Tu n'es pas obligé de tout remplir parfaitement : commence par l'essentiel.

### Champs essentiels (à faire en priorité)
- `id` : identifiant court sans espace (ex. `cartocycle`).
- `nom` : nom lisible.
- `repo` : `org/repo` GitHub.
- `statut` : `actif` | `dormant` | `en_pause` | `idee` | `archive`.
- `priorite` : `P0` (critique) → `P3` (un jour).
- `vision` : **une phrase** — ce que le projet doit devenir.
- `prochaine_action` : la prochaine étape concrète.

### Champs utiles (peuvent attendre)
- `mode_autonomie` : `1` (tu valides aux jalons) ou `2` (pilote autonome). En cas
  de doute → `1`, tu passeras en `2` quand tu auras confiance.
- `strategie_actuelle`, `deadline`, `tags`, `derniere_activite`.

## Petit auto-questionnaire par projet
1. En une phrase, ce projet existe pour quoi ? → `vision`
2. C'est chaud, tiède ou froid en ce moment ? → `statut` + `priorite`
3. Si je m'y remettais 1h aujourd'hui, je ferais quoi ? → `prochaine_action`
4. Est-ce que je laisse l'agent décider seul, ou je veux valider ? → `mode_autonomie`

## Astuce volume (30-40 projets)
- Fais d'abord une **passe rapide** : juste `id`, `nom`, `repo`, `statut`, `priorite`.
  Tu obtiens immédiatement un `/status` portefeuille exploitable.
- Affine `vision` + `prochaine_action` ensuite, en commençant par les `P0`/`P1`.
- Mets en `idee` ou `archive` ce qui n'est pas actif : ça déclutter la vue sans rien perdre.

## Vérifier
Ouvre Claude Code dans le hub et lance `/status` puis `/triage` : tu verras
immédiatement si le registre est cohérent et ce qui ressort en priorité.
