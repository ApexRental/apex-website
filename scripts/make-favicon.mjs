import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SIZE = 512;

// brand tile: flat dark navy, rounded like an app icon (no glow)
const bg = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
     <rect width="${SIZE}" height="${SIZE}" rx="116" fill="#0e1626"/>
   </svg>`
);

// white mountain mark, scaled to fill most of the tile
const markW = 424;
const mark = await sharp(path.join(ROOT, "public/apex-mark.png"))
  .resize({ width: markW })
  .toBuffer();
const markMeta = await sharp(mark).metadata();

const icon = await sharp(bg)
  .composite([
    {
      input: mark,
      left: Math.round((SIZE - markW) / 2),
      top: Math.round((SIZE - (markMeta.height ?? 190)) / 2),
    },
  ])
  .png()
  .toBuffer();

await sharp(icon).toFile(path.join(ROOT, "src/app/icon.png"));
// a small apple-touch variant reuses the same art
await sharp(icon).resize(180, 180).toFile(path.join(ROOT, "src/app/apple-icon.png"));

console.log("wrote src/app/icon.png (512) + src/app/apple-icon.png (180)");
