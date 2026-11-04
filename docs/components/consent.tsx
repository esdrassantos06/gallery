"use client";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { gtmId } from "@/lib/shared";

type Choice = "granted" | "denied";

const KEY = "liftbox-consent";
const CHANGE = "liftbox:consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fallback for browsers that block storage: the choice then lasts until the page reloads. */
let memory: Choice | null = null;

function read(): Choice | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : memory;
  } catch {
    return memory;
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function save(choice: Choice | null) {
  memory = choice;
  try {
    if (choice) window.localStorage.setItem(KEY, choice);
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage is blocked; `memory` keeps the choice until the page reloads.
  }
  window.dispatchEvent(new Event(CHANGE));
}

/** Loads Google Tag Manager once, after analytics consent. */
function loadTags() {
  if (!gtmId || document.getElementById("gtm")) return;
  window.gtag?.("consent", "update", { analytics_storage: "granted" });
  window.dataLayer?.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.id = "gtm";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  document.head.append(script);
}

/** Withdraws consent: tells the loaded tags to stop and deletes the analytics cookies. */
function dropTags() {
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name?.startsWith("_ga")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

/** The visitor's analytics choice, `null` until they make one and on the server. */
export function useConsent(): Choice | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

/**
 * Cookie banner. Renders nothing without a GTM container ID, so a build
 * without analytics sets no cookies and asks nothing.
 */
export function CookieBanner() {
  const choice = useConsent();
  useEffect(() => {
    if (choice === "granted") loadTags();
  }, [choice]);
  if (!gtmId || choice !== null) return null;

  return (
    <section
      aria-label="Cookie consent"
      className="bg-fd-card text-fd-card-foreground fixed inset-x-4 bottom-4 z-50 max-w-md sm:right-auto rounded-xl border p-5 shadow-lg"
    >
      <p className="text-sm text-pretty">
        Can we use Google Analytics cookies to count visits and see which docs pages people read?
        Nothing loads until you choose, and you can change your mind on the{" "}
        <Link href="/cookies" className="underline underline-offset-4">
          cookie policy
        </Link>{" "}
        page.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => save("denied")}
          className="hover:bg-fd-accent h-10 flex-1 rounded-lg border px-4 text-sm font-medium"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => save("granted")}
          className="hover:bg-fd-accent h-10 flex-1 rounded-lg border px-4 text-sm font-medium"
        >
          Accept
        </button>
      </div>
    </section>
  );
}

/** Reopens the banner by forgetting the choice, and withdraws any consent already given. */
export function CookieSettingsButton({ className }: { className?: string }) {
  if (!gtmId) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (read() === "granted") dropTags();
        save(null);
      }}
    >
      Cookie settings
    </button>
  );
}
