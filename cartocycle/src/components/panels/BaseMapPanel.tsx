import { useState } from 'react'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ColorPicker } from '@/components/controls/ColorPicker'
import { SliderControl } from '@/components/controls/SliderControl'
import { useMapStore } from '@/stores/mapStore'
import { useGeoData } from '@/hooks/useGeoData'

const LAYER_LABELS: Record<string, string> = {
  countries: 'Pays',
  coastline: 'Littoral',
  rivers: 'Fleuves',
  regions: 'Régions',
}

const LAYER_DESCRIPTIONS: Record<string, string> = {
  countries: 'Frontières et surfaces des pays',
  coastline: 'Trait de côte',
  rivers: 'Fleuves et rivières principales',
  regions: 'Régions et départements français',
}

export function BaseMapPanel() {
  const baseMap = useMapStore((s) => s.baseMap)
  const backgroundColor = useMapStore((s) => s.canvas.backgroundColor)
  const setBackgroundColor = useMapStore((s) => s.setBackgroundColor)
  const toggleLayerVisibility = useMapStore((s) => s.toggleLayerVisibility)
  const updateLayerStyle = useMapStore((s) => s.updateLayerStyle)
  const updateLayerSmoothing = useMapStore((s) => s.updateLayerSmoothing)
  const setCountryOverride = useMapStore((s) => s.setCountryOverride)

  const { data } = useGeoData()
  const [expandedCountries, setExpandedCountries] = useState(false)

  // Get list of visible country names/codes from data
  const countryList = data.countries?.features
    .map((f) => ({
      code: f.properties?.ISO_A3 as string,
      name: f.properties?.NAME as string,
    }))
    .filter((c) => c.code && c.name)
    .sort((a, b) => a.name.localeCompare(b.name)) ?? []

  return (
    <AccordionItem value="basemap">
      <AccordionTrigger className="text-sm font-medium">Fond de carte</AccordionTrigger>
      <AccordionContent className="space-y-4 px-1">
        <ColorPicker
          label="Arrière-plan"
          value={backgroundColor}
          onChange={setBackgroundColor}
        />

        <Separator />

        {baseMap.layers.map((layer) => (
          <div key={layer.id} className="space-y-2 rounded-md border border-border p-2.5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold">
                  {LAYER_LABELS[layer.id] || layer.id}
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {LAYER_DESCRIPTIONS[layer.id]}
                </p>
              </div>
              <Switch
                checked={layer.visible}
                onCheckedChange={() => toggleLayerVisibility(layer.id)}
              />
            </div>

            {layer.visible && (
              <div className="space-y-2 pt-1">
                {layer.style.fill !== 'none' && (
                  <ColorPicker
                    label="Remplissage"
                    value={layer.style.fill}
                    onChange={(c) => updateLayerStyle(layer.id, { fill: c })}
                  />
                )}
                <ColorPicker
                  label="Contour"
                  value={layer.style.stroke}
                  onChange={(c) => updateLayerStyle(layer.id, { stroke: c })}
                />
                <SliderControl
                  label="Épaisseur"
                  value={layer.style.strokeWidth}
                  min={0.1}
                  max={5}
                  step={0.1}
                  onChange={(v) => updateLayerStyle(layer.id, { strokeWidth: v })}
                  suffix="px"
                />
                <SliderControl
                  label="Opacité"
                  value={Math.round(layer.style.fillOpacity * 100)}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(v) => updateLayerStyle(layer.id, { fillOpacity: v / 100 })}
                  suffix="%"
                />
                <SliderControl
                  label="Op. contour"
                  value={Math.round(layer.style.strokeOpacity * 100)}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(v) => updateLayerStyle(layer.id, { strokeOpacity: v / 100 })}
                  suffix="%"
                />
                <SliderControl
                  label="Lissage"
                  value={layer.smoothing}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(v) => updateLayerSmoothing(layer.id, v)}
                />

                {/* France dedicated section */}
                {layer.id === 'countries' && (
                  <div className="space-y-2 pt-1">
                    <Separator />
                    <Label className="text-[11px] font-semibold text-muted-foreground">France</Label>
                    <ColorPicker
                      label="Remplissage"
                      value={layer.countryOverrides?.FRA?.fill || layer.style.fill}
                      onChange={(c) => setCountryOverride(layer.id, 'FRA', { fill: c })}
                    />
                    <ColorPicker
                      label="Contour"
                      value={layer.countryOverrides?.FRA?.stroke || layer.style.stroke}
                      onChange={(c) => setCountryOverride(layer.id, 'FRA', { stroke: c })}
                    />

                    <Separator />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setExpandedCountries(!expandedCountries)}
                    >
                      {expandedCountries ? 'Masquer' : 'Afficher'} les autres pays
                    </Button>

                    {expandedCountries && (
                      <div className="mt-1 max-h-60 space-y-1.5 overflow-y-auto rounded border border-border p-2">
                        {countryList
                          .filter((c) => c.code !== 'FRA')
                          .map((country) => {
                            const override = layer.countryOverrides?.[country.code]
                            const currentFill = override?.fill || layer.style.fill
                            return (
                              <div key={country.code} className="flex items-center gap-2">
                                <span className="w-24 truncate text-[11px]" title={country.name}>
                                  {country.name}
                                </span>
                                <input
                                  type="color"
                                  value={currentFill}
                                  onChange={(e) =>
                                    setCountryOverride(layer.id, country.code, { fill: e.target.value })
                                  }
                                  className="h-5 w-5 cursor-pointer rounded border-0 p-0"
                                />
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  )
}
