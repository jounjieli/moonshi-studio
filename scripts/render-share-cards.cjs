const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

async function main() {
  const root = path.resolve(__dirname, "..");
  const manifest = JSON.parse(await fs.readFile(path.join(root, "assets/share/links.json"), "utf8"));
  for (const channel of manifest.channels) {
    for (const suffix of ["", "-preview"]) {
    const name = `moonshi-line-${channel.slug}${suffix}`;
    const input = path.join(root, "output/brand-share-cards", `${name}.svg`);
    const output = path.join(root, "assets/share", `${name}.png`);
    await sharp(input).png().toFile(output);
    const metadata = await sharp(output).metadata();
    console.log(`${name}.png: ${metadata.width}x${metadata.height}`);
    }
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
