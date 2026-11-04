/** The flight mark: a thumbnail flying out into a full frame. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" className="fill-fd-foreground" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-fd-background">
        <rect
          x="17.8"
          y="25.8"
          width="20.5"
          height="20.5"
          rx="2.5"
          strokeWidth="2.5"
          strokeOpacity=".38"
        />
        <rect x="25" y="11" width="28" height="28" rx="3.4" strokeWidth="3.5" />
      </g>
      <rect x="10.5" y="40.5" width="13" height="13" rx="2" className="fill-fd-background" />
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
