import { body, param } from 'express-validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';
import { query } from 'express-validator/src/middlewares/validation-chain-builders';

export default {
  getUser: [param('username').isString(), validationMiddleware],
  subscribe: [body('target').exists().isString(), validationMiddleware],
  checkSubscribe: [query('target').isString(), validationMiddleware],
};
