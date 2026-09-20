#!/usr/bin/env node
/**
 * Minimal PNG analyzer: decodes an 8-bit RGBA PNG (no deps, uses node:zlib)
 * and measures ink bounding boxes in a region. Used to diagnose the header
 * wordmark proportions (text width vs red underline width).
 *
 * usage: node analyze-png.mjs <file.png> <x> <y> <w> <h>
 * Prints: per-color-class pixel counts and bounding boxes for the region.
 */
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const [file, rx, ry, rw, rh] = process.argv.slice(2);
const buf = readFileSync(file);

// --- parse chunks ---
let off = 8;
let width = 0, height = 0, bitDepth = 0, colorType = 0;
const idat = [];
while (off < buf.length) {
  const len = buf.readUInt32BE(off);
  const type = buf.toString("ascii", off + 4, off + 8);
  const data = buf.subarray(off + 8, off + 8 + len);
  if (type === "IHDR") {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    bitDepth = data[8];
    colorType = data[9];
  } else if (type === "IDAT") {
    idat.push(data);
  } else if (type === "IEND") break;
  off += 12 + len;
}
if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
  console.error(`unsupported PNG: depth=${bitDepth} colorType=${colorType}`);
  process.exit(1);
}
const channels = colorType === 6 ? 4 : 3;

// --- inflate and unfilter ---
const raw = inflateSync(Buffer.concat(idat));
const stride = width * channels;
const pixels = Buffer.alloc(height * stride);
for (let y = 0; y < height; y++) {
  const filter = raw[y * (stride + 1)];
  const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
  const dst = pixels.subarray(y * stride, (y + 1) * stride);
  for (let i = 0; i < stride; i++) {
    const a = i >= channels ? dst[i - channels] : 0;
    const b = y > 0 ? pixels[(y - 1) * stride + i] : 0;
    const c = i >= channels && y > 0 ? pixels[(y - 1) * stride + i - channels] : 0;
    let v = src[i];
    if (filter === 1) v = (v + a) & 0xff;
    else if (filter === 2) v = (v + b) & 0xff;
    else if (filter === 3) v = (v + ((a + b) >> 1)) & 0xff;
    else if (filter === 4) {
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
    }
    dst[i] = v;
  }
}

// --- analyze region ---
const X = +rx, Y = +ry, W = +rw, H = +rh;
const classes = {
  darkText: (r, g, b) => r < 110 && g < 110 && b < 130, // black or navy text
  greenText: (r, g, b) => g > 100 && r < 90 && b < 130, // emerald "Trove"
  redLine: (r, g, b) => r > 180 && g < 130 && b < 130, // coral underline
};
const boxes = {};
for (const k of Object.keys(classes)) boxes[k] = { minx: 1e9, miny: 1e9, maxx: -1, maxy: -1, count: 0 };
for (let y = Math.max(0, Y); y < Math.min(height, Y + H); y++) {
  for (let x = Math.max(0, X); x < Math.min(width, X + W); x++) {
    const i = (y * width + x) * channels;
    const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
    for (const [k, test] of Object.entries(classes)) {
      if (test(r, g, b)) {
        const bx = boxes[k];
        bx.minx = Math.min(bx.minx, x); bx.maxx = Math.max(bx.maxx, x);
        bx.miny = Math.min(bx.miny, y); bx.maxy = Math.max(bx.maxy, y);
        bx.count++;
      }
    }
  }
}
for (const [k, bx] of Object.entries(boxes)) {
  if (bx.count === 0) { console.log(`${k}: none`); continue; }
  console.log(`${k}: ${bx.count}px, x ${bx.minx}-${bx.maxx} (w=${bx.maxx - bx.minx + 1}), y ${bx.miny}-${bx.maxy} (h=${bx.maxy - bx.miny + 1})`);
}
