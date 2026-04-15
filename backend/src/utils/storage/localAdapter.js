const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { v4: uuidv4 } = require("uuid");
const config = require("../../config/env");

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

async function getPresignedUrl(key) {
  if (!key) return null;
  return `${config.upload.localUploadUrl}/uploads/${key}`;
}

module.exports = { uploadFile, deleteFile, getPresignedUrl };
