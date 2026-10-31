import { beforeAll, describe, expect, it } from 'bun:test'
import { createStreetImageryConfig, setStreetImageryConfig } from '../config'
import type { NormalizedPhoto } from '../providers/model'
import { providerExternalLink, providerLocationLink, type PhotoView } from './externalLinks'

beforeAll(() => {
  setStreetImageryConfig(
    createStreetImageryConfig({
      mapillaryToken: 'test-token',
    }),
  )
})

const streetViewPhoto: NormalizedPhoto = {
  providerId: 'streetview',
  photoId: 'pano-abc123',
  sequenceId: null,
  capturedAt: Date.parse('2021-08-01'),
  isPano: true,
  heading: null,
  lngLat: [-122.0838, 37.421755],
}

describe('providerExternalLink', () => {
  it('builds a Google Maps panorama deep link from the photo viewpoint', () => {
    expect(providerExternalLink(streetViewPhoto)).toBe(
      'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=37.421755,-122.0838',
    )
  })
})

describe('providerExternalLink with a view', () => {
  const mapillaryPhoto: NormalizedPhoto = {
    ...streetViewPhoto,
    providerId: 'mapillary',
    photoId: '1186492701832966',
  }
  const panoramaxPhoto: NormalizedPhoto = {
    ...streetViewPhoto,
    providerId: 'panoramax',
    photoId: '3d2cc5ed-741a-4617-ac2f-1b46343e00d6',
  }
  const mapillaryView: PhotoView = {
    providerId: 'mapillary',
    photoId: mapillaryPhoto.photoId,
    x: 0.526276448583614,
    y: 0.5141973155080891,
    zoom: 2.7,
  }
  const panoramaxView: PhotoView = {
    providerId: 'panoramax',
    photoId: panoramaxPhoto.photoId,
    heading: 123.456,
    pitch: -5.5,
    zoom: 59.6,
  }

  it('adds x, y and zoom to a Mapillary link, as mapillary.com writes them', () => {
    expect(providerExternalLink(mapillaryPhoto, mapillaryView)).toBe(
      'https://www.mapillary.com/app/?pKey=1186492701832966&focus=photo&x=0.526276&y=0.514197&zoom=2.7',
    )
  })

  it('builds a Panoramax link with xyz, as its viewer writes it', () => {
    expect(providerExternalLink(panoramaxPhoto, panoramaxView)).toBe(
      'https://api.panoramax.xyz/?focus=pic&pic=3d2cc5ed-741a-4617-ac2f-1b46343e00d6&xyz=123.46/-5.5/60',
    )
  })

  it('keeps the plain link without a view', () => {
    const plainMapillary = 'https://www.mapillary.com/app/?pKey=1186492701832966&focus=photo'
    expect(providerExternalLink(mapillaryPhoto)).toBe(plainMapillary)
    expect(providerExternalLink(mapillaryPhoto, null)).toBe(plainMapillary)
    expect(providerExternalLink(panoramaxPhoto)).toBe(
      'https://api.panoramax.xyz/#pic=3d2cc5ed-741a-4617-ac2f-1b46343e00d6&focus=pic',
    )
  })

  it('ignores the view of another photo', () => {
    const stale: PhotoView = { ...mapillaryView, photoId: 'the-photo-before' }
    expect(providerExternalLink(mapillaryPhoto, stale)).toBe(providerExternalLink(mapillaryPhoto))
  })

  it('ignores the view of another provider', () => {
    expect(
      providerExternalLink(panoramaxPhoto, { ...mapillaryView, photoId: panoramaxPhoto.photoId }),
    ).toBe(providerExternalLink(panoramaxPhoto))
  })

  it('other providers have no view in their links', () => {
    expect(providerExternalLink(streetViewPhoto, mapillaryView)).toBe(
      providerExternalLink(streetViewPhoto),
    )
  })
})

describe('providerLocationLink', () => {
  const lat = 52.52
  const lng = 13.405
  const zoom = 16

  it('builds a Google Street View panorama link at the map center', () => {
    expect(providerLocationLink('streetview', lat, lng, zoom)).toBe(
      'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=52.52,13.405',
    )
  })

  it('builds a Mapillary map link at the map center', () => {
    expect(providerLocationLink('mapillary', lat, lng, zoom)).toBe(
      'https://www.mapillary.com/app/?lat=52.52&lng=13.405&z=17&focus=map',
    )
  })

  it('builds a Panoramax map link with the current zoom', () => {
    expect(providerLocationLink('panoramax', lat, lng, zoom)).toBe(
      'https://api.panoramax.xyz/?focus=map&map=16/52.52/13.405',
    )
  })

  it('builds a KartaView map link with the current zoom', () => {
    expect(providerLocationLink('kartaview', lat, lng, zoom)).toBe(
      'https://kartaview.org/map/@52.52,13.405,16z',
    )
  })

  it('builds an Apple Look Around link at the map center', () => {
    const url = providerLocationLink('lookaround', lat, lng, zoom)
    const parsed = new URL(url)
    expect(parsed.origin + parsed.pathname).toBe('https://maps.apple.com/look-around')
    expect(parsed.searchParams.get('coordinate')).toBe('52.52,13.405')
    expect(parsed.searchParams.get('_mvs')).toBeTruthy()
  })
})
