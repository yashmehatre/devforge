const Joi = require("joi");

const createJobSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().max(500).required(),
  responsibilities: Joi.array().items(Joi.string()).min(1).required(),
  requirements: Joi.array().items(Joi.string()),
  benefits: Joi.array().items(Joi.string()),
  employmentType: Joi.string().valid(
    "full-time",
    "part-time",
    "internship",
    "freelance",
  ),
  experienceLevel: Joi.string().valid("entry", "mid", "senior", "lead"),
  educationRequirement: Joi.string().valid(
    "not-required",
    "bachelors",
    "masters",
    "phd",
  ),
  skills: Joi.array().items(Joi.string()),
  salary: Joi.object(),
  location: Joi.string(),
  isRemote: Joi.boolean(),
});

const updateJobSchema = Joi.object({
  title: Joi.string().min(5).max(100),
  description: Joi.string().max(500),
  responsibilities: Joi.array().items(Joi.string()).min(1),
  requirements: Joi.array().items(Joi.string()),
  benefits: Joi.array().items(Joi.string()),
  employmentType: Joi.string().valid(
    "full-time",
    "part-time",
    "internship",
    "freelance",
  ),
  experienceLevel: Joi.string().valid("entry", "mid", "senior", "lead"),
  educationRequirement: Joi.string().valid(
    "not-required",
    "bachelors",
    "masters",
    "phd",
  ),
  skills: Joi.array().items(Joi.string()),
  salary: Joi.object(),
  location: Joi.string(),
  isRemote: Joi.boolean(),
}).min(1);

const updateJobStatusSchema = Joi.object({
  status: Joi.string("draft", "published", "closed", "archived").required(),
});

const featureJobSchema = Joi.object({
  isFeatured: Joi.boolean().required(),
});

module.exports = {
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
  featureJobSchema,
};
