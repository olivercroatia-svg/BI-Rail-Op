# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static-HTML railway dispatcher prototype (RailOps · Dispatcher Console). No build step, no package manager, no test suite. JSX is compiled in the browser by Babel-standalone; React 18 ships as UMD from unpkg. Source originates from Claude Design (claude.ai/design) handoff bundles — the user iterates on the design there and ships new bundles into this repo periodically.

The app is HR-first with EN i18n via toggle. Three top-level layouts share one orchestrator (`app.jsx`):
- **Tehnologija** shell — Sidebar / TaskList / TaskEdit (default)
- **GPS nadzor** module — sub-sidebar / locomotive list / SVG map / speed graph / Mapa sve popup
- **Na smjeni** view — sidebar + full-width grouped shift table (no list/edit panels)

## Run / develop

```bash
# serve locally (any static server works; Babel-standalone fetches .jsx via XHR)
python3 -m http.server 8765
open http://localhost:8765/

# or open the file directly — works because all script srcs are relative
open index.html
```

There is no lint, no typecheck, no tests. Verification is visual.

**Claude may start this dev server in background mode (`run_in_background: true`) for verification purposes** — it's a read-only static server on a known dev port and is the only way to confirm changes render correctly. After starting, `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8765/` to confirm it's up; if it already returns 200, do not start a second instance.

## Deploy

- GitHub: `olivercroatia-svg/BI-Rail-Op` (origin `main`)
- Vercel auto-deploys from `main` on push.
- Vercel serves `/` from `index.html`. **Do not rename the entry back to `RailOps Dispatcher.html`** — the spaced filename breaks the bare deploy URL (Vercel returns 404 at root). This was the cause of the first deployment failure.

## Architecture

### Loading model (matters more than it looks)

Modules attach themselves to `window` and are consumed by name from later modules. Script load order in `index.html` is therefore load-bearing:

```
tweaks-panel → data → icons → chrome → list-panel → edit-panel
  → inspector-list-panel → inspector-edit-panel → gps-module → mapa-sve
  → na-smjeni-panel → app
```

Adding a new module means: write the file, attach exports via `Object.assign(window, {...})`, then add a `<script type="text/babel" src="...">` in the correct slot — earlier than anything that consumes it, and before `app.jsx`. Stylesheets follow the same rule: link before `app.jsx` runs.

### Data flow

`data.jsx` synthesizes `window.RAILOPS_DATA` (i18n strings, module list, sidebar nav groups, status defs, deterministic mock tasks via `genTasks(seed)`, locomotive fleet, work types, drivers, routes, series, `NA_SMJENI` shift rows). Everything else reads from this — there's no fetch layer.

`app.jsx` owns runtime state: `tasks`, `selectedId`, `lang`, `activeModule`, `activeNav`, panel sizes, toasts, and tweak values. The body's CSS grid template columns swap conditionally:

- `activeModule === "gpsNadzor"` → fixed `180px / 6 / ~28% / 6 / rest` (GPS module renders its own sub-sidebar)
- `activeNav === "naSmjeni"` → `${sidebarW}px / 6 / 1fr` (sidebar + single resizer + full-width NaSmjeniPanel; no list or edit panel)
- otherwise → resizable `${sidebarW}px / 6 / listFrac / 6 / rest`

### Tweaks (theme / accent / density / language)

`tweaks-panel.jsx` is host-gated via `postMessage` (`__activate_edit_mode` / `__deactivate_edit_mode`). In a normal browser there's no parent host that posts these, so **the tweaks panel never appears on the deployed site** — that's by design, not a bug. `app.jsx` still applies tweak defaults (`accent: "blue"`, `density: "regular"`, `theme: "light"`) by mutating CSS custom properties on `document.documentElement` (see the big `useEffect` near the bottom). Dark theme is implemented by overriding `--bg*`, `--surface*`, `--border*`, `--fg*` variables; reverting to light removes those overrides so the `:root` defaults take over.

