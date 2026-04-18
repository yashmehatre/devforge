require("dotenv").config();

const requiredEnvVars = [
  "NODE_ENV",
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "JWT_REFRESH_SECRET",
  "JWT_REFRESH_EXPIRES_IN",
  "CLIENT_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",
  "STORAGE_ADAPTER",
  "LOCAL_UPLOAD_URL",
  "FILE_TOKEN_SECRET",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}\n` +
      `Check your .env file against .env.example`,
  );
}

const config = {
  app: {
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT, 10),
    version: process.env.APP_VERSION || "1.0.0",
  },
  db: {
    uri: process.env.MONGO_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  client: {
    url: process.env.CLIENT_URL,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  upload: {
    storageAdapter: process.env.STORAGE_ADAPTER,
    localUploadUrl: process.env.LOCAL_UPLOAD_URL,
    fileTokenSecret: process.env.FILE_TOKEN_SECRET,
    r2: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      endpoint: process.env.R2_ENDPOINT,
      bucketName: process.env.R2_BUCKET_NAME,
      publicUrl: process.env.R2_PUBLIC_URL,
    },
  },
};

module.exports = config;
