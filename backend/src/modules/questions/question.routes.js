const express = require("express");
const QuestionController = require("./question.controller");
const answerRoutes = require("./answer.routes");
const validate = require("../../utils/validate");
const toggleVoteSchema = require("../../utils/vote.schema");
const {
  createQuestionSchema,
  updateQuestionSchema,
} = require("./question.validation");
const { protect } = require("../auth/auth.middleware");

const router = express.Router();

router.use("/:questionId/answers", answerRoutes);

router.get("/", QuestionController.getAllQuestions);
router.post(
  "/",
  protect,
  validate(createQuestionSchema),
  QuestionController.createQuestion,
);

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

router.get("/:id", QuestionController.getQuestion);
router.patch(
  "/:id",
  protect,
  validate(updateQuestionSchema),
  QuestionController.updateQuestion,
);
router.delete("/:id", protect, QuestionController.deleteQuestion);

module.exports = router;
