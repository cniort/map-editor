import type { CanvasConfig } from '@/types'

function getGothamFontFaces(): string {
  // Embed font references for SVG export
  // In a production app, these would be base64-encoded. For now, reference the font files.
  return `
    <style>
      @font-face { font-family: 'Gotham'; src: url('/fonts/Gotham-Light.otf'); font-weight: 300; font-style: normal; }
      @font-face { font-family: 'Gotham'; src: url('/fonts/Gotham-Book.otf'); font-weight: 400; font-style: normal; }
      @font-face { font-family: 'Gotham'; src: url('/fonts/Gotham-Medium.otf'); font-weight: 500; font-style: normal; }
      @font-face { font-family: 'Gotham'; src: url('/fonts/Gotham-Bold.otf'); font-weight: 700; font-style: normal; }
      @font-face { font-family: 'Gotham'; src: url('/fonts/Gotham-Black.otf'); font-weight: 900; font-style: normal; }
      @font-face { font-family: 'Gotham Narrow'; src: url('/fonts/GothamNarrow-Book.otf'); font-weight: 400; }
      @font-face { font-family: 'Gotham Narrow'; src: url('/fonts/GothamNarrow-Medium.otf'); font-weight: 500; }
      @font-face { font-family: 'Gotham Narrow'; src: url('/fonts/GothamNarrow-Bold.otf'); font-weight: 700; }
      @font-face { font-family: 'Gotham Condensed'; src: url('/fonts/GothamCond-Book.otf'); font-weight: 400; }
      @font-face { font-family: 'Gotham Condensed'; src: url('/fonts/GothamCond-Medium.otf'); font-weight: 500; }
      @font-face { font-family: 'Gotham Condensed'; src: url('/fonts/GothamCond-Bold.otf'); font-weight: 700; }
    </style>
  `
}

function prepareExportSvg(_canvas: CanvasConfig): SVGSVGElement | null {
  const mainSvg = document.querySelector('.map-canvas-container svg') as SVGSVGElement | null
  if (!mainSvg) return null

  const clone = mainSvg.cloneNode(true) as SVGSVGElement

  // Remove D3 zoom transform
  const innerG = clone.querySelector('g')
  if (innerG) innerG.removeAttribute('transform')

  // Get the original viewBox dimensions
  const viewBox = mainSvg.getAttribute('viewBox')

  // Set proper SVG attributes for export
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  if (viewBox) clone.setAttribute('viewBox', viewBox)

  // Embed font declarations
  const defsEl = clone.querySelector('defs') || clone.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), clone.firstChild)
  defsEl.innerHTML = getGothamFontFaces() + defsEl.innerHTML

  return clone
}

export function exportSvg(projectName: string, canvas: CanvasConfig) {
  const clone = prepareExportSvg(canvas)
  if (!clone) return

  clone.setAttribute('width', `${canvas.widthMm}mm`)
  clone.setAttribute('height', `${canvas.heightMm}mm`)

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
  const clone = prepareExportSvg(canvas)
  if (!clone) return

  const pxWidth = Math.round((canvas.widthMm / 25.4) * dpi)
  const pxHeight = Math.round((canvas.heightMm / 25.4) * dpi)

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
