import { describe, expect, it } from 'bun:test'
import type { MapGeoJSONFeature } from 'maplibre-gl'
import { queryStreetImageryFeatures, streetImageryInteractiveLayerIds } from './streetImageryClick'

const hit = (layerId: string | undefined, properties: Record<string, unknown>) =>
  ({ layer: layerId ? { id: layerId } : undefined, properties }) as unknown as MapGeoJSONFeature

describe('streetImageryInteractiveLayerIds', () => {
  it('lists photo dots, photo targets, viewfields and map features, in that order', () => {
    expect(streetImageryInteractiveLayerIds(['mapillary', 'panoramax'])).toEqual([
      'photos-mapillary',
      'photos-panoramax',
      'photo-targets-mapillary',
      'photo-targets-panoramax',
      'viewfields-mapillary',
      'viewfields-panoramax',
      'features-mapillary',
      'features-panoramax',
    ])
  })

  it('is empty without providers', () => {
    expect(streetImageryInteractiveLayerIds([])).toEqual([])
  })
})

describe('queryStreetImageryFeatures', () => {
  it('returns photos and map features with their provider, top hit first', () => {
    const results = queryStreetImageryFeatures({
      features: [
        hit('photos-mapillary', { photoId: 123, sequenceId: 'seq' }),
        hit('features-mapillary-signs', { featureId: 456 }),
      ],
    })
    expect(results).toEqual([
      { providerId: 'mapillary', kind: 'photo', photoId: '123', sequenceId: 'seq' },
      { providerId: 'mapillary-signs', kind: 'mapFeature', featureId: '456' },
    ])
  })

  it('returns a photo once when its dot, target and viewfield are all hit', () => {
    const results = queryStreetImageryFeatures({
      features: [
        hit('photos-panoramax', { photoId: 'a' }),
        hit('viewfields-panoramax', { photoId: 'a' }),
        hit('photo-targets-panoramax', { photoId: 'a' }),
        hit('photo-targets-mapillary', { photoId: 'a' }),
      ],
    })
    expect(results).toEqual([
      { providerId: 'panoramax', kind: 'photo', photoId: 'a', sequenceId: undefined },
      { providerId: 'mapillary', kind: 'photo', photoId: 'a', sequenceId: undefined },
    ])
  })

  it('skips features of other layers and features without an id', () => {
    const results = queryStreetImageryFeatures({
      features: [
        hit('road-label', { photoId: 'x' }),
        hit(undefined, { photoId: 'x' }),
        hit('photos-mapillary', {}),
        hit('features-mapillary-signs', {}),
      ],
    })
    expect(results).toEqual([])
  })

  it('accepts an event without features', () => {
    expect(queryStreetImageryFeatures({})).toEqual([])
    expect(queryStreetImageryFeatures({ features: null })).toEqual([])
  })
})
