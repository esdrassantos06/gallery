import type { ReactNode } from "react";

/** Layout for the privacy and cookie policy pages. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <article className="prose max-w-none">
        <h1>{title}</h1>
        <p className="text-fd-muted-foreground">Last updated {updated}</p>
        {children}
      </article>
    </main>
  );
}
