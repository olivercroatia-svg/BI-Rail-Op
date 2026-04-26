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

// === Stations for current/start/end (Croatian rail) ===
const HR_STATIONS = [
  "Zagreb GK", "Zagreb RK", "Sesvete", "Dugo Selo", "Vrbovec", "Križevci", "Koprivnica",
  "Karlovac", "Ogulin", "Moravice", "Delnice", "Lokve", "Rijeka", "Šapjane", "Lupoglav",
  "Pula", "Zadar", "Split", "Knin", "Šibenik", "Sisak", "Sunja", "Novska", "Slav. Brod",
  "Vinkovci", "Tovarnik", "Osijek", "Beli Manastir", "Varaždin", "Čakovec", "Botovo",
  "Savski Marof", "Volinja", "Drnje", "Borovo", "Erdut",
];

const WAGON_TYPES = [
  { code: "Eas", desc: "Otvoreni teretni" },
  { code: "Habbillns", desc: "Zatvoreni klizna vrata" },
  { code: "Sgnss", desc: "Kontejner-platforma" },
  { code: "Zaes", desc: "Kemikalije / cisterna" },
  { code: "Falns", desc: "Saobitnik / rasuti teret" },
  { code: "Rils", desc: "Plato za koturove" },
  { code: "Rgs", desc: "Niska platforma" },
  { code: "Tagnpps", desc: "Cisterna mineralna ulja" },
];

// Real Croatia lat/lng coordinates for stations (approximate, for OSM marker placement)
const HR_STATION_COORDS = {
  "Zagreb GK": [45.8048, 15.9783],
  "Zagreb RK": [45.7842, 15.9550],
  "Sesvete": [45.8311, 16.1124],
  "Dugo Selo": [45.8086, 16.2353],
  "Vrbovec": [45.8819, 16.4258],
  "Križevci": [46.0258, 16.5453],
  "Koprivnica": [46.1639, 16.8336],
  "Karlovac": [45.4870, 15.5478],
  "Ogulin": [45.2647, 15.2308],
  "Moravice": [45.3275, 14.9061],
  "Delnice": [45.4011, 14.7944],
  "Lokve": [45.3786, 14.7411],
  "Rijeka": [45.3271, 14.4422],
  "Šapjane": [45.4753, 14.1817],
  "Lupoglav": [45.3578, 14.0792],
  "Pula": [44.8666, 13.8496],
  "Zadar": [44.1194, 15.2314],
  "Split": [43.5081, 16.4402],
  "Knin": [44.0411, 16.1992],
  "Šibenik": [43.7350, 15.8952],
  "Sisak": [45.4661, 16.3781],
  "Sunja": [45.3667, 16.5500],
  "Novska": [45.3411, 16.9772],
  "Slav. Brod": [45.1603, 18.0156],
  "Vinkovci": [45.2886, 18.8050],
  "Tovarnik": [45.1675, 19.1542],
  "Osijek": [45.5550, 18.6953],
  "Beli Manastir": [45.7700, 18.6000],
  "Varaždin": [46.3050, 16.3361],
  "Čakovec": [46.3892, 16.4339],
  "Botovo": [46.2436, 16.9047],
  "Savski Marof": [45.8625, 15.7211],
  "Volinja": [45.1908, 16.5381],
  "Drnje": [46.2206, 16.9233],
  "Borovo": [45.3781, 18.9656],
  "Erdut": [45.5247, 18.9619],
};

// Decorate locos with station/wagon mock data
(function decorate() {
  let s = 7;
  const r = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  window.GPS_LOCOS.forEach((l) => {
    const startIdx = Math.floor(r() * HR_STATIONS.length);
    let endIdx = Math.floor(r() * HR_STATIONS.length);
    if (endIdx === startIdx) endIdx = (endIdx + 7) % HR_STATIONS.length;
    let curIdx;
    if (l.motion === "off") {
      curIdx = startIdx;
    } else {
      curIdx = Math.floor(r() * HR_STATIONS.length);
    }
    l.startStation = HR_STATIONS[startIdx];
    l.endStation = HR_STATIONS[endIdx];
    l.currentStation = HR_STATIONS[curIdx];
    // Real lat/lng for OSM marker — based on currentStation with small jitter
    const baseCoords = HR_STATION_COORDS[l.currentStation] || [45.8048, 15.9783];
    l.lat = baseCoords[0] + (r() - 0.5) * 0.04;
    l.lng = baseCoords[1] + (r() - 0.5) * 0.06;
    // wagon list (skip when off and no train)
    const wagonCount = l.motion === "off" ? 0 : 6 + Math.floor(r() * 18);
    l.wagons = [];
    for (let i = 0; i < wagonCount; i++) {
      const t = WAGON_TYPES[Math.floor(r() * WAGON_TYPES.length)];
      l.wagons.push({
        no: `33 78 ${String(Math.floor(r() * 9000) + 1000)} ${String(Math.floor(r() * 900) + 100)}-${Math.floor(r() * 9)}`,
        type: t.code,
        desc: t.desc,
        weight: (10 + Math.floor(r() * 60)) + " t",
      });
    }
    // Documents attached to the train (no docs when off)
    l.docs = l.motion === "off" ? [] : [
      { name: `PTU-${l.trainNo}.pdf`, kind: "PTU", size: (120 + Math.floor(r() * 800)) + " kB", date: "26.04.2026." },
      { name: `KVR-${l.id}.pdf`, kind: "KVR", size: (80 + Math.floor(r() * 300)) + " kB", date: "26.04.2026." },
      { name: `Tovarni-list-${l.trainNo}.pdf`, kind: "CIM", size: (200 + Math.floor(r() * 500)) + " kB", date: "26.04.2026." },
      { name: `Popis-vagona-${l.trainNo}.xlsx`, kind: "XLS", size: (40 + Math.floor(r() * 120)) + " kB", date: "26.04.2026." },
      ...(r() > 0.5 ? [{ name: `Opasna-roba-RID-${l.trainNo}.pdf`, kind: "RID", size: (60 + Math.floor(r() * 200)) + " kB", date: "26.04.2026." }] : []),
    ];
  });
})();

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

