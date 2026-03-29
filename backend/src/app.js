const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const config = require("./config/env");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./modules/auth/auth.routes");
const AppError = require("./utils/AppError");

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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: "error", message: "Too many requests, try again later" },
});

app.use("/api/auth", authLimiter, authRoutes);

// 404 Handler

app.use((req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(config.app.env === "development" && { stack: err.stack }),
  });
});

module.exports = app;
