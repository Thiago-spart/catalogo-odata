export function Monogram({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" className="shrink-0">
      <rect width="64" height="64" rx="14" fill="#1f5a3f" />
      <g transform="translate(-2 1.5)" fill="none" stroke="#f3f5f0" strokeWidth="5.5" strokeLinecap="square" strokeLinejoin="round">
        <path d="M19 13 V39 a6 6 0 0 0 6 6 H28" />
        <path d="M12 23 H28" />
        <path d="M47.5 23 H38.75 a5.5 5.5 0 0 0 0 11 h2.5 a5.5 5.5 0 0 1 0 11 H32.5" />
      </g>
      <rect x="48.5" y="43.75" width="6" height="5.5" rx="1" fill="#f4a340" />
    </svg>
  );
}
