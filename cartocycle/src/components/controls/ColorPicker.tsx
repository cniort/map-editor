import { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => { setInputValue(value) }, [value])

  const handleInputChange = (v: string) => {
    setInputValue(v)
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
      onChange(v)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Label className="w-20 shrink-0 text-xs">{label}</Label>
      <div className="flex items-center gap-1.5">
        <Popover>
          <PopoverTrigger
            className="h-6 w-6 shrink-0 rounded border border-border cursor-pointer"
            style={{ backgroundColor: value }}
          />
          <PopoverContent className="w-auto p-3" align="start">
            <input
              type="color"
              value={value}
              onChange={(e) => {
                onChange(e.target.value)
                setInputValue(e.target.value)
              }}
              className="h-32 w-32 cursor-pointer border-0 p-0"
            />
          </PopoverContent>
        </Popover>
        <input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={() => setInputValue(value)}
          className="h-6 w-[72px] rounded border border-input bg-background px-1.5 font-mono text-xs text-foreground outline-none focus:border-ring"
        />
      </div>
    </div>
  )
}
