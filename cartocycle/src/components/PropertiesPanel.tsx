import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ColorPicker } from '@/components/controls/ColorPicker'
import { SliderControl } from '@/components/controls/SliderControl'
import { useMapStore } from '@/stores/mapStore'
import { useProjectStore } from '@/stores/projectStore'
import { useGeoData } from '@/hooks/useGeoData'
import { searchCity, type GeocodingResult } from '@/utils/geocode'
import { exportSvg, exportPng } from '@/utils/export'
import type { RouteStyle, MarkerShape, CityConfig, CityCategory, TextAnnotation, ProjectionType, LabelAnchorPosition } from '@/types'
import { LABEL_POSITIONS } from '@/utils/labelPosition'
import { Settings2, Search, Download, Save, FileUp } from 'lucide-react'
import { SimpleSelect } from '@/components/controls/SimpleSelect'
import { BUILT_IN_PRESETS, getCustomPresets } from '@/utils/presets'
import { useUiStore } from '@/stores/uiStore'
import { useState, useRef, useCallback } from 'react'

const FONT_OPTIONS = [
  { value: 'Gotham', label: 'Gotham' },
  { value: 'Gotham Narrow', label: 'Gotham Narrow' },
  { value: 'Gotham Condensed', label: 'Gotham Condensed' },
  { value: 'system-ui, sans-serif', label: 'System' },
]

const WEIGHT_OPTIONS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Book' },
  { value: '500', label: 'Medium' },
  { value: '700', label: 'Bold' },
]

const DASH_PRESETS = [
  { label: 'Continu', value: '' },
  { label: 'Points', value: '2,4' },
  { label: 'Tirets courts', value: '6,4' },
  { label: 'Tirets longs', value: '12,6' },
  { label: 'Tirets-points', value: '12,4,2,4' },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</h3>
}

function PropertyGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  )
}

// === Style Presets ===
function PresetsSection() {
  const setBackgroundColor = useMapStore((s) => s.setBackgroundColor)
  const updateLayerStyle = useMapStore((s) => s.updateLayerStyle)
  const updateLayerSmoothing = useMapStore((s) => s.updateLayerSmoothing)
  const setCountryOverride = useMapStore((s) => s.setCountryOverride)

  const applyPreset = (preset: import('@/utils/presets').StylePreset) => {
    setBackgroundColor(preset.backgroundColor)
    updateLayerStyle('countries', { fill: preset.countriesFill, stroke: preset.countriesStroke })
    updateLayerSmoothing('countries', preset.smoothing)
    setCountryOverride('countries', 'FRA', { fill: preset.franceFill })
  }

  const allPresets = [...BUILT_IN_PRESETS, ...getCustomPresets()]

  return (
    <PropertyGroup title="Presets de style">
      <div className="grid grid-cols-2 gap-1.5">
        {allPresets.map((p) => (
          <button
            key={p.id}
            className="flex items-center gap-2 rounded border border-border p-2 text-left transition-colors hover:bg-accent"
            onClick={() => applyPreset(p)}
          >
            <div className="flex gap-0.5">
              <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: p.franceFill }} />
              <div className="h-4 w-2 rounded-sm" style={{ backgroundColor: p.routeStroke }} />
            </div>
            <span className="text-[11px] font-medium truncate">{p.name}</span>
          </button>
        ))}
      </div>
    </PropertyGroup>
  )
}

