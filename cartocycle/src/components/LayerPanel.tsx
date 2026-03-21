import { useCallback, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useMapStore, type SelectionType } from '@/stores/mapStore'
import { gpx } from '@tmcw/togeojson'
import { searchCity, type GeocodingResult } from '@/utils/geocode'
import type { RouteConfig, RouteStyle, TextAnnotation, CityConfig } from '@/types'
import { Input } from '@/components/ui/input'
import {
  Eye,
  EyeOff,
  Layers,
  MapIcon,
  Route,
  MapPin,
  Type,
  LayoutList,
  Plus,
  ChevronDown,
  ChevronRight,
  Search,
  Trash2,
} from 'lucide-react'

interface LayerItemProps {
  id: string
  type: SelectionType
  label: string
  icon: React.ElementType
  visible?: boolean
  onToggleVisibility?: () => void
  onDelete?: () => void
  deleteLabel?: string
  selected: boolean
  onSelect: () => void
  indent?: number
  children?: React.ReactNode
}

function LayerItem({ label, icon: Icon, visible, onToggleVisibility, onDelete, deleteLabel, selected, onSelect, indent = 0, children }: LayerItemProps) {
  const [expanded, setExpanded] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const hasChildren = !!children

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 rounded px-2 py-1.5 cursor-pointer transition-colors ${
          selected ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
        }`}
        style={{ paddingLeft: `${10 + indent * 18}px` }}
        onClick={onSelect}
      >
        {hasChildren ? (
          <button
            className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-[13px]">{label}</span>
        {onToggleVisibility && (
          <button
            className="h-6 w-6 shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); onToggleVisibility() }}
            aria-label={visible ? 'Masquer' : 'Afficher'}
          >
            {visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 opacity-40" />}
          </button>
        )}
        {onDelete && !confirmDelete && (
          <button
            className="h-6 w-6 shrink-0 rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
            aria-label="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
      {confirmDelete && onDelete && (
        <div className="flex items-center gap-1 px-3 py-1 text-[11px]" style={{ paddingLeft: `${28 + indent * 18}px` }}>
          <span className="text-destructive">{deleteLabel || 'Supprimer ?'}</span>
          <button className="rounded bg-destructive px-2 py-0.5 text-[10px] text-white" onClick={(e) => { e.stopPropagation(); onDelete(); setConfirmDelete(false) }}>
            Oui
          </button>
          <button className="rounded border border-border px-2 py-0.5 text-[10px]" onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}>
            Non
          </button>
        </div>
      )}
      {hasChildren && expanded && <div>{children}</div>}
    </div>
  )
}

export function LayerPanel() {
  const baseMap = useMapStore((s) => s.baseMap)
  const routes = useMapStore((s) => s.routes)
  const cities = useMapStore((s) => s.cities)
  const cityCategories = useMapStore((s) => s.cityCategories)
  const annotations = useMapStore((s) => s.annotations)
  const selectedId = useMapStore((s) => s.selectedId)
  const selectedType = useMapStore((s) => s.selectedType)
  const select = useMapStore((s) => s.select)
  const toggleLayerVisibility = useMapStore((s) => s.toggleLayerVisibility)
  const updateRoute = useMapStore((s) => s.updateRoute)
  const addRoute = useMapStore((s) => s.addRoute)
  const addAnnotation = useMapStore((s) => s.addAnnotation)
  const addCity = useMapStore((s) => s.addCity)
  const removeAnnotation = useMapStore((s) => s.removeAnnotation)
  const removeCity = useMapStore((s) => s.removeCity)
  const removeRoute = useMapStore((s) => s.removeRoute)
  const loadState = useMapStore((s) => s.loadState)

  const clearAllAnnotations = () => {
    const state = useMapStore.getState()
    loadState({ canvas: state.canvas, baseMap: state.baseMap, routes: state.routes, cities: state.cities, cityCategories: state.cityCategories, annotations: [], legend: state.legend })
  }
  const clearAllCities = () => {
    const state = useMapStore.getState()
    loadState({ canvas: state.canvas, baseMap: state.baseMap, routes: state.routes, cities: [], cityCategories: state.cityCategories, annotations: state.annotations, legend: state.legend })
  }
  const clearAllRoutes = () => {
    const state = useMapStore.getState()
    loadState({ canvas: state.canvas, baseMap: state.baseMap, routes: [], cities: state.cities, cityCategories: state.cityCategories, annotations: state.annotations, legend: state.legend })
  }

  const [showCitySearch, setShowCitySearch] = useState(false)
  const [cityQuery, setCityQuery] = useState('')
  const [cityResults, setCityResults] = useState<GeocodingResult[]>([])
  const [citySearching, setCitySearching] = useState(false)
  const cityTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleCitySearch = useCallback((q: string) => {
    setCityQuery(q)
    if (cityTimeout.current) clearTimeout(cityTimeout.current)
    if (q.length < 2) { setCityResults([]); return }
    setCitySearching(true)
    cityTimeout.current = setTimeout(async () => {
      const r = await searchCity(q)
      setCityResults(r)
      setCitySearching(false)
    }, 500)
  }, [])

  const handleCitySelect = (r: GeocodingResult) => {
    const defaultCat = cityCategories[0]?.id || 'main'
    const city: CityConfig = { id: crypto.randomUUID(), name: r.name, coordinates: [r.lon, r.lat], categoryId: defaultCat, visible: true }
    addCity(city)
    select(city.id, 'city')
    setCityQuery('')
    setCityResults([])
    setShowCitySearch(false)
  }

  const isSelected = (id: string, type: SelectionType) => selectedId === id && selectedType === type

  const LAYER_LABELS: Record<string, string> = {
    countries: 'Pays',
    coastline: 'Littoral',
    rivers: 'Fleuves',
    regions: 'Régions',
  }

  const handleImportRoute = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.gpx,.geojson,.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      if (file.size > 50 * 1024 * 1024) { alert('Fichier trop volumineux (max 50 Mo)'); return }
      try {
        const text = await file.text()
        let geometry: RouteConfig['originalGeometry']

        if (file.name.endsWith('.gpx')) {
          const parser = new DOMParser()
          const doc = parser.parseFromString(text, 'text/xml')
          const geojson = gpx(doc)
          const lineFeature = geojson.features.find(
            (f) => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'
          )
          if (!lineFeature) { alert('Aucun tracé trouvé'); return }
          geometry = lineFeature.geometry as RouteConfig['originalGeometry']
        } else {
          const geojson = JSON.parse(text)
          const features = geojson.type === 'FeatureCollection' ? geojson.features : [geojson.type === 'Feature' ? geojson : { geometry: geojson }]
          const lineFeature = features.find((f: { geometry: { type: string } }) => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString')
          if (!lineFeature) { alert('Aucun tracé trouvé'); return }
          geometry = lineFeature.geometry
        }

        const defaultStyle: RouteStyle = {
          fill: 'none', fillOpacity: 0, stroke: '#E74C3C', strokeWidth: 3, strokeOpacity: 1,
          strokeLinecap: 'round', strokeLinejoin: 'round',
        }
        const route: RouteConfig = {
          id: crypto.randomUUID(),
          name: file.name.replace(/\.(gpx|geojson|json)$/, ''),
          visible: true, zIndex: routes.length + 10, sourceFile: file.name,
          originalGeometry: geometry, simplification: 0, smoothing: 0, style: defaultStyle,
        }
        addRoute(route)
        select(route.id, 'route')
      } catch { alert('Erreur de lecture du fichier') }
    }
    input.click()
  }, [addRoute, routes.length, select])

  const handleAddAnnotation = () => {
    const ann: TextAnnotation = {
      type: 'text', id: crypto.randomUUID(), content: 'Nouveau texte',
      position: { x: 100, y: 100 },
      style: {
        fontFamily: 'Gotham', fontSize: 16, fontWeight: 400, fontStyle: 'normal',
        color: '#333333', letterSpacing: 0, offset: { x: 0, y: 0 },
        anchor: 'start', baseline: 'auto', rotation: 0, showLeaderLine: false,
      },
      zIndex: 100,
    }
    addAnnotation(ann)
    select(ann.id, 'annotation')
  }

  const MIN_WIDTH = 240
  const DEFAULT_WIDTH = 300
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH)
  const resizing = useRef(false)

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    resizing.current = true
    const startX = e.clientX
    const startWidth = panelWidth

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizing.current) return
      const newWidth = Math.max(MIN_WIDTH, startWidth + (ev.clientX - startX))
      setPanelWidth(newWidth)
    }
    const onMouseUp = () => {
      resizing.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [panelWidth])

  return (
    <aside className="layer-panel relative flex h-full shrink-0 flex-col border-r border-border bg-card" style={{ width: `${panelWidth}px` }}>
      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 z-10"
        onMouseDown={handleResizeStart}
      />
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold tracking-tight">CALQUES</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="py-1">
          {/* Annotations */}
          <LayerItem
            id="annotations-group"
            type="annotation"
            label={`Annotations (${annotations.length})`}
            icon={Type}
            selected={false}
            onSelect={() => {}}
            onDelete={annotations.length > 0 ? clearAllAnnotations : undefined}
            deleteLabel={`Supprimer les ${annotations.length} annotations ?`}
          >
            {annotations.filter((a) => a.type === 'text').map((ann) => (
              <LayerItem
                key={ann.id}
                id={ann.id}
                type="annotation"
                label={(ann as TextAnnotation).content}
                icon={Type}
                selected={isSelected(ann.id, 'annotation')}
                onSelect={() => select(ann.id, 'annotation')}
                onDelete={() => removeAnnotation(ann.id)}
                indent={1}
              />
            ))}
          </LayerItem>

          {/* Villes */}
          <LayerItem
            id="cities-group"
            type={null}
            label={`Villes (${cities.length})`}
            icon={MapPin}
            selected={false}
            onSelect={() => {}}
            onDelete={cities.length > 0 ? clearAllCities : undefined}
            deleteLabel={`Supprimer les ${cities.length} villes ?`}
          >
            {cityCategories.map((cat) => {
              const catCities = cities.filter((c) => c.categoryId === cat.id)
              if (catCities.length === 0) return null
              return (
                <LayerItem
                  key={cat.id}
                  id={cat.id}
                  type="cityCategory"
                  label={`${cat.name} (${catCities.length})`}
                  icon={LayoutList}
                  selected={isSelected(cat.id, 'cityCategory')}
                  onSelect={() => select(cat.id, 'cityCategory')}
                  onDelete={() => { catCities.forEach((c) => removeCity(c.id)) }}
                  deleteLabel={`Supprimer les ${catCities.length} ${cat.name.toLowerCase()} ?`}
                  indent={1}
                >
                  {catCities.map((city) => (
                    <LayerItem
                      key={city.id}
                      id={city.id}
                      type="city"
                      label={city.name}
                      icon={MapPin}
                      visible={city.visible}
                      onDelete={() => removeCity(city.id)}
                      selected={isSelected(city.id, 'city')}
                      onSelect={() => select(city.id, 'city')}
                      indent={2}
                    />
                  ))}
                </LayerItem>
              )
            })}
          </LayerItem>

          {/* Itinéraires */}
          <LayerItem
            id="routes-group"
            type={null}
            label={`Itinéraires (${routes.length})`}
            icon={Route}
            selected={false}
            onSelect={() => {}}
            onDelete={routes.length > 0 ? clearAllRoutes : undefined}
            deleteLabel={`Supprimer les ${routes.length} itinéraires ?`}
          >
            {routes.map((route) => (
              <LayerItem
                key={route.id}
                id={route.id}
                type="route"
                label={route.name}
                icon={Route}
                visible={route.visible}
                onToggleVisibility={() => updateRoute(route.id, { visible: !route.visible })}
                onDelete={() => removeRoute(route.id)}
                selected={isSelected(route.id, 'route')}
                onSelect={() => select(route.id, 'route')}
                indent={1}
              />
            ))}
          </LayerItem>

          {/* Fond de carte */}
          <LayerItem
            id="basemap-group"
            type={null}
            label="Fond de carte"
            icon={MapIcon}
            selected={false}
            onSelect={() => {}}
          >
            {[...baseMap.layers].reverse().map((layer) => (
              <LayerItem
                key={layer.id}
                id={layer.id}
                type="layer"
                label={LAYER_LABELS[layer.id] || layer.id}
                icon={MapIcon}
                visible={layer.visible}
                onToggleVisibility={() => toggleLayerVisibility(layer.id)}
                selected={isSelected(layer.id, 'layer')}
                onSelect={() => select(layer.id, 'layer')}
                indent={1}
              />
            ))}
          </LayerItem>

        </div>
      </div>

      {/* Canvas - sticky */}
      <div className="border-t border-border px-1 py-1">
        <LayerItem
          id="canvas"
          type="canvas"
          label="Canvas"
          icon={Layers}
          selected={isSelected('canvas', 'canvas')}
          onSelect={() => select('canvas', 'canvas')}
        />
      </div>

      {/* City search panel */}
      {showCitySearch && (
        <div className="border-t border-border p-2 space-y-1.5">
          <div className="relative">
            <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher une ville..."
              value={cityQuery}
              onChange={(e) => handleCitySearch(e.target.value)}
              className="pl-7"
              autoFocus
            />
          </div>
          {citySearching && <p className="text-[11px] text-muted-foreground px-1">Recherche...</p>}
          {cityResults.length > 0 && (
            <div className="rounded border border-border bg-popover max-h-40 overflow-y-auto">
              {cityResults.map((r, i) => (
                <button key={i} className="w-full px-2 py-1.5 text-left text-xs hover:bg-accent truncate" onClick={() => handleCitySelect(r)}>
                  {r.displayName}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 border-t border-border p-2">
        <Button variant="ghost" size="sm" className="h-7 flex-1 text-[11px]" onClick={handleImportRoute}>
          <Plus className="mr-1 h-3 w-3" /> Itinéraire
        </Button>
        <Button variant="ghost" size="sm" className="h-7 flex-1 text-[11px]" onClick={() => setShowCitySearch(!showCitySearch)}>
          <MapPin className="mr-1 h-3 w-3" /> Ville
        </Button>
        <Button variant="ghost" size="sm" className="h-7 flex-1 text-[11px]" onClick={handleAddAnnotation}>
          <Plus className="mr-1 h-3 w-3" /> Texte
        </Button>
      </div>
    </aside>
  )
}
