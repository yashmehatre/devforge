const Joi = require("joi");

const createApplicationSchema = Joi.object({
  resume: Joi.string().required(),
  coverLetter: Joi.string().max(2000),
  jobId: Joi.string(),
});

const updateApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "submitted",
      "reviewed",
      "shortlisted",
      "interview",
      "accepted",
      "rejected",
      "withdrawn",
    )
    .required(),
});

const addApplicationNoteSchema = Joi.object({
  note: Joi.string().max(1000).required(),
});

module.exports = {
  createApplicationSchema,
  updateApplicationStatusSchema,
  addApplicationNoteSchema,
};
