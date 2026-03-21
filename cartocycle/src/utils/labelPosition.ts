import type { LabelAnchorPosition } from '@/types'

const ANGLE_MAP: Record<LabelAnchorPosition, number> = {
  E: 0,
  NE: -45,
  N: -90,
  NO: -135,
  O: 180,
  SO: 135,
  S: 90,
  SE: 45,
}

const ANCHOR_MAP: Record<LabelAnchorPosition, 'start' | 'middle' | 'end'> = {
  E: 'start',
  NE: 'start',
  N: 'middle',
  NO: 'end',
  O: 'end',
  SO: 'end',
  S: 'middle',
  SE: 'start',
}

export function getLabelOffset(
  position: LabelAnchorPosition | undefined,
  defaultOffset: { x: number; y: number }
): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
  if (!position) {
    return { x: defaultOffset.x, y: defaultOffset.y, anchor: 'start' }
  }

  const distance = Math.sqrt(defaultOffset.x * defaultOffset.x + defaultOffset.y * defaultOffset.y)
  const rad = (ANGLE_MAP[position] * Math.PI) / 180

  return {
    x: Math.round(Math.cos(rad) * distance * 100) / 100,
    y: Math.round(Math.sin(rad) * distance * 100) / 100,
    anchor: ANCHOR_MAP[position],
  }
}

export const LABEL_POSITIONS: { value: LabelAnchorPosition; label: string }[] = [
  { value: 'E', label: 'Droite' },
  { value: 'NE', label: 'Haut-droite' },
  { value: 'N', label: 'Haut' },
  { value: 'NO', label: 'Haut-gauche' },
  { value: 'O', label: 'Gauche' },
  { value: 'SO', label: 'Bas-gauche' },
  { value: 'S', label: 'Bas' },
  { value: 'SE', label: 'Bas-droite' },
]
