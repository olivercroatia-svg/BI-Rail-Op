// Header (top bar) + Sub bar + Sidebar components

const TopBar = ({ activeModule, setActiveModule, lang, setLang, t }) => {
  const modules = window.RAILOPS_DATA.MODULES_HR;
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <Icon name="logo" size={28} />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span className="topbar__brand-name">RailOps</span>
          <span style={{ fontSize: 10, color: "var(--fg-subtle)", letterSpacing: "0.04em" }}>
            DISPATCHER CONSOLE
          </span>
        </div>
      </div>
      <nav className="topbar__modules scrollable">
        {modules.map((m) => (
          <button
            key={m.id}
            className={`module-tab ${m.id === activeModule ? "module-tab--active" : ""}`}
            onClick={() => setActiveModule(m.id)}
          >
            <Icon name={MODULE_ICONS[m.id] || "list"} size={14} className="module-tab__icon" />
            <span>{t.modules[m.labelKey]}</span>
          </button>
        ))}
      </nav>
      <div className="topbar__right">
        <button
          className="icon-btn"
          onClick={() => setLang(lang === "hr" ? "en" : "hr")}
          title="Language"
          style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}
        >
          {lang.toUpperCase()}
        </button>
        <button className="icon-btn" title="Notifications">
          <Icon name="bell" size={16} />
          <span className="icon-btn__dot" />
        </button>
        <button className="icon-btn" title="Settings">
          <Icon name="settings" size={16} />
        </button>
        <div className="user-chip">
          <div className="user-chip__avatar">OK</div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span className="user-chip__name">Oliver Krilić</span>
            <span className="user-chip__role">{lang === "hr" ? "Dispečer · Smjena B" : "Dispatcher · Shift B"}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

const SubBar = ({ activeModule, activeNav, lang, t, tasks }) => {
  const counts = React.useMemo(() => {
    const c = { open: 0, inProgress: 0, completed: 0, issue: 0, planned: 0 };
    tasks.forEach((tk) => { c[tk.status] = (c[tk.status] || 0) + 1; });
    return c;
  }, [tasks]);

  return (
    <div className="subbar">
      <div className="crumbs">
        <Icon name={MODULE_ICONS[activeModule] || "briefcase"} size={13} style={{ color: "var(--fg-subtle)" }} />
        <span>{t.modules[activeModule] || activeModule}</span>
        <span className="crumbs__sep">›</span>
        <strong>{t.nav.radniZadaci}</strong>
        <span className="crumbs__sep">›</span>
        <strong>{t.nav[activeNav] || activeNav}</strong>
      </div>
      <div className="subbar__chips">
        <span className="chip-stat">
          <span className="chip-stat__dot" style={{ background: "var(--info)" }} />
          {lang === "hr" ? "Otvoreni" : "Open"} <strong>{counts.open}</strong>
        </span>
        <span className="chip-stat">
          <span className="chip-stat__dot" style={{ background: "#f59e0b" }} />
          {lang === "hr" ? "U tijeku" : "In progress"} <strong>{counts.inProgress}</strong>
        </span>
        <span className="chip-stat">
          <span className="chip-stat__dot" style={{ background: "#10b981" }} />
          {lang === "hr" ? "Završeni" : "Completed"} <strong>{counts.completed}</strong>
        </span>
        <span className="chip-stat">
          <span className="chip-stat__dot" style={{ background: "#f43f5e" }} />
          {lang === "hr" ? "Problemi" : "Issues"} <strong>{counts.issue}</strong>
        </span>
        <span className="chip-stat" style={{ fontWeight: 500 }}>
          <Icon name="calendar" size={12} style={{ color: "var(--fg-subtle)" }} />
          26.04.2026
        </span>
      </div>
    </div>
  );
};

const Sidebar = ({ activeNav, setActiveNav, t, lang }) => {
  const groups = window.RAILOPS_DATA.NAV_GROUPS;
  return (
    <aside className="sidebar scrollable">
      {groups.map((g, gi) => (
        <div key={g.id} className="sidebar__section">
          {g.titleKey && (
            <div className="sidebar__title">
              <span>{t.nav[g.titleKey]}</span>
              <span className="sidebar__title-line" />
            </div>
          )}
          {!g.titleKey && gi > 0 && (
            <div className="sidebar__title">
              <span style={{ color: "var(--fg-faint)" }}>
                {gi === 1 ? (lang === "hr" ? "Operativa" : "Operations") : (lang === "hr" ? "Vozni park" : "Fleet")}
              </span>
              <span className="sidebar__title-line" />
            </div>
          )}
          {g.items.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${item.id === activeNav ? "nav-item--active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              <Icon name={NAV_ICONS[item.id] || "list"} size={14} className="nav-item__icon" />
              <span className="nav-item__label">{t.nav[item.labelKey]}</span>
              {item.badge === "live" && <span className="nav-item__live" />}
              {item.count !== undefined && (
                <span className="nav-item__count">{item.count}</span>
              )}
            </button>
          ))}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div className="sidebar__section" style={{ borderTop: "1px solid var(--border-subtle)", padding: "10px 16px", fontSize: "var(--text-xs)", color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>v3.42.1</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
            {lang === "hr" ? "Sinkronizirano" : "Synced"}
          </span>
        </div>
      </div>
    </aside>
  );
};

Object.assign(window, { TopBar, SubBar, Sidebar });
