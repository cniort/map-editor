// === Projet ===
export interface CartoCycleProject {
  version: string
  name: string
  createdAt: string
  updatedAt: string
  canvas: CanvasConfig
  baseMap: BaseMapConfig
  routes: RouteConfig[]
  cities: CityConfig[]
  cityCategories: CityCategory[]
  annotations: Annotation[]
  legend: LegendConfig
}

// === Canvas ===
export interface CanvasConfig {
  widthMm: number
  heightMm: number
  projection: ProjectionConfig
  backgroundColor: string
  locked: boolean
}

export type ProjectionType = 'mercator' | 'lambertConformalConic' | 'equirectangular' | 'conicEqualArea'

export interface ProjectionConfig {
  type: ProjectionType
  center: [number, number]
  scale: number
  translate: [number, number]
  clipExtent?: [[number, number], [number, number]]
}

// === Fond de carte ===
export interface BaseMapConfig {
  layers: BaseMapLayer[]
}

export type BaseMapLayerType = 'countries' | 'coastline' | 'rivers' | 'regions' | 'departments'

export interface BaseMapLayer {
  id: string
  type: BaseMapLayerType
  visible: boolean
  zIndex: number
  style: ShapeStyle
  smoothing: number
  countryOverrides?: Record<string, Partial<ShapeStyle>>
}

export interface ShapeStyle {
  fill: string
  fillOpacity: number
  stroke: string
  strokeWidth: number
  strokeOpacity: number
  strokeDasharray?: string
}

// === Itinéraires ===
export interface RouteConfig {
  id: string
  name: string
  visible: boolean
  zIndex: number
  sourceFile: string
  originalGeometry: { type: 'LineString'; coordinates: number[][] } | { type: 'MultiLineString'; coordinates: number[][][] }
  simplification: number
  smoothing: number
  style: RouteStyle
}

export interface RouteStyle extends ShapeStyle {
  strokeLinecap: 'round' | 'square' | 'butt'
  strokeLinejoin: 'round' | 'miter' | 'bevel'
  shadow?: ShadowConfig
}

export interface ShadowConfig {
  enabled: boolean
  offsetX: number
  offsetY: number
  blur: number
  color: string
  opacity: number
}

// === Villes ===
export interface CityCategory {
  id: string
  name: string
  markerStyle: MarkerStyle
  labelStyle: LabelStyle
}

export type MarkerShape = 'circle' | 'square' | 'diamond' | 'triangle' | 'custom'

export interface MarkerStyle {
  shape: MarkerShape
  customSvg?: string
  size: number
  fill: string
  fillOpacity: number
  stroke: string
  strokeWidth: number
}

export interface LabelStyle {
  fontFamily: string
  fontSize: number
  fontWeight: 300 | 400 | 500 | 600 | 700
  fontStyle: 'normal' | 'italic'
  color: string
  letterSpacing: number
  offset: { x: number; y: number }
  anchor: 'start' | 'middle' | 'end'
  baseline: 'auto' | 'hanging' | 'central' | 'alphabetic'
  rotation: number
  showLeaderLine: boolean
  backgroundColor?: string
  backgroundOpacity?: number
  backgroundPadding?: number
}

export interface CityConfig {
  id: string
  name: string
  coordinates: [number, number]
  categoryId: string
  visible: boolean
  markerOverride?: Partial<MarkerStyle>
  labelOverride?: Partial<LabelStyle>
  labelPosition?: { x: number; y: number }
}

// === Annotations ===
export type Annotation =
  | TextAnnotation
  | LineAnnotation
  | RectAnnotation
  | EllipseAnnotation
  | ImageAnnotation

export interface TextAnnotation {
  type: 'text'
  id: string
  content: string
  position: { x: number; y: number }
  geoCoordinates?: [number, number]
  style: LabelStyle
  zIndex: number
}

export interface LineAnnotation {
  type: 'line'
  id: string
  points: { x: number; y: number }[]
  style: ShapeStyle
  arrowStart: boolean
  arrowEnd: boolean
  zIndex: number
}

export interface RectAnnotation {
  type: 'rect'
  id: string
  position: { x: number; y: number }
  width: number
  height: number
  style: ShapeStyle
  borderRadius: number
  zIndex: number
}

export interface EllipseAnnotation {
  type: 'ellipse'
  id: string
  center: { x: number; y: number }
  rx: number
  ry: number
  style: ShapeStyle
  zIndex: number
}

export interface ImageAnnotation {
  type: 'image'
  id: string
  src: string
  position: { x: number; y: number }
  width: number
  height: number
  opacity: number
  zIndex: number
}

// === Légende ===
export interface LegendConfig {
  visible: boolean
  position: { x: number; y: number }
  width: number
  style: {
    backgroundColor: string
    backgroundOpacity: number
    borderColor: string
    borderWidth: number
    borderRadius: number
    padding: number
    fontFamily: string
    fontSize: number
    fontColor: string
    titleFontSize: number
    titleFontWeight: number
  }
  title: string
  items: LegendItem[]
}

export interface LegendItem {
  type: 'route' | 'city' | 'custom'
  label: string
  routeId?: string
  categoryId?: string
  customSymbol?: string
  customColor?: string
}
