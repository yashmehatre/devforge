const Joi = require("joi");

const answerBodyField = Joi.string().min(10);

const createAnswerSchema = Joi.object({
  body: answerBodyField.required(),
});

const updateAnswerSchema = Joi.object({
  body: answerBodyField,
}).min(1);

module.exports = { createAnswerSchema, updateAnswerSchema };
