import type { LngLat, TargetShape } from '@osm-editor-kit/street-imagery'

/** A place the Mapillary viewer should turn to: a sign, a traffic light, a junction … */
export type MapillaryLookAt = {
  lngLat: LngLat
  /** Size and height of the target; decides zoom and vertical position. Default: a traffic sign. */
  shape?: TargetShape
  /** The target's outline in the shown image, if known; it is more exact than the location. */
  outline?: [number, number][]
  /**
   * Mapillary value of the target (`regulatory--bicycles-only--g1`). Without an `outline`, the
   * image's own detection of this value is used: Mapillary links a map feature to few of its
   * images, but almost every image has a detection of it. With several, the one nearest to the
   * computed position wins (the computed position alone can be far off in 360° images).
   */
  value?: string
  /** Label for the outline drawn around the target. */
  label?: string
}

export type MapillaryViewerOutline = {
  id: string
  /** Image ("basic") coordinates, `[0, 0]` top left to `[1, 1]` bottom right. */
  outline: [number, number][]
  label?: string
  /** CSS color number, e.g. `0xffff00`. Default yellow. */
  color?: number
}
