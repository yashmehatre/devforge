const modelMap = {
  Article: require("../articles/article.model"),
  Question: require("../questions/question.model"),
  Answer: require("../questions/answer.model"),
  Comment: require("./comment.model"),
};
const AppError = require("../../utils/AppError");

const getAllComments = async ({
  onModel,
  onId,
  parentComment,
  page = 1,
  limit = 20,
}) => {
  const skip = (page - 1) * limit;
  const query = parentComment
    ? { parentComment }
    : { onId, onModel, parentComment: null };
  const [comments, total] = await Promise.all([
    modelMap.Comment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip),
    modelMap.Comment.countDocuments(query),
  ]);
  return {
    comments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const getComment = async (commentId) => {
  const comment = await modelMap.Comment.findById(commentId);
  if (!comment) throw new AppError("Comment not found", 404);
  return { comment };
};

const createComment = async (userId, onModel, onId, commentData) => {
  const { body } = commentData;
  const comment = await modelMap.Comment.create({
    body,
    onModel,
    onId,
    author: userId,
  });
  const increment = onModel === "Comment" ? "repliesCount" : "commentsCount";
  const ParentModel = modelMap[onModel];
  await ParentModel.findByIdAndUpdate(onId, { $inc: { [increment]: 1 } });
  return { comment };
};

const updateComment = async (userId, commentId, updateData) => {
  const comment = await modelMap.Comment.findById(commentId);
  const { body } = updateData;
  if (!comment) throw new AppError("Comment not found", 404);
  if (comment.author.toString() !== userId.toString()) {
    throw new AppError(
      "You do not have permission to update this comment",
      403,
    );
  }
  comment.body = body;
  await comment.save();
  return { comment };
};

const deleteComment = async (userId, commentId) => {
  const comment = await modelMap.Comment.findById(commentId);
  if (!comment) throw new AppError("Comment not found", 404);
  if (comment.author.toString() !== userId.toString()) {
    throw new AppError(
      "You do not have permission to delete this comment",
      403,
    );
  }
  comment.isActive = false;
  const { onModel, onId } = comment;
  const decrement = onModel === "Comment" ? "repliesCount" : "commentsCount";
  const ParentModel = modelMap[onModel];
  await Promise.all([
    comment.save({ validateBeforeSave: false }),
    modelMap.Comment.updateMany(
      { parentComment: commentId },
      { $set: { isActive: false } },
    ),
    await ParentModel.findByIdAndUpdate(onId, { $inc: { [decrement]: -1 } }),
  ]);
};

const toggleLike = async (userId, commentId) => {
  const comment = await modelMap.Comment.findById(commentId);
  if (!comment) throw new AppError("Comment not found", 404);
  const liked = comment.isLikedBy(userId);
  const updated = await modelMap.Comment.findByIdAndUpdate(
    commentId,
    liked
      ? { $pull: { likes: userId }, $inc: { likesCount: -1 } }
      : { $addToSet: { likes: userId }, $inc: { likesCount: 1 } },
    { new: true },
  );
  return { updated };
};

module.exports = {
  getAllComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  toggleLike,
};
