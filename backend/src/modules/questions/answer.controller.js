const AnswerService = require("./answer.service");
const catchAsync = require("../../utils/catchAsync");

const getAllANswers = catchAsync(async (req, res, next) => {
  const { page, limit, isAccepted } = req.query;
  const { questionId } = req.params;
  const filters = {};
  const sort = req.query.sort ? req.query.sort.split(",").join(" ") : undefined;
  if (req.query.isAccepted) filters.isAccepted = isAccepted === "true";
  const { answers, total, totalPages } = await AnswerService.getAllAnswers({
    questionId,
    filters,
    sort,
    page,
    limit,
  });
  res.status(200).json({
    status: "success",
    total,
    page,
    limit,
    totalPages,
    data: { answers },
  });
});

const getAnswer = catchAsync(async (req, res, next) => {
  const { questionId, answerId } = req.params;
  const { answer } = await AnswerService.getAnswer(questionId, answerId);
  res.status(200).json({
    status: "success",
    data: { answer },
  });
});

const createAnswer = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { questionId } = req.params;
  const answerData = req.body;
  const { answer } = await AnswerService.createAnswer(
    userId,
    questionId,
    answerData,
  );
  res.status(201).json({
    status: "success",
    data: { answer },
  });
});

const updateAnswer = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { questionId, answerId } = req.params;
  const updateData = req.body;
  const { answer } = await AnswerService.updateAnswer(
    userId,
    questionId,
    answerId,
    updateData,
  );
  res.status(200).json({
    status: "success",
    data: { answer },
  });
});

const deleteAnswer = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { questionId, answerId } = req.params;
  await AnswerService.deleteAnswer(userId, questionId, answerId);
  res.status(204).send();
});

const toggleVote = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { questionId, answerId } = req.params;
  const { voteType } = req.body;
  const { updated } = await AnswerService.toggleVote(
    userId,
    questionId,
    answerId,
    voteType,
  );
  res.status(200).json({
    status: "success",
    data: { updated },
  });
});

module.exports = {
  getAllAnswers,
  getAnswer,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  toggleVote,
};
