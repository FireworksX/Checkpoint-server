import { body, param } from 'express-validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';

export default {
  getUser: [param('username').isString(), validationMiddleware],
  subscribe: [body('target').exists().isString(), validationMiddleware],
};
