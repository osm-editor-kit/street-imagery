import { describe, expect, test } from 'bun:test'
import { clampFloatingViewerPosition } from './floatingViewerPosition'

const box = { width: 500, height: 400 }
const screen = { width: 1000, height: 800 }

describe('clampFloatingViewerPosition without minVisibleShare', () => {
  test('keeps 8px from the right and bottom edge', () => {
    expect(clampFloatingViewerPosition({ right: -50, bottom: 2 }, box, screen)).toEqual({
      right: 8,
      bottom: 8,
    })
  })

  test('has no limit on the other sides', () => {
    expect(clampFloatingViewerPosition({ right: 5000, bottom: 5000 }, box, screen)).toEqual({
      right: 5000,
      bottom: 5000,
    })
  })
})

describe('clampFloatingViewerPosition with minVisibleShare', () => {
  const clamp = (right: number, bottom: number) =>
    clampFloatingViewerPosition({ right, bottom }, box, screen, 0.2)
  // The same numbers as left and top, the way a host thinks of a window.
  const left = (right: number) => screen.width - right - box.width
  const top = (bottom: number) => screen.height - bottom - box.height

  test('leaves a place in the container as it is', () => {
    expect(clamp(100, 50)).toEqual({ right: 100, bottom: 50 })
  })

  test('keeps a fifth of the width on screen on both sides', () => {
    expect(left(clamp(5000, 50).right)).toBe(-400)
    expect(left(clamp(-5000, 50).right)).toBe(900)
  })

  test('keeps a fifth of the height at the bottom', () => {
    expect(top(clamp(0, -5000).bottom)).toBe(720)
  })

  test('never goes over the top, where the header is', () => {
    expect(top(clamp(0, 5000).bottom)).toBe(0)
  })

  test('the top limit wins for a box taller than the container', () => {
    const tall = { width: 500, height: 1000 }
    const { bottom } = clampFloatingViewerPosition({ right: 0, bottom: 0 }, tall, screen, 0.2)
    expect(screen.height - bottom - tall.height).toBe(0)
  })

  test('share 1 keeps the whole box inside', () => {
    expect(clampFloatingViewerPosition({ right: -9, bottom: -9 }, box, screen, 1)).toEqual({
      right: -0,
      bottom: -0,
    })
  })
})
