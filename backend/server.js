const config = require("./src/config/env");
const connectDB = require("./src/config/database");
const app = require("./src/app");
const http = require("http");

const server = http.createServer(app);

// Graceful Shutdown

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("HTTP server closed.");

    try {
      const mongoose = require("mongoose");
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
      console.log("Graceful shutdown complete.");
      process.exit(0);
    } catch (error) {
      console.log("Error during shutdown: ", error.message);
      process.exit(1);
    }
  });
};

// Process Error Handlers

process.on("uncaughtException", (error) => {
  console.log("UNCAUGHT EXCEPTION: ", error.message);
  console.log(error.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION: ", reason);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Start Server

const startServer = async () => {
  try {
    await connectDB();

    server.listen(config.app.port, () => {
      console.log(
        `Server running in ${config.app.env} mode on port ${config.app.port}`,
      );
      console.log(`Health check: http://localhost:${config.app.port}/health`);
    });
  } catch (error) {
    console.error("Failed to start server: ", error.message);
    process.exit(1);
  }
};

startServer();
