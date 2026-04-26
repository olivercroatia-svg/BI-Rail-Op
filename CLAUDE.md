# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static-HTML railway dispatcher prototype (RailOps · Dispatcher Console). No build step, no package manager, no test suite. JSX is compiled in the browser by Babel-standalone; React 18 ships as UMD from unpkg. Source originates from Claude Design (claude.ai/design) handoff bundles — the user iterates on the design there and ships new bundles into this repo periodically.

The app is HR-first with EN i18n via toggle. Two top-level layouts share one orchestrator: the default **Tehnologija** shell (Sidebar / TaskList / TaskEdit) and the **GPS nadzor** module (sub-sidebar / locomotive list / map / speed graph / Mapa sve popup).

## Run / develop

```bash
# serve locally (any static server works; Babel-standalone fetches .jsx via XHR)
python3 -m http.server 8765
open http://localhost:8765/

# or open the file directly — works because all script srcs are relative
open index.html
```

There is no lint, no typecheck, no tests. Verification is visual.

## Deploy

- GitHub: `olivercroatia-svg/BI-Rail-Op` (origin `main`)
- Vercel auto-deploys from `main` on push.
- Vercel serves `/` from `index.html`. **Do not rename the entry back to `RailOps Dispatcher.html`** — the spaced filename breaks the bare deploy URL (Vercel returns 404 at root). This was the cause of the first deployment failure.

## Architecture

### Loading model (matters more than it looks)

Modules attach themselves to `window` and are consumed by name from later modules. Script load order in `index.html` is therefore load-bearing:

```
tweaks-panel → data → icons → chrome → list-panel → edit-panel → gps-module → mapa-sve → app
```

Adding a new module means: write the file, attach exports via `Object.assign(window, {...})`, then add a `<script type="text/babel" src="...">` in the correct slot — earlier than anything that consumes it, and before `app.jsx`. Stylesheets follow the same rule: link before `app.jsx` runs.

### Data flow

`data.jsx` synthesizes `window.RAILOPS_DATA` (i18n strings, module list, sidebar nav groups, status defs, deterministic mock tasks via `genTasks(seed)`, locomotive fleet, work types, drivers, routes, series). Everything else reads from this — there's no fetch layer.

`app.jsx` owns runtime state: `tasks`, `selectedId`, `lang`, `activeModule`, `activeNav`, panel sizes, toasts, and tweak values. The body's CSS grid template columns swap conditionally:

- `activeModule === "gpsNadzor"` → fixed `180px / 6 / ~28% / 6 / rest` (the GPS module renders its own sub-sidebar)
- otherwise → resizable `${sidebarW}px / 6 / listFrac / 6 / rest`

### Tweaks (theme / accent / density / language)

`tweaks-panel.jsx` is host-gated via `postMessage` (`__activate_edit_mode` / `__deactivate_edit_mode`). In a normal browser there's no parent host that posts these, so **the tweaks panel never appears on the deployed site** — that's by design, not a bug. `app.jsx` still applies tweak defaults (`accent: "blue"`, `density: "regular"`, `theme: "light"`) by mutating CSS custom properties on `document.documentElement` (see the big `useEffect` near the bottom). Dark theme is implemented by overriding `--bg*`, `--surface*`, `--border*`, `--fg*` variables; reverting to light removes those overrides so the `:root` defaults take over.

The accent palette is keyed by `tw.accent` ("blue" | "indigo" | "teal" | "amber" | "slate") — each variant overrides four `--accent*` vars in oklch.

### Density and dark mode

`styles.css` declares `:root` defaults plus `[data-density="compact"]` and `[data-density="airy"]` overrides for `--row-h`, `--header-h`, `--field-h`, `--text-*`, etc. Components are sized off these vars — never hard-code pixels for things that should respond to density.

### Status semantics

`STATUS_DEFS` in `data.jsx` is the canonical map for the five task statuses. Status colors used in JSX inline styles (`#f59e0b`, `#10b981`, `#f43f5e`) are duplicated from these defs in a couple of spots — if you change a status color, search across `chrome.jsx` and `gps-module.jsx` for the literal too.

## Updating from a Claude Design bundle

This is the dominant change pattern. The user posts a bundle URL like `https://api.anthropic.com/v1/design/h/<hash>?open_file=RailOps+Dispatcher.html`. Bundles can exceed 10 MB so `WebFetch` will fail — use `curl` instead.

```bash
mkdir -p /tmp/railops-N && \
  curl -sL "<bundle URL>" -o /tmp/railops-N/bundle.bin && \
  cd /tmp/railops-N && gunzip -c bundle.bin | tar -xf - && rm bundle.bin
# project files live at prva-strancica/project/
```

Then read `prva-strancica/README.md` and `prva-strancica/chats/chat1.md` (the chat is where intent lives — newest section at the bottom is what this drop adds), and `diff -q` every file in `prva-strancica/project/` against the working dir. Bundles are usually small additive changes — don't sweep in everything blindly.

When copying files in, **do not** copy the bundle's `RailOps Dispatcher.html`:
- It is a precompiled debug artifact (often hundreds of KB to MB) with inline scripts that run before React loads and throw console errors.
- It uses the spaced filename that breaks Vercel.
- It carries SRI `integrity` hashes pinned to specific minified UMD bundles — these break when unpkg returns a different build.

Instead, edit the existing `index.html` to add new `<link>` and `<script>` tags. Match the order/cache-bust suffix the bundle uses (e.g. `mapa-sve.css?v=2`).

## Conventions worth respecting

- **Comments are mostly absent and that's intentional.** The design tool emits descriptive Croatian (and some English) comments at the top of each file explaining intent — preserve them when editing. Don't add commentary for what the code obviously does.
- **Croatian and English coexist.** UI labels are bilingual through `t.*` lookups; component-level Croatian comments are common. Do not "translate" identifiers or comments to English unless the user asks.
- **Inline SVG icons live in `icons.jsx`** under a single `Icon` component with a `name` switch. New icons go there; never reach for an icon library.
- **No external state libraries.** `useState` + `useEffect` + occasionally `useMemo`. Keep it that way.
- **Mock data only.** There's no backend. Tasks/locos are generated client-side from a seeded RNG so they're stable across reloads.