// === Canvas Properties ===
function CanvasProperties() {
  const canvas = useMapStore((s) => s.canvas)
  const setCanvasSize = useMapStore((s) => s.setCanvasSize)
  const setBackgroundColor = useMapStore((s) => s.setBackgroundColor)
  const setProjection = useMapStore((s) => s.setProjection)
  const projectName = useProjectStore((s) => s.projectName)
  const showFormatOverlay = useUiStore((s) => s.showFormatOverlay)
  const toggleFormatOverlay = useUiStore((s) => s.toggleFormatOverlay)
  const setProjectName = useProjectStore((s) => s.setProjectName)
  const [dpi, setDpi] = useState(300)
  const [transparentBg, setTransparentBg] = useState(false)

  const pxWidth = Math.round((canvas.widthMm / 25.4) * dpi)
  const pxHeight = Math.round((canvas.heightMm / 25.4) * dpi)

  return (
    <div className="space-y-4">
      <PropertyGroup title="Projet">
        <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="h-7 text-xs font-medium" placeholder="Nom du projet" />
      </PropertyGroup>

      <Separator />

      <PresetsSection />

      <Separator />

      <PropertyGroup title="Format">
        <div className="flex items-center gap-2">
          <Input value={canvas.widthMm} onChange={(e) => setCanvasSize(parseFloat(e.target.value) || 210, canvas.heightMm)} className="h-7 text-xs" type="number" />
          <span className="text-xs text-muted-foreground">x</span>
          <Input value={canvas.heightMm} onChange={(e) => setCanvasSize(canvas.widthMm, parseFloat(e.target.value) || 297)} className="h-7 text-xs" type="number" />
          <span className="text-xs text-muted-foreground">mm</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[{ l: 'A4', w: 210, h: 297 }, { l: 'A3', w: 297, h: 420 }, { l: 'DL', w: 100, h: 210 }].map((p) => {
            const isMatch = canvas.widthMm === p.w && canvas.heightMm === p.h
            const isHighlighted = isMatch && showFormatOverlay
            return (
              <Button key={p.l} variant={isHighlighted ? 'default' : 'outline'} size="sm" className="h-6 text-[11px]" onClick={() => {
                if (isMatch) {
                  toggleFormatOverlay()
                } else {
                  setCanvasSize(p.w, p.h)
                  if (!showFormatOverlay) toggleFormatOverlay()
                }
              }}>
                {p.l}
              </Button>
            )
          })}
        </div>
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Apparence">
        <ColorPicker label="Fond" value={canvas.backgroundColor} onChange={setBackgroundColor} />
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Projection">
        <SimpleSelect value={canvas.projection.type} onChange={(v) => setProjection({ type: v as ProjectionType })} options={[
          { value: 'mercator', label: 'Mercator' },
          { value: 'lambertConformalConic', label: 'Lambert' },
          { value: 'equirectangular', label: 'Équirectangulaire' },
          { value: 'conicEqualArea', label: 'Conique' },
        ]} />
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Export">
        <Button size="sm" className="w-full gap-2" onClick={() => exportSvg(projectName, canvas)}>
          <Download className="h-3.5 w-3.5" /> Exporter en SVG
        </Button>
        <div className="space-y-2 rounded border border-border p-2">
          <div className="flex items-center gap-2">
            <Label className="w-20 shrink-0 text-xs">Résolution</Label>
            <SimpleSelect value={String(dpi)} onChange={(v) => setDpi(parseInt(v))} options={[
          { value: '72', label: '72 dpi' },
          { value: '150', label: '150 dpi' },
          { value: '300', label: '300 dpi' },
          { value: '600', label: '600 dpi' },
        ]} />
          </div>
          <p className="text-[11px] text-muted-foreground">{pxWidth.toLocaleString()} x {pxHeight.toLocaleString()} px</p>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Fond transparent</Label>
            <Switch checked={transparentBg} onCheckedChange={setTransparentBg} />
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => exportPng(projectName, canvas, dpi, transparentBg)}>
            <Download className="h-3.5 w-3.5" /> Exporter en PNG
          </Button>
        </div>
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Projet">
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => useProjectStore.getState().saveToFile()}>
          <Save className="h-3.5 w-3.5" /> Sauvegarder (.cartocycle)
        </Button>
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = '.cartocycle,.json'
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) await useProjectStore.getState().loadFromFile(file)
          }
          input.click()
        }}>
          <FileUp className="h-3.5 w-3.5" /> Charger un projet
        </Button>
      </PropertyGroup>
    </div>
  )
}

