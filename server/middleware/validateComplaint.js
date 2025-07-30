const { body, validationResult } = require("express-validator");

exports.validateComplaint = [
  body("title").custom((value) => {
    if (typeof value !== "string") throw new Error("Title must be a string");
    if (value.trim() === "") throw new Error("Title cannot be empty");
    if (/^\s*\{.*\}\s*$/.test(value)) {
      throw new Error("Title cannot contain JSON-like structure");
    }
    return true;
  }),

  body("type").custom((value) => {
    if (typeof value !== "string") throw new Error("Type must be a string");
    if (value.trim() === "") throw new Error("Type is required");
    if (/^\s*\{.*\}\s*$/.test(value)) {
      throw new Error("Type cannot contain JSON-like structure");
    }
    return true;
  }),

  body("description").custom((value) => {
    if (typeof value !== "string")
      throw new Error("Description must be a string");
    if (value.trim() === "") throw new Error("Description is required");
    if (/^\s*\{.*\}\s*$/.test(value)) {
      throw new Error("Description cannot contain JSON-like structure");
    }
    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
    }
    next();
  },
];
