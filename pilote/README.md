# Pilote — chef de projet autonome pour ta bibliothèque de projets

> Document d'architecture **et** point d'entrée du PoC.
> Objectif : un agent qui coordonne tes projets pour toi, pendant que tu gardes
> le rôle de **super-manager** (vision, stratégie, validation des jalons).
>
> ⚠️ **Provisoire** : ce dossier vit dans `map-editor` pour démarrer vite.
> Il a vocation à déménager dans un repo dédié (`projects-hub`) une fois le PoC validé.

---

## 1. La vision (north star)

Un **orchestrateur** qui, en continu :
1. lit ta **stratégie** et l'état de tes projets (le registre),
2. **priorise** et choisit quoi faire avancer,
3. **délègue à un sous-agent par repo** (contexte isolé),
4. code / commit / ouvre des PR,
5. **s'auto-évalue** (boucle méta-cognitive),
6. te remonte une **synthèse** + les rares décisions qui demandent ton arbitrage.

Toi = vision, stratégie, validation des grandes orientations. Lui = exécution coordonnée.

---

## 2. Architecture en couches

```
TOI (super-manager) ─ vision, stratégie, validation des jalons
        │
   REGISTRE CENTRAL (pilote/registre/) ─ la mémoire durable
     • projets : repo, statut, priorité, deadline, dernière activité
     • vision & stratégie écrites par projet
        │
   CONFIG (pilote/config/) ─ les règles du jeu
     • 2 niveaux d'autonomie + garde-fous (validation gates)
        │
   ORCHESTRATEUR (.claude/agents/chef-de-projet) ─ le "chef de projet"
     • lit registre + config → priorise → décide quoi avancer
     • spawn 1 SOUS-AGENT par repo
     • boucle méta : plan → exécute → critique → réajuste → reporte
        │
   SOUS-AGENTS PROJET ─ font le travail technique, un par repo
        │
   DÉCLENCHEURS (Claude Code Routines) ─ la vie 24/7
     • cron : matin = triage · journée = exécution · soir = rapport
     • GitHub events (PR/issue) → réaction
     • à la demande (toi, via les slash commands)
```

> **Point clé** : la pièce centrale n'est pas « l'agent » (sans mémoire entre
> sessions) mais le **registre durable**. Tant qu'il est tenu à jour, l'agent
> retrouve le contexte à chaque réveil. C'est non négociable.

---

## 3. Les deux niveaux d'autonomie

Même cerveau, deux portes d'entrée. Ce qui les sépare est **paramétré** dans
`config/autonomie.yaml` (par projet, via `mode_autonomie`).

### Niveau 1 — Copilote encadré (validation aux jalons)
- Autonome sur : décomposition, tâches **déjà cadrées**, bugfix, refactor local, tests, doc.
- **Produit un plan que tu valides** avant d'exécuter.
- Demande validation : nouvelle feature, choix d'archi, priorisation inter-projets.
- Lancé à la demande (`/plan`, `/avance`).

### Niveau 2 — Pilote autonome (le vrai manager)
- **Initiative** : choisit quoi avancer selon la vision, décompose, code, commit, ouvre PR.
- **Boucle méta-cognitive** : après chaque lot, l'agent `critique-projet` ré-évalue
  (sert la vision ? qualité ? dette ?) → l'orchestrateur réajuste.
- **Rapporte** + escalade les seules décisions stratégiques.
- Tourne via **Routines** (cadence / événements).

> **Aucun mode ne merge en prod ni ne déploie seul.** Voir les garde-fous.

---

## 4. Garde-fous (validation gates)

Définis dans `config/autonomie.yaml`. Chaque action sensible vaut
`auto` (agit seul) / `valider` (mise en file) / `interdit`, **par mode**.
Règle d'or : **en cas de doute, mettre en file plutôt qu'agir**.

---

## 4 bis. Validation par lots — le cœur du dispositif

Tu pilotes 30-40 projets : être sollicité tâche par tâche te ruinerait. Le Pilote
fonctionne donc **sans interruption** :

1. Il avance en autonomie sur tout ce qu'il peut (`auto`).
2. Dès qu'il rencontre une vraie décision (`valider`), il **ne s'arrête pas** :
   il la consigne dans `validations.md` et **continue ailleurs**.
