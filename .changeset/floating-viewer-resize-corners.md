---
"@osm-editor-kit/street-imagery-react": minor
---

`FloatingPhotoViewer`: Resize the box at both bottom corners; only a band along the rounded edge takes the pointer, so text near the corner stays clickable. A thick line in the bottom right corner shows that the box resizes; it gets darker while the pointer is over the box and takes `resizeHandleColor` (default fuchsia) on the handle. The top of the box now stays in place while resizing.
