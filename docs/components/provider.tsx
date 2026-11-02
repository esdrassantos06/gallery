"use client";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import SearchDialog from "@/components/search";

/**
 * Fumadocs context with the static Orama search dialog. Theme changes keep their
 * transitions, because the style tag that would pause them is blocked by the CSP.
 */
export function Provider({ children }: { children: ReactNode }) {
  return (
    <RootProvider search={{ SearchDialog }} theme={{ disableTransitionOnChange: false }}>
      {children}
    </RootProvider>
  );
}
