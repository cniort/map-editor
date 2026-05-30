# 00 — Créer le hub `projects-hub` (mode d'emploi)

> Cette session Claude n'a accès qu'au repo `map-editor`. Tout le contenu du Pilote
> a donc été préparé ici, **prêt à être copié** dans un repo dédié. Voici comment.

## Pourquoi un repo dédié

Le hub est le **cerveau partagé** de tous tes projets. Il doit être accessible
indépendamment de n'importe quel projet, et c'est de là que tu pilotes le portefeuille.

```
projects-hub/              ← le cerveau (registre, décisions, agents, doc)
   ├─ référence →  projet-A  (repo séparé)
   ├─ référence →  projet-B  (repo séparé)
   └─ ...          (30-40 projets)
```

Deux types de travail, deux endroits :
- **Pilotage** (`/status`, `/triage`, `/next`, `/valider`) → tourne **dans le hub** (lit le registre).
- **Exécution** (`/avance` sur un projet) → tourne **dans le repo du projet** (il faut son code).
  À l'échelle, c'est délégué à une **Routine** liée à ce repo (voir `01-automatisation-routines.md`).

## Étapes (sur ton ordinateur)

```bash
# 1. Crée le repo (via gh CLI ou l'interface GitHub)
gh repo create projects-hub --private --clone
cd projects-hub

# 2. Copie le contenu préparé depuis map-editor
cp -R /chemin/vers/map-editor/pilote/*        .
mkdir -p .claude
cp -R /chemin/vers/map-editor/.claude/agents   .claude/
cp -R /chemin/vers/map-editor/.claude/commands .claude/

# 3. Première sauvegarde
git add -A && git commit -m "init: hub de pilotage des projets"
git push -u origin main
```

> Note : dans `projects-hub`, le contenu de `pilote/` peut vivre **à la racine**
> (le hub *est* le pilote). Adapte les chemins dans les agents/commandes si tu déplaces
> les fichiers (ex. `pilote/registre/projets.yaml` → `registre/projets.yaml`).

## Donner les accès (pour l'automatisation plus tard)

Pour que le Pilote agisse sur tes projets, l'automatisation aura besoin d'accès :
- **GitHub App Claude** installée sur chaque repo de projet (`/install-github-app` depuis Claude Code), ou
- un **token** (OAuth Max ou PAT) avec accès aux repos concernés.

Détails et arbitrage de coût : voir `02-couts-et-alternatives.md`.

## Une fois le hub créé
1. Remplis `registre/projets.yaml` → voir `03-remplir-le-registre.md`.
2. Teste le pilotage : ouvre Claude Code dans `projects-hub`, lance `/status` puis `/triage`.
3. Quand tu veux industrialiser : suis `01-automatisation-routines.md`.
