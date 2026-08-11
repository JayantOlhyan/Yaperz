const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');

// Ensure public/icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Define the brand SVGs
// Normal icon: used for standard launcher icons, splash screens, favicon
const normalSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#111111"/>
  <text x="50%" y="53%" dominant-baseline="central" text-anchor="middle" font-family="'Archivo Black', 'Arial Black', sans-serif" font-weight="900" font-size="270" fill="#ffffff" letter-spacing="-10">
    Y<tspan fill="#e65c00">.</tspan>
  </text>
</svg>
`;

// Maskable icon: padded to fit within the safe area of adaptive launchers (Android)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#111111"/>
  <text x="50%" y="53%" dominant-baseline="central" text-anchor="middle" font-family="'Archivo Black', 'Arial Black', sans-serif" font-weight="900" font-size="190" fill="#ffffff" letter-spacing="-8">
    Y<tspan fill="#e65c00">.</tspan>
  </text>
</svg>
`;

const targets = [
  { file: 'icon-192.png', size: 192, svg: normalSvg },
  { file: 'icon-512.png', size: 512, svg: normalSvg },
  { file: 'icon-maskable.png', size: 512, svg: maskableSvg },
  { file: 'apple-touch-icon.png', size: 180, svg: normalSvg },
  { file: 'favicon-32.png', size: 32, svg: normalSvg }
];

async function generate() {
  console.log('Generating PWA icons using sharp...');
  
  for (const target of targets) {
    const outputPath = path.join(ICONS_DIR, target.file);
    try {
      await sharp(Buffer.from(target.svg))
        .resize(target.size, target.size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${target.file} (${target.size}x${target.size})`);
    } catch (err) {
      console.error(`✗ Failed to generate ${target.file}:`, err);
    }
  }
  
  console.log('PWA icon generation complete!');
}

generate();