The accent palette is keyed by `tw.accent` ("blue" | "indigo" | "teal" | "amber" | "slate") — each variant overrides four `--accent*` vars in oklch.

### Density and dark mode

`styles.css` declares `:root` defaults plus `[data-density="compact"]` and `[data-density="airy"]` overrides for `--row-h`, `--header-h`, `--field-h`, `--text-*`, etc. Components are sized off these vars — never hard-code pixels for things that should respond to density.

### Status semantics

`STATUS_DEFS` in `data.jsx` is the canonical map for the five task statuses. Status colors used in JSX inline styles (`#f59e0b`, `#10b981`, `#f43f5e`) are duplicated from these defs in a couple of spots — if you change a status color, search across `chrome.jsx` and `gps-module.jsx` for the literal too.

`STATUS_Z_OPTIONS` (position/shift status strings) is defined in `edit-panel.jsx` and exposed on `window` — `inspector-edit-panel.jsx` reads it from there.

## Updating from a Claude Design bundle

This is the dominant change pattern. The user posts a bundle URL like `https://api.anthropic.com/v1/design/h/<hash>?open_file=RailOps+Dispatcher.html`. Bundles can exceed 10 MB so `WebFetch` will fail — use `curl` instead.

```bash
mkdir -p /tmp/railops-N && \
  curl -sL "<bundle URL>" -o /tmp/railops-N/bundle.bin && \
  cd /tmp/railops-N && gunzip -c bundle.bin | tar -xf - && rm bundle.bin
# project files live at <bundle-root>/project/
# (bundle root dir name varies per bundle — check with: ls /tmp/railops-N/)
```

Then:
1. Read `<bundle-root>/README.md` for overview.
2. Read **all** chat files in `<bundle-root>/chats/` — there may be multiple (`chat1.md`, `chat2.md`, …). The intent lives in the chats; newest section of each file is at the bottom.
3. `diff -q <bundle-root>/project/ <working-dir>/` to see what changed.

### Merge strategy — don't blindly copy everything

Bundles are created from a snapshot of the design tool's state. The design tool may not have the latest local commits (e.g. GPS module polish, Mapa sve improvements). **Always diff per file** and apply only the net-new additions:

- **Bundle is strict superset** (working has `+0` unique lines): safe to copy directly (`data.jsx`, `styles.css`).
- **Both directions have changes**: copy selectively. Take bundle's new features; preserve working-tree improvements.
- **Working tree has more** (bundle is smaller): the working file is more evolved — do NOT overwrite. Apply only specific new additions from the bundle.

Files that have historically drifted ahead of bundles (treat with care): `gps-module.jsx`, `mapa-sve.jsx`, `mapa-sve.css`.

### Do not copy the bundle's `RailOps Dispatcher.html`

- It is a precompiled debug artifact (often hundreds of KB to MB) with inline scripts that run before React loads and throw console errors.
- It uses the spaced filename that breaks Vercel.
- It carries SRI `integrity` hashes pinned to specific minified UMD bundles — these break when unpkg returns a different build.

Instead, edit the existing `index.html` to add new `<link>` and `<script>` tags. Match the order/cache-bust suffix the bundle uses (e.g. `mapa-sve.css?v=2`). Bump the cache-bust on `app.jsx` (`?v=N`) whenever app.jsx changes.

## Conventions worth respecting

- **Comments are mostly absent and that's intentional.** The design tool emits descriptive Croatian (and some English) comments at the top of each file explaining intent — preserve them when editing. Don't add commentary for what the code obviously does.
- **Croatian and English coexist.** UI labels are bilingual through `t.*` lookups; component-level Croatian comments are common. Do not "translate" identifiers or comments to English unless the user asks.
- **Inline SVG icons live in `icons.jsx`** under a single `Icon` component with a `name` switch. New icons go there; never reach for an icon library.
- **No external state libraries.** `useState` + `useEffect` + occasionally `useMemo`. Keep it that way.
- **Mock data only.** There's no backend. Tasks/locos are generated client-side from a seeded RNG so they're stable across reloads.
