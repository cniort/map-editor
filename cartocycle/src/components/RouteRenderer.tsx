import { useMemo } from 'react'
import { line, curveCatmullRom, curveLinear } from 'd3-shape'
import { simplify } from '@turf/simplify'
import type { GeoProjection } from 'd3-geo'
import type { RouteConfig } from '@/types'
import type { Feature, LineString, MultiLineString, Position } from 'geojson'

interface RouteRendererProps {
  route: RouteConfig
  projection: GeoProjection
}

export function RouteRenderer({ route, projection }: RouteRendererProps) {
  const processed = useMemo(() => {
    let geometry = route.originalGeometry

    // Douglas-Peucker simplification
    if (route.simplification > 0) {
      const epsilon = Math.pow(10, -4 + (route.simplification * 3) / 100)
      const feature: Feature<LineString | MultiLineString> = {
        type: 'Feature',
        properties: {},
        geometry,
      }
      const simplified = simplify(feature, {
        tolerance: epsilon,
        highQuality: true,
      })
      geometry = simplified.geometry
    }

    const coordinates =
      geometry.type === 'MultiLineString'
        ? geometry.coordinates
        : [geometry.coordinates]

    const originalCount =
      route.originalGeometry.type === 'MultiLineString'
        ? route.originalGeometry.coordinates.reduce((s, l) => s + l.length, 0)
        : route.originalGeometry.coordinates.length

    const currentCount = coordinates.reduce((s, l) => s + l.length, 0)

    return { coordinates, originalCount, currentCount }
  }, [route.originalGeometry, route.simplification])

  const pathStrings = useMemo(() => {
    const alpha = route.smoothing / 100
    const curveFactory = alpha > 0 ? curveCatmullRom.alpha(alpha) : curveLinear

    return processed.coordinates.map((coords: Position[]) => {
      const projected = coords
        .map((c) => projection(c as [number, number]))
        .filter((p): p is [number, number] => p !== null)

      const pathGenerator = line<[number, number]>()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(curveFactory)

      return pathGenerator(projected) || ''
    })
  }, [processed.coordinates, route.smoothing, projection])

  if (!route.visible) return null

  const shadow = route.style.shadow
  const filterId = `shadow-${route.id}`

  return (
    <g id={`itineraire-${route.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
      {shadow?.enabled && (
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx={shadow.offsetX}
              dy={shadow.offsetY}
              stdDeviation={shadow.blur / 2}
              floodColor={shadow.color}
              floodOpacity={shadow.opacity}
            />
          </filter>
        </defs>
      )}
      {pathStrings.map((d: string, i: number) => (
        <path
          key={`${route.id}-${i}`}
          d={d}
          fill="none"
          stroke={route.style.stroke}
          strokeWidth={route.style.strokeWidth}
          strokeOpacity={route.style.strokeOpacity}
          strokeLinecap={route.style.strokeLinecap}
          strokeLinejoin={route.style.strokeLinejoin}
          strokeDasharray={route.style.strokeDasharray}
          filter={shadow?.enabled ? `url(#${filterId})` : undefined}
        />
      ))}
    </g>
  )
}
