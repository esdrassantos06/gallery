import { cpSync } from "node:fs";

for (const dir of ["samples", "videos"]) {
  cpSync(
    new URL(`../../playground/public/${dir}`, import.meta.url),
    new URL(`../public/${dir}`, import.meta.url),
    {
      recursive: true,
    },
  );
}
cpSync(
  new URL("../../playground/public/embed-demo.html", import.meta.url),
  new URL("../public/embed-demo.html", import.meta.url),
);
cpSync(
  new URL("../../playground/public/embed-demo.css", import.meta.url),
  new URL("../public/embed-demo.css", import.meta.url),
);
