import { body } from 'express-validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';
import { LIKES_TYPES } from '@server/models/likesPivot.model';

export default {
  add: [body('target').isString(), body('type').isIn(LIKES_TYPES), validationMiddleware],
  remove: [body('target').isString(), validationMiddleware],
};
