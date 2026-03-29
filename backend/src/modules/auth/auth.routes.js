const express = require("express");
const router = express.Router();
const passport = require("passport");
require("../../config/passport");
const config = require("../../config/env");
const AuthController = require("./auth.controller");
const catchAsync = require("../../utils/catchAsync");
const { protect } = require("./auth.middleware");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/tokens");

router.post("/signup", AuthController.signUp);
router.post("/login", AuthController.login);
router.post("/forgot-password", AuthController.forgotPassword);
router.patch("/reset-password/:token", AuthController.resetPassword);
router.post("/refresh", AuthController.refreshToken);
router.patch("/verify-email/:token", AuthController.verifyEmail);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  catchAsync(async (req, res) => {
    const accessToken = generateAccessToken(req.user._id);
    const refreshToken = generateRefreshToken(req.user._id);
    req.user.refreshToken = refreshToken;
    await req.user.save({ validateBeforeSave: false });
    res.redirect(
      `${config.client.url}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }),
);

router.post("/logout", protect, AuthController.logout);
router.patch("/update-password", protect, AuthController.updatePassword);

module.exports = router;
