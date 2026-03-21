import { line, curveCatmullRom, curveLinear } from 'd3-shape'
import type { GeoProjection } from 'd3-geo'
import type { Feature, Geometry, Position } from 'geojson'

/**
 * Generates a smoothed SVG path string for a GeoJSON feature.
 * Uses Catmull-Rom spline interpolation on projected coordinates.
 * smoothing: 0 = no smoothing (straight lines), 100 = maximum smoothing
 */
export function smoothedPath(
  feature: Feature,
  projection: GeoProjection,
  smoothing: number
): string {
  const geometry = feature.geometry
  if (!geometry) return ''

  // Map smoothing 0-100 to alpha with a very gradual curve
  // smoothing 0 = no smoothing, 1 = very subtle, 50 = moderate, 100 = maximum
  // Using cubic easing so low values produce very subtle effects
  const normalized = smoothing / 100
  const alpha = normalized * normalized * normalized // cubic easing for gradual progression
  const curveFactory = alpha > 0 ? curveCatmullRom.alpha(alpha) : curveLinear

  const rings = extractRings(geometry)
  if (rings.length === 0) return ''

  return rings
    .map((ring) => {
      const projected = ring
        .map((c) => projection(c as [number, number]))
        .filter((p): p is [number, number] => p !== null)

      if (projected.length < 2) return ''

      const isClosedRing =
        ring.length > 2 &&
        ring[0][0] === ring[ring.length - 1][0] &&
        ring[0][1] === ring[ring.length - 1][1]

      const pathGenerator = line<[number, number]>()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(curveFactory)

      const pathStr = pathGenerator(projected) || ''

      if (isClosedRing && pathStr) {
        return pathStr + 'Z'
      }
      return pathStr
    })
    .filter(Boolean)
    .join(' ')
}

function extractRings(geometry: Geometry): Position[][] {
  switch (geometry.type) {
    case 'Polygon':
      return geometry.coordinates
    case 'MultiPolygon':
      return geometry.coordinates.flat()
    case 'LineString':
      return [geometry.coordinates]
    case 'MultiLineString':
      return geometry.coordinates
    default:
      return []
  }
}
