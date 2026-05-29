---
name: generate-sketch-map
description: Generate a hand-drawn travel-route map PNG of China from an ordered list of lat/lng locations. Use when the user asks for a sketch map, hand-drawn map, travel route map, 手绘地图, 行程图, or 路线图 covering Chinese cities.
---

# generate-sketch-map

Render a hand-drawn route map (PNG) of China from an ordered list of locations. The map layers province washes, rivers through the visited cities, highlighted city polygons, the route with direction arrows, numbered markers, a compass, and an optional title. Visual style is fixed.

## When to use

Apply this skill when the user wants any of:

- A hand-drawn / sketch map of a China trip
- A travel route map / 行程图 / 路线图 / 旅行地图 visualizing a sequence of Chinese cities

Coverage is **mainland China only** (WGS84 lat/lng). Foreign locations will not match the province / city outlines and will appear under `unmatchedLocations` in the summary.

## Setup (run once per machine)

From this repository root (after clone), install once:

```bash
pnpm install
```

The CLI uses **`sketch-map-sdk`** on npm (Node-side render path; includes geo data and PNG rasterization).

Node **20+** is required (same as `sketch-map-sdk` engines).

## Usage

Run the CLI from this repository root (reads route JSON, writes PNG; summary on stdout):

```bash
pnpm exec tsx bin/render-sketch-map.ts --input examples/sample-route.json --output /tmp/route.png

# from stdin
cat route.json | pnpm exec tsx bin/render-sketch-map.ts --output /tmp/route.png
```

**Cursor discovery:** copy or symlink this folder to `<project>/.cursor/skills/generate-sketch-map/` (or install via your team's skill distribution). Geo data ships inside `sketch-map-sdk`; no separate `geo/*.json` copy is required for normal use.

### Input JSON schema

```json
{
  "title": "optional, up to 60 chars, omit for no title",
  "locations": [
    { "name": "武汉", "lat": 30.5928, "lng": 114.3055 },
    { "name": "青岛", "lat": 36.0671, "lng": 120.3826 }
  ],
  "width": 800,
  "height": 600
}
```

| Field | Required | Constraint |
|-------|----------|------------|
| `locations` | yes | 1 to 50 items, ordered (controls route arrows + marker numbers) |
| `locations[].name` | yes | Short label drawn next to the marker |
| `locations[].lat` | yes | -90 to 90, WGS84 |
| `locations[].lng` | yes | -180 to 180, WGS84 |
| `title` | no | Up to 60 chars, drawn at the top |
| `width` | no | 400 to 2000 px, default 800 |
| `height` | no | 300 to 2000 px, default 600 |

The PNG is rasterized at 2x the SVG viewBox size.

### stdout summary

After a successful render, stdout contains a JSON object useful for follow-up reasoning:

```json
{
  "output": "/abs/path/route.png",
  "title": "...",
  "locationCount": 2,
  "matchedCities": ["武汉市", "青岛市"],
  "matchedProvinces": ["湖北省", "山东省"],
  "riverCount": 3,
  "riverNames": ["长江", "汉水", "..."],
  "unmatchedLocations": [],
  "bbox": [minLng, minLat, maxLng, maxLat],
  "pngSize": { "width": 1600, "height": 1200, "bytes": 234567 }
}
```

Inspect `unmatchedLocations` to detect bad coords (typically a typo, non-China location, or coordinate-order swap).

## Workflow

1. Collect the visit order from the user. Each stop needs `name`, `lat`, `lng` (WGS84).
2. If the user only provided city names, geocode them first (any source the user trusts; this skill does not geocode).
3. Write the route JSON to a temp file or pipe it via stdin.
4. Run the CLI; capture the stdout summary.
5. If `unmatchedLocations` is non-empty, verify those coordinates and re-run.
6. Show the generated PNG to the user (its path is in `output`).

## Example

The bundled `examples/sample-route.json` traces 故宫 → 兵马俑 → 外滩 → 西湖 → 黄山. From this repo root:

```bash
pnpm install
pnpm run render -- --input examples/sample-route.json --output /tmp/sample.png
```

## Troubleshooting

- **`Cannot find module ...`** — Run `pnpm install` in this package. Ensure `sketch-map-sdk` resolves (pinned version in `package.json`).
- **`unmatchedLocations` non-empty** — Coordinates are outside mainland China polygons (often `lat`/`lng` swapped). Fix the input and re-run.
- **`Resvg` install fails** — `@resvg/resvg-js` is a native binding; ensure your Node version matches a supported prebuilt binary, or rebuild from source.
- **Chinese characters render as boxes** — The renderer uses a `Caveat, ZCOOL KuaiLe, cursive` font stack. Install a CJK fallback font on the system if needed (resvg falls back to the OS font set).
