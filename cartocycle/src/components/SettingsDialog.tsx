import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useTheme, type ThemeId } from '@/hooks/useTheme'
import { Palette, Monitor, Moon, X, Type, PanelLeftClose, Columns3 } from 'lucide-react'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

const THEMES: { id: ThemeId; label: string; description: string; icon: React.ElementType }[] = [
  { id: 'default', label: 'Classique', description: 'Interface claire', icon: Monitor },
  { id: 'figma', label: 'Figma', description: 'Sombre charcoal', icon: Palette },
  { id: 'phototech', label: 'Sombre', description: 'Sombre indigo', icon: Moon },
]

function OptionButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className={`flex flex-col items-center gap-1.5 rounded border p-3 text-center transition-colors ${
        active ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50 hover:bg-accent'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { theme, setTheme, uiSize, setUiSize, panelMode, setPanelMode } = useTheme()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-[520px] max-h-[85vh] overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">Paramètres</h2>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose} aria-label="Fermer">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Theme */}
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Thème</Label>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => {
              const Icon = t.icon
              return (
                <OptionButton key={t.id} active={theme === t.id} onClick={() => setTheme(t.id)}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{t.label}</span>
                  <span className="text-[10px] leading-tight text-muted-foreground">{t.description}</span>
                </OptionButton>
              )
            })}
          </div>
        </div>

        <Separator className="my-5" />

        {/* UI Size */}
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Taille de l'interface</Label>
          <div className="grid grid-cols-2 gap-2">
            <OptionButton active={uiSize === 'standard'} onClick={() => setUiSize('standard')}>
              <Type className="h-4 w-4" />
              <span className="text-xs font-medium">Standard</span>
            </OptionButton>
            <OptionButton active={uiSize === 'large'} onClick={() => setUiSize('large')}>
              <Type className="h-5 w-5" />
              <span className="text-xs font-medium">Grande</span>
            </OptionButton>
          </div>
        </div>

        <Separator className="my-5" />

        {/* Panel Mode */}
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Mode des panneaux</Label>
          <div className="grid grid-cols-2 gap-2">
            <OptionButton active={panelMode === 'docked'} onClick={() => setPanelMode('docked')}>
              <Columns3 className="h-5 w-5" />
              <span className="text-xs font-medium">Ancré</span>
              <span className="text-[10px] text-muted-foreground">Collé aux bords</span>
            </OptionButton>
            <OptionButton active={panelMode === 'floating'} onClick={() => setPanelMode('floating')}>
              <PanelLeftClose className="h-5 w-5" />
              <span className="text-xs font-medium">Flottant</span>
              <span className="text-[10px] text-muted-foreground">Style Figma</span>
            </OptionButton>
          </div>
        </div>

        <Separator className="my-5" />

        {/* Shortcuts */}
        <div className="space-y-3">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Raccourcis clavier</Label>
          <div className="grid grid-cols-2 gap-y-1.5 text-xs">
            <span className="text-muted-foreground">Annuler</span>
            <span className="text-right font-mono text-foreground">Ctrl+Z</span>
            <span className="text-muted-foreground">Rétablir</span>
            <span className="text-right font-mono text-foreground">Ctrl+Shift+Z</span>
            <span className="text-muted-foreground">Sauvegarder</span>
            <span className="text-right font-mono text-foreground">Ctrl+S</span>
            <span className="text-muted-foreground">Exporter SVG</span>
            <span className="text-right font-mono text-foreground">Ctrl+E</span>
            <span className="text-muted-foreground">Plein écran</span>
            <span className="text-right font-mono text-foreground">Ctrl+\</span>
          </div>
        </div>

        <Separator className="my-5" />

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">CartoCycle v1.0</p>
          <p className="text-xs text-muted-foreground">Éditeur graphique de cartes vectorielles pour la production print</p>
        </div>
      </div>
    </div>
  )
}
