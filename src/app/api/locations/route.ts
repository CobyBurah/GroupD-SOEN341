import { NextResponse } from 'next/server'

type GeoapifyLocation = {
  place_id?: string
  city?: string
  state?: string
  country?: string
  formatted?: string
}

// Search Geoapify for city suggestions without exposing the API key in the browser
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''

  // Don't call the API for very short searches
  if (query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.GEOAPIFY_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Location search is not configured.' },
      { status: 500 }
    )
  }

  const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete')

  url.searchParams.set('text', query.slice(0, 100))
  url.searchParams.set('type', 'city')
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '6')
  url.searchParams.set('lang', 'en')
  url.searchParams.set('apiKey', apiKey)

  const response = await fetch(url, { cache: 'no-store' })

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Could not search locations.' },
      { status: 502 }
    )
  }

  const data = await response.json()

  const results = (data.results ?? [])
    .filter((location: GeoapifyLocation) => location.city && location.country)
    .map((location: GeoapifyLocation) => {
      const label = [
        location.city,
        location.state,
        location.country,
      ].filter(Boolean).join(', ')

      return {
        id: location.place_id ?? label,
        city: location.city,
        region: location.state ?? '',
        country: location.country,
        label,
      }
    })

  return NextResponse.json({ results })
}