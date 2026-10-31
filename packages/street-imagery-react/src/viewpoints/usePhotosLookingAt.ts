import {
  mapillaryPhotoSource,
  rankPhotosLookingAt,
  yearsToMs,
  type LngLat,
  type NormalizedPhoto,
  type PhotoLookingAt,
  type PhotoTypeFilter,
  type ViewpointPhotoSource,
} from '@osm-editor-kit/street-imagery'
import { useQueries } from '@tanstack/react-query'
import { useState } from 'react'

export type PhotosLookingAtOptions = {
  /** Only photos from the last N years. */
  maxAgeYears?: number
  photoTypes?: PhotoTypeFilter[]
  /** Default 50; a source may not reach further (the Mapillary radius search ends at 50 m). */
  maxDistanceMeters?: number
  /** A flat photo's heading must point within this many degrees of the place. Default 35. */
  maxFlatAngleDeg?: number
  /** Candidates kept. Default 20. */
  limit?: number
  /** Extra app filter (e.g. date range), applied before ranking. */
  filterPhoto?: (photo: NormalizedPhoto) => boolean
  /** Where photos come from; default Mapillary. Pass several to rank across providers. */
  sources?: ViewpointPhotoSource[]
  /** Set after the click; nothing is requested before. */
  enabled?: boolean
}

export type PhotosLookingAtResult = {
  /** Best first. */
  candidates: PhotoLookingAt[]
  isLoading: boolean
  isError: boolean
}

const DEFAULT_SOURCES = [mapillaryPhotoSource]

/** The photos from all `sources` that see `place`, best first; `null` while there is no place. */
export const usePhotosLookingAt = (
  place: LngLat | null,
  {
    maxAgeYears,
    photoTypes,
    maxDistanceMeters,
    maxFlatAngleDeg,
    limit,
    filterPhoto,
    sources = DEFAULT_SOURCES,
    enabled = true,
  }: PhotosLookingAtOptions = {},
): PhotosLookingAtResult => {
  // Reference time for age filter and recency score; stable for the lifetime of the component.
  const [now] = useState(() => Date.now())
  const active = enabled && place != null
  // One query per source, so a slow or failing provider does not block the others. The same key
  // as `useViewSuggestions`: both share what they fetched.
  const queries = useQueries({
    queries: sources.map((source) => ({
      queryKey: ['street-imagery', 'photos-near', source.id, place?.[0], place?.[1]],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        place ? source.fetchNear(place, signal) : Promise.resolve([]),
      enabled: active,
      staleTime: 10 * 60 * 1000,
    })),
  })

  const photos = queries.flatMap((query) => query.data ?? [])
  const kept = filterPhoto ? photos.filter(filterPhoto) : photos

  return {
    candidates: place
      ? rankPhotosLookingAt(place, kept, {
          now,
          maxAgeMs: maxAgeYears == null ? undefined : yearsToMs(maxAgeYears),
          maxDistanceMeters,
          maxFlatAngleDeg,
          photoTypes,
          limit,
        })
      : [],
    isLoading: active && queries.some((query) => query.isPending),
    // An error only when every source failed; one failing provider still leaves candidates.
    isError: queries.length > 0 && queries.every((query) => query.isError),
  }
}
