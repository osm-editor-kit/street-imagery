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
