type Size = { width: number; height: number }

/** Offset of the box from the right and bottom edge of its container. */
export type FloatingViewerPosition = { right: number; bottom: number }

/** Distance the box keeps from the right and bottom edge without `minVisibleShare`. */
export const FLOATING_VIEWER_EDGE = 8

/**
 * Keeps the box in its container. With `minVisibleShare` (0–1) it may leave the container until
 * only that share of its width and height shows, but never over the top: the header up there is
 * what moves it, so the top limit wins when the box is taller than the container.
 */
export const clampFloatingViewerPosition = (
  { right, bottom }: FloatingViewerPosition,
  box: Size,
  container: Size,
  minVisibleShare?: number,
): FloatingViewerPosition => {
  if (minVisibleShare === undefined) {
    return {
      right: Math.max(FLOATING_VIEWER_EDGE, right),
      bottom: Math.max(FLOATING_VIEWER_EDGE, bottom),
    }
  }
  return {
    right: Math.min(
      container.width - box.width * minVisibleShare,
      Math.max(-box.width * (1 - minVisibleShare), right),
    ),
    bottom: Math.min(
      container.height - box.height,
      Math.max(-box.height * (1 - minVisibleShare), bottom),
    ),
  }
}

/** Corner that resizes the box; the opposite side stays where it is, and so does the top. */
export type FloatingViewerResizeHandle = 'bottom-left' | 'bottom-right'

/** The photo's width per px of height: a corner dragged down grows the box as far as the photo. */
const PHOTO_ASPECT = 4 / 3

/**
 * Width of the box after dragging `handle` by `dx`, `dy` from `startWidth`. The height follows the
 * width (the photo keeps its aspect ratio), so it goes by the axis the pointer moved further.
 */
export const resizeFloatingViewerWidth = (
  handle: FloatingViewerResizeHandle,
  startWidth: number,
  { dx, dy }: { dx: number; dy: number },
  { minWidth, maxWidth }: { minWidth: number; maxWidth: number },
): number => {
  const horizontal = handle === 'bottom-left' ? -dx : dx
  const vertical = dy * PHOTO_ASPECT
  const delta = Math.abs(vertical) > Math.abs(horizontal) ? vertical : horizontal
  return Math.min(Math.max(minWidth, maxWidth), Math.max(minWidth, startWidth + delta))
}

/** Whether `handle` moves the right edge; the other one moves the left edge. */
export const growsToTheRight = (handle: FloatingViewerResizeHandle) => handle === 'bottom-right'
