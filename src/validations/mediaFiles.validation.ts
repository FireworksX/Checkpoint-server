import { body, param } from 'express-validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';

export default {
  getDetail: [param('filename').exists().isString(), validationMiddleware],
  // create: [body('name').isString(), body('slug').isString(), body('categories').isArray(), validationMiddleware],
  upload: [validationMiddleware],
  delete: [body('id').isString(), validationMiddleware],
};
