import { useState, useEffect } from 'react'

export type ThemeId = 'default' | 'figma' | 'phototech'
export type UiSize = 'standard' | 'large'
export type PanelMode = 'docked' | 'floating'

const STORAGE_THEME = 'cartocycle-theme'
const STORAGE_SIZE = 'cartocycle-ui-size'
const STORAGE_PANEL = 'cartocycle-panel-mode'

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(() =>
    (localStorage.getItem(STORAGE_THEME) as ThemeId) || 'default'
  )
  const [uiSize, setUiSizeState] = useState<UiSize>(() =>
    (localStorage.getItem(STORAGE_SIZE) as UiSize) || 'standard'
  )
  const [panelMode, setPanelModeState] = useState<PanelMode>(() =>
    (localStorage.getItem(STORAGE_PANEL) as PanelMode) || 'docked'
  )

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.setAttribute('data-ui-size', uiSize)
    root.setAttribute('data-panel-mode', panelMode)
    localStorage.setItem(STORAGE_THEME, theme)
    localStorage.setItem(STORAGE_SIZE, uiSize)
    localStorage.setItem(STORAGE_PANEL, panelMode)
  }, [theme, uiSize, panelMode])

  return {
    theme,
    setTheme: (t: ThemeId) => setThemeState(t),
    uiSize,
    setUiSize: (s: UiSize) => setUiSizeState(s),
    panelMode,
    setPanelMode: (m: PanelMode) => setPanelModeState(m),
  }
}
