const express = require("express");
const CommentController = require("./comment.controller");
const { protect } = require("../auth/auth.middleware");
const validate = require("../../utils/validate");
const {
  createCommentSchema,
  updateCommentSchema,
} = require("./comment.validation");

const router = express.Router({ mergeParams: true });

router.get("/", CommentController.getAllComments);
router.post(
  "/",
  protect,
  validate(createCommentSchema),
  CommentController.createComment,
);
router.post(
  "/:commentId/replies",
  protect,
  validate(createCommentSchema),
  CommentController.createComment,
);
router.patch("/:commentId/like", protect, CommentController.toggleLike);
router.get("/replies/:commentId", CommentController.getAllComments);
router.get("/:commentId", CommentController.getComment);
router.patch(
  "/:commentId",
  protect,
  validate(updateCommentSchema),
  CommentController.updateComment,
);
router.delete("/:commentId", protect, CommentController.deleteComment);

module.exports = router;
