# 01 — Automatisation 24/7 : les Routines (playbook complet)

> Objectif : faire avancer 10-20 projets **en parallèle, dans le cloud**, sans que tu
> ouvres 6 fenêtres VS Code. Le moteur natif s'appelle **Claude Code Routines**.

---

## 1. Ce qu'est une Routine

Une session Claude Code **autonome**, exécutée **dans le cloud** (conteneur isolé),
déclenchée par un planning, une API ou un événement GitHub. Pas de prompt
d'approbation pendant le run. Elle clone un repo, exécute une tâche, et persiste
le résultat (commit/PR) ou l'expose via webhook.

**Trois déclencheurs :**
| Déclencheur | Usage |
|-------------|-------|
| **Cron** (planning) | Runs récurrents : triage du matin, exécution journalière, rapport du soir |
| **API** (HTTP) | Lancement à la demande depuis un script / un autre outil |
| **GitHub** (webhook) | Réagir à une **PR** ou une **release** (seuls events supportés) |

**Création :** `claude.ai/code/routines` (web), l'app Desktop, ou la CLI :
```
/schedule triage des projets tous les jours à 8h
/schedule avancer projet-A chaque jour ouvré à 10h
/schedule rapport hebdo des projets dormants le lundi à 9h
```

> **Bon à savoir** : les Routines sont stockées dans ton **compte cloud** (pas un
> fichier versionné). Une Routine = un prompt + un ou plusieurs **repos** + des
> connecteurs + des déclencheurs. Intervalle planifié **minimum : 1 h**. Par défaut,
> l'agent ne pousse que sur des branches préfixées `claude/`.

---

## 2. Facturation (à connaître absolument)

- Les Routines **puisent dans ton abonnement** (Pro/Max) jusqu'aux limites du plan.
- Au-delà → **usage supplémentaire facturé au tarif API** (au token).
- Elles **partagent le même pool** que tes sessions interactives, avec des **limites
  qui se réinitialisent toutes les 5 h**.
- En plus : un **plafond quotidien du nombre de runs** par compte (les runs ponctuels
  « one-off » n'y comptent pas, mais consomment l'usage normal).
- Max 100 € = 5× / Max 200 € = 20× de marge avant facturation API.

➡️ **Conséquence de design** : on ne lance pas 20 Routines en continu. On **cadence**
et on **priorise**. Détails coûts → `02-couts-et-alternatives.md`.

---

## 3. Architecture cible : hub + Routines par projet

```
        ┌──────────────── projects-hub (cerveau) ────────────────┐
        │  registre/projets.yaml · validations.md · journal/      │
        └───────────▲───────────────────────────────▲────────────┘
                    │ lit/écrit décisions            │
   ┌────────────────┴───┐                  ┌─────────┴──────────┐
   │ Routine projet-A   │      ...         │ Routine projet-N   │
   │ clone repo A       │                  │ clone repo N       │
   │ protocole          │                  │ protocole          │
   │ chef-de-projet     │                  │ chef-de-projet     │
   │ → PR sur repo A    │                  │ → PR sur repo N    │
   └────────────────────┘                  └────────────────────┘

   TOI dans le hub : /status · /triage · /valider  (tu arbitres le lot)
```

Chaque Routine de projet suit **le même protocole** (l'agent `chef-de-projet`) :
avance en autonomie, ouvre une PR, **n'interrompt pas**, et **empile ses décisions
dans le hub** (`validations.md`). Toi, tu videos la file quand tu veux via `/valider`.

---

## 4. La cadence recommandée (portefeuille)

| Moment | Routine | Effet |
|--------|---------|-------|
| 08h00 | `/triage` (dans le hub) | Digest portefeuille + projets dormants |
| journée | `/avance` par projet, **échelonnés** | Avancement autonome, PR ouvertes |
| 19h00 | rapport (dans le hub) | Synthèse du jour + file de validation à traiter |

> Échelonner les `/avance` (intervalle **mini 1 h** par Routine) évite de saturer
> les limites (5 h + plafond quotidien de runs) et lisse le coût.

---

## 5. Prompts de Routine prêts à coller

**Triage quotidien (hub) :**
```
Lis registre/projets.yaml. Produis le digest portefeuille : ce qui a bougé,
ce qui dort (>21j), ce qui attend une décision. Mets à jour les statuts évidents.
N'ouvre aucune PR. Termine par les 3 projets à prioriser aujourd'hui.
```

**Avancer un projet (repo du projet) :**
```
Tu es le chef-de-projet (voir .claude/agents). Charge le registre + la config
d'autonomie depuis le hub. Avance sur projet-<X> selon son mode. Ouvre une PR,
ne merge jamais. N'interromps pas : empile toute décision `valider` dans la file
du hub (validations.md) et continue sur ce que tu peux. Journalise.
```

**Alerte projets dormants (hebdo, hub) :**
```
Liste les projets sans activité depuis >21 jours ou sans prochaine_action.
Pour chacun, propose une prochaine action concrète. Classe par priorité.
```

---

## 6. Alternative / complément : GitHub Actions

Utile pour réagir aux événements d'un repo (PR, issue, `@claude`) et pour piloter
par CI. **Point clé coût** : on peut s'authentifier avec un **token OAuth issu de
l'abonnement Max** (`claude setup-token`) au lieu d'une clé API → l'usage **puise
dans le forfait** au lieu d'être facturé au token.

```yaml
# .github/workflows/claude.yml
name: Claude Code
on:
  issue_comment:
    types: [created]
  schedule:
    - cron: "0 8 * * 1-5"   # 8h, jours ouvrés
jobs:
  claude:
    runs-on: ubuntu-latest
    permissions: { contents: write, pull-requests: write, issues: read }
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          # Soit la clé API (facturé au token) :
          # anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          # Soit le token OAuth Max (puise dans le forfait) :
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
```
Installation rapide : `claude` puis `/install-github-app`.

---

## 7. Checklist de mise en place (le jour J)

- [ ] Hub `projects-hub` créé + registre rempli.
- [ ] GitHub App Claude installée sur les repos à automatiser (ou token configuré).
- [ ] 1 Routine `/triage` quotidienne (hub) — **commence par celle-là**.
- [ ] Valider le digest pendant quelques jours avant d'ajouter l'exécution.
- [ ] Ajouter 1 Routine `/avance` sur **un seul** projet pilote.
- [ ] Vérifier le cycle complet : PR ouverte + décision empilée → `/valider` → ça repart.
- [ ] Élargir projet par projet, en surveillant la conso (5 h / limites).

---

### Sources
- [Claude Code Routines — docs](https://code.claude.com/docs/en/routines) · [setup](https://code.claude.com/docs/en/routines-setup) · [usage/billing](https://support.claude.com/en/articles/manage-routines-usage)
- [GitHub Actions pour Claude Code](https://code.claude.com/docs/en/github-actions) · [auth OAuth](https://support.claude.com/en/articles/github-actions-oauth)
