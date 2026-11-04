/** The flight mark: a thumbnail flying out into a full frame. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" className="fill-fd-foreground" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-fd-background">
        <path d="M11 42 25 12M22 53 53 40" strokeWidth="1.5" strokeOpacity=".5" />
        <rect x="25" y="12" width="28" height="28" rx="3" strokeWidth="3" />
      </g>
      <rect x="11" y="42" width="11" height="11" rx="2" className="fill-fd-background" />
    </svg>
  );
}

/** The mark with the package name, for the navigation bar. */
export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="size-7" />
      <span className="text-[1.0625rem] font-[650] tracking-[-0.02em]">liftbox</span>
    </span>
  );
}
