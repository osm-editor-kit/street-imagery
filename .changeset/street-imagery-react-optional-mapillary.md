---
"@osm-editor-kit/street-imagery-react": minor
---

- `mapillary-js` is now an optional peer dependency. Apps that only use the map layers, hooks and filters no longer need it.
- `StreetLevelImageryViewer` moved out of the main entry. Import it from `@osm-editor-kit/street-imagery-react/viewer`. It still loads the panels on demand. Apps that use it need `mapillary-js` installed.
