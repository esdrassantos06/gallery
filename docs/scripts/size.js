import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** size-limit entry names in `.size-limit.json`, by the key the docs read. */
const ENTRIES = {
  lightbox: "Lightbox (JS, min+brotli)",
  grids: "Grids and filter (JS, min+brotli)",
  all: "Everything (JS, min+brotli)",
  css: "styles.css (min+brotli)",
};

const root = fileURLToPath(new URL("../..", import.meta.url));
const run = (...args) =>
  execFileSync("npm", ["run", "--silent", ...args], { cwd: root, encoding: "utf8" });

run("build");
const results = JSON.parse(run("size", "--", "--json"));

const sizes = Object.fromEntries(
  Object.entries(ENTRIES).map(([key, name]) => {
    const result = results.find((entry) => entry.name === name);
    if (!result) throw new Error(`size-limit has no entry named "${name}"`);
    return [key, `${(result.size / 1000).toFixed(2)} kB`];
  }),
);

mkdirSync(new URL("../lib/generated", import.meta.url), { recursive: true });
writeFileSync(
  new URL("../lib/generated/size.json", import.meta.url),
  `${JSON.stringify(sizes, null, 2)}\n`,
);
