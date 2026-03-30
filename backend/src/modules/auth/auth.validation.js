const Joi = require("joi");
const AppError = require("../../utils/AppError");

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const message = error.details.map((d) => d.message).join(", ");
      return next(new AppError(message, 400));
    }
    next();
  };
};

const signupSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

const updateMeSchema = Joi.object({
  fullName: Joi.string().max(100),
  username: Joi.string().min(3).max(30),
  bio: Joi.string().max(300).allow(""),
  about: Joi.string().max(2000).allow(""),
  location: Joi.string().max(100).allow(""),
  skills: Joi.array().items(Joi.string()).max(30),
  isOpenToWork: Joi.boolean(),
  socialLinks: Joi.object({
    github: Joi.string().allow(""),
    linkedin: Joi.string().allow(""),
    twitter: Joi.string().allow(""),
    website: Joi.string().allow(""),
  }),
});

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
  updateMeSchema,
};
