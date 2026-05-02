// Inspector edit panel — form for Pregledači work tasks
// Mirrors the screenshot: Pregledač / Vrsta rada / Opis / Kolodvor / Vrijeme / Status,
// "Manje <<" toggle that hides Vrijeme + Mjesto kreiranja and the OSM map.

function genInsPosHistory(task) {
  if (!task) return [];
  const seed = (task.id || 1) * 53;
  const rand = (() => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })();
  const parts = (task.createdAtCoords || "").split(",").map((s) => parseFloat(s.trim()));
  const baseLat = parts.length >= 2 && !isNaN(parts[0]) ? parts[0] : 45.5 + rand() * 0.5;
  const baseLng = parts.length >= 2 && !isNaN(parts[1]) ? parts[1] : 15.8 + rand() * 1.5;
  const count = 3 + Math.floor(rand() * 4);
  const reportedParts = (task.reportedAt || "26.04.2026. 20:00").split(" ");
  const timePart = reportedParts[1] || "20:00";
  const [startHH, startMM] = timePart.split(":").map(Number);
  const entries = [];
  for (let i = 0; i < count; i++) {
    const totalMin = startHH * 60 + startMM - i * (5 + Math.floor(rand() * 15));
    const hh = String(Math.floor((totalMin % 1440 + 1440) % 1440 / 60)).padStart(2, "0");
    const mm = String((totalMin % 60 + 60) % 60).padStart(2, "0");
    const ss = String(Math.floor(rand() * 60)).padStart(2, "0");
    const lat = (baseLat + (rand() - 0.5) * 0.05).toFixed(4);
    const lng = (baseLng + (rand() - 0.5) * 0.08).toFixed(4);
    entries.push({
      time: `26.04.2026. ${hh}:${mm}:${ss}`,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      coords: `${lat}, ${lng}`,
      acc: Math.floor(rand() * 12 + 2),
      statusZ: (window.STATUS_Z_OPTIONS || ["U redu", "Kasni", "Zaustavljen", "U kolodvoru", "Na putu", "Čeka signal"])[Math.floor(rand() * 6)],
    });
  }
  return entries;
}

