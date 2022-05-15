import { body, param } from 'express-validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';

export default {
  getDetail: [param('slug').exists().isString(), validationMiddleware],
  create: [body('name').isString(), body('slug').isString(), body('categories').isArray(), validationMiddleware],
  update: [body('findSlug').isString(), validationMiddleware],
  delete: [body('slug').isString(), validationMiddleware],
};
