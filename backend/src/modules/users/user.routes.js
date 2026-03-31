const express = require("express");
const UserController = require("./user.controller");
const { protect } = require("../auth/auth.middleware");
const validate = require("../../utils/validate");
const { updateMeSchema } = require("../auth/auth.validation");
const articleRouter = require("../articles/article.routes");

const router = express.Router();

router.use("/:id/articles", articleRouter);

router.get("/me", protect, UserController.getMe);
router.patch("/me", validate(updateMeSchema), protect, UserController.updateMe);
router.delete("/me", protect, UserController.deleteMe);

router.get("/:username", UserController.getProfile);
router.get("/:id/followers", UserController.getFollowers);
router.get("/:id/following", UserController.getFollowing);
router.post("/:id/follow", protect, UserController.follow);
router.delete("/:id/unfollow", protect, UserController.unfollow);

module.exports = router;
