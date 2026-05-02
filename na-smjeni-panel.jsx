// Na smjeni — grouped-by-domicil shift table
// Columns: Djelatnik, Domicil, Početak smjene, Radno mjesto, Vrsta rada,
//          Broj vlaka, Lokomotiva, Vrijeme javljanja, Vrijeme početka zadatka, Vrijeme završetka zadatka

const NaSmjeniPanel = ({ lang }) => {
  const { useState, useMemo } = React;

  const allRows = window.RAILOPS_DATA.NA_SMJENI;

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState({ key: "domicil", dir: "asc" });
  const [page, setPage] = useState(1);
  const PER_PAGE = 200;

  // Filtered rows
  const filtered = useMemo(() => {
    let r = allRows;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (row) =>
          row.djelatnik.toLowerCase().includes(q) ||
          row.domicil.toLowerCase().includes(q) ||
          (row.radnoMjesto || "").toLowerCase().includes(q) ||
          (row.vrstaRada || "").toLowerCase().includes(q) ||
          (row.brojVlaka || "").toLowerCase().includes(q) ||
          (row.lokomotiva || "").toLowerCase().includes(q)
      );
    }
    // Sort within groups: keep group-sort by domicil, secondary by djelatnik
    const dir = sortBy.dir === "asc" ? 1 : -1;
    return [...r].sort((a, b) => {
      const av = a[sortBy.key] || "";
      const bv = b[sortBy.key] || "";
      if (av === bv) return a.djelatnik.localeCompare(b.djelatnik, "hr");
      return av.localeCompare(bv, "hr") * dir;
    });
  }, [allRows, search, sortBy]);

  // Group by domicil
  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((row) => {
      const key = row.domicil;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    });
    return Array.from(map.entries()); // [[domicil, rows[]], ...]
  }, [filtered]);

  const totalRows = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PER_PAGE));
  // For pagination we flatten with page slicing
  const pageStart = (page - 1) * PER_PAGE;
  const pageEnd = Math.min(pageStart + PER_PAGE, totalRows);

  // Build page-sliced groups
  const pagedGroups = useMemo(() => {
    let idx = 0;
    const result = [];
    for (const [domicil, rows] of groups) {
      const groupStart = idx;
      const groupEnd = idx + rows.length;
      // Check overlap with [pageStart, pageEnd)
      if (groupEnd > pageStart && groupStart < pageEnd) {
        const sliceFrom = Math.max(0, pageStart - groupStart);
        const sliceTo = Math.min(rows.length, pageEnd - groupStart);
        result.push({ domicil, rows: rows.slice(sliceFrom, sliceTo), total: rows.length });
      }
      idx += rows.length;
    }
    return result;
  }, [groups, pageStart, pageEnd]);

  const toggleSort = (key) => {
    setSortBy((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
    setPage(1);
  };

  const SortTh = ({ k, children, style }) => (
    <th
      className={`sortable${sortBy.key === k ? " sorted" : ""}`}
      style={style}
      onClick={() => toggleSort(k)}
    >
      {children}
      <span className="sort-arrow">
        {sortBy.key === k ? (sortBy.dir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </th>
  );

  const Em = () => <span style={{ color: "var(--fg-faint)" }}>—</span>;

  return (
    <div className="panel ns-panel" style={{ gridColumn: "3 / -1", display: "flex", flexDirection: "column", minWidth: 0 }}>
      {/* Header */}
      <div className="panel__header">
        <div className="panel__title">
          <span>{lang === "hr" ? "Otvorene smjene" : "Open shifts"}</span>
          <span className="panel__title-count">{totalRows}</span>
        </div>
        <div className="panel__actions">
          {/* refresh-style button */}
          <button className="btn btn--sm" title={lang === "hr" ? "Osvježi" : "Refresh"}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="search__icon">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder={lang === "hr" ? "Pretraži po imenu, domicilu, vrsti rada…" : "Search by name, domicil, work type…"}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-subtle)", padding: "0 4px" }}
              onClick={() => { setSearch(""); setPage(1); }}
            >✕</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap scrollable">
        <table className="table ns-table">
          <thead>
            <tr>
              <SortTh k="djelatnik" style={{ minWidth: 140 }}>{lang === "hr" ? "Djelatnik" : "Employee"}</SortTh>
              <SortTh k="domicil" style={{ minWidth: 100 }}>{lang === "hr" ? "Domicil" : "Domicile"}</SortTh>
              <SortTh k="pocetakSmjene" style={{ minWidth: 130 }}>{lang === "hr" ? "Početak smjene" : "Shift start"}</SortTh>
              <SortTh k="radnoMjesto" style={{ minWidth: 110 }}>{lang === "hr" ? "Radno mjesto" : "Position"}</SortTh>
              <SortTh k="vrstaRada" style={{ minWidth: 140 }}>{lang === "hr" ? "Vrsta rada" : "Work type"}</SortTh>
              <SortTh k="brojVlaka" style={{ minWidth: 80 }}>{lang === "hr" ? "Broj vlaka" : "Train no."}</SortTh>
              <SortTh k="lokomotiva" style={{ minWidth: 90 }}>{lang === "hr" ? "Lokomotiva" : "Locomotive"}</SortTh>
              <SortTh k="vrijemeJavljanja" style={{ minWidth: 140 }}>{lang === "hr" ? "Vrijeme javljanja" : "Report time"}</SortTh>
              <SortTh k="vrijemePocetka" style={{ minWidth: 160 }}>{lang === "hr" ? "Vrijeme početka zadatka" : "Task start time"}</SortTh>
              <SortTh k="vrijemeZavrsetka" style={{ minWidth: 160 }}>{lang === "hr" ? "Vrijeme završetka zadatka" : "Task end time"}</SortTh>
            </tr>
          </thead>
          <tbody>
            {pagedGroups.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: 40, textAlign: "center", color: "var(--fg-subtle)" }}>
                  {lang === "hr" ? "Nema rezultata za zadane filtere." : "No results matching filters."}
                </td>
              </tr>
            )}
            {pagedGroups.map(({ domicil, rows, total }) => (
              <React.Fragment key={domicil}>
                {/* Group header row */}
                <tr className="ns-group-row">
                  <td colSpan={10}>
                    <span className="ns-group-toggle">▸</span>
                    {lang === "hr" ? "Domicil:" : "Domicile:"}{" "}
                    <strong>{domicil}</strong>
                    <span className="ns-group-count">
                      ({lang === "hr" ? "Ukupno:" : "Total:"} {total})
                    </span>
                  </td>
                </tr>
                {/* Data rows */}
                {rows.map((row, i) => (
                  <tr key={`${domicil}-${i}`} className="ns-data-row">
                    <td style={{ fontWeight: 500, paddingLeft: 20 }}>{row.djelatnik}</td>
                    <td style={{ color: "var(--fg-muted)" }}>{row.domicil}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>{row.pocetakSmjene || <Em />}</td>
                    <td>{row.radnoMjesto || <Em />}</td>
                    <td>{row.vrstaRada || <Em />}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>{row.brojVlaka || <Em />}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>{row.lokomotiva || <Em />}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>{row.vrijemeJavljanja || <Em />}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>{row.vrijemePocetka || <Em />}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>{row.vrijemeZavrsetka || <Em />}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pager */}
      <div className="pager">
        <button className="pager__btn" disabled={page === 1} onClick={() => setPage(1)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
        </button>
        <button className="pager__btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--fg-muted)" }}>{lang === "hr" ? "Stranica" : "Page"}</span>
          <input
            className="pager__page"
            value={page}
            onChange={(e) => {
              const v = parseInt(e.target.value || "1", 10);
              if (!isNaN(v) && v >= 1 && v <= totalPages) setPage(v);
            }}
          />
          <span style={{ color: "var(--fg-muted)" }}>{lang === "hr" ? "od" : "of"} {totalPages}</span>
        </span>
        <button className="pager__btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
        <button className="pager__btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
        </button>
        <span style={{ marginLeft: "auto", color: "var(--fg-muted)" }}>
          {lang === "hr" ? "Prikazujem" : "Showing"} {pageStart + 1}–{pageEnd} {lang === "hr" ? "od" : "of"} {totalRows}
        </span>
      </div>
    </div>
  );
};

Object.assign(window, { NaSmjeniPanel });
