const express = require("express");
const QuestionController = require("./question.controller");
const validate = require("../../utils/validate");
const {
  createQuestionSchema,
  updateQuestionSchema,
  toggleVoteSchema,
} = require("./question.validation");
const { protect } = require("../auth/auth.middleware");

const router = express.Router();

router.get("/", QuestionController.getAllQuestions);
router.post(
  "/",
  protect,
  validate(createQuestionSchema),
  QuestionController.createQuestion,
);

router.get("/:id", QuestionController.getQuestion);
router.patch(
  "/:id",
  protect,
  validate(updateQuestionSchema),
  QuestionController.updateQuestion,
);
router.delete("/:id", protect, QuestionController.deleteQuestion);

router.patch(
  "/:id/vote",
  protect,
  validate(toggleVoteSchema),
  QuestionController.toggleVote,
);
router.patch(
  "/:id/answers/:answerId/accept",
  protect,
  QuestionController.acceptAnswer,
);

module.exports = router;
