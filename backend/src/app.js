const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const config = require("./config/env");

const app = express();

// Security Middleware

app.use(helmet());

app.use(
  cors({
    origin: config.client.url,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Request Parsing

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Health Check

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: config.app.version,
    environment: config.app.env,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

module.exports = app;
