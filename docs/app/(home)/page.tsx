import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { Demo } from "@/components/demo";
import { npmUrl } from "@/lib/shared";

const facts = [
  ["9.4 kB", "min + brotli, measured"],
  ["0", "runtime dependencies"],
  ["React 18 and 19", "SSR safe, App Router ready"],
  ["Screen readers", "focus trap, live region, reduced motion"],
] as const;

const features = [
  [
    "Flies from the thumbnail",
    "Opens out of the image that was clicked and lands back in it on close.",
  ],
  ["Zoom that feels native", "Wheel, trackpad and touch pinch, double tap, buttons and keys."],
  ["Video and embeds", "Native video with captions, YouTube and Vimeo without their scripts."],
  ["Slideshow", "Pauses when the user takes over, while the tab is hidden and during videos."],
  ["Deep links", "Share #gallery-3 and the back button closes the viewer."],
  ["Yours to restyle", "Every string, icon, color, size and timing can be replaced."],
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <section className="grid min-w-0 gap-10 py-12 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <h1 className="max-w-[16ch] text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-6xl">
            A lightbox that flies out of your thumbnails.
          </h1>
          <p className="text-fd-muted-foreground mt-6 max-w-[56ch] text-lg text-pretty">
            Accessible React gallery viewer with zoom, video, slideshow and deep links. It ships
            without a single runtime dependency.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="bg-fd-primary text-fd-primary-foreground inline-flex h-11 items-center rounded-lg px-5 font-medium"
            >
              Read the docs
            </Link>
            <a
              href={npmUrl}
              className="hover:bg-fd-accent inline-flex h-11 items-center rounded-lg border px-5 font-medium"
            >
              View on npm
            </a>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <CopyCommand command="npm install @esdrassantos06/gallery" />
          <dl className="bg-fd-border grid grid-cols-2 gap-px overflow-hidden rounded-xl border">
            {facts.map(([value, label]) => (
              <div key={label} className="bg-fd-card p-4">
                <dt className="text-fd-muted-foreground text-xs">{label}</dt>
                <dd className="mt-1 font-semibold tracking-tight">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="try" className="border-t py-12">
        <h2 id="try" className="text-2xl font-semibold tracking-[-0.02em]">
          Try it
        </h2>
        <p className="text-fd-muted-foreground mt-2 max-w-2xl">
          Open a photo, swipe or use the arrow keys, pinch or double click to zoom, press Escape to
          fly back.
        </p>
        <Demo count={8} rotate download slideshow />
      </section>

      <section aria-labelledby="features" className="border-t py-12">
        <h2 id="features" className="sr-only">
          Features
        </h2>
        <ul className="grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, text]) => (
            <li key={title} className="bg-fd-card p-5 outline outline-fd-border">
              <h3 className="font-semibold tracking-tight">{title}</h3>
              <p className="text-fd-muted-foreground mt-1 text-sm">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="text-fd-muted-foreground flex flex-wrap items-center justify-between gap-4 border-t py-8 text-sm">
        <span>MIT licensed. Sample images and video are generated, not real photos.</span>
        <Link href="/docs/changelog" className="hover:text-fd-foreground">
          Changelog
        </Link>
      </footer>
    </main>
  );
}
