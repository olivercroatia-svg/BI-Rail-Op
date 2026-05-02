// Mock data + i18n strings for the RailOps prototype
// Original design — not a copy of any existing app

const I18N = {
  hr: {
    appName: "RailOps",
    user: "Korisnik",
    modules: {
      tehnologija: "Tehnologija",
      gpsNadzor: "GPS nadzor",
      komercijala: "Komercijala",
      kontrola: "Kontrola",
      postavke: "Postavke",
      odrzavanje: "Održavanje",
      sigurnost: "Sigurnost prometa",
      kontrolaPrihoda: "Kontrola prihoda",
      analitika: "Analitika",
    },
    nav: {
      radniZadaci: "Radni zadaci",
      strojovode: "Strojovođe",
      pregledaci: "Pregledači",
      vlakovode: "Vlakovođe",
      transportniKomercijalisti: "Transportni komercijalisti",
      naSmjeni: "Na smjeni",
      se2se4: "SE-2 / SE-4",
      popisVlaka: "Popis vlaka",
      ponudeTeh: "Ponude tehnologija",
      prijevoznaOgr: "Prijevozna ograničenja",
      raspored: "Raspored",
      brzojavke: "Brzojavke",
      lokomotive: "Lokomotive",
      ve46: "VE-46",
      k102: "K-102",
      dispozicije: "Dispozicije",
      tv35: "TV-35",
      tarife: "Tarife",
      ptu: "PTU",
    },
    list: {
      title: "Radni zadaci — Strojovođe",
      newTask: "Novi zadatak",
      duplicate: "Kopiraj",
      search: "Pretraži po imenu, broju vlaka…",
      filter: "Filter",
      page: "Stranica",
      of: "od",
      showing: "Prikazujem",
      results: "rezultata",
      cols: {
        id: "#",
        controlled: "Kontroliran",
        status: "Status",
        driver: "Strojovođa",
        trainNo: "Br. vlaka",
        loco: "Lokomotiva",
        workType: "Vrsta rada",
        datetime: "Datum / vrijeme",
        route: "Trasa",
        shift: "Smjena",
      },
      shifts: { A: "Jutarnja", B: "Popodnevna", C: "Noćna" },
    },
    edit: {
      header: "Detalji zadatka",
      save: "Spremi",
      cancel: "Odustani",
      delete: "Obriši",
      tabs: { details: "Detalji", notes: "Bilješke", attachments: "Prilozi", history: "Povijest" },
      f: {
        driver: "Strojovođa",
        workType: "Vrsta rada",
        description: "Opis posla",
        trainNo: "Broj vlaka",
        route: "Trasa",
        locoDriven: "Lokomotiva koju vozi strojovođa",
        series: "Serija",
        loco: "Lokomotiva",
        seriesAux: "Serija zaprežna",
        locoAux: "Zaprežna lokomotiva",
        seriesPusher: "Serija potiskivalica",
        locoPusher: "Lokomotiva potiskivalica",
        startAt: "Početak",
        endAt: "Završetak",
        notes: "Bilješke",
        attachments: "Prilozi i dokumenti",
        controlled: "Kontroliran",
        controlledBy: "Kontrolirao",
        status: "Status",
        shift: "Smjena",
      },
      placeholders: {
        select: "Odaberi…",
        notes: "Dodaj bilješku za smjenu, izvanredne događaje, kvarove…",
        drop: "Povuci dokumente ovdje ili klikni za odabir",
      },
      saved: "Promjene spremljene",
      created: "Novi radni zadatak kreiran",
    },
    statuses: {
      open: "Otvoren",
      inProgress: "U tijeku",
      completed: "Završen",
      issue: "Problem",
      planned: "Planiran",
    },
  },
  en: {
    appName: "RailOps",
    user: "User",
    modules: {
      tehnologija: "Operations",
      gpsNadzor: "GPS Tracking",
      komercijala: "Commercial",
      kontrola: "Control",
      postavke: "Settings",
      odrzavanje: "Maintenance",
      sigurnost: "Traffic Safety",
      kontrolaPrihoda: "Revenue Control",
      analitika: "Analytics",
    },
    nav: {
      radniZadaci: "Work tasks",
      strojovode: "Train drivers",
      pregledaci: "Wagon inspectors",
      vlakovode: "Train conductors",
      transportniKomercijalisti: "Commercial agents",
      naSmjeni: "On shift",
      se2se4: "SE-2 / SE-4",
      popisVlaka: "Train roster",
      ponudeTeh: "Tech offerings",
      prijevoznaOgr: "Transport restrictions",
      raspored: "Schedule",
      brzojavke: "Telegrams",
      lokomotive: "Locomotives",
      ve46: "VE-46",
      k102: "K-102",
      dispozicije: "Dispositions",
      tv35: "TV-35",
      tarife: "Tariffs",
      ptu: "PTU",
    },
    list: {
      title: "Work tasks — Train drivers",
      newTask: "New task",
      duplicate: "Duplicate",
      search: "Search by name, train no…",
      filter: "Filter",
      page: "Page",
      of: "of",
      showing: "Showing",
      results: "results",
      cols: {
        id: "#",
        controlled: "Checked",
        status: "Status",
        driver: "Driver",
        trainNo: "Train",
        loco: "Loco",
        workType: "Work type",
        datetime: "Date / time",
        route: "Route",
        shift: "Shift",
      },
      shifts: { A: "Morning", B: "Afternoon", C: "Night" },
    },
    edit: {
      header: "Task details",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      tabs: { details: "Details", notes: "Notes", attachments: "Attachments", history: "History" },
      f: {
        driver: "Driver",
        workType: "Work type",
        description: "Description",
        trainNo: "Train number",
        route: "Route",
        locoDriven: "Locomotive driven",
        series: "Series",
        loco: "Locomotive",
        seriesAux: "Aux series",
        locoAux: "Aux locomotive",
        seriesPusher: "Pusher series",
        locoPusher: "Pusher locomotive",
        startAt: "Start",
        endAt: "End",
        notes: "Notes",
        attachments: "Attachments",
        controlled: "Checked",
        controlledBy: "Checked by",
        status: "Status",
        shift: "Shift",
      },
      placeholders: {
        select: "Select…",
        notes: "Add a note for shift handover, incidents, faults…",
        drop: "Drop documents here or click to upload",
      },
      saved: "Changes saved",
      created: "New task created",
    },
    statuses: {
      open: "Open",
      inProgress: "In progress",
      completed: "Completed",
      issue: "Issue",
      planned: "Planned",
    },
  },
};

