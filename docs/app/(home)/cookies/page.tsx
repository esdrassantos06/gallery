import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/consent";
import { LegalPage } from "@/components/legal";
import { gtmId } from "@/lib/shared";

export const metadata: Metadata = {
  title: "Cookie policy",
  description:
    "Every cookie and browser storage key liftbox.digital uses, what each is for, how long it lasts and how to change your choice.",
  alternates: { canonical: "/cookies" },
};

const rows = [
  ...(gtmId
    ? [
        [
          "_ga",
          "Google Analytics",
          "Tells one visitor apart from another",
          "2 years",
          "Analytics, after consent",
        ],
        [
          "_ga_<ID>",
          "Google Analytics",
          "Keeps the state of the current visit",
          "2 years",
          "Analytics, after consent",
        ],
      ]
    : []),
  [
    "liftbox-consent",
    "This site, local storage",
    "Remembers your cookie choice",
    "Until you clear it",
    "Strictly necessary",
  ],
  [
    "theme",
    "This site, local storage",
    "Remembers light or dark mode",
    "Until you clear it",
    "Functional",
  ],
];

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie policy" updated="4 November 2026">
      <p>
        {gtmId
          ? "liftbox.digital sets analytics cookies only after you accept them in the banner. Everything else lives in your browser's local storage and never reaches a server."
          : "Analytics is turned off on this site right now, so it sets no cookies. The two keys below live in your browser's local storage and never reach a server."}
      </p>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Set by</th>
            <th>Purpose</th>
            <th>Lasts</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, ...cells]) => (
            <tr key={name}>
              <td>
                <code>{name}</code>
              </td>
              {cells.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {gtmId ? (
        <>
          <h2>Change your choice</h2>
          <p>
            Reopen the banner at any time. If you had accepted, this also deletes the Google
            Analytics cookies and tells Google&apos;s tags to stop.
          </p>
          <p>
            <CookieSettingsButton className="hover:bg-fd-accent h-10 rounded-lg border px-4 text-sm font-medium" />
          </p>
        </>
      ) : null}

      <h2>Browser controls</h2>
      <p>
        Every browser can block or delete cookies and site data in its settings. Blocking them does
        not break anything on this site.
      </p>

      <p>
        The <Link href="/privacy">privacy policy</Link> explains who processes analytics data and
        how to use your rights.
      </p>
    </LegalPage>
  );
}
