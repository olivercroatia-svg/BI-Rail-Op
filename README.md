# RailOps · Dispatcher Console

Statički prototip dispatcher konzole za željeznički promet. Bilingvalan UI (HR/EN), bez build koraka — JSX se kompajlira u browseru preko Babel-standalone, React 18 dolazi kao UMD bundle s unpkg-a.

Source dolazi iz [Claude Design](https://claude.ai/design) handoff bundleova; iteracije se rade tamo i periodički ulijevaju u repo.

## Funkcionalnosti

- **Tehnologija** shell — Sidebar, TaskList, TaskEdit panel za pregled i uređivanje zadataka.
- **GPS Nadzor** modul — sub-sidebar, lista lokomotiva, mapa, graf brzine i fullscreen "Mapa sve" popup.
- **Tweaks panel** (host-gated) — theme (light/dark), accent (blue/indigo/teal/amber/slate), density (compact/regular/airy), language (HR/EN).
- **i18n** kroz `t.*` lookups — sve labele dolaze iz `RAILOPS_DATA.i18n`.
- **Deterministic mock data** — taskovi i lokomotive generirani iz seeded RNG-a, stabilni kroz reload.

## Tech stack

- React 18 (UMD, no bundler)
- Babel-standalone za in-browser JSX
- Vanilla CSS s custom properties (`--accent*`, `--row-h`, theme overrides)
- Inline SVG ikone (`icons.jsx`)
- Inter + JetBrains Mono (Google Fonts)

Bez package managera, bez testova, bez lintinga. Verifikacija je vizualna.

## Pokretanje lokalno

```bash
# bilo koji static server radi
python3 -m http.server 8765
open http://localhost:8765/
```

Alternativno, file se otvara direktno (`open index.html`) jer su svi `src` atributi relativni.

## Struktura

```
index.html              # entry, definira load order
app.jsx                 # runtime state orchestrator (tasks, lang, activeModule, tweaks)
data.jsx                # window.RAILOPS_DATA — i18n, mock taskovi, lokomotive, statusi
icons.jsx               # inline SVG ikone (Icon name="..." switch)
chrome.jsx              # Sidebar i top chrome
list-panel.jsx          # TaskList (Tehnologija)
edit-panel.jsx          # TaskEdit (Tehnologija)
inspector-list-panel.jsx, inspector-edit-panel.jsx
gps-module.jsx          # GPS Nadzor (sub-sidebar, lista, mapa, graf)
mapa-sve.jsx            # fullscreen "Mapa sve" popup
na-smjeni-panel.jsx     # Na smjeni — tablica otvorenih smjena grupirana po domicilu
tweaks-panel.jsx        # theme/accent/density/lang panel (host-gated preko postMessage)
styles.css              # :root vars, density overrides, dark theme overrides
gps-styles.css, mapa-sve.css
```

### Load order

Moduli se kače na `window` i konzumiraju po imenu iz kasnijih modula, pa je redoslijed `<script>` tagova u `index.html` load-bearing:

```
tweaks-panel → data → icons → chrome → list-panel → edit-panel
  → inspector-list-panel → inspector-edit-panel → gps-module → mapa-sve
  → na-smjeni-panel → app
```

Novi modul: napiši file, atačiraj exports preko `Object.assign(window, {...})`, dodaj `<script type="text/babel">` u ispravan slot prije `app.jsx`.

## Deploy

- GitHub: [`olivercroatia-svg/BI-Rail-Op`](https://github.com/olivercroatia-svg/BI-Rail-Op) (origin `main`)
- Vercel auto-deploya iz `main` na svaki push.
- Entry **mora ostati** `index.html` — Vercel servira `/` iz njega; razmaknuti naziv (`RailOps Dispatcher.html`) lomi root URL i vraća 404.

## Ažuriranje iz Claude Design bundlea

Glavni pattern promjene. Bundleovi mogu biti >10 MB pa `WebFetch` ne radi — koristi `curl`:

```bash
mkdir -p /tmp/railops-N && \
  curl -sL "<bundle URL>" -o /tmp/railops-N/bundle.bin && \
  cd /tmp/railops-N && gunzip -c bundle.bin | tar -xf - && rm bundle.bin
# fileovi su u prva-strancica/project/
```

Pročitaj `prva-strancica/chats/chat1.md` (intent je tu, najnovija sekcija na dnu), pa `diff -q` svaki file iz `prva-strancica/project/` protiv working dira.

**Ne kopiraj** bundleov `RailOps Dispatcher.html` — to je precompiled debug artifact s SRI integrity hashevima i razmaknutim filenameom koji ruši Vercel. Umjesto toga, edit-aj postojeći `index.html`.

## Konvencije

- Komentari su uglavnom odsutni, namjerno. Top-of-file komentari iz design toola (HR/EN) ostaju kakvi jesu.
- HR i EN koegzistiraju — ne "prevodi" identifikatore ili komentare osim ako se eksplicitno traži.
- `useState` + `useEffect` + povremeni `useMemo`. Bez state management libraryja.
- Ikone idu u `icons.jsx`, ne u externi library.
- Status boje (`#f59e0b`, `#10b981`, `#f43f5e`) duplicirane su u par mjesta — kod promjene, grep za literal kroz `chrome.jsx` i `gps-module.jsx`.
