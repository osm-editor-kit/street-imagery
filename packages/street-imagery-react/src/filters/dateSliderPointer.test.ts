import { describe, expect, test } from 'bun:test'
import {
  dragPositions,
  handleOfDrag,
  positionOnTrack,
  pressedHandle,
  tapPositions,
} from './dateSliderPointer'

const WIDTH = 400

describe('positionOnTrack', () => {
  test('stays on the track and uses the steps of the native handles', () => {
    expect(positionOnTrack(-20, WIDTH)).toBe(0)
    expect(positionOnTrack(500, WIDTH)).toBe(1)
    expect(positionOnTrack(100.1, WIDTH)).toBeCloseTo(0.25, 10)
    expect(positionOnTrack(100.3, WIDTH)).toBeCloseTo(0.251, 10)
  })
})

describe('tapPositions', () => {
  const range = { from: 0.2, to: 0.8 }

  test('moves the nearer handle to the exact position', () => {
    expect(tapPositions(range, 0.3, WIDTH)).toEqual({
      handle: 'from',
      positions: { from: 0.3, to: 0.8 },
    })
    expect(tapPositions(range, 0.6, WIDTH)).toEqual({
      handle: 'to',
      positions: { from: 0.2, to: 0.6 },
    })
    expect(tapPositions(range, 0.05, WIDTH).positions).toEqual({ from: 0.05, to: 0.8 })
    expect(tapPositions(range, 1, WIDTH).positions).toEqual({ from: 0.2, to: 1 })
  })

  test('does nothing on a handle itself', () => {
    expect(tapPositions(range, 0.21, WIDTH)).toEqual({ handle: 'from', positions: null })
    expect(tapPositions(range, 0.8, WIDTH)).toEqual({ handle: 'to', positions: null })
  })

  test('takes the handle on that side of two on the same spot', () => {
    const spot = { from: 0.5, to: 0.5 }
    expect(tapPositions(spot, 0.3, WIDTH).positions).toEqual({ from: 0.3, to: 0.5 })
    expect(tapPositions(spot, 0.7, WIDTH).positions).toEqual({ from: 0.5, to: 0.7 })
  })
})

describe('pressedHandle', () => {
  test('is the nearer handle while they are apart, however close the press', () => {
    expect(pressedHandle({ from: 0.4, to: 0.6 }, 0.41, WIDTH)).toBe('from')
    expect(pressedHandle({ from: 0.4, to: 0.6 }, 0.59, WIDTH)).toBe('to')
    // 20px apart, just more than a handle wide.
    expect(pressedHandle({ from: 0.45, to: 0.5 }, 0.46, WIDTH)).toBe('from')
    expect(pressedHandle({ from: 0.45, to: 0.5 }, 0.49, WIDTH)).toBe('to')
  })

  test('leaves it to the drag when they overlap under the press', () => {
    expect(pressedHandle({ from: 0.5, to: 0.5 }, 0.5, WIDTH)).toBeNull()
    expect(pressedHandle({ from: 0.5, to: 0.52 }, 0.49, WIDTH)).toBeNull()
    expect(pressedHandle({ from: 1, to: 1 }, 1, WIDTH)).toBeNull()
  })

  test('is the nearer handle for a press far from overlapping ones', () => {
    expect(pressedHandle({ from: 0.5, to: 0.5 }, 0.2, WIDTH)).toBe('from')
    expect(pressedHandle({ from: 0.5, to: 0.5 }, 0.8, WIDTH)).toBe('to')
  })
})

describe('dragPositions', () => {
  const range = { from: 0.2, to: 0.8 }

  test('keeps the distance to a grabbed handle', () => {
    // Press 12px right of the handle, then 40px to the right: the handle moves 40px, not 52px.
    expect(dragPositions(range, 0.23, 'from', 40, WIDTH).from).toBeCloseTo(0.3, 10)
  })

  test('follows the pointer from a press far from the handle', () => {
    expect(dragPositions(range, 0.4, 'from', 40, WIDTH).from).toBeCloseTo(0.5, 10)
  })

  test('stops at the other handle and at the ends', () => {
    expect(dragPositions(range, 0.2, 'from', 400, WIDTH)).toEqual({ from: 0.8, to: 0.8 })
    expect(dragPositions(range, 0.8, 'to', -400, WIDTH)).toEqual({ from: 0.2, to: 0.2 })
    expect(dragPositions(range, 0.8, 'to', 400, WIDTH).to).toBe(1)
    expect(dragPositions(range, 0.2, 'from', -400, WIDTH).from).toBe(0)
  })

  test('two handles at the right end come apart to the left', () => {
    const atEnd = { from: 1, to: 1 }
    const handle = pressedHandle(atEnd, 1, WIDTH) ?? handleOfDrag(-40)
    expect(handle).toBe('from')
    expect(dragPositions(atEnd, 1, handle, -40, WIDTH).from).toBeCloseTo(0.9, 10)
  })

  test('two handles at the left end come apart to the right', () => {
    const atStart = { from: 0, to: 0 }
    const handle = pressedHandle(atStart, 0, WIDTH) ?? handleOfDrag(40)
    expect(handle).toBe('to')
    expect(dragPositions(atStart, 0, handle, 40, WIDTH).to).toBeCloseTo(0.1, 10)
  })
})
