import sharp from "sharp"
import { writeFileSync } from "node:fs"
import { join } from "node:path"

const root = join(import.meta.dirname, "..", "public")

function iconSvg({
  background,
  foreground,
  accent,
  rounded = true,
}) {
  const radius = rounded ? 36 : 0
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="${radius}" fill="${background}"/>
  <text
    x="90"
    y="104"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', Times, serif"
    font-size="64"
    font-weight="500"
    fill="${foreground}"
    letter-spacing="-1"
  >TM</text>
  <line x1="58" y1="122" x2="122" y2="122" stroke="${accent}" stroke-width="2.5" stroke-linecap="round"/>
</svg>`
}

const lightSvg = iconSvg({
  background: "#F7F4EE",
  foreground: "#4A4338",
  accent: "#C4A35A",
})

const darkSvg = iconSvg({
  background: "#2F2A24",
  foreground: "#F7F4EE",
  accent: "#C4A35A",
})

const adaptiveSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    @media (prefers-color-scheme: light) {
      .bg { fill: #F7F4EE; }
      .fg { fill: #4A4338; }
      .accent { stroke: #C4A35A; }
    }
    @media (prefers-color-scheme: dark) {
      .bg { fill: #2F2A24; }
      .fg { fill: #F7F4EE; }
      .accent { stroke: #C4A35A; }
    }
  </style>
  <rect class="bg" width="180" height="180" rx="36"/>
  <text
    x="90"
    y="104"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', Times, serif"
    font-size="64"
    font-weight="500"
    class="fg"
    letter-spacing="-1"
  >TM</text>
  <line class="accent" x1="58" y1="122" x2="122" y2="122" stroke-width="2.5" stroke-linecap="round"/>
</svg>`

writeFileSync(join(root, "icon.svg"), adaptiveSvg)

await sharp(Buffer.from(lightSvg)).resize(32, 32).png().toFile(join(root, "icon-light-32x32.png"))
await sharp(Buffer.from(darkSvg)).resize(32, 32).png().toFile(join(root, "icon-dark-32x32.png"))
await sharp(Buffer.from(lightSvg)).resize(180, 180).png().toFile(join(root, "apple-icon.png"))
await sharp(Buffer.from(lightSvg)).resize(32, 32).png().toFile(join(root, "favicon.ico"))

console.log("Generated ToiMoi icons in public/")
