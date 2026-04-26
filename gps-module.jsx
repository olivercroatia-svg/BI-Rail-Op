// GPS Tracking module — locomotive list + map + speed chart
// Modern take on the legacy "Pregled" window from the screenshots

const { useMemo: useMemoG, useState: useStateG, useRef: useRefG, useEffect: useEffectG } = React;

// === Mock locomotive data ===
function genGpsLocos() {
  const series = ["1141", "2132", "6193", "1142"];
  const rand = (() => { let s = 42; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })();
  const list = [];
  const drivers = window.RAILOPS_DATA.DRIVERS;
  const routes = window.RAILOPS_DATA.ROUTES;
  const motionStates = ["moving", "idle", "off"];
  const readiness = ["ready", "warning", "blocked"];
  series.forEach((ser) => {
    const count = 8 + Math.floor(rand() * 6);
    for (let i = 0; i < count; i++) {
      const num = String(Math.floor(rand() * 600) + 100);
      const motion = motionStates[Math.floor(rand() * 3)];
      const ready = readiness[Math.floor(rand() * 3)];
      list.push({
        id: `${ser}-${num}`,
        series: ser,
        number: num,
        motion, // moving / idle / off
        readiness: ready,
        speed: motion === "moving" ? Math.floor(rand() * 110) + 10 : 0,
        driver: drivers[Math.floor(rand() * drivers.length)],
        trainNo: motion === "off" ? "" : String(Math.floor(rand() * 90000) + 10000),
        route: routes[Math.floor(rand() * routes.length)],
        lastPos: motion === "off" ? "—" : `26.04.2026. ${String(Math.floor(rand() * 24)).padStart(2, "0")}:${String(Math.floor(rand() * 60)).padStart(2, "0")}:${String(Math.floor(rand() * 60)).padStart(2, "0")}`,
        ptu: rand() > 0.4,
        kvr: rand() > 0.3,
        wagonList: rand() > 0.5,
        // for map: x,y in 0-1 normalized
        mapX: 0.15 + rand() * 0.7,
        mapY: 0.15 + rand() * 0.65,
      });
    }
  });
  // Sort numerically
  list.sort((a, b) => a.id.localeCompare(b.id));
  return list;
}

window.GPS_LOCOS = genGpsLocos();

// === Generate a route polyline + speed series for a selected loco ===
function genRoute(seedId, periodHours = 12) {
  let s = 0;
  for (let i = 0; i < seedId.length; i++) s = (s * 31 + seedId.charCodeAt(i)) % 1000003;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

  // Anchor cities (rough relative coords for HR map)
  const cities = [
    { name: "Zagreb", x: 0.55, y: 0.42 },
    { name: "Karlovac", x: 0.48, y: 0.55 },
    { name: "Sisak", x: 0.62, y: 0.50 },
    { name: "Rijeka", x: 0.32, y: 0.62 },
    { name: "Varaždin", x: 0.62, y: 0.28 },
    { name: "Slav. Brod", x: 0.82, y: 0.55 },
    { name: "Osijek", x: 0.88, y: 0.42 },
    { name: "Split", x: 0.58, y: 0.85 },
    { name: "Zadar", x: 0.42, y: 0.78 },
    { name: "Pula", x: 0.20, y: 0.65 },
  ];
  const start = cities[Math.floor(rand() * cities.length)];
  let end = cities[Math.floor(rand() * cities.length)];
  while (end === start) end = cities[Math.floor(rand() * cities.length)];

  // Generate ~80 polyline points along a noisy curve from start to end
  const N = 80;
  const points = [];
  for (let i = 0; i <= N; i++) {
    const tt = i / N;
    // smooth bezier-ish curve via control point
    const cx = (start.x + end.x) / 2 + (rand() - 0.5) * 0.08;
    const cy = (start.y + end.y) / 2 + (rand() - 0.5) * 0.08;
    const x = (1 - tt) ** 2 * start.x + 2 * (1 - tt) * tt * cx + tt ** 2 * end.x;
    const y = (1 - tt) ** 2 * start.y + 2 * (1 - tt) * tt * cy + tt ** 2 * end.y;
    // small noise
    const nx = x + (rand() - 0.5) * 0.005;
    const ny = y + (rand() - 0.5) * 0.005;
    points.push({ x: nx, y: ny });
  }

  // Speed series sampled along time
  const speedPts = [];
  const samples = 120;
  for (let i = 0; i < samples; i++) {
    const tt = i / samples;
    let v = 60 + Math.sin(tt * 9 + 1) * 25 + Math.cos(tt * 17) * 15;
    v += (rand() - 0.5) * 18;
    if (i < samples * 0.05 || i > samples * 0.95) v *= tt < 0.5 ? tt * 8 : (1 - tt) * 8;
    v = Math.max(0, Math.min(100, v));
    const hh = Math.floor(tt * periodHours);
    const mm = Math.floor((tt * periodHours - hh) * 60);
    speedPts.push({ t: tt, hh, mm, v });
  }

  return {
    points,
    startCity: start,
    endCity: end,
    speedPts,
  };
}

