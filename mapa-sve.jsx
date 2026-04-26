// === Mapa sve — fullscreen popup with all locomotives, status filter, marker balloons, document side dialog ===
const { useState: useStateMS, useMemo: useMemoMS, useEffect: useEffectMS, useRef: useRefMS } = React;

const motionColorMS = (m) => m === "moving" ? "oklch(58% 0.13 155)" : m === "idle" ? "#f59e0b" : "oklch(70% 0.008 250)";
const motionLabel = (m, lang) => m === "moving" ? (lang === "hr" ? "Kreće se" : "Moving") : m === "idle" ? (lang === "hr" ? "Stoji" : "Idle") : (lang === "hr" ? "Ugašena" : "Off");

const STATUS_FILTERS = [
  { id: "moving", labelHr: "U vožnji", labelEn: "Moving", color: "oklch(58% 0.13 155)" },
  { id: "idle", labelHr: "Stoje", labelEn: "Idle", color: "#f59e0b" },
  { id: "off", labelHr: "Ugašene", labelEn: "Off", color: "oklch(70% 0.008 250)" },
];

// === Big map render — markers laid out on HR rail map ===
const BigMap = ({ markers, selectedLoco, onSelect, onClearSelected, lang }) => {
  const svgRef = useRefMS(null);
  return (
    <div className="ms-map" onClick={(e) => { if (e.target.tagName !== "g" && !e.target.closest("g[data-loco]")) onClearSelected(); }}>
      <svg ref={svgRef} className="ms-map__svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="ms-grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="oklch(92% 0.01 200 / 0.4)" strokeWidth="0.1"/>
          </pattern>
          <linearGradient id="ms-terrain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(96% 0.02 145)"/>
            <stop offset="100%" stopColor="oklch(94% 0.025 130)"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#ms-terrain)"/>
        <rect width="100" height="100" fill="url(#ms-grid)"/>
        {/* Sea / Adriatic */}
        <path d="M 0 60 Q 10 65 18 70 Q 25 78 30 92 L 30 100 L 0 100 Z" fill="oklch(92% 0.04 230)"/>
        <path d="M 38 90 Q 45 92 52 95 L 52 100 L 38 100 Z" fill="oklch(92% 0.04 230)"/>
        {/* Rivers */}
        <path d="M 30 30 Q 50 38 70 35 Q 85 38 98 42" fill="none" stroke="oklch(85% 0.05 230)" strokeWidth="0.4"/>
        <path d="M 55 42 Q 65 50 80 55 Q 90 58 100 60" fill="none" stroke="oklch(85% 0.05 230)" strokeWidth="0.3"/>
        {/* Country / regions */}
        <path d="M 5 35 Q 20 30 40 28 Q 60 25 80 30 Q 92 32 100 38 L 100 60 Q 92 65 80 64 Q 60 70 40 65 Q 20 60 5 55 Z" fill="oklch(95% 0.03 145 / 0.4)" stroke="oklch(82% 0.02 200)" strokeWidth="0.15"/>
        {/* Rail network */}
        <g stroke="oklch(78% 0.012 250)" strokeWidth="0.25" fill="none" strokeDasharray="0.6 0.6" opacity="0.7">
          <path d="M 55 42 L 48 55 L 32 62"/>
          <path d="M 55 42 L 62 50 L 58 85"/>
          <path d="M 55 42 L 82 55 L 88 42"/>
          <path d="M 55 42 L 62 28"/>
          <path d="M 55 42 L 42 78"/>
          <path d="M 55 42 L 20 65"/>
        </g>
        {/* Cities */}
        {[
          { name: "Zagreb", x: 55, y: 42, big: true },
          { name: "Rijeka", x: 32, y: 62 },
          { name: "Split", x: 58, y: 85 },
          { name: "Osijek", x: 88, y: 42 },
          { name: "Slav. Brod", x: 82, y: 55 },
          { name: "Karlovac", x: 48, y: 55 },
          { name: "Varaždin", x: 62, y: 28 },
          { name: "Sisak", x: 62, y: 50 },
          { name: "Pula", x: 20, y: 65 },
          { name: "Zadar", x: 42, y: 78 },
        ].map((c) => (
          <g key={c.name}>
            <circle cx={c.x} cy={c.y} r={c.big ? 0.9 : 0.6} fill="oklch(60% 0.014 250)"/>
            <text x={c.x + 1.2} y={c.y + 0.5} fontSize={c.big ? "1.6" : "1.3"} fill="oklch(35% 0.02 250)" fontFamily="Inter" fontWeight={c.big ? 600 : 400}>{c.name}</text>
          </g>
        ))}
        {/* Locomotive markers */}
        {markers.map((m) => {
          const isSelected = selectedLoco && selectedLoco.id === m.id;
          return (
            <g
              key={m.id}
              data-loco={m.id}
              transform={`translate(${m.mapX * 100} ${m.mapY * 100})`}
              style={{ cursor: "pointer" }}
              onClick={(e) => { e.stopPropagation(); onSelect(m); }}
            >
              {m.motion === "moving" && (
                <circle r="2.6" fill={motionColorMS(m.motion)} opacity="0.18">
                  <animate attributeName="r" from="1.6" to="3.6" dur="1.8s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="0.32" to="0" dur="1.8s" repeatCount="indefinite"/>
                </circle>
              )}
              {isSelected && (
                <circle r="3.2" fill="none" stroke={motionColorMS(m.motion)} strokeWidth="0.5" opacity="0.9"/>
              )}
              <circle r={isSelected ? "1.6" : "1.2"} fill="white" stroke={motionColorMS(m.motion)} strokeWidth={isSelected ? "0.6" : "0.4"}/>
              <circle r={isSelected ? "0.9" : "0.6"} fill={motionColorMS(m.motion)}/>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// === Main popup ===
const MapaSvePopup = ({ open, lang, onClose }) => {
  const [statusFilter, setStatusFilter] = useStateMS(new Set(["moving", "idle", "off"]));
  const [search, setSearch] = useStateMS("");
  const [fullscreen, setFullscreen] = useStateMS(false);
  const [selectedId, setSelectedId] = useStateMS(null);
  const [docsLocoId, setDocsLocoId] = useStateMS(null);

  const allLocos = window.GPS_LOCOS;

  const filtered = useMemoMS(() => {
    let r = allLocos.filter(l => statusFilter.has(l.motion));
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(l =>
        l.id.toLowerCase().includes(q) ||
        (l.driver || "").toLowerCase().includes(q) ||
        (l.trainNo || "").includes(q) ||
        (l.currentStation || "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [allLocos, statusFilter, search]);

  const counts = useMemoMS(() => ({
    moving: allLocos.filter(l => l.motion === "moving").length,
    idle: allLocos.filter(l => l.motion === "idle").length,
    off: allLocos.filter(l => l.motion === "off").length,
  }), [allLocos]);

  // Esc / click backdrop
  useEffectMS(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (docsLocoId) setDocsLocoId(null);
        else if (selectedId) setSelectedId(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, selectedId, docsLocoId, onClose]);

  if (!open) return null;

  const selectedLoco = selectedId ? allLocos.find(l => l.id === selectedId) : null;
  const docsLoco = docsLocoId ? allLocos.find(l => l.id === docsLocoId) : null;

  const toggleStatus = (s) => {
    setStatusFilter(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  return (
    <div className="ms-overlay" onClick={(e) => { if (e.target.classList.contains("ms-overlay")) onClose(); }}>
      <div className={`ms-window ${fullscreen ? "ms-window--full" : ""}`}>
        {/* Header */}
        <div className="ms-window__head">
          <div className="ms-window__title">
            <Icon name="globe" size={16} />
            <span>{lang === "hr" ? "Mapa sve — pregled svih lokomotiva" : "Map all — overview of all locomotives"}</span>
          </div>
          <div className="ms-window__live">
            <span className="ms-window__live-dot" />
            <span>{lang === "hr" ? "Uživo" : "Live"}</span>
            <span className="ms-window__sep" />
            <span>
              <strong style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>{filtered.length}</strong>
              {" / "}
              <span>{allLocos.length}</span>
            </span>
          </div>
          <div className="ms-window__actions">
            <button className="icon-btn" onClick={() => setFullscreen(v => !v)} title={fullscreen ? (lang === "hr" ? "Smanji" : "Restore") : (lang === "hr" ? "Cijeli ekran" : "Fullscreen")}>
              <Icon name={fullscreen ? "minimize" : "expand"} size={14} />
            </button>
            <button className="icon-btn" onClick={onClose} title={lang === "hr" ? "Zatvori" : "Close"}>
              <Icon name="x" size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="ms-window__body">
          <BigMap
            markers={filtered}
            selectedLoco={selectedLoco}
            onSelect={(l) => { setSelectedId(l.id); setDocsLocoId(null); }}
            onClearSelected={() => setSelectedId(null)}
            lang={lang}
          />

          {/* Filter panel — bottom-left corner */}
          <div className="ms-filters">
            <div className="ms-filters__head">
              <Icon name="filter" size={12} />
              <span>{lang === "hr" ? "Filter statusa" : "Status filter"}</span>
            </div>
            {STATUS_FILTERS.map((s) => {
              const active = statusFilter.has(s.id);
              return (
                <label key={s.id} className={`ms-filter-chip ${active ? "ms-filter-chip--active" : ""}`}>
                  <input type="checkbox" checked={active} onChange={() => toggleStatus(s.id)} />
                  <span className="ms-filter-chip__dot" style={{ background: s.color }} />
                  <span className="ms-filter-chip__label">{lang === "hr" ? s.labelHr : s.labelEn}</span>
                  <span className="ms-filter-chip__count">{counts[s.id]}</span>
                </label>
              );
            })}
            <div className="ms-filters__divider" />
            <div className="ms-filters__search">
              <Icon name="search" size={12} className="ms-filters__search-icon" />
              <input
                placeholder={lang === "hr" ? "Pretraga (ID, vlak, strojovođa, kolodvor)…" : "Search (ID, train, driver, station)…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="icon-btn" onClick={() => setSearch("")} style={{ marginLeft: 2 }}>
                  <Icon name="x" size={11} />
                </button>
              )}
            </div>
            <div className="ms-filters__actions">
              <button className="btn btn--xs btn--ghost" onClick={() => setStatusFilter(new Set(["moving", "idle", "off"]))}>
                {lang === "hr" ? "Sve" : "All"}
              </button>
              <button className="btn btn--xs btn--ghost" onClick={() => setStatusFilter(new Set())}>
                {lang === "hr" ? "Nijedan" : "None"}
              </button>
            </div>
          </div>

          {/* Inline balloon docs button — direct version (covers the BigMap-internal balloon)
              We re-render the balloon here on top so we can wire up the docs callback properly */}
          {selectedLoco && (
            <BalloonOverlay
              loco={selectedLoco}
              lang={lang}
              onClose={() => setSelectedId(null)}
              onOpenDocs={() => setDocsLocoId(selectedLoco.id)}
            />
          )}

          {/* Documents side dialog */}
          {docsLoco && (
            <DocsDialog
              loco={docsLoco}
              lang={lang}
              onClose={() => setDocsLocoId(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Balloon overlay — same as Balloon but rendered absolutely positioned within the popup body,
// so we can correctly wire onOpenDocs through state. Flips below the marker when it would
// clip the top of the body.
const BalloonOverlay = ({ loco, lang, onClose, onOpenDocs }) => {
  // If the marker is in the upper third of the map, render the balloon below it.
  const flip = loco.mapY < 0.42;
  return (
    <div
      className={`ms-balloon ms-balloon--overlay ${flip ? "ms-balloon--below" : ""}`}
      style={{ left: `${loco.mapX * 100}%`, top: `${loco.mapY * 100}%` }}
    >
      <div className="ms-balloon__arrow" />
      <div className="ms-balloon__head">
        <div>
          <div className="ms-balloon__id">{loco.id}</div>
          <div className="ms-balloon__sub">
            {loco.trainNo
              ? `${lang === "hr" ? "Vlak" : "Train"} #${loco.trainNo}`
              : (lang === "hr" ? "Bez aktivnog vlaka" : "No active train")}
          </div>
        </div>
        <span className={`status-pill loco-status loco-status--${loco.motion}`}>
          <span className="status-pill__dot" />
          {motionLabel(loco.motion, lang)}
        </span>
        <button className="icon-btn" onClick={onClose} style={{ marginLeft: 4 }}>
          <Icon name="x" size={13} />
        </button>
      </div>

      <div className="ms-balloon__grid">
        <div>
          <span>{lang === "hr" ? "Strojovođa" : "Driver"}</span>
          <strong>{loco.driver}</strong>
        </div>
        <div>
          <span>{lang === "hr" ? "Brzina" : "Speed"}</span>
          <strong style={{ fontFamily: "var(--font-mono)" }}>{loco.speed} km/h</strong>
        </div>
        <div>
          <span>{lang === "hr" ? "Trenutni kolodvor" : "Current station"}</span>
          <strong>{loco.currentStation}</strong>
        </div>
        <div>
          <span>{lang === "hr" ? "Trasa" : "Route"}</span>
          <strong style={{ fontFamily: "var(--font-mono)" }}>{loco.route}</strong>
        </div>
      </div>

      <div className="ms-balloon__journey">
        <div className="journey-stop journey-stop--start">
          <div className="journey-stop__dot" />
          <div>
            <span>{lang === "hr" ? "Početni kolodvor" : "Start station"}</span>
            <strong>{loco.startStation}</strong>
          </div>
        </div>
        <div className="journey-line">
          <span className="journey-line__pulse" />
        </div>
        <div className="journey-stop journey-stop--end">
          <div className="journey-stop__dot" />
          <div>
            <span>{lang === "hr" ? "Završni kolodvor" : "End station"}</span>
            <strong>{loco.endStation}</strong>
          </div>
        </div>
      </div>

      <WagonListInline loco={loco} lang={lang} />

      <div className="ms-balloon__actions">
        <button className="btn btn--sm btn--primary" onClick={onOpenDocs} disabled={loco.docs.length === 0}>
          <Icon name="paperclip" size={12} />
          <span>{lang === "hr" ? "Dokumenti" : "Documents"}</span>
          {loco.docs.length > 0 && <span className="ms-balloon__doc-count">{loco.docs.length}</span>}
        </button>
        <button className="btn btn--sm btn--ghost">
          <Icon name="history" size={12} />
          <span>{lang === "hr" ? "Povijest" : "History"}</span>
        </button>
      </div>
    </div>
  );
};

const WagonListInline = ({ loco, lang }) => {
  const [show, setShow] = useStateMS(false);
  return (
    <>
      <button
        className="ms-balloon__wagon-toggle"
        onClick={() => setShow(v => !v)}
      >
        <Icon name="wagon" size={13} />
        <span>{lang === "hr" ? "Popis vagona" : "Wagon list"}</span>
        <span className="ms-balloon__count">{loco.wagons.length}</span>
        <Icon name={show ? "chevron-down" : "chevron-right"} size={13} style={{ marginLeft: "auto" }} />
      </button>
      {show && (
        <div className="ms-balloon__wagons">
          {loco.wagons.length === 0 && (
            <div className="ms-balloon__wagons-empty">
              {lang === "hr" ? "Nema priključenih vagona." : "No wagons attached."}
            </div>
          )}
          {loco.wagons.map((w, i) => (
            <div key={i} className="wagon-row">
              <span className="wagon-row__no">{i + 1}.</span>
              <span className="wagon-row__type">{w.type}</span>
              <span className="wagon-row__id">{w.no}</span>
              <span className="wagon-row__weight">{w.weight}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const DocsDialog = ({ loco, lang, onClose }) => {
  return (
    <div className="docs-dialog" onClick={(e) => e.stopPropagation()}>
      <div className="docs-dialog__head">
        <div>
          <div className="docs-dialog__title">
            {lang === "hr" ? "Dokumenti vlaka" : "Train documents"}
          </div>
          <div className="docs-dialog__sub">
            {loco.id}{loco.trainNo ? ` · ${lang === "hr" ? "Vlak" : "Train"} #${loco.trainNo}` : ""}
          </div>
        </div>
        <button className="icon-btn" onClick={onClose} title={lang === "hr" ? "Zatvori" : "Close"}>
          <Icon name="x" size={13} />
        </button>
      </div>
      <div className="docs-dialog__list">
        {loco.docs.length === 0 ? (
          <div className="docs-dialog__empty">
            <Icon name="file" size={28} />
            <span>{lang === "hr" ? "Nema priloženih dokumenata." : "No documents attached."}</span>
          </div>
        ) : (
          loco.docs.map((d, i) => (
            <div key={i} className="doc-item">
              <span className={`doc-item__kind doc-item__kind--${d.kind.toLowerCase()}`}>{d.kind}</span>
              <div className="doc-item__main">
                <div className="doc-item__name">{d.name}</div>
                <div className="doc-item__meta">{d.size} · {d.date}</div>
              </div>
              <button className="icon-btn" title={lang === "hr" ? "Preuzmi" : "Download"}>
                <Icon name="download" size={13} />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="docs-dialog__foot">
        <button className="btn btn--sm btn--primary">
          <Icon name="download" size={12} />
          <span>{lang === "hr" ? "Preuzmi sve" : "Download all"}</span>
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { MapaSvePopup });
