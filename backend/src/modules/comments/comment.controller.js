const CommentService = require("./comment.service");
const catchAsync = require("../../utils/catchAsync");

const getAllComments = catchAsync(async (req, res, next) => {
  const { page, limit } = req.query;
  const { onModel } = req.body;
  const onId =
    req.params.articleId || req.params.questionId || req.params.answerId;
  let parentComment;
  if (req.params.commentId) parentComment = req.params.commentId;
  const { comments, total, totalPages } = await CommentService.getAllComments({
    onModel,
    onId,
    parentComment,
    page,
    limit,
  });
  res.status(200).json({
    status: "success",
    total,
    page,
    limit,
    totalPages,
    data: { comments },
  });
});

const getComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { comment } = await CommentService.getComment(commentId);
  res.status(200).json({
    status: "success",
    data: { comment },
  });
});

const createComment = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { onModel, body } = req.body;
  const commentData = { body };
  const onId =
    req.params.articleId || req.params.questionId || req.params.answerId;
  const { comment } = await CommentService.createComment(
    userId,
    onModel,
    onId,
    commentData,
  );
  res.status(201).json({
    status: "success",
    data: { comment },
  });
});

const updateComment = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { commentId } = req.params;
  const { body } = req.body;
  const updateData = { body };
  const { comment } = await CommentService.updateComment(
    userId,
    commentId,
    updateData,
  );
  res.status(200).json({
    status: "success",
    data: { comment },
  });
});

const deleteComment = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { commentId } = req.params;
  await CommentService.deleteComment(userId, commentId);
  res.status(204).send();
});

const toggleLike = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { commentId } = req.params;
  const { updated } = await CommentService.toggleLike(userId, commentId);
  res.status(200).json({
    status: "success",
    data: { updated },
  });
});

module.exports = {
  getAllComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  toggleLike,
};
