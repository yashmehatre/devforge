const AppError = require("./AppError");

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[source], { abortEarly: false });
    if (error) {
      const message = error.details.map((d) => d.message).join(", ");
      return next(new AppError(message, 400));
    }
    next();
  };
};

module.exports = validate;
