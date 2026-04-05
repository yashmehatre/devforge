const Question = require("./question.model");
const Answer = require("./answer.model");
const AppError = require("../../utils/AppError");

const getAllQuestions = async ({
  filters = {},
  sort = { createdAt: -1 },
  page = 1,
  limit = 20,
}) => {
  const skip = (page - 1) * limit;
  const [questions, total] = await Promise.all([
    Question.find(filters)
      .populate("author", "username fullName avatar")
      .sort(sort)
      .select("-votes")
      .limit(limit)
      .skip(skip),
    Question.countDocuments(filters),
  ]);
  return {
    questions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const getQuestion = async (questionId) => {
  const question = await Question.findByIdAndUpdate(
    questionId,
    { $inc: { viewsCount: 1 } },
    { new: true },
  ).populate("author", "username fullName avatar");
  if (!question) throw new AppError("Question not found", 404);
  return { question };
};

const createQuestion = async (userId, questionData) => {
  const { title, body, tags } = questionData;
  const question = await Question.create({ title, body, tags, author: userId });
  return { question };
};

const updateQuestion = async (userId, questionId, updateData) => {
  const question = await Question.findById(questionId);
  if (!question) throw new AppError("Question not found", 404);

  if (question.author.toString() !== userId.toString()) {
    throw new AppError(
      "You do not have permission to update this question",
      403,
    );
  }
  const { title, body, tags } = updateData;
  if (title) question.title = title;
  if (body) question.body = body;
  if (tags) question.tags = tags;

  await question.save();
  return { question };
};

const deleteQuestion = async (userId, questionId) => {
  const question = await Question.findById(questionId);
  if (!question) throw new AppError("Question not found", 404);

  if (question.author.toString() !== userId.toString()) {
    throw new AppError(
      "You do not have permission to delete this question",
      403,
    );
  }

  question.isActive = false;
  await question.save({ validateBeforeSave: false });
};

const toggleVote = async (userId, questionId, voteType) => {
  const question = await Question.findById(questionId);
  if (!question) throw new AppError("Question not found", 404);

  const existingVote = question.hasVoted(userId);

  let updateQuery;
  let scoreDelta;

  if (!existingVote) {
    scoreDelta = voteType === "up" ? 1 : -1;
    updateQuery = {
      $push: { votes: { user: userId, type: voteType } },
      $inc: { voteScore: scoreDelta },
    };
  } else if (existingVote.type === voteType) {
    scoreDelta = voteType === "up" ? -1 : 1;
    updateQuery = {
      $pull: { votes: { user: userId } },
      $inc: { voteScore: scoreDelta },
    };
  } else {
    scoreDelta = voteType === "up" ? 2 : -2;
    existingVote.type = voteType;
    updateQuery = {
      $set: { votes: question.votes },
      $inc: { voteScore: scoreDelta },
    };
  }
  const updated = await Question.findByIdAndUpdate(questionId, updateQuery, {
    new: true,
  });
  return { updated };
};

const acceptAnswer = async (userId, questionId, answerId) => {
  const question = await Question.findById(questionId);
  if (!question) throw new AppError("Question not found", 404);

  if (question.author.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to accept an answer", 403);
  }

  const answer = await Answer.findById(answerId);
  if (!answer) throw new AppError("Answer not found", 404);

  if (answer.question.toString() !== questionId.toString()) {
    throw new AppError("Answer does not belong to this question", 400);
  }

  if (question.acceptedAnswer) {
    await Answer.findByIdAndUpdate(question.acceptedAnswer, {
      isAccepted: false,
    });
  }

  answer.isAccepted = true;
  await answer.save({ validateBeforeSave: false });

  question.acceptedAnswer = answerId;
  await question.save();

  return { question };
};

module.exports = {
  getAllQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleVote,
  acceptAnswer,
};
