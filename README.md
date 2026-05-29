# sketch-map-skill

Cursor Agent Skill + CLI to render hand-drawn China route maps (PNG) via [`sketch-map-sdk`](https://www.npmjs.com/package/sketch-map-sdk).

**Install as a skill:** clone this repo into your project `.cursor/skills/generate-sketch-map/` (or symlink), then `pnpm install` in that folder. See `SKILL.md` for behavior and input schema.

## Prerequisites

- Node 20+
- pnpm 10.23.0

## Commands

```bash
pnpm install
pnpm run render -- --input examples/sample-route.json --output /tmp/route.png
```

Optional: `pnpm run sync` copies files into `../../.cursor/skills/generate-sketch-map/` when used from a monorepo layout; for this standalone repo, prefer manual copy or a custom destination flag (future).
