import { resolve } from "node:path";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { remarkAutoTypeTable } from "fumadocs-typescript";

export const docs = defineDocs({ dir: "content/docs" });

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
