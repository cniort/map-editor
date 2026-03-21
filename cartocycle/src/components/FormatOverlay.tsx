import { useMapStore } from '@/stores/mapStore'

interface FormatOverlayProps {
  canvasWidth: number
  canvasHeight: number
}

export function FormatOverlay({ canvasWidth, canvasHeight }: FormatOverlayProps) {
  const canvas = useMapStore((s) => s.canvas)

  // Calculate the print format rectangle centered in the canvas
  const formatRatio = canvas.widthMm / canvas.heightMm
  const canvasRatio = canvasWidth / canvasHeight

  let rectWidth: number
  let rectHeight: number

  if (formatRatio > canvasRatio) {
    // Format is wider than canvas — fit to width
    rectWidth = canvasWidth * 0.85
    rectHeight = rectWidth / formatRatio
  } else {
    // Format is taller — fit to height
    rectHeight = canvasHeight * 0.85
    rectWidth = rectHeight * formatRatio
  }

  const rectX = (canvasWidth - rectWidth) / 2
  const rectY = (canvasHeight - rectHeight) / 2

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 5 }}>
      {/* Top */}
      <div className="absolute bg-foreground/5" style={{ top: 0, left: 0, right: 0, height: `${rectY}px` }} />
      {/* Bottom */}
      <div className="absolute bg-foreground/5" style={{ bottom: 0, left: 0, right: 0, height: `${rectY}px` }} />
      {/* Left */}
      <div className="absolute bg-foreground/5" style={{ top: `${rectY}px`, left: 0, width: `${rectX}px`, height: `${rectHeight}px` }} />
      {/* Right */}
      <div className="absolute bg-foreground/5" style={{ top: `${rectY}px`, right: 0, width: `${rectX}px`, height: `${rectHeight}px` }} />
      {/* Border */}
      <div
        className="absolute border border-dashed border-foreground/20 rounded-sm"
        style={{ top: `${rectY}px`, left: `${rectX}px`, width: `${rectWidth}px`, height: `${rectHeight}px` }}
      />
      {/* Dimensions label */}
      <div
        className="absolute text-[10px] text-foreground/40 font-mono"
        style={{ top: `${rectY - 16}px`, left: `${rectX}px` }}
      >
        {canvas.widthMm} x {canvas.heightMm} mm
      </div>
    </div>
  )
}
