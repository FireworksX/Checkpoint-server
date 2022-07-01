import { body, param } from 'express-validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';
import { coordsValidator } from '@server/validations/coords.validator';

export default {
  getDetail: [param('slug').exists().isString(), validationMiddleware],
  create: [
    body('fields').exists(),
    body('category').isString(),
    body('city').isString(),
    body('coords').custom(coordsValidator),
    validationMiddleware,
  ],
  update: [body('findSlug').isString(), validationMiddleware],
  delete: [body('slug').isString(), validationMiddleware],
};
