const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const AuthService = require("./auth.service");

const signUp = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  const { user, accessToken, refreshToken } = await AuthService.signUp(
    username,
    email,
    password,
  );
  res.status(201).json({
    status: "success",
    accessToken,
    refreshToken,
    data: { user },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await AuthService.login(
    email,
    password,
  );
  res.status(200).json({
    status: "success",
    accessToken,
    refreshToken,
    data: { user },
  });
});

const logout = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  await AuthService.logout(userId);
  res.status(200).json({
    status: "success",
    message: "Successfully logged out",
  });
});

const refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.body.refreshToken;
  const accessToken = await AuthService.refreshToken(refreshToken);
  res.status(200).json({
    status: "success",
    accessToken,
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  await AuthService.forgotPassword(email);
  res.status(200).json({
    status: "success",
    message: "Reset token sent to email",
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  const rawToken = req.params.token;
  const newPassword = req.body.newPassword;
  const user = await AuthService.resetPassword(rawToken, newPassword);
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const verifyEmail = catchAsync(async (req, res, next) => {
  const rawToken = req.params.token;
  const user = await AuthService.verifyEmail(rawToken);
  res.status(200).json({
    status: "success",
    message: "Email verified!",
  });
});

const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;
  const { user, accessToken, refreshToken } = await AuthService.updatePassword(
    userId,
    currentPassword,
    newPassword,
  );
  res.status(200).json({
    status: "success",
    data: { user },
  });
});

module.exports = {
  signUp,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  updatePassword,
};
