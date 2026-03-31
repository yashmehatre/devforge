const Joi = require("joi");

const categoryEnum = [
  "javascript",
  "typescript",
  "nodejs",
  "react",
  "database",
  "devops",
  "career",
  "system-design",
  "security",
  "other",
];

const createArticleSchema = Joi.object({
  title: Joi.string().min(10).max(150).required(),
  description: Joi.string().max(300).required(),
  body: Joi.string().required(),
  category: Joi.string()
    .valid(...categoryEnum)
    .optional(),
  tags: Joi.array().items(Joi.string()).max(5).optional(),
  coverImage: Joi.string().optional().allow(""),
  seoTitle: Joi.string().max(70).optional().allow(""),
  seoDescription: Joi.string().max(160).optional().allow(""),
});

const updateArticleSchema = Joi.object({
  title: Joi.string().min(10).max(150),
  description: Joi.string().max(300),
  body: Joi.string().optional(),
  category: Joi.string().valid(...categoryEnum),
  tags: Joi.array().items(Joi.string()).max(5),
  coverImage: Joi.string().allow(""),
  seoTitle: Joi.string().max(70).allow(""),
  seoDescription: Joi.string().max(160).allow(""),
}).min(1);

const getUserArticlesSchema = Joi.object({
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional(),
});

module.exports = {
  createArticleSchema,
  updateArticleSchema,
  getUserArticlesSchema,
};