// === Map component (custom SVG approximation of HR rail map) ===
const RailMap = ({ markers, routeLoco, route, lang, onClearRoute }) => {
  const wrapRef = useRefG(null);
  const [hover, setHover] = useStateG(null); // { x, y, idx }

  const hasMarkers = markers && markers.length > 0;
  const showRoute = !!route && !!routeLoco;

  if (!hasMarkers && !showRoute) {
    return (
      <div className="map-empty">
        <Icon name="map" size={40} />
        <div className="empty__title">{lang === "hr" ? "Odaberi lokomotive" : "Select locomotives"}</div>
        <div className="empty__body" style={{ maxWidth: 340 }}>
          {lang === "hr"
            ? "Označi jednu ili više lokomotiva u listi za prikaz na karti. Za prikaz rute i grafa brzine odaberi jednu lokomotivu i period, pa klikni \"Prikaži rutu\"."
            : "Select one or more locomotives in the list to show them on the map. To show a route and speed chart pick a single locomotive, choose a period, then click \"Show route\"."}
        </div>
      </div>
    );
  }

  const polyD = showRoute ? route.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x * 100} ${p.y * 100}`).join(" ") : "";
  const start = showRoute ? route.points[0] : null;
  const end = showRoute ? route.points[route.points.length - 1] : null;

  const motionColor = (m) => m === "moving" ? "oklch(58% 0.13 155)" : m === "idle" ? "#f59e0b" : "oklch(70% 0.008 250)";

  return (
    <div className="map-canvas" ref={wrapRef}>
      {/* Map controls */}
      <div className="map-toolbar">
        <div className="map-toolbar__title">
          <Icon name="map" size={13} />
          <span>{lang === "hr" ? "Karta · OpenStreetMap" : "Map · OpenStreetMap"}</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button className="icon-btn" title={lang === "hr" ? "Sloj" : "Layer"}><Icon name="list" size={13} /></button>
          <button className="icon-btn" title={lang === "hr" ? "Centriraj" : "Center"}><Icon name="gps" size={13} /></button>
          <button className="icon-btn" title={lang === "hr" ? "Puni ekran" : "Fullscreen"}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"/></svg>
          </button>
        </div>
      </div>

      {/* SVG map background — abstract terrain, rivers, rail lines */}
      <svg className="map-bg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="oklch(92% 0.01 200 / 0.4)" strokeWidth="0.1"/>
          </pattern>
          <linearGradient id="terrain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(96% 0.02 145)"/>
            <stop offset="100%" stopColor="oklch(94% 0.025 130)"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#terrain)"/>
        <rect width="100" height="100" fill="url(#grid)"/>
        {/* Sea / Adriatic */}
        <path d="M 0 60 Q 10 65 18 70 Q 25 78 30 92 L 30 100 L 0 100 Z" fill="oklch(92% 0.04 230)"/>
        <path d="M 38 90 Q 45 92 52 95 L 52 100 L 38 100 Z" fill="oklch(92% 0.04 230)"/>
        {/* Rivers */}
        <path d="M 30 30 Q 50 38 70 35 Q 85 38 98 42" fill="none" stroke="oklch(85% 0.05 230)" strokeWidth="0.4"/>
        <path d="M 55 42 Q 65 50 80 55 Q 90 58 100 60" fill="none" stroke="oklch(85% 0.05 230)" strokeWidth="0.3"/>
        {/* Country / regions */}
        <path d="M 5 35 Q 20 30 40 28 Q 60 25 80 30 Q 92 32 100 38 L 100 60 Q 92 65 80 64 Q 60 70 40 65 Q 20 60 5 55 Z" fill="oklch(95% 0.03 145 / 0.4)" stroke="oklch(82% 0.02 200)" strokeWidth="0.15"/>
        {/* Rail network (background) */}
        <g stroke="oklch(78% 0.012 250)" strokeWidth="0.25" fill="none" strokeDasharray="0.6 0.6" opacity="0.7">
          <path d="M 55 42 L 48 55 L 32 62"/>
          <path d="M 55 42 L 62 50 L 58 85"/>
          <path d="M 55 42 L 82 55 L 88 42"/>
          <path d="M 55 42 L 62 28"/>
          <path d="M 55 42 L 42 78"/>
          <path d="M 55 42 L 20 65"/>
        </g>
        {/* City dots */}
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
        {/* Route polyline — glow + stroke (only when single loco + route shown) */}
        {showRoute && (
          <>
            <path d={polyD} fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.18"/>
            <path d={polyD} fill="none" stroke="var(--accent)" strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round"/>
          </>
        )}
        {/* Hover dot */}
        {showRoute && hover && (
          <circle cx={hover.x * 100} cy={hover.y * 100} r="0.9" fill="white" stroke="var(--accent)" strokeWidth="0.4"/>
        )}
        {/* Start marker */}
        {showRoute && (
          <g transform={`translate(${start.x * 100} ${start.y * 100})`}>
            <circle r="1.6" fill="oklch(58% 0.13 155)"/>
            <circle r="2.6" fill="none" stroke="oklch(58% 0.13 155)" strokeWidth="0.3" opacity="0.6"/>
          </g>
        )}
        {/* End marker */}
        {showRoute && (
          <g transform={`translate(${end.x * 100} ${end.y * 100})`}>
            <circle r="1.6" fill="oklch(58% 0.20 22)"/>
            <circle r="2.6" fill="none" stroke="oklch(58% 0.20 22)" strokeWidth="0.3" opacity="0.6"/>
          </g>
        )}
        {/* Multi-select markers (no route) */}
        {!showRoute && hasMarkers && markers.map((m) => (
          <g key={m.id} transform={`translate(${m.mapX * 100} ${m.mapY * 100})`}>
            {m.motion === "moving" && (
              <circle r="2.6" fill={motionColor(m.motion)} opacity="0.18">
                <animate attributeName="r" from="1.6" to="3.6" dur="1.8s" repeatCount="indefinite"/>
                <animate attributeName="opacity" from="0.32" to="0" dur="1.8s" repeatCount="indefinite"/>
              </circle>
            )}
            <circle r="1.2" fill="white" stroke={motionColor(m.motion)} strokeWidth="0.4"/>
            <circle r="0.6" fill={motionColor(m.motion)}/>
            {markers.length <= 8 && (
              <text x="1.5" y="0.5" fontSize="1.3" fill="oklch(35% 0.02 250)" fontFamily="Inter" fontWeight="500">{m.id}</text>
            )}
          </g>
        ))}
        {/* Loco current position (single, with route) */}
        {showRoute && (
          <g transform={`translate(${routeLoco.mapX * 100} ${routeLoco.mapY * 100})`}>
            {routeLoco.motion === "moving" && <circle r="3.5" fill="var(--accent)" opacity="0.18">
              <animate attributeName="r" from="2" to="5" dur="1.6s" repeatCount="indefinite"/>
              <animate attributeName="opacity" from="0.4" to="0" dur="1.6s" repeatCount="indefinite"/>
            </circle>}
            <circle r="1.4" fill="white" stroke="var(--accent)" strokeWidth="0.5"/>
            <circle r="0.7" fill="var(--accent)"/>
          </g>
        )}
      </svg>

      {/* Floating info card — route mode (single loco) */}
      {showRoute && (
        <div className="map-card">
          <div className="map-card__head">
            <div>
              <div className="map-card__title">{routeLoco.id}</div>
              <div className="map-card__subtitle">
                {routeLoco.trainNo ? `${lang === "hr" ? "Vlak" : "Train"} #${routeLoco.trainNo}` : (lang === "hr" ? "Bez aktivnog vlaka" : "No active train")}
              </div>
            </div>
            <span className={`status-pill loco-status loco-status--${routeLoco.motion}`}>
              <span className="status-pill__dot" />
              {routeLoco.motion === "moving" ? (lang === "hr" ? "Kreće se" : "Moving") :
               routeLoco.motion === "idle" ? (lang === "hr" ? "Stoji" : "Idle") :
               (lang === "hr" ? "Ugašena" : "Off")}
            </span>
          </div>
          <div className="map-card__grid">
            <div><span>{lang === "hr" ? "Strojovođa" : "Driver"}</span><strong>{routeLoco.driver}</strong></div>
            <div><span>{lang === "hr" ? "Brzina" : "Speed"}</span><strong style={{ fontFamily: "var(--font-mono)" }}>{routeLoco.speed} km/h</strong></div>
            <div><span>{lang === "hr" ? "Trasa" : "Route"}</span><strong style={{ fontFamily: "var(--font-mono)" }}>{routeLoco.route}</strong></div>
            <div><span>{lang === "hr" ? "Posljednji signal" : "Last signal"}</span><strong style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{routeLoco.lastPos}</strong></div>
          </div>
          <div className="map-card__actions">
            <button className="btn btn--sm" onClick={onClearRoute} title={lang === "hr" ? "Zatvori prikaz rute" : "Close route view"}>
              <Icon name="x" size={12} />
              <span>{lang === "hr" ? "Zatvori rutu" : "Close route"}</span>
            </button>
            <button className="btn btn--sm">
              <Icon name="list" size={12} />
              <span>{lang === "hr" ? "Popis vagona" : "Wagon list"}</span>
            </button>
            <button className="btn btn--sm">
              <Icon name="clipboard" size={12} />
              <span>PTU</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating info card — multi-select summary */}
      {!showRoute && hasMarkers && (
        <div className="map-card">
          <div className="map-card__head">
            <div>
              <div className="map-card__title">{lang === "hr" ? "Pregled flote" : "Fleet overview"}</div>
              <div className="map-card__subtitle">
                {markers.length} {lang === "hr" ? "lokomotiva odabrano" : "locomotives selected"}
              </div>
            </div>
          </div>
          <div className="map-card__grid">
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "oklch(58% 0.13 155)" }} />
                {lang === "hr" ? "U vožnji" : "Moving"}
              </span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{markers.filter(m => m.motion === "moving").length}</strong>
            </div>
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b" }} />
                {lang === "hr" ? "Stoje" : "Idle"}
              </span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{markers.filter(m => m.motion === "idle").length}</strong>
            </div>
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "oklch(70% 0.008 250)" }} />
                {lang === "hr" ? "Ugašene" : "Off"}
              </span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{markers.filter(m => m.motion === "off").length}</strong>
            </div>
            <div>
              <span>{lang === "hr" ? "Aktivni vlakovi" : "Active trains"}</span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{markers.filter(m => m.trainNo).length}</strong>
            </div>
          </div>
          <div className="map-card__hint" style={{ fontSize: 11, color: "var(--fg-subtle)", padding: "0 14px 12px", lineHeight: 1.4 }}>
            {lang === "hr"
              ? "Za prikaz rute i grafa brzine: odaberi jednu lokomotivu, postavi period, pa klikni Prikaži rutu."
              : "For route and speed chart: pick one locomotive, set the period, then click Show route."}
          </div>
        </div>
      )}

      {/* Legend */}
      {showRoute ? (
        <div className="map-legend">
          <span><span className="dot" style={{ background: "oklch(58% 0.13 155)" }} />{lang === "hr" ? "Početak" : "Start"} {route.startCity.name}</span>
          <span><span className="dot" style={{ background: "oklch(58% 0.20 22)" }} />{lang === "hr" ? "Kraj" : "End"} {route.endCity.name}</span>
          <span><span className="dot" style={{ background: "var(--accent)" }} />{lang === "hr" ? "Trenutna pozicija" : "Current position"}</span>
        </div>
      ) : hasMarkers ? (
        <div className="map-legend">
          <span><span className="dot" style={{ background: "oklch(58% 0.13 155)" }} />{lang === "hr" ? "Kreće se" : "Moving"}</span>
          <span><span className="dot" style={{ background: "#f59e0b" }} />{lang === "hr" ? "Stoji" : "Idle"}</span>
          <span><span className="dot" style={{ background: "oklch(70% 0.008 250)" }} />{lang === "hr" ? "Ugašena" : "Off"}</span>
        </div>
      ) : null}
    </div>
  );
};

