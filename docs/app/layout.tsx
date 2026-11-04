import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";
import { Provider } from "@/components/provider";
import { siteDescription, siteName, siteUrl } from "@/lib/shared";
import "./global.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "liftbox: an accessible React lightbox with zoom and grids",
    template: "%s | liftbox, a React lightbox",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "React lightbox",
    "React image gallery",
    "accessible lightbox",
    "Next.js lightbox",
    "masonry grid",
    "justified grid",
    "image zoom",
    "photo viewer",
  ],
  authors: [{ name: "Esdras Santos", url: "https://github.com/esdrassantos06" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName,
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

/** Geist Mono without a preload: it only styles code, so it should not compete with the hero text. */
const GeistMono = localFont({
  src: "../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  preload: false,
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
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
