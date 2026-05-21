/**
 * Generates Android launcher icons from assets/images/casaclick-logo.png
 * Run: npm run generate:icons
 */
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcLogo = path.join(root, 'assets/images/casaclick-logo.png');
const resRoot = path.join(root, 'android/app/src/main/res');

const densities = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('Install sharp first: npm install --save-dev sharp');
  process.exit(1);
}

const input = sharp(srcLogo).flatten({ background: '#FFFFFF' });

for (const [folder, size] of Object.entries(densities)) {
  const dir = path.join(resRoot, folder);
  await mkdir(dir, { recursive: true });
  const launcher = path.join(dir, 'ic_launcher.png');
  const round = path.join(dir, 'ic_launcher_round.png');
  const buf = await input
    .clone()
    .resize(size, size, { fit: 'contain', background: '#FFFFFF' })
    .png()
    .toBuffer();
  await sharp(buf).toFile(launcher);
  await sharp(buf).toFile(round);
  console.log(`Wrote ${folder} (${size}px)`);
}

const drawableDir = path.join(resRoot, 'drawable-nodpi');
await mkdir(drawableDir, { recursive: true });
await sharp(srcLogo)
  .resize(432, 432, { fit: 'contain', background: { r: 255, g: 253, b: 247, alpha: 0 } })
  .png()
  .toFile(path.join(drawableDir, 'ic_launcher_foreground.png'));

console.log('Done. Rebuild app: npm run android');
