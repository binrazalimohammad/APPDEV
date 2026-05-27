/**
 * DFD Level 1 — Shared middleware: surfaces express-validator errors to the Actor.
 */
const { validationResult } = require('express-validator');

function validationHandler(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return next();
}

module.exports = { validationHandler };
