---
"@osm-editor-kit/street-imagery-react": patch
---

- **`PhotoDateRangeFilter`: click the chart**: a click or tap on the chart moves the nearer handle to that exact place, and a press there can go on as a drag. A vertical swipe on a phone still scrolls and leaves the filter alone. Arrow keys work as before.
- **`PhotoDateRangeFilter`: better handles**: mouse and touch now reach a handle through a target of at least 44px high and wide, while the handles look the same. Handles close together or on the same spot stay separate, and two handles at one end can no longer get stuck.
- **`FloatingPhotoViewer` as a free window**: `position="fixed"` uses the viewport as container (default stays `absolute`). `minVisibleShare` (0–1) lets the box leave the container until that share of it shows, never over the top edge. Without these props nothing changes.
- **`onViewerView` on `StreetLevelImageryViewer`**: reports the view inside the shown photo after it has stopped moving and when the photo changes, for `providerExternalLink(photo, view)`. Hosts without the callback see no change. Needs `@osm-editor-kit/street-imagery` with `PhotoView`.
- **`usePhotosLookingAt(place, options)`**: the photos of one or more sources that see a place, best first, each with `bearingToPlace`. For `FloatingPhotoViewer` with its `step` buttons; `enabled` holds the requests back until a click. `useViewSuggestions` stays as it was.
- **`FloatingPhotoViewer` for other hosts**: `suggestions`, `activeDirectionKey` and `onSelectSuggestion` are optional. `titleActions` keep their size next to a long title, and links in them no longer start a drag.
