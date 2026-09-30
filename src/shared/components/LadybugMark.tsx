type LadybugMarkProps = {
  size?: number;
};

export function LadybugMark({ size = 22 }: LadybugMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <ellipse cx="16" cy="18.25" rx="9.25" ry="10" fill="currentColor" />
      <circle cx="16" cy="8.75" r="4.25" fill="var(--color-ink-soft)" />
      <path d="M16 12.5v13.25" stroke="var(--color-canvas)" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="16.75" r="1.9" fill="var(--color-canvas)" />
      <circle cx="20" cy="20.75" r="1.9" fill="var(--color-canvas)" />
    </svg>
  );
}
