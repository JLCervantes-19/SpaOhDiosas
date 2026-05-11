/**
 * generate-icons.js — Genera íconos PNG placeholder para la PWA
 * Uso: node scripts/generate-icons.js
 *
 * CLIENTE: reemplazar los valores de BRAND_COLOR y ACCENT_COLOR
 * con los colores del cliente antes de generar.
 *
 * Para íconos definitivos con logo real, usar herramientas como:
 *   https://www.pwabuilder.com/imageGenerator
 *   https://realfavicongenerator.net
 */

const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// ============================================================
// CLIENTE: personalizar estos valores
// ============================================================
const BRAND_COLOR  = { r: 0x2C, g: 0x4A, b: 0x2E }; // #2C4A2E forest green
const ACCENT_COLOR = { r: 0xC9, g: 0xA9, b: 0x61 }; // #C9A961 gold
const BG_COLOR     = { r: 0xFA, g: 0xF8, b: 0xF5 }; // #FAF8F5 cream
// ============================================================

const ICONS_DIR = path.join(__dirname, '../frontend/icons');

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const len  = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcVal = Buffer.allocUnsafe(4);
  crcVal.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([len, typeBuffer, data, crcVal]);
}

/**
 * Genera un PNG sólido con un diseño de dos franjas de color.
 * top 70% = BRAND_COLOR, bottom 30% = ACCENT_COLOR
 */
function createPNG(size, topColor, bottomColor) {
  const rowSize = 1 + size * 3;
  const raw     = Buffer.alloc(size * rowSize);
  const split   = Math.floor(size * 0.7);

  for (let y = 0; y < size; y++) {
    const offset = y * rowSize;
    raw[offset] = 0; // filter: None
    const { r, g, b } = y < split ? topColor : bottomColor;
    for (let x = 0; x < size; x++) {
      raw[offset + 1 + x * 3]     = r;
      raw[offset + 1 + x * 3 + 1] = g;
      raw[offset + 1 + x * 3 + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(raw);

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8]  = 8; // bit depth
  ihdr[9]  = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Crea un ícono "maskable" con padding del 10%
 * (Android adaptive icons necesitan 10% de safe zone en cada lado)
 */
function createMaskablePNG(size, bgColor, fgColor) {
  const pad     = Math.floor(size * 0.1);
  const inner   = size - pad * 2;
  const rowSize = 1 + size * 3;
  const raw     = Buffer.alloc(size * rowSize);

  for (let y = 0; y < size; y++) {
    const offset = y * rowSize;
    raw[offset] = 0;
    for (let x = 0; x < size; x++) {
      const inPad = x < pad || x >= size - pad || y < pad || y >= size - pad;
      const { r, g, b } = inPad ? bgColor : (y < pad + inner * 0.7 ? fgColor : bgColor);
      raw[offset + 1 + x * 3]     = r;
      raw[offset + 1 + x * 3 + 1] = g;
      raw[offset + 1 + x * 3 + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(raw);
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Generar íconos
const icons = [
  { file: 'icon-192.png',           size: 192, fn: () => createPNG(192, BRAND_COLOR, ACCENT_COLOR) },
  { file: 'icon-512.png',           size: 512, fn: () => createPNG(512, BRAND_COLOR, ACCENT_COLOR) },
  { file: 'apple-touch-icon.png',   size: 180, fn: () => createPNG(180, BRAND_COLOR, ACCENT_COLOR) },
  { file: 'icon-maskable-192.png',  size: 192, fn: () => createMaskablePNG(192, BG_COLOR, BRAND_COLOR) },
  { file: 'icon-maskable-512.png',  size: 512, fn: () => createMaskablePNG(512, BG_COLOR, BRAND_COLOR) },
];

icons.forEach(({ file, size, fn }) => {
  const dest = path.join(ICONS_DIR, file);
  fs.writeFileSync(dest, fn());
  console.log(`✓ ${file} (${size}x${size})`);
});

console.log('\nÍconos placeholder generados en frontend/icons/');
console.log('CLIENTE: reemplazar con íconos reales del logo del cliente.');
