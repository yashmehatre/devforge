const User = require("../users/user.model");
const config = require("../../config/env");
const crypto = require("crypto");
const AppError = require("../../utils/AppError");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../../utils/tokens");

const signUp = async (username, email, password) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) throw new AppError("Email already in use", 400);

  const user = await User.create({ username, email, password });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

const login = async (email, password) => {
  const user = await User.findOne({ email }).select(
    "+password +loginAttempts +lockUntil",
  );

  if (!user) throw new AppError("Invalid email or password", 401);

  if (user.isLocked()) {
    throw new AppError("Account locked. Try again later", 423);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save({ validateBeforeSave: false });
    throw new AppError("Invalid email or password", 401);
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

const logout = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });
};

const refreshToken = async (refreshToken) => {
  const decoded = verifyToken(refreshToken, config.jwt.refreshSecret);
  if (!decoded) throw new AppError("Invalid refresh token", 401);

  const user = await User.findOne({ refreshToken });
  if (!user)
    throw new AppError("Refresh token expired or already logged out", 401);

  const accessToken = generateAccessToken(user._id);
  return { accessToken };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("No user found with that email", 404);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  return { rawToken };
};

const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });

  if (!user) throw new AppError("Invalid or expired token", 400);

  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpiresAt = null;
  user.refreshToken = null;
  await user.save();

  return { user };
};

const verifyEmail = async (rawToken) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiresAt: { $gt: Date.now() },
  });

  if (!user) throw new AppError("Invalid or expires token", 400);

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpiresAt = null;
  await user.save({ validateBeforeSave: false });

  return { user };
};

module.exports = {
  signUp,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
