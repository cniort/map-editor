import { useEffect, useRef, useState } from 'react'
import { Toolbar } from '@/components/Toolbar'
import { LayerPanel } from '@/components/LayerPanel'
import { PropertiesPanel } from '@/components/PropertiesPanel'
import { MapCanvas } from '@/components/MapCanvas'
import { FormatOverlay } from '@/components/FormatOverlay'
import { ScaleBar } from '@/components/ScaleBar'
import { useMapStore } from '@/stores/mapStore'
import { useProjectStore } from '@/stores/projectStore'
import { useUiStore } from '@/stores/uiStore'
import { exportSvg } from '@/utils/export'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [fullscreen, setFullscreen] = useState(false)
  const showFormatOverlay = useUiStore((s) => s.showFormatOverlay)
  const undo = useMapStore((s) => s.undo)
  const redo = useMapStore((s) => s.redo)
  const canvas = useMapStore((s) => s.canvas)
  const saveToLocalStorage = useProjectStore((s) => s.saveToLocalStorage)
  const saveToFile = useProjectStore((s) => s.saveToFile)
  const markDirty = useProjectStore((s) => s.markDirty)
  const isDirty = useProjectStore((s) => s.isDirty)
  const projectName = useProjectStore((s) => s.projectName)

  // Load from localStorage on startup
  useEffect(() => {
    useProjectStore.getState().loadFromLocalStorage()
  }, [])

  // Update document title
  useEffect(() => {
    document.title = `${projectName} — CartoCycle`
  }, [projectName])

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setCanvasSize({ width: Math.floor(width), height: Math.floor(height) })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Track dirty state
  useEffect(() => {
    return useMapStore.subscribe(() => markDirty())
  }, [markDirty])

  // Protect against accidental close
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo() }
      if (mod && e.key === 's') { e.preventDefault(); saveToFile() }
      if (mod && e.key === 'e') { e.preventDefault(); exportSvg(useProjectStore.getState().projectName, canvas) }
      if (e.key === 'F11' || (mod && e.key === '\\')) { e.preventDefault(); setFullscreen((f) => !f) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, saveToFile, canvas])

  // Auto-save every 15s
  useEffect(() => {
    const timer = setInterval(() => saveToLocalStorage(), 15000)
    return () => clearInterval(timer)
  }, [saveToLocalStorage])

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <Toolbar fullscreen={fullscreen} onToggleFullscreen={() => setFullscreen((f) => !f)} />
      <div className="flex flex-1 overflow-hidden">
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${fullscreen ? 'w-0 opacity-0' : 'opacity-100'}`} style={{ minWidth: fullscreen ? 0 : undefined }}>
          <LayerPanel />
        </div>
        <main
          ref={containerRef}
          className="map-canvas-container relative flex-1 overflow-hidden bg-muted/30"
        >
          {canvasSize.width > 0 && canvasSize.height > 0 && (
            <>
              <MapCanvas width={canvasSize.width} height={canvasSize.height} />
              {showFormatOverlay && <FormatOverlay canvasWidth={canvasSize.width} canvasHeight={canvasSize.height} />}
              <ScaleBar canvasWidth={canvasSize.width} canvasHeight={canvasSize.height} />
            </>
          )}
        </main>
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${fullscreen ? 'w-0 opacity-0' : 'opacity-100'}`} style={{ minWidth: fullscreen ? 0 : undefined }}>
          <PropertiesPanel />
        </div>
      </div>
    </div>
  )
}

export default App
