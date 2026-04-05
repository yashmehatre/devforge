const QuestionService = require("./question.service");
const catchAsync = require("../../utils/catchAsync");

const getAllQuestions = catchAsync(async (req, res, next) => {
  const { page, limit, tags } = req.query;
  const filters = {};

  const sort = req.query.sort
    ? req.query.sort.split(",").join(" ")
    : { createdAt: -1 };
  if (tags) filters.tags = { $in: tags.split(",") };
  if (req.params.id) filters.author = req.params.id;
  if (req.query.isSolved) filters.isSolved = req.query.isSolved === "true";

  const { questions, total, totalPages } =
    await QuestionService.getAllQuestions({ filters, sort, page, limit });
  res.status(200).json({
    status: "success",
    total,
    page,
    limit,
    totalPages,
    data: { questions },
  });
});

const getQuestion = catchAsync(async (req, res, next) => {
  const questionId = req.params.id;
  const { question } = await QuestionService.getQuestion(questionId);
  res.status(200).json({
    status: "success",
    data: { question },
  });
});

const createQuestion = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const questionData = req.body;
  const { question } = await QuestionService.createQuestion(
    userId,
    questionData,
  );
  res.status(201).json({
    status: "success",
    data: { question },
  });
});

const updateQuestion = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const questionId = req.params.id;
  const updateData = req.body;
  const { question } = await QuestionService.updateQuestion(
    userId,
    questionId,
    updateData,
  );
  res.status(200).json({
    status: "success",
    data: { question },
  });
});

const deleteQuestion = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const questionId = req.params.id;
  await QuestionService.deleteQuestion(userId, questionId);
  res.status(204).send();
});

const toggleVote = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const questionId = req.params.id;
  const { voteType } = req.body;
  const { updated } = await QuestionService.toggleVote(
    userId,
    questionId,
    voteType,
  );
  res.status(200).json({
    status: "success",
    data: { updated },
  });
});

const acceptAnswer = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const questionId = req.params.id;
  const { answerId } = req.params;
  const { updated } = await QuestionService.acceptAnswer(
    userId,
    questionId,
    answerId,
  );
  res.status(200).json({
    status: "success",
    data: { updated },
  });
});

module.exports = {
  getAllQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleVote,
  acceptAnswer,
};
