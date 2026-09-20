#!/usr/bin/env node
/**
 * Splits the full Figma REST API file JSON (design/metadata/figma-file.json)
 * into per-screen node JSON files under design/context/<section>/.
 *
 * For every screen in design/manifest.json, finds its node in the document
 * tree and writes design/context/<section>/<slug>-<theme>.json containing
 * { figmaFileKey, nodeId, name, section, theme, slug, exportedAt,
 *   figmaFileLastModified, document } where document is the screen's full
 * node subtree (geometry, fills, typography, text content, component
 * references).
 *
 * Reads and writes files directly — no output beyond a summary.
 *
 * usage: node design/tools/split-screen-nodes.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = "design";
const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
const file = JSON.parse(readFileSync(join(root, "metadata", "figma-file.json"), "utf8"));

// build a node index by id in one pass
const byId = new Map();
(function index(node) {
  byId.set(node.id, node);
  for (const child of node.children || []) index(child);
})(file.document);

const exportedAt = new Date().toISOString().slice(0, 10);
let written = 0;
const missing = [];
for (const s of manifest.screens) {
  const node = byId.get(s.id);
  if (!node) {
    missing.push(`${s.id} (${s.name})`);
    continue;
  }
  const dir = join(root, "context", s.section);
  mkdirSync(dir, { recursive: true });
  const out = {
    figmaFileKey: manifest.figmaFileKey,
    nodeId: s.id,
    name: s.name,
    section: s.section,
    theme: s.theme,
    slug: s.slug,
    exportedAt,
    figmaFileLastModified: file.lastModified,
    document: node,
  };
  writeFileSync(join(dir, `${s.slug}-${s.theme}.json`), JSON.stringify(out, null, "\t") + "\n");
  written++;
}
console.log(`per-screen node files written: ${written}/${manifest.screens.length}`);
if (missing.length) {
  console.error("missing nodes:", missing.join(", "));
  process.exit(1);
}
