const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { v4: uuidv4 } = require("uuid");
const config = require("../../config/env");
const crypto = require("crypto");
const { generateFileToken } = require("../fileToken");

const unlinkAsync = promisify(fs.unlink);

function generateKey(folder, mimetype) {
  const ext = mimetype === "application/pdf" ? ".pdf" : ".webp";
  return `${folder}/${uuidv4()}.${Date.now()}${ext}`;
}

async function uploadFile(buffer, folder, mimetype) {
  const key = generateKey(folder, mimetype);
  const uploadPath = path.join(__dirname, "..", "..", "..", "uploads", key);

  await fs.promises.writeFile(uploadPath, buffer);

  const url = `${config.upload.localUploadUrl}/uploads/${key}`;
  return { key, url };
}

async function deleteFile(key) {
  if (!key) return;

  const filePath = path.join(__dirname, "..", "..", "..", "uploads", key);

  try {
    await unlinkAsync(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

async function getPresignedUrl(key, expiresIn = 900) {
  if (!key) return null;
  const token = generateFileToken(key, expiresIn);
  return `${config.upload.localUploadUrl}/api/v1/files/${key}?token=${token}`;
}

module.exports = { uploadFile, deleteFile, getPresignedUrl };
