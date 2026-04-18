const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const config = require("./config/env");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const articleRoutes = require("./modules/articles/article.routes");
const questionRoutes = require("./modules/questions/question.routes");
const jobRoutes = require("./modules/jobs/job.routes");
const applicationRoutes = require("./modules/applications/application.routes");
const commentRoutes = require("./modules/comments/comment.routes");
const AppError = require("./utils/AppError");
const path = require("path");
const { verifyFileToken } = require("./utils/fileToken");

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

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/comments", commentRoutes);

app.use(
  "/uploads/avatars",
  express.static(path.join(__dirname, "..", "uploads", "avatars")),
);

app.use(
  "/uploads/covers",
  express.static(path.join(__dirname, "..", "uploads", "covers")),
);

app.get("/api/v1/files/*key", function (req, res, next) {
  const rawKey = req.params.key;
  const key = Array.isArray(rawKey) ? rawKey.join("/") : rawKey;
  const token = req.query.token ? decodeURIComponent(req.query.token) : null;

  if (!token || !verifyFileToken(key, token)) {
    return res.status(403).json({
      status: "fail",
      message: "Access denied. Invalid or expired file token.",
    });
  }

  const filePath = path.join(__dirname, "..", "uploads", key);

  res.sendFile(
    filePath,
    {
      headers: {
        "Content-Disposition": "inline",
      },
    },
    function (err) {
      if (!err) return;
      if (err.code === "ENOENT" || err.status === 404) {
        return res.status(404).json({
          status: "fail",
          message: "File not found.",
        });
      }
      next(err);
    },
  );
});

// 404 Handler

app.use((req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use((err, req, res, next) => {
  // Mongoose CastError - invalid ObjectId
  if (err.name === "CastError") {
    err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err = new AppError(`${field} already exists`, 400);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    err = new AppError(message, 400);
  }

  // JWT Invalid
  if (err.name === "JsonWebTokenError") {
    err = new AppError("Invalid token. Please log in again.", 401);
  }

  // JWT Expired
  if (err.name === "TokenExpiredError") {
    err = new AppError("Token expired. Please log in again.", 401);
  }

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError("File size exceeds the allowed limit.", 400));
    }
    return next(new AppError("File upload error. Please try again.", 400));
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(config.app.env === "development" && { stack: err.stack }),
  });
});

module.exports = app;