3. Au bon moment, tu lances `/valider` : tu tranches **tout le lot en une session**,
   dans un format digeste (contexte court + options).
4. Tes choix sont enregistrés, et l'agent **reprend entièrement la main**.

> C'est ce qui te sort des « 6 fenêtres VS Code » : tu ne suis plus chaque
> implémentation, tu arbitres un backlog de décisions groupées, quand tu le décides.

---

## 5. Structure des fichiers

```
pilote/
├── README.md                  ← ce document
├── registre/
│   └── projets.yaml           ← la mémoire : tous tes projets
├── config/
│   └── autonomie.yaml         ← 2 modes + garde-fous
├── validations.md             ← file des décisions qui t'attendent (validation par lots)
├── templates/
│   └── rapport.md             ← gabarit de rapport
└── journal/
    └── .gitkeep               ← journal horodaté des actions de l'agent

.claude/
├── agents/
│   ├── chef-de-projet.md      ← l'orchestrateur
│   └── critique-projet.md     ← la boucle méta-cognitive
└── commands/
    ├── status.md              ← /status  : tableau de bord
    ├── triage.md              ← /triage  : alerte projets dormants
    ├── next.md                ← /next    : prochaine action la plus utile
    ├── plan.md                ← /plan    : plan pour un projet (mode 1)
    └── avance.md              ← /avance  : fait avancer un projet
```

---

## 6. Comment utiliser le PoC (aujourd'hui)

Dans une session Claude Code à la racine du repo :

| Commande | Effet |
|----------|-------|
| `/status` | Tableau de bord de tous les projets du registre |
| `/triage` | Liste les projets dormants ou sans prochaine action |
| `/next` | Propose la prochaine action la plus utile (priorisation) |
| `/plan <projet>` | Produit un plan validable (niveau 1) |
| `/avance <projet>` | Lance le chef-de-projet sur un projet |
| `/valider` | Traite **en un lot** toutes les décisions en attente, puis débloque l'agent |

**Première étape concrète** : remplir `registre/projets.yaml` avec tes vrais
projets (l'entrée `cartocycle` sert d'exemple).

---

## 7. Paliers d'évolution

| Palier | Contenu | Automatisation |
|--------|---------|----------------|
| **PoC** *(ici)* | Registre + chef-de-projet + commandes, lancé à la main | Aucune |
| **V1** | Niveau 2 actif + 1ère Routine (rapport quotidien des projets dormants) | Cron léger |
| **V2** | Orchestrateur multi-repo (Agent Teams) + Routines d'exécution | Cron + webhooks |
| **V3** | Boucle méta-cognitive complète + garde-fous fins + tableau de bord | Complète |

---

## 8. Réalité coût / 24-7 (à garder en tête)

- Les abonnements (Pro 20 € / Max 100 €) ont des limites qui **se réinitialisent
  toutes les 5 h**. « 24/7 » au sens *non-stop intensif* basculerait en facturation API.
- **Bon modèle** : **salves programmées + réactions à événements** (Routines),
  pas un process toujours allumé. Effet ressenti identique, coût maîtrisé.
- Garder le **Pro** pour l'usage interactif, réserver le **Max** (ou un budget API
  dédié) à l'orchestrateur autonome.

---

## 9. Primitives natives utilisées

- **Claude Code Routines** — automatisation cloud (cron / API / webhooks GitHub),
  sessions autonomes sans prompt d'approbation. C'est le moteur du 24/7.
- **Claude Agent SDK / Agent Teams** — sous-agents à contexte isolé, orchestration
  multi-agents (un team lead coordonne des teammates).

> Inspiration : OpenClaw (ex-Clawdbot) a popularisé l'agent autonome, mais les
> primitives natives Anthropic couvrent le besoin de façon plus sûre et déjà incluse.

---

## 10. Limites connues du PoC

- **Mono-repo** : cette session n'accède qu'à `cniort/map-editor`. Le multi-repo
  réel viendra avec le repo `projects-hub` dédié + accès élargi.
- **Mémoire = discipline** : si le registre n'est pas tenu à jour, l'agent est aveugle.
- **Tu restes le goulot** : le reporting est volontairement **groupé et synthétique**
  pour que tes validations restent légères.
