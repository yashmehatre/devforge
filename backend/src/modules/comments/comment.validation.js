const Joi = require("joi");

const createCommentSchema = Joi.object({
  body: Joi.string().min(10).required(),
  onModel: Joi.string()
    .valid("Article", "Question", "Answer", "Comment")
    .required(),
});

const updateCommentSchema = Joi.object({
  body: Joi.string().min(10),
}).min(1);

module.exports = { createCommentSchema, updateCommentSchema };
