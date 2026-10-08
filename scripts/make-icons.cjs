// One-off icon generator: pure Node (zlib), no dependencies.
// Brand mark: deep-purple gradient + gold sun + ascending white steps (the journey).
// Run: node scripts/make-icons.cjs   Output: public/icons/*.png
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const BRAND = [108, 0, 255];
const BRAND_DARK = [74, 0, 176];
const GOLD = [255, 184, 0];
const WHITE = [255, 255, 255];

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const sum = Buffer.alloc(4);
  sum.writeUInt32BE(crc(body));
  return Buffer.concat([len, body, sum]);
}

function toPng(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

// Paint the mark into an RGBA buffer. artScale<1 leaves a safe-zone margin (maskable).
function paint(size, artScale) {
  const buf = Buffer.alloc(size * size * 4);
  const set = (x, y, c, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    buf[i] = c[0];
    buf[i + 1] = c[1];
    buf[i + 2] = c[2];
    buf[i + 3] = a;
  };
  const m = (size * (1 - artScale)) / 2; // margin
  const S = (v) => m + v * artScale; // scale into art box
  const box = size * artScale;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = y / size;
      set(x, y, [lerp(BRAND[0], BRAND_DARK[0], t), lerp(BRAND[1], BRAND_DARK[1], t), lerp(BRAND[2], BRAND_DARK[2], t)]);
    }
  }
  const disc = (cx, cy, r, c) => {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) set(x, y, c);
      }
    }
  };

  // Gold sun.
  disc(S(box * 0.5), S(box * 0.42), box * 0.21, GOLD);
  // White ring around the sun.
  const rr = box * 0.26;
  const cx = S(box * 0.5);
  const cy = S(box * 0.42);
  for (let a = 0; a < Math.PI * 2; a += 0.02) {
    for (let w = -box * 0.012; w <= box * 0.012; w += box * 0.004) {
      set(Math.round(cx + Math.cos(a) * (rr + w)), Math.round(cy + Math.sin(a) * (rr + w)), WHITE);
    }
  }
  // Three ascending steps (the journey upward).
  const steps = [
    [0.2, 0.78, 0.16],
    [0.42, 0.68, 0.16],
    [0.64, 0.58, 0.16],
  ];
  for (const [fx, fy, fw] of steps) {
    const x0 = S(box * fx);
    const y0 = S(box * fy);
    const w = box * fw;
    const h = box * 0.055;
    for (let y = Math.round(y0); y < Math.round(y0 + h); y++) {
      for (let x = Math.round(x0); x < Math.round(x0 + w); x++) set(x, y, WHITE);
    }
  }
  return buf;
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  ["icon-192.png", 192, 1],
  ["icon-512.png", 512, 1],
  ["maskable-512.png", 512, 0.8],
  ["apple-touch-icon.png", 180, 1],
];
for (const [name, size, scale] of targets) {
  fs.writeFileSync(path.join(outDir, name), toPng(size, paint(size, scale)));
  console.log("wrote", name, size + "px");
}
