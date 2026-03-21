import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface SimpleSelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
}

export function SimpleSelect({ label, value, onChange, options, className }: SimpleSelectProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {label && <Label className="w-20 shrink-0 text-xs">{label}</Label>}
      <Select value={value} onValueChange={(v) => { if (v !== null) onChange(v) }}>
        <SelectTrigger size="sm" className="flex-1 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
