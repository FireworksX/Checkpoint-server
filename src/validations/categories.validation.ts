import { body, param } from 'express-validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';

export default {
  getDetail: [param('slug').exists().isString(), validationMiddleware],
  getList: [param('author'), validationMiddleware],
  create: [body('name').isString(), validationMiddleware],
  update: [body('findSlug').isString(), validationMiddleware],
};
