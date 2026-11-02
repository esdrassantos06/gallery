import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Adds a per-page Content Security Policy to every exported HTML file. The
 * static export inlines scripts, style tags and style attributes, so each one
 * is allowed by its SHA-256 hash instead of 'unsafe-inline'.
 */
const out = fileURLToPath(new URL("../out/", import.meta.url));

const hash = (text) => `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`;

const decode = (value) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

function policy(html) {
  const scripts = new Set();
  const styles = new Set();
  for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!/\ssrc=/.test(attrs) && body) scripts.add(hash(body));
  }
  for (const [, body] of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) styles.add(hash(body));
  let attributes = false;
  for (const [, value] of html.matchAll(/\sstyle="([^"]*)"/g)) {
    styles.add(hash(decode(value)));
    attributes = true;
  }
  return [
    "default-src 'self'",
    `script-src 'self' ${[...scripts].join(" ")}`.trim(),
    `style-src 'self' ${attributes ? "'unsafe-hashes' " : ""}${[...styles].join(" ")}`.trim(),
    "img-src 'self' data:",
    "media-src 'self'",
    "font-src 'self'",
    "frame-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

let count = 0;
for (const entry of readdirSync(out, { recursive: true })) {
  if (!entry.endsWith(".html")) continue;
  const file = join(out, entry);
  const html = readFileSync(file, "utf8");
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy(html)}"/>`;
  const anchor = /<meta charSet="utf-8"\/>/i.exec(html) ?? /<head[^>]*>/.exec(html);
  if (!anchor) throw new Error(`No <head> in ${entry}`);
  const at = anchor.index + anchor[0].length;
  writeFileSync(file, html.slice(0, at) + meta + html.slice(at));
  count++;
}
console.log(`CSP added to ${count} HTML files`);
