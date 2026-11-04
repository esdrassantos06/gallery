import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";
import { CookieBanner } from "@/components/consent";
import { Provider } from "@/components/provider";
import { gtmId, siteDescription, siteName, siteUrl } from "@/lib/shared";
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

/**
 * Google Consent Mode defaults, set before any tag can load: everything denied
 * until the visitor accepts in the cookie banner.
 */
const consentDefaults = `window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:"denied"});`;

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
      {gtmId ? (
        <head>
          <script dangerouslySetInnerHTML={{ __html: consentDefaults }} />
        </head>
      ) : null}
      <body className="flex min-h-screen flex-col">
        <Provider>
          {children}
          <CookieBanner />
        </Provider>
      </body>
    </html>
  );
}
