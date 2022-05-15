import { param } from 'express-validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';

export default {
  getDetail: [param('slug').exists().isString(), validationMiddleware],
};
