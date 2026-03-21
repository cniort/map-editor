import { useState, useEffect } from 'react'

export type ThemeId = 'default' | 'figma' | 'phototech'

const STORAGE_KEY = 'cartocycle-theme'

const THEME_LABELS: Record<ThemeId, string> = {
  default: 'Classique',
  figma: 'Figma',
  phototech: 'Sombre',
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    return (localStorage.getItem(STORAGE_KEY) as ThemeId) || 'default'
  })

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = (t: ThemeId) => setThemeState(t)

  const cycleTheme = () => {
    const themes: ThemeId[] = ['default', 'figma', 'phototech']
    const idx = themes.indexOf(theme)
    setTheme(themes[(idx + 1) % themes.length])
  }

  return { theme, setTheme, cycleTheme, label: THEME_LABELS[theme] }
}
