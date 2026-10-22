'use client'

import { useEffect, useState } from 'react'

import styles from '@/app/ui.module.css'

type LocationSuggestion = {
  id: string
  city: string
  region: string
  country: string
  label: string
}

type LocationAutocompleteProps = {
  initialLocation: string
  initialCity: string
  initialRegion: string
  initialCountry: string
  invalid: boolean
}

export function LocationAutocomplete({
  initialLocation,
  initialCity,
  initialRegion,
  initialCountry,
  invalid,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(initialLocation)
  const [location, setLocation] = useState(initialLocation)
  const [city, setCity] = useState(initialCity)
  const [region, setRegion] = useState(initialRegion)
  const [country, setCountry] = useState(initialCountry)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectionError, setSelectionError] = useState(false)

  useEffect(() => {
    // Don't search until there is enough text or when a valid option is already selected
    if (query.trim().length < 2 || query === location) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()

    // Wait a little before searching so every keystroke doesn't call the API
    const timer = setTimeout(async () => {
      setLoading(true)

      try {
        const response = await fetch(
          `/api/locations?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          setSuggestions([])
          return
        }

        const data = await response.json()
        setSuggestions(data.results ?? [])
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, location])

  function changeLocation(value: string) {
    // Typing again means the previous selected location is no longer valid
    setQuery(value)
    setLocation('')
    setCity('')
    setRegion('')
    setCountry('')
    setSelectionError(false)
  }

  function selectLocation(suggestion: LocationSuggestion) {
    setQuery(suggestion.label)
    setLocation(suggestion.label)
    setCity(suggestion.city)
    setRegion(suggestion.region)
    setCountry(suggestion.country)
    setSuggestions([])
    setSelectionError(false)
  }


  function checkLocation() {
    // If something was typed but no suggestion was selected, show an error
    if (query.trim() !== '' && !location) {
      setSelectionError(true)
    }
  }

  return (
    <div className={styles.locationAutocomplete}>
      <div className={styles.locationRow}>
        <input
          id="location_search"
          name="location_search"
          type="text"
          value={query}
          autoComplete="off"
          aria-invalid={invalid || selectionError}
          aria-describedby={selectionError ? 'location-selection-error' : invalid ? 'location-error' : undefined}
          onChange={(event) => changeLocation(event.target.value)}
          onBlur={checkLocation}
        />

      </div>

      {/* Only a selected suggestion or Remote is actually saved */}
      <input type="hidden" name="location" value={location} />
      <input type="hidden" name="location_city" value={city} />
      <input type="hidden" name="location_region" value={region} />
      <input type="hidden" name="location_country" value={country} />

      {selectionError && (
        <p id="location-selection-error" role="alert">
          Choose a location from the suggestions.
        </p>
      )}

      {loading && <p className={styles.muted}>Searching locations...</p>}

      {suggestions.length > 0 && (
        <div className={styles.locationSuggestions}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              className={styles.locationSuggestion}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectLocation(suggestion)}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      <p className={styles.locationAttribution}>
        Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noreferrer">Geoapify</a>
        {' · '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
      </p>
    </div>
  )
}