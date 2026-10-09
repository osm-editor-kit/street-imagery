import type { Bbox } from '@osm-editor-kit/street-imagery'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { useCallback, useSyncExternalStore } from 'react'
import { useMap } from 'react-map-gl/maplibre'

/** The last bbox read per map: the same viewport gives the same array, for all callers. */
const lastBboxByMap = new WeakMap<MapLibreMap, Bbox>()

const readBbox = (map: MapLibreMap): Bbox => {
  const bounds = map.getBounds()
  const bbox: Bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]
  const last = lastBboxByMap.get(map)
  if (last && last.every((value, index) => value === bbox[index])) {
    return last
  }
  lastBboxByMap.set(map, bbox)
  return bbox
}

/**
 * WGS84 bbox of a react-map-gl map, updated when a move of the map ends. The array stays the same
 * object while the viewport is the same, so it works as a dependency and as a prop.
 * @param mapId - react-map-gl `<Map id=…>`
 */
export const useMapViewportBbox = (mapId: string): Bbox | null => {
  const maps = useMap()
  const map = maps[mapId]?.getMap()

  const subscribe = useCallback(
    (onChange: () => void) => {
      map?.on('moveend', onChange)
      return () => {
        map?.off('moveend', onChange)
      }
    },
    [map],
  )

  return useSyncExternalStore(
    subscribe,
    () => (map ? readBbox(map) : null),
    () => null,
  )
}
