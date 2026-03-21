import { useState } from 'react'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColorPicker } from '@/components/controls/ColorPicker'
import { SliderControl } from '@/components/controls/SliderControl'
import { useMapStore } from '@/stores/mapStore'
import type { TextAnnotation } from '@/types'
import { X } from 'lucide-react'

export function AnnotationsPanel() {
  const annotations = useMapStore((s) => s.annotations)
  const addAnnotation = useMapStore((s) => s.addAnnotation)
  const updateAnnotation = useMapStore((s) => s.updateAnnotation)
  const removeAnnotation = useMapStore((s) => s.removeAnnotation)

  const [newText, setNewText] = useState('')

  const addTextAnnotation = () => {
    if (!newText.trim()) return
    const annotation: TextAnnotation = {
      type: 'text',
      id: crypto.randomUUID(),
      content: newText.trim(),
      position: { x: 100, y: 100 },
      style: {
        fontFamily: 'Gotham',
        fontSize: 16,
        fontWeight: 400,
        fontStyle: 'normal',
        color: '#333333',
        letterSpacing: 0,
        offset: { x: 0, y: 0 },
        anchor: 'start',
        baseline: 'auto',
        rotation: 0,
        showLeaderLine: false,
      },
      zIndex: 100,
    }
    addAnnotation(annotation)
    setNewText('')
  }

  const textAnnotations = annotations.filter((a): a is TextAnnotation => a.type === 'text')

  return (
    <AccordionItem value="annotations">
      <AccordionTrigger className="text-sm font-medium">Annotations</AccordionTrigger>
      <AccordionContent className="space-y-3 px-1">
        <div className="flex gap-1.5">
          <Input
            placeholder="Texte à ajouter..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="h-7 text-xs"
            onKeyDown={(e) => e.key === 'Enter' && addTextAnnotation()}
          />
          <Button variant="outline" size="sm" className="h-7 shrink-0 text-xs" onClick={addTextAnnotation}>
            +
          </Button>
        </div>

        {textAnnotations.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune annotation</p>
        ) : (
          textAnnotations.map((ann) => (
            <div key={ann.id} className="space-y-2 rounded border border-border p-2">
              <div className="flex items-center justify-between">
                <Input
                  value={ann.content}
                  onChange={(e) => updateAnnotation(ann.id, { content: e.target.value })}
                  className="h-6 border-0 bg-transparent px-0 text-xs font-medium shadow-none focus-visible:ring-0"
                />
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive" onClick={() => removeAnnotation(ann.id)} aria-label="Supprimer">
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <SliderControl label="Taille" value={ann.style.fontSize} min={8} max={48} step={1} onChange={(v) => updateAnnotation(ann.id, { style: { ...ann.style, fontSize: v } } as Partial<TextAnnotation>)} suffix="px" />
              <ColorPicker label="Couleur" value={ann.style.color} onChange={(c) => updateAnnotation(ann.id, { style: { ...ann.style, color: c } } as Partial<TextAnnotation>)} />
              <div className="flex items-center gap-2">
                <Label className="w-20 shrink-0 text-xs">Graisse</Label>
                <select
                  value={ann.style.fontWeight}
                  onChange={(e) => updateAnnotation(ann.id, { style: { ...ann.style, fontWeight: parseInt(e.target.value) as 400 | 500 | 600 | 700 } } as Partial<TextAnnotation>)}
                  className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="300">Light</option>
                  <option value="400">Book</option>
                  <option value="500">Medium</option>
                  <option value="700">Bold</option>
                </select>
              </div>
              <SliderControl label="Espacement" value={ann.style.letterSpacing} min={0} max={20} step={0.5} onChange={(v) => updateAnnotation(ann.id, { style: { ...ann.style, letterSpacing: v } } as Partial<TextAnnotation>)} suffix="px" />
              <SliderControl label="Rotation" value={ann.style.rotation} min={-180} max={180} step={1} onChange={(v) => updateAnnotation(ann.id, { style: { ...ann.style, rotation: v } } as Partial<TextAnnotation>)} suffix="°" />
            </div>
          ))
        )}
      </AccordionContent>
    </AccordionItem>
  )
}
