import type { CanvasConfig } from '@/types'

export function exportSvg(projectName: string, canvas: CanvasConfig) {
  const mainSvg = document.querySelector('.map-canvas-container svg') as SVGSVGElement | null
  if (!mainSvg) return

  const clone = mainSvg.cloneNode(true) as SVGSVGElement

  // Remove D3 zoom transform from the inner <g> so export reflects the original projection
  const innerG = clone.querySelector('g')
  if (innerG) {
    innerG.removeAttribute('transform')
  }

  clone.setAttribute('width', `${canvas.widthMm}mm`)
  clone.setAttribute('height', `${canvas.heightMm}mm`)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const serializer = new XMLSerializer()
  const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(clone)
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  downloadBlob(blob, `${projectName.replace(/\s+/g, '_')}.svg`)
}

export function exportPng(
  projectName: string,
  canvas: CanvasConfig,
  dpi: number,
  transparentBg: boolean
) {
  const mainSvg = document.querySelector('.map-canvas-container svg') as SVGSVGElement | null
  if (!mainSvg) return

  const pxWidth = Math.round((canvas.widthMm / 25.4) * dpi)
  const pxHeight = Math.round((canvas.heightMm / 25.4) * dpi)

  const clone = mainSvg.cloneNode(true) as SVGSVGElement
  const innerG = clone.querySelector('g')
  if (innerG) innerG.removeAttribute('transform')

  clone.setAttribute('width', String(pxWidth))
  clone.setAttribute('height', String(pxHeight))
  if (transparentBg) clone.style.backgroundColor = 'transparent'

  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(clone)
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.onload = () => {
    const cvs = document.createElement('canvas')
    cvs.width = pxWidth
    cvs.height = pxHeight
    const ctx = cvs.getContext('2d')
    if (!ctx) { URL.revokeObjectURL(url); return }

    if (!transparentBg) {
      ctx.fillStyle = canvas.backgroundColor
      ctx.fillRect(0, 0, pxWidth, pxHeight)
    }
    ctx.drawImage(img, 0, 0, pxWidth, pxHeight)

    cvs.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${projectName.replace(/\s+/g, '_')}.png`)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
    alert('Erreur lors de la génération du PNG')
  }
  img.src = url
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
