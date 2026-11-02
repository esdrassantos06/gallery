import type { ReactNode } from "react";
import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { Demo } from "@/components/demo";
import { GridsDemo } from "@/components/grids-demo";
import { JsonLd } from "@/components/json-ld";
import { PlaygroundGallery, PolishGallery, SlideshowGallery } from "@/components/home";
import size from "@/lib/generated/size.json";
import { npmUrl, repoUrl, siteDescription, siteUrl } from "@/lib/shared";

const facts = [
  [size.lightbox, "lightbox, min + brotli, measured"],
  ["0", "runtime dependencies"],
  ["React 18 and 19", "SSR safe, App Router ready"],
  ["Screen readers", "focus trap, live region, reduced motion"],
] as const;

const usage = `import { useRef } from "react";
import { Lightbox, useLightboxHash, type Slide } from "@esdrassantos06/gallery";
import "@esdrassantos06/gallery/styles.css";

export function Gallery({ slides }: { slides: Slide[] }) {
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  const [index, setIndex] = useLightboxHash("galeria", { count: slides.length });

  return (
    <>
      {slides.map((slide, i) => (
        <button
          key={slide.src}
          ref={(el) => {
            thumbnails.current[i] = el;
          }}
          onClick={() => setIndex(i)}
          aria-label={\`Open \${slide.alt}\`}
        >
          <img src={slide.thumbnail} alt="" />
        </button>
      ))}
      <Lightbox
        slides={slides}
        open={index >= 0}
        index={Math.max(index, 0)}
        onIndexChange={setIndex}
        onClose={() => setIndex(-1)}
        getThumbnail={(i) => thumbnails.current[i]}
      />
    </>
  );
}`;

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-20 border-t py-14">
      <div className="mb-6 max-w-2xl">
        <h2 id={id} className="text-2xl font-semibold tracking-[-0.02em] text-balance">
          {title}
        </h2>
        <p className="text-fd-muted-foreground mt-2 text-pretty">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: "@esdrassantos06/gallery",
          description: siteDescription,
          url: siteUrl,
          codeRepository: repoUrl,
          programmingLanguage: ["TypeScript", "React"],
          runtimePlatform: "Web browser",
          license: "https://opensource.org/licenses/MIT",
          author: { "@type": "Person", name: "Esdras Santos" },
        }}
      />
      <section className="grid min-w-0 gap-10 py-12 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <h1 className="max-w-[16ch] text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-6xl">
            A lightbox that flies out of your thumbnails.
          </h1>
          <p className="text-fd-muted-foreground mt-6 max-w-[56ch] text-lg text-pretty">
            Accessible React gallery viewer with zoom, video, slideshow, deep links, sharing and
            optional grids. Every string, icon and color is yours to replace, and it ships without a
            single runtime dependency.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="bg-fd-primary text-fd-primary-foreground inline-flex h-11 items-center rounded-lg px-5 font-medium"
            >
              Read the docs
            </Link>
            <a
              href="#demo"
              className="hover:bg-fd-accent inline-flex h-11 items-center rounded-lg border px-5 font-medium"
            >
              Try the demo
            </a>
            <a
              href={npmUrl}
              className="text-fd-muted-foreground hover:text-fd-foreground inline-flex h-11 items-center px-2 font-medium"
            >
              npm
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

      <div id="demo">
        <Section
          id="default-look"
          title="Default look"
          description="The built-in theme, driven by the options panel. The open photo is kept in the URL as #galeria-3, so you can share it, and the back button closes the viewer."
        >
          <PlaygroundGallery />
        </Section>
      </div>

      <Section
        id="customised"
        title="Customised"
        description="Portuguese labels, replaced arrow icons, a custom caption, an extra toolbar link and a brand theme set only through --eg-* variables."
      >
        <Demo count={6} preset="customised" />
      </Section>

      <Section
        id="video"
        title="Video and slideshow"
        description="A native video with captions, an iframe slide and images. Press play in the toolbar to run the slideshow. It pauses on manual navigation, while the tab is hidden and on video slides until the video ends."
      >
        <SlideshowGallery />
      </Section>

      <Section
        id="polish"
        title="Interaction polish"
        description="Flip, share and every other button: on a narrow screen the ones that do not fit move into a More menu, zoom first. Pager dots, controls that fade out when idle, right-to-left and pinch to close are each one prop."
      >
        <PolishGallery />
      </Section>

      <Section
        id="grids"
        title="Grids and filter"
        description="Justified rows, masonry columns or uniform cells, with a category filter. The grids work without the lightbox and the lightbox works without them. Here they share the filtered list, so indices always match."
      >
        <GridsDemo switcher filter />
      </Section>

      <Section
        id="usage"
        title="Usage"
        description={
          <>
            Keep the lightbox mounted next to your grid and drive it with an index. The{" "}
            <Link href="/docs/quick-start" className="text-fd-foreground underline">
              quick start
            </Link>{" "}
            walks through it.
          </>
        }
      >
        <pre className="bg-fd-foreground text-fd-background overflow-x-auto rounded-xl p-5 font-mono text-[0.8125rem] leading-relaxed">
          <code>{usage}</code>
        </pre>
      </Section>

      <footer className="text-fd-muted-foreground flex flex-wrap items-center justify-between gap-4 border-t py-8 text-sm">
        <span>MIT licensed. Sample images and video are generated, not real photos.</span>
        <span className="flex gap-4">
          <Link href="/docs/changelog" className="hover:text-fd-foreground">
            Changelog
          </Link>
          <a href={repoUrl} className="hover:text-fd-foreground">
            esdrassantos06/gallery
          </a>
        </span>
      </footer>
    </main>
  );
}
