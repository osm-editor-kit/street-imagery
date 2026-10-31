import { describe, expect, it } from 'bun:test'
import type { NormalizedPhoto } from '../providers/model'
import { bearingDeg, destinationPoint, type LngLat } from './geometry'
import { rankPhotosLookingAt, yearsToMs } from './rankPhotos'

const place: LngLat = [13.45, 52.47]
const NOW = Date.UTC(2026, 8, 1)
const YEAR_MS = yearsToMs(1)

let nextId = 0
/** A photo `meters` away from the place, in compass direction `from`. */
const photoAt = (
  from: number,
  meters: number,
  heading: number | null,
  extra: Partial<NormalizedPhoto> = {},
): NormalizedPhoto => ({
  providerId: 'mapillary',
  photoId: `photo-${(nextId += 1)}`,
  sequenceId: null,
  capturedAt: NOW - YEAR_MS,
  isPano: false,
  heading,
  lngLat: destinationPoint(place, from, meters),
  ...extra,
})

const rank = (photos: NormalizedPhoto[], options = {}) =>
  rankPhotosLookingAt(place, photos, { now: NOW, ...options })

describe('rankPhotosLookingAt', () => {
  it('keeps a flat photo that looks at the place, with the bearing to it', () => {
    // South of the place, looking north.
    const [candidate] = rank([photoAt(180, 30, 0)])
    expect(candidate?.bearingToPlace).toBeCloseTo(0, 2)
    expect(candidate?.angleDiff).toBeCloseTo(0, 2)
    expect(candidate?.distanceMeters).toBeCloseTo(30, 1)
  })

  it('keeps a photo at the edge of the view angle, drops one just past it', () => {
    expect(rank([photoAt(180, 30, 34)])).toHaveLength(1)
    expect(rank([photoAt(180, 30, 36)])).toHaveLength(0)
  })

  it('drops a flat photo that looks past the place', () => {
    expect(rank([photoAt(180, 30, 80)])).toHaveLength(0)
  })

  it('drops a photo behind the place, looking away from it', () => {
    // North of the place, looking north: the same heading that sees it from the south.
    expect(rank([photoAt(0, 30, 0)])).toHaveLength(0)
    expect(rank([photoAt(180, 30, 180)])).toHaveLength(0)
  })

  it('keeps a pano within the distance, whatever its heading', () => {
    const [candidate] = rank([
      photoAt(90, 30, 0, { isPano: true }),
      photoAt(90, 60, null, { isPano: true }),
    ])
    expect(candidate?.photo.isPano).toBe(true)
    expect(candidate?.angleDiff).toBe(0)
    expect(candidate?.bearingToPlace).toBeCloseTo(270, 2)
    expect(rank([photoAt(90, 60, 0, { isPano: true })])).toHaveLength(0)
  })

  it('a pano needs no heading', () => {
    expect(rank([photoAt(90, 30, null, { isPano: true })])).toHaveLength(1)
  })

  it('drops a flat photo without a heading, also very close', () => {
    expect(rank([photoAt(180, 30, null)])).toHaveLength(0)
    expect(rank([photoAt(180, 2, null)])).toHaveLength(0)
  })

  it('keeps a very close photo whatever the jittery bearing says', () => {
    expect(rank([photoAt(180, 3, 180)])).toHaveLength(1)
    expect(rank([photoAt(90, 0, 200)])).toHaveLength(1)
    expect(rank([photoAt(180, 6, 180)])).toHaveLength(0)
  })

  it('compares bearings across 0° and 360°', () => {
    // Bearing to the place is about 350°; a heading of 10° is only 20° off.
    const across = photoAt(170, 30, 10)
    expect(bearingDeg(across.lngLat, place)).toBeCloseTo(350, 1)
    const [candidate] = rank([across])
    expect(candidate?.angleDiff).toBeCloseTo(20, 1)
    // And the other way: bearing about 10°, heading 350°.
    expect(rank([photoAt(190, 30, 350)])).toHaveLength(1)
    expect(rank([photoAt(190, 30, 300)])).toHaveLength(0)
  })

  it('sorts by nearness and age, a flat photo before an equally near pano', () => {
    const far = photoAt(180, 45, 0)
    const near = photoAt(180, 5, 0)
    const old = photoAt(180, 5, 0, { capturedAt: NOW - 8 * YEAR_MS })
    const pano = photoAt(180, 5, 0, { isPano: true })
    expect(rank([old, far, pano, near]).map(({ photo }) => photo)).toEqual([near, pano, far, old])
  })

  it('takes its options: distance, view angle, age, photo type, limit', () => {
    const photo = photoAt(180, 30, 40)
    expect(rank([photo])).toHaveLength(0)
    expect(rank([photo], { maxFlatAngleDeg: 45 })).toHaveLength(1)
    expect(rank([photo], { maxFlatAngleDeg: 45, maxDistanceMeters: 20 })).toHaveLength(0)

    const lookingAt = photoAt(180, 30, 0, { capturedAt: NOW - 3 * YEAR_MS })
    expect(rank([lookingAt], { maxAgeMs: yearsToMs(2) })).toHaveLength(0)
    expect(
      rank([photoAt(180, 30, 0, { capturedAt: null })], { maxAgeMs: yearsToMs(2) }),
    ).toHaveLength(0)
    expect(rank([lookingAt], { photoTypes: ['pano'] })).toHaveLength(0)
    expect(rank([photoAt(0, 30, null, { isPano: true })], { photoTypes: ['flat'] })).toHaveLength(0)
    expect(rank([photoAt(180, 10, 0), photoAt(180, 20, 0)], { limit: 1 })).toHaveLength(1)
  })

  it('counts a photo of two sources once', () => {
    const photo = photoAt(180, 30, 0)
    expect(rank([photo, { ...photo }])).toHaveLength(1)
  })
})
