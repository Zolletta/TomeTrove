#!/usr/bin/env node
/**
 * Post-processes a saved Figma design-context code file:
 *  1. resolves the `assetPathPrefix` constant to its remote base URL
 *  2. downloads every referenced `<assetPathPrefix>/<file>` asset into the target directory
 *  3. rewrites the remote prefix in the code to a local relative path
 *  4. writes `<contextFile>.assets.json` mapping remote URL -> local path
 *
 * Usage: node design/tools/fetch-context-assets.mjs <contextFile> <absoluteAssetsDir> <relativePrefixFromContextFile>
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const [, , contextFile, assetsDir, relativePrefix] = process.argv;
if (!contextFile || !assetsDir || !relativePrefix) {
  console.error("usage: fetch-context-assets.mjs <contextFile> <assetsDir> <relativePrefix>");
  process.exit(1);
}

let code = readFileSync(contextFile, "utf8");
const prefixMatch = code.match(/https:\/\/www\.figma\.com\/api\/mcp\/asset\/([0-9a-f-]+)/);
if (!prefixMatch) {
  writeFileSync(`${contextFile}.assets.json`, JSON.stringify({ node: basename(contextFile), assets: {} }, null, "\t"));
  console.log(`no assets referenced: ${contextFile}`);
  process.exit(0);
}
const baseUrl = prefixMatch[0];
// asset file names referenced through the prefix, e.g. ${assetPathPrefix}/0d085.svg
const fileRe = /\$\{assetPathPrefix\}\/([A-Za-z0-9_.-]+\.[a-z0-9]+)/g;
const fileNames = [...new Set([...code.matchAll(fileRe)].map((m) => m[1]))];
// also catch any full inline asset URLs
const fullUrlRe = /https:\/\/www\.figma\.com\/api\/mcp\/asset\/([0-9a-f-]+)\/([A-Za-z0-9_.-]+\.[a-z0-9]+)/g;
const fullUrls = [...new Set([...code.matchAll(fullUrlRe)].map((m) => m[0]))];

mkdirSync(assetsDir, { recursive: true });
const mapping = {};
let failed = 0;

async function download(url, fileName) {
  const dest = join(assetsDir, fileName);
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    console.error(`FAILED fetch ${url}: ${err}`);
    failed++;
    return false;
  }
  if (!res.ok) {
    console.error(`FAILED ${res.status} ${url}`);
    failed++;
    return false;
  }
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  mapping[url] = `${relativePrefix}/${fileName}`;
  return true;
}

for (const fileName of fileNames) {
  await download(`${baseUrl}/${fileName}`, fileName);
}
for (const url of fullUrls) {
  if (!(url in mapping)) await download(url, url.split("/").pop());
}

// rewrite the remote prefix to the local relative path
code = code.split(baseUrl).join(relativePrefix);
writeFileSync(contextFile, code);
writeFileSync(
  `${contextFile}.assets.json`,
  JSON.stringify({ node: basename(contextFile), assets: mapping }, null, "\t"),
);
const ok = Object.keys(mapping).filter((u) => {
  const f = join(assetsDir, u.split("/").pop());
  return existsSync(f) && statSync(f).size > 0;
}).length;
console.log(`processed ${contextFile}: ${Object.keys(mapping).length} assets (${ok} non-empty)${failed ? `, ${failed} FAILED` : ""}`);
process.exit(failed ? 2 : 0);
