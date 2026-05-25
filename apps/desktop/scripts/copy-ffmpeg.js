import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const targetDir = path.resolve('src-tauri/binaries');
const arch = process.arch === 'arm64' ? 'aarch64' : 'x86_64';
// For Mac, target string for Tauri is apple-darwin
const targetName = `ffmpeg-${arch}-apple-darwin`;
const targetPath = path.join(targetDir, targetName);

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.copyFileSync(ffmpegPath, targetPath);
fs.chmodSync(targetPath, '755');
console.log(`Copied ffmpeg from ${ffmpegPath} to ${targetPath}`);
