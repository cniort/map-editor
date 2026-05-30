# 02 — Coûts & alternatives (au-delà de l'API au token)

> Tu l'as bien senti : faire tourner 10-20 projets en parallèle peut coûter cher si
> tout passe par l'**API au token**. Voici le spectre complet des options, du moins
> cher au plus cher, et une stratégie pour ne payer que ce qui le mérite.

---

## 1. Le spectre des coûts

| Option | Coût marginal | Capacité | Idéal pour |
|--------|---------------|----------|------------|
| **Modèles locaux** (Ollama : DeepSeek, Qwen Coder, GLM) | ~0 € (élec + matériel) | Moyenne | Tâches routinières, triage, brouillons |
| **API open-models** (DeepSeek, Qwen…) | Très faible | Bonne | Volume, tâches simples à moyennes |
| **Abonnement Max** (forfait) | **Fixe**, plafonné par limites 5 h | Excellente | Le quotidien autonome → **à privilégier** |
| **Batch API** (Claude) | API **−50 %** | Excellente | Lots non urgents (analyse nocturne de tous les projets) |
| **API standard** (Claude) | Le plus cher | Excellente | Débordement / tâches complexes urgentes |

➡️ **Le prompt caching** (−90 % sur le contexte mis en cache) se combine avec
presque tout : il réduit le coût du contexte répété (registre, contexte projet).

---

## 2. Le levier n°1 : rester sur l'abonnement, pas l'API

C'est l'économie la plus importante et la plus simple :
- Les **Routines puisent dans ton forfait** Max jusqu'aux limites — **0 € au token** tant que tu restes dedans.
- GitHub Actions peut s'authentifier avec un **token OAuth Max** (`claude setup-token`) → **puise dans le forfait** au lieu de facturer au token.

**Conséquence** : conçois le système pour **tenir dans le forfait Max** le plus
longtemps possible (cadence maîtrisée, runs ciblés), et ne bascule en API que pour
le **débordement**.

> ⚠️ **Piège à éviter** : si la variable `ANTHROPIC_API_KEY` est définie, elle
> **prime** sur l'abonnement → tu es facturé au token sans le vouloir. Pour rester
> sur le forfait, ne la définis pas et utilise le **token OAuth** (`claude setup-token`).

---

## 3. Le levier n°2 : router selon la difficulté de la tâche

Toutes les tâches ne méritent pas le modèle le plus cher. Affecte chaque type au
bon niveau :

| Type de tâche | Modèle conseillé | Pourquoi |
|---------------|------------------|----------|
| Triage, digests, statuts, bumps de deps | **Haiku** / modèle local | Simple, volumineux, peu de risque |
| Implémentation, refactor, debug | **Sonnet / Opus** (forfait) | Capacité requise |
| Analyse de masse non urgente (40 projets) | **Batch API −50 %** | Pas pressé |

Claude Code peut pointer vers un **modèle alternatif via un proxy compatible OpenAI**
(local ou open-model, ex. via une *base URL* personnalisée) pour les tâches routinières,
en réservant Claude au travail complexe. Dans une Routine, ces réglages passent par les
**variables d'environnement** de l'environnement cloud.

---

## 4. Le levier n°3 : la cadence et le périmètre

- **Moins de runs, plus profonds** > polling permanent. Un `/avance` ciblé par jour
  et par projet vaut mieux que des micro-runs incessants.
- **Échelonner** les Routines pour lisser les limites 5 h.
- **Limiter le contexte** : chaque Routine ne charge que le projet concerné + le
  registre (mis en cache), pas toute la bibliothèque.

---

## 5. L'alternative radicale : modèles locaux / open-source

Pour un **coût marginal quasi nul** sur les tâches routinières :
- **Ollama** + un modèle open (DeepSeek V3, Qwen 2.5 Coder, GLM-4) en local.
- Des agents type **OpenClaw** savent fonctionner avec des backends locaux/alternatifs.
- **Compromis** : matériel (RAM/GPU) en amont, capacité inférieure à Claude sur le
  raisonnement complexe. → Idéal en **hybride** : local pour le routinier, Claude
  (forfait) pour ce qui compte.

---

## 6. Stratégie recommandée (progressive)

```
Palier 1 — Tout sur l'abonnement Max (Routines + OAuth en CI).
           Mesurer la conso réelle sur 2-3 projets pilotes. Coût = forfait.
Palier 2 — Ajouter prompt caching (registre + contexte projet) → contexte −90 %.
Palier 3 — Débordement : Batch API (−50 %) pour les analyses de masse non urgentes.
Palier 4 — Offload du routinier (triage, digests) vers Haiku, puis modèle local
           si le volume le justifie.
Palier 5 — Budget API dédié uniquement pour le pic de complexité urgent.
```

> Règle simple : **forfait d'abord, cache partout, batch pour le non-urgent,
> local pour le trivial, API standard en dernier recours.**

---

### Sources
- [Batch API (−50 %)](https://platform.claude.com/docs/en/build-with-claude/batch-processing) · [Prompt caching (−90 %)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) · [Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Routines — billing](https://support.claude.com/en/articles/manage-routines-usage) · [Claude Code avec Pro/Max](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan) · [GitHub Actions OAuth](https://support.claude.com/en/articles/github-actions-oauth)
