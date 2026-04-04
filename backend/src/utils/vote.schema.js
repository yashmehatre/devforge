const Joi = require("joi");

const toggleVoteSchema = Joi.object({
  voteType: Joi.string().valid("up", "down").required(),
});

module.exports = toggleVoteSchema;
