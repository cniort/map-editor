import { create } from 'zustand'
import type {
  CanvasConfig,
  BaseMapConfig,
  BaseMapLayer,
  RouteConfig,
  CityConfig,
  CityCategory,
  Annotation,
  LegendConfig,
  ShapeStyle,
  RouteStyle,
} from '@/types'

// === State shape ===
export interface MapState {
  canvas: CanvasConfig
  baseMap: BaseMapConfig
  routes: RouteConfig[]
  cities: CityConfig[]
  cityCategories: CityCategory[]
  annotations: Annotation[]
  legend: LegendConfig
}

// === Selection ===
export type SelectionType = 'canvas' | 'layer' | 'route' | 'city' | 'cityCategory' | 'annotation' | 'legend' | null

export interface SelectionState {
  selectedId: string | null
  selectedType: SelectionType
}

// === History (integrated in store) ===
interface HistoryState {
  _past: MapState[]
  _future: MapState[]
  canUndo: boolean
  canRedo: boolean
}

// === Actions ===
export interface MapActions {
  // Canvas
  setCanvasSize: (widthMm: number, heightMm: number) => void
  setProjection: (update: Partial<CanvasConfig['projection']>) => void
  setBackgroundColor: (color: string) => void
  toggleLock: () => void

  // Base map layers
  toggleLayerVisibility: (layerId: string) => void
  updateLayerStyle: (layerId: string, style: Partial<ShapeStyle>) => void
  updateLayerSmoothing: (layerId: string, smoothing: number) => void
  setCountryOverride: (layerId: string, countryCode: string, style: Partial<ShapeStyle>) => void

  // Routes
  addRoute: (route: RouteConfig) => void
  removeRoute: (routeId: string) => void
  updateRoute: (routeId: string, update: Partial<RouteConfig>) => void
  updateRouteStyle: (routeId: string, style: Partial<RouteStyle>) => void

  // Cities
  addCity: (city: CityConfig) => void
  removeCity: (cityId: string) => void
  updateCity: (cityId: string, update: Partial<CityConfig>) => void
  addCityCategory: (category: CityCategory) => void
  removeCityCategory: (categoryId: string) => void
  updateCityCategory: (categoryId: string, update: Partial<CityCategory>) => void

  // Annotations
  addAnnotation: (annotation: Annotation) => void
  updateAnnotation: (id: string, update: Partial<Annotation>) => void
  removeAnnotation: (id: string) => void

  // Full state
  loadState: (state: MapState) => void

  // Selection
  select: (id: string | null, type: SelectionType) => void
  clearSelection: () => void

  // Undo/Redo
  undo: () => void
  redo: () => void
}

// === Default values ===
const defaultBaseMapLayers: BaseMapLayer[] = [
  {
    id: 'countries',
    type: 'countries',
    visible: true,
    zIndex: 1,
    smoothing: 0,
    style: {
      fill: '#EDEDED',
      fillOpacity: 1,
      stroke: '#CCCCCC',
      strokeWidth: 0.5,
      strokeOpacity: 1,
    },
    countryOverrides: {
      FRA: { fill: '#DCDCDC' },
    },
  },
  {
    id: 'coastline',
    type: 'coastline',
    visible: false,
    zIndex: 2,
    smoothing: 0,
    style: { fill: 'none', fillOpacity: 0, stroke: '#999999', strokeWidth: 0.5, strokeOpacity: 1 },
  },
  {
    id: 'rivers',
    type: 'rivers',
    visible: false,
    zIndex: 3,
    smoothing: 0,
    style: { fill: 'none', fillOpacity: 0, stroke: '#88B4D0', strokeWidth: 0.5, strokeOpacity: 1 },
  },
  {
    id: 'regions',
    type: 'regions',
    visible: false,
    zIndex: 4,
    smoothing: 0,
    style: { fill: 'none', fillOpacity: 0, stroke: '#BBBBBB', strokeWidth: 0.3, strokeOpacity: 0.6 },
  },
]

