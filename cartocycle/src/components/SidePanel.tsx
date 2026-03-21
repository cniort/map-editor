import { Accordion } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BaseMapPanel } from '@/components/panels/BaseMapPanel'
import { RoutePanel } from '@/components/panels/RoutePanel'
import { CitiesPanel } from '@/components/panels/CitiesPanel'
import { AnnotationsPanel } from '@/components/panels/AnnotationsPanel'
import { ExportPanel } from '@/components/panels/ExportPanel'
import { Layers } from 'lucide-react'

export function SidePanel() {
  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-border bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Layers className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-foreground">CartoCycle</h1>
          <p className="text-[10px] leading-tight text-muted-foreground">Éditeur de cartes vectorielles</p>
        </div>
      </div>

      {/* Panels */}
      <ScrollArea className="flex-1">
        <div className="p-2.5">
          <Accordion defaultValue={['basemap', 'routes']}>
            <BaseMapPanel />
            <RoutePanel />
            <CitiesPanel />
            <AnnotationsPanel />
            <ExportPanel />
          </Accordion>
        </div>
      </ScrollArea>
    </aside>
  )
}
