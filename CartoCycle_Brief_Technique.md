# CartoCycle — Brief technique complet

## 1. Vision du projet

### Contexte

La Coordination Mutualisée des Véloroutes (CMV) produit des supports de communication print (flyers, brochures, affiches) pour ses itinéraires cyclables, notamment La Scandibérique (EuroVelo 3) et La Vélodyssée (EuroVelo 1). Ces supports intègrent des cartes géographiques montrant le tracé des itinéraires, les villes étapes, et le contexte géographique (frontières, pays voisins, littoral).

Actuellement, ces cartes sont créées manuellement dans des outils comme Adobe Express ou Illustrator, ce qui pose plusieurs problèmes :

- **Pas de reproductibilité** : chaque modification (ajout d'une ville, changement de couleur, nouveau format) nécessite un travail manuel complet.
- **Pas de précision géographique** : les villes et tracés sont positionnés approximativement, pas géolocalisés.
- **Pas de cohérence** : difficile de maintenir une charte graphique homogène entre plusieurs cartes.
- **Pas de flexibilité de format** : passer d'un format A5 à un A3 ou changer le cadrage nécessite de tout refaire.

### Objectif

Développer une **application web** permettant de générer des cartes d'itinéraires cyclables de qualité print, avec une interface graphique offrant un contrôle total sur tous les paramètres visuels. L'application doit produire des exports SVG et PNG haute résolution, directement exploitables dans un workflow de production print (InDesign, Illustrator, etc.).

### Utilisateurs cibles

- **V1** : Corentin (marketing/digital manager CMV), usage local.
- **V2 (optionnel, prévoir dans l'architecture)** : autres membres de l'équipe CMV et partenaires EuroVelo, via un déploiement web (Vercel ou VPS).

---

## 2. Périmètre fonctionnel

### 2.1 Gestion de la carte (canvas principal)

L'interface principale est un **canvas de prévisualisation en temps réel** affichant la carte telle qu'elle sera exportée. L'utilisateur interagit avec ce canvas pour :

- **Zoomer / dézoomer** : molette ou contrôles UI. Le niveau de zoom définit l'emprise géographique visible (ex: France entière, quart sud-ouest, Europe de l'Ouest).
- **Se déplacer (pan)** : drag & drop sur le canvas pour ajuster le cadrage.
- **Définir le format de sortie** : dimensions en mm ou px, orientation portrait/paysage. Exemples : 100×210 mm (format DL du flyer actuel), A4, A3, format libre.
- **Verrouiller le cadrage** : une fois le bon zoom/position trouvé, figer l'emprise pour travailler sur les détails sans risque de décaler la carte.

### 2.2 Fond de carte

Le fond de carte affiche les éléments géographiques de contexte. Chaque couche est activable/désactivable indépendamment :

| Couche | Description | Source de données |
|--------|-------------|-------------------|
| Frontières nationales | Contours des pays | Natural Earth (1:10m ou 1:50m) |
| Littoral / trait de côte | Limites terre-mer | Natural Earth |
| Surface des pays | Remplissage coloré par pays | Natural Earth |
| Surface maritime | Couleur de fond pour la mer/océan | Dérivé du littoral |
| Fleuves principaux | Loire, Garonne, Seine, etc. | Natural Earth ou OSM |
| Limites régionales | Régions françaises | Admin Express (IGN) ou Natural Earth |
| Limites départementales | Départements français | Admin Express (IGN) ou Natural Earth |

**Paramètres graphiques par couche :**

- Couleur de remplissage (fill) avec sélecteur colorimétrique + saisie hexadécimale
- Couleur du contour (stroke)
- Épaisseur du contour (stroke-width, en px ou pt)
- Opacité (0-100%)
- Activation/désactivation (toggle on/off)

**Paramètres spécifiques au fond :**

- Couleur de fond globale (arrière-plan derrière toute la carte, utile pour la mer)
- Possibilité de colorer chaque pays individuellement (ex: France en gris clair, pays voisins en gris plus foncé)

### 2.3 Tracé d'itinéraire

L'application permet de charger un ou plusieurs itinéraires sur la carte.

**Chargement du tracé :**

- **Import de fichier** : glisser-déposer ou sélection d'un fichier GPX ou GeoJSON depuis le disque local.
- **Fetch automatique (V2, optionnel)** : récupérer un tracé depuis l'API Overpass d'OpenStreetMap en saisissant un identifiant de relation OSM (ex: relation EV3). Prévoir l'emplacement dans l'UI même si non développé en V1.

**Simplification et lissage du tracé :**

C'est une fonctionnalité clé. Le tracé GPS brut contient souvent trop de détails (virages serrés, zigzags) qui nuisent à la lisibilité sur une carte print à petite échelle. L'application doit proposer :

- **Slider "Simplification"** : applique l'algorithme de Douglas-Peucker pour réduire le nombre de points. Le slider contrôle le paramètre de tolérance (epsilon). À gauche = tracé brut, à droite = tracé très simplifié.
- **Slider "Lissage"** : applique un lissage par interpolation spline (courbes de Bézier cubiques ou Catmull-Rom) sur le tracé simplifié. À gauche = angles vifs, à droite = courbes très adoucies.
- **Affichage en temps réel** : chaque mouvement de slider met à jour le tracé sur le canvas instantanément.
- **Indicateur du nombre de points** : afficher le nombre de points du tracé original vs simplifié pour donner un feedback quantitatif.

**Paramètres graphiques du tracé :**

- Couleur (stroke)
- Épaisseur (stroke-width)
- Style de ligne : continu, pointillés (dash pattern configurable), tirets
- Opacité
- Terminaison de ligne (stroke-linecap : round, square, butt)
- Jointure de ligne (stroke-linejoin : round, miter, bevel)
- Ombre portée optionnelle (offset, blur, couleur, opacité) pour détacher visuellement le tracé du fond de carte
- Z-index (ordre d'empilement par rapport aux autres éléments)

**Multi-itinéraires :**

- Possibilité de charger plusieurs tracés simultanément (ex: EV3 + EV1 sur la même carte).
- Chaque tracé a ses propres paramètres graphiques.
- Liste des tracés chargés dans un panneau latéral avec possibilité de réordonner, masquer, supprimer.

### 2.4 Villes et points d'intérêt

L'utilisateur peut placer des villes et points d'intérêt sur la carte.

**Ajout de villes :**

- **Recherche géocodée** : saisir le nom d'une ville, l'application propose des résultats avec coordonnées GPS (via API Nominatim d'OSM, gratuite). Sélectionner un résultat place automatiquement le point aux bonnes coordonnées.
- **Placement manuel** : clic sur la carte pour placer un point, puis saisir le nom manuellement.
- **Import en lot** : charger un fichier CSV/JSON contenant une liste de villes avec leurs coordonnées et métadonnées (nom, type, taille).

**Catégories de points :**

Chaque point appartient à une catégorie (ex: "Ville principale", "Ville étape", "Point d'intérêt", "Ville de passage"). Les catégories sont créées et configurées par l'utilisateur. Chaque catégorie définit des valeurs par défaut pour :

- **Marqueur** : forme (cercle, carré, losange, triangle, ou SVG custom), taille (rayon en px/pt), couleur de remplissage, couleur de contour, épaisseur de contour.
- **Label** : police (parmi une liste de web fonts + possibilité de charger des fonts custom), taille, couleur, graisse (regular, medium, bold), style (normal, italic), espacement des lettres (letter-spacing).
- **Positionnement du label** : décalage par rapport au point (offset x/y), ancrage (haut, bas, gauche, droite, auto), rotation optionnelle.

Chaque point individuel peut ensuite **surcharger** les valeurs de sa catégorie (ex: Paris en plus gros que les autres "Villes principales").

**Gestion des collisions de labels :**

- Détection automatique des chevauchements entre labels.
- Suggestion de repositionnement (décalage automatique).
- Possibilité de déplacer manuellement chaque label indépendamment de son point (drag & drop du label uniquement, avec un trait de rappel optionnel vers le point).

### 2.5 Annotations et éléments graphiques libres

Pour enrichir la carte au-delà des données géographiques :

- **Textes libres** : placer du texte n'importe où sur la carte (ex: nom de pays "FRANCE", nom d'océan "Océan Atlantique"). Mêmes paramètres typographiques que les labels de villes + possibilité de letter-spacing large pour les noms de pays.
- **Lignes et flèches** : tracer des lignes droites ou courbes avec flèches optionnelles (utile pour des annotations).
- **Rectangles, ellipses** : formes géométriques pour encadrer une zone ou créer un fond pour un cartouche.
- **Légende** : composant pré-formaté de légende, configurable (quels éléments afficher, position sur la carte, style du cadre).
- **Logo/image** : possibilité d'importer une image (PNG, SVG) et de la placer sur la carte (ex: logo La Scandibérique dans un coin).

### 2.6 Export

**SVG (prioritaire) :**

- Export vectoriel fidèle à la prévisualisation.
- Dimensions exactes spécifiées par l'utilisateur (en mm pour le print).
- Polices embarquées ou converties en paths (outlines) pour garantir le rendu dans n'importe quel logiciel.
- Option : inclure ou exclure les calques masqués.

**PNG haute résolution :**

- Résolution configurable : 72 dpi (écran), 150 dpi (draft print), 300 dpi (print qualité), 600 dpi (print fine art). Valeur par défaut : 300 dpi.
- Fond transparent ou couleur de fond.
- Dimensions résultantes affichées en pixels avant export.

**Sauvegarde du projet :**

- Sauvegarder l'état complet de la carte (tracés chargés, villes, paramètres graphiques, cadrage) dans un fichier projet JSON.
- Rouvrir un projet sauvegardé pour reprendre le travail.
- Sauvegarde automatique dans le localStorage du navigateur (V1) puis côté serveur si multi-utilisateurs (V2).

---

## 3. Architecture technique

### 3.1 Stack recommandée

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| Framework | **React** (avec Vite ou Next.js) | Écosystème mature, composants réactifs, large communauté |
| Langage | **TypeScript** | Typage fort indispensable pour manipuler des structures géographiques complexes |
| Rendu cartographique | **D3.js** (d3-geo, d3-scale, d3-shape) | Contrôle pixel-perfect du rendu SVG, projections géographiques intégrées, bindage data → DOM |
| Manipulation géo | **Turf.js** | Opérations géospatiales côté client (simplification, buffer, centroïdes, etc.) |
| Parsing GPX | **@tmcw/togeojson** | Conversion GPX → GeoJSON légère et fiable |
| Interface utilisateur | **shadcn/ui** + **Tailwind CSS** | Composants accessibles, sliders, color pickers, cohérence UI |
| State management | **Zustand** | Léger, performant, adapté à un state complexe avec beaucoup de paramètres imbriqués |
| Export SVG | Sérialisation du DOM SVG natif | D3 génère du SVG natif dans le DOM, on le sérialise tel quel |
| Export PNG | **Canvas API** (rasterisation du SVG) | SVG → Canvas → PNG, résolution paramétrable |
| Géocodage | **API Nominatim** (OSM) | Gratuit, pas de clé API, suffisant pour le géocodage de villes |
| Données fond de carte | **Natural Earth** (GeoJSON/TopoJSON) | Données libres, multi-résolutions, standard cartographique |

### 3.2 Pourquoi D3.js plutôt que Leaflet/Mapbox

Leaflet et Mapbox sont des librairies de **cartes interactives web** (tiles, zoom fluide, panning). Elles sont excellentes pour des cartes en ligne mais inadaptées ici car :

- **Pas de contrôle SVG natif** : elles génèrent leur propre DOM avec des tuiles raster, pas un SVG pur que l'on peut exporter.
- **Pas de personnalisation profonde** : les styles sont limités aux capacités du style layer, pas de contrôle sur chaque `<path>`, `<circle>`, `<text>`.
- **Pas d'export print propre** : l'export est un screenshot, pas un vectoriel.

D3.js en revanche :

- Génère du **SVG pur** dans le DOM, chaque élément est un nœud SVG adressable.
- Offre des **projections géographiques** paramétrables (Mercator, Lambert, orthographique, etc.).
- Permet un **contrôle total** sur chaque attribut de chaque élément (couleur, épaisseur, opacité, classe CSS, etc.).
- Le SVG généré est **directement exportable** tel quel.

### 3.3 Structure du projet

```
cartocycle/
├── public/
│   └── data/
│       ├── ne_10m_admin_0_countries.json    # Frontières pays (Natural Earth TopoJSON)
│       ├── ne_10m_coastline.json            # Littoral
│       ├── ne_10m_rivers_lake_centerlines.json  # Fleuves
│       └── ne_10m_admin_1_states_provinces.json  # Régions/départements
├── src/
│   ├── components/
│   │   ├── MapCanvas.tsx          # Canvas principal SVG (rendu D3)
│   │   ├── Toolbar.tsx            # Barre d'outils supérieure
│   │   ├── SidePanel.tsx          # Panneau latéral de configuration
│   │   ├── panels/
│   │   │   ├── BaseMapPanel.tsx   # Config du fond de carte
│   │   │   ├── RoutePanel.tsx     # Config des itinéraires
│   │   │   ├── CitiesPanel.tsx    # Config des villes/POI
│   │   │   ├── AnnotationsPanel.tsx  # Textes libres, formes
│   │   │   ├── ExportPanel.tsx    # Options d'export
│   │   │   └── ProjectPanel.tsx   # Sauvegarde/chargement projet
│   │   ├── controls/
│   │   │   ├── ColorPicker.tsx    # Sélecteur de couleur (hex + visuel)
│   │   │   ├── SliderControl.tsx  # Slider avec label et valeur
│   │   │   ├── StrokeStylePicker.tsx  # Sélecteur de style de trait
│   │   │   ├── FontPicker.tsx     # Sélecteur de police
│   │   │   └── DimensionInput.tsx # Saisie de dimensions (mm/px)
│   │   └── export/
│   │       ├── SvgExporter.ts     # Sérialisation SVG
│   │       └── PngExporter.ts     # Rasterisation SVG → PNG
│   ├── stores/
│   │   ├── mapStore.ts            # State global de la carte (Zustand)
│   │   ├── routeStore.ts          # State des itinéraires
│   │   ├── citiesStore.ts         # State des villes/POI
│   │   └── projectStore.ts        # State du projet (save/load)
│   ├── hooks/
│   │   ├── useProjection.ts       # Hook de projection D3
│   │   ├── useGeoData.ts          # Chargement des données géo
│   │   ├── useRouteProcessing.ts  # Simplification + lissage
│   │   └── useLabelCollision.ts   # Détection de collisions
│   ├── utils/
│   │   ├── geo.ts                 # Helpers géographiques
│   │   ├── simplify.ts            # Douglas-Peucker + lissage spline
│   │   ├── geocode.ts             # Appels API Nominatim
│   │   └── exportUtils.ts         # Helpers d'export
│   ├── types/
│   │   └── index.ts               # Types TypeScript globaux
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vite.config.ts
```

### 3.4 Modèle de données (types TypeScript)

```typescript
// === Projet ===
interface CartoCycleProject {
  version: string;                  // Version du format de fichier
  name: string;
  createdAt: string;
  updatedAt: string;
  canvas: CanvasConfig;
  baseMap: BaseMapConfig;
  routes: RouteConfig[];
  cities: CityConfig[];
  cityCategories: CityCategory[];
  annotations: Annotation[];
  legend: LegendConfig;
}

// === Canvas ===
interface CanvasConfig {
  widthMm: number;                  // Largeur en mm
  heightMm: number;                 // Hauteur en mm
  projection: ProjectionConfig;
  backgroundColor: string;          // Hex, ex: "#E6F1FB"
  locked: boolean;                  // Cadrage verrouillé
}

interface ProjectionConfig {
  type: "mercator" | "lambertConformalConic" | "equirectangular" | "conicEqualArea";
  center: [number, number];         // [longitude, latitude]
  scale: number;                    // Facteur de zoom D3
  translate: [number, number];      // Décalage en pixels
  clipExtent?: [[number, number], [number, number]];  // Zone de clip
}

// === Fond de carte ===
interface BaseMapConfig {
  layers: BaseMapLayer[];
}

interface BaseMapLayer {
  id: string;
  type: "countries" | "coastline" | "rivers" | "regions" | "departments";
  visible: boolean;
  zIndex: number;
  style: ShapeStyle;
  // Pour les pays : styles individuels par pays
  countryOverrides?: Record<string, Partial<ShapeStyle>>;  // clé = ISO code pays
}

interface ShapeStyle {
  fill: string;                     // Couleur hex
  fillOpacity: number;              // 0-1
  stroke: string;                   // Couleur hex
  strokeWidth: number;              // En px
  strokeOpacity: number;            // 0-1
  strokeDasharray?: string;         // Ex: "5,3" pour pointillés
}

// === Itinéraires ===
interface RouteConfig {
  id: string;
  name: string;                     // Ex: "La Scandibérique (EV3)"
  visible: boolean;
  zIndex: number;
  sourceFile: string;               // Nom du fichier GPX/GeoJSON importé
  originalGeometry: GeoJSON.LineString | GeoJSON.MultiLineString;
  simplification: number;           // 0 = brut, 1 = max simplification (tolérance Douglas-Peucker)
  smoothing: number;                // 0 = angles vifs, 1 = max lissage (tension spline)
  style: RouteStyle;
}

interface RouteStyle extends ShapeStyle {
  strokeLinecap: "round" | "square" | "butt";
  strokeLinejoin: "round" | "miter" | "bevel";
  shadow?: ShadowConfig;
}

interface ShadowConfig {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  opacity: number;
}

// === Villes ===
interface CityCategory {
  id: string;
  name: string;                     // Ex: "Ville principale"
  markerStyle: MarkerStyle;
  labelStyle: LabelStyle;
}

interface MarkerStyle {
  shape: "circle" | "square" | "diamond" | "triangle" | "custom";
  customSvg?: string;               // SVG inline si shape = "custom"
  size: number;                     // Rayon ou demi-côté en px
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
}

interface LabelStyle {
  fontFamily: string;
  fontSize: number;                 // En px
  fontWeight: 400 | 500 | 600 | 700;
  fontStyle: "normal" | "italic";
  color: string;
  letterSpacing: number;            // En px
  offset: { x: number; y: number }; // Décalage par rapport au point
  anchor: "start" | "middle" | "end";
  baseline: "auto" | "hanging" | "central" | "alphabetic";
  rotation: number;                 // En degrés
  showLeaderLine: boolean;          // Trait de rappel si label déplacé
}

interface CityConfig {
  id: string;
  name: string;
  coordinates: [number, number];    // [longitude, latitude]
  categoryId: string;
  visible: boolean;
  // Surcharges individuelles (optionnelles)
  markerOverride?: Partial<MarkerStyle>;
  labelOverride?: Partial<LabelStyle>;
  // Position manuelle du label (si déplacé par l'utilisateur)
  labelPosition?: { x: number; y: number };
}

// === Annotations ===
type Annotation =
  | TextAnnotation
  | LineAnnotation
  | RectAnnotation
  | EllipseAnnotation
  | ImageAnnotation;

interface TextAnnotation {
  type: "text";
  id: string;
  content: string;
  position: { x: number; y: number };  // En coordonnées carte
  style: LabelStyle;
  zIndex: number;
}

interface LineAnnotation {
  type: "line";
  id: string;
  points: { x: number; y: number }[];
  style: ShapeStyle;
  arrowStart: boolean;
  arrowEnd: boolean;
  zIndex: number;
}

interface RectAnnotation {
  type: "rect";
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  style: ShapeStyle;
  borderRadius: number;
  zIndex: number;
}

interface EllipseAnnotation {
  type: "ellipse";
  id: string;
  center: { x: number; y: number };
  rx: number;
  ry: number;
  style: ShapeStyle;
  zIndex: number;
}

interface ImageAnnotation {
  type: "image";
  id: string;
  src: string;                      // Data URL ou chemin
  position: { x: number; y: number };
  width: number;
  height: number;
  opacity: number;
  zIndex: number;
}

// === Légende ===
interface LegendConfig {
  visible: boolean;
  position: { x: number; y: number };
  width: number;
  style: {
    backgroundColor: string;
    backgroundOpacity: number;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    padding: number;
    fontFamily: string;
    fontSize: number;
    fontColor: string;
    titleFontSize: number;
    titleFontWeight: number;
  };
  title: string;
  items: LegendItem[];
}

interface LegendItem {
  type: "route" | "city" | "custom";
  label: string;
  routeId?: string;                 // Référence vers un itinéraire
  categoryId?: string;              // Référence vers une catégorie de ville
  customSymbol?: string;            // SVG inline
  customColor?: string;
}
```

---

## 4. Spécifications de l'interface utilisateur

### 4.1 Layout général

```
┌──────────────────────────────────────────────────────────┐
│  Toolbar : [Projet v] [Export v] [Zoom: -/+/fit] [Lock] │
├──────────────────────┬───────────────────────────────────┤
│                      │                                   │
│   Panneau latéral    │      Canvas de prévisualisation   │
│   (280px fixe)       │      (SVG, espace restant)        │
│                      │                                   │
│   ┌────────────────┐ │                                   │
│   │ Fond de carte  │ │                                   │
│   ├────────────────┤ │                                   │
│   │ Itinéraires    │ │                                   │
│   ├────────────────┤ │                                   │
│   │ Villes         │ │                                   │
│   ├────────────────┤ │                                   │
│   │ Annotations    │ │                                   │
│   ├────────────────┤ │                                   │
│   │ Légende        │ │                                   │
│   ├────────────────┤ │                                   │
│   │ Export         │ │                                   │
│   └────────────────┘ │                                   │
│                      │                                   │
└──────────────────────┴───────────────────────────────────┘
```

- Le **panneau latéral gauche** contient des sections repliables (accordéon). Chaque section correspond à une catégorie de paramètres.
- Le **canvas central** occupe tout l'espace restant et affiche la carte en temps réel.
- La **toolbar supérieure** donne accès aux actions globales (projet, export, zoom, verrouillage du cadrage).

### 4.2 Interactions sur le canvas

- **Zoom** : molette de souris (ou pinch sur trackpad). Modifie le paramètre `scale` de la projection D3.
- **Pan** : clic gauche maintenu + déplacement. Modifie le paramètre `translate` de la projection D3.
- **Sélection** : clic sur un élément (ville, annotation) pour l'éditer dans le panneau latéral.
- **Déplacement de label** : clic + drag sur un label de ville pour ajuster son positionnement. Un trait de rappel (leader line) apparaît vers le point associé si activé.
- **Clic droit** : menu contextuel (supprimer, dupliquer, modifier les propriétés).

### 4.3 Panneau "Fond de carte"

Pour chaque couche (pays, littoral, fleuves, régions, départements) :

- Toggle on/off
- Sélecteur de couleur fill + champ hex
- Sélecteur de couleur stroke + champ hex
- Slider épaisseur stroke (0.1 à 5 px, pas de 0.1)
- Slider opacité (0 à 100%)
- Sélecteur de résolution des données (1:10m détaillé / 1:50m léger / 1:110m très simplifié)

Section spéciale "Pays individuels" : liste des pays visibles dans l'emprise actuelle, chacun avec son propre override de couleur.

### 4.4 Panneau "Itinéraires"

- Bouton "Importer GPX/GeoJSON" (ouvre le sélecteur de fichier).
- Liste des itinéraires chargés (drag & drop pour réordonner le z-index).
- Pour chaque itinéraire :
  - Nom éditable
  - Toggle visibilité
  - Slider "Simplification" (0-100) avec affichage du nombre de points
  - Slider "Lissage" (0-100)
  - Sélecteur de couleur
  - Slider épaisseur (0.5 à 10 px)
  - Sélecteur de style de ligne (continu, pointillés courts, pointillés longs, tirets, tirets-points)
  - Sélecteur linecap et linejoin
  - Section "Ombre" repliable avec toggle + paramètres
  - Bouton "Supprimer"

### 4.5 Panneau "Villes"

- Section "Catégories" :
  - Liste des catégories créées
  - Bouton "Ajouter une catégorie"
  - Pour chaque catégorie : nom, config marqueur, config label (tous les paramètres détaillés dans le modèle de données)

- Section "Villes" :
  - Champ de recherche géocodée (autocomplete via Nominatim)
  - Liste des villes placées, groupées par catégorie
  - Pour chaque ville : nom, coordonnées (lecture seule), catégorie (dropdown), surcharges individuelles
  - Bouton "Import CSV"

### 4.6 Panneau "Export"

- Format : SVG ou PNG (radio)
- Si SVG :
  - Dimensions en mm (largeur × hauteur)
  - Option "Convertir textes en chemins" (outlines)
  - Bouton "Exporter SVG"
- Si PNG :
  - Dimensions en mm (largeur × hauteur)
  - Résolution (dropdown : 72 / 150 / 300 / 600 dpi)
  - Affichage de la taille résultante en pixels
  - Option fond transparent
  - Bouton "Exporter PNG"

---

## 5. Algorithmes clés

### 5.1 Simplification de tracé (Douglas-Peucker)

L'algorithme Douglas-Peucker réduit le nombre de points d'une polyline en éliminant les points qui s'écartent de moins d'une tolérance ε de la ligne droite entre deux points conservés.

**Implémentation recommandée** : utiliser `turf.simplify()` de Turf.js qui encapsule cet algorithme.

```typescript
import { simplify } from "@turf/simplify";

// tolerance: 0.001 (quasi brut) à 0.1 (très simplifié)
const simplified = simplify(geojsonFeature, {
  tolerance: epsilon,
  highQuality: true  // Utilise Ramer-Douglas-Peucker (plus lent mais meilleur)
});
```

Le slider UI (0-100) doit être mappé sur une échelle exponentielle pour la tolérance, car les effets visuels sont non-linéaires :

```typescript
// sliderValue: 0-100
const epsilon = Math.pow(10, -4 + sliderValue * 3 / 100);
// sliderValue=0 → epsilon=0.0001 (quasi brut)
// sliderValue=50 → epsilon=0.003
// sliderValue=100 → epsilon=0.1 (très simplifié)
```

### 5.2 Lissage par splines

Après simplification, le lissage adoucit les angles en remplaçant les segments droits par des courbes.

**Approche recommandée** : interpolation Catmull-Rom spline (variante de Cardinal spline avec tension=0.5 par défaut). D3 fournit `d3.curveCatmullRom` nativement dans `d3-shape`.

```typescript
import { line, curveCatmullRom } from "d3-shape";

const pathGenerator = line<[number, number]>()
  .x(d => projection(d)![0])
  .y(d => projection(d)![1])
  .curve(curveCatmullRom.alpha(tension));  // tension: 0 (droit) à 1 (très lissé)
```

Le slider "Lissage" contrôle le paramètre alpha (0 à 1).

### 5.3 Projection géographique

D3 gère les projections nativement. La projection recommandée pour la France est la **conique conforme de Lambert** (proche de la projection officielle française Lambert 93) :

```typescript
import { geoConicConformalConic } from "d3-geo";

const projection = geoConicConformal()
  .center([2.5, 46.5])        // Centre de la France
  .parallels([44, 49])         // Parallèles de référence
  .scale(2500)                 // Ajuster selon le zoom
  .translate([width / 2, height / 2]);
```

Pour un usage plus générique (carte à l'échelle européenne), **Mercator** fonctionne bien :

```typescript
import { geoMercator } from "d3-geo";

const projection = geoMercator()
  .center([2, 46])
  .scale(1500)
  .translate([width / 2, height / 2]);
```

Le choix de la projection doit être un paramètre configurable dans l'interface.

### 5.4 Détection de collision de labels

Pour chaque label, calculer sa bounding box (position + dimensions approximées basées sur la longueur du texte × font size). Comparer toutes les paires de bounding boxes. En cas de chevauchement :

1. Tenter un repositionnement automatique (essayer les 4 positions cardinales autour du point).
2. Si aucune position ne résout la collision, signaler visuellement (contour rouge sur le label) et laisser l'utilisateur déplacer manuellement.

Librairie utile : `d3-force` peut être détourné pour appliquer une force de répulsion entre labels tout en les gardant proches de leur point d'ancrage.

---

## 6. Sources de données géographiques

### 6.1 Natural Earth (fond de carte)

- **Site** : https://www.naturalearthdata.com/
- **Format** : télécharger en Shapefile puis convertir en TopoJSON (plus compact) via `topojson-server` CLI.
- **Résolutions** :
  - 1:10m (détaillé, fichiers plus lourds, adapté zoom sur un pays)
  - 1:50m (intermédiaire, bon compromis)
  - 1:110m (très simplifié, adapté vue continentale)
- **Fichiers nécessaires** :
  - `ne_10m_admin_0_countries` : frontières nationales
  - `ne_10m_coastline` : littoral
  - `ne_10m_rivers_lake_centerlines` : fleuves
  - `ne_10m_admin_1_states_provinces` : régions/provinces (filtrer sur ISO pays pour les régions françaises)

### 6.2 Tracés d'itinéraires

- **Source principale** : fichiers GPX/GeoJSON fournis par l'utilisateur.
- **Source alternative (V2)** : API Overpass pour récupérer les relations EuroVelo depuis OpenStreetMap.
- **Formats supportés en entrée** : GPX, GeoJSON. La conversion GPX → GeoJSON se fait côté client via `@tmcw/togeojson`.

### 6.3 Géocodage des villes

- **API Nominatim** : https://nominatim.openstreetmap.org/search
- **Limites** : 1 requête/seconde (respect des conditions d'utilisation OSM), pas de clé API.
- **Format de requête** : `GET /search?q=Bordeaux&format=json&limit=5`
- **Réponse** : nom complet, coordonnées lat/lon, type de lieu.

---

## 7. Contraintes et exigences non-fonctionnelles

### 7.1 Performance

- Le rendu du canvas doit être fluide (>30 fps) lors du pan/zoom avec un fond de carte 1:50m et un itinéraire de 10 000 points.
- Les sliders de simplification/lissage doivent mettre à jour le tracé en temps réel sans latence perceptible.
- Stratégie de performance : utiliser le TopoJSON (plus compact), simplifier les géométries du fond de carte selon le niveau de zoom (Level of Detail), et appliquer un debounce sur les sliders si nécessaire.

### 7.2 Qualité d'export

- L'export SVG doit être un fichier SVG valide, importable sans perte dans Adobe Illustrator et InDesign.
- L'export PNG à 300 dpi d'un format A4 (210×297 mm) produit une image de 2480×3508 pixels.
- Les polices doivent être soit embarquées (via `@font-face` dans le SVG), soit converties en chemins vectoriels.

### 7.3 Compatibilité navigateur

- Chrome (dernière version) en priorité.
- Firefox et Safari : support secondaire.
- Pas de contrainte IE/Edge Legacy.

### 7.4 Maintenabilité

- Code TypeScript strict (`strict: true` dans tsconfig).
- Composants React documentés avec JSDoc.
- Séparation claire entre logique métier (stores, utils), rendu (composants), et configuration (types).

---

## 8. Roadmap de développement

### Phase 1 — Fondations (MVP)

Objectif : afficher une carte de France avec un tracé EV3 et quelques villes, export SVG fonctionnel.

1. Setup du projet (Vite + React + TypeScript + Tailwind + shadcn/ui).
2. Chargement et affichage du fond de carte Natural Earth via D3 (frontières pays uniquement).
3. Projection configurable (Mercator par défaut).
4. Zoom et pan sur le canvas.
5. Import d'un fichier GPX, conversion en GeoJSON, affichage du tracé.
6. Simplification (slider + Douglas-Peucker).
7. Lissage (slider + Catmull-Rom).
8. Paramètres graphiques de base du tracé (couleur, épaisseur).
9. Placement de villes (saisie manuelle de coordonnées).
10. Export SVG basique.

### Phase 2 — Interface complète

Objectif : tous les panneaux de configuration fonctionnels, export PNG.

1. Panneau fond de carte complet (toutes les couches, styles individuels par pays).
2. Panneau itinéraires complet (multi-tracés, tous les paramètres graphiques).
3. Catégories de villes avec styles configurables.
4. Recherche géocodée (Nominatim).
5. Import CSV de villes.
6. Gestion des collisions de labels.
7. Déplacement manuel des labels (drag & drop).
8. Export PNG haute résolution.
9. Sauvegarde/chargement de projet (JSON).
10. Annotations (textes libres, légende).

### Phase 3 — Polish et fonctionnalités avancées

Objectif : outil prêt pour la production quotidienne.

1. Composant légende auto-générée.
2. Import d'images/logos sur la carte.
3. Ombre portée sur les tracés.
4. Formes géométriques (rectangles, ellipses).
5. Lignes et flèches d'annotation.
6. Conversion textes en chemins (outlines) à l'export SVG.
7. Multi-résolution adaptative du fond de carte selon le zoom.
8. Raccourcis clavier (Ctrl+S, Ctrl+Z undo, Ctrl+E export).
9. Sauvegarde auto dans localStorage.
10. Fetch automatique de tracés depuis l'API Overpass (V2).

---

## 9. Données de test

Pour valider le développement, utiliser les données suivantes :

### Tracé de test : La Scandibérique (partie française)

Le fichier GPX/GeoJSON de La Scandibérique sera fourni par l'utilisateur. En attendant, un tracé de test peut être généré à partir des coordonnées des villes principales :

| Ville | Latitude | Longitude |
|-------|----------|-----------|
| Jeumont | 50.2935 | 4.0986 |
| Maubeuge | 50.2776 | 3.9734 |
| Guise | 49.8985 | 3.6282 |
| Compiègne | 49.4178 | 2.8260 |
| Paris | 48.8566 | 2.3522 |
| Orléans | 47.9029 | 1.9090 |
| Tours | 47.3941 | 0.6848 |
| Angoulême | 45.6500 | 0.1600 |
| Bordeaux | 44.8378 | -0.5792 |
| Mont-de-Marsan | 43.8900 | -0.5000 |
| Pau | 43.2951 | -0.3708 |
| St-Jean-Pied-de-Port | 43.1630 | -1.2378 |

### Fond de carte

Télécharger depuis Natural Earth :
- `ne_50m_admin_0_countries` pour commencer (plus léger que 10m).
- Convertir en TopoJSON : `npx topojson-server/geo2topo countries=ne_50m_admin_0_countries.json > countries-topo.json`

---

## 10. Critères d'acceptation

Le projet est considéré comme fonctionnel quand :

1. L'utilisateur peut charger un fichier GPX de La Scandibérique et voir le tracé s'afficher sur un fond de carte fidèle (frontières précises, littoral, forme de la France reconnaissable).
2. Les villes de la liste ci-dessus sont positionnées aux bonnes coordonnées GPS.
3. Le slider de simplification réduit visiblement le nombre de points du tracé.
4. Le slider de lissage adoucit visiblement les courbes du tracé.
5. L'utilisateur peut modifier la couleur, l'épaisseur et le style du tracé, et voir le résultat en temps réel.
6. L'utilisateur peut modifier la couleur de remplissage de la France et des pays voisins indépendamment.
7. L'export SVG produit un fichier vectoriel fidèle à la prévisualisation, ouvrable dans Illustrator.
8. L'export PNG à 300 dpi produit une image nette et haute résolution.
9. Le zoom et le pan fonctionnent de manière fluide.
10. Le projet peut être sauvegardé en JSON et rechargé sans perte.
