"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

/** A shell command with a copy button. */
export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-fd-card flex min-h-12 items-center gap-2 rounded-lg border py-1 pr-1 pl-4 font-mono text-sm">
      <span className="text-fd-muted-foreground select-none" aria-hidden="true">
        $
      </span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">{command}</code>
      <button
        type="button"
        className="hover:bg-fd-accent inline-flex size-10 items-center justify-center rounded-md"
        aria-label={copied ? "Copied" : "Copy install command"}
        onClick={() => {
          void navigator.clipboard?.writeText(command).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          });
        }}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}
