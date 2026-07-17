import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "../../On point logo.png");
const OUT = path.resolve(__dirname, "../public");

/**
 * Turn one half of the monochrome sheet into a transparent, tightly-cropped PNG.
 * `keep` = "dark" keeps dark pixels (black logo on white), "light" keeps light
 * pixels (white logo on black). Background becomes fully transparent.
 */
async function make({ top, height, keep, tint, outName }) {
  const { data, info } = await sharp(SRC)
    .extract({ left: 0, top, width: 1254, height })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height: h, channels: ch } = info;
  const rgba = Buffer.alloc(width * h * 4);
  for (let i = 0; i < width * h; i++) {
    const lum = data[i * ch];
    const alpha = keep === "dark" ? 255 - lum : lum;
    rgba[i * 4] = tint;
    rgba[i * 4 + 1] = tint;
    rgba[i * 4 + 2] = tint;
    rgba[i * 4 + 3] = alpha;
  }

  const dst = path.join(OUT, outName);
  const out = await sharp(rgba, { raw: { width, height: h, channels: 4 } })
    // crop away the fully-transparent margin (top-left pixel is transparent)
    .trim({ threshold: 10 })
    .png()
    .toBuffer();
  await sharp(out).toFile(dst);
  const m = await sharp(out).metadata();
  console.log(`${outName}  ${m.width}x${m.height}`);
}

// top half: black logo on white → for LIGHT theme (inset away from the centre divider)
await make({ top: 0, height: 600, keep: "dark", tint: 0, outName: "onpoint-light.png" });
// bottom half: white logo on black → for DARK theme (inset away from the centre divider)
await make({ top: 654, height: 600, keep: "light", tint: 255, outName: "onpoint-dark.png" });

console.log("done");
