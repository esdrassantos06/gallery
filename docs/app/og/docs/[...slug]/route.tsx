import { notFound } from "next/navigation";
import { renderCard } from "@/lib/og";
import { source } from "@/lib/source";

export const dynamic = "force-static";

/** Social preview of a docs page, at `/og/docs/<slug>/image.png`. */
export async function GET(_: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const page = source.getPage((await params).slug.slice(0, -1));
  if (!page) notFound();
  return renderCard(page.data.title, page.data.description ?? "liftbox, a React lightbox");
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: [...page.slugs, "image.png"] }));
}
