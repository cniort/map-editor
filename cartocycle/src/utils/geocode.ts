interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  type: string
}

export interface GeocodingResult {
  name: string
  displayName: string
  lat: number
  lon: number
}

let lastRequestTime = 0

export async function searchCity(query: string): Promise<GeocodingResult[]> {
  if (query.length < 2) return []

  const now = Date.now()
  const wait = Math.max(0, 1000 - (now - lastRequestTime))
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait))
  }
  lastRequestTime = Date.now()

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    addressdetails: '0',
  })

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        'User-Agent': 'CartoCycle/1.0',
      },
    }
  )

  if (!response.ok) return []

  const results: NominatimResult[] = await response.json()

  return results.map((r) => {
    const parts = r.display_name.split(',').map((s) => s.trim())
    const name = parts[0]
    // Show city + country (last part) for disambiguation
    const country = parts[parts.length - 1]
    const region = parts.length > 2 ? parts[parts.length - 2] : ''
    const displayName = region ? `${name}, ${region}, ${country}` : `${name}, ${country}`

    return {
      name,
      displayName,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
    }
  })
}
