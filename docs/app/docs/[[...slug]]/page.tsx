import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { SiteFooter } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { getMDXComponents } from "@/components/mdx";
import { authorName, authorUrl, repoUrl, siteName, siteUrl } from "@/lib/shared";
import { pageImage, source } from "@/lib/source";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: Props) {
  const page = source.getPage((await params).slug);
  if (!page) notFound();
  const MDX = page.data.body;
  const url = `${siteUrl}${page.url}`;
  const breadcrumbs: [string, string][] = [
    ["Home", `${siteUrl}/`],
    ["Docs", `${siteUrl}/docs`],
    ...(page.url === "/docs" ? [] : [[page.data.title, url] as [string, string]]),
  ];

  return (
    <DocsPage toc={page.data.toc} full={page.data.full} footer={{ children: <SiteFooter /> }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "TechArticle",
              headline: page.data.seoTitle ?? page.data.title,
              description: page.data.description,
              url,
              image: `${siteUrl}${pageImage(page)}`,
              inLanguage: "en",
              ...(page.data.lastModified && {
                dateModified: page.data.lastModified.toISOString(),
              }),
              author: { "@type": "Person", name: authorName, url: authorUrl },
              isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl },
              about: {
                "@type": "SoftwareSourceCode",
                name: siteName,
                url: siteUrl,
                codeRepository: repoUrl,
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: breadcrumbs.map(([name, item], i) => ({
                "@type": "ListItem",
                position: i + 1,
                name,
                item,
              })),
            },
          ],
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
  const title = page.data.seoTitle ?? page.data.title;
  const image = pageImage(page);
  return {
    title,
    description: page.data.description,
    alternates: { canonical: page.url },
    openGraph: {
      type: "article",
      siteName,
      locale: "en_US",
      url: page.url,
      title: `${title} | ${siteName}`,
      description: page.data.description,
      images: image,
      ...(page.data.lastModified && { modifiedTime: page.data.lastModified.toISOString() }),
    },
    twitter: { card: "summary_large_image", images: image },
  };
}
