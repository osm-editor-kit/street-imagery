---
"@osm-editor-kit/street-imagery": patch
"@osm-editor-kit/street-imagery-react": patch
---

- **Built with the React Compiler**: the published components and hooks are memoized, so a host re-render no longer rebuilds the map sources. Needs React 19 (`react/compiler-runtime`).
- **`useMapViewportBbox(mapId)` follows the map itself** (`moveend`) and returns the same array while the viewport is the same. Breaking: the second argument (`viewportTrigger`) is gone.
- **Fewer requests while zooming**: photo, line and map feature queries are keyed by whole zoom levels, the steps in which providers pick their tiles.
- **`viewfieldZoomStep(zoom)`**: the half-zoom step view shapes are sized for.
- `photoMatchesFilters`, `photoMatchesPhotoTypes` and `photoMatchesDateRange` test one photo without building a filter function first; for lists use `photoFilter`.
