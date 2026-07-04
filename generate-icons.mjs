import sharp from 'sharp'
import fs from 'fs'

function generateSVG(size) {
  const r = Math.round(size * 0.22)
  const fontSize = Math.round(size * 0.52)
  const cy = Math.round(size * 0.54)
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fb923c"/>
      <stop offset="100%" style="stop-color:#f97316"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>
  <text x="${size/2}" y="${cy}" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">🍼</text>
</svg>`)
}

async function main() {
  for (const size of [192, 512]) {
    await sharp(generateSVG(size))
      .png()
      .toFile(`public/icons/icon-${size}.png`)
    console.log(`Generated public/icons/icon-${size}.png`)
  }
}

main()
