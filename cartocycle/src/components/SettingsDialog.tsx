import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useTheme, type ThemeId } from '@/hooks/useTheme'
import { Palette, Monitor, Moon, X } from 'lucide-react'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

const THEMES: { id: ThemeId; label: string; description: string; icon: React.ElementType }[] = [
  { id: 'default', label: 'Classique', description: 'Interface claire, idéale pour le travail de jour', icon: Monitor },
  { id: 'figma', label: 'Figma', description: 'Interface sombre inspirée de Figma', icon: Palette },
  { id: 'phototech', label: 'Sombre', description: 'Interface sombre profonde avec accent indigo', icon: Moon },
]

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-[480px] rounded-lg border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">Paramètres</h2>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose} aria-label="Fermer">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Theme selection */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Thème de l'interface
          </Label>

          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => {
              const Icon = t.icon
              const isActive = theme === t.id
              return (
                <button
                  key={t.id}
                  className={`flex flex-col items-center gap-2 rounded border p-3 text-center transition-colors ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                  }`}
                  onClick={() => setTheme(t.id)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{t.label}</span>
                  <span className="text-[11px] leading-tight text-muted-foreground">{t.description}</span>
                </button>
              )
            })}
          </div>
        </div>

        <Separator className="my-5" />

        {/* Info */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Raccourcis clavier
          </Label>
          <div className="grid grid-cols-2 gap-y-1.5 text-xs">
            <span className="text-muted-foreground">Annuler</span>
            <span className="text-right font-mono text-foreground">Ctrl+Z</span>
            <span className="text-muted-foreground">Rétablir</span>
            <span className="text-right font-mono text-foreground">Ctrl+Shift+Z</span>
            <span className="text-muted-foreground">Sauvegarder</span>
            <span className="text-right font-mono text-foreground">Ctrl+S</span>
            <span className="text-muted-foreground">Exporter SVG</span>
            <span className="text-right font-mono text-foreground">Ctrl+E</span>
          </div>
        </div>

        <Separator className="my-5" />

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">CartoCycle v1.0</p>
          <p className="text-xs text-muted-foreground">Éditeur de cartes vectorielles pour la production print</p>
        </div>
      </div>
    </div>
  )
}
