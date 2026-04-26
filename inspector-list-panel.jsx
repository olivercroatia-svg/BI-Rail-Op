// Inspector (Pregledači) list panel — separate work-task type
// Columns: # / Kontrolira (red/yellow dot) / Status (green/blue/red dot) /
//          Korisnik / Vrsta posla / Broj vlaka / Kolodvor / Vrijeme javljanja

const InspectorList = ({
  tasks, selectedId, setSelectedId, lang, t,
  onNew, onDuplicate,
  pageSize = 100,
  showLegend = true,
}) => {
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState({ key: "id", dir: "desc" });
  const [kontrolFilter, setKontrolFilter] = React.useState(null);
  const [statusFilter, setStatusFilter] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const PER_PAGE = pageSize;
  const workTypes = lang === "hr"
    ? window.RAILOPS_DATA.INSPECTOR_WORK_TYPES_HR
    : window.RAILOPS_DATA.INSPECTOR_WORK_TYPES_EN;

  const filtered = React.useMemo(() => {
    let r = tasks;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((tk) =>
        tk.inspector.toLowerCase().includes(q) ||
        String(tk.id).includes(q) ||
        String(tk.trainNo).includes(q) ||
        (tk.station || "").toLowerCase().includes(q)
      );
    }
    if (kontrolFilter) r = r.filter((tk) => tk.kontrolira === kontrolFilter);
    if (statusFilter) r = r.filter((tk) => tk.status === statusFilter);
    const dir = sortBy.dir === "asc" ? 1 : -1;
    r = [...r].sort((a, b) => {
      const av = a[sortBy.key], bv = b[sortBy.key];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return av > bv ? dir : -dir;
    });
    return r;
  }, [tasks, search, sortBy, kontrolFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageStart = (page - 1) * PER_PAGE;
  const pageEnd = Math.min(pageStart + PER_PAGE, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const toggleSort = (key) => {
    setSortBy((s) => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  };

  const SortHeader = ({ k, children, align, width }) => (
    <th
      className={`sortable ${sortBy.key === k ? "sorted" : ""}`}
      style={{ textAlign: align || "left", width }}
      onClick={() => toggleSort(k)}
    >
      {children}
      <span className="sort-arrow">{sortBy.key === k ? (sortBy.dir === "asc" ? "↑" : "↓") : "↕"}</span>
    </th>
  );

  const KONTROL_LABEL = {
    pending: lang === "hr" ? "Čeka kontrolu" : "Pending",
    ok: lang === "hr" ? "Provjereno" : "Reviewed",
  };
  const STATUS_LABEL = {
    completed: lang === "hr" ? "Završeno" : "Completed",
    inProgress: lang === "hr" ? "U tijeku" : "In progress",
    issue: lang === "hr" ? "Problem" : "Issue",
  };

  return (
    <div className="panel">
      <div className="panel__header">
        <div className="panel__title">
          <span>{lang === "hr" ? "Radni zadaci · Pregledači" : "Work tasks · Inspectors"}</span>
          <span className="panel__title-count">
            {filtered.length.toLocaleString(lang === "hr" ? "hr-HR" : "en-US")}
          </span>
        </div>
        <div className="panel__actions">
          <button className="btn btn--sm" onClick={onDuplicate} disabled={!selectedId}>
            <Icon name="copy" size={13} />
            <span>{lang === "hr" ? "Kopiraj zadatak" : "Duplicate"}</span>
          </button>
          <button className="btn btn--sm btn--primary" onClick={onNew}>
            <Icon name="plus" size={13} />
            <span>{lang === "hr" ? "Novi zadatak" : "New task"}</span>
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <Icon name="search" size={14} className="search__icon" />
          <input
            placeholder={lang === "hr" ? "Pretraži ID, pregledač, vlak, kolodvor…" : "Search ID, inspector, train, station…"}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <span className="search__kbd">⌘K</span>
        </div>
        {showLegend && (
          <>
            <button
              className={`filter-pill ${kontrolFilter ? "filter-pill--active" : ""}`}
              onClick={() => {
                const order = [null, "pending", "ok"];
                const i = order.indexOf(kontrolFilter);
                setKontrolFilter(order[(i + 1) % order.length]);
              }}
            >
              <span className="ins-dot ins-dot--kontrol-pending" style={{ width: 8, height: 8 }} />
              <span>
                {lang === "hr" ? "Kontrolira" : "Control"}
                {kontrolFilter ? `: ${KONTROL_LABEL[kontrolFilter]}` : ""}
              </span>
            </button>
            <button
              className={`filter-pill ${statusFilter ? "filter-pill--active" : ""}`}
              onClick={() => {
                const order = [null, "completed", "inProgress", "issue"];
                const i = order.indexOf(statusFilter);
                setStatusFilter(order[(i + 1) % order.length]);
              }}
            >
              <span className="ins-dot ins-dot--status-completed" style={{ width: 8, height: 8 }} />
              <span>
                Status{statusFilter ? `: ${STATUS_LABEL[statusFilter]}` : ""}
              </span>
            </button>
          </>
        )}
        {(search || kontrolFilter || statusFilter) && (
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => { setSearch(""); setKontrolFilter(null); setStatusFilter(null); }}
          >
            <Icon name="x" size={12} />
            <span>{lang === "hr" ? "Očisti" : "Clear"}</span>
          </button>
        )}
        {showLegend && (
          <div className="ins-legend">
            <span className="ins-legend__item">
              <span className="ins-dot ins-dot--kontrol-pending" />
              <span>{lang === "hr" ? "Čeka" : "Pending"}</span>
            </span>
            <span className="ins-legend__item">
              <span className="ins-dot ins-dot--kontrol-ok" />
              <span>{lang === "hr" ? "OK" : "OK"}</span>
            </span>
            <span className="ins-legend__sep" />
            <span className="ins-legend__item">
              <span className="ins-dot ins-dot--status-completed" />
              <span>{lang === "hr" ? "Završeno" : "Done"}</span>
            </span>
            <span className="ins-legend__item">
              <span className="ins-dot ins-dot--status-inProgress" />
              <span>{lang === "hr" ? "U tijeku" : "In progress"}</span>
            </span>
            <span className="ins-legend__item">
              <span className="ins-dot ins-dot--status-issue" />
              <span>{lang === "hr" ? "Problem" : "Issue"}</span>
            </span>
          </div>
        )}
      </div>

      <div className="table-wrap scrollable">
        <table className="table table--inspector">
          <thead>
            <tr>
              <SortHeader k="id" width={88}>#</SortHeader>
              <SortHeader k="kontrolira" align="center" width={92}>
                {lang === "hr" ? "Kontrolira" : "Control"}
              </SortHeader>
              <SortHeader k="status" align="center" width={72}>Status</SortHeader>
              <SortHeader k="inspector">{lang === "hr" ? "Korisnik" : "User"}</SortHeader>
              <SortHeader k="workTypeIdx">{lang === "hr" ? "Vrsta posla" : "Work type"}</SortHeader>
              <SortHeader k="trainNo" width={92}>{lang === "hr" ? "Broj vlaka" : "Train no."}</SortHeader>
              <SortHeader k="station">{lang === "hr" ? "Kolodvor" : "Station"}</SortHeader>
              <SortHeader k="reportedAtSort" width={158}>
                {lang === "hr" ? "Vrijeme javljanja" : "Reported at"}
              </SortHeader>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((tk, idx) => (
              <tr
                key={`${tk.id}-${pageStart + idx}`}
                className={tk.id === selectedId ? "selected" : ""}
                onClick={() => setSelectedId(tk.id)}
              >
                <td className="col-id">{tk.id}</td>
                <td style={{ textAlign: "center" }}>
                  <span
                    className={`ins-dot ins-dot--kontrol-${tk.kontrolira}`}
                    title={KONTROL_LABEL[tk.kontrolira]}
                  />
                </td>
                <td style={{ textAlign: "center" }}>
                  <span
                    className={`ins-dot ins-dot--status-${tk.status}`}
                    title={STATUS_LABEL[tk.status]}
                  >
                    {tk.status === "completed" && <Icon name="check" size={9} />}
                  </span>
                </td>
                <td style={{ fontWeight: 500 }}>{tk.inspector}</td>
                <td className="col-worktype">
                  <span title={workTypes[tk.workTypeIdx]}>
                    {workTypes[tk.workTypeIdx]}
                  </span>
                </td>
                <td className="col-train">
                  {tk.trainNo || <span style={{ color: "var(--fg-faint)" }}>—</span>}
                </td>
                <td>{tk.station}</td>
                <td className="col-time">{tk.reportedAt}</td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "var(--fg-subtle)" }}>
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
          <span style={{ color: "var(--fg-muted)" }}>
            {lang === "hr" ? "Stranica" : "Page"}
          </span>
          <input
            className="pager__page"
            value={page}
            onChange={(e) => {
              const v = parseInt(e.target.value || "1", 10);
              if (!isNaN(v) && v >= 1 && v <= totalPages) setPage(v);
            }}
          />
          <span style={{ color: "var(--fg-muted)" }}>
            {lang === "hr" ? "od" : "of"} {totalPages}
          </span>
        </span>
        <button className="pager__btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          <Icon name="chevron-right" size={12} />
        </button>
        <button className="pager__btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>
          <Icon name="chevrons-right" size={12} />
        </button>
        <span style={{ marginLeft: "auto" }}>
          {lang === "hr" ? "Prikazujem" : "Showing"} {pageStart + 1}–{pageEnd}{" "}
          {lang === "hr" ? "od" : "of"}{" "}
          {filtered.length.toLocaleString(lang === "hr" ? "hr-HR" : "en-US")}
        </span>
      </div>
    </div>
  );
};

Object.assign(window, { InspectorList });
