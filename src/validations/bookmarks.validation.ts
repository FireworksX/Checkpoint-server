import { body } from 'express-validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';
import { BOOKMARKS_TYPES } from '@server/models/bookmarksPivot.model';

export default {
  add: [
    body('target').isString(),
    body('type').isIn(BOOKMARKS_TYPES),
    body('category').isString(),
    validationMiddleware,
  ],
  remove: [body('target').isString(), body('type').isIn(BOOKMARKS_TYPES), validationMiddleware],
};
