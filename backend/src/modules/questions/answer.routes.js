const express = require("express");
const AnswerController = require("./answer.controller");
const { protect } = require("../auth/auth.middleware");
const validate = require("../../utils/validate");
const {
  createAnswerSchema,
  updateAnswerSchema,
} = require("./answer.validation");
const toggleVoteSchema = require("../../utils/vote.schema");

const router = express.Router({ mergeParams: true });

router.get("/", AnswerController.getAllAnswers);
router.post(
  "/",
  protect,
  validate(createAnswerSchema),
  AnswerController.createAnswer,
);

router.patch(
  "/:answerId/vote",
  protect,
  validate(toggleVoteSchema),
  AnswerController.toggleVote,
);

router.get("/:answerId", AnswerController.getAnswer);
router.patch(
  "/:answerId",
  protect,
  validate(updateAnswerSchema),
  AnswerController.updateAnswer,
);
router.delete("/:answerId", protect, AnswerController.deleteAnswer);

module.exports = router;
