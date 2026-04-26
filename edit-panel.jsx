// Edit panel — task details with tabs (details / notes / attachments / history)

const SAMPLE_NOTES = [
  { author: "M. Horvat", role: "Voditelj smjene", time: "09:42", text: "Pojačati nadzor pri ulazu u kolodvor — radovi na peronu 3.", initials: "MH" },
  { author: "I. Pezić", role: "Strojovođa", time: "08:15", text: "Lokomotiva 2132-313 — manji curenje ulja na ležaju, prijavljeno održavanju.", initials: "IP" },
];

const SAMPLE_ATTACHMENTS = [
  { name: "putni-nalog-806637.pdf", size: "248 KB", icon: "clipboard" },
  { name: "kvr-zg-os.pdf", size: "1.2 MB", icon: "clipboard" },
];

const SAMPLE_HISTORY = [
  { who: "Oliver Krilić", when: "26.04.2026 09:50", action: "izmijenio status u 'U tijeku'" },
  { who: "Oliver Krilić", when: "26.04.2026 09:42", action: "dodijelio strojovođu" },
  { who: "Auto-sustav", when: "26.04.2026 09:30", action: "zadatak generiran iz rasporeda RD-2026-04-26-B" },
];

const TaskEdit = ({ task, lang, t, onSave, onDelete, onClose }) => {
  const [tab, setTab] = React.useState("details");
  const [draft, setDraft] = React.useState(task || {});
  const [dirty, setDirty] = React.useState(false);
  const STATUS_DEFS = window.RAILOPS_DATA.STATUS_DEFS;
  const SERIES = window.RAILOPS_DATA.SERIES;
  const workTypes = lang === "hr" ? window.RAILOPS_DATA.WORK_TYPES_HR : window.RAILOPS_DATA.WORK_TYPES_EN;

  React.useEffect(() => { setDraft(task || {}); setDirty(false); setTab("details"); }, [task && task.id]);

  if (!task) {
    return (
      <div className="panel">
        <div className="panel__header">
          <div className="panel__title">{t.edit.header}</div>
        </div>
        <div className="empty">
          <div className="empty__icon"><Icon name="edit" size={22} /></div>
          <div className="empty__title">{lang === "hr" ? "Odaberi zadatak" : "Select a task"}</div>
          <div className="empty__body">
            {lang === "hr"
              ? "Klikni na red u listi lijevo da otvoriš detalje i uređivanje. Možeš također kreirati novi zadatak."
              : "Click a row in the list to open details. You can also create a new task."}
          </div>
        </div>
      </div>
    );
  }

  const update = (key, val) => {
    setDraft((d) => ({ ...d, [key]: val }));
    setDirty(true);
  };

  const sd = STATUS_DEFS[draft.status] || STATUS_DEFS.open;

  return (
    <div className="panel">
      <div className="panel__header">
        <div className="panel__title" style={{ gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-muted)", fontSize: "var(--text-sm)" }}>
            #{draft.id}
          </span>
          <span>{draft.driver || (lang === "hr" ? "Novi zadatak" : "New task")}</span>
          <span className="status-pill">
            <span className="status-pill__dot" style={{ background: sd.dot }} />
            {t.statuses[draft.status]}
          </span>
        </div>
        <div className="panel__actions">
          <button className="btn btn--sm btn--danger" onClick={onDelete} title={t.edit.delete}>
            <Icon name="trash" size={13} />
          </button>
          <button className="btn btn--sm" onClick={onClose}>
            <Icon name="x" size={13} />
            <span>{t.edit.cancel}</span>
          </button>
          <button
            className={`btn btn--sm btn--primary`}
            onClick={() => onSave(draft)}
            disabled={!dirty}
            style={!dirty ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
            <Icon name="save" size={13} />
            <span>{t.edit.save}{dirty ? "" : " ✓"}</span>
          </button>
        </div>
      </div>

      <div className="edit-tabs">
        <button className={`edit-tab ${tab === "details" ? "edit-tab--active" : ""}`} onClick={() => setTab("details")}>
          <Icon name="edit" size={12} />
          <span>{t.edit.tabs.details}</span>
        </button>
        <button className={`edit-tab ${tab === "notes" ? "edit-tab--active" : ""}`} onClick={() => setTab("notes")}>
          <Icon name="info" size={12} />
          <span>{t.edit.tabs.notes}</span>
          <span className="edit-tab__count">{SAMPLE_NOTES.length}</span>
        </button>
        <button className={`edit-tab ${tab === "attachments" ? "edit-tab--active" : ""}`} onClick={() => setTab("attachments")}>
          <Icon name="paperclip" size={12} />
          <span>{t.edit.tabs.attachments}</span>
          <span className="edit-tab__count">{SAMPLE_ATTACHMENTS.length}</span>
        </button>
        <button className={`edit-tab ${tab === "history" ? "edit-tab--active" : ""}`} onClick={() => setTab("history")}>
          <Icon name="history" size={12} />
          <span>{t.edit.tabs.history}</span>
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
                <label className="field-label">{t.edit.f.driver}<span className="field-label__req">*</span></label>
                <div className="field field--select">
                  <input value={draft.driver || ""} onChange={(e) => update("driver", e.target.value)} placeholder={t.edit.placeholders.select} />
                </div>

                <label className="field-label">{t.edit.f.workType}<span className="field-label__req">*</span></label>
                <div className="field field--select">
                  <select value={draft.workTypeIdx} onChange={(e) => update("workTypeIdx", parseInt(e.target.value, 10))}>
                    {workTypes.map((w, i) => <option key={i} value={i}>{w}</option>)}
                  </select>
                </div>

                <label className="field-label">{t.edit.f.description}</label>
                <div className="field">
                  <input value={draft.description || ""} onChange={(e) => update("description", e.target.value)} placeholder={t.edit.placeholders.notes} />
                </div>

                <label className="field-label">{t.edit.f.trainNo}<span className="field-label__req">*</span></label>
                <div className="field-row">
                  <div className="field field--mono" style={{ flex: 1 }}>
                    <input value={draft.trainNo || ""} onChange={(e) => update("trainNo", e.target.value)} placeholder={t.edit.placeholders.select} />
                  </div>
                  <button className="field-tag field-tag--ptu" title="Plan tehnoloških uvjeta">PTU</button>
                  <button className="field-tag field-tag--kvr" title="Knjiga voznog reda">KVR</button>
                </div>

                <label className="field-label">{t.edit.f.route}</label>
                <div className="field field--select field--mono">
                  <input value={draft.route || ""} onChange={(e) => update("route", e.target.value)} placeholder={t.edit.placeholders.select} />
                </div>

                <label className="field-label">{t.edit.f.shift}</label>
                <div className="field-row">
                  {["A", "B", "C"].map((s) => (
                    <button
                      key={s}
                      className={`field-tag`}
                      onClick={() => update("shift", s)}
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        background: draft.shift === s ? "var(--accent-soft)" : "var(--surface)",
                        borderColor: draft.shift === s ? "var(--accent)" : "var(--border-strong)",
                        color: draft.shift === s ? "var(--accent)" : "var(--fg-muted)",
                      }}
                    >
                      {s} · {t.list.shifts[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="edit-section">
              <h4 className="edit-section__title">
                <span>{lang === "hr" ? "Lokomotive" : "Locomotives"}</span>
                <span className="edit-section__title-line" />
              </h4>
              <div className="field-grid field-grid--3col">
                <label className="field-label">{t.edit.f.locoDriven}</label>
                <div className="field field--select" style={{ gridColumn: "span 2" }}>
                  <select defaultValue="vozna">
                    <option value="vozna">{lang === "hr" ? "Vozna" : "Driven"}</option>
                    <option value="zaprezna">{lang === "hr" ? "Zaprežna" : "Aux"}</option>
                    <option value="potiskivalica">{lang === "hr" ? "Potiskivalica" : "Pusher"}</option>
                  </select>
                </div>

                <label className="field-label">{t.edit.f.series}<span className="field-label__req">*</span></label>
                <div className="field field--select">
                  <select value={draft.seriesIdx} onChange={(e) => update("seriesIdx", parseInt(e.target.value, 10))}>
                    <option value="">{t.edit.placeholders.select}</option>
                    {SERIES.map((s, i) => <option key={i} value={i}>{s}</option>)}
                  </select>
                </div>
                <div className="field field--mono">
                  <input value={draft.loco || ""} onChange={(e) => update("loco", e.target.value)} placeholder={t.edit.f.loco} />
                </div>

                <label className="field-label">{t.edit.f.seriesAux}</label>
                <div className="field field--select">
                  <select><option value="">{t.edit.placeholders.select}</option>{SERIES.map((s, i) => <option key={i}>{s}</option>)}</select>
                </div>
                <div className="field field--mono">
                  <input placeholder={t.edit.f.locoAux} />
                </div>

                <label className="field-label">{t.edit.f.seriesPusher}</label>
                <div className="field field--select">
                  <select><option value="">{t.edit.placeholders.select}</option>{SERIES.map((s, i) => <option key={i}>{s}</option>)}</select>
                </div>
                <div className="field field--mono">
                  <input placeholder={t.edit.f.locoPusher} />
                </div>
              </div>
            </div>

            <div className="edit-section">
              <h4 className="edit-section__title">
                <span>{lang === "hr" ? "Vrijeme i kontrola" : "Time & control"}</span>
                <span className="edit-section__title-line" />
              </h4>
              <div className="field-grid">
                <label className="field-label">{t.edit.f.startAt}</label>
                <div className="field-row">
                  <div className="field field--mono" style={{ flex: 1 }}>
                    <Icon name="calendar" size={13} style={{ color: "var(--fg-subtle)", marginRight: 6 }} />
                    <input value={draft.date || ""} onChange={(e) => update("date", e.target.value)} />
                  </div>
                  <div className="field field--mono" style={{ flex: 1 }}>
                    <Icon name="clock" size={13} style={{ color: "var(--fg-subtle)", marginRight: 6 }} />
                    <input value={draft.time || ""} onChange={(e) => update("time", e.target.value)} />
                  </div>
                </div>

                <label className="field-label">{t.edit.f.endAt}</label>
                <div className="field-row">
                  <div className="field field--mono" style={{ flex: 1 }}>
                    <Icon name="calendar" size={13} style={{ color: "var(--fg-subtle)", marginRight: 6 }} />
                    <input defaultValue={draft.date || ""} />
                  </div>
                  <div className="field field--mono" style={{ flex: 1 }}>
                    <Icon name="clock" size={13} style={{ color: "var(--fg-subtle)", marginRight: 6 }} />
                    <input defaultValue="" placeholder="--:--" />
                  </div>
                </div>

                <label className="field-label">{t.edit.f.status}</label>
                <div className="field-row" style={{ flexWrap: "wrap", gap: 4 }}>
                  {["open", "inProgress", "completed", "issue", "planned"].map((s) => {
                    const sd2 = STATUS_DEFS[s];
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
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: sd2.dot }} />
                        {t.statuses[s]}
                      </button>
                    );
                  })}
                </div>

                <label className="field-label">{t.edit.f.controlled}</label>
                <div className="field-row">
                  <button
                    onClick={() => update("controlled", !draft.controlled)}
                    className="field-tag"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-xs)",
                      fontWeight: 500,
                      letterSpacing: 0,
                      background: draft.controlled ? "var(--success-soft)" : "var(--surface)",
                      borderColor: draft.controlled ? "var(--success)" : "var(--border-strong)",
                      color: draft.controlled ? "var(--success)" : "var(--fg-muted)",
                    }}
                  >
                    <span className={`check-cell ${draft.controlled ? "check-cell--on" : ""}`} style={{ width: 14, height: 14 }}>
                      {draft.controlled && <Icon name="check" size={9} />}
                    </span>
                    {draft.controlled
                      ? (lang === "hr" ? "Kontroliran · Oliver K." : "Checked · Oliver K.")
                      : (lang === "hr" ? "Označi kao kontroliran" : "Mark as checked")}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "notes" && (
          <div className="edit-section">
            <h4 className="edit-section__title">
              <span>{t.edit.f.notes}</span>
              <span className="edit-section__title-line" />
            </h4>
            <div className="field textarea" style={{ marginBottom: 12 }}>
              <textarea placeholder={t.edit.placeholders.notes}></textarea>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button className="btn btn--sm btn--primary">
                <Icon name="send" size={12} />
                <span>{lang === "hr" ? "Dodaj bilješku" : "Add note"}</span>
              </button>
            </div>
            <div className="notes-feed">
              {SAMPLE_NOTES.map((n, i) => (
                <div key={i} className="note">
                  <div className="note__avatar">{n.initials}</div>
                  <div className="note__body">
                    <div className="note__head">
                      <strong>{n.author}</strong>
                      <span>· {n.role}</span>
                      <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)" }}>{n.time}</span>
                    </div>
                    <div className="note__text">{n.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "attachments" && (
          <div className="edit-section">
            <h4 className="edit-section__title">
              <span>{t.edit.f.attachments}</span>
              <span className="edit-section__title-line" />
            </h4>
            <div className="dropzone" style={{ marginBottom: 12 }}>
              <Icon name="paperclip" size={20} style={{ marginBottom: 6 }} />
              <div>{t.edit.placeholders.drop}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--fg-faint)", marginTop: 4 }}>PDF, DOCX, JPG · max 10 MB</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SAMPLE_ATTACHMENTS.map((a, i) => (
                <div key={i} className="attachment">
                  <div className="attachment__icon"><Icon name={a.icon} size={14} /></div>
                  <span className="attachment__name">{a.name}</span>
                  <span className="attachment__size">{a.size}</span>
                  <button className="icon-btn" style={{ width: 26, height: 26 }}><Icon name="x" size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="edit-section">
            <h4 className="edit-section__title">
              <span>{lang === "hr" ? "Povijest izmjena" : "Change history"}</span>
              <span className="edit-section__title-line" />
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
              {SAMPLE_HISTORY.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < SAMPLE_HISTORY.length - 1 ? "1px solid var(--border-subtle)" : "0" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: i === 0 ? "var(--accent)" : "var(--border-strong)", marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "var(--text-sm)" }}>
                      <strong>{h.who}</strong> {h.action}
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{h.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="edit-footer">
        <div className="edit-footer__meta">
          {lang === "hr" ? "Zadnja izmjena" : "Last edit"} · 26.04.2026 09:50 · Oliver K.
        </div>
        {dirty && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--warning)", fontWeight: 500 }}>
            ● {lang === "hr" ? "Nespremljene izmjene" : "Unsaved changes"}
          </span>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { TaskEdit });
