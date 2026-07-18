import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SIZE = 1024;
const markW = 560;

// light background with a soft ring
const bg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <radialGradient id="g" cx="50%" cy="30%" r="88%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="58%" stop-color="#f2f6fc"/>
      <stop offset="100%" stop-color="#e4ebf5"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/>
  <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="482" fill="none" stroke="rgba(28,52,96,0.16)" stroke-width="6"/>
</svg>`;

// resized mark, then recolor its silhouette to deep navy for contrast on white
const resized = await sharp(join(root, "public", "apex-mark.png"))
  .resize({ width: markW })
  .png()
  .toBuffer();
const meta = await sharp(resized).metadata();

const navyFill = await sharp({
  create: {
    width: meta.width,
    height: meta.height,
    channels: 4,
    background: { r: 15, g: 27, b: 54, alpha: 1 },
  },
})
  .png()
  .toBuffer();

// keep the navy only where the mark has pixels (dest-in mask)
const darkMark = await sharp(navyFill)
  .composite([{ input: resized, blend: "dest-in" }])
  .png()
  .toBuffer();

const avatar = await sharp(Buffer.from(bg))
  .composite([
    {
      input: darkMark,
      left: Math.round((SIZE - meta.width) / 2),
      top: Math.round((SIZE - meta.height) / 2 - 20),
    },
  ])
  .png()
  .toBuffer();

await sharp(avatar).toFile(join(root, "public", "email-avatar-light.png"));
await sharp(avatar).toFile(join(root, "..", "apex-email-avatar-light.png"));
console.log("wrote email-avatar-light.png (public + project root)");
