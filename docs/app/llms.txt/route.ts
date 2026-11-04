import { docsLlms } from "@/lib/source";
import { siteDescription, siteUrl } from "@/lib/shared";

export const dynamic = "force-static";

export function GET() {
  const index = docsLlms
    .index()
    .replace(/^# .*\n+/, "")
    .replaceAll("](/", `](${siteUrl}/`);
  return new Response(
    `# liftbox

> ${siteDescription}

Install with \`npm install liftbox\` and import \`liftbox/styles.css\` once. React 18 or 19 is a peer dependency. The package is ESM only.

The full documentation as one Markdown file: ${siteUrl}/llms-full.txt

## Docs

${index}
`,
    { headers: { "Content-Type": "text/markdown; charset=utf-8" } },
  );
}
