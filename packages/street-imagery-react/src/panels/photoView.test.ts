import { describe, expect, test } from 'bun:test'
import type { PhotoView } from '@osm-editor-kit/street-imagery'
import { createPhotoViewReporter, panoramaxZoomLevel } from './photoView'

describe('panoramaxZoomLevel', () => {
  test('uses the limits of the Panoramax viewer for a 360 picture', () => {
    expect(panoramaxZoomLevel(90, 360)).toBe(0)
    expect(panoramaxZoomLevel(5, 360)).toBe(100)
    expect(panoramaxZoomLevel(64.5, 360)).toBeCloseTo(30, 10)
  })

  test('a flat picture has less room: three quarters of its width', () => {
    // field_of_view 95: the live viewer has maxFov 71.25, and level 30 is 51.375 of its degrees.
    // The same share of the picture: 51.375 / 95. Through a lens that is 2 × atan(tan(47.5°) × share).
    const lensFov =
      (2 * Math.atan(Math.tan((47.5 * Math.PI) / 180) * (51.375 / 95)) * 180) / Math.PI
    expect(panoramaxZoomLevel(lensFov, 95)).toBeCloseTo(30, 10)
  })

  test('stays in 0 to 100', () => {
    expect(panoramaxZoomLevel(120, 70)).toBe(0)
    expect(panoramaxZoomLevel(1, 70)).toBe(100)
  })
})

const view = (zoom: number): PhotoView => ({
  providerId: 'mapillary',
  photoId: 'a',
  x: 0.5,
  y: 0.5,
  zoom,
})
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('createPhotoViewReporter', () => {
  test('a burst of changes reports once, with the last view', async () => {
    const reports: PhotoView[] = []
    let current = view(0)
    const reporter = createPhotoViewReporter(
      async () => current,
      (v) => reports.push(v),
      5,
    )
    for (const zoom of [1, 2, 3]) {
      current = view(zoom)
      reporter.viewChanged()
    }
    await wait(20)
    expect(reports).toEqual([view(3)])
  })

  test('the same view is not reported twice', async () => {
    const reports: PhotoView[] = []
    const reporter = createPhotoViewReporter(
      async () => view(1),
      (v) => reports.push(v),
      1,
    )
    reporter.viewChanged()
    await wait(10)
    reporter.viewChanged()
    await wait(10)
    expect(reports).toHaveLength(1)
  })

  test('a change in the last digits is no change', async () => {
    const reports: PhotoView[] = []
    let zoom = 1
    const reporter = createPhotoViewReporter(
      async () => view(zoom),
      (v) => reports.push(v),
      1,
    )
    reporter.viewChanged()
    await wait(10)
    zoom = 1 + 1e-12
    reporter.viewChanged()
    await wait(10)
    expect(reports).toHaveLength(1)
  })

  test('reports nothing after stop, and survives a failed read', async () => {
    const reports: PhotoView[] = []
    const reporter = createPhotoViewReporter(
      async () => view(1),
      (v) => reports.push(v),
      1,
    )
    reporter.viewChanged()
    reporter.stop()
    await wait(10)
    expect(reports).toEqual([])

    const failing = createPhotoViewReporter(
      () => Promise.reject(new Error('gone')),
      () => {},
      1,
    )
    failing.viewChanged()
    await wait(5)
  })
})
