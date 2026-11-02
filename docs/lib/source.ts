import { llms, loader } from "fumadocs-core/source";
import { docs } from "@/.source/server";
import { siteUrl } from "./shared";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

/** Markdown versions of the docs for `llms.txt` and `llms-full.txt`. */
export const docsLlms = llms(source, {
  renderPage: async (page) =>
    `# ${page.data.title} (${siteUrl}${page.url})\n\n${page.data.description ?? ""}\n\n${await page.data.getText("processed")}`,
});
