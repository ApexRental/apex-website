import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SIZE = 1024;

const bg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <radialGradient id="g" cx="50%" cy="30%" r="85%">
      <stop offset="0%" stop-color="#1a2c58"/>
      <stop offset="48%" stop-color="#0c1526"/>
      <stop offset="100%" stop-color="#05070d"/>
    </radialGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(111,155,255,0.55)"/>
      <stop offset="100%" stop-color="rgba(111,155,255,0.06)"/>
    </linearGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/>
  <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="482" fill="none" stroke="url(#ring)" stroke-width="7"/>
</svg>`;

const markW = 560;
const mark = await sharp(join(root, "public", "apex-mark.png"))
  .resize({ width: markW })
  .toBuffer();
const markMeta = await sharp(mark).metadata();

const avatar = await sharp(Buffer.from(bg))
  .composite([
    {
      input: mark,
      left: Math.round((SIZE - markW) / 2),
      top: Math.round((SIZE - (markMeta.height ?? markW)) / 2 - 20),
    },
  ])
  .png()
  .toBuffer();

// public copy (for BIMI/website use) + a copy in the project root for the owner
await sharp(avatar).toFile(join(root, "public", "email-avatar.png"));
await sharp(avatar).toFile(join(root, "..", "apex-email-avatar.png"));
console.log("wrote email-avatar.png (public + project root)");