// === Map component (real OpenStreetMap iframe with native zoom) ===
const RailMap = ({ markers, routeLoco, route, lang, onClearRoute, focusId, setFocusId }) => {
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

  // Decide which loco the iframe centers on
  const focused = showRoute
    ? routeLoco
    : (markers.find(m => m.id === focusId) || markers[0]);

  // Compute bbox: when multiple markers, fit to all; otherwise small box around focused
  let minLat, maxLat, minLng, maxLng;
  if (!showRoute && markers.length > 1) {
    minLat = Math.min(...markers.map(m => m.lat));
    maxLat = Math.max(...markers.map(m => m.lat));
    minLng = Math.min(...markers.map(m => m.lng));
    maxLng = Math.max(...markers.map(m => m.lng));
    // Pad bbox by 15%
    const padLat = (maxLat - minLat) * 0.15 + 0.05;
    const padLng = (maxLng - minLng) * 0.15 + 0.05;
    minLat -= padLat; maxLat += padLat;
    minLng -= padLng; maxLng += padLng;
  } else {
    const dy = 0.15, dx = 0.25;
    minLat = focused.lat - dy; maxLat = focused.lat + dy;
    minLng = focused.lng - dx; maxLng = focused.lng + dx;
  }
  const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${focused.lat},${focused.lng}`;
  const mapLink = `https://www.openstreetmap.org/?mlat=${focused.lat}&mlon=${focused.lng}#map=11/${focused.lat}/${focused.lng}`;

  return (
    <div className="map-canvas">
      {/* Map controls */}
      <div className="map-toolbar">
        <div className="map-toolbar__title">
          <Icon name="map" size={13} />
          <span>{lang === "hr" ? "Karta · OpenStreetMap" : "Map · OpenStreetMap"}</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, pointerEvents: "auto" }}>
          <a
            className="icon-btn"
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            title={lang === "hr" ? "Otvori u OpenStreetMapu" : "Open in OpenStreetMap"}
            style={{ textDecoration: "none" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3h7v7M10 14L21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>
          </a>
        </div>
      </div>

      {/* OSM iframe — native scroll-zoom & pan */}
      <iframe
        key={`${bbox}|${focused.id}`}
        title="Rail map"
        className="map-iframe"
        src={mapSrc}
        loading="lazy"
      />

      {/* Marker chip strip — when multiple selected, lets user pick which to focus */}
      {!showRoute && hasMarkers && markers.length > 1 && (
        <div className="marker-strip scrollable-x">
          {markers.map((m) => {
            const active = m.id === focused.id;
            const motionLabel = m.motion === "moving" ? (lang === "hr" ? "Kreće se" : "Moving")
              : m.motion === "idle" ? (lang === "hr" ? "Stoji" : "Idle")
              : (lang === "hr" ? "Ugašena" : "Off");
            return (
              <button
                key={m.id}
                className={`marker-chip marker-chip--${m.motion} ${active ? "marker-chip--active" : ""}`}
                onClick={() => setFocusId(m.id)}
                title={`${m.id} · ${motionLabel} · ${m.currentStation}`}
              >
                <span className="marker-chip__dot" />
                <span className="marker-chip__id">{m.id}</span>
                <span className="marker-chip__station">{m.currentStation}</span>
              </button>
            );
          })}
        </div>
      )}

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
          <span><span className="dot" style={{ background: "oklch(58% 0.13 155)" }} />{lang === "hr" ? "Polazak" : "From"} {routeLoco.startStation}</span>
          <span><span className="dot" style={{ background: "oklch(58% 0.20 22)" }} />{lang === "hr" ? "Cilj" : "To"} {routeLoco.endStation}</span>
          <span><span className="dot" style={{ background: "var(--accent)" }} />{lang === "hr" ? "Sad" : "Now"} {routeLoco.currentStation}</span>
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
  { id: "mapa-sve", iconName: "globe", labelHr: "Mapa sve", labelEn: "Map all" },
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
  const [focusId, setFocusId] = useStateG(null); // map focus when multi-selected
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
    setFocusId(id);
  };
  const selectAll = (ids) => {
    setSelectedIds(new Set(ids));
    setRouteId(null);
    setFocusId(ids[0] || null);
  };
  const clearSelected = () => {
    setSelectedIds(new Set());
    setRouteId(null);
    setFocusId(null);
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
            focusId={focusId}
            setFocusId={setFocusId}
          />
          {routeLoco && route && <SpeedChart route={route} lang={lang} />}
        </div>
      </div>
      <window.MapaSvePopup
        open={active === "mapa-sve"}
        lang={lang}
        onClose={() => setActive("mapa")}
      />
    </>
  );
};

Object.assign(window, { GpsModule });
