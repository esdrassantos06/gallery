import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal";
import { contactEmail, repoUrl } from "@/lib/shared";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "The terms for using liftbox.digital, how the liftbox library and its docs are licensed, and the limits of what the site promises.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="4 November 2026">
      <p>
        These terms cover liftbox.digital, the documentation site of the liftbox React library.
        Using the site means you accept them. The library you install from npm has its own license,
        described below, and these terms do not change it.
      </p>

      <h2>Who runs the site</h2>
      <p>
        Esdras Santos, the maintainer of liftbox, based in Portugal. Write to{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a> with any question about these terms.
      </p>

      <h2>The library and the docs</h2>
      <p>
        liftbox, including the code samples and demos on this site, is released under the{" "}
        <a href={`${repoUrl}/blob/main/LICENSE`}>MIT License</a>. You can use, copy, modify and ship
        it in any project, commercial or not, as long as you keep the copyright and license notice.
        The text of the docs lives in the same repository under the same license.
      </p>
      <p>
        The name liftbox and the logo identify this project. Use them to refer to it, but not in a
        way that suggests the maintainer endorses your product.
      </p>

      <h2>Using the site</h2>
      <p>
        Read, link to and share the docs freely. Do not try to break, overload or get around the
        security of the site, and do not use it to attack other people or systems.
      </p>

      <h2>No warranty</h2>
      <p>
        The site and the library are provided as they are, free of charge. The maintainer works to
        keep the docs accurate and the site online, but does not promise either. The comparison with
        other libraries reflects their published versions on the date it gives; check the sources
        before relying on it.
      </p>

      <h2>Liability</h2>
      <p>
        As far as the law allows, the maintainer is not liable for losses that come from using the
        site or the library. This does not limit liability for intent or gross negligence, or any
        right you have that the law does not let a contract take away.
      </p>

      <h2>Other sites</h2>
      <p>
        Links to GitHub, npm and other sites lead to services with their own terms. The maintainer
        does not control them.
      </p>

      <h2>Privacy and cookies</h2>
      <p>
        The <Link href="/privacy">privacy policy</Link> and the{" "}
        <Link href="/cookies">cookie policy</Link> explain what data the site processes and how to
        change your cookie choice.
      </p>

      <h2>Law</h2>
      <p>
        Portuguese law governs these terms. If you use the site as a consumer, you keep the
        protection of the mandatory rules of the country where you live.
      </p>

      <h2>Changes</h2>
      <p>The date at the top changes whenever these terms do.</p>
    </LegalPage>
  );
}