const defaultState: MapState = {
  canvas: {
    widthMm: 210,
    heightMm: 297,
    projection: { type: 'mercator', center: [2, 46.5], scale: 2000, translate: [0, 0] },
    backgroundColor: '#FFFFFF',
    locked: false,
  },
  baseMap: { layers: defaultBaseMapLayers },
  routes: [],
  cities: [],
  cityCategories: [
    {
      id: 'main',
      name: 'Ville principale',
      markerStyle: { shape: 'circle', size: 4, fill: '#333333', fillOpacity: 1, stroke: '#000000', strokeWidth: 1 },
      labelStyle: {
        fontFamily: 'Inter', fontSize: 12, fontWeight: 600, fontStyle: 'normal',
        color: '#333333', letterSpacing: 0, offset: { x: 8, y: 4 },
        anchor: 'start', baseline: 'central', rotation: 0, showLeaderLine: false,
      },
    },
    {
      id: 'stage',
      name: 'Ville étape',
      markerStyle: { shape: 'circle', size: 3, fill: '#666666', fillOpacity: 1, stroke: '#333333', strokeWidth: 0.5 },
      labelStyle: {
        fontFamily: 'Inter', fontSize: 10, fontWeight: 400, fontStyle: 'normal',
        color: '#666666', letterSpacing: 0, offset: { x: 6, y: 3 },
        anchor: 'start', baseline: 'central', rotation: 0, showLeaderLine: false,
      },
    },
  ],
  annotations: [],
  legend: {
    visible: false, position: { x: 20, y: 20 }, width: 200,
    style: {
      backgroundColor: '#FFFFFF', backgroundOpacity: 0.9, borderColor: '#CCCCCC',
      borderWidth: 1, borderRadius: 4, padding: 12,
      fontFamily: 'Inter', fontSize: 11, fontColor: '#333333',
      titleFontSize: 14, titleFontWeight: 700,
    },
    title: 'Légende', items: [],
  },
}

const MAX_HISTORY = 50

function extractMapState(store: MapState): MapState {
  return {
    canvas: store.canvas,
    baseMap: store.baseMap,
    routes: store.routes,
    cities: store.cities,
    cityCategories: store.cityCategories,
    annotations: store.annotations,
    legend: store.legend,
  }
}

type StoreState = MapState & SelectionState & HistoryState & MapActions & { _stateVersion: number }

