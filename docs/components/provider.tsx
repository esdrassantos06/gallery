"use client";
import { CSPProvider } from "@base-ui/react/csp-provider";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import SearchDialog from "@/components/search";

/**
 * Fumadocs context with the static Orama search dialog. `nonce` lets the theme
 * script and Base UI's scripts run under the Content Security Policy set in
 * `proxy.ts`. Base UI's one style tag is replaced by the same rule in `global.css`,
 * because React does not pass the nonce on to hoisted style tags.
 */
export function Provider({ children, nonce }: { children: ReactNode; nonce?: string | undefined }) {
  return (
    <CSPProvider nonce={nonce} disableStyleElements>
      <RootProvider
        search={{ SearchDialog }}
        theme={{ disableTransitionOnChange: false, ...(nonce ? { nonce } : {}) }}
      >
        {children}
      </RootProvider>
    </CSPProvider>
  );
}
