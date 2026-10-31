import type { DateSliderPositions } from '@osm-editor-kit/street-imagery'

export type DateSliderHandle = 'from' | 'to'

/** Size of one step of the slider, in positions: about a day to a month, depending on the age. */
export const DATE_SLIDER_STEP = 0.001
/** The handles as they show. */
export const HANDLE_PX = 16
/** A press this close to a handle grabs it; half of the 44px touch target. */
const GRAB_RADIUS_PX = 22

const stepped = (position: number): number =>
  Math.round(position / DATE_SLIDER_STEP) * DATE_SLIDER_STEP

const clamped = (position: number): number => Math.min(1, Math.max(0, position))

const closeTo = (a: number, b: number, widthPx: number, px: number): boolean =>
  Math.abs(a - b) * widthPx <= px

/** Position of a point `leftPx` from the start of the track, in steps like the native handles. */
export const positionOnTrack = (leftPx: number, widthPx: number): number =>
  stepped(clamped(leftPx / widthPx))

/** The moved handle stops at the other one. */
const moveHandle = (
  positions: DateSliderPositions,
  handle: DateSliderHandle,
  position: number,
): DateSliderPositions =>
  handle === 'from'
    ? { ...positions, from: Math.min(position, positions.to) }
    : { ...positions, to: Math.max(position, positions.from) }

const nearestHandle = (positions: DateSliderPositions, press: number): DateSliderHandle =>
  press < (positions.from + positions.to) / 2 ? 'from' : 'to'

/**
 * The handle a press takes. `null` when the handles overlap under the press: they can only move
 * apart, so the direction of the drag decides (`handleOfDrag`), also when both are at one end.
 */
export const pressedHandle = (
  positions: DateSliderPositions,
  press: number,
  widthPx: number,
): DateSliderHandle | null => {
  const overlap = closeTo(positions.from, positions.to, widthPx, HANDLE_PX)
  const middle = (positions.from + positions.to) / 2
  return overlap && closeTo(press, middle, widthPx, GRAB_RADIUS_PX)
    ? null
    : nearestHandle(positions, press)
}

export const handleOfDrag = (deltaPx: number): DateSliderHandle => (deltaPx < 0 ? 'from' : 'to')

/** A drag keeps the distance between a grabbed handle and the pointer: the handle does not jump. */
export const dragPositions = (
  start: DateSliderPositions,
  press: number,
  handle: DateSliderHandle,
  deltaPx: number,
  widthPx: number,
): DateSliderPositions => {
  const grabbed = closeTo(press, start[handle], widthPx, GRAB_RADIUS_PX)
  const origin = grabbed ? start[handle] : press
  return moveHandle(start, handle, stepped(clamped(origin + deltaPx / widthPx)))
}

/** A click or tap moves the nearer handle there, or does nothing on a handle itself. */
export const tapPositions = (
  start: DateSliderPositions,
  press: number,
  widthPx: number,
): { handle: DateSliderHandle; positions: DateSliderPositions | null } => {
  const handle = nearestHandle(start, press)
  const onHandle = closeTo(press, start[handle], widthPx, HANDLE_PX / 2)
  return { handle, positions: onHandle ? null : moveHandle(start, handle, press) }
}
