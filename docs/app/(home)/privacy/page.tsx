import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal";
import { contactEmail, gtmId } from "@/lib/shared";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What personal data liftbox.digital processes, why, who processes it with us, how long it is kept and how to use your rights.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="4 November 2026">
      <p>
        This policy covers liftbox.digital, the documentation site of the liftbox React library. The
        library itself runs in your own app and sends nothing anywhere; this page is only about the
        site.
      </p>

      <h2>Who is responsible</h2>
      <p>
        Esdras Santos, the maintainer of liftbox, based in Portugal, is the data controller. Write
        to <a href={`mailto:${contactEmail}`}>{contactEmail}</a> about anything on this page.
      </p>

      <h2>What the site processes</h2>
      <h3>Server logs</h3>
      <p>
        Vercel, which hosts the site, records each request: your IP address, browser and device, the
        page asked for and the time. These logs keep the site running and protect it from abuse. The
        legal basis is legitimate interest (Article 6(1)(f) GDPR), and Vercel keeps them only for
        the short period its hosting plan allows.
      </p>

      <h3>Analytics, only if you accept</h3>
      {gtmId ? (
        <>
          <p>
            If you click Accept in the cookie banner, the site loads Google Tag Manager and Google
            Analytics 4. They record the pages you view, where you came from, your browser, device
            and an approximate location. Google Analytics 4 does not store IP addresses. The purpose
            is to learn which docs people read and where they get stuck, so the docs can improve.
          </p>
          <p>
            The legal basis is your consent (Article 6(1)(a) GDPR and Article 5 of Portuguese Law
            41/2004 on electronic communications). Until you accept, Google Consent Mode keeps every
            Google storage type denied and no Google script loads at all. Advertising storage, ad
            user data and ad personalization stay denied even after you accept: the site shows no
            ads.
          </p>
          <p>
            Google Ireland Limited processes this data for the site and keeps it for 14 months.
            Google may move it to the United States under the EU-U.S. Data Privacy Framework.
          </p>
        </>
      ) : (
        <p>
          Analytics is turned off on this site right now, so nothing about your visit is measured
          beyond the server logs above.
        </p>
      )}

      <h3>Stored only in your browser</h3>
      <p>
        Your light or dark theme and your cookie choice are saved in your browser&apos;s local
        storage. They never leave your device. Search runs in your browser too, over an index
        downloaded with the site.
      </p>

      <h2>What the site does not do</h2>
      <p>
        There are no accounts, forms, newsletters or ads, and your data is never sold. Links to
        GitHub and npm take you to sites with their own privacy policies.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete your data, to restrict or object to its use, and to
        receive it in a portable format. Withdrawing consent is as easy as giving it: open the{" "}
        <Link href="/cookies">cookie policy</Link> and use Cookie settings. If you think your data
        was mishandled, you can complain to the Portuguese data protection authority, the{" "}
        <a href="https://www.cnpd.pt">CNPD</a>.
      </p>

      <h2>Changes</h2>
      <p>The date at the top changes whenever this policy does.</p>
    </LegalPage>
  );
}
