#!/usr/bin/env node
/**
 * Verifies the design export against design/manifest.json:
 *  1. every screen has a non-empty PNG screenshot
 *  2. every context file has a sibling .assets.json
 *  3. no temporary Figma asset URLs remain in any exported file
 *  4. every asset referenced by an .assets.json exists locally and is non-empty
 *  5. all icon SVGs are well-formed (start with "<svg" or "<?xml")
 *  6. every manifest contextJson exists, parses, and matches its entry (nodeId, slug, theme)
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

/** verify a PNG file exists, is non-empty, and has PNG magic bytes */
function checkPng(relPath, label) {
  const shot = join(root, relPath);
  if (!existsSync(shot)) {
    errors.push(`missing ${label}: ${shot}`);
    return;
  }
  const size = statSync(shot).size;
  if (size === 0) {
    errors.push(`empty ${label}: ${shot}`);
    return;
  }
  const fd = readFileSync(shot);
  if (!(fd[0] === 0x89 && fd[1] === 0x50 && fd[2] === 0x4e && fd[3] === 0x47)) {
    // catches failed downloads where an error body (JSON/HTML) was saved as the file
    errors.push(`not a PNG (bad magic bytes, ${size}B): ${shot}`);
  }
}

/** verify a REST context JSON exists, parses, and matches the expected node */
function checkContextJson(relPath, expect = {}) {
  const p = join(root, relPath);
  if (!existsSync(p)) {
    errors.push(`missing contextJson: ${p}`);
    return;
  }
  let data;
  try {
    data = JSON.parse(readFileSync(p, "utf8"));
  } catch {
    errors.push(`contextJson does not parse: ${p}`);
    return;
  }
  if (!data.document || typeof data.document !== "object") {
    errors.push(`contextJson has no document node: ${p}`);
    return;
  }
  if (expect.id && data.nodeId !== expect.id) errors.push(`contextJson nodeId mismatch: ${p} (${data.nodeId} != ${expect.id})`);
  if (expect.id && data.document.id !== expect.id) errors.push(`contextJson document.id mismatch: ${p}`);
  if (expect.slug && data.slug !== expect.slug) errors.push(`contextJson slug mismatch: ${p}`);
  if (expect.theme && data.theme !== expect.theme) errors.push(`contextJson theme mismatch: ${p}`);
}

for (const s of manifest.screens) {
  checkPng(join("screenshots", s.section, `${s.slug}-${s.theme}.png`), "screenshot");
  if (!s.contextJson) errors.push(`screen has no contextJson: ${s.slug}-${s.theme}`);
  else checkContextJson(s.contextJson, { id: s.id, slug: s.slug, theme: s.theme });
}
for (const g of manifest.componentGroups) {
  if (g.contextJson) checkContextJson(g.contextJson, { id: g.id });
}

// 1b. screenshots for every component group and button variant that declares one
const declaredScreens = [
  ...manifest.componentGroups.flatMap((g) => g.screenshots || (g.screenshot ? [g.screenshot] : [])),
  ...manifest.buttonVariants.map((b) => b.screenshot).filter(Boolean),
];
for (const rel of declaredScreens) {
  checkPng(rel, "component screenshot");
}

// 2-4. context files and assets
// note: .assets.json files intentionally keep the original Figma URL as the mapping key (provenance);
// the "no dangling URL" check therefore only applies to code files (.tsx) and docs (.md)
const files = walk(root).filter((f) => !f.includes(`${root}/tools/`)).filter((f) => f.endsWith(".tsx") || f.endsWith(".md") || f.endsWith(".xml"));
for (const f of files) {
  const content = readFileSync(f, "utf8");
  const urls = content.match(/https?:\/\/[^\s"'`<>]+/g) || [];
  for (const rawUrl of urls) {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.hostname === "www.figma.com" && parsed.pathname.startsWith("/api/mcp/asset/")) {
        errors.push(`dangling Figma asset URL in ${f}`);
        break;
      }
    } catch {
      // ignore non-URL matches in scanned text
    }
  }
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
const contextJsons = walk(join(root, "context")).filter((f) => f.endsWith(".json") && !f.endsWith(".assets.json")).length;
console.log(`screenshots: ${shots} (${manifest.screens.length} screens + ${contextsWithShot} component groups)`);
console.log(`context files: ${contexts} tsx + ${contextJsons} REST node JSONs`);
console.log(`svg assets: ${svgs}`);

if (errors.length) {
  console.error(`\nFAILURES (${errors.length}):`);
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
