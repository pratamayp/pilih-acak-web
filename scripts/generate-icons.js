import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../public/icon.svg');
const publicDir = path.join(__dirname, '../public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-apple.png', size: 180 },
  { name: 'favicon.png', size: 32 }
];

async function generateIcons() {
  console.log('Generating PWA icons from SVG...');
  
  if (!fs.existsSync(svgPath)) {
    console.error(`Error: Source SVG not found at ${svgPath}`);
    process.exit(1);
  }

  for (const target of targets) {
    const outputPath = path.join(publicDir, target.name);
    try {
      await sharp(svgPath)
        .resize(target.size, target.size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${target.name} (${target.size}x${target.size})`);
    } catch (err) {
      console.error(`✗ Failed to generate ${target.name}:`, err);
    }
  }

  console.log('All icons generated successfully!');
}

generateIcons();
