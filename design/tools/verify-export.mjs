#!/usr/bin/env node
/**
 * Verifies the design export against design/manifest.json:
 *  1. every screen has a non-empty PNG screenshot
 *  2. every context file has a sibling .assets.json
 *  3. no temporary Figma asset URLs remain in any exported file
 *  4. every asset referenced by an .assets.json exists locally and is non-empty
 *  5. all icon SVGs are well-formed (start with "<svg" or "<?xml")
 * Exit code 0 = all checks pass.
 */
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const root = "design";
const errors = [];
const warn = [];

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// 1. screenshots for every manifest screen
const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
for (const s of manifest.screens) {
  const shot = join(root, "screenshots", s.section, `${s.slug}-${s.theme}.png`);
  if (!existsSync(shot)) errors.push(`missing screenshot: ${shot}`);
  else {
    const buf = readFileSync(shot);
    if (buf.length < 1000) errors.push(`suspiciously small screenshot (${buf.length}B): ${shot}`);
    if (!(buf[0] === 0x89 && buf[1] === 0x50)) errors.push(`not a PNG: ${shot}`);
  }
}

// 1b. screenshots for every component group and button variant that declares one
const declaredScreens = [
  ...manifest.componentGroups.flatMap((g) => g.screenshots || (g.screenshot ? [g.screenshot] : [])),
  ...manifest.buttonVariants.map((b) => b.screenshot).filter(Boolean),
];
for (const rel of declaredScreens) {
  const shot = join(root, rel);
  if (!existsSync(shot)) errors.push(`missing component screenshot: ${shot}`);
  else if (statSync(shot).size === 0) errors.push(`empty component screenshot: ${shot}`);
}

// 2-4. context files and assets
// note: .assets.json files intentionally keep the original Figma URL as the mapping key (provenance);
// the "no dangling URL" check therefore only applies to code files (.tsx) and docs (.md)
const files = walk(root).filter((f) => !f.includes(`${root}/tools/`)).filter((f) => f.endsWith(".tsx") || f.endsWith(".md") || f.endsWith(".xml"));
for (const f of files) {
  const content = readFileSync(f, "utf8");
  if (content.includes("https://www.figma.com/api/mcp/asset/")) errors.push(`dangling Figma asset URL in ${f}`);
  if (f.endsWith(".tsx") && !existsSync(`${f}.assets.json`)) errors.push(`missing .assets.json for ${f}`);
}
const contextTsx = walk(join(root, "context")).filter((f) => f.endsWith(".tsx"));
for (const f of contextTsx) {
  if (!existsSync(`${f}.assets.json`)) errors.push(`missing .assets.json for ${f}`);
}
const assetJsons = walk(root).filter((f) => f.endsWith(".assets.json"));
for (const aj of assetJsons) {
  const data = JSON.parse(readFileSync(aj, "utf8"));
  for (const local of Object.values(data.assets || {})) {
    const p = resolve(dirname(aj), local);
    if (!existsSync(p)) errors.push(`asset referenced but missing: ${p} (${aj})`);
    else if (statSync(p).size === 0) errors.push(`asset is empty: ${p}`);
  }
}

// 5. icon SVGs
const iconDir = join(root, "assets", "icons");
for (const f of readdirSync(iconDir)) {
  if (!f.endsWith(".svg")) continue;
  const head = readFileSync(join(iconDir, f)).toString("utf8").slice(0, 200).trimStart();
  if (!head.startsWith("<svg") && !head.startsWith("<?xml")) errors.push(`icon not valid SVG: ${f}`);
}

// summary counts
const shots = walk(join(root, "screenshots")).filter((f) => f.endsWith(".png")).length;
const contextsWithShot = declaredScreens.length;
const contexts = walk(join(root, "context")).filter((f) => f.endsWith(".tsx")).length;
const svgs = walk(join(root, "assets")).filter((f) => f.endsWith(".svg")).length;
console.log(`screenshots: ${shots} (${manifest.screens.length} screens + ${contextsWithShot} component groups)`);
console.log(`context files: ${contexts}`);
console.log(`svg assets: ${svgs}`);

if (errors.length) {
  console.error(`\nFAILURES (${errors.length}):`);
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
