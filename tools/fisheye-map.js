/* ═══════════════════════════════════════════════════════════════════════════
   Fish-eye — regenerates the displacement map for the <filter id="fisheye">
   in index.html. Build-time only; the page loads the baked PNG and no JS.

     node tools/fisheye-map.js        →  assets/img/fisheye-map.png

   feDisplacementMap reads a pixel's R channel as an x-offset and G as a
   y-offset, both biased around 127.5 (= no displacement). Offsetting outward
   in proportion to radius makes the centre magnify and the edges compress:
   a barrel bulge.

   Two details worth keeping:
   • The r⁴ term makes the bulge fall off harder near the rim. Pure r² bows
     gently and evenly; the quartic is what reads as a camera lens.
   • The map is normalised so a corner lands exactly on 0/255. That uses the
     full 8-bit range (finer gradations, no banding) and gives the filter's
     `scale` a concrete meaning: corner displacement is scale/2 px.

   The maths wants a canvas, so it runs in the Chromium that Playwright already
   installed for the test suite rather than pulling in an image library.
   ═══════════════════════════════════════════════════════════════════════════ */

const fs   = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.join(__dirname, '..', 'tests', 'node_modules', 'playwright-core'));

const OUT = path.join(__dirname, '..', 'assets', 'img', 'fisheye-map.png');

function buildFisheyeMap(size = 1024, quartic = 0.35) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const d = img.data;
  const mid = (size - 1) / 2;
  const norm = 2 + quartic * 4;            // |raw| at a corner, where r² = 2

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - mid) / mid;          // −1 … 1
      const ny = (y - mid) / mid;
      const r2 = nx * nx + ny * ny;
      const f = (r2 + quartic * r2 * r2) / norm;   // radial falloff, 0 … 1
      const i = (y * size + x) * 4;
      d[i]     = Math.max(0, Math.min(255, 127.5 + nx * f * 127.5));
      d[i + 1] = Math.max(0, Math.min(255, 127.5 + ny * f * 127.5));
      d[i + 2] = 0;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const uri = await page.evaluate(
    ([src, size]) => eval(`(${src})`)(size),
    [buildFisheyeMap.toString(), 1024],
  );

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, Buffer.from(uri.split(',')[1], 'base64'));
  await browser.close();

  console.log(`wrote ${path.relative(process.cwd(), OUT)} — ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
})();
