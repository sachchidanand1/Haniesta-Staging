type IconProps = {className?: string};

function IconShell({children, className}: {children: React.ReactNode; className?: string}) {
  return (
    <div
      className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[#F5EDD8] ${className ?? ''}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4 text-[#8B6914]"
        aria-hidden
      >
        {children}
      </svg>
    </div>
  );
}

const icons: Record<string, (p: IconProps) => JSX.Element> = {
  about: () => (
    <IconShell>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </IconShell>
  ),
  collections: () => (
    <IconShell>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </IconShell>
  ),
  pets: () => (
    <IconShell>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </IconShell>
  ),
  materials: () => (
    <IconShell>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </IconShell>
  ),
  sizing: () => (
    <IconShell>
      <path d="M2 12h20M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
    </IconShell>
  ),
  care: () => (
    <IconShell>
      <path d="M12 22a10 10 0 0 1-6.17-17.9C7.25 3.09 9 2 12 2s4.75 1.09 6.17 2.1A10 10 0 0 1 12 22z" />
    </IconShell>
  ),
  orders: () => (
    <IconShell>
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </IconShell>
  ),
  returns: () => (
    <IconShell>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </IconShell>
  ),
  sustainability: () => (
    <IconShell>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </IconShell>
  ),
  styling: () => (
    <IconShell>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <rect x="9" y="14" width="6" height="8" rx="1" />
    </IconShell>
  ),
  trade: () => (
    <IconShell>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </IconShell>
  ),
};

export function FaqSectionIcon({sectionId}: {sectionId: string}) {
  const Icon = icons[sectionId] ?? icons.about;
  return <Icon />;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-2.5 w-2.5" aria-hidden>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function FaqExpandIcon({open}: {open: boolean}) {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[rgba(26,23,20,0.18)] bg-white transition-all duration-200 ${
        open ? 'border-[#C8A96E] bg-[#F5EDD8]' : ''
      }`}
    >
      <span className={`text-[#8a8480] transition-transform duration-200 ${open ? 'rotate-45 text-[#8B6914]' : ''}`}>
        <PlusIcon />
      </span>
    </span>
  );
}
