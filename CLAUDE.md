# CLAUDE.md

Instructions pour Claude Code dans ce projet.

## Projet

**Nom** : [À compléter]
**Description** : [À compléter]

## Stack technique

[À compléter]

## Commandes utiles

```bash
npm run dev      # Serveur de développement
npm run build    # Build production
```


---

## Toolkit Claude Code

> Ce projet utilise le toolkit centralisé (`~/Programmation/toolkit/`) via symlinks.
> **Tu DOIS utiliser proactivement les ressources ci-dessous sans attendre qu'on te le demande.**

---

## Workflow de Développement

**Utilise ce workflow comme guide pour structurer ton travail et déclencher les bons outils au bon moment :**

```
PHASE 1 : CONCEPTION
├── Idée floue ou feature complexe
│   └── @brainstorming → Clarifier le besoin via questionnement socratique
├── Décision d'architecture
│   └── architecture-advisor → Analyser et recommander la structure
└── Règles métier complexes
    └── business-logic-validator → Valider la cohérence logique

PHASE 2 : PRÉPARATION
├── Documentation des librairies
│   └── Context7 (MCP) → Rechercher la doc officielle AVANT de coder
├── Composants UI existants
│   └── @shadcn-enforcer → Vérifier si Shadcn a le composant
└── Base de données
    └── Supabase (MCP) → Consulter le schéma et les policies RLS

PHASE 3 : IMPLÉMENTATION
├── Création de composants React
│   └── component-generator → Générer composants typés et accessibles
├── Modifications de schéma DB
│   └── db-migration-helper → Migrations sécurisées avec RLS
└── Validation de données
    └── data-validator → Créer schemas Zod robustes

PHASE 4 : QUALITÉ
├── Après code significatif (>20 lignes)
│   └── code-reviewer → Review multi-aspects
├── Code auth/sécurité/APIs
│   └── security-auditor → Audit sécurité approfondi
├── Code impactant les performances
│   └── performance-profiler → Analyse bundle, rendering, DB
├── Nouveaux composants UI
│   ├── ui-accessibility-checker → Conformité WCAG/ARIA
│   └── responsive-tester → Tests mobile/tablet/desktop
├── Nouvelles fonctions/hooks
│   └── test-generator → Générer tests unitaires
└── Code complexe ou dupliqué
    └── refactor-assistant → Clean code et simplification

PHASE 5 : DEBUG (si problème)
├── Bug signalé par l'utilisateur
│   ├── Chrome DevTools (MCP) → Lire console et network AUTOMATIQUEMENT
│   ├── bug-hunter → Diagnostic approfondi
│   └── @systematic-debugging → Méthodologie 4 phases si bug persiste
└── Problème de performance
    └── performance-profiler → Profiler et optimiser

PHASE 6 : FINALISATION
├── Travail terminé ou checkpoint nécessaire
│   └── git-commit-helper → Commit conventionnel + checkpoints automatiques
├── API ou module complexe créé
│   └── doc-generator → Documentation automatique
├── Mise en place CI/CD ou hooks
│   └── ci-cd-automator → GitHub Actions, pre-commit hooks
├── Déploiement en production
│   └── deployment-helper → Vercel, Netlify, Docker, configuration serveur
├── Plusieurs features terminées
│   └── @changelog-generator → Changelog user-friendly
└── Fichiers de contexte volumineux
    └── context-optimizer → Réduire tokens sans perte sémantique
```

### Agents spécialisés (hors workflow standard)

| Agent | Quand l'utiliser |
|-------|------------------|
| `workflow-architect` | **Uniquement si le projet utilise n8n** - Création de workflows d'automatisation |

---

## MCP (Model Context Protocol)

### Supabase
**Rôle** : Accès direct à la base de données PostgreSQL et à l'authentification

**Cas d'usage** :
- Consulter le schéma des tables avant de coder
- Vérifier les policies RLS existantes
- Exécuter des requêtes SQL de diagnostic
- Créer ou modifier des tables/colonnes

**Déclencheurs automatiques** :
- Toute question sur les données ou la structure DB
- Création/modification de features liées aux données
- Debug de problèmes d'accès ou d'auth

---

### Context7
**Rôle** : Documentation officielle des librairies à jour

**Cas d'usage** :
- Rechercher la syntaxe exacte d'une API React/Next.js
- Vérifier les patterns officiels Tailwind/Shadcn
- Consulter la doc Zod, Zustand, TanStack Query, etc.

