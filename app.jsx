// Main RailOps app — orchestrator with resizable panels and tweaks
const { useState, useEffect, useRef, useCallback } = React;

// === Resizer hook for col widths persisted across renders ===
function useResizer(initial, min = 100, max = 800) {
  const [size, setSize] = useState(initial);
  const draggingRef = useRef(false);

  const onMouseDown = useCallback((e, getNewSize) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev) => {
      if (!draggingRef.current) return;
      const newSize = getNewSize(ev);
      setSize(Math.max(min, Math.min(max, newSize)));
    };
    const onUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [min, max]);

  return [size, setSize, onMouseDown];
}

const App = () => {
  const I18N = window.RAILOPS_DATA.I18N;
  const tweaks = window.RAILOPS_DATA.TASKS;

  // Tweaks (persisted via host)
  const tweakDefaults = /*EDITMODE-BEGIN*/{
    "accent": "blue",
    "density": "regular",
    "layout": "split",
    "theme": "light",
    "insLegend": true,
    "insMap": true,
    "insPageSize": 100
  }/*EDITMODE-END*/;
  const [tw, setTw] = useTweaks(tweakDefaults);

  const [lang, setLang] = useState("hr");
  const t = I18N[lang];

  const [activeModule, setActiveModule] = useState("tehnologija");
  const [activeNav, setActiveNav] = useState("strojovode");

  const [tasks, setTasks] = useState(() => window.RAILOPS_DATA.TASKS);
  const [selectedId, setSelectedId] = useState(tasks[0] ? tasks[0].id : null);
  const selected = tasks.find((tk) => tk.id === selectedId) || null;

  // Inspector tasks (Pregledači) — separate dataset & selection
  const [insTasks, setInsTasks] = useState(() => window.RAILOPS_DATA.INSPECTOR_TASKS);
  const [insSelectedId, setInsSelectedId] = useState(insTasks[0] ? insTasks[0].id : null);
  const insSelected = insTasks.find((tk) => tk.id === insSelectedId) || null;

  const isInspector = activeNav === "pregledaci";

  const [toasts, setToasts] = useState([]);
  const pushToast = (message, kind = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((ts) => [...ts, { id, message, kind }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 2400);
  };

  // Resizable widths
  const [sidebarW, setSidebarW, onSidebarDown] = useResizer(232, 180, 360);
  const [listFrac, setListFrac] = useState(0.5);

  const bodyRef = useRef(null);

  const [panelsRect, setPanelsRect] = useState({ width: 1200 });
  useEffect(() => {
    if (!bodyRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setPanelsRect({ width: e.contentRect.width });
    });
    ro.observe(bodyRef.current);
    return () => ro.disconnect();
  }, []);

  const remaining = Math.max(400, panelsRect.width - sidebarW - 12);
  const listPx2 = Math.round(remaining * listFrac);
  const editPx2 = remaining - listPx2;

  // GPS module needs different proportions: narrower sidebar (sub-nav), wider map
  const isGps = activeModule === "gpsNadzor";
  const gpsSidebarW = 180;
  const gpsListW = Math.max(340, Math.min(420, panelsRect.width * 0.28));
  const gpsRemaining = Math.max(500, panelsRect.width - gpsSidebarW - 12 - gpsListW);
  const gpsCols = `${gpsSidebarW}px 6px ${gpsListW}px 6px ${gpsRemaining}px`;
  const defaultCols = `${sidebarW}px 6px ${listPx2}px 6px ${editPx2}px`;

  const onListSplitDown2 = (e) => {
    e.preventDefault();
    const start = e.clientX;
    const startFrac = listFrac;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (ev) => {
      const dx = ev.clientX - start;
      const frac = startFrac + dx / remaining;
      setListFrac(Math.max(0.25, Math.min(0.78, frac)));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleSave = (draft) => {
    setTasks((prev) => prev.map((tk) => (tk.id === draft.id ? draft : tk)));
    pushToast(t.edit.saved, "success");
  };

  const handleDelete = () => {
    if (!selected) return;
    setTasks((prev) => prev.filter((tk) => tk.id !== selected.id));
    setSelectedId(null);
    pushToast(lang === "hr" ? "Zadatak obrisan" : "Task deleted", "info");
  };

  const handleNew = () => {
    const newId = Math.max(...tasks.map(tk => tk.id)) + 1;
    const newTask = {
      id: newId,
      controlled: false,
      status: "open",
      driver: "",
      trainNo: "",
      loco: "",
      workTypeIdx: 0,
      route: "",
      shift: "B",
      date: "26.04.2026",
      time: new Date().toTimeString().slice(0, 5),
      description: "",
      seriesIdx: 0,
      notesCount: 0,
      attachmentsCount: 0,
    };
    setTasks((prev) => [newTask, ...prev]);
    setSelectedId(newId);
    pushToast(t.edit.created, "success");
  };

  const handleDuplicate = () => {
    if (!selected) return;
    const newId = Math.max(...tasks.map(tk => tk.id)) + 1;
    const dup = { ...selected, id: newId, controlled: false, status: "planned" };
    setTasks((prev) => [dup, ...prev]);
    setSelectedId(newId);
    pushToast(lang === "hr" ? "Zadatak kopiran" : "Task duplicated", "success");
  };

  // === Inspector handlers ===
  const handleInsSave = (draft) => {
    setInsTasks((prev) => prev.map((tk) => (tk.id === draft.id ? draft : tk)));
    pushToast(lang === "hr" ? "Zadatak spremljen" : "Task saved", "success");
  };
  const handleInsDelete = () => {
    if (!insSelected) return;
    setInsTasks((prev) => prev.filter((tk) => tk.id !== insSelected.id));
    setInsSelectedId(null);
    pushToast(lang === "hr" ? "Zadatak obrisan" : "Task deleted", "info");
  };
  const handleInsNew = () => {
    const newId = Math.max(...insTasks.map(tk => tk.id)) + 1;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const newTask = {
      id: newId,
      kontrolira: "pending",
      status: "inProgress",
      inspector: "",
      workTypeIdx: 0,
      trainNo: "",
      station: "",
      reportedAt: `26.04.2026. ${hh}:${mm}`,
      reportedAtSort: parseInt(hh, 10) * 60 + parseInt(mm, 10),
      description: "",
      createdAt: `26.04.2026. ${hh}:${mm}:${ss}`,
      createdAtCoords: "0,0,0",
      notesCount: 0,
      attachmentsCount: 0,
    };
    setInsTasks((prev) => [newTask, ...prev]);
    setInsSelectedId(newId);
    pushToast(lang === "hr" ? "Novi zadatak" : "New task", "success");
  };
  const handleInsDuplicate = () => {
    if (!insSelected) return;
    const newId = Math.max(...insTasks.map(tk => tk.id)) + 1;
    const dup = { ...insSelected, id: newId, kontrolira: "pending", status: "inProgress" };
    setInsTasks((prev) => [dup, ...prev]);
    setInsSelectedId(newId);
    pushToast(lang === "hr" ? "Zadatak kopiran" : "Task duplicated", "success");
  };

  // Apply accent and density via document attributes
  useEffect(() => {
    const root = document.documentElement;
    const accents = {
      blue:   { c: "oklch(58% 0.16 250)", h: "oklch(52% 0.16 250)", s: "oklch(96% 0.025 250)", b: "oklch(90% 0.05 250)" },
      indigo: { c: "oklch(50% 0.20 280)", h: "oklch(44% 0.20 280)", s: "oklch(96% 0.03 280)",  b: "oklch(90% 0.06 280)" },
      teal:   { c: "oklch(56% 0.13 195)", h: "oklch(50% 0.13 195)", s: "oklch(96% 0.03 195)",  b: "oklch(90% 0.05 195)" },
      amber:  { c: "oklch(60% 0.16 55)",  h: "oklch(54% 0.16 55)",  s: "oklch(96% 0.04 55)",   b: "oklch(90% 0.07 55)" },
      slate:  { c: "oklch(38% 0.025 250)",h: "oklch(30% 0.025 250)",s: "oklch(95% 0.005 250)", b: "oklch(88% 0.008 250)" },
    };
    const a = accents[tw.accent] || accents.blue;
    root.style.setProperty("--accent", a.c);
    root.style.setProperty("--accent-hover", a.h);
    root.style.setProperty("--accent-soft", a.s);
    root.style.setProperty("--accent-soft-border", a.b);
    root.setAttribute("data-density", tw.density === "regular" ? "" : tw.density);
    root.setAttribute("data-layout", tw.layout || "split");
    if (tw.theme === "dark") {
      root.style.setProperty("--bg", "oklch(18% 0.01 250)");
      root.style.setProperty("--bg-subtle", "oklch(20% 0.012 250)");
      root.style.setProperty("--bg-muted", "oklch(24% 0.014 250)");
      root.style.setProperty("--bg-sunken", "oklch(15% 0.01 250)");
      root.style.setProperty("--surface", "oklch(22% 0.012 250)");
      root.style.setProperty("--surface-2", "oklch(24% 0.012 250)");
      root.style.setProperty("--border", "oklch(30% 0.014 250)");
      root.style.setProperty("--border-strong", "oklch(36% 0.016 250)");
      root.style.setProperty("--border-subtle", "oklch(26% 0.012 250)");
      root.style.setProperty("--fg", "oklch(95% 0.005 250)");
      root.style.setProperty("--fg-muted", "oklch(75% 0.008 250)");
      root.style.setProperty("--fg-subtle", "oklch(58% 0.010 250)");
      root.style.setProperty("--fg-faint", "oklch(46% 0.012 250)");
    } else {
      // reset
      ["--bg","--bg-subtle","--bg-muted","--bg-sunken","--surface","--surface-2","--border","--border-strong","--border-subtle","--fg","--fg-muted","--fg-subtle","--fg-faint"]
        .forEach(p => root.style.removeProperty(p));
    }
  }, [tw.accent, tw.density, tw.layout, tw.theme]);

  // Keyboard: ⌘/Ctrl+S to save
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (selected) handleSave(selected);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className="app-shell">
      <TopBar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        lang={lang}
        setLang={setLang}
        t={t}
      />
      <SubBar activeModule={activeModule} activeNav={activeNav} lang={lang} t={t} tasks={isInspector ? insTasks : tasks} />

      <div
        ref={bodyRef}
        className="body"
        style={{
          gridTemplateColumns: isGps ? gpsCols : defaultCols,
        }}
      >
        {activeModule === "gpsNadzor" ? (
          <GpsModule lang={lang} t={t} />
        ) : (
          <>
            <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} t={t} lang={lang} />

            <div
              className="resizer"
              onMouseDown={(e) => onSidebarDown(e, (ev) => ev.clientX)}
              title={lang === "hr" ? "Promijeni širinu izbornika" : "Resize sidebar"}
            />

            {isInspector ? (
              <InspectorList
                tasks={insTasks}
                selectedId={insSelectedId}
                setSelectedId={setInsSelectedId}
                lang={lang}
                t={t}
                onNew={handleInsNew}
                onDuplicate={handleInsDuplicate}
                pageSize={tw.insPageSize || 100}
                showLegend={tw.insLegend !== false}
              />
            ) : (
              <TaskList
                tasks={tasks}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                lang={lang}
                t={t}
                onNew={handleNew}
                onDuplicate={handleDuplicate}
              />
            )}

            <div
              className="resizer"
              onMouseDown={onListSplitDown2}
              title={lang === "hr" ? "Promijeni omjer panela" : "Resize panels"}
            />

            {isInspector ? (
              <InspectorEdit
                task={insSelected}
                lang={lang}
                t={t}
                onSave={handleInsSave}
                onDelete={handleInsDelete}
                onDuplicate={handleInsDuplicate}
                onClose={() => setInsSelectedId(null)}
                mapVisible={tw.insMap !== false}
              />
            ) : (
              <TaskEdit
                task={selected}
                lang={lang}
                t={t}
                onSave={handleSave}
                onDelete={handleDelete}
                onClose={() => setSelectedId(null)}
              />
            )}
          </>
        )}
      </div>

      <div className="toast-wrap">
        {toasts.map((tt) => (
          <div key={tt.id} className={`toast ${tt.kind === "info" ? "toast--info" : ""}`}>
            <span className="toast__icon">
              <Icon name={tt.kind === "info" ? "info" : "check"} size={11} />
            </span>
            <span>{tt.message}</span>
          </div>
        ))}
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection title={lang === "hr" ? "Izgled" : "Appearance"}>
          <TweakRadio
            label={lang === "hr" ? "Tema" : "Theme"}
            value={tw.theme}
            onChange={(v) => setTw("theme", v)}
            options={[
              { value: "light", label: lang === "hr" ? "Svijetla" : "Light" },
              { value: "dark", label: lang === "hr" ? "Tamna" : "Dark" },
            ]}
          />
          <TweakSelect
            label={lang === "hr" ? "Naglasak" : "Accent"}
            value={tw.accent}
            onChange={(v) => setTw("accent", v)}
            options={[
              { value: "blue", label: "Plava — RailOps" },
              { value: "indigo", label: "Indigo" },
              { value: "teal", label: "Teal" },
              { value: "amber", label: "Amber" },
              { value: "slate", label: "Slate (mono)" },
            ]}
          />
          <TweakRadio
            label={lang === "hr" ? "Gustoća" : "Density"}
            value={tw.density}
            onChange={(v) => setTw("density", v)}
            options={[
              { value: "compact", label: lang === "hr" ? "Gusto" : "Compact" },
              { value: "regular", label: lang === "hr" ? "Srednje" : "Regular" },
              { value: "airy", label: lang === "hr" ? "Prozračno" : "Airy" },
            ]}
          />
        </TweakSection>
        <TweakSection title={lang === "hr" ? "Jezik" : "Language"}>
          <TweakRadio
            label="Lang"
            value={lang}
            onChange={(v) => setLang(v)}
            options={[
              { value: "hr", label: "Hrvatski" },
              { value: "en", label: "English" },
            ]}
          />
        </TweakSection>
        {isInspector && (
          <TweakSection title={lang === "hr" ? "Pregledači" : "Inspectors"}>
            <TweakToggle
              label={lang === "hr" ? "Status legenda u listi" : "Status legend in list"}
              value={tw.insLegend !== false}
              onChange={(v) => setTw("insLegend", v)}
            />
            <TweakToggle
              label={lang === "hr" ? "Mapa u edit panelu" : "Map in edit panel"}
              value={tw.insMap !== false}
              onChange={(v) => setTw("insMap", v)}
            />
            <TweakRadio
              label={lang === "hr" ? "Redova po stranici" : "Rows per page"}
              value={String(tw.insPageSize || 100)}
              onChange={(v) => setTw("insPageSize", parseInt(v, 10))}
              options={[
                { value: "50", label: "50" },
                { value: "100", label: "100" },
                { value: "200", label: "200" },
              ]}
            />
          </TweakSection>
        )}
        <TweakSection title={lang === "hr" ? "Akcije" : "Actions"}>
          <TweakButton onClick={isInspector ? handleInsNew : handleNew}>
            {lang === "hr" ? "+ Kreiraj novi zadatak" : "+ Create new task"}
          </TweakButton>
          <TweakButton onClick={() => {
            setSidebarW(232);
            setListFrac(0.5);
          }}>
            {lang === "hr" ? "↺ Resetiraj veličine panela" : "↺ Reset panel sizes"}
          </TweakButton>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
