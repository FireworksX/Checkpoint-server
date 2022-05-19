import { param } from 'express-validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';

export default {
  getUser: [param('username').isString(), validationMiddleware],
};