**Déclencheurs automatiques** :
- AVANT de coder avec une librairie (toujours vérifier la doc d'abord)
- Doute sur l'utilisation correcte d'une API
- Mention de React, Next.js, Tailwind, Shadcn, ou autre librairie

**RÈGLE** : Ne jamais coder avec une librairie sans avoir consulté Context7 d'abord.

---

### Chrome DevTools
**Rôle** : Debug autonome des applications web

**Commandes disponibles** :
- `list_console_messages` - Lire les erreurs/warnings console
- `list_network_requests` - Vérifier les requêtes HTTP échouées
- `execute_javascript` - Inspecter le DOM/state React

**Déclencheurs automatiques** :
- "bug", "erreur", "ne marche pas", "page blanche"
- "crash", "problème", "ça ne fonctionne pas"
- Tout signalement de dysfonctionnement UI

**RÈGLE ABSOLUE** : Ne JAMAIS demander de screenshot ou copier-coller de logs. Utiliser Chrome DevTools automatiquement.

**Si Chrome n'est pas en mode debug** :
```bash
bash ~/Programmation/toolkit/mcp/chrome-devtools/start-chrome-debug.sh http://localhost:3000
```

---

### n8n
**Rôle** : Création et gestion de workflows d'automatisation

**Cas d'usage** :
- Automatiser des tâches récurrentes
- Créer des webhooks et intégrations
- Synchroniser des données entre services

**Déclencheurs automatiques** :
- Besoin d'automatisation ou de workflow
- Intégration entre services (email, Slack, API externes)
- Tâches planifiées ou récurrentes

---

### Hostinger
**Rôle** : Gestion de l'hébergement et des déploiements

**Cas d'usage** :
- Déployer l'application
- Gérer les domaines et DNS
- Configurer l'environnement de production

---

## Subagents (19 agents)

### Engineering - Qualité du code

#### code-reviewer
**Rôle** : Review de code multi-aspects avant commit

**Ce qu'il vérifie** :
- Bugs potentiels et edge cases
- Best practices et patterns
- Performance basique
- Sécurité basique

**Quand l'utiliser** :
- Après avoir écrit ou modifié du code significatif (>20 lignes)
- Avant chaque commit
- Code avec logique complexe

**Durée** : 3-5 minutes

---

#### test-generator
**Rôle** : Génération de tests unitaires complets

**Ce qu'il génère** :
- Tests Jest/Vitest avec bonne couverture
- Tests des cas nominaux et edge cases
- Mocks et fixtures nécessaires

**Quand l'utiliser** :
- Après création d'une nouvelle fonction ou hook
- Après création d'un composant important
- Quand la couverture de tests est insuffisante

**Durée** : 5-10 minutes

---

#### bug-hunter
**Rôle** : Détection et diagnostic de bugs avec root cause analysis

**Ce qu'il fait** :
- Analyse les symptômes et reproduit le bug
- Identifie la root cause
- Propose un fix avec explication

**Quand l'utiliser** :
- Bug complexe ou récurrent
- Après échec des premières tentatives de fix
- Bug avec plusieurs causes possibles

**Durée** : 15-45 minutes

---

#### db-migration-helper
**Rôle** : Migrations Supabase sécurisées avec RLS

**Ce qu'il fait** :
- Crée les migrations SQL
- Configure les policies RLS appropriées
- Ajoute les index nécessaires
- Gère les contraintes et relations

**Quand l'utiliser** :
- Création d'une nouvelle table
- Modification de schéma (colonnes, types)
- Ajout/modification de policies RLS

**Durée** : 5-15 minutes

---

#### architecture-advisor
**Rôle** : Conseils d'architecture et design patterns

**Ce qu'il fait** :
- Analyse l'architecture existante
- Recommande des patterns adaptés
- Identifie les problèmes de structure
- Propose des améliorations

**Quand l'utiliser** :
- Avant de créer une nouvelle feature majeure
- Refactoring d'architecture
- Doute sur la structure à adopter

**Durée** : 15-30 minutes

---

#### doc-generator
**Rôle** : Documentation automatique

**Ce qu'il génère** :
- JSDoc pour fonctions et composants
- README pour modules
- Documentation d'API
- Guides utilisateurs

**Quand l'utiliser** :
- Après création d'une API ou d'un module complexe
- Code qui sera utilisé par d'autres développeurs
- Avant de partager du code

**Durée** : 10-20 minutes

---

#### refactor-assistant
**Rôle** : Refactoring et clean code

**Ce qu'il fait** :
- Simplifie le code complexe
- Élimine la duplication (DRY)
- Applique les principes SOLID
- Supprime le code mort

**Quand l'utiliser** :
- Fichier > 300 lignes
- Fonction > 50 lignes
- Code dupliqué détecté
- Code difficile à comprendre

**Durée** : 10-30 minutes

---

#### component-generator
**Rôle** : Génération de composants React réutilisables

**Ce qu'il génère** :
- Composants TypeScript typés
- Variants (size, color, variant)
- Props avec defaults
- Accessibilité de base

**Quand l'utiliser** :
- Création d'un nouveau composant UI
- Besoin d'un composant réutilisable
- Composant avec plusieurs variants

**Durée** : 5-10 minutes

---

#### business-logic-validator
**Rôle** : Validation de la cohérence des règles métier

**Ce qu'il vérifie** :
- Cohérence logique entre modules
- Règles métier respectées
- États et transitions valides
- Contraintes business

**Quand l'utiliser** :
- Implémentation de règles métier complexes
- Workflow avec plusieurs états
- Logique impliquant plusieurs entités

**Durée** : 10-20 minutes

---

#### git-commit-helper
**Rôle** : Gestion Git intelligente (commits + checkpoints automatiques)

**Ce qu'il fait** :
- Génère des messages Conventional Commits
- Crée des **checkpoints automatiques** avant opérations risquées
- Sauvegarde préventive avant refactoring/migration
- Commits WIP en fin de session
- Branches de backup automatiques

**Quand l'utiliser** :
- Quand tu as terminé une tâche → commit conventionnel
- **Avant un refactoring** → checkpoint automatique
- **Avant une migration DB** → checkpoint + tag
- **Fin de session** → commit WIP
- Avant déploiement → release checkpoint

**Durée** : 2-5 minutes

---

#### ci-cd-automator
**Rôle** : Pipelines CI/CD et automatisation

**Ce qu'il crée** :
- Workflows GitHub Actions / GitLab CI
- Hooks pre-commit, post-merge
- Scripts de build et tests automatisés

**Quand l'utiliser** :
- Mise en place de CI/CD
- Configuration de hooks Git
- Automatisation des tests

**Durée** : 15-30 minutes

---

#### deployment-helper
**Rôle** : Déploiement et mise en production

**Ce qu'il fait** :
- Configuration Vercel, Netlify, Cloudflare Pages
- Dockerisation (Dockerfile, docker-compose)
- Configuration Nginx, SSL, domaines
- Checklists pré/post-déploiement
- Stratégies de rollback

**Quand l'utiliser** :
- Premier déploiement d'une app
- Migration d'hébergement
- Configuration Docker
- Optimisation production

**Durée** : 20-45 minutes

---

#### data-validator
**Rôle** : Validation rigoureuse des données avec Zod

**Ce qu'il fait** :
- Crée des schemas Zod
- Valide les formats et contraintes
- Sanitize les inputs
- Génère les types TypeScript

**Quand l'utiliser** :
- Création de formulaires
- Validation d'API inputs
- Parsing de données externes

**Durée** : 5-15 minutes

---

#### context-optimizer
**Rôle** : Optimisation des fichiers de contexte pour réduire les tokens

**Ce qu'il fait** :
- Compresse le contenu sans perte sémantique
- Réduit 30-60% des tokens
- Optimise la structure

**Quand l'utiliser** :
- Fichiers CLAUDE.md ou prompts volumineux
- Contexte qui dépasse les limites
- Optimisation de coûts

**Durée** : 10-20 minutes

---

### Engineering - UI/UX

#### ui-accessibility-checker
**Rôle** : Audit d'accessibilité WCAG 2.1 AA

**Ce qu'il vérifie** :
- Sémantique HTML (balises appropriées)
- Attributs ARIA
- Contraste des couleurs (ratio 4.5:1)
- Navigation clavier
- Support screen readers

**Quand l'utiliser** :
- Après création de composants interactifs (formulaires, modals, nav)
- Avant mise en production
- Composants avec interactions utilisateur

**Durée** : 10-20 minutes

---

#### responsive-tester
**Rôle** : Tests du design responsive multi-devices

**Ce qu'il vérifie** :
- Layout sur mobile (< 640px)
- Layout sur tablet (640-1024px)
- Layout sur desktop (≥ 1024px)
- Touch targets (≥ 44px)
- Overflow horizontal

**Quand l'utiliser** :
- Après création d'interfaces
- Problème d'affichage mobile signalé
- Avant mise en production

**Durée** : 10-15 minutes

---

### Testing - Audits approfondis

#### security-auditor
**Rôle** : Audit de sécurité approfondi

**Ce qu'il vérifie** :
- Policies RLS Supabase
- Authentification JWT
- CORS et headers de sécurité
- Injections (SQL, XSS)
- Rate limiting
- Gestion des secrets

**Quand l'utiliser** :
- Code touchant à l'authentification
- APIs exposées
- Manipulation de données sensibles
- Avant mise en production

**Durée** : 15-30 minutes

---

#### performance-profiler
**Rôle** : Analyse de performance approfondie

**Ce qu'il analyse** :
- Bundle size et tree shaking
- Core Web Vitals (LCP, FID, CLS)
- Re-renders React inutiles
- Requêtes N+1 en DB
- Lazy loading et code splitting

**Quand l'utiliser** :
- Signalement de lenteur par l'utilisateur
- Code impactant le rendering
- Requêtes DB complexes
- Avant mise en production

**Durée** : 20-40 minutes

---

### Automation

#### workflow-architect
**Rôle** : Spécialiste n8n pour workflows d'automatisation

**Ce qu'il fait** :
- Analyse le besoin via dialogue
- Crée le workflow via MCP n8n
- Teste et documente
- Configure error handling

**Quand l'utiliser** :
- Automatisation complexe avec n8n
- Intégrations multi-services
- Workflows avec logique conditionnelle

**Durée** : Variable selon complexité

---

## Skills (Méthodologies)

### @brainstorming
**Rôle** : Questionnement socratique pour clarifier les idées floues

**Processus** :
1. Understanding - Comprendre le vrai problème
2. Exploration - Explorer les alternatives
3. Design - Concevoir l'approche
4. Presentation - Valider avec l'utilisateur
5. Documentation - Sauvegarder le design

**Déclencheurs** :
- "je voudrais faire...", "j'ai une idée..."
- Nouvelle feature complexe sans specs claires
- Plusieurs approches possibles
- Besoin de clarification avant de coder

---

### @systematic-debugging
**Rôle** : Framework de debugging méthodique

**Processus** :
1. Root Cause Investigation - Comprendre AVANT de fixer
2. Pattern Analysis - Comparer avec ce qui fonctionne
3. Hypothesis Testing - Tester une hypothèse à la fois
4. Implementation - Fixer seulement après compréhension

**Déclencheurs** :
- Bug complexe ou récurrent
- "ça ne marche toujours pas" après plusieurs tentatives
- Cause du bug non évidente

**RÈGLE** : "NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"

---

### @shadcn-enforcer
**Rôle** : Garantir l'usage de Shadcn UI

**Processus** :
1. Rechercher le composant dans Context7 (doc Shadcn)
2. Si trouvé → utiliser la version officielle
3. Si non trouvé → créer selon les patterns Shadcn (cva, forwardRef, cn)

**Déclencheurs** :
- Création de tout composant UI
- Tentative de créer un composant custom

**RÈGLE** : Ne jamais créer de composant UI custom si Shadcn l'a déjà.

---

### @changelog-generator
**Rôle** : Générer des changelogs user-friendly depuis Git

**Ce qu'il génère** :
- Changelog catégorisé (features, fixes, perf)
- Langage utilisateur (pas technique)
- Format adapté (App Store, dev, marketing)

**Déclencheurs** :
- Avant une release
- Après plusieurs features/fixes terminés
- Demande explicite de changelog

---

### @simplification-cascades
**Rôle** : Simplifier le code complexe en cascade

**Déclencheurs** :
- Fichier > 300 lignes
- Fonction > 50 lignes
- Code difficile à comprendre
- Imbrications profondes

---

### @design-system-extractor
**Rôle** : Extraire les patterns UI existants

**Déclencheurs** :
- Besoin de comprendre le design system existant
- Harmonisation de l'UI
- Documentation des patterns

---

### @brand-guidelines-manager
**Rôle** : Gestion de la charte graphique

**Déclencheurs** :
- Questions sur couleurs, typo, styles
- Création de nouveaux éléments visuels
- Vérification de conformité à la charte

---

## Règles d'or

1. **Ne jamais demander de screenshot** → Utiliser Chrome DevTools automatiquement
2. **Ne jamais coder sans doc** → Consulter Context7 d'abord pour chaque librairie
3. **Ne jamais créer d'UI custom** → Vérifier Shadcn via @shadcn-enforcer d'abord
4. **Toujours review le code** → code-reviewer après modifications significatives
5. **Toujours vérifier la sécurité** → security-auditor pour tout code auth/data
6. **Toujours tester l'accessibilité** → ui-accessibility-checker pour les composants interactifs
7. **Toujours valider le responsive** → responsive-tester pour les nouvelles interfaces
8. **Toujours documenter** → git-commit-helper pour les commits, doc-generator pour les APIs

---

## Matrice de décision rapide

| Situation | Agent/Outil à utiliser |
|-----------|------------------------|
| Bug sur la page | Chrome DevTools → bug-hunter |
| Nouvelle feature floue | @brainstorming |
| Créer un composant | Context7 + @shadcn-enforcer + component-generator |
| Modifier la DB | db-migration-helper |
| Code touche à l'auth | security-auditor |
| App lente | performance-profiler |
| Code complexe | refactor-assistant |
| Nouveau formulaire | data-validator + ui-accessibility-checker |
| Avant commit | code-reviewer + git-commit-helper |
| Avant refactoring | git-commit-helper (checkpoint) |
| Avant migration DB | git-commit-helper (checkpoint + tag) |
| Mise en place CI/CD | ci-cd-automator |
| Déploiement production | deployment-helper |
| Avant production | security-auditor + performance-profiler + deployment-helper |

---
