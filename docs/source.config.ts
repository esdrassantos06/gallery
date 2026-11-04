import { resolve } from "node:path";
import { pageSchema } from "fumadocs-core/source/schema";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { remarkAutoTypeTable } from "fumadocs-typescript";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      /** Search result title when the sidebar title is too short to carry the query. */
      seoTitle: pageSchema.shape.title.optional(),
    }),
    lastModified: true,
    postprocess: { includeProcessedMarkdown: true },
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      [
        remarkAutoTypeTable,
        {
          options: {
            basePath: resolve(".."),
            transform: (entry: { type: string; simplifiedType: string }) => {
              entry.type = entry.type
                .replace(/^\((.*)\) \| undefined$/, "$1")
                .replace(/ \| undefined$/, "");
              entry.simplifiedType = entry.type.length <= 40 ? entry.type : entry.simplifiedType;
            },
          },
        },
      ],
    ],
  },
});
