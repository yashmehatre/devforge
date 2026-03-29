const config = require("../../config/env");
const User = require("../users/user.model");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const { verifyToken } = require("../../utils/tokens");

const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new AppError("No token provided. Please log in.", 401));
  }
  const token = authHeader.split(" ")[1];

  const decoded = verifyToken(token, config.jwt.secret);
  if (!decoded) return next(new AppError("Invalid or expired token", 401));

  const user = await User.findById(decoded.id).select("+passwordChangedAt");
  if (!user) return next(new AppError("User no longer exists", 401));

  if (user.isPasswordChangedAfter(decoded.iat)) {
    return next(
      new AppError("Password recently changed. Please log in again.", 401),
    );
  }

  req.user = user;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };
