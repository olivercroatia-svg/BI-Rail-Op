// List panel — table with search, filter, sort, pagination

const TaskList = ({ tasks, selectedId, setSelectedId, lang, t, onNew, onDuplicate }) => {
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState({ key: "id", dir: "desc" });
  const [statusFilter, setStatusFilter] = React.useState(null);
  const [shiftFilter, setShiftFilter] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const PER_PAGE = 100;
  const workTypes = lang === "hr" ? window.RAILOPS_DATA.WORK_TYPES_HR : window.RAILOPS_DATA.WORK_TYPES_EN;
  const STATUS_DEFS = window.RAILOPS_DATA.STATUS_DEFS;

  const filtered = React.useMemo(() => {
    let r = tasks;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((tk) =>
        tk.driver.toLowerCase().includes(q) ||
        String(tk.id).includes(q) ||
        String(tk.trainNo).includes(q) ||
        (tk.loco || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter) r = r.filter((tk) => tk.status === statusFilter);
    if (shiftFilter) r = r.filter((tk) => tk.shift === shiftFilter);
    const dir = sortBy.dir === "asc" ? 1 : -1;
    r = [...r].sort((a, b) => {
      const av = a[sortBy.key], bv = b[sortBy.key];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return av > bv ? dir : -dir;
    });
    return r;
  }, [tasks, search, sortBy, statusFilter, shiftFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageStart = (page - 1) * PER_PAGE;
  const pageEnd = Math.min(pageStart + PER_PAGE, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  const toggleSort = (key) => {
    setSortBy((s) => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  };

  const SortHeader = ({ k, children, align }) => (
    <th
      className={`sortable ${sortBy.key === k ? "sorted" : ""}`}
      style={{ textAlign: align || "left" }}
      onClick={() => toggleSort(k)}
    >
      {children}
      <span className="sort-arrow">{sortBy.key === k ? (sortBy.dir === "asc" ? "↑" : "↓") : "↕"}</span>
    </th>
  );

  return (
    <div className="panel">
      <div className="panel__header">
        <div className="panel__title">
          <span>{t.list.title}</span>
          <span className="panel__title-count">{filtered.length.toLocaleString(lang === "hr" ? "hr-HR" : "en-US")}</span>
        </div>
        <div className="panel__actions">
          <button className="btn btn--sm" onClick={onDuplicate} disabled={!selectedId}>
            <Icon name="copy" size={13} />
            <span>{t.list.duplicate}</span>
          </button>
          <button className="btn btn--sm btn--primary" onClick={onNew}>
            <Icon name="plus" size={13} />
            <span>{t.list.newTask}</span>
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <Icon name="search" size={14} className="search__icon" />
          <input
            placeholder={t.list.search}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <span className="search__kbd">⌘K</span>
        </div>
        <button
          className={`filter-pill ${statusFilter ? "filter-pill--active" : ""}`}
          onClick={() => {
            const order = [null, "open", "inProgress", "completed", "issue", "planned"];
            const i = order.indexOf(statusFilter);
            setStatusFilter(order[(i + 1) % order.length]);
          }}
        >
          <Icon name="filter" size={12} />
          <span>{lang === "hr" ? "Status" : "Status"}{statusFilter ? `: ${t.statuses[statusFilter]}` : ""}</span>
        </button>
        <button
          className={`filter-pill ${shiftFilter ? "filter-pill--active" : ""}`}
          onClick={() => {
            const order = [null, "A", "B", "C"];
            const i = order.indexOf(shiftFilter);
            setShiftFilter(order[(i + 1) % order.length]);
          }}
        >
          <Icon name="clock" size={12} />
          <span>{lang === "hr" ? "Smjena" : "Shift"}{shiftFilter ? `: ${t.list.shifts[shiftFilter]}` : ""}</span>
        </button>
        {(search || statusFilter || shiftFilter) && (
          <button className="btn btn--ghost btn--sm" onClick={() => { setSearch(""); setStatusFilter(null); setShiftFilter(null); }}>
            <Icon name="x" size={12} />
            <span>{lang === "hr" ? "Očisti" : "Clear"}</span>
          </button>
        )}
      </div>

      <div className="table-wrap scrollable">
        <table className="table">
          <thead>
            <tr>
              <SortHeader k="id">{t.list.cols.id}</SortHeader>
              <th style={{ width: 80, textAlign: "center" }}>{t.list.cols.controlled}</th>
              <SortHeader k="status"><span style={{ paddingLeft: 4 }}>{t.list.cols.status}</span></SortHeader>
              <SortHeader k="driver">{t.list.cols.driver}</SortHeader>
              <SortHeader k="trainNo">{t.list.cols.trainNo}</SortHeader>
              <SortHeader k="loco">{t.list.cols.loco}</SortHeader>
              <SortHeader k="workTypeIdx">{t.list.cols.workType}</SortHeader>
              <SortHeader k="route">{t.list.cols.route}</SortHeader>
              <th style={{ width: 70, textAlign: "center" }}>{t.list.cols.shift}</th>
              <SortHeader k="date">{t.list.cols.datetime}</SortHeader>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((tk, idx) => {
              const sd = STATUS_DEFS[tk.status] || STATUS_DEFS.open;
              return (
                <tr
                  key={`${tk.id}-${pageStart + idx}`}
                  className={tk.id === selectedId ? "selected" : ""}
                  onClick={() => setSelectedId(tk.id)}
                >
                  <td className="col-id">{tk.id}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`check-cell ${tk.controlled ? "check-cell--on" : ""}`}>
                      {tk.controlled && <Icon name="check" size={11} />}
                    </span>
                  </td>
                  <td>
                    <span className="status-pill">
                      <span className="status-pill__dot" style={{ background: sd.dot }} />
                      {t.statuses[tk.status]}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{tk.driver}</td>
                  <td className="col-train">{tk.trainNo || <span style={{ color: "var(--fg-faint)" }}>—</span>}</td>
                  <td className="col-loco">{tk.loco || <span style={{ color: "var(--fg-faint)" }}>—</span>}</td>
                  <td>{workTypes[tk.workTypeIdx]}</td>
                  <td className="col-train" style={{ color: "var(--fg-muted)" }}>{tk.route}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`shift-tag shift-tag--${tk.shift}`}>{tk.shift}</span>
                  </td>
                  <td className="col-time">
                    <strong>{tk.time}</strong> · {tk.date}
                  </td>
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: 40, textAlign: "center", color: "var(--fg-subtle)" }}>
                  {lang === "hr" ? "Nema rezultata za zadane filtere." : "No results matching filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button className="pager__btn" disabled={page === 1} onClick={() => setPage(1)}>
          <Icon name="chevrons-left" size={12} />
        </button>
        <button className="pager__btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
          <Icon name="chevron-left" size={12} />
        </button>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--fg-muted)" }}>{t.list.page}</span>
          <input
            className="pager__page"
            value={page}
            onChange={(e) => {
              const v = parseInt(e.target.value || "1", 10);
              if (!isNaN(v) && v >= 1 && v <= totalPages) setPage(v);
            }}
          />
          <span style={{ color: "var(--fg-muted)" }}>{t.list.of} {totalPages}</span>
        </span>
        <button className="pager__btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          <Icon name="chevron-right" size={12} />
        </button>
        <button className="pager__btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>
          <Icon name="chevrons-right" size={12} />
        </button>
        <span style={{ marginLeft: "auto" }}>
          {t.list.showing} {pageStart + 1}–{pageEnd} {lang === "hr" ? "od" : "of"} {filtered.length.toLocaleString(lang === "hr" ? "hr-HR" : "en-US")}
        </span>
      </div>
    </div>
  );
};

Object.assign(window, { TaskList });
