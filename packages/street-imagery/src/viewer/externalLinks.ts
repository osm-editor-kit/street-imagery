import { getPanoramaxApiBase } from '../config'
import { assertIsoDate } from '../filters/searchFilters'
import { lookAroundDeepLink } from '../providers/adapters/lookaround'
import type { NormalizedPhoto, ProviderId } from '../providers/model'

/**
 * The view inside a photo, in the terms of the provider's own site. `photoId` says which photo it
 * belongs to, so that a view reported for one photo never ends up on the link of the next.
 */
export type PhotoView =
  | {
      providerId: 'mapillary'
      photoId: string
      /** Center of the view in image coordinates, `0` left to `1` right. */
      x: number
      /** Center of the view in image coordinates, `0` top to `1` bottom. */
      y: number
      /** Zoom of mapillary-js and of mapillary.com: `0` to `3`, each step doubles the size. */
      zoom: number
    }
  | {
      providerId: 'panoramax'
      photoId: string
      /** Compass direction of the view center in degrees, also in flat pictures. */
      heading: number
      /** Degrees above the horizon. */
      pitch: number
      /** Zoom level of the Panoramax viewer: `0` to `100`. */
      zoom: number
    }

const round = (value: number, digits: number): number => Number(value.toFixed(digits))

const mapillaryViewParams = ({ x, y, zoom }: Extract<PhotoView, { providerId: 'mapillary' }>) =>
  `&x=${round(x, 6)}&y=${round(y, 6)}&zoom=${round(zoom, 2)}`

/** The same precision as the viewer's own URL. */
const panoramaxXyz = ({ heading, pitch, zoom }: Extract<PhotoView, { providerId: 'panoramax' }>) =>
  `${round(heading, 2)}/${round(pitch, 2)}/${Math.round(zoom)}`

/**
 * Link to the photo on the provider's site. With a `view` (Mapillary, Panoramax) the site opens at
 * that zoom and pan; a view of another photo is ignored. How much shows around the center still
 * depends on the size of the window the link opens in.
 */
export const providerExternalLink = (photo: NormalizedPhoto, view?: PhotoView | null): string => {
  const [lng, lat] = photo.lngLat
  const shownView =
    view?.providerId === photo.providerId && view.photoId === photo.photoId ? view : null

  switch (photo.providerId) {
    case 'mapillary': {
      const params = shownView?.providerId === 'mapillary' ? mapillaryViewParams(shownView) : ''
      return `https://www.mapillary.com/app/?pKey=${encodeURIComponent(photo.photoId)}&focus=photo${params}`
    }
    case 'panoramax': {
      const id = encodeURIComponent(photo.photoId)
      return shownView?.providerId === 'panoramax'
        ? `${getPanoramaxApiBase()}/?focus=pic&pic=${id}&xyz=${panoramaxXyz(shownView)}`
        : `${getPanoramaxApiBase()}/#pic=${id}&focus=pic`
    }
    case 'kartaview':
      if (photo.sequenceId != null && photo.sequenceIndex != null) {
        return `https://kartaview.org/details/${encodeURIComponent(photo.sequenceId)}/${photo.sequenceIndex}`
      }
      return `https://kartaview.org/photo/${encodeURIComponent(photo.photoId)}`
    case 'mapilio':
      return `https://mapilio.com/app?lat=${lat}&lng=${lng}&zoom=17&pId=${encodeURIComponent(photo.photoId)}`
    case 'streetside':
      return `https://www.bing.com/maps?cp=${lat}~${lng}&lvl=18&style=x`
    case 'streetview':
      return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`
    case 'lookaround':
      return lookAroundDeepLink(lat, lng)
    case 'vegbilder': {
      const year = photo.viewerYear ?? new Date(photo.capturedAt ?? Date.now()).getUTCFullYear()
      return `https://vegbilder.atlas.vegvesen.no/?year=${year}&lat=${lat}&lng=${lng}&view=image&imageId=${encodeURIComponent(photo.photoId)}`
    }
    case 'mapillary-map-features':
    case 'mapillary-signs':
    default:
      return '#'
  }
}

export type ProviderLocationLinkOptions = {
  /**
   * Show only photos from this day on (`YYYY-MM-DD`). Mapillary only: the other services have no
   * such link param and ignore it. Throws when it is not a real day.
   */
  dateFrom?: string
}

/** Deep link to a provider's viewer at a map location (no specific photo selected). */
export const providerLocationLink = (
  providerId: ProviderId,
  lat: number,
  lng: number,
  zoom = 14,
  { dateFrom }: ProviderLocationLinkOptions = {},
): string => {
  switch (providerId) {
    case 'mapillary':
    case 'mapillary-signs':
    case 'mapillary-map-features': {
      const date = dateFrom == null ? '' : `&dateFrom=${assertIsoDate(dateFrom)}`
      return `https://www.mapillary.com/app/?lat=${lat}&lng=${lng}&z=17&focus=map${date}`
    }
    case 'panoramax':
      return `${getPanoramaxApiBase()}/?focus=map&map=${zoom}/${lat}/${lng}`
    case 'kartaview':
      return `https://kartaview.org/map/@${lat},${lng},${zoom}z`
    case 'mapilio':
      return `https://mapilio.com/app?lat=${lat}&lng=${lng}&zoom=17`
    case 'streetside':
      return `https://www.bing.com/maps?cp=${lat}~${lng}&lvl=18&style=x`
    case 'streetview':
      return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`
    case 'lookaround':
      return lookAroundDeepLink(lat, lng)
    case 'vegbilder': {
      const year = new Date().getUTCFullYear()
      return `https://vegbilder.atlas.vegvesen.no/?year=${year}&lat=${lat}&lng=${lng}`
    }
  }
}
