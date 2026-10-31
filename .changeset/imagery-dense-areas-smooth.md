---
"@osm-editor-kit/street-imagery": patch
"@osm-editor-kit/street-imagery-react": patch
---

- **The map stays smooth in places with many photos**: photo dots and map features no longer use `circle-sort-key`, which made MapLibre draw every dot with its own draw call on every frame (20 fps with 40,000 photos in view, now 60). Newest photos are still drawn on top; the order comes from the data.
- **Sources are only updated when their data changes**: `StreetLevelImagerySourcesAndLayers` keeps the GeoJSON of photos, view shapes and lines between renders, so a turning viewer or a host re-render no longer makes MapLibre load them again. Lines far outside the viewport are left out.
- **`photoFilter(photoTypes, date)`**: the type and date filters as one test that parses the dates once, for filtering many photos.