const MODULES_HR = [
  { id: "tehnologija", labelKey: "tehnologija" },
  { id: "gpsNadzor", labelKey: "gpsNadzor" },
  { id: "komercijala", labelKey: "komercijala" },
  { id: "kontrola", labelKey: "kontrola" },
  { id: "sigurnost", labelKey: "sigurnost" },
  { id: "odrzavanje", labelKey: "odrzavanje" },
  { id: "kontrolaPrihoda", labelKey: "kontrolaPrihoda" },
  { id: "analitika", labelKey: "analitika" },
  { id: "postavke", labelKey: "postavke" },
];

const NAV_GROUPS = [
  {
    id: "tasks",
    titleKey: "radniZadaci",
    items: [
      { id: "strojovode", labelKey: "strojovode", count: 142, active: true },
      { id: "pregledaci", labelKey: "pregledaci", count: 38 },
      { id: "vlakovode", labelKey: "vlakovode", count: 56 },
      { id: "transportniKomercijalisti", labelKey: "transportniKomercijalisti", count: 12 },
      { id: "naSmjeni", labelKey: "naSmjeni", count: 84, badge: "live" },
    ],
  },
  {
    id: "ops",
    titleKey: null,
    items: [
      { id: "se2se4", labelKey: "se2se4" },
      { id: "popisVlaka", labelKey: "popisVlaka" },
      { id: "ponudeTeh", labelKey: "ponudeTeh" },
      { id: "prijevoznaOgr", labelKey: "prijevoznaOgr" },
      { id: "raspored", labelKey: "raspored" },
      { id: "brzojavke", labelKey: "brzojavke", count: 3 },
    ],
  },
  {
    id: "fleet",
    titleKey: null,
    items: [
      { id: "lokomotive", labelKey: "lokomotive" },
      { id: "ve46", labelKey: "ve46" },
      { id: "k102", labelKey: "k102" },
      { id: "dispozicije", labelKey: "dispozicije" },
      { id: "tv35", labelKey: "tv35" },
      { id: "tarife", labelKey: "tarife" },
      { id: "ptu", labelKey: "ptu" },
    ],
  },
];

