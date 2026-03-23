import { useState, useEffect } from 'react'
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import type { FeatureCollection } from 'geojson'

interface GeoDataSet {
  countries: FeatureCollection | null
  coastline: FeatureCollection | null
  rivers: FeatureCollection | null
  regions: FeatureCollection | null
}

const base = import.meta.env.BASE_URL

const DATA_URLS = {
  countries: `${base}data/countries.topojson`,
  coastline: `${base}data/coastline.topojson`,
  rivers: `${base}data/rivers.topojson`,
  regions: `${base}data/regions_fr.topojson`,
} as const

type LayerKey = keyof typeof DATA_URLS

const OBJECT_NAMES: Record<LayerKey, string> = {
  countries: 'countries',
  coastline: 'coastline',
  rivers: 'rivers',
  regions: 'regions',
}

async function loadTopoJSON(url: string, objectName: string): Promise<FeatureCollection> {
  const response = await fetch(url)
  const topology = (await response.json()) as Topology
  return feature(topology, topology.objects[objectName]) as FeatureCollection
}

export function useGeoData() {
  const [data, setData] = useState<GeoDataSet>({
    countries: null,
    coastline: null,
    rivers: null,
    regions: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const results = await Promise.all(
          (Object.keys(DATA_URLS) as LayerKey[]).map((key) =>
            loadTopoJSON(DATA_URLS[key], OBJECT_NAMES[key]).then(
              (fc) => [key, fc] as const
            )
          )
        )

        if (cancelled) return

        const newData = { ...data }
        for (const [key, fc] of results) {
          newData[key] = fc
        }
        setData(newData)
        setLoading(false)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erreur de chargement des données')
          setLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}
