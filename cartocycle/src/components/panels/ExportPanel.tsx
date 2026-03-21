import { useState } from 'react'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useMapStore } from '@/stores/mapStore'
import { useProjectStore } from '@/stores/projectStore'
import { exportSvg, exportPng } from '@/utils/export'

const FORMAT_PRESETS = [
  { label: 'A4 Portrait', width: 210, height: 297 },
  { label: 'A4 Paysage', width: 297, height: 210 },
  { label: 'A3 Portrait', width: 297, height: 420 },
  { label: 'A3 Paysage', width: 420, height: 297 },
  { label: 'DL (Flyer)', width: 100, height: 210 },
  { label: 'Carré Instagram', width: 1080, height: 1080 },
  { label: 'Personnalisé', width: 0, height: 0 },
]

const DPI_OPTIONS = [
  { label: '72 dpi (écran)', value: 72 },
  { label: '150 dpi (draft)', value: 150 },
  { label: '300 dpi (print)', value: 300 },
  { label: '600 dpi (fine art)', value: 600 },
]

export function ExportPanel() {
  const canvas = useMapStore((s) => s.canvas)
  const setCanvasSize = useMapStore((s) => s.setCanvasSize)
  const projectName = useProjectStore((s) => s.projectName)
  const setProjectName = useProjectStore((s) => s.setProjectName)

  const [exportFormat, setExportFormat] = useState<'svg' | 'png'>('svg')
  const [dpi, setDpi] = useState(300)
  const [transparentBg, setTransparentBg] = useState(false)

  const pxWidth = Math.round((canvas.widthMm / 25.4) * dpi)
  const pxHeight = Math.round((canvas.heightMm / 25.4) * dpi)

  const handlePreset = (preset: typeof FORMAT_PRESETS[number]) => {
    if (preset.width > 0) {
      setCanvasSize(preset.width, preset.height)
    }
  }

  const handleExportSvg = () => exportSvg(projectName, canvas)
  const handleExportPng = () => exportPng(projectName, canvas, dpi, transparentBg)

  const handleSaveProject = () => useProjectStore.getState().saveToFile()

  const handleLoadProject = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.cartocycle,.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) await useProjectStore.getState().loadFromFile(file)
    }
    input.click()
  }

  return (
    <AccordionItem value="export">
      <AccordionTrigger className="text-sm font-medium">Export / Projet</AccordionTrigger>
      <AccordionContent className="space-y-3 px-1">
        {/* Project name */}
        <div className="flex items-center gap-2">
          <Label className="w-20 shrink-0 text-xs">Projet</Label>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="h-7 text-xs"
          />
        </div>

        <Separator />

        {/* Format presets */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Format</Label>
          <div className="grid grid-cols-2 gap-1">
            {FORMAT_PRESETS.filter((p) => p.width > 0).map((p) => (
              <Button
                key={p.label}
                variant={canvas.widthMm === p.width && canvas.heightMm === p.height ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-[10px]"
                onClick={() => handlePreset(p)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={canvas.widthMm}
              onChange={(e) => setCanvasSize(parseFloat(e.target.value) || 210, canvas.heightMm)}
              className="h-7 text-xs"
              type="number"
            />
            <span className="text-xs text-muted-foreground">x</span>
            <Input
              value={canvas.heightMm}
              onChange={(e) => setCanvasSize(canvas.widthMm, parseFloat(e.target.value) || 297)}
              className="h-7 text-xs"
              type="number"
            />
            <span className="text-xs text-muted-foreground">mm</span>
          </div>
        </div>

        <Separator />

        {/* Export type */}
        <div className="space-y-2">
          <div className="flex gap-1">
            <Button
              variant={exportFormat === 'svg' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setExportFormat('svg')}
            >
              SVG
            </Button>
            <Button
              variant={exportFormat === 'png' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setExportFormat('png')}
            >
              PNG
            </Button>
          </div>

          {exportFormat === 'png' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="w-20 shrink-0 text-xs">Résolution</Label>
                <select
                  value={dpi}
                  onChange={(e) => setDpi(parseInt(e.target.value))}
                  className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                >
                  {DPI_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Taille : {pxWidth.toLocaleString()} x {pxHeight.toLocaleString()} px
              </p>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={transparentBg}
                  onChange={(e) => setTransparentBg(e.target.checked)}
                  className="rounded"
                />
                Fond transparent
              </label>
            </div>
          )}

          <Button
            size="sm"
            className="w-full"
            onClick={exportFormat === 'svg' ? handleExportSvg : handleExportPng}
          >
            Exporter en {exportFormat.toUpperCase()}
          </Button>
        </div>

        <Separator />

        {/* Project save/load */}
        <div className="space-y-1.5">
          <Button onClick={handleSaveProject} variant="outline" size="sm" className="w-full text-xs">
            Sauvegarder le projet
          </Button>
          <Button onClick={handleLoadProject} variant="outline" size="sm" className="w-full text-xs">
            Charger un projet
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
