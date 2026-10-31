---
"@osm-editor-kit/street-imagery": patch
---

- **Links with the view inside the photo**: `providerExternalLink(photo, view)` opens Mapillary and Panoramax on the same photo with the same zoom and pan. The new type `PhotoView` holds that view; a view of another photo is ignored. Without a `view` the links stay as they were.
- **`rankPhotosLookingAt(place, photos, options)`**: answers "who sees this spot": flat photos within 50 m whose heading points at the place within 35°, and 360° photos within the distance, sorted by nearness and age, each with `bearingToPlace`. Both limits are options, and the age and photo type options work as in `rankPhotosForDirection`.
