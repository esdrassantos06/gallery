import { llms, loader } from "fumadocs-core/source";
import { docs } from "@/.source/server";
import size from "./generated/size.json";
import { siteUrl, version } from "./shared";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

/** Replaces the `<Version />` and `<Size />` tags, which processed Markdown keeps as raw JSX. */
function fillProjectData(markdown: string): string {
  return markdown
    .replaceAll("<Version />", version)
    .replace(/<Size entry="(\w+)" \/>/g, (tag, entry: string) =>
      entry in size ? size[entry as keyof typeof size] : tag,
    );
}

/** Markdown versions of the docs for `llms.txt` and `llms-full.txt`. */
export const docsLlms = llms(source, {
  renderPage: async (page) =>
    `# ${page.data.title} (${siteUrl}${page.url})\n\n${page.data.description ?? ""}\n\n${fillProjectData(await page.data.getText("processed"))}`,
});

/** Path of the social preview generated for a docs page. */
export function pageImage(page: { slugs: string[] }): string {
  return `/og/docs/${[...page.slugs, "image.png"].join("/")}`;
}