// === Speed chart ===
const SpeedChart = ({ route, lang }) => {
  const [hover, setHover] = useStateG(null);
  const W = 100, H = 100;
  const pts = route ? route.speedPts : [];
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.t * W} ${H - p.v}`).join(" ");
  const area = path + ` L ${W} ${H} L 0 ${H} Z`;

  if (!route) return null;

  return (
    <div className="speed-chart">
      <div className="speed-chart__head">
        <div className="speed-chart__title">
          <Icon name="chart" size={13} />
          <span>{lang === "hr" ? "Brzina (km/h)" : "Speed (km/h)"}</span>
        </div>
        <div className="speed-chart__stats">
          <span><span style={{ color: "var(--fg-subtle)" }}>{lang === "hr" ? "Maks" : "Max"}</span> <strong>{Math.round(Math.max(...pts.map(p => p.v)))} km/h</strong></span>
          <span><span style={{ color: "var(--fg-subtle)" }}>{lang === "hr" ? "Prosj" : "Avg"}</span> <strong>{Math.round(pts.reduce((a, p) => a + p.v, 0) / pts.length)} km/h</strong></span>
          <span><span style={{ color: "var(--fg-subtle)" }}>{lang === "hr" ? "Trajanje" : "Duration"}</span> <strong>12h 00m</strong></span>
        </div>
      </div>
      <div className="speed-chart__body">
        <div className="speed-chart__y-axis">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>
        <svg
          className="speed-chart__svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const idx = Math.max(0, Math.min(pts.length - 1, Math.floor(x * pts.length)));
            setHover({ idx, p: pts[idx] });
          }}
          onMouseLeave={() => setHover(null)}
        >
          {/* Grid */}
          {[25, 50, 75].map((y) => (
            <line key={y} x1="0" x2="100" y1={100 - y} y2={100 - y} stroke="oklch(92% 0.01 250)" strokeWidth="0.3" strokeDasharray="0.8 1.2"/>
          ))}
          {/* Area + line */}
          <path d={area} fill="var(--accent)" opacity="0.10"/>
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="0.6" strokeLinejoin="round"/>
          {hover && (
            <>
              <line x1={hover.p.t * 100} x2={hover.p.t * 100} y1="0" y2="100" stroke="var(--accent)" strokeWidth="0.3" strokeDasharray="0.8 0.8"/>
              <circle cx={hover.p.t * 100} cy={100 - hover.p.v} r="1" fill="white" stroke="var(--accent)" strokeWidth="0.5"/>
            </>
          )}
        </svg>
        {hover && (
          <div className="speed-tooltip" style={{ left: `${hover.p.t * 100}%` }}>
            <strong>{Math.round(hover.p.v)} km/h</strong>
            <span>{String(hover.p.hh).padStart(2, "0")}:{String(hover.p.mm).padStart(2, "0")}</span>
          </div>
        )}
      </div>
      <div className="speed-chart__x-axis">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <span key={t}>26.04. {String(Math.floor(t * 12)).padStart(2, "0")}:00</span>
        ))}
      </div>
    </div>
  );
};

// === GPS Sub-sidebar (left of the module) ===
const GPS_NAV = [
  { id: "administracija", iconName: "settings", labelHr: "Administracija", labelEn: "Administration" },
  { id: "mapa", iconName: "map", labelHr: "Mapa", labelEn: "Map" },
  { id: "izvjestaji", iconName: "chart", labelHr: "Izvještaji", labelEn: "Reports" },
  { id: "izlaz", iconName: "x", labelHr: "Izlaz", labelEn: "Exit" },
];

const GpsSidebar = ({ active, setActive, lang }) => (
  <aside className="sidebar scrollable">
    <div className="sidebar__section">
      <div className="sidebar__title">
        <span>{lang === "hr" ? "GPS Nadzor" : "GPS Tracking"}</span>
        <span className="sidebar__title-line" />
      </div>
      {GPS_NAV.map((it) => (
        <button
          key={it.id}
          className={`nav-item ${active === it.id ? "nav-item--active" : ""}`}
          onClick={() => setActive(it.id)}
        >
          <Icon name={it.iconName} size={14} className="nav-item__icon" />
          <span className="nav-item__label">{lang === "hr" ? it.labelHr : it.labelEn}</span>
        </button>
      ))}
    </div>
    <div className="sidebar__section">
      <div className="sidebar__title">
        <span>{lang === "hr" ? "Brzi pristup" : "Quick access"}</span>
        <span className="sidebar__title-line" />
      </div>
      <div style={{ padding: "8px 14px" }}>
        <div className="quickstat">
          <span className="quickstat__dot" style={{ background: "oklch(58% 0.13 155)" }} />
          <span className="quickstat__label">{lang === "hr" ? "U vožnji" : "Moving"}</span>
          <strong className="quickstat__val">{window.GPS_LOCOS.filter(l => l.motion === "moving").length}</strong>
        </div>
        <div className="quickstat">
          <span className="quickstat__dot" style={{ background: "#f59e0b" }} />
          <span className="quickstat__label">{lang === "hr" ? "Stoje" : "Idle"}</span>
          <strong className="quickstat__val">{window.GPS_LOCOS.filter(l => l.motion === "idle").length}</strong>
        </div>
        <div className="quickstat">
          <span className="quickstat__dot" style={{ background: "oklch(70% 0.008 250)" }} />
          <span className="quickstat__label">{lang === "hr" ? "Ugašene" : "Off"}</span>
          <strong className="quickstat__val">{window.GPS_LOCOS.filter(l => l.motion === "off").length}</strong>
        </div>
      </div>
    </div>
    <div style={{ flex: 1 }} />
    <div className="sidebar__section" style={{ padding: "10px 16px", fontSize: "var(--text-xs)", color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>GPS v2.18</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
          {lang === "hr" ? "Live" : "Live"}
        </span>
      </div>
    </div>
  </aside>
);

// === Locomotive list panel ===
const LocoList = ({ selectedIds, toggleSelected, selectAll, clearSelected, routeId, setRouteId, lang, period, setPeriod, onShowRoute }) => {
  const [tab, setTab] = useStateG("lokomotive");
  const [search, setSearch] = useStateG("");
  const [filter, setFilter] = useStateG(null); // motion filter
  const [readyFilter, setReadyFilter] = useStateG(null);

  const filtered = useMemoG(() => {
    let r = window.GPS_LOCOS;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(l => l.id.toLowerCase().includes(q) || (l.driver || "").toLowerCase().includes(q) || (l.trainNo || "").includes(q));
    }
    if (filter) r = r.filter(l => l.motion === filter);
    if (readyFilter) r = r.filter(l => l.readiness === readyFilter);
    return r;
  }, [search, filter, readyFilter]);

  // Group by series
  const groups = useMemoG(() => {
    const g = {};
    filtered.forEach(l => {
      g[l.series] = g[l.series] || [];
      g[l.series].push(l);
    });
    return g;
  }, [filtered]);

  const allFilteredSelected = filtered.length > 0 && filtered.every(l => selectedIds.has(l.id));
  const canShowRoute = selectedIds.size === 1;
  const onlySelectedId = canShowRoute ? Array.from(selectedIds)[0] : null;

  return (
    <div className="panel">
      <div className="panel__header">
        <div className="panel__title">
          <span>{lang === "hr" ? "Pregled" : "Overview"}</span>
          <span className="panel__title-count">{filtered.length}</span>
          {selectedIds.size > 0 && (
            <span className="panel__title-count" style={{ background: "var(--accent-soft)", color: "var(--accent)", marginLeft: 4 }}>
              {selectedIds.size} {lang === "hr" ? "odabrano" : "selected"}
            </span>
          )}
        </div>
        <div className="panel__actions">
          <button className="btn btn--sm btn--ghost" onClick={() => { setSearch(""); setFilter(null); setReadyFilter(null); clearSelected(); }}>
            <Icon name="x" size={12} />
            <span>{lang === "hr" ? "Očisti" : "Clear"}</span>
          </button>
        </div>
      </div>

      {/* Inner tab bar */}
      <div className="seg-tabs">
        {[
          { id: "lokomotive", icon: "train", labelHr: "Lokomotive", labelEn: "Locomotives" },
          { id: "automobili", icon: "briefcase", labelHr: "Automobili", labelEn: "Vehicles" },
          { id: "zone", icon: "map", labelHr: "Zone", labelEn: "Zones" },
          { id: "kolodvori", icon: "list", labelHr: "Kolodvori", labelEn: "Stations" },
        ].map((t) => (
          <button
            key={t.id}
            className={`seg-tab ${tab === t.id ? "seg-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={12} />
            <span>{lang === "hr" ? t.labelHr : t.labelEn}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="search">
          <Icon name="search" size={14} className="search__icon" />
          <input
            placeholder={lang === "hr" ? "Pretraži lokomotive…" : "Search locomotives…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className={`filter-pill ${filter ? "filter-pill--active" : ""}`}
          onClick={() => {
            const o = [null, "moving", "idle", "off"];
            setFilter(o[(o.indexOf(filter) + 1) % o.length]);
          }}
        >
          <Icon name="filter" size={12} />
          <span>{filter ? (filter === "moving" ? (lang === "hr" ? "Kreće se" : "Moving") : filter === "idle" ? (lang === "hr" ? "Stoji" : "Idle") : (lang === "hr" ? "Ugašena" : "Off")) : (lang === "hr" ? "Stanje" : "State")}</span>
        </button>
      </div>

      {/* Select-all bar */}
      <div className="select-all-bar">
        <label className="checkbox checkbox--sm">
          <input
            type="checkbox"
            checked={allFilteredSelected}
            ref={(el) => { if (el) el.indeterminate = !allFilteredSelected && filtered.some(l => selectedIds.has(l.id)); }}
            onChange={(e) => {
              if (e.target.checked) selectAll(filtered.map(l => l.id));
              else clearSelected();
            }}
          />
          <span className="checkbox__box" />
          <span className="checkbox__label">
            {allFilteredSelected
              ? (lang === "hr" ? "Označi nijednu" : "Deselect all")
              : (lang === "hr" ? "Označi sve" : "Select all")}
          </span>
        </label>
        {selectedIds.size > 0 && (
          <button className="btn btn--xs btn--ghost" onClick={clearSelected}>
            <Icon name="x" size={11} />
            <span>{lang === "hr" ? "Poništi" : "Reset"}</span>
          </button>
        )}
      </div>

      <div className="loco-list scrollable">
        {tab === "lokomotive" && Object.entries(groups).map(([series, locos]) => (
          <div key={series} className="loco-group">
            <div className="loco-group__head">
              <Icon name="train" size={12} />
              <span>{lang === "hr" ? "Serija" : "Series"} {series}</span>
              <span className="loco-group__count">{locos.length}</span>
            </div>
            {locos.map((l) => {
              const isSelected = selectedIds.has(l.id);
              const isRouteTarget = routeId === l.id;
              return (
                <div
                  key={l.id}
                  className={`loco-row ${isSelected ? "loco-row--active" : ""} ${isRouteTarget ? "loco-row--route" : ""}`}
                  onClick={() => toggleSelected(l.id)}
                  role="button"
                  tabIndex={0}
                >
                  <label className="checkbox checkbox--sm" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(l.id)}
                    />
                    <span className="checkbox__box" />
                  </label>
                  <span className={`loco-state loco-state--${l.motion}`} title={l.motion === "moving" ? (lang === "hr" ? "Kreće se" : "Moving") : l.motion === "idle" ? (lang === "hr" ? "Stoji" : "Idle") : (lang === "hr" ? "Ugašena" : "Off")}>
                    {l.motion === "moving" && <Icon name="train" size={11} />}
                    {l.motion === "idle" && <Icon name="clock" size={11} />}
                    {l.motion === "off" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />}
                  </span>
                  <span className="loco-row__id">{l.id}</span>
                  <span className="loco-row__driver">{l.driver}</span>
                  {l.trainNo && <span className="loco-row__train">{l.trainNo}</span>}
                  <span className="loco-row__docs">
                    {l.ptu && <span className={`doc-badge doc-badge--ptu`} title="PTU">PTU</span>}
                    {l.kvr && <span className={`doc-badge doc-badge--kvr`} title="KVR">KVR</span>}
                  </span>
                  <span className={`ready-dot ready-dot--${l.readiness}`} title={l.readiness === "ready" ? (lang === "hr" ? "Spremna" : "Ready") : l.readiness === "warning" ? (lang === "hr" ? "Upozorenje" : "Warning") : (lang === "hr" ? "Blokirana" : "Blocked")} />
                </div>
              );
            })}
          </div>
        ))}
        {tab !== "lokomotive" && (
          <div className="empty">
            <div className="empty__icon"><Icon name="info" size={20} /></div>
            <div className="empty__title">{lang === "hr" ? "Modul u pripremi" : "Module pending"}</div>
            <div className="empty__body">{lang === "hr" ? "Ovaj prikaz će uključiti relevantne entitete. Trenutno aktivno: Lokomotive." : "This view will include relevant entities. Currently active: Locomotives."}</div>
          </div>
        )}
      </div>

      {/* Period picker */}
      <div className="period-box">
        <div className="period-row">
          <label>{lang === "hr" ? "Početni datum" : "Start date"}</label>
          <div className="field field--mono"><Icon name="calendar" size={12} style={{ color: "var(--fg-subtle)", marginRight: 6 }} /><input value={period.startDate} onChange={(e) => setPeriod({ ...period, startDate: e.target.value })}/></div>
        </div>
        <div className="period-row">
          <label>{lang === "hr" ? "Početni sat" : "Start hour"}</label>
          <div className="field field--mono"><Icon name="clock" size={12} style={{ color: "var(--fg-subtle)", marginRight: 6 }} /><input value={period.startTime} onChange={(e) => setPeriod({ ...period, startTime: e.target.value })}/></div>
        </div>
        <div className="period-row">
          <label>{lang === "hr" ? "Završni datum" : "End date"}</label>
          <div className="field field--mono"><Icon name="calendar" size={12} style={{ color: "var(--fg-subtle)", marginRight: 6 }} /><input value={period.endDate} onChange={(e) => setPeriod({ ...period, endDate: e.target.value })}/></div>
        </div>
        <div className="period-row">
          <label>{lang === "hr" ? "Završni sat" : "End hour"}</label>
          <div className="field field--mono"><Icon name="clock" size={12} style={{ color: "var(--fg-subtle)", marginRight: 6 }} /><input value={period.endTime} onChange={(e) => setPeriod({ ...period, endTime: e.target.value })}/></div>
        </div>
        <button
          className="btn btn--primary"
          style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
          onClick={() => onShowRoute(onlySelectedId)}
          disabled={!canShowRoute}
          title={canShowRoute ? "" : (lang === "hr" ? "Odaberi točno jednu lokomotivu" : "Select exactly one locomotive")}
        >
          <Icon name="map" size={13} />
          <span>{lang === "hr" ? "Prikaži rutu" : "Show route"}</span>
        </button>
        <div className="period-hint">
          {selectedIds.size === 0 && (lang === "hr" ? "Odaberi lokomotivu(e) za prikaz na karti." : "Select locomotive(s) to show on map.")}
          {selectedIds.size === 1 && (lang === "hr" ? `Spremno za rutu: ${onlySelectedId}` : `Ready for route: ${onlySelectedId}`)}
          {selectedIds.size > 1 && (lang === "hr" ? `${selectedIds.size} lokomotiva na karti — za rutu odaberi samo jednu.` : `${selectedIds.size} locos on map — pick only one for route.`)}
        </div>
      </div>
    </div>
  );
};

