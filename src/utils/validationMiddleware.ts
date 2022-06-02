import { validationResult } from 'express-validator';
import httpStatus from 'http-status';

export const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
  }

  next();
};
