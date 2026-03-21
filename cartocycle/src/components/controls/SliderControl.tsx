import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  suffix?: string
}

export function SliderControl({ label, value, min, max, step, onChange, suffix }: SliderControlProps) {
  return (
    <div className="flex items-center gap-2">
      <Label className="w-20 shrink-0 text-xs">{label}</Label>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(newValue) => {
          const v = Array.isArray(newValue) ? newValue[0] : newValue
          onChange(v)
        }}
        className="flex-1"
      />
      <span className="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground">
        {value}{suffix}
      </span>
    </div>
  )
}
