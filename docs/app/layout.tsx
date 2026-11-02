import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Provider } from "@/components/provider";
import { siteDescription, siteName, siteUrl } from "@/lib/shared";
import "./global.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "gallery: an accessible React lightbox with zoom and grids",
    template: "%s | gallery, a React lightbox",
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
