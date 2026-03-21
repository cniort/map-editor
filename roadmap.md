# CartoCycle — Roadmap de développement

## Vue d'ensemble

CartoCycle est une application web locale permettant de générer des cartes d'itinéraires cyclables de qualité print. L'application produit des exports SVG et PNG haute résolution à partir de données géographiques (Natural Earth, GPX) avec un contrôle total sur le rendu graphique.

**Stack** : React + Vite + TypeScript + D3.js + Zustand + shadcn/ui + Tailwind CSS

---

## Phase 1 — Fondations (MVP) [TERMINEE]

> Setup projet, fond de carte Natural Earth (Europe), import GPX, simplification/lissage Douglas-Peucker + Catmull-Rom, villes basiques, export SVG, undo/redo, zoom/pan D3.

---

## Phase 2 — Interface complète [TERMINEE]

> Panneaux de configuration complets, lissage des frontières, styles par pays (France dédiée), export PNG, géocodage Nominatim, catégories de villes, annotations texte, presets de format (A4/A3/DL).

---

## Phase 3 — Polish [TERMINEE]

> Fonts Gotham (15 fichiers OTF intégrés), ombres portées SVG, raccourcis clavier (Ctrl+Z/S/E), sauvegarde auto localStorage, refonte UI icônes Lucide.

---

## Audit post-Phase 3 [TERMINE]

> 4 audits (bugs, sécurité, UX, code quality) + avis critique Rodin. 14 bugs corrigés, 10 améliorations sécurité, architecture undo/redo refondée.

---

## Refonte tri-panneaux [TERMINEE]

> Layout tri-panneaux validé par Rodin. Panneau gauche (calques/arborescence), centre (canvas), panneau droit (propriétés contextuelles style Figma). Concept de sélection ajouté au store.

---

## Système de thèmes [TERMINE]

> 3 thèmes CSS : Classique (clair), Figma (sombre charcoal), Sombre (indigo profond inspiré Phototech). Toggle dans la page Paramètres. Persisté en localStorage.

---

## Corrections récentes [TERMINEE]

- [x] Annotations géolocalisées (geoCoordinates optionnel, projetées dynamiquement)
- [x] Drag & drop des annotations sur le canvas
- [x] Export SVG/PNG restauré dans le panneau droit (propriétés Canvas)
- [x] Saisie manuelle de villes restaurée
- [x] Import CSV restauré
- [x] Ajout/suppression de catégories de villes restauré
- [x] Fond de label configurable (activer/désactiver, couleur, opacité, padding)
- [x] dominantBaseline utilise la valeur du style (plus hardcodé)
- [x] Border radius réduit (10px → 6px)
- [x] Tailles de texte homogénéisées (minimum 11px)
- [x] Input shadcn réduit (h-7, text-xs par défaut)
- [x] Page Paramètres avec sélection visuelle du thème + raccourcis clavier
- [x] Panneau gauche scrollable (overflow natif)
- [x] Fichiers projet aussi exportés en .json (compatibilité Finder macOS)

---

## Bugs résolus

- [x] Zoom/pan : refonte complète — useEffect créé une seule fois, dépend de `loading` pour s'attacher quand le SVG existe
- [x] Cause racine zoom : le SVG n'existe pas au premier render (loading=true → retourne un div), le useEffect([]) ne se ré-exécutait jamais
- [x] ColorPicker : button-in-button corrigé (causait erreur hydration React qui cassait les events)
- [x] Recherche de villes → bouton "+ Ville" dans le LayerPanel avec recherche Nominatim intégrée
- [x] Clic sur zone vide du canvas → sélectionne Canvas (affiche propriétés générales)
- [x] Boutons format : se désélectionnent visuellement quand l'overlay est masqué
- [x] Icône reset vue : changée en LocateFixed (évite confusion avec plein écran)
- [x] Plein écran : panneaux glissent via margin négatif (animation fluide)
- [x] Oeil calques : apparaît au hover avec frame bg-primary/10
- [x] Poubelle calques : centrée dans sa frame, hover destructive/15
- [x] Migration 12 select natifs → shadcn Select + 3 checkboxes → Switch
- [x] Audit UI : harmonisation tailles texte, paddings, alignements

---

## Phase 4 — Interactions directes et UX avancée [TERMINEE]

### 4.1 Drag & drop sur la carte (PRIORITE HAUTE)

- [x] Annotations texte déplaçables par clic-glisser — FAIT
- [ ] Labels de villes déplaçables indépendamment du marqueur
- [ ] Trait de rappel (leader line) quand un label est éloigné de son point
- [ ] Curseur contextuel (move/crosshair) au survol des éléments interactifs
- [ ] Mode sélection vs mode pan (toggle dans la toolbar)

### 4.2 Prévisualisation du format print (PRIORITE HAUTE)

- [ ] Rectangle aux proportions du format choisi affiché sur le canvas
- [ ] Zone hors format assombrie (masque de découpe)
- [ ] Le canvas de travail respecte les proportions du format de sortie

### 4.3 Barre d'échelle kilométrique

- [ ] Barre d'échelle SVG calculée dynamiquement depuis la projection
- [ ] Position et style configurables

### 4.4 Légende auto-générée

- [ ] Génération depuis les tracés et catégories visibles
- [ ] Position configurable (drag & drop)
- [ ] Style du cadre configurable

### 4.5 Gestion du z-index dans l'UI

- [ ] Boutons haut/bas ou drag & drop pour réordonner couches et tracés

### 4.6 Overlay informations carte

- [ ] Coordonnées géographiques du curseur (lon/lat)
- [ ] Niveau de zoom affiché

### 4.7 Améliorations UX secondaires

