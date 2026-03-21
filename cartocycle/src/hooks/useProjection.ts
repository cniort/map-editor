import { useMemo } from 'react'
import {
  geoMercator,
  geoConicConformal,
  geoEquirectangular,
  geoConicEqualArea,
} from 'd3-geo'
import type { GeoProjection } from 'd3-geo'
import type { ProjectionType } from '@/types'

interface UseProjectionOptions {
  type: ProjectionType
  center: [number, number]
  scale: number
  width: number
  height: number
}

export function useProjection({ type, center, scale, width, height }: UseProjectionOptions): GeoProjection {
  return useMemo(() => {
    let projection: GeoProjection

    switch (type) {
      case 'lambertConformalConic':
        projection = geoConicConformal()
          .parallels([44, 49])
        break
      case 'equirectangular':
        projection = geoEquirectangular()
        break
      case 'conicEqualArea':
        projection = geoConicEqualArea()
          .parallels([44, 49])
        break
      case 'mercator':
      default:
        projection = geoMercator()
        break
    }

    projection
      .center(center)
      .scale(scale)
      .translate([width / 2, height / 2])

    return projection
  }, [type, center[0], center[1], scale, width, height])
}