// === Store ===
export const useMapStore = create<StoreState>()((set, get) => {
  function pushHistory() {
    const state = extractMapState(get())
    const past = [...get()._past, structuredClone(state)]
    if (past.length > MAX_HISTORY) past.splice(0, past.length - MAX_HISTORY)
    set({ _past: past, _future: [], canUndo: true, canRedo: false })
  }

  return {
    ...structuredClone(defaultState),
    selectedId: null,
    selectedType: null,
    _stateVersion: 0,
    _past: [],
    _future: [],
    canUndo: false,
    canRedo: false,

    // Canvas
    setCanvasSize: (widthMm, heightMm) => {
      pushHistory()
      set({ canvas: { ...get().canvas, widthMm, heightMm } })
    },
    setProjection: (update) => {
      pushHistory()
      set({ canvas: { ...get().canvas, projection: { ...get().canvas.projection, ...update } } })
    },
    setBackgroundColor: (color) => {
      pushHistory()
      set({ canvas: { ...get().canvas, backgroundColor: color } })
    },
    toggleLock: () => {
      set({ canvas: { ...get().canvas, locked: !get().canvas.locked } })
    },

    // Base map layers
    toggleLayerVisibility: (layerId) => {
      pushHistory()
      set({
        baseMap: {
          layers: get().baseMap.layers.map((l) =>
            l.id === layerId ? { ...l, visible: !l.visible } : l
          ),
        },
      })
    },
    updateLayerStyle: (layerId, style) => {
      pushHistory()
      set({
        baseMap: {
          layers: get().baseMap.layers.map((l) =>
            l.id === layerId ? { ...l, style: { ...l.style, ...style } } : l
          ),
        },
      })
    },
    updateLayerSmoothing: (layerId, smoothing) => {
      pushHistory()
      set({
        baseMap: {
          layers: get().baseMap.layers.map((l) =>
            l.id === layerId ? { ...l, smoothing } : l
          ),
        },
      })
    },
    setCountryOverride: (layerId, countryCode, style) => {
      pushHistory()
      set({
        baseMap: {
          layers: get().baseMap.layers.map((l) =>
            l.id === layerId
              ? {
                  ...l,
                  countryOverrides: {
                    ...l.countryOverrides,
                    [countryCode]: { ...(l.countryOverrides?.[countryCode] ?? {}), ...style },
                  },
                }
              : l
          ),
        },
      })
    },

    // Routes
    addRoute: (route) => { pushHistory(); set({ routes: [...get().routes, route], _stateVersion: get()._stateVersion + 1 }) },
    removeRoute: (routeId) => { pushHistory(); set({ routes: get().routes.filter((r) => r.id !== routeId) }) },
    updateRoute: (routeId, update) => { pushHistory(); set({ routes: get().routes.map((r) => r.id === routeId ? { ...r, ...update } : r) }) },
    updateRouteStyle: (routeId, style) => {
      pushHistory()
      set({ routes: get().routes.map((r) => r.id === routeId ? { ...r, style: { ...r.style, ...style } } : r) })
    },

    // Cities
    addCity: (city) => { pushHistory(); set({ cities: [...get().cities, city] }) },
    removeCity: (cityId) => { pushHistory(); set({ cities: get().cities.filter((c) => c.id !== cityId) }) },
    updateCity: (cityId, update) => { pushHistory(); set({ cities: get().cities.map((c) => c.id === cityId ? { ...c, ...update } : c) }) },
    addCityCategory: (category) => { pushHistory(); set({ cityCategories: [...get().cityCategories, category] }) },
    removeCityCategory: (categoryId) => { pushHistory(); set({ cityCategories: get().cityCategories.filter((c) => c.id !== categoryId) }) },
    updateCityCategory: (categoryId, update) => {
      pushHistory()
      set({ cityCategories: get().cityCategories.map((c) => c.id === categoryId ? { ...c, ...update } : c) })
    },

    // Selection
    select: (id, type) => set({ selectedId: id, selectedType: type }),
    clearSelection: () => set({ selectedId: null, selectedType: null }),

    // Annotations
    addAnnotation: (annotation) => { pushHistory(); set({ annotations: [...get().annotations, annotation] }) },
    updateAnnotation: (id, update) => {
      set({ annotations: get().annotations.map((a) => a.id === id ? { ...a, ...update } as Annotation : a) })
    },
    removeAnnotation: (id) => { pushHistory(); set({ annotations: get().annotations.filter((a) => a.id !== id) }) },

    // Full state load
    loadState: (state) => { pushHistory(); set({ ...state, _stateVersion: get()._stateVersion + 1 }) },

    // Undo/Redo
    undo: () => {
      const past = get()._past
      if (past.length === 0) return
      const previous = past[past.length - 1]
      const newPast = past.slice(0, -1)
      const current = structuredClone(extractMapState(get()))
      set({
        ...previous,
        _past: newPast,
        _future: [...get()._future, current],
        canUndo: newPast.length > 0,
        canRedo: true,
      })
    },
    redo: () => {
      const future = get()._future
      if (future.length === 0) return
      const next = future[future.length - 1]
      const newFuture = future.slice(0, -1)
      const current = structuredClone(extractMapState(get()))
      set({
        ...next,
        _past: [...get()._past, current],
        _future: newFuture,
        canUndo: true,
        canRedo: newFuture.length > 0,
      })
    },
  }
})