// Statuses
// open = blue, inProgress = amber, completed = emerald, issue = rose, planned = slate
const STATUS_DEFS = {
  open: { color: "var(--accent)", dot: "var(--accent)" },
  inProgress: { color: "#d97706", dot: "#f59e0b" },
  completed: { color: "#059669", dot: "#10b981" },
  issue: { color: "#e11d48", dot: "#f43f5e" },
  planned: { color: "#64748b", dot: "#94a3b8" },
};

const WORK_TYPES_HR = [
  "Vožnja vlaka",
  "Manevra u kolodvoru",
  "Pomoćni stroj",
  "Režijska vožnja",
  "Stavljanje / skidanje",
  "Zakapčanje / otkapčanje",
  "Dežurni",
  "Priprema",
  "Dodatne radnje",
  "Potpuna proba",
];

const WORK_TYPES_EN = [
  "Train run",
  "Yard maneuver",
  "Auxiliary machine",
  "Service ride",
  "Coupling / uncoupling",
  "Engaging / disengaging",
  "On duty",
  "Preparation",
  "Additional actions",
  "Full inspection",
];

const DRIVERS = [
  "Novak Franjo", "Petrović Vladimir", "Lukavec Ruben", "Bogović Mijo",
  "Salopek Milan", "Petrović Vladimir", "Novak Franjo", "Karan Nedeljko",
  "Pezić Ivan", "Rajković Ivan", "Pezić Ivan", "Stanišić Željko",
  "Bobek Kazimir", "Pezić Ivan", "Bilić Tomislav", "Sabolović Tomo",
  "Čembić Tomislav", "Pavlović Matej", "Pap Alen", "Culjak Siniša",
  "Culjak Siniša", "Božičević Dalibor", "Vidaković Dragan", "Dobrilović Mario",
  "Andrijanić Mario", "Horvat Damir", "Kovač Petar", "Marić Stjepan",
  "Jurić Tomislav", "Babić Ante",
];

const ROUTES = [
  "ZG-RI", "ZG-OS", "ZG-ST", "ZG-VŽ", "RI-OS", "ZG-KO",
  "ZG-SB", "OS-VK", "ST-PL", "RI-PU", "ZG-SK", "VŽ-ČK",
];

// Deterministic-ish task generation
function genTasks(seed = 1) {
  const rand = (() => {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  })();
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const statuses = ["open", "inProgress", "completed", "issue", "planned"];
  const tasks = [];
  for (let i = 0; i < 60; i++) {
    const id = 806637 - i * (1 + Math.floor(rand() * 3));
    const status = pick(statuses);
    const controlled = rand() > 0.5;
    const driver = pick(DRIVERS);
    const trainNo = rand() > 0.25 ? String(Math.floor(rand() * 90000) + 10000) : "";
    const loco = rand() > 0.2 ? `${pick(["2062", "1141", "2132", "1142", "6193", "1143"])}-${String(Math.floor(rand() * 900) + 100)}` : "";
    const workTypeIdx = Math.floor(rand() * WORK_TYPES_HR.length);
    const route = pick(ROUTES);
    const shift = pick(["A", "B", "C"]);
    const day = Math.floor(rand() * 27) + 1;
    const hh = Math.floor(rand() * 24);
    const mm = Math.floor(rand() * 60);
    const date = `${String(day).padStart(2, "0")}.04.2026`;
    const time = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    tasks.push({
      id,
      controlled,
      status,
      driver,
      trainNo,
      loco,
      workTypeIdx,
      route,
      shift,
      date,
      time,
      description: rand() > 0.6 ? "Redovita vožnja prema voznom redu, bez izvanrednih napomena." : "",
      seriesIdx: Math.floor(rand() * 6),
      notesCount: Math.floor(rand() * 4),
      attachmentsCount: Math.floor(rand() * 3),
    });
  }
  return tasks;
}

const SERIES = ["1141", "1142", "1143", "2062", "2132", "6193"];

