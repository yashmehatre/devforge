const express = require("express");
const ArticleController = require("./article.controller");
const commentRoutes = require("../comments/comment.routes");
const { protect } = require("../auth/auth.middleware");
const validate = require("../../utils/validate");
const {
  createArticleSchema,
  updateArticleSchema,
  getUserArticlesSchema,
} = require("./article.validation");

const router = express.Router({ mergeParams: true });

router.use("/:articleId/comments", commentRoutes);

router.get(
  "/",
  validate(getUserArticlesSchema, "query"),
  ArticleController.getArticles,
);

router.post(
  "/",
  protect,
  validate(createArticleSchema),
  ArticleController.createArticle,
);

router.patch("/:slug/publish", protect, ArticleController.publishArticle);
router.patch("/:slug/draft", protect, ArticleController.draftArticle);
router.patch("/:slug/like", protect, ArticleController.toggleLike);
router.patch("/:slug/bookmark", protect, ArticleController.toggleBookmark);

router.get("/:slug", ArticleController.getArticle);
router.patch(
  "/:slug",
  protect,
  validate(updateArticleSchema),
  ArticleController.updateArticle,
);
router.delete("/:slug", protect, ArticleController.deleteArticle);

module.exports = router;
