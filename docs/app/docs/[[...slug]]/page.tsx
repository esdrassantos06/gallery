import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { SiteFooter } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { getMDXComponents } from "@/components/mdx";
import { repoUrl, siteName, siteUrl } from "@/lib/shared";
import { source } from "@/lib/source";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: Props) {
  const page = source.getPage((await params).slug);
  if (!page) notFound();
  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full} footer={{ children: <SiteFooter /> }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: page.data.title,
          description: page.data.description,
          url: `${siteUrl}${page.url}`,
          inLanguage: "en",
          isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl },
          about: { "@type": "SoftwareSourceCode", name: "liftbox" },
        }}
      />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </DocsBody>
      <a
        href={`${repoUrl}/blob/main/docs/content/docs/${page.path}`}
        className="text-fd-muted-foreground hover:text-fd-foreground w-fit text-sm underline-offset-4 hover:underline"
      >
        Edit this page on GitHub
      </a>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = source.getPage((await params).slug);
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
    openGraph: {
      type: "article",
      siteName,
      url: page.url,
      title: `${page.data.title} | ${siteName}`,
      description: page.data.description,
      images: "/opengraph-image",
    },
    twitter: { card: "summary_large_image", images: "/opengraph-image" },
  };
}
