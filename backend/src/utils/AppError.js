class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.status = Math.floor(statusCode / 100) === 4 ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
