"use client";
import { useId, type ReactNode } from "react";

/** A labelled switch built on a native checkbox. */
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 text-sm">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="bg-fd-accent checked:bg-fd-primary before:bg-fd-background relative h-6 w-10 shrink-0 cursor-pointer appearance-none rounded-full transition-colors before:absolute before:top-1 before:left-1 before:size-4 before:rounded-full before:transition-transform checked:before:translate-x-4 motion-reduce:transition-none motion-reduce:before:transition-none"
      />
    </div>
  );
}

/** A labelled native range input with its current value. */
export function Range({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2 py-2 text-sm">
      <div className="flex items-center justify-between">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="text-fd-muted-foreground font-mono text-xs tabular-nums">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-fd-primary h-6 w-full cursor-pointer"
      />
    </div>
  );
}

/** A row of native radio buttons styled as a segmented control. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <label
          key={option}
          className="has-checked:border-fd-foreground flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm capitalize"
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="accent-fd-primary"
          />
          {option}
        </label>
      ))}
    </div>
  );
}

/** A titled group of controls. */
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-fd-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}
