const Joi = require("joi");

const createQuestionSchema = Joi.object({
  title: Joi.string().min(10).max(200).required(),
  body: Joi.string().min(20).required(),
  tags: Joi.array().items(Joi.string()).max(5).required(),
});

const updateQuestionSchema = Joi.object({
  title: Joi.string().min(10).max(200),
  body: Joi.string().min(20),
  tags: Joi.array().items(Joi.string()).max(5),
}).min(1);

const toggleVoteSchema = Joi.object({
  voteType: Joi.string().valid("up", "down").required(),
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  toggleVoteSchema,
};
