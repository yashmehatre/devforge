const Answer = require("./answer.model");
const Question = require("./question.model");
const AppError = require("../../utils/AppError");

const getAllAnswers = async ({
  questionId,
  filters = {},
  sort = { isAccepted: -1, voteScore: -1, createdAt: -1 },
  page = 1,
  limit = 20,
}) => {
  const skip = (page - 1) * limit;
  const [answers, total] = await Promise.all([
    Answer.find({ question: questionId, ...filters })
      .sort(sort)
      .limit(limit)
      .skip(skip),
    Answer.countDocuments({ question: questionId, ...filters }),
  ]);
  return { answers, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getAnswer = async (questionId, answerId) => {
  const answer = await Answer.findByIdAndUpdate(answerId);
  if (!answer) throw new AppError("Answer not found", 404);
  if (answer.question.toString() !== questionId.toString()) {
    throw new AppError("Answer does not belong to this question", 400);
  }
  return { answer };
};

const createAnswer = async (userId, questionId, answerData) => {
  const { body } = answerData;
  const question = await Question.findById(questionId);
  if (!question) throw new AppError("Question not found", 404);
  const answer = await Answer.create({
    body,
    author: userId,
    question: questionId,
  });
  await Question.findByIdAndUpdate(questionId, { $inc: { answersCount: 1 } });
  return { answer };
};

const updateAnswer = async (userId, questionId, answerId, updateData) => {
  const { body } = updateData;
  const answer = await Answer.findById(answerId);
  if (!answer) throw new AppError("Answer not found", 404);
  if (answer.question.toString() !== questionId.toString()) {
    throw new AppError("Answer does not belong this question", 400);
  }
  if (answer.author.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to update this answer", 403);
  }
  answer.body = body;
  await answer.save();
  return { answer };
};

const deleteAnswer = async (userId, questionId, answerId) => {
  const answer = await Answer.findById(answerId);
  if (!answer) throw new AppError("Answer not found", 404);
  if (answer.question.toString() !== questionId.toString()) {
    throw new AppError("Answer does not belong to this question", 400);
  }
  if (answer.author.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to delete this answer", 403);
  }
  answer.isActive = false;
  await answer.save();
};

const toggleVote = async (userId, questionId, answerId, voteType) => {
  const answer = await Answer.findById(answerId);
  if (!answer) throw new AppError("Answer not found", 404);
  if (answer.question.toString() !== questionId.toString()) {
    throw new AppError("Answer does not belong to this question", 400);
  }
  const existingVote = answer.hasVoted(userId);
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
      $set: { votes: answer.votes },
      $inc: { voteScore: scoreDelta },
    };
  }
  const updated = await Answer.findByIdAndUpdate(answerId, updateQuery, {
    new: true,
  });
  return { updated };
};

module.exports = {
  getAllAnswers,
  getAnswer,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  toggleVote,
};
