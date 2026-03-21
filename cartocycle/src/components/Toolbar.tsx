import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useMapStore } from '@/stores/mapStore'
import { useProjectStore } from '@/stores/projectStore'
import { zoomIn, zoomOut, zoomReset } from '@/components/MapCanvas'
import { SettingsDialog } from '@/components/SettingsDialog'
import type { ProjectionType } from '@/types'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  Undo2,
  Redo2,
  Save,
  Map,
  Settings,
} from 'lucide-react'

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <Button
      variant={active ? 'default' : 'ghost'}
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  )
}

export function Toolbar({ fullscreen, onToggleFullscreen }: { fullscreen: boolean; onToggleFullscreen: () => void }) {
  const canvas = useMapStore((s) => s.canvas)
  const setProjection = useMapStore((s) => s.setProjection)
  const toggleLock = useMapStore((s) => s.toggleLock)
  const undo = useMapStore((s) => s.undo)
  const redo = useMapStore((s) => s.redo)
  const canUndoVal = useMapStore((s) => s.canUndo)
  const canRedoVal = useMapStore((s) => s.canRedo)
  const isDirty = useProjectStore((s) => s.isDirty)
  const saveToFile = useProjectStore((s) => s.saveToFile)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <header className="flex h-11 items-center gap-1 border-b border-border bg-card/80 px-3 backdrop-blur-sm">
        {/* Projection */}
        <div className="flex items-center gap-1.5">
          <Map className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={canvas.projection.type}
            onChange={(e) => setProjection({ type: e.target.value as ProjectionType })}
            className="h-7 rounded border border-input bg-background px-2 text-xs font-medium"
          >
            <option value="mercator">Mercator</option>
            <option value="lambertConformalConic">Lambert</option>
            <option value="equirectangular">Équirectangulaire</option>
            <option value="conicEqualArea">Conique</option>
          </select>
        </div>

        <Separator orientation="vertical" className="mx-1.5 h-5" />

        {/* Zoom */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={ZoomIn} label="Zoom avant" onClick={zoomIn} />
          <ToolbarButton icon={ZoomOut} label="Zoom arrière" onClick={zoomOut} />
          <ToolbarButton icon={Maximize2} label="Réinitialiser la vue" onClick={zoomReset} />
        </div>

        <Separator orientation="vertical" className="mx-1.5 h-5" />

        {/* Lock */}
        <ToolbarButton
          icon={canvas.locked ? Lock : Unlock}
          label={canvas.locked ? 'Déverrouiller le cadrage' : 'Verrouiller le cadrage'}
          onClick={toggleLock}
          active={canvas.locked}
        />

        <Separator orientation="vertical" className="mx-1.5 h-5" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={Undo2} label="Annuler (Ctrl+Z)" onClick={undo} disabled={!canUndoVal} />
          <ToolbarButton icon={Redo2} label="Rétablir (Ctrl+Shift+Z)" onClick={redo} disabled={!canRedoVal} />
        </div>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-0.5">
          {isDirty && (
            <span className="mr-1 h-2 w-2 rounded-full bg-amber-400" title="Modifications non sauvegardées" />
          )}
          <ToolbarButton icon={Save} label="Sauvegarder (Ctrl+S)" onClick={saveToFile} />
          <ToolbarButton
            icon={fullscreen ? Minimize2 : Maximize2}
            label={fullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            onClick={onToggleFullscreen}
            active={fullscreen}
          />
          <ToolbarButton icon={Settings} label="Paramètres" onClick={() => setSettingsOpen(true)} />
        </div>
      </header>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
