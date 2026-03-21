import { useMemo } from 'react'
import { useMapStore } from '@/stores/mapStore'
import { useProjection } from '@/hooks/useProjection'

interface ScaleBarProps {
  canvasWidth: number
  canvasHeight: number
}

export function ScaleBar({ canvasWidth, canvasHeight }: ScaleBarProps) {
  const canvas = useMapStore((s) => s.canvas)

  const projection = useProjection({
    type: canvas.projection.type,
    center: canvas.projection.center,
    scale: canvas.projection.scale,
    width: canvasWidth,
    height: canvasHeight,
  })

  const scaleInfo = useMemo(() => {
    const center = projection.invert?.([canvasWidth / 2, canvasHeight / 2])
    if (!center) return null

    const [lon, lat] = center
    const p1 = projection([lon, lat])
    const p2 = projection([lon + 1, lat])
    if (!p1 || !p2) return null

    const pxPerDeg = Math.abs(p2[0] - p1[0])
    const kmPerDeg = 111.32 * Math.cos((lat * Math.PI) / 180)
    const pxPerKm = pxPerDeg / kmPerDeg

    if (pxPerKm <= 0) return null

    const targetWidthPx = 80
    const targetKm = targetWidthPx / pxPerKm
    const niceValues = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000]
    const niceKm = niceValues.find((v) => v >= targetKm) || niceValues[niceValues.length - 1]
    const barWidthPx = niceKm * pxPerKm

    return { km: niceKm, widthPx: barWidthPx }
  }, [projection, canvasWidth, canvasHeight])

  if (!scaleInfo) return null

  return (
    <div
      className="absolute bottom-3 right-3 flex flex-col items-end gap-0.5 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      <span className="text-[10px] font-medium text-foreground/70">
        {scaleInfo.km} km
      </span>
      <div
        className="h-1 rounded-full bg-foreground/50"
        style={{ width: `${scaleInfo.widthPx}px` }}
      />
    </div>
  )
}