const InsPozicijaSection = ({ draft, lang, mapVisible }) => {
  const posHistory = React.useMemo(() => genInsPosHistory(draft), [draft && draft.id]);
  const [selPos, setSelPos] = React.useState(() => posHistory[0] || null);
  React.useEffect(() => { setSelPos(posHistory[0] || null); }, [draft && draft.id]);

  const baseCoords = (() => {
    const parts = (draft.createdAtCoords || "").split(",").map((s) => parseFloat(s.trim()));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return { lat: parts[0], lng: parts[1] };
    return null;
  })();

  const lat = selPos ? selPos.lat : baseCoords ? baseCoords.lat : 45.812;
  const lng = selPos ? selPos.lng : baseCoords ? baseCoords.lng : 15.978;
  const dx = 0.012, dy = 0.008;
  const bbox = `${lng - dx},${lat - dy},${lng + dx},${lat + dy}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const mapLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
  const hasCoords = !!(selPos || baseCoords);

  return (
    <div className="edit-section">
      <h4 className="edit-section__title">
        <span>{lang === "hr" ? "Podaci o kreiranju" : "Creation metadata"}</span>
        <span className="edit-section__title-line" />
      </h4>
      <div className="field-grid">
        <label className="field-label">{lang === "hr" ? "Vrijeme kreiranja zadatka" : "Created at"}</label>
        <div className="field field--mono field--readonly">
          <Icon name="calendar" size={13} style={{ color: "var(--fg-subtle)", marginRight: 6 }} />
          <input value={draft.createdAt || ""} readOnly />
        </div>
        <label className="field-label">{lang === "hr" ? "Mjesto kreiranja zadatka" : "Created at (location)"}</label>
        <div className="field field--mono field--readonly">
          <Icon name="map-pin" size={13} style={{ color: "var(--fg-subtle)", marginRight: 6 }} />
          <input value={selPos ? selPos.coords : draft.createdAtCoords || "0,0,0"} readOnly />
        </div>
        {selPos && (
          <>
            <label className="field-label">{lang === "hr" ? "Točnost" : "Accuracy"}</label>
            <div className="field field--mono field--readonly">
              <input value={`± ${selPos.acc} m`} readOnly />
            </div>
            <label className="field-label">Status</label>
            <div className="field field--readonly">
              <input value={selPos.statusZ || "—"} readOnly />
            </div>
          </>
        )}
      </div>

      {mapVisible && (
        <div className="ins-map">
          <div className="ins-map__chrome">
            <div className="ins-map__tabs">
              <button className="ins-map__tab ins-map__tab--active">Map</button>
              <button className="ins-map__tab">Satellite</button>
            </div>
            <a className="ins-map__expand" href={mapLink} target="_blank" rel="noopener noreferrer"
              title={lang === "hr" ? "Otvori u OpenStreetMapu" : "Open in OpenStreetMap"}>
              <Icon name="maximize" size={12} />
            </a>
          </div>
          {hasCoords ? (
            <iframe key={mapSrc} title="Task location map" className="ins-map__iframe" src={mapSrc} loading="lazy" />
          ) : (
            <div className="ins-map__empty">
              <Icon name="map-pin" size={20} />
              <div style={{ marginTop: 8 }}>
                {lang === "hr" ? "Lokacija nije zabilježena (0,0,0)" : "Location not captured (0,0,0)"}
              </div>
            </div>
          )}
        </div>
      )}

      <h4 className="edit-section__title" style={{ marginTop: 16 }}>
        <span>{lang === "hr" ? "Povijest pozicija" : "Position history"}</span>
        <span className="edit-section__title-line" />
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {posHistory.map((p, i) => {
          const active = selPos && selPos.time === p.time;
          return (
            <div
              key={i}
              onClick={() => setSelPos(p)}
              style={{
                display: "flex", gap: 10, padding: "9px 10px", borderRadius: 6,
                cursor: "pointer", marginBottom: 2,
                background: active ? "var(--accent-soft)" : "transparent",
                border: `1px solid ${active ? "var(--accent-soft-border)" : "transparent"}`,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: active ? "var(--accent)" : "var(--border-strong)", marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: active ? "var(--accent)" : "var(--fg-muted)", fontWeight: 500 }}>{p.time}</span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--fg-subtle)" }}>± {p.acc} m</span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--fg-subtle)", marginTop: 2 }}>{p.coords}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--fg-faint)", marginTop: 1 }}>{draft.inspector || "—"} · #{draft.id} · Status: {p.statusZ}</div>
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: active ? "var(--accent)" : "var(--fg-faint)", alignSelf: "center", flexShrink: 0 }}>
                <Icon name="map-pin" size={11} />
              </div>
            </div>
          );
        })}
        {posHistory.length === 0 && (
          <div style={{ padding: "20px 0", textAlign: "center", color: "var(--fg-faint)", fontSize: "var(--text-sm)" }}>
            {lang === "hr" ? "Nema zabilježenih pozicija" : "No positions recorded"}
          </div>
        )}
      </div>
    </div>
  );
};

const INS_SAMPLE_NOTES = [
  { author: "M. Horvat", role: "Voditelj smjene", time: "21:35", text: "Provjeriti zračnice na vagonu 7 prije ponovnog spajanja.", initials: "MH" },
  { author: "Z. Posavec", role: "Pregledač", time: "21:28", text: "Skraćena proba kočenja izvedena u redu, vlak spreman za polazak.", initials: "ZP" },
];
const INS_SAMPLE_ATT = [
  { name: "izvjestaj-1036125.pdf", size: "186 KB", icon: "clipboard" },
];
const INS_SAMPLE_HIST = [
  { who: "Oliver Krilić", when: "26.04.2026 21:35", action: "potvrdio završetak zadatka" },
  { who: "Z. Posavec", when: "26.04.2026 21:28", action: "javio završetak zadatka" },
  { who: "Auto-sustav", when: "26.04.2026 21:10", action: "zadatak generiran iz rasporeda" },
];

const InspectorEdit = ({ task, lang, t, onSave, onDelete, onClose, onDuplicate, mapVisible = true }) => {
  const [tab, setTab] = React.useState("details");
  const [draft, setDraft] = React.useState(task || {});
  const [dirty, setDirty] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const workTypes = lang === "hr"
    ? window.RAILOPS_DATA.INSPECTOR_WORK_TYPES_HR
    : window.RAILOPS_DATA.INSPECTOR_WORK_TYPES_EN;
  const INSPECTORS = window.RAILOPS_DATA.INSPECTORS;
  const STATIONS = window.RAILOPS_DATA.INSPECTOR_STATIONS;

  React.useEffect(() => {
    setDraft(task || {});
    setDirty(false);
    setTab("details");
  }, [task && task.id]);

  if (!task) {
    return (
      <div className="panel">
        <div className="panel__header">
          <div className="panel__title">
            {lang === "hr" ? "Detalji zadatka — Pregledač" : "Task details — Inspector"}
          </div>
        </div>
        <div className="empty">
          <div className="empty__icon"><Icon name="edit" size={22} /></div>
          <div className="empty__title">{lang === "hr" ? "Odaberi zadatak" : "Select a task"}</div>
          <div className="empty__body">
            {lang === "hr"
              ? "Klikni red u listi da otvoriš detalje pregledačkog zadatka."
              : "Click a row to open inspector task details."}
          </div>
        </div>
      </div>
    );
  }

  const update = (key, val) => {
    setDraft((d) => ({ ...d, [key]: val }));
    setDirty(true);
  };

  const STATUS_LABEL = {
    completed: lang === "hr" ? "Završetak zadatka" : "Task completed",
    inProgress: lang === "hr" ? "U tijeku" : "In progress",
    issue: lang === "hr" ? "Problem" : "Issue",
  };
  const STATUS_OPTIONS = ["completed", "inProgress", "issue"];

  return (
    <div className="panel">
      <div className="panel__header">
        <div className="panel__title" style={{ gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-muted)", fontSize: "var(--text-sm)" }}>
            #{draft.id}
          </span>
          <span>{draft.inspector || (lang === "hr" ? "Novi zadatak" : "New task")}</span>
          <span className={`ins-pill ins-pill--${draft.status}`}>
            <span className={`ins-dot ins-dot--status-${draft.status}`} />
            {STATUS_LABEL[draft.status] || draft.status}
          </span>
        </div>
        <div className="panel__actions">
          <button className="btn btn--sm" onClick={onDuplicate} disabled={!task}>
            <Icon name="copy" size={13} />
            <span>{lang === "hr" ? "Kopiraj radni zadatak" : "Duplicate task"}</span>
          </button>
          <button className="btn btn--sm btn--danger" onClick={onDelete} title={lang === "hr" ? "Obriši" : "Delete"}>
            <Icon name="trash" size={13} />
          </button>
          <button className="btn btn--sm" onClick={onClose}>
            <Icon name="x" size={13} />
            <span>{lang === "hr" ? "Zatvori" : "Close"}</span>
          </button>
          <button
            className="btn btn--sm btn--primary"
            onClick={() => onSave(draft)}
            disabled={!dirty}
            style={!dirty ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
            <Icon name="save" size={13} />
            <span>{lang === "hr" ? "Spremi" : "Save"}{dirty ? "" : " ✓"}</span>
          </button>
        </div>
      </div>

      <div className="edit-tabs">
        <button className={`edit-tab ${tab === "details" ? "edit-tab--active" : ""}`} onClick={() => setTab("details")}>
          <Icon name="edit" size={12} />
          <span>{lang === "hr" ? "Detalji" : "Details"}</span>
        </button>
        <button className={`edit-tab ${tab === "notes" ? "edit-tab--active" : ""}`} onClick={() => setTab("notes")}>
          <Icon name="info" size={12} />
          <span>{lang === "hr" ? "Bilješke" : "Notes"}</span>
          <span className="edit-tab__count">{INS_SAMPLE_NOTES.length}</span>
        </button>
        <button className={`edit-tab ${tab === "attachments" ? "edit-tab--active" : ""}`} onClick={() => setTab("attachments")}>
          <Icon name="paperclip" size={12} />
          <span>{lang === "hr" ? "Prilozi" : "Attachments"}</span>
          <span className="edit-tab__count">{INS_SAMPLE_ATT.length}</span>
        </button>
        <button className={`edit-tab ${tab === "history" ? "edit-tab--active" : ""}`} onClick={() => setTab("history")}>
          <Icon name="history" size={12} />
          <span>{lang === "hr" ? "Povijest" : "History"}</span>
        </button>
      </div>

      <div className="edit-body scrollable">
        {tab === "details" && (
          <>
            <div className="edit-section">
              <h4 className="edit-section__title">
                <span>{lang === "hr" ? "Osnovno" : "Basic"}</span>
                <span className="edit-section__title-line" />
              </h4>
              <div className="field-grid">
                <label className="field-label">
                  {lang === "hr" ? "Pregledač" : "Inspector"}
                  <span className="field-label__req">*</span>
                </label>
                <div className="field field--select">
                  <input
                    list="ins-inspectors"
                    value={draft.inspector || ""}
                    onChange={(e) => update("inspector", e.target.value)}
                    placeholder={lang === "hr" ? "Odaberi…" : "Select…"}
                  />
                  <datalist id="ins-inspectors">
                    {[...new Set(INSPECTORS)].map((n, i) => <option key={i} value={n} />)}
                  </datalist>
                </div>

                <label className="field-label">
                  {lang === "hr" ? "Vrsta rada" : "Work type"}
                  <span className="field-label__req">*</span>
                </label>
                <div className="field field--select">
                  <select
                    value={draft.workTypeIdx ?? 0}
                    onChange={(e) => update("workTypeIdx", parseInt(e.target.value, 10))}
                  >
                    {workTypes.map((w, i) => <option key={i} value={i}>{w}</option>)}
                  </select>
                </div>

                <label className="field-label">
                  {lang === "hr" ? "Opis zadatka" : "Description"}
                </label>
                <div className="field">
                  <input
                    value={draft.description || ""}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder={lang === "hr" ? "Bilješka, napomena…" : "Notes…"}
                  />
                </div>

                <label className="field-label">
                  {lang === "hr" ? "Broj vlaka" : "Train no."}
                </label>
                <div className="field field--mono">
                  <input
                    value={draft.trainNo || ""}
                    onChange={(e) => update("trainNo", e.target.value)}
                    placeholder="—"
                  />
                </div>

                <label className="field-label">
                  {lang === "hr" ? "Kolodvor" : "Station"}
                </label>
                <div className="field field--select">
                  <input
                    list="ins-stations"
                    value={draft.station || ""}
                    onChange={(e) => update("station", e.target.value)}
                    placeholder={lang === "hr" ? "Odaberi…" : "Select…"}
                  />
                  <datalist id="ins-stations">
                    {STATIONS.map((s, i) => <option key={i} value={s} />)}
                  </datalist>
                </div>

                <label className="field-label">
                  {lang === "hr" ? "Vrijeme" : "Time"}
                </label>
                <div className="field field--mono">
                  <Icon name="clock" size={13} style={{ color: "var(--fg-subtle)", marginRight: 6 }} />
                  <input
                    value={draft.reportedAt || ""}
                    onChange={(e) => update("reportedAt", e.target.value)}
                  />
                </div>

                <label className="field-label">Status</label>
                <div className="field-row" style={{ flexWrap: "wrap", gap: 4 }}>
                  {STATUS_OPTIONS.map((s) => {
                    const active = draft.status === s;
                    return (
                      <button
                        key={s}
                        className="field-tag"
                        onClick={() => update("status", s)}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "var(--text-xs)",
                          fontWeight: 500,
                          letterSpacing: 0,
                          background: active ? "var(--accent-soft)" : "var(--surface)",
                          borderColor: active ? "var(--accent)" : "var(--border-strong)",
                          color: active ? "var(--accent)" : "var(--fg-muted)",
                        }}
                      >
                        <span className={`ins-dot ins-dot--status-${s}`} style={{ width: 6, height: 6 }} />
                        {STATUS_LABEL[s]}
                      </button>
                    );
                  })}
                </div>

                <label className="field-label">
                  {lang === "hr" ? "Kontrolira" : "Control"}
                </label>
                <div className="field-row" style={{ gap: 4 }}>
                  {[
                    { v: "pending", l: lang === "hr" ? "Čeka kontrolu" : "Pending" },
                    { v: "ok", l: lang === "hr" ? "Provjereno" : "Reviewed" },
                  ].map(({ v, l }) => {
                    const active = draft.kontrolira === v;
                    return (
                      <button
                        key={v}
                        className="field-tag"
                        onClick={() => update("kontrolira", v)}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "var(--text-xs)",
                          fontWeight: 500,
                          letterSpacing: 0,
                          background: active ? "var(--accent-soft)" : "var(--surface)",
                          borderColor: active ? "var(--accent)" : "var(--border-strong)",
                          color: active ? "var(--accent)" : "var(--fg-muted)",
                        }}
                      >
                        <span className={`ins-dot ins-dot--kontrol-${v}`} style={{ width: 6, height: 6 }} />
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                className="ins-collapse-toggle"
                onClick={() => setCollapsed((c) => !c)}
                title={collapsed ? (lang === "hr" ? "Više" : "More") : (lang === "hr" ? "Manje" : "Less")}
              >
                {collapsed
                  ? (lang === "hr" ? "Više »" : "More »")
                  : (lang === "hr" ? "Manje «" : "Less «")}
              </button>
            </div>

            {!collapsed && (
              <InsPozicijaSection draft={draft} lang={lang} mapVisible={mapVisible} />
            )}
          </>
        )}

        {tab === "notes" && (
          <div className="edit-section">
            <div className="notes-list">
              {INS_SAMPLE_NOTES.map((n, i) => (
                <div key={i} className="note-item">
                  <div className="note-item__avatar">{n.initials}</div>
                  <div className="note-item__body">
                    <div className="note-item__head">
                      <span className="note-item__author">{n.author}</span>
                      <span className="note-item__role">· {n.role}</span>
                      <span className="note-item__time">{n.time}</span>
                    </div>
                    <div className="note-item__text">{n.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="note-compose">
              <textarea placeholder={lang === "hr" ? "Dodaj bilješku…" : "Add a note…"} rows={3} />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button className="btn btn--sm btn--primary">
                  <Icon name="plus" size={12} />
                  <span>{lang === "hr" ? "Dodaj" : "Add"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "attachments" && (
          <div className="edit-section">
            <div className="att-list">
              {INS_SAMPLE_ATT.map((a, i) => (
                <div key={i} className="att-item">
                  <div className="att-item__icon"><Icon name={a.icon} size={14} /></div>
                  <div className="att-item__body">
                    <div className="att-item__name">{a.name}</div>
                    <div className="att-item__size">{a.size}</div>
                  </div>
                  <button className="btn btn--ghost btn--sm">
                    <Icon name="download" size={12} />
                  </button>
                </div>
              ))}
            </div>
            <button className="att-drop">
              <Icon name="paperclip" size={14} />
              <span>{lang === "hr" ? "Dodaj privitak" : "Add attachment"}</span>
            </button>
          </div>
        )}

        {tab === "history" && (
          <div className="edit-section">
            <ul className="history-list">
              {INS_SAMPLE_HIST.map((h, i) => (
                <li key={i} className="history-item">
                  <span className="history-item__dot" />
                  <div>
                    <div className="history-item__head">
                      <strong>{h.who}</strong>
                      <span className="history-item__when">{h.when}</span>
                    </div>
                    <div className="history-item__text">{h.action}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { InspectorEdit });
