// Inline SVG icons — minimal, 1.5px stroke, 16px default
const Icon = ({ name, size = 16, className = "", style = {} }) => {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    style,
  };
  switch (name) {
    case "search":
      return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "filter":
      return <svg {...props}><path d="M3 5h18M6 12h12M10 19h4"/></svg>;
    case "plus":
      return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case "copy":
      return <svg {...props}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>;
    case "chevron-down":
      return <svg {...props}><path d="m6 9 6 6 6-6"/></svg>;
    case "chevron-right":
      return <svg {...props}><path d="m9 6 6 6-6 6"/></svg>;
    case "chevron-left":
      return <svg {...props}><path d="m15 6-6 6 6 6"/></svg>;
    case "chevrons-left":
      return <svg {...props}><path d="m11 17-5-5 5-5M18 17l-5-5 5-5"/></svg>;
    case "chevrons-right":
      return <svg {...props}><path d="m13 17 5-5-5-5M6 17l5-5-5-5"/></svg>;
    case "x":
      return <svg {...props}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    case "check":
      return <svg {...props}><path d="M5 12.5 10 17l9-10"/></svg>;
    case "save":
      return <svg {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-7H7v7M7 3v5h8"/></svg>;
    case "trash":
      return <svg {...props}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg>;
    case "user":
      return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case "users":
      return <svg {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "train":
      return <svg {...props}><rect x="4" y="4" width="16" height="13" rx="3"/><path d="M4 11h16M9 17l-2 4M15 17l2 4"/><circle cx="9" cy="14" r="0.5" fill="currentColor"/><circle cx="15" cy="14" r="0.5" fill="currentColor"/></svg>;
    case "wagon":
      return <svg {...props}><rect x="2" y="7" width="20" height="9" rx="1.5"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/><path d="M2 12h20"/></svg>;
    case "calendar":
      return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case "clock":
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "map":
      return <svg {...props}><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14"/></svg>;
    case "settings":
      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>;
    case "wrench":
      return <svg {...props}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5 2.5-2.5Z"/></svg>;
    case "shield":
      return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>;
    case "chart":
      return <svg {...props}><path d="M3 3v18h18"/><path d="m7 14 4-4 4 3 5-7"/></svg>;
    case "wallet":
      return <svg {...props}><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 14h2"/></svg>;
    case "gps":
      return <svg {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/></svg>;
    case "briefcase":
      return <svg {...props}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>;
    case "clipboard":
      return <svg {...props}><rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
    case "list":
      return <svg {...props}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
    case "tag":
      return <svg {...props}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z"/><circle cx="7" cy="7" r="1"/></svg>;
    case "alert":
      return <svg {...props}><path d="M12 2 2 20h20L12 2zM12 9v5M12 18h.01"/></svg>;
    case "info":
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>;
    case "send":
      return <svg {...props}><path d="m22 2-7 20-4-9-9-4 20-7Z"/></svg>;
    case "paperclip":
      return <svg {...props}><path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/></svg>;
    case "history":
      return <svg {...props}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>;
    case "edit":
      return <svg {...props}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>;
    case "more":
      return <svg {...props}><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/></svg>;
    case "drag":
      return <svg {...props}><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></svg>;
    case "globe":
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
    case "bell":
      return <svg {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
    case "sun":
      return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
    case "moon":
      return <svg {...props}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>;
    case "download":
      return <svg {...props}><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>;
    case "expand":
      return <svg {...props}><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"/></svg>;
    case "maximize":
      return <svg {...props}><path d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6"/></svg>;
    case "map-pin":
      return <svg {...props}><path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case "minimize":
      return <svg {...props}><path d="M9 3v6H3M21 9h-6V3M9 21v-6H3M15 21v-6h6"/></svg>;
    case "file":
      return <svg {...props}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"/><path d="M14 3v6h6M9 13h6M9 17h6"/></svg>;
    case "package":
      return <svg {...props}><path d="m7.5 4.27 9 5.15M21 8 12 13 3 8M21 8v8a2 2 0 0 1-1 1.73L13 21a2 2 0 0 1-2 0L4 17.73A2 2 0 0 1 3 16V8M12 22V13"/></svg>;
    case "logo":
      // Original mark — abstract rail "RO" monogram with a track underneath
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <rect x="2" y="2" width="28" height="28" rx="7" fill="var(--accent)"/>
          <path d="M9 10h5.5a3 3 0 0 1 0 6H11l4 6H12l-4-6V10Zm2 2v3h3.5a1.5 1.5 0 0 0 0-3H11Z" fill="white"/>
          <circle cx="22" cy="13" r="3.5" stroke="white" strokeWidth="1.8" fill="none"/>
          <path d="M5 25h22M7 27.5h2M11 27.5h2M15 27.5h2M19 27.5h2M23 27.5h2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );
    default:
      return null;
  }
};

const MODULE_ICONS = {
  tehnologija: "briefcase",
  gpsNadzor: "gps",
  komercijala: "tag",
  kontrola: "shield",
  postavke: "settings",
  odrzavanje: "wrench",
  sigurnost: "alert",
  kontrolaPrihoda: "wallet",
  analitika: "chart",
};

const NAV_ICONS = {
  strojovode: "user",
  pregledaci: "wagon",
  vlakovode: "users",
  transportniKomercijalisti: "briefcase",
  naSmjeni: "clock",
  se2se4: "clipboard",
  popisVlaka: "list",
  ponudeTeh: "tag",
  prijevoznaOgr: "alert",
  raspored: "calendar",
  brzojavke: "send",
  lokomotive: "train",
  ve46: "clipboard",
  k102: "clipboard",
  dispozicije: "list",
  tv35: "clipboard",
  tarife: "wallet",
  ptu: "shield",
};

Object.assign(window, { Icon, MODULE_ICONS, NAV_ICONS });
