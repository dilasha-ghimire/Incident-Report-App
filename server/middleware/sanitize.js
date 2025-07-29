const sanitizeHtml = require("sanitize-html");

const sanitizeInputs = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeHtml(obj[key], {
          allowedTags: ["b", "i", "a"],
          allowedAttributes: { a: ["href"] },
        });
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};

module.exports = sanitizeInputs;
