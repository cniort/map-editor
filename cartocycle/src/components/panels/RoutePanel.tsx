import { useCallback } from 'react'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ColorPicker } from '@/components/controls/ColorPicker'
import { SliderControl } from '@/components/controls/SliderControl'
import { useMapStore } from '@/stores/mapStore'
import { gpx } from '@tmcw/togeojson'
import type { RouteConfig, RouteStyle } from '@/types'

const DASH_PRESETS = [
  { label: 'Continu', value: undefined },
  { label: 'Points', value: '2,4' },
  { label: 'Tirets courts', value: '6,4' },
  { label: 'Tirets longs', value: '12,6' },
  { label: 'Tirets-points', value: '12,4,2,4' },
]

const LINECAP_OPTIONS: RouteStyle['strokeLinecap'][] = ['round', 'square', 'butt']
const LINEJOIN_OPTIONS: RouteStyle['strokeLinejoin'][] = ['round', 'miter', 'bevel']

export function RoutePanel() {
  const routes = useMapStore((s) => s.routes)
  const addRoute = useMapStore((s) => s.addRoute)
  const removeRoute = useMapStore((s) => s.removeRoute)
  const updateRoute = useMapStore((s) => s.updateRoute)
  const updateRouteStyle = useMapStore((s) => s.updateRouteStyle)

  const handleFileImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.gpx,.geojson,.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      if (file.size > 50 * 1024 * 1024) {
        alert('Fichier trop volumineux (max 50 Mo)')
        return
      }

      let text: string
      try {
        text = await file.text()
      } catch {
        alert('Erreur de lecture du fichier')
        return
      }
      let geometry: RouteConfig['originalGeometry']

      if (file.name.endsWith('.gpx')) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/xml')
        const geojson = gpx(doc)
        const lineFeature = geojson.features.find(
          (f) => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'
        )
        if (!lineFeature) {
          alert('Aucun tracé trouvé dans le fichier GPX')
          return
        }
        geometry = lineFeature.geometry as RouteConfig['originalGeometry']
      } else {
        const geojson = JSON.parse(text)
        if (geojson.type === 'FeatureCollection') {
          const lineFeature = geojson.features.find(
            (f: { geometry: { type: string } }) =>
              f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'
          )
          if (!lineFeature) {
            alert('Aucun tracé trouvé dans le fichier GeoJSON')
            return
          }
          geometry = lineFeature.geometry
        } else if (geojson.type === 'Feature') {
          geometry = geojson.geometry
        } else {
          geometry = geojson
        }
      }

      const defaultStyle: RouteStyle = {
        fill: 'none',
        fillOpacity: 0,
        stroke: '#E74C3C',
        strokeWidth: 3,
        strokeOpacity: 1,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }

      const route: RouteConfig = {
        id: crypto.randomUUID(),
        name: file.name.replace(/\.(gpx|geojson|json)$/, ''),
        visible: true,
        zIndex: routes.length + 10,
        sourceFile: file.name,
        originalGeometry: geometry,
        simplification: 0,
        smoothing: 0,
        style: defaultStyle,
      }

      addRoute(route)
    }
    input.click()
  }, [addRoute, routes.length])

  const getPointCount = (route: RouteConfig) => {
    const geom = route.originalGeometry
    if (geom.type === 'MultiLineString') {
      return geom.coordinates.reduce((sum, line) => sum + line.length, 0)
    }
    return geom.coordinates.length
  }

  return (
    <AccordionItem value="routes">
      <AccordionTrigger className="text-sm font-medium">Itinéraires</AccordionTrigger>
      <AccordionContent className="space-y-3 px-1">
        <Button onClick={handleFileImport} variant="outline" size="sm" className="w-full">
          Importer GPX / GeoJSON
        </Button>

        {routes.length === 0 && (
          <p className="text-xs text-muted-foreground">Aucun itinéraire chargé</p>
        )}

        {routes.map((route) => (
          <div key={route.id} className="space-y-2 rounded-md border border-border p-2.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Input
                value={route.name}
                onChange={(e) => updateRoute(route.id, { name: e.target.value })}
                className="h-6 border-0 bg-transparent px-0 text-xs font-semibold shadow-none focus-visible:ring-0"
              />
              <Switch
                checked={route.visible}
                onCheckedChange={() => updateRoute(route.id, { visible: !route.visible })}
              />
            </div>

            {route.visible && (
              <div className="space-y-2">
                {/* Points count */}
                <p className="text-[10px] text-muted-foreground">
                  {getPointCount(route).toLocaleString()} points originaux
                </p>

                <Separator />

                {/* Simplification & smoothing */}
                <SliderControl
                  label="Simplif."
                  value={route.simplification}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(v) => updateRoute(route.id, { simplification: v })}
                />
                <SliderControl
                  label="Lissage"
                  value={route.smoothing}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(v) => updateRoute(route.id, { smoothing: v })}
                />

                <Separator />

                {/* Style */}
                <ColorPicker
                  label="Couleur"
                  value={route.style.stroke}
                  onChange={(c) => updateRouteStyle(route.id, { stroke: c })}
                />
                <SliderControl
                  label="Épaisseur"
                  value={route.style.strokeWidth}
                  min={0.5}
                  max={10}
                  step={0.5}
                  onChange={(v) => updateRouteStyle(route.id, { strokeWidth: v })}
                  suffix="px"
                />
                <SliderControl
                  label="Opacité"
                  value={Math.round(route.style.strokeOpacity * 100)}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(v) => updateRouteStyle(route.id, { strokeOpacity: v / 100 })}
                  suffix="%"
                />

                {/* Dash pattern */}
                <div className="flex items-center gap-2">
                  <Label className="w-20 shrink-0 text-xs">Style</Label>
                  <select
                    value={route.style.strokeDasharray || ''}
                    onChange={(e) =>
                      updateRouteStyle(route.id, {
                        strokeDasharray: e.target.value || undefined,
                      })
                    }
                    className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    {DASH_PRESETS.map((p) => (
                      <option key={p.label} value={p.value || ''}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Linecap */}
                <div className="flex items-center gap-2">
                  <Label className="w-20 shrink-0 text-xs">Extrémités</Label>
                  <select
                    value={route.style.strokeLinecap}
                    onChange={(e) =>
                      updateRouteStyle(route.id, {
                        strokeLinecap: e.target.value as RouteStyle['strokeLinecap'],
                      })
                    }
                    className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    {LINECAP_OPTIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Linejoin */}
                <div className="flex items-center gap-2">
                  <Label className="w-20 shrink-0 text-xs">Jointures</Label>
                  <select
                    value={route.style.strokeLinejoin}
                    onChange={(e) =>
                      updateRouteStyle(route.id, {
                        strokeLinejoin: e.target.value as RouteStyle['strokeLinejoin'],
                      })
                    }
                    className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    {LINEJOIN_OPTIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <Separator />

                {/* Shadow */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={route.style.shadow?.enabled ?? false}
                      onChange={(e) =>
                        updateRouteStyle(route.id, {
                          shadow: {
                            enabled: e.target.checked,
                            offsetX: route.style.shadow?.offsetX ?? 2,
                            offsetY: route.style.shadow?.offsetY ?? 2,
                            blur: route.style.shadow?.blur ?? 4,
                            color: route.style.shadow?.color ?? '#000000',
                            opacity: route.style.shadow?.opacity ?? 0.3,
                          },
                        })
                      }
                      className="rounded"
                    />
                    Ombre portée
                  </label>
                  {route.style.shadow?.enabled && (
                    <div className="space-y-1.5 pl-2">
                      <SliderControl label="Flou" value={route.style.shadow.blur} min={0} max={20} step={1} onChange={(v) => updateRouteStyle(route.id, { shadow: { ...route.style.shadow!, blur: v } })} suffix="px" />
                      <SliderControl label="Opacité" value={Math.round(route.style.shadow.opacity * 100)} min={0} max={100} step={5} onChange={(v) => updateRouteStyle(route.id, { shadow: { ...route.style.shadow!, opacity: v / 100 } })} suffix="%" />
                      <ColorPicker label="Couleur" value={route.style.shadow.color} onChange={(c) => updateRouteStyle(route.id, { shadow: { ...route.style.shadow!, color: c } })} />
                    </div>
                  )}
                </div>

                <Separator />

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-destructive hover:text-destructive"
                  onClick={() => removeRoute(route.id)}
                >
                  Supprimer cet itinéraire
                </Button>
              </div>
            )}
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  )
}
