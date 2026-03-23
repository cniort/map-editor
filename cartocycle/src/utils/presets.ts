export interface StylePreset {
  id: string
  name: string
  backgroundColor: string
  countriesFill: string
  countriesStroke: string
  franceFill: string
  routeStroke: string
  routeWidth: number
  cityMarkerFill: string
  cityLabelColor: string
  fontFamily: string
  smoothing: number
}

const STORAGE_KEY = 'cartocycle-presets'

export const BUILT_IN_PRESETS: StylePreset[] = [
  {
    id: 'scandiberique',
    name: 'Scandibérique',
    backgroundColor: '#FFFFFF',
    countriesFill: '#E0E0E0',
    countriesStroke: '#C0C0C0',
    franceFill: '#6B6B6B',
    routeStroke: '#D42A2A',
    routeWidth: 3,
    cityMarkerFill: '#D42A2A',
    cityLabelColor: '#333333',
    fontFamily: 'Inter',
    smoothing: 12,
  },
  {
    id: 'velodyssee',
    name: 'Vélodyssée',
    backgroundColor: '#F0F7FA',
    countriesFill: '#E8E8E8',
    countriesStroke: '#BBBBBB',
    franceFill: '#D4D4D4',
    routeStroke: '#2980B9',
    routeWidth: 3,
    cityMarkerFill: '#2980B9',
    cityLabelColor: '#2C3E50',
    fontFamily: 'Inter',
    smoothing: 15,
  },
  {
    id: 'minimal',
    name: 'Minimaliste',
    backgroundColor: '#FFFFFF',
    countriesFill: '#F5F5F5',
    countriesStroke: '#E0E0E0',
    franceFill: '#EBEBEB',
    routeStroke: '#333333',
    routeWidth: 2,
    cityMarkerFill: '#333333',
    cityLabelColor: '#555555',
    fontFamily: 'Inter',
    smoothing: 20,
  },
  {
    id: 'nature',
    name: 'Nature',
    backgroundColor: '#FAFAF5',
    countriesFill: '#E8E5D8',
    countriesStroke: '#C8C3B0',
    franceFill: '#D4CEB8',
    routeStroke: '#27AE60',
    routeWidth: 3,
    cityMarkerFill: '#27AE60',
    cityLabelColor: '#2C3E2C',
    fontFamily: 'Inter',
    smoothing: 18,
  },
]

export function getCustomPresets(): StylePreset[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function saveCustomPreset(preset: StylePreset) {
  const existing = getCustomPresets()
  const updated = [...existing.filter((p) => p.id !== preset.id), preset]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function deleteCustomPreset(presetId: string) {
  const existing = getCustomPresets()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.filter((p) => p.id !== presetId)))
}
