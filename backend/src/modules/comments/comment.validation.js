const Joi = require("joi");

const createCommentSchema = Joi.object({
  body: Joi.string().min(10).required(),
});

const updateCommentSchema = Joi.object({
  body: Joi.string().min(10),
}).min(1);

module.exports = { createCommentSchema, updateCommentSchema };
