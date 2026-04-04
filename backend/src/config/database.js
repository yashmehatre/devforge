const mongoose = require("mongoose");
const config = require("./env");

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000;

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(config.db.uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(
      `MongoDB connection attempt ${retryCount + 1} failed: ${error.message}`,
    );

    if (retryCount < MAX_RETRIES - 1) {
      console.log(`Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return connectDB(retryCount + 1);
    }

    throw new Error(
      `Failed to connect to MongoDB after ${MAX_RETRIES} attempts. Shutting down.`,
    );
  }
};

module.exports = connectDB;
