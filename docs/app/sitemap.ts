import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/shared";
import { source } from "@/lib/source";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages();
  const latest = pages.reduce<Date | undefined>(
    (max, page) =>
      page.data.lastModified && (!max || page.data.lastModified > max)
        ? page.data.lastModified
        : max,
    undefined,
  );
  return [
    { url: `${siteUrl}/`, lastModified: latest },
    ...pages.map((page) => ({
      url: `${siteUrl}${page.url}`,
      lastModified: page.data.lastModified,
    })),
    { url: `${siteUrl}/privacy` },
    { url: `${siteUrl}/cookies` },
    { url: `${siteUrl}/terms` },
  ];
}
