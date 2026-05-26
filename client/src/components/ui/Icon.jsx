const iconPaths = {
  ai: (
    <>
      <path d="M12 3l1.2 3.4L16.5 8l-3.3 1.4L12 13l-1.2-3.6L7.5 8l3.3-1.6L12 3Z" />
      <path d="M18 13l.7 1.9L20.5 16l-1.8.8L18 19l-.7-2.2-1.8-.8 1.8-1.1L18 13Z" />
      <path d="M5.5 12l.6 1.7L7.8 14l-1.7.7-.6 1.8-.6-1.8L3.2 14l1.7-.3.6-1.7Z" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  balance: (
    <>
      <path d="M12 4v16" />
      <path d="M6 7h12" />
      <path d="M7 7l-3 6h6L7 7Z" />
      <path d="M17 7l-3 6h6l-3-6Z" />
    </>
  ),
  budget: (
    <>
      <path d="M4 7.5A3.5 3.5 0 0 1 7.5 4H12v7h8v5.5A3.5 3.5 0 0 1 16.5 20h-9A3.5 3.5 0 0 1 4 16.5v-9Z" />
      <path d="M14 4.4A8 8 0 0 1 19.6 10H14V4.4Z" />
    </>
  ),
  calendar: (
    <>
      <path d="M7 3v3" />
      <path d="M17 3v3" />
      <path d="M4.5 8h15" />
      <path d="M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5Z" />
    </>
  ),
  card: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="M4 10h16" />
      <path d="M7 15h4" />
    </>
  ),
  chart: (
    <>
      <path d="M5 19V9" />
      <path d="M12 19V5" />
      <path d="M19 19v-7" />
      <path d="M4 19h16" />
    </>
  ),
  check: (
    <>
      <path d="M20 6L9 17l-5-5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  dashboard: (
    <>
      <rect width="7" height="7" x="4" y="4" rx="1.5" />
      <rect width="7" height="7" x="13" y="4" rx="1.5" />
      <rect width="7" height="7" x="4" y="13" rx="1.5" />
      <rect width="7" height="7" x="13" y="13" rx="1.5" />
    </>
  ),
  expense: (
    <>
      <path d="M7 17L17 7" />
      <path d="M9 7h8v8" />
      <path d="M5 19h14" />
    </>
  ),
  form: (
    <>
      <path d="M6.5 4h8L18 7.5v10A2.5 2.5 0 0 1 15.5 20h-9A2.5 2.5 0 0 1 4 17.5v-11A2.5 2.5 0 0 1 6.5 4Z" />
      <path d="M14 4v4h4" />
      <path d="M8 13h8" />
      <path d="M8 16h5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a14.5 14.5 0 0 1-2.4 3.1" />
      <path d="M6.1 6.8A14.5 14.5 0 0 0 2.5 12s3.5 6 9.5 6c1.5 0 2.8-.4 4-1" />
      <path d="M10.3 10.3a2.5 2.5 0 0 0 3.4 3.4" />
    </>
  ),
  income: (
    <>
      <path d="M17 7L7 17" />
      <path d="M15 17H7V9" />
      <path d="M5 19h14" />
    </>
  ),
  investment: (
    <>
      <path d="M4 17l5-5 3 3 7-8" />
      <path d="M15 7h4v4" />
      <path d="M4 20h16" />
    </>
  ),
  lock: (
    <>
      <rect width="14" height="10" x="5" y="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v2" />
    </>
  ),
  mail: (
    <>
      <path d="M5.5 6h13A2.5 2.5 0 0 1 21 8.5v7A2.5 2.5 0 0 1 18.5 18h-13A2.5 2.5 0 0 1 3 15.5v-7A2.5 2.5 0 0 1 5.5 6Z" />
      <path d="M4 8l8 5 8-5" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4l10-10-4-4L4 16v4Z" />
      <path d="M13 6l4 4" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2L6 21V3Z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  repeat: (
    <>
      <path d="M17 4l3 3-3 3" />
      <path d="M4 11V9a2 2 0 0 1 2-2h14" />
      <path d="M7 20l-3-3 3-3" />
      <path d="M20 13v2a2 2 0 0 1-2 2H4" />
    </>
  ),
  save: (
    <>
      <path d="M6.5 4h9L19 7.5v10A2.5 2.5 0 0 1 16.5 20h-9A2.5 2.5 0 0 1 5 17.5v-11A2.5 2.5 0 0 1 6.5 4Z" />
      <path d="M8 4v6h8V4" />
      <path d="M9 20v-5h6v5" />
    </>
  ),
  subscription: (
    <>
      <rect width="14" height="12" x="5" y="6" rx="3" />
      <path d="M9 3h6" />
      <path d="M9 10h6" />
      <path d="M9 14h4" />
    </>
  ),
  tag: (
    <>
      <path d="M4.5 12.5V5.5h7L20 14l-6 6-9.5-7.5Z" />
      <circle cx="8.5" cy="8.5" r="1" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 8v4l2.5 2.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  wallet: (
    <>
      <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9Z" />
      <path d="M16 12h3" />
      <path d="M8 8h5" />
    </>
  ),
};

function Icon({ name, className = "", size = 18, strokeWidth = 1.8 }) {
  return (
    <svg
      aria-hidden="true"
      className={className ? `icon ${className}` : "icon"}
      fill="none"
      focusable="false"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
    >
      {iconPaths[name] ?? iconPaths.dashboard}
    </svg>
  );
}

export default Icon;
