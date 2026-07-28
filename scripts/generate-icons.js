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
  { name: 'icon-192.png', size: 192, pad: true },
  { name: 'icon-512.png', size: 512, pad: true },
  { name: 'icon-apple.png', size: 180, pad: true },
  { name: 'favicon.png', size: 32, pad: false }
];

async function generateIcons() {
  console.log('Generating PWA icons from SVG (with safe area padding)...');
  
  if (!fs.existsSync(svgPath)) {
    console.error(`Error: Source SVG not found at ${svgPath}`);
    process.exit(1);
  }

  for (const target of targets) {
    const outputPath = path.join(publicDir, target.name);
    try {
      if (target.pad) {
        // Calculate the inner size (70% of total size for maskable safe area)
        const innerSize = Math.round(target.size * 0.7);
        
        await sharp({
          create: {
            width: target.size,
            height: target.size,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
          }
        })
        .composite([
          {
            input: await sharp(svgPath).resize(innerSize, innerSize).toBuffer(),
            gravity: 'center'
          }
        ])
        .png()
        .toFile(outputPath);
      } else {
        // For favicon, just resize directly without padding
        await sharp(svgPath)
          .resize(target.size, target.size)
          .png()
          .toFile(outputPath);
      }
      console.log(`✓ Generated ${target.name} (${target.size}x${target.size})`);
    } catch (err) {
      console.error(`✗ Failed to generate ${target.name}:`, err);
    }
  }

  console.log('All icons generated successfully!');
}

generateIcons();