// === Inspectors (Pregledači) — separate role from drivers ===
const INSPECTORS = [
  "Carević Siniša", "Avgustinović Josip", "Palijan Ivica", "Posavec Zdenko",
  "Mandić Dragan", "Posavec Zdenko", "Avgustinović Josip", "Ivošević Ilija",
  "Zajec Marijan", "Posavec Zdenko", "Komlenović Josip", "Vinković Antun",
  "Vidović Ivan", "Borović Ibrahim", "Carević Siniša", "Posavec Zdenko",
  "Ivošević Ilija", "Borović Ibrahim", "Magdić Tomislav", "Šokčević Ivan",
  "Jurić Zlatko", "Pavičić Marko", "Šimić Antun", "Vukelić Igor",
];

// === Inspector work types — different from drivers ===
const INSPECTOR_WORK_TYPES_HR = [
  "Skraćena proba kočenja vlaka",
  "Potpuna proba kočenja vlaka",
  "Tehnički pregled vlaka",
  "Pojedinačni pregled",
  "Manevriranje",
  "Korištenje službenog vozila",
  "Formiranje vlaka",
  "Ostalo",
];
const INSPECTOR_WORK_TYPES_EN = [
  "Brake test (short)",
  "Brake test (full)",
  "Technical train inspection",
  "Individual inspection",
  "Yard maneuver",
  "Service vehicle use",
  "Train formation",
  "Other",
];

// === Stations for inspector tasks ===
const INSPECTOR_STATIONS = [
  "Zagreb GK", "Rijeka", "Slavonski Brod", "Vinkovci", "Varaždin", "Bakar",
  "Škrljevo", "Dobova", "Moravice", "Šid", "Knin", "Osijek", "Borovo", "Erdut",
];

