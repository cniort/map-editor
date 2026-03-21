import { useRef, useEffect, useCallback } from 'react'
import { select } from 'd3-selection'
import 'd3-transition'
import { zoom as d3Zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from 'd3-zoom'
import { geoPath } from 'd3-geo'
import { useMapStore } from '@/stores/mapStore'
import { useProjection } from '@/hooks/useProjection'
import { useGeoData } from '@/hooks/useGeoData'
import { RouteRenderer } from '@/components/RouteRenderer'
import { smoothedPath } from '@/utils/smoothGeo'
import type { FeatureCollection, Feature } from 'geojson'
import type { ShapeStyle, MarkerStyle, TextAnnotation } from '@/types'
import { getLabelOffset } from '@/utils/labelPosition'

interface MapCanvasProps {
  width: number
  height: number
}

// Store zoom behavior ref globally so toolbar can access it
let zoomBehaviorRef: ZoomBehavior<SVGSVGElement, unknown> | null = null
let svgSelectionRef: ReturnType<typeof select<SVGSVGElement, unknown>> | null = null

export function zoomIn() {
  if (zoomBehaviorRef && svgSelectionRef) {
    svgSelectionRef.transition().duration(300).call(zoomBehaviorRef.scaleBy, 1.5)
  }
}

export function zoomOut() {
  if (zoomBehaviorRef && svgSelectionRef) {
    svgSelectionRef.transition().duration(300).call(zoomBehaviorRef.scaleBy, 1 / 1.5)
  }
}

export function zoomReset() {
  if (zoomBehaviorRef && svgSelectionRef) {
    svgSelectionRef.transition().duration(300).call(zoomBehaviorRef.transform, zoomIdentity)
  }
}

export function MapCanvas({ width, height }: MapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement>(null)

  const canvas = useMapStore((s) => s.canvas)
  const baseMap = useMapStore((s) => s.baseMap)
  const routes = useMapStore((s) => s.routes)
  const cities = useMapStore((s) => s.cities)
  const cityCategories = useMapStore((s) => s.cityCategories)
  const annotations = useMapStore((s) => s.annotations)
  const stateVersion = useMapStore((s) => s._stateVersion)
  const { data, loading } = useGeoData()

  const projection = useProjection({
    type: canvas.projection.type,
    center: canvas.projection.center,
    scale: canvas.projection.scale,
    width,
    height,
  })

  const path = geoPath(projection)

  // Zoom & pan via SVG transform (instantaneous, no recalculation)
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return

    const svg = select(svgRef.current)
    const g = select(gRef.current)

    svgSelectionRef = svg

    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 50])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform.toString())
      })

    zoomBehaviorRef = zoomBehavior

    if (canvas.locked) {
      // Keep zoom behavior ref for buttons but disable mouse/touch interaction
      svg.on('.zoom', null)
    } else {
      svg.call(zoomBehavior)
    }

    return () => {
      svg.on('.zoom', null)
    }
  }, [canvas.locked, canvas.projection.type, canvas.projection.scale, stateVersion])

  const renderLayer = useCallback(
    (fc: FeatureCollection | null, layerId: string) => {
      if (!fc) return null

      const layer = baseMap.layers.find((l) => l.id === layerId)
      if (!layer || !layer.visible) return null

      const style = layer.style
      const useSmoothing = layer.smoothing > 0

      return (
        <g key={layerId} className={`layer-${layerId}`}>
          {fc.features.map((feature: Feature, i: number) => {
            const countryCode = feature.properties?.ISO_A3 || feature.properties?.ADM0_A3
            const overrideStyle = layer.countryOverrides?.[countryCode]
            const mergedStyle: ShapeStyle = overrideStyle
              ? { ...style, ...overrideStyle }
              : style

            const d = useSmoothing
              ? smoothedPath(feature, projection, layer.smoothing)
              : path(feature) || ''

            return (
              <path
                key={`${layerId}-${i}`}
                d={d}
                fill={mergedStyle.fill}
                fillOpacity={mergedStyle.fillOpacity}
                stroke={mergedStyle.stroke}
                strokeWidth={mergedStyle.strokeWidth}
                strokeOpacity={mergedStyle.strokeOpacity}
                strokeDasharray={mergedStyle.strokeDasharray}
              />
            )
          })}
        </g>
      )
    },
    [path, projection, baseMap.layers]
  )

  const renderMarker = useCallback((x: number, y: number, style: MarkerStyle) => {
    const s = style.size
    const common = {
      fill: style.fill,
      fillOpacity: style.fillOpacity,
      stroke: style.stroke,
      strokeWidth: style.strokeWidth,
    }

    switch (style.shape) {
      case 'square':
        return <rect x={x - s} y={y - s} width={s * 2} height={s * 2} {...common} />
      case 'diamond':
        return <polygon points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`} {...common} />
      case 'triangle':
        return <polygon points={`${x},${y - s} ${x + s},${y + s} ${x - s},${y + s}`} {...common} />
      case 'circle':
      default:
        return <circle cx={x} cy={y} r={s} {...common} />
    }
  }, [])

  const renderCities = useCallback(() => {
    return cities
      .filter((c) => c.visible)
      .map((city) => {
        const category = cityCategories.find((cat) => cat.id === city.categoryId)
        if (!category) return null

        const markerStyle = { ...category.markerStyle, ...city.markerOverride }
        const labelStyle = { ...category.labelStyle, ...city.labelOverride }
        const projected = projection(city.coordinates)
        if (!projected) return null

        const [x, y] = projected
        const posOffset = getLabelOffset(city.labelAnchorPosition, labelStyle.offset)
        const labelX = x + posOffset.x
        const labelY = y + posOffset.y
        const textAnchor = city.labelAnchorPosition ? posOffset.anchor : labelStyle.anchor
        const bgColor = labelStyle.backgroundColor
        const bgOpacity = labelStyle.backgroundOpacity ?? 0
        const bgPad = labelStyle.backgroundPadding ?? 2
        const showBg = bgColor && bgOpacity > 0
        const baseline = labelStyle.baseline || 'central'

        // Text dimensions for background rect
        const charWidth = labelStyle.fontSize * 0.55
        const approxWidth = city.name.length * charWidth + (city.name.length - 1) * Math.max(0, labelStyle.letterSpacing)
        const textHeight = labelStyle.fontSize

        // Background rect y offset depends on baseline
        const bgYOffset = baseline === 'central' ? textHeight / 2
          : baseline === 'hanging' ? 0
          : textHeight * 0.8 // alphabetic/auto

        return (
          <g key={city.id} className={`city-${city.id}`}>
            {renderMarker(x, y, markerStyle)}
            {showBg && (
              <rect
                x={labelX - bgPad}
                y={labelY - bgYOffset - bgPad}
                width={approxWidth + bgPad * 2}
                height={textHeight + bgPad * 2}
                fill={bgColor}
                fillOpacity={bgOpacity}
                rx={2}
              />
            )}
            <text
              x={labelX}
              y={labelY}
              fontFamily={labelStyle.fontFamily}
              fontSize={labelStyle.fontSize}
              fontWeight={labelStyle.fontWeight}
              fontStyle={labelStyle.fontStyle}
              fill={labelStyle.color}
              letterSpacing={labelStyle.letterSpacing}
              textAnchor={textAnchor}
              dominantBaseline={baseline}
              transform={
                labelStyle.rotation
                  ? `rotate(${labelStyle.rotation}, ${labelX}, ${labelY})`
                  : undefined
              }
            >
              {city.name}
            </text>
          </g>
        )
      })
  }, [cities, cityCategories, projection, renderMarker])

  const selectedId = useMapStore((s) => s.selectedId)
  const selectElement = useMapStore((s) => s.select)
  const updateAnnotation = useMapStore((s) => s.updateAnnotation)
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null)

  const handleAnnotationMouseDown = useCallback((e: React.MouseEvent, ann: TextAnnotation) => {
    e.stopPropagation()
    selectElement(ann.id, 'annotation')

    const svg = svgRef.current
    if (!svg) return

    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY

    // Account for zoom transform on the <g> element
    const g = gRef.current
    const ctm = g?.getScreenCTM()
    const transformed = ctm ? pt.matrixTransform(ctm.inverse()) : pt

    dragRef.current = {
      id: ann.id,
      startX: transformed.x,
      startY: transformed.y,
      origX: ann.position.x,
      origY: ann.position.y,
    }

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current || !svg) return
      const mvPt = svg.createSVGPoint()
      mvPt.x = ev.clientX
      mvPt.y = ev.clientY
      const mvTransformed = ctm ? mvPt.matrixTransform(ctm.inverse()) : mvPt

      const dx = mvTransformed.x - dragRef.current.startX
      const dy = mvTransformed.y - dragRef.current.startY

      updateAnnotation(dragRef.current.id, {
        position: {
          x: dragRef.current.origX + dx,
          y: dragRef.current.origY + dy,
        },
      })
    }

    const handleMouseUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [selectElement, updateAnnotation])

  const renderAnnotations = useCallback(() => {
    return annotations
      .filter((a): a is TextAnnotation => a.type === 'text')
      .map((ann) => {
        const isSelected = selectedId === ann.id

        // Use geographic coordinates if available, otherwise pixel coordinates
        let x = ann.position.x
        let y = ann.position.y
        if (ann.geoCoordinates) {
          const projected = projection(ann.geoCoordinates)
          if (!projected) return null
          x = projected[0]
          y = projected[1]
        }

        return (
          <text
            key={ann.id}
            x={x}
            y={y}
            fontFamily={ann.style.fontFamily}
            fontSize={ann.style.fontSize}
            fontWeight={ann.style.fontWeight}
            fontStyle={ann.style.fontStyle}
            fill={ann.style.color}
            letterSpacing={ann.style.letterSpacing}
            textAnchor={ann.style.anchor}
            dominantBaseline={ann.style.baseline}
            transform={
              ann.style.rotation
                ? `rotate(${ann.style.rotation}, ${x}, ${y})`
                : undefined
            }
            style={{
              cursor: 'move',
              outline: isSelected ? '1px dashed currentColor' : 'none',
              outlineOffset: '3px',
            }}
            onMouseDown={(e) => handleAnnotationMouseDown(e, ann)}
          >
            {ann.content}
          </text>
        )
      })
  }, [annotations, selectedId, handleAnnotationMouseDown, projection])

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        Chargement des données cartographiques...
      </div>
    )
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ backgroundColor: canvas.backgroundColor, cursor: canvas.locked ? 'default' : 'grab' }}
    >
      <g ref={gRef}>
        {renderLayer(data.countries, 'countries')}
        {renderLayer(data.coastline, 'coastline')}
        {renderLayer(data.rivers, 'rivers')}
        {renderLayer(data.regions, 'regions')}
        {routes.map((route) => (
          <RouteRenderer key={route.id} route={route} projection={projection} />
        ))}
        {renderCities()}
        {renderAnnotations()}
      </g>
    </svg>
  )
}