- [ ] Saisie directe dans les sliders (valeur numérique éditable)
- [ ] Prévisualisation visuelle des styles de tirets (miniatures SVG)
- [ ] Double-clic canvas = reset zoom
- [ ] Compteurs dans les titres d'accordion
- [ ] Feedback de chargement progressif

---

## Phase 5 — Page Paramètres étendue [TERMINEE]

### 5.1 Paramètres d'interface

- [ ] Taille d'interface : Standard / Grande (augmente taille typos, boutons, paddings globalement)
- [ ] Panneaux flottants style Figma (padding autour, radius, ombre légère, pas collés aux bords)
- [ ] Mode panneau : collé (actuel) vs flottant (style Figma récent)
- [ ] Intervalle d'autosave configurable
- [ ] Nombre max d'undo configurable
- [ ] Couleurs favorites / presets

### 5.2 Refonte visuelle

- [ ] Remplacer les select natifs par des composants shadcn/ui cohérents
- [ ] Scale typographique documentée
- [ ] Espacement standardisé
- [ ] Icônes Lucide pour toutes les actions (supprimer = Trash2, etc.)

---

## Phase 6 — Conversion unités et export print-ready [TERMINEE]

### 6.1 Système de conversion mm/pixels

- [ ] Couche de conversion unités de travail (px) → unités d'impression (mm/pt)
- [ ] Épaisseurs de traits et tailles de police en mm/pt
- [ ] Prévisualisation fidèle à la taille d'impression

### 6.2 Polices embarquées dans le SVG

- [ ] @font-face Gotham intégré dans le SVG exporté
- [ ] Ou conversion textes en chemins vectoriels (outlines)

---

## Phase 7 — Fonctionnalités éditeur graphique pro [EN COURS]

### 7.1 Presets de style / looks de carte

- [ ] Sauvegarder un "look" complet : palette de couleurs + épaisseurs + typographie + lissage
- [ ] Presets intégrés : "Scandibérique" (rouge, Gotham Bold, France gris foncé), "Vélodyssée" (bleu, style côtier), "Neutre" (gris, minimaliste)
- [ ] Appliquer un preset en un clic pour changer tout le style de la carte
- [ ] Créer et sauvegarder ses propres presets
- [ ] Accélérer la production en série (même itinéraire, plusieurs styles)

### 7.2 Mode présentation et mockups

- [ ] Mode plein écran : masquer les panneaux pour voir la carte seule
- [ ] Intégration dans des mockups prédéfinis :
  - Slide PowerPoint 16/9 (1920x1080) avec titre, sous-titre, logo
  - Publication Instagram carrée (1080x1080) avec bandeau titre
  - Publication Instagram portrait (1080x1350) avec zone texte
  - Story Instagram (1080x1920)
  - Format flyer DL avec zones texte et logo
- [ ] Chaque mockup superpose des éléments (titres, logos, cadres) au-dessus de la carte
- [ ] Export du mockup complet (carte + éléments superposés) en PNG/SVG
- [ ] Bibliothèque de mockups personnalisables

### 7.3 Pipette / color picker depuis la carte

- [ ] Cliquer sur un élément de la carte pour récupérer sa couleur
- [ ] Raccourci clavier (ex: I) pour activer le mode pipette
- [ ] Affichage du code hex de la couleur survolée

### 7.4 Repositionnement libre des labels de villes

- [ ] Par défaut : le label est positionné selon l'offset défini dans la catégorie (ex: à droite du point)
- [ ] L'utilisateur peut repositionner le label tout autour du point (8 positions : N, NE, E, SE, S, SO, O, NO)
- [ ] La distance au point reste la même (définie par l'offset de la catégorie), seul l'angle change
- [ ] Interface : clic sur le label ou sur un sélecteur de position (8 boutons en cercle) dans les propriétés de la ville
- [ ] Override individuel par ville, sans modifier la catégorie

---

## V2 — Évolutions futures

### Datasets custom

- [ ] Import de datasets géographiques en overlay (GeoJSON/TopoJSON)
- [ ] Cas d'usage : zones viticoles, parcs naturels, régions, bassins fluviaux
- [ ] Noms tirés automatiquement de la base de données
- [ ] Objectif : alimenter réseaux sociaux, site web, supports de communication

### Patterns et textures de remplissage

- [ ] Patterns SVG : rayures, pointillés, grille, hachures
- [ ] Configurables : angle, espacement, épaisseur, couleur
- [ ] Applicable à toute zone (pays, régions, zones custom)
- [ ] Bibliothèque de patterns prédéfinis + custom

### Zones côtières graphiques

- [ ] Buffers successifs autour du littoral avec opacités faibles
- [ ] Rendu arrondi/lissé pour évoquer la mer
- [ ] Inspiré de la carte Vélodyssée existante

### Zoom adaptatif avancé

- [ ] Fit to route / Fit to zone
- [ ] Zoom par échelle géographique prédéfinie

### Multi-utilisateurs (si pertinent)

- [ ] Déploiement web (Vercel/VPS)
- [ ] Base de données pour la persistance
- [ ] Authentification et partage de projets

---

## Notes d'architecture

### Séparation document/vue (Rodin)
Séparer le store en "document store" (sérialisable) et "view store" (éphémère : zoom, sélection, taille canvas).

### Hybridation D3/React (Rodin)
Le zoom D3 manipule le DOM directement. Stocker la ZoomTransform dans une ref React et la réappliquer au remontage.

### Données géo en singleton
Migrer useGeoData vers un cache module-level ou store dédié pour éviter le double fetch.

### Race condition géocodage
Ajouter AbortController pour n'afficher que la dernière réponse Nominatim.

### Scalabilité sans BDD
L'architecture fichiers JSON + localStorage supporte des dizaines d'itinéraires et centaines de POI. BDD nécessaire uniquement pour multi-utilisateurs ou >10 000 POI.