// === Inspector tasks generator — Kontrolira (red/yellow) + Status (green/blue/red) two-dot system ===
function genInspectorTasks(seed = 11) {
  const rand = (() => {
    let s = seed;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  })();
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  // Kontrolira:  pending=red dot, ok=yellow dot
  // Status: complete=green, in-progress=blue, issue=red
  const kontrols = ["pending", "ok"]; // pending = red, ok = yellow
  const statuses = ["completed", "inProgress", "issue"]; // green/blue/red

  const list = [];
  let id = 1036131;
  for (let i = 0; i < 220; i++) {
    const wtIdx = Math.floor(rand() * INSPECTOR_WORK_TYPES_HR.length);
    const inspector = pick(INSPECTORS);
    const trainNo = rand() > 0.18 ? String(Math.floor(rand() * 90000) + 10000) : "";
    const station = pick(INSPECTOR_STATIONS);
    const hh = Math.floor(rand() * 24);
    const mm = Math.floor(rand() * 60);
    const day = 26;
    const description = rand() > 0.55 ? "Bez izvanrednih napomena. Sva ispitivanja u redu." : (rand() > 0.4 ? "Manja korekcija na vagonu br. 7 — provjereno." : "");
    list.push({
      id,
      kontrolira: pick(kontrols),
      status: weightedStatus(rand, statuses),
      inspector,
      workTypeIdx: wtIdx,
      trainNo,
      station,
      reportedAt: `26.04.2026. ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
      reportedAtSort: hh * 60 + mm,
      description,
      // Vrijeme + Mjesto kreiranja
      createdAt: `26.04.2026. ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(Math.floor(rand() * 60)).padStart(2, "0")}`,
      createdAtCoords: rand() > 0.35
        ? `${(45.7 + rand() * 0.6).toFixed(4)}, ${(15.9 + rand() * 0.4).toFixed(4)}`
        : "0,0,0",
      notesCount: Math.floor(rand() * 3),
      attachmentsCount: Math.floor(rand() * 2),
    });
    id -= (1 + Math.floor(rand() * 3)) * 2; // mimic original screenshot's id stepping
  }
  return list;
}
function weightedStatus(rand, statuses) {
  const r = rand();
  if (r < 0.6) return "completed";
  if (r < 0.85) return "inProgress";
  return "issue";
}

// === Na smjeni — open shifts data ===
// Columns: Djelatnik, Domicil, Početak smjene, Radno mjesto, Vrsta rada, Broj vlaka,
//          Lokomotiva, Vrijeme javljanja, Vrijeme početka zadatka, Vrijeme završetka zadatka

const NA_SMJENI_RADNA_MJESTA = ["Strojovođa", "Vlakovođa", "Pregledač", "Transportni k..."];
const NA_SMJENI_VRSTE_RADA = [
  "Vožnja vlaka", "Reži vožnja", "Priprema", "Manevriranje",
  "Formiranje vlaka", "Tehnički pregled vlaka...", "Razno",
  "Potpuna proba kočenja...",
];

const NA_SMJENI_RAW = [
  // Karlovac (2)
  { djelatnik: "Magličić Dario",   domicil: "Karlovac",   pocetakSmjene: "02.05.2026. 07:00", radnoMjesto: "Strojovođa", vrstaRada: "Vožnja vlaka",                vrijemeJavljanja: "02.05.2026. 12:00", vrijemePocetka: "02.05.2026. 13:01", vrijemeZavrsetka: "",                  brojVlaka: "81224",   lokomotiva: "7193-614" },
  { djelatnik: "Orešković Dražen", domicil: "Karlovac",   pocetakSmjene: "02.05.2026. 05:00", radnoMjesto: "Strojovođa", vrstaRada: "Reži vožnja",                vrijemeJavljanja: "02.05.2026. 11:38", vrijemePocetka: "02.05.2026. 11:40", vrijemeZavrsetka: "02.05.2026. 12:43", brojVlaka: "4201",    lokomotiva: "" },
  // Knin (3)
  { djelatnik: "Komar Damir",      domicil: "Knin",        pocetakSmjene: "02.05.2026. 07:00", radnoMjesto: "Strojovođa", vrstaRada: "Priprema",                   vrijemeJavljanja: "02.05.2026. 07:31", vrijemePocetka: "02.05.2026. 07:31", vrijemeZavrsetka: "",                  brojVlaka: "00000",   lokomotiva: "" },
  { djelatnik: "Kardov Darko",     domicil: "Knin",        pocetakSmjene: "02.05.2026. 07:00", radnoMjesto: "Strojovođa", vrstaRada: "",                           vrijemeJavljanja: "",                  vrijemePocetka: "",                   vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "" },
  { djelatnik: "Alduk Miljenko",   domicil: "Knin",        pocetakSmjene: "02.05.2026. 07:00", radnoMjesto: "Strojovođa", vrstaRada: "",                           vrijemeJavljanja: "",                  vrijemePocetka: "",                   vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "" },
  // Koprivnica (16)
  { djelatnik: "Zubčić Nikola",    domicil: "Koprivnica",  pocetakSmjene: "02.05.2026. 13:25", radnoMjesto: "Strojovođa", vrstaRada: "Vožnja vlaka",                vrijemeJavljanja: "02.05.2026. 16:10", vrijemePocetka: "",                   vrijemeZavrsetka: "",                  brojVlaka: "48796",   lokomotiva: "1141-320" },
  { djelatnik: "Jukić Željko",     domicil: "Koprivnica",  pocetakSmjene: "02.05.2026. 10:55", radnoMjesto: "Strojovođa", vrstaRada: "Vožnja vlaka",                vrijemeJavljanja: "02.05.2026. 16:10", vrijemePocetka: "02.05.2026. 12:10", vrijemeZavrsetka: "",                  brojVlaka: "45990",   lokomotiva: "6193-101" },
  { djelatnik: "Kokša Dragulin",   domicil: "Koprivnica",  pocetakSmjene: "02.05.2026. 07:50", radnoMjesto: "Transportni k...", vrstaRada: "",                      vrijemeJavljanja: "",                  vrijemePocetka: "",                   vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "" },
  { djelatnik: "Bogović Miljenko", domicil: "Koprivnica",  pocetakSmjene: "02.05.2026. 07:01", radnoMjesto: "Strojovođa", vrstaRada: "",                           vrijemeJavljanja: "",                  vrijemePocetka: "",                   vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "" },
  { djelatnik: "Negovec Ivan",     domicil: "Koprivnica",  pocetakSmjene: "02.05.2026. 07:00", radnoMjesto: "Vlakovođa",  vrstaRada: "Manevriranje",               vrijemeJavljanja: "02.05.2026. 13:07", vrijemePocetka: "02.05.2026. 14:13", vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "2041-108" },
  { djelatnik: "Blažeković Hrvoje",domicil: "Koprivnica",  pocetakSmjene: "02.05.2026. 07:00", radnoMjesto: "Strojovođa", vrstaRada: "",                           vrijemeJavljanja: "",                  vrijemePocetka: "",                   vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "" },
  { djelatnik: "Strmečki Viktor",  domicil: "Koprivnica",  pocetakSmjene: "02.05.2026. 06:55", radnoMjesto: "Vlakovođa",  vrstaRada: "Formiranje vlaka",            vrijemeJavljanja: "02.05.2026. 09:27", vrijemePocetka: "02.05.2026. 09:28", vrijemeZavrsetka: "02.05.2026. 09:28", brojVlaka: "69700",   lokomotiva: "" },
  { djelatnik: "Cikač Renato",     domicil: "Koprivnica",  pocetakSmjene: "02.05.2026. 06:53", radnoMjesto: "Pregledač",  vrstaRada: "Tehnički pregled vlaka...",   vrijemeJavljanja: "02.05.2026. 08:44", vrijemePocetka: "02.05.2026. 08:45", vrijemeZavrsetka: "02.05.2026. 09:17", brojVlaka: "47998",   lokomotiva: "" },
  { djelatnik: "Jadanić Roberto",  domicil: "Koprivnica",  pocetakSmjene: "02.05.2026. 06:45", radnoMjesto: "Strojovođa", vrstaRada: "Razno",                       vrijemeJavljanja: "02.05.2026. 13:45", vrijemePocetka: "02.05.2026. 13:55", vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "" },
  { djelatnik: "Barulek Darko",    domicil: "Koprivnica",  pocetakSmjene: "02.05.2026. 06:15", radnoMjesto: "Strojovođa", vrstaRada: "",                           vrijemeJavljanja: "",                  vrijemePocetka: "",                   vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "" },
  { djelatnik: "Barešić Borde",    domicil: "Koprivnica",  pocetakSmjene: "02.05.2026. 06:15", radnoMjesto: "Strojovođa", vrstaRada: "Reži vožnja",                vrijemeJavljanja: "02.05.2026. 13:45", vrijemePocetka: "02.05.2026. 13:45", vrijemeZavrsetka: "02.05.2026. 14:20", brojVlaka: "981",     lokomotiva: "" },
  { djelatnik: "Vuković Tomislav", domicil: "Koprivnica",  pocetakSmjene: "02.05.2026. 05:40", radnoMjesto: "Strojovođa", vrstaRada: "Vožnja vlaka",                vrijemeJavljanja: "02.05.2026. 16:00", vrijemePocetka: "02.05.2026. 08:45", vrijemeZavrsetka: "02.05.2026. 08:52", brojVlaka: "69700",   lokomotiva: "6193-087" },
  { djelatnik: "Račan Marlin",     domicil: "Koprivnica",  pocetakSmjene: "02.05.2026. 04:01", radnoMjesto: "Strojovođa", vrstaRada: "Reži vožnja",                vrijemeJavljanja: "02.05.2026. 08:43", vrijemePocetka: "02.05.2026. 08:20", vrijemeZavrsetka: "02.05.2026. 08:40", brojVlaka: "ZG4874JH",lokomotiva: "" },
  { djelatnik: "Grahovac Božidar", domicil: "Koprivnica",  pocetakSmjene: "01.05.2026. 06:49", radnoMjesto: "Vlakovođa",  vrstaRada: "",                           vrijemeJavljanja: "",                  vrijemePocetka: "",                   vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "" },
  { djelatnik: "Pehnec Zvjezdan",  domicil: "Koprivnica",  pocetakSmjene: "30.04.2026. 07:07", radnoMjesto: "Vlakovođa",  vrstaRada: "",                           vrijemeJavljanja: "",                  vrijemePocetka: "",                   vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "" },
  { djelatnik: "Blažotić Luka",    domicil: "Koprivnica",  pocetakSmjene: "25.04.2026. 19:18", radnoMjesto: "Pregledač",  vrstaRada: "",                           vrijemeJavljanja: "",                  vrijemePocetka: "",                   vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "" },
  // Kutina (1)
  { djelatnik: "Malivuk Neven",    domicil: "Kutina",      pocetakSmjene: "02.05.2026. 07:52", radnoMjesto: "Pregledač",  vrstaRada: "Potpuna proba kočenja...",    vrijemeJavljanja: "02.05.2026. 10:35", vrijemePocetka: "02.05.2026. 10:35", vrijemeZavrsetka: "02.05.2026. 11:07", brojVlaka: "81224",   lokomotiva: "" },
  // Zagreb (8)
  { djelatnik: "Horvat Damir",     domicil: "Zagreb",      pocetakSmjene: "02.05.2026. 07:00", radnoMjesto: "Strojovođa", vrstaRada: "Vožnja vlaka",                vrijemeJavljanja: "02.05.2026. 09:15", vrijemePocetka: "02.05.2026. 09:20", vrijemeZavrsetka: "",                  brojVlaka: "12345",   lokomotiva: "2062-112" },
  { djelatnik: "Kovač Petar",      domicil: "Zagreb",      pocetakSmjene: "02.05.2026. 07:00", radnoMjesto: "Strojovođa", vrstaRada: "Reži vožnja",                vrijemeJavljanja: "02.05.2026. 08:50", vrijemePocetka: "02.05.2026. 08:55", vrijemeZavrsetka: "02.05.2026. 09:40", brojVlaka: "87001",   lokomotiva: "" },
  { djelatnik: "Marić Stjepan",    domicil: "Zagreb",      pocetakSmjene: "02.05.2026. 06:30", radnoMjesto: "Strojovođa", vrstaRada: "Vožnja vlaka",                vrijemeJavljanja: "02.05.2026. 07:45", vrijemePocetka: "02.05.2026. 07:50", vrijemeZavrsetka: "",                  brojVlaka: "23456",   lokomotiva: "1141-205" },
  { djelatnik: "Jurić Tomislav",   domicil: "Zagreb",      pocetakSmjene: "02.05.2026. 06:00", radnoMjesto: "Strojovođa", vrstaRada: "",                           vrijemeJavljanja: "",                  vrijemePocetka: "",                   vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "" },
  { djelatnik: "Babić Ante",       domicil: "Zagreb",      pocetakSmjene: "02.05.2026. 05:45", radnoMjesto: "Vlakovođa",  vrstaRada: "Formiranje vlaka",            vrijemeJavljanja: "02.05.2026. 06:30", vrijemePocetka: "02.05.2026. 06:35", vrijemeZavrsetka: "02.05.2026. 07:10", brojVlaka: "34567",   lokomotiva: "" },
  { djelatnik: "Novak Franjo",     domicil: "Zagreb",      pocetakSmjene: "02.05.2026. 05:00", radnoMjesto: "Strojovođa", vrstaRada: "Vožnja vlaka",                vrijemeJavljanja: "02.05.2026. 06:00", vrijemePocetka: "02.05.2026. 06:05", vrijemeZavrsetka: "",                  brojVlaka: "45678",   lokomotiva: "6193-333" },
  { djelatnik: "Petrović Vladimir",domicil: "Zagreb",      pocetakSmjene: "02.05.2026. 04:30", radnoMjesto: "Strojovođa", vrstaRada: "Reži vožnja",                vrijemeJavljanja: "02.05.2026. 05:10", vrijemePocetka: "02.05.2026. 05:15", vrijemeZavrsetka: "02.05.2026. 05:55", brojVlaka: "56789",   lokomotiva: "" },
  { djelatnik: "Lukavec Ruben",    domicil: "Zagreb",      pocetakSmjene: "02.05.2026. 04:00", radnoMjesto: "Pregledač",  vrstaRada: "Tehnički pregled vlaka...",   vrijemeJavljanja: "02.05.2026. 04:45", vrijemePocetka: "02.05.2026. 04:50", vrijemeZavrsetka: "02.05.2026. 05:20", brojVlaka: "67890",   lokomotiva: "" },
  // Rijeka (5)
  { djelatnik: "Salopek Milan",    domicil: "Rijeka",      pocetakSmjene: "02.05.2026. 08:00", radnoMjesto: "Strojovođa", vrstaRada: "Vožnja vlaka",                vrijemeJavljanja: "02.05.2026. 10:00", vrijemePocetka: "02.05.2026. 10:05", vrijemeZavrsetka: "",                  brojVlaka: "78901",   lokomotiva: "2132-045" },
  { djelatnik: "Karan Nedeljko",   domicil: "Rijeka",      pocetakSmjene: "02.05.2026. 07:30", radnoMjesto: "Strojovođa", vrstaRada: "Vožnja vlaka",                vrijemeJavljanja: "02.05.2026. 09:30", vrijemePocetka: "02.05.2026. 09:35", vrijemeZavrsetka: "",                  brojVlaka: "89012",   lokomotiva: "1143-078" },
  { djelatnik: "Pezić Ivan",       domicil: "Rijeka",      pocetakSmjene: "02.05.2026. 07:00", radnoMjesto: "Strojovođa", vrstaRada: "Priprema",                   vrijemeJavljanja: "02.05.2026. 07:10", vrijemePocetka: "02.05.2026. 07:15", vrijemeZavrsetka: "02.05.2026. 07:50", brojVlaka: "",        lokomotiva: "" },
  { djelatnik: "Rajković Ivan",    domicil: "Rijeka",      pocetakSmjene: "02.05.2026. 06:45", radnoMjesto: "Vlakovođa",  vrstaRada: "Manevriranje",               vrijemeJavljanja: "02.05.2026. 08:20", vrijemePocetka: "02.05.2026. 08:25", vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "1142-210" },
  { djelatnik: "Stanišić Željko",  domicil: "Rijeka",      pocetakSmjene: "02.05.2026. 06:00", radnoMjesto: "Strojovođa", vrstaRada: "",                           vrijemeJavljanja: "",                  vrijemePocetka: "",                   vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "" },
  // Osijek (4)
  { djelatnik: "Bobek Kazimir",    domicil: "Osijek",      pocetakSmjene: "02.05.2026. 07:00", radnoMjesto: "Strojovođa", vrstaRada: "Vožnja vlaka",                vrijemeJavljanja: "02.05.2026. 09:00", vrijemePocetka: "02.05.2026. 09:05", vrijemeZavrsetka: "",                  brojVlaka: "90123",   lokomotiva: "2062-301" },
  { djelatnik: "Bilić Tomislav",   domicil: "Osijek",      pocetakSmjene: "02.05.2026. 06:30", radnoMjesto: "Strojovođa", vrstaRada: "Reži vožnja",                vrijemeJavljanja: "02.05.2026. 08:00", vrijemePocetka: "02.05.2026. 08:05", vrijemeZavrsetka: "02.05.2026. 08:55", brojVlaka: "01234",   lokomotiva: "" },
  { djelatnik: "Sabolović Tomo",   domicil: "Osijek",      pocetakSmjene: "02.05.2026. 06:00", radnoMjesto: "Vlakovođa",  vrstaRada: "Formiranje vlaka",            vrijemeJavljanja: "02.05.2026. 07:00", vrijemePocetka: "02.05.2026. 07:05", vrijemeZavrsetka: "02.05.2026. 07:45", brojVlaka: "11235",   lokomotiva: "" },
  { djelatnik: "Čembić Tomislav",  domicil: "Osijek",      pocetakSmjene: "02.05.2026. 05:30", radnoMjesto: "Strojovođa", vrstaRada: "",                           vrijemeJavljanja: "",                  vrijemePocetka: "",                   vrijemeZavrsetka: "",                  brojVlaka: "",        lokomotiva: "" },
];

window.RAILOPS_DATA = {
  I18N, MODULES_HR, NAV_GROUPS, STATUS_DEFS,
  WORK_TYPES_HR, WORK_TYPES_EN, DRIVERS, ROUTES, SERIES,
  INSPECTORS, INSPECTOR_WORK_TYPES_HR, INSPECTOR_WORK_TYPES_EN, INSPECTOR_STATIONS,
  TASKS: genTasks(7),
  INSPECTOR_TASKS: genInspectorTasks(11),
  NA_SMJENI: NA_SMJENI_RAW,
};