// === Layer Properties ===
function LayerProperties({ layerId }: { layerId: string }) {
  const layer = useMapStore((s) => s.baseMap.layers.find((l) => l.id === layerId))
  const updateLayerStyle = useMapStore((s) => s.updateLayerStyle)
  const updateLayerSmoothing = useMapStore((s) => s.updateLayerSmoothing)
  const setCountryOverride = useMapStore((s) => s.setCountryOverride)
  const { data } = useGeoData()
  const [showCountries, setShowCountries] = useState(false)

  if (!layer) return null

  const countryList = layerId === 'countries' ? (data.countries?.features.map((f) => ({ code: f.properties?.ISO_A3 as string, name: f.properties?.NAME as string })).filter((c) => c.code && c.name).sort((a, b) => a.name.localeCompare(b.name)) ?? []) : []

  return (
    <div className="space-y-4">
      <PropertyGroup title="Remplissage">
        {layer.style.fill !== 'none' && (
          <>
            <ColorPicker label="Couleur" value={layer.style.fill} onChange={(c) => updateLayerStyle(layerId, { fill: c })} />
            <SliderControl label="Opacité" value={Math.round(layer.style.fillOpacity * 100)} min={0} max={100} step={1} onChange={(v) => updateLayerStyle(layerId, { fillOpacity: v / 100 })} suffix="%" />
          </>
        )}
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Contour">
        <ColorPicker label="Couleur" value={layer.style.stroke} onChange={(c) => updateLayerStyle(layerId, { stroke: c })} />
        <SliderControl label="Épaisseur" value={layer.style.strokeWidth} min={0.1} max={5} step={0.1} onChange={(v) => updateLayerStyle(layerId, { strokeWidth: v })} suffix="px" />
        <SliderControl label="Opacité" value={Math.round(layer.style.strokeOpacity * 100)} min={0} max={100} step={1} onChange={(v) => updateLayerStyle(layerId, { strokeOpacity: v / 100 })} suffix="%" />
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Géométrie">
        <SliderControl label="Lissage" value={layer.smoothing} min={0} max={100} step={1} onChange={(v) => updateLayerSmoothing(layerId, v)} />
      </PropertyGroup>

      {layerId === 'countries' && (
        <>
          <Separator />
          <PropertyGroup title="France">
            <ColorPicker label="Remplissage" value={layer.countryOverrides?.FRA?.fill || layer.style.fill} onChange={(c) => setCountryOverride(layerId, 'FRA', { fill: c })} />
            <ColorPicker label="Contour" value={layer.countryOverrides?.FRA?.stroke || layer.style.stroke} onChange={(c) => setCountryOverride(layerId, 'FRA', { stroke: c })} />
          </PropertyGroup>

          <Separator />
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setShowCountries(!showCountries)}>
            {showCountries ? 'Masquer' : 'Afficher'} les autres pays
          </Button>
          {showCountries && (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded border border-border p-2">
              {countryList.filter((c) => c.code !== 'FRA').map((country) => (
                <div key={country.code} className="flex items-center gap-2">
                  <span className="w-20 truncate text-[11px]">{country.name}</span>
                  <input type="color" value={layer.countryOverrides?.[country.code]?.fill || layer.style.fill} onChange={(e) => setCountryOverride(layerId, country.code, { fill: e.target.value })} className="h-5 w-5 cursor-pointer rounded border-0 p-0" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// === Route Properties ===
function RouteProperties({ routeId }: { routeId: string }) {
  const route = useMapStore((s) => s.routes.find((r) => r.id === routeId))
  const updateRoute = useMapStore((s) => s.updateRoute)
  const updateRouteStyle = useMapStore((s) => s.updateRouteStyle)
  const removeRoute = useMapStore((s) => s.removeRoute)
  const clearSelection = useMapStore((s) => s.clearSelection)

  if (!route) return null

  const pointCount = route.originalGeometry.type === 'MultiLineString'
    ? route.originalGeometry.coordinates.reduce((s, l) => s + l.length, 0)
    : route.originalGeometry.coordinates.length

  return (
    <div className="space-y-4">
      <PropertyGroup title="Données">
        <Input value={route.name} onChange={(e) => updateRoute(routeId, { name: e.target.value })} className="h-7 text-xs font-medium" />
        <p className="text-[11px] text-muted-foreground">{pointCount.toLocaleString()} points — {route.sourceFile}</p>
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Géométrie">
        <SliderControl label="Simplif." value={route.simplification} min={0} max={100} step={1} onChange={(v) => updateRoute(routeId, { simplification: v })} />
        <SliderControl label="Lissage" value={route.smoothing} min={0} max={100} step={1} onChange={(v) => updateRoute(routeId, { smoothing: v })} />
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Trait">
        <ColorPicker label="Couleur" value={route.style.stroke} onChange={(c) => updateRouteStyle(routeId, { stroke: c })} />
        <SliderControl label="Épaisseur" value={route.style.strokeWidth} min={0.5} max={10} step={0.5} onChange={(v) => updateRouteStyle(routeId, { strokeWidth: v })} suffix="px" />
        <SliderControl label="Opacité" value={Math.round(route.style.strokeOpacity * 100)} min={0} max={100} step={1} onChange={(v) => updateRouteStyle(routeId, { strokeOpacity: v / 100 })} suffix="%" />
        <div className="flex items-center gap-2">
          <Label className="w-20 shrink-0 text-xs">Style</Label>
          <SimpleSelect label="Style" value={route.style.strokeDasharray || ''} onChange={(v) => updateRouteStyle(routeId, { strokeDasharray: v || undefined })} options={DASH_PRESETS.map((p) => ({ value: p.value, label: p.label }))} />
        </div>
        <div className="flex items-center gap-2">
          <Label className="w-20 shrink-0 text-xs">Extrémités</Label>
          <SimpleSelect label="Extrémités" value={route.style.strokeLinecap} onChange={(v) => updateRouteStyle(routeId, { strokeLinecap: v as RouteStyle['strokeLinecap'] })} options={[
            { value: 'round', label: 'Round' },
            { value: 'square', label: 'Square' },
            { value: 'butt', label: 'Butt' },
          ]} />
        </div>
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Ombre">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Ombre portée</Label>
          <Switch checked={route.style.shadow?.enabled ?? false} onCheckedChange={(checked) => updateRouteStyle(routeId, { shadow: { enabled: checked, offsetX: route.style.shadow?.offsetX ?? 2, offsetY: route.style.shadow?.offsetY ?? 2, blur: route.style.shadow?.blur ?? 4, color: route.style.shadow?.color ?? '#000000', opacity: route.style.shadow?.opacity ?? 0.3 } })} />
        </div>
        {route.style.shadow?.enabled && (
          <div className="space-y-1.5">
            <SliderControl label="Flou" value={route.style.shadow.blur} min={0} max={20} step={1} onChange={(v) => updateRouteStyle(routeId, { shadow: { ...route.style.shadow!, blur: v } })} suffix="px" />
            <SliderControl label="Opacité" value={Math.round(route.style.shadow.opacity * 100)} min={0} max={100} step={5} onChange={(v) => updateRouteStyle(routeId, { shadow: { ...route.style.shadow!, opacity: v / 100 } })} suffix="%" />
            <ColorPicker label="Couleur" value={route.style.shadow.color} onChange={(c) => updateRouteStyle(routeId, { shadow: { ...route.style.shadow!, color: c } })} />
          </div>
        )}
      </PropertyGroup>

      <Separator />
      <Button variant="ghost" size="sm" className="w-full text-xs text-destructive" onClick={() => { removeRoute(routeId); clearSelection() }}>
        Supprimer cet itinéraire
      </Button>
    </div>
  )
}

// === City Properties ===
function CityProperties({ cityId }: { cityId: string }) {
  const city = useMapStore((s) => s.cities.find((c) => c.id === cityId))
  const cityCategories = useMapStore((s) => s.cityCategories)
  const updateCity = useMapStore((s) => s.updateCity)
  const updateCityCategory = useMapStore((s) => s.updateCityCategory)
  const removeCity = useMapStore((s) => s.removeCity)
  const clearSelection = useMapStore((s) => s.clearSelection)

  if (!city) return null

  const category = cityCategories.find((c) => c.id === city.categoryId)
  const defaultOffset = category?.labelStyle.offset || { x: 6, y: 0 }
  const currentDistance = Math.round(Math.sqrt(defaultOffset.x * defaultOffset.x + defaultOffset.y * defaultOffset.y))

  return (
    <div className="space-y-4">
      <PropertyGroup title="Position">
        <Input value={city.name} onChange={(e) => updateCity(cityId, { name: e.target.value })} className="h-7 text-xs font-medium" />
        <p className="text-[11px] text-muted-foreground">{city.coordinates[1].toFixed(4)}, {city.coordinates[0].toFixed(4)}</p>
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Catégorie">
        <SimpleSelect value={city.categoryId} onChange={(v) => updateCity(cityId, { categoryId: v })} options={cityCategories.map((cat) => ({ value: cat.id, label: cat.name }))} />
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Position du label">
        <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
          {(['NO', 'N', 'NE', 'O', null, 'E', 'SO', 'S', 'SE'] as (LabelAnchorPosition | null)[]).map((pos, i) => {
            if (pos === null) {
              return <div key={i} className="h-7 w-7 flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              </div>
            }
            const isActive = city.labelAnchorPosition === pos || (!city.labelAnchorPosition && pos === 'E')
            return (
              <button
                key={pos}
                className={`h-7 w-7 rounded text-[10px] font-medium transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-accent'
                }`}
                onClick={() => updateCity(cityId, { labelAnchorPosition: pos })}
                title={LABEL_POSITIONS.find((p) => p.value === pos)?.label}
              >
                {pos}
              </button>
            )
          })}
        </div>
        <SliderControl
          label="Distance"
          value={currentDistance}
          min={2}
          max={30}
          step={1}
          onChange={(v) => {
            // Update the category offset distance (affects all cities of this category)
            if (category) {
              const ratio = v / Math.max(currentDistance, 1)
              updateCityCategory(city.categoryId, {
                labelStyle: {
                  ...category.labelStyle,
                  offset: {
                    x: Math.round(defaultOffset.x * ratio),
                    y: Math.round(defaultOffset.y * ratio),
                  },
                },
              })
            }
          }}
          suffix="px"
        />
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Marqueur">
        <SliderControl
          label="Contour"
          value={category?.markerStyle.strokeWidth ?? 1}
          min={0}
          max={4}
          step={0.5}
          onChange={(v) => {
            if (category) {
              updateCityCategory(city.categoryId, {
                markerStyle: { ...category.markerStyle, strokeWidth: v },
              })
            }
          }}
          suffix="px"
        />
      </PropertyGroup>

      <Separator />
      <Button variant="ghost" size="sm" className="w-full text-xs text-destructive" onClick={() => { removeCity(cityId); clearSelection() }}>
        Supprimer cette ville
      </Button>
    </div>
  )
}

// === City Category Properties ===
function CityCategoryProperties({ categoryId }: { categoryId: string }) {
  const cat = useMapStore((s) => s.cityCategories.find((c) => c.id === categoryId))
  const updateCityCategory = useMapStore((s) => s.updateCityCategory)
  const removeCityCategory = useMapStore((s) => s.removeCityCategory)
  const addCityCategory = useMapStore((s) => s.addCityCategory)
  const cityCategories = useMapStore((s) => s.cityCategories)
  const select = useMapStore((s) => s.select)

  if (!cat) return null

  const handleAddCategory = () => {
    const newCat: CityCategory = {
      id: crypto.randomUUID(), name: 'Nouvelle catégorie',
      markerStyle: { shape: 'circle', size: 3, fill: '#666666', fillOpacity: 1, stroke: '#333333', strokeWidth: 0.5 },
      labelStyle: { fontFamily: 'Gotham', fontSize: 10, fontWeight: 400, fontStyle: 'normal', color: '#333333', letterSpacing: 0, offset: { x: 6, y: 3 }, anchor: 'start', baseline: 'central', rotation: 0, showLeaderLine: false },
    }
    addCityCategory(newCat)
    select(newCat.id, 'cityCategory')
  }

  const SHAPES: { value: MarkerShape; label: string }[] = [
    { value: 'circle', label: 'Cercle' }, { value: 'square', label: 'Carré' },
    { value: 'diamond', label: 'Losange' }, { value: 'triangle', label: 'Triangle' },
  ]

  return (
    <div className="space-y-4">
      <PropertyGroup title="Catégorie">
        <Input value={cat.name} onChange={(e) => updateCityCategory(categoryId, { name: e.target.value })} className="h-7 text-xs font-medium" />
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Marqueur">
        <SimpleSelect label="Forme" value={cat.markerStyle.shape} onChange={(v) => updateCityCategory(categoryId, { markerStyle: { ...cat.markerStyle, shape: v as MarkerShape } })} options={SHAPES.map((s) => ({ value: s.value, label: s.label }))} />
        <SliderControl label="Taille" value={cat.markerStyle.size} min={1} max={15} step={0.5} onChange={(v) => updateCityCategory(categoryId, { markerStyle: { ...cat.markerStyle, size: v } })} suffix="px" />
        <ColorPicker label="Couleur" value={cat.markerStyle.fill} onChange={(c) => updateCityCategory(categoryId, { markerStyle: { ...cat.markerStyle, fill: c } })} />
        <ColorPicker label="Contour" value={cat.markerStyle.stroke} onChange={(c) => updateCityCategory(categoryId, { markerStyle: { ...cat.markerStyle, stroke: c } })} />
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Label">
        <SimpleSelect label="Police" value={cat.labelStyle.fontFamily} onChange={(v) => updateCityCategory(categoryId, { labelStyle: { ...cat.labelStyle, fontFamily: v } })} options={FONT_OPTIONS} />
        <SliderControl label="Taille" value={cat.labelStyle.fontSize} min={6} max={24} step={1} onChange={(v) => updateCityCategory(categoryId, { labelStyle: { ...cat.labelStyle, fontSize: v } })} suffix="px" />
        <ColorPicker label="Couleur" value={cat.labelStyle.color} onChange={(c) => updateCityCategory(categoryId, { labelStyle: { ...cat.labelStyle, color: c } })} />
        <SimpleSelect label="Graisse" value={String(cat.labelStyle.fontWeight)} onChange={(v) => updateCityCategory(categoryId, { labelStyle: { ...cat.labelStyle, fontWeight: parseInt(v) as 300 | 400 | 500 | 600 | 700 } })} options={WEIGHT_OPTIONS} />
        <Separator />
        <SectionTitle>Fond du label</SectionTitle>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Activer le fond</Label>
          <Switch checked={(cat.labelStyle.backgroundOpacity ?? 0) > 0} onCheckedChange={(checked) => updateCityCategory(categoryId, { labelStyle: { ...cat.labelStyle, backgroundColor: cat.labelStyle.backgroundColor || '#FFFFFF', backgroundOpacity: checked ? 0.8 : 0 } })} />
        </div>
        {(cat.labelStyle.backgroundOpacity ?? 0) > 0 && (
          <>
            <ColorPicker label="Couleur" value={cat.labelStyle.backgroundColor || '#FFFFFF'} onChange={(c) => updateCityCategory(categoryId, { labelStyle: { ...cat.labelStyle, backgroundColor: c } })} />
            <SliderControl label="Opacité" value={Math.round((cat.labelStyle.backgroundOpacity ?? 0.8) * 100)} min={5} max={100} step={5} onChange={(v) => updateCityCategory(categoryId, { labelStyle: { ...cat.labelStyle, backgroundOpacity: v / 100 } })} suffix="%" />
            <SliderControl label="Padding" value={cat.labelStyle.backgroundPadding ?? 2} min={0} max={8} step={1} onChange={(v) => updateCityCategory(categoryId, { labelStyle: { ...cat.labelStyle, backgroundPadding: v } })} suffix="px" />
          </>
        )}
      </PropertyGroup>

      <Separator />

      <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleAddCategory}>
        + Nouvelle catégorie
      </Button>
      {cityCategories.length > 1 && (
        <Button variant="ghost" size="sm" className="w-full text-xs text-destructive" onClick={() => { removeCityCategory(categoryId); select(cityCategories[0].id === categoryId ? cityCategories[1].id : cityCategories[0].id, 'cityCategory') }}>
          Supprimer cette catégorie
        </Button>
      )}
    </div>
  )
}

// === Annotation Properties ===
function AnnotationProperties({ annotationId }: { annotationId: string }) {
  const ann = useMapStore((s) => s.annotations.find((a) => a.id === annotationId)) as TextAnnotation | undefined
  const updateAnnotation = useMapStore((s) => s.updateAnnotation)
  const removeAnnotation = useMapStore((s) => s.removeAnnotation)
  const clearSelection = useMapStore((s) => s.clearSelection)

  if (!ann || ann.type !== 'text') return null

  return (
    <div className="space-y-4">
      <PropertyGroup title="Contenu">
        <Input value={ann.content} onChange={(e) => updateAnnotation(annotationId, { content: e.target.value })} className="h-7 text-xs" />
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Typographie">
        <SimpleSelect label="Police" value={ann.style.fontFamily} onChange={(v) => updateAnnotation(annotationId, { style: { ...ann.style, fontFamily: v } } as Partial<TextAnnotation>)} options={FONT_OPTIONS} />
        <SliderControl label="Taille" value={ann.style.fontSize} min={8} max={48} step={1} onChange={(v) => updateAnnotation(annotationId, { style: { ...ann.style, fontSize: v } } as Partial<TextAnnotation>)} suffix="px" />
        <ColorPicker label="Couleur" value={ann.style.color} onChange={(c) => updateAnnotation(annotationId, { style: { ...ann.style, color: c } } as Partial<TextAnnotation>)} />
        <SimpleSelect label="Graisse" value={String(ann.style.fontWeight)} onChange={(v) => updateAnnotation(annotationId, { style: { ...ann.style, fontWeight: parseInt(v) as 300 | 400 | 500 | 600 | 700 } } as Partial<TextAnnotation>)} options={WEIGHT_OPTIONS} />
        <SliderControl label="Espacement" value={ann.style.letterSpacing} min={0} max={20} step={0.5} onChange={(v) => updateAnnotation(annotationId, { style: { ...ann.style, letterSpacing: v } } as Partial<TextAnnotation>)} suffix="px" />
        <SliderControl label="Rotation" value={ann.style.rotation} min={-180} max={180} step={1} onChange={(v) => updateAnnotation(annotationId, { style: { ...ann.style, rotation: v } } as Partial<TextAnnotation>)} suffix="°" />
      </PropertyGroup>

      <Separator />
      <Button variant="ghost" size="sm" className="w-full text-xs text-destructive" onClick={() => { removeAnnotation(annotationId); clearSelection() }}>
        Supprimer
      </Button>
    </div>
  )
}

// === Legend Properties ===
function LegendProperties() {
  const legend = useMapStore((s) => s.legend)
  const loadState = useMapStore((s) => s.loadState)

  const updateLegend = (update: Partial<typeof legend>) => {
    const state = useMapStore.getState()
    loadState({ canvas: state.canvas, baseMap: state.baseMap, routes: state.routes, cities: state.cities, cityCategories: state.cityCategories, annotations: state.annotations, legend: { ...state.legend, ...update } })
  }

  const updateLegendStyle = (update: Partial<typeof legend.style>) => {
    updateLegend({ style: { ...legend.style, ...update } })
  }

  return (
    <div className="space-y-4">
      <PropertyGroup title="Légende">
        <Input value={legend.title} onChange={(e) => updateLegend({ title: e.target.value })} className="h-7 text-xs font-medium" placeholder="Titre de la légende" />
        <div className="flex items-center justify-between">
          <Label className="text-xs">Visible</Label>
          <Switch checked={legend.visible} onCheckedChange={(v) => updateLegend({ visible: v })} />
        </div>
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Position">
        <div className="flex items-center gap-2">
          <Label className="w-10 shrink-0 text-xs">X</Label>
          <Input value={legend.position.x} onChange={(e) => updateLegend({ position: { ...legend.position, x: parseFloat(e.target.value) || 0 } })} className="h-7 text-xs" type="number" />
          <Label className="w-10 shrink-0 text-xs">Y</Label>
          <Input value={legend.position.y} onChange={(e) => updateLegend({ position: { ...legend.position, y: parseFloat(e.target.value) || 0 } })} className="h-7 text-xs" type="number" />
        </div>
        <SliderControl label="Largeur" value={legend.width} min={80} max={300} step={10} onChange={(v) => updateLegend({ width: v })} suffix="px" />
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Style">
        <ColorPicker label="Fond" value={legend.style.backgroundColor} onChange={(c) => updateLegendStyle({ backgroundColor: c })} />
        <SliderControl label="Op. fond" value={Math.round(legend.style.backgroundOpacity * 100)} min={0} max={100} step={5} onChange={(v) => updateLegendStyle({ backgroundOpacity: v / 100 })} suffix="%" />
        <ColorPicker label="Bordure" value={legend.style.borderColor} onChange={(c) => updateLegendStyle({ borderColor: c })} />
        <SliderControl label="Ép. bordure" value={legend.style.borderWidth} min={0} max={3} step={0.5} onChange={(v) => updateLegendStyle({ borderWidth: v })} suffix="px" />
        <SliderControl label="Arrondi" value={legend.style.borderRadius} min={0} max={12} step={1} onChange={(v) => updateLegendStyle({ borderRadius: v })} suffix="px" />
        <SliderControl label="Padding" value={legend.style.padding} min={4} max={24} step={2} onChange={(v) => updateLegendStyle({ padding: v })} suffix="px" />
      </PropertyGroup>

      <Separator />

      <PropertyGroup title="Typographie">
        <SimpleSelect label="Police" value={legend.style.fontFamily} onChange={(v) => updateLegendStyle({ fontFamily: v })} options={FONT_OPTIONS} />
        <SliderControl label="Taille" value={legend.style.fontSize} min={8} max={16} step={1} onChange={(v) => updateLegendStyle({ fontSize: v })} suffix="px" />
        <ColorPicker label="Couleur" value={legend.style.fontColor} onChange={(c) => updateLegendStyle({ fontColor: c })} />
        <SliderControl label="Titre" value={legend.style.titleFontSize} min={10} max={20} step={1} onChange={(v) => updateLegendStyle({ titleFontSize: v })} suffix="px" />
      </PropertyGroup>

      <Separator />

      <p className="text-[11px] text-muted-foreground">
        La légende est auto-générée à partir des itinéraires et catégories de villes visibles.
      </p>
    </div>
  )
}

// === Search & Add City ===
function AddCitySection() {
  const cityCategories = useMapStore((s) => s.cityCategories)
  const addCity = useMapStore((s) => s.addCity)
  const select = useMapStore((s) => s.select)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [searching, setSearching] = useState(false)
  const [category, setCategory] = useState(cityCategories[0]?.id || 'main')
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleSearch = useCallback((q: string) => {
    setQuery(q)
    if (timeout.current) clearTimeout(timeout.current)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    timeout.current = setTimeout(async () => {
      const r = await searchCity(q)
      setResults(r)
      setSearching(false)
    }, 500)
  }, [])

  const handleSelect = (r: GeocodingResult) => {
    const city: CityConfig = { id: crypto.randomUUID(), name: r.name, coordinates: [r.lon, r.lat], categoryId: category, visible: true }
    addCity(city)
    select(city.id, 'city')
    setQuery('')
    setResults([])
  }

  const [showManual, setShowManual] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualLat, setManualLat] = useState('')
  const [manualLon, setManualLon] = useState('')

  const handleManualAdd = () => {
    const lat = parseFloat(manualLat)
    const lon = parseFloat(manualLon)
    if (!manualName.trim() || isNaN(lat) || isNaN(lon)) return
    const city: CityConfig = { id: crypto.randomUUID(), name: manualName.trim(), coordinates: [lon, lat], categoryId: category, visible: true }
    addCity(city)
    select(city.id, 'city')
    setManualName(''); setManualLat(''); setManualLon('')
  }

  const handleCsvImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const lines = text.split('\n').filter((l) => l.trim())
      const header = lines[0].toLowerCase()
      const hasHeader = header.includes('nom') || header.includes('name') || header.includes('lat')
      const dataLines = hasHeader ? lines.slice(1) : lines
      for (const line of dataLines) {
        const parts = line.split(/[,;\t]/).map((s) => s.trim().replace(/^["']|["']$/g, ''))
        if (parts.length < 3) continue
        const name = parts[0]
        const lat = parseFloat(parts[1])
        const lon = parseFloat(parts[2])
        if (!name || isNaN(lat) || isNaN(lon)) continue
        addCity({ id: crypto.randomUUID(), name, coordinates: [lon, lat], categoryId: parts[3] || category, visible: true })
      }
    }
    input.click()
  }

  return (
    <div className="space-y-2">
      <SectionTitle>Ajouter une ville</SectionTitle>
      <div className="relative">
        <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={query} onChange={(e) => handleSearch(e.target.value)} className="h-7 pl-7 text-xs" />
      </div>
      {searching && <p className="text-[11px] text-muted-foreground">Recherche...</p>}
      {results.length > 0 && (
        <div className="rounded border border-border bg-popover">
          {results.map((r, i) => (
            <button key={i} className="w-full px-2 py-1.5 text-left text-xs hover:bg-accent" onClick={() => handleSelect(r)}>
              {r.displayName}
            </button>
          ))}
        </div>
      )}
      <SimpleSelect value={category} onChange={setCategory} options={cityCategories.map((c) => ({ value: c.id, label: c.name }))} />

      <div className="flex gap-1">
        <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => setShowManual(!showManual)}>
          Saisie manuelle
        </Button>
        <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={handleCsvImport}>
          Import CSV
        </Button>
      </div>

      {showManual && (
        <div className="space-y-1.5 rounded border border-border p-2">
          <Input placeholder="Nom" value={manualName} onChange={(e) => setManualName(e.target.value)} className="h-7 text-xs" />
          <div className="flex gap-1.5">
            <Input placeholder="Latitude" value={manualLat} onChange={(e) => setManualLat(e.target.value)} className="h-7 text-xs" type="number" step="0.0001" />
            <Input placeholder="Longitude" value={manualLon} onChange={(e) => setManualLon(e.target.value)} className="h-7 text-xs" type="number" step="0.0001" />
          </div>
          <Button onClick={handleManualAdd} variant="outline" size="sm" className="w-full h-6 text-xs">Ajouter</Button>
        </div>
      )}
    </div>
  )
}

// === Main Properties Panel ===
export function PropertiesPanel() {
  const selectedId = useMapStore((s) => s.selectedId)
  const selectedType = useMapStore((s) => s.selectedType)

  const renderContent = () => {
    if (!selectedType || !selectedId) {
      return (
        <div className="space-y-4">
          <CanvasProperties />
          <Separator />
          <AddCitySection />
        </div>
      )
    }

    switch (selectedType) {
      case 'canvas':
        return <CanvasProperties />
      case 'layer':
        return <LayerProperties layerId={selectedId} />
      case 'route':
        return <RouteProperties routeId={selectedId} />
      case 'city':
        return <CityProperties cityId={selectedId} />
      case 'cityCategory':
        return <CityCategoryProperties categoryId={selectedId} />
      case 'annotation':
        return <AnnotationProperties annotationId={selectedId} />
      case 'legend':
        return <LegendProperties />
      default:
        return <CanvasProperties />
    }
  }

  const typeLabels: Record<string, string> = {
    canvas: 'Canvas',
    layer: 'Couche',
    route: 'Itinéraire',
    city: 'Ville',
    cityCategory: 'Catégorie',
    annotation: 'Annotation',
  }

  return (
    <aside className="properties-panel flex h-full w-[300px] shrink-0 flex-col border-l border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <Settings2 className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold tracking-tight">
          {selectedType ? typeLabels[selectedType] || 'PROPRIÉTÉS' : 'PROPRIÉTÉS'}
        </span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3">
          {renderContent()}
        </div>
      </ScrollArea>
    </aside>
  )
}
