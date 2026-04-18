const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const config = require("../../config/env");

const client = new S3Client({
  region: "auto",
  endpoint: config.upload.r2.endpoint,
  credentials: {
    accessKeyId: config.upload.r2.accessKeyId,
    secretAccessKey: config.upload.r2.secretAccessKey,
  },
});

function generateKey(folder, mimetype) {
  const ext = mimetype === "application/pdf" ? ".pdf" : ".webp";
  return `${folder}/${uuidv4()}.${Date.now()}${ext}`;
}

async function uploadFile(buffer, folder, mimetype) {
  const key = generateKey(folder, mimetype);

  await client.send(
    new PutObjectCommand({
      Bucket: config.upload.r2.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    }),
  );

  const url = `${config.upload.r2.publicUrl}/${key}`;
  return { key, url };
}

async function deleteFile(key) {
  if (!key) return;

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.upload.r2.bucketName,
      Key: key,
    }),
  );
}

async function getPresignedUrl(key, expiresIn = 900) {
  if (!key) return null;

  const command = new GetObjectCommand({
    Bucket: config.upload.r2.bucketName,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn });
}

module.exports = { uploadFile, deleteFile, getPresignedUrl };
