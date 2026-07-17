import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../.."); // "apex project" folder (where IMG_*.PNG live)
const OUT = path.resolve(__dirname, "../public/images/fleet");

// First image in each list is the cover (card + hero). Order = gallery order.
const MAP = {
  sonata: ["IMG_2187", "IMG_2186", "IMG_2192", "IMG_2199"],
  accord: ["IMG_2202", "IMG_2201", "IMG_2203", "IMG_2205", "IMG_2206"],
  tucson: ["IMG_2224", "IMG_2225", "IMG_2226", "IMG_2227"],
  santafe: ["IMG_2207", "IMG_2209", "IMG_2208", "IMG_2210", "IMG_2211"],
  palisade: ["IMG_2212", "IMG_2216", "IMG_2213", "IMG_2215", "IMG_2214"],
  "grand-cherokee": ["IMG_2196", "IMG_2197", "IMG_2195", "IMG_2200", "IMG_2198"],
  x5: ["IMG_2217", "IMG_2220", "IMG_2219", "IMG_2218", "IMG_2222", "IMG_2223"],
  gv70: ["IMG_2228", "IMG_2230", "IMG_2229", "IMG_2231"],
};

fs.mkdirSync(OUT, { recursive: true });

let count = 0;
for (const [slug, imgs] of Object.entries(MAP)) {
  for (let i = 0; i < imgs.length; i++) {
    const src = path.join(ROOT, `${imgs[i]}.PNG`);
    const dst = path.join(OUT, `${slug}-${i + 1}.jpg`);
    if (!fs.existsSync(src)) {
      console.warn(`MISSING: ${src}`);
      continue;
    }
    await sharp(src)
      // remove the solid black screenshot frame if present
      .trim({ background: "#000000", threshold: 30 })
      .resize({ width: 1500, withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(dst);
    const { size } = fs.statSync(dst);
    console.log(`${slug}-${i + 1}.jpg  (${Math.round(size / 1024)} KB)`);
    count++;
  }
}
console.log(`\nDone: ${count} images written to ${OUT}`);
