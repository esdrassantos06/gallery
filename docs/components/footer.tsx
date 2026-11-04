import Link from "next/link";
import { CookieSettingsButton } from "@/components/consent";
import { repoUrl } from "@/lib/shared";

/** Site footer with the license note, the legal links and the cookie settings button. */
export function SiteFooter() {
  return (
    <footer className="text-fd-muted-foreground flex flex-wrap items-center justify-between gap-4 border-t py-8 text-sm">
      <span>MIT licensed. Sample images and video are generated, not real photos.</span>
      <span className="flex flex-wrap gap-4">
        <Link href="/docs/changelog" className="hover:text-fd-foreground">
          Changelog
        </Link>
        <Link href="/privacy" className="hover:text-fd-foreground">
          Privacy
        </Link>
        <Link href="/cookies" className="hover:text-fd-foreground">
          Cookies
        </Link>
        <CookieSettingsButton className="hover:text-fd-foreground" />
        <a href={repoUrl} className="hover:text-fd-foreground">
          esdrassantos06/liftbox
        </a>
      </span>
    </footer>
  );
}
