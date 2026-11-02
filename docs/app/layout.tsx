import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Provider } from "@/components/provider";
import "./global.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gallery-esdrassantos06.vercel.app"),
  title: { default: "gallery, an accessible React lightbox", template: "%s | gallery" },
  description:
    "Accessible React lightbox with zoom, thumbnails, video, slideshow and deep links. Zero runtime dependencies, themeable with CSS variables.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
