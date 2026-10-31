import type { PhotoView } from '@osm-editor-kit/street-imagery'
import type { Viewer } from 'mapillary-js'

/** After the view has been still for this long it is reported: a drag is one report. */
const REPORT_DELAY_MS = 200

/** The least vertical field of view of the Panoramax viewer, at zoom level 100. */
const PANORAMAX_MIN_FOV = 5
/** The most it shows of any picture; of a flat one only three quarters of its width. */
const PANORAMAX_MAX_FOV = 90

const tanOfHalf = (degrees: number) => Math.tan((degrees * Math.PI) / 360)

/**
 * The Panoramax viewer's zoom level (0–100) for a vertical field of view in mapillary-js, from
 * that viewer's own limits, so that both show the same height of the picture. In a flat picture
 * the degrees differ: mapillary-js draws it through a lens, the Panoramax viewer as part of a
 * sphere, where each degree has the same width.
 */
export const panoramaxZoomLevel = (verticalFov: number, horizontalFovOfPicture: number): number => {
  const maxFov = Math.min((horizontalFovOfPicture * 3) / 4, PANORAMAX_MAX_FOV)
  const fov =
    horizontalFovOfPicture >= 360
      ? verticalFov
      : (tanOfHalf(verticalFov) / tanOfHalf(horizontalFovOfPicture)) * horizontalFovOfPicture
  const level = ((maxFov - fov) / (maxFov - PANORAMAX_MIN_FOV)) * 100
  return Math.min(100, Math.max(0, level))
}

/** Rounded: the viewers wobble in the last digits of a view that does not move. */
const viewKey = (view: PhotoView): string =>
  JSON.stringify(view, (_, value: unknown) =>
    typeof value === 'number' ? Number(value.toFixed(4)) : value,
  )

/**
 * Calls `report` once the view has stopped changing, and only when it differs from the last one.
 * `viewChanged` is cheap enough for every frame of a drag.
 */
export const createPhotoViewReporter = (
  read: () => Promise<PhotoView | null>,
  report: (view: PhotoView) => void,
  delayMs = REPORT_DELAY_MS,
) => {
  let timer: ReturnType<typeof setTimeout> | undefined
  let last: string | null = null
  let stopped = false

  const send = () => {
    void read()
      .then((view) => {
        if (view && !stopped && viewKey(view) !== last) {
          last = viewKey(view)
          report(view)
        }
      })
      .catch(() => {})
  }

  return {
    viewChanged: () => {
      clearTimeout(timer)
      timer = setTimeout(send, delayMs)
    },
    stop: () => {
      stopped = true
      clearTimeout(timer)
    },
  }
}

/** Runs the reporter on a mapillary-js viewer until the returned function is called. */
export const watchMapillaryJsView = (
  viewer: Viewer,
  read: () => Promise<PhotoView | null>,
  report: (view: PhotoView) => void,
): (() => void) => {
  const reporter = createPhotoViewReporter(read, report)
  const { viewChanged } = reporter
  viewer.on('image', viewChanged)
  viewer.on('pov', viewChanged)
  viewer.on('fov', viewChanged)
  viewer.on('moveend', viewChanged)
  viewChanged()
  return () => {
    reporter.stop()
    viewer.off('image', viewChanged)
    viewer.off('pov', viewChanged)
    viewer.off('fov', viewChanged)
    viewer.off('moveend', viewChanged)
  }
}
