---
'@osm-editor-kit/street-imagery': patch
---

- **Mapilio works in the browser again**: Mapilio fixed the CORS headers of `geo.mapilio.com`, so dots, lines and photos load from any site. `providerById.mapilio` no longer has a `browserUnavailableReason`, `isBrowserAvailableProvider('mapilio')` is `true`, and Mapilio now counts as a default provider, like KartaView and Vegbilder.
- **Fewer requests to Mapilio**: `fetchMapilioSequenceItem` asks for each sequence once. Mapilio answers too many requests with HTTP 429, and a panorama tour used to send one request per photo of the sequence.
