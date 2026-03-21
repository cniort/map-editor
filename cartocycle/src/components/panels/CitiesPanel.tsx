import { useState, useCallback, useRef } from 'react'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ColorPicker } from '@/components/controls/ColorPicker'
import { SliderControl } from '@/components/controls/SliderControl'
import { useMapStore } from '@/stores/mapStore'
import { searchCity, type GeocodingResult } from '@/utils/geocode'
import type { CityConfig, CityCategory, MarkerShape } from '@/types'

const MARKER_SHAPES: { value: MarkerShape; label: string }[] = [
  { value: 'circle', label: 'Cercle' },
  { value: 'square', label: 'Carré' },
  { value: 'diamond', label: 'Losange' },
  { value: 'triangle', label: 'Triangle' },
]

export function CitiesPanel() {
  const cities = useMapStore((s) => s.cities)
  const cityCategories = useMapStore((s) => s.cityCategories)
  const addCity = useMapStore((s) => s.addCity)
  const removeCity = useMapStore((s) => s.removeCity)
  const updateCity = useMapStore((s) => s.updateCity)
  const addCityCategory = useMapStore((s) => s.addCityCategory)
  const updateCityCategory = useMapStore((s) => s.updateCityCategory)
  const removeCityCategory = useMapStore((s) => s.removeCityCategory)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(cityCategories[0]?.id || 'main')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Manual add
  const [manualName, setManualName] = useState('')
  const [manualLat, setManualLat] = useState('')
  const [manualLon, setManualLon] = useState('')
  const [showManual, setShowManual] = useState(false)

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    searchTimeout.current = setTimeout(async () => {
      const results = await searchCity(query)
      setSearchResults(results)
      setSearching(false)
    }, 500)
  }, [])

  const handleSelectResult = (result: GeocodingResult) => {
    const city: CityConfig = {
      id: crypto.randomUUID(),
      name: result.name,
      coordinates: [result.lon, result.lat],
      categoryId: selectedCategory,
      visible: true,
    }
    addCity(city)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleManualAdd = () => {
    const lat = parseFloat(manualLat)
    const lon = parseFloat(manualLon)
    if (!manualName.trim() || isNaN(lat) || isNaN(lon)) return
    const city: CityConfig = {
      id: crypto.randomUUID(),
      name: manualName.trim(),
      coordinates: [lon, lat],
      categoryId: selectedCategory,
      visible: true,
    }
    addCity(city)
    setManualName('')
    setManualLat('')
    setManualLon('')
  }

  const handleAddCategory = () => {
    const cat: CityCategory = {
      id: crypto.randomUUID(),
      name: 'Nouvelle catégorie',
      markerStyle: {
        shape: 'circle',
        size: 3,
        fill: '#666666',
        fillOpacity: 1,
        stroke: '#333333',
        strokeWidth: 0.5,
      },
      labelStyle: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 10,
        fontWeight: 400,
        fontStyle: 'normal',
        color: '#333333',
        letterSpacing: 0,
        offset: { x: 6, y: 3 },
        anchor: 'start',
        baseline: 'central',
        rotation: 0,
        showLeaderLine: false,
      },
    }
    addCityCategory(cat)
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
        const catId = parts[3] || selectedCategory
        if (!name || isNaN(lat) || isNaN(lon)) continue

        addCity({
          id: crypto.randomUUID(),
          name,
          coordinates: [lon, lat],
          categoryId: catId,
          visible: true,
        })
      }
    }
    input.click()
  }

  return (
    <AccordionItem value="cities">
      <AccordionTrigger className="text-sm font-medium">Villes</AccordionTrigger>
      <AccordionContent className="space-y-3 px-1">
        {/* Search */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Recherche géocodée</Label>
          <Input
            placeholder="Rechercher une ville..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-7 text-xs"
          />
          {searching && <p className="text-[11px] text-muted-foreground">Recherche...</p>}
          {searchResults.length > 0 && (
            <div className="rounded border border-border bg-popover">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  className="w-full px-2 py-1.5 text-left text-xs hover:bg-accent"
                  onClick={() => handleSelectResult(r)}
                >
                  <span className="font-medium">{r.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <Label className="w-20 shrink-0 text-xs">Catégorie</Label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs"
          >
            {cityCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Manual add + CSV import */}
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setShowManual(!showManual)}>
            Saisie manuelle
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleCsvImport}>
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
            <Button onClick={handleManualAdd} variant="outline" size="sm" className="w-full text-xs">Ajouter</Button>
          </div>
        )}

        <Separator />

        {/* Categories config */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Catégories</Label>
            <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={handleAddCategory}>
              + Ajouter
            </Button>
          </div>

          {cityCategories.map((cat) => (
            <div key={cat.id} className="rounded border border-border p-2">
              <div className="flex items-center justify-between">
                <Input
                  value={cat.name}
                  onChange={(e) => updateCityCategory(cat.id, { name: e.target.value })}
                  className="h-6 border-0 bg-transparent px-0 text-xs font-medium shadow-none focus-visible:ring-0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1 text-[11px]"
                  onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                >
                  {expandedCategory === cat.id ? 'Fermer' : 'Config'}
                </Button>
              </div>

              {expandedCategory === cat.id && (
                <div className="mt-2 space-y-2">
                  <Label className="text-[11px] font-medium text-muted-foreground">Marqueur</Label>
                  <div className="flex items-center gap-2">
                    <Label className="w-20 shrink-0 text-xs">Forme</Label>
                    <select
                      value={cat.markerStyle.shape}
                      onChange={(e) => updateCityCategory(cat.id, { markerStyle: { ...cat.markerStyle, shape: e.target.value as MarkerShape } })}
                      className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      {MARKER_SHAPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <SliderControl label="Taille" value={cat.markerStyle.size} min={1} max={15} step={0.5} onChange={(v) => updateCityCategory(cat.id, { markerStyle: { ...cat.markerStyle, size: v } })} suffix="px" />
                  <ColorPicker label="Couleur" value={cat.markerStyle.fill} onChange={(c) => updateCityCategory(cat.id, { markerStyle: { ...cat.markerStyle, fill: c } })} />
                  <ColorPicker label="Contour" value={cat.markerStyle.stroke} onChange={(c) => updateCityCategory(cat.id, { markerStyle: { ...cat.markerStyle, stroke: c } })} />

                  <Separator />

                  <Label className="text-[11px] font-medium text-muted-foreground">Label</Label>
                  <div className="flex items-center gap-2">
                    <Label className="w-20 shrink-0 text-xs">Police</Label>
                    <select
                      value={cat.labelStyle.fontFamily}
                      onChange={(e) => updateCityCategory(cat.id, { labelStyle: { ...cat.labelStyle, fontFamily: e.target.value } })}
                      className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="Gotham">Gotham</option>
                      <option value="Gotham Narrow">Gotham Narrow</option>
                      <option value="Gotham Condensed">Gotham Condensed</option>
                      <option value="system-ui, sans-serif">System</option>
                    </select>
                  </div>
                  <SliderControl label="Taille" value={cat.labelStyle.fontSize} min={6} max={24} step={1} onChange={(v) => updateCityCategory(cat.id, { labelStyle: { ...cat.labelStyle, fontSize: v } })} suffix="px" />
                  <ColorPicker label="Couleur" value={cat.labelStyle.color} onChange={(c) => updateCityCategory(cat.id, { labelStyle: { ...cat.labelStyle, color: c } })} />
                  <div className="flex items-center gap-2">
                    <Label className="w-20 shrink-0 text-xs">Graisse</Label>
                    <select
                      value={cat.labelStyle.fontWeight}
                      onChange={(e) => updateCityCategory(cat.id, { labelStyle: { ...cat.labelStyle, fontWeight: parseInt(e.target.value) as 400 | 500 | 600 | 700 } })}
                      className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="300">Light</option>
                      <option value="400">Book</option>
                      <option value="500">Medium</option>
                      <option value="700">Bold</option>
                    </select>
                  </div>
                  <ColorPicker label="Fond label" value={cat.labelStyle.backgroundColor || '#FFFFFF'} onChange={(c) => updateCityCategory(cat.id, { labelStyle: { ...cat.labelStyle, backgroundColor: c } })} />
                  <SliderControl label="Op. fond" value={Math.round((cat.labelStyle.backgroundOpacity ?? 0.8) * 100)} min={0} max={100} step={5} onChange={(v) => updateCityCategory(cat.id, { labelStyle: { ...cat.labelStyle, backgroundOpacity: v / 100 } })} suffix="%" />

                  {cityCategories.length > 1 && (
                    <>
                      <Separator />
                      <Button variant="ghost" size="sm" className="w-full text-xs text-destructive" onClick={() => removeCityCategory(cat.id)}>
                        Supprimer la catégorie
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Cities list */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold">
            Villes ({cities.length})
          </Label>
          {cities.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">Aucune ville ajoutée</p>
          ) : (
            cities.map((city) => (
                <div key={city.id} className="space-y-1 rounded border border-border px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-medium">{city.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 shrink-0 px-1.5 text-[11px] text-destructive"
                      onClick={() => removeCity(city.id)}
                    >
                      x
                    </Button>
                  </div>
                  <select
                    value={city.categoryId}
                    onChange={(e) => updateCity(city.id, { categoryId: e.target.value })}
                    className="h-6 w-full rounded border border-input bg-background px-1 text-[11px]"
                  >
                    {cityCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              ))
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
