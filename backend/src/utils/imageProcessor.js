const sharp = require("sharp");

async function processAvatar(buffer) {
  return sharp(buffer)
    .resize(400, 400, { fit: "cover" })
    .webp({ quality: 85 })
    .withMetadata(false)
    .toBuffer();
}

async function processCoverImage(buffer) {
  return sharp(buffer)
    .resize(1200, 630, { fit: "inside" })
    .webp({ quality: 85 })
    .withMetadata(false)
    .toBuffer();
}

module.exports = { processAvatar, processCoverImage };