const GpsModule = ({ lang, t }) => {
  const [active, setActive] = useStateG("mapa");
  const [selectedIds, setSelectedIds] = useStateG(() => new Set([window.GPS_LOCOS[0].id]));
  const [routeId, setRouteId] = useStateG(null); // null = no route shown
  const [period, setPeriod] = useStateG({
    startDate: "26.04.2026.", startTime: "00:00",
    endDate: "26.04.2026.", endTime: "23:59",
  });

  const toggleSelected = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Selecting/deselecting clears route view
    setRouteId(null);
  };
  const selectAll = (ids) => {
    setSelectedIds(new Set(ids));
    setRouteId(null);
  };
  const clearSelected = () => {
    setSelectedIds(new Set());
    setRouteId(null);
  };
  const onShowRoute = (id) => {
    if (id) setRouteId(id);
  };
  const onClearRoute = () => setRouteId(null);

  const markers = useMemoG(
    () => window.GPS_LOCOS.filter(l => selectedIds.has(l.id)),
    [selectedIds]
  );
  const routeLoco = routeId ? window.GPS_LOCOS.find(l => l.id === routeId) : null;
  const route = useMemoG(() => routeLoco ? genRoute(routeLoco.id) : null, [routeLoco && routeLoco.id]);

  return (
    <>
      <GpsSidebar active={active} setActive={setActive} lang={lang} />
      <div className="resizer" />
      <LocoList
        selectedIds={selectedIds}
        toggleSelected={toggleSelected}
        selectAll={selectAll}
        clearSelected={clearSelected}
        routeId={routeId}
        setRouteId={setRouteId}
        lang={lang}
        period={period}
        setPeriod={setPeriod}
        onShowRoute={onShowRoute}
      />
      <div className="resizer" />
      <div className="panel" style={{ background: "var(--bg-subtle)" }}>
        <div className="map-stack">
          <RailMap
            markers={markers}
            routeLoco={routeLoco}
            route={route}
            lang={lang}
            onClearRoute={onClearRoute}
          />
          {routeLoco && route && <SpeedChart route={route} lang={lang} />}
        </div>
      </div>
    </>
  );
};

Object.assign(window, { GpsModule });
