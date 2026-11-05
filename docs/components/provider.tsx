"use client";
import { CSPProvider } from "@base-ui/react/csp-provider";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import SearchDialog from "@/components/search";

/**
 * Fumadocs context with the static Orama search dialog. Base UI's one style tag is
 * turned off because the same rule already lives in `global.css`.
 */
export function Provider({ children }: { children: ReactNode }) {
  return (
    <CSPProvider disableStyleElements>
      <RootProvider search={{ SearchDialog }} theme={{ disableTransitionOnChange: false }}>
        {children}
      </RootProvider>
    </CSPProvider>
  );
}
