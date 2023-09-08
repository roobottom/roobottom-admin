const { body, validationResult } = require('express-validator');

exports.diaryCreateValidationRules = () => {
  return [
    body('summary').notEmpty().withMessage('Summary is required')
  ];
}

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

  return res.render('index', { errors: extractedErrors });
}
