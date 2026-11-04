import { type NextRequest, NextResponse } from "next/server";
import { gtmId } from "@/lib/shared";

/** Google Tag Manager, Google Analytics 4 and the GTM Preview badge, allowed only with a container ID. */
const google = gtmId
  ? {
      connect:
        " https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
      img: " https://*.google-analytics.com https://*.googletagmanager.com https://fonts.gstatic.com",
      style: " https://www.googletagmanager.com https://fonts.googleapis.com",
      font: " https://fonts.gstatic.com",
    }
  : { connect: "", img: "", style: "", font: "" };

/** The Content Security Policy for one response, allowing only scripts and style tags that carry `nonce`. */
function contentSecurityPolicy(nonce: string, dev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // `next dev` injects CSS through style tags without a nonce, and a nonce would make browsers ignore 'unsafe-inline'.
    `style-src 'self' ${dev ? "'unsafe-inline'" : `'nonce-${nonce}'`}${google.style}`,
    // React renders `style` props as attributes, which a nonce cannot cover.
    "style-src-attr 'unsafe-inline'",
    `img-src 'self' blob: data:${google.img}`,
    "media-src 'self'",
    `font-src 'self'${google.font}`,
    "frame-src 'self'",
    `connect-src 'self'${google.connect}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** Gives every page request a fresh nonce and the policy that trusts it. */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = contentSecurityPolicy(nonce, process.env.NODE_ENV === "development");

  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|samples|videos|icon|opengraph-image|og/|sitemap.xml|robots.txt|llms).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
