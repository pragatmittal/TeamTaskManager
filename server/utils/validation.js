import { validationResult } from 'express-validator';

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => e.msg);
    return res.status(400).json({ error: 'Validation failed', details });
  }
  next();
}
