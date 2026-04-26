// Inspector edit panel — form for Pregledači work tasks
// Mirrors the screenshot: Pregledač / Vrsta rada / Opis / Kolodvor / Vrijeme / Status,
// "Manje <<" toggle that hides Vrijeme + Mjesto kreiranja and the OSM map.

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

  // OSM iframe — try to extract a coordinate from createdAtCoords
  const coords = (() => {
    if (!draft.createdAtCoords || draft.createdAtCoords === "0,0,0") return null;
    const parts = draft.createdAtCoords.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
    return null;
  })();

  // Default to a Zagreb-ish view if no coords
  const lat = coords ? coords.lat : 45.812;
  const lng = coords ? coords.lng : 15.978;
  const dx = 0.012, dy = 0.008;
  const bbox = `${lng - dx},${lat - dy},${lng + dx},${lat + dy}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const mapLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

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
              <div className="edit-section">
                <h4 className="edit-section__title">
                  <span>{lang === "hr" ? "Podaci o kreiranju" : "Creation metadata"}</span>
                  <span className="edit-section__title-line" />
                </h4>
                <div className="field-grid">
                  <label className="field-label">
                    {lang === "hr" ? "Vrijeme kreiranja zadatka" : "Created at"}
                  </label>
                  <div className="field field--mono field--readonly">
                    <Icon name="calendar" size={13} style={{ color: "var(--fg-subtle)", marginRight: 6 }} />
                    <input value={draft.createdAt || ""} readOnly />
                  </div>

                  <label className="field-label">
                    {lang === "hr" ? "Mjesto kreiranja zadatka" : "Created at (location)"}
                  </label>
                  <div className="field field--mono field--readonly">
                    <Icon name="map-pin" size={13} style={{ color: "var(--fg-subtle)", marginRight: 6 }} />
                    <input value={draft.createdAtCoords || "0,0,0"} readOnly />
                  </div>
                </div>

                {mapVisible && (
                  <div className="ins-map">
                    <div className="ins-map__chrome">
                      <div className="ins-map__tabs">
                        <button className="ins-map__tab ins-map__tab--active">Map</button>
                        <button className="ins-map__tab">Satellite</button>
                      </div>
                      <a
                        className="ins-map__expand"
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={lang === "hr" ? "Otvori u OpenStreetMapu" : "Open in OpenStreetMap"}
                      >
                        <Icon name="maximize" size={12} />
                      </a>
                    </div>
                    {coords ? (
                      <iframe
                        title="Task location map"
                        className="ins-map__iframe"
                        src={mapSrc}
                        loading="lazy"
                      />
                    ) : (
                      <div className="ins-map__empty">
                        <Icon name="map-pin" size={20} />
                        <div style={{ marginTop: 8 }}>
                          {lang === "hr"
                            ? "Lokacija nije zabilježena (0,0,0)"
                            : "Location not captured (0,0,0)"}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
