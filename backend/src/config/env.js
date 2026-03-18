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
};

module.exports = config;
