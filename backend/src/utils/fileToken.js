const crypto = require("crypto");
const config = require("../config/env");

function generateFileToken(key, expiresIn) {
  const expiry = Date.now() + expiresIn * 1000;
  const payload = `${key}:${expiry}`;
  const signature = crypto
    .createHmac("sha256", config.upload.fileTokenSecret)
    .update(payload)
    .digest("hex");
  return `${expiry}:${signature}`;
}

function verifyFileToken(key, token) {
  try {
    const parts = token.split(":");
    if (parts.length !== 2) return false;

    const expiry = parseInt(parts[0]);
    const signature = parts[1];

    if (Date.now() > expiry) return false;

    const payload = `${key}:${expiry}`;
    const expectedSignature = crypto
      .createHmac("sha256", config.upload.fileTokenSecret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex"),
    );
  } catch {
    return false;
  }
}

module.exports = { generateFileToken, verifyFileToken };
