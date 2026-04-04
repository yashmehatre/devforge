const ArticleService = require("./article.service");
const catchAsync = require("../../utils/catchAsync");

const getArticles = catchAsync(async (req, res, next) => {
  const { page, limit, category, tags } = req.query;
  const filters = {};
  if (category) filters.category = category;
  if (tags) filters.tags = { $in: tags.split(",") };

  if (req.params.id) {
    filters.author = req.params.id;
  }

  const { articles, total } = await ArticleService.getFeed(
    filters,
    page,
    limit,
  );
  res.status(200).json({
    status: "success",
    total,
    data: { articles },
  });
});

const getArticle = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const { article } = await ArticleService.getArticle(slug);
  res.status(200).json({
    status: "success",
    data: { article },
  });
});

const createArticle = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const articleData = req.body;
  const { article } = await ArticleService.createArticle(userId, articleData);
  res.status(201).json({
    status: "success",
    data: { article },
  });
});

const updateArticle = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const slug = req.params.slug;
  const updateData = req.body;
  const { article } = await ArticleService.updateArticle(
    slug,
    userId,
    updateData,
  );
  res.status(200).json({
    status: "success",
    data: { article },
  });
});

const deleteArticle = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const slug = req.params.slug;
  await ArticleService.deleteArticle(slug, userId);
  res.status(204).json({
    status: "success",
    message: "Successfully deleted the article",
  });
});

const publishArticle = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const slug = req.params.slug;
  const { article } = await ArticleService.publishArticle(slug, userId);
  res.status(200).json({
    status: "success",
    message: "Successfully published the article",
    data: { article },
  });
});

const draftArticle = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const slug = req.params.slug;
  const { article } = await ArticleService.draftArticle(slug, userId);
  res.status(200).json({
    status: "success",
    message: "Successfully drafted the article",
    data: { article },
  });
});

const toggleLike = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const slug = req.params.slug;
  const { article, liked } = await ArticleService.toggleLike(slug, userId);
  res.status(200).json({
    status: "success",
    message: `Successfully ${liked ? "liked" : "unliked"} the article`,
    data: { article },
  });
});

const toggleBookmark = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const slug = req.params.slug;
  const { article, bookmarked } = await ArticleService.toggleBookmark(
    slug,
    userId,
  );
  res.status(200).json({
    status: "success",
    data: { article },
  });
});

module.exports = {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  draftArticle,
  toggleLike,
  toggleBookmark,
};
