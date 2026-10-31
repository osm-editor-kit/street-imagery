import type { ExpressionSpecification } from 'maplibre-gl'
import type { NormalizedMapFeature, NormalizedPhoto } from '../providers/model'

export type PhotoTypeFilter = 'flat' | 'pano'
export type DateRange = { from?: string; to?: string }

const DAY_MS = 86_400_000

export const parseIsoDateStartMs = (isoDate: string): number => {
  const [year, month, day] = isoDate.split('-').map(Number)
  return Date.UTC(year!, month! - 1, day!)
}

/** `true` for a real calendar day written as `YYYY-MM-DD`. */
export const isIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }
  // `Date.UTC` rolls over days that do not exist (2026-02-30 becomes March 2).
  return new Date(parseIsoDateStartMs(value)).toISOString().slice(0, 10) === value
}

/** Returns the day unchanged; throws when it is not a real `YYYY-MM-DD` day. */
export const assertIsoDate = (value: string): string => {
  if (!isIsoDate(value)) {
    throw new Error(`Invalid date "${value}". Expected a day as YYYY-MM-DD.`)
  }
  return value
}

export const parseIsoDateEndMs = (isoDate: string): number =>
  parseIsoDateStartMs(isoDate) + DAY_MS - 1

/** iD edge case: swap when from > to. */
export const normalizeDateRange = (date?: DateRange): DateRange | undefined => {
  if (!date?.from && !date?.to) {
    return undefined
  }

  const { from, to } = date
  if (from && to && from > to) {
    return { from: to, to: from }
  }

  return date
}

export const photoTypesFilter = (photoTypes?: PhotoTypeFilter[]): PhotoTypeFilter[] | undefined => {
  if (!photoTypes || photoTypes.length === 0) {
    return undefined
  }

  const unique = [...new Set(photoTypes)]
  if (unique.length >= 2) {
    return undefined
  }

  return unique
}

type ParsedPhotoFilter = {
  onlyType: PhotoTypeFilter | undefined
  fromMs: number | null
  toMs: number | null
}

const parsePhotoFilter = (photoTypes?: PhotoTypeFilter[], date?: DateRange): ParsedPhotoFilter => {
  const range = normalizeDateRange(date)
  return {
    onlyType: photoTypesFilter(photoTypes)?.[0],
    fromMs: range?.from ? parseIsoDateStartMs(range.from) : null,
    toMs: range?.to ? parseIsoDateEndMs(range.to) : null,
  }
}

const photoMatchesParsedFilter = (
  photo: NormalizedPhoto,
  { onlyType, fromMs, toMs }: ParsedPhotoFilter,
): boolean => {
  if (onlyType && photo.isPano !== (onlyType === 'pano')) {
    return false
  }
  if (fromMs == null && toMs == null) {
    return true
  }
  const capturedAt = photo.capturedAt
  if (capturedAt == null) {
    return false
  }
  return (fromMs == null || capturedAt >= fromMs) && (toMs == null || capturedAt <= toMs)
}

export const photoMatchesPhotoTypes = (
  photo: NormalizedPhoto,
  photoTypes?: PhotoTypeFilter[],
): boolean => photoMatchesParsedFilter(photo, parsePhotoFilter(photoTypes))

export const photoMatchesDateRange = (photo: NormalizedPhoto, date?: DateRange): boolean =>
  photoMatchesParsedFilter(photo, parsePhotoFilter(undefined, date))

/** Tests one photo. For a list use `photoFilter`, which reads the filters once. */
export const photoMatchesFilters = (
  photo: NormalizedPhoto,
  photoTypes?: PhotoTypeFilter[],
  date?: DateRange,
): boolean => photoMatchesParsedFilter(photo, parsePhotoFilter(photoTypes, date))

/**
 * The type and date filters as one test, for filtering many photos: the filters are read once,
 * not per photo.
 */
export const photoFilter = (
  photoTypes?: PhotoTypeFilter[],
  date?: DateRange,
): ((photo: NormalizedPhoto) => boolean) => {
  const parsed = parsePhotoFilter(photoTypes, date)
  return (photo) => photoMatchesParsedFilter(photo, parsed)
}

/** Map features use iD date semantics: last_seen_at >= from; first_seen_at <= to. */
export const mapFeatureMatchesDateRange = (
  feature: NormalizedMapFeature,
  date?: DateRange,
): boolean => {
  const range = normalizeDateRange(date)
  if (!range) {
    return true
  }

  if (range.from) {
    const lastSeenAt = feature.lastSeenAt
    if (lastSeenAt == null || lastSeenAt < parseIsoDateStartMs(range.from)) {
      return false
    }
  }

  if (range.to) {
    const firstSeenAt = feature.firstSeenAt
    if (firstSeenAt == null || firstSeenAt > parseIsoDateEndMs(range.to)) {
      return false
    }
  }

  return true
}

const photoTypeLayerFilter = (photoTypes?: PhotoTypeFilter[]): ExpressionSpecification | null => {
  const active = photoTypesFilter(photoTypes)
  if (!active) {
    return null
  }

  const [onlyType] = active
  return onlyType === 'flat' ? ['==', ['get', 'isPano'], false] : ['==', ['get', 'isPano'], true]
}

const photoDateLayerFilter = (date?: DateRange): ExpressionSpecification | null => {
  const range = normalizeDateRange(date)
  if (!range) {
    return null
  }

  const clauses: ExpressionSpecification[] = []
  if (range.from) {
    clauses.push(['>=', ['get', 'capturedAt'], parseIsoDateStartMs(range.from)])
  }
  if (range.to) {
    clauses.push(['<=', ['get', 'capturedAt'], parseIsoDateEndMs(range.to)])
  }

  if (clauses.length === 0) {
    return null
  }

  return clauses.length === 1 ? clauses[0]! : ['all', ...clauses]
}

// Layer filters must always be a valid expression: `filter: undefined` fails MapLibre
// style validation (dropping the layer), and omitting the prop entirely would leave a
// stale filter behind when the user clears filters.
const MATCH_ALL: ExpressionSpecification = ['boolean', true]

export const buildPhotoLayerFilter = (
  photoTypes?: PhotoTypeFilter[],
  date?: DateRange,
): ExpressionSpecification => {
  const clauses = [photoTypeLayerFilter(photoTypes), photoDateLayerFilter(date)].filter(
    (clause): clause is ExpressionSpecification => clause != null,
  )

  if (clauses.length === 0) {
    return MATCH_ALL
  }

  return clauses.length === 1 ? clauses[0]! : ['all', ...clauses]
}

export const buildMapFeatureLayerFilter = (date?: DateRange): ExpressionSpecification => {
  const range = normalizeDateRange(date)
  if (!range) {
    return MATCH_ALL
  }

  const clauses: ExpressionSpecification[] = []
  if (range.from) {
    clauses.push(['>=', ['get', 'lastSeenAt'], parseIsoDateStartMs(range.from)])
  }
  if (range.to) {
    clauses.push(['<=', ['get', 'firstSeenAt'], parseIsoDateEndMs(range.to)])
  }

  if (clauses.length === 0) {
    return MATCH_ALL
  }

  return clauses.length === 1 ? clauses[0]! : ['all', ...clauses]
}
