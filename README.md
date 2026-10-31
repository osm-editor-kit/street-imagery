# street-imagery

Show street-level photos from many providers on a [MapLibre](https://maplibre.org/) map:
Mapillary, Panoramax, KartaView, Mapilio, Bing Streetside, Vegbilder, and links into Google Street
View and Apple Look Around. One adapter API for the data, React components for the map layers and
the photo viewer.

Part of the [`osm-editor-kit`](https://github.com/osm-editor-kit) family.

**Packages:** [`@osm-editor-kit/street-imagery`](https://npmx.dev/package/@osm-editor-kit/street-imagery)
and [`@osm-editor-kit/street-imagery-react`](https://npmx.dev/package/@osm-editor-kit/street-imagery-react)
on npm · **Live preview:** [osm-editor-kit.github.io/street-imagery](https://osm-editor-kit.github.io/street-imagery/)

```bash
bun add @osm-editor-kit/street-imagery @osm-editor-kit/street-imagery-react
```

> [!NOTE]
> Claude Opus 5.5 wrote and reviewed the code of these packages. [@tordans](https://github.com/tordans) specified what they should do and tested and verified their user-facing behavior.

## Develop

This is a Bun-workspaces monorepo:

| Path                                                             | What                                                                                                                |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [`packages/street-imagery`](packages/street-imagery)             | Providers, normalized photos, GeoJSON, filters and deep links, without a framework.                                 |
| [`packages/street-imagery-react`](packages/street-imagery-react) | React map layers, hooks and photo viewers for react-map-gl and MapLibre.                                            |
| [`apps/preview`](apps/preview)                                   | The preview: every provider on one full-screen map, also the test bed for both packages.                            |
| [`docs`](docs)                                                   | Research on the providers and [how to use the packages in a host app](docs/packages-for-knotenpunkte-and-tilda.md). |

```bash
bun install
bun run dev      # preview app, uses the package sources directly
bun run check    # format, lint, type-check, tests
```

The preview deploys to GitHub Pages on every push to `main`, so it can be ahead of npm.

### Try it in another app before it is published

```bash
bun run build:packages
cd packages/street-imagery && bun pm pack --destination ../../.local
cd ../street-imagery-react && bun pm pack --destination ../../.local
# in the app:
bun add @osm-editor-kit/street-imagery@file:/absolute/path/to/.local/osm-editor-kit-street-imagery-1.0.0.tgz
bun add @osm-editor-kit/street-imagery-react@file:/absolute/path/to/.local/osm-editor-kit-street-imagery-react-1.0.0.tgz
```

Bun caches a `file:` tarball by its path. After repacking, run `bun remove` and `bun add` again in
the app, and restart its dev server.

## Release

Versions and changelogs use [changesets](https://github.com/changesets/changesets), see [`.changeset/README.md`](.changeset/README.md). Releases run from a terminal with npm 2FA:

```bash
bun run release
```

## License

MIT
