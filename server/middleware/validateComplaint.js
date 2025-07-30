const { body, validationResult } = require("express-validator");

exports.validateComplaint = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),

  body("type")
    .isString()
    .withMessage("Type must be a string")
    .trim()
    .notEmpty()
    .withMessage("Type is required"),

  body("description")
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
    }
    next();
  },
];
