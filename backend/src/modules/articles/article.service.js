const Article = require("./article.model");
const AppError = require("../../utils/AppError");
const storage = require("../../utils/storage");
const { processCoverImage } = require("../../utils/imageProcessor");

const uploadCover = async (articleId, userId, file) => {
  if (!file) {
    throw new AppError("Please upload an image file.", 400);
  }

  const article = await Article.findOne({
    _id: articleId,
    author: userId,
  }).select("+coverImageKey");

  if (!article) {
    throw new AppError("Article not found or you do not own it.", 404);
  }

  const processedBuffer = await processCoverImage(file.buffer);

  const { key, url } = await storage.uploadFile(
    processedBuffer,
    "covers",
    "image/webp",
  );

  await Article.findByIdAndUpdate(articleId, {
    coverImage: url,
    coverImageKey: key,
  });

  try {
    await storage.deleteFile(article.coverImageKey);
  } catch (err) {
    console.error(
      "Failed to delete old cover image:",
      article.coverImageKey,
      err.message,
    );
  }

  const updatedArticle = await Article.findById(articleId);
  return updatedArticle;
};

const getFeed = async (filters = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const query = { status: "published", ...filters };

  const [articles, total] = await Promise.all([
    Article.find(query)
      .populate("author", "username fullName avatar")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .skip(skip),
    Article.countDocuments(query),
  ]);

  return { articles, total };
};

const getArticle = async (slug) => {
  const article = await Article.findOne({ slug }).populate(
    "author",
    "username fullName avatar",
  );
  if (!article) throw new AppError("Article not found", 404);

  await Article.findOneAndUpdate({ slug }, { $inc: { viewsCount: 1 } });

  return { article };
};

const createArticle = async (userId, articleData) => {
  const article = await Article.create({ ...articleData, author: userId });
  return { article };
};

const updateArticle = async (slug, userId, updateData) => {
  const article = await Article.findOne({ slug });
  if (!article) throw new AppError("Article not found", 404);
  if (article.author.toString() !== userId.toString()) {
    throw new AppError(
      "You do not have permission to update this article",
      403,
    );
  }
  Object.assign(article, updateData);
  await article.save();
  return { article };
};

const deleteArticle = async (slug, userId) => {
  const article = await Article.findOne({ slug });
  if (!article) throw new AppError("Article not found", 404);

  if (article.author.toString() !== userId.toString()) {
    throw new AppError(
      "You do not have permission to delete this article",
      403,
    );
  }
  article.isActive = false;
  await article.save({ validateBeforeSave: false });
};

const publishArticle = async (slug, userId) => {
  const article = await Article.findOne({ slug });
  if (!article) throw new AppError("Article not found", 404);
  if (article.author.toString() !== userId.toString()) {
    throw new AppError(
      "You do not have permission to publish this article",
      403,
    );
  }
  if (article.status === "published") {
    throw new AppError("Article is already published", 400);
  }
  article.status = "published";
  await article.save();
  return { article };
};

const draftArticle = async (slug, userId) => {
  const article = await Article.findOne({ slug });
  if (!article) throw new AppError("Article not found", 404);
  if (article.author.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to draft this article", 403);
  }
  if (article.status === "draft") {
    throw new AppError("Article is already drafted", 400);
  }
  article.status = "draft";
  await article.save();
  return { article };
};

const toggleLike = async (slug, userId) => {
  const article = await Article.findOne({ slug }).select("likes likesCount");
  if (!article) throw new AppError("Article not found", 404);
  const liked = article.likes.some((id) => id.toString() === userId.toString());
  const updated = await Article.findOneAndUpdate(
    { slug },
    liked
      ? { $pull: { likes: userId }, $inc: { likesCount: -1 } }
      : { $addToSet: { likes: userId }, $inc: { likesCount: 1 } },
    { new: true, select: "likesCount likes" },
  );
  return { article: updated, liked: !liked };
};

const toggleBookmark = async (slug, userId) => {
  const article = await Article.findOne({ slug }).select(
    "bookmarks bookmarksCount",
  );
  if (!article) throw new AppError("Article not found", 404);
  const bookmarked = article.bookmarks.some(
    (id) => id.toString() === userId.toString(),
  );
  const updated = await Article.findOneAndUpdate(
    { slug },
    bookmarked
      ? { $pull: { bookmarks: userId }, $inc: { bookmarksCount: -1 } }
      : { $addToSet: { bookmarks: userId }, $inc: { bookmarksCount: 1 } },
    { new: true, select: "bookmarksCount bookmarks" },
  );

  return { article: updated, bookmarked: !bookmarked };
};

module.exports = {
  getFeed,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  draftArticle,
  toggleLike,
  toggleBookmark,
  uploadCover,
};